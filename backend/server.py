from fastapi import FastAPI, APIRouter, Request, HTTPException, Depends, Header, Query
from fastapi.responses import StreamingResponse, RedirectResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import json
import uuid
import hmac
import hashlib
import html
import csv
import io
import time
import logging
from datetime import datetime, timezone
from pathlib import Path
from collections import defaultdict
import httpx
import razorpay
from jose import jwt as jose_jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Config
SUPABASE_URL = os.environ.get('SUPABASE_URL', '')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY', '')
RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID', '')
RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET', '')
RAZORPAY_WEBHOOK_SECRET = os.environ.get('RAZORPAY_WEBHOOK_SECRET', '')
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', '')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', '')
JWT_SECRET = os.environ.get('JWT_SECRET', 'default-secret')
PAYMENT_PROVIDER = os.environ.get('PAYMENT_PROVIDER', 'razorpay')
DEFAULT_UPI_ID = os.environ.get('DEFAULT_UPI_ID', '8618052253@ybl')

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Supabase REST helpers
SB_BASE = f"{SUPABASE_URL.rstrip('/')}/rest/v1"
SB_HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}


async def sb_get(table, params=None):
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.get(f"{SB_BASE}/{table}", params=params or {}, headers={k: v for k, v in SB_HEADERS.items() if k != "Prefer"})
        if r.status_code >= 400:
            logger.error(f"SB GET {table}: {r.status_code} {r.text}")
            if "schema cache" in r.text:
                raise HTTPException(503, detail="Database tables not set up. Run schema.sql in Supabase Dashboard.")
            raise HTTPException(502, detail=f"Database error")
        return r.json()


async def sb_post(table, data):
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.post(f"{SB_BASE}/{table}", json=data, headers=SB_HEADERS)
        if r.status_code >= 400:
            logger.error(f"SB POST {table}: {r.status_code} {r.text}")
            raise HTTPException(502, detail=f"Database error: {r.text}")
        return r.json()


async def sb_patch(table, data, filters):
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.patch(f"{SB_BASE}/{table}", params=filters, json=data, headers=SB_HEADERS)
        if r.status_code >= 400:
            logger.error(f"SB PATCH {table}: {r.status_code} {r.text}")
            raise HTTPException(502, detail=f"Database error")
        return r.json()


async def sb_delete(table, filters):
    hdrs = {**SB_HEADERS}
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.delete(f"{SB_BASE}/{table}", params=filters, headers=hdrs)
        if r.status_code >= 400:
            logger.error(f"SB DELETE {table}: {r.status_code} {r.text}")
            raise HTTPException(502, detail=f"Database error")
        return r.json() if r.text else []


# Razorpay
razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

# Rate limiter
_rate_store = defaultdict(list)


def rate_limit(key, max_req=10, window=60):
    now = time.time()
    _rate_store[key] = [t for t in _rate_store[key] if now - t < window]
    if len(_rate_store[key]) >= max_req:
        raise HTTPException(429, "Rate limit exceeded. Try again later.")
    _rate_store[key].append(now)


# Auth
def get_admin_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing auth token")
    token = authorization.split(" ", 1)[1]
    try:
        payload = jose_jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        if payload.get("role") != "admin":
            raise HTTPException(403, "Not admin")
        return payload
    except Exception:
        raise HTTPException(401, "Invalid token")


# App
app = FastAPI(title="Shvetha & Aadi Wedding Gifts")
api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {"status": "ok", "app": "wedding-gifts"}


@api_router.get("/health")
async def health():
    try:
        await sb_get("pots", {"select": "id", "limit": "1"})
        return {"status": "ok", "database": True}
    except Exception:
        return {"status": "ok", "database": False}


# ---- AUTH ----
@api_router.post("/admin/login")
async def admin_login(request: Request):
    data = await request.json()
    if data.get("username") == ADMIN_USERNAME and data.get("password") == ADMIN_PASSWORD:
        token = jose_jwt.encode(
            {"role": "admin", "sub": ADMIN_USERNAME, "iat": time.time()},
            JWT_SECRET, algorithm="HS256"
        )
        return {"token": token, "username": ADMIN_USERNAME}
    raise HTTPException(401, "Invalid credentials")


# ---- PUBLIC POTS ----
@api_router.get("/pots")
async def list_pots():
    pots = await sb_get("pots", {
        "select": "id,title,slug,story_text,cover_image_url,goal_amount_paise,is_active,created_at",
        "is_active": "eq.true",
        "order": "created_at.desc"
    })
    allocs = await sb_get("allocations", {
        "select": "pot_id,amount_paise,session_id",
        "status": "eq.paid"
    })
    pot_totals = defaultdict(int)
    pot_sessions = defaultdict(set)
    for a in allocs:
        pot_totals[a["pot_id"]] += a["amount_paise"]
        pot_sessions[a["pot_id"]].add(a["session_id"])

    all_sids = set()
    for sids in pot_sessions.values():
        all_sids.update(sids)

    session_names = {}
    if all_sids:
        slist = ",".join(all_sids)
        sessions = await sb_get("contribution_sessions", {
            "select": "id,donor_name",
            "id": f"in.({slist})"
        })
        session_names = {s["id"]: s["donor_name"] for s in sessions}

    result = []
    for pot in pots:
        names = []
        for sid in pot_sessions.get(pot["id"], set()):
            n = session_names.get(sid, "Guest")
            if n not in names:
                names.append(n)
        result.append({
            **pot,
            "total_raised_paise": pot_totals.get(pot["id"], 0),
            "contributor_names": names[:10],
            "contributor_count": len(names)
        })
    return result


@api_router.get("/pots/{slug}")
async def get_pot(slug: str):
    pots = await sb_get("pots", {"select": "*", "slug": f"eq.{slug}"})
    if not pots:
        raise HTTPException(404, "Pot not found")
    pot = pots[0]
    items = await sb_get("pot_items", {
        "select": "*", "pot_id": f"eq.{pot['id']}", "order": "sort_order.asc"
    })
    allocs = await sb_get("allocations", {
        "select": "amount_paise", "pot_id": f"eq.{pot['id']}", "status": "eq.paid"
    })
    return {**pot, "items": items, "total_raised_paise": sum(a["amount_paise"] for a in allocs)}


@api_router.get("/pots/{slug}/contributors")
async def get_contributors(slug: str):
    pots = await sb_get("pots", {"select": "id", "slug": f"eq.{slug}"})
    if not pots:
        raise HTTPException(404, "Pot not found")
    allocs = await sb_get("allocations", {
        "select": "session_id", "pot_id": f"eq.{pots[0]['id']}", "status": "eq.paid"
    })
    sids = list(set(a["session_id"] for a in allocs))
    if not sids:
        return []
    sessions = await sb_get("contribution_sessions", {
        "select": "id,donor_name,donor_message,paid_at",
        "id": f"in.({','.join(sids)})",
        "order": "paid_at.desc.nullslast"
    })
    return [{"donor_name": s["donor_name"], "donor_message": s.get("donor_message", ""), "paid_at": s.get("paid_at")} for s in sessions if s.get("donor_name")]


# ---- SESSION ----
@api_router.post("/session/create-or-update")
async def create_or_update_session(request: Request):
    data = await request.json()
    client_ip = request.client.host if request.client else "unknown"
    rate_limit(client_ip, max_req=20, window=60)

    donor_name = html.escape(data.get("donor_name", "").strip())
    donor_email = data.get("donor_email", "").strip()
    donor_phone = data.get("donor_phone", "").strip()
    donor_message = html.escape(data.get("donor_message", "").strip()) if data.get("donor_message") else ""
    allocations_data = data.get("allocations", [])
    cover_fees = data.get("cover_fees", True)
    session_id = data.get("session_id")

    if not donor_name or not donor_email or not donor_phone:
        raise HTTPException(400, "Name, email, and phone are required")
    if not allocations_data:
        raise HTTPException(400, "At least one allocation is required")

    total = 0
    for alloc in allocations_data:
        amt = int(alloc.get("amount_paise", 0))
        if amt <= 0:
            raise HTTPException(400, "Amounts must be positive")
        total += amt

    fee = int(total * 0.0236) if cover_fees else 0

    if session_id:
        existing = await sb_get("contribution_sessions", {"select": "id,status", "id": f"eq.{session_id}"})
        if not existing or existing[0]["status"] != "created":
            raise HTTPException(400, "Session cannot be updated")
        await sb_delete("allocations", {"session_id": f"eq.{session_id}"})
        await sb_patch("contribution_sessions", {
            "donor_name": donor_name, "donor_email": donor_email,
            "donor_phone": donor_phone, "donor_message": donor_message,
            "total_amount_paise": total, "fee_amount_paise": fee
        }, {"id": f"eq.{session_id}"})
    else:
        result = await sb_post("contribution_sessions", {
            "donor_name": donor_name, "donor_email": donor_email,
            "donor_phone": donor_phone, "donor_message": donor_message,
            "total_amount_paise": total, "fee_amount_paise": fee, "status": "created"
        })
        session_id = result[0]["id"]

    alloc_records = [{
        "session_id": session_id, "pot_id": a["pot_id"],
        "pot_item_id": a.get("pot_item_id"), "amount_paise": int(a["amount_paise"]), "status": "pending"
    } for a in allocations_data]
    await sb_post("allocations", alloc_records)

    return {"session_id": session_id, "total_amount_paise": total, "fee_amount_paise": fee, "grand_total_paise": total + fee}


@api_router.get("/session/{session_id}")
async def get_session(session_id: str):
    sessions = await sb_get("contribution_sessions", {
        "select": "id,status,total_amount_paise,fee_amount_paise,razorpay_order_id,razorpay_payment_id,paid_at",
        "id": f"eq.{session_id}"
    })
    if not sessions:
        raise HTTPException(404, "Session not found")
    return sessions[0]


@api_router.get("/session/{session_id}/progress")
async def get_session_progress(session_id: str):
    """Get session allocations with pot progress data for Thank You page animation."""
    # Get session allocations
    allocations = await sb_get("allocations", {
        "select": "pot_id,amount_paise",
        "session_id": f"eq.{session_id}",
        "order": "id.asc"
    })
    if not allocations:
        raise HTTPException(404, "No allocations found for session")
    
    # Get the first pot deterministically (first allocation's pot)
    first_pot_id = allocations[0]["pot_id"]
    session_allocation_for_pot = sum(a["amount_paise"] for a in allocations if a["pot_id"] == first_pot_id)
    
    # Get pot details (goal)
    pots = await sb_get("pots", {
        "select": "id,title,goal_amount_paise",
        "id": f"eq.{first_pot_id}"
    })
    if not pots:
        raise HTTPException(404, "Pot not found")
    pot = pots[0]
    
    # Calculate current raised total for this pot from paid allocations
    # Status can be "paid" (Razorpay confirmed) or allocations from sessions with status "paid"
    paid_allocations = await sb_get("allocations", {
        "select": "amount_paise",
        "pot_id": f"eq.{first_pot_id}",
        "status": "in.(pending,paid)"  # pending = SUBMITTED (UPI awaiting confirmation), paid = RECEIVED
    })
    
    # Actually we need to match the logic in pots endpoint - let's get from sessions with paid status
    # Get all allocations for this pot where the parent session is paid
    all_pot_allocations = await sb_get("allocations", {
        "select": "amount_paise,session_id",
        "pot_id": f"eq.{first_pot_id}"
    })
    
    # Get sessions that are paid
    if all_pot_allocations:
        session_ids = list(set(a["session_id"] for a in all_pot_allocations))
        paid_sessions = await sb_get("contribution_sessions", {
            "select": "id",
            "id": f"in.({','.join(session_ids)})",
            "status": "eq.paid"
        })
        paid_session_ids = set(s["id"] for s in paid_sessions)
        
        # Sum only allocations from paid sessions
        current_raised = sum(
            a["amount_paise"] for a in all_pot_allocations 
            if a["session_id"] in paid_session_ids
        )
    else:
        current_raised = 0
    
    # The animation should show: raised BEFORE this contribution → raised AFTER
    # So we need raised_before = current_raised - session_allocation_for_pot (if this session is already paid)
    # Check if this session is paid
    sessions = await sb_get("contribution_sessions", {
        "select": "status",
        "id": f"eq.{session_id}"
    })
    session_is_paid = sessions and sessions[0]["status"] == "paid"
    
    if session_is_paid:
        raised_before = current_raised - session_allocation_for_pot
    else:
        raised_before = current_raised
    
    return {
        "pot_id": first_pot_id,
        "pot_title": pot["title"],
        "goal_amount_paise": pot.get("goal_amount_paise") or 0,
        "raised_before_paise": raised_before,
        "session_contribution_paise": session_allocation_for_pot,
        "raised_after_paise": raised_before + session_allocation_for_pot
    }



# ---- UPI FLOW ----
@api_router.post("/upi/session/create")
async def create_upi_session(request: Request):
    """Create a session for UPI payment (no donor info yet — collected after payment)."""
    data = await request.json()
    client_ip = request.client.host if request.client else "unknown"
    rate_limit(client_ip, max_req=20, window=60)

    allocations_data = data.get("allocations", [])
    if not allocations_data:
        raise HTTPException(400, "At least one allocation is required")

    total = 0
    for alloc in allocations_data:
        amt = int(alloc.get("amount_paise", 0))
        if amt <= 0:
            raise HTTPException(400, "Amounts must be positive")
        total += amt

    session_data = {
        "total_amount_paise": total,
        "fee_amount_paise": 0,
        "status": "created",
        "donor_name": "",
        "donor_email": "",
        "donor_phone": "",
    }
    # payment_method and utr columns may not exist yet — try with them, fallback without
    try:
        session_data["payment_method"] = "upi"
        result = await sb_post("contribution_sessions", session_data)
    except Exception:
        del session_data["payment_method"]
        result = await sb_post("contribution_sessions", session_data)
    session_id = result[0]["id"]

    alloc_records = [{
        "session_id": session_id,
        "pot_id": a["pot_id"],
        "pot_item_id": a.get("pot_item_id"),
        "amount_paise": int(a["amount_paise"]),
        "status": "pending"
    } for a in allocations_data]
    await sb_post("allocations", alloc_records)

    return {"session_id": session_id, "total_amount_paise": total}


@api_router.post("/upi/blessing/confirm")
async def confirm_upi_blessing(request: Request):
    """After UPI payment, donor submits name/phone/message/UTR."""
    data = await request.json()
    client_ip = request.client.host if request.client else "unknown"
    rate_limit(client_ip, max_req=20, window=60)

    session_id = data.get("session_id")
    donor_name = html.escape(data.get("donor_name", "").strip())
    donor_phone = data.get("donor_phone", "").strip()
    donor_message = html.escape(data.get("donor_message", "").strip()) if data.get("donor_message") else ""
    utr = data.get("utr", "").strip()

    if not session_id or not donor_name or not donor_phone or not donor_message:
        raise HTTPException(400, "Session ID, name, phone, and blessing message are required")

    sessions = await sb_get("contribution_sessions", {"select": "id,status", "id": f"eq.{session_id}"})
    if not sessions:
        raise HTTPException(404, "Session not found")
    if sessions[0]["status"] not in ("created", "pending"):
        raise HTTPException(400, f"Session already {sessions[0]['status']}")

    now_iso = datetime.now(timezone.utc).isoformat()
    
    # Base update data (always works)
    update_data = {
        "donor_name": donor_name,
        "donor_phone": donor_phone,
        "donor_message": donor_message,
        "status": "paid",
        "paid_at": now_iso
    }
    
    # Try with submitted_at first
    try:
        full_update = {**update_data, "submitted_at": now_iso}
        if utr:
            full_update["utr"] = utr
        await sb_patch("contribution_sessions", full_update, {"id": f"eq.{session_id}"})
        logger.info(f"Blessing confirmed with submitted_at for session {session_id}")
    except Exception as e:
        logger.warning(f"Could not save with submitted_at/utr, trying without: {e}")
        # Fallback - try without submitted_at and utr
        try:
            await sb_patch("contribution_sessions", update_data, {"id": f"eq.{session_id}"})
            logger.info(f"Blessing confirmed (without submitted_at) for session {session_id}")
        except Exception as e2:
            logger.error(f"Failed to update session {session_id}: {e2}")
            raise HTTPException(500, "Could not save your blessing. Please try again.")
    
    await sb_patch("allocations", {"status": "paid"}, {"session_id": f"eq.{session_id}"})

    return {"status": "paid", "session_id": session_id, "donor_name": donor_name}


@api_router.get("/config")
async def get_config():
    """Return payment provider config to frontend."""
    # Try to get UPI ID from database, fallback to default
    upi_id = DEFAULT_UPI_ID
    try:
        settings = await sb_get("site_settings", {"select": "setting_value", "setting_key": "eq.upi_id"})
        if settings and settings[0].get("setting_value"):
            upi_id = settings[0]["setting_value"]
    except Exception:
        pass  # Table might not exist yet, use default
    
    return {"payment_provider": PAYMENT_PROVIDER, "upi_id": upi_id}



# ---- RAZORPAY ----
@api_router.post("/razorpay/order/create")
async def create_razorpay_order(request: Request):
    data = await request.json()
    client_ip = request.client.host if request.client else "unknown"
    rate_limit(client_ip, max_req=10, window=60)

    session_id = data.get("session_id")
    if not session_id:
        raise HTTPException(400, "session_id required")

    sessions = await sb_get("contribution_sessions", {"select": "*", "id": f"eq.{session_id}"})
    if not sessions:
        raise HTTPException(404, "Session not found")
    session = sessions[0]

    if session["status"] not in ("created",):
        raise HTTPException(400, f"Session status is {session['status']}")

    allocs = await sb_get("allocations", {"select": "amount_paise", "session_id": f"eq.{session_id}"})
    alloc_total = sum(a["amount_paise"] for a in allocs)
    if alloc_total != session["total_amount_paise"]:
        raise HTTPException(400, "Allocation total mismatch")

    grand_total = session["total_amount_paise"] + session.get("fee_amount_paise", 0)

    try:
        order = razorpay_client.order.create({
            "amount": grand_total, "currency": "INR", "payment_capture": 1,
            "notes": {"session_id": session_id, "donor_name": session["donor_name"]}
        })
    except Exception as e:
        logger.error(f"Razorpay order creation failed: {e}")
        raise HTTPException(502, "Payment gateway error")

    await sb_patch("contribution_sessions", {
        "status": "pending", "razorpay_order_id": order["id"]
    }, {"id": f"eq.{session_id}"})

    return {
        "order_id": order["id"], "amount": grand_total, "currency": "INR",
        "key_id": RAZORPAY_KEY_ID, "session_id": session_id,
        "prefill": {"name": session["donor_name"], "email": session["donor_email"], "contact": session["donor_phone"]}
    }


@api_router.post("/razorpay/webhook")
async def razorpay_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("x-razorpay-signature", "")

    try:
        razorpay_client.utility.verify_webhook_signature(body.decode('utf-8'), signature, RAZORPAY_WEBHOOK_SECRET)
    except Exception:
        logger.warning("Webhook signature verification failed")
        raise HTTPException(400, "Invalid signature")

    payload = json.loads(body)
    event_type = payload.get("event", "")

    await sb_post("webhook_events", {
        "gateway_event_id": payload.get("id", str(uuid.uuid4())),
        "event_type": event_type, "payload_json": payload,
        "received_at": datetime.now(timezone.utc).isoformat()
    })

    if event_type in ("payment.captured", "order.paid"):
        pe = payload.get("payload", {}).get("payment", {}).get("entity", {})
        order_id = pe.get("order_id")
        payment_id = pe.get("id")
        amount = pe.get("amount")

        if order_id:
            sessions = await sb_get("contribution_sessions", {"select": "*", "razorpay_order_id": f"eq.{order_id}"})
            if sessions:
                sess = sessions[0]
                if sess["status"] == "paid":
                    return {"status": "already_processed"}
                expected = sess["total_amount_paise"] + sess.get("fee_amount_paise", 0)
                if amount and amount == expected:
                    await sb_patch("contribution_sessions", {
                        "status": "paid", "razorpay_payment_id": payment_id,
                        "paid_at": datetime.now(timezone.utc).isoformat()
                    }, {"razorpay_order_id": f"eq.{order_id}"})
                    await sb_patch("allocations", {"status": "paid"}, {"session_id": f"eq.{sess['id']}"})
                    logger.info(f"Payment confirmed for session {sess['id']}")
                else:
                    logger.warning(f"Amount mismatch: expected {expected}, got {amount}")

    return {"status": "ok"}


# ---- RAZORPAY PAYMENT LINK (redirect mode for mobile - bypasses iframe) ----
@api_router.post("/razorpay/payment-link")
async def create_payment_link(request: Request):
    """Create a Razorpay Payment Link for mobile redirect checkout (no iframe)."""
    data = await request.json()
    client_ip = request.client.host if request.client else "unknown"
    rate_limit(client_ip, max_req=10, window=60)

    session_id = data.get("session_id")
    if not session_id:
        raise HTTPException(400, "session_id required")

    sessions = await sb_get("contribution_sessions", {"select": "*", "id": f"eq.{session_id}"})
    if not sessions:
        raise HTTPException(404, "Session not found")
    session = sessions[0]

    if session["status"] not in ("created",):
        raise HTTPException(400, f"Session status is {session['status']}")

    allocs = await sb_get("allocations", {"select": "amount_paise", "session_id": f"eq.{session_id}"})
    alloc_total = sum(a["amount_paise"] for a in allocs)
    if alloc_total != session["total_amount_paise"]:
        raise HTTPException(400, "Allocation total mismatch")

    grand_total = session["total_amount_paise"] + session.get("fee_amount_paise", 0)

    # Build callback URL
    callback_base = data.get("callback_base", "") or os.environ.get("APP_URL", str(request.base_url).rstrip("/"))
    callback_url = f"{callback_base}/api/razorpay/payment-link/callback?session_id={session_id}"

    try:
        link_data = {
            "amount": grand_total,
            "currency": "INR",
            "description": "Wedding Gift - Shvetha & Aadi",
            "reference_id": session_id,
            "customer": {
                "name": session["donor_name"],
                "email": session["donor_email"],
                "contact": session["donor_phone"],
            },
            "callback_url": callback_url,
            "callback_method": "get",
            "notes": {
                "session_id": session_id,
                "donor_name": session["donor_name"]
            }
        }
        payment_link = razorpay_client.payment_link.create(link_data)
    except Exception as e:
        logger.error(f"Razorpay payment link creation failed: {e}")
        raise HTTPException(502, "Payment gateway error")

    # Update session with payment link info
    await sb_patch("contribution_sessions", {
        "status": "pending",
        "razorpay_order_id": payment_link.get("order_id", payment_link["id"])
    }, {"id": f"eq.{session_id}"})

    return {
        "payment_link_url": payment_link["short_url"],
        "payment_link_id": payment_link["id"],
        "session_id": session_id
    }


@api_router.get("/razorpay/payment-link/callback")
async def payment_link_callback(request: Request):
    """Handle redirect from Razorpay Payment Link after payment."""
    params = request.query_params
    payment_link_id = params.get("razorpay_payment_link_id", "")
    payment_link_ref = params.get("razorpay_payment_link_reference_id", "")
    payment_link_status = params.get("razorpay_payment_link_status", "")
    payment_id = params.get("razorpay_payment_id", "")
    signature = params.get("razorpay_signature", "")
    session_id = params.get("session_id", "") or payment_link_ref

    # Look up session
    donor_name = ""
    try:
        if session_id:
            sessions = await sb_get("contribution_sessions", {"select": "id,donor_name", "id": f"eq.{session_id}"})
            if sessions:
                donor_name = sessions[0].get("donor_name", "")
    except Exception:
        pass

    # Verify signature
    try:
        verify_payload = f"{payment_link_id}|{payment_link_ref}|{payment_link_status}|{payment_id}"
        expected_sig = hmac.new(
            RAZORPAY_KEY_SECRET.encode('utf-8'),
            verify_payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(expected_sig, signature):
            raise ValueError("Signature mismatch")

        logger.info(f"Payment link callback: verified for session {session_id}, status={payment_link_status}")

        if payment_link_status == "paid" and session_id:
            sessions = await sb_get("contribution_sessions", {"select": "status", "id": f"eq.{session_id}"})
            if sessions and sessions[0]["status"] != "paid":
                await sb_patch("contribution_sessions", {
                    "status": "paid",
                    "razorpay_payment_id": payment_id,
                    "paid_at": datetime.now(timezone.utc).isoformat()
                }, {"id": f"eq.{session_id}"})
                await sb_patch("allocations", {"status": "paid"}, {"session_id": f"eq.{session_id}"})

        from urllib.parse import quote
        redirect_url = f"/thank-you?session={session_id}&name={quote(donor_name)}&payment=success"
        return RedirectResponse(url=redirect_url, status_code=303)

    except Exception as e:
        logger.error(f"Payment link callback verification failed: {e}")
        from urllib.parse import quote
        redirect_url = f"/thank-you?session={session_id}&name={quote(donor_name)}&payment=failed"
        return RedirectResponse(url=redirect_url, status_code=303)



# ---- ADMIN ----
@api_router.get("/admin/dashboard")
async def admin_dashboard(admin=Depends(get_admin_token)):
    allocs = await sb_get("allocations", {"select": "pot_id,amount_paise", "status": "eq.paid"})
    total_collected = sum(a["amount_paise"] for a in allocs)
    pot_totals = defaultdict(int)
    for a in allocs:
        pot_totals[a["pot_id"]] += a["amount_paise"]

    pots = await sb_get("pots", {"select": "id,title,slug,goal_amount_paise,is_active"})
    pot_map = {p["id"]: p for p in pots}
    pot_stats = [{
        "pot_id": pid, "title": pot_map.get(pid, {}).get("title", "?"),
        "goal_amount_paise": pot_map.get(pid, {}).get("goal_amount_paise"),
        "total_raised_paise": total, "is_active": pot_map.get(pid, {}).get("is_active", False)
    } for pid, total in pot_totals.items()]

    recent = await sb_get("contribution_sessions", {
        "select": "id,donor_name,donor_email,total_amount_paise,fee_amount_paise,status,paid_at,created_at",
        "status": "eq.paid", "order": "paid_at.desc.nullslast", "limit": "10"
    })

    return {
        "total_collected_paise": total_collected, "pot_stats": pot_stats,
        "recent_contributions": recent, "total_pots": len(pots),
        "active_pots": sum(1 for p in pots if p.get("is_active"))
    }


@api_router.get("/admin/pots")
async def admin_list_pots(admin=Depends(get_admin_token)):
    pots = await sb_get("pots", {"select": "*", "order": "created_at.desc"})
    all_items = await sb_get("pot_items", {"select": "*", "order": "sort_order.asc"})
    items_by_pot = defaultdict(list)
    for item in all_items:
        items_by_pot[item["pot_id"]].append(item)

    allocs = await sb_get("allocations", {"select": "pot_id,amount_paise", "status": "eq.paid"})
    pot_totals = defaultdict(int)
    for a in allocs:
        pot_totals[a["pot_id"]] += a["amount_paise"]

    for pot in pots:
        pot["total_raised_paise"] = pot_totals.get(pot["id"], 0)
        pot["items"] = items_by_pot.get(pot["id"], [])
    return pots


@api_router.post("/admin/pots")
async def create_pot(request: Request, admin=Depends(get_admin_token)):
    data = await request.json()
    title = html.escape(data.get("title", "").strip())
    slug = data.get("slug", "").strip().lower().replace(" ", "-")
    if not title or not slug:
        raise HTTPException(400, "Title and slug are required")
    result = await sb_post("pots", {
        "title": title, "slug": slug,
        "story_text": data.get("story_text", ""),
        "cover_image_url": data.get("cover_image_url", ""),
        "goal_amount_paise": data.get("goal_amount_paise"),
        "is_active": True
    })
    return result[0]


@api_router.put("/admin/pots/{pot_id}")
async def update_pot(pot_id: str, request: Request, admin=Depends(get_admin_token)):
    data = await request.json()
    update = {}
    for key in ["title", "story_text", "cover_image_url", "goal_amount_paise", "is_active"]:
        if key in data:
            update[key] = data[key]
    result = await sb_patch("pots", update, {"id": f"eq.{pot_id}"})
    return result[0] if result else {"status": "updated"}


@api_router.post("/admin/pots/{pot_id}/archive")
async def archive_pot(pot_id: str, admin=Depends(get_admin_token)):
    await sb_patch("pots", {"is_active": False}, {"id": f"eq.{pot_id}"})
    return {"status": "archived"}


@api_router.post("/admin/pots/{pot_id}/items")
async def add_pot_item(pot_id: str, request: Request, admin=Depends(get_admin_token)):
    data = await request.json()
    title = html.escape(data.get("title", "").strip())
    if not title:
        raise HTTPException(400, "Item title required")
    result = await sb_post("pot_items", {
        "pot_id": pot_id, "title": title,
        "description": data.get("description", ""),
        "image_url": data.get("image_url", ""),
        "sort_order": data.get("sort_order", 0)
    })
    return result[0]


@api_router.put("/admin/pot-items/{item_id}")
async def update_pot_item(item_id: str, request: Request, admin=Depends(get_admin_token)):
    data = await request.json()
    update = {}
    for key in ["title", "description", "image_url", "sort_order"]:
        if key in data:
            update[key] = data[key]
    result = await sb_patch("pot_items", update, {"id": f"eq.{item_id}"})
    return result[0] if result else {"status": "updated"}


@api_router.delete("/admin/pot-items/{item_id}")
async def delete_pot_item(item_id: str, admin=Depends(get_admin_token)):
    await sb_delete("pot_items", {"id": f"eq.{item_id}"})
    return {"status": "deleted"}



@api_router.post("/admin/contributions/{session_id}/status")
async def update_contribution_status(session_id: str, request: Request, admin=Depends(get_admin_token)):
    """Mark a contribution as RECEIVED (paid) or FAILED."""
    data = await request.json()
    new_status = data.get("status", "").lower()
    # Map logical statuses to DB-allowed values
    status_map = {"received": "paid", "failed": "failed"}
    db_status = status_map.get(new_status)
    if not db_status:
        raise HTTPException(400, "Status must be 'received' or 'failed'")

    sessions = await sb_get("contribution_sessions", {"select": "id,status", "id": f"eq.{session_id}"})
    if not sessions:
        raise HTTPException(404, "Session not found")

    await sb_patch("contribution_sessions", {"status": db_status}, {"id": f"eq.{session_id}"})
    await sb_patch("allocations", {"status": db_status}, {"session_id": f"eq.{session_id}"})

    return {"status": db_status, "session_id": session_id}



@api_router.get("/admin/contributions")
async def admin_contributions(admin=Depends(get_admin_token)):
    sessions = await sb_get("contribution_sessions", {"select": "*", "order": "created_at.desc"})
    all_allocs = await sb_get("allocations", {"select": "*"})
    allocs_by_session = defaultdict(list)
    for a in all_allocs:
        allocs_by_session[a["session_id"]].append(a)

    pots = await sb_get("pots", {"select": "id,title"})
    pot_names = {p["id"]: p["title"] for p in pots}

    for session in sessions:
        sa = allocs_by_session.get(session["id"], [])
        for alloc in sa:
            alloc["pot_title"] = pot_names.get(alloc["pot_id"], "Unknown")
        session["allocations"] = sa
    return sessions


@api_router.get("/admin/contributions/export")
async def export_contributions(admin=Depends(get_admin_token)):
    sessions = await sb_get("contribution_sessions", {
        "select": "*", "status": "eq.paid", "order": "paid_at.desc.nullslast"
    })
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Donor Name", "Email", "Phone", "Message", "Amount (INR)", "Fee (INR)", "Status", "Paid At", "Payment ID"])
    for s in sessions:
        writer.writerow([
            s["donor_name"], s.get("donor_email", ""), s.get("donor_phone", ""),
            s.get("donor_message", ""), s["total_amount_paise"] / 100,
            s.get("fee_amount_paise", 0) / 100,
            s.get("status", ""), s.get("paid_at", ""),
            s.get("razorpay_payment_id", "")
        ])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]), media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=contributions.csv"}
    )



# ---- ADMIN SETTINGS ----
@api_router.get("/admin/settings")
async def get_admin_settings(admin=Depends(get_admin_token)):
    """Get all site settings."""
    try:
        settings = await sb_get("site_settings", {"select": "*"})
        # Convert to dict for easier access
        settings_dict = {s["setting_key"]: s["setting_value"] for s in settings}
        return {
            "upi_id": settings_dict.get("upi_id", DEFAULT_UPI_ID),
            "upi_name": settings_dict.get("upi_name", "Shvetha & Aadi Wedding Gift")
        }
    except Exception:
        # Table might not exist, return defaults
        return {
            "upi_id": DEFAULT_UPI_ID,
            "upi_name": "Shvetha & Aadi Wedding Gift"
        }


@api_router.put("/admin/settings")
async def update_admin_settings(request: Request, admin=Depends(get_admin_token)):
    """Update site settings."""
    data = await request.json()
    
    # Validate UPI ID format (basic validation)
    upi_id = data.get("upi_id", "").strip()
    if upi_id and not ("@" in upi_id):
        raise HTTPException(400, "Invalid UPI ID format. Must contain @")
    
    upi_name = data.get("upi_name", "").strip()
    
    results = {}
    
    # Try to upsert settings - create table if it doesn't exist
    for key, value in [("upi_id", upi_id), ("upi_name", upi_name)]:
        if value:
            try:
                # Try to update existing
                existing = await sb_get("site_settings", {"select": "id", "setting_key": f"eq.{key}"})
                if existing:
                    await sb_patch("site_settings", {"setting_value": value}, {"setting_key": f"eq.{key}"})
                else:
                    await sb_post("site_settings", {"setting_key": key, "setting_value": value})
                results[key] = value
            except Exception as e:
                logger.warning(f"Could not save setting {key}: {e}")
                # If table doesn't exist, we'll just return defaults
                results[key] = value if key == "upi_id" else DEFAULT_UPI_ID
    
    return {"status": "updated", "settings": results}



app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

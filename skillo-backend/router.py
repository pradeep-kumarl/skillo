import json
import math
import os
import time
import uuid

# In-memory / file-backed fallback storage for zero-dependency local dev/demo
LOCAL_STORE_PATH = os.path.join(os.path.dirname(__file__), "local_store.json")

def _load_local_store():
    if os.path.exists(LOCAL_STORE_PATH):
        try:
            with open(LOCAL_STORE_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    
    # Pre-seed realistic travelling helpers across different skills
    # Coordinates centered around Bangalore tech / city corridor (12.9716, 77.5946)
    default_store = {
        "users": {
            "helper-1": {
                "userId": "helper-1",
                "name": "Dr. Aarav Mehta",
                "phone": "+91 98450 12345",
                "role": "HELPER",
                "skills": ["Doctor / Medical Emergency"],
                "lat": 12.9730,
                "lng": 77.5960,
                "isAvailable": True,
                "aadhaarStatus": "VERIFIED",
                "rating": 4.9,
                "completedJobs": 24,
                "subscription": "ACTIVE"
            },
            "helper-2": {
                "userId": "helper-2",
                "name": "Rajesh Kumar (Roadside Pro)",
                "phone": "+91 98450 67890",
                "role": "HELPER",
                "skills": ["Mechanic (Roadside Assistance)"],
                "lat": 12.9800,
                "lng": 77.6050,
                "isAvailable": True,
                "aadhaarStatus": "VERIFIED",
                "rating": 4.8,
                "completedJobs": 87,
                "subscription": "ACTIVE"
            },
            "helper-3": {
                "userId": "helper-3",
                "name": "Sunil Verma",
                "phone": "+91 98450 33445",
                "role": "HELPER",
                "skills": ["Quick Manual Help (1-hour)", "Electrician"],
                "lat": 12.9650,
                "lng": 77.5850,
                "isAvailable": True,
                "aadhaarStatus": "VERIFIED",
                "rating": 4.7,
                "completedJobs": 42,
                "subscription": "ACTIVE"
            },
            "helper-4": {
                "userId": "helper-4",
                "name": "Deepak Sharma",
                "phone": "+91 98450 88990",
                "role": "HELPER",
                "skills": ["Plumber"],
                "lat": 12.9550,
                "lng": 77.5750,
                "isAvailable": True,
                "aadhaarStatus": "VERIFIED",
                "rating": 4.9,
                "completedJobs": 56,
                "subscription": "ACTIVE"
            }
        },
        "requests": {}
    }
    _save_local_store(default_store)
    return default_store

def _save_local_store(store):
    try:
        with open(LOCAL_STORE_PATH, "w", encoding="utf-8") as f:
            json.dump(store, f, indent=2)
    except Exception as e:
        print(f"Warning: could not write local store: {e}")

# Haversine distance in Kilometers
def haversine(lat1, lng1, lat2, lng2):
    R = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(d_lng / 2) ** 2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

def response(status, body):
    return {
        "statusCode": status,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
            "Access-Control-Allow-Methods": "DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT",
        },
        "body": json.dumps(body),
    }

def lambda_handler(event, context):
    method = event.get("httpMethod", "GET")
    if method == "OPTIONS":
        return response(200, {"status": "ok"})

    path = event.get("path", "")
    # Normalize path (strip trailing slash)
    if len(path) > 1 and path.endswith("/"):
        path = path[:-1]

    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            body = {}

    store = _load_local_store()

    # 1. Health & Meta
    if path in ["", "/", "/api/health"]:
        return response(200, {
            "service": "Skillo API",
            "status": "HEALTHY",
            "provider": "AWS Lambda + DynamoDB",
            "version": "1.0.0",
            "timestamp": int(time.time())
        })

    # 2. User Registration / Profile
    if path == "/api/users/register" and method == "POST":
        user_id = body.get("userId") or f"user-{uuid.uuid4().hex[:8]}"
        role = body.get("role", "SEEKER").upper()
        skills = body.get("skills", [])
        email = str(body.get("email", "")).strip().lower()
        custom_skill = str(body.get("customSkillDescription", "")).strip()
        aadhaar = str(body.get("aadhaarNumber", "")).strip()
        if len(aadhaar) == 12 and not aadhaar.startswith("X"):
            aadhaar = f"XXXXXXXX{aadhaar[-4:]}"

        user = {
            "userId": user_id,
            "name": body.get("name", "User"),
            "email": email,
            "phone": body.get("phone", ""),
            "role": role,
            "skills": skills,
            "customSkillDescription": custom_skill,
            "lat": float(body.get("lat", 12.9716)),
            "lng": float(body.get("lng", 77.5946)),
            "isAvailable": body.get("isAvailable", True if role == "HELPER" else False),
            "aadhaarStatus": "VERIFIED" if "XXXXXXXX" in aadhaar or len(aadhaar) == 12 else "PENDING",
            "aadhaarNumber": aadhaar,
            "rating": 5.0,
            "completedJobs": 0,
            "subscription": "ACTIVE"
        }
        store["users"][user_id] = user
        _save_local_store(store)
        return response(200, {"status": "success", "user": user})

    # 2b. User Sign In / Login (Using Email ID)
    if path == "/api/users/login" and method == "POST":
        identifier = str(body.get("identifier", "")).strip().replace(" ", "").lower()
        matched = None
        for u in store["users"].values():
            u_email = str(u.get("email", "")).lower()
            phone_clean = str(u.get("phone", "")).replace(" ", "").replace("+91", "")
            if identifier and (identifier == u_email or identifier in phone_clean):
                matched = u
                break

        if not matched:
            # Fallback mock for demonstration
            is_email = "@" in identifier
            user_id = f"user-{uuid.uuid4().hex[:8]}"
            matched = {
                "userId": user_id,
                "name": body.get("name", "Pradeep Kumar"),
                "email": identifier if is_email else "pradeep@skillo.in",
                "phone": identifier if not is_email else "+91 98450 12345",
                "role": body.get("role", "SEEKER"),
                "skills": ["Mechanic (Roadside Assistance)", "Other Skills / Custom Help"],
                "customSkillDescription": "Automotive battery & electrical diagnostics",
                "lat": 12.9716,
                "lng": 77.5946,
                "isAvailable": True,
                "aadhaarStatus": "VERIFIED",
                "aadhaarNumber": "XXXXXXXX7777",
                "rating": 5.0,
                "completedJobs": 0,
                "subscription": "ACTIVE"
            }
            store["users"][user_id] = matched
            _save_local_store(store)

        return response(200, {"status": "success", "user": matched})

    # 3. List Users / Helpers
    if path == "/api/users" and method == "GET":
        role_filter = event.get("queryStringParameters", {}).get("role") if event.get("queryStringParameters") else None
        users_list = list(store["users"].values())
        if role_filter:
            users_list = [u for u in users_list if u.get("role") == role_filter.upper()]
        return response(200, {"users": users_list})

    # 4. Helper Roaming Location Ping
    if path == "/api/helpers/location" and method == "POST":
        user_id = body.get("userId")
        if not user_id or user_id not in store["users"]:
            return response(404, {"error": "Helper not found"})
        
        user = store["users"][user_id]
        if "lat" in body and "lng" in body:
            user["lat"] = float(body["lat"])
            user["lng"] = float(body["lng"])
        if "isAvailable" in body:
            user["isAvailable"] = bool(body["isAvailable"])
        
        user["lastPing"] = int(time.time())
        store["users"][user_id] = user
        _save_local_store(store)
        return response(200, {"status": "updated", "user": user})

    # 5. Create Skill Help / SOS Request
    if path == "/api/requests/create" and method == "POST":
        req_id = f"req-{uuid.uuid4().hex[:8]}"
        seeker_lat = float(body.get("lat", 12.9716))
        seeker_lng = float(body.get("lng", 77.5946))
        skill = body.get("skillNeeded", "General Assistance")

        req = {
            "requestId": req_id,
            "seekerId": body.get("seekerId", "guest-seeker"),
            "seekerName": body.get("seekerName", "Citizen in Need"),
            "seekerPhone": body.get("seekerPhone", "+91 99999 88888"),
            "skillNeeded": skill,
            "description": body.get("description", ""),
            "urgency": body.get("urgency", "EMERGENCY"),
            "seekerLat": seeker_lat,
            "seekerLng": seeker_lng,
            "radiusKm": 2,
            "status": "SEARCHING", # SEARCHING -> ACCEPTED -> COMPLETED
            "createdAt": int(time.time()),
            "assignedHelper": None,
            "seekerRating": None,
            "helperRating": None
        }
        store["requests"][req_id] = req
        _save_local_store(store)
        return response(200, {"status": "created", "request": req})

    # 6. Search Nearby with 2km -> 4km -> 6km Ring Expansion
    if path == "/api/requests/search-nearby" and method == "POST":
        lat = float(body.get("lat", 12.9716))
        lng = float(body.get("lng", 77.5946))
        skill_needed = body.get("skillNeeded", "")
        max_limit_km = float(body.get("maxRadiusKm", 6.0))

        # Filter helpers that have the skill and are marked available
        available_helpers = [
            u for u in store["users"].values()
            if u.get("role") == "HELPER"
            and u.get("isAvailable", True)
            and (not skill_needed or any(skill_needed.lower() in s.lower() for s in u.get("skills", [])))
        ]

        # Progressive radius check: 2km -> 4km -> 6km
        radii = [2.0, 4.0, 6.0]
        results = []
        used_radius = None

        for r in radii:
            if r > max_limit_km:
                break
            matched = []
            for h in available_helpers:
                dist = haversine(lat, lng, h["lat"], h["lng"])
                if dist <= r:
                    matched.append({
                        **h,
                        "distanceKm": round(dist, 2)
                    })
            if matched:
                results = sorted(matched, key=lambda x: x["distanceKm"])
                used_radius = r
                break # Return closest expanding tier

        # If none found in 2/4/6km, return empty with 6km
        return response(200, {
            "radiusUsedKm": used_radius,
            "helpersFound": results,
            "totalAvailable": len(available_helpers)
        })

    # 7. Get Pending Requests (For travelling helpers to see alerts)
    if path == "/api/requests/pending" and method == "GET":
        pending = [
            r for r in store["requests"].values()
            if r.get("status") == "SEARCHING"
        ]
        pending.sort(key=lambda x: x.get("createdAt", 0), reverse=True)
        return response(200, {"requests": pending})

    # 8. Accept Request (Instant handshake & contact exchange)
    if path == "/api/requests/accept" and method == "POST":
        req_id = body.get("requestId")
        helper_id = body.get("helperId")

        if not req_id or req_id not in store["requests"]:
            return response(404, {"error": "Request not found"})
        
        req = store["requests"][req_id]
        if req["status"] != "SEARCHING":
            return response(400, {"error": f"Request already {req['status']}"})

        helper = store["users"].get(helper_id, {
            "userId": helper_id,
            "name": body.get("helperName", "Travelling Helper"),
            "phone": body.get("helperPhone", "+91 98000 11111"),
            "lat": float(body.get("helperLat", 12.9730)),
            "lng": float(body.get("helperLng", 77.5960)),
            "rating": 4.9
        })

        req["status"] = "ACCEPTED"
        req["assignedHelper"] = helper
        req["acceptedAt"] = int(time.time())
        store["requests"][req_id] = req
        _save_local_store(store)

        return response(200, {
            "status": "accepted",
            "request": req,
            "handshake": {
                "seekerPhone": req["seekerPhone"],
                "seekerLocation": {"lat": req["seekerLat"], "lng": req["seekerLng"]},
                "helperPhone": helper["phone"],
                "helperLocation": {"lat": helper["lat"], "lng": helper["lng"]}
            }
        })

    # 9. Complete & Rate Request (Score both Seeker & Helper)
    if path == "/api/requests/rate" and method == "POST":
        req_id = body.get("requestId")
        rater_role = body.get("raterRole", "SEEKER").upper()
        rating_score = float(body.get("rating", 5.0))

        if not req_id or req_id not in store["requests"]:
            return response(404, {"error": "Request not found"})
        
        req = store["requests"][req_id]
        req["status"] = "COMPLETED"

        if rater_role == "SEEKER":
            req["seekerRatingGiven"] = rating_score
            # Update helper's aggregate rating
            helper_id = req.get("assignedHelper", {}).get("userId")
            if helper_id and helper_id in store["users"]:
                h = store["users"][helper_id]
                h["completedJobs"] = h.get("completedJobs", 0) + 1
                curr_rating = h.get("rating", 5.0)
                # Weighted running average
                h["rating"] = round((curr_rating * 4 + rating_score) / 5, 2)
        else:
            req["helperRatingGiven"] = rating_score

        _save_local_store(store)
        return response(200, {"status": "rated", "request": req})

    # 10. Aadhaar Verification Demo Sandbox
    if path == "/api/aadhaar/verify" and method == "POST":
        aadhaar_no = str(body.get("aadhaarNumber", "")).replace(" ", "")
        otp = str(body.get("otp", ""))

        if len(aadhaar_no) != 12:
            return response(400, {"verified": False, "error": "Invalid Aadhaar number (must be 12 digits)"})
        
        if not otp:
            # Step 1: Send OTP simulation
            masked = f"XXXXXXXX{aadhaar_no[-4:]}"
            return response(200, {
                "status": "OTP_SENT",
                "message": f"Demo OTP sent to Aadhaar-linked mobile for {masked}",
                "demoOtp": "123456" # For instant hackathon demo review
            })
        
        if otp == "123456":
            return response(200, {
                "status": "SUCCESS",
                "verified": True,
                "aadhaarNumberMasked": f"XXXXXXXX{aadhaar_no[-4:]}",
                "verifiedName": body.get("name", "Verified Citizen"),
                "badge": "UIDAI_GOV_VERIFIED"
            })
        else:
            return response(400, {"verified": False, "error": "Incorrect OTP. Use demo OTP 123456."})

    return response(404, {"error": f"Route not found: {method} {path}"})
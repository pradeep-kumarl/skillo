import json
import math

# Seeded fake mechanics around Nagarbhavi, Bangalore
# (lat, long chosen to sit at varying real-world distances from BDA Complex)
MECHANICS = [
    {"id": 1, "name": "Ravi Kumar", "phone": "9876543210", "lat": 12.9634, "lng": 77.5105},  # ~0.5km
    {"id": 2, "name": "Suresh M", "phone": "9876543211", "lat": 12.9700, "lng": 77.5200},     # ~1.8km
    {"id": 3, "name": "Ganesh R", "phone": "9876543212", "lat": 12.9800, "lng": 77.5300},     # ~3.5km
    {"id": 4, "name": "Manjunath K", "phone": "9876543213", "lat": 12.9900, "lng": 77.5400},  # ~5.2km
    {"id": 5, "name": "Prakash S", "phone": "9876543214", "lat": 13.0000, "lng": 77.5500},    # ~6.8km
]


def haversine_distance(lat1, lng1, lat2, lng2):
    """Returns distance in kilometers between two GPS points."""
    R = 6371  # Earth's radius in km
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)
    a = (math.sin(d_lat / 2) ** 2
         + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2))
         * math.sin(d_lng / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def lambda_handler(event, context):
    try:
        body = json.loads(event.get("body") or "{}")
        user_lat = float(body.get("lat"))
        user_lng = float(body.get("lng"))
    except (TypeError, ValueError):
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "lat and lng are required"}),
        }

    found = []
    radius_used = None

    for radius in [2, 4, 6]:
        found = []
        for m in MECHANICS:
            dist = haversine_distance(user_lat, user_lng, m["lat"], m["lng"])
            if dist <= radius:
                found.append({**m, "distance_km": round(dist, 2)})
        if found:
            radius_used = radius
            break

    return {
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": json.dumps({
            "radius_used_km": radius_used,
            "mechanics_found": len(found),
            "mechanics": found,
        }),
    }
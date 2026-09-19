import json
from common.db import get_connection, init_db


def lambda_handler(event, context):
    init_db()

    try:
        body = json.loads(event.get("body") or "{}")
        user_lat = float(body.get("lat"))
        user_lng = float(body.get("lng"))
    except (TypeError, ValueError):
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "lat and lng are required"}),
        }

    conn = get_connection()
    cursor = conn.execute(
        "INSERT INTO requests (user_lat, user_lng, status) VALUES (?, ?, 'pending')",
        (user_lat, user_lng),
    )
    conn.commit()
    request_id = cursor.lastrowid
    conn.close()

    return {
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": json.dumps({
            "request_id": request_id,
            "status": "pending",
        }),
    }
import json
from common.db import get_connection, init_db


def lambda_handler(event, context):
    init_db()

    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM requests WHERE status='pending' ORDER BY created_at DESC"
    ).fetchall()
    conn.close()

    requests = [dict(row) for row in rows]

    return {
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": json.dumps({"requests": requests}),
    }
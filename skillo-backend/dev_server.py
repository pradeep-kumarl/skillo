"""
Skillo Local Development Server (Standard Python HTTP Server)
Wraps router.lambda_handler for instantaneous local testing without Docker latency.
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.parse
from router import lambda_handler

PORT = 3000

class LambdaProxyHandler(BaseHTTPRequestHandler):
    def _handle(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        query_params = urllib.parse.parse_qs(parsed_url.query)
        flat_query = {k: v[0] if len(v) == 1 else v for k, v in query_params.items()}

        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else ""

        event = {
            "httpMethod": self.command,
            "path": path,
            "queryStringParameters": flat_query,
            "headers": dict(self.headers),
            "body": body
        }

        lambda_resp = lambda_handler(event, None)
        status_code = lambda_resp.get("statusCode", 200)
        headers = lambda_resp.get("headers", {})
        resp_body = lambda_resp.get("body", "")

        self.send_response(status_code)
        for k, v in headers.items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(resp_body.encode("utf-8"))

    def do_GET(self):
        self._handle()

    def do_POST(self):
        self._handle()

    def do_OPTIONS(self):
        self._handle()

    def log_message(self, format, *args):
        # Clean logging
        print(f"[{self.command}] {self.path} - {args[1] if len(args) > 1 else ''}")

if __name__ == "__main__":
    print(f"🚀 Skillo Backend Server running at http://localhost:{PORT}")
    print(f"⚡ Ready for React Native / Expo connection")
    httpd = HTTPServer(("0.0.0.0", PORT), LambdaProxyHandler)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server.")

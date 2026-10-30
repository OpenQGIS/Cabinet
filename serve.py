import http.server
import mimetypes
import os

PORT = 8199
DIRECTORY = "D:/GitHub/Cabinet"

mimetypes.add_type("application/xml", ".dzi")
mimetypes.add_type("image/webp", ".webp")


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()


class ThreadingServer(http.server.ThreadingHTTPServer):
    allow_reuse_address = True


if __name__ == "__main__":
    os.chdir(DIRECTORY)
    with ThreadingServer(("", PORT), Handler) as httpd:
        print(f"Cabinet Server running on http://localhost:{PORT}/ with full DZI/WebP MIME support", flush=True)
        httpd.serve_forever()

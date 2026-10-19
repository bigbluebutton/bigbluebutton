#!/usr/bin/env python3
"""Minimal BigBlueButton API mock for testing docker/tests/smoke/api-smoke.sh.

Protected test helper. Implements only what the smoke test exercises:
create, join (redirect=false), getMeetings, isMeetingRunning, end.

Checksums are verified as bbb-web does: hash(apiCall + queryString-without-checksum + secret),
algorithm chosen by the checksum's length (sha1/sha256/sha384/sha512)
(bbb-common-web/src/main/java/org/bigbluebutton/api/ParamsProcessorUtil.java:1355-1393 @ 35cad46a9f).

Usage: MOCK_SECRET=... [MOCK_FAULT=...] bbb_api_mock.py PORT
MOCK_FAULT (optional, for negative tests):
  create-failed  create answers FAILED
  not-listed     getMeetings never lists the meeting
  end-ignored    end answers SUCCESS but the meeting keeps running
  no-join-url    join answers SUCCESS without a <url> element
Prints "READY <port>" on stdout once listening. Logs requests to stderr without the secret.
"""
import hashlib
import os
import sys
import urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

SECRET = os.environ["MOCK_SECRET"]
FAULT = os.environ.get("MOCK_FAULT", "")
ALGOS = {40: hashlib.sha1, 64: hashlib.sha256, 96: hashlib.sha384, 128: hashlib.sha512}
MEETINGS = {}


def resp(code, body=""):
    return f"<response><returncode>{code}</returncode>{body}</response>"


def checksum_ok(call, query):
    params = urllib.parse.parse_qs(query, keep_blank_values=True)
    given = (params.get("checksum") or [""])[0]
    q = query.replace("&checksum=" + given, "").replace("checksum=" + given + "&", "").replace("checksum=" + given, "")
    algo = ALGOS.get(len(given))
    return bool(algo) and algo((call + q + SECRET).encode()).hexdigest().lower() == given.lower()


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        sys.stderr.write("mock: %s %s\n" % (self.command, self.path.split("?")[0]))

    def send_xml(self, text):
        data = text.encode()
        self.send_response(200)
        self.send_header("Content-Type", "text/xml")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        url = urllib.parse.urlsplit(self.path)
        prefix = "/bigbluebutton/api/"
        if url.path in ("/bigbluebutton/api", prefix):
            return self.send_xml(resp("SUCCESS", "<version>2.0</version>"))
        if not url.path.startswith(prefix):
            self.send_response(404)
            self.end_headers()
            return
        call = url.path[len(prefix):]
        if not checksum_ok(call, url.query):
            return self.send_xml(resp("FAILED", "<messageKey>checksumError</messageKey>"
                                      "<message>Checksums do not match</message>"))
        p = {k: v[0] for k, v in urllib.parse.parse_qs(url.query, keep_blank_values=True).items()}
        mid = p.get("meetingID", "")
        if call == "create":
            if FAULT == "create-failed" or not mid:
                return self.send_xml(resp("FAILED", "<messageKey>mockFailure</messageKey>"))
            MEETINGS[mid] = p.get("name", mid)
            return self.send_xml(resp("SUCCESS", f"<meetingID>{mid}</meetingID><internalMeetingID>i-{mid}</internalMeetingID>"))
        if call == "join":
            if mid not in MEETINGS:
                return self.send_xml(resp("FAILED", "<messageKey>notFound</messageKey>"))
            url_el = "" if FAULT == "no-join-url" else f"<url>https://bbb.example.com/html5client/?sessionToken=mock{len(mid)}</url>"
            return self.send_xml(resp("SUCCESS", f"<messageKey>successfullyJoined</messageKey><meeting_id>i-{mid}</meeting_id>{url_el}"))
        if call == "getMeetings":
            listed = {} if FAULT == "not-listed" else MEETINGS
            if not listed:
                return self.send_xml(resp("SUCCESS", "<meetings/><messageKey>noMeetings</messageKey>"))
            items = "".join(f"<meeting><meetingName>{n}</meetingName><meetingID>{m}</meetingID><running>true</running></meeting>" for m, n in listed.items())
            return self.send_xml(resp("SUCCESS", f"<meetings>{items}</meetings>"))
        if call == "isMeetingRunning":
            return self.send_xml(resp("SUCCESS", f"<running>{'true' if mid in MEETINGS else 'false'}</running>"))
        if call == "end":
            if mid not in MEETINGS:
                return self.send_xml(resp("FAILED", "<messageKey>notFound</messageKey>"))
            if FAULT != "end-ignored":
                del MEETINGS[mid]
            return self.send_xml(resp("SUCCESS", "<messageKey>sentEndMeetingRequest</messageKey>"))
        return self.send_xml(resp("FAILED", "<messageKey>unsupportedRequest</messageKey>"))


def main():
    port = int(sys.argv[1])
    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print(f"READY {port}", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()

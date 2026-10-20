# fake-web vs fake-api

| Identical | Differing | One-sided | Skipped |
|---|---|---|---|
| 0 | 12 | 0 | 0 |

Lines starting with `-` are fake-web's, with `+` fake-api's.

## create

- **create.smoke.lifecycle**: differing (PASS / FAIL)

  step 1 (line 8), differing:

  ```diff
  - status 200
  - header Cache-Control no-cache
  - header Content-Type text/xml;charset=utf-8
  + status 202
  + header Content-Type application/xml
  - /response/returncode "SUCCESS"
  + /response/returnCode "SUCCESS"
  - /response/moderatorPW "<random>"
  + /response/moderatorPw "<random>"
  ```

  step 2 (line 15), differing:

  ```diff
  - status 200
  - header Cache-Control no-cache
  - header Content-Type text/xml;charset=utf-8
  + status 202
  + header Content-Type application/xml
  ```

  step 3 (line 22), differing:

  ```diff
  - status 200
  - header Cache-Control no-cache
  - header Content-Type text/xml;charset=utf-8
  - body xml
  - /response/returncode "SUCCESS"
  - /response/messageKey "sentEndMeetingRequest"
  - /response/message "A request to end the meeting was sent.  Please wait a few seconds, and then use the getMeetingInfo or isMeetingRunning API calls to verify that it was ended."
  + status 404
  + header Content-Type text/plain; charset=utf-8
  + body text 19 bytes, sha256 b16e15764b8b
  ```

## getMeetingInfo

- **getMeetingInfo.smoke.json-error**: differing (PASS / FAIL)

  step 1 (line 7), differing:

  ```diff
  - status 200
  - header Content-Type application/json
  - body json
  - $.response.message "We could not find a meeting with that meeting ID"
  - $.response.messageKey "notFound"
  - $.response.returncode "FAILED"
  + status 202
  + header Content-Type application/xml
  + body xml
  + /response/returncode "FAILED"
  + /response/messageKey "notFound"
  + /response/message "We could not find a meeting with that meeting ID"
  ```

## getMeetings

- **getMeetings.smoke.checksum-accepted-sha1**: differing (PASS / PASS)

  step 1 (line 15), differing:

  ```diff
  - status 200
  - header Cache-Control no-cache
  - header Content-Type text/xml;charset=utf-8
  + status 202
  + header Content-Type application/xml
  ```
- **getMeetings.smoke.checksum-accepted-sha256**: differing (PASS / PASS)

  step 1 (line 15), differing:

  ```diff
  - status 200
  - header Cache-Control no-cache
  - header Content-Type text/xml;charset=utf-8
  + status 202
  + header Content-Type application/xml
  ```
- **getMeetings.smoke.checksum-accepted-sha384**: differing (PASS / PASS)

  step 1 (line 15), differing:

  ```diff
  - status 200
  - header Cache-Control no-cache
  - header Content-Type text/xml;charset=utf-8
  + status 202
  + header Content-Type application/xml
  ```
- **getMeetings.smoke.checksum-accepted-sha512**: differing (PASS / PASS)

  step 1 (line 15), differing:

  ```diff
  - status 200
  - header Cache-Control no-cache
  - header Content-Type text/xml;charset=utf-8
  + status 202
  + header Content-Type application/xml
  ```
- **getMeetings.smoke.checksum-accepted-uppercase**: differing (PASS / FAIL)

  step 1 (line 15), differing:

  ```diff
  - status 200
  - header Cache-Control no-cache
  - header Content-Type text/xml;charset=utf-8
  + status 202
  + header Content-Type application/xml
  - /response/returncode "SUCCESS"
  - /response/meetings
  + /response/returncode "FAILED"
  + /response/messageKey "checksumError"
  + /response/message "Checksums do not match."
  ```
- **getMeetings.smoke.checksum-accepted-first**: differing (PASS / PASS)

  step 1 (line 15), differing:

  ```diff
  - status 200
  - header Cache-Control no-cache
  - header Content-Type text/xml;charset=utf-8
  + status 202
  + header Content-Type application/xml
  ```
- **getMeetings.smoke.checksum-accepted-middle**: differing (PASS / PASS)

  step 1 (line 15), differing:

  ```diff
  - status 200
  - header Cache-Control no-cache
  - header Content-Type text/xml;charset=utf-8
  + status 202
  + header Content-Type application/xml
  ```
- **getMeetings.smoke.checksum-rejected-wrong**: differing (PASS / PASS)

  step 1 (line 10), differing:

  ```diff
  - status 200
  - header Cache-Control no-cache
  - header Content-Type text/xml;charset=utf-8
  + status 202
  + header Content-Type application/xml
  - /response/message "Checksums do not match"
  + /response/message "Checksums do not match."
  ```
- **getMeetings.smoke.checksum-rejected-duplicate**: differing (PASS / PASS)

  step 1 (line 10), differing:

  ```diff
  - status 200
  - header Cache-Control no-cache
  - header Content-Type text/xml;charset=utf-8
  + status 202
  + header Content-Type application/xml
  - /response/message "Checksums do not match"
  + /response/message "Checksums do not match."
  ```

## version

- **version.smoke.fields**: differing (PASS / FAIL)

  step 1 (line 7), differing:

  ```diff
  - status 200
  - header Cache-Control no-cache
  - header Content-Type text/xml;charset=utf-8
  - body xml
  - /response/returncode "SUCCESS"
  - /response/version "2.0"
  - /response/apiVersion "2.0"
  - /response/bbbVersion
  + status 404
  + header Content-Type text/plain; charset=utf-8
  + body text 19 bytes, sha256 b16e15764b8b
  ```

# Parity reference (bare metal)

`reference/` holds the configuration of a bare-metal BigBlueButton 4.0 reference install,
normalized to the test fixture values. Image golden-file cases compare their rendered files with
it (`run-golden.sh --parity`, see `../golden/README.md`); every difference must be allowlisted
with a reason, or it is a bug.

## Source

| | |
|---|---|
| Archive | collection archive of a bare-metal test install (collected 2026-10-16), identified by its sha256 |
| sha256 | `d13088b2c0b88f423d91236d8efc633f626100b1ca6c8b37ffd146e40065ae86` |
| Install | `bbb-install.sh -v noble-400` (v4.0.x-release @ `2547823185`), Ubuntu 24.04, public IPv4 on the interface, no public IPv6 |

The archive is not part of this repository: it contains the real hostname and IP address of the
(deleted) test VM. Secrets in it were already replaced by `__REDACTED_<NAME>__` when it was
collected. Regenerate the reference with:

```bash
rm -rf docker/tests/parity/reference
docker/tests/parity/normalize-reference.sh <archive>.tar.gz docker/tests/parity/reference
```

Same archive, same tree (byte-identical). The script prints the archive checksum and how many
replacements each rule made per file; it never prints a real value.

## Layout

`reference/<component>/<bare-metal path>`, for example
`reference/bbb-web/etc/bigbluebutton/bbb-web.properties`. Component names are those of the
config matrix (plus `haproxy`, the TLS edge). Files are the **installed** state: bbb-install and
the package scripts edit some packaged defaults in place (see below), so the reference is not the
same as the files in the source tree.

## Normalization

Applied in this order; nothing else in a file is changed.

| What | Becomes | Found by |
|---|---|---|
| `__REDACTED_<NAME>__` | the fixture value of the mapped variable (table below) | placeholder name; an unmapped name stops the script |
| real hostname | `bbb.example.com` | `bigbluebutton.web.serverURL` in `/etc/bigbluebutton/bbb-web.properties` |
| real public IPv4 | `203.0.113.10` (whole addresses only) | `relay-ip` in `/etc/turnserver.conf`, cross-checked against `ip -br addr` |
| `html5ClientBuild:` value in html5 `settings.yml` | `__PARITY_HTML5_CLIENT_BUILD__` | package build timestamp, differs per build |
| `__REDACTED_ESL_PASSWORD__` | `__PARITY_ESL_PASSWORD__` | FreeSWITCH is not shipped, there is no fixture variable |

Then the output is checked, and nothing is written if a check fails: no `__REDACTED_` left, no
hostname and no hostname domain (case-insensitive), no IPv4 literal outside `0.0.0.0`,
`255.255.255.255`, loopback, private and documentation ranges. The reference host had no public IPv6,
so there is no IPv6 rule.

`__PARITY_*__` tokens never come out of a render. A line holding one is always a difference, to
be allowlisted with a reason (or compared with a rule that ignores the value).

### Placeholder mapping

| Archive placeholder | Fixture variable | Reference files |
|---|---|---|
| `__REDACTED_BBB_SHARED_SECRET__` | `BBB_SHARED_SECRET` | bbb-web `bigbluebutton.properties`, `bbb-web.properties`; akka-apps `application.conf`, `bbb-apps-akka.conf` |
| `__REDACTED_LIVEKIT_API_KEY__` | `LIVEKIT_API_KEY` | livekit `livekit.yaml` (override); bbb-webrtc-sfu `default.yml`; bbb-webrtc-recorder `/etc/default/bbb-webrtc-recorder` |
| `__REDACTED_LIVEKIT_API_SECRET__` | `LIVEKIT_API_SECRET` | same files as the key |
| `__REDACTED_TURN_SECRET__` | `TURN_SECRET` | coturn `turnserver.conf`; bbb-web `turn-stun-servers.xml` (2) |
| `__REDACTED_HASURA_ADMIN_SECRET__` | `HASURA_ADMIN_SECRET` | graphql-server `bbb-graphql-server-admin-pass`, `config.yaml` |
| `__REDACTED_ESL_PASSWORD__` | none (token `__PARITY_ESL_PASSWORD__`) | bbb-webrtc-sfu `production.yml` |

`POSTGRES_PASSWORD` has no placeholder: the reference install uses fixed packaged role passwords
(`hasura_app`, `bbb_hasura`, `blocknote_app` in the graphql-server and shared-notes files), which
the collection script left unchanged.

## Files

Source of each entry: the `config_files` of the component in the config matrix (path or its
`override_path`), unless noted.

| Reference file | Matrix source |
|---|---|
| `bbb-web/usr/share/bbb-web/WEB-INF/classes/bigbluebutton.properties` | bbb-web, default |
| `bbb-web/etc/bigbluebutton/bbb-web.properties` | bbb-web, override of the above (also read by akka-apps and recording) |
| `bbb-web/usr/share/bbb-web/WEB-INF/classes/spring/turn-stun-servers.xml` | bbb-web, default (no `/etc` override on the reference) |
| `bbb-web/etc/default/bbb-web` | bbb-web, default |
| `akka-apps/usr/share/bbb-apps-akka/conf/application.conf` | akka-apps, default |
| `akka-apps/etc/bigbluebutton/bbb-apps-akka.conf` | akka-apps, override |
| `html5/usr/share/bigbluebutton/html5-client/private/config/settings.yml` | html5, default |
| `html5/etc/bigbluebutton/bbb-html5.yml` | html5, override |
| `graphql-server/etc/default/bbb-graphql-server` | graphql-server, default |
| `graphql-server/etc/default/bbb-graphql-server-admin-pass` | graphql-server, generated |
| `graphql-server/usr/share/bbb-graphql-server/config.yaml` | graphql-server, generated |
| `graphql-server/usr/share/bbb-graphql-server/metadata/databases/databases.yaml` | graphql-server, default |
| `graphql-middleware/usr/share/bbb-graphql-middleware/config.yml` | graphql-middleware, default |
| `export-annotations/usr/local/bigbluebutton/bbb-export-annotations/config/settings.json` | export-annotations, default |
| `shared-notes/usr/share/bbb-shared-notes-server/config/default.yml` | shared-notes, default |
| `livekit/usr/share/livekit-server/livekit.yaml` | livekit, default |
| `livekit/etc/bigbluebutton/livekit.yaml` | livekit, override |
| `coturn/etc/turnserver.conf` | coturn, default (written by bbb-install) |
| `bbb-webrtc-sfu/usr/local/bigbluebutton/bbb-webrtc-sfu/config/default.yml` | bbb-webrtc-sfu, generated |
| `bbb-webrtc-sfu/etc/bigbluebutton/bbb-webrtc-sfu/production.yml` | bbb-webrtc-sfu, override |
| `bbb-webrtc-recorder/etc/bbb-webrtc-recorder/bbb-webrtc-recorder.yml` | bbb-webrtc-recorder, default |
| `bbb-webrtc-recorder/etc/default/bbb-webrtc-recorder` | bbb-webrtc-recorder, generated |
| `recording/usr/local/bigbluebutton/core/scripts/bigbluebutton.yml` | recording, default |
| `recording/usr/local/bigbluebutton/core/scripts/presentation.yml` | recording, default |
| `nginx/etc/nginx/nginx.conf` | nginx, default (contains the bucket-size deviation, below) |
| `nginx/etc/nginx/sites-available/bigbluebutton` | nginx, default |
| `nginx/etc/nginx/sites-available/hasura-loadbalancer.conf` | nginx, default |
| `nginx/etc/nginx/conf.d/bbb-graphql-client-settings-cache.conf` | nginx, default |
| `nginx/usr/share/bigbluebutton/include_default.nginx` | nginx, override_path `/etc/bigbluebutton/nginx/*.nginx`: on the reference that directory holds only a symlink to this file |
| `nginx/usr/share/bigbluebutton/nginx/*.nginx` (12 files), `nginx/usr/share/bigbluebutton/nginx/web` | the location snippets pulled in by `include_default.nginx`; `web.nginx` is a symlink to `web` on the reference |
| `haproxy/etc/haproxy/haproxy.cfg`, `haproxy/etc/haproxy/protocolmap` | not in the matrix: the TLS edge on 443; `protocolmap` is referenced by `haproxy.cfg` |
| `postgres/etc/postgresql/16/main/conf.d/bbb-pg.conf` | postgres, default |

Not included, and why:

| Left out | Reason |
|---|---|
| matrix overrides absent on the reference (`/etc/bigbluebutton/turn-stun-servers.xml`, `bbb-web.env`, `bbb-graphql-server.env`, `bbb-graphql-middleware.yml`, `bbb-shared-notes-server.yml`/`.env`, `bbb-webrtc-recorder.yml`, `recording/*.yml`, `/etc/default/bigbluebutton-cron-config`) | a default install does not create them |
| `/usr/local/bigbluebutton/core/scripts/podcast.yml` | not installed on the reference |
| `/usr/local/bigbluebutton/bbb-webhooks/config/default.yml` | bbb-webhooks is not part of the reference install |
| `/usr/share/livekit-server/livekit-sip.yaml`, `/etc/bigbluebutton/livekit-sip.yaml` | livekit-sip belongs to the later `dialin` profile; add them when that image is built |
| `/etc/cron.daily/bigbluebutton` | a script the recording image ships unchanged, nothing rendered |
| `/etc/default/bbb-apps-akka` | only a commented-out line; not in the matrix |
| FreeSWITCH and bbb-fsesl-akka files | not shipped (LiveKit is the only media server) |
| `/etc/nginx/sites-available/default`, nginx `snippets/`, `*_params`, `mime.types`, `/etc/default/haproxy`, `/etc/haproxy/errors/` | distribution defaults, not BBB configuration |
| `/etc/letsencrypt/**` | certificate handling differs in containers; hold the real hostname |
| symlinks (`/etc/nginx/sites-enabled/*`, `/etc/bigbluebutton/nginx/include_default.nginx`, `web.nginx`) | not files; their targets are included and the links are listed above |
| `bbb-html5.nginx.static`, `bbb-html5.nginx.dev` | alternatives of `bbb-html5.nginx`, not matched by the `*.nginx` include |
| `*.example.yml`, code, package metadata | not configuration |

## Installed vs. packaged

Some packaged defaults are edited in place on bare metal. Observed differences between the
reference and the source tree at `35cad46a9f` (the inventory commit; the reference was installed
from `2547823185`, so part of a difference can also be version drift):

- `bigbluebutton.properties`: `serverURL=https://203.0.113.10` (the IP, not the hostname) and the
  shared secret (source: `bigbluebutton-web/grails-app/conf/bigbluebutton.properties:398,448 @ 35cad46a9f`).
- akka-apps `application.conf`: `bbbWebAPI="http://203.0.113.10/bigbluebutton/api"` and the shared
  secret (source: `akka-bbb-apps/src/universal/conf/application.conf:69-70 @ 35cad46a9f`). The
  hostname URL is in the override `bbb-apps-akka.conf`.
- html5 `settings.yml`: version fields filled in (`bigbluebutton-html5/private/config/settings.yml:30,33 @ 35cad46a9f`),
  and comment indentation changed throughout (the file was rewritten by a YAML tool; which step
  does it is UNVERIFIED).
- recording `bigbluebutton.yml`: `playback_host` set to the hostname, blank lines removed
  (`record-and-playback/core/scripts/bigbluebutton.yml:69,78 @ 35cad46a9f`).
- bbb-webrtc-sfu `default.yml`: differs from `default.example.yml` of the same package (IP
  addresses, LiveKit key/secret, `recordingAdapter`, mediasoup settings, re-indented by a YAML tool).

## Known deviations of the reference install

1. **`server_names_hash_bucket_size 128;` in `nginx/etc/nginx/nginx.conf`** was added by hand
   before the second installer run: the 52-character hostname of the VM failed with upstream's
   default. It is not part of a default install, so an image never renders it. Allowlist it in
   every case that compares `nginx.conf`:

   ```yaml
   - {file: etc/nginx/nginx.conf, line: '^[[:space:]]*server_names_hash_bucket_size 128;$', reason: "reference host deviation: added by hand for the long VM hostname, not upstream"}
   ```

2. **The installer ran twice** (the first run stopped at the Let's Encrypt step). The collected
   files are the state after the second run. No file in the reference shows duplicated
   entries: the installer-written files (`bbb-web.properties`, `bbb-apps-akka.conf`,
   `bbb-html5.yml`, `livekit.yaml`, `production.yml`, `turnserver.conf`) hold each setting
   once. Repeated lines elsewhere are structure (`mode tcp` per haproxy section, the two
   `services {}` blocks in akka-apps `application.conf` are in the source,
   `akka-bbb-apps/src/universal/conf/application.conf:68,89 @ 35cad46a9f`).

## Using the reference in a golden case

A case `docker/tests/golden/<name>/` adds a `parity.yaml` (format: header of
`../golden/test-golden.sh`). `reference` is relative to the case directory; `rendered` is the
path below the render-only root, `reference` the path below the reference directory:

```yaml
reference: ../../parity/reference/bbb-web
files:
  - rendered: etc/bigbluebutton/bbb-web.properties
    reference: etc/bigbluebutton/bbb-web.properties
allowed:
  - file: etc/bigbluebutton/bbb-web.properties
    line: '^bigbluebutton\.web\.serverURL='
    reason: "example only: say why the container value differs from bare metal"
```

Every line that differs (from either side) must match an `allowed` entry of that file, every
entry needs a reason and must match at least one line. Rendered files at a different path than
on bare metal are mapped explicitly (`rendered:` and `reference:` differ). Do not edit
`reference/` by hand: change the script and regenerate.

# Presentation conversion regression suite

Black-box tests for BigBlueButton presentation conversion. The suite uploads fixture files through the API (`create` and `insertDocument`, as base64 documents or URLs), waits for the server to convert them, and checks what it produced: slide SVGs, thumbnails, text files, rejections and their error keys.

It runs on the BBB host itself, because it reads the converted files from `/var/bigbluebutton` and the conversion status from Postgres. It drives no browser and does not depend on bbb-web internals, so the same fixtures and goldens can later check a replacement converter (see `targets/`).

## What a run does

1. **Profile.** `profiles/<name>.properties` is written on top of `/etc/bigbluebutton/bbb-web.properties`, and bbb-web is restarted when that changes anything. `defaults` changes nothing.
2. **Convert** (Playwright project `convert`). Fixtures are grouped into meetings of at most 8 documents and uploaded. The harness waits until each fixture is converted, rejected (an error key in `pres_presentation`), dropped (no directory and no row after 90 s) or timed out. Every presentation directory is then copied to `work/<run>/<profile>/fixtures/<id>/server/`, with poppler renders of the uploaded PDF next to it.
3. **Verify** (project `verify`). One test per fixture outcome and one per page. The page checks are listed in `fixtures/README.md`.
4. **Summary.** `src/cli/summarize.ts` combines every profile into `results/summary.md` and `results/summary.json`.

## Outcomes

| Outcome | Meaning | Fails the run |
|---|---|---|
| pass | the check holds | no |
| known | the check fails and is listed in `known-failures.yaml` (the defaults do not suffice for this presentation) | no |
| fixed | the check passes but is still listed in `known-failures.yaml`: remove the entry | no, warning |
| measure | the fixture expects `measure`: behaviour is recorded, not asserted | no |
| regression | anything else that fails | yes |

## Running

On a BBB server, as a user with passwordless sudo (needed to switch profiles, stage URL documents and read Postgres):

```bash
cd bigbluebutton-tests/presentation-conversion
npm ci
bin/run-pass.sh defaults                 # one profile
bin/run-all.sh                           # defaults + every profile, then restore bbb-web.properties
PC_FIXTURES=repo-blur-image,pdf-exif-1-to-8 bin/run-pass.sh defaults   # a few fixtures
```

`BBB_URL` and `BBB_SECRET` are read from bbb-web's configuration when they are not set. Profile switches restart bbb-web, so `bin/apply-profile.sh` refuses to do it while meetings the suite did not create are running; set `PC_ALLOW_RESTART=1` to override.

A single `bin/run-pass.sh <profile>` leaves that profile active until `bin/restore-profile.sh` runs, and since the profile block is always rebuilt from the live `bbb-web.properties`, edits made to that file outside the suite are kept.

From a workstation, `bin/remote.sh user@host <command>` syncs the suite, plus the repository files its fixtures reference, to the server. It runs the command there and pulls back `results/`, `playwright-report/` and `goldens/`:

```bash
bin/remote.sh bigbluebutton@bbb.example.com bin/run-pass.sh defaults
```

Reports: `playwright-report/<profile>/index.html` shows each page rendered, its poppler reference, and the golden diff on failure. `results/summary.md` is the overview.

## Goldens

`goldens/<fixture>/<profile>/page-N.png|txt` and `thumb-N.png`. Slides are rasterized with resvg at 400 px width, so goldens do not depend on a browser build. A profile compares with the `defaults` goldens unless the fixture lists it in `goldenProfiles`.

```bash
bin/bless.sh defaults                               # write goldens from the server's current output
bin/bless.sh defaults pdf-exif-1-to-8               # only some fixtures
bin/bless.sh defaults --from-reference repo-x       # take the poppler render instead, when the current output is wrong
```

Review the HTML report before committing `goldens/`. In CI, the `bless` input of a manual run of the "Automated tests" workflow uploads proposed goldens as an artifact. Poppler, cairo, LibreOffice and font updates on the server can change rendering, so the summary prints the tool versions of every run.

## Adding a fixture

See `fixtures/README.md` for the manifest format and tiers. In short: add `fixtures/<tier>/<id>.yaml`, run `npm run lint:manifests`, run the fixture once with `expect: measure`, freeze the observed behaviour into the manifest, bless its goldens, and list it in `known-failures.yaml` with an issue link if the result is wrong today.

## In CI

The "Automated tests" workflow runs the job `install-and-run-presentation-conversion-tests` when:

- a pull request carries the label `trigger for presentation conversion test`. The label is read from the event that started the run, so add it and then push, or close and reopen the PR;
- a pull request or a push to a `*-develop` branch changes the conversion area (path list in `.github/scripts/presentation-conversion-gate.sh`);
- a push lands on a `*-release` branch;
- the workflow is started manually with `jobs: presentation-conversion`, which is how the weekly run starts it on each active branch.

The job summary carries `results/summary.md`; the artifact `presentation-conversion-report` holds the HTML reports and JSON results.

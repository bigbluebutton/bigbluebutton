# insert-pages annotation preservation - reproduction script

This is the end-to-end reproduction script for the annotation-preservation test
requested in PR #25380 review. It is **not** a Playwright `.spec.ts`
(Multi-Monitor fixture-based) test yet; it is the standalone Node script that
was used to capture the validation evidence shown in the PR, kept verbatim so
the bug can be reproduced deterministically against any from-source BBB 4.0
server running this feature branch.

## Scenario (reviewer-requested)

Validates that annotations created BEFORE an insert-pages operation are
preserved on their original slide after the insert shifts the slide's
position, and that a newly inserted blank slide can receive new
annotations:

1. On slide 1, create a text annotation `1a`.
2. Navigate to slide 2 and create a text annotation `2a`.
3. Navigate back to slide 1.
4. Insert a new blank page (becomes slide 2; the original slide 2 with
   `2a` shifts to slide 3).
5. Navigate to the inserted blank (slide 2).
6. Create a text annotation `1b` on the inserted blank.
7. Verify that annotation `1a` is displayed on slide 1.
8. Click "Next Slide" and verify that annotation `1b` is displayed on
   slide 2 (the inserted blank).
9. Click "Next Slide" again and verify that annotation `2a` is displayed
   on slide 3 (the original slide 2, shifted).

## Known result on this branch

All nine steps pass: annotation `1a` stays on slide 1, annotation `1b`
stays on the inserted blank (slide 2), and annotation `2a` is displayed
on slide 3 (the original slide 2, shifted by the insert). Annotation
preservation across the insert is provided by the backend changes in this
branch: inserted pages are spliced into the presentation by pageId instead
of physically renumbering the existing pages (commit e19b89371b), the
insert is persisted as a single transaction (commit ae8f840b6e), and the
page number unique constraint is deferrable so the renumber cannot collide
mid-transaction (commit 268068a794).

Capture note: after a slide navigation the tldraw base page can render
blank for a moment until its SVG background asset settles. This is a
pre-existing client rendering behavior, unrelated to the insert feature;
when collecting evidence, wait for the whiteboard content to render after
each navigation before taking a screenshot.

## Running

Requires a from-source BBB 4.0 server running this feature branch, an
API-Mate join URL for a presenter (with a 2+ page base presentation
preloaded), and a viewer join URL.

```bash
OUT_DIR=/tmp/out PRES_URL='https://<host>/bigbluebutton/api/...&join...' \
  REV_URL='https://<host>/bigbluebutton/api/...&join...' \
  node insert-pages-annotation-preservation.e2e.js
```

The script writes numbered screenshots (one per step) and a
`page-*.webm` video into `OUT_DIR`.

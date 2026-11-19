
## Overview

BigBlueButton 4.1 is under development. This page will list what is new in 4.1 as
features land on the `v4.1.x-develop` branch — it is intentionally sparse for now.

BigBlueButton 4.1 builds directly on BigBlueButton 4.0 and, like 4.0, runs on
Ubuntu 24.04. For everything that changed in 4.0 — the redesigned navigation
sidebar and Apps Gallery, LiveKit as the default media framework, the move to
Ubuntu 24.04, and the full list of API, `bigbluebutton.properties` and
`settings.yml` changes — see
[What's new in BigBlueButton 4.0](https://docs.bigbluebutton.org/4.0/new-features/).

Here's a breakdown of what's new in 4.1 so far.

### Engagement

#### Ask a participant to share their camera

BigBlueButton 4.1 lets a moderator **ask a participant to turn on their webcam**. With the new `allowModsToRequestCameraShare` option set to `true`, moderators get an *Ask to share camera* entry in the user list; the participant is prompted and may accept or decline. Accepting takes them through the regular camera sharing flow, so the webcam is never started without their consent — a moderator cannot turn on someone's camera remotely. The default (`false`) hides the option entirely. This can be set server-wide in bbb-web's properties or per meeting on the `create` call.

### Presentation pages have a fixed id

Each presentation page now has an id that never changes: a UUID, given to the page when it is converted. The page number only says where the page is in the presentation. Nothing changes for presenters and viewers, but integrations that read or build page ids need to be adjusted:

- The links to a slide's image, thumbnail, png and text use the page id instead of the page number, for example `.../svg/3f2b8c1e-5d4a-4f6b-9c7d-0e1a2b3c4d5e`. Links with a page number answer 404, and the page token is computed with the page id.
- Every request that names a page (changing the current page, annotating, zooming, the cursor) uses the page id. A page id built as `<presentationId>/<pageNumber>`, as before, is no longer recognized and the request has no effect.
- The new GraphQL action `presentationSetPageByNum(presentationId, pageNum, seenTotalPages)` changes to the page at a position. `seenTotalPages` is the total number of pages the client saw when it read that position (`0` when unknown).
- In recordings, `events.xml` identifies pages by their id (`GotoSlideEvent` `id`, whiteboard events `whiteboardId`, and the new `pageIds` element of `ConversionCompletedEvent`), and the published slide images and text files are named by it (`svgs/slide<pageId>.svg`, `textfiles/slide-<pageId>.txt`, `thumbnails/thumb-<pageId>.png`). Recordings made before this change are still processed as before.
- The presentation conversion cache is stored in a new form (`<hash>.v2.tar.gz`), so after the upgrade it starts empty.

#### Removed

- The bbb-web endpoints that counted the files of a presentation: `/bigbluebutton/presentation/{conference}/{room}/{presentationName}/slides`, `/thumbnails`, `/svgs` and `/textfiles`.

### bbb-web properties changes

#### Added

- `allowModsToRequestCameraShare` added (default `false`). When `true`, moderators may ask a participant to share their webcam; the participant accepts or declines.

## Development

For information on developing in BigBlueButton, see [setting up a development environment for 4.1](/development/guide).

The build scripts for packaging 4.1 (using fpm) are located in the GitHub repository [here](https://github.com/bigbluebutton/bigbluebutton/tree/v4.1.x-release/build).

## Contribution

We welcome contributors to BigBlueButton 4.1!  The best ways to contribute at the current time are:

- Help localize BigBlueButton on the [Transifex project for BigBlueButton](https://www.transifex.com/bigbluebutton/)
- Try out [installing BigBlueButton 4.1](/administration/install) and see if you spot any issues.
- Help test a [4.1 pull request](https://github.com/bigbluebutton/bigbluebutton/pulls?q=is%3Aopen+is%3Apr+milestone%3A%22Release+4.1%22) in your development environment.
  <!-- TODO create a GitHub label for contributions-welcome and link here -->

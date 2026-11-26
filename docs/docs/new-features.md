
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

#### Image paste in chat, shared notes, and whiteboard

Participants can now **paste (Ctrl+V) or drag-and-drop images** into the chat input, the BlockNote shared notes editor, and the whiteboard. Pasted images are uploaded once to a meeting-scoped storage, served behind the same authorization used for presentation slides, and survive recording/playback. In the chat, an attach button next to the emoji picker opens the file picker, and dropping files anywhere on the chat panel stages them too; several files can be staged at once, each is sent as its own message, and the typed text goes with the first one.

The feature is **disabled by default** on all three surfaces. Enable them via the per-surface client settings:

- `public.chat.imagePaste.enabled` (also requires `public.chat.markdownImageAllowed` for the server-side image rendering)
- `public.app.sharedNotes.imagePaste.enabled`
- `public.whiteboard.imagePaste.enabled`

…or disable any of them per meeting with the `chatImagePaste`, `sharedNotesImagePaste`, and `whiteboardImagePaste` values of `disabledFeatures`.

Shared limits (`public.fileUpload`) apply to all three surfaces: max file size 5 MB, max image dimensions 4096x4096 (anti pixel-bomb), allowed image types PNG/JPEG/GIF/WebP (SVG is rejected as an XSS vector), rate limit 60 uploads per 60 seconds per user+meeting, and 100 MB quota per meeting. Chat messages can also carry a PDF, MP4 or MP3 file: like images, its type is verified by magic bytes, and it is always served as a download. Administrators can restrict the list, never extend it.

**Breaking change to `markdownImageAllowed`:** before this feature, setting `public.chat.markdownImageAllowed` to `true` rendered any `![](url)` markdown as an `<img>`, including external URLs. To prevent IP-leak / tracking-pixel attacks against chat readers, external image URLs are now stripped on the server (only same-origin `/bigbluebutton/fileUpload/...` URLs render). Deployments that relied on external images in chat should host them on the BBB server instead.

In the chat, a message that carries a file shows it above its text: an image spans the message, with gray bands when its shape is not wide, and opens enlarged on click; any other file shows as a row with its name, size, type and a download button. Hovering any message with a file adds a download action to its toolbar, which saves the file under its original name. Replies and the pinned message show a thumbnail of the image, or an *[Attached file]* label for other files.

### Presentation pages have a fixed id

Each presentation page now has an id that never changes: a UUID, given to the page when it is converted. The page number only says where the page is in the presentation. Nothing changes for presenters and viewers, but integrations that read or build page ids need to be adjusted:

- The links to a slide's image, thumbnail, png and text use the page id instead of the page number, for example `.../svg/3f2b8c1e-5d4a-4f6b-9c7d-0e1a2b3c4d5e`. Links with a page number answer 404, and the page token is computed with the page id.
- Every request that names a page (changing the current page, annotating, zooming, the cursor) uses the page id. A page id built as `<presentationId>/<pageNumber>`, as before, is no longer recognized and the request has no effect.
- The new GraphQL action `presentationSetPageByNum(presentationId, pageNum, seenTotalPages)` changes to the page at a position. `seenTotalPages` is the total number of pages the client saw when it read that position (`0` when unknown).
- In recordings, `events.xml` identifies pages by their id, and the published slide images and text files are named by it. Recordings made before this change are still processed as before. See [Changes to events.xml](#changes-to-eventsxml).
- The presentation conversion cache is stored in a new form (`<hash>.v2.tar.gz`), so after the upgrade it starts empty.

#### Removed

- The bbb-web endpoints that counted the files of a presentation: `/bigbluebutton/presentation/{conference}/{room}/{presentationName}/slides`, `/thumbnails`, `/svgs` and `/textfiles`.

### Changes to events.xml

Recordings made with BigBlueButton 4.1 identify presentation pages by their page id. They are marked with `bbb_version="4.1.0"` on the `<recording>` element. The recording processing scripts read both forms, so recordings made with earlier versions are processed as before.

- `ConversionCompletedEvent`: new `pageIds` element, the comma-separated list of the page id of each page of the presentation, in page order.
- `GotoSlideEvent`: the `id` element contains the page id; it was `<presentationName>/<pageNumber>`. The `slide` element is unchanged (0-based page number).
- `ResizeAndMoveSlideEvent`: the `id` element contains the page id; it was `<presentationName>/<pageNumber>`.
- Whiteboard events (`module="WHITEBOARD"`, for example `AddTldrawShapeEvent`, `DeleteTldrawShapeEvent` and `WhiteboardCursorMoveEvent`): the `whiteboardId` element contains the page id; it was `<presentationName>/<pageNumber>`. The `pageNumber` element is unchanged (0-based page number).

The presentation files of a recording are named by the page id instead of the 1-based page number:

| File | BigBlueButton 4.1 | Before |
| ---- | ----------------- | ------ |
| Slide image | `presentation/{presentationName}/svgs/slide{pageId}.svg` | `presentation/{presentationName}/svgs/slide{pageNumber}.svg` |
| Slide text | `presentation/{presentationName}/textfiles/slide-{pageId}.txt` | `presentation/{presentationName}/textfiles/slide-{pageNumber}.txt` |
| Thumbnail | `presentation/{presentationName}/thumbnails/thumb-{pageId}.png` | `presentation/{presentationName}/thumbnails/thumb-{pageNumber}.png` |

The keys of `presentation_text.json` follow the text file names (`slide-{pageId}`). See [Page ids in recordings](/development/recording#page-ids-in-recordings) for the details of each event.

### Installation

#### Docker Compose

BigBlueButton 4.1 can run on one server with Docker Compose, from container images built in the BigBlueButton repository, as an alternative to the package install. See [Install with Docker Compose](/administration/docker-compose).

#### Environment variables

bbb-graphql-middleware, bbb-shared-notes-server, bbb-export-annotations and the recording processing read their addresses, ports and passwords also from environment variables, which win over their configuration files. On a package install they are unset and nothing changes; the variables are listed in [docker/README.md](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-develop/docker/README.md#environment-variables).

### Removal of old raw recordings

On a package install, the daily cleanup (`/etc/cron.daily/bigbluebutton`) removes the raw files of a recording after `published_days` once every format in the recording `steps` is published. Before, it waited for every installed format, so a playback format that was installed but not in the steps kept every raw recording. A server that has such a format now removes the raw files of recordings published only in the formats of the steps; to keep them, add the format to the steps or raise `published_days`.

### bbb-graphql-server unit

The unit `bbb-graphql-server@.service` now sets `HASURA_GRAPHQL_BBB_DATABASE_URL`, the database of the BigBlueButton source in Hasura's metadata. If you keep a copy of the unit in `/etc/systemd/system`, it hides the packaged one and the metadata is inconsistent after the upgrade: remove the copy, or set the variable in `/etc/bigbluebutton/bbb-graphql-server.env`. `bbb-conf --check` warns about it.

### bbb-web properties changes

#### Added

- `allowModsToRequestCameraShare` added (default `false`). When `true`, moderators may ask a participant to share their webcam; the participant accepts or declines.

### Override file location changes

- bbb-export-annotations now reads its settings from `config/default.json`, then the override `/etc/bigbluebutton/bbb-export-annotations/production.json`, then environment variables. In 4.0 there was no override file: a change made in `/usr/local/bigbluebutton/bbb-export-annotations/config/settings.json` is replaced on the upgrade to 4.1, so make it again in `/etc/bigbluebutton/bbb-export-annotations/production.json`. (Development builds of 4.1 had the override at `/etc/bigbluebutton/bbb-export-annotations.json`; the package moves it.)

## Development

For information on developing in BigBlueButton, see [setting up a development environment for 4.1](/development/guide).

The build scripts for packaging 4.1 (using fpm) are located in the GitHub repository [here](https://github.com/bigbluebutton/bigbluebutton/tree/v4.1.x-release/build).

## Contribution

We welcome contributors to BigBlueButton 4.1!  The best ways to contribute at the current time are:

- Help localize BigBlueButton on the [Transifex project for BigBlueButton](https://www.transifex.com/bigbluebutton/)
- Try out [installing BigBlueButton 4.1](/administration/install) and see if you spot any issues.
- Help test a [4.1 pull request](https://github.com/bigbluebutton/bigbluebutton/pulls?q=is%3Aopen+is%3Apr+milestone%3A%22Release+4.1%22) in your development environment.
  <!-- TODO create a GitHub label for contributions-welcome and link here -->

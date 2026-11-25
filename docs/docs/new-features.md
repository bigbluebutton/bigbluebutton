
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
- In recordings, `events.xml` identifies pages by their id, and the published slide images and text files are named by it. Recordings made before this change are still processed as before. See [Changes to events.xml](#changes-to-eventsxml).
- The presentation conversion cache is stored in a new form (`<hash>.v2.tar.gz`), so after the upgrade it starts empty.

#### Removed

- The bbb-web endpoints that counted the files of a presentation: `/bigbluebutton/presentation/{conference}/{room}/{presentationName}/slides`, `/thumbnails`, `/svgs` and `/textfiles`.

### Changes to events.xml

Recordings made with BigBlueButton 4.1 identify presentation pages by their page id. They are marked with `bbb_version="4.1.0"` on the `<recording>` element. The recording processing scripts read both forms, so recordings made with earlier versions are processed as before.

- `ConversionCompletedEvent`: new `pageIds` element, the comma-separated list of the page id of each page of the presentation, in page order.
- `PresentationPagesInsertedEvent` (new): recorded when pages are inserted into a presentation; its `pageIds` element lists every page of the presentation after the insert, in page order.
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

### Insert pages into a presentation

The presenter can insert pages into the open presentation: a blank page, or the pages of a PDF or an office document, at a position. The existing pages keep their annotations, and the presenter is notified of the outcome. Pages can only be inserted into a presentation made from a PDF or an office document, and an image cannot be inserted.

- The client setting `public.presentation.insertPagesEnabled` enables or blocks, on the server, any insert of pages (default `true`; absent counts as `false`). Like any client setting, it can be changed per meeting on the `create` call (`clientSettingsOverride`).
- `maxNumPages` (bbb-web) also limits the number of pages of a presentation after an insert.
- The GraphQL action `presentationRequestUploadToken` takes the optional arguments `insertIntoPresentationId`, `insertAtPosition`, `insertSeenTotalPages` and `insertNavigate`, which turn the upload into an insert into that presentation. The new action `presentationInsertBlankPage(presentationId, position, seenTotalPages, navigate)` inserts a blank page the size of the page before the position. `seenTotalPages` is the total number of pages the client saw when it read the position. The server applies the inserts of a meeting one at a time, in the order of the requests.
- Each stage of an insert has a deadline in bbb-apps-akka; see [the configuration](/administration/customize#limit-the-time-an-insert-of-pages-may-take).
- The PDF of each page of a presentation made from a PDF or an office document is kept, as `pages/page-<pageId>.pdf` in the directory of the presentation, and the conversion cache stores it. The annotated export and a breakout room with the current slide read the page from it; for a big page that is the downscaled version made at conversion.

### bbb-web properties changes

#### Added

- `allowModsToRequestCameraShare` added (default `false`). When `true`, moderators may ask a participant to share their webcam; the participant accepts or declines.

### Override file location changes

- The override file for bbb-export-annotations was moved from `/etc/bigbluebutton/bbb-export-annotations.json` to `/etc/bigbluebutton/bbb-export-annotations/production.json`

## Development

For information on developing in BigBlueButton, see [setting up a development environment for 4.1](/development/guide).

The build scripts for packaging 4.1 (using fpm) are located in the GitHub repository [here](https://github.com/bigbluebutton/bigbluebutton/tree/v4.1.x-release/build).

## Contribution

We welcome contributors to BigBlueButton 4.1!  The best ways to contribute at the current time are:

- Help localize BigBlueButton on the [Transifex project for BigBlueButton](https://www.transifex.com/bigbluebutton/)
- Try out [installing BigBlueButton 4.1](/administration/install) and see if you spot any issues.
- Help test a [4.1 pull request](https://github.com/bigbluebutton/bigbluebutton/pulls?q=is%3Aopen+is%3Apr+milestone%3A%22Release+4.1%22) in your development environment.
  <!-- TODO create a GitHub label for contributions-welcome and link here -->

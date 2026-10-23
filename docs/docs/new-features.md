
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

Shared limits (`public.fileUpload`) apply to all three surfaces: max file size 5 MB, max image dimensions 4096x4096 (anti pixel-bomb), allowed types PNG/JPEG/GIF/WebP (SVG is rejected as an XSS vector), rate limit 60 uploads per 60 seconds per user+meeting, and 100 MB quota per meeting.

**Breaking change to `markdownImageAllowed`:** before this feature, setting `public.chat.markdownImageAllowed` to `true` rendered any `![](url)` markdown as an `<img>`, including external URLs. To prevent IP-leak / tracking-pixel attacks against chat readers, external image URLs are now stripped on the server (only same-origin `/bigbluebutton/fileUpload/...` URLs render). Deployments that relied on external images in chat should host them on the BBB server instead.

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

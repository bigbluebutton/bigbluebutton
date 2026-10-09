
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

### Recording

#### Caption tracks name the speaker

Live captions (automatic transcription and typed captions) are recorded per utterance: every caption segment is stored with its speaker, language and text, and the caption track of a recording names the speaker (`Alice: ...`) whenever the speaker changes. Several participants speaking the same language at the same time no longer garble the track; earlier versions kept one shared text per language and appended the other speaker's words again at every turn. Typed captions, for example from caption plugins, are now part of the recording too.

Speaker names follow the chat anonymization settings of the recording (`anonymize_chat` and `anonymize_chat_moderators` in `bigbluebutton.yml`, or the `meta_bbb-anonymize-chat` and `meta_bbb-anonymize-chat-moderators` create parameters).

#### Caption track API and uploads

The live caption tracks returned by `getRecordingTextTracks` can now be downloaded: the recording stores them as `captions_<lang>.vtt`, the name the API links to. Tracks uploaded with `putRecordingTextTrack` now show up in the presentation playback; the upload handler (`bbb-rap-caption-inbox`) used to fail on every upload and stop.

For recordings processed before the upgrade, rename the live tracks once to make their API links work:

```bash
cd /var/bigbluebutton/captions
for f in */caption_*.vtt; do mv -n "$f" "${f%/*}/captions_${f#*/caption_}"; done
```

#### events.xml

Recordings made with 4.1 contain `CaptionUpdatedEvent` (module `CAPTION`; one event per update of a caption segment, with `captionId`, `userId`, `locale`, `captionType`, `text` and `isFinal`) instead of `EditCaptionHistoryEvent`. Recordings from earlier versions are processed as before.

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

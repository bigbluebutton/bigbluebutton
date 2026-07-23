
![BigBlueButton 4.0 runs on Ubuntu 24.04](/img/40_BBB_header.png)

## Overview

BigBlueButton 4.0 offers users improved usability and increased engagement.

- **Usability** - making common functions (such as raising a hand) easier
- **Engagement** - giving the instructor more ways to engage students

The most visible change in 4.0 is a redesigned client interface built around a new navigation sidebar and an Apps Gallery. Under the hood, 4.0 moves to Ubuntu 24.04 and continues the modernization of the codebase that began in 3.0.

Here's a breakdown of what's new in 4.0.

### Usability

#### Redesigned navigation sidebar and Apps Gallery

The client's left-hand navigation has been redesigned into a dedicated navigation sidebar with a cleaner set of buttons (user list, chat, shared notes, timer, settings, and more), notification indicators, and a participant-count badge on the user list button.

Alongside it, a new **Apps Gallery** brings together apps such as Polls, Breakout Rooms, Timer, and Audio Captions — as well as plugins. Frequently used apps can be **pinned**, and pinned apps are persisted and cached across sessions. Recently added apps can be highlighted with a "new" ribbon. The gallery can be **searched**, switched between **list and grid views** (the choice is remembered, and mobile defaults to the list view), and pinned apps can be managed directly from the gallery.

<!-- TODO add screenshot of the new navigation sidebar and Apps Gallery -->

The number of apps that can be pinned is controlled by `public.app.appsGallery.maxPinnedApps` (default `3`), and which apps show the "new" label is controlled by `public.sidebarNavigation.appsToLabelAsNew` in `settings.yml`. Which built-in buttons appear in the sidebar, in which section, and in what order is controlled by `public.sidebarNavigation.buttons` (see the client-settings changes below). The sidebar navigation can be hidden per user with the join parameter `userdata-bbb_hide_sidebar_navigation`.

#### Search the user list

Moderators and viewers can now search the user list in real time. The search supports full-text and reverse matching and includes the current user in the results, and it also filters the **raised-hands** and **waiting-guest** sections. It can be toggled with `public.userList.searchBar.enabled` (default `true`), and the page size of the user list is configurable via `public.layout.usersPerUserListPage` (default `50`).

<!-- TODO add screenshot of the user list search -->

#### Redesigned timer

The timer received a new design and an improved input experience, including one-click **presets** and **quick-add buttons**. The available values are configurable in `settings.yml` (`public.timer.presets`, `public.timer.quickAddButtons`, `public.timer.maxHours`).

#### Redesigned guest management panel

Guest management now lives in a dedicated panel integrated with the user list. Moderators approving or denying guests in the waiting panel can use a new **"Remember Choice"** option to apply the same decision to subsequent join requests. The input for messaging the waiting room now gives visual send-state feedback so moderators can tell their message was delivered.

<!-- TODO add screenshot of the guest management panel -->

#### Redesigned permissions (lock viewers) modal

The "Lock viewers" / permissions modal was redesigned with a tabbed layout, and the toggle switches were replaced with checkboxes to make the "restrict" action clearer. The modal now warns about unsaved changes before closing. It also surfaces the new presenter policy described under [Request to Present](#request-to-present).

#### "Musician Mode" audio processing

BigBlueButton 4.0 introduces an optional WASM-based audio processor (internally "BBBA") that runs on top of the microphone stream. Exposed to users as **"Musician Mode"**, it provides an alternative to the browser's built-in audio processing for scenarios such as sharing music. It is disabled by default. See [Musician Mode (WASM audio processing)](/administration/customize#musician-mode-wasm-audio-processing) for configuration details.

#### Wrong-microphone alert for live captions

When browser-based (WebSpeech) live captions are enabled and a user holds the audio floor but no transcription is produced for a short while, BigBlueButton now shows a toast suggesting the wrong microphone may be selected or the environment is too noisy. The alert can optionally link to a knowledge-base article and is configurable via `public.app.audioCaptions.microphoneAlert` in `settings.yml`.

<!-- TODO add screenshot of the wrong-microphone caption alert -->

### Engagement

#### Request to Present

Viewers can now actively **request the presenter role** instead of waiting for a moderator to assign it. When a viewer requests to present, moderators see the request and can approve or deny it; the requesting viewer sees a waiting state and a notification if the request is denied.

This behavior is governed by a new presenter policy, configurable per meeting via the `lockSettingsPresenterPolicy` create parameter and the server default `lockSettingsPresenterPolicy` in bbb-web's properties. The accepted values are:

- `moderatorOnly` - only moderators can assign the presenter.
- `requireApproval` (default) - viewers can request to present, and a moderator must approve.
- `freeForAll` - viewers can take the presenter role without approval.

<!-- TODO add screenshot of the Request to Present flow -->

#### Pinned chat messages

Moderators can now **pin a chat message** so it stays prominently visible to everyone in the meeting. Pinning is exposed through the chat message toolbar (the new `pin` option in `public.chat.toolbar`) and can be disabled per meeting with the `pinChatMessage` value of `disabledFeatures`.

<!-- TODO add screenshot of a pinned chat message -->

#### Ask for consent before unmuting

When `allowModsToUnmuteUsers` is enabled, BigBlueButton 4.0 can optionally ask the participant for **consent before a moderator unmutes them**. With the new `requireUserConsentBeforeUnmuting` option set to `true`, a consent dialog is shown to the user instead of the microphone being unmuted directly. The default (`false`) preserves the legacy behavior. This can be set server-wide in bbb-web's properties or per meeting on the `create` call.

#### Multi-Functional Mode (auxiliary sidebar)

A new **Multi-Functional Mode** adds an auxiliary sidebar content panel, allowing a second panel to be open alongside the primary one (for example, chat and the user list at the same time). It is disabled by default and enabled with `public.multiFunctionalMode.enabled` in `settings.yml`, and it can be disabled per meeting with the `multiFunctionalMode` value of `disabledFeatures`.

#### Larger emoji-only chat messages (jumbomoji)

A chat message that contains only emoji (up to three emoji, whitespace ignored) is now rendered at a larger font size — matching the "jumbomoji" behavior familiar from popular messengers. Messages with any accompanying text keep the normal size.

<!-- TODO add screenshot of a jumbomoji chat message -->

<!-- ### Analytics -->

### Behind the scenes

#### Client re-architecture and TypeScript migration

The client UI continued its migration to TypeScript, and large parts of the navigation, sidebar, and actions bar were rebuilt. The old "Action Button Dropdown" was replaced by a new **Media Area** component in the actions bar, and a new icon library was introduced.

#### Bot user support

The client now has first-class handling for **bot users** (joined with `bot=true`). Bots are excluded from the grid layout and screenshare UI, can be given a dedicated user-list label, and skip the logout-URL redirection when the meeting ends.

#### Server messages internationalized on the frontend

Strings that were previously emitted as English constants from the server (Akka) — for example some chat/notification messages — are now resolved to i18n keys on the frontend, improving localization coverage.

### Media

#### LiveKit is the default media framework

BigBlueButton 4.0 uses [LiveKit](https://livekit.io/) as the default media framework
for audio, camera video, and screen sharing. The previous mediasoup/bbb-webrtc-sfu
stack (and FreeSWITCH for audio) stays installed and fully supported as an
alternative bridge. For an in-depth overview of this initiative, please refer to
[issue 21059](https://github.com/bigbluebutton/bigbluebutton/issues/21059).

The bbb-livekit package (livekit-server and livekit-sip) is installed by default and
the LiveKit module in bbb-webrtc-sfu is enabled out of the box.

When using BigBlueButton via the [cluster proxy](/administration/cluster-proxy)
configuration, set the LiveKit endpoint URL in bbb-html5.yml's
`public.media.livekit.url`. See the
[cluster proxy docs](/administration/cluster-proxy.md#bigbluebutton-servers) for details.

We also *strongly recommend* setting up network interface filtering in LiveKit.
While optional, this speeds up negotation times and works around an issue with the latest
LiveKit versions that might cause CPU spikes if there's no filtering in place.
To set up network interface filtering:
1. Gather relevant network interfaces names to be used for media communication.
For most setups, the default network interface is enough. See the `route` command
to find it (`Destination: default`). If any other network interfaces are needed,
make note of them.
2. Set the following in `/etc/bigbluebutton/livekit.yaml`:
```yaml
rtc:
  interfaces:
    includes:
      - <network_interface_name_1>
      - <any_other_network_interface_name>
```
3. Restart livekit-server: `$ sudo systemctl restart livekit-server`

Each media type defaults to `livekit` and can be pointed at the legacy stack
instead, per meeting or server-wide:
- Per meeting: set any of the following meeting `/create` parameters
  - `audioBridge=bbb-webrtc-sfu` (or `freeswitch`)
  - `cameraBridge=bbb-webrtc-sfu`
  - `screenShareBridge=bbb-webrtc-sfu`
- Server-wide: set any of the following properties in `/etc/bigbluebutton/bbb-web.properties`
  - `audioBridge=bbb-webrtc-sfu`
  - `cameraBridge=bbb-webrtc-sfu`
  - `screenShareBridge=bbb-webrtc-sfu`

Those parameters do *not* need to be set concurrently. The legacy framework can be
used for audio only, for example, while keeping LiveKit for camera and screen
sharing by setting just `audioBridge=bbb-webrtc-sfu`.

As of BigBlueButton v3.0.7, recording is enabled by default for LiveKit sessions
via the bbb-webrtc-recorder application. If `livekit/egress` was previously
installed in a server, any steps done to enable it should be reverted. Refer to
the [previous installations steps](https://github.com/bigbluebutton/bigbluebutton/blob/6eab874ffa8d0e82453dad3b06621dea16e15e6d/docs/docs/new-features.md?plain=1#L209-L237).

We encourage users to provide feedback via our GitHub issue tracker or the mailing
lists.


### Upgraded components

Under the hood, BigBlueButton 4.0 installs on Ubuntu 24.04 64-bit, and the following key components have been upgraded
- Java 21 (OpenJDK)
- Grails 7.0.8
- Gradle 8.14.3
- Groovy 4.0.21
- Spring 6.2.11
- Spring Boot 3.5.16

For full details on what is new in BigBlueButton 4.0, see the release notes.


Recent releases:

- [4.0.0-beta.3](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v4.0.0-beta.3)
- [3.1.0-beta.2](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.1.0-beta.2)
- [3.1.0-beta.1](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.1.0-beta.1)

### Other notable changes

#### Promoted BlockNote shared notes as default

In BigBlueButton 4.0.0-beta.4 we replaced the default choice for Shared Notes component from `bbb-etherpad` (i.e. Etherpad) to `bbb-shared-notes-server` (i.e. BlockNote). This means that `bbb-shared-notes-server` is now a required package, installed by default while `bbb-etherpad` and `bbb-pads` are now optional.
In the event that you prefer using Etherpad, install the optional packages via

`$ sudo apt install bbb-pads bbb-etherpad`

At this point you can use it in a specific session by passing `sharedNotesEditor=etherpad` on the `/create` call. If you have made up your mind and would like to use it for all sessions, add the same line (`sharedNotesEditor=etherpad`) to `/etc/bigbluebutton/bbb-web.properties` and restart BigBlueButton via `$ sudo bbb-conf --restart`


#### Removing deprecated layout options

The layout system has been simplified to use a single unified layout. The following layouts have been removed: `CUSTOM_LAYOUT`, `SMART_LAYOUT`, `PRESENTATION_FOCUS`, and `VIDEO_FOCUS`. The default layout is now `UNIFIED_LAYOUT`.

The layout selection modal and the push layout button have also been removed. The `showPushLayoutButton`, `showPushLayoutToggle`, and `enableDeprecatedLayoutSelection` settings are no longer available.

The `layouts` option has been removed from `disabledFeatures`.

#### Removed REST endpoint

The deprecated REST endpoint `/api/rest/clientSettings` has been removed. Client settings are now served through the GraphQL stack. Any integration that fetched client settings from that endpoint should be updated.

#### Other removed configuration

- `public.stats.log` was removed and replaced by `public.stats.logMediaStats` (see [Client-side WebRTC stats logging](#client-side-webrtc-stats-logging)).

### Changes to events.xml


### bbb-web properties changes

#### Removed

- `lockSettingsDisableNote` is no longer recognized; use `lockSettingsDisableNotes` instead. The singular property was renamed in BBB 2.5.

#### Value changed

- `defaultMeetingLayout` default changed from `CUSTOM_LAYOUT` to `UNIFIED_LAYOUT`. Accepted values are now `UNIFIED_LAYOUT` (default), plus the hybrid/niche options `CAMERAS_ONLY`, `PARTICIPANTS_AND_CHAT_ONLY`, `PRESENTATION_ONLY`, and `MEDIA_ONLY`. The previous values `CUSTOM_LAYOUT`, `SMART_LAYOUT`, `PRESENTATION_FOCUS`, and `VIDEO_FOCUS` are no longer accepted.
- `html5PluginSdkVersion` bumped from `0.1.17` to `0.1.20`.
- `disabledFeatures` accepts a new value: `pinChatMessage` (alongside the existing chat-related options).
- `sharedNotesEditor` default changed from `etherpad` to `blockNote` (BlockNote is now the default shared-notes editor; see [Promoted BlockNote shared notes as default](#promoted-blocknote-shared-notes-as-default)).
- `cameraBridge`, `screenShareBridge`, and `audioBridge` default changed from `bbb-webrtc-sfu` to `livekit` (see [LiveKit is the default media framework](#livekit-is-the-default-media-framework)).

#### Added
- `pluginManifestFetchTimeout` added
- `pluginManifestsFetchUrlResponseTimeout` added
- `maxPluginManifestsFetchUrlPayloadSize` added
- `numPluginManifestsFetchingThreads` added
- `extractTimeoutInMs` added
- `pngCreationExecTimeoutInMs` added, later (BBB 3.0.17) renamed to `pngCreationExecTimeout`
- `pngCreationExecTimeout` added (used to be `pngCreationExecTimeoutInMs`)
- `thumbnailCreationExecTimeoutInMs` added, later (BBB 3.0.17) renamed to `thumbnailCreationExecTimeout`
- `thumbnailCreationExecTimeout` added (used to be `thumbnailCreationExecTimeoutInMs`)
- `pdfPageDownscaleExecTimeoutInMs` added
- `officeDocumentValidationExecTimeoutInMs` added
- `textFileCreationExecTimeoutInMs` added, later (BBB 3.0.17) renamed to `textFileCreationExecTimeout`
- `textFileCreationExecTimeout` added (used to be `textFileCreationExecTimeoutInMs`)
- `presDownloadReadTimeoutInMs` added
- `pngCreationConversionTimeout` added
- `imageResizeWait` added
- `officeDocumentValidationTimeout` added
- `presOfficeConversionTimeout` added
- `pdfPageCountWait` added
- `detectImageDimensionsTimeout` added
- `presentationConversionCacheEnabled` added
- `presentationConversionCacheS3AccessKeyId` added
- `presentationConversionCacheS3AccessKeySecret` added
- `presentationConversionCacheS3BucketName` added
- `presentationConversionCacheS3Region` added
- `presentationConversionCacheS3EndpointURL` added
- `presentationConversionCacheS3PathStyle` added
- `cameraBridge` added
- `screenShareBridge` added
- `audioBridge` added
- `pluginManifests` added
- `scanUploadedPresentationFiles` added
- `allowOverrideClientSettingsOnCreateCall` added
- `defaultBotAvatarURL` added
- `graphqlApiUrl` added
- `graphqlWebsocketUrl` added
- `sessionsCleanupDelayInMinutes` added
- `useDefaultDarkLogo` added
- `defaultDarkLogoURL` added
- `maxNumPages` added
- `fetchUrlAllowedLocalHosts` added
- `clientSettingsOverrideJsonUrlResponseTimeout` added
- `maxClientSettingsOverrideJsonUrlPayloadSize` added
- `pageTokenSecret` added in BBB 3.0.27
- `beans.presentationService.pageTokenSecret` added in BBB 3.0.27
- `pluginManifestCacheEnabled` added in BBB 3.0.27
- `pluginManifestCacheDirectory` added in BBB 3.0.27
- `pluginManifestCacheRefreshIntervalMinutes` added in BBB 3.0.27
- `clientSettingsOverrideStrictValidation` added in BBB 3.0.30
- `clientSettingsFilePath` added in BBB 3.0.30

- `lockSettingsPresenterPolicy` added (default `requireApproval`).
- `requireUserConsentBeforeUnmuting` added (default `false`). Only relevant when `allowModsToUnmuteUsers=true`; when `true`, a consent dialog is shown before a moderator can unmute a participant.


### Client settings (settings.yml) changes

These changes apply to the client configuration file (`/etc/bigbluebutton/bbb-html5.yml`, overriding the defaults in `settings.yml`).

#### Added

- `public.multiFunctionalMode.enabled` (default `false`) - enables the auxiliary/dual sidebar content panel.
- `public.userList.searchBar.enabled` (default `true`) - enables the user list search field.
- `public.app.appsGallery.maxPinnedApps` (default `3`) - maximum number of apps a user can pin in the Apps Gallery.
- `public.sidebarNavigation.appsToLabelAsNew` (default `[]`) - apps to highlight with a "new" label (e.g. `poll`, `breakoutroom`, `timer`, `audio-captions`).
- `public.media.audio.audioWasmProcessing` - configuration block for "Musician Mode" (WASM/BBBA audio processing), plus the per-user default `public.app.defaultSettings.application.audioWasmProcessing`.
- `public.timer.presets`, `public.timer.quickAddButtons`, `public.timer.maxHours`, `public.timer.serverSyncTimeInterval` - timer presets and behavior.
- `public.app.breakouts.breakoutRoomMinimum` (default `2`) - minimum number of breakout rooms.
- `public.app.audioCaptions.showInSidebarNavigation` and `public.app.audioCaptions.terms` - show captions in the sidebar navigation and configure terms-of-service URLs per locale.
- `public.stats.logMediaStats` and `public.stats.probes` - client-side WebRTC stats logging.
- `public.layout.showLeaveSessionLabel` (default `false`) and `public.layout.usersPerUserListPage` (default `50`).
- `public.sidebarNavigation.buttons` - controls which built-in sidebar navigation buttons render, in which section (`top`/`center`/`bottom`) and in what order. It is a full replacement list (omit an id to hide that button; ids introduced by future upstream versions must be added back manually). Defaults: `top: [profile, user-list, chat, notes]`, `center: [apps-gallery, pinned-apps]`, `bottom: [audio-captions, learning-dashboard, settings]`.
- `public.app.audioCaptions.microphoneAlert` (default `enabled: true`) - shows a warning when WebSpeech live captions are on and the user holds the floor but nothing is being transcribed (a likely wrong-microphone / noisy-environment signal). Configurable via `helpLink` (empty hides the link), `threshold` (dB), `speakingThreshold` (ms), `duration` (ms; `0` = manual dismiss) and `interval` (ms).
- `public.plugins[].settings.pin` / `.isNew` - a plugin can default-pin the items it injects into the Apps Gallery (`pin: true` pins all injected items; `pin: ["id-a", "id-b"]` pins only those ids; user pin/unpin choices are persisted and respected), and `isNew: true` shows the "new" ribbon on the plugin's gallery item.

#### Value changed

- `public.chat.toolbar` now includes a `pin` option (for pinning chat messages).
- `public.layout.showParticipantsOnLogin` default changed from `true` to `false`.
- `public.layout.syncCameraDockSizeAndPosition` default changed from `false` to `true`.
- The default layout under `defaultSettings` moved from `application.selectedLayout: 'custom'` to `layout.selectedLayout: 'unified'` (with `pushLayout` now nested under `layout`).
- `public.userCamera`'s display labels now include `presenter` and `bot`, and `moderator` defaults to `true`.
- `public.media.audio.defaultFullAudioBridge` and `public.media.audio.defaultListenOnlyBridge` defaults changed from `fullaudio` to `livekit`, aligning the client fallbacks with LiveKit as the default media framework. (`defaultFullAudioBridge` is superseded by the `audioBridge` create/property setting; both keys are marked deprecated.)

#### Removed

- `public.layout.showPushLayoutButton`, `public.layout.showPushLayoutToggle`, and `public.layout.enableDeprecatedLayoutSelection`.
- `public.stats.log` (replaced by `public.stats.logMediaStats`).
- The SIP.js / legacy-audio client settings, removed together with the SIP.js audio bridge now that LiveKit is the default audio path. Under `public.media`: `callTransferTimeout`, `callHangupTimeout`, `callHangupMaximumRetries`, `iceGatheringTimeout`, `audioConnectionTimeout`, `audioReconnectionDelay`, `audioReconnectionAttempts`, `sipjsHackViaWs`, `sipjsAllowMdns`, `sip_ws_host`, `websocketKeepAliveInterval`, `websocketKeepAliveDebounce`, `traceSip`, `sdpSemantics`; plus `public.app.ipv4FallbackDomain`. Any of these still set in `bbb-html5.yml` are now silently ignored.

## Development

For information on developing in BigBlueButton, see [setting up a development environment for 4.0](/development/guide).

The build scripts for packaging 4.0 (using fpm) are located in the GitHub repository [here](https://github.com/bigbluebutton/bigbluebutton/tree/v4.0.x-release/build).

## Contribution

We welcome contributors to BigBlueButton 4.0!  The best ways to contribute at the current time are:

- Help localize BigBlueButton 4.0 on [Transifex project for BBB 4.0](https://www.transifex.com/bigbluebutton/bigbluebutton-v40-html5-client/dashboard/)
- Try out [installing BigBlueButton 4.0](/administration/install) and see if you spot any issues.
- Help test a [4.0 pull request](https://github.com/bigbluebutton/bigbluebutton/pulls?q=is%3Aopen+is%3Apr+milestone%3A%22Release+4.0%22) in your development environment.
  <!-- TODO create a GitHub label for contributions-welcome and link here -->

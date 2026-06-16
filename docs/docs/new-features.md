
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

Alongside it, a new **Apps Gallery** brings together apps such as Polls, Breakout Rooms, Timer, and Audio Captions — as well as plugins. Frequently used apps can be **pinned**, and pinned apps are persisted and cached across sessions. Recently added apps can be highlighted with a "new" ribbon.

<!-- TODO add screenshot of the new navigation sidebar and Apps Gallery -->

The number of apps that can be pinned is controlled by `public.app.appsGallery.maxPinnedApps` (default `3`), and which apps show the "new" label is controlled by `public.sidebarNavigation.appsToLabelAsNew` in `settings.yml`. The sidebar navigation can be hidden per user with the join parameter `userdata-bbb_hide_sidebar_navigation`.

#### Search the user list

Moderators and viewers can now search the user list in real time. The search supports full-text and reverse matching and includes the current user in the results. It can be toggled with `public.userList.searchBar.enabled` (default `true`), and the page size of the user list is configurable via `public.layout.usersPerUserListPage` (default `50`).

<!-- TODO add screenshot of the user list search -->

#### Redesigned timer

The timer received a new design and an improved input experience, including one-click **presets** and **quick-add buttons**. The available values are configurable in `settings.yml` (`public.timer.presets`, `public.timer.quickAddButtons`, `public.timer.maxHours`).

#### Redesigned guest management panel

Guest management now lives in a dedicated panel integrated with the user list. Moderators approving or denying guests in the waiting panel can use a new **"Remember Choice"** option to apply the same decision to subsequent join requests.

<!-- TODO add screenshot of the guest management panel -->

#### Redesigned permissions (lock viewers) modal

The "Lock viewers" / permissions modal was redesigned with a tabbed layout, and the toggle switches were replaced with checkboxes to make the "restrict" action clearer. The modal now warns about unsaved changes before closing. It also surfaces the new presenter policy described under [Request to Present](#request-to-present).

#### "Musician Mode" audio processing

BigBlueButton 4.0 introduces an optional WASM-based audio processor (internally "BBBA") that runs on top of the microphone stream. Exposed to users as **"Musician Mode"**, it provides an alternative to the browser's built-in audio processing for scenarios such as sharing music. It is disabled by default. See [Musician Mode (WASM audio processing)](/administration/customize#musician-mode-wasm-audio-processing) for configuration details.

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

<!-- ### Analytics -->

### Behind the scenes

#### Client re-architecture and TypeScript migration

The client UI continued its migration to TypeScript, and large parts of the navigation, sidebar, and actions bar were rebuilt. The old "Action Button Dropdown" was replaced by a new **Media Area** component in the actions bar, and a new icon library was introduced.

#### Bot user support

The client now has first-class handling for **bot users** (joined with `bot=true`). Bots are excluded from the grid layout and screenshare UI, can be given a dedicated user-list label, and skip the logout-URL redirection when the meeting ends.

#### Server messages internationalized on the frontend

Strings that were previously emitted as English constants from the server (Akka) — for example some chat/notification messages — are now resolved to i18n keys on the frontend, improving localization coverage.


### Experimental

#### Integration with LiveKit

We have added initial support for LiveKit as a media framework for BigBlueButton.
It's an experimental feature and, consequently, disabled by default.
For an in-depth overview of this initiative, please refer to [issue 21059](https://github.com/bigbluebutton/bigbluebutton/issues/21059).
Feature parity with the current media framework is not yet achieved, but the
aforementioned issue provides parity tracking in section `Annex 1`.

To enable support for LiveKit:
1. Install bbb-livekit: `$ sudo apt-get install bbb-livekit`
2. Enable the LiveKit controller module in bbb-webrtc-sfu:

```
if [ ! -s /etc/bigbluebutton/bbb-webrtc-sfu/production.yml ]; then echo '{}' > /etc/bigbluebutton/bbb-webrtc-sfu/production.yml; fi
`yq -y -i '.livekit.enabled = true' /etc/bigbluebutton/bbb-webrtc-sfu/production.yml`
```

3. Restart bbb-webrtc-sfu: `$ sudo systemctl restart bbb-webrtc-sfu`
4. Guarantee that Node.js 22 is installed in your server: `$ node -v`
    * Older 3.0 installations might still be using Node.js 18. If that's the case,
      re-run bbb-install or correct any custom installation scripts to ensure
      Node.js 22 is installed.
5. Only when using BigBlueButton via the [cluster proxy](/administration/cluster-proxy) configuration:
    1. Set the appropriate LiveKit endpoint URL in bbb-html5.yml's `public.media.livekit.url`. See
      the aforementioned [docs section](/administration/cluster-proxy.md#bigbluebutton-servers) for details.

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

Once enabled, LiveKit still won't be used by default. There are two ways to make
use of it in meetings:
- Per meeting: set any of the following meeting `/create` parameters
  - `audioBridge=livekit`
  - `cameraBridge=livekit`
  - `screenShareBridge=livekit`
- Server-wide: set any of the following properties in `/etc/bigbluebutton/bbb-web.properties`
  - `audioBridge=livekit`
  - `cameraBridge=livekit`
  - `screenShareBridge=livekit`

Those parameters do *not* need to be set concurrently. LiveKit can be enabled for
audio only, for example, while keeping the current media framework for camera
and screen sharing by setting just `audioBridge=livekit`.

As of BigBlueButton v3.0.7, recording is enabled by default for LiveKit sessions
via the bbb-webrtc-recorder application. If `livekit/egress` was previously
installed in a server, any steps done to enable it should be reverted. Refer to
the [previous installations steps](https://github.com/bigbluebutton/bigbluebutton/blob/6eab874ffa8d0e82453dad3b06621dea16e15e6d/docs/docs/new-features.md?plain=1#L209-L237).

Keep in mind that the LiveKit integration is still experimental and not feature
complete. Configuration, API parameters, and other details are subject to change.
We encourage users to test it and provide feedback via our GitHub issue tracker
or the mailing lists.


### Upgraded components

Under the hood, BigBlueButton 4.0 installs on Ubuntu 24.04 64-bit, and the following key components have been upgraded
- Grails 7.0.8
- Gradle 8.14.3
- Groovy 4.0.21
- Spring 6.2.11
- Spring Boot 3.5.14

For full details on what is new in BigBlueButton 4.0, see the release notes.


Recent releases:

- [4.0.0-beta.3](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v4.0.0-beta.3)
- [3.1.0-beta.2](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.1.0-beta.2)
- [3.1.0-beta.1](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.1.0-beta.1)

### Other notable changes

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

_None._

#### Value changed

- `defaultMeetingLayout` default changed from `CUSTOM_LAYOUT` to `UNIFIED_LAYOUT`. Accepted values are now `UNIFIED_LAYOUT` (default), plus the hybrid/niche options `CAMERAS_ONLY`, `PARTICIPANTS_CHAT_ONLY`, and `PRESENTATION_ONLY`. The previous values `CUSTOM_LAYOUT`, `SMART_LAYOUT`, `PRESENTATION_FOCUS`, and `VIDEO_FOCUS` are no longer accepted.
- `html5PluginSdkVersion` bumped from `0.0.99` to `0.1.17`.
- `disabledFeatures` accepts a new value: `pinChatMessage` (alongside the existing chat-related options).

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

#### Value changed

- `public.chat.toolbar` now includes a `pin` option (for pinning chat messages).
- `public.layout.showParticipantsOnLogin` default changed from `true` to `false`.
- `public.layout.syncCameraDockSizeAndPosition` default changed from `false` to `true`.
- The default layout under `defaultSettings` moved from `application.selectedLayout: 'custom'` to `layout.selectedLayout: 'unified'` (with `pushLayout` now nested under `layout`).
- `public.userCamera`'s display labels now include `presenter` and `bot`, and `moderator` defaults to `true`.

#### Removed

- `public.layout.showPushLayoutButton`, `public.layout.showPushLayoutToggle`, and `public.layout.enableDeprecatedLayoutSelection`.
- `public.stats.log` (replaced by `public.stats.logMediaStats`).

## Development

For information on developing in BigBlueButton, see [setting up a development environment for 4.0](/development/guide).

The build scripts for packaging 4.0 (using fpm) are located in the GitHub repository [here](https://github.com/bigbluebutton/bigbluebutton/tree/v4.0.x-release/build).

## Contribution

We welcome contributors to BigBlueButton 4.0!  The best ways to contribute at the current time are:

- Help localize BigBlueButton 4.0 on [Transifex project for BBB 4.0](https://www.transifex.com/bigbluebutton/bigbluebutton-v40-html5-client/dashboard/)
- Try out [installing BigBlueButton 4.0](/administration/install) and see if you spot any issues.
- Help test a [4.0 pull request](https://github.com/bigbluebutton/bigbluebutton/pulls?q=is%3Aopen+is%3Apr+milestone%3A%22Release+4.0%22) in your development environment.
  <!-- TODO create a GitHub label for contributions-welcome and link here -->

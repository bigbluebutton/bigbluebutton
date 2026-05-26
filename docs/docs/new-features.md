
![BigBlueButton 4.0 runs on Ubuntu 24.04](/img/40_BBB_header.png)

## Overview

<!-- BigBlueButton 4.0 offers users improved usability, increased engagement, and more performance. -->

<!-- - **Usability** - making common functions (such as raise hand) easier
- **Engagement** - giving the instructor more ways to engage students
- **Performance** - increasing overall performance and scalability -->

Here's a breakdown of what's new in 4.0.

### Usability


### Engagement


<!-- ### Analytics -->

### Behind the scenes




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
- Grails 7.0.0
- Gradle 8.14.3
- Groovy 4.0.21
- Spring 6.2.11
- Spring Boot 3.5.13

For full details on what is new in BigBlueButton 4.0, see the release notes.


Recent releases:

- [3.1.0-beta.2](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.1.0-beta.2)
- [3.1.0-beta.1](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.1.0-beta.1)


### Other notable changes

#### Removing deprecated layout options

The layout system has been simplified to use a single unified layout. The following layouts have been removed: `CUSTOM_LAYOUT`, `SMART_LAYOUT`, `PRESENTATION_FOCUS`, and `VIDEO_FOCUS`. The default layout is now `UNIFIED_LAYOUT`.

The layout selection modal and the push layout button have also been removed. The `showPushLayoutButton` and `showPushLayoutToggle` settings are no longer available.

The `layouts` option has been removed from `disabledFeatures`.

### Changes to events.xml


### bbb-web properties changes

Removed

Value changed

Added




## Development

For information on developing in BigBlueButton, see [setting up a development environment for 4.0](/development/guide).

The build scripts for packaging 4.0 (using fpm) are located in the GitHub repository [here](https://github.com/bigbluebutton/bigbluebutton/tree/v4.0.x-release/build).

## Contribution

We welcome contributors to BigBlueButton 4.0!  The best ways to contribute at the current time are:

- Help localize BigBlueButton 4.0 on [Transifex project for BBB 4.0](https://www.transifex.com/bigbluebutton/bigbluebutton-v40-html5-client/dashboard/)
- Try out [installing BigBlueButton 4.0](/administration/install) and see if you spot any issues.
- Help test a [4.0 pull request](https://github.com/bigbluebutton/bigbluebutton/pulls?q=is%3Aopen+is%3Apr+milestone%3A%22Release+4.0%22) in your development environment.
  <!-- TODO create a GitHub label for contributions-welcome and link here -->

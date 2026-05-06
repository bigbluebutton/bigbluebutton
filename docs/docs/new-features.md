
![BigBlueButton 3.1 runs on Ubuntu 22.04](/img/30_BBB_header.png)

## Overview

<!-- BigBlueButton 3.1 offers users improved usability, increased engagement, and more performance. -->

<!-- - **Usability** - making common functions (such as raise hand) easier
- **Engagement** - giving the instructor more ways to engage students
- **Performance** - increasing overall performance and scalability -->

Here's a breakdown of what's new in 3.1.

### Usability


### Engagement


<!-- ### Analytics -->

### Behind the scenes




### Experimental


### Upgraded components

Under the hood, BigBlueButton 3.1 installs on Ubuntu 22.04 64-bit, and the following key components have been upgraded
- Grails 7.0.0
- Gradle 8.14.3
- Groovy 4.0.21
- Spring 6.2.11
- Spring Boot 3.5.13

For full details on what is new in BigBlueButton 3.1, see the release notes.


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

For information on developing in BigBlueButton, see [setting up a development environment for 3.1](/development/guide).

The build scripts for packaging 3.1 (using fpm) are located in the GitHub repository [here](https://github.com/bigbluebutton/bigbluebutton/tree/v3.1.x-release/build).

## Contribution

We welcome contributors to BigBlueButton 3.1!  The best ways to contribute at the current time are:

- Help localize BigBlueButton 3.1 on [Transifex project for BBB 3.1](https://www.transifex.com/bigbluebutton/bigbluebutton-v31-html5-client/dashboard/)
- Try out [installing BigBlueButton 3.1](/administration/install) and see if you spot any issues.
- Help test a [3.1 pull request](https://github.com/bigbluebutton/bigbluebutton/pulls?q=is%3Aopen+is%3Apr+milestone%3A%22Release+3.1%22) in your development environment.
  <!-- TODO create a GitHub label for contributions-welcome and link here -->

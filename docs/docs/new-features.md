
![BigBlueButton 3.1 runs on Ubuntu 22.04](/img/30_BBB_header.png)

## Overview

<!-- BigBlueButton 3.1 offers users improved usability, increased engagement, and more performance. -->

<!-- - **Usability** - making common functions (such as raise hand) easier
- **Engagement** - giving the instructor more ways to engage students
- **Performance** - increasing overall performance and scalability -->

Here's a breakdown of what's new in 3.1.

### Usability


#### Multi-User Whiteboard Improvements

![multi user whiteboard toggle](/img/30/30-multi-user-whiteboard.png)

Starting with BigBlueButton 3.0.20, the activation logic for multi-user whiteboard has changed. Previously, presenters had to re-enable this feature for each slide, which often caused confusion among participants. Now, once enabled, multi-user whiteboard remains active through slide changes and presentation switches until intentionally deactivated.

Additionally, breakout rooms now have multi-user whiteboard enabled by default, encouraging collaboration.

#### Relocated Raised Hands List

A common piece of feedback from moderators was that the raised hands list obscured important screen real estate and made it difficult to see participants' full names.

This has been addressed in BigBlueButton 3.0.17+ with a redesigned raised hands list in the left-hand side panel.

![list of users with raised hand](/img/30/30-raised-hands-in-panel.png)

Names are now displayed in full, and the list order is clear. Selecting a row provides convenient actions such as lowering the hand, initiating a chat with the user, or changing their role or lock status.

#### Quiz

BigBlueButton 3.0.11 introduced the commonly requested Quiz functionality, located near the existing Polling feature.

When creating a quiz, be sure to specify the correct answer(s).

![quiz initialization](/img/30/30-quiz-1.png)

As viewers vote, the presenter receives immediate feedback showing who answered correctly.

![quiz live feedback](/img/30/30-quiz-2.png)

The published results can optionally reveal which answer(s) were correct.

![quiz results](/img/30/30-quiz-3.png)

A new section of the Learning Analytics Dashboard dedicated to quizzes helps track the results of each quiz.

![quiz results in learning analytics dashboard](/img/30/30-quiz-4.png)

#### Layout Redesign

BigBlueButton 3.0.19 introduced a new layout called "Unified Layout." This layout is intended to eventually replace most of BigBlueButton's existing layouts. For now (BBB 3.0.x), the existing behavior remains available (`enableDeprecatedLayoutSelection: true`).

Unified Layout behaves similarly to Custom Layout when the presentation is active, and similarly to Grid Layout when it is not. Once the new layout becomes the default, the layout manager will no longer be used. The only way to change the arrangement of the visible area will be via the button that hides or restores the presentation area.


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
- Spring Boot 3.4.9 

For full details on what is new in BigBlueButton 3.1, see the release notes.


Recent releases:

- [3.1.0-beta.2](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.1.0-beta.2)
- [3.1.0-beta.1](https://github.com/bigbluebutton/bigbluebutton/releases/tag/v3.1.0-beta.1)


### Other notable changes


### Changes to events.xml


#### bbb-web properties changes

Removed

Value changed

Added




### Development

For information on developing in BigBlueButton, see [setting up a development environment for 3.1](/development/guide).

The build scripts for packaging 3.1 (using fpm) are located in the GitHub repository [here](https://github.com/bigbluebutton/bigbluebutton/tree/v3.1.x-release/build).

### Contribution

We welcome contributors to BigBlueButton 3.1!  The best ways to contribute at the current time are:

- Help localize BigBlueButton 3.1 on [Transifex project for BBB 3.1](https://www.transifex.com/bigbluebutton/bigbluebutton-v31-html5-client/dashboard/)
- Try out [installing BigBlueButton 3.1](/administration/install) and see if you spot any issues.
- Help test a [3.1 pull request](https://github.com/bigbluebutton/bigbluebutton/pulls?q=is%3Aopen+is%3Apr+milestone%3A%22Release+3.1%22) in your development environment.
  <!-- TODO create a GitHub label for contributions-welcome and link here -->

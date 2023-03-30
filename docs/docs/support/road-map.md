---
id: troubleshooting
slug: /support/road-map
title: Road Map
sidebar_position: 3
description: BigBlueButton Road Map
keywords:
- roadmap
---

## Introduction

We (the [core developers](/support/faq#bigbluebutton-committer)) released our first version of BigBlueButton on June 12, 2009.

Since the summer of 2009 we've [had many releases](/release-notes) of BigBlueButton, each release improving on the previous, each reflecting the desire by the core developers to build a solid product.

We think of BigBlueButton as a product.  We have a [development process](/support/faq#bigbluebutton-development-process) to ensure we deliver a real-time platform that is both easy to use for end-users and solid to build upon for developers.

This document outlines our road map ahead for BigBlueButton.

The requirements outline herein are largely driven by our target market: on-line learning.  We are also often asked "Why are you focusing on only one market -- don’t you realize that BigBlueButton would be great for market X, Y, and Z?"  We realize  that the core features -- shared chat, presentation, voice, video, and desktop -- are the same core features for many markets (including on-line learning).  It is our belief that by focusing and delivering a world-class product for on-line learning, we will, in essence, deliver a world class solution for other markets as well.

What are the requirements for on-line learning?  At the highest level it's to provide remote students a high-quality learning experience.  In other words, we think of BigBlueButton in terms of "How can we make on-line learning more effective for teachers and students?"

There actually five distinct roles in any deployment of BigBlueButton: teacher, student, administrator, support, and developer.  Each person has a job to accomplish; each person has their own user stories:

* As a **teacher** I want to effectively communicate my content in a way maximizes student learning and engagement.  I want interactive classes, not just a one-way lecture (though there are times with larger classes that one-way lectures make sense).

* As a **student** I want to efficiently learn the material so I can gain new skills and (for most students enrolled in an educational institution) obtain good grades to help be build a better career.  I want opportunities to interact with the instructor (either one-on-one or during the class).  I want to access recorded content to assist in my learning and application of concepts.

* As an **administrator** I want to easy access to BigBlueButton from my educational institution's learning management system (LMS).

* As the **manager of support** I want BigBlueButton to be easy to teach and support so I can achieve a high satisfaction rating from my users and lower my support effort (and costs) relative to other options.

* As a **developer** I want to install BigBlueButton in 30 minutes (or less).  I want to be able to integrate BigBlueButton into my product in less than four hours so I can explore its value with others.

We can measure our success by how easily we enable each person to accomplish their job.  We also have goals that that not specific to any role; rather, they underlie **all** requirements.

* **Stability** - We want rock-solid stability for users. To this end, we do extensive testing for each release.  Case in point: BigBlueButton 0.80 had four beta releases and three release candidates over four months, BigBlueButton 0.81 had five months of beta testing, and BigBlueButton 0.9.1 had five months of beta testing.  In addition to testing by commercial companies that support BigBlueButton, we also run the [BigBlueButton demo server](https://demo.bigbluebutton.org) for weeks without reboot.

* **Usability** - Usability touches all human-facing aspect of the product, including the quality of audio and video.  We want first-time users to have a very positive experience.  A lot of effort goes into the usability in each release.  We believe that if we can add features while at the same time making the user experience more consistent and elegant, we are headed in the right direction.

* **Modularity** - BigBlueButton is a large application with many components.  We constantly look for to reduce the coupling between components.  A good example is the integration with FreeSWITCH, which is done entirely through session initiation protocol (SIP) and FreeSWITCH's event socket layer -- this enables FreeSWITCH to run on completely different server if you wish.

* **Code Quality** - We are constantly learning as we evolve BigBlueButton, and we are constantly applying our increased skill to refactoring and rewriting components as we extend BigBlueButton's feature set and [architecture](/development/architecture).  We know that for other developers to contribute (and to release a solid product), BigBlueButton's code must be maintainable.

* **Scalability** - We build BigBlueButton to be a highly collaborative environment.  Our uses cases are one-to-one (such as student tutoring or coaching), small group collaboration, and one-to-many (recommend 100 users or less in a single session).  Even in the one-to-many, you can have 20 users all sharing the webcams and all able to talk.  In other words, we didn't build a webinar-type application that restricts usage.  Still, we think about scalability in each release and add (and refactor) the product to increase it.

* **API** - BigBlueButton's provides a simple API for integration, and simple is good.  The API has enabled a [growing list](https://www.bigbluebutton.org/integrations/) of 3rd party integrations with other open source products.

Obviously, we can't do everything in a single release.  If you read through the [release notes](/release-notes, you'll see that we sometimes implement features in phases -- such as record and playback being release first as capturing slides (v 0.80), then as capturing all content (v 0.81), and then with Start/Stop Record button (v 0.9.1) for moderator.

The following sections outline (in no particular order) the road map for BigBlueButton.  If your wondering how a feature gets selected, see [how we prioritize features for each release](/support/faq#when-will-feature-x-be-implemented).

If you have feedback on this document, please post to [BigBlueButton-dev](https://groups.google.com/group/bigbluebutton-dev/topics?gvc=2) mailing list.


## Core Features

This section covers the enhancements to BigBlueButton’s core.

### Show Slide Thumbnails

At this time the slide navigation does not show thumbnails when using the slide menu to navigate to specific slides.

### Managing webcams

The Flash client allowed users to individually close webcams.  This feature is not yet implemented in the HTML5 client.

### Links in slides not clickable

When uploading slides with clickable links, they could be clicked in the Flash client. Currently, they are not clickable in the HTML5 client.

### Layout Dropdown

The Flash client had a layout menu that let moderators push down layout changes in windows to all viewers.  The HMTL5 client does not use windows (it uses panels that show/hide).  We are going to add capabilities for the moderator to show/hide the presentation area in a future update.

### Show Slide Thumbnails

At this time the slide navigation does not show thumbnails when using the slide menu to navigate to specific slides.

### Whiteboard

Support ability to move/edit whiteboard objects ([2351](https://github.com/bigbluebutton/bigbluebutton/issues/2351)).

### Closed Captioning

Enable the posting of a sub-rip title file (SRT) to the BigBlueButton server to add captions after the meeting is done (see [3864](https://github.com/bigbluebutton/bigbluebutton/issues/3864)).

## General Requirements

The items below are not specific to any one feature but are more about the overall quality of the project.

### Development Environment

It should be possible to setup a development environment in under 30 minutes.  We made progress on this in the latest release (see [developing for BigBlueButton](/development/guide)).

We could make this easier with creating a Docker container for BigBlueButton.

### Documentation

Ensure all classes in BigBlueButton, both on the server (Java) and client (ActionScript) -- have sufficient javadoc documentation for a developer to understand their role relative to others.

Ensure all classes are documented to the level where another programmer could understand their intent.  Create easy-to-navigate documentation that enables other developers to understand the design and purpose of the code.

### Compatibility

Screen sharing on mobile for iOS and Android. (see [8576](https://github.com/bigbluebutton/bigbluebutton/issues/8576#issue-557890044))

### Stability

Close all critical, high, and medium stability issues.  In general, keep testing to ensure each release is more stable than the previous.

### Unit Testing

Add unit test to the core modules (voice, video, chat, presentation, and desktop sharing) have unit tests to verify their functionality.

The development environment should enable developers to run the unit tests to verify conformance.

### Integration Testing

The API should have a complete test suite to verify stability and conformance to documentation.

### Stress Testing

Verify that a BigBlueButton server can run under heavy load with large number of users for 48 hours without any failure.

BigBlueButton is currently tested through the community, through commercial companies building upon BigBlueButton, and through the developers.  Our beta release cycles span months to ensure adequate testing.

Having a repeatable stress test environment could help us shorten our release cycles.

### API

Add an API call to enable external applications to inject messages into the chat window (see [1660](https://github.com/bigbluebutton/bigbluebutton/issues/1660)).

Add an API call to enable an external application to upload a new presentation.

### Troubleshooting tools

Add more capabilities to bbb-conf to change the logging levels of all applications, making it easier to spot errors ([1661](https://github.com/bigbluebutton/bigbluebutton/issues/1661)).

## Other areas for investigation

### H.323

This would enable BigBlueButton to integrate with other commercial conferencing systems that support [H.323](https://en.wikipedia.org/wiki/H.323)

### Rest API

Create a rest-based API for BigBlueButton that would implement all the current BigBlueButton [API calls](/development/api).  This would make it easier for other applications to integrate with BigBlueButton.

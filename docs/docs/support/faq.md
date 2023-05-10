---
id: faq
slug: /support/faq
title: FAQs
sidebar_position: 2
description: BigBlueButton FAQs
keywords:
- administration
- faq
---

## Welcome

Welcome to the BigBlueButton project's Frequently Asked Questions (FAQ).

We (the [core developers](#bigbluebutton-committer)) created this FAQ to quickly answer common questions around installation, configuration, and using BigBlueButton. If you are a developer, you'll find lots of answers herein that have been collected from discussions on our mailing lists.

_NOTE:_ For teachers and students, you'll find the <a href="https://support.bigbluebutton.org/">Knowledge Base</a> the best resource for how-to articles on using BigBlueButton. Also check out the <a href="https://bigbluebutton.org/teachers/tutorials">Tutorial Videos</a> as well.

### What if I don't find my answer here

The BigBlueButton community focuses its support in three mailing lists, each hosted by Google Groups. Each group focuses on a different topic of questions:

- [bigbluebutton-setup](https://groups.google.com/forum/#!forum/bigbluebutton-setup) -- Setup, installation, and configuration questions, such as "How do I configure the BigBlueButton client?"
- [bigbluebutton-users](https://groups.google.com/forum/#!forum/bigbluebutton-users) -- End user questions, such as "How do I do X with BigBlueButton?"
- [bigbluebutton-dev](https://groups.google.com/forum/#!forum/bigbluebutton-dev) -- All other questions, such as "How do I integrate BigBlueButton with my application?"

The developer mailing list has over 4000 users, so before you post:

1. Scan this FAQ to see if your question is answered herein.
2. Use Google to search for keywords related to your question -- there's a good chance someone might have already asked your question in the Google groups.
3. If you think you've found a bug, first check the [issues database](https://github.com/bigbluebutton/bigbluebutton/issues) to check if it's already been reported.

All of the core BigBlueButton contributors subscribe to all three mailing lists. Please don't cross post to more than one list -- you are only causing more effort to answer all the threads.

### Why is this project called BigBlueButton

The name came from the goal of making the process to setup a virtual classroom as easy as pressing a (metaphorical) big blue button.

### Why is it spelled BigBlueButton (and not Big Blue Button)

The trademark is written as one word BigBlueButton. Doing so makes it easy for others to use Google to search for information about the project.

### Where is the source

The BigBlueButton source code is at [https://github.com/bigbluebutton/bigbluebutton](https://github.com/bigbluebutton/bigbluebutton). As an open source project, you are welcome to fork BigBlueButton and build your own applications upon it.

### What is the open source license used in BigBlueButton

We use the LGPL license Version 3.0. Some of the open source components we build on use different licenses, such as red5phone uses the GPL license.

### Will BigBlueButton always stay open source

Yes.

We started BigBlueButton as an open source project, and we intend to keep it that way. One of the main goals we had was to create a large open source community around the project. To further this goal, we are in the process of putting together an [independent not-for-profit BigBlueButton organization](https://bigbluebutton.org/2010/07/12/bigbluebutton-foundation/) (similar to the Eclipse Foundation) to oversee and accelerate the growth of the BigBlueButton project.

### I tried to join one of the mailing lists and got rejected

To avoid SPAM in our mailing lists, when you apply to join you are prompted to ask a simple question. If we get an application without an answer, we assume the application is from a bot and delete it.

Be sure to provide us an answer so we know your a real person that wants to join our community.

## BigBlueButton Development Process

There is a very active BigBlueButton community of members on the developer mailing list (over 2000 members and counting!). In the BigBlueButton community at-large all the members, users, developers, educational institutions, and commercial companies are all collaborating on using and improving BigBlueButton.

As with any open source project, the continued growth of the community depends on the quality of the software. The quality of the software, in turn, depends on the developers involved and the process we use to build a release.

### Development Priorities

The core group of BigBlueButton committers have adopted an open source development process with the following priorities (in order):

- Stability
- Usability
- Features
- Modularity
- Scalability

It cannot be overstated that the project's focus is primarily on stability. For a university or college to deploy BigBlueButton for live classes, or for a commercial company to embed BigBlueButton into their product, the software must be extremely stable. To that end, you'll notice from the previous release notes that we tend to spend _months_ testing each release candidate before issuing a release.

Achieving stability is no easy task. BigBlueButton itself is built upon many great open source projects (such as FreeSWITCH, redis, Akka, and others) with sub-systems responsible for sharing of slides, video, audio, text, and desktop sharing. The stability of the product today is a direct result of the committers, the development process, and the community all working together. We release on quality, not dates.

Usability ranks a close second. Without a simple-to-use (we like to call it elegant) user interface, BigBlueButton would neither be adopted, nor viewed as a compelling alternative to more complex (and proprietary) equivalents.

Features are the focus of each release, and we focus on the features that our core market (on-line learning) will benefit from most.

Modularity enables components of BigBlueButton to be developed, refactored, and upgraded in parallel. During each release we invariably rewrite parts of BigBlueButton to improve modularity. Much of this is invisible to end-users, but it keeps the technical debt low, so we can innovate faster with each release.

Scalability is important as our market grows. We designed BigBlueButton to be a highly collaborative system.

### BigBlueButton Committer

Like many open source projects, at the core of the project are a team of developers that have responsibility for core development and overall quality of the project. The current committers are as follows:

Committers:

- Richard Alam, lead architect
- Felipe Cecagno, core
- Fred Dixon, project manager
- Jesus Federico, integrations
- Anton Georgiev, HTML5 client
- Tiago Jacobs, core
- Paulo Lanzarin, audio/video
- Pedro Marin, client
- Ghazi Triki, core
- Calvin Walton, record and playback

Past Committers (fondly remembered):

- Oswaldo Acauan, HTML5 client
- Marco Calderon, server
- Chad Pilkey, HTML5 client
- Gustavo Salazar, record and playback
- Jeremy Thomerson, API
- Denis Zgonjanin, client

The committers have earned this responsibility through years of contribution to BigBlueButton and to related open source projects (i.e. red5). In particular, we very much respect Richard's seven year-plus effort to create BigBlueButton. As the Lead Architect for our project, he has the final say.

The committers are very active in the support and mentoring of other developers in the [bigbluebutton-dev](https://groups.google.com/forum/#!forum/bigbluebutton-dev) mailing list. The BigBlueButton project also participated in the 2010 Google Summer of Code (Google paid for two students to work on the project).

The committers group is not closed. Any developer that wishes to become a committer can achieve it through participation. The decision of expanding the committers group rests with the committers.

### Process

Each release cycle goes according to the following steps.

#### 1. Planning

During the planning process, the committers decide on the main features for a release by reviewing the [BigBlueButton Road Map](/support/road-map) along with all starred issues and, in particular, issues marked with tags [stability](https://github.com/bigbluebutton/bigbluebutton/issues?q=is%3Aissue+is%3Aopen+label%3AStability) and [usability](https://github.com/bigbluebutton/bigbluebutton/issues?utf8=%E2%9C%93&q=is%3Aissue%20is%3Aopen%20label%3Ausability).

We review the features according to the development priorities for our target market (see [When will feature X be implemented?](#when-will-feature-x-be-implemented)).

#### 2. Design

After the planning phase, each feature for the release is assigned an issue in the BigBlueButton Issue Tracker (if it does not already have one). This allows the community to track the progress of each release. See [List of open issues/enhancements](https://github.com/bigbluebutton/bigbluebutton/issues).

For small features, especially bug fixes, the associate issue provides a sufficient record for coordinating and tracking the development effort.

For more complex features, such as record and playback, API changes, or creation of an HTML5 client, the lead developer for the feature would post specifications to BigBlueButton-dev for review and comment.

For examples of previous posts, see:

- [0.80 API changes](https://groups.google.com/group/bigbluebutton-dev/browse_thread/thread/c214cbe9bdb2268a)
- [HTML5 Client Architecture](https://groups.google.com/group/bigbluebutton-dev/browse_thread/thread/c17afb3e850b185a)
- [Feature for pre-upload of documents](https://groups.google.com/d/msg/bigbluebutton-dev/02um_1Pkqnk/Qil66KztUX8J)

#### 3. Development

During the development phase, the committers hold bi-weekly (and sometimes weekly) calls as development proceeds towards beta.

The submitter of the pull request is responsible for ensuring the feature works correctly against the target branch. For pull requests that make major changes, the submitter must provide with the pull request additional documentation to make it easy for others to review:

- What the code does (with reference to the associated issue)
- What changes were made to implement the feature/fix the bug
- Document of design changes

Each commit is reviewed by another committer who is familiar as well with the area of the product. Any substantive commit to the core is reviewed by Richard Alam, BigBlueButton's CTO.

If the reviewer of the update believes it will negatively affect stability or usability, the request will be rejected and the developer will need to rework the request based on feedback by the reviewer.

Once an update has been committed, it is tested by other developers in the latest build. In that way a build will iterate through development towards beta. The release stays in development until all core development is finished and all obvious bugs have been fixed.

Before the beta release, the documentation for installation, setting up of the development environment, and overview of new features are all updated for the release. It's ready for others to install and test.

#### 4. Beta Testing

Once a release is moved to beta, the public Ubuntu packages are updated so others in the BigBlueButton community can begin installing and using the build.

The product will go through one (or more) betas until the community reports no more major bugs. Additional work that occurs during this phase includes:

- [Localization](/development/localization) of the product
- Updating and completing all documentation
- Updating packaging so it installs without errors, both on a new install and an upgrade from a previous version

We strive to have _very_ stable beta releases. As the release moves through iterations in beta, members of the community will start to run BigBlueButton on production servers. (Yes, some run it for _months_ on production.)

When _all_ the bugs are fixed and issues are closed, the product moves to Release Candidate.

#### 5. Release Candidate

For us the release candidate is done -- which means issue a release is changing only the label of the build.

We tend to wait for (at least) two weeks of community use before we change the label to release. Again, stability is paramount for reaching a release candidate build.

During the stage at release candidate the core committers monitor the mailing lists, twitter, and feedback from members to look for any bugs or issues that would impact the delivery of general release.

Many times during the beta and release candidate process we are asked "What is your release date?". Our motto is “we release on quality, not dates.”

#### 6. General Release

After a (roughly) two week period in which no one has reported any issues for a release candidate, the committers change the label (such as 0.9.0-RC to 0.9.0) and announce the release (see [release announcement for 0.9](https://groups.google.com/d/msg/bigbluebutton-dev/TAJ369nPZU4/7DK-TH3JWocJ) and [release announcement for 1.0](https://groups.google.com/d/msg/bigbluebutton-dev/8E3AYUcO6Uw/m5r2xgPeBgAJ)).

## Contributing to BigBlueButton

### How can I contribute

BigBlueButton exists because many developers have contributed their time and expertise to its development.

At first glance at the underlying architecture, BigBlueButton may seem complex, but it's not really once you get to know the system. The BigBlueButton client is written in Javascript. The BigBlueButton server components are written in a combination of Java, Grails, and Scala. You don't need to learn all these languages to help out, but you should be very comfortable programming in Java as JavaScript, Grails, and Scala are all similar to Java.

Before you can contribute as a developer, you need to invest some time into understanding BigBlueButton's [architecture](/development/architecture#architecture-overview), and you need to setup a [development environment](/development/guide). The source code for BigBlueButton is hosted at [github](https://github.com/bigbluebutton/bigbluebutton), so you'll need to understand [how git works](https://git-scm.com/book) and the workflow for distributed software development.

Like other open source projects, a good place to start is to try fixing an [open issue](https://github.com/bigbluebutton/bigbluebutton/issues).  Some bugs are more important than others. Stability and usability issues are very important to the BigBlueButton community.

### I'm not a developer, can I still contribute?

Don't worry if you are not a proficient developer -- there are many ways to help out. You can become proficient in the installation and configuration of a BigBlueButton server. Each month, there are many new users in [bigbluebutton-setup](https://groups.google.com/forum/#!forum/bigbluebutton-setup) that need help with setup of BigBlueButton, especially setup behind a [firewall](#can-i-provide-external-access-to-a-bigbluebutton-server-behind-my-firewall). You can [contribute a language file](/development/localization). You could point out any errors to this documentation. Such assistance reduces the support load on us and gives us more time to work on improving BigBlueButton.

Any contribution by external members for inclusion into BigBlueButton will be reviewed by one (or more) of the committers. The process for submission and review depends on the complexity of the contribution and requires that you have signed a Contributor License Agreement.

### Why do I need to sign a Contributor License Agreement to contribute source code

Before we can accept contributions to BigBlueButton, we need to ensure there isn't any ambiguity on the ownership of material committed to the project. Therefore, everyone wishing to send us a pull request for review must have a signed Contributor License Agreement in place. For background on our reasons for doing this, please see https://www.oss-watch.ac.uk/resources/cla.xml.

To obtain a committer agreement, download [BigBlueButton Inc. Contributor Agreement](https://bigbluebutton.org/files/BigBlueButtonContributorAgreement121006.pdf). Except as set out in the agreement, you (and your employer if you have an intellectual property agreement in place) keep all right, title, and interest in your contribution. If you (and your employer) are in agreement with its terms (be sure to use a physical mailing address for the `address` section to make it legal), then sign, scan, and e-mail a copy to cla _at_ bigbluebutton _dot_ org.

Once we receive the signed Contributor Agreement, we can review your submission for inclusion in BigBlueButton. The process for submission depends on whether it's fixing a bug (submitting a pull request) or whether it's an enhancement (submitting a feature).

#### Submission of a pull request

If you want to submit a pull request, your chances of acceptance are **greatly** improved if the following are true:

1. You are an active participant in [bigbluebutton-dev](https://groups.google.com/forum/#!forum/bigbluebutton-dev) and have demonstrated an understanding of the product by helping others and participating in discussions on other patches.
2. Your patch fixes an [open issue](https://github.com/bigbluebutton/bigbluebutton/issues).
3. Before submitting your patch, you have announced your intent to bigbluebutton-dev or commented on the issue itself.
4. You have received positive feedback from a committer on your intent.

The ideal patch submission has all the above true, which essentially means you have built a relationship of trust with other BigBlueButton developers and have been visible on your willingness to contribute your skills to the project.

There are a number of **must haves** for your submission to be accepted.

1. You have forked BigBlueButton on GitHub and submitted the patch as a pull request (this makes it **much** easier for a committer to review and incorporate your patch).
2. You have signed a [committers agreement](/support/faq#why-do-i-need-to-sign-a-contributor-license-agreement-to-contribute-source-code) so there is no ambiguity that your contributions may be released under an open source license.
3. Your submission is LGPL V3 (unless it modifies existing code that is under a different license).

Specifically, for using GitHub, you need to do the following:

1. [Fork](https://help.github.com/articles/fork-a-repo) BigBlueButton on [GitHub](https://www.github.com/bigbluebutton)
2. Create a topic branch - `git checkout -b my_branch`
3. Push to your branch - `git push origin my_branch`
4. Create a [Pull Request](https://help.github.com/articles/using-pull-requests/) from your branch

GitHub provides some good [help](https://help.github.com/) in the above steps, and there is an excellent [Pro Git book](https://git-scm.com/book/en/v2) by Scott Chacon available on-line.

#### Submission of a feature

Some of the items in our issue tracker are enhancements to the core product. If you are interested in contributing an enhancement, your chances of acceptance are **greatly** improved if the following are true:

1. You have had previous pull requests accepted by a committer.
2. You have posted a message to bigbluebuton-dev mailing list signaling your willingness to work on the enhancement. In your post, you have provided (at minimum) the following:
   - An overview of the design and implementation of your feature. For examples see: [Proposal for Preupload of Documents](https://groups.google.com/forum/#!topic/bigbluebutton-dev/02um_1Pkqnk)
   - An outline of how you intend to test the enhancement.
   - An estimate of how much time you have to work on the enhancement.
3. A committer has signaled their intent to work closely with you on the enhancement.

Like other open source projects, the participation of a committer is central to the above process as they will take the responsibility for reviewing and signing off on your contribution.

#### Testing your submission

Depending on the complexity of your patch or feature, it should be accompanied by test cases or, at minimum, a series of steps to test whether the code is functioning properly.

We are continuously trying to incorporate more automated testing into the BigBlueButton development process, such as using [TestNG](https://testng.org/doc/index.html).

We know that the most important part of any submission is the ability for others to test that it works correctly. Any documentation, sample code, or unit tests that you can provide will greatly reduce the effort of the committer to review your submission.

#### Coding conventions

Take a look at the existing code in BigBlueButton and follow it as an example of the project's coding and documentation conventions.

For code written in Java, we follow the [Java Coding Convention](https://www.oracle.com/technetwork/java/codeconvtoc-136057.html) with minor changes. We will be documenting those changes in this wiki.

For documentation of code method -- especially those classes that provides an API to other classes -- should be documented using the [JavaDoc](https://www.oracle.com/technetwork/java/javase/documentation/index-137868.html) format.

### Where should I report potential security issues?

If you think you've found a security issue with BigBlueButton, we ask that you do a [responsible disclosure](https://en.wikipedia.org/wiki/Responsible_disclosure) and e-mail us directly at security .at. bigbluebutton .dot. org.

We will respond to you quickly, work with you to examine the scope of the issue, and give priority to fixing it as soon as possible.

## Installation

### What are the minimum hardware requirements for the BigBlueButton Server

See [before you install](/administration/install#before-you-install).

### What are the minimum bandwidth requirements for the BigBlueButton Server

You'll need good upstream and downstream bandwidth from the server. We recommend 1 Gbits/sec bandwidth in both directions. Having a server with less bandwidth, such as only 100 Mbits/sec, will only lead to audio and video issues with users.

### Can I install BigBlueButton on a shared hosting server, such as GoDaddy

Likely not. First, you need root access to install BigBlueButton. If you have a hosting account that only gives you, for example, FTP access and a cPanel/plesk interface, you will not be able to install BigBlueButton.

### Can I install BigBlueButton on EC2

Yes. The steps are covered in the [install](/administration/install) documentation.

### OS Requirements

#### Ubuntu

Older versions of BigBlueButton, up to and including version 2.4, required **Ubuntu 18.04 64-bit**.  The current version of BigBlueButto n2.5 requires **Ubuntu 20.04 64-bit**.  See [Install BigBlueButton](/administration/install).

We (the core developers) have not installed BigBlueButton on any other version of Ubuntu. It probably won't work.

#### CentOS

There is no support for CentOS.

We do have experience with CentOS. In April, 2010, we released [BigBlueButton 0.64](/release-notes#release-0.64:-lickety-split) with RPM packages for CentOS 5.4. However, based on our experience of developing, building, and testing both Ubuntu and CentOS packages, we stopped supporting RPM packages after that release.

Why?

In a nutshell: quality. We found it very difficult to test and maintain packaging for both RPM based systems (primarily CentOS) and Ubuntu. Rather than try to maintain them both and have them "kind of" work, which leads to many, many posts in our forums when users encounter difficulties with an install, we decided to invest heavily in testing and maintaining the Ubuntu packages. They are now very solid and well tested.

If you **really** want support for CentOS, you can contact one of the following companies for [commercial support](https://bigbluebutton.org/commercial-support). Any financial contribution you make for updating and maintaining the CentOS packages will directly benefit other CentOS users in the community.

You can see further discussion on the support for CentOS in [issue 1379](https://github.com/bigbluebutton/bigbluebutton/issues/1379). (Update: We are getting increasing interest in RPMs for BigBlueButton. We may be updating this section in the future.)

#### Windows

While technically it should be possible to manually install each of components (tomcat, nginx, LibreOffice, etc.) needed to run BigBlueButton on Windows, we haven't tried it, nor have we tested it.

If you are a brave soul and want to take a BigBlueButton server and manually install the equivalent components (and configuration files) onto a Windows server, it should technically be possible. However, beware, no one who has tried this has lived to post a success message to our mailing list :-).

#### OS X

There is no native installation for Mac OS X.

The easiest way to get your own BigBlueButton server under OS X is to install VMWare Fusion, create a Ubuntu 64-bit VM, and install BigBlueButton using the [installation instructions](/administration/install).

### Support for Mobile Devices

#### Android

BigBlueButton runs within the default Chrome browser (no app to install) on Android 6.0+. You can test this at [https://test.bigbluebutton.org/](https://test.bigbluebutton.org/).

All the features of BigBlueButton are available on Android except screen sharing (Chrome does not support screen sharing on Android).

#### iOS

BigBlueButton runs within the default Safari Mobile browser (no app to install) on iOS 12.2+. You can test this at [https://test.bigbluebutton.org/](https://test.bigbluebutton.org/).

All the features of BigBlueButton are available on iOS except screen sharing (Safari Mobile does not support screen sharing on iOS).

### Bandwidth Requirements

#### What are the bandwidth requirements for running a BigBlueButton server

You'll need good upstream and downstream bandwidth from the server. We recommend 1 Gbits/second bandwidth in both directions.

When sharing a webcam as a moderator, BigBlueButton lets you select 320x240, 640x480, or 1280x720. For bandwidth calculations, each resolution corresponds (roughly) to a .25 Mbits/sec, 0.40 Mbits/sec, and 0.60 Mbits/sec video stream respectively.

For example, if you have a room with 5 users, each sharing their webcam at 320x240, then you can calculate the bandwidth usage as follows:

- Y = .25 Mbits/sec
- W = amount of webcams that are streaming
- U = amount of users that are watching

For calculations:

- server incoming bandwidth: W`*`Y
- server outgoing bandwidth: W`*`(U-1)`*`Y (minus one since a broadcaster does not have to subscribe to his own stream)

For example, with 5 users in a room with 5 webcams streaming, the bandwidth calculation is as follows:

- in: 5`*`.25 = 1.25 Mbits/sec incoming bandwidth needed to the server, or 3600`*`1.25 = 4.5 GBits/hr
- out: 5`*`(5-1)`*`.25 = 5 Mbits/sec outgoing bandwidth needed from the server, or 3600`*`5 = 18 Gbits/hr

If you'd have a typical classroom situation one presenter broadcasting their webcam to 30 remote students, the calculation is as follows:

- in: 1`*`.25 = .25 Mbits/sec incoming, or 3600`*`.25 = 0.9 GBits/hr
- out: 1`*`(30-1)`*`.25 = 7.25 Mbits/sec outgoing, or 3600`*`7.25 = 26.1 GBits/hr

Large "cafe-style chatroom": 20 viewers, 8 people broadcasting with a webcam:

- in: 8`*`.25 = 2 Mbits/sec incoming, or 3600`*`2 = 7.2 GBits/hr
- out: 8`*`(20-1)`*`.25 = 38 Mbits/sec outgoing, or 3600`*` = 136.8 Gbits/hr

Sharing slides takes almost no bandwidth beyond the initial uploading/downloading of slides. When the presenter clicks to show the next slide, the viewers receive a "move next slide" command in their BigBlueButton client, and they load the next slide from the local cache. Chat also takes almost no bandwidth.

Screen sharing sharing takes the most bandwidth. The actual bandwidth for desktop sharing depends on the size of the area chosen by the presenter (full screen and region) and how often their screen updates. At the low end, if the presenter's screen is largely idle, the screen sharing application will transmit about 0.2 Mbits/sec; at the high end, if the presenter's screen is updating frequently, the BigBlueButton server could transmit 1.0 Mbits/sec. For a session with N users, BigBlueButton server would also transmit N desktop sharing streams (the presenter gets a stream as well for their Screen Sharing Preview window).

A VoIP connection to the BigBlueButton server takes roughly 0.04 Mbits/sec receiving and 0.04 Mbits/sec transmitting for each user. The bandwidth for VoIP grows linearly with number of users. For example, if there are 20 students in a classroom, then the bandwidth requirements for the server to support VoIP is 20 `*` 0.04 Mbits/sec = 0.8 Mbits/sec. If the user joins as Listen Only, they only receive audio (not transmit it).

From the perspective of the user's bandwidth needs, if a student is broadcasting their webcam and microphone they require a minimum (roughly) 0.3 Mbits/sec (.25 + .04) upstream bandwidth. If the student is in a session with four other people that are all broadcasting their webcams as well, the student will require the roughly 1 Mbits/sec incoming bandwidth for the 4 `*`0.25 = 1 Mbits/sec incoming webcams and 0.04 Mbits/sec for the incoming audio.

The BigBlueButton server will lower the bandwidth to a user if their bandwidth is insufficient to receive all stream. For example, in the scenario above where there are 5 students in a session, each sharing a webcam, if 4 students have sufficient bandwidth to receive all incoming webcam streams, their clients will show roughly the same quality of video. If one of the students is on a lower bandwidth, then they will get less frequent updates on the video streams and may get lower quality of audio. The user who is on lower bandwidth does not affect the streaming to other users.

#### What are the minimum bandwidth requirements for a user

For viewers (students), we recommend users have (at least) 0.5 Mbits/sec -- which is 500 Kbits/sec -- upstream bandwidth, and (at least) 1 Mbits/sec download bandwidth. The upstream bandwidth is the amount of bandwidth their computer has available to transmit data to the BigBlueButton server.

These are not hard and fast numbers, as it depends on the activity of the viewer. If the viewer is not broadcasting any webcam, the amount of upstream bandwidth used would be less than 0.5 Mbits/sec.

A good way for users to check their bandwidth is to visit [speedtest.net](https://speedtest.net/). The results from speedtest.net give the user's _actual_ bandwidth. This actual number is important because a user may report that their ISP provides them 0.5 Mbits/sec upstream bandwidth; however, speedtest.net may report an actual number that is much lower. The difference may be throttling by the ISP and background activity on their computer (such as background downloads, file sharing clients, etc).

For presenters, we recommend as much upstream bandwidth as possible. For example, if the presenter shares their desktop, then BigBlueButton's desktop sharing will attempt to publish their desktop updates as quickly as possible to the server.

#### Is wired connection better than wireless

Yes. A user may have very good experience with wireless internet, but if others hear their audio as broken or choppy, that user can either move closer to the wireless base station, try a different wireless network, or (best) connect directly to a wired connection.

Using public WiFi is not always best. It may be OK for surfing the web, but the latency and packet loss might be insufficient for real-time transmission of audio or video.

## Configuration

### What are the minimum requirements for the BigBlueButton client

For bandwidth, we recommend 1Mbits download and 0.5 Mbits upload speed. Users can test their actual bandwidth using [speedtest.net](https://speedtest.net/).

For hardware, we recommend a dual-core CPU with at least 2G of memory. We recommend any operating system capable of running the latest versions of Google Chrome and Mozilla FireFox.

For browser, we recommend running either FireFox, Chrome, or the latest Edge (which is based on Chromium). Why? These browsers provide excellent support for web real-time communications (WebRTC). On Mac OS X, the latest Safari will work as well, but FireFox and Chrome will deliver better audio in lower bandwidth conditions.

In short, if the user is having any problems (such as audio is garbled or they are periodically getting disconnected), we recommend trying either FireFox or Chrome. If the problems persist, it's likely an issue with their network. BigBlueButton will give them notifications to help troubleshoot.

### How many simultaneous users can BigBlueButton support

As a rule of thumb, if your BigBlueButton server meets the [minimum requirements](/administration/install#minimum-server-requirements), the server should be able to support 200 simultaneous users, such as 3 simultaneous sessions of 50 users, 6 x 25, etc. More concurrent users can be supported by using better servers and/or by using [load balancers](https://github.com/blindsidenetworks/scalelite#scalelite) for clusters of BigBlueButton servers.

As of BigBlueButton 2.5, we recommend no single sessions two-hundred (200) users.

Members of our community periodically host stress tests for BigBlueButton, which gives others a data point on what a particular server was able to handle. Take any stress test with a grain of salt. There are many variables at play:

- Server: CPU memory, disk space, and bandwidth
- Usage scenarios (# of webcams and use of desktop sharing)
- Upstream bandwidth from clients
- Configuration of BigBlueButton
- Version of BigBlueButton

The scalability of a BigBlueButton session also depends on what media users are sharing in a session. If you have a session with 20 users and all sharing their webcam, this scenario will generate 400 streams (20 incoming streams to the server and 380 outgoing streams). Alternatively, if in the same session there is only one person (the instructor) sharing their webcam, there will be 20 streams (1 incoming and 19 outgoing).

If you have a session with 20 users and all share their microphones, there will be 20 two-way audio stream being mixed by in real-time by FreeSWITCH. Alternatively, if only one user (the instructor) shares their microphone and 19 join Listen Only, then there is only one stream mixed by FreeSWITCH (less CPU), and 19 one way streams shared to the user.

If you are unsure of how many users your server will support, we **strongly** recommend you first stress test your own server with a group of users to get real-world data.

To test your own server, have five people login and have each open multiple browser tabs, each tab logging into BigBlueButton and joining the audio conference. With 5 friends, you can simulate 10, 20, 30, etc. users. You'll find once the CPU reaches 80%, the audio starts to degrade. When the audio starts to degrade, you've found the maximum number of users for your server.

For monitoring the server, please take a look at the [monitoring section](/administration/monitoring) or use other generic monitoring [tools](https://www.ubuntugeek.com/bandwidth-monitoring-tools-for-ubuntu-users.html) for Ubuntu Linux.

Additionally, you can see [commercial support](https://bigbluebutton.org/commercial-support/) for help in stress testing your server.

### Where is the admin interface for BigBlueButton

Since BigBlueButton is controlled by its [API](/development/api), there isn't an administrative panel for BigBlueButton. Most of the server maintenance functions are handled by [bbb-conf](/administration/bbb-conf).

The most common way to use BigBlueButton is to use an existing application that has a plugin. See [list of integrations](https://bigbluebutton.org/integrations/).

BigBlueButton also comes with an easy-to-use front-end called [Greenlight](/greenlight/v3/install).


### Where do I schedule a meeting in BigBlueButton?

There is no meeting database or user database in BigBlueButton.  All this business logic is handled by the front-end.

BigBlueButton does not know anything about a meeting until a front-end (such as Moodle) calls the 'create' API to create a meeting.  At that point BigBlueButton has a meeting in memory, but no users yet.  If no users join within a few minutes, BigBlueButton will automatically clear the meeting from memory.

Usually, the front-end joins users into the meeting by redirecting users (who presumably clicked on a join button in the front-end) to a valid 'join' API call on the BigBlueButton server.  The BigBlueButton server validates the join URL (it has a proper checksum and the meeting is active).

After the meeting is finished (all users leave, the meeting duration is reached, or a moderator has ended the meeting), BigBlueButton creates the recording (if requested) and clears the meeting from memory.

For handling meetings and users, BigBlueButton is stateless.  It is helpful to think of BigBlueButton like a web server.  You don't ask the web server "can I schedule the download of a file tomorrow at 2:00 PM".  Instead, you just request the file when needed.  The web server processes the request, forgets about it (after logging it), and proceeds to the next request.

This stateless nature of BigBlueButton keeps the architecture simple and makes it easier for you to upgrade your server.  You can upgrade or even replace your existing BigBlueButton server without breaking any front-end.  For example, you could back-up your recordings, replace your BigBlueButton server with a new server, restore the recordings, assign the server the same hostname and shared secret, and the front-end would not be able to tell the difference.


### Networking

#### How do I change the hostname of my BigBlueButton server

If you change the hostname (or IP address) of your BigBlueButton server, you can easily change all the related BigBlueButton configuration files using the [bbb-conf tool](/administration/bbb-conf).

#### We recommend running BigBlueButton on port 80/443

We recommend running BigBlueButton on port 80/443 -- specifically, having the nginx server in a BigBlueButton server bind to port 80/443. In other words, we recommend against running BigBlueButton on port 8081, 8088 or another port.

Prior to 0.8, `bbb-conf` would let you configure BigBlueButton to run on a different port, but that lead to a number of problems that are not immediately obvious:

1. Port conflicts with existing applications
2. Resource contention with existing applications

To an experienced system administrator, the above problems are not insurmountable, but most people setting up BigBlueButton are not experienced system administrators. Therefore, changing the port results in clients being unable to connect, BigBlueButton doesn't load, and/or performance is less than expected (because of resource contention).

Sometimes these problems do not manifest themselves immediately. In the past, we've had people posting to our forums describing how their BigBlueButton server occasionally has problems or does not let users connect. In some cases, after a lengthy exchange of posts/e-mails back and forth, they would grant us temporary remote access to their server to try and figure out the error in BigBlueButton. Only then would we discover the server is running multiple web applications that are conflicting with BigBlueButton's configuration, significantly reducing the resources available to BigBlueButton or both. In these cases, there was no error with BigBlueButton, but in the configuration.

We understand that administrators want to run multiple applications on a single server. This makes sense when you are running multiple web-based applications. If a web application returns a web page in 350 milliseconds instead of 250 milliseconds due to resource contention, the perceptual difference to the user is minimal. At worst, the user will think your web application is a little slow, but it still works.

However, BigBlueButton is a real-time application processing voice and video. The human ear is very attuned to delays in audio. If BigBlueButton is returning audio packets later than normal or the audio becomes garbled because the CPU is unable to process the audio packets quickly enough due to resource contention, a delay in audio is much more perceptible to a user than a delay in loading a web page.

For the above reasons, we recommend you setup BigBlueButton on a dedicated server listening to port 80/443. We also recommend you not run any other applications (such as plesk) on the same server.

#### What ports must be open for external users to connect to BigBlueButton

For TCP ports, clients must be able to connect to the BigBlueButton server on port 80/443 (HTTP/HTTPS).

For UDP ports, clients must be able to connect on a port within the range 16384-32767 for WebRTC-based audio.

#### Does BigBlueButton support tunneling

Yes. See [Configure the firewall](/administration/install#configure-the-firewall-if-required).

#### Does BigBlueButton provide secure collaboration?

There are multiple security mechanisms in BigBlueButton.

When the BigBlueButton server is secured with an transport level security (TLS) certificate, all content download from the server to the user's browser occurs via hypertext transport protocol secure (HTTPS). We provide an installation script for BigBlueButton that can automate the setup of the TLS certificate (see [bbb-install.sh](https://github.com/bigbluebutton/bbb-install)).

When a front-end makes an API request to BigBlueButton, the BigBlueButton server validates the incoming server checksum computed from a shared secret (see [API Security Model](/development/api#api-security-model)). If the checksum match fails, the request is ignored.

When the BigBlueButton client loads, it makes data connections back to the BigBlueButton server using a web socket connection encrypted HTTPS. When the BigBlueButton shares the user's audio, video, or screen, the browser uses the built-in web real-time communication (WebRTC) libraries that transmit real-time protocol packets (RTP) over user datagram protocol (UDP) via Datagram Transport Layer Security (see [DTLS](https://en.wikipedia.org/wiki/Datagram_Transport_Layer_Security)). Furthermore, to provide communications privacy for datagram protocols the media packets are encrypted using the Secure Real-Time Protocol (see [SRTP](https://en.wikipedia.org/wiki/Secure_Real-time_Transport_Protocol)).

As described above, by saying there are _multiple_ security mechanisms BigBlueButton, does this mean BigBlueButton offers secure collaboration? No. No system is really secure, there are only levels of security. We care about security in the BigBlueButton project, and if you detect any security vunerabilities in the project, you can make a responsible disclosure by emailing us at security@bigbluebutton.org.


### Front Ends

#### Does BigBlueButton come with a front end?

![greenlight-start](/img/greenlight/v2/gl-start.png)

#### Can I run multiple virtual classrooms in a single BigBlueButton server

Absolutely. To see an example of this, check out [GreenLight on our pool of demo servers](https://demo.bigbluebutton.org/gl). You can start numerous different rooms and they will be spread over the pool of servers but some of them will be on the same server. If the pool only had one server, all of your virtual classrooms would be on the same server.

#### How do I setup new classrooms in BigBlueButton

If you are using Sakai, Moodle, Drupal, Joomla, Wordpress or other systems that already have a [BigBlueButton integration](https://bigbluebutton.org/support), then installing the integration provides the easiest way to enable your users to access BigBlueButton sessions.

Alternatively, you can set up [Greenlight](/greenlight/v3/install) to be able to easily manage classrooms.

#### How do I integrate BigBlueButton with my own server

BigBlueButton provides an [API](/development/api) for integration with other web-based applications.

The best approach is to see how others have integrated and adapt their code to your integration. Don't you just love open source!

### Server Configuration

#### Does BigBlueButton offer permanent sessions

The BigBlueButton server does not support persistent or permanent sessions where users can leave and return the next day, for example, and have their slides and chat messages persist.

This is by design. Why is this the case? This design makes it easy for system administrators to upgrade or replace a BigBlueButton server without migrating/updating any database. As an analogy, the BigBlueButton server works like a web server. When loading content from a web server, you don't tell a web server "I need to load a file at 2:00 PM tomorrow"; rather, you just load a file when needed. The web server responds to the request and, when finished, it forgets about the request and moves onto the next.

It's similar with the BigBlueButton server. The lifespan of a session on the BigBlueButton server begins when a front-end sends a `create` API request to the BigBlueButton server. Once a room is created (the `create` request succeeded), users can join the session and interact within the session. The session ends (and is cleared from the server's memory) when the last person leaves.

## Using BigBlueButton

### Accessibility

We designed BigBlueButton to be accessible to users with visual and/or audible disabilities.

BigBlueButton supports both JAWS and NVDA screen readers. When using a screen reader, we recommend using Internet Explorer or the 32-bit version of FireFox. The 64-bit versions of FireFox and Chrome make it harder for screen readers to interact with the BigBlueButton client.

BigBlueButton supports [live closed captioning](https://www.youtube.com/watch?time_continue=1&v=feC_zm1y3N4). A stenographer can join the session and provide a live caption stream to all users (you can have multiple stenographers simultaneously providing captioning in multiple languages). Later on, when BigBlueButton processes the recording, it will convert the closed captions to subtitles in the playback.

For a full statement on our accessibility see [https://bigbluebutton.org/accessibility/](https://bigbluebutton.org/accessibility/).

### Screen Sharing

#### What is needed to run desktop sharing

BigBlueButton using WebRTC for sharing audio, video, and screen. You should be able to share your screen using Chrome, FireFox, and the newest version of Edge (based on Chromium). You don't need to install any plugin or download any additional binary to share your screen.

At the time of this writing, you can view the presenter's screen on mobile devices, but not share the mobile screen.

#### Can I share a specific window when sharing my desktop

While you can't choose a specific window, on Windows you can share a specific region of your desktop and place the window within that region.

### Presentations

#### Can I upload Microsoft Office documents to BigBlueButton

Yes. BigBlueButton uses LibreOffice 4.3 for converting Microsoft Office documents into PDF for display in BigBlueButton.

If possible, for best results, save your Word or PowerPoint document as PDF. If you are using Office 2007, we recommend using Microsoft's free download to enable Office 2007 to save any document to PDF: [download link](https://www.microsoft.com/downloads/details.aspx?FamilyID=4d951911-3e7e-4ae6-b059-a2e79ed87041&displaylang=en).

You'll always get the best results with PDF.

#### Will my animations and videos in PowerPoint convert when uploaded

When you upload a PowerPoint document, BigBlueButton will convert it to PDF (using LibreOffice) and then finally to scalable vector graphics (SVG) for display within the client.

The conversion to PDF will remove any animations (visual or audio), links, and embedded content. At the end of the conversion, you'll see the final slide within BigBlueButton.

As the presenter, if you want to share a YouTube or Vimeo video, use the built-in `Share an external video` feature (Select the '+' button to see this option).

#### I uploaded a document but some fonts are missing after conversion

If you upload a PDF document, all your fonts will come through with the document. In other words, for best results, if possible always create a PDF and upload it for conversion.

If you upload a Word or Power Point document that has special fonts, such as Chinese language, the document must first be converted by LibreOffice into PDF. Unless you've configured the LibreOffice server running within BigBlueButton to have the necessary fonts, then you will see empty spaces (or boxes) for the missing fonts.

To add Japanese fonts, enter the following commands on the BigBlueButton server.

```bash
$ sudo apt-get install libreoffice-l10n-ja
$ sudo apt-get install fonts-ipaexfont
$ sudo bbb-conf --restart
```

#### Does BigBlueButton support multi-user whiteboard

Yes.

### Video

#### I'm on Ubuntu and I can't share my webcam

See Ubuntu's documentation for [Webcam Troubleshooting](https://help.ubuntu.com/community/Webcam/Troubleshooting).

### Voice Conference

#### Why can't others hear me in the voice conference

If others in the voice conference don't hear you when you speak, it's likely that the browser has picked the wrong microphone on your computer. You can click the phone icon twice -- once to leave and a second time to rejoin -- to try joining the audio again. When you see the echo test, if you can't hear yourself, click "no" and select a different microphone.

#### Why do others only hear part of my audio

FreeSWITCH has automatic audio clipping, which means it will not transmit a speaker's audio if the volume is too low. If the speaker's audio is low, FreeSWITCH might take a moment to recognize that someone is speaking before transmitting, causing others to hear your audio only after you have started speaking a few words.

You can also change the settings on FreeSWITCH to lower default threshold for audio. To lower the threshold, switch to the root account, then edit

```
 /opt/freeswitch/conf/autoload_configs/conference.conf.xml
```

and set energy-level to a lower value (e.g. 100)

```xml
   <profile name="wideband">
     <param name="energy-level" value="100"/>
```

Save the file, then do `sudo bbb-conf --restart` to restart BigBlueButton.

#### Why is there an echo in the voice conference

In BigBlueButton, we use the built-in acoustic echo cancellation, so in most cases, you should not hear any echo from remote users.

In any event, we always recommend that you have your remote users use a headset with microphone. This will ensure the best audio in a session.

If a remote user is using a laptop with a built-in microphone, you should not hear an echo. However, if two remote users are using laptops with built-in microphones and neither is using a headset and both are sitting close to each other (close enough for the microphone in one laptop to pickup the audio from the speakers in the other laptop), then you will hear an echo. The reason is the built-in echo cancellation only works with the audio coming from the host laptop -- the audio coming from the second laptop will be picked up as an external audio source.

If a student is causing echo, the best way to solve this problem, if you are logged in as a moderator, is to mute the user by clicking the microphone icon to the left of their name.

Overall, the best solution is to ask all users to use a headset -- this will ensure no background noise or echo.

#### How do I get the best audio

Use FireFox or Chrome.

Both these browsers support web real-time communications (WebRTC) audio. BigBlueButton will use WebRTC for audio if the user is on FireFox or Chrome browser.

### Record and Playback

#### Where is the record button

In BigBlueButton, the external application that uses the BigBlueButton API can now pass an additional parameter `record=true` when creating a session. This additional parameter instructs the BigBlueButton server to record the session and make a recording available through subsequent [getRecordings](/development/api#getrecordings) calls.

There is no user interface for the presenter to turn on or turn off a recording.

When instructed through the API call, the BigBlueButton server will record all of the meeting, from the time the first person joins to when the last person leaves. A meeting may also end when it reaches its duration or the [end](/development/api#end) is called on the meeting.

#### What parts of the session does BigBlueButton record

BigBlueButton records all activity in the presentation, chat, webcams, and desktop sharing for playback.

#### What browsers support playback

BigBlueButton supports playback in Chrome and FireFox.

In BigBlueButton, the audio from a recorded session is encoded into [Vorbis](https://en.wikipedia.org/wiki/Vorbis), an open source audio format that is not patent-encumbered. Playback of Vorbis audio is supported in FireFox and Chrome, but not IE and Safari.

BigBlueButton will playback the webcams from a session using the WebM container, which, thanks to Google, provides a high-quality open source video codec VP8. Playback of video in VP8 is supported by FireFox and Chrome (see the [HTML5 video](https://en.wikipedia.org/wiki/HTML5_video) Wikipedia article). If you want to support playback of recordings for Safari mobile users on iOS, see [Enable playback of recordings on iOS](/administration/customize#enable-playback-of-recordings-on-ios).

#### What is the disk space usage for storing one hour of recordings

Storage values for different types of session in BigBlueButton 0.81.

The file sizes are for a one hour session. When a recorded session ends, BigBlueButton archives all the raw content, then runs the recording scripts to create a publish format (presentation).

| Media Shared              | Archive  | Publish | Total    |
| :------------------------ | :------- | :------ | :------- |
| audio                     | 111 MB/h | 11 MB/h | 122 MB/h |
| audio + webcam (1 webcam) | 131 MB/h | 51 MB/h | 182 MB/h |
| audio + desktop sharing   | 236 MB/h | 73 MB/h | 309 MB/h |

##### Archive

For audio, the storage of the audio stream is 110 MB/h. The storage is a .wav file.

For audio + webcam, the additional storage is for saving each individual webcam stream. A one hour webcam stream at the default resolution (320x240) is 20M.

For audio + deskshare, the additional storage is for the desktop sharing stream (there will only be one stream at any one time). A one hour desktop sharing stream is 125M.

##### Playback

For playback, the audio, webcams, and desktop share are processed into a single playback file WebM (VP8 Codec).

For audio only, the WebM file is 5.4M. There is an additional Vorbis Audio File that is 5M.

For audio + webcam only, there is a single webM file that is 51M.

For audio + desktop sharing, there is a single WebM that is 72M.

#### Can I see the total time of the session

The information displayed during playback is browser-specific.

In Chrome, the audio playback component shows only the current time index for the playback. To see the overall length of the session, you can scrub to the end of the audio after the audio file has loaded.

In FireFox, the audio playback component shows both the current time index and total time of the audio file.

#### How do I modify the default playback format

The ingest and processing scripts, written in Ruby, process the recorded events and media to create a playback option. The default scripts, called `presentation.rb` (there is a script for processing and publishing), are located in

```
/usr/local/bigbluebutton/core/scripts/process/presentation.rb
/usr/local/bigbluebutton/core/scripts/publish/presentation.rb
```

BigBlueButton uses popcorn.js, an HTML5 media framework, for playback.

By modifying presentation.rb, you could, for example, exclude chat from the layout, add themes or colors, change the layout of the HTML5 web page, add a download link to the content, etc.

#### How do I download a recorded session

When looking to download a recorded session, most expect a single link to download the video file.

In contrast, BigBlueButton does not create a video file for playback. Video files for a three hour lecture can get very large. Instead, BigBlueButton creates an HTML5 page that references PNG images and audio, and time indexes the PNG images against the audio to match their display in the session. The result is the source playback files are very small and can be hosted on any web server. The drawback is there will be a pause for the browser to download all this content, but, once downloaded, there is no more load on the web server.

### Other

#### Why does content not persist between sessions

BigBlueButton does not store any content -- such as chat, shared notes, uploaded slides, annotations, etc. -- between sessions. When you end a meeting and start a new one, you have a new meeting with a clean slate.

Starting every meeting as a new meeting is by design. To understand why, it's helpful to think of BigBlueButton like a web server. A web server does not hold state between requests (other than logging the request). This makes the architecture of the web server much simpler and easier to extend: the web server can focus on serving as many requests as possible in parallel as efficiently as possible.

In a similar manner, the BigBlueButton server focuses on running many parallel meetings as efficiently as possible. If the meeting was recorded, then a separate process will later convert the saved meeting into a recording. In contrast, if the BigBlueButton server did store state from past meetings, that storage would have to be maintained, updated, and migrated when the server is upgraded. There would be privacy issues as well -- how to keep the stored state, and how to administer it for privacy requests (this would likely require a separate interface). Overall, the design of the BigBlueButton would be more complex. Also, load balancing (such as with [scalelite](https://github.com/blindsidenetworks/scalelite)) would be more difficult as every BigBlueButton server would share a central object store for all the past meetings.

The API does allow for a front-end to pre-upload a presentation, which gives the moderator the ability to customize meetings with the same presentation.

In short, this stateless approach makes the overall architecture of BigBlueButton much simpler, and simple is good for focusing on speed, stability, maintainability of code, privacy, and focusing resources on building out features important to instructors.

## Developing BigBlueButton

### Setup

#### Setting up the dev environment

See [Developing BigBlueButton](/development/guide) for full instructions.

#### Where can I download the latest build

You can checkout the latest code from Git. See [BigBlueButton GitHub repository](https://github.com/bigbluebutton/bigbluebutton).

## Troubleshooting

### Connectivity

#### Users do not appear in the listeners window

For a user to appear in the listener's window, the 3rd party application using the BigBlueButton API to create a room must pass a `voiceBridge` parameter with the `create` call. See [create meeting](/development/api#create) call. This is done using the [built-in API demos](/administration/install#6.-install-api-demos).

Next, BigBlueButton must successfully connect to FreeSWITCH's SIP port and FreeSWITCH's Event Socket Layer. To resolve connection problems, see question below.

### Audio

#### When I click on the headset icon, nothing happens

First, as with most errors, run

```bash
$ sudo bbb-conf --check
```

To see if it can determine configuration errors.

If you are running BigBlueButton on EC2, then note that EC2 uses both a public and private IP address. For example, on an EC2 instance if you type `ifconfig` you'll see that eth0 is bound to an internal private IP address.

Here's a sample output:

```
eth0      Link encap:Ethernet  HWaddr 12:31:33:22:25:c2
          inet addr:10.242.78.44  Bcast:10.242.7.255  Mask:255.255.254.0
          inet6 addr: fe80::1034:33ff:fd02:23c2/64 Scope:Link
          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
          RX packets:4004469 errors:0 dropped:0 overruns:0 frame:0
          TX packets:5024657 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1000
          RX bytes:642594447 (642.5 MB)  TX bytes:2670592958 (2.6 GB)
```

See [audio is not working](/administration/install#audio-not-working) for how to resolve this.

#### I have two microphones and want to choose one to join the voice conference

When you're inside the client, right-click, go to Settings > Microphone Icon > select your microphone, and talk to see if it works by checking the volume bar.

#### Some users are experiencing audio problems

When using FireFox or Chrome, BigBlueButton uses the high-quality OPUS codec that transmits and receives audio packets over UDP.

To setup BigBlueButton for external users, such as on-line classes, we recommend running BigBlueButton on a dedicated (non-virtual) server with 250M bits/sec bandwidth to/from the server. Furthermore, we remote users have a minimum upstream bandwidth of 0.5 Mbits/sec and downstream bandwidth of 1.0 Mbits/sec.

When remote users experience audio problems, check the following areas:

1. Check CPU availability on your BigBlueButton server

Login to your BigBlueButton server during a session and watch it's CPU using the command `top`. When running `top`, press '1' to see a list of all CPUs and their load. You should see Cpu0, Cpu1, etc. If you are running a quad-core CPU with hyper-threading (recommended), you'll see eight virtual CPUs.

The overall CPU usage should stay below 70%. If the overall CPU usage consistently stays above 70%, you'll likely get audio troubles as the BigBlueButton server will not have enough available CPU to keep up with the audio packets.

If your BigBlueButton server is virtualized, there is no guarantee how much CPU time your server gets. If you are sharing the CPU of your BigBlueButton server with other virtualized servers on the host, it will take longer for BigBlueButton to process audio packets. This setup may also affect audio quality.

2. Check bandwidth provided to BigBlueButton server's ISP

To test your server's bandwidth, you'll need a second server on the internet that has at least as good bandwidth as your server. Make sure the second server is external and uses the ISP internet connection. When there is no significant network activity on your BigBlueButton server (such as no active BigBlueButton sessions), try transferring a large file to/from your BigBlueButton server to the second external server using `scp`. This will give you a rough estimate of the maximum transfer rates. Check with your ISP if these transfer rates are low.

Next, try monitoring your server's traffic during the beginning of a class. There are many Unix commands to monitor traffic, one of which is `bmon`.

```bash
$ sudo apt-get install bmon
```

`bmon` will show you the amount of incoming data (RX rate) and transmitted (TX data) in kilobytes or megabytes, so you'll need to multiply by 8 to get bits/sec.

As BigBlueButton users join the audio on your server, you should see **both TX and RX numbers increase**. If you don't see these numbers increase when new users join or, for example, when a presenter uploads new slides, or when someone shares a webcam, etc. then you have hit the bandwidth cap on your server. At this point, the audio for all users will start to degrade as there is insufficient bandwidth for new users or any common operations (such as uploading slides).

For getting a better estimate of the amount of bandwidth required for your users, see [this FAQ entry](#what-are-the-bandwidth-requirements-for-running-a-bigbluebutton-server).

3. Check Network connection for clients

You may have a dedicated server with sufficient bandwidth, but if a remote users' internet connection is poor, their audio quality will not be good.

We recommend that users have 0.5 Mbits/sec upload speed and 1.0 Mbits/sec download speed. Of course, these are not hard numbers, and BigBlueButton will certainly work with less bandwidth, but if your clients have bandwidth in this range, they should experience good audio.

To test a user's actual internet bandwidth, have them visit https://speedtest.net/. The results at https://speedtest.net/ will give a fairly accurate test of the user's upload and download speeds. If these numbers are much less than 0.5 Mbits/sec upload speed and 1.0 Mbits/sec download speed, their audio will be poor. One quick check is to ask users to turn off any file transfer they have in the background (such as bittorrent clients) and run the test again.

Many times, issues with audio quality can be solved with better network connectivity. Check if the user transmitting audio is on a wireless connection. Have the switch to a wired connection, if possible, or move closer to the wireless base station.

Also, if the user's client takes over a minute to load, they are likely tunnelling through port 80, which will further degrade the audio.

In general, if all users are encountering audio problems, the issue might be with the BigBlueButton CPU being overloaded or the bandwidth to the BigBlueButton server is saturated.

If a specific user is having poor audio quality (i.e. only their audio is choppy but everyone else sounds good), have the individual do a speed test. Furthermore, if possible, if you are in the session with them and can verify their audio is poor, have them cross-check using demo.bigbluebutton.org (which is on a dedicated, high-bandwidth connection). Specifically, have that user create and join to a [GreenLight rooms](https://demo.bigbluebutton.org/gl), join them in the room, and check their audio again. If the audio sounds better, then it might be the user's internet connection to/from your BigBlueButton server is dropping more packets than to/from the BigBlueButton demo server.

4. Check the browser

We recommend that users use FireFox or Chrome for transmitting/receiving the best audio. Both these browser support web real-time communications framework.

### Presentation

#### Why can't I resize my portrait document

BigBlueButton is designed so the viewers of the presentation window are always in sync with the presenter's view. It's not possible for the presenter to point at something and a viewer to say "I don't see what you are pointing at".

To keep the presentation windows in sync, when you upload a presentation (landscape or portrait), the size of the presentation window becomes a ratio of the presentation. You and the viewer may have different sized windows, due to the sizes of your respective monitors, but you both always see the same content.

For landscape documents, the "fit to page" approach works well. Monitors are landscape, so presenting a landscape document makes good use of the screen space.

However, for portrait documents, the "fit to page" approach means that text is usually too small to read. The presenter can zoom in to a portion of the document, but BigBlueButton does not change the width of the presentation window itself -- it's keeping that ratio to ensure both presenter and viewer are in sync.

We plan to add a "fit to width" option in BigBlueButton in a future iteration, one that both keeps the viewers and presenters in sync, but allows the presenter to better show portrait documents.

### Administration

#### bbb-conf --check reports Host IP does not match BigBlueButton

This is really more of a warning than an error. If you are using a DNS name, and that DNS name resolves to the IP address, or you have an external DNS name that is port forwarded to BigBlueButton, you can safely ignore the warning.

#### Which log files should I check for errors

Log and configuration file information can be found [here](/administration/configuration-files).

### Other Questions

#### When will feature X be implemented

BigBlueButton is built by a group of (very determined) open source developers that volunteer their time to the project. Some of us also work for companies that provide [commercial support](https://bigbluebutton.org/support) for BigBlueButton.

We want to make BigBlueButton the leading open source web conferencing system for on-line learning. That's no small task, but we've been focused since 2008 on this goal. Today, BigBlueButton is used all around the world and localized into over 50 languages.

Time is a precious commodity. In general, when planning each release, we look at the outstanding issues and group them in three categories (in order of priority)

1. What are the most important items on our [road map](/support/road-map) (these are the features that best support our target market of on-line learning)?
2. What refactoring/features by the [core committers](#bigbluebutton-committer) are needed to improve the code base/maintainability/usability of the product?
3. What features are our community asking to implement (specifically, those not related to distance education, but would be useful to some, such as remote desktop control)?

For a detailed breakdown of the features (and bug fixes) in the pipeline, see our [issue tracker](https://github.com/bigbluebutton/bigbluebutton/issues). If the feature you are requesting is not already requested as an issue, you could open a [new issue](https://github.com/bigbluebutton/bigbluebutton/issues) and make a convincing argument that the feature belongs in (1), (2), or (3).

Also, if you are a commercial company that builds upon BigBlueButton for your own products, you can engage one of the companies that provide [commercial support](https://bigbluebutton.org/commercial-support/) to accelerate your feature.

For (2), often we'll revisit a previously implemented feature to improve its performance or refactor its code. This work usually occurs when we want to enhance a feature (we usually refactor it when doing so) or add new capabilities (such as refactoring the underlying messages to support the HTML5 client).

If your feature belongs in category (3), you have options. BigBlueButton is an open source project: if you (or your organization) want to improve BigBlueButton, we welcome your contribution. See [Contributing to BigBlueButton](#contributing-to-bigbluebutton). If you want to engage other companies to accelerate the feature, see the companies that provide commercial support.

#### How can I donate money to the project

The BigBlueButton project does not accept donations. We think it's a poor business model for running an open source project as it suggests the developers are working for charity.

If you want to help the project financially, you can approach some of the companies offering [commercial support](https://bigbluebutton.org/support) for BigBlueButton and engage their services. Doing so creates a healthy ecosystem around the project where companies are encouraged to contribute their resources to improve the project to create a larger pool of potential customers wanting their services.

We appreciate positive feedback on our project as well. If you are on Twitter, send us a tweet to `@bigbluebutton`. That helps raise awareness of our project so others can benefit from it as well.

#### How do I change the brand of BigBlueButton

To brand BigBlueButton, setup the [development environment](/development/guide) to create your own version of the HTML5 client. You can use the browser's inspect tools to see where each item you want to brand is loaded.


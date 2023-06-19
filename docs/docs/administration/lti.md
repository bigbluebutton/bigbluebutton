---
id: lti
slug: /administration/lti
title: BigBlueButton LTI
sidebar_position: 9
description: BigBlueButton LTI
keywords:
- lti
---

## Overview

BigBlueButton can accept incoming LTI launch requests from a tool consumer, which is the IMS term for any platform that can make an LTI request to an external tool.  

Such platforms include Open edX, Desire2Learn, BlackBoard, Pearson Learning Studio, etc.

What this means is that with no custom code, any LTI compliant platform can integrate BigBlueButton virtual classrooms to its system.

### Installation of LTI components 

There are two components for LTI integration that you need to install on your BigBlueButton server.
  - [bbb-lti-broker](https://github.com/bigbluebutton/bbb-lti-broker)
  - [bbb-apps-room](https://github.com/bigbluebutton/bbb-app-rooms)

The broker component handles the incoming launch, while the rooms component handles the rendering of the interface to the educator and student. 

When installing using [bbb-install-2.6.sh](https://github.com/bigbluebutton/bbb-install#bbb-install), you can add the parameter `-t` to add LTI credentials have have `bbb-install-2.6.sh` install the above components for you.

```
-t <key>:<secret>      Install BigBlueButton LTI framework tools and add/update LTI consumer credentials <key>:<secret>
```

After using the `-t` option, you can access the LTI launch URL by opening the URL `https://<hostnam>/lti`.  With the LTI launchh URL, key, and secret, you can test the LTI integration using the [TUSGI test](https://www.tsugi.org/lti-test/lms.php) page.

For more details on the configuration of the LTI integration for BigBlueButton, see the README files for [bbb-lti-broker](https://github.com/bigbluebutton/bbb-lti-broker) and [bbb-apps-room](https://github.com/bigbluebutton/bbb-app-rooms).

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

BigBlueButton is [certified](https://site.imsglobal.org/certifications/bigbluebutton-inc/36891/bigbluebutton) by IMS Global to support IMS Learning Tools Interoperability (LTI) 1.0.

![imscertifiedsm](/img/imscertifiedsm.png)

BigBlueButton can accept incoming LTI launch requests from a tool consumer,
which is the IMS term for any platform that can make an LTI request to an external tool (such as BigBlueButton).
Such platforms include Desire2Learn, BlackBoard, Pearson Learning Studio, etc.
See [IMS Interoperability Conformance Certification Status](https://www.imsglobal.org/cc/statuschart.cfm)
for a full list of LTI compliant platforms.

What this means is that with no custom code, any LTI compliant platform can add BigBlueButton virtual classrooms to its system.
For example, the following video shows how BigBlueButton uses LTI to integrate with BlackBoard,
click [BigBlueButton LTI video](https://www.youtube.com/watch?v=OSTGfvICYX4&feature=youtu.be&hd=1).

### Installation of LTI module

You can add LTI support by installing the following package.

```bash
$ sudo apt-get install bbb-lti
```

This should configure the LTI tool for your setup. If you need to make any custom modifications, edit `/var/lib/tomcat7/webapps/lti/WEB-INF/classes/lti.properties` (BigBlueButton 2.0) or `/usr/share/bbb-lti/WEB-INF/classes/lti-config.properties` (BigBlueButton 2.2).

You'll see the following parameters

```properties
bigbluebuttonURL=https://bbb.example.com/bigbluebutton
# Salt which is used by 3rd-party apps to authenticate api calls
bigbluebuttonSalt=8cd8ef52e8e101574e400365b55e11a6

# LTI basic information
#----------------------------------------------------
# This URL is where the LTI plugin is accessible. It can be a different server than the BigBluebutton one
# Only the hostname or IP address is required, plus the port number in case it is other than port 80
# e.g. localhost or localhost:port
ltiEndPoint=bbb.example.com
# The list of consumers allowed to access this lti service.
# Format: {consumerId1:sharedSecret1}
ltiConsumers=bbb:b00be971feb0726fa697671c9cf2e883
```

| Parameter         | Type | Description                                                        |
| :---------------- | :--- | :----------------------------------------------------------------- |
| bigbluebuttonURL  | text | URL to the BigBlueButton server (must end in /bigbluebutton)       |
| bigbluebuttonSalt | text | The shared secret to the BigBlueButton server for making API calls |
| ltiEndPoint       | text | The hostname for the LTI endpoint from which to receive calls.     |
| ltiConsumers      | text | The combination of Key and Share Secret                            |

This is the same configuration for the LTI parameters shown in the next section.

You can also user `bbb-conf --setip` and `bbb-conf --salt` to set the `bigbluebuttonURL` and `bigbluebuttonSalt` parameters for the LTI module.

If you make modifications to your own lti.properties, be sure to restart `bbb-lti` service to reload the lti.properties file.

## Configuring BigBlueButton as an External Tool

All LTI consumers have the ability to launch an external application that is LTI-compliant.
BigBlueButton is [LTI 1.0 compliant](https://www.imsglobal.org/cc/detail.cfm?ID=172).

This means that your BigBlueButton server can receive a single sign-on request that includes roles and additional custom parameters.
To configure an external tool in the LTI consumer, you need to provide three pieces of information:
URL, customer identifier, and shared secret.
After installing the `bbb-lti` package, you can use the command `bbb-conf --lti` to retrieve these values.

Here are the LTI configuration variables from a test BigBlueButton server.

```bash
$ bbb-conf --lti

    URL:    https://demo.bigbluebutton.org/lti/tool
    Key:    bbb
    Secret: b00be971feb0726fa697671c9cf2e883

    Icon URL: https://demo.bigbluebutton.org/lti/img/icon.ico
```

In the external tool configuration, we recommend privacy settings are set to **public**
to allow the LMS to send lis_person_sourcedid and lis_person_contact_email_primary.
The `bbb-lti` module will use these parameters for user identification once logged into the BigBlueButton session.
If none of them is sent by default a generic name is going to be used (Viewer for viewer and Moderator for moderator).

An important note is that if your LTI consumer uses https, as the LTI tool is displayed in an iframe, you will see only a blank page.
In that case you can configure the link to open the tool in a different window (most LTI consumers allow it)
or use https with the URL provided (e.g. `https://demo.bigbluebutton.org/lti/tool`).

## Launching BigBlueButton as an External Tool

The LTI launch request passes along the user's role (which `bbb-lti` will map to the two roles in BigBlueButton): moderator or viewer.

If no role information is given, or if the role is privileged (i.e. . Faculty, Mentor, Administrator, Instructor, etc.),
then when `bbb-lti` receives a valid launch request,
it will start a BigBlueButton session and join the user as **moderator**.
In all other cases, the user will join as a **viewer**.

### Custom Parameters

The `bbb-lti` module also accepts a number of custom parameters.

| Parameter      | Type    | Description                                                                                                                                                                                                                                                                                               |
| :------------- | :------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| record         | Boolean | Record meeting (default is false). When this value is `true`, then when the user clicks the LTI link, they will first see an intermediate page showing a list of all the recordings. From within that page they can view past recordings and join the meeting.                                            |
| duration       | Integer | Meeting duration. An integer number defines the number of minutes the session is going to last. When reached the number of minutes all the users are kicked off. If parameter is not set or is set to 0 the value taken is the one in the server                                                          |
| welcome        | Text    | Welcome message that appears in chat dialog (default is the global welcome message on the BigBlueButton server)                                                                                                                                                                                           |
| voicebridge    | Integer | An integer number can be used to define the voicebridge the session is going to have (Be aware that this number must be unique for the Meeting and the BigBlueButton server)                                                                                                                              |
| mode           | String  | simple or extended - When using the launching link, if mode is set to simple only single sign on will be executed, if it is set to extended and record is true, the interface for recordings will be shown as a pre-launching page. The value by default is the one configured in the lti.properties file |
| all_moderators | Boolean | Defines that all users are going to be moderators (default is false, meaning that the role in bigbluebutton will be assigned according to the role in the LMS)                                                                                                                                            |

For example, if you add `record=true` to as a custom launch parameter, then then `bbb-lti` module will record your session and show you a list of previously recorded sessions.

### Using bbb-lti on HTTPS

The `bbb-lti` module has the ability to work with HTTP or HTTPS out of the box, but there is a consideration that needs to be kept in mind.

As the OAuth checksum is calculated including the protocol used through the launch, the LTI application identifies if the request was made using HTTP or HTTPS and uses the corresponding protocol to build the URL that will be used to validate the checksum received.

When `bbb-lti` runs on Tomcat (which is the case when it is installed by packaging on the same BigBlueButton server) and HTTPS is configured using nginx as a proxy, Tomcat needs to receive a forwarded header variable `X-Forwarded-Proto` that is passed to the application.

By default the nginx embedded variable `$scheme` is used and it comes preconfigured in the file `lti.nginx` (that can be found at `/etc/bigbluebutton/nginx/`).

as

```nginx
   proxy_set_header   X-Forwarded-Proto $scheme;
```

When using HAProxy the variable `$http_x_forwarded_proto` shall be used instead

```nginx
   proxy_set_header   X-Forwarded-Proto $http_x_forwarded_proto;
```

If a different web server or proxy server is used, make sure of passing the protocol to tomcat.

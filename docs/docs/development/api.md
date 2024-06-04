---
id: api
slug: /development/api
title: API Reference
sidebar_position: 4
description: BigBlueButton API Reference
keywords:
- api
---

import APITableComponent from '@site/src/components/APITableComponent';
import createEndpointTableData from '../data/create.tsx';
import deleteRecordingsEndpointTableData from '../data/deleteRecordings.tsx';
import endEndpointTableData from '../data/end.tsx';
import getMeetingInfoEndpointTableData from '../data/getMeetingInfo.tsx';
import getRecordingsEndpointTableData from '../data/getRecordings.tsx';
import getRecordingTextTracksEndpointTableData from '../data/getRecordingTextTracks.tsx';
import insertDocumentEndpointTableData from '../data/insertDocument.tsx';
import isMeetingRunningEndpointTableData from '../data/isMeetingRunning.tsx';
import joinEndpointTableData from '../data/join.tsx';
import publishRecordingsEndpointTableData from '../data/publishRecordings.tsx';
import putRecordingTextTrackEndpointTableData from '../data/putRecordingTextTrack.tsx';
import updateRecordingsEndpointTableData from '../data/updateRecordings.tsx';

## Overview

This document describes the BigBlueButton application programming interface (API).

For developers, this API enables you to

- create meetings
- join meetings
- end meetings
- insert documents
- get recordings for past meetings (and delete them)
- upload closed caption files for meetings

To make an API call to your BigBlueButton server, your application makes HTTPS requests to the BigBlueButton server API endpoint (usually the server's hostname followed by `/bigbluebutton/api`). All API calls must include checksum computed with a secret shared with the BigBlueButton server.

The BigBlueButton server returns an XML response to all API calls.

### Updates to API in BigBlueButton

Updated in 0.9.0:

- **join** - `configToken` can now reference a file in `/var/bigbluebutton/configs`, such as `myconfig.xml`.
- **create** - Added three parameters: `moderatorOnlyMessage` to display message only visible to moderators and `autoStartRecording`/`allowStartStopRecording` to provide finer control over recordings.

Updated in 1.0:

- **getMeetings** - Added fields on the returned XML
- **getMeetingInfo** - Added fields on the returned XML and deprecated parameters
- **getRecordings** - Added meta parameter and state parameter to filter returned results

Updated in 1.1:

- **create** - Added fields on the returned XML
- **getMeetings** - Added fields on the returned XML
- **getMeetingInfo** - Added fields on the returned XML
- **getRecordings** - Returns an XML block with thumbnails from the slides as well as a `<participants>N</participants>` element with number of participants who attend the meeting.
- **updateRecordings** - Meta parameters can be edited

Updated in 2.0:

- **create** - Added `bannerText`, `bannerColor`, `logo`, `copyright`, and `muteOnStart`.
- **getMeetings** - Now returns all the fields in **getMeetingInfo**.
- **getMeetingInfo** - Added `<client>` field to return client type (FLASH, or HTML5).

Updated in 2.2:

- **create** - Added `endWhenNoModerator`.
- **getRecordingTextTracks** - Get a list of the caption/subtitle files currently available for a recording.
- **putRecordingTextTrack** - Upload a caption or subtitle file to add it to the recording. If there is any existing track with the same values for kind and lang, it will be replaced.

Updated in 2.3:

- **create** - Renamed `keepEvents` to `meetingKeepEvents`, removed `joinViaHtml5`, added `endWhenNoModeratorDelayInMinutes`.
- **getDefaultConfigXML** obsolete, not used in HTML5 client.
- **setConfigXML** obsolete, not used in HTML5 client.

Updated in 2.4:

- **getDefaultConfigXML** Removed, not used in HTML5 client.
- **setConfigXML** Removed, not used in HTML5 client.
- **create**
   - Added `meetingLayout`, `learningDashboardEnabled`, `learningDashboardCleanupDelayInMinutes`, `allowModsToEjectCameras`, `virtualBackgroundsDisabled`, `allowRequestsWithoutSession`, `userCameraCap`.
   - `name`, `attendeePW`, and `moderatorPW` must be between 2 and 64 characters long
   - `meetingID` must be between 2 and 256 characters long and cannot contain commas
- **join** - Added `role`, `excludeFromDashboard`.

Updated in 2.5:

- **create** - **Added:** `meetingCameraCap`, `groups`, `disabledFeatures`, `meetingExpireIfNoUserJoinedInMinutes`, `meetingExpireWhenLastUserLeftInMinutes`, `preUploadedPresentationOverrideDefault`; **Deprecated:** `learningDashboardEnabled`, `breakoutRoomsEnabled`, `virtualBackgroundsDisabled`.

- **insertDocument** endopoint was first introduced

Updated in 2.6:

- **create** - **Added:** `notifyRecordingIsOn`, `presentationUploadExternalUrl`, `presentationUploadExternalDescription`, `recordFullDurationMedia` (v2.6.9); `disabledFeaturesExclude`(2.6.9); Added `liveTranscription` and `presentation` as options for `disabledFeatures`.

- **getRecordings** - **Added:** Added support for pagination using `offset`, `limit`

- **join**: Added `userdata-bbb_hide_presentation_on_join`.

Updated in 2.7:

- **create** - **Added:** `preUploadedPresentation`, `preUploadedPresentationName`, `disabledFeatures` options`cameraAsContent`, `snapshotOfCurrentSlide`, `downloadPresentationOriginalFile`, `downloadPresentationConvertedToPdf`, `timer`, `learningDashboardDownloadSessionData` (2.7.5).
- **join** - **Added:** `redirectErrorUrl`, `userdata-bbb_fullaudio_bridge`

Updated in 3.0:

- **create** - **Added parameters:** `allowOverrideClientSettingsOnCreateCall`, `loginURL`. Parameter `meetingLayout` supports a few new options: CAMERAS_ONLY, PARTICIPANTS_CHAT_ONLY, PRESENTATION_ONLY; **Added POST module:** `clientSettingsOverride`.
- **join** - **Added:** `enforceLayout`, `userdata-bbb_default_layout`. **Removed:** `defaultLayout` (replaced by `userdata-bbb_default_layout`).

## API Data Types

There are three types in the API.

**String:**<br /> This data type indicates a (UTF-8) encoded string. When passing String values to BigBlueButton API calls, make sure that you use correctly URL-encoded UTF-8 values so international text will show up correctly. The string must not contain control characters (values 0x00 through 0x1F).

Some BigBlueButton API parameters put additional restrictions on which characters are allowed, or on the lengths of the string. These restrictions are described in the parameter documentation.

**Number:**<br /> This data type indicates a non-negative integer value. The parameter value must only contain the digits `0` through `9`. There should be no leading sign (`+` or `-`), and no comma or period characters.

**Boolean:**<br />A true/false value. The value must be specified as the literal string `true` or `false` (all lowercase), other values may be misinterpreted.

## API Security Model

The BigBlueButton API security model enables 3rd-party applications to make API calls (if they have the shared secret), but not allow other people (end users) to make API calls.

The BigBlueButton API calls are almost all made server-to-server. If you installed the package `bbb-demo` on your BigBlueButton server, you get a set of API examples, written in Java Server Pages (JSP), that demonstrate how to use the BigBlueButton API. These demos run as a web application in tomcat7. The web application makes HTTPS requests to the BigBlueButton server's API end point.

You can retrieve your BigBlueButton API parameters (API endpoint and shared secret) using the command

```bash
$ bbb-conf --secret
```

Here's a sample return

```
    URL: http://bbb.example.com/bigbluebutton/
    Secret: ECCJZNJWLPEA3YB6Y2LTQGQD3GJZ3F93
```

You should _not_ embed the shared secret within a web page and make BigBlueButton API calls within JavaScript running within a browser. The built-in debugging tools for modern browser would make this secret easily accessible to any user. Once someone has the shared secret for your BigBlueButton server, they could create their own API calls. The shared secret should only be accessible to the server-side components of your application (and thus not visible to end users).

### Configuration

The shared secret is located in the `/etc/bigbluebutton/bbb-web.properties` file.

Look for the parameter `securitySalt` (it's called `securitySalt` due to legacy naming of the string)

```properties
securitySalt=<your_salt>
```

We'll refer to this value as `sharedSecret`. When you first install BigBlueButton on a server, the packaging scripts create a random 32 character `sharedSecret`. You can also change the `sharedSecret` at anytime using the command `bbb-conf --setsecret`.

```bash
$ sudo bbb-conf --setsecret <new_shared_secret>
```

The following command will create a new 32 character shared secret for your server

```bash
$ sudo bbb-conf --setsecret \$(openssl rand -base64 32 | sed 's/=//g' | sed 's/+//g' | sed 's/\///g')
```

**IMPORTANT: DO NOT ALLOW END USERS TO KNOW YOUR SHARED SECRET OR ELSE YOUR SECURITY WILL BE COMPROMISED.**

There are other configuration values in bbb-web's configuration `bigbluebutton.properties` (overwritten by `/etc/bigbluebutton/bbb-web.properties` ) related to the lifecycle of a meeting. You don't need to understand all of these to start using the BigBlueButton API. For most BigBlueButton servers, you can leave the [default values](https://github.com/bigbluebutton/bigbluebutton/blob/main/bigbluebutton-web/grails-app/conf/bigbluebutton.properties).

In BigBlueButton 2.5 support for additional hashing algorithms, besides sha1 and sha256, were added. These include sha384 and sha512. The `supportedChecksumAlgorithms` property in bbb-web defines which algorithms are supported. By default checksums can be validated with any of the supported algorithms. To remove support for one or more of these algorithms simply delete it from the configuration file.
If you drop support for sha256, (for example if you want to force only sha512 to be used) you will also need to update the `checkSumAlgorithmForBreakouts` property in akka-apps.

In `/etc/bigbluebutton/bbb-web.properties`:

```properties
supportedChecksumAlgorithms=sha512
```

In `/etc/bigbluebutton/bbb-apps-akka.conf`:

```properties
services {
  checkSumAlgorithmForBreakouts = "sha512"
  #...
}
```

And make sure to restart BigBlueButton.


### Usage

The implementation of BigBlueButton's security model lies in the controller `ApiController.groovy`. For each incoming API request, the controller computes a checksum out of the combination of the entire HTTPS query string and the server's shared secret. It then matches the incoming checksum against the computed checksum. If they match, the controller accepts the incoming request.

To use the security model, you must be able to create a SHA-1 checksum out of the call name _plus_ the query string _plus_ the shared secret that you configured on your server. To do so, follow these steps:

1. Create the entire query string for your API call without the checksum parameter.
   - Example for create meeting API call: `name=Test+Meeting&meetingID=abc123&attendeePW=111222&moderatorPW=333444`
2. Prepend the API call name to your string
   - Example for above query string:
     - API call name is `create`
     - String becomes: `createname=Test+Meeting&meetingID=abc123&attendeePW=111222&moderatorPW=333444`
3. Now, append the shared secret to your string
   - Example for above query string:
     - shared secret is `639259d4-9dd8-4b25-bf01-95f9567eaf4b`
     - String becomes: `createname=Test+Meeting&meetingID=abc123&attendeePW=111222&moderatorPW=333444639259d4-9dd8-4b25-bf01-95f9567eaf4b`
4. Now, find the SHA-1 sum for that string (implementation varies based on programming language).
   - the SHA-1 sum for the above string is: `1fcbb0c4fc1f039f73aa6d697d2db9ba7f803f17`
5. Add a checksum parameter to your query string that contains this checksum.
   - Above example becomes: `name=Test+Meeting&meetingID=abc123&attendeePW=111222&moderatorPW=333444&checksum=1fcbb0c4fc1f039f73aa6d697d2db9ba7f803f17`

You **MUST** send this checksum with **EVERY** API call. Since end users do not know your shared secret, they can not fake calls to the server, and they can not modify any API calls since changing a single parameter name or value by only one character will completely change the checksum required to validate the call.

Implementations of the SHA-1 functionality exist in nearly all programming languages. Here are example methods or links to example implementations for various languages:

- [JavaScript](http://pajhome.org.uk/crypt/md5/)
  - describes MD5 also
- [Java](http://commons.apache.org/codec/)
  - You can use `org.apache.commons.codec.digest.DigestUtils` and call `DigestUtils.shaHex(string + sharedSecret)`
- [PHP](http://php.net/manual/en/function.sha1.php)
  - simply call `sha1(string . sharedSecret)`

### Error handling

In the case of an error, all API calls make a best-effort attempt to return a properly formatted XML that contains enough information for the caller to determine the source of the error.

Errors are returned with a `returncode` value of `FAILED` and a `message` and `messageKey` value. We will try very hard to keep the messageKey stable (unchanging) throughout the life of the API. However, the `message` value is a plain text (English) value that may change with time.

You can use the `messageKey` to determine the type of error and look up internationalized text within your own system if needed. For example, an invalid request may return an error message of "No conference with that meeting ID exists", but the messageKey is simple "invalidMeetingIdentifier".

## API Resources

### Administration

The following section describes the administration calls

| Resource            | Description                                                                                    |
| :------------------ | :--------------------------------------------------------------------------------------------- |
| create              | Creates a new meeting.                                                                         |
| join                | Join a new user to an existing meeting.                                                        |
| end                 | Ends meeting.                                                                                  |
| insertDocument      | Insert a batch of documents via API call                                                       |

### Monitoring

The following section describes the monitoring calls

| Resource         | Description                                       |
| :--------------- | :------------------------------------------------ |
| isMeetingRunning | Checks whether if a specified meeting is running. |
| getMeetings      | Get the list of Meetings.                         |
| getMeetingInfo   | Get the details of a Meeting.                     |

### Recording

| Resource               | Description                                                   |
| :--- | :--- |
| getRecordings          | Get a list of recordings.                                     |
| publishRecordings      | Enables publishing or unpublishing of a recording.            |
| deleteRecordings       | Deletes an existing recording                                 |
| updateRecordings       | Updates metadata in a recording.                              |
| getRecordingTextTracks | Get a list of the caption/subtitle.                           |
| putRecordingTextTrack  | Upload a caption or subtitle file to add it to the recording. |

## API Calls

The following response parameters are standard to every call and may be returned from any call.

**Parameters:**

| Param Name | Required / Optional | Type   | Description                                                                                                                                                                                                                                                                                                                          |
| :--- | :--- | :---- | :--- |
| checksum   | Varies              | String | See the [API Security ModelAnchor](#api-security-model) section for more details on the usage for this parameter.<br /> This is basically a SHA-1 hash of `callName + queryString + sharedSecret`. The security salt will be configured into the application at deploy time. All calls to the API must include the checksum parameter. |

**Response:**

| Param Name | When Returned | Type   | Description |
| :--- | :--- | :----- | :--- |
| returncode | Always | String | Indicates whether the intended function was successful or not. Always one of two values:<br /><br />`FAILED` – There was an error of some sort – look for the message and messageKey for more information. Note that if the `returncode` is FAILED, the call-specific response parameters marked as “always returned” will not be returned. They are only returned as part of successful responses.<br /><br />`SUCCESS` – The call succeeded – the other parameters that are normally associated with this call will be returned. |
| message    | Sometimes | String | A message that gives additional information about the status of the call. A message parameter will always be returned if the returncode was `FAILED`. A message may also be returned in some cases where returncode was `SUCCESS` if additional information would be helpful.|
| messageKey | Sometimes | String | Provides similar functionality to the message and follows the same rules. However, a message key will be much shorter and will generally remain the same for the life of the API whereas a message may change over time. If your third party application would like to internationalize or otherwise change the standard messages returned, you can look up your own custom messages based on this messageKey.|

### create

Creates a BigBlueButton meeting.

The create call is idempotent: you can call it multiple times with the same parameters without side effects. This simplifies the logic for joining a user into a session as your application can always call create before returning the join URL to the user. This way, regardless of the order in which users join, the meeting will always exist when the user tries to join (the first `create` call actually creates the meeting; subsequent calls to `create` simply return `SUCCESS`).

The BigBlueButton server will automatically remove empty meetings that were created but have never had any users after a number of minutes specified by `meetingExpireIfNoUserJoinedInMinutes` defined in bbb-web's properties.

**Resource URL:**

http&#58;//yourserver.com/bigbluebutton/api/create?[parameters]&checksum=[checksum]

**Parameters:**

```mdx-code-block
<APITableComponent data={createEndpointTableData}/>
```

**Example Requests:**

- http&#58;//yourserver.com/bigbluebutton/api/create?name=Test&meetingID=test01&checksum=1234
- http&#58;//yourserver.com/bigbluebutton/api/create?name=Test&meetingID=test01&moderatorPW=mp&attendeePW=ap&checksum=wxyz
- http&#58;//yourserver.com/bigbluebutton/api/create?name=Test&meetingID=test01&moderatorPW=mp&attendeePW=ap&meta_presenter=joe&meta_category=education&checksum=abcd

**Example Response:**

```xml
<response>
  <returncode>SUCCESS</returncode>
  <meetingID>Test</meetingID>
  <internalMeetingID>640ab2bae07bedc4c163f679a746f7ab7fb5d1fa-1531155809613</internalMeetingID>
  <parentMeetingID>bbb-none</parentMeetingID>
  <attendeePW>ap</attendeePW>
  <moderatorPW>mp</moderatorPW>
  <createTime>1531155809613</createTime>
  <`voiceBridge`>70757</`voiceBridge`>
  <dialNumber>613-555-1234</dialNumber>
  <createDate>Mon Jul 09 17:03:29 UTC 2018</createDate>
  <hasUserJoined>false</hasUserJoined>
  <duration>0</duration>
  <hasBeenForciblyEnded>false</hasBeenForciblyEnded>
  <messageKey>duplicateWarning</messageKey>
  <message>This conference was already in existence and may currently be in progress.</message>
</response>
```

#### POST request
You can also include a payload in the request, it may be useful in cases where some of the query parameters are big enough to exceed the maximum number of characters in URLs. BigBlueButton supports a POST request where the parameters that usually would be passed in the URL, can be sent through the body, see example below:

```bash
curl --request POST \
  --url https://<your-host>/bigbluebutton/api/create \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data welcome=Welcome \
  --data allowStartStopRecording=true \
  --data attendeePW=ap \
  --data autoStartRecording=false \
  --data meetingID=random-1730297 \
  --data moderatorPW=mp \
  --data name=random-1730297 \
  --data record=false \
  --data `voiceBridge`=71296 \
  --data checksum=1234;
```

It will be further explored in the next section the possibility of sending other data types in the payload as well.

One other think to pay attention is to not include any of the parameters in both the URL and the body, or else it will pop a `checksum does not match` error:

```xml
<response>
<returncode>FAILED</returncode>
<messageKey>checksumError</messageKey>
<message>Checksums do not match</message>
</response>
```

#### Pre-upload Slides

You can upload slides within the create call. If you do this, the BigBlueButton server will immediately download and process the slides.

You can pass the slides as a URL or embed the slides in base64 as part of the POST request. For embedding the slides, you have to send a HTTPS POST request (by default, the total size of the POST request can't exceed 2MB, so embedding very large slides won't work). The URL Resource has to be the same as the previously described.

In the body part, you would append a simple XML like the example below:

```xml
<modules>
   <module name="presentation">
      <document url="http://www.sample-pdf.com/sample.pdf" filename="report.pdf"/>
      <document name="sample-presentation.pdf">JVBERi0xLjQKJ....
        [clipped here]
        ....0CiUlRU9GCg==
      </document>
   </module>
</modules>
```

When you need to provide a document using a URL, and the document URL does not contain an extension, you can use the `filename` parameter, such as `filename=test-results.pdf` to help the BigBlueButton server determine the file type (in this example it would be a PDF file).

**From `2.5.x` and on** there is also 2 parameters one can provide the payload to ensure that the document they are uploading can be downloaded or removed from the meeting, those parameters are:

| Parameter      | Description                                    | Default Value |
| -------------- | ---------------------------------------------- | ------------- |
| `downloadable` | Dictates if the presentation can be downloaded | `true`        |
| `removable`    | dictates if one can remove the presentation.   | `false`       |

In the payload the variables are passed inside each `<document>` tag of the xml, as follows:

```xml
<document downloadable="false" removable="true" url="http://www.sample-pdf.com/sample.pdf" filename="report.pdf"/>
<document removable="false" name="sample-presentation.pdf">JVBERi0xLjQKJ....
  [clipped here]
  ....0CiUlRU9GCg==
</document>
```

In the case more than a single document is provided, the first one will be loaded in the client, the processing of the other documents will continue in the background and they will be available for display when the user select one of them from the client.

For more information about the pre-upload slides check the following [link](http://groups.google.com/group/bigbluebutton-dev/browse_thread/thread/d36ba6ff53e4aa79).

#### clientSettingsOverride

You can modify the `settings.yml` configuration for the HTML5 client as part of the create call (in addition to modifying `/etc/bigbluebutton/bbb-html5.yml`).
You can construct the HTTPS POST request as follows:

```
curl -s -X POST "$URL/$CONTROLLER?$PARAMS&checksum=$CHECKSUM" --header "Content-Type: application/xml" --data '
<modules>
   <module name="clientSettingsOverride">
         <![CDATA[
         {
            "public": {
               "kurento": {
                  "wsUrl": "wss://test.bigbluebutton.org//bbb-webrtc-sfu"
               },
               "media": {
                  "sipjsHackViaWs": false
               },
               "app": {
                    "appName": "Test",
                    "helpLink": "https://www.bigbluebutton.org",
                    "autoJoin": false,
                    "askForConfirmationOnLeave": false,
                    "userSettingsStorage": "localStorage",
                    "defaultSettings": {
                     "application": {
                        "overrideLocale": "en"
                     }
                    }
                }
            }
         }
         ]]>
   </module>
</modules>'
```

#### Upload slides from external application to a live BigBlueButton session

For external applications that integrate to BigBlueButton using the [insertDocument](/development/api#insertdocument) API call, `presentationUploadExternalUrl` and `presentationUploadExternalDescription` parameters can be used in the `create` API call in order to display a button and a message in the bottom of the presentation upload dialog. 

Clicking this button will open the URL in a new tab that shows the file picker for the external application. The user can then select files in the external application and they will be sent to the live session.

#### End meeting callback URL

You can ask the BigBlueButton server to make a callback to your application when the meeting ends. Upon receiving the callback your application could, for example, change the interface for the user to hide the 'join' button.

To specify the callback to BigBlueButton, pass a URL using the meta-parameter `meta_endCallbackUrl` on the `create` command. When the BigBlueButton server ends the meeting, it will check if `meta_endCallbackUrl` is sent URL and, if so, make a HTTP GET request to the given URL.

For example, to specify the callback URL as

```
  https://myapp.example.com/callback?meetingID=test01
```

add the following parameter to the `create` API call: `&meta_endCallbackUrl=https%3A%2F%2Fmyapp.example.com%2Fcallback%3FmeetingID%3Dtest01` (note the callback URL needs to be URLEncoded).

Later, when the meeting ends, BigBlueButton will make an HTTPS GET request to this URL (HTTPS is supported and recommended) and to the URL add an additional parameter: `recordingmarks=true|false`.

The value for `recordingmarks` will be `true` if (a) the meeting was set to be recorded (`record=true` was passed on the create API call), and (b) a moderator clicked the Start/Stop Record button during the meeting (which places recording marks in the events). Given the example URL above, here's the final callback if both (a) and (b) are true:

```
https://myapp.example.com/callback?meetingID=test01&recordingmarks=true
```

Another param is the `meetingEndedURL` create param. This create param is a callback to indicate the meeting has ended. This is a duplicate of the endCallbackUrl meta param. We have this separate as we want this param to stay on the server and not propagated to client and recordings. Can be used by scalelite to be notified right away when meeting ends. The meta callback url can be used to inform third parties.

#### Recording ready callback URL

You can ask the BigBlueButton server to make a callback to your application when the recording for a meeting is ready for viewing. Upon receiving the callback your application could, for example, send the presenter an e-mail to notify them that their recording is ready.

To specify the callback to BigBlueButton, pass a URL using the meta-parameter `meta_bbb-recording-ready-url` on the `create` command. Later, when the BigBlueButton server finishes processing the recording, it will check if `meta_bbb-recording-ready-url` is set and, if so, make a HTTP POST request to the given URL.

For example, given the callback URL

```
https://example.com/api/v1/recording_status
```

to pass this to BigBlueButton add the following parameter to the `create` API call: `&meta_bbb-recording-ready-url=https%3A%2F%2Fexample.com%2Fapi%2Fv1%2Frecording_status` (note the callback URL needs to be URLEncoded).

Later, when the recording is ready, the BigBlueButton server will make an HTTPS POST request to this URL (https is supported and recommended).

The POST request body will be in the standard `application/x-www-form-urlencoded` format. The body will contain one parameter, named `signed_parameters`. The value of this parameter is a JWT (JSON Web Tokens) encoded string.

The JWT will be encoded using the "HS256" method. (i.e. the header should be `{ "typ": "JWT", "alg": "HS256" }` ). The payload will contain a the following JSON keys:

- `meeting_id` - The value will be the meeting_id (as provided on the BigBlueButton create API call).
- `record_id` - The identifier of the specific recording to which the notification applies. This corresponds to the IDs returned in the getRecordings api, and the `internalMeetingId` field on the getMeetingInfo request.

The secret used to sign the JWT message will be the shared secret of the BigBlueButton API endpoint that was used to create the original meeting.

The receiving endpoint should respond with one of the following HTTP codes to indicate status, as described below. Any response body provided will be ignored, although it may be logged as part of error handling.

| Response Code | Description                                                                                                                                                                                                                             |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2XX           | All HTTP 2XX codes are treated the same way - the endpoint has received the notification, and the recording system will consider the callback completed. I suggest using the 200, 202, or 204 codes as appropriate to your application. |
| 3XX           | Redirections are not supported, and will be treated as an error.                                                                                                                                                                        |
| 401           | The shared secret does not match.                                                                                                                                                                                                       |
| 410           | The callback is for a meeting/session/recording that has been deleted in the application. This code may in the future trigger the recording system to cancel the recording processing or unpublish and delete the recording.            |

All other HTTP response codes will be treated as transient errors.

### join

Joins a user to the meeting specified in the meetingID parameter.

**Resource URL:**

http&#58;//yourserver.com/bigbluebutton/api/join?[parameters]&checksum=[checksum]

**Parameters:**

```mdx-code-block
<APITableComponent data={joinEndpointTableData}/>
```

**Example Requests:**

- http&#58;//yourserver.com/bigbluebutton/api/join?meetingID=test01&password=mp&fullName=John&checksum=1234
- http&#58;//yourserver.com/bigbluebutton/api/join?meetingID=test01&password=ap&fullName=Mark&checksum=wxyz
- http&#58;//yourserver.com/bigbluebutton/api/join?meetingID=test01&password=ap&fullName=Chris&createTime=273648&checksum=abcd

**Example Response:**

There is a XML response for this call only when the `redirect` parameter is set to `false`. You should simply redirect the user to the call URL, and they will be entered into the meeting.

```xml
<response>
  <returncode>SUCCESS</returncode>
  <messageKey>successfullyJoined</messageKey>
  <message>You have joined successfully.</message>
  <meeting_id>640ab2bae07bedc4c163f679a746f7ab7fb5d1fa-1531155809613</meeting_id>
  <user_id>w_euxnssffnsbs</user_id>
  <auth_token>14mm5y3eurjw</auth_token>
  <session_token>ai1wqj8wb6s7rnk0</session_token>
  <url>https://yourserver.com/client/BigBlueButton.html?sessionToken=ai1wqj8wb6s7rnk0</url>
</response>
```

### insertDocument

This endpoint insert one or more documents into a running meeting via API call

**Resource URL:**

https&#58;//yourserver.com/bigbluebutton/api/insertDocument?[parameters]&checksum=[checksum]

**Parameters:**

```mdx-code-block
<APITableComponent data={insertDocumentEndpointTableData}/>
```

**Example Requests:**

You can do the request either via greenlight or `curl`, which I am going to demonstrate in the following paragraph.

First, it is necessary to have the xml string with the batch of the wanted presentations in hand. As an example, see the xml down below:

``` xml
<modules>
   <module name="presentation">
        <document current="true" downloadable="true" url="{link to download the presentation}" filename="sample.pdf"/>
        <document removable="false" name="sample.pdf">
          JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PC9UaXRsZSAoT3RoZXJfc2FtcGxlKQovUHJvZHVjZXIgKFNraWEvUERGIG0xMDAgR29vZ2xlIERvY3MgUmVuZGVyZXIpPj4KZW5... {base64 encoded document}
        </document>
   </module>
</modules>
```

Now you need to write the `curl` command which will be:

``` bash
curl -s -X POST "https://{your-host}/bigbluebutton/api/insertDocument?meetingID=Test&checksum=6b76e90b9a20481806a7ef513bc81ef0299609ed" --header "Content-Type: application/xml" --data '{xml}'
```

Combining both together, we get:

``` bash
curl -s -X POST "https://{your-host}/bigbluebutton/api/insertDocument?meetingID=Test&checksum=6b76e90b9a20481806a7ef513bc81ef0299609ed" --header "Content-Type: application/xml" --data '<modules>
   <module name="presentation">
        <document current="true" downloadable="true" url="{link to download the presentation}" filename="sample.pdf"/>
        <document removable="false" name="sample.pdf">
        JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PC9UaXRsZSAoT3RoZXJfc2FtcGxlKQovUHJvZHVjZXIgKFNraWEvUERGIG0xMDAgR29vZ2xlIERvY3MgUmVuZGVyZXIpPj4KZW5... {base64 encoded document}
        </document>
   </module>
</modules>'
```

There is also the possibility of passing the removable and downloadable variables inside the payload, they go in the `document` tag as already demonstrated. The way it works is exactly the same as in the [(POST) create endpoint](#pre-upload-slides) 

### isMeetingRunning

This call enables you to simply check on whether or not a meeting is running by looking it up with your meeting ID.

**Resource URL:**

http&#58;//yourserver.com/bigbluebutton/api/isMeetingRunning?[parameters]&checksum=[checksum]

**Parameters:**

```mdx-code-block
<APITableComponent data={isMeetingRunningEndpointTableData}/>
```

**Example Requests:**

http&#58;//yourserver.com/bigbluebutton/api/isMeetingRunning?meetingID=test01&checksum=1234

**Example Response:**

```xml
<response>
  <returncode>SUCCESS</returncode>
  <running>true</running>
</response>
```

running can be “true” or “false” that signals whether a meeting with this ID is currently running.

### end

Use this to forcibly end a meeting and kick all participants out of the meeting.

**Resource URL:**

- http&#58;//yourserver.com/bigbluebutton/api/end?[parameters]&checksum=[checksum]

**Parameters:**

```mdx-code-block
<APITableComponent data={endEndpointTableData}/>
```

**Example Requests:**

- http&#58;//yourserver.com/bigbluebutton/api/end?meetingID=1234567890&password=mp&checksum=1234

**Example Response:**

```xml
<response>
  <returncode>SUCCESS</returncode>
  <messageKey>sentEndMeetingRequest</messageKey>
  <message>
    A request to end the meeting was sent.  Please wait a few seconds, and then use the getMeetingInfo or isMeetingRunning API calls to verify that it was ended
  </message>
</response>
```

#### POST request
Just like the [create request](#post-request), you can send a POST to end the meeting, the syntax is pretty much the same, see example below:

```bash
curl --request POST \
	--url https://<your-host>/bigbluebutton/api/end \
	--header 'Content-Type: application/x-www-form-urlencoded' \
	--data meetingID=Test+Meeting \
	--data password=mp \
	--data checksum=1234
```

**IMPORTANT NOTE:** You should note that when you call end meeting, it is simply sending a request to the backend (Red5) server that is handling all the conference traffic. That backend server will immediately attempt to send every connected client a logout event, kicking them from the meeting. It will then disconnect them, and the meeting will be ended. However, this may take several seconds, depending on network conditions. Therefore, the end meeting call will return a success as soon as the request is sent. But to be sure that it completed, you should then check back a few seconds later by using the `getMeetingInfo` or `isMeetingRunning` calls to verify that all participants have left the meeting and that it successfully ended.

### getMeetingInfo

This call will return all of a meeting's information, including the list of attendees as well as start and end times.

Resource URL:

- http&#58;//yourserver.com/bigbluebutton/api/getMeetingInfo?[parameters]&checksum=[checksum]

**Parameters:**

```mdx-code-block
<APITableComponent data={getMeetingInfoEndpointTableData}/>
```

**Example Requests:**

- http&#58;//yourserver.com/bigbluebutton/api/getMeetingInfo?meetingID=test01&checksum=1234

**Example Response:**

```xml
<response>
	<returncode>SUCCESS</returncode>
	<meetingName>Anton G's Room</meetingName>
	<meetingID>gbesu6dht08uobpislzqxsizjzihn87cmewqyacs</meetingID>
	<internalMeetingID>a0715c95000a2bcb90604ecc7097dbc94592c690-1715261728123</internalMeetingID>
	<createTime>1715261728123</createTime>
	<createDate>Thu May 09 13:35:28 UTC 2024</createDate>
	<voiceBridge>66052</voiceBridge>
	<dialNumber>613-555-1234</dialNumber>
	<attendeePW>1umEM3ic</attendeePW>
	<moderatorPW>V91JirCa</moderatorPW>
	<running>true</running>
	<duration>0</duration>
	<hasUserJoined>true</hasUserJoined>
	<recording>true</recording>
	<hasBeenForciblyEnded>false</hasBeenForciblyEnded>
	<startTime>1715261728142</startTime>
	<endTime>0</endTime>
	<participantCount>1</participantCount>
	<listenerCount>0</listenerCount>
	<voiceParticipantCount>1</voiceParticipantCount>
	<videoCount>1</videoCount>
	<maxUsers>0</maxUsers>
	<moderatorCount>1</moderatorCount>
	<attendees>
		<attendee>
			<userID>w_ftcrsyuh44oj</userID>
			<fullName>Anton G</fullName>
			<role>MODERATOR</role>
			<isPresenter>true</isPresenter>
			<isListeningOnly>false</isListeningOnly>
			<hasJoinedVoice>true</hasJoinedVoice>
			<hasVideo>true</hasVideo>
			<clientType>HTML5</clientType>
			<customdata></customdata>
		</attendee>
	</attendees>
	<metadata>
		<bbb-origin-version>summit2024-6d8120x</bbb-origin-version>
		<bbb-origin-server-name>test30.bigbluebutton.org</bbb-origin-server-name>
		<bbb-recording-ready-url>https://test30.bigbluebutton.org/recording_ready</bbb-recording-ready-url>
		<bbb-origin>greenlight</bbb-origin>
		<endcallbackurl>https://test30.bigbluebutton.org/meeting_ended</endcallbackurl>
	</metadata>
	<isBreakout>false</isBreakout>
</response>
```

If a meeting has spawned breakout rooms, then `getMeetingInfo` will also a list of meetingIDs for the breakout rooms.

```
 <response>
  <returncode>success</returncode>
  ...
     <breakoutRooms>
        <breakout>breakout-room-id-1</breakout>
        <breakout>breakout-room-id-2</breakout>
        <breakout>breakout-room-id-3</breakout>
     </breakoutRooms>
 </response>
```

If a meeting is a breakout room itself, then `getMeetingInfo` will also return a link to the parent meetingID.

```
<response>
  <returncode>success</returncode>
  ...
    <breakout>
     <parentMeetingID>ParentMeetingId</parentMeetingID>
     <sequence>1</sequence>
     <freeJoin>false</freeJoin>
    </breakout>
 </response>
```

### getMeetings

This call will return a list of all the meetings found on this server.

**Resource URL:**

http&#58;//yourserver.com/bigbluebutton/api/getMeetings?checksum=[checksum]

**Parameters:**

Since BigBlueButton 0.80, it is no more required to pass any parameter for this call.

**Example Requests:**

http&#58;//yourserver.com/bigbluebutton/api/getMeetings?checksum=1234

**Example Response:**

```xml
<response>
  <returncode>SUCCESS</returncode>
  <meetings>
    <meeting>
      <meetingName>Demo Meeting</meetingName>
      <meetingID>Demo Meeting</meetingID>
      <internalMeetingID>183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1531241258036</internalMeetingID>
      <createTime>1531241258036</createTime>
      <createDate>Tue Jul 10 16:47:38 UTC 2018</createDate>
      <`voiceBridge`>70066</`voiceBridge`>
      <dialNumber>613-555-1234</dialNumber>
      <attendeePW>ap</attendeePW>
      <moderatorPW>mp</moderatorPW>
      <running>false</running>
      <duration>0</duration>
      <hasUserJoined>false</hasUserJoined>
      <recording>false</recording>
      <hasBeenForciblyEnded>false</hasBeenForciblyEnded>
      <startTime>1531241258074</startTime>
      <endTime>0</endTime>
      <participantCount>0</participantCount>
      <listenerCount>0</listenerCount>
      <voiceParticipantCount>0</voiceParticipantCount>
      <videoCount>0</videoCount>
      <maxUsers>0</maxUsers>
      <moderatorCount>0</moderatorCount>
      <attendees />
      <metadata />
      <isBreakout>false</isBreakout>
    </meeting>
  </meetings>
</response>
```

### getRecordings

Retrieves the recordings that are available for playback for a given meetingID (or set of meeting IDs). Support for pagination was added in 2.6.

**Resource URL:**

http&#58;//yourserver.com/bigbluebutton/api/getRecordings?[parameters]&checksum=[checksum]

**Parameters:**

```mdx-code-block
<APITableComponent data={getRecordingsEndpointTableData}/>
```

**Example Requests:**

- http&#58;//yourserver.com/bigbluebutton/api/getRecordings?checksum=1234
- http&#58;//yourserver.com/bigbluebutton/api/getRecordings?meetingID=CS101&checksum=abcd
- http&#58;//yourserver.com/bigbluebutton/api/getRecordings?meetingID=CS101,CS102&checksum=wxyz
- http&#58;//yourserver.com/bigbluebutton/api/getRecordings?recordID=652c9eb4c07ad49283554c76301d68770326bd93-1462283509434&checksum=wxyz
- http&#58;//yourserver.com/bigbluebutton/api/getRecordings?recordID=652c9eb4c07ad49283554c76301d68770326bd93-1462283509434,9e359d17635e163c4388281567601d7fecf29df8-1461882579628&checksum=wxyz
- http&#58;//yourserver.com/bigbluebutton/api/getRecordings?recordID=652c9eb4c07ad49283554c76301d68770326bd93&checksum=wxyz
- http&#58;//yourserver.com/bigbluebutton/api/getRecordings?recordID=652c9eb4c07ad49283554c76301d68770326bd93,9e359d17635e163c4388281567601d7fecf29df8&checksum=wxyz
- http&#58;//yourserver.com/bigbluebutton/api/getRecordings?state=published&offset=20&limit=10&checksum=abc123

**Example Response:**

Here the `getRecordings` API call returned back two recordings for the meetingID `c637ba21adcd0191f48f5c4bf23fab0f96ed5c18`. Each recording had two formats: `podcast` and `presentation`.

```xml
<response>
   <returncode>SUCCESS</returncode>
   <recordings>
      <recording>
         <recordID>ffbfc4cc24428694e8b53a4e144f414052431693-1530718721124</recordID>
         <meetingID>c637ba21adcd0191f48f5c4bf23fab0f96ed5c18</meetingID>
         <internalMeetingID>ffbfc4cc24428694e8b53a4e144f414052431693-1530718721124</internalMeetingID>
         <name>Fred's Room</name>
         <isBreakout>false</isBreakout>
         <published>true</published>
         <state>published</state>
         <startTime>1530718721124</startTime>
         <endTime>1530718810456</endTime>
         <participants>3</participants>
         <metadata>
            <isBreakout>false</isBreakout>
            <meetingName>Fred's Room</meetingName>
            <gl-listed>false</gl-listed>
            <meetingId>c637ba21adcd0191f48f5c4bf23fab0f96ed5c18</meetingId>
         </metadata>
         <playback>
            <format>
               <type>podcast</type>
               <url>https://demo.bigbluebutton.org/podcast/ffbfc4cc24428694e8b53a4e144f414052431693-1530718721124/audio.ogg</url>
               <processingTime>0</processingTime>
               <length>0</length>
            </format>
            <format>
               <type>presentation</type>
               <url>https://demo.bigbluebutton.org/playback/presentation/2.0/playback.html?meetingId=ffbfc4cc24428694e8b53a4e144f414052431693-1530718721124</url>
               <processingTime>7177</processingTime>
               <length>0</length>
               <preview>
                  <images>
                     <image alt="Welcome to" height="136" width="176">https://demo.bigbluebutton.org/presentation/ffbfc4cc24428694e8b53a4e144f414052431693-1530718721124/presentation/d2d9a672040fbde2a47a10bf6c37b6a4b5ae187f-1530718721134/thumbnails/thumb-1.png</image>
                     <image alt="(this slide left blank for use as a whiteboard)" height="136" width="176">https://demo.bigbluebutton.org/presentation/ffbfc4cc24428694e8b53a4e144f414052431693-1530718721124/presentation/d2d9a672040fbde2a47a10bf6c37b6a4b5ae187f-1530718721134/thumbnails/thumb-2.png</image>
                     <image alt="(this slide left blank for use as a whiteboard)" height="136" width="176">https://demo.bigbluebutton.org/presentation/ffbfc4cc24428694e8b53a4e144f414052431693-1530718721124/presentation/d2d9a672040fbde2a47a10bf6c37b6a4b5ae187f-1530718721134/thumbnails/thumb-3.png</image>
                  </images>
               </preview>
            </format>
         </playback>
      </recording>
      <recording>
         <recordID>ffbfc4cc24428694e8b53a4e144f414052431693-1530278898111</recordID>
         <meetingID>c637ba21adcd0191f48f5c4bf23fab0f96ed5c18</meetingID>
         <internalMeetingID>ffbfc4cc24428694e8b53a4e144f414052431693-1530278898111</internalMeetingID>
         <name>Fred's Room</name>
         <isBreakout>false</isBreakout>
         <published>true</published>
         <state>published</state>
         <startTime>1530278898111</startTime>
         <endTime>1530281194326</endTime>
         <participants>7</participants>
         <metadata>
            <meetingName>Fred's Room</meetingName>
            <isBreakout>false</isBreakout>
            <gl-listed>true</gl-listed>
            <meetingId>c637ba21adcd0191f48f5c4bf23fab0f96ed5c18</meetingId>
         </metadata>
         <playback>
            <format>
               <type>podcast</type>
               <url>https://demo.bigbluebutton.org/podcast/ffbfc4cc24428694e8b53a4e144f414052431693-1530278898111/audio.ogg</url>
               <processingTime>0</processingTime>
               <length>33</length>
            </format>
            <format>
               <type>presentation</type>
               <url>https://demo.bigbluebutton.org/playback/presentation/2.0/playback.html?meetingId=ffbfc4cc24428694e8b53a4e144f414052431693-1530278898111</url>
               <processingTime>139458</processingTime>
               <length>33</length>
               <preview>
                  <images>
                     <image width="176" height="136" alt="Welcome to">https://demo.bigbluebutton.org/presentation/ffbfc4cc24428694e8b53a4e144f414052431693-1530278898111/presentation/d2d9a672040fbde2a47a10bf6c37b6a4b5ae187f-1530278898120/thumbnails/thumb-1.png</image>
                     <image width="176" height="136" alt="(this slide left blank for use as a whiteboard)">https://demo.bigbluebutton.org/presentation/ffbfc4cc24428694e8b53a4e144f414052431693-1530278898111/presentation/d2d9a672040fbde2a47a10bf6c37b6a4b5ae187f-1530278898120/thumbnails/thumb-2.png</image>
                     <image width="176" height="136" alt="(this slide left blank for use as a whiteboard)">https://demo.bigbluebutton.org/presentation/ffbfc4cc24428694e8b53a4e144f414052431693-1530278898111/presentation/d2d9a672040fbde2a47a10bf6c37b6a4b5ae187f-1530278898120/thumbnails/thumb-3.png</image>
                  </images>
               </preview>
            </format>
         </playback>
      </recording>
   </recordings>
</response>
```

### publishRecordings

Publish and unpublish recordings for a given recordID (or set of record IDs).

**Resource URL:**

- http&#58;//yourserver.com/bigbluebutton/api/publishRecordings?[parameters]&checksum=[checksum]

**Parameters:**

```mdx-code-block
<APITableComponent data={publishRecordingsEndpointTableData}/>
```

**Example Requests:**

- http&#58;//yourserver.com/bigbluebutton/api/publishRecordings?recordID=record123&publish=true&checksum=1234
- http&#58;//yourserver.com/bigbluebutton/api/publishRecordings?recordID=record123,recordABC&publish=true&checksum=wxyz

**Example Response:**

```xml
<response>
  <returncode>SUCCESS</returncode>
  <published>true</published>
</response>
```

### deleteRecordings

Delete one or more recordings for a given recordID (or set of record IDs).

**Resource URL:**

http&#58;//yourserver.com/bigbluebutton/api/deleteRecordings?[parameters]&checksum=[checksum]

**Parameters:**

```mdx-code-block
<APITableComponent data={deleteRecordingsEndpointTableData}/>
```

**Example Requests:**

- http&#58;//yourserver.com/bigbluebutton/api/deleteRecordings?recordID=record123&checksum=1234
- http&#58;//yourserver.com/bigbluebutton/api/deleteRecordings?recordID=record123,recordABC&checksum=wxyz

**Example Response:**

```xml
<response>
  <returncode>SUCCESS</returncode>
  <deleted>true</deleted>
</response>
```

### updateRecordings

Update metadata for a given recordID (or set of record IDs). Available since version 1.1

**Resource URL:**

- http&#58;//yourserver.com/bigbluebutton/api/updateRecordings?[parameters]&checksum=[checksum]

**Parameters:**

```mdx-code-block
<APITableComponent data={updateRecordingsEndpointTableData}/>
```

**Example Requests:**

- http&#58;//yourserver.com/bigbluebutton/api/updateRecordings?recordID=record123&meta_Presenter=Jane%20Doe,meta_category=FINANCE,meta_TERM=Fall2016&checksum=1234

**Example Response:**

```xml
<response>
  <returncode>SUCCESS</returncode>
  <updated>true</updated>
</response>
```

### getRecordingTextTracks

Get a list of the caption/subtitle files currently available for a recording. It will include information about the captions (language, etc.), as well as a download link. This may be useful to retrieve live or automatically transcribed subtitles from a recording for manual editing.

**Resource URL:**

`GET http://yourserver.com/bigbluebutton/api/getRecordingTextTracks?[parameters]&checksum=[checksum]`

**Parameters:**

```mdx-code-block
<APITableComponent data={getRecordingTextTracksEndpointTableData}/>
```

**Example Response:**

An example response looks like the following:

```json
{
  "response": {
    "returncode": "SUCCESS",
    "tracks": [
      {
        "href": "https://captions.example.com/textTrack/0ab39e419c9bcb63233168daefe390f232c71343/183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1554230749920/subtitles_en-US.vtt",
        "kind": "subtitles",
        "label": "English",
        "lang": "en-US",
        "source": "upload"
      },
      {
        "href": "https://captions.example.com/textTrack/95b62d1b762700b9d5366a9e71d5fcc5086f2723/183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1554230749920/subtitles_pt-BR.vtt",
        "kind": "subtitles",
        "label": "Brazil",
        "lang": "pt-BR",
        "source": "upload"
      }
    ]
  }
}
```

The track object has the following attributes:

kind

: Indicates the intended use of the text track. The value will be one of the following strings:
subtitles

captions

: The meaning of these values is defined by the HTML5 video element, see the MDN docs for details. Note that the HTML5 specification defines additional values which are not currently used here, but may be added at a later date.

lang
: The language of the text track, as a language tag. See RFC 5646 for details on the format, and the Language subtag lookup for assistance using them. It will usually consist of a 2 or 3 letter language code in lowercase, optionally followed by a dash and a 2-3 letter geographic region code (country code) in uppercase.

label
: A human-readable label for the text track. This is the string displayed in the subtitle selection list during recording playback.

source
: Indicates where the track came from. The value will be one of the following strings:

- live - A caption track derived from live captioning performed in a BigBlueButton.
- automatic - A caption track generated automatically via computer voice recognition.
- upload - A caption track uploaded by a 3rd party.

href
: A link to download this text track file. The format will always be WebVTT (text/vtt mime type), which is similar to the SRT format.

The timing of the track will match the current recording playback video and audio files. Note that if the recording is edited (adjusting in/out markers), tracks from live or automatic sources will be re-created with the new timing. Uploaded tracks will be edited, but this may result in data loss if sections of the recording are removed during edits.

Errors
: In addition to the standard BigBlueButton checksum error, this API call can return the following errors in `<messageKey>` when returncode is FAILED:

missingParameter
: A required parameter is missing.

noRecordings
: No recording was found matching the provided recording ID.

### putRecordingTextTrack

Upload a caption or subtitle file to add it to the recording. If there is any existing track with the same values for kind and lang, it will be replaced.

Note that this api requires using a POST request. The parameters listed as GET parameters must be included in the request URI, and the actual uploaded file must be included in the body of the request in the multipart/form-data format.

Note that the standard BigBlueButton checksum algorithm must be performed on the GET parameters, but that the body of the request (the subtitle file) is not checksummed.

This design is such that a web application could generate a form with a signed url, and display it in the browser with a file upload selection box. When the user submits the form, it will upload the track directly to the recording api. The API may be used programmatically as well, of course.

This API is asynchronous. It can take several minutes for the uploaded file to be incorporated into the published recording, and if an uploaded file contains unrecoverable errors, it may never appear.

**Resource URL:**

`POST http://yourserver.com/bigbluebutton/api/putRecordingTextTrack`

**Parameters:**

```mdx-code-block
<APITableComponent data={putRecordingTextTrackEndpointTableData}/>
```

**POST Body:** <br />If the request has a body, the Content-Type header must specify multipart/form-data. The following parameters may be encoded in the post body.

**file:** <br />(Type Binary Data, Optional) Contains the uploaded subtitle or caption file. If this parameter is missing, or if the POST request has no body, then any existing text track matching the kind and lang specified will be deleted. If known, the uploading application should set the `Content-Type` to a value appropriate to the file format. If Content-Type is unset, or does not match a known subtitle format, the uploaded file will be probed to automatically detect the type.

Multiple types of subtitles are accepted for upload, but they will be converted to the WebVTT format for display.

The size of the request is limited (TODO: determine the limit maybe 8MB?)

The following types of subtitle files are accepted:

- SRT (SubRip Text), including basic formatting.
- SRT does not have a standard mime type, but application/x-subrip is accepted.
- SSA or ASS (Sub Station Alpha, Advanced Sub Station). Most formatting will be discarded, but basic inline styles (bold, italic, etc.) may be preserved.
- SSA/ASS does not have a standard mime type.
- WebVTT. Uploaded WebVTT files will be used as-is, but note that browser support varies, so including REGION or STYLE blocks is not recommended.

The WebVTT mime type is `text/vtt`.

**Errors**

In addition to the standard BigBlueButton checksum error, this API call can return the following errors in `<messageKey>` when returncode is FAILED:

missingParameter
: A required parameter is missing.

noRecordings
: No recording was found matching the provided recording ID.

invalidKind
: The kind parameter is not set to a permitted value.

invalidLang
: The lang parameter is not a well-formed language tag.

The uploaded text track is not validated during upload. If it is invalid, it will be ignored and the existing subtitles will not be replaced.

Success

```json
{
  "response": {
    "messageKey": "upload_text_track_success",
    "message": "Text track uploaded successfully",
    "recordId": "baz",
    "returncode": "SUCCESS"
  }
}
```

Failed

```json
{
  "response": {
    "messageKey": "upload_text_track_failed",
    "message": "Text track upload failed.",
    "recordId": "baz",
    "returncode": "FAILED"
  }
}
```

Or

```json
{
  "response": {
    "message": "Empty uploaded text track.",
    "messageKey": "empty_uploaded_text_track",
    "returncode": "FAILED"
  }
}
```

Missing parameter error

```json
{
  "response": {
    "messageKey": "paramError",
    "message": "Missing param checksum.",
    "returncode": "FAILED"
  }
}
```

## API Sample Code

BigBlueButton provides API Sample Codes so you can integrated easily with your application. Feel free to contribute and post your implementation of the API in other language code in the bigbluebutton-dev mailing list.

### PHP

There is stable PHP library in [BigBlueButton PHP API](https://github.com/bigbluebutton/bigbluebutton-api-php).

You need to enable the "allow_url_fopen" to "On" in your php.ini file so this example can work. Simply add/replace to your php.ini file:

<code>allow_url_fopen = On</code>

For more examples of using PHP, see the source for the [Moodle](https://github.com/blindsidenetworks/moodle-mod_bigbluebuttonbn) and [WordPress](https://github.com/blindsidenetworks/wordpress-plugin_bigbluebutton) integrations.

### Ruby

See the following [bigbluebutton-api-ruby](https://github.com/mconf/bigbluebutton-api-ruby) gem created by the good folks at [Mconf](http://mconf.org).

### Testing API Calls with API Mate

To help you create/test valid API calls against your BigBlueButton server, use the excellent [API Mate](http://mconf.github.io/api-mate/) to interactively create API calls. API Mate generates the checksums within the browser (no server component needed) so you can use it to test API calls against a local BigBlueButton server.

If you're developing new API calls or adding parameters on API calls, you can still use the API Mate to test them. Just scroll the page down or type "custom" in the parameter filter and you'll see the inputs where you can add custom API calls or custom parameters. New API calls will appear in the list of API links and new parameters will be added to all the API links.

If your using API Mate to test recordings and want to query by `meetingID`, be sure to clear the `recordID` field first.  BigBlueButton's API supports querying for recordings by either value, but not both at the same time.


 ### Support for JSON/JSONP

- It would be very nice to optionally allow JSON responses, and to support JSONP. This might allow for simpler integrations, even within static or almost-static webpages using JavaScript as the primary integration language. It should not be assumed that all users will be running custom software on a server and be able to process XML responses, etc.
- This being said, even within JavaScript there are simple ways to make the API call and process the returned XML (using jQuery and $.xml2json, for example)

 ### Meeting event callbacks

This may actually even be called a “reverse API” - where we define an interface that the third- party application can implement to be notified of events. This would not be necessary for the first version of the API, but would be a nice feature for future enhancements. More details:

When major events happen within meetings, it would be very helpful to provide a way for third-party applications to be notified of these events. For instance, when a user joins a conference, they will presumably be joining through the third-party app. However, when they leave the conference, the app may have certain auditing that it needs to do to record their disconnect time, etc. If BigBlueButton could make some callback to the application, this would assist in such scenarios.

For example, the application may be able to register a URL that BigBlueButton would call with status updates. BigBlueButton would define an API that such an app would be required to implement at that URL. For example, BigBlueButton could call:

- http&#58;//third-party-app/bbb-integ.php?event=meetingEnded&meetingID=abcd
- http&#58;//third-party-app/bbb-integ.php?event=userLeft&userID=1234
- http&#58;//third-party-app/bbb-integ.php?event=meetingEnded&meetingID=abcd

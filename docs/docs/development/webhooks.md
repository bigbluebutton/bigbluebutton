---
id: webhooks
slug: /development/webhooks
title: Webhooks
sidebar_position: 7
description: BigBlueButton Webhooks
keywords:
- webhooks
---

This is a node.js application that listens for all events on BigBlueButton and sends POST requests
with details about these events to hooks registered via an API. A hook is any external URL that can
receive HTTP POST requests.

These web hooks allow 3rd party applications to subscribe to different events that happen during a
BigBlueButton session. An event can be: a meeting was created, a user joined, a new presentation was
uploaded, a user left, a recording is being processed, and many others. You can see the entire list
of events that generate web hooks calls in [this file](https://github.com/bigbluebutton/bbb-webhooks/blob/develop/messageMapping.js).

## Installation

To install webhooks, run the following command on your BigBlueButton server:

```bash
$ sudo apt-get install bbb-webhooks
```

## Registering hooks: API calls

This application adds three new API calls to BigBlueButton's API.

## Hooks/Create

Creates a new hook. This call is idempotent: you can call it multiple times with the same parameters
without side effects (just like the `create` call for meetings).
Can optionally receive a `meetingID` parameter: if informed, this hook
will receive only events for this meeting; otherwise the hook will be global and will receive
events for all meetings in the server.

A hook can be registered at any time. Even hooks for specific `meetingID`s can be registered even
if there is no meeting with that ID yet. Once the meeting is created, the hook will receive its
events.

Hooks are permanently stored on redis and will enabled until the hook is explicitly removed via API.

**Resource URL:** `http://yourserver.com/bigbluebutton/api/hooks/create?[parameters]&checksum=[checksum]`

**Parameters**:

| Param Name  | Required / Optional | Type    | Description                                                                                                                                   |
| ----------- | ------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| callbackURL | Required            | String  | The URL that will receive a POST call with the events. The same URL cannot be registered more than once.                                      |
| meetingID   | Optional            | String  | A `meetingID` to bind this hook to an specific meeting. If not informed, the hook will receive events for all meetings.                       |
| eventID     | Optional            | String  | An `eventID` or a comma-separated `eventID` list to bind this hook to. If not informed, the hook will receive all events. (v2.5)              |
| getRaw      | Optional            | Boolean | False by default. When getRaw=true, the POST call will contain the exact same message sent on redis, otherwise the message will be processed. |

**Response when a hook is successfully registered**:

```xml
<response>
  <returncode>SUCCESS</returncode>
  <hookID>1</hookID>
  <permanentHook>false</permanentHook>
  <rawData>false</rawData>
</response>
```

**Response when a hook is already registered**:

```xml
<response>
  <returncode>SUCCESS</returncode>
  <hookID>1</hookID>
  <messageKey>duplicateWarning</messageKey>
  <message>There is already a hook for this callback URL.</message>
</response>
```

**Response when there was an error registering the hook**:

```xml
<response>
  <returncode>FAILED</returncode>
  <messageKey>createHookError</messageKey>
  <message>An error happened while creating your hook. Check the logs.</message>
</response>
```

## Hooks/Destroy

Remove a previously created hook. A `hookID` must be passed in the parameters to identify
the hook to be removed.

**Resource URL:** `http://yourserver.com/bigbluebutton/api/hooks/destroy?[parameters]&checksum=[checksum]`

**Parameters**:

| Param Name | Required / Optional | Type   | Description                                                                     |
| ---------- | ------------------- | ------ | ------------------------------------------------------------------------------- |
| hookID     | Required            | Number | The ID of the hook that should be removed, as returned in the create hook call. |

**Response when a hook is successfully removed**:

```xml
<response>
  <returncode>SUCCESS</returncode>
  <removed>true</removed>
</response>
```

**Response when a hook is not found**:

```xml
<response>
  <returncode>FAILED</returncode>
  <messageKey>destroyMissingHook</messageKey>
  <message>The hook informed was not found.</message>
</response>
```

**Response when a hook is not passed in the parameters**:

```xml
<response>
  <returncode>FAILED</returncode>
  <messageKey>missingParamHookID</messageKey>
  <message>You must specify a hookID in the parameters.</message>
</response>
```

**Response when there was an error removing the hook**:

```xml
<response>
  <returncode>FAILED</returncode>
  <messageKey>destroyHookError</messageKey>
  <message>An error happened while removing your hook. Check the logs.</message>
</response>
```

## Hooks/List

Returns the hooks registered. If a `meetingID` is informed, will return the hooks created
specifically for this meeting plus all the global hooks (since they also receive events for
this `meetingID`). If no `meetingID` is informed, returns all the hooks available (not
only the global hooks, as might be expected).

**Resource URL:** `http://yourserver.com/bigbluebutton/api/hooks/list?[parameters]&checksum=[checksum]`

**Parameters**:

| Param Name | Required / Optional | Type   | Description                                                                                                                                                                             |
| ---------- | ------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| meetingID  | Optional            | String | A meeting ID to restrict the hooks returned only to the hooks that receive events for this meeting. Will include hooks that receive events for this meeting only plus all global hooks. |

**Response when there are hooks registered**:

```xml
<response>
  <returncode>SUCCESS</returncode>
  <hooks>
    <hook>
      <hookID>1</hookID>
      <callbackURL><![CDATA[http://postcatcher.in/catchers/abcdefghijk]]></callbackURL>
      <meetingID><![CDATA[my-meeting</meetingID]]>> <!-- a hook created for this meeting only -->
      <permanentHook>false</permanentHook>
      <rawData>false</rawData>
    </hook>
    <hook>
      <hookID>2</hookID>
      <callbackURL><![CDATA[http://postcatcher.in/catchers/1234567890]]></callbackURL>
      <!-- no meetingID means this is a global hook -->
      <permanentHook>false</permanentHook>
      <rawData>false</rawData>
    </hook>
  </hooks>
</response>
```

**Response when there are no hooks registered**:

```xml
<response>
  <returncode>SUCCESS</returncode>
  <hooks></hooks>
</response>
```

## Callback format

All hooks registered are called via HTTP POST with all the information about the event in
the body of this request. The request is sent with the `Content-type` HTTP header set to
`application/x-www-form-urlencoded` and the content in the body has the following format
(when getRaw=false):

```javascript
event={"data":{"type":"event","attributes":{},"event":{"ts":0}}}
timestamp=1415900488797
```

The attribute `timestamp` is the timestamp of when this callback was made. If the web hooks
application tries to make a callback and it fails, it will try again several times, always
using the same timestamp. Timestamps will never be the same for different events and the
value will always increase.

The attribute `event` is a stringified version of all the data from the event (same as received
from redis if getRaw=true, processed if getRaw=false). The data varies for different types of
events, check the documentation for more information.

This is an example of the data sent for a meeting destroyed event when getRaw=false:

```javascript
event={"data":{"type":"event","id":"meeting-ended","attributes":{"meeting":{"internal-meeting-id":"44ea85d9684005d3b0af3c49e8a271a683cedb79-1532718208098","external-meeting-id":"random-3800337"}},"event":{"ts":1532718316938}}}
timestamp=1532718316953
```

This is the same event for another hook with getRaw=true:

```javascript
event={"envelope":{"name":"MeetingDestroyedEvtMsg","routing":{"sender":"bbb-apps-akka"}},"core":{"header":{"name":"MeetingDestroyedEvtMsg"},"body":{"meetingId":"44ea85d9684005d3b0af3c49e8a271a683cedb79-1532718208098"}}}
timestamp=1532718316953
```

Moreover, the callback call is signed with a checksum, that is included in the URL of the
request. If the registered URL is `http://my-server.com/callback`, it will receive the
checksum as in `http://my-server.com/callback?checksum=yalsdk18129e019iklasd90i`.

The way the checksum is created is similar to how the checksums are calculated for
the other BigBlueButton's API calls (take a look at [`setConfigXML`](/development/api#setconfigxml)).

```
sha1(<callback URL>+<data body>+<shared secret>)
```

Where:

* `<callback URL>`: The original callback URL, that doesn't include the checksum.
* `<data body as a string>`: All the data sent in the body of the request, concatenated and joined by `&`, as if they were parameters in a URL.
* `<shared secret>`: The shared secret of the BigBlueButton server.

So, upon receiving a callback call, an application could validate the checksum as follows:

* Get the body of the request, as in the example below:

```javascript
event={"data":{"type":"event","attributes":{},"event":{"ts":0}}}
timestamp=1234567890
```

    And convert it to a string like in the example below:

```javascript
event={"data":{"type":"event","attributes":{},"event":{"ts":0}}}
timestamp=1234567890
```

* Concatenate the original callback URL, the string from the previous step, and the BigBlueButton's salt.
* Calculate a `sha1()` of this string.
* The checksum calculated should equal the checksum received in the parameters of the request.

## More details

* Callbacks are always triggered for one event at a time and in order. They are ordered the same way
  they appear on redis pubsub (which might not exactly be the order indicated by their timestamps).
  The timestamps will almost always be ordered as well, but it's not guaranteed.
* The application assumes that events are never duplicated on pubsub. If they happen to be
  duplicated, the callback calls will also be duplicated.
* Hooks are only removed if a call to `/hooks/destroy` is made or if the callbacks for the hook fail too
  many times (~12) for a long period of time (~5min). They are never removed otherwise. Valid for
  both global hooks and hooks for specific meetings. So it's recommended for 3rd-party applications
  to register the hooks more than just once. You can either check if your hook is registered with
  `/hooks/list` and register it if it isn't, or simply register your hook every e.g. 5 minutes.
* The application uses internal mappings to find out to which meeting the events received from redis
  are related to. These mappings are removed after 24 hours of inactivity. If there are no events at
  all for a given meeting during this period, it will be assumed dead. This is done to prevent data
  from being stored forever on redis. This means that you can have issues if you have a hook
  registered for an specific meeting (doesn't happen for global hooks) and this meeting happens to
  not generate events for 24 hours, but it's still valid after it. Something very, very unlikely to
  happen!
* External URLs are expected to respond with the HTTP status 2xx (200 would be the default expected).
  Anything different from these values will be considered an error and the callback will be called
  again. This includes redirects: if your hook redirects the request, it will be considered as
  invalid and the web hooks application will try to call this hook again.
* If a meeting is created while the web hooks application is down, callbacks will never be triggered
  for this meeting. The application needs to detect the create event (`meeting_created_message`) to
  have a proper mapping of internal to external meeting IDs. So make sure the web hooks application
  is always running while BigBlueButton is running!
* If you register a hook with, for example, the URL `http://myserver.com/my/hook` and no `meetingID`
  set (making it a global hook) and later try to register another hook with the same URL but with
  a `meetingID` set, the first hook will not be removed nor modified, while the second hook will
  not be created.

## Test it

The easiest way to test the web hooks application is to register hooks in your BigBlueButton server
using the [API Mate](http://mconf.github.io/api-mate/) and capture the callbacks using the
service [PostCatcher](http://postcatcher.in/).

Follow the steps:

* Open [PostCatcher](http://postcatcher.in/) and click on "Start testing your POST requests now"
* It will redirect you to an URL such as `http://postcatcher.in/catchers/5527e67ba4c6dd0300000738`.
  Save this URL to use later.
* Open the [API Mate](http://mconf.github.io/api-mate/) and configure your server and shared secret.
* On the menu "Custom parameters", there's a field "Custom API calls:". Add these values to it:

```
hooks/create
hooks/list
```

* On the same menu section, add the following values to "Custom parameters:":

```
callbackURL=http://postcatcher.in/catchers/5527e67ba4c6dd0300000738
```

    Modify this URL to the URL you got from PostCatcher earlier.

* On the API Mate, click on the "custom call: hooks/create" link. It should respond with a success
  message.
* On the API Mate, click on the "custom call: hooks/list" link to check if your hook was really
  registered.
* Create a meeting and join it using the API Mate.
* Do stuff inside the meeting and check your PostCatcher page, you should see events pop up on it
  as you interact in your meeting.

## Development

See [Webhooks docs in GitHub](https://github.com/bigbluebutton/bbb-webhooks).

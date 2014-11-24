bbb-webhooks
============

A node.js application that listens for all events on BigBlueButton and POSTs these events to
hooks registered via an API. A hook is basically a URL that will receive HTTP POST calls with
information about an event when this event happens on BigBlueButton.

An event can be: a meeting was created, a user joined, a new presentation was uploaded,
a user left, a recording is being processed, and many others.

Registering hooks: API calls
----------------------------

This application adds three new API calls to BigBlueButton's API.

### Hooks/Create

Creates a new hook. This call is idempotent: you can call it multiple times with the same parameters
without side effects (just like the `/create` call for meetings).
Can optionally receive a `meetingID` parameter: if informed, this hook
will receive only events for this meeting; otherwise the hook will be global and will receive
events for all meetings in the server.

**Resource URL:** `http://yourserver.com/bigbluebutton/api/hooks/create?[parameters]&checksum=[checksum]`

**Parameters**:

| Param Name   | Required / Optional  | Type  | Description |
| ------------ | -------------------- | ----- | ----------- |
| calllbackURL | Required | String | The URL that will receive a POST call with the events. The same URL cannot be registered more than once. |
| meetingID    | Optional | String | A meeting ID to bind this hook to an specific meeting. If not informed, the hook will receive events for all meetings. |

**Response when a hook is successfully registered**:

```xml
<response>
  <returncode>SUCCESS</returncode>
  <hookID>1</hookID>
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


### Hooks/Destroy

Remove a previously created hook. A `hookID` must be passed in the parameters to identify
the hook to be removed.

**Resource URL:** `http://yourserver.com/bigbluebutton/api/hooks/destroy?[parameters]&checksum=[checksum]`

**Parameters**:

| Param Name  | Required / Optional  | Type  | Description |
| ----------- | -------------------- | ----- | ----------- |
| hookID      | Required | Number | The ID of the hook that should be removed, as returned in the create hook call. |

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


### Hooks/List

Returns the hooks registered. If a meeting ID is informed, will return the hooks created
specifically for this meeting plus the global hooks that receive events for this meeting.
If no meeting ID is informed, returns all the hooks available (not only the global hooks!).

**Resource URL:** `http://yourserver.com/bigbluebutton/api/hooks/list?[parameters]&checksum=[checksum]`

**Parameters**:

| Param Name  | Required / Optional  | Type  | Description |
| ----------- | -------------------- | ----- | ----------- |
| meetingID      | Optional | String | A meeting ID to restrict the hooks returned only to the hooks that receive events for this meeting. Will include hooks that receive events for this meeting only plus all global hooks. |

**Response when there are hooks registered**:

```xml
<response>
  <returncode>SUCCESS</returncode>
  <hooks>
    <hook>
      <hookID>1</hookID>
      <callbackURL>http://postcatcher.in/catchers/abcdefghijk</callbackURL>
      <meetingID>my-meeting</meetingID> <!-- a hook created for this meeting only -->
    </hook>
    <hook>
      <hookID>2</hookID>
      <callbackURL>http://postcatcher.in/catchers/1234567890</callbackURL>
      <!-- no meetingID means this is a global hook -->
    </hook>
  </hooks>
</response>
```

**Response when there are no hooks registered**:

```xml
<response>
  <returncode>FAILED</returncode>
  <hooks></hooks>
</response>
```


Callback format
---------------

All hooks registered are called via HTTP POST with all the information about the event in
the body of this request. The request is sent with the `Content-type` HTTP header set to
`application/x-www-form-urlencoded` and the content in the body is a json object in the
following format:

```
event={"header":{},"payload":{}}
timestamp=1415900488797
```

The attribute `timestamp` is the timestamp of when this callback was made. If the app tries
to make a callback and it fails, it will try again several times more, always using the same
timestamp. Timestamps will never be the same for different events and the value will always
increase.

The attribute `event` is a stringified version of  all the data from the event as received
from redis. The data varies for different types of events, check the documentation for
more information.

This is an example of the data sent for a meeting destroyed event:

```
event={"payload":{"meeting_id":"82fe1e7040551a6044cf375d12d765b5f0f099a4-1415905067841"},"header":{"timestamp":17779896,"name":"meeting_destroyed_event","current_time":1415905177220,"version":"0.0.1"}}
timestamp=1415900488797
```

Moreover, the callback call is signed with a checksum, that is included in the URL of the
request. If the registered URL is `http://my-server.com/callback`, it will receive the
checksum as in `http://my-server.com/callback?checksum=yalsdk18129e019iklasd90i`.

The way the checksum is created is similar to how the checksums are calculated for
BigBlueButton's API calls (take a look at the `setConfigXML` call).

```
sha1(<callback URL>+<data body>+<shared secret>)
```

Where:

* `<callback URL>`: The original callback URL, that doesn't include the checksum.
* `<data body as a string>`: All the data sent in the body of the request, concatenated and joined by `&`, as if they were parameters in a URL.
* `<shared secret>`: The shared secret of the BigBlueButton server.

So, upon receiving a callback call, an application could validate the checksum as follows:

* Get the body of the request and convert the string as in the example below:
    ```
event={"header":{},"payload":{}}
timestamp=1234567890
    ```

    Should become the string below:

    ```
'event={"header":{},"payload":{}}&timestamp=1234567890'
    ```
* Concatenate the original callback URL, the string from the previous step, and the BigBlueButton's salt.
* Calculate a `sha1()` of this string.
* The checksum calculated should equal the checksum received in the parameters of the request.


More details
------------
* Callbacks are always triggered for one event at a time and in order. They are ordered the same way they appear on pubsub (which might not exactly be the order indicated by their timestamps). The timestamps will almost always be ordered as well, but it's not guaranteed.
* The application assumes that events are never duplicated on pubsub. If they happen to be duplicated, the callback calls will also be duplicated. 
* Hooks are only removed if a call to `/destroy` is made or if the callbacks for the hook fail too many times (~12) for a long period of time (~5min). They are never removed otherwise. Valid for both global hooks and hooks for specific meetings.
* Mappings are removed after 24 hours of inactivity. If there are no events at all for a given meeting, it will be assumed dead. This is done to prevent data from being stored forever on redis.
* External URLs are expected to respond with the HTTP status 2xx (200 would be the default expected). Anything different from these values will be considered an error and the callback will be called again. This includes URLs that redirect to some other place.
* If a meeting is created while the webhooks app is down, callbacks will never be triggered for this meeting. The app needs to detect the create event (`meeting_created_message`) to have a mapping of internal to external meeting IDs.

Development
-----------

1. Install node. You can use [NVM](https://github.com/creationix/nvm) if you need multiple versions of node or install it from source. To install from source, first check the exact version you need on `package.json` and replace the all `vX.X.X` by the correct version when running the commands below.

    ```bash
wget http://nodejs.org/dist/vX.X.X/node-vX.X.X.tar.gz
tar -xvf node-vX.X.X.tar.gz
cd node-vX.X.X/
./configure
make
sudo make install
    ```

2. Install the dependencies: `npm install`

3. Copy and edit the configuration file: `cp config_local.coffee.example config_local.coffee`

4. Run the application with:

    ```bash
node app.js
    ```

5. To test it you can use the test application `post_catcher.js`. It starts a node app that
  registers a hook on the webhooks app and prints all the events it receives. Open the file
  at `extra/post_catcher.js` and edit the salt and domain/IP of your server and then run it
  with `node extra/post_catcher.js`. Create meetings and do things on your BigBlueButton server
  and the events should be shown in the post_catcher.

  Another option is to create hooks with the [API Mate](http://mconf.github.io/api-mate/) and
  catch the callbacks with [PostCatcher](http://postcatcher.in/).

Production
----------

1. Install node. First check the exact version you need on `package.json` and replace the all `vX.X.X` by the correct version in the commands below.

    ```bash
wget http://nodejs.org/dist/vX.X.X/node-vX.X.X.tar.gz
tar -xvf node-vX.X.X.tar.gz
cd node-vX.X.X/
./configure
make
sudo make install
    ```

2. Copy the entire webhooks directory to `/usr/local/bigbluebutton/bbb-webhooks` and cd into it.

3. Install the dependencies: `npm install`

4. Copy and edit the configuration file to adapt to your server: `cp config_local.coffee.example config_local.coffee`.

5. Drop the nginx configuration file in its place: `cp config/webhooks.nginx /etc/bigbluebutton/nginx/`.
   If you changed the port of the web server on your configuration file, you will have to edit it in `webhooks.nginx` as well.

6. Copy upstart's configuration file and make sure its permissions are ok:

    ```bash
sudo cp config/upstart-bbb-webhooks.conf /etc/init/bbb-webhooks.conf
sudo chown root:root /etc/init/bbb-webhooks.conf
    ```

    Open the file and edit it. You might need to change things like the user used to run the application.

7. Copy monit's configuration file and make sure its permissions are ok:

    ```bash
sudo cp config/monit-bbb-webhooks /etc/monit/conf.d/bbb-webhooks
sudo chown root:root /etc/monit/conf.d/bbb-webhooks
    ```

    Open the file and edit it. You might need to change things like the port used by the application.

8. Copy logrotate's configuration file and install it:

    ```bash
sudo cp config/bbb-webhooks.logrotate /etc/logrotate.d/bbb-webhooks
sudo chown root:root /etc/logrotate.d/bbb-webhooks
sudo chmod 644 /etc/logrotate.d/bbb-webhooks
sudo logrotate -s /var/lib/logrotate/status /etc/logrotate.d/bbb-webhooks
    ```

9. Start the application:

    ```bash
sudo service bbb-webhooks start
sudo service bbb-webhooks stop
    ```

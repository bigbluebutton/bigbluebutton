// Global configuration file
"use strict";

// load the local configs
const config = require("./config_local.js");

// BigBlueButton configs
if (!config.bbb) { config.bbb = {}; }
if (!config.bbb.sharedSecret) { config.bbb.sharedSecret = "ac8821d35c447bb3b959ca8fa05b1d3f"; }
if (!config.bbb.apiPath) { config.bbb.apiPath = "/bigbluebutton/api"; }

// Web server configs
if (!config.server) { config.server = {}; }
if (!config.server.port) { config.server.port = 3005; }

// Web hooks configs
if (!config.hooks) { config.hooks = {}; }
if (!config.hooks.pchannel) { config.hooks.pchannel = "bigbluebutton:*"; }
// IP where aggr will be hosted
if (!config.hooks.aggr) { config.hooks.aggr = []; }
if (!config.hooks.queueSize) { config.hooks.queueSize = 10000; }
if (!config.hooks.getRaw) { config.hooks.getRaw = false; }

if (!config.webhooks) { config.webhooks = {}; }
if (!config.webhooks.rawPath) { config.webhooks.rawPath = "payload"; }
if (!config.webhooks.meetingID) { config.webhooks.meetingID = "meeting_id"; }

// Retry intervals for failed attempts for perform callback calls.
// In ms. Totals to around 5min.
config.hooks.retryIntervals = [
  100, 500, 1000, 2000, 4000, 8000, 10000, 30000, 60000, 60000, 60000, 60000
];

// Mappings of internal to external meeting IDs
config.mappings = {};
config.mappings.cleanupInterval = 10000; // 10 secs, in ms
config.mappings.timeout = 1000*60*60*24; // 24 hours, in ms

// Redis
config.redis = {};
config.redis.keys = {};
config.redis.keys.hook = id => `bigbluebutton:webhooks:hook:${id}`;
config.redis.keys.hooks = "bigbluebutton:webhooks:hooks";
config.redis.keys.mappings = "bigbluebutton:webhooks:mappings";
config.redis.keys.mapping = id => `bigbluebutton:webhooks:mapping:${id}`;
config.redis.keys.events = id => `bigbluebutton:webhooks:events:${id}`;

config.api = {};
config.api.responses = {};
config.api.responses.failure = (key, msg) =>
  `<response> \
<returncode>FAILED</returncode> \
<messageKey>${key}</messageKey> \
<message>${msg}</message> \
</response>`
;
config.api.responses.checksumError =
  config.api.responses.failure("checksumError", "You did not pass the checksum security check.");

config.api.responses.createSuccess = (id, permanent, getRaw) =>
  `<response> \
<returncode>SUCCESS</returncode> \
<hookID>${id}</hookID> \
<permanentHook>${permanent}</permanentHook> \
<rawData>${getRaw}</rawData> \
</response>`
;
config.api.responses.createFailure =
  config.api.responses.failure("createHookError", "An error happened while creating your hook. Check the logs.");
config.api.responses.createDuplicated = id =>
  `<response> \
<returncode>SUCCESS</returncode> \
<hookID>${id}</hookID> \
<messageKey>duplicateWarning</messageKey> \
<message>There is already a hook for this callback URL.</message> \
</response>`
;

config.api.responses.destroySuccess =
  `<response> \
<returncode>SUCCESS</returncode> \
<removed>true</removed> \
</response>`;
config.api.responses.destroyFailure =
  config.api.responses.failure("destroyHookError", "An error happened while removing your hook. Check the logs.");
config.api.responses.destroyNoHook =
  config.api.responses.failure("destroyMissingHook", "The hook informed was not found.");

config.api.responses.missingParamCallbackURL =
  config.api.responses.failure("missingParamCallbackURL", "You must specify a callbackURL in the parameters.");
config.api.responses.missingParamHookID =
  config.api.responses.failure("missingParamHookID", "You must specify a hookID in the parameters.");

module.exports = config;

# Global configuration file

# load the local configs
config = require("./config_local")

# BigBlueButton configs
config.bbb or= {}
config.bbb.sharedSecret or= "ac8821d35c447bb3b959ca8fa05b1d3f"
config.bbb.apiPath or= "/bigbluebutton/api"

# Web server configs
config.server or= {}
config.server.port or= 3005

# Web hooks configs
config.hooks or= {}
config.hooks.pchannel or= "bigbluebutton:*"
config.hooks.meetingsChannel or= "bigbluebutton:from-bbb-apps:meeting"
# IP where aggr will be hosted
config.hooks.aggr or= []

# Filters to the events we want to generate callback calls for
config.hooks.events or= [
  { channel: "bigbluebutton:from-bbb-apps:meeting", name: "meeting_created_message" },
  { channel: "bigbluebutton:from-bbb-apps:meeting", name: "meeting_destroyed_event" },
  { channel: "bigbluebutton:from-bbb-apps:users", name: "user_joined_message" },
  { channel: "bigbluebutton:from-bbb-apps:users", name: "user_left_message" },
  { channel: "bigbluebutton:from-bbb-apps:users", name: "user_listening_only" },
  { channel: "bigbluebutton:from-bbb-apps:users", name: "user_joined_voice_message" },
  { channel: "bigbluebutton:from-bbb-apps:users", name: "user_left_voice_message" },
  { channel: "bigbluebutton:from-bbb-apps:users", name: "user_shared_webcam_message" },
  { channel: "bigbluebutton:from-bbb-apps:users", name: "user_unshared_webcam_message" },
  { channel: "bigbluebutton:from-rap", name: "sanity_started" },
  { channel: "bigbluebutton:from-rap", name: "sanity_ended" },
  { channel: "bigbluebutton:from-rap", name: "archive_started" },
  { channel: "bigbluebutton:from-rap", name: "archive_ended" },
  { channel: "bigbluebutton:from-rap", name: "post_archive_started" },
  { channel: "bigbluebutton:from-rap", name: "post_archive_ended" },
  { channel: "bigbluebutton:from-rap", name: "process_started" },
  { channel: "bigbluebutton:from-rap", name: "process_ended" },
  { channel: "bigbluebutton:from-rap", name: "post_process_started" },
  { channel: "bigbluebutton:from-rap", name: "post_process_ended" },
  { channel: "bigbluebutton:from-rap", name: "publish_started" },
  { channel: "bigbluebutton:from-rap", name: "publish_ended" },
  { channel: "bigbluebutton:from-rap", name: "post_publish_started" },
  { channel: "bigbluebutton:from-rap", name: "post_publish_ended" },
  { channel: "bigbluebutton:from-rap", name: "unpublished" },
  { channel: "bigbluebutton:from-rap", name: "published" },
  { channel: "bigbluebutton:from-rap", name: "deleted" }
]

# Retry intervals for failed attempts for perform callback calls.
# In ms. Totals to around 5min.
config.hooks.retryIntervals = [
  100, 500, 1000, 2000, 4000, 8000, 10000, 30000, 60000, 60000, 60000, 60000
]

# Mappings of internal to external meeting IDs
config.mappings = {}
config.mappings.cleanupInterval = 10000 # 10 secs, in ms
config.mappings.timeout = 1000*60*60*24 # 24 hours, in ms

# Redis
config.redis = {}
config.redis.keys = {}
config.redis.keys.hook = (id) -> "bigbluebutton:webhooks:hook:#{id}"
config.redis.keys.hooks = "bigbluebutton:webhooks:hooks"
config.redis.keys.mappings = "bigbluebutton:webhooks:mappings"
config.redis.keys.mapping = (id) -> "bigbluebutton:webhooks:mapping:#{id}"

config.api = {}
config.api.responses = {}
config.api.responses.failure = (key, msg) ->
  "<response> \
     <returncode>FAILED</returncode> \
     <messageKey>#{key}</messageKey> \
     <message>#{msg}</message> \
   </response>"
config.api.responses.checksumError =
  config.api.responses.failure("checksumError", "You did not pass the checksum security check.")

config.api.responses.createSuccess = (id, permanent) ->
  "<response> \
     <returncode>SUCCESS</returncode> \
     <hookID>#{id}</hookID> \
     <permanentHook>#{permanent}</permanentHook> \
   </response>"
config.api.responses.createFailure =
  config.api.responses.failure("createHookError", "An error happened while creating your hook. Check the logs.")
config.api.responses.createDuplicated = (id) ->
  "<response> \
     <returncode>SUCCESS</returncode> \
     <hookID>#{id}</hookID> \
     <messageKey>duplicateWarning</messageKey> \
     <message>There is already a hook for this callback URL.</message> \
   </response>"

config.api.responses.destroySuccess =
  "<response> \
     <returncode>SUCCESS</returncode> \
     <removed>true</removed> \
   </response>"
config.api.responses.destroyFailure =
  config.api.responses.failure("destroyHookError", "An error happened while removing your hook. Check the logs.")
config.api.responses.destroyNoHook =
  config.api.responses.failure("destroyMissingHook", "The hook informed was not found.")

config.api.responses.missingParamCallbackURL =
  config.api.responses.failure("missingParamCallbackURL", "You must specify a callbackURL in the parameters.")
config.api.responses.missingParamHookID =
  config.api.responses.failure("missingParamHookID", "You must specify a hookID in the parameters.")

module.exports = config

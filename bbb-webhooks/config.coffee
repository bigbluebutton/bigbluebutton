# Global configuration file

# load the local configs
config = require("./config_local")

# BigBlueButton configs
config.bbb or= {}
config.bbb.sharedSecret or= "33e06642a13942004fd83b3ba6e4104a"
config.bbb.apiPath or= "/bigbluebutton/api"

# Web server configs
config.server or= {}
config.server.port or= 3005

# Web hooks configs
config.hooks or= {}

# Channels to subscribe to.
config.hooks.channels or= {
  mainChannel: 'from-akka-apps-redis-channel',
  rapChannel: 'bigbluebutton:from-rap'
}

# Filters to the events we want to generate callback calls for
config.hooks.events or= [
  { channel: config.hooks.channels.mainChannel, name: "MeetingCreatedEvtMsg" },
  { channel: config.hooks.channels.mainChannel, name: "MeetingEndedEvtMsg" },
  { channel: config.hooks.channels.mainChannel, name: "UserJoinedMeetingEvtMsg" },
  { channel: config.hooks.channels.mainChannel, name: "UserLeftMeetingEvtMsg" },
  { channel: config.hooks.channels.mainChannel, name: "UserJoinedVoiceConfToClientEvtMsg" },
  { channel: config.hooks.channels.mainChannel, name: "UserLeftVoiceConfToClientEvtMsg" },
  { channel: config.hooks.channels.mainChannel, name: "UserMutedVoiceEvtMsg" },
  { channel: config.hooks.channels.mainChannel, name: "UserBroadcastCamStartedEvtMsg" },
  { channel: config.hooks.channels.mainChannel, name: "UserBroadcastCamStoppedEvtMsg" },
  { channel: config.hooks.channels.mainChannel, name: "RecordingStatusChangedEvtMsg" },
  { channel: config.hooks.channels.rapChannel, name: "sanity_started" },
  { channel: config.hooks.channels.rapChannel, name: "sanity_ended" },
  { channel: config.hooks.channels.rapChannel, name: "archive_started" },
  { channel: config.hooks.channels.rapChannel, name: "archive_ended" },
  { channel: config.hooks.channels.rapChannel, name: "post_archive_started" },
  { channel: config.hooks.channels.rapChannel, name: "post_archive_ended" },
  { channel: config.hooks.channels.rapChannel, name: "process_started" },
  { channel: config.hooks.channels.rapChannel, name: "process_ended" },
  { channel: config.hooks.channels.rapChannel, name: "post_process_started" },
  { channel: config.hooks.channels.rapChannel, name: "post_process_ended" },
  { channel: config.hooks.channels.rapChannel, name: "publish_started" },
  { channel: config.hooks.channels.rapChannel, name: "publish_ended" },
  { channel: config.hooks.channels.rapChannel, name: "post_publish_started" },
  { channel: config.hooks.channels.rapChannel, name: "post_publish_ended" },
  { channel: config.hooks.channels.rapChannel, name: "unpublished" },
  { channel: config.hooks.channels.rapChannel, name: "published" },
  { channel: config.hooks.channels.rapChannel, name: "deleted" }
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

config.api.responses.createSuccess = (id) ->
  "<response> \
     <returncode>SUCCESS</returncode> \
     <hookID>#{id}</hookID> \
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

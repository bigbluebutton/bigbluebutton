# # Global configurations file

config = {}

# Default global variables
config.appName = 'BigBlueButton HTML5 Client'
config.maxUsernameLength = 30
config.maxChatLength = 140

# the path in which an image of a presentation is stored
config.presentationImagePath = (meetingID, presentationID, filename) ->
  "bigbluebutton/presentation/#{meetingID}/#{meetingID}/#{presentationID}/png/#{filename}"

## Application configurations
config.app = {}

# Generate a new secret with:
# $ npm install crypto
# $ coffee
# coffee> crypto = require 'crypto'
# coffee> crypto.randomBytes(32).toString('base64')
config.app.sessionSecret = "J7XSu96KC/B/UPyeGub3J6w6QFXWoUNABVgi9Q1LskE="

# Configs for redis
config.redis = {}
config.redis.host = "127.0.0.1"
config.redis.post = "6379"
config.redis.timeout = 5000
config.redis.channels = {}
config.redis.channels.fromBBBApps = "bigbluebutton:from-bbb-apps:*"
config.redis.channels.toBBBApps = {}
config.redis.channels.toBBBApps.pattern = "bigbluebutton:to-bbb-apps:*"
config.redis.channels.toBBBApps.chat = "bigbluebutton:to-bbb-apps:chat"
config.redis.channels.toBBBApps.meeting = "bigbluebutton:to-bbb-apps:meeting"
config.redis.channels.toBBBApps.users = "bigbluebutton:to-bbb-apps:users"
config.redis.channels.toBBBApps.whiteboard = "bigbluebutton:to-bbb-apps:whiteboard"
config.redis.internalChannels = {}
config.redis.internalChannels.receive = "html5-receive"
config.redis.internalChannels.reply = "html5-reply"
config.redis.internalChannels.publish = "html5-publish"

# Logging
config.log = {}

config.log.path = if process.env.NODE_ENV == "production"
  "/var/log/bigbluebutton/bbbnode.log"
else
  "./log/development.log"

# Global instance of Modules, created by `app.coffee`
config.modules = null

module.exports = config

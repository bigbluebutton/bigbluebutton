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
# TODO: make this a module in config.modules
config.app = {}
config.app.server = null # the express server, created by `app.coffee`

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

# Global instance of Modules, created by `app.coffee`
config.modules = null

module.exports = config

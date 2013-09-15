# # Global configurations file

config = {}

# Default global variables
config.maxUsernameLength = 30
config.maxChatLength = 140

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

# This returns the folder where the presentation files will be stored for that
# particular presentationID.
# @param  {string} metingID       the ID of the meeting
# @param  {string} presentationID the presentationID being looked up for a folder
# @return {string}                the full URL for where the images will be stored
config.presentationImageFolder = (meetingID, presentationID) ->
  "/var/bigbluebutton/#{meetingID}/#{meetingID}/#{presentationID}/pngs"

module.exports = config

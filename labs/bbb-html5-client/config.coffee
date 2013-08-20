# # Global configurations file

config = {}

# default global variables
config.maxUsernameLength = 30
config.maxChatLength = 140

# the application object
config.app = null

# default redis store
config.store = null

# configs for redis
config.redis = {}

# Other modules that are created and set in these variables by app.coffee
config.mainRouter = null
config.redisAction = null
config.socketAction = null
config.store = null

# This returns the folder where the presentation files will be stored for that
# particular presentationID.
# @param  {string} metingID       the ID of the meeting
# @param  {string} presentationID the presentationID being looked up for a folder
# @return {string}                the full URL for where the images will be stored
config.presentationImageFolder = (meetingID, presentationID) ->
  "/var/bigbluebutton/#{meetingID}/#{meetingID}/#{presentationID}/pngs"

module.exports = config

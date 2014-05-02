# # Global configurations file

config = {}

# Logging
config.log = {}

config.log.path = if process.env.NODE_ENV == "production"
  "/var/log/bigbluebutton/recording-api.log"
else
  "./log/recording-api-dev.log"

module.exports = config
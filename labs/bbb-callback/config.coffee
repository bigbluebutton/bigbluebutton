# Global configurations file

# load the local configs
# config = require("./config_local")
config = {}

# Filters to the events we want to generate callback calls for
config.events = [
  { channel: "bigbluebutton:from-bbb-apps:meeting", name: "meeting_created_message" },
  { channel: "bigbluebutton:from-bbb-apps:meeting", name: "meeting_destroyed_event" },
  { channel: "bigbluebutton:from-bbb-apps:users", name: "user_joined_message" },
  { channel: "bigbluebutton:from-bbb-apps:users", name: "presenter_assigned_message" },
  { channel: "bigbluebutton:from-bbb-apps:users", name: "user_left_message" }
  # { channel: "bigbluebutton:from-bbb-apps:meeting", name: "user_registered_message" },
]

module.exports = config

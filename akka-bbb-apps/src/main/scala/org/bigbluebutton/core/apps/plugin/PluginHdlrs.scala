package org.bigbluebutton.core.apps.plugin

import org.apache.pekko.actor.ActorContext
import org.apache.pekko.event.Logging
import org.bigbluebutton.common2.msgs.PluginDataChannelDeleteEntryMsgBody

class PluginHdlrs(implicit val context: ActorContext)
  extends PluginDataChannelPushEntryMsgHdlr
  with PluginDataChannelReplaceEntryMsgHdlr
  with PluginDataChannelDeleteEntryMsgHdlr
  with PluginDataChannelResetMsgHdlr
  with PluginPersistEventMsgHdlr {

}

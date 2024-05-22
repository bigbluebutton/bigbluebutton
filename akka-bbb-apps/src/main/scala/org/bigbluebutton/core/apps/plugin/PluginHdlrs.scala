package org.bigbluebutton.core.apps.plugin

import org.apache.pekko.actor.ActorContext
import org.apache.pekko.event.Logging
import org.bigbluebutton.common2.msgs.PluginDataChannelDeleteEntryMsgBody

class PluginHdlrs(implicit val context: ActorContext)
  extends PluginDataChannelPushEntryMsgHdlr
  with PluginDataChannelDeleteEntryMsgHdlr
  with PluginDataChannelResetMsgHdlr {

  val log = Logging(context.system, getClass)
}

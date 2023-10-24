package org.bigbluebutton.core.apps.plugin

import org.apache.pekko.actor.ActorContext
import org.apache.pekko.event.Logging

class PluginHdlrs(implicit val context: ActorContext)
  extends DispatchPluginDataChannelMessageMsgHdlr {

  val log = Logging(context.system, getClass)
}

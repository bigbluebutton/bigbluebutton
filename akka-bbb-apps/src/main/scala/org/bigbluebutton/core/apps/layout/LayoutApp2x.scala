package org.bigbluebutton.core.apps.layout

import akka.actor.ActorContext
import akka.event.Logging
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.running.LiveMeeting
import scala.collection.mutable.ArrayBuffer
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.models.Layouts
import org.bigbluebutton.core.models.Roles

class LayoutApp2x(val liveMeeting: LiveMeeting,
  val outGW: OutMessageGateway)(implicit val context: ActorContext)
    extends BroadcastLayoutMsgHdlr
    with GetCurrentLayoutReqMsgHdlr
    with LockLayoutMsgHdlr {

  val log = Logging(context.system, getClass)

  def affectedUsers(): Array[String] = {
    val au = ArrayBuffer[String]()
    if (Layouts.doesLayoutApplyToViewersOnly()) {
      Users2x.findAll(liveMeeting.users2x) foreach { u =>
        if (!u.presenter && u.role != Roles.MODERATOR_ROLE) {
          au += u.intId
        }
      }
    } else {
      Users2x.findAll(liveMeeting.users2x) foreach { u =>
        au += u.intId
      }
    }
    au.toArray
  }
}

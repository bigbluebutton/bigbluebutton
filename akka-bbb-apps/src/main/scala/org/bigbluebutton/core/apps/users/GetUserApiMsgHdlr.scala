package org.bigbluebutton.core.apps.users

import akka.actor.ActorRef
import org.bigbluebutton.common2.msgs.GetUsersMeetingReqMsg
import org.bigbluebutton.core.api.{ ApiResponseSuccess, GetUserApiMsg }
import org.bigbluebutton.core.models.{ RegisteredUsers, Users2x }
import org.bigbluebutton.core.running.{ HandlerHelpers, LiveMeeting, OutMsgRouter }

trait GetUserApiMsgHdlr extends HandlerHelpers {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleGetUsersMeetingReqMsg(msg: GetUserApiMsg, actorRef: ActorRef): Unit = {

    for {
      user <- RegisteredUsers.findWithUserId(msg.userIntId, liveMeeting.registeredUsers)
    } yield {
      log.debug("replying GetUserApiMsg with success")
      actorRef ! ApiResponseSuccess("USER ENCONTRADO!", user)
    }

    log.debug("or what?")

    //      for {
    //      uvo <- Users2x.findWithIntId(liveMeeting.users2x, msg.userIntId)
    //      //UserState
    //    } yield {
    //
    //    }
    //    }

    //    sendAllUsersInMeeting(msg.body.userId)
    //    sendAllVoiceUsersInMeeting(msg.body.userId, liveMeeting.voiceUsers, liveMeeting.props.meetingProp.intId)
  }
}

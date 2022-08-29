package org.bigbluebutton.core.apps.users

import akka.actor.ActorRef
import org.bigbluebutton.common2.api.{ApiResponseSuccess, UserInfosApiMsg, GetUserApiMsg}
import org.bigbluebutton.common2.msgs.GetUsersMeetingReqMsg
import org.bigbluebutton.core.models.{RegisteredUsers, Roles, Users2x}
import org.bigbluebutton.core.running.{HandlerHelpers, LiveMeeting, OutMsgRouter}

trait GetUserApiMsgHdlr extends HandlerHelpers {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleGetUsersMeetingReqMsg(msg: GetUserApiMsg, actorRef: ActorRef): Unit = {

    for {
      regUser <- RegisteredUsers.findWithUserId(msg.userIntId, liveMeeting.registeredUsers)
    } yield {
      log.debug("replying GetUserApiMsg with success")

      var userInfos: Map[String, Any] = Map()
      userInfos += ("returncode" -> "SUCCESS")
      userInfos += ("fullname" -> regUser.name)
      userInfos += ("confname" -> liveMeeting.props.meetingProp.name)
      userInfos += ("meetingID" -> liveMeeting.props.meetingProp.intId)
      userInfos += ("externMeetingID" -> liveMeeting.props.meetingProp.extId)
      userInfos += ("externUserID" -> regUser.externId)
      userInfos += ("internalUserID" -> regUser.id)
      userInfos += ("authToken" -> regUser.authToken)
      userInfos += ("role" -> regUser.role)
      userInfos += ("guest" -> regUser.guest)
      userInfos += ("guestStatus" -> regUser.guestStatus)
      userInfos += ("conference" -> liveMeeting.props.meetingProp.intId) //TODO is it being used?
      userInfos += ("room" -> liveMeeting.props.meetingProp.intId)
      userInfos += ("voicebridge" -> liveMeeting.props.voiceProp.telVoice)
      userInfos += ("dialnumber" -> liveMeeting.props.voiceProp.dialNumber)
      userInfos += ("webvoiceconf" -> liveMeeting.props.voiceProp.voiceConf)
      userInfos += ("mode" -> "LIVE")
      userInfos += ("record" -> liveMeeting.props.recordProp.record)
      userInfos += ("isBreakout" -> liveMeeting.props.meetingProp.isBreakout)
      //userInfos += ("logoutTimer" -> ) //clientLogoutTimerInMinutes CONFIG
      //userInfos += ("allowStartStopRecording" -> "bla") //allowStartStopRecording CONFIG
      userInfos += ("welcome" -> liveMeeting.props.welcomeProp.welcomeMsg)
      if (regUser.role == Roles.MODERATOR_ROLE) {
        userInfos += ("modOnlyMessage" -> liveMeeting.props.welcomeProp.modOnlyMessage)
      }



      //TODO is it used?
      //      userInfos += ("bannerText" -> "a)
      //      userInfos += ("bannerColor" -> "a")

      //userInfos += ("customLogoURL" -> "bla") //customLogoURL  CONFIG
      //userInfos += ("customCopyright" -> "bla") //TODO is it used?

      //userInfos += ("muteOnStart" -> "bla") //muteOnStart CONFIG
      //userInfos += ("allowModsToUnmuteUsers" -> "bla") //allowModsToUnmuteUsers CONFIG
      //userInfos += ("logoutUrl" -> liveMeeting.props.meetingProp.) //logoutUrl CONFIG
      userInfos += ("defaultLayout" -> "SMART_LAYOUT") //can be changed via parameter
      userInfos += ("avatarURL" -> regUser.avatarURL)

      if (liveMeeting.props.breakoutProps != null) {
        userInfos += ("breakoutRooms" -> Map(
          "record" -> liveMeeting.props.breakoutProps.record,
          "privateChatEnabled" -> liveMeeting.props.breakoutProps.privateChatEnabled,
        ))
      }

      userInfos += ("customdata" -> Array()) //TODO
      userInfos += ("metadata" -> Array()) //TODO

      actorRef ! ApiResponseSuccess("User found!", UserInfosApiMsg(userInfos))
    }

    log.debug("Handle user not found here..")

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

package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.common2.messages._
import org.bigbluebutton.common2.messages.voiceconf.{ MuteUserInVoiceConfMsg, MuteUserInVoiceConfMsgBody }
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.{ MeetingMuted, MuteAllExceptPresenterRequest, MuteVoiceUser }
import org.bigbluebutton.core.models.{ Users2x, VoiceUserState, VoiceUsers }
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.MeetingStatus2x

trait MuteAllExceptPresenterRequestHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleMuteAllExceptPresenterRequest(msg: MuteAllExceptPresenterRequest) {
    if (msg.mute) {
      MeetingStatus2x.muteMeeting(liveMeeting.status)
    } else {
      MeetingStatus2x.unmuteMeeting(liveMeeting.status)
    }

    outGW.send(new MeetingMuted(props.meetingProp.intId, props.recordProp.record,
      MeetingStatus2x.isMeetingMuted(liveMeeting.status)))

    usersWhoAreNotPresenter foreach { u =>
      outGW.send(new MuteVoiceUser(props.meetingProp.intId, props.recordProp.record, msg.requesterID,
        u.id, props.voiceProp.voiceConf, u.voiceUser.userId, msg.mute))
    }

    def muteUserInVoiceConf(vu: VoiceUserState): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId, vu.intId)
      val envelope = BbbCoreEnvelope(MuteUserInVoiceConfMsg.NAME, routing)
      val header = BbbCoreHeaderWithMeetingId(MuteUserInVoiceConfMsg.NAME, props.meetingProp.intId)

      val body = MuteUserInVoiceConfMsgBody(props.voiceProp.voiceConf, vu.voiceUserId, true)
      val event = MuteUserInVoiceConfMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      outGW.send(msgEvent)

    }

    // I think the correct flow would be to find those who are presenters and exclude them
    // from the list of voice users. The remaining, mute.
    VoiceUsers.findAll(liveMeeting.voiceUsers) foreach { vu =>
      if (!vu.listenOnly) {
        Users2x.findWithIntId(liveMeeting.users2x, vu.intId) match {
          case Some(u) => if (!u.presenter) muteUserInVoiceConf(vu)
          case None => muteUserInVoiceConf(vu)
        }
      }
    }

  }

}

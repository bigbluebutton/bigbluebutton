package org.bigbluebutton.core.apps.deskshare

import org.bigbluebutton.core.api._
import org.bigbluebutton.core.apps.DeskshareModel
import org.bigbluebutton.core.models.{ UserState, Users2x }
import org.bigbluebutton.core2.MeetingStatus2x

trait EjectUserFromMeetingHdlr {
  this: DeskshareApp2x =>

  def handle(msg: EjectUserFromMeeting, userToEject: UserState) {
    if (userToEject.presenter) {
      if (DeskshareModel.isBroadcastingRTMP(liveMeeting.deskshareModel)) {
        // The presenter left during desktop sharing. Stop desktop sharing on FreeSWITCH
        outGW.send(new DeskShareHangUp(liveMeeting.props.meetingProp.intId, liveMeeting.props.voiceProp.voiceConf))

        // notify other clients to close their deskshare view
        outGW.send(new DeskShareNotifyViewersRTMP(liveMeeting.props.meetingProp.intId,
          DeskshareModel.getRTMPBroadcastingUrl(liveMeeting.deskshareModel),
          DeskshareModel.getDesktopShareVideoWidth(liveMeeting.deskshareModel),
          DeskshareModel.getDesktopShareVideoHeight(liveMeeting.deskshareModel), false))

        // reset meeting info
        DeskshareModel.resetDesktopSharingParams(liveMeeting.deskshareModel)
      }
    }
  }

}

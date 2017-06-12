package org.bigbluebutton.core2.message.handlers.breakoutrooms

import org.bigbluebutton.common2.messages.CreateBreakoutRoomsMsg
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core.api.BreakoutRoomOutPayload
import org.bigbluebutton.core.models.BreakoutRooms
import org.bigbluebutton.core.apps.BreakoutRoomsUtil
import org.bigbluebutton.core.api.CreateBreakoutRoom

trait CreateBreakoutRoomsMsgHdlr {
  this: MeetingActor =>
  val outGW: OutMessageGateway

  def handleCreateBreakoutRoomsMsg(msg: CreateBreakoutRoomsMsg): Unit = {
    // If breakout rooms are being created we ignore the coming message
    if (liveMeeting.breakoutRooms.pendingRoomsNumber > 0) {
      log.warning("CreateBreakoutRooms event received while {} are pending to be created for meeting {}",
        liveMeeting.breakoutRooms.pendingRoomsNumber, props.meetingProp.intId)
      return
    }
    if (BreakoutRooms.getNumberOfRooms(liveMeeting.breakoutRooms) > 0) {
      log.warning("CreateBreakoutRooms event received while {} breakout rooms running for meeting {}",
        BreakoutRooms.getNumberOfRooms(liveMeeting.breakoutRooms), props.meetingProp.intId)
      return
    }

    var i = 0
    // in very rare cases the presentation conversion generates an error, what should we do?
    // those cases where default.pdf is deleted from the whiteboard
    val sourcePresentationId = if (!liveMeeting.presModel.getCurrentPresentation().isEmpty) liveMeeting.presModel.getCurrentPresentation().get.id else "blank"
    val sourcePresentationSlide = if (!liveMeeting.presModel.getCurrentPage().isEmpty) liveMeeting.presModel.getCurrentPage().get.num else 0
    liveMeeting.breakoutRooms.pendingRoomsNumber = msg.body.rooms.length;

    for (room <- msg.body.rooms) {
      i += 1
      val breakoutMeetingId = BreakoutRoomsUtil.createMeetingIds(props.meetingProp.intId, i)
      val voiceConfId = BreakoutRoomsUtil.createVoiceConfId(props.voiceProp.voiceConf, i)

      for {
        r <- BreakoutRooms.newBreakoutRoom(props.meetingProp.intId, breakoutMeetingId._1, breakoutMeetingId._2, room.name,
          room.sequence, voiceConfId, room.users, liveMeeting.breakoutRooms)
      } yield {
        val p = new BreakoutRoomOutPayload(r.id, r.name, props.meetingProp.intId, r.sequence,
          r.voiceConfId, msg.body.durationInMinutes, props.password.moderatorPass, props.password.viewerPass,
          sourcePresentationId, sourcePresentationSlide, msg.body.record)
        outGW.send(new CreateBreakoutRoom(props.meetingProp.intId, p))
      }
    }
  }

}

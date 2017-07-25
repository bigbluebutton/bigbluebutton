package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.{ BreakoutRooms, Users2x }
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, MeetingActor, OutMsgRouter }

trait BreakoutRoomCreatedMsgHdlr extends SystemConfiguration {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleBreakoutRoomCreatedMsg(msg: BreakoutRoomCreatedMsg): Unit = {

    liveMeeting.breakoutRooms.pendingRoomsNumber -= 1
    val room = BreakoutRooms.getBreakoutRoom(liveMeeting.breakoutRooms, msg.body.breakoutRoomId)
    room foreach { room =>
      sendBreakoutRoomStarted(room.parentRoomId, room.name, room.externalMeetingId, room.id, room.sequence, room.voiceConfId)
    }

    // We postpone sending invitation until all breakout rooms have been created
    if (liveMeeting.breakoutRooms.pendingRoomsNumber == 0) {
      log.info("All breakout rooms created for meetingId={}", liveMeeting.props.meetingProp.intId)
      BreakoutRooms.getRooms(liveMeeting.breakoutRooms).foreach { room =>
        BreakoutRooms.getAssignedUsers(liveMeeting.breakoutRooms, room.id) foreach { users =>
          users.foreach { u =>
            log.debug("Sending Join URL for users")
            sendJoinURL(u, room.externalMeetingId, room.sequence.toString())
          }
        }
      }

      sendBreakoutRoomsList()
    }
  }

  def buildBreakoutRoomsListEvtMsg(meetingId: String, rooms: Vector[BreakoutRoomInfo], roomsReady: Boolean): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, "not-used")
    val envelope = BbbCoreEnvelope(BreakoutRoomsListEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(BreakoutRoomsListEvtMsg.NAME, meetingId, "not-used")

    val body = BreakoutRoomsListEvtMsgBody(meetingId, rooms, roomsReady)
    val event = BreakoutRoomsListEvtMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, event)

  }

  def sendBreakoutRoomsList(): Unit = {
    val breakoutRooms = BreakoutRooms.getRooms(liveMeeting.breakoutRooms).toVector map { r =>
      new BreakoutRoomInfo(r.name, r.externalMeetingId, r.id, r.sequence)
    }

    val roomsReady = liveMeeting.breakoutRooms.pendingRoomsNumber == 0 && breakoutRooms.length > 0

    log.info("Sending breakout rooms list to {} with containing {} room(s)", liveMeeting.props.meetingProp.intId, breakoutRooms.length)

    val msgEvent = buildBreakoutRoomsListEvtMsg(liveMeeting.props.meetingProp.intId, breakoutRooms, roomsReady)
    outGW.send(msgEvent)
  }

  def sendBreakoutRoomStarted(meetingId: String, breakoutName: String, externalMeetingId: String,
                              breakoutMeetingId: String, sequence: Int, voiceConfId: String) {
    log.info("Sending breakout room started {} for parent meeting {} ", breakoutMeetingId, meetingId)

    def build(meetingId: String, breakout: BreakoutRoomInfo): BbbCommonEnvCoreMsg = {
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId, "not-used"
      )
      val envelope = BbbCoreEnvelope(BreakoutRoomStartedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(BreakoutRoomStartedEvtMsg.NAME, liveMeeting.props.meetingProp.intId, "not-used")

      val body = BreakoutRoomStartedEvtMsgBody(meetingId, breakout)
      val event = BreakoutRoomStartedEvtMsg(header, body)
      BbbCommonEnvCoreMsg(envelope, event)
    }

    val breakoutInfo = BreakoutRoomInfo(breakoutName, externalMeetingId, meetingId, sequence)
    val event = build(meetingId, breakoutInfo)
    outGW.send(event)
  }

  def sendJoinURL(userId: String, externalMeetingId: String, roomSequence: String) {
    log.debug("Sending breakout meeting {} Join URL for user: {}", externalMeetingId, userId)
    for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, userId)
      apiCall = "join"
      params = BreakoutRoomsUtil.joinParams(user.name, userId + "-" + roomSequence, true,
        externalMeetingId, liveMeeting.props.password.moderatorPass)
      // We generate a first url with redirect -> true
      redirectBaseString = BreakoutRoomsUtil.createBaseString(params._1)
      redirectJoinURL = BreakoutRoomsUtil.createJoinURL(bbbWebAPI, apiCall, redirectBaseString,
        BreakoutRoomsUtil.calculateChecksum(apiCall, redirectBaseString, bbbWebSharedSecret))
      // We generate a second url with redirect -> false
      noRedirectBaseString = BreakoutRoomsUtil.createBaseString(params._2)
      noRedirectJoinURL = BreakoutRoomsUtil.createJoinURL(bbbWebAPI, apiCall, noRedirectBaseString,
        BreakoutRoomsUtil.calculateChecksum(apiCall, noRedirectBaseString, bbbWebSharedSecret))
    } yield {
      def build(meetingId: String, breakoutMeetingId: String,
                userId: String, redirectJoinURL: String, noRedirectJoinURL: String): BbbCommonEnvCoreMsg = {
        val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, "not-used")
        val envelope = BbbCoreEnvelope(BreakoutRoomJoinURLEvtMsg.NAME, routing)
        val header = BbbClientMsgHeader(BreakoutRoomJoinURLEvtMsg.NAME, meetingId, "not-used")

        val body = BreakoutRoomJoinURLEvtMsgBody(meetingId, breakoutMeetingId,
          userId, redirectJoinURL, noRedirectJoinURL)
        val event = BreakoutRoomJoinURLEvtMsg(header, body)
        BbbCommonEnvCoreMsg(envelope, event)
      }

      val msgEvent = build(liveMeeting.props.meetingProp.intId, externalMeetingId, userId,
        redirectJoinURL, noRedirectJoinURL)
      outGW.send(msgEvent)
    }
  }
}

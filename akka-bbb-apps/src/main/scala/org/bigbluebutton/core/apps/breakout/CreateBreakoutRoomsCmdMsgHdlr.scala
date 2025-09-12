package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.ClientSettings.{getConfigPropertyValueByPath, getConfigPropertyValueByPathAsIntOrElse}
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.{BreakoutModel, PermissionCheck, RightsManagementTrait}
import org.bigbluebutton.core.db.BreakoutRoomDAO
import org.bigbluebutton.core.domain.{BreakoutRoom2x, MeetingState2x}
import org.bigbluebutton.core.models.PluginModel.getPlugins
import org.bigbluebutton.core.models.{Plugin, PresentationInPod}
import org.bigbluebutton.core.running.{LiveMeeting, OutMsgRouter}
import org.bigbluebutton.core.running.MeetingActor

import java.util
import scala.jdk.CollectionConverters._

trait CreateBreakoutRoomsCmdMsgHdlr extends RightsManagementTrait {
  this: MeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleCreateBreakoutRoomsCmdMsg(msg: CreateBreakoutRoomsCmdMsg, state: MeetingState2x): MeetingState2x = {


    val minOfRooms = 2
    val maxOfRooms = getConfigPropertyValueByPathAsIntOrElse(liveMeeting.clientSettings, "public.app.breakouts.breakoutRoomLimit", 16)

    if (liveMeeting.props.meetingProp.disabledFeatures.contains("breakoutRooms")) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "Breakout rooms is disabled for this meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
      state
    } else if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId) || liveMeeting.props.meetingProp.isBreakout) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to create breakout room for meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId,
        reason, outGW, liveMeeting)
      state
    } else if(msg.body.rooms.length > maxOfRooms || msg.body.rooms.length < minOfRooms) {
      log.warning(
        "Attempt to create breakout rooms with invalid number of rooms (rooms: {}, max: {}, min: {}) in meeting {}",
        msg.body.rooms.size,
        maxOfRooms,
        minOfRooms,
        liveMeeting.props.meetingProp.intId
      )
      state
    } else {
      state.breakout match {
        case Some(breakout) =>
          log.warning(
            "CreateBreakoutRooms event received while breakout created for meeting {}", liveMeeting.props.meetingProp.intId
          )
          state
        case None =>
          processRequest(msg, state)
      }
    }
  }

  def processRequest(msg: CreateBreakoutRoomsCmdMsg, state: MeetingState2x): MeetingState2x = {
    val presId = getPresentationId(state) // The current presentation
    val presSlide = getPresentationSlide(state) // The current slide
    val parentId = liveMeeting.props.meetingProp.intId
    var rooms = new collection.immutable.HashMap[String, BreakoutRoom2x]
    val filteredPluginProp = liveMeeting.props.pluginProp.asScala
      .filter { case (key, _) =>
        getPlugins(liveMeeting.plugins).get(key).exists(_.manifest.content match {
          case Some(pluginManifestContent) => pluginManifestContent.enabledForBreakoutRooms
          case None => false
        })
      }
      .asJava

    var i = 0
    for (room <- msg.body.rooms) {
      val roomPresId = if (room.presId.isEmpty) presId else room.presId;

      i += 1
      val (internalId, externalId) = BreakoutRoomsUtil.createMeetingIds(liveMeeting.props.meetingProp.intId, i)
      val voiceConf = BreakoutRoomsUtil.createVoiceConfId(liveMeeting.props.voiceProp.voiceConf, i)

      val breakout = BreakoutModel.create(parentId, internalId, externalId, room.name, room.sequence, room.shortName,
        room.isDefaultName, room.freeJoin, voiceConf, room.users, msg.body.captureNotes,
        msg.body.captureSlides, room.captureNotesFilename, room.captureSlidesFilename,
        room.allPages, roomPresId)

      rooms = rooms + (breakout.id -> breakout)
    }

    for (breakout <- rooms.values.toVector) {

      val roomSlides = if (breakout.allPages) -1 else presSlide;
      val roomDetail = new BreakoutRoomDetail(
        breakout.id, breakout.name,
        liveMeeting.props.meetingProp.intId,
        breakout.sequence,
        breakout.shortName,
        breakout.isDefaultName,
        breakout.freeJoin,
        liveMeeting.props.voiceProp.dialNumber,
        breakout.voiceConf,
        msg.body.durationInMinutes,
        liveMeeting.props.password.moderatorPass,
        liveMeeting.props.password.viewerPass,
        breakout.presId,
        roomSlides,
        msg.body.record,
        liveMeeting.props.breakoutProps.privateChatEnabled,
        breakout.captureNotes,
        breakout.captureSlides,
        breakout.captureNotesFilename,
        breakout.captureSlidesFilename,
        pluginProp = filteredPluginProp,
        disabledFeatures = new util.ArrayList[String](liveMeeting.props.meetingProp.disabledFeatures.asJava),
        liveMeeting.props.meetingProp.audioBridge,
        liveMeeting.props.meetingProp.cameraBridge,
        liveMeeting.props.meetingProp.screenShareBridge,
      )

      val event = buildCreateBreakoutRoomSysCmdMsg(liveMeeting.props.meetingProp.intId, roomDetail)
      outGW.send(event)
    }

    val breakoutModel = new BreakoutModel(None, msg.body.durationInMinutes * 60, rooms, msg.body.sendInviteToModerators)
    BreakoutRoomDAO.insert(breakoutModel, liveMeeting)
    state.update(Some(breakoutModel))
  }

  def buildCreateBreakoutRoomSysCmdMsg(meetingId: String, breakout: BreakoutRoomDetail): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(CreateBreakoutRoomSysCmdMsg.NAME, routing)
    val header = BbbCoreBaseHeader(CreateBreakoutRoomSysCmdMsg.NAME)

    val body = CreateBreakoutRoomSysCmdMsgBody(meetingId, breakout)
    val event = CreateBreakoutRoomSysCmdMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, event)
  }

  def getPresentationId(state: MeetingState2x): String = {
    // in very rare cases the presentation conversion generates an error, what should we do?
    // those cases where default.pdf is deleted from the whiteboard
    var currentPresentation = "blank"
    for {
      defaultPod <- state.presentationPodManager.getDefaultPod()
      curPres <- defaultPod.getCurrentPresentation()
    } yield {
      currentPresentation = curPres.id
    }

    currentPresentation
  }

  def getPresentationSlide(state: MeetingState2x): Int = {
    if (!liveMeeting.presModel.getCurrentPage().isEmpty) liveMeeting.presModel.getCurrentPage().get.num else 0
    var currentSlide = 0
    for {
      defaultPod <- state.presentationPodManager.getDefaultPod()
      curPres <- defaultPod.getCurrentPresentation()
      curPage <- PresentationInPod.getCurrentPage(curPres)
    } yield {
      currentSlide = curPage.num
    }

    currentSlide
  }
}

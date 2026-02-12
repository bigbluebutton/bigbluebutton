package org.bigbluebutton.core.apps.mediagroups

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core.db.MediaGroupUserDAO

// Reserved group IDs for the explicit public space per media type
object PublicMediaGroupIds {
  val AUDIO = "public:audio"
  val CAMERA = "public:camera"
  val SCREENSHARE = "public:screenshare"

  val All: Vector[String] = Vector(AUDIO, CAMERA, SCREENSHARE)

  def isPublicGroup(groupId: String): Boolean =
    groupId == AUDIO || groupId == CAMERA || groupId == SCREENSHARE

  def publicGroupIdForMediaType(mediaType: String): String = mediaType match {
    case "audio"       => AUDIO
    case "camera"      => CAMERA
    case "screenshare" => SCREENSHARE
    case _             => s"public:$mediaType"
  }
}

object MediaGroupApp {
  def createMediaGroup(
      id:          String,
      createdBy:   String,
      mediaType:   String,
      locked:      Boolean,
      record:      Boolean,
      senders:     Vector[MediaGroupParticipant],
      receivers:   Vector[MediaGroupParticipant],
      mediaGroups: MediaGroups
  ): MediaGroup = {
    val newSenders = senders.toSet
    val newReceivers = receivers.toSet
    new MediaGroup(id, createdBy, mediaType, locked, record, newSenders, newReceivers)
  }

  def addMediaGroup(
      mg:          MediaGroup,
      mediaGroups: MediaGroups
  ): MediaGroups = {
    mediaGroups.add(mg)
  }

  def findMediaGroup(id: String, mediaGroups: MediaGroups): Option[MediaGroup] = {
    mediaGroups.find(id)
  }

  def deleteMediaGroup(id: String, mediaGroups: MediaGroups): MediaGroups = {
    mediaGroups.remove(id)
  }

  def addMediaGroupParticipants(
      id:          String,
      senders:     Vector[MediaGroupParticipant],
      receivers:   Vector[MediaGroupParticipant],
      mediaGroups: MediaGroups
  ): MediaGroups = {
    mediaGroups.find(id) match {
      case Some(mg) =>
        val updatedMg = mg.addSenders(senders).addReceivers(receivers)
        mediaGroups.update(updatedMg)
      case None =>
        mediaGroups
    }
  }

  def addMediaGroupParticipant(
      id:          String,
      participant: MediaGroupParticipant,
      mediaGroups: MediaGroups
  ): MediaGroups = {
    mediaGroups.find(id) match {
      case Some(mg) =>
        val updatedMg = {
          val withSender = if (participant.sender) mg.addSender(participant) else mg
          if (participant.receiver) withSender.addReceiver(participant) else withSender
        }
        mediaGroups.update(updatedMg)
      case None =>
        mediaGroups
    }
  }

  def updateMediaGroupParticipant(
      id:          String,
      participant: MediaGroupParticipant,
      mediaGroups: MediaGroups
  ): MediaGroups = {
    mediaGroups.find(id) match {
      case Some(mg) =>
        val updatedMg = mg.updateParticipant(participant)
        mediaGroups.update(updatedMg)
      case None =>
        mediaGroups
    }
  }

  def removeMediaGroupParticipants(
      id:          String,
      userIds:     Vector[String],
      mediaGroups: MediaGroups
  ): MediaGroups = {
    mediaGroups.find(id) match {
      case Some(mg) =>
        val updatedMg = mg.removeSenders(userIds).removeReceivers(userIds)
        mediaGroups.update(updatedMg)
      case None =>
        mediaGroups
    }
  }

  def removeMediaGroupParticipant(
      id:                String,
      participantUserId: String,
      mediaGroups:       MediaGroups
  ): MediaGroups = {
    mediaGroups.find(id) match {
      case Some(mg) =>
        val updatedMg = mg.removeParticipant(participantUserId)
        mediaGroups.update(updatedMg)
      case None =>
        mediaGroups
    }
  }

  def removeUserFromAllMediaGroups(
      userId:      String,
      mediaGroups: MediaGroups
  ): MediaGroups = {
    mediaGroups.findAllMediaGroups().foldLeft(mediaGroups) { (groups, mg) =>
      val updatedMg = mg.removeSender(userId).removeReceiver(userId)
      groups.update(updatedMg)
    }
  }

  def createPublicMediaGroups(mediaGroups: MediaGroups): MediaGroups = {
    val groups = Vector(
      (PublicMediaGroupIds.AUDIO, "audio"),
      (PublicMediaGroupIds.CAMERA, "camera"),
      (PublicMediaGroupIds.SCREENSHARE, "screenshare")
    )

    groups.foldLeft(mediaGroups) { (acc, t) =>
      val (groupId, mediaType) = t
      val mg = createMediaGroup(
        id = groupId,
        createdBy = "system",
        mediaType = mediaType,
        locked = false,
        record = false,
        senders = Vector(),
        receivers = Vector(),
        mediaGroups = acc
      )

      addMediaGroup(mg, acc)
    }
  }

  def enrollUserInPublicGroups(
      liveMeeting: LiveMeeting,
      userId:      String,
      mediaGroups: MediaGroups
  ): MediaGroups = {
    val participant = MediaGroupParticipant(
      userId,
      sender = true,
      receiver = true,
      active = true
    )

    val newMgState = PublicMediaGroupIds.All.foldLeft(mediaGroups) { (acc, groupId) =>
      mediaGroups.find(groupId) match {
        case Some(_) => addMediaGroupParticipant(groupId, participant, acc)
        case None    => acc
      }
    }

    PublicMediaGroupIds.All.foreach { groupId =>
      MediaGroupUserDAO.insertUser(
        liveMeeting.props.meetingProp.intId,
        groupId,
        userId,
        sender = true,
        receiver = true,
        active = true
      )
    }

    newMgState
  }

  def isUserOrphanedForMediaType(
      userId:      String,
      mediaType:   String,
      mediaGroups: MediaGroups
  ): Boolean = mediaGroups.findAllMediaGroupsForUser(userId).filter(_.mediaType == mediaType).isEmpty

  def isUserOnlyInPublicGroupForMediaType(
      userId:      String,
      mediaType:   String,
      mediaGroups: MediaGroups
  ): Boolean = {
    val groupsForType = mediaGroups.findAllMediaGroupsForUser(userId).filter(_.mediaType == mediaType)
    groupsForType.size == 1 && PublicMediaGroupIds.isPublicGroup(groupsForType.head.id)
  }

  def enforcePublicGroupsForUser(
      liveMeeting: LiveMeeting,
      userId:      String,
      mediaType:   String,
      mediaGroups: MediaGroups
  ): MediaGroups = {
    if (!isUserOrphanedForMediaType(userId, mediaType, mediaGroups)) {
      mediaGroups
    } else {
      val publicId = PublicMediaGroupIds.publicGroupIdForMediaType(mediaType)
      val participant = MediaGroupParticipant(userId, sender = true, receiver = true, active = true)
      mediaGroups.find(publicId) match {
        case Some(_) =>
          MediaGroupUserDAO.insertUser(
            liveMeeting.props.meetingProp.intId,
            publicId,
            userId,
            sender = true,
            receiver = true,
            active = true
          )
          addMediaGroupParticipant(publicId, participant, mediaGroups)
        case None =>
          mediaGroups
      }
    }
  }

  def enforcePublicOnlyUserState(
      liveMeeting: LiveMeeting,
      userId:      String,
      mediaType:   String,
      mediaGroups: MediaGroups
  ): MediaGroups = {
    if (!isUserOnlyInPublicGroupForMediaType(userId, mediaType, mediaGroups)) {
      mediaGroups
    } else {
      val publicId = PublicMediaGroupIds.publicGroupIdForMediaType(mediaType)
      val participant = MediaGroupParticipant(userId, sender = true, receiver = true, active = true)
      mediaGroups.find(publicId) match {
        case Some(mg) =>
          mg.findParticipant(userId) match {
            case Some(current) if current.sender && current.receiver && current.active =>
              mediaGroups
            case _ =>
              MediaGroupUserDAO.update(
                liveMeeting.props.meetingProp.intId,
                publicId,
                participant
              )
              updateMediaGroupParticipant(publicId, participant, mediaGroups)
          }
        case None =>
          mediaGroups
      }
    }
  }

  def enforcePublicGroupState(
      liveMeeting: LiveMeeting,
      outGW:       OutMsgRouter,
      userId:      String,
      mediaType:   String,
      mediaGroups: MediaGroups
  ): MediaGroups = {
    var state = enforcePublicGroupsForUser(liveMeeting, userId, mediaType, mediaGroups)
    state = enforcePublicOnlyUserState(liveMeeting, userId, mediaType, state)

    if (state != mediaGroups) {
      val publicId = PublicMediaGroupIds.publicGroupIdForMediaType(mediaType)
      handleMediaGroupUpdated(publicId, state, liveMeeting, outGW)
    }

    state
  }

  def handleMediaGroupUpdated(
      mgId:        String,
      mediaGroups: MediaGroups,
      liveMeeting: LiveMeeting,
      outGW:       OutMsgRouter
  ): Unit = {
    def broadcastEvent(mg: MediaGroup): Unit = {
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId,
        mg.createdBy
      )
      val envelope = BbbCoreEnvelope(MediaGroupUpdatedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(MediaGroupUpdatedEvtMsg.NAME, liveMeeting.props.meetingProp.intId, mg.createdBy)
      val body = MediaGroupUpdatedEvtMsgBody(mg.id, mg.createdBy, mg.mediaType, mg.locked, mg.record, mg.findAllSenders(), mg.findAllReceivers())
      val event = MediaGroupUpdatedEvtMsg(header, body)
      val respMsg = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(respMsg)
    }

    mediaGroups.find(mgId) match {
      case Some(mg) =>
        broadcastEvent(mg)
      case _ =>
    }
  }
}

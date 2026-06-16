package org.bigbluebutton.core.apps.mediagroups

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core.db.{ MediaGroupDAO, MediaGroupUserDAO }

// Reserved group IDs for the explicit public space per media type
object PublicMediaGroupIds {
  val AUDIO = "public:audio"
  val CAMERA = "public:camera"
  val SCREENSHARE = "public:screenshare"

  val All: Vector[String] = Vector(AUDIO, CAMERA, SCREENSHARE)

  def isPublicGroup(groupId: String): Boolean =
    groupId == AUDIO || groupId == CAMERA || groupId == SCREENSHARE

  def publicGroupIdForMediaType(mediaType: String): Option[String] = mediaType match {
    case "audio"       => Some(AUDIO)
    case "camera"      => Some(CAMERA)
    case "screenshare" => Some(SCREENSHARE)
    case _             => None
  }
}

object MediaGroupApp {
  // Public groups are explicit and system-managed on meeting/user join, but
  // post-join membership transitions are declarative: handlers apply exactly
  // the requested operations and callers own any public-group restoration.
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

    // Enroll the user in each public group they are not already in.
    // Public groups are created lazily (only once a scoped group
    // exists), so a missing group here means there is nothing to enroll into.
    PublicMediaGroupIds.All.foldLeft(mediaGroups) { (acc, groupId) =>
      acc.find(groupId) match {
        // Only enroll if not already in the group (e.g.: reconns, multiple sessions)
        case Some(mg) if !mg.isUserSending(userId) && !mg.isUserReceiving(userId) =>
          MediaGroupUserDAO.insertUser(
            liveMeeting.props.meetingProp.intId,
            groupId,
            userId,
            sender = true,
            receiver = true,
            active = true
          )
          addMediaGroupParticipant(groupId, participant, acc)
        case _ => acc
      }
    }
  }

  def publicGroupsExist(mediaGroups: MediaGroups): Boolean =
    PublicMediaGroupIds.All.exists(groupId => mediaGroups.find(groupId).isDefined)

  // Create three public group containers (model and DB ) and enrolls every
  // current user as sender+receiver.
  // Call this before creating the first scoped group in a meeting.
  def ensurePublicGroupsCreated(
      liveMeeting: LiveMeeting,
      mediaGroups: MediaGroups
  ): MediaGroups = {
    if (publicGroupsExist(mediaGroups)) {
      mediaGroups
    } else {
      val meetingId = liveMeeting.props.meetingProp.intId
      val withGroups = createPublicMediaGroups(mediaGroups)

      withGroups.findAllMediaGroups()
        .filter(mg => PublicMediaGroupIds.isPublicGroup(mg.id))
        .foreach(mg => MediaGroupDAO.insert(meetingId, mg))

      Users2x.findAll(liveMeeting.users2x).foldLeft(withGroups) { (acc, user) =>
        enrollUserInPublicGroups(liveMeeting, user.intId, acc)
      }
    }
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

  case class SetUserMediaGroupStateResult(
      mediaGroups:  MediaGroups,
      appliedState: Vector[MediaGroupEntry],
      errors:       Vector[MediaGroupEntryError]
  )

  def setUserMediaGroupState(
      userId:      String,
      entries:     Vector[MediaGroupEntry],
      scope:       String,
      mediaGroups: MediaGroups,
      liveMeeting: LiveMeeting,
      outGW:       OutMsgRouter
  ): SetUserMediaGroupStateResult = {
    val meetingId = liveMeeting.props.meetingProp.intId
    // Deduplicate entries: last entry per groupId wins
    val deduped = entries.groupBy(_.groupId).map(_._2.last).toVector
    // Validate entries: group must exist and mediaType must match
    val (valid, errors) = deduped.foldLeft((Vector.empty[MediaGroupEntry], Vector.empty[MediaGroupEntryError])) {
      case ((v, e), entry) =>
        mediaGroups.find(entry.groupId) match {
          case Some(mg) if mg.mediaType == entry.mediaType => (v :+ entry, e)
          case Some(_)                                     => (v, e :+ MediaGroupEntryError(entry.groupId, entry.mediaType, "mediaType mismatch"))
          case None                                        => (v, e :+ MediaGroupEntryError(entry.groupId, entry.mediaType, "group not found"))
        }
    }
    val desiredGroupMap = valid.map(e => e.groupId -> e).toMap
    // All groups the user is in
    val currentUserGroups = mediaGroups.findAllMediaGroupsForUser(userId)
    val currentGroupMap: Map[String, MediaGroupEntry] = currentUserGroups.flatMap { mg =>
      val isSender = mg.isUserSending(userId)
      val isReceiver = mg.isUserReceiving(userId)

      if (isSender || isReceiver) {
        val participant = mg.findParticipant(userId)
        val active = participant.map(_.active).getOrElse(true)
        Some(mg.id -> MediaGroupEntry(mg.id, mg.mediaType, isSender, isReceiver, active))
      } else None
    }.toMap

    // For replacement scopes ("all", "byMediaType"), validation errors would
    // cause errored groups to look omitted and be removed. Bail out entirely
    // so we don't partially apply the replacement.
    if (errors.nonEmpty && (scope == "all" || scope == "byMediaType")) {
      return SetUserMediaGroupStateResult(
        mediaGroups = mediaGroups,
        appliedState = currentGroupMap.values.toVector,
        errors = errors
      )
    }

    // Compute group delta based on the scope requested - see bbb-common-message's
    // definition of media group scope for details.
    val (toAdd, toUpdate, toRemove) = scope match {
      case "all" =>
        // all = replace the user's entire state
        val additions = desiredGroupMap.filter { case (gid, _) => !currentGroupMap.contains(gid) }
        val updates = desiredGroupMap.filter { case (gid, entry) =>
          currentGroupMap.get(gid).exists(cur =>
            cur.sender != entry.sender || cur.receiver != entry.receiver || cur.active != entry.active)
        }
        val removals = currentGroupMap.filter { case (gid, _) => !desiredGroupMap.contains(gid) }
        (additions, updates, removals)

      case "byMediaType" =>
        // byMediaType = only media types present in the entries are affected;
        // groups of other types are untouched
        val affectedMediaTypes = valid.map(_.mediaType).toSet
        val scopedCurrentMap = currentGroupMap.filter {
          case (_, entry) => affectedMediaTypes.contains(entry.mediaType)
        }
        val additions = desiredGroupMap.filter { case (gid, _) => !scopedCurrentMap.contains(gid) }
        val updates = desiredGroupMap.filter { case (gid, entry) =>
          scopedCurrentMap.get(gid).exists(cur =>
            cur.sender != entry.sender || cur.receiver != entry.receiver || cur.active != entry.active)
        }
        val removals = scopedCurrentMap.filter { case (gid, _) => !desiredGroupMap.contains(gid) }
        (additions, updates, removals)

      case _ => // "merge" is the canonical param, but also default
        // merge = merge changes into the user's state; entries with sender=false or receiver=false are removals
        val removals = desiredGroupMap.filter { case (_, e) => !e.sender && !e.receiver }
        val additions = desiredGroupMap.filter { case (gid, e) =>
          (e.sender || e.receiver) && !currentGroupMap.contains(gid)
        }
        val updates = desiredGroupMap.filter { case (gid, e) =>
          (e.sender || e.receiver) && currentGroupMap.get(gid).exists(cur =>
            cur.sender != e.sender || cur.receiver != e.receiver || cur.active != e.active)
        }
        (additions, updates, removals.filter { case (gid, _) => currentGroupMap.contains(gid) })
    }

    var affectedGroupIds = Set.empty[String]
    var updatedMediaGroups = mediaGroups

    toRemove.foreach { case (groupId, _) =>
      updatedMediaGroups = removeMediaGroupParticipant(groupId, userId, updatedMediaGroups)
      MediaGroupUserDAO.delete(meetingId, groupId, userId)
      affectedGroupIds += groupId
    }

    toAdd.foreach { case (groupId, entry) =>
      val participant = MediaGroupParticipant(userId, entry.sender, entry.receiver, entry.active)
      updatedMediaGroups = addMediaGroupParticipant(groupId, participant, updatedMediaGroups)
      MediaGroupUserDAO.insertUser(meetingId, groupId, userId, entry.sender, entry.receiver, entry.active)
      affectedGroupIds += groupId
    }

    toUpdate.foreach { case (groupId, entry) =>
      val participant = MediaGroupParticipant(userId, entry.sender, entry.receiver, entry.active)
      updatedMediaGroups = updateMediaGroupParticipant(groupId, participant, updatedMediaGroups)
      MediaGroupUserDAO.update(meetingId, groupId, participant)
      affectedGroupIds += groupId
    }

    // Public group enforcement: after removals, if the user has no
    // remaining groups for a media type, auto-re-enroll in the public group.
    // This applies to both absolute and relative modes to prevent orphaned
    // users from losing access to a media type.
    {
      val allMediaTypes = Set("audio", "camera", "screenshare")
      val userCurrentGroups = updatedMediaGroups.findAllMediaGroupsForUser(userId)

      allMediaTypes.foreach { mediaType =>
        val userStillInType = userCurrentGroups.exists(_.mediaType == mediaType)

        if (!userStillInType) {
          PublicMediaGroupIds.publicGroupIdForMediaType(mediaType).foreach { publicGroupId =>
            if (updatedMediaGroups.find(publicGroupId).isDefined) {
              val participant = MediaGroupParticipant(userId, sender = true, receiver = true, active = true)

              updatedMediaGroups = addMediaGroupParticipant(publicGroupId, participant, updatedMediaGroups)
              MediaGroupUserDAO.insertUser(meetingId, publicGroupId, userId, sender = true, receiver = true, active = true)
              affectedGroupIds += publicGroupId
            }
          }
        }
      }
    }

    affectedGroupIds.foreach { groupId =>
      handleMediaGroupUpdated(groupId, updatedMediaGroups, liveMeeting, outGW)
    }

    val appliedState = updatedMediaGroups.findAllMediaGroupsForUser(userId).flatMap { mg =>
      val isSender = mg.isUserSending(userId)
      val isReceiver = mg.isUserReceiving(userId)

      if (isSender || isReceiver) {
        val participant = mg.findParticipant(userId)
        val active = participant.map(_.active).getOrElse(true)
        Some(MediaGroupEntry(mg.id, mg.mediaType, isSender, isReceiver, active))
      } else None
    }

    SetUserMediaGroupStateResult(updatedMediaGroups, appliedState, errors)
  }
}

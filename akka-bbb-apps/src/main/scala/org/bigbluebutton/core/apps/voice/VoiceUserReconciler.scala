package org.bigbluebutton.core.apps.voice

import org.apache.pekko.actor.ActorContext
import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.msgs.{ LiveKitGrant, MediaActionOutcome }
import org.bigbluebutton.core.models.{ IntIdPrefixType, Users2x, VoiceUserState, VoiceUsers }
import org.bigbluebutton.core.running.{ HandlerHelpers, LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.MsgBuilder
import org.slf4j.LoggerFactory

import scala.collection.mutable

case class OrphanedVoiceUser(
    firstSeenOn:  Long,
    ejectKey:     String,
    confirmed:    Boolean = false,
    failures:     Int     = 0,
    awaitingAck:  Boolean = false,
    abandoned:    Boolean = false,
    lastActionOn: Long    = 0L
)

case class PendingRestore(
    firstSentOn:  Long,
    lastActionOn: Long,
    attempts:     Int  = 1
)

object VoiceUserReconciler {
  val MaxEnforcementFailures = 6

  val MaxRestoreAttempts = 6

  val MinActionIntervalMs = 5000L

  // Minimal LiveKit grant for transient participants that are orphaned from Users2x
  def downgradedGrant(room: String): LiveKitGrant =
    HandlerHelpers.buildLiveKitTokenGrant(room = room, canPublish = false, canSubscribe = false)

  // Default token grants for a user that has been re-admitted to the meeting.
  def defaultUserGrant(room: String): LiveKitGrant =
    HandlerHelpers.buildLiveKitTokenGrant(room = room, canPublish = true, canSubscribe = true)
}

/**
 * This is a VoiceUsers <-> Users2x state reconciling watchdog with two
 * basic roles:
 *  - Downgrading voice users LK grants that are orphaned from Users2x OR
 *    ejecting them from the voice bridge if it is not LK-based (mediasoup/FS)
 *  - Restoring LK grants for a user that has been re-admitted to the meeting
 *
 * For LK, state enforcement is a permission downgrade/upgrade rather than an eject:
 * a gentler approach to transient reconnects which still guarantees enforcement.
 * For FreeSWITCH-based bridges, we use ejections as we always have.
 *
 * bbb-webrtc-sfu is the other acting party here - it executes both ejections
 * and permission up/downgrades, and it reports the outcome of each.
 *
 * Dial-in users are exempt from this reconciliation - they follow a separate
 * admission path (call gateways with pins).
 */
class VoiceUserReconciler(meetingId: String) extends SystemConfiguration {
  private val log = LoggerFactory.getLogger(getClass)

  private val trackedOrphans = mutable.Map[String, OrphanedVoiceUser]()

  // Permission restore reqs are re-sent until acked by webrtc-sfu.
  private val pendingRestores = mutable.Map[String, PendingRestore]()

  private def enabled(liveMeeting: LiveMeeting): Boolean =
    ejectRogueVoiceUsers && !liveMeeting.props.meetingProp.isBreakout

  private def isReconcilable(intId: String): Boolean =
    !intId.startsWith(IntIdPrefixType.DIAL_IN)

  private def hasMeetingUser(liveMeeting: LiveMeeting, intId: String): Boolean =
    Users2x.findWithIntId(liveMeeting.users2x, intId).isDefined

  // A VoiceUser with no Users2x is considered orphan - except dial-in.
  def isOrphanedVoiceJoin(liveMeeting: LiveMeeting, intId: String): Boolean =
    enabled(liveMeeting) && isReconcilable(intId) && !hasMeetingUser(liveMeeting, intId)

  // intId is the LiveKit identity and the only persistent ID for it; voiceUserId is a
  // per-session sid whose alias the SFU drops on leave.
  private def ejectKey(liveMeeting: LiveMeeting, intId: String, voiceUserId: String): String =
    if (HandlerHelpers.isUsingLiveKitAudio(liveMeeting)) intId else voiceUserId

  /**
   * "Fences" a voice session that has no meeting user. The voice user is still created:
   * it keeps the session visible in BBB's own state, and it gives a later
   * re-admission something to restore. The permission downgrade is what makes it inert.
   */
  def fenceVoiceJoin(
      liveMeeting: LiveMeeting,
      outGW:       OutMsgRouter,
      intId:       String,
      voiceUserId: String
  )(implicit context: ActorContext): Unit = {
    if (!enabled(liveMeeting) || !isReconcilable(intId)) return

    log.warn(
      s"Admitting a voice user with no meeting user under downgraded grants. " +
        s"meetingId=$meetingId userId=$intId voiceUserId=$voiceUserId"
    )
    track(liveMeeting, outGW, intId, ejectKey(liveMeeting, intId, voiceUserId))
    enforce(liveMeeting, outGW, intId)
  }

  /**
   * "Fences" a user the akka lifecycle just dropped from User2x, while their
   * media session outlived them. Grants are pulled until reconciliation happens.
   */
  def fenceRemovedUser(
      liveMeeting: LiveMeeting,
      outGW:       OutMsgRouter,
      intId:       String
  )(implicit context: ActorContext): Unit = {
    if (!enabled(liveMeeting) || !isReconcilable(intId)) return

    VoiceUsers.findWithIntId(liveMeeting.voiceUsers, intId) foreach { vu =>
      log.warn(
        s"Downgrading LiveKit grants for a user removed from the meeting. " +
          s"meetingId=$meetingId userId=$intId"
      )
      track(liveMeeting, outGW, intId, ejectKey(liveMeeting, intId, vu.voiceUserId))
      enforce(liveMeeting, outGW, intId)
    }
  }

  def forget(intId: String): Unit = {
    trackedOrphans.remove(intId)
    pendingRestores.remove(intId)
  }

  def restorePermissions(liveMeeting: LiveMeeting, outGW: OutMsgRouter, intId: String): Unit = {
    forget(intId)

    if (!enabled(liveMeeting) || !isReconcilable(intId)) return
    if (!HandlerHelpers.isUsingLiveKitAudio(liveMeeting)) return

    val now = System.currentTimeMillis()
    pendingRestores.put(intId, PendingRestore(firstSentOn = now, lastActionOn = now))
    sendRestore(intId, outGW)
  }

  private def sendRestore(intId: String, outGW: OutMsgRouter): Unit =
    outGW.send(MsgBuilder.buildUpdateLiveKitParticipantPermissionsSysMsg(
      meetingId,
      intId,
      VoiceUserReconciler.defaultUserGrant(meetingId)
    ))

  /**
   * Records an orphan and gives up anything it should no longer hold. A new session
   * restarts the enforcement state but never firstSeenOn, which stays the moment the
   * user first went missing.
   */
  private def track(
      liveMeeting: LiveMeeting,
      outGW:       OutMsgRouter,
      intId:       String,
      key:         String
  )(implicit context: ActorContext): Unit = {
    val known = trackedOrphans.contains(intId)

    trackedOrphans.updateWith(intId) {
      case Some(tracking) =>
        Some(tracking.copy(
          ejectKey = key,
          confirmed = false,
          failures = 0,
          awaitingAck = false,
          abandoned = false,
          lastActionOn = 0L
        ))
      case None =>
        Some(OrphanedVoiceUser(firstSeenOn = System.currentTimeMillis(), ejectKey = key))
    }

    // A fenced user cannot publish audio anymore, so release its floor here.
    // The floor manager only does so on a real voice departure.
    if (!known) liveMeeting.audioFloorManager.handleUserLeftVoice(intId, liveMeeting = liveMeeting, outGW = outGW)
  }

  /**
   * Outcome of a LK permission update. The grant itself diffs the update direction:
   * - Restore permission asks for canPublish=true
   * - Enforce downgrade asks for canPublish=false
   */
  def onPermissionsOutcome(
      liveMeeting: LiveMeeting,
      intId:       String,
      grant:       LiveKitGrant,
      outcome:     String
  ): Unit = {
    if (!acceptsOutcomes(liveMeeting, intId)) return

    if (grant.canPublish) onRestoreOutcome(intId, outcome)
    else onEnforcementOutcome(intId, outcome, "Downgrading LiveKit grants")
  }

  private def acceptsOutcomes(liveMeeting: LiveMeeting, intId: String): Boolean =
    enabled(liveMeeting) && isReconcilable(intId) && HandlerHelpers.isUsingLiveKitAudio(liveMeeting)

  private def onRestoreOutcome(intId: String, outcome: String): Unit = outcome match {
    // Absent is as good as restored, i.e.: there is no session left carrying a downgrade
    // and it'll likely pick up a fresh token on rejoin (with default grants).
    case MediaActionOutcome.APPLIED | MediaActionOutcome.PARTICIPANT_ABSENT =>
      pendingRestores.remove(intId)
    case _ =>
      log.warn(
        s"Restoring LiveKit grants did not land; will retry. meetingId=$meetingId " +
          s"userId=$intId outcome=$outcome"
      )
  }

  /**
   * Outcome of an eject. Only the LiveKit bridge reports one.
   * FreeSWITCH signals a departure through the voice-conf leave handler.
   */
  def onEjectOutcome(liveMeeting: LiveMeeting, intId: String, outcome: String): Unit = {
    if (!acceptsOutcomes(liveMeeting, intId)) return

    onEnforcementOutcome(intId, outcome, "Ejecting a voice user with no meeting user")
  }

  private def onEnforcementOutcome(intId: String, outcome: String, action: String): Unit =
    outcome match {
      case MediaActionOutcome.APPLIED =>
        trackedOrphans.get(intId) foreach { t =>
          trackedOrphans.put(intId, t.copy(confirmed = true, awaitingAck = false, failures = 0))
        }
      case MediaActionOutcome.PARTICIPANT_ABSENT =>
        trackedOrphans.remove(intId)
      case _ =>
        trackedOrphans.get(intId) foreach { t =>
          trackedOrphans.put(intId, t.copy(awaitingAck = false, failures = t.failures + 1))
        }
        log.warn(
          s"$action did not land; will retry. meetingId=$meetingId userId=$intId outcome=$outcome"
        )
    }

  /**
   * Applies grant enforcement once, and charges the previous attempt if it was never
   * acked. Gives up at MaxEnforcementFailures rather than retrying forever. Log
   * it for auditing purposes as exhaustion should never happen.
   */
  private def enforce(liveMeeting: LiveMeeting, outGW: OutMsgRouter, intId: String): Unit = {
    val now = System.currentTimeMillis()

    trackedOrphans.get(intId) foreach { tracking =>
      if (now - tracking.lastActionOn >= VoiceUserReconciler.MinActionIntervalMs) {
        val failures = if (tracking.awaitingAck) tracking.failures + 1 else tracking.failures

        if (failures >= VoiceUserReconciler.MaxEnforcementFailures) {
          log.error(
            s"Abandoning enforcement against a voice user with no meeting user; it may still " +
              s"be publishing. meetingId=$meetingId userId=$intId failures=$failures"
          )
          trackedOrphans.put(intId, tracking.copy(
            failures = failures,
            awaitingAck = false,
            abandoned = true
          ))
        } else {
          if (HandlerHelpers.isUsingLiveKitAudio(liveMeeting)) {
            log.warn(
              s"Downgrading LiveKit grants for a voice user with no meeting user. " +
                s"meetingId=$meetingId userId=$intId failures=$failures"
            )
            outGW.send(MsgBuilder.buildUpdateLiveKitParticipantPermissionsSysMsg(
              meetingId,
              intId,
              VoiceUserReconciler.downgradedGrant(meetingId)
            ))
          } else {
            outGW.send(MsgBuilder.buildEjectUserFromVoiceConfSysMsg(
              meetingId,
              liveMeeting.props.voiceProp.voiceConf,
              tracking.ejectKey
            ))
          }

          trackedOrphans.put(intId, tracking.copy(
            failures = failures,
            awaitingAck = true,
            lastActionOn = now
          ))
        }
      }
    }
  }

  private def retryRestores(outGW: OutMsgRouter, now: Long): Unit = {
    pendingRestores.keys.toVector.foreach { intId =>
      pendingRestores.get(intId) foreach { pending =>
        if (pending.attempts >= VoiceUserReconciler.MaxRestoreAttempts) {
          log.error(
            s"Giving up on restoring LiveKit grants; the user may be left unable to publish. " +
              s"meetingId=$meetingId userId=$intId attempts=${pending.attempts}"
          )
          pendingRestores.remove(intId)
        } else if (now - pending.lastActionOn >= VoiceUserReconciler.MinActionIntervalMs) {
          sendRestore(intId, outGW)
          pendingRestores.put(intId, pending.copy(
            lastActionOn = now,
            attempts = pending.attempts + 1
          ))
        }
      }
    }
  }

  /**
   * Main VoiceUsers <-> Users2x reconciliation routine.
   * Used by akka-apps' audit in MeetingActor for periodic reconciliation.
   */
  def reconcile(liveMeeting: LiveMeeting, outGW: OutMsgRouter)(implicit context: ActorContext): Unit = {
    if (!enabled(liveMeeting)) return

    val now = System.currentTimeMillis()
    retryRestores(outGW, now)

    val meetingUserIds = Users2x.findAll(liveMeeting.users2x).map(_.intId).toSet
    val observedOrphans: Map[String, VoiceUserState] = VoiceUsers.findAll(liveMeeting.voiceUsers)
      .filter(vu => isReconcilable(vu.intId) && !meetingUserIds.contains(vu.intId))
      .map(vu => vu.intId -> vu)
      .toMap

    observedOrphans.foreach {
      case (intId, vu) =>
        trackedOrphans.get(intId) match {
          case None =>
            track(liveMeeting, outGW, intId, ejectKey(liveMeeting, intId, vu.voiceUserId))
          // Publishing again after a confirmed downgrade means something restored the
          // grants behind us, so the confirmation no longer holds.
          case Some(tracking) if tracking.confirmed && !vu.muted =>
            trackedOrphans.put(intId, tracking.copy(confirmed = false, failures = 0))
          case _ =>
        }
    }

    trackedOrphans.keys.toVector.foreach { intId =>
      val tracking = trackedOrphans.get(intId)
      // Abandoned entries are kept, not dropped: dropping one only means the next
      // scan re-tracks it with a fresh budget and the give-up never takes.
      if (!tracking.exists(t => t.confirmed || t.abandoned)) enforce(liveMeeting, outGW, intId)
    }
  }
}

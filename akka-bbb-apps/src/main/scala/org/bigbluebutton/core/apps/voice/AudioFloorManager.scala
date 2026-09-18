package org.bigbluebutton.core.apps.voice

import org.apache.pekko.actor.{ ActorContext, Cancellable }
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core.models.VoiceUsers
import org.bigbluebutton.SystemConfiguration
import scala.collection.mutable
import scala.concurrent.duration._
import scala.util.control.NonFatal
import org.slf4j.LoggerFactory

case class FloorState(
    currentHolder:      Option[String]    = None,
    lastFloorSwitch:    Long              = 0L,
    speakingStartTimes: Map[String, Long] = Map()
)

case class PendingFloor(
    userId:    String,
    startTime: Long
)

object AudioFloorManager {
  // Floor grants are scheduled to the meeting actor so they run on the actor
  // thread, serialized with the rest of the meeting's message handling.
  case object DispatchFloorGrantsInternalMsg
}

// All state is confined to the meeting actor: the public entry points run in
// message handlers and the dispatch timer only enqueues
// DispatchFloorGrantsInternalMsg back to the same actor.
class AudioFloorManager(meetingId: String) extends SystemConfiguration {
  private val log = LoggerFactory.getLogger(getClass)
  private var state = FloorState()
  private val pendingFloors = mutable.Queue[PendingFloor]()
  // Single grant dispatch timer that evaluates the queue head. Pending grants
  // carry no timers of their own: any queue or floor-state change re-runs
  // the dispatch, so a grant blocked by the cooldown (or by queue order) is
  // retried when possible.
  private var grantDispatchTask: Option[Cancellable] = None

  def handleUserTalking(
      userId:      String,
      talking:     Boolean,
      timestamp:   Long         = System.currentTimeMillis(),
      liveMeeting: LiveMeeting,
      outGW:       OutMsgRouter
  )(implicit context: ActorContext): Option[String] = {
    if (!floorEnabled || liveMeeting.props.meetingProp.audioBridge != "livekit") {
      return None
    }

    pruneStaleSpeakingState(timestamp, liveMeeting, outGW)

    if (talking) {
      handleStartTalking(userId, timestamp, liveMeeting, outGW)
    } else {
      handleStopTalking(userId, liveMeeting, outGW)
    }
  }

  // Catch all for missed stop-talking/left-voice events. Cleanup is important
  // as stale entries might accumulate and delay actual floor grants for that user
  // unnecessarily.
  private def pruneStaleSpeakingState(
      now:         Long,
      liveMeeting: LiveMeeting,
      outGW:       OutMsgRouter
  )(implicit context: ActorContext): Unit = {
    // 5 min - likely to be tweaked based on observation (prlanzarin)
    val ttl = 5 * 60 * 1000L
    val stale = state.speakingStartTimes.collect {
      case (userId, startedAt) if now - startedAt >= ttl => userId
    }.toSet

    if (stale.nonEmpty) {
      logFloorEvent("none", "stale_speaking_state_pruned", Map(
        "users" -> stale.mkString(",")
      ))
      state = state.copy(speakingStartTimes = state.speakingStartTimes -- stale)
      if (pendingFloors.exists(pending => stale.contains(pending.userId))) {
        pendingFloors.filterInPlace(pending => !stale.contains(pending.userId))
        dispatchPendingGrants(liveMeeting, outGW)
      }
    }
  }

  private def logFloorEvent(
      userId:  String,
      event:   String,
      logData: Map[String, Any]
  ): Unit = {
    log.debug(s"Floor control event=${event} meetingId=${meetingId} userId=${userId} currentHolder=${state.currentHolder} logData=${logData}")
  }

  // Evaluates the floor grant queue: drops stale entries, grants the floor to
  // the head once both its minimum-talking deadline and the grant cooldown
  // have elapsed, and otherwise re-schedule itself for the earliest instant a
  // grant can succeed.
  def dispatchPendingGrants(
      liveMeeting: LiveMeeting,
      outGW:       OutMsgRouter
  )(implicit context: ActorContext): Unit = {
    grantDispatchTask.foreach(_.cancel())
    grantDispatchTask = None

    while (pendingFloors.headOption.exists(pending => state.currentHolder.contains(pending.userId))) {
      pendingFloors.dequeue()
    }

    pendingFloors.headOption.foreach { head =>
      val now = System.currentTimeMillis()
      val readyAt = math.max(
        head.startTime + minTalkingDuration,
        state.lastFloorSwitch + floorSwitchCooldown
      )

      if (now >= readyAt) {
        try {
          grantFloor(head.userId, now, liveMeeting, outGW)
          pendingFloors.dequeue()
          dispatchPendingGrants(liveMeeting, outGW)
        } catch {
          // Capture so that the queue doesn't stall
          case NonFatal(e) =>
            log.error(s"Floor control grant dispatch failed meetingId=${meetingId}, re-scheduling", e)
            scheduleGrantDispatch(floorSwitchCooldown)
        }
      } else {
        scheduleGrantDispatch(readyAt - now)
      }
    }
  }

  private def scheduleGrantDispatch(delayMs: Long)(implicit context: ActorContext): Unit = {
    import context.dispatcher
    grantDispatchTask = Some(context.system.scheduler.scheduleOnce(
      delayMs.milliseconds,
      context.self,
      AudioFloorManager.DispatchFloorGrantsInternalMsg
    ))
  }

  private def grantFloor(
      userId:      String,
      timestamp:   Long,
      liveMeeting: LiveMeeting,
      outGW:       OutMsgRouter
  ): Option[String] = {
    if (timestamp - state.lastFloorSwitch >= floorSwitchCooldown) {
      val previousHolder = state.currentHolder

      if (previousHolder.contains(userId)) {
        return None
      }

      previousHolder.foreach(oldHolder => releaseFloor(oldHolder, timestamp, liveMeeting, outGW))

      state = state.copy(
        currentHolder = Some(userId),
        lastFloorSwitch = timestamp
      )

      logFloorEvent(userId, "floor_granted", Map(
        "previous_holder" -> previousHolder,
        "speaking_duration" -> state.speakingStartTimes.get(userId).map(timestamp - _),
        "queue_size" -> pendingFloors.size
      ))

      for {
        vu <- VoiceUsers.findWithIntId(liveMeeting.voiceUsers, userId)
      } yield {
        VoiceApp.becameFloor(
          liveMeeting,
          outGW,
          vu.voiceUserId,
          timestamp.toString
        )
      }

      Some(userId)
    } else None
  }

  private def releaseFloor(
      userId:      String,
      timestamp:   Long,
      liveMeeting: LiveMeeting,
      outGW:       OutMsgRouter
  ): Option[String] = {
    if (state.currentHolder.contains(userId)) {
      // A release does not schedule the switch cooldown - only grants do.
      // Otherwise a floor holder's departure would defer the grant of the next
      // speaker until after the cooldown unnecessarily.
      state = state.copy(
        currentHolder = None
      )

      logFloorEvent(userId, "floor_released", Map(
        "speaking_duration" -> state.speakingStartTimes.get(userId).map(timestamp - _)
      ))

      for {
        vu <- VoiceUsers.findWithIntId(liveMeeting.voiceUsers, userId)
      } yield {
        VoiceApp.releasedFloor(
          liveMeeting,
          outGW,
          vu.voiceUserId,
          timestamp.toString
        )
      }

      Some(userId)
    } else None
  }

  private def handleStartTalking(
      userId:      String,
      timestamp:   Long,
      liveMeeting: LiveMeeting,
      outGW:       OutMsgRouter
  )(implicit context: ActorContext): Option[String] = {
    if (!state.speakingStartTimes.contains(userId)) {
      state = state.copy(
        speakingStartTimes = state.speakingStartTimes + (userId -> timestamp)
      )
      pendingFloors.enqueue(PendingFloor(userId, timestamp))
      dispatchPendingGrants(liveMeeting, outGW)
    }

    None
  }

  private def handleStopTalking(
      userId:      String,
      liveMeeting: LiveMeeting,
      outGW:       OutMsgRouter
  )(implicit context: ActorContext): Option[String] = {
    pendingFloors.dequeueFirst(_.userId == userId)

    state = state.copy(
      speakingStartTimes = state.speakingStartTimes - userId
    )

    dispatchPendingGrants(liveMeeting, outGW)

    None
  }

  def handleUserLeftVoice(
      userId:      String,
      timestamp:   Long         = System.currentTimeMillis(),
      liveMeeting: LiveMeeting,
      outGW:       OutMsgRouter
  )(implicit context: ActorContext): Option[String] = {
    logFloorEvent(userId, "user_left", Map(
      "was_floor_holder" -> state.currentHolder.contains(userId),
      "had_pending_floor" -> pendingFloors.exists(_.userId == userId),
      "speaking_duration" -> state.speakingStartTimes.get(userId).map(timestamp - _)
    ))

    pendingFloors.dequeueFirst(_.userId == userId)

    state = state.copy(
      speakingStartTimes = state.speakingStartTimes - userId
    )

    val wasHolder = state.currentHolder.contains(userId)
    if (wasHolder) {
      releaseFloor(userId, timestamp, liveMeeting, outGW)
    }

    dispatchPendingGrants(liveMeeting, outGW)

    if (wasHolder) Some(userId) else None
  }

  def destroy(): Unit = {
    logFloorEvent("none", "floor_manager_destroyed", Map(
      "pending_grants" -> pendingFloors.size
    ))
    grantDispatchTask.foreach(_.cancel())
    grantDispatchTask = None
    pendingFloors.clear()
    state = FloorState()
  }
}

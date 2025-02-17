package org.bigbluebutton.core.apps.voice

import java.util.concurrent.{ ScheduledFuture, TimeUnit, ScheduledExecutorService, Executors }
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core.models.{ VoiceUsers, VoiceUserState }
import scala.concurrent.duration._
import org.bigbluebutton.SystemConfiguration
import scala.collection.mutable
import org.slf4j.LoggerFactory

case class FloorState(
    currentHolder:       Option[String]                     = None,
    lastFloorSwitch:     Long                               = 0L,
    speakingStartTimes:  Map[String, Long]                  = Map(),
    talkingStateChanges: Map[String, List[(Boolean, Long)]] = Map()
)

case class PendingFloor(
    userId:    String,
    startTime: Long,
    timer:     ScheduledFuture[_]
)

object AudioFloorManager extends SystemConfiguration {
  private val log = LoggerFactory.getLogger(getClass)
  private val stateLock = new Object()
  private var state = FloorState()
  private val scheduler: ScheduledExecutorService = Executors.newSingleThreadScheduledExecutor(r => {
    val t = new Thread(r, "audio-floor-manager")
    t.setDaemon(true)
    t
  })
  private val pendingFloors = mutable.Queue[PendingFloor]()

  def handleUserTalking(
      userId:      String,
      talking:     Boolean,
      timestamp:   Long         = System.currentTimeMillis(),
      liveMeeting: LiveMeeting,
      outGW:       OutMsgRouter
  ): Option[String] = {
    if (!floorEnabled || liveMeeting.props.meetingProp.audioBridge != "livekit") {
      return None
    }

    stateLock.synchronized {
      state = cleanupOldState(state, timestamp)

      if (talking) {
        handleStartTalking(userId, timestamp, liveMeeting, outGW)
      } else {
        handleStopTalking(userId, timestamp)
      }
    }
  }

  def getCurrentFloorHolder: Option[String] = stateLock.synchronized {
    state.currentHolder
  }

  def clearFloorState(): Unit = stateLock.synchronized {
    pendingFloors.foreach(_.timer.cancel(false))
    pendingFloors.clear()
    state = FloorState()
  }

  private def logFloorEvent(
      userId:  String,
      event:   String,
      logData: Map[String, Any]
  ): Unit = {
    log.debug(s"Floor control event=${event} userId=${userId} currentHolder=${state.currentHolder} logData=${logData}")
  }

  private def cleanupOldState(state: FloorState, now: Long): FloorState = {
    val ttl = 5 * 60 * 1000L

    state.copy(
      talkingStateChanges = state.talkingStateChanges.map {
        case (userId, changes) =>
          userId -> changes.filter(_._2 >= (now - ttl))
      }.filter(_._2.nonEmpty)
    )
  }

  private def scheduleFloorGrant(
      userId:      String,
      timestamp:   Long,
      liveMeeting: LiveMeeting,
      outGW:       OutMsgRouter
  ): Unit = {
    val future = scheduler.schedule(new Runnable {
      override def run(): Unit = {
        stateLock.synchronized {
          if (pendingFloors.nonEmpty && pendingFloors.head.userId == userId) {
            pendingFloors.dequeue()
            grantFloor(userId, timestamp + minTalkingDuration, liveMeeting, outGW)
          }
        }
      }
    }, minTalkingDuration, TimeUnit.MILLISECONDS)

    pendingFloors.enqueue(PendingFloor(userId, timestamp, future))

    logFloorEvent(userId, "floor_timer_scheduled", Map("queue_position" -> pendingFloors.size))
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
      state = state.copy(
        currentHolder = None,
        lastFloorSwitch = timestamp
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
  ): Option[String] = {
    logFloorEvent(userId, "handle_start_talking", Map(
      "pending_floors" -> pendingFloors.size
    ))

    if (!state.speakingStartTimes.contains(userId)) {
      state = state.copy(
        speakingStartTimes = state.speakingStartTimes + (userId -> timestamp)
      )
      scheduleFloorGrant(userId, timestamp, liveMeeting, outGW)
    }

    None
  }

  private def handleStopTalking(userId: String, timestamp: Long): Option[String] = {
    logFloorEvent(userId, "handle_stop_talking", Map(
      "speaking_duration" -> state.speakingStartTimes.get(userId).map(timestamp - _),
      "pending_floors" -> pendingFloors.size
    ))

    pendingFloors.find(_.userId == userId).foreach { pending =>
      pending.timer.cancel(false)
      pendingFloors.dequeueFirst(_.userId == userId)
    }

    state = state.copy(
      speakingStartTimes = state.speakingStartTimes - userId,
      talkingStateChanges = state.talkingStateChanges - userId
    )

    None
  }

  def handleUserLeftVoice(
      userId:      String,
      timestamp:   Long         = System.currentTimeMillis(),
      liveMeeting: LiveMeeting,
      outGW:       OutMsgRouter
  ): Option[String] = stateLock.synchronized {
    logFloorEvent(userId, "user_left", Map(
      "was_floor_holder" -> state.currentHolder.contains(userId),
      "had_pending_floor" -> pendingFloors.exists(_.userId == userId),
      "speaking_duration" -> state.speakingStartTimes.get(userId).map(timestamp - _)
    ))

    pendingFloors.find(_.userId == userId).foreach { pending =>
      pending.timer.cancel(false)
      pendingFloors.dequeueFirst(_.userId == userId)
    }

    state = state.copy(
      speakingStartTimes = state.speakingStartTimes - userId,
      talkingStateChanges = state.talkingStateChanges - userId
    )

    if (state.currentHolder.contains(userId)) {
      releaseFloor(userId, timestamp, liveMeeting, outGW)

      pendingFloors.headOption.foreach { next =>
        grantFloor(next.userId, timestamp, liveMeeting, outGW)
      }

      Some(userId)
    } else None
  }

  def destroy(): Unit = stateLock.synchronized {
    pendingFloors.foreach(_.timer.cancel(false))
    pendingFloors.clear()
    scheduler.shutdown()
    state = FloorState()
  }
}

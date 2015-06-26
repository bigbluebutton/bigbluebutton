package org.bigbluebutton.core

import akka.actor._
import akka.actor.ActorLogging
import akka.pattern.{ ask, pipe }
import akka.util.Timeout
import scala.concurrent.duration._
import scala.collection.mutable.HashMap
import org.bigbluebutton.core.api._
import org.bigbluebutton.core.util._
import org.bigbluebutton.core.api.ValidateAuthTokenTimedOut
import scala.util.Success
import scala.util.Failure
import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.core.recorders.VoiceEventRecorder
import org.bigbluebutton.core.recorders.events.VoiceUserJoinedRecordEvent
import org.bigbluebutton.core.recorders.events.VoiceUserLeftRecordEvent
import org.bigbluebutton.core.recorders.events.VoiceUserLockedRecordEvent
import org.bigbluebutton.core.recorders.events.VoiceUserMutedRecordEvent
import org.bigbluebutton.core.recorders.events.VoiceStartRecordingRecordEvent
import org.bigbluebutton.core.recorders.events.VoiceUserTalkingRecordEvent

object BigBlueButtonActor extends SystemConfiguration {
  def props(system: ActorSystem, outGW: MessageOutGateway, voiceEventRecorder: VoiceEventRecorder): Props =
    Props(classOf[BigBlueButtonActor], system, outGW, voiceEventRecorder)
}

class BigBlueButtonActor(val system: ActorSystem, outGW: MessageOutGateway, voiceEventRecorder: VoiceEventRecorder) extends Actor with ActorLogging {
  implicit def executionContext = system.dispatcher
  implicit val timeout = Timeout(5 seconds)

  private var meetings = new collection.immutable.HashMap[String, RunningMeeting]

  def receive = {
    case msg: CreateMeeting => handleCreateMeeting(msg)
    case msg: DestroyMeeting => handleDestroyMeeting(msg)
    case msg: KeepAliveMessage => handleKeepAliveMessage(msg)
    case msg: ValidateAuthToken => handleValidateAuthToken(msg)
    case msg: GetAllMeetingsRequest => handleGetAllMeetingsRequest(msg)
    case msg: UserJoinedVoiceConfMessage => handleUserJoinedVoiceConfMessage(msg)
    case msg: UserLeftVoiceConfMessage => handleUserLeftVoiceConfMessage(msg)
    case msg: UserLockedInVoiceConfMessage => handleUserLockedInVoiceConfMessage(msg)
    case msg: UserMutedInVoiceConfMessage => handleUserMutedInVoiceConfMessage(msg)
    case msg: UserTalkingInVoiceConfMessage => handleUserTalkingInVoiceConfMessage(msg)
    case msg: VoiceConfRecordingStartedMessage => handleVoiceConfRecordingStartedMessage(msg)
    case msg: DeskShareStartedRequest => handleDeskShareStartedRequest(msg)
    case msg: DeskShareStoppedRequest => handleDeskShareStoppedRequest(msg)
    //    case msg: DeskShareRecordingStartedRequest => handleDeskShareRecordingStartedRequest(msg)
    //    case msg: DeskShareRecordingStoppedRequest => handleDeskShareRecordingStoppedRequest(msg)
    case msg: InMessage => handleMeetingMessage(msg)
    case _ => // do nothing
  }

  private def findMeetingWithVoiceConfId(voiceConfId: String): Option[RunningMeeting] = {
    //    println("searching meeeting with voiceConfId=" + voiceConfId)
    //    meetings.values.find(m => {
    //      println("^^^^^^" + m.mProps.voiceBridge)
    //      m.mProps.voiceBridge == voiceConfId
    //    })
    meetings.values.find(m => m.mProps.voiceBridge == voiceConfId)
  }

  private def handleUserJoinedVoiceConfMessage(msg: UserJoinedVoiceConfMessage) {
    findMeetingWithVoiceConfId(msg.voiceConfId) foreach { m =>
      m.actorRef ! msg

      val recEvent = new VoiceUserJoinedRecordEvent(msg.userId, msg.voiceUserId, msg.voiceConfId,
        msg.callerIdNum, msg.callerIdName, msg.muted, msg.talking)
      voiceEventRecorder.recordConferenceEvent(recEvent, m.mProps.meetingID)
    }
  }

  private def handleUserLeftVoiceConfMessage(msg: UserLeftVoiceConfMessage) {
    findMeetingWithVoiceConfId(msg.voiceConfId) foreach { m =>
      m.actorRef ! msg
      val recEvent = new VoiceUserLeftRecordEvent(msg.voiceUserId, msg.voiceConfId)
      voiceEventRecorder.recordConferenceEvent(recEvent, m.mProps.meetingID)
    }
  }

  private def handleUserLockedInVoiceConfMessage(msg: UserLockedInVoiceConfMessage) {
    findMeetingWithVoiceConfId(msg.voiceConfId) foreach { m =>
      m.actorRef ! msg
      val recEvent = new VoiceUserLockedRecordEvent(msg.voiceUserId, msg.voiceConfId, msg.locked)
      voiceEventRecorder.recordConferenceEvent(recEvent, m.mProps.meetingID)
    }
  }

  private def handleUserMutedInVoiceConfMessage(msg: UserMutedInVoiceConfMessage) {
    findMeetingWithVoiceConfId(msg.voiceConfId) foreach { m =>
      m.actorRef ! msg
      val recEvent = new VoiceUserMutedRecordEvent(msg.voiceUserId, msg.voiceConfId, msg.muted)
      voiceEventRecorder.recordConferenceEvent(recEvent, m.mProps.meetingID)
    }
  }

  private def handleVoiceConfRecordingStartedMessage(msg: VoiceConfRecordingStartedMessage) {
    findMeetingWithVoiceConfId(msg.voiceConfId) foreach { m =>
      m.actorRef ! msg
      val recEvent = new VoiceStartRecordingRecordEvent(msg.voiceConfId, msg.recording)
      recEvent.setTimestamp(msg.timestamp)
      recEvent.setRecordingFilename(msg.recordStream)
      voiceEventRecorder.recordConferenceEvent(recEvent, m.mProps.meetingID)

      // find meeting with voiceconf id and send it to 
    }

  }

  private def handleUserTalkingInVoiceConfMessage(msg: UserTalkingInVoiceConfMessage) {
    findMeetingWithVoiceConfId(msg.voiceConfId) foreach { m =>
      m.actorRef ! msg
      val recEvent = new VoiceUserTalkingRecordEvent(msg.voiceUserId, msg.voiceConfId, msg.talking)
      voiceEventRecorder.recordConferenceEvent(recEvent, m.mProps.meetingID)
    }

  }

  private def handleValidateAuthToken(msg: ValidateAuthToken) {
    meetings.get(msg.meetingID) foreach { m =>
      val future = m.actorRef.ask(msg)(5 seconds)

      future onComplete {
        case Success(result) => {
          log.debug("Got response from meeting=" + msg.meetingID + "].")
          /**
           * Received a reply from MeetingActor which means hasn't hung!
           * Sometimes, the actor seems to hang and doesn't anymore accept messages. This is a simple
           * audit to check whether the actor is still alive. (ralam feb 25, 2015)
           */
        }
        case Failure(failure) => {
          log.warning("Failed to get response to from meeting=" + msg.meetingID + "]. Meeting has probably hung.")
          outGW.send(new ValidateAuthTokenTimedOut(msg.meetingID, msg.userId, msg.token, false, msg.correlationId))
        }
      }
    }
  }

  private def handleMeetingMessage(msg: InMessage): Unit = {
    msg match {
      case ucm: UserConnectedToGlobalAudio => {
        val m = meetings.values.find(m => m.mProps.voiceBridge == ucm.voiceConf)
        m foreach { mActor => mActor.actorRef ! ucm }
      }
      case udm: UserDisconnectedFromGlobalAudio => {
        val m = meetings.values.find(m => m.mProps.voiceBridge == udm.voiceConf)
        m foreach { mActor => mActor.actorRef ! udm }
      }
      case allOthers => {
        meetings.get(allOthers.meetingID) match {
          case None => handleMeetingNotFound(allOthers)
          case Some(m) => {
            // log.debug("Forwarding message [{}] to meeting [{}]", msg.meetingID)
            m.actorRef ! allOthers
          }
        }
      }
    }
  }

  private def handleMeetingNotFound(msg: InMessage) {
    msg match {
      case vat: ValidateAuthToken => {
        log.info("No meeting [" + vat.meetingID + "] for auth token [" + vat.token + "]")
        outGW.send(new ValidateAuthTokenReply(vat.meetingID, vat.userId, vat.token, false, vat.correlationId))
      }
      case _ => {
        log.info("No meeting [" + msg.meetingID + "] for message type [" + msg.getClass() + "]")
        // do nothing
      }
    }
  }

  private def handleKeepAliveMessage(msg: KeepAliveMessage): Unit = {
    outGW.send(new KeepAliveMessageReply(msg.aliveID))
  }

  private def handleDestroyMeeting(msg: DestroyMeeting) {
    log.info("BBBActor received DestroyMeeting message for meeting id [" + msg.meetingID + "]")
    meetings.get(msg.meetingID) match {
      case None => println("Could not find meeting id[" + msg.meetingID + "] to destroy.")
      case Some(m) => {
        meetings -= msg.meetingID
        log.info("Kick everyone out on meeting id[" + msg.meetingID + "].")
        outGW.send(new EndAndKickAll(msg.meetingID, m.mProps.recorded))
        outGW.send(new DisconnectAllUsers(msg.meetingID))
        log.info("Destroyed meeting id[" + msg.meetingID + "].")
        outGW.send(new MeetingDestroyed(msg.meetingID))

        // Stop the meeting actor.
        context.stop(m.actorRef)
      }
    }
  }

  private def handleCreateMeeting(msg: CreateMeeting): Unit = {
    meetings.get(msg.meetingID) match {
      case None => {
        log.info("New meeting create request [" + msg.mProps.meetingName + "]")
        var m = RunningMeeting(msg.mProps, outGW)

        meetings += m.mProps.meetingID -> m
        outGW.send(new MeetingCreated(m.mProps.meetingID, m.mProps.externalMeetingID, m.mProps.recorded, m.mProps.meetingName,
          m.mProps.voiceBridge, msg.mProps.duration, msg.mProps.moderatorPass,
          msg.mProps.viewerPass, msg.mProps.createTime, msg.mProps.createDate))

        m.actorRef ! new InitializeMeeting(m.mProps.meetingID, m.mProps.recorded)
        m.actorRef ! "StartTimer"
      }
      case Some(m) => {
        log.info("Meeting already created [" + msg.mProps.meetingName + "]")
        // do nothing
      }
    }
  }

  private def handleGetAllMeetingsRequest(msg: GetAllMeetingsRequest) {

    var len = meetings.keys.size
    println("meetings.size=" + meetings.size)
    println("len_=" + len)

    val set = meetings.keySet
    val arr: Array[String] = new Array[String](len)
    set.copyToArray(arr)
    val resultArray: Array[MeetingInfo] = new Array[MeetingInfo](len)

    for (i <- 0 until arr.length) {
      val id = arr(i)
      val duration = meetings.get(arr(i)).head.mProps.duration
      val name = meetings.get(arr(i)).head.mProps.meetingName
      val recorded = meetings.get(arr(i)).head.mProps.recorded
      val voiceBridge = meetings.get(arr(i)).head.mProps.voiceBridge

      var info = new MeetingInfo(id, name, recorded, voiceBridge, duration)
      resultArray(i) = info

      //remove later
      println("for a meeting:" + id)
      println("Meeting Name = " + meetings.get(id).head.mProps.meetingName)
      println("isRecorded = " + meetings.get(id).head.mProps.recorded)
      println("voiceBridge = " + voiceBridge)
      println("duration = " + duration)

      //send the users
      self ! (new GetUsers(id, "nodeJSapp"))

      //send the presentation
      self ! (new GetPresentationInfo(id, "nodeJSapp", "nodeJSapp"))

      //send chat history
      self ! (new GetChatHistoryRequest(id, "nodeJSapp", "nodeJSapp"))

      //send lock settings
      self ! (new GetLockSettings(id, "nodeJSapp"))
    }

    outGW.send(new GetAllMeetingsReply(resultArray))
  }

  private def handleDeskShareRecordingStartedRequest(msg: DeskShareRecordingStartedRequest) {
    //TODO
  }

  private def handleDeskShareRecordingStoppedRequest(msg: DeskShareRecordingStoppedRequest) {
    //TODO
  }

  private def handleDeskShareStartedRequest(msg: DeskShareStartedRequest) {
    val DESKSHARE_CONFERENCE_NAME_SUFFIX = "-DESKSHARE"
    // find in which meeting ....

    println("\n\n\n\nBBBActor: handleDeskShareStartedRequest\n\n\n\n")
    println(msg.conferenceName)
    println(msg.callerId)
    println(msg.callerIdName)

    if (msg.conferenceName.endsWith(DESKSHARE_CONFERENCE_NAME_SUFFIX)) {
      var originalConfId = msg.conferenceName.replace(DESKSHARE_CONFERENCE_NAME_SUFFIX, "")
      println("originalConfId=" + originalConfId)
      findMeetingWithVoiceConfId(originalConfId) foreach { m =>
        {
          println("FOREACH" + m.toString())
          m.actorRef ! msg
        }
      }
    } else {
      println("\n\n\nERROR in handleDeskShareStartedMessage in BBBActor \n\n\n")
    }

  }

  private def handleDeskShareStoppedRequest(msg: DeskShareStoppedRequest) {

    println("DeskShareStoppedRequest in BBBActor")
    val DESKSHARE_CONFERENCE_NAME_SUFFIX = "-DESKSHARE"
    // find in which meeting ....

    println("\n\n\n\nBBBActor: handleDeskShareStoppedRequest\n\n\n\n")
    println(msg.conferenceName)
    println(msg.callerId)
    println(msg.callerIdName)

    if (msg.conferenceName.endsWith(DESKSHARE_CONFERENCE_NAME_SUFFIX)) {
      var originalConfId = msg.conferenceName.replace(DESKSHARE_CONFERENCE_NAME_SUFFIX, "")
      println("originalConfId=" + originalConfId)
      findMeetingWithVoiceConfId(originalConfId) foreach { m =>
        {
          println("FOREACH" + m.toString())
          m.actorRef ! msg
        }
      }
    } else {
      println("\n\n\nERROR in handleDeskShareStoppedMessage in BBBActor \n\n\n")
    }
  }

}

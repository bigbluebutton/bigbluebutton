package org.bigbluebutton.service

import org.apache.pekko.actor.ActorRef
import org.apache.pekko.pattern.ask
import org.apache.pekko.stream.Materializer
import org.apache.pekko.util.Timeout
import org.bigbluebutton.core.api._
import org.bigbluebutton.core.running.RunningMeeting
import org.bigbluebutton.protos.{ MeetingInfo, MeetingInfoReq, MeetingInfoResp, MeetingRunningReq, MeetingRunningResp, MeetingService, MeetingsReq, MeetingsResp }

import scala.concurrent.Future
import scala.concurrent.duration.DurationInt

class MeetingServiceImpl(implicit materializer: Materializer, bbbActor: ActorRef) extends MeetingService {

  import materializer.executionContext
  override def isMeetingRunning(in: MeetingRunningReq): Future[MeetingRunningResp] = {
    implicit val timeout: Timeout = 3.seconds
    (bbbActor ? IsMeetingRunning(in.meetingId)).mapTo[Boolean].map(msg => MeetingRunningResp(msg))
  }

  override def getMeetingInfo(in: MeetingInfoReq): Future[MeetingInfoResp] = {
    implicit val timeout: Timeout = 3.seconds
    (bbbActor ? GetMeeting(in.meetingId)).mapTo[Option[RunningMeeting]].flatMap {
      case Some(runningMeeting) => (runningMeeting.actorRef ? GetMeetingInfo()).mapTo[MeetingInfo].map(msg => MeetingInfoResp(Some(msg)))
      case None                 => Future.successful(MeetingInfoResp(None))
    }
  }

  override def getMeetings(in: MeetingsReq): Future[MeetingsResp] = {
    implicit val timeout: Timeout = 3.seconds
    (bbbActor ? GetMeetings()).mapTo[Vector[RunningMeeting]].flatMap { runningMeetings =>
      val meetingInfoFutures = runningMeetings.map(m => (m.actorRef ? GetMeetingInfo()).mapTo[MeetingInfo])
      Future.sequence(meetingInfoFutures).map(meetings => MeetingsResp(meetings))
    }
  }
}

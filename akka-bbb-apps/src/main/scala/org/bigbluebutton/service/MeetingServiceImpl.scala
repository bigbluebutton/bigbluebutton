package org.bigbluebutton.service

import org.apache.pekko.actor.ActorRef
import org.apache.pekko.pattern.ask
import org.apache.pekko.stream.Materializer
import org.apache.pekko.util.Timeout
import org.bigbluebutton.core.api.IsMeetingRunning
import org.bigbluebutton.protos.{ MeetingInfoReq, MeetingInfoResp, MeetingRunningReq, MeetingRunningResp, MeetingService, MeetingsReq, MeetingsResp }

import scala.concurrent.Future
import scala.concurrent.duration.DurationInt

class MeetingServiceImpl(implicit materializer: Materializer, bbbActor: ActorRef) extends MeetingService {

  import materializer.executionContext
  override def isMeetingRunning(in: MeetingRunningReq): Future[MeetingRunningResp] = {
    implicit val timeout: Timeout = 3.seconds
    (bbbActor ? IsMeetingRunning(in.meetingId)).mapTo[Boolean].map(msg => MeetingRunningResp(msg))
  }

  override def getMeetingInfo(in: MeetingInfoReq): Future[MeetingInfoResp] = ???

  override def getMeetings(in: MeetingsReq): Future[MeetingsResp] = ???
}

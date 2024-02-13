package org.bigbluebutton.service

import com.google.rpc.Code
import org.apache.pekko.NotUsed
import org.apache.pekko.actor.ActorRef
import org.apache.pekko.grpc.GrpcServiceException
import org.apache.pekko.pattern.ask
import org.apache.pekko.stream.Materializer
import org.apache.pekko.stream.scaladsl.Source
import org.apache.pekko.util.Timeout
import org.bigbluebutton.core.api._
import org.bigbluebutton.core.running.RunningMeeting
import org.bigbluebutton.protos._

import scala.collection.immutable.VectorMap
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
      case None                 => Future.failed(GrpcServiceException(Code.NOT_FOUND, "notFound", Seq(new ErrorResp("notFound", "A meeting with that ID does not exist"))))
    }
  }

  override def listMeetings(in: ListMeetingsReq): Future[ListMeetingsResp] = {
    implicit val timeout: Timeout = 3.seconds

    def getPageStartingFromToken(meetings: VectorMap[String, RunningMeeting], token: String, size: Int): Either[GrpcServiceException, VectorMap[String, RunningMeeting]] = {
      meetings.keys.indexOf(token) match {
        case -1    => Left(GrpcServiceException(Code.INVALID_ARGUMENT, "invalidPageToken", Seq(new ErrorResp("invalidPageToken", "The provided page token is not valid"))))
        case index => Right(meetings.slice(index, index + size))
      }
    }

    def constructListMeetingsResponse(meetings: VectorMap[String, RunningMeeting], nextPageToken: Option[String]): Future[ListMeetingsResp] = {
      val meetingInfoFutures = meetings.map { case (_, runningMeeting) =>
        (runningMeeting.actorRef ? GetMeetingInfo()).mapTo[MeetingInfo]
      }
      Future.sequence(meetingInfoFutures.toVector).map(meetings => ListMeetingsResp(meetings, nextPageToken.getOrElse("")))
    }

    if (in.pageSize < 0) Future.failed(GrpcServiceException(Code.INVALID_ARGUMENT, "invalidPageSize", Seq(new ErrorResp("invalidPageSize", "The page size cannot be negative"))))
    else {
      val pageSize = if (in.pageSize == 0) 50 else math.min(in.pageSize, 50)
      (bbbActor ? GetMeetings()).mapTo[VectorMap[String, RunningMeeting]].flatMap { runningMeetings =>
        val nextPageIndex = if (Option(in.pageToken).forall(_.isBlank)) pageSize else runningMeetings.keys.indexOf(in.pageToken) + pageSize
        val meetingsToReturn = if (Option(in.pageToken).forall(_.isBlank)) runningMeetings.take(pageSize) else getPageStartingFromToken(runningMeetings, in.pageToken, pageSize)
        meetingsToReturn match {
          case Left(error: GrpcServiceException) => Future.failed(error)
          case Right(meetings: VectorMap[String, RunningMeeting]) =>
            val nextPageToken = meetings.drop(nextPageIndex).headOption.map(_._1)
            constructListMeetingsResponse(meetings, nextPageToken)
        }
      }
    }
  }

  override def getMeetingsStream(in: GetMeetingsStreamReq): Source[MeetingInfoResp, NotUsed] = {
    implicit val timeout: Timeout = 3.seconds

    val runningMeetingFutures: Future[VectorMap[String, RunningMeeting]] = (bbbActor ? GetMeetings()).mapTo[VectorMap[String, RunningMeeting]]

    Source.future(runningMeetingFutures).flatMapConcat { runningMeetings: VectorMap[String, RunningMeeting] =>
      val meetingsToReturn = if (Option(in.meetingId).forall(_.isBlank)) runningMeetings else {
        val startIndex = runningMeetings.keys.indexOf(in.meetingId)
        startIndex match {
          case -1    => VectorMap.empty
          case index => runningMeetings.slice(index, runningMeetings.size)
        }
      }

      if (meetingsToReturn.isEmpty) Source.failed(GrpcServiceException(Code.INVALID_ARGUMENT, "invalidMeetingID", Seq(new ErrorResp("invalidMeetingID", "No meeting with the provided meetingID exists"))))
      else {
        Source(meetingsToReturn.toList).mapAsync(parallelism = 4) { case (_, runningMeeting) =>
          (runningMeeting.actorRef ? GetMeetingInfo()).mapTo[MeetingInfo].map(meetingInfo => MeetingInfoResp(Option(meetingInfo))).recover {
            case ex: Throwable   => MeetingInfoResp(None)
          }
        }
      }
    }.recoverWith {
      case ex: Throwable => Source.single(MeetingInfoResp(None))
    }
  }
}

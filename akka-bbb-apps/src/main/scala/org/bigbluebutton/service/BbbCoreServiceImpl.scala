package org.bigbluebutton.service

import com.google.rpc.Code
import org.apache.pekko.NotUsed
import org.apache.pekko.actor.ActorRef
import org.apache.pekko.grpc.GrpcServiceException
import org.apache.pekko.pattern.ask
import org.apache.pekko.stream.Materializer
import org.apache.pekko.stream.scaladsl.Source
import org.apache.pekko.util.Timeout
import org.bigbluebutton.core.api.{ GetMeeting, GetMeetingInfo, GetMeetings, IsMeetingRunning }
import org.bigbluebutton.core.running.RunningMeeting
import org.bigbluebutton.protos._

import scala.collection.immutable.VectorMap
import scala.concurrent.Future
import scala.concurrent.duration.DurationInt

class BbbCoreServiceImpl(implicit materializer: Materializer, bbbActor: ActorRef) extends BbbCoreService {

  import materializer.executionContext

  override def isMeetingRunning(in: MeetingRunningRequest): Future[MeetingRunningResponse] = {
    implicit val timeout: Timeout = 3.seconds

    // Ask the BigBlueButton actor if a meeting with the given ID is currently running.
    (bbbActor ? IsMeetingRunning(in.meetingId)).mapTo[Boolean].map(msg => MeetingRunningResponse(msg))
  }

  override def getMeetingInfo(in: MeetingInfoRequest): Future[MeetingInfoResponse] = {
    implicit val timeout: Timeout = 3.seconds

    // Ask the BigBlueButton actor to try to retrieve a RunningMeeting with the given ID.
    (bbbActor ? GetMeeting(in.meetingId)).mapTo[Option[RunningMeeting]].flatMap {
      // If there is a meeting running with the given ID then ask its MeetingActor for the meeting's information.
      // Map the MeetingInfo to a MeetingInfoResponse.
      case Some(runningMeeting) => (runningMeeting.actorRef ? GetMeetingInfo()).mapTo[MeetingInfo].map(msg => MeetingInfoResponse(Some(msg)))

      // If no meeting with the provided ID is running then return an error
      case None                 => Future.failed(GrpcServiceException(Code.NOT_FOUND, "notFound", Seq(new ErrorResponse("notFound", "A meeting with that ID does not exist"))))
    }
  }

  override def listMeetings(in: ListMeetingsRequest): Future[ListMeetingsResponse] = ???

  override def getMeetingsStream(in: GetMeetingsStreamRequest): Source[MeetingInfoResponse, NotUsed] = {
    implicit val timeout: Timeout = 3.seconds

    // Ask the BigBlueButton actor for the collection of RunningMeetings.
    val runningMeetingsFuture: Future[VectorMap[String, RunningMeeting]] = (bbbActor ? GetMeetings()).mapTo[VectorMap[String, RunningMeeting]]

    // Create a source using the returned collection of RunningMeetings.
    Source.future(runningMeetingsFuture).flatMapConcat { runningMeetings: VectorMap[String, RunningMeeting] =>
      // Consumers of this API can pass an optional meetingId argument indicating that the stream should begin from the corresponding RunningMeeting.
      // Check if this argument has been provided. If not then use the entire collection of RunningMeetings.
      val meetingsToReturn = if (Option(in.meetingId).forall(_.isBlank)) runningMeetings else {
        // A meetingId argument has been given. Lookup the index of the corresponding RunningMeeting.
        val startIndex = runningMeetings.keys.indexOf(in.meetingId)
        startIndex match {
          // No RunningMeeting exists with the provided meetingId so return an empty map.
          case -1    => VectorMap.empty

          // A RunningMeeting exists with the given meetingId.
          // Slice the RunningMeetings starting from that RunningMeeting's index to the end of the original RunningMeetings collection.
          case index => runningMeetings.slice(index, runningMeetings.size)
        }
      }

      // If there are no RunningMeetings, either because none are running or an invalid meetingId was provided, then return an error.
      if (meetingsToReturn.isEmpty) Source.failed(GrpcServiceException(Code.NOT_FOUND, "notFound", Seq(new ErrorResponse("notFound", "No meetings were found"))))
      else {
        // Create a source using the final collection of RunningMeetings that should be returned.
        // Attempt to map every element of the stream, i.e. each RunningMeeting, to a MeetingInfoResponse.
        // Each mapping is done asynchronously but the order of the emitted elements is maintained based on the order of the collection of RunningMeetings.
        Source(meetingsToReturn.toList).mapAsync(parallelism = 4) { case (_, runningMeeting) =>
          // Ask the RunningMeeting's MeetingActor for the meeting's information.
          // Map the MeetingInfo to a MeetingInfoResponse.
          (runningMeeting.actorRef ? GetMeetingInfo()).mapTo[MeetingInfo].map(meetingInfo => MeetingInfoResponse(Option(meetingInfo))).recover {
            // If an error occurs during the mapping of one of the RunningMeetings then recover the stream with an empty MeetingInfoResponse.
            case ex: Throwable   => MeetingInfoResponse(None)
          }
        }
      }
    }.recoverWith {
      // If an error occurs with the stream itself then recover by emitting a single empty MeetingInfoResponse.
      case ex: Throwable => Source.single(MeetingInfoResponse(None))
    }
  }
}

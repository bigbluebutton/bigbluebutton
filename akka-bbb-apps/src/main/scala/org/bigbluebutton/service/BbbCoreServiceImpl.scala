package org.bigbluebutton.service

import com.google.rpc.Code
import org.apache.pekko.NotUsed
import org.apache.pekko.actor.ActorRef
import org.apache.pekko.grpc.GrpcServiceException
import org.apache.pekko.pattern.ask
import org.apache.pekko.stream.Materializer
import org.apache.pekko.stream.scaladsl.Source
import org.apache.pekko.util.Timeout
import org.bigbluebutton.core.api.{ GetMeeting, GetMeetingInfo, GetMeetings, IsMeetingRunning, IsVoiceBridgeInUse }
import org.bigbluebutton.core.running.RunningMeeting
import org.bigbluebutton.protos._

import scala.collection.immutable.VectorMap
import scala.concurrent.Future
import scala.concurrent.duration.DurationInt
import org.bigbluebutton.core.api.GetNextVoiceBridge
import org.bigbluebutton.common2.domain.MeetingProp
import org.bigbluebutton.common2.domain.DefaultProps
import org.bigbluebutton.common2.domain.DurationProps
import org.bigbluebutton.common2.domain.PasswordProp
import org.bigbluebutton.common2.domain.RecordProp
import org.bigbluebutton.common2.domain.BreakoutProps
import org.bigbluebutton.common2.domain.WelcomeProp
import org.bigbluebutton.common2.domain.VoiceProp
import org.bigbluebutton.common2.domain.UsersProp
import org.bigbluebutton.common2.domain.MetadataProp
import org.bigbluebutton.common2.domain.LockSettingsProps
import org.bigbluebutton.common2.domain.SystemProps
import org.bigbluebutton.common2.domain.GroupProps
import org.bigbluebutton.core.api.CreateMeeting
import org.bigbluebutton.core.api.HasUserJoined

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
      case None                 => Future.failed(GrpcServiceException(Code.NOT_FOUND, "notFound", Seq(new ErrorResponse("notFound", "A meeting with that ID does not exist."))))
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
      if (meetingsToReturn.isEmpty) Source.failed(GrpcServiceException(Code.NOT_FOUND, "notFound", Seq(new ErrorResponse("notFound", "No meetings were found."))))
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

  override def createMeeting(in: CreateMeetingRequest): Future[CreateMeetingResponse] = {
    implicit val timeout: Timeout = 3.seconds

    def settingsToProps(settings: CreateMeetingSettings, voiceBridge: String): DefaultProps = {
      val meetingSettings = settings.meetingSettings.get
      val meetingProp = MeetingProp(
        name = meetingSettings.name,
        extId = meetingSettings.meetingExtId,
        intId = meetingSettings.meetingIntId,
        meetingCameraCap = meetingSettings.meetingCameraCap,
        maxPinnedCameras = meetingSettings.maxPinnedCameras,
        isBreakout = meetingSettings.isBreakout,
        disabledFeatures = meetingSettings.disabledFeatures.toVector,
        notifyRecordingIsOn = meetingSettings.notifyRecordingIsOn,
        presentationUploadExternalDescription = meetingSettings.presUploadExtDesc,
        presentationUploadExternalUrl = meetingSettings.presUploadExtUrl
      )

      val durationSettings = settings.durationSettings.get
      val durationProps = DurationProps(
        duration = durationSettings.duration,
        createdTime = durationSettings.createTime,
        createdDate = durationSettings.createDate,
        meetingExpireIfNoUserJoinedInMinutes = durationSettings.meetingExpNoUserJoinedInMin,
        meetingExpireWhenLastUserLeftInMinutes = durationSettings.meetingExpLastUserLeftInMin,
        userInactivityInspectTimerInMinutes = durationSettings.userInactivityInspectTimeInMin,
        userInactivityThresholdInMinutes = durationSettings.userInactivityThresholdInMin,
        userActivitySignResponseDelayInMinutes = durationSettings.userActivitySignResponseDelayInMin,
        endWhenNoModerator = durationSettings.endWhenNoMod,
        endWhenNoModeratorDelayInMinutes = durationSettings.endWhenNoModDelayInMin
      )

      val passwordSettings = settings.passwordSettings.get
      val passwordProp = PasswordProp(
        moderatorPass = passwordSettings.moderatorPw,
        viewerPass = passwordSettings.attendeePw,
        learningDashboardAccessToken = passwordSettings.learningDashboardAccessToken
      )

      val recordSettings = settings.recordSettings.get
      val recordProp = RecordProp(
        record = recordSettings.record,
        autoStartRecording = recordSettings.autoStartRecording,
        allowStartStopRecording = recordSettings.allowStartStopRecording,
        recordFullDurationMedia = recordSettings.recordFullDurationMedia,
        keepEvents = recordSettings.keepEvents
      )

      val breakoutSettings = settings.breakoutSettings.get
      val breakoutProps = BreakoutProps(
        parentId = breakoutSettings.parentMeetingId,
        sequence = breakoutSettings.sequence,
        freeJoin = breakoutSettings.freeJoin,
        breakoutRooms = breakoutSettings.breakoutRooms.toVector,
        record = breakoutSettings.record,
        privateChatEnabled = breakoutSettings.privateChatEnabled,
        captureNotes = breakoutSettings.captureNotes,
        captureSlides = breakoutSettings.captureSlides,
        captureNotesFilename = breakoutSettings.captureNotesFileName,
        captureSlidesFilename = breakoutSettings.captureSlidesFileName
      )

      val welcomeSettings = settings.welcomeSettings.get
      val welcomeProp = WelcomeProp(
        welcomeMsgTemplate = welcomeSettings.welcomeMsgTemplate,
        welcomeMsg = welcomeSettings.welcomeMsg,
        modOnlyMessage = welcomeSettings.modOnlyMsg
      )

      val voiceSettings = settings.voiceSettings.get
      val voiceProp = VoiceProp(
        telVoice = voiceBridge,
        voiceConf = voiceBridge,
        dialNumber = voiceSettings.dialNumber,
        muteOnStart = voiceSettings.muteOnStart
      )

      val userSettings = settings.userSettings.get
      val usersProp = UsersProp(
        maxUsers = userSettings.maxUsers,
        maxUserConcurrentAccesses = userSettings.maxUserConcurrentAccesses,
        webcamsOnlyForModerator = userSettings.webcamsOnlyForMod,
        userCameraCap = userSettings.userCameraCap,
        guestPolicy = userSettings.guestPolicy,
        meetingLayout = userSettings.meetingLayout,
        allowModsToUnmuteUsers = userSettings.allowModsUnmuteUsers,
        allowModsToEjectCameras = userSettings.allowModsEjectCameras,
        authenticatedGuest = userSettings.authenticatedGuest,
        allowPromoteGuestToModerator = userSettings.allowPromoteGuest
      )

      val metadataSettings = settings.metadataSettings.get
      val metadataProp = MetadataProp(
        metadata = metadataSettings.metadata
      )

      val lockSettings = settings.lockSettings.get
      val lockSettingsProps = LockSettingsProps(
        disableCam = lockSettings.disableCam,
        disableMic = lockSettings.disableMic,
        disablePrivateChat = lockSettings.disablePrivateChat,
        disablePublicChat = lockSettings.disablePublicChat,
        disableNotes = lockSettings.disableNotes,
        hideUserList = lockSettings.hideUserList,
        lockOnJoin = lockSettings.lockOnJoin,
        lockOnJoinConfigurable = lockSettings.lockOnJoinConfigurable,
        hideViewersCursor = lockSettings.hideViewersCursor,
        hideViewersAnnotation = lockSettings.hideViewersAnnotation
      )

      val systemSettings = settings.systemSettings.get
      val systemProps = SystemProps(
        loginUrl = systemSettings.loginUrl,
        logoutUrl = systemSettings.logoutUrl,
        customLogoURL = systemSettings.customLogoUrl,
        bannerText = systemSettings.bannerText,
        bannerColor = systemSettings.bannerColour
      )

      val groups = settings.groupSettings.map(g => GroupProps(
        groupId = g.groupId,
        name = g.name,
        usersExtId = g.usersExtIds.toVector
      )).toVector

      DefaultProps(
        meetingProp = meetingProp,
        breakoutProps = breakoutProps,
        durationProps = durationProps,
        password = passwordProp,
        recordProp = recordProp,
        welcomeProp = welcomeProp,
        voiceProp = voiceProp,
        usersProp = usersProp,
        metadataProp = metadataProp,
        lockSettingsProps = lockSettingsProps,
        systemProps = systemProps,
        groups = groups,
        overrideClientSettings = settings.overrideClientSettings
      )
    }

    def createMeeting(settings: CreateMeetingSettings, voiceBridge: String): Future[CreateMeetingResponse] = {
      val defaultProps = settingsToProps(settings, voiceBridge)
      (bbbActor ? CreateMeeting(defaultProps)).mapTo[(RunningMeeting, Boolean, Boolean)].flatMap {
          case (meeting, isDuplicate, isValid) => {
            (meeting.actorRef ? HasUserJoined()).mapTo[Boolean].map(hasUserJoined => {
              CreateMeetingResponse(
                meetingExtId = meeting.props.meetingProp.extId,
                meetingIntId = meeting.props.meetingProp.intId,
                parentMeetingId = meeting.props.breakoutProps.parentId,
                attendeePw = meeting.props.password.viewerPass,
                moderatorPw = meeting.props.password.moderatorPass,
                createTime = meeting.props.durationProps.createdTime,
                voiceBridge = meeting.props.voiceProp.voiceConf,
                dialNumber = meeting.props.voiceProp.dialNumber,
                createDate = meeting.props.durationProps.createdDate,
                hasUserJoined = hasUserJoined,
                duration = meeting.props.durationProps.duration,
                hasBeenForciblyEnded = false,
                isDuplicate = isDuplicate,
                isValid = isValid
              )
            })
          }
          case _ => Future.failed(GrpcServiceException(
            Code.INTERNAL, 
            "createError", 
            Seq(new ErrorResponse("createError", "An unknown error occurred while attempting to create meeting."))
          ))
        }
    }

    in.createMeetingSettings match {
      case Some(settings) =>
        settings.voiceSettings.get.voiceBridge match {
          case "" => {
            val voiceBridgeLength = settings.voiceSettings.get.voiceBridgeLength
            if (voiceBridgeLength < 1) {
              Future.failed(GrpcServiceException(Code.INVALID_ARGUMENT, "invalidVoiceBridgeLength", Seq(new ErrorResponse("invalidVoiceBridgeLength", "Provided voice bridge length must be greater than 1."))))
            }
            (bbbActor ? GetNextVoiceBridge(voiceBridgeLength)).mapTo[Option[String]].flatMap {
              case Some(v) => createMeeting(settings, v)
              case None => Future.failed(GrpcServiceException(
                Code.RESOURCE_EXHAUSTED, 
                "voiceBridgeError", 
                Seq(new ErrorResponse("voiceBridgeError", "A voice bridge could not be generated. There are either no more voice bridges available or no more that meet your length criteria."))
              )) 
            }
          }
          case vb: String => 
            (bbbActor ? IsVoiceBridgeInUse(vb)).mapTo[Boolean].flatMap(inUse => {
              if (inUse) {
                Future.failed(GrpcServiceException(Code.ALREADY_EXISTS, "nonUniqueVoiceBridge", Seq(new ErrorResponse("nonUniqueVoiceBridge", "The selected voice bridge is already in use."))))
              } else {
                createMeeting(settings, settings.voiceSettings.get.voiceBridge)
              }
            })
        }
      case None => Future.failed(GrpcServiceException(Code.INVALID_ARGUMENT, "missingSettings", Seq(new ErrorResponse("missingSettings", "No meeting settings were provided."))))
    }
  }

  override def isVoiceBridgeInUse(in: VoiceBridgeInUseRequest): Future[VoiceBridgeInUseResponse] = {
    implicit val timeout: Timeout = 3.seconds

    (bbbActor ? IsVoiceBridgeInUse(in.voiceBridge)).mapTo[Boolean].map(msg => VoiceBridgeInUseResponse(msg))
  }
}

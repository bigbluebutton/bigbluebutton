package org.bigbluebutton.core.apps

import org.bigbluebutton.core.api._
import org.bigbluebutton.core.LiveMeeting
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.common.messages.{ Constants => MessagesConstants }

trait VideoApp {
  this: LiveMeeting =>

  val outGW: OutMessageGateway

  def handleTranscoding() {
    /*
    if (meetingModel.isSipPhonePresent() && meetingModel.isSipVideoEnabled()) {
      startTranscoder(meetingModel.talkerUserId())
    } else {
      stopAllTranscoders()
    }
*/
  }

  private def startTranscoder(userId: String) {
    /*
    usersModel.getUser(userId) foreach { user =>
      if (!user.phoneUser) {

        //User's RTP transcoder
        val params = new scala.collection.mutable.HashMap[String, String]

        if (user.hasStream) {
          params += MessagesConstants.TRANSCODER_TYPE -> MessagesConstants.TRANSCODE_RTMP_TO_RTP
          params += MessagesConstants.INPUT -> usersModel.getUserMainWebcamStream(user.userID)
        } else {
          //if user has no video , send videoconf logo to FS
          params += MessagesConstants.TRANSCODER_TYPE -> MessagesConstants.TRANSCODE_FILE_TO_RTP
        }

        params += MessagesConstants.LOCAL_IP_ADDRESS -> user.sipInfo.localIpAddress
        params += MessagesConstants.LOCAL_VIDEO_PORT -> user.sipInfo.localVideoPort
        params += MessagesConstants.REMOTE_VIDEO_PORT -> user.sipInfo.remoteVideoPort
        params += MessagesConstants.DESTINATION_IP_ADDRESS -> user.sipInfo.sipHost

        params += MessagesConstants.MEETING_ID -> mProps.meetingID
        params += MessagesConstants.VOICE_CONF -> mProps.voiceBridge
        params += MessagesConstants.CALLERNAME -> user.name
        outGW.send(new StartTranscoderRequest(mProps.meetingID, user.userID, params))

        //videoconf logo transcoder (shown in webconference)
        val params_logo = params.clone
        params_logo += MessagesConstants.TRANSCODER_TYPE -> MessagesConstants.TRANSCODE_FILE_TO_RTMP
        params_logo -= MessagesConstants.INPUT
        outGW.send(new StartTranscoderRequest(mProps.meetingID, meetingModel.VIDEOCONFERENCE_LOGO_PREFIX + mProps.voiceBridge, params_logo))

      } else {
        //start global transcoder
        val params = new scala.collection.mutable.HashMap[String, String]
        params += MessagesConstants.TRANSCODER_TYPE -> MessagesConstants.TRANSCODE_RTP_TO_RTMP
        params += MessagesConstants.LOCAL_IP_ADDRESS -> meetingModel.globalCallLocalIpAddress()
        params += MessagesConstants.LOCAL_VIDEO_PORT -> meetingModel.globalCallLocalVideoPort()
        params += MessagesConstants.REMOTE_VIDEO_PORT -> meetingModel.globalCallRemoteVideoPort()
        params += MessagesConstants.DESTINATION_IP_ADDRESS -> meetingModel.sipHost()
        params += MessagesConstants.MEETING_ID -> mProps.meetingID
        params += MessagesConstants.VOICE_CONF -> mProps.voiceBridge
        params += MessagesConstants.CALLERNAME -> meetingModel.globalCallCallername
        outGW.send(new StartTranscoderRequest(mProps.meetingID, meetingModel.globalCallCallername, params))
      }
    }
*/
  }

  private def stopTranscoder(userId: String) {
    /*
    getUser(userId) match {
      case Some(user) => {
        if (!user.phoneUser) {
          //also stops videoconf logo
          outGW.send(new StopTranscoderRequest(mProps.meetingID, userId))
          outGW.send(new StopTranscoderRequest(mProps.meetingID, meetingModel.VIDEOCONFERENCE_LOGO_PREFIX + mProps.voiceBridge))
        } else {
          //we dont't stop global transcoder, but let it die for timeout
          //outGW.send(new StopTranscoderRequest(mProps.meetingID, meetingModel.globalCallCallername))
        }
      }
      case None => {}
    }
*/
  }

  def stopAllTranscoders() {
    /*
    getUser(meetingModel.talkerUserId()) match {
      case Some(user) => {
        outGW.send(new StopTranscoderRequest(mProps.meetingID, user.userID))
        outGW.send(new StopTranscoderRequest(mProps.meetingID, meetingModel.VIDEOCONFERENCE_LOGO_PREFIX + mProps.voiceBridge))
      }
      case None =>
    }
    if (!meetingModel.globalCallCallername.isEmpty)
      outGW.send(new StopTranscoderRequest(mProps.meetingID, meetingModel.globalCallCallername))
*/
  }

  def handleUserShareWebcamTranscoder(userId: String) {
    /*
    if (meetingModel.isTalker(userId)) {
      val params = new scala.collection.mutable.HashMap[String, String]
      params += MessagesConstants.TRANSCODER_TYPE -> MessagesConstants.TRANSCODE_RTMP_TO_RTP
      params += MessagesConstants.INPUT -> usersModel.getUserMainWebcamStream(userId)
      log.debug("User [{}] shared webcam, updating his transcoder", userId)
      outGW.send(new UpdateTranscoderRequest(mProps.meetingID, userId, params))
    }
*/
  }

  def handleUserUnshareWebcamTranscoder(userId: String) {
    /*
    if (meetingModel.isTalker(userId)) {
      getUser(userId) match {
        case Some(user) => {
          val params = new scala.collection.mutable.HashMap[String, String]
          if (user.hasStream) {
            params += MessagesConstants.TRANSCODER_TYPE -> MessagesConstants.TRANSCODE_RTMP_TO_RTP
            params += MessagesConstants.INPUT -> usersModel.getUserMainWebcamStream(user.userID)
          } else {
            params += MessagesConstants.TRANSCODER_TYPE -> MessagesConstants.TRANSCODE_FILE_TO_RTP
          }
          log.debug("User [{}] unshared webcam, updating his transcoder", userId)
          outGW.send(new UpdateTranscoderRequest(mProps.meetingID, userId, params))
        }
        case None => log.debug("")
      }
    }
*/
  }

  def handleStartTranscoderReply(msg: StartTranscoderReply) {
    /*
    System.out.println("Received StartTranscoderReply. Params: [\n"
      + "meetingID = " + msg.meetingID + "\n"
      + "transcoderId = " + msg.transcoderId + "\n\n")

    usersModel.getMediaSourceUser(msg.transcoderId) match {
      case Some(user) => userSharedKurentoRtpStream(user, msg.params)
      case _ => updateVideoConferenceStreamName(msg.params)
    }
*/
  }

  def handleUpdateTranscoderReply(msg: UpdateTranscoderReply) {
    /*
    System.out.println("Received UpdateTranscoderReply. Params: [\n"
      + "meetingID = " + msg.meetingID + "\n"
      + "transcoderId = " + msg.transcoderId + "\n\n")

    usersModel.getMediaSourceUser(msg.transcoderId) match {
      case Some(user) => userSharedKurentoRtpStream(user, msg.params)
      case _ =>
        if (!usersModel.activeTalkerChangedInWebconference(meetingModel.talkerUserId(), msg.transcoderId)) { //make sure this transcoder is the current talker
          updateVideoConferenceStreamName(msg.params)
        }
    }
*/
  }

  def handleStopTranscoderReply(msg: StopTranscoderReply) {
    /*
    System.out.println("Received StopTranscoderReply. Params: [\n"
      + "meetingID = " + msg.meetingID + "\n"
      + "transcoderId = " + msg.transcoderId + "\n\n")

    usersModel.getMediaSourceUser(msg.transcoderId) match {
      case Some(user) => userUnsharedKurentoRtpStream(user)
      case _ =>
        outGW.send(new SipVideoUpdated(mProps.meetingID, mProps.recorded, mProps.voiceBridge, meetingModel.isSipVideoPresent(), meetingModel.globalVideoStreamName(), meetingModel.talkerUserId(), meetingModel.globalVideoStreamWidth(), meetingModel.globalVideoStreamHeight()))
    }
*/
  }

  def handleTranscoderStatusUpdate(msg: TranscoderStatusUpdate) {
    /*
    System.out.println("TranscoderStatusUpdate. Params: [\n"
      + "meetingID = " + msg.meetingID + "\n"
      + "transcoderId = " + msg.transcoderId + "\n\n")

    usersModel.getMediaSourceUser(msg.transcoderId) match {
      case Some(user) => userUpdatedKurentoRtpStream(user, msg.params)
      case _ =>
        if (!usersModel.activeTalkerChangedInWebconference(meetingModel.talkerUserId(), msg.transcoderId)) { //make sure this transcoder is the current talker
          System.out.println(" currentTalker: " + meetingModel.talkerUserId() + ", transcoderId: " + msg.transcoderId + ". activeTalkerChangedInWebconference? " + usersModel.activeTalkerChangedInWebconference(meetingModel.talkerUserId(), msg.transcoderId))
          updateVideoConferenceStreamName(msg.params)
        }
    }
*/
  }

  def handleStartProbingReply(msg: StartProbingReply) {
    /*
    System.out.println("StartProbingReply. Params: [\n"
      + "meetingID = " + msg.meetingID + "\n"
      + "transcoderId = " + msg.transcoderId + "\n\n")
*/
  }
}

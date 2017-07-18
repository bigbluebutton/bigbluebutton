package org.bigbluebutton.transcode.api

trait InMessage { val meetingId: String }

case class StartTranscoderRequest(meetingId: String, transcoderId: String, params: java.util.Map[String, String]) extends InMessage
case class UpdateTranscoderRequest(meetingId: String, transcoderId: String, params: java.util.Map[String, String]) extends InMessage
case class StopTranscoderRequest(meetingId: String, transcoderId: String) extends InMessage
case class StopMeetingTranscoders(meetingId: String) extends InMessage
case class StartProbingRequest(meetingId: String, transcoderId: String, params: java.util.Map[String, String]) extends InMessage

package org.bigbluebutton.transcode.api

abstract class OutMessage

case class StartTranscoderReply(meetingId: String, transcoderId: String, params: Map[String, String]) extends OutMessage
case class StopTranscoderReply(meetingId: String, transcoderId: String) extends OutMessage
case class UpdateTranscoderReply(meetingId: String, transcoderId: String, params: Map[String, String]) extends OutMessage
case class StartProbingReply(meetingId: String, transcoderId: String, params: Map[String, String]) extends OutMessage
// Is this used? StartProbingReply sends the same message...
case class TranscoderStatusUpdate(meetingId: String, transcoderId: String, params: Map[String, String]) extends OutMessage

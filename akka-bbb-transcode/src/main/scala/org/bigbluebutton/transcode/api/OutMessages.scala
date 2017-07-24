package org.bigbluebutton.transcode.api

import scala.collection.mutable.HashMap

abstract class OutMessage

case class StartTranscoderReply(meetingId: String, transcoderId: String, params: HashMap[String, String]) extends OutMessage
case class StopTranscoderReply(meetingId: String, transcoderId: String) extends OutMessage
case class UpdateTranscoderReply(meetingId: String, transcoderId: String, params: HashMap[String, String]) extends OutMessage
case class StartProbingReply(meetingId: String, transcoderId: String, params: HashMap[String, String]) extends OutMessage

case class TranscoderStatusUpdate(meetingId: String, transcoderId: String, params: HashMap[String, String]) extends OutMessage

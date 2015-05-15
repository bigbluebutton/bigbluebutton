package org.bigbluebutton.endpoint

import org.bigbluebutton.apps.protocol.Header
import org.bigbluebutton.apps.MeetingIdAndName

sealed abstract class OutMsgFormatter

case class MeetingCreatedEventFormat(header: Header,
  payload: MeetingCreatedEventPayloadFormat)
case class UserJoinResponseFormat(header: Header,
  payload: UserJoinResponseFormatPayload) extends OutMsgFormatter
case class UserJoinResponseFormatPayload(meeting: MeetingIdAndName,
  session: String, result: ResultFormat,
  user: Option[UserFormat])
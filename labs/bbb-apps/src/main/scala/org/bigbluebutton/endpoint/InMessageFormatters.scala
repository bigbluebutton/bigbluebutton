package org.bigbluebutton.endpoint

import org.bigbluebutton.apps.protocol.Header
import org.bigbluebutton.apps.MeetingIdAndName
import org.bigbluebutton.apps.users.data.UserIdAndName

sealed abstract class InMsgFormatter

case class CreateMeetingRequestFormat(header: Header,
  payload: CreateMeetingRequestPayloadFormat) extends InMsgFormatter

case class CreateMeetingResponseFormat(header: Header,
  payload: CreateMeetingResponsePayloadFormat) extends InMsgFormatter

case class RegisterUserRequestFormat(header: Header,
  payload: RegisterUserRequestPayloadFormat) extends InMsgFormatter

case class RegisterUserResponseFormat(header: Header,
  payload: RegisterUserResponsePayloadFormat) extends InMsgFormatter

case class UserRegisteredEventFormat(header: Header,
  payload: UserRegisteredEventPayloadFormat) extends InMsgFormatter

case class UserJoinRequestFormat(header: Header,
  payload: UserJoinRequestPayloadFormat) extends InMsgFormatter

case class UserJoinedEventFormat(header: Header,
  payload: UserJoinedEventPayloadFormat) extends InMsgFormatter

case class UserLeaveMessage(header: Header,
  payload: UserLeavePayload) extends InMsgFormatter

case class GetUsersRequestMessage(header: Header,
  payload: GetUsersRequestPayload) extends InMsgFormatter

case class AssignPresenterMessage(header: Header,
  payload: AssignPresenterPayload) extends InMsgFormatter

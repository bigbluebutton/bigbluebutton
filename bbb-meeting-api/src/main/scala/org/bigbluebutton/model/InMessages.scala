package org.bigbluebutton.model

import org.bigbluebutton.service.RegisterUser
import org.bigbluebutton.common2.domain.DefaultProps

trait InMessage


//API
case class CreateMeetingApiMsg(defaultProps: DefaultProps) extends InMessage
case class EndMeetingApiMsg(meetingId: String) extends InMessage
case class RegisterUserApiMsg(regUser: RegisterUser) extends InMessage
case class GetUserApiMsg(meetingId: String, userIntId: String) extends InMessage
case class UserInfosApiMsg(infos: Map[String, Any]) extends InMessage

//case class ApiResponse(msg: String)

trait ApiResponse

case class ApiResponseSuccess(msg: String, any: Any = null) extends ApiResponse
case class ApiResponseFailure(msg: String, any: Any = null) extends ApiResponse
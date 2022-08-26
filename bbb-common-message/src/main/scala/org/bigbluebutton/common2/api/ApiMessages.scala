package org.bigbluebutton.common2.api

import org.bigbluebutton.common2.domain.DefaultProps

case class RegisterUser(meetingId: String, intUserId: String, name: String, role: String,
                        extUserId: String, authToken: String, avatarURL: String,
                        guest: Boolean, authed: Boolean, guestStatus: String, excludeFromDashboard: Boolean)

//API
case class CreateMeetingApiMsg(defaultProps: DefaultProps)
case class EndMeetingApiMsg(meetingId: String)
case class RegisterUserApiMsg(regUser: RegisterUser)
case class GetUserApiMsg(meetingId: String, userIntId: String)
case class UserInfosApiMsg(infos: Map[String, Any])

trait ApiResponse

case class ApiResponseSuccess(msg: String, any: Any = null) extends ApiResponse
case class ApiResponseFailure(msg: String, any: Any = null) extends ApiResponse
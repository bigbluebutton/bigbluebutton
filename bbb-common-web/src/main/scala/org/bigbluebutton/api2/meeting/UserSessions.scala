package org.bigbluebutton.api2.meeting

case class UserSession2(authToken: String, internalUserId: String, conferencename: String,
                        meetingID: String, externMeetingID: String, externUserID: String, fullname: String,
                        role: String, conference: String, room: String, guest: Boolean = false,
                        authed: Boolean = false, voicebridge: String, webvoiceconf: String,
                        mode: String, record: String, welcome: String, logoutUrl: String,
                        defaultLayout: String = "NOLAYOUT", avatarURL: String, configXML: String)

class UserSessions {

}

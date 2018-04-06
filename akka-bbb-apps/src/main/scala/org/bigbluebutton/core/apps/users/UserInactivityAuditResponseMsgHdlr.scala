package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs.UserInactivityAuditResponseMsg
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.running.MeetingActor

trait UserInactivityAuditResponseMsgHdlr {
	this: MeetingActor =>

	def handleUserInactivityAuditResponseMsg(msg: UserInactivityAuditResponseMsg):Unit = {
		for {
			user <- Users2x.findWithIntId(liveMeeting.users2x, msg.body.userId)
		} yield {
			Users2x.updateInactivityResponse(liveMeeting.users2x, user)
		}
	}
}

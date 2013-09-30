package org.bigbluebutton.core.apps.layout.messages

import org.bigbluebutton.core.api.InMessage
import org.bigbluebutton.core.api.IOutMessage

case class GetCurrentLayoutRequest(meetingID: String, requesterID: String) extends InMessage
case class SetLayoutRequest(meetingID: String, requesterID: String, layoutID: String) extends InMessage
case class LockLayoutRequest(meetingID: String, requesterID: String, layoutID: String) extends InMessage
case class UnlockLayoutRequest(meetingID: String, requesterID: String) extends InMessage

case class GetCurrentLayoutReply(meetingID: String, recorded: Boolean, requesterID: String, layoutID: String, locked: Boolean, setByUserID: String) extends IOutMessage
case class SetLayoutEvent(meetingID: String, recorded: Boolean, requesterID: String, layoutID: String, locked: Boolean, setByUserID: String) extends IOutMessage
case class LockLayoutEvent(meetingID: String, recorded: Boolean, requesterID: String, layoutID: String, locked: Boolean, setByUserID: String) extends IOutMessage
case class UnlockLayoutEvent(meetingID: String, recorded: Boolean, requesterID: String, layoutID: String, locked: Boolean, setByUserID: String) extends IOutMessage

package org.bigbluebutton.common2.messages.voiceconf

import org.bigbluebutton.common2.messages.{BbbCoreHeaderWithMeetingId, BbbCoreMsg}

object StopRecordingVoiceConfMsg { val NAME = "StopRecordingVoiceConfMsg" }
case class StopRecordingVoiceConfMsg(header: BbbCoreHeaderWithMeetingId,
                                     body: StopRecordingVoiceConfMsgBody) extends BbbCoreMsg
case class StopRecordingVoiceConfMsgBody(voiceConf: String, meetingId: String, stream: String)

package org.bigbluebutton.common2.messages.voiceconf

import org.bigbluebutton.common2.messages.{BbbCoreHeaderWithMeetingId, BbbCoreMsg}

object StartRecordingVoiceConfMsg { val NAME = "StartRecordingVoiceConfMsg" }
case class StartRecordingVoiceConfMsg(header: BbbCoreHeaderWithMeetingId,
                                      body: StartRecordingVoiceConfMsgBody) extends BbbCoreMsg
case class StartRecordingVoiceConfMsgBody(voiceConf: String, meetingId: String)

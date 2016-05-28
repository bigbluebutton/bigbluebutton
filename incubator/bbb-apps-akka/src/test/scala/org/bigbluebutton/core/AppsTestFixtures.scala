package org.bigbluebutton.core

import org.bigbluebutton.core.domain._

trait AppsTestFixtures {

  val meetingId = "testMeetingId"
  val externalMeetingId = "testExternalMeetingId"
  val meetingName = "test meeting"
  val record = false
  val voiceConfId = "85115"
  val durationInMinutes = 10
  val autoStartRecording = false
  val allowStartStopRecording = false
  val moderatorPassword = "modpass"
  val viewerPassword = "viewpass"
  val createTime = System.currentTimeMillis
  val createDate = "Oct 26, 2015"
  val isBreakout = false

  val mProps = new MeetingProperties(IntMeetingId(meetingId), ExtMeetingId(externalMeetingId),
    Name(meetingName), Recorded(record), VoiceConf(voiceConfId), durationInMinutes,
    autoStartRecording, allowStartStopRecording, moderatorPassword, viewerPassword,
    createTime, createDate, isBreakout)

}
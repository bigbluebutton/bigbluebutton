package org.bigbluebutton.core

trait AppsTestFixtures {

  val meetingId = "testMeetingId"
  val externalMeetingId = "testExternalMeetingId"
  val parentMeetingId = "testParentMeetingId"
  val sequence = 4
  val meetingName = "test meeting"
  val record = false
  val voiceConfId = "85115"
  val deskshareConfId = "85115-DESKSHARE"
  val durationInMinutes = 10
  val autoStartRecording = false
  val allowStartStopRecording = false
  val webcamsOnlyForModerator = false;
  val moderatorPassword = "modpass"
  val viewerPassword = "viewpass"
  val createTime = System.currentTimeMillis
  val createDate = "Oct 26, 2015"
  val isBreakout = false
  val red5DeskShareIP = "127.0.0.1"
  val red5DeskShareApp = "red5App"

  val mProps = new MeetingProperties(meetingId, externalMeetingId, parentMeetingId,
    meetingName, record,
    voiceConfId, deskshareConfId,
    durationInMinutes,
    autoStartRecording, allowStartStopRecording, webcamsOnlyForModerator,
    moderatorPassword, viewerPassword,
    createTime, createDate, red5DeskShareIP, red5DeskShareApp,
    isBreakout, sequence)
}

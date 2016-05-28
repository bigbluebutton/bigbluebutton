package org.bigbluebutton.core.domain

case class MeetingConfig(
  name: String,
  id: MeetingID,
  passwords: MeetingPasswords,
  welcomeMsg: String,
  logoutUrl: String,
  maxUsers: Int,
  record: Boolean = false,
  duration: MeetingDuration,
  defaultAvatarURL: String,
  defaultConfigToken: String)

case class MeetingID(
  internal: String,
  external: String)

case class VoiceConfig(
  telVoice: String,
  webVoice: String,
  dialNumber: String)

case class MeetingPasswords(
  moderatorPass: String,
  viewerPass: String)

case class MeetingDuration(
  duration: Int = 0,
  createdTime: Long = 0,
  startTime: Long = 0,
  endTime: Long = 0)

case class MeetingInfo(
  meetingID: String,
  meetingName: String,
  recorded: Boolean,
  voiceBridge: String,
  duration: Int)

case class MeetingProperties(
  id: IntMeetingId,
  extId: ExtMeetingId,
  name: Name,
  recorded: Recorded,
  voiceConf: VoiceConf,
  duration: Int,
  autoStartRecording: Boolean,
  allowStartStopRecording: Boolean,
  moderatorPass: String,
  viewerPass: String,
  createTime: Long,
  createDate: String,
  isBreakout: Boolean)

case class MeetingProperties2x(
  id: IntMeetingId,
  extId: ExtMeetingId,
  name: Name,
  voiceConf: VoiceConf,
  duration: Int,
  maxUsers: Int,
  allowVoiceOnly: Boolean,
  isBreakout: Boolean,
  extensionProp: MeetingExtensionProp,
  recordingProp: MeetingRecordingProp)

case class MeetingRecordingProp(
  recorded: Recorded = Recorded(false),
  autoStartRecording: Boolean = false,
  allowStartStopRecording: Boolean = true)

case class MeetingExtensionProp(
  maxExtensions: Int = 0,
  extendByMinutes: Int = 20,
  sendNotice: Boolean = true)

case class MeetingRecordingStatus(
  recording: Boolean = false,
  voiceRecordingFilename: String = "")

case class MeetingExtensionStatus(
  numExtensions: Int = 0,
  sent15MinNotice: Boolean = false,
  sent10MinNotice: Boolean = false,
  sent5MinNotice: Boolean = false)


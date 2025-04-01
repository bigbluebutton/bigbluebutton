package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.core2.message.senders.MsgBuilder

class RecordingFileSplitter(
    val liveMeeting: LiveMeeting,
    val outGW:       OutMsgRouter,
    val stream:      String
) extends SystemConfiguration {

  var startRecTimer: java.util.Timer = null
  var stopRecTimer: java.util.Timer = null
  var currentStreamPath: String = stream
  var previousStreamPath: String = stream
  val lastPointPos = stream.lastIndexOf('.')
  val pathWithoutExtension: String = stream.substring(0, lastPointPos)
  val extension: String = stream.substring(lastPointPos, stream.length())

  class RecordingFileSplitterStopTask extends java.util.TimerTask {
    def run() {
      val event = MsgBuilder.buildStopRecordingVoiceConfSysMsg(
        liveMeeting.props.meetingProp.intId,
        liveMeeting.props.voiceProp.voiceConf,
        previousStreamPath
      )
      outGW.send(event)
    }
  }

  class RecordingFileSplitterStartTask extends java.util.TimerTask {
    var currentFileNumber: Int = 0

    def run() {
      val newStreamPath = pathWithoutExtension + "_" + String.valueOf(currentFileNumber) + extension;
      MeetingStatus2x.voiceRecordingStart(liveMeeting.status, newStreamPath)
      val event = MsgBuilder.buildStartRecordingVoiceConfSysMsg(
        liveMeeting.props.meetingProp.intId,
        liveMeeting.props.voiceProp.voiceConf,
        newStreamPath
      )
      outGW.send(event)

      if (currentStreamPath == stream) {
        // first file, no previous one to stop
        previousStreamPath = newStreamPath
      } else {
        previousStreamPath = currentStreamPath
        // stop previous recording, wait 5 seconds to avoid interruptions
        stopRecTimer = new java.util.Timer()
        stopRecTimer.schedule(new RecordingFileSplitterStopTask(), 5000L)
      }

      currentStreamPath = newStreamPath
      currentFileNumber = currentFileNumber + 1
    }
  }

  def stop() {
    startRecTimer.cancel()
    if (stopRecTimer != null) {
      stopRecTimer.cancel()
    }
  }

  def start(): Unit = {
    startRecTimer = new java.util.Timer()
    startRecTimer.schedule(
      new RecordingFileSplitterStartTask(),
      0L, //initial delay
      voiceConfRecordFileSplitterIntervalInMinutes * 60000L //subsequent rate
    );
  }
}
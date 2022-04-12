package org.bigbluebutton.core.models

import org.bigbluebutton.SystemConfiguration

object AudioCaptions extends SystemConfiguration {
  def setFloor(audioCaptions: AudioCaptions, userId: String) = audioCaptions.floor = userId

  def isFloor(audioCaptions: AudioCaptions, userId: String) = audioCaptions.floor == userId

  def parseTranscript(transcript: String): String = {
    val words = transcript.split("\\s+") // Split on whitespaces
    val lines = words.grouped(transcriptWords).toArray // Group each X words into lines
    lines.takeRight(transcriptLines).map(l => l.mkString(" ")).mkString("\n") // Join the last X lines
  }
}

class AudioCaptions {
  private var floor: String = ""
}

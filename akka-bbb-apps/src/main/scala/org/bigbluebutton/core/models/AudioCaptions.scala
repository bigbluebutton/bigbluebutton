package org.bigbluebutton.core.models

object AudioCaptions {
  def setFloor(audioCaptions: AudioCaptions, userId: String) = audioCaptions.floor = userId

  def isFloor(audioCaptions: AudioCaptions, userId: String) = audioCaptions.floor == userId

  def parseTranscript(transcript: String): String = {
    val words = transcript.split("\\s+") // Split on whitespaces
    val lines = words.grouped(8).toArray // Group each X words into lines
    lines.takeRight(2).map(l => l.mkString(" ")).mkString("\n") // Join the last X lines
  }
}

class AudioCaptions {
  private var floor: String = ""
}

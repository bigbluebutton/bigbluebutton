package org.bigbluebutton.core.models

object AudioCaptions {
  def setFloor(audioCaptions: AudioCaptions, userId: String) = audioCaptions.floor = userId

  def isFloor(audioCaptions: AudioCaptions, userId: String) = audioCaptions.floor == userId
}

class AudioCaptions {
  private var floor: String = ""
}

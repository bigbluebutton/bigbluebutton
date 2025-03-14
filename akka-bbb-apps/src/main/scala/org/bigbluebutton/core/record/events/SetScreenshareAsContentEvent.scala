package org.bigbluebutton.core.record.events

class SetScreenshareAsContentEvent extends AbstractParticipantRecordEvent {
  import SetScreenshareAsContentEvent._
  setEvent("SetScreenshareAsContentEvent")

  def setScreenshareAsContent(screenshareAsContent: Boolean): Unit = {
    eventMap.put(SCREENSHARE_AS_CONTENT, screenshareAsContent.toString())
  }

}

object SetScreenshareAsContentEvent {
  val SCREENSHARE_AS_CONTENT = "screenshareAsContent"
}

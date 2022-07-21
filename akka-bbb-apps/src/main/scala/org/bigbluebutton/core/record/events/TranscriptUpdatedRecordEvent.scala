package org.bigbluebutton.core.record.events

class TranscriptUpdatedRecordEvent extends AbstractAudioCaptionsRecordEvent {
  import TranscriptUpdatedRecordEvent._

  setEvent("TranscriptUpdatedEvent")

  def setLocale(locale: String) {
    eventMap.put(LOCALE, locale)
  }

  def setTranscript(transcript: String) {
    eventMap.put(TRANSCRIPT, transcript)
  }
}

object TranscriptUpdatedRecordEvent {
  protected final val LOCALE = "locale"
  protected final val TRANSCRIPT = "transcript"
}

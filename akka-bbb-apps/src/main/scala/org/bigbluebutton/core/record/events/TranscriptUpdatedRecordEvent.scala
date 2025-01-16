package org.bigbluebutton.core.record.events

class TranscriptUpdatedRecordEvent extends AbstractAudioCaptionsRecordEvent {
  import TranscriptUpdatedRecordEvent._

  setEvent("TranscriptUpdatedEvent")

  def setLocale(locale: String): Unit = {
    eventMap.put(LOCALE, locale)
  }

  def setTranscript(transcript: String): Unit = {
    eventMap.put(TRANSCRIPT, transcript)
  }
}

private object TranscriptUpdatedRecordEvent {
  protected final val LOCALE = "locale"
  protected final val TRANSCRIPT = "transcript"
}

package org.bigbluebutton.core.record.events

class MediaGroupDestroyedRecordEvent extends AbstractMediaGroupRecordEvent {
  import MediaGroupDestroyedRecordEvent._

  setEvent("MediaGroupDestroyedEvent")
}

object MediaGroupDestroyedRecordEvent {
  protected final val SENDERS = "senders"
}

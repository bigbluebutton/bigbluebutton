package org.bigbluebutton.core.record.events

trait AbstractMediaGroupRecordEvent extends RecordEvent {
  import AbstractMediaGroupRecordEvent._

  setModule("MEDIA_GROUP")

  def setGroupId(id: String) {
    eventMap.put(GROUP_ID, id)
  }

  def setMediaType(mediaType: String) {
    eventMap.put(MEDIA_TYPE, mediaType)
  }
}

object AbstractMediaGroupRecordEvent {
  protected final val GROUP_ID = "groupId"
  protected final val MEDIA_TYPE = "mediaType"
}

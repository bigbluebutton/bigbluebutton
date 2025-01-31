package org.bigbluebutton.core.record.events

class RecordChapterBreakRecordEvent extends AbstractParticipantRecordEvent {

  setEvent("RecordChapterBreakEvent")

  def setChapterBreakTimestamp(timestamp: Long): Unit = {
    eventMap.put("breakTimestamp", timestamp.toString)
  }
}

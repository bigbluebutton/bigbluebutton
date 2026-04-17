package org.bigbluebutton.core.record.events

import org.bigbluebutton.common2.msgs.MediaGroupParticipant

class MediaGroupCreatedRecordEvent extends AbstractMediaGroupRecordEvent {
  import MediaGroupCreatedRecordEvent._

  setEvent("MediaGroupCreatedEvent")

  def setSenders(senders: Vector[MediaGroupParticipant]) {
    eventMap.put(SENDERS, senders.filter(_.active).map(_.userId).mkString(","))
  }
}

object MediaGroupCreatedRecordEvent {
  protected final val SENDERS = "senders"
}

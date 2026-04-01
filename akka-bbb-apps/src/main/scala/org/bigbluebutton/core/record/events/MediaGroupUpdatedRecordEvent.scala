package org.bigbluebutton.core.record.events

import org.bigbluebutton.common2.msgs.MediaGroupParticipant

class MediaGroupUpdatedRecordEvent extends AbstractMediaGroupRecordEvent {
  import MediaGroupUpdatedRecordEvent._

  setEvent("MediaGroupUpdatedEvent")

  def setSenders(senders: Vector[MediaGroupParticipant]) {
    eventMap.put(SENDERS, senders.filter(_.active).map(_.userId).mkString(","))
  }
}

object MediaGroupUpdatedRecordEvent {
  protected final val SENDERS = "senders"
}

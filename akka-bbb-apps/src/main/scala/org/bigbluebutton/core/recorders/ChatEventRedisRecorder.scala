package org.bigbluebutton.core.recorders

import org.bigbluebutton.core.api._
import scala.collection.JavaConversions._
import org.bigbluebutton.core.service.recorder.RecorderApplication
import org.bigbluebutton.core.recorders.events.PublicChatRecordEvent

class ChatEventRedisRecorder(recorder: RecorderApplication) extends OutMessageListener2 {

  def handleMessage(msg: IOutMessage) {
    msg match {
      case msg: SendPublicMessageEvent => handleSendPublicMessageEvent(msg)
      case _ => // do nothing
    }
  }

  private def handleSendPublicMessageEvent(msg: SendPublicMessageEvent) {
    if (msg.recorded) {
      val message = mapAsJavaMap(msg.message)
      val ev = new PublicChatRecordEvent();
      ev.setTimestamp(TimestampGenerator.generateTimestamp);
      ev.setMeetingId(msg.meetingID);
      ev.setSender(message.get("fromUsername"));
      ev.setMessage(message.get("message"));
      ev.setColor(message.get("fromColor"));
      recorder.record(msg.meetingID, ev);
    }
  }
}
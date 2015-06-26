package org.bigbluebutton.core.recorders

import org.bigbluebutton.core.api._
import scala.collection.JavaConversions._
import org.bigbluebutton.core.service.recorder.RecorderApplication
import org.bigbluebutton.core.recorders.events.PublicChatRecordEvent

class DeskShareEventRedisRecorder(recorder: RecorderApplication) extends OutMessageListener2 {
  def handleMessage(msg: IOutMessage) {
    msg match {
      case msg: SendPublicMessageEvent => handleSendPublicMessageEvent(msg)
      case _ => // do nothing
    }
  }

  private def handleSendPublicMessageEvent(msg: SendPublicMessageEvent) {
    println("____TODO____DeskShareEventRedisRecorder")
    //      if (msg.recorded) {
    //      }
  }
}

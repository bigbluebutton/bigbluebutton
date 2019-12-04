package org.bigbluebutton.core
import org.bigbluebutton.common2.msgs.{ BbbCommonEnvCoreMsg, BbbCoreMsg }

class OutMsgGWSeq extends OutMessageGateway {
  val msgs = new collection.mutable.Queue[BbbCoreMsg]

  override def send(msg: BbbCommonEnvCoreMsg): Unit = {
    println(" Adding message " + msg)
    msgs += msg.core
    println(" Adding message length " + msgs.length)
  }

  override def record(msg: BbbCommonEnvCoreMsg): Unit = {

  }
}

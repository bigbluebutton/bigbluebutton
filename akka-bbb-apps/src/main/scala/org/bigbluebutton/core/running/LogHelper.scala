package org.bigbluebutton.core.running

import akka.actor.ActorContext
import akka.event.{ LogSource, Logging }

object MyType {
  implicit val logSource: LogSource[AnyRef] = new LogSource[AnyRef] {
    def genString(o: AnyRef): String = o.getClass.getName
    override def getClazz(o: AnyRef): Class[_] = o.getClass
  }
}

trait LogHelper {

  import MyType._

  implicit val context: ActorContext

  val log = Logging(context.system, getClass)

}

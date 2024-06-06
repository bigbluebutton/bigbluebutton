package org.bigbluebutton.core.running

import org.apache.pekko.actor.ActorContext
import org.apache.pekko.event.{ LogSource, Logging }

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

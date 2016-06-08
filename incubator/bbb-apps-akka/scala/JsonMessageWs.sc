import org.bigbluebutton.core.UserMessagesProtocol._
import spray.json._
import org.bigbluebutton.core.domain.IntUserId

object JsonMessageWs {
  println("Welcome to the Scala worksheet")

  val id = new IntUserId("foo")
  id.toJson
}
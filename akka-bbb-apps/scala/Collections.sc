import scala.collection.mutable

object Collections {
  val messages = new mutable.Queue[String]()
  messages += "foo"
  messages += "bar"
  messages += "baz"
  messages.foreach(f => println(f))
}
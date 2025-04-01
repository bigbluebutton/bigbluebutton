package org.bigbluebutton.common2.util

import org.bigbluebutton.common2.{ TestFixtures, UnitSpec2 }
import org.bigbluebutton.common2.msgs._

import scala.collection.immutable.List
import com.fasterxml.jackson.databind.JsonNode

import scala.util.{ Failure, Success }

case class Person(name: String, age: Int)
case class Group(name: String, persons: Seq[Person], leader: Person)

class JsonUtilTest extends UnitSpec2 with TestFixtures {

  "JsonUtil" should "unmarshall a simple map" in {
    /*
     * (Un)marshalling a simple map
     */
    val originalMap = Map("a" -> List(1, 2), "b" -> List(3, 4, 5), "c" -> List())
    val json = JsonUtil.toJson(originalMap)
    // json: String = {"a":[1,2],"b":[3,4,5],"c":[]}
    val map = JsonUtil.toMap[Seq[Int]](json)
    // map: Map[String,Seq[Int]] = Map(a -> List(1, 2), b -> List(3, 4, 5), c -> List())
    println(map)
    map match {
      case Success(a)  => assert(a.values.size == 3)
      case Failure(ex) => fail("Failed to decode json message")
    }
  }

  "JsonUtil" should "unmarshall a nested case class" in {
    /*
 * (Un)marshalling nested case classes
 */
    val jeroen = Person("Jeroen", 26)
    val martin = Person("Martin", 54)

    val originalGroup = Group("Scala ppl", Seq(jeroen, martin), martin)
    // originalGroup: Group = Group(Scala ppl,List(Person(Jeroen,26), Person(Martin,54)),Person(Martin,54))
    println(originalGroup)

    val groupJson = JsonUtil.toJson(originalGroup)
    // groupJson: String = {"name":"Scala ppl","persons":[{"name":"Jeroen","age":26},{"name":"Martin","age":54}],"leader":{"name":"Martin","age":54}}
    println(groupJson)

    val group = JsonUtil.fromJson[Group](groupJson)
    // group: Group = Group(Scala ppl,List(Person(Jeroen,26), Person(Martin,54)),Person(Martin,54))
    println(group)
  }

}

case class FooNode(header: BbbCoreHeaderWithMeetingId, body: JsonNode)

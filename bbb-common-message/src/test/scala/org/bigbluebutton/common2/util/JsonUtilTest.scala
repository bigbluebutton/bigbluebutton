package org.bigbluebutton.common2.util

import org.bigbluebutton.common2.UnitSpec2

import scala.collection.immutable.List

class JsonUtilTest extends UnitSpec2 {

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
    map.get("a") match {
      case Some(a) => assert(a.length == 2)
      case None => fail("Failed to decode json message")
    }
  }
}

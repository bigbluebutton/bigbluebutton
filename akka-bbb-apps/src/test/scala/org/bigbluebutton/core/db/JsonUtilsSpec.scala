package org.bigbluebutton.core.db

import org.bigbluebutton.common2.msgs.AnnotationVO
import org.bigbluebutton.common2.util.JsonUtil
import org.bigbluebutton.core.record.events.AddTldrawShapeWhiteboardRecordEvent
import org.scalatest.flatspec.AnyFlatSpec
import spray.json._

// JsonUtils writes the untyped maps akka-apps receives from clients (whiteboard
// annotations, plugin data, client settings) to the database, and the whiteboard
// recording event reuses it. Incoming messages are read with JsonUtil's Jackson
// mapper, which turns a JSON integer outside the Int range into a Long or a
// BigInteger, so the writer has to handle those as well as Int and Double.
class JsonUtilsSpec extends AnyFlatSpec {

  private val annotationJson =
    """{"id":"shape:1","wbId":"page-1","userId":"user-1","annotationInfo":{"type":"geo","x":99999999999,
      |"y":123456789012345678901234567890,"rotation":0,"opacity":0.5,"isLocked":false,"parentId":null,
      |"props":{"w":100,"h":2147483648,"text":""},"meta":{"tags":[1,4294967296]}}}""".stripMargin.replace("\n", "")

  private def incomingAnnotationInfo: Map[String, Any] = JsonUtil.fromJson[AnnotationVO](annotationJson).get.annotationInfo

  behavior of "JsonUtils.mapToJson"

  it should "write integers outside the Int range exactly" in {
    val json = JsonUtils.mapToJson(Map(
      "long" -> java.lang.Long.valueOf(99999999999L),
      "bigInteger" -> new java.math.BigInteger("123456789012345678901234567890"),
      "bigDecimal" -> new java.math.BigDecimal("1.25")
    ))

    assert(json == JsObject(
      "long" -> JsNumber(99999999999L),
      "bigInteger" -> JsNumber(BigInt("123456789012345678901234567890")),
      "bigDecimal" -> JsNumber(BigDecimal("1.25"))
    ))
  }

  it should "write every value Jackson reads from an incoming annotation" in {
    val fields = JsonUtils.mapToJson(incomingAnnotationInfo).asJsObject.fields

    assert(fields("x") == JsNumber(99999999999L))
    assert(fields("y") == JsNumber(BigInt("123456789012345678901234567890")))
    assert(fields("rotation") == JsNumber(0))
    assert(fields("opacity") == JsNumber(0.5))
    assert(fields("isLocked") == JsFalse)
    assert(fields("parentId") == JsNull)
    assert(fields("props").asJsObject.fields("h") == JsNumber(2147483648L))
    assert(fields("meta").asJsObject.fields("tags") == JsArray(JsNumber(1), JsNumber(4294967296L)))
  }

  it should "still reject a value that has no JSON form" in {
    assertThrows[IllegalArgumentException](JsonUtils.mapToJson(Map("x" -> new Object)))
  }

  behavior of "AddTldrawShapeWhiteboardRecordEvent"

  it should "record a shape as the same JSON that is stored" in {
    val annotationInfo = incomingAnnotationInfo
    val event = new AddTldrawShapeWhiteboardRecordEvent()
    event.addAnnotation(annotationInfo)

    assert(event.toMap()("shapeData").parseJson == JsonUtils.mapToJson(annotationInfo))
  }
}

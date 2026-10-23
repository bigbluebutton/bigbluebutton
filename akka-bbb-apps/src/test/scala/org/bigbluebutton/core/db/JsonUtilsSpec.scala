package org.bigbluebutton.core.db

import org.scalatest.flatspec.AnyFlatSpec
import spray.json._

// Message metadata is persisted through JsonUtils. Jackson binds a JSON number to
// Int, Long, BigInteger or a decimal depending on its size, and server-side code
// (the chat attachment size) stores Longs, so every numeric type has to serialize.
//
// NOTE: extends AnyFlatSpec directly rather than the shared UnitSpec, which does not
// compile against the resolved ScalaTest 3.2.x. Mirrors MarkdownUtilSpec.
class JsonUtilsSpec extends AnyFlatSpec {

  "JsonUtils.mapToJson" should "serialize every numeric type a metadata value can have" in {
    val json = JsonUtils.mapToJson(Map(
      "int" -> 1,
      "long" -> 8979L,
      "bigLong" -> 99999999999L,
      "bigInteger" -> new java.math.BigInteger("123456789012345678901234567890"),
      "scalaBigInt" -> BigInt(7),
      "javaDecimal" -> new java.math.BigDecimal("1.5"),
      "scalaDecimal" -> BigDecimal("2.5"),
      "nested" -> Map("size" -> 8979L)
    ))
    assert(json == JsObject(
      "int" -> JsNumber(1),
      "long" -> JsNumber(8979),
      "bigLong" -> JsNumber(99999999999L),
      "bigInteger" -> JsNumber(BigInt("123456789012345678901234567890")),
      "scalaBigInt" -> JsNumber(7),
      "javaDecimal" -> JsNumber(BigDecimal("1.5")),
      "scalaDecimal" -> JsNumber(BigDecimal("2.5")),
      "nested" -> JsObject("size" -> JsNumber(8979))
    ))
  }
}

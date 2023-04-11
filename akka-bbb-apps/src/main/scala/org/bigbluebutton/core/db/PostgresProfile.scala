package org.bigbluebutton.core.db

import com.github.tminglei.slickpg._
import spray.json.{ JsArray, JsBoolean, JsNumber, JsObject, JsString, JsValue, JsonWriter }
import spray.json.{ _ }

trait PostgresProfile extends ExPostgresProfile
  with PgArraySupport {
  //  def pgjson = "jsonb" // jsonb support is in postgres 9.4.0 onward; for 9.3.x use "json"

  // Add back `capabilities.insertOrUpdate` to enable native `upsert` support; for postgres 9.5+
  override protected def computeCapabilities: Set[slick.basic.Capability] =
    super.computeCapabilities + slick.jdbc.JdbcCapabilities.insertOrUpdate

  override val api = PgAPI

  object PgAPI extends API with ArrayImplicits //    with DateTimeImplicits
  {
    implicit val strListTypeMapper = new SimpleArrayJdbcType[String]("text").to(_.toList)
  }

}

object PostgresProfile extends PostgresProfile

object JsonUtils {
  implicit object AnyJsonWriter extends JsonWriter[Any] {
    def write(x: Any): JsValue = x match {
      case n: Int       => JsNumber(n)
      case s: String    => JsString(s)
      case b: Boolean   => JsBoolean(b)
      case f: Float     => JsNumber(f)
      case d: Double    => JsNumber(d)
      case m: Map[_, _] => JsObject(m.asInstanceOf[Map[String, Any]].map { case (k, v) => k -> write(v) })
      case l: List[_]   => JsArray(l.map(write).toVector)
      case _            => throw new IllegalArgumentException(s"Unsupported type: ${x.getClass.getName}")
      //      case _            => JsNull
    }
  }

  // Cria um JsonWriter implícito para o tipo Map[String, Any]
  implicit val mapFormat: JsonWriter[Map[String, Any]] = new JsonWriter[Map[String, Any]] {
    def write(m: Map[String, Any]): JsValue = {
      JsObject(m.map { case (k, v) => k -> AnyJsonWriter.write(v) })
    }
  }

  def mapToJson(genericMap: Map[String, Any]) = {
    genericMap.toJson.compactPrint
  }

}
package org.bigbluebutton.core.db

import com.github.tminglei.slickpg._
import org.bigbluebutton.common2.domain.SimpleVoteOutVO
import spray.json.DefaultJsonProtocol.{ StringJsonFormat, vectorFormat }
import spray.json.{ JsArray, JsBoolean, JsNumber, JsObject, JsString, JsValue, JsonWriter, _ }

import scala.util.{ Failure, Success, Try }

trait PostgresProfile extends ExPostgresProfile
  with PgArraySupport
  with PgSprayJsonSupport {
  def pgjson = "jsonb" // jsonb support is in postgres 9.4.0 onward; for 9.3.x use "json"

  // Add back `capabilities.insertOrUpdate` to enable native `upsert` support; for postgres 9.5+
  override protected def computeCapabilities: Set[slick.basic.Capability] =
    super.computeCapabilities + slick.jdbc.JdbcCapabilities.insertOrUpdate

  override val api = PgAPI

  object PgAPI extends API with ArrayImplicits with SprayJsonImplicits //    with DateTimeImplicits
  {
    implicit val strListTypeMapper = new SimpleArrayJdbcType[String]("text").to(_.toList)
  }

}

object PostgresProfile extends PostgresProfile

object JsonUtils {
  implicit object AnyJsonWriter extends JsonWriter[Any] {
    def write(x: Any): JsValue = x match {
      case n: Int             => JsNumber(n)
      case s: String          => JsString(s)
      case b: Boolean         => JsBoolean(b)
      case f: Float           => JsNumber(f)
      case d: Double          => JsNumber(d)
      case m: Map[_, _]       => JsObject(m.asInstanceOf[Map[String, Any]].map { case (k, v) => k -> write(v) })
      case l: List[_]         => JsArray(l.map(write).toVector)
      case a: Array[_]        => JsArray(a.map(write).toVector)
      case v: SimpleVoteOutVO => JsObject("id" -> JsNumber(v.id), "key" -> JsString(v.key), "numVotes" -> JsNumber(v.numVotes))
      case null               => JsNull
      case _                  => throw new IllegalArgumentException(s"Unsupported type: ${x.getClass.getName}")
      //      case _            => JsNull
    }
  }

  implicit val mapFormat: JsonWriter[Map[String, Any]] = new JsonWriter[Map[String, Any]] {
    def write(m: Map[String, Any]): JsValue = {
      JsObject(m.map { case (k, v) => k -> AnyJsonWriter.write(v) })
    }
  }

  def mapToJson(genericMap: Map[String, Any]) = {
    genericMap.toJson
  }

  def vectorToJson(genericVector: Vector[String]) = {
    genericVector.toJson
  }

  def stringToJson(jsonString: String): JsValue = {
    Try(jsonString.parseJson) match {
      case Success(jsValue) => jsValue
      case Failure(exception) =>
        println(s"Failed to parse JSON string: $exception")
        "{}".parseJson
    }
  }

}

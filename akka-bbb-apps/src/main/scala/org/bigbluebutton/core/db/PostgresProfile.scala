package org.bigbluebutton.core.db

import com.github.tminglei.slickpg._

trait PostgresProfile extends ExPostgresProfile
  with PgArraySupport //  with PgDate2Support
  //  with PgRangeSupport
  //  with PgHStoreSupport
  //  with PgPlayJsonSupport
  //  with PgSearchSupport
  //  with PgPostGISSupport
  //  with PgNetSupport
  //  with PgLTreeSupport
  {
  def pgjson = "jsonb" // jsonb support is in postgres 9.4.0 onward; for 9.3.x use "json"

  // Add back `capabilities.insertOrUpdate` to enable native `upsert` support; for postgres 9.5+
  override protected def computeCapabilities: Set[slick.basic.Capability] =
    super.computeCapabilities + slick.jdbc.JdbcCapabilities.insertOrUpdate

  override val api = MyAPI

  object MyAPI extends API with ArrayImplicits //    with DateTimeImplicits
  //    with JsonImplicits
  //    with NetImplicits
  //    with LTreeImplicits
  //    with RangeImplicits
  //    with HStoreImplicits
  //    with SearchImplicits
  //    with SearchAssistants
  {
    implicit val strListTypeMapper = new SimpleArrayJdbcType[String]("text").to(_.toList)
    //    implicit val playJsonArrayTypeMapper =
    //      new AdvancedArrayJdbcType[JsValue](pgjson,
    //        (s) => utils.SimpleArrayUtils.fromString[JsValue](Json.parse(_))(s).orNull,
    //        (v) => utils.SimpleArrayUtils.mkString[JsValue](_.toString())(v)
    //      ).to(_.toList)
  }
}

object PostgresProfile extends PostgresProfile
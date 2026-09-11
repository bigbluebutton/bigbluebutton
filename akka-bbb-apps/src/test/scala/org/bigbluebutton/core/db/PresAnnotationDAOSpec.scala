package org.bigbluebutton.core.db

import org.scalatest.flatspec.AnyFlatSpec
import slick.jdbc.PostgresProfile.api._

// Asserts that the annotation delete stays scoped to the owning meeting and page
// rather than keying on the client-supplied annotation id alone.
//
// NOTE: extends AnyFlatSpec directly rather than the shared UnitSpec, which
// currently does not compile against the resolved ScalaTest 3.2.x (UnitSpec
// still imports the pre-3.2 org.scalatest.FlatSpec / Matchers packages).
class PresAnnotationDAOSpec extends AnyFlatSpec {

  behavior of "PresAnnotationDAO.deleteAnnotationsQuery"

  // Building the update statement runs Slick's update compiler, which rejects
  // update queries that reference another table. Keeping this assertion means a
  // later attempt to scope through pres_presentation fails at build time rather
  // than at runtime.
  it should "scope the update by meeting and page as well as annotation id" in {
    val statement = PresAnnotationDAO
      .deleteAnnotationsQuery("meeting-id", "page-id", Array("annotation-id"))
      .map(a => (a.annotationInfo, a.meetingId, a.userId, a.lastUpdatedAt))
      .updateStatement

    assert(statement.contains("\"annotationId\""))
    assert(statement.contains("\"pageId\""))
    assert(statement.contains("\"meetingId\""))
  }

  it should "not emit an unscoped update when no annotation ids are given" in {
    val statement = PresAnnotationDAO
      .deleteAnnotationsQuery("meeting-id", "page-id", Array.empty[String])
      .map(a => (a.annotationInfo, a.meetingId, a.userId, a.lastUpdatedAt))
      .updateStatement

    assert(statement.contains("\"pageId\""))
    assert(statement.contains("\"meetingId\""))
  }
}

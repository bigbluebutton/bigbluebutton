package org.bigbluebutton.core.db

import org.scalatest.flatspec.AnyFlatSpec
import slick.jdbc.PostgresProfile.api._

// The delete run when an uploader disconnects must only reach that user's presentations
// that are still waiting for their file, never one that is converting, done or refused.
class PresPresentationDAOSpec extends AnyFlatSpec {

  // What "still waiting for its file" means, with the polarity of each condition: a flipped one
  // would reach the presentations that are converting, done or already failed.
  private val awaitingUpload = Seq(
    "(not (\"pres_presentation\".\"uploadToken\" = ''))",
    "(not \"pres_presentation\".\"uploadInProgress\")",
    "(not \"pres_presentation\".\"uploadCompleted\")",
    "(\"pres_presentation\".\"uploadErrorMsgKey\" is null)"
  )

  private def assertAwaitingUploadOnly(statement: String): Unit = {
    awaitingUpload.foreach(condition => assert(statement.contains(condition), s"$condition is not part of: $statement"))
    assert(!statement.contains(" or "))
  }

  behavior of "PresPresentationDAO.awaitingUploadQuery"

  it should "scope the delete to the meeting, the uploader and the awaiting-upload state" in {
    val statement = PresPresentationDAO
      .awaitingUploadQuery("meeting-id", "user-id")
      .delete
      .statements
      .mkString(" ")

    assert(statement.startsWith("delete from \"pres_presentation\""))
    Seq("meetingId", "uploadUserId", "uploadToken", "uploadInProgress", "uploadCompleted", "uploadErrorMsgKey")
      .foreach(column => assert(statement.contains("\"" + column + "\""), s"$column is not part of the filter"))
    assertAwaitingUploadOnly(statement)
  }

  behavior of "PresPresentationDAO.awaitingUploadOfPresentationQuery"

  // The report that an upload failed can arrive once the presentation is converting, done,
  // already failed, or deleted because its uploader left. It must change none of those.
  it should "scope the failure of an upload to that presentation while it awaits its file" in {
    val statement = PresPresentationDAO
      .awaitingUploadOfPresentationQuery("meeting-id", "presentation-id")
      .map(p => p.uploadErrorMsgKey)
      .update(Some("PRESENTATION_UPLOAD_FAILED"))
      .statements
      .mkString(" ")

    assert(statement.startsWith("update \"pres_presentation\""))
    Seq("meetingId", "presentationId", "uploadToken", "uploadInProgress", "uploadCompleted")
      .foreach(column => assert(statement.contains("\".\"" + column + "\""), s"$column is not part of the filter"))
    assertAwaitingUploadOnly(statement)
    assert(!statement.contains("uploadUserId"))
  }
}

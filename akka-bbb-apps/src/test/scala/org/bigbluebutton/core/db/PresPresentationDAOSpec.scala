package org.bigbluebutton.core.db

import org.scalatest.flatspec.AnyFlatSpec
import slick.jdbc.PostgresProfile.api._

// The delete run when an uploader disconnects must only reach that user's presentations
// that are still waiting for their file, never one that is converting, done or refused.
class PresPresentationDAOSpec extends AnyFlatSpec {

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
    assert(!statement.contains(" or "))
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
    assert(statement.contains("\"uploadErrorMsgKey\" is null"))
    assert(!statement.contains(" or "))
    assert(!statement.contains("uploadUserId"))
  }
}

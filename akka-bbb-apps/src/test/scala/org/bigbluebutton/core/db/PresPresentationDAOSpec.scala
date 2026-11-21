package org.bigbluebutton.core.db

import org.scalatest.flatspec.AnyFlatSpec
import slick.jdbc.PostgresProfile.api._

// The failure recorded when an uploader leaves must only reach that user's presentations
// that are still waiting for their file, never one that is converting, done or refused.
class PresPresentationDAOSpec extends AnyFlatSpec {

  // What "still waiting for its file" means, as the one condition it is in the statement. The
  // statements are compared whole: one that only contained these four parts could still negate
  // them together, or one of them, and reach the presentations that are converting, done or
  // already failed.
  private val awaitingUpload =
    "((((not (\"pres_presentation\".\"uploadToken\" = ''))" +
      " and (not \"pres_presentation\".\"uploadInProgress\"))" +
      " and (not \"pres_presentation\".\"uploadCompleted\"))" +
      " and (\"pres_presentation\".\"uploadErrorMsgKey\" is null))"

  behavior of "PresPresentationDAO.awaitingUploadQuery"

  it should "scope the failure to the meeting, the uploader and the awaiting-upload state" in {
    val statement = PresPresentationDAO
      .awaitingUploadQuery("meeting-id", "user-id")
      .map(p => p.uploadErrorMsgKey)
      .update(Some("PRESENTATION_UPLOAD_FAILED"))
      .statements
      .mkString(" ")

    assert(statement == "update \"pres_presentation\" set \"uploadErrorMsgKey\" = ? where " +
      "((\"pres_presentation\".\"meetingId\" = 'meeting-id')" +
      " and (\"pres_presentation\".\"uploadUserId\" = 'user-id'))" +
      " and " + awaitingUpload)
  }

  behavior of "PresPresentationDAO.awaitingUploadOfPresentationQuery"

  // The report that an upload failed can arrive once the presentation is converting, done,
  // already failed, or removed in the meantime. It must change none of those.
  it should "scope the failure of an upload to that presentation while it awaits its file" in {
    val statement = PresPresentationDAO
      .awaitingUploadOfPresentationQuery("meeting-id", "presentation-id")
      .map(p => p.uploadErrorMsgKey)
      .update(Some("PRESENTATION_UPLOAD_FAILED"))
      .statements
      .mkString(" ")

    assert(statement == "update \"pres_presentation\" set \"uploadErrorMsgKey\" = ? where " +
      "((\"pres_presentation\".\"meetingId\" = 'meeting-id')" +
      " and (\"pres_presentation\".\"presentationId\" = 'presentation-id'))" +
      " and " + awaitingUpload)
  }
}

package org.bigbluebutton.service

import org.scalatest.flatspec.AnyFlatSpec

import org.bigbluebutton.core.api.UserInfosApiMsg

// Exercises the session variables served to Hasura through the auth webhook.
// Lock settings are resolved by the permission rules against the current
// meeting_lockSettings row, so the only lock-related state a session carries
// is whether the user is a locked viewer (NotLockedInMeeting/LockedUserId).
//
// NOTE: extends AnyFlatSpec directly rather than the shared UnitSpec, which
// currently does not compile against the resolved ScalaTest (UnitSpec still
// imports the pre-3.2 org.scalatest.FlatSpec / Matchers packages). Same choice
// PollHdlrHelpersSpec and WhiteboardModelSpec made.
class UserInfoServiceSpec extends AnyFlatSpec {

  private val meetingId = "meeting-1"
  private val userId = "w_user1"

  private def infosFor(locked: Boolean, moderator: Boolean = false): UserInfosApiMsg =
    UserInfosApiMsg(Map(
      "meetingID" -> meetingId,
      "internalUserID" -> userId,
      "sessionToken" -> "token-1",
      "currentlyInMeeting" -> true,
      "moderator" -> moderator,
      "presenter" -> false,
      "isBreakout" -> false,
      "locked" -> locked
    ))

  it should "mark an unlocked viewer session as not locked" in {
    val vars = UserInfoService.generateResponseMap(infosFor(locked = false))
    assert(vars("X-Hasura-Role") == "bbb_client")
    assert(vars("X-Hasura-NotLockedInMeeting") == meetingId)
    assert(vars("X-Hasura-LockedUserId") == "")
  }

  it should "mark a locked viewer session with its own userId" in {
    val vars = UserInfoService.generateResponseMap(infosFor(locked = true))
    assert(vars("X-Hasura-NotLockedInMeeting") == "")
    assert(vars("X-Hasura-LockedUserId") == userId)
  }

  it should "keep the identity variables intact" in {
    val vars = UserInfoService.generateResponseMap(infosFor(locked = true, moderator = true))
    assert(vars("X-Hasura-UserId") == userId)
    assert(vars("X-Hasura-MeetingId") == meetingId)
    assert(vars("X-Hasura-SessionToken") == "token-1")
    assert(vars("X-Hasura-ModeratorInMeeting") == meetingId)
    assert(vars("X-Hasura-PresenterInMeeting") == "")
  }

  it should "not expose lock variables to a session that is not in the meeting" in {
    val infos = infosFor(locked = true)
    val vars = UserInfoService.generateResponseMap(UserInfosApiMsg(infos.infos + ("currentlyInMeeting" -> false)))
    assert(vars("X-Hasura-Role") == "bbb_client_not_in_meeting")
    assert(!vars.contains("X-Hasura-NotLockedInMeeting"))
    assert(!vars.contains("X-Hasura-LockedUserId"))
  }
}

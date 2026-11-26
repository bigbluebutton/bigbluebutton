package org.bigbluebutton.service

import org.apache.pekko.actor.{ActorRef, ActorSystem}
import org.apache.pekko.http.scaladsl.model.headers.RawHeader
import org.apache.pekko.http.scaladsl.model.{ContentTypes, HttpEntity, HttpResponse, StatusCode}
import org.apache.pekko.pattern.ask
import org.apache.pekko.pattern.AskTimeoutException
import org.apache.pekko.util.Timeout
import org.bigbluebutton.common2.util.JsonUtil
import org.bigbluebutton.core.api.{ApiResponse, ApiResponseFailure, GetUserApiMsg, UserInfosApiMsg}

import scala.concurrent.duration.DurationInt
import scala.concurrent.{ExecutionContextExecutor, Future}


object UserInfoService {
  def apply(system: ActorSystem, bbbActor: ActorRef) = new UserInfoService(system, bbbActor)

  def generateResponseMap(userInfos: UserInfosApiMsg): Map[String, Any] = {
    val infos = userInfos.infos
    val meetingID = infos.getOrElse("meetingID", "").toString
    val userId = infos.getOrElse("internalUserID", "").toString
    val sessionToken = infos.getOrElse("sessionToken", "").toString

    def conditionalValue(key: String, defaultValueTrue: String, defaultValueFalse: String): String = {
      infos.get(key) match {
        case Some(value: Boolean) if value => defaultValueTrue
        case _                             => defaultValueFalse
      }
    }

    if (conditionalValue("currentlyInMeeting", "true", "false") == "true") {
      Map(
        "response" -> "authorized",
        "X-Hasura-Role" -> "bbb_client",
        "X-Hasura-ModeratorInMeeting" -> conditionalValue("moderator", meetingID, ""),
        "X-Hasura-PresenterInMeeting" -> conditionalValue("presenter", meetingID, ""),
        "X-Hasura-UserId" -> userId,
        "X-Hasura-MeetingId" -> meetingID,
        "X-Hasura-SessionToken" -> sessionToken,
        "X-Hasura-IsBreakout" -> conditionalValue("isBreakout", "true", ""),
        // Lock settings are no longer baked into the session: the permission rules
        // read the current meeting_lockSettings row instead, so these two are the
        // only lock-related variables and both change exclusively through per-user
        // events (lock toggle, role change) that already refresh the session.
        "X-Hasura-NotLockedInMeeting" -> conditionalValue("locked", "", meetingID),
        "X-Hasura-LockedUserId" -> conditionalValue("locked", userId, "")
      )
    } else {
      Map(
        "response" -> "authorized",
        "X-Hasura-Role" -> "bbb_client_not_in_meeting",
        "X-Hasura-ModeratorInMeeting" -> conditionalValue("moderator", meetingID, ""),
        "X-Hasura-PresenterInMeeting" -> conditionalValue("presenter", meetingID, ""),
        "X-Hasura-UserId" -> userId,
        "X-Hasura-MeetingId" -> meetingID,
        "X-Hasura-SessionToken" -> sessionToken,
      )
    }
  }
}

class UserInfoService(system: ActorSystem, bbbActor: ActorRef) {
  implicit def executionContext: ExecutionContextExecutor = system.dispatcher
  implicit val timeout: Timeout = 5 seconds

  def getUserInfo(sessionToken: String): Future[ApiResponse] = {
    val future = bbbActor.ask(GetUserApiMsg(sessionToken)).mapTo[ApiResponse]

    future.recover {
      case e: AskTimeoutException => ApiResponseFailure("Request Timeout error", "request_timeout", Map())
    }
  }

  def createHttpResponse(status: StatusCode, response: Map[String, Any]): HttpResponse = {
    HttpResponse(
      status,
      headers = Seq(RawHeader("Cache-Control", "no-cache")),
      entity = HttpEntity(ContentTypes.`application/json`, JsonUtil.toJson(response))
    )
  }

}

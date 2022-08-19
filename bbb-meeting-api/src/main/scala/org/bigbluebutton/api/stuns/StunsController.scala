package org.bigbluebutton.api.stuns

import akka.http.scaladsl.model.headers.RawHeader
import akka.http.scaladsl.model.{ContentTypes, HttpEntity, HttpResponse, StatusCodes}
import akka.http.scaladsl.server.Directives.{complete, parameter, pathPrefix}
import akka.http.scaladsl.server.Route
import akka.http.scaladsl.server.Directives._
import com.softwaremill.session.SessionDirectives.requiredSession
import com.softwaremill.session.SessionOptions.{oneOff, usingCookies}
import org.bigbluebutton.api.ControllerStandard
import org.bigbluebutton.common2.api.{ApiResponseFailure, ApiResponseSuccess, UserInfosApiMsg}
import org.bigbluebutton.model.SessionTokenData
import org.bigbluebutton.service.MeetingService

import scala.concurrent.ExecutionContext.Implicits.global

case object StunsController extends ControllerStandard {
  val route: Route = (pathPrefix("stuns") & extractLog) { log =>
    log.info("stuns")

    requiredSession(oneOff, usingCookies) { userSession: Map[String, String] =>
      parameter("sessionToken".as[String]) { sessionToken =>
        log.debug("sessionToken: " + sessionToken)
        if (userSession.exists(tokens => tokens._1 == sessionToken)) {
          val userTokenData = gson.fromJson(userSession(sessionToken), classOf[SessionTokenData])

          val entityFuture = MeetingService.findUser(userTokenData.meetingId, userTokenData.userId).map {
            case ApiResponseSuccess(msg, userInfos: UserInfosApiMsg) =>
              val stunServers: List[Map[String, String]] = List(
                Map("url" -> "stun:stun.l.google.com:19302")
              )
              val turnServers: List[String] = List()
              val remoteIceCandidates: List[String] = List()

              val returnStuns: Map[String, Any] = Map(
                "stunServers" -> stunServers,
                "turnServers" -> turnServers,
                "remoteIceCandidates" -> remoteIceCandidates
              )

              HttpResponse(StatusCodes.OK,
                headers = Seq(RawHeader("Cache-Control", "no-cache")),
                entity = HttpEntity(
                  ContentTypes.`application/json`,
                  gson.toJson(returnStuns)
                )
              )
            case ApiResponseFailure(msg, arg) =>
              HttpResponse(StatusCodes.OK,
                headers = Seq(RawHeader("Cache-Control", "no-cache")),
                entity = HttpEntity(
                  ContentTypes.`application/json`,
                  gson.toJson(Map("response" -> Map("returncode" -> "ERROR", "message" -> msg)))
                )
              )
          }

          complete(entityFuture)
        } else {
          complete(
            HttpResponse(StatusCodes.OK,
              headers = Seq(RawHeader("Cache-Control", "no-cache")),
              entity = HttpEntity(
                ContentTypes.`application/json`,
                gson.toJson(Map("response" -> Map("returncode" -> "ERROR", "message" -> "Session invalid")))
              )
            )
          )
        }
      }
    }

  }

}

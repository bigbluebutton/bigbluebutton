package org.bigbluebutton.api.authorization

import akka.http.scaladsl.model.headers.RawHeader
import akka.http.scaladsl.model.{ContentTypes, HttpEntity, HttpResponse, StatusCodes}
import akka.http.scaladsl.server.Directives.{complete, headerValueByName, pathPrefix}
import akka.http.scaladsl.server.Route
import akka.http.scaladsl.server.Directives._
import com.softwaremill.session.SessionDirectives.requiredSession
import com.softwaremill.session.SessionOptions.{oneOff, usingCookies}
import org.bigbluebutton.api.ControllerStandard
import org.bigbluebutton.common2.api.{ApiResponseFailure, ApiResponseSuccess, UserInfosApiMsg}
import org.bigbluebutton.model.SessionTokenData
import org.bigbluebutton.service.MeetingService

import scala.concurrent.ExecutionContext.Implicits.global

case object ConnectionCheckAuthorizationController extends ControllerStandard {
  val route: Route = (pathPrefix("connection" / "checkAuthorization") & extractLog) { log =>
    log.info("api/connection/checkAuthorization")

    headerValueByName("x-original-URI") { originalUri =>
      log.debug(s"The Original URI is $originalUri")

      val sessionToken = originalUri match {
        case s"${x}?sessionToken=${sessionToken}" => sessionToken
        case _ => ""
      }

      requiredSession(oneOff, usingCookies) { userSession: Map[String, String] =>
        log.debug("sessionToken: " + sessionToken)

        if (userSession.exists(tokens => tokens._1 == sessionToken)) {
          val userTokenData = gson.fromJson(userSession(sessionToken), classOf[SessionTokenData])

          val entityFuture = MeetingService.findUser(userTokenData.meetingId, userTokenData.userId).map {
            case ApiResponseSuccess(msg, userInfos: UserInfosApiMsg) =>
              HttpResponse(StatusCodes.OK,
                headers = Seq(
                  RawHeader("User-Id", userInfos.infos.get("internalUserID").getOrElse("").toString),
                  RawHeader("Meeting-Id", userInfos.infos.get("meetingID").getOrElse("").toString),
                  RawHeader("Voice-Bridge", userInfos.infos.get("voicebridge").getOrElse("").toString),
                  RawHeader("User-Name", userInfos.infos.get("fullname").getOrElse("").toString)
                ),
                entity = HttpEntity(ContentTypes.`text/plain(UTF-8)`, "authorized")
              )
            case ApiResponseFailure(msg, arg) =>
              HttpResponse(StatusCodes.Unauthorized,
                entity = HttpEntity(ContentTypes.`text/plain(UTF-8)`, "unauthorized")
              )
          }
          complete(entityFuture)
        } else {
          complete(
            HttpResponse(StatusCodes.Unauthorized,
              entity = HttpEntity(ContentTypes.`text/plain(UTF-8)`, "unauthorized")
            )
          )
        }
      }
    }

  }

}

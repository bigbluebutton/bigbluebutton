package org.bigbluebutton.api.enter

import akka.http.scaladsl.model.headers.RawHeader
import akka.http.scaladsl.model.{ContentTypes, HttpEntity, HttpResponse, StatusCodes}
import akka.http.scaladsl.server.Directives.{complete, get, parameter, pathPrefix}
import akka.http.scaladsl.server.Route
import akka.http.scaladsl.server.Directives._
import com.softwaremill.session.SessionDirectives.requiredSession
import com.softwaremill.session.SessionOptions.{oneOff, usingCookies}
import org.bigbluebutton.api.ControllerStandard
import org.bigbluebutton.common2.api.{ApiResponseFailure, ApiResponseSuccess, UserInfosApiMsg}
import org.bigbluebutton.model.SessionTokenData
import org.bigbluebutton.service.MeetingService

import scala.concurrent.ExecutionContext.Implicits.global

case object EnterController extends ControllerStandard {
  val route: Route = (pathPrefix("enter") & extractLog) { log =>
    log.info("enter")

    get {
      requiredSession(oneOff, usingCookies) { userSession: Map[String, String] =>
        log.debug("userSession: " + userSession.toString)
        parameter("sessionToken".as[String]) { (sessionToken) =>
          log.debug("sessionToken: " + sessionToken)
          if (userSession.exists(tokens => tokens._1 == sessionToken)) {

            val userTokenData = gson.fromJson(userSession(sessionToken), classOf[SessionTokenData])

            val entityFuture = MeetingService.findUser(userTokenData.meetingId, userTokenData.userId).map {
              case ApiResponseSuccess(msg, userInfos: UserInfosApiMsg) =>

                val responseMap: Map[String, Any] = Map(
                  "returncode" -> "SUCCESS",
//                  "message" -> msg
                ) ++ userInfos.infos.map(curr => {
                  (curr._1 -> curr._2)
                })

                HttpResponse(StatusCodes.OK,
                  headers = Seq(RawHeader("Cache-Control", "no-cache")),
                  entity = HttpEntity(
                    ContentTypes.`application/json`,
                    respAsJson(Map("response" -> responseMap))
                  )
                )
              case ApiResponseFailure(msg, arg) =>
                HttpResponse(StatusCodes.OK,
                  headers = Seq(RawHeader("Cache-Control", "no-cache")),
                  entity = HttpEntity(
                    ContentTypes.`application/json`,
                    respAsJson(Map("response" -> Map("returncode" -> "ERROR", "message" -> msg)))
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
                  respAsJson(Map("response" -> Map("returncode" -> "ERROR", "message" -> "Session invalid")))
                )
              )
            )
          }
        }
      }
    }
  }
}

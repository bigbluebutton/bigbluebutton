package org.bigbluebutton.api.join

import akka.http.scaladsl.model.headers.RawHeader
import akka.http.scaladsl.model._
import akka.http.scaladsl.server.Directives.{complete, get, parameter, parameterMap, pathPrefix}
import akka.http.scaladsl.server.Route
import akka.http.scaladsl.server.Directives._
import com.softwaremill.session.CsrfDirectives.setNewCsrfToken
import com.softwaremill.session.CsrfOptions.checkHeader
import com.softwaremill.session.SessionDirectives.{optionalSession, setSession}
import com.softwaremill.session.SessionOptions.{oneOff, usingCookies}
import org.apache.commons.lang3.RandomStringUtils
import org.bigbluebutton.api.ControllerStandard
import org.bigbluebutton.common2.api.{ApiResponseFailure, ApiResponseSuccess}
import org.bigbluebutton.model.{ApiResponseStandard, SessionTokenData}
import org.bigbluebutton.service.{MeetingService, ParamsUtils}

import scala.concurrent.ExecutionContext.Implicits.global

case object JoinController extends ControllerStandard {
  val route: Route = (pathPrefix("join") & extractLog) { log =>
    log.info("join")

    get {
      parameter(
        "fullName".as[String],
        "meetingID".as[String],
        "password".as[String].optional,
        "redirect".as[String].optional,
        "checksum".as[String],
      ) { (
            fullName,
            meetingID,
            password,
            redirectFlag,
            checksum,
          ) =>
        println("fullName: " + fullName)
        println("meetingID: " + meetingID)
        println("password: " + password)
        println("redirect: " + redirectFlag)
        println("checksum: " + checksum)

        val sessionToken = RandomStringUtils.randomAlphanumeric(12).toLowerCase

        log.info(sessionToken)

        parameterMap { params =>
          log.debug(params.toString)
          try {

            optionalSession(oneOff, usingCookies) {
              currSession => {
                log.info(s"Current session $currSession")
                val userSession = currSession.getOrElse(Map[String, String]())

                val regUser = JoinService.createRegisterUser(meetingID, params)
                val newJsonTokenData = SessionTokenData(regUser.meetingId, regUser.intUserId).toJson

                val futureEntity = MeetingService.registerUser(regUser).map {
                  case ApiResponseSuccess(msg, arg) =>
                    //                    if(redirectFlag.getOrElse("true") == "true") {
                    if (true) {
                      val defaultHTML5ClientUrl = ParamsUtils().getConfigAsString("defaultHTML5ClientUrl")
                      //                      val defaultHTML5ClientUrl = "http://127.0.0.1:8080/api/enter"
                      val destUrl = defaultHTML5ClientUrl + "?sessionToken=" + sessionToken
                      log.info(s"Redirecting to ${destUrl}")
                      HttpResponse(
                        status = StatusCodes.PermanentRedirect,
                        headers = headers.Location(destUrl) :: Nil,
                        entity = HttpEntity.Empty)
                    } else {
                      println("NAO VAI REDIRECIONAR AGORA")
                      HttpResponse(StatusCodes.OK,
                        headers = Seq(RawHeader("Cache-Control", "no-cache")),
                        entity = HttpEntity(
                          MediaTypes.`application/xml`.withCharset(HttpCharsets.`UTF-8`),
                          ApiResponseStandard.SuccessResponse("", msg).toXml.toString //TODO
                        )
                      )
                    }
                  case ApiResponseFailure(msg, arg) =>
                    HttpResponse(StatusCodes.OK,
                      headers = Seq(RawHeader("Cache-Control", "no-cache")),
                      entity = HttpEntity(
                        MediaTypes.`application/xml`.withCharset(HttpCharsets.`UTF-8`),
                        ApiResponseStandard.FailedResponse("", msg).toXml.toString
                      )
                    )
                }

                setSession(oneOff, usingCookies, userSession + (sessionToken -> newJsonTokenData)) {
                  setNewCsrfToken(checkHeader) { ctx =>
                    log.info(s"SessionToken set successfully: $sessionToken")
                    ctx.complete(futureEntity)
                  }
                }
              }
            }

          } catch {
            case e: Exception =>
              complete(
                HttpResponse(StatusCodes.OK,
                  headers = Seq(RawHeader("Cache-Control", "no-cache")),
                  entity = HttpEntity(
                    MediaTypes.`application/xml`.withCharset(HttpCharsets.`UTF-8`),
                    ApiResponseStandard.FailedResponse("", s"Error while joining the meeting, ${e.getClass}, ${e.getMessage}").toXml.toString
                  )
                )
              )
          }
        }
      }
    }

  }


}

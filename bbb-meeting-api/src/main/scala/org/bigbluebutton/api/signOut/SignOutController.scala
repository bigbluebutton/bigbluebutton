package org.bigbluebutton.api.signOut

import akka.http.scaladsl.model.headers.RawHeader
import akka.http.scaladsl.model._
import akka.http.scaladsl.server.Directives.{complete, get, parameter, pathPrefix}
import akka.http.scaladsl.server.Route
import akka.http.scaladsl.server.Directives._
import com.softwaremill.session.CsrfDirectives.setNewCsrfToken
import com.softwaremill.session.CsrfOptions.checkHeader
import com.softwaremill.session.SessionDirectives.{optionalSession, setSession}
import com.softwaremill.session.SessionOptions.{oneOff, usingCookies}
import org.bigbluebutton.api.ControllerStandard
import org.bigbluebutton.model.ApiResponseStandard

case object SignOutController extends ControllerStandard {
  val route: Route = (pathPrefix("signOut") & extractLog) { log =>
    log.info("signOut")
    get {
      parameter(
        "sessionToken".as[String],
        "checksum".as[String],
      ) { (
            sessionToken,
            checksum,
          ) =>

        val httpDefaultResponse = HttpResponse(StatusCodes.OK,
          headers = Seq(RawHeader("Cache-Control", "no-cache")),
          entity = HttpEntity(MediaTypes.`application/xml`.withCharset(HttpCharsets.`UTF-8`), ApiResponseStandard.SuccessResponse("", "").toXml.toString)
        )

        optionalSession(oneOff, usingCookies) {
          currSession => {
            log.info(s"Current session $currSession")
            currSession match {
              case Some(currUserSession: Map[String, String]) =>
                setSession(oneOff, usingCookies, currUserSession.-(sessionToken)) {
                  setNewCsrfToken(checkHeader) { ctx =>
                    log.info(s"Session removed successfully: $sessionToken")
                    ctx.complete(httpDefaultResponse)
                  }
                }
              case None =>
                log.info(s"Session not found")
                complete(httpDefaultResponse)
            }
          }
        }
      }
    }

  }

}

package org.bigbluebutton.controller

import akka.http.scaladsl.model.headers.RawHeader
import akka.http.scaladsl.model.{ContentTypes, HttpCharsets, HttpEntity, HttpResponse, MediaTypes, StatusCodes}
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.{Route, StandardRoute}
import com.typesafe.config.ConfigFactory
import org.bigbluebutton.model.{ApiResponseFailure, ApiResponseSuccess, CreateResponse, Greeting}
import org.bigbluebutton.service.{CreateService, English, French, MeetingService, Spanish}
import scala.concurrent._
import ExecutionContext.Implicits.global

case object Create {

  def htmlTextResponse(greeting: Greeting): StandardRoute =
    complete(HttpEntity(ContentTypes.`text/html(UTF-8)`, s"<h1>${greeting.toString}</h1>"))

  def jsonResponse(greeting: Greeting): StandardRoute =
    complete(HttpEntity(ContentTypes.`application/json`, greeting.toJson.toString()))

  val route: Route = (pathPrefix("create") & extractLog) { log =>
    log.info("create")

    get {
      parameter(
        "name".as[String],
        "meetingID".as[String],
        "checksum".as[String],
        "attendeePW".as[String].optional,
        "moderatorPW".as[String].optional,
      ) { (
            name,
            meetingID,
            checksum,
            attendeePW,
            moderatorPW,
          ) =>

        if (!attendeePW.isDefined) log.info("No attendeePW provided")
        if (!moderatorPW.isDefined) log.info("No moderatorPW provided")

        log.info(s"attendeePW [${attendeePW.getOrElse("")}]")
        log.info(s"moderatorPW [${moderatorPW.getOrElse("")}]")

        val html5InstanceId = 1

        parameterMap { params =>
          log.info(params.toString)

          val config = ConfigFactory.load("bigbluebutton.properties")

          val defaultprops = CreateService.createDefaultProp(meetingID, params, config)


          val meetingService = MeetingService


          val entityFuture = meetingService.createMeeting(defaultprops).map {
            case ApiResponseSuccess(msg, arg) =>
              HttpResponse(StatusCodes.OK,
                headers = Seq(RawHeader("Cache-Control", "no-cache")),
                entity = HttpEntity(
                  MediaTypes.`application/xml`.withCharset(HttpCharsets.`UTF-8`),
                  CreateResponse.SuccessWithMeetingInfoResponse(msg,defaultprops).toXml.toString
                )
              )
            case ApiResponseFailure(msg, arg) =>
              HttpResponse(StatusCodes.OK,
                headers = Seq(RawHeader("Cache-Control", "no-cache")),
                entity = HttpEntity(
                  MediaTypes.`application/xml`.withCharset(HttpCharsets.`UTF-8`),
                  CreateResponse.FailedResponse("",msg).toXml.toString
                )
              )
            case _ =>
              HttpResponse(StatusCodes.OK,
                headers = Seq(RawHeader("Cache-Control", "no-cache")),
                entity = HttpEntity(
                  MediaTypes.`application/xml`.withCharset(HttpCharsets.`UTF-8`),
                  CreateResponse.FailedResponse("","Error while creating meeting").toXml.toString
                )
              )
          }

          complete(entityFuture)
        }
      }
    }
//
//    defaultResponsePathEnd() ~
//    htmlRoute ~
//    jsonRoute
  }

  val jsonRoute: Route = pathPrefix("json") {
    defaultResponsePathEnd() ~
    langRoute(jsonResponse)
  }


  val htmlRoute: Route = pathPrefix("html") {
    defaultResponsePathEnd(htmlTextResponse) ~
    langRoute(htmlTextResponse)
  }

  def defaultResponsePathEnd(generateResponse: Greeting => StandardRoute = jsonResponse): Route = pathEnd {
    generateResponse(English.getGreetings)
  }

  def langRoute(generateResponse: Greeting => StandardRoute): Route = pathPrefix("lang") {
    extractUnmatchedPath {
      lang => lang.toString match {
        case en if en contains "en" => generateResponse(English.getGreetings)
        case es if es contains "es" => generateResponse(Spanish.getGreetings)
        case fr if fr contains "fr" => generateResponse(French.getGreetings)
        case _ => generateResponse(English.getGreetings)
      }
    }
  }

}

package org.bigbluebutton.api.create

import akka.http.scaladsl.model.headers.RawHeader
import akka.http.scaladsl.model._
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import com.typesafe.config.ConfigFactory
import org.bigbluebutton.api.ControllerStandard
import org.bigbluebutton.common2.api.{ApiResponseFailure, ApiResponseSuccess}
import org.bigbluebutton.service.MeetingService

import scala.concurrent.ExecutionContext.Implicits.global

case object CreateController extends ControllerStandard {
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


          //          remoteSelection ! "sendBla"

          //          implicit val actorSystem: ActorSystem = ActorSystem()
          //          val meetingActorRef = actorSystem.actorOf(AkkaRemoteActor.props())
          val meetingService = new MeetingService()
          //          val meetingService = MeetingService

          meetingService.test().map {
            case m: String => println(s"ele respondeu com $m")
          }


          val entityFuture = meetingService.createMeeting(defaultprops).map {
            case ApiResponseSuccess(msg, arg) =>
              HttpResponse(StatusCodes.OK,
                headers = Seq(RawHeader("Cache-Control", "no-cache")),
                entity = HttpEntity(
                  MediaTypes.`application/xml`.withCharset(HttpCharsets.`UTF-8`),
                  CreateResponse.SuccessWithMeetingInfoResponse(msg, defaultprops).toXml.toString
                )
              )
            case ApiResponseFailure(msg, arg) =>
              HttpResponse(StatusCodes.OK,
                headers = Seq(RawHeader("Cache-Control", "no-cache")),
                entity = HttpEntity(
                  MediaTypes.`application/xml`.withCharset(HttpCharsets.`UTF-8`),
                  CreateResponse.FailedResponse("", msg).toXml.toString
                )
              )
            case _ =>
              HttpResponse(StatusCodes.OK,
                headers = Seq(RawHeader("Cache-Control", "no-cache")),
                entity = HttpEntity(
                  MediaTypes.`application/xml`.withCharset(HttpCharsets.`UTF-8`),
                  CreateResponse.FailedResponse("", "Error while creating meeting").toXml.toString
                )
              )
          }

          complete(entityFuture)
        }
      }
    }
  }
}

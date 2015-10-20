package org.bigbluebutton.endpoint.http

import akka.http.scaladsl.Http
import akka.stream.{ ActorMaterializer, Materializer }
import akka.actor.{ ActorSystem, Props }
import akka.http.scaladsl.client.RequestBuilding
import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport._
import akka.http.scaladsl.marshalling.ToResponseMarshallable
import akka.http.scaladsl.model.{ HttpResponse, HttpRequest }
import akka.http.scaladsl.model.StatusCodes._
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.unmarshalling.Unmarshal
import akka.event.{ LoggingAdapter, Logging }
import akka.stream.scaladsl.{ Flow, Sink, Source }
import com.typesafe.config.Config
import com.typesafe.config.ConfigFactory
import java.io.IOException
import scala.concurrent.{ ExecutionContextExecutor, Future }
import scala.math._
import spray.json.DefaultJsonProtocol
import org.bigbluebutton.SystemConfiguration

case class BreakoutRoomUser(id: String, name: String)
case class BreakoutRoom(name: String, users: Vector[BreakoutRoomUser])
case class CreateBreakoutRoomsRequest(meetingId: String, room: BreakoutRoom)
case class EndBreakoutRoomRequest(meetingId: String)

trait Protocols extends DefaultJsonProtocol {
  implicit val breakoutRoomUserFormat = jsonFormat2(BreakoutRoomUser.apply)
}

trait Service extends Protocols with SystemConfiguration {
  implicit val system: ActorSystem
  implicit def executor: ExecutionContextExecutor
  implicit val materializer: Materializer

  val logger: LoggingAdapter

  lazy val bbbWebConnectionFlow: Flow[HttpRequest, HttpResponse, Any] =
    Http().outgoingConnection(bbbWebHost, bbbWebPort)

  def bbbWebRequest(request: HttpRequest): Future[HttpResponse] = Source.single(request).via(bbbWebConnectionFlow).runWith(Sink.head)

  def fetchIpInfo(ip: String): Future[Either[String, BreakoutRoomUser]] = {
    bbbWebRequest(RequestBuilding.Get(s"/geoip/$ip")).flatMap { response =>
      response.status match {
        case OK => Unmarshal(response.entity).to[BreakoutRoomUser].map(Right(_))
        case BadRequest => Future.successful(Left(s"$ip: incorrect IP format"))
        case _ => Unmarshal(response.entity).to[String].flatMap { entity =>
          val error = s"Telize request failed with status code ${response.status} and entity $entity"
          logger.error(error)
          Future.failed(new IOException(error))
        }
      }
    }
  }
}
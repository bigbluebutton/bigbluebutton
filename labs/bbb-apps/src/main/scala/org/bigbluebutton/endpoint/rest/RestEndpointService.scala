package org.bigbluebutton.endpoint.rest

import akka.actor.{Actor, Props, ActorRef, ActorLogging}
import akka.event.LoggingAdapter
import akka.pattern.{ask, pipe}
import akka.util.Timeout
import scala.concurrent.duration._
import scala.util.{Success, Failure}
import spray.json.{JsObject, JsValue, JsString, DefaultJsonProtocol}
import spray.httpx.SprayJsonSupport
import spray.routing._
import spray.http._
import MediaTypes._
import spray.routing.directives.BasicDirectives._
import spray.routing.Directive.pimpApply
import shapeless._
import org.bigbluebutton.endpoint.CreateMeetingRequestFormat
import scala.util.Success
import org.bigbluebutton.endpoint.RegisterUserRequestFormat

class RestEndpointServiceActor(val msgReceiver: ActorRef) extends Actor 
         with RestEndpointService with ActorLogging {

  def actorRefFactory = context

  def receive = runRoute(restApiRoute)
}


trait RestEndpointService extends HttpService with MeetingMessageHandler {
  this: RestEndpointServiceActor =>
    
  import org.bigbluebutton.apps.protocol.HeaderAndPayloadJsonSupport._
  import org.bigbluebutton.endpoint.UserMessagesProtocol._
  
  val msgReceiver: ActorRef
  implicit def executionContext = actorRefFactory.dispatcher
  implicit val timeout = Timeout(5 seconds)
  
  val supportedContentTypes = List[ContentType](`application/json`, `text/plain`)
  
  val restApiRoute =
    path("") {
      get {
        respondWithMediaType(`text/html`) { 
          complete {
            <html>
              <body>
                <h1>Welcome to BigBlueButton!</h1>
              </body>
            </html>
          }
        }
      }
    } ~
    path("meeting") {
      post {
        respondWithMediaType(`application/json`) {
	        entity(as[CreateMeetingRequestFormat]) { message => 
              val response = sendCreateMeetingMessage(message)
              complete(response)
	        }
        }
      }
    } ~
    path("user") {
      post {
        respondWithMediaType(`application/json`) {
	        entity(as[RegisterUserRequestFormat]) { message => 
              val response = sendRegisterUserRequestMessage(message)
              complete(response)
	        }
        }
      }
    }        

  
}



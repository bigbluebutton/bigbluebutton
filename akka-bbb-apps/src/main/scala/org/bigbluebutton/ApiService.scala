package org.bigbluebutton

import akka.http.scaladsl.model._
import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport
import akka.http.scaladsl.model.headers.RawHeader
import akka.http.scaladsl.server.Directives.{complete, _}
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.service.{HealthzService, MeetingInfoService, MeetingService, PubSubReceiveStatus, PubSubSendStatus, RecordingDBSendStatus}
import spray.json._

import scala.concurrent._
import ExecutionContext.Implicits.global
import api.meeting.{GenericResponse, ParamsUtils, SessionTokenData}
import api.meeting.create.{Create, CreateResponse}
import com.typesafe.config.ConfigFactory
import org.apache.commons.lang3.RandomStringUtils
import org.bigbluebutton.api.meeting.join.Join
import org.bigbluebutton.core.api.{ApiResponseFailure, ApiResponseSuccess, UserInfosApiMsg}
import com.softwaremill.session.CsrfDirectives._
import com.softwaremill.session.CsrfOptions._
import com.softwaremill.session.SessionDirectives._
import com.softwaremill.session.SessionOptions._
import com.softwaremill.session._
import com.google.gson.Gson

case class HealthResponse(
    isHealthy:           Boolean,
    pubsubSendStatus:    PubSubSendStatus,
    pubsubReceiveStatus: PubSubReceiveStatus,
    recordingDbStatus:   RecordingDBSendStatus
)

case class MeetingInfoResponse(
    meetingInfoResponse: Option[MeetingInfoAnalytics]
)

case class MeetingInfoAnalytics(
    name:              String,
    externalId:        String,
    internalId:        String,
    hasUserJoined:     Boolean,
    isMeetingRecorded: Boolean,
    webcams:           Webcam,
    audio:             Audio,
    screenshare:       Screenshare,
    users:             List[Participant],
    presentation:      PresentationInfo,
    breakoutRoom:      BreakoutRoom
)

trait JsonSupportProtocolHealthResponse extends SprayJsonSupport with DefaultJsonProtocol {
  implicit val pubSubSendStatusJsonFormat = jsonFormat2(PubSubSendStatus)
  implicit val pubSubReceiveStatusJsonFormat = jsonFormat2(PubSubReceiveStatus)
  implicit val recordingDbStatusJsonFormat = jsonFormat2(RecordingDBSendStatus)
  implicit val healthServiceJsonFormat = jsonFormat4(HealthResponse)
}

trait JsonSupportProtocolMeetingInfoResponse extends SprayJsonSupport with DefaultJsonProtocol {
  implicit val meetingInfoUserJsonFormat = jsonFormat2(User)
  implicit val meetingInfoBroadcastJsonFormat = jsonFormat3(Broadcast)
  implicit val meetingInfoWebcamStreamJsonFormat = jsonFormat2(WebcamStream)
  implicit val meetingInfoWebcamJsonFormat = jsonFormat2(Webcam)

  implicit val meetingInfoListenOnlyAudioJsonFormat = jsonFormat2(ListenOnlyAudio)
  implicit val meetingInfoTwoWayAudioJsonFormat = jsonFormat2(TwoWayAudio)
  implicit val meetingInfoPhoneAudioJsonFormat = jsonFormat2(PhoneAudio)
  implicit val meetingInfoAudioJsonFormat = jsonFormat4(Audio)

  implicit val meetingInfoScreenshareStreamJsonFormat = jsonFormat2(ScreenshareStream)
  implicit val meetingInfoScreenshareJsonFormat = jsonFormat1(Screenshare)

  implicit val meetingInfoPresentationInfoJsonFormat = jsonFormat2(PresentationInfo)
  implicit val meetingInfoBreakoutRoomJsonFormat = jsonFormat2(BreakoutRoom)

  implicit val meetingInfoParticipantJsonFormat = jsonFormat3(Participant)
  implicit val meetingInfoAnalyticsJsonFormat = jsonFormat11(MeetingInfoAnalytics)
  implicit val meetingInfoResponseJsonFormat = jsonFormat1(MeetingInfoResponse)
}

class ApiService(healthz: HealthzService, meetingInfoz: MeetingInfoService, meetingService: MeetingService)
  extends JsonSupportProtocolHealthResponse
  with JsonSupportProtocolMeetingInfoResponse {

  val sessionConfig = SessionConfig.default("YzszrU1UkqsMqCNEnuLI8DDWs6Wqacj2z4dbtquSjB8GbsFpBA7GG38yk0DaIyrB")
  implicit val sessionManager = new SessionManager[Map[String,String]](sessionConfig)
  implicit val refreshTokenStorage = new InMemoryRefreshTokenStorage[Map[String,String]] {
    def log(msg: String) = println(s"Logger: $msg")
  }

  implicit object AnyJsonFormat extends JsonFormat[Any] {
    def write(x: Any) = x match {
      case n: Int => JsNumber(n)
      case s: String => JsString(s)
      case b: Boolean if b == true => JsTrue
      case b: Boolean if b == false => JsFalse
      case l: List[Any] => JsArray(l.toVector.map(v => write(v)))
      case m: Map[String, Any] => JsObject(m.map { case (k, v) => (k, write(v)) })
      case x => JsString(x.getClass.getName) // serializationError("Do not understand object of type " + x.getClass.getName)
    }

    def read(value: JsValue) = value match {
      case JsNumber(n) => n.intValue
      case JsString(s) => s
      case JsTrue => true
      case JsFalse => false
      case JsArray(xs: Vector[JsValue]) => xs.toList.map { x => read(x) }
      case JsObject(fields: Map[String, JsValue]) => fields.map { case (k, jsv) => (k, read(jsv)) }
      case x => x.toString // deserializationError("Do not understand how to deserialize " + x)
      //                              case
    }
  }

  val gson = new Gson

  def routes =
    (path("api" / "create") & extractLog) { log =>
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

            val defaultprops = Create.createDefaultProp(meetingID, params, config)

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
    } ~ (path("api" / "end") & extractLog) { log =>
      log.info("end")

      get {
        parameter(
          "meetingID".as[String],
          "checksum".as[String],
        ) { (
                               meetingID,
                               checksum,
                             ) =>

          val entityFuture = meetingService.endMeeting(meetingID).map {
              case ApiResponseSuccess(msg, arg) =>
                HttpResponse(StatusCodes.OK,
                  headers = Seq(RawHeader("Cache-Control", "no-cache")),
                  entity = HttpEntity(
                    MediaTypes.`application/xml`.withCharset(HttpCharsets.`UTF-8`),
                    GenericResponse.SuccessResponse(
                      "sentEndMeetingRequest",
                      "A request to end the meeting was sent.  Please wait a few seconds, and then use the getMeetingInfo or isMeetingRunning API calls to verify that it was ended.").toXml.toString
                  )
                )

              case ApiResponseFailure(msg, arg) =>
                HttpResponse(StatusCodes.OK,
                  headers = Seq(RawHeader("Cache-Control", "no-cache")),
                  entity = HttpEntity(
                    MediaTypes.`application/xml`.withCharset(HttpCharsets.`UTF-8`),
                    GenericResponse.FailedResponse("",msg).toXml.toString
                  )
                )
              case _ =>
                HttpResponse(StatusCodes.OK,
                  headers = Seq(RawHeader("Cache-Control", "no-cache")),
                  entity = HttpEntity(
                    MediaTypes.`application/xml`.withCharset(HttpCharsets.`UTF-8`),
                    GenericResponse.FailedResponse("","Error while ending meeting").toXml.toString
                  )
                )
          }

          complete(entityFuture)
        }
      }
    } ~ (path("api" / "join") & extractLog) { log =>
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

          parameterMap { params =>
            log.debug(params.toString)
            try {

              optionalSession(oneOff, usingCookies) {
                currSession => {
                  log.info(s"Current session $currSession")
                  val userSession = currSession.getOrElse(Map[String,String]())

                  val regUser = Join.createRegisterUser(meetingID,params)
                  val newJsonTokenData = SessionTokenData(regUser.meetingId, regUser.intUserId).toJson

                  val futureEntity = meetingService.registerUser(regUser).map {
                    case ApiResponseSuccess(msg, arg) =>
                      if(redirectFlag.getOrElse("true") == "true") {
                        val defaultHTML5ClientUrl = ParamsUtils().getConfigAsString("defaultHTML5ClientUrl")
                        val destUrl = defaultHTML5ClientUrl + "?sessionToken=" + sessionToken
                        log.info(s"Redirecting to ${destUrl}")
                        HttpResponse(
                          status = StatusCodes.PermanentRedirect,
                          headers = headers.Location(destUrl) :: Nil,
                          entity = HttpEntity.Empty)
                      } else {
                        HttpResponse(StatusCodes.OK,
                          headers = Seq(RawHeader("Cache-Control", "no-cache")),
                          entity = HttpEntity(
                            MediaTypes.`application/xml`.withCharset(HttpCharsets.`UTF-8`),
                            GenericResponse.SuccessResponse("",msg).toXml.toString //TODO
                          )
                        )
                      }
                    case ApiResponseFailure(msg, arg) =>
                      HttpResponse(StatusCodes.OK,
                        headers = Seq(RawHeader("Cache-Control", "no-cache")),
                        entity = HttpEntity(
                          MediaTypes.`application/xml`.withCharset(HttpCharsets.`UTF-8`),
                          GenericResponse.FailedResponse("",msg).toXml.toString
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
                      GenericResponse.FailedResponse("", s"Error while joining the meeting, ${e.getClass}, ${e.getMessage}").toXml.toString
                    )
                  )
                )
            }
          }
        }
      }

    } ~ (path("api" / "enter") & extractLog) { log =>
        get {
          log.info("enter")

          requiredSession(oneOff, usingCookies) { userSession: Map[String, String] =>
            parameter("sessionToken".as[String]) { (sessionToken) =>
              log.debug("sessionToken: " + sessionToken)
              if(userSession.exists(tokens => tokens._1 == sessionToken)) {
                val userTokenData = gson.fromJson(userSession(sessionToken), classOf[SessionTokenData])

                val entityFuture = meetingService.findUser(userTokenData.meetingId, userTokenData.userId).map {
                  case ApiResponseSuccess(msg, userInfos: UserInfosApiMsg) =>
                    HttpResponse(StatusCodes.OK,
                      headers = Seq(RawHeader("Cache-Control", "no-cache")),
                      entity = HttpEntity(
                        ContentTypes.`application/json`,
                        Map("response" -> Map("returncode" -> "SUCCESS", "message" -> msg)).toJson.prettyPrint
                      )
                    )
                  case ApiResponseFailure(msg, arg) =>
                    HttpResponse(StatusCodes.OK,
                      headers = Seq(RawHeader("Cache-Control", "no-cache")),
                      entity = HttpEntity(
                        ContentTypes.`application/json`,
                        Map("response" -> Map("returncode" -> "ERROR", "message" -> msg)).toJson.prettyPrint
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
                      Map("response" -> Map("returncode" -> "ERROR", "message" -> "Session invalid")).toJson.prettyPrint
                    )
                  )
                )
              }
            }
          }
        }
    } ~ (path("api" / "signOut") & extractLog) { log =>
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
            entity = HttpEntity(MediaTypes.`application/xml`.withCharset(HttpCharsets.`UTF-8`),GenericResponse.SuccessResponse("","").toXml.toString)
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
    } ~ (path("api" / "stuns") & extractLog) { log =>
      log.info("stuns")

      requiredSession(oneOff, usingCookies) { userSession: Map[String, String] =>
        parameter("sessionToken".as[String]) { sessionToken =>
          log.debug("sessionToken: " + sessionToken)
            if (userSession.exists(tokens => tokens._1 == sessionToken)) {
              val userTokenData = gson.fromJson(userSession(sessionToken), classOf[SessionTokenData])

              val entityFuture = meetingService.findUser(userTokenData.meetingId, userTokenData.userId).map {
                case ApiResponseSuccess(msg, userInfos: UserInfosApiMsg) =>
                  val stunServers: List[Map[String,String]] = List(
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
                      returnStuns.toJson.prettyPrint
                    )
                  )
                case ApiResponseFailure(msg, arg) =>
                  HttpResponse(StatusCodes.OK,
                    headers = Seq(RawHeader("Cache-Control", "no-cache")),
                    entity = HttpEntity(
                      ContentTypes.`application/json`,
                      Map("response" -> Map("returncode" -> "ERROR", "message" -> msg)).toJson.prettyPrint
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
                    Map("response" -> Map("returncode" -> "ERROR", "message" -> "Session invalid")).toJson.prettyPrint
                  )
                )
              )
          }
        }
      }
    } ~ (path("api" / "connection" / "checkAuthorization") & extractLog) { log =>
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

            val entityFuture = meetingService.findUser(userTokenData.meetingId, userTokenData.userId).map {
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
    } ~ path("healthz") {
      get {
        val future = healthz.getHealthz()
        onSuccess(future) {
          case response =>
            if (response.isHealthy) {
              complete(
                StatusCodes.OK,
                HealthResponse(
                  response.isHealthy,
                  response.pubSubSendStatus,
                  response.pubSubReceiveStatus,
                  response.recordingDBSendStatus
                )
              )
            } else {
              complete(
                StatusCodes.ServiceUnavailable,
                HealthResponse(
                  response.isHealthy,
                  response.pubSubSendStatus,
                  response.pubSubReceiveStatus,
                  response.recordingDBSendStatus
                )
              )
            }
        }
      }
    } ~
      path("analytics") {
        parameter('meetingId.as[String]) { meetingId =>
          get {
            val meetingAnalyticsFuture = meetingInfoz.getAnalytics(meetingId)
            val entityFuture = meetingAnalyticsFuture.map { resp =>
              resp.optionMeetingInfoAnalytics match {
                case Some(_) =>
                  HttpEntity(ContentTypes.`application/json`, resp.optionMeetingInfoAnalytics.get.toJson.prettyPrint)
                case None =>
                  HttpEntity(ContentTypes.`application/json`, s"""{ "message": "No active meeting with ID $meetingId"}""".parseJson.prettyPrint)
              }
            }
            complete(entityFuture)
          }
        } ~
          get {
            val future = meetingInfoz.getAnalytics()
            val entityFuture = future.map { res =>
              res.optionMeetingsInfoAnalytics match {
                case Some(_) =>
                  HttpEntity(ContentTypes.`application/json`, res.optionMeetingsInfoAnalytics.get.toJson.prettyPrint)
                case None =>
                  HttpEntity(ContentTypes.`application/json`, """{ "message": "No active meetings"}""".parseJson.prettyPrint)
              }
            }
            complete(entityFuture)
          }
      }
}

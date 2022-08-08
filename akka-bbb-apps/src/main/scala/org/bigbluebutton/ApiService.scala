package org.bigbluebutton

import akka.http.scaladsl.model._
import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport
import akka.http.scaladsl.model.headers.RawHeader
import akka.http.scaladsl.server.Directives.{complete, _}
import akka.pattern.AskTimeoutException
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.service.{HealthzService, MeetingInfoService, MeetingService, PubSubReceiveStatus, PubSubSendStatus, RecordingDBSendStatus}
import spray.json._

import scala.concurrent._
import ExecutionContext.Implicits.global
import api.meeting.{MsgBuilder, ParamsUtils, UserSession}
import api.meeting.create.{Create, CreateResponse}
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.scala.ScalaObjectMapper
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
import org.bigbluebutton.api.meeting.stuns.turn.{RemoteIceCandidate, StunServer, StunTurnService, TurnEntry}
import org.bigbluebutton.core.models.RegisteredUser

import scala.util.Try

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
    //                      def log(msg: String) = log.info(msg)
    def log(msg: String) = println(s"Logger: $msg")
  }
//  var sessions: Map[String,UserSession] = Map()

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

  def routes =
    (path("api" / "create") & extractLog) { log =>
      get {
        parameter(
          "name".as[String],
          "meetingID".as[String],
          "checksum".as[String],
          "attendeePW".as[String].optional,
          "moderatorPW".as[String].optional,
          "voiceBridge".as[String].optional,
        ) { (
                               name,
                               meetingID,
                               checksum,
                               attendeePW,
                               moderatorPW,
                               voiceBridgeParam,
                             ) =>
          println("name: " + name)
          println("meetingID: " + meetingID)
          println("attendeePW: " + attendeePW)
          println("moderatorPW: " + moderatorPW)
          println("voiceBridge: " + voiceBridgeParam)

          if (!attendeePW.isDefined) log.info("No attendeePW provided")
          if (!moderatorPW.isDefined) log.info("No moderatorPW provided")

          log.info(s"attendeePW [${attendeePW.getOrElse("")}]")
          log.info(s"moderatorPW [${moderatorPW.getOrElse("")}]")

          val voiceBridge = voiceBridgeParam.getOrElse("1")
          val html5InstanceId = 1

          val config = ConfigFactory.load("bigbluebutton.properties")
          lazy val presentationDir = Try(config.getString("presentationDir")).getOrElse("localhost")

          log.info("presentationDir-----------------")
          log.info(presentationDir)

          parameterMap { params =>

            println("PARAAAAMS")
            println(params.toString)

            val defaultprops = Create.createDefaultProp(meetingID, params, config)

              val meetingCreateFuture = meetingService.createMeeting(defaultprops)
              val entityFuture = meetingCreateFuture.map { resp =>

                println("SIM ENTROU NO MATCH.....")
                println(resp)

                resp match {
                  case ApiResponseSuccess(msg, arg) =>
                    HttpEntity(MediaTypes.`application/xml`.withCharset(HttpCharsets.`UTF-8`),
                      CreateResponse.ResponseMeeting(msg,defaultprops).toXml.toString)
                  case ApiResponseFailure(msg, arg) =>
                    val response:xml.Elem = <response>
                      <returncode>ERR</returncode>
                      <messageKey/>
                      <message>{msg}</message>
                    </response>
                    HttpEntity(MediaTypes.`application/xml`.withCharset(HttpCharsets.`UTF-8`),response.toString)
                  case _ =>
                    val response:xml.Elem = <response>
                      <returncode>ERR</returncode>
                      <messageKey/>
                      <message>errrr</message>
                    </response>
                    HttpEntity(MediaTypes.`application/xml`.withCharset(HttpCharsets.`UTF-8`),response.toString)
//                    HttpEntity(ContentTypes.`application/json`, s"""{ "message": "No active meeting with ID $meetingId"}""".parseJson.prettyPrint)
                }
              }
              complete(StatusCodes.OK,entityFuture)
          }

        }

      }
    } ~ (path("api" / "join") & extractLog) { log =>
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



          parameterMap { params =>
            log.debug("PARAAAAMS")
            log.debug(params.toString)

            var destUrl:String = null

            try {
              val regUser = Join.createRegisterUser(
                meetingID,
                params
              )

              val sessionToken = RandomStringUtils.randomAlphanumeric(12).toLowerCase

              val registerUserFuture = meetingService.registerUser(regUser)
              val entityFuture = registerUserFuture.map { resp =>

                println("SIM ENTROU NO MATCH.....")
                println(resp)


                resp match {
                  case ApiResponseSuccess(msg, arg) =>

//                    val serverURL = ParamsUtils().getConfigAsString("serverURL")
                    val defaultHTML5ClientUrl = ParamsUtils().getConfigAsString("defaultHTML5ClientUrl")

                    destUrl = defaultHTML5ClientUrl + "?sessionToken=" + sessionToken


                    log.info(s"Redirecting to ${destUrl}")
//                    log.info(s"Redirecting to ${serverURL}")

//                    redirect(destUrl)
//                    redirect(destUrl, StatusCodes.PermanentRedirect)


                    HttpResponse(
                      status = StatusCodes.PermanentRedirect,
                      headers = headers.Location(destUrl) :: Nil,
                      entity =HttpEntity.Empty)


//                    HttpResponse(StatusCodes.OK,
//                      entity = HttpEntity(ContentTypes.`application/json`, s"""{ "message": "Redirecting to $destUrl"}""".parseJson.prettyPrint)
//                    )

//                    HttpResponse(StatusCodes.OK,
//                      entity = HttpEntity(ContentTypes.`application/json`, s"""{ "message": "Redirecting to $destUrl"}""".parseJson.prettyPrint)
//                    )


                  //                  complete(StatusCodes.OK,entityFuture)
                  case ApiResponseFailure(msg, arg) =>
                    val response: xml.Elem = <response>
                      <returncode>ERR</returncode>
                      <messageKey/>
                      <message>
                        {msg}
                      </message>
                    </response>

                    HttpResponse(StatusCodes.OK,
                      entity = HttpEntity(MediaTypes.`application/xml`.withCharset(HttpCharsets.`UTF-8`), response.toString)
                    )



                  case _ =>
                    val response: xml.Elem = <response>
                      <returncode>ERR</returncode>
                      <messageKey/>
                      <message>errrr</message>
                    </response>
//                    HttpEntity(MediaTypes.`application/xml`.withCharset(HttpCharsets.`UTF-8`), response.toString)

                    HttpResponse(StatusCodes.OK,
                      entity = HttpEntity(MediaTypes.`application/xml`.withCharset(HttpCharsets.`UTF-8`), response.toString)
                    )

                }
              }

              optionalSession(oneOff, usingCookies) { currSession => {

                val userSession = currSession match {
                  case Some(currUserSession: Map[String, String]) => currUserSession
                  case None       => Map[String,String]()
                }

                val acessTokenData = UserSession(regUser.meetingId, regUser.intUserId)




                val gson = new Gson
                val jsonUserData = gson.toJson(acessTokenData)

                gson.fromJson(jsonUserData, classOf[UserSession])

                setSession(oneOff, usingCookies, userSession + (sessionToken -> jsonUserData)) {
                  setNewCsrfToken(checkHeader) { ctx =>
                    log.info(s"SESSION SET SUCESSEFULY $sessionToken")
                    ctx.complete(
                      entityFuture
                    )
                  }
                }
              }
              }



//                complete(sessionToken.toJson)
//                log.info(s"SESSION SET SUCESSEFULY $sessionToken")
//                complete(StatusCodes.OK,entityFuture)
//              }




            } catch {
              case e: Exception => {
                log.error(s"Error join on meeting $meetingID, ${e.getMessage}")
                val response: xml.Elem = <response>
                  <returncode>ERR</returncode>
                  <messageKey/>
                  <message>{e.getMessage}</message>
                </response>
                complete(HttpEntity(MediaTypes.`application/xml`.withCharset(HttpCharsets.`UTF-8`), response.toString))
              }
            }

          }

        }
      }
    } ~ (path("api" / "enter") & extractLog) { log =>
        get {
          log.info("enter")

          requiredSession(oneOff, usingCookies) { userSession: Map[String, String] =>
            println(s"Current session $userSession")

              parameter("sessionToken".as[String]) { (sessionToken) =>
                println("sessionToken: " + sessionToken)



                val response = {
                  if(userSession.exists(tokens => tokens._1 == sessionToken)) {

                    val gson = new Gson
                    val userTokenData = gson.fromJson(userSession(sessionToken), classOf[UserSession])

                    val registerUserFuture = meetingService.findUser(userTokenData.meetingId, userTokenData.userId)
                    val entityFuture = registerUserFuture.map { resp =>
                      resp match {
                        case ApiResponseSuccess(msg, userInfos: UserInfosApiMsg) =>

                          var userReturn:Map[String, Any] = userInfos.infos

                          userReturn += ("returncode" -> "SUCCESS")

                          val jsonReturn = Map(
                            "response" -> userReturn
                          )

                          HttpEntity(ContentTypes.`application/json`, jsonReturn.toJson.prettyPrint)

                        case ApiResponseFailure(msg, arg) =>

                          var userReturn:Map[String,String] = Map()
                          userReturn += ("returncode" -> "ERROR")
                          userReturn += ("message" -> msg)

                          HttpEntity(ContentTypes.`application/json`, userReturn.toJson.prettyPrint)
                        case _ =>
                          var userReturn:Map[String,String] = Map()
                          userReturn += ("returncode" -> "ERROR")
                          userReturn += ("message" -> "generic error")

                          HttpEntity(ContentTypes.`application/json`, userReturn.toJson.prettyPrint)
                      }
                    }

                    complete(StatusCodes.OK,entityFuture)
                  } else {

                    var userReturn:Map[String,String] = Map()
                    userReturn += ("returncode" -> "ERROR")
                    userReturn += ("message" -> "Session invalid")

                    complete(HttpEntity(ContentTypes.`application/json`, userReturn.toJson.prettyPrint))

                  }
                }


                response
            }
          }
        }
    } ~ (path("api" / "stuns") & extractLog) { log =>

      log.info("stuns")

      requiredSession(oneOff, usingCookies) { userSession: Map[String, String] =>
        println(s"Current session $userSession")

        parameter("sessionToken".as[String]) { (sessionToken) =>
          println("sessionToken: " + sessionToken)


          val response = {
            if (userSession.exists(tokens => tokens._1 == sessionToken)) {

              val gson = new Gson
              val userTokenData = gson.fromJson(userSession(sessionToken), classOf[UserSession])



              val findUserFuture = meetingService.findUser(userTokenData.meetingId, userTokenData.userId)
              val entityFuture = findUserFuture.map { resp =>

                resp match {
                  case ApiResponseSuccess(msg, userInfos: UserInfosApiMsg) =>

                    log.info("Encontrou user com sucesso!")
                    log.info(userInfos.infos.toString)
//
                    val stunServers: List[Map[String,String]] = List(
                      Map("url" -> "stun:stun.l.google.com:19302")
                    )
                    val turnServers: List[String] = List()
                    val remoteIceCandidates: List[String] = List()

                    val returnStuns: Map[String, Any] = Map(
                      ("stunServers" -> stunServers),
                      ("turnServers" -> turnServers),
                      ("remoteIceCandidates" -> remoteIceCandidates),
                    )




                    HttpEntity(ContentTypes.`application/json`, returnStuns.toJson.prettyPrint)

                  case ApiResponseFailure(msg, arg) =>

                    var userReturn: Map[String, String] = Map()
                    userReturn += ("returncode" -> "ERROR")
                    userReturn += ("message" -> msg)

                    HttpEntity(ContentTypes.`application/json`, userReturn.toJson.prettyPrint)
                  case _ =>
                    var userReturn: Map[String, String] = Map()
                    userReturn += ("returncode" -> "ERROR")
                    userReturn += ("message" -> "generic error")

                    HttpEntity(ContentTypes.`application/json`, userReturn.toJson.prettyPrint)
                }
              }

              complete(StatusCodes.OK, entityFuture)
            } else {

              var userReturn: Map[String, String] = Map()
              userReturn += ("returncode" -> "ERROR")
              userReturn += ("message" -> "Session invalid")

              complete(HttpEntity(ContentTypes.`application/json`, userReturn.toJson.prettyPrint))

            }
          }


          response

        }
      }

    } ~ (path("api" / "connection" / "checkAuthorization") & extractLog) { log =>

//      def uri = request.getHeader("x-original-uri")

      log.info("api/connection/checkAuthorization")

      headerValueByName("x-original-URI") { originalUri =>
        println(s"The Original URI is $originalUri")

        ///ws?sessionToken=65xtzsmtkcsb

        val string = "one493two483three"
        val pattern = """\?sessionToken=([\w]+)""".r
        pattern.findAllIn(string).matchData foreach {
          m => println(m.group(1))
        }


        val sessionToken = originalUri match {
          case s"${x}?sessionToken=${sessionToken}" => {
            println("sessionToken: " + sessionToken)
            sessionToken
          }
          case _                   => ""
        }


        requiredSession(oneOff, usingCookies) { userSession: Map[String, String] =>
          println(s"Current session $userSession")

//          parameter("sessionToken".as[String]) { (sessionToken) =>
            println("sessionToken: " + sessionToken)


            val response = {
              if (userSession.exists(tokens => tokens._1 == sessionToken)) {

                val gson = new Gson
                val userTokenData = gson.fromJson(userSession(sessionToken), classOf[UserSession])



                val findUserFuture = meetingService.findUser(userTokenData.meetingId, userTokenData.userId)
                val entityFuture = findUserFuture.map { resp =>

                  resp match {
                    case ApiResponseSuccess(msg, userInfos: UserInfosApiMsg) =>

                      log.info("Encontrou user com sucesso!")
                      log.info(userInfos.infos.toString)
                      //


                      //                    response.addHeader("Cache-Control", "no-cache")
                      //                    response.contentType = 'plain/text'
                      //
                      //                if (userSession != null && !isSessionTokenInvalid) {
                      //                response.addHeader("User-Id", userSession.internalUserId)
                      //                response.addHeader("Meeting-Id", userSession.meetingID)
                      //                response.addHeader("Voice-Bridge", userSession.voicebridge )
                      //                response.addHeader("User-Name", userSession.fullname)
                      //                response.setStatus(200)
                      //                response.outputStream << 'authorized'
                      //                } else {
                      //                response.setStatus(401)
                      //                response.outputStream << 'unauthorized'
                      //                }





                      //                respondWithHeaders(RawHeader("User-Id", userInfos.infos.get("internalUserId").getOrElse("a")), Origin(HttpOrigin("http://akka.io"))) {
                      //                  complete(HttpEntity(ContentTypes.`text/plain(UTF-8)`, "authorized"))
                      //                }

                      val responseHeaders = Seq(
                        RawHeader("User-Id", userInfos.infos.get("internalUserID").getOrElse("").toString),
                        RawHeader("Meeting-Id", userInfos.infos.get("meetingID").getOrElse("").toString),
                        RawHeader("Voice-Bridge", userInfos.infos.get("voicebridge").getOrElse("").toString),
                        RawHeader("User-Name", userInfos.infos.get("fullname").getOrElse("").toString)
                      )


                      HttpResponse(StatusCodes.OK,
                        headers = responseHeaders,
                        entity = HttpEntity(ContentTypes.`text/plain(UTF-8)`, "authorized")
                      )

                    case ApiResponseFailure(msg, arg) =>
                      HttpResponse(StatusCodes.Unauthorized,
                        entity = HttpEntity(ContentTypes.`text/plain(UTF-8)`, "unauthorized")
                      )
                    case _ =>
                      HttpResponse(StatusCodes.Unauthorized,
                        entity = HttpEntity(ContentTypes.`text/plain(UTF-8)`, "unauthorized")
                      )
                  }
                }

                complete(entityFuture)

              } else {

                var userReturn: Map[String, String] = Map()
                userReturn += ("returncode" -> "ERROR")
                userReturn += ("message" -> "Session invalid")

                complete(HttpEntity(ContentTypes.`application/json`, userReturn.toJson.prettyPrint))

              }
            }


            response

//          }
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

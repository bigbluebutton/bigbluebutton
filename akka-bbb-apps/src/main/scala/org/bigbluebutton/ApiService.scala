package org.bigbluebutton

import akka.http.scaladsl.model._
import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport
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
import org.bigbluebutton.core.api.{ApiResponseFailure, ApiResponseSuccess}
import com.softwaremill.session.CsrfDirectives._
import com.softwaremill.session.CsrfOptions._
import com.softwaremill.session.SessionDirectives._
import com.softwaremill.session.SessionOptions._
import com.softwaremill.session._
import com.google.gson.Gson
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
                    //                  HttpEntity(MediaTypes.`application/xml`.withCharset(HttpCharsets.`UTF-8`),
                    //                    CreateResponse.ResponseMeeting(msg,defaultprops).toXml.toString)

                    val defaultHTML5ClientUrl = ParamsUtils().getConfigAsString("defaultHTML5ClientUrl")

                    destUrl = defaultHTML5ClientUrl + "?sessionToken=" + sessionToken


                    log.info("Redirecting to ${destUrl}")

                    //                  redirect(Uri(destUrl), StatusCodes.PermanentRedirect)

                    HttpEntity(ContentTypes.`application/json`, s"""{ "message": "Redirecting to $destUrl"}""".parseJson.prettyPrint)
                  //                  complete(StatusCodes.OK,entityFuture)
                  case ApiResponseFailure(msg, arg) =>
                    val response: xml.Elem = <response>
                      <returncode>ERR</returncode>
                      <messageKey/>
                      <message>
                        {msg}
                      </message>
                    </response>
                    HttpEntity(MediaTypes.`application/xml`.withCharset(HttpCharsets.`UTF-8`), response.toString)

                  //                  complete(StatusCodes.OK,entityFuture)
                  case _ =>
                    val response: xml.Elem = <response>
                      <returncode>ERR</returncode>
                      <messageKey/>
                      <message>errrr</message>
                    </response>
                    HttpEntity(MediaTypes.`application/xml`.withCharset(HttpCharsets.`UTF-8`), response.toString)
                  //                    HttpEntity(ContentTypes.`application/json`, s"""{ "message": "No active meeting with ID $meetingId"}""".parseJson.prettyPrint)

                  //                  complete(StatusCodes.OK,entityFuture)
                }
              }
              //            complete(StatusCodes.OK,entityFuture)



//              val session = UserSession(sessionToken)

//              val teste : Map[String, String] = Map()
//              val b = teste + ("kkk" -> "ccc")

              optionalSession(oneOff, usingCookies) { currSession => {

                val userSession = currSession match {
                  case Some(currUserSession: Map[String, String]) => currUserSession
                  case None       => Map[String,String]()
                }

//                val test: Array[String] = Array()
//                val b = test + "bla"

                val acessTokenData = UserSession(regUser.meetingId, regUser.intUserId)




                val gson = new Gson
                val jsonUserData = gson.toJson(acessTokenData)

                gson.fromJson(jsonUserData, classOf[UserSession])
//
//
//                val mapper = new ObjectMapper() with ScalaObjectMapper
//                //this line my be needed depending on your case classes
//                mapper.registerModule(DefaultScalaModule)
//
//                def fromJson[T](json: String)(implicit m: Manifest[T]): T = {
//                  mapper.readValue[T](json)
//                }


//                println(acessTokenData.toString)
//                println(acessTokenData.toJson)

                setSession(oneOff, usingCookies, userSession + (sessionToken -> jsonUserData)) {
                  setNewCsrfToken(checkHeader) { ctx =>
                    log.info(s"SESSION SET SUCESSEFULY $sessionToken")
                    ctx.complete(
                      StatusCodes.OK,entityFuture
                      //                    log.info(s"SESSION SET SUCESSEFULY $sessionToken")
                      //                      complete(StatusCodes.OK,entityFuture)

                      //                    HttpResponse(
                      //                      status = TemporaryRedirect,
                      //                      headers = headers
                      //                        .Location(Uri(state.getOrElse("/"))) :: Nil,
                      //                      entity = HttpEntity.Empty
                      //                    )
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





            //            complete(
            //              StatusCodes.OK,
            //              HttpEntity(ContentTypes.`application/json`, """{ "message": "Trying to register user"}""".parseJson.prettyPrint)
            //            )

            //          }

            //          {
            //            "envelope":{
            //              "name":"RegisterUserReqMsg",
            //              "routing":{
            //              "sender":"bbb-web"
            //            },
            //              "timestamp":1657591625809
            //            },
            //            "core":{
            //              "header":{
            //              "name":"RegisterUserReqMsg",
            //              "meetingId":"35f5887b2d967a7695d4c86cb075ced59c38a2d1-1657591615291"
            //            },
            //              "body":{
            //              "meetingId":"35f5887b2d967a7695d4c86cb075ced59c38a2d1-1657591615291",
            //              "intUserId":"w_8ue7sn9cwyao",
            //              "name":"User 2644673",
            //              "role":"MODERATOR",
            //              "extUserId":"w_8ue7sn9cwyao",
            //              "authToken":"nkvlyftehfvo",
            //              "avatarURL":"",
            //              "guest":false,
            //              "authed":true,
            //              "guestStatus":"ALLOW",
            //              "excludeFromDashboard":false
            //            }
            //            }
            //          }"


            //          https://bbb26.bbbvm.imdt.com.br/bigbluebutton/api/join?
            //            fullName=User+2644673
            //          meetingID=random-3842371
            //          password=ap
            //          redirect=true
            //          checksum=71567cce72c8213a4884f80e0530e362ac18cb05
          }

        }
      }
    } ~ (path("api" / "enter") & extractLog) { log =>
        get {
          log.info("enter")

          requiredSession(oneOff, usingCookies) { userSession: Map[String, String] =>
            println(s"Current session $userSession")
//            complete {
//              "secret"
//            }

              parameter("sessionToken".as[String]) { (sessionToken) =>
                println("sessionToken: " + sessionToken)



                val response = {
                  if(userSession.exists(tokens => tokens._1 == sessionToken)) {

                    val gson = new Gson
                    val userTokenData = gson.fromJson(userSession(sessionToken), classOf[UserSession])

                    val registerUserFuture = meetingService.findUser(userTokenData.meetingId, userTokenData.userId)
                    val entityFuture = registerUserFuture.map { resp =>

                      println("SIM ENTROU NO MATCH.....")
                      println(resp)


                      resp match {
                        case ApiResponseSuccess(msg, regUser: RegisteredUser) =>

                          println("CHEGOU REG USER!!!!!!!!!")
                          println(regUser)

                          var userReturn:Map[String,String] = Map()
                          userReturn += ("returncode" -> "SUCCESS")
                          userReturn += ("fullname" -> regUser.name)
                          userReturn += ("confname" -> "bla")
                          userReturn += ("meetingID" -> userTokenData.meetingId)
                          userReturn += ("externMeetingID" -> "bla")
                          userReturn += ("externUserID" -> regUser.externId)
                          userReturn += ("internalUserID" -> regUser.id)
                          userReturn += ("role" -> regUser.role)
                          userReturn += ("guest" -> regUser.guest)
                          userReturn += ("guestStatus" -> regUser.guestStatus)
                          userReturn += ("conference" -> "bla")
                          userReturn += ("room" -> "bla")
                          userReturn += ("voicebridge" -> "bla")
                          userReturn += ("dialnumber" -> "bla")
                          userReturn += ("webvoiceconf" -> "bla")
                          userReturn += ("mode" -> "bla")
                          userReturn += ("record" -> "bla")
                          userReturn += ("isBreakout" -> "bla")
                          userReturn += ("logoutTimer" -> "bla")
                          userReturn += ("allowStartStopRecording" -> "bla")
                          userReturn += ("welcome" -> "bla")
                          userReturn += ("modOnlyMessage" -> "bla")
                          userReturn += ("bannerText" -> "bla")
                          userReturn += ("bannerColor" -> "bla")
                          userReturn += ("welcome" -> "bla")
                          userReturn += ("customLogoURL" -> "bla")
                          userReturn += ("customCopyright" -> "bla")
                          userReturn += ("muteOnStart" -> "bla")
                          userReturn += ("allowModsToUnmuteUsers" -> "bla")
                          userReturn += ("logoutUrl" -> "bla")
                          userReturn += ("defaultLayout" -> "bla")
                          userReturn += ("avatarURL" -> "bla")
                          userReturn += ("record" -> "bla")
                          userReturn += ("privateChatEnabled" -> "bla")
                          userReturn += ("customdata" -> "bla") //TODO
                          userReturn += ("metadata" -> "bla") //TODO


                          //                    complete(HttpEntity(MediaTypes.`application/xml`.withCharset(HttpCharsets.`UTF-8`), response.toString))
                          //                complete(HttpEntity(ContentTypes.`application/json`, userReturn.toJson.prettyPrint))

                          //                json {
                          //                  def builder = new JsonBuilder()
                          //                  builder.response {
                          //                    returncode RESP_CODE_SUCCESS
                          //                      fullname us.fullname
                          //                    confname us.conferencename
                          //                    meetingID us.meetingID
                          //                    externMeetingID us.externMeetingID
                          //                    externUserID us.externUserID
                          //                    internalUserID newInternalUserID
                          //                      authToken us.authToken
                          //                    role us.role
                          //                    guest us.guest
                          //                    guestStatus us.guestStatus
                          //                    conference us.conference
                          //                    room us.room
                          //                    voicebridge us.voicebridge
                          //                    dialnumber meeting.getDialNumber()
                          //                    webvoiceconf us.webvoiceconf
                          //                    mode us.mode
                          //                    record us.record
                          //                    isBreakout meeting.isBreakout()
                          //                    logoutTimer meeting.getLogoutTimer()
                          //                    allowStartStopRecording meeting.getAllowStartStopRecording()
                          //                    welcome us.welcome
                          //                    if (!StringUtils.isEmpty(meeting.moderatorOnlyMessage) && us.role.equals(ROLE_MODERATOR)) {
                          //                      modOnlyMessage meeting.moderatorOnlyMessage
                          //                    }
                          //                    if (!StringUtils.isEmpty(meeting.bannerText)) {
                          //                      bannerText meeting.getBannerText()
                          //                      bannerColor meeting.getBannerColor()
                          //                    }
                          //                    customLogoURL meeting.getCustomLogoURL()
                          //                    customCopyright meeting.getCustomCopyright()
                          //                    muteOnStart meeting.getMuteOnStart()
                          //                    allowModsToUnmuteUsers meeting.getAllowModsToUnmuteUsers()
                          //                    logoutUrl us.logoutUrl
                          //                    defaultLayout us.defaultLayout
                          //                    avatarURL us.avatarURL
                          //                    if (meeting.breakoutRoomsParams != null) {
                          //                      breakoutRooms {
                          //                        record meeting.breakoutRoomsParams.record
                          //                        privateChatEnabled meeting.breakoutRoomsParams.privateChatEnabled
                          //                      }
                          //                    }
                          //                    customdata (
                          //                      meeting.getUserCustomData(us.externUserID).collect { k, v ->
                          //                        ["$k": v]
                          //                      }
                          //                    )
                          //                    metadata (
                          //                      meeting.getMetadata().collect { k, v ->
                          //                        ["$k": v]
                          //                      }
                          //                    )
                          //                  }
                          //                  render(contentType: "application/json", text: builder.toPrettyString())
                          //                }

                          userReturn
                        case ApiResponseFailure(msg, arg) =>

                          var userReturn:Map[String,String] = Map()
                          userReturn += ("returncode" -> "ERROR")
                          userReturn += ("message" -> msg)

                          userReturn

                        //                  complete(StatusCodes.OK,entityFuture)
                        case _ =>
                          var userReturn:Map[String,String] = Map()
                          userReturn += ("returncode" -> "ERROR")
                          userReturn += ("message" -> "generic error")

                          userReturn
                        //                    HttpEntity(ContentTypes.`application/json`, s"""{ "message": "No active meeting with ID $meetingId"}""".parseJson.prettyPrint)

                        //                  complete(StatusCodes.OK,entityFuture)
                      }
                    }//.mapTo(Map[String,String])

//                    complete(StatusCodes.OK,entityFuture)

//                    val teste = entityFuture.onComplete(resp => {
//                      resp
//                    })

                    complete(StatusCodes.OK,entityFuture)

//                    entityFuture.recover {
//                      case e: AskTimeoutException => {
//                        var userReturn:Map[String,String] = Map()
//                        userReturn += ("returncode" -> "ERROR")
//                        userReturn += ("message" -> "Request Timeout error")
//
//                        userReturn
//                      }
//                    }

//                    teste

//                    <response>
//                      <returncode>SUCCESS</returncode>
//                      <messageKey/>
//                      <message>Session found: {userTokenData}</message>
//                    </response>
                  } else {
//                    <response>
//                      <returncode>ERRO</returncode>
//                      <messageKey/>
//                      <message>Session invalid</message>
//                    </response>

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

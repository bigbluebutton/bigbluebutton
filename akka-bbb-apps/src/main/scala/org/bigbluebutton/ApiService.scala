package org.bigbluebutton

import akka.http.scaladsl.model._
import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport
import akka.http.scaladsl.server.Directives._
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.service.{HealthzService, MeetingInfoService, MeetingService, PubSubReceiveStatus, PubSubSendStatus, RecordingDBSendStatus}
import spray.json._

import scala.concurrent._
import ExecutionContext.Implicits.global
import api.meeting.{Create, Join, MsgBuilder}
import com.typesafe.config.ConfigFactory

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

          /*

    Map.Entry<String, String> validationResponse = validateRequest(
            ValidationService.ApiCall.CREATE,
            request.getParameterMap(),
            request.getQueryString()
    )

    if(!(validationResponse == null)) {
      invalid(validationResponse.getKey(), validationResponse.getValue())
      return
    }
    */


          val voiceBridge = voiceBridgeParam.getOrElse("1")
          /*
    // Ensure unique TelVoice. Uniqueness is not guaranteed by paramsProcessorUtil.
    if (!params.voiceBridge) {
      // Try up to 10 times. We should find a valid telVoice quickly unless
      // the server hosts ~100k meetings (default 5-digit telVoice)
      for (int i in 1..10) {
        String telVoice = paramsProcessorUtil.processTelVoice("");
        if (!meetingService.getNotEndedMeetingWithTelVoice(telVoice)) {
          params.voiceBridge = telVoice;
          break;
        }
      }
      // Still no unique voiceBridge found? Let createMeeting handle it.
    }
    */


          val html5InstanceId = 1
          /*
    params.html5InstanceId = html5LoadBalancingService.findSuitableHTML5ProcessByRoundRobin().toString()
    */


          /*
          Meeting newMeeting = paramsProcessorUtil.processCreateParams(params)



      */


          /*

              ApiErrors errors = new ApiErrors()

              if (meetingService.createMeeting(newMeeting)) {
                // See if the request came with pre-uploading of presentation.
                uploadDocuments(newMeeting, false);  //
                respondWithConference(newMeeting, null, null)
              } else {
                // Translate the external meeting id into an internal meeting id.
                String internalMeetingId = paramsProcessorUtil.convertToInternalMeetingId(params.meetingID);
                Meeting existing = meetingService.getNotEndedMeetingWithId(internalMeetingId);
                if (existing != null) {
                  log.debug "Existing conference found"
                  Map<String, Object> updateParams = paramsProcessorUtil.processUpdateCreateParams(params);
                  if (existing.getViewerPassword().equals(params.get("attendeePW")) && existing.getModeratorPassword().equals(params.get("moderatorPW"))) {
                    //paramsProcessorUtil.updateMeeting(updateParams, existing);
                    // trying to create a conference a second time, return success, but give extra info
                    // Ignore pre-uploaded presentations. We only allow uploading of presentation once.
                    //uploadDocuments(existing);
                    respondWithConference(existing, "duplicateWarning", "This conference was already in existence and may currently be in progress.");
                  } else {
                    // BEGIN - backward compatibility
                    invalid("idNotUnique", "A meeting already exists with that meeting ID.  Please use a different meeting ID.");
                    return
                    // END - backward compatibility

                    // enforce meetingID unique-ness
                    errors.nonUniqueMeetingIdError()
                    respondWithErrors(errors)
                  }

                  return
                } else {
                  Meeting existingTelVoice = meetingService.getNotEndedMeetingWithTelVoice(newMeeting.getTelVoice());
                  Meeting existingWebVoice = meetingService.getNotEndedMeetingWithWebVoice(newMeeting.getWebVoice());
                  if (existingTelVoice != null || existingWebVoice != null) {
                    log.error "VoiceBridge already in use by another meeting (different meetingId)"
                    errors.nonUniqueVoiceBridgeError()
                    respondWithErrors(errors)
                  }
                }
              }
                       */

          val config = ConfigFactory.load("bigbluebutton.properties")
          lazy val presentationDir = Try(config.getString("presentationDir")).getOrElse("localhost")

          log.info("presentationDir-----------------")
          log.info(presentationDir)

          parameterMap { params =>

            println("PARAAAAMS")
            println(params.toString)

//            val defaultprops = Create.createDefaultProp(
//              meetingName = name,
//              extMeetingId = meetingID,
//              meetingId = meetingID,
//              moderatorPass = moderatorPW.getOrElse(""),
//              viewerPass = attendeePW.getOrElse(""),
//              dialNumber = "613-555-1234"
//            )
//
//            meetingService.createMeeting(defaultprops)


            val defaultprops = Create.createDefaultProp(meetingID, params, config)

            // TODO
//            if (!StringUtils.isEmpty(params.get(ApiParams.LOGO))) {
//              meeting.setCustomLogoURL(params.get(ApiParams.LOGO));
//            } else if (this.getUseDefaultLogo()) {
//              meeting.setCustomLogoURL(this.getDefaultLogoURL());
//            }

            //if (!StringUtils.isEmpty(params.get(ApiParams.COPYRIGHT))) {
            //			meeting.setCustomCopyright(params.get(ApiParams.COPYRIGHT));
            //		}

            // TODO
            // ApiParams.ALLOW_REQUESTS_WITHOUT_SESSION


            get {
              val meetingCreateFuture = meetingService.createMeeting(defaultprops)
              val entityFuture = meetingCreateFuture.map { resp =>
                resp.optionMeetingCreateResp match {
                  case Some(_) =>
                    val response:xml.Elem = <response>
                      <returncode>SUCCESS</returncode>
                      <meetingID>{defaultprops.meetingProp.extId}</meetingID>
                      <internalMeetingID>{defaultprops.meetingProp.intId}</internalMeetingID>
                      <parentMeetingID>{defaultprops.breakoutProps.parentId}</parentMeetingID>
                      <attendeePW>{defaultprops.password.viewerPass}</attendeePW>
                      <moderatorPW>{defaultprops.password.moderatorPass}</moderatorPW>
                      <createTime>{defaultprops.durationProps.createdTime}</createTime>
                      <voiceBridge>{defaultprops.voiceProp.telVoice}</voiceBridge>
                      <dialNumber>{defaultprops.voiceProp.dialNumber}</dialNumber>
                      <createDate>{defaultprops.durationProps.createdDate}</createDate>
                      <hasUserJoined>false</hasUserJoined>
                      <duration>0</duration>
                      <hasBeenForciblyEnded>false</hasBeenForciblyEnded>
                      <messageKey/>
                      <message/>
                    </response>
                    HttpEntity(MediaTypes.`application/xml`.withCharset(HttpCharsets.`UTF-8`),response.toString)
                  case None =>
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



//            complete(
//              StatusCodes.OK,
//              HttpEntity(ContentTypes.`application/json`, """{ "message": "Trying to create meeting"}""".parseJson.prettyPrint)
//            )
          }




          //          HttpEntity(ContentTypes.`application/json`, res.optionMeetingsInfoAnalytics.get.toJson.prettyPrint)

          //            val future = meetingService.getAnalytics()
          //            val entityFuture = future.map { res =>
          //              res.optionMeetingsInfoAnalytics match {
          //                case Some(_) =>
          //                  HttpEntity(ContentTypes.`application/json`, res.optionMeetingsInfoAnalytics.get.toJson.prettyPrint)
          //                case None =>
          //                  HttpEntity(ContentTypes.`application/json`, """{ "message": "No active meetings"}""".parseJson.prettyPrint)
          //              }
          //            }
          //            complete(entityFuture)




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
           redirect,
           checksum,
          ) =>
            println("fullName: " + fullName)
            println("meetingID: " + meetingID)
            println("password: " + password)
            println("redirect: " + redirect)
            println("checksum: " + checksum)

          parameterMap { params =>
            log.debug("PARAAAAMS")
            log.debug(params.toString)

            complete(
              StatusCodes.OK,
              HttpEntity(ContentTypes.`application/json`, """{ "message": "Trying to register user"}""".parseJson.prettyPrint)
            )
          }


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




          val regUser = Join.createRegisterUser(
            meetingId = meetingID,
            intUserId = "w_8ue7sn9cwyao",
            name = fullName,
            role = "MODERATOR",
            extUserId =            "w_8ue7sn9cwyao",
            authToken =            "nkvlyftehfvo",
            avatarURL =            "",
            guest =                false,
            authed =                true,
            guestStatus =          "ALLOW",
            excludeFromDashboard = false
          )

          meetingService.registerUser(regUser)



          /*
          String API_CALL = 'join'
    log.debug CONTROLLER_NAME + "#${API_CALL}"
    log.debug request.getParameterMap().toMapString()
    log.debug request.getQueryString()

    Map.Entry<String, String> validationResponse = validateRequest(
            ValidationService.ApiCall.JOIN,
            request.getParameterMap(),
            request.getQueryString()
    )

    HashMap<String, String> roles = new HashMap<String, String>();

    roles.put("moderator", ROLE_MODERATOR);
    roles.put("viewer", ROLE_ATTENDEE);

    if(!(validationResponse == null)) {
      invalid(validationResponse.getKey(), validationResponse.getValue(), REDIRECT_RESPONSE)
      return
    }

    Boolean authenticated = false;

    Boolean guest = false;
    if (!StringUtils.isEmpty(params.guest)) {
      guest = Boolean.parseBoolean(params.guest)
    } else {
      // guest param has not been passed. Make user as
      // authenticated by default. (ralam july 3, 2018)
      authenticated = true
    }


    if (!StringUtils.isEmpty(params.auth)) {
      authenticated = Boolean.parseBoolean(params.auth)
    }

    String fullName = ParamsUtil.stripControlChars(params.fullName)

    String externalMeetingId = params.meetingID

    String attPW = params.password

    // Everything is good so far. Translate the external meeting id to an internal meeting id. If
    // we can't find the meeting, complain.
    String internalMeetingId = paramsProcessorUtil.convertToInternalMeetingId(externalMeetingId);

    log.info("Retrieving meeting ${internalMeetingId}")
    Meeting meeting = meetingService.getMeeting(internalMeetingId);

    // the createTime mismatch with meeting's createTime, complain
    // In the future, the createTime param will be required
    if (params.createTime != null) {
      long createTime = 0;
      try {
        createTime = Long.parseLong(params.createTime);
      } catch (Exception e) {
        log.warn("could not parse createTime param");
        createTime = -1;
      }
      if (createTime != meeting.getCreateTime()) {
        // BEGIN - backward compatibility
        invalid("mismatchCreateTimeParam", "The createTime parameter submitted mismatches with the current meeting.", REDIRECT_RESPONSE);
        return
        // END - backward compatibility

        errors.mismatchCreateTimeParam();
        respondWithErrors(errors, REDIRECT_RESPONSE);
        return
      }
    }

    // Now determine if this user is a moderator or a viewer.
    String role = null;

    // First Case: send a valid role
    if (!StringUtils.isEmpty(params.role) && roles.containsKey(params.role.toLowerCase())) {
      role = roles.get(params.role.toLowerCase());

    // Second case: role is not present or valid BUT there is password
    } else if (attPW != null && !attPW.isEmpty()){
      // Check if the meeting has passwords
      if ((meeting.getModeratorPassword() != null && !meeting.getModeratorPassword().isEmpty())
              && (meeting.getViewerPassword() != null && !meeting.getViewerPassword().isEmpty())){
        // Check which role does the user belong
        if (meeting.getModeratorPassword().equals(attPW)) {
          role = Meeting.ROLE_MODERATOR
        } else if (meeting.getViewerPassword().equals(attPW)) {
          role = Meeting.ROLE_ATTENDEE
        } else {
          log.debug("Password does not match any of the registered ones");
          response.addHeader("Cache-Control", "no-cache")
          withFormat {
            xml {
              render(text: responseBuilder.buildError("Params required", "You must enter a valid password",
                      RESP_CODE_FAILED), contentType: "text/xml")
            }
          }
          return
        }
      // In this case, the meeting doesn't have any password registered and there is no role param
      } else {
        log.debug("This meeting doesn't have any password");
        response.addHeader("Cache-Control", "no-cache")
        withFormat {
          xml {
            render(text: responseBuilder.buildError("Params required", "You must send the 'role' parameter, since " +
                    "this meeting doesn't have any password.", RESP_CODE_FAILED), contentType: "text/xml")
          }
        }
        return
      }

    // Third case: No valid role + no valid password
    } else {
      log.debug("No matching params encountered");
      response.addHeader("Cache-Control", "no-cache")
      withFormat {
        xml {
          render(text: responseBuilder.buildError("Params required", "You must either send the valid role of the user, or " +
                  "the password, sould the meeting has one.", RESP_CODE_FAILED), contentType: "text/xml")
        }
      }
      return
    }

    // We preprend "w_" to our internal meeting Id to indicate that this is a web user.
    // For users joining using the phone, we will prepend "v_" so it will be easier
    // to distinguish users who doesn't have a web client. (ralam june 12, 2017)
    String internalUserID = "w_" + RandomStringUtils.randomAlphanumeric(12).toLowerCase()

    String authToken = RandomStringUtils.randomAlphanumeric(12).toLowerCase()

    log.debug "Auth token: " + authToken

    String sessionToken = RandomStringUtils.randomAlphanumeric(16).toLowerCase()

    log.debug "Session token: " + sessionToken

    String externUserID = params.userID
    if (StringUtils.isEmpty(externUserID)) {
      externUserID = internalUserID
    }

    //Return a Map with the user custom data
    Map<String, String> userCustomData = meetingService.getUserCustomData(meeting, externUserID, params);

    //Currently, it's associated with the externalUserID
    if (userCustomData.size() > 0)
      meetingService.addUserCustomData(meeting.getInternalId(), externUserID, userCustomData);

    String guestStatusVal = meeting.calcGuestStatus(role, guest, authenticated)

    UserSession us = new UserSession();
    us.authToken = authToken;
    us.internalUserId = internalUserID
    us.conferencename = meeting.getName()
    us.meetingID = meeting.getInternalId()
    us.externMeetingID = meeting.getExternalId()
    us.externUserID = externUserID
    us.fullname = fullName
    us.role = role
    us.conference = meeting.getInternalId()
    us.room = meeting.getInternalId()
    us.voicebridge = meeting.getTelVoice()
    us.webvoiceconf = meeting.getWebVoice()
    us.mode = "LIVE"
    us.record = meeting.isRecord()
    us.welcome = meeting.getWelcomeMessage()
    us.guest = guest
    us.authed = authenticated
    us.guestStatus = guestStatusVal
    us.logoutUrl = meeting.getLogoutUrl()
    us.defaultLayout = meeting.getMeetingLayout()
    us.leftGuestLobby = false

    if (!StringUtils.isEmpty(params.defaultLayout)) {
      us.defaultLayout = params.defaultLayout;
    }

    if (!StringUtils.isEmpty(params.avatarURL)) {
      us.avatarURL = params.avatarURL;
    } else {
      us.avatarURL = meeting.defaultAvatarURL
    }

    if (!StringUtils.isEmpty(params.excludeFromDashboard)) {
      try {
        us.excludeFromDashboard = Boolean.parseBoolean(params.excludeFromDashboard)
      } catch (Exception e) {
        // Do nothing, prop excludeFromDashboard was already initialized
      }
    }

    String meetingId = meeting.getInternalId()

    if (hasReachedMaxParticipants(meeting, us)) {
      // BEGIN - backward compatibility
      invalid("maxParticipantsReached", "The number of participants allowed for this meeting has been reached.", REDIRECT_RESPONSE);
      return
      // END - backward compatibility

      errors.maxParticipantsReached();
      respondWithErrors(errors, REDIRECT_RESPONSE);
      return;
    }

    // Register user into the meeting.
    meetingService.registerUser(
        us.meetingID,
        us.internalUserId,
        us.fullname,
        us.role,
        us.externUserID,
        us.authToken,
        us.avatarURL,
        us.guest,
        us.authed,
        guestStatusVal,
        us.excludeFromDashboard,
        us.leftGuestLobby
    )

    session.setMaxInactiveInterval(SESSION_TIMEOUT);

    //check if exists the param redirect
    boolean redirectClient = true;
    String clientURL = paramsProcessorUtil.getDefaultHTML5ClientUrl();

    if (!StringUtils.isEmpty(params.redirect)) {
      try {
        redirectClient = Boolean.parseBoolean(params.redirect);
      } catch (Exception e) {
        redirectClient = true;
      }
    }

    String msgKey = "successfullyJoined"
    String msgValue = "You have joined successfully."

    // Keep track of the client url in case this needs to wait for
    // approval as guest. We need to be able to send the user to the
    // client after being approved by moderator.
    us.clientUrl = clientURL + "?sessionToken=" + sessionToken

    session[sessionToken] = sessionToken
    meetingService.addUserSession(sessionToken, us)

    //Identify which of these to logs should be used. sessionToken or user-token
    log.info("Session sessionToken for " + us.fullname + " [" + session[sessionToken] + "]")
    log.info("Session user-token for " + us.fullname + " [" + session['user-token'] + "]")

    log.info("Session token: ${sessionToken}")

    // Process if we send the user directly to the client or
    // have it wait for approval.
    String destUrl = clientURL + "?sessionToken=" + sessionToken
    if (guestStatusVal.equals(GuestPolicy.WAIT)) {
      String guestWaitUrl = paramsProcessorUtil.getDefaultGuestWaitURL();
      destUrl = guestWaitUrl + "?sessionToken=" + sessionToken
      // Check if the user has her/his default locale overridden by an userdata
      String customLocale = userCustomData.get("bbb_override_default_locale")
      if (customLocale != null) {
        destUrl += "&locale=" + customLocale
      }
      msgKey = "guestWait"
      msgValue = "Guest waiting for approval to join meeting."
    } else if (guestStatusVal.equals(GuestPolicy.DENY)) {
      destUrl = meeting.getLogoutUrl()
      msgKey = "guestDeny"
      msgValue = "Guest denied to join meeting."
    }

    Map<String, Object> logData = new HashMap<String, Object>();
    logData.put("meetingid", us.meetingID);
    logData.put("extMeetingid", us.externMeetingID);
    logData.put("name", us.fullname);
    logData.put("userid", us.internalUserId);
    logData.put("sessionToken", sessionToken);
    logData.put("logCode", "join_api");
    logData.put("description", "Handle JOIN API.");

    Gson gson = new Gson();
    String logStr = gson.toJson(logData);

    log.info(" --analytics-- data=" + logStr);

    if (redirectClient) {
      log.info("Redirecting to ${destUrl}");
      redirect(url: destUrl);
    } else {
      log.info("Successfully joined. Sending XML response.");
      response.addHeader("Cache-Control", "no-cache")
      withFormat {
        xml {
          render(text: responseBuilder.buildJoinMeeting(us, session[sessionToken], guestStatusVal, destUrl, msgKey, msgValue, RESP_CODE_SUCCESS), contentType: "text/xml")
        }
      }
    }
           */




          complete(
            StatusCodes.OK,
            HttpEntity(ContentTypes.`application/json`, """{ "message": "Trying to register user"}""".parseJson.prettyPrint)
          )

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

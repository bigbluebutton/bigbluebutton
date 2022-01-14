/**
 ** BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 *
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 *
 */
package org.bigbluebutton.web.controllers

import com.google.gson.Gson
import grails.web.context.ServletContextHolder
import groovy.json.JsonBuilder
import org.apache.commons.codec.binary.Base64
import org.apache.commons.io.FilenameUtils
import org.apache.commons.lang.RandomStringUtils
import org.apache.commons.lang.StringUtils
import org.bigbluebutton.api.*
import org.bigbluebutton.api.domain.Config
import org.bigbluebutton.api.domain.GuestPolicy
import org.bigbluebutton.api.domain.Meeting
import org.bigbluebutton.api.domain.UserSession
import org.bigbluebutton.api.service.ValidationService
import org.bigbluebutton.api.util.ParamsUtil
import org.bigbluebutton.api.util.ResponseBuilder
import org.bigbluebutton.presentation.PresentationUrlDownloadService
import org.bigbluebutton.presentation.UploadedPresentation
import org.bigbluebutton.web.services.PresentationService
import org.bigbluebutton.web.services.turn.StunTurnService
import org.bigbluebutton.web.services.turn.TurnEntry
import org.bigbluebutton.web.services.turn.StunServer
import org.bigbluebutton.web.services.turn.RemoteIceCandidate
import org.json.JSONArray

import javax.servlet.ServletRequest

class ApiController {
  private static final Integer SESSION_TIMEOUT = 14400  // 4 hours
  private static final String CONTROLLER_NAME = 'ApiController'
  protected static final String RESP_CODE_SUCCESS = 'SUCCESS'
  protected static final String RESP_CODE_FAILED = 'FAILED'
  private static final String ROLE_MODERATOR = "MODERATOR"
  private static final String ROLE_ATTENDEE = "VIEWER"
  protected static Boolean REDIRECT_RESPONSE = true

  MeetingService meetingService;
  PresentationService presentationService
  ParamsProcessorUtil paramsProcessorUtil
  ClientConfigService configService
  PresentationUrlDownloadService presDownloadService
  StunTurnService stunTurnService
  HTML5LoadBalancingService html5LoadBalancingService
  ResponseBuilder responseBuilder = initResponseBuilder()
  ValidationService validationService

  def initResponseBuilder = {
    String protocol = this.getClass().getResource("").getProtocol();
    if (Objects.equals(protocol, "jar")) {
      // Application running inside a JAR file
      responseBuilder = new ResponseBuilder(getClass().getClassLoader(), "/WEB-INF/freemarker")
    } else if (Objects.equals(protocol, "file")) {
      // Application unzipped and running outside a JAR file
      String templateLoc = ServletContextHolder.servletContext.getRealPath("/WEB-INF/freemarker")
      // We should never have a null `templateLoc`
      responseBuilder = new ResponseBuilder(new File(templateLoc))
    }
  }

  /* general methods */
  def index = {
    log.debug CONTROLLER_NAME + "#index"
    response.addHeader("Cache-Control", "no-cache")

    withFormat {
      xml {
        render(text: responseBuilder.buildMeetingVersion(paramsProcessorUtil.getApiVersion(), paramsProcessorUtil.getBbbVersion(), RESP_CODE_SUCCESS), contentType: "text/xml")
      }
    }
  }

  /***********************************
   * CREATE (API)
   ***********************************/
  def create = {
    String API_CALL = 'create'
    log.debug CONTROLLER_NAME + "#${API_CALL}"
    log.debug request.getParameterMap().toMapString()
    log.debug request.getQueryString()

    String[] ap = request.getParameterMap().get("attendeePW")
    String attendeePW
    if(ap == null) log.info("No attendeePW provided")
    else attendeePW = ap[0]

    String[] mp = request.getParameterMap().get("moderatorPW")
    String moderatorPW
    if(mp == null) log.info("No moderatorPW provided")
    else moderatorPW = mp[0]

    log.info("attendeePW [${attendeePW}]")
    log.info("moderatorPW [${moderatorPW}]")

    if(attendeePW.equals("")) log.info("attendeePW is empty")
    if(moderatorPW.equals("")) log.info("moderatorPW is empty")

    Map.Entry<String, String> validationResponse = validateRequest(
            ValidationService.ApiCall.CREATE,
            request.getParameterMap(),
            request.getQueryString()
    )

    if(!(validationResponse == null)) {
      invalid(validationResponse.getKey(), validationResponse.getValue())
      return
    }

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

    params.html5InstanceId = html5LoadBalancingService.findSuitableHTML5ProcessByRoundRobin().toString()

    Meeting newMeeting = paramsProcessorUtil.processCreateParams(params)

    ApiErrors errors = new ApiErrors()

    if (meetingService.createMeeting(newMeeting)) {
      // See if the request came with pre-uploading of presentation.
      uploadDocuments(newMeeting);  //
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
  }


  /**********************************************
   * JOIN API
   *********************************************/
  def join = {
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
    if (meeting.getModeratorPassword().equals(attPW)) {
      role = Meeting.ROLE_MODERATOR
    } else if (meeting.getViewerPassword().equals(attPW)) {
      role = Meeting.ROLE_ATTENDEE
    }

    if (!StringUtils.isEmpty(params.role) && roles.containsKey(params.role.toLowerCase())) {
        role = roles.get(params.role.toLowerCase());
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
    Map<String, String> userCustomData = paramsProcessorUtil.getUserCustomData(params);

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
        us.excludeFromDashboard
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
  }

  /*******************************************
   * IS_MEETING_RUNNING API
   *******************************************/
  def isMeetingRunning = {
    String API_CALL = 'isMeetingRunning'
    log.debug CONTROLLER_NAME + "#${API_CALL}"
    log.debug request.getParameterMap().toMapString()
    log.debug request.getQueryString()

    Map.Entry<String, String> validationResponse = validateRequest(
            ValidationService.ApiCall.MEETING_RUNNING,
            request.getParameterMap(),
            request.getQueryString()
    )

    if(!(validationResponse == null)) {
      invalid(validationResponse.getKey(), validationResponse.getValue())
      return
    }

    String externalMeetingId = params.meetingID

    // Everything is good so far. Translate the external meeting id to an internal meeting id. If
    // we can't find the meeting, complain.
    String internalMeetingId = paramsProcessorUtil.convertToInternalMeetingId(externalMeetingId);
    log.info("Retrieving meeting ${internalMeetingId}")
    Meeting meeting = meetingService.getMeeting(internalMeetingId);
    boolean isRunning = meeting != null && meeting.isRunning();

    response.addHeader("Cache-Control", "no-cache")
    withFormat {
      xml {
        render(contentType: "text/xml") {
          render(text: responseBuilder.buildIsMeetingRunning(isRunning, RESP_CODE_SUCCESS), contentType: "text/xml")
        }
      }
    }
  }

  /************************************
   * END API
   ************************************/
  def end = {
    String API_CALL = "end"
    log.debug CONTROLLER_NAME + "#${API_CALL}"

    Map.Entry<String, String> validationResponse = validateRequest(
            ValidationService.ApiCall.END,
            request.getParameterMap(),
            request.getQueryString()
    )

    if(!(validationResponse == null)) {
      invalid(validationResponse.getKey(), validationResponse.getValue())
      return
    }

    String externalMeetingId = params.meetingID
    String internalMeetingId = paramsProcessorUtil.convertToInternalMeetingId(externalMeetingId)
    log.info("Retrieving meeting ${internalMeetingId}")
    Meeting meeting = meetingService.getMeeting(internalMeetingId)

    Map<String, Object> logData = new HashMap<String, Object>();
    logData.put("meetingid", meeting.getInternalId());
    logData.put("extMeetingid", meeting.getExternalId());
    logData.put("name", meeting.getName());
    logData.put("logCode", "end_api");
    logData.put("description", "Handle END API.");

    Gson gson = new Gson();
    String logStr = gson.toJson(logData);

    log.info(" --analytics-- data=" + logStr);

    meetingService.endMeeting(meeting.getInternalId());

    response.addHeader("Cache-Control", "no-cache")
    withFormat {
      xml {
        render(contentType: "text/xml") {
          render(text: responseBuilder.buildEndRunning("sentEndMeetingRequest", "A request to end the meeting was sent.  Please wait a few seconds, and then use the getMeetingInfo or isMeetingRunning API calls to verify that it was ended.", RESP_CODE_SUCCESS), contentType: "text/xml")
        }
      }
    }
  }

  /*****************************************
   * GETMEETINGINFO API
   *****************************************/
  def getMeetingInfo = {
    String API_CALL = "getMeetingInfo"
    log.debug CONTROLLER_NAME + "#${API_CALL}"

    Map.Entry<String, String> validationResponse = validateRequest(
            ValidationService.ApiCall.GET_MEETING_INFO,
            request.getParameterMap(),
            request.getQueryString()
    )

    if(!(validationResponse == null)) {
      invalid(validationResponse.getKey(), validationResponse.getValue())
      return
    }

    String externalMeetingId = params.meetingID
    String internalMeetingId = paramsProcessorUtil.convertToInternalMeetingId(externalMeetingId);
    log.info("Retrieving meeting ${internalMeetingId}")
    Meeting meeting = meetingService.getMeeting(internalMeetingId);

    withFormat {
      xml {
        render(text: responseBuilder.buildGetMeetingInfoResponse(meeting, RESP_CODE_SUCCESS), contentType: "text/xml")
      }
    }
  }

  /************************************
   *  GETMEETINGS API
   ************************************/
  def getMeetingsHandler = {
    String API_CALL = "getMeetings"
    log.debug CONTROLLER_NAME + "#${API_CALL}"

    Map.Entry<String, String> validationResponse = validateRequest(
            ValidationService.ApiCall.GET_MEETINGS,
            request.getParameterMap(),
            request.getQueryString()
    )

    if(!(validationResponse == null)) {
      invalid(validationResponse.getKey(), validationResponse.getValue())
      return
    }

    Collection<Meeting> mtgs = meetingService.getMeetings();

    if (mtgs == null || mtgs.isEmpty()) {
      response.addHeader("Cache-Control", "no-cache")
      withFormat {
        xml {
          render(text: responseBuilder.buildGetMeetingsResponse(mtgs, "noMeetings", "no meetings were found on this server", RESP_CODE_SUCCESS), contentType: "text/xml")
        }
      }
    } else {
      response.addHeader("Cache-Control", "no-cache")

      withFormat {
        xml {
          render(text: responseBuilder.buildGetMeetingsResponse(mtgs, null, null, RESP_CODE_SUCCESS), contentType: "text/xml")
        }
      }
    }
  }

  /************************************
   *  GETSESSIONS API
   ************************************/
  def getSessionsHandler = {
    String API_CALL = "getSessions"
    log.debug CONTROLLER_NAME + "#${API_CALL}"

    Map.Entry<String, String> validationResponse = validateRequest(
            ValidationService.ApiCall.GET_SESSIONS,
            request.getParameterMap(),
            request.getQueryString()
    )

    if(!(validationResponse == null)) {
      invalid(validationResponse.getKey(), validationResponse.getValue())
      return
    }

    Collection<UserSession> sssns = meetingService.getSessions()

    if (sssns == null || sssns.isEmpty()) {
      response.addHeader("Cache-Control", "no-cache")
      withFormat {
        xml {
          render(text: responseBuilder.buildGetSessionsResponse(sssns, "noSessions", "no sessions were found on this serverr", RESP_CODE_SUCCESS), contentType: "text/xml")
        }
      }
    } else {
      response.addHeader("Cache-Control", "no-cache")
      withFormat {
        xml {
          render(contentType: "text/xml") {
            render(text: responseBuilder.buildGetSessionsResponse(sssns, null, null, RESP_CODE_SUCCESS), contentType: "text/xml")
          }
        }
      }
    }
  }


  private static Map<String, String[]> getParameters(ServletRequest request) {
    // Copy the parameters into our own Map as we can't pass the paramMap
    // from the request as it's an unmodifiable map.
    Map<String, String[]> reqParams = new HashMap<String, String[]>();
    Map<String, String[]> unModReqParams = request.getParameterMap();

    SortedSet<String> keys = new TreeSet<String>(unModReqParams.keySet());

    for(String key : keys) {
      reqParams.put(key, unModReqParams.get(key));
    }

    return reqParams;
  }

  /***********************************************
   * POLL API
   ***********************************************/
  def setPollXML = {
    String API_CALL = "setPollXML"
    log.debug CONTROLLER_NAME + "#${API_CALL}"

    Map<String, String[]> reqParams = getParameters(request)

    Map.Entry<String, String> validationResponse = validateRequest(
            ValidationService.ApiCall.SET_POLL_XML,
            reqParams,
            request.getQueryString()
    )

    if(!(validationResponse == null)) {
      invalid(validationResponse.getKey(), validationResponse.getValue())
      return
    }


    // Translate the external meeting id into an internal meeting id.
    String internalMeetingId = paramsProcessorUtil.convertToInternalMeetingId(params.meetingID);
    Meeting meeting = meetingService.getMeeting(internalMeetingId);

    String pollXML = params.pollXML

    String decodedPollXML;

    try {
      decodedPollXML = URLDecoder.decode(pollXML, "UTF-8");
    } catch (UnsupportedEncodingException e) {
      log.error "Couldn't decode poll XML.", e
      invalid("pollXMLError", "Cannot decode poll XML")
      return;
    }
    def pollxml = new XmlSlurper().parseText(decodedPollXML);

    pollxml.children().each { poll ->
      String title = poll.title.text();
      String question = poll.question.text();
      String questionType = poll.questionType.text();

      ArrayList<String> answers = new ArrayList<String>();
      poll.answers.children().each { answer ->
        answers.add(answer.text());
      }

      //send poll to BigBlueButton Apps
      meetingService.createdPolls(meeting.getInternalId(), title, question, questionType, answers);
    }

    response.addHeader("Cache-Control", "no-cache")
    withFormat {
      xml {
        // No need to use the response builder here until we have a more complex response
        render(text: "<response><returncode>$RESP_CODE_SUCCESS</returncode></response>", contentType: "text/xml")
      }
    }
  }

  /**********************************************
   * GUEST WAIT API
   *********************************************/
  def guestWaitHandler = {
    String API_CALL = 'guestWait'
    log.debug CONTROLLER_NAME + "#${API_CALL}"

    String msgKey = "defaultKey"
    String msgValue = "defaultValue"
    String destURL = paramsProcessorUtil.getDefaultLogoutUrl()

    Map.Entry<String, String> validationResponse = validateRequest(
            ValidationService.ApiCall.GUEST_WAIT,
            request.getParameterMap(),
            request.getQueryString()
    )

    if(!(validationResponse == null)) {
      msgKey = validationResponse.getKey()
      msgValue = validationResponse.getValue()
      respondWithJSONError(msgKey, msgValue, destURL)
      return
    }

    String sessionToken = sanitizeSessionToken(params.sessionToken)
    UserSession us = getUserSession(sessionToken)
    Meeting meeting = meetingService.getMeeting(us.meetingID)
    String status = us.guestStatus
    destURL = us.clientUrl
    String lobbyMsg = meeting.getGuestLobbyMessage()

    Boolean redirectClient = true
    if (!StringUtils.isEmpty(params.redirect)) {
      try {
        redirectClient = Boolean.parseBoolean(params.redirect)
      } catch (Exception e) {
        redirectClient = true
      }
    }

    String guestURL = paramsProcessorUtil.getDefaultGuestWaitURL() + "?sessionToken=" + sessionToken

    switch (status) {
      case GuestPolicy.WAIT:
        meetingService.guestIsWaiting(us.meetingID, us.internalUserId)
        destURL = guestURL
        msgKey = "guestWait"
        msgValue = "Please wait for a moderator to approve you joining the meeting."

        // We force the response to not do a redirect. Otherwise,
        // the client would just be redirecting into this endpoint.
        redirectClient = false
        break
      case GuestPolicy.DENY:
        destURL = meeting.getLogoutUrl()
        msgKey = "guestDeny"
        msgValue = "Guest denied of joining the meeting."
        redirectClient = false
        break
      case GuestPolicy.ALLOW:
        // IF the user was allowed to join but there is no room available in
        // the meeting we must hold his approval
        if (hasReachedMaxParticipants(meeting, us)) {
          meetingService.guestIsWaiting(us.meetingID, us.internalUserId)
          destURL = guestURL
          msgKey = "seatWait"
          msgValue = "Guest waiting for a seat in the meeting."
          redirectClient = false
          status = GuestPolicy.WAIT
        }
        break
      default:
        break
    }

    if (redirectClient) {
      // User may join the meeting
      redirect(url: destURL)
    } else {
      response.addHeader("Cache-Control", "no-cache")
      withFormat {
        json {
          def builder = new JsonBuilder()
          builder.response {
            returncode RESP_CODE_SUCCESS
            messageKey msgKey
            message msgValue
            meeting_id us.meetingID
            user_id us.internalUserId
            auth_token us.authToken
            session_token session[sessionToken]
            guestStatus status
            lobbyMessage lobbyMsg
            url destURL
          }
          render(contentType: "application/json", text: builder.toPrettyString())
        }
      }
    }
  }

  /***********************************************
   * ENTER API
   ***********************************************/
  def enter = {
    String API_CALL = 'enter'
    log.debug CONTROLLER_NAME + "#${API_CALL}"

    String respMessage = "Session not found."
    boolean reject = false;

    String sessionToken
    UserSession us
    Meeting meeting

    Map.Entry<String, String> validationResponse = validateRequest(
            ValidationService.ApiCall.ENTER,
            request.getParameterMap(),
            request.getQueryString(),
    )

    if(!(validationResponse == null)) {
      respMessage = validationResponse.getValue()
      reject = true
    } else {
      sessionToken = sanitizeSessionToken(params.sessionToken)
      us = getUserSession(sessionToken)
      meeting = meetingService.getMeeting(us.meetingID)

      if (!hasValidSession(sessionToken)) {
        reject = true;
      } else {
        if(hasReachedMaxParticipants(meeting, us)) {
          reject = true
          respMessage = "The maximum number of participants allowed for this meeting has been reached."
        } else {
          meeting.userEntered(us.internalUserId)
        }
      }
    }

    if (reject) {
      // Determine the logout url so we can send the user there.
      String logoutUrl = paramsProcessorUtil.getDefaultLogoutUrl()

      if(us != null) {
        logoutUrl = us.logoutUrl
      }

      log.info("Session token: ${sessionToken}")

      response.addHeader("Cache-Control", "no-cache")
      withFormat {
        json {
          def builder = new JsonBuilder()
          builder.response {
            returncode RESP_CODE_FAILED
            message respMessage
            sessionToken
            logoutURL logoutUrl
          }
          render(contentType: "application/json", text: builder.toPrettyString())
        }
      }
    } else {

      Map<String, String> userCustomData = paramsProcessorUtil.getUserCustomData(params);

      // Generate a new userId for this user. This prevents old connections from
      // removing the user when the user reconnects after being disconnected. (ralam jan 22, 2015)
      // We use underscore (_) to associate userid with the user. We are also able to track
      // how many times a user reconnects or refresh the browser.
      String newInternalUserID = us.internalUserId //+ "_" + us.incrementConnectionNum()

      Map<String, Object> logData = new HashMap<String, Object>();
      logData.put("meetingid", us.meetingID);
      logData.put("extMeetingid", us.externMeetingID);
      logData.put("name", us.fullname);
      logData.put("userid", newInternalUserID);
      logData.put("sessionToken", sessionToken);
      logData.put("logCode", "handle_enter_api");
      logData.put("description", "Handling ENTER API.");

      Gson gson = new Gson();
      String logStr = gson.toJson(logData);

      log.info(" --analytics-- data=" + logStr);

      response.addHeader("Cache-Control", "no-cache")
      withFormat {
        json {
          def builder = new JsonBuilder()
          builder.response {
            returncode RESP_CODE_SUCCESS
            fullname us.fullname
            confname us.conferencename
            meetingID us.meetingID
            externMeetingID us.externMeetingID
            externUserID us.externUserID
            internalUserID newInternalUserID
            authToken us.authToken
            role us.role
            guest us.guest
            guestStatus us.guestStatus
            conference us.conference
            room us.room
            voicebridge us.voicebridge
            dialnumber meeting.getDialNumber()
            webvoiceconf us.webvoiceconf
            mode us.mode
            record us.record
            isBreakout meeting.isBreakout()
            logoutTimer meeting.getLogoutTimer()
            allowStartStopRecording meeting.getAllowStartStopRecording()
            welcome us.welcome
            if (!StringUtils.isEmpty(meeting.moderatorOnlyMessage) && us.role.equals(ROLE_MODERATOR)) {
              modOnlyMessage meeting.moderatorOnlyMessage
            }
            if (!StringUtils.isEmpty(meeting.bannerText)) {
              bannerText meeting.getBannerText()
              bannerColor meeting.getBannerColor()
            }
            customLogoURL meeting.getCustomLogoURL()
            customCopyright meeting.getCustomCopyright()
            muteOnStart meeting.getMuteOnStart()
            allowModsToUnmuteUsers meeting.getAllowModsToUnmuteUsers()
            logoutUrl us.logoutUrl
            defaultLayout us.defaultLayout
            avatarURL us.avatarURL
            if (meeting.breakoutRoomsParams != null) {
              breakoutRooms {
                enabled meeting.breakoutRoomsParams.enabled
                record meeting.breakoutRoomsParams.record
                privateChatEnabled meeting.breakoutRoomsParams.privateChatEnabled
              }
            }
            customdata (
              meeting.getUserCustomData(us.externUserID).collect { k, v ->
                ["$k": v]
              }
            )
            metadata (
              meeting.getMetadata().collect { k, v ->
                ["$k": v]
              }
            )
          }
          render(contentType: "application/json", text: builder.toPrettyString())
        }
      }
    }
  }

  /***********************************************
   * STUN/TURN API
   ***********************************************/
  def stuns = {
    String API_CALL = 'stuns'
    log.debug CONTROLLER_NAME + "#${API_CALL}"

    boolean reject = false;

    String sessionToken
    UserSession us
    Meeting meeting

    Map.Entry<String, String> validationResponse = validateRequest(
            ValidationService.ApiCall.STUNS,
            request.getParameterMap(),
            request.getQueryString(),
    )

    if(!(validationResponse == null)) {
      reject = true
    } else {
      sessionToken = sanitizeSessionToken(params.sessionToken)
      us = getUserSession(sessionToken)
      meeting = meetingService.getMeeting(us.meetingID)

      if (!hasValidSession(sessionToken)) {
        reject = true;
      }
    }

    if (reject) {
      String logoutUrl = paramsProcessorUtil.getDefaultLogoutUrl()

      response.addHeader("Cache-Control", "no-cache")
      withFormat {
        json {
          def builder = new JsonBuilder()
          builder {
            returncode RESP_CODE_FAILED
            message "Could not find conference."
            logoutURL logoutUrl
          }
          render(contentType: "application/json", text: builder.toPrettyString())
        }
      }
    } else {
      Set<StunServer> stuns = stunTurnService.getStunServers()
      Set<TurnEntry> turns = stunTurnService.getStunAndTurnServersFor(us.internalUserId)
      Set<RemoteIceCandidate> candidates = stunTurnService.getRemoteIceCandidates()

      response.addHeader("Cache-Control", "no-cache")
      withFormat {
        json {
          def builder = new JsonBuilder()
          builder {
            stunServers (
              stuns.collect { stun ->
                [url: stun.url]
              }
            )
            turnServers (
              turns.collect { turn ->
                [
                  username: turn.username,
                  password: turn.password,
                  url: turn.url,
                  ttl: turn.ttl
                ]
              }
            )
            remoteIceCandidates (
              candidates.collect { candidate ->
                [ip: candidate.ip ]
              }
            )
          }
          render(contentType: "application/json", text: builder.toPrettyString())
        }
      }
    }
  }

  /*************************************************
   * SIGNOUT API
   *************************************************/
  def signOut = {
    String API_CALL = 'signOut'
    log.debug CONTROLLER_NAME + "#${API_CALL}"

    Map.Entry<String, String> validationResponse = validateRequest(
            ValidationService.ApiCall.SIGN_OUT,
            request.getParameterMap(),
            request.getQueryString()
    )

    if(validationResponse == null) {
      String sessionToken = sanitizeSessionToken(params.sessionToken)
      UserSession us = meetingService.removeUserSessionWithAuthToken(sessionToken)
      Map<String, Object> logData = new HashMap<String, Object>();
      logData.put("meetingid", us.meetingID);
      logData.put("extMeetingid", us.externMeetingID);
      logData.put("name", us.fullname);
      logData.put("userid", us.internalUserId);
      logData.put("sessionToken", sessionToken);
      logData.put("message", "handle_signout_api");
      logData.put("logCode", "signout_api");
      logData.put("description", "Handling SIGNOUT API.");

      Gson gson = new Gson();
      String logStr = gson.toJson(logData);
      log.info(" --analytics-- data=" + logStr)

      session.removeAttribute(sessionToken)
    } else {
      log.info("Could not find user session for session token {}", params.sessionToken)
    }

    response.addHeader("Cache-Control", "no-cache")
    withFormat {
      xml {
        // No need to use the response builder here until we have a more complex response
        render(text: "<response><returncode>$RESP_CODE_SUCCESS</returncode></response>", contentType: "text/xml")
      }
    }
  }

  /***********************************************
   * LEARNING DASHBOARD DATA
   ***********************************************/
  def learningDashboard = {
    String API_CALL = 'learningDashboard'
    log.debug CONTROLLER_NAME + "#${API_CALL}"

    String respMessage = ""
    boolean reject = false

    String sessionToken
    UserSession us
    Meeting meeting

    Map.Entry<String, String> validationResponse = validateRequest(
            ValidationService.ApiCall.LEARNING_DASHBOARD,
            request.getParameterMap(),
            request.getQueryString(),
    )

    //Validate Session
    if(!(validationResponse == null)) {
      respMessage = validationResponse.getValue()
      reject = true
    } else {
      sessionToken = sanitizeSessionToken(params.sessionToken)
      if (!hasValidSession(sessionToken)) {
        reject = true
        respMessage = "Invalid Session"
      }
    }

    //Validate User
    if(reject == false) {
      us = getUserSession(sessionToken)

      if(us == null) {
        reject = true;
        respMessage = "Access denied"
      } else if(!us.role.equals(ROLE_MODERATOR)) {
        reject = true
        respMessage = "Access denied"
      }
    }

    //Validate Meeting
    if(reject == false) {
      meeting = meetingService.getMeeting(us.meetingID)
      boolean isRunning = meeting != null && meeting.isRunning();
      if(!isRunning) {
        reject = true
        respMessage = "Meeting not found"
      }

      if(meeting.getLearningDashboardEnabled() == false) {
        reject = true
        respMessage = "Learning Dashboard disabled for this meeting"
      }
    }

    //Validate File
    File jsonDataFile
    if(reject == false) {
      jsonDataFile = meetingService.learningDashboardService.getJsonDataFile(us.meetingID,meeting.getLearningDashboardAccessToken());
      if (!jsonDataFile.exists()) {
        reject = true
        respMessage = "Learning Dashboard data not found"
      }
    }

    if (reject) {
      response.addHeader("Cache-Control", "no-cache")
      withFormat {
        json {
          def builder = new JsonBuilder()
          builder.response {
            returncode RESP_CODE_FAILED
            message respMessage
            sessionToken
          }
          render(contentType: "application/json", text: builder.toPrettyString())
        }
      }
    } else {
      Map<String, Object> logData = new HashMap<String, Object>();
      logData.put("meetingid", us.meetingID);
      logData.put("extMeetingid", us.externMeetingID);
      logData.put("name", us.fullname);
      logData.put("userid", us.internalUserId);
      logData.put("sessionToken", sessionToken);
      logData.put("logCode", "learningDashboard");
      logData.put("description", "Request Learning Dashboard data.");

      Gson gson = new Gson();
      String logStr = gson.toJson(logData);

      log.info(" --analytics-- data=" + logStr);

      response.addHeader("Cache-Control", "no-cache")

      withFormat {
        json {
          def builder = new JsonBuilder()
          builder.response {
            returncode RESP_CODE_SUCCESS
            data jsonDataFile.getText()
            sessionToken
          }
          render(contentType: "application/json", text: builder.toPrettyString())
        }
      }
    }
  }

  def uploadDocuments(conf) { //
    log.debug("ApiController#uploadDocuments(${conf.getInternalId()})");

    //sanitizeInput
    params.each {
      key, value -> params[key] = sanitizeInput(value)
    }

    String requestBody = request.inputStream == null ? null : request.inputStream.text;
    requestBody = StringUtils.isEmpty(requestBody) ? null : requestBody;

    if (requestBody == null) {
      downloadAndProcessDocument(presentationService.defaultUploadedPresentation, conf.getInternalId(), true /* default presentation */, '');
    } else {
      def xml = new XmlSlurper().parseText(requestBody);
      xml.children().each { module ->
        log.debug("module config found: [${module.@name}]");

        if ("presentation".equals(module.@name.toString())) {
          // need to iterate over presentation files and process them
          Boolean current = true;
          module.children().each { document ->
            if (!StringUtils.isEmpty(document.@url.toString())) {
              def fileName;
              if (!StringUtils.isEmpty(document.@filename.toString())) {
                log.debug("user provided filename: [${module.@filename}]");
                fileName = document.@filename.toString();
              }
              downloadAndProcessDocument(document.@url.toString(), conf.getInternalId(), current /* default presentation */, fileName);
              current = false;
            } else if (!StringUtils.isEmpty(document.@name.toString())) {
              def b64 = new Base64()
              def decodedBytes = b64.decode(document.text().getBytes())
              processDocumentFromRawBytes(decodedBytes, document.@name.toString(),
                  conf.getInternalId(), current /* default presentation */);
              current = false;
            } else {
              log.debug("presentation module config found, but it did not contain url or name attributes");
            }
          }
        }
      }
    }
  }

  def processDocumentFromRawBytes(bytes, presOrigFilename, meetingId, current) {
    def uploadFailed = false
    def uploadFailReasons = new ArrayList<String>()

    // Gets the name minus the path from a full fileName.
    // a/b/c.txt --> c.txt
    def presFilename =  FilenameUtils.getName(presOrigFilename)
    def filenameExt = FilenameUtils.getExtension(presOrigFilename)
    def pres = null
    def presId = null

    if (presFilename == "" || filenameExt == "") {
      log.debug("Upload failed. Invalid filename " + presOrigFilename)
      uploadFailReasons.add("invalid_filename")
      uploadFailed = true
    } else {
      String presentationDir = presentationService.getPresentationDir()
      presId = Util.generatePresentationId(presFilename)

      File uploadDir = Util.createPresentationDir(meetingId, presentationDir, presId)
      if (uploadDir != null) {
        def newFilename = Util.createNewFilename(presId, filenameExt)
        pres = new File(uploadDir.absolutePath + File.separatorChar + newFilename);

        FileOutputStream fos = new java.io.FileOutputStream(pres)
        fos.write(bytes)
        fos.flush()
        fos.close()
      } else {
        log.warn "Upload failed. File Empty."
        uploadFailReasons.add("failed_to_download_file")
        uploadFailed = true
      }
    }

    // Hardcode pre-uploaded presentation to the default presentation window
    processUploadedFile("DEFAULT_PRESENTATION_POD",
              meetingId,
              presId,
              presFilename,
              pres,
              current,
              "preupload-raw-authz-token",
              uploadFailed,
              uploadFailReasons)
  }

  def downloadAndProcessDocument(address, meetingId, current, fileName) {
    log.debug("ApiController#downloadAndProcessDocument(${address}, ${meetingId}, ${fileName})");
    String presOrigFilename;
    if (StringUtils.isEmpty(fileName)) {
      presOrigFilename = address.tokenize("/")[-1];
    } else {
      presOrigFilename = fileName;
    }

    def uploadFailed = false
    def uploadFailReasons = new ArrayList<String>()

    // Gets the name minus the path from a full fileName.
    // a/b/c.txt --> c.txt
    def presFilename =  FilenameUtils.getName(presOrigFilename)
    def filenameExt = FilenameUtils.getExtension(presOrigFilename)
    def pres = null
    def presId

    if (presFilename == "" || filenameExt == "") {
      log.debug("Upload failed. Invalid filename " + presOrigFilename)
      uploadFailReasons.add("invalid_filename")
      uploadFailed = true
    } else {
      String presentationDir = presentationService.getPresentationDir()
      presId = Util.generatePresentationId(presFilename)
      File uploadDir = Util.createPresentationDir(meetingId, presentationDir, presId)
      if (uploadDir != null) {
        def newFilename = Util.createNewFilename(presId, filenameExt)
        def newFilePath = uploadDir.absolutePath + File.separatorChar + newFilename

        if (presDownloadService.savePresentation(meetingId, newFilePath, address)) {
          pres = new File(newFilePath)
        } else {
          log.error("Failed to download presentation=[${address}], meeting=[${meetingId}], fileName=[${fileName}]")
          uploadFailReasons.add("failed_to_download_file")
          uploadFailed = true
        }
      } else {
        log.error("Null presentation directory meeting=[${meetingId}], presentationDir=[${presentationDir}], presId=[${presId}]")
        uploadFailReasons.add("null_presentation_dir")
        uploadFailed = true
      }
    }

    // Hardcode pre-uploaded presentation to the default presentation window
    processUploadedFile(
            "DEFAULT_PRESENTATION_POD",
            meetingId,
            presId,
            presFilename,
            pres,
            current,
            "preupload-download-authz-token",
            uploadFailed,
            uploadFailReasons
    )
  }


  def processUploadedFile(podId, meetingId, presId, filename, presFile, current, authzToken, uploadFailed, uploadFailReasons ) {
    def presentationBaseUrl = presentationService.presentationBaseUrl
    // TODO add podId
    UploadedPresentation uploadedPres = new UploadedPresentation(podId,
            meetingId,
            presId,
            filename,
            presentationBaseUrl,
            current,
            authzToken,
            uploadFailed,
            uploadFailReasons)
    uploadedPres.setUploadedFile(presFile);
    presentationService.processUploadedPresentation(uploadedPres);
  }

  def beforeInterceptor = {
    if (paramsProcessorUtil.isServiceEnabled() == false) {
      log.info("apiNotEnabled: The API service and/or controller is not enabled on this server.  To use it, you must first enable it.")
      // TODO: this doesn't stop the request - so it generates invalid XML
      //      since the request continues and renders a second response
      invalid("apiNotEnabled", "The API service and/or controller is not enabled on this server.  To use it, you must first enable it.")
    }
  }

  def respondWithConference(meeting, msgKey, msg) {
    response.addHeader("Cache-Control", "no-cache")
    withFormat {
      xml {
        log.debug "Rendering as xml"
        render(text: responseBuilder.buildMeeting(meeting, msgKey, msg, RESP_CODE_SUCCESS), contentType: "text/xml")
      }
    }
  }

  def getUserSession(token) {
    if (token == null) {
      return null
    }

    UserSession us = meetingService.getUserSessionWithAuthToken(token)
    if (us == null) {
      log.info("Cannot find UserSession for token ${token}")
    }

    return us
  }

  // Can be removed. Input sanitization is performed in the ValidationService.
  private def sanitizeInput (input) {
    if(input == null)
      return

    if(!("java.lang.String".equals(input.getClass().getName())))
      return input

    StringUtils.strip(input.replaceAll("\\p{Cntrl}", ""));
  }

  def sanitizeSessionToken(param) {
    if (param == null) {
      log.info("sanitizeSessionToken: token is null")
      return null
    }

    if (StringUtils.isEmpty(param)) {
      log.info("sanitizeSessionToken: token is empty")
      return null
    }

    return StringUtils.strip(param)
  }

  private Boolean hasValidSession(token) {
    UserSession us = getUserSession(token)
    if (us == null) {
      return false
    }

    if (!session[token]) {
      log.info("Session for token ${token} not found")

      Boolean allowRequestsWithoutSession = paramsProcessorUtil.getAllowRequestsWithoutSession()
      if (!allowRequestsWithoutSession) {
        log.info("Meeting related to ${token} doesn't allow requests without session")
        return false
      }
    }

    log.info("Token ${token} is valid")
    return true
  }

  private void logSession() {
    Enumeration<String> e = session.getAttributeNames()
    log.info("---------- Session attributes ----------")
    while(e.hasMoreElements()) {
      String attribute = (String) e.nextElement()
      log.info("${attribute}: ${session[attribute]}")
    }
    log.info("--------------------------------------")
  }

  private void logSessionInfo() {
    log.info("***** Session Info ****")
    log.info("ID - ${session.getId()}")
    log.info("Creation Time - ${session.getCreationTime()}")
    log.info("Last Accessed Time - ${session.getLastAccessedTime()}")
    log.info("Max Inactive Interval - ${session.getMaxInactiveInterval}")
    log.info("***********************")
  }

  // Validate maxParticipants constraint
  private Boolean hasReachedMaxParticipants(meeting, us) {
    // Meeting object calls it maxUsers to build up the drama
    int maxParticipants = meeting.getMaxUsers();
    // When is set to 0, the validation is ignored
    Boolean enabled = maxParticipants > 0;
    // Users refreshing page or reconnecting must be identified
    Boolean rejoin = meeting.getUserById(us.internalUserId) != null;
    // Users that passed enter once, still not joined but somehow re-entered
    Boolean reenter = meeting.getEnteredUserById(us.internalUserId) != null;
    // Users that already joined the meeting
    int joinedUsers = meeting.getUsers().size()
    // Users that are entering the meeting
    int enteredUsers = meeting.getEnteredUsers().size()

    Boolean reachedMax = (joinedUsers + enteredUsers) >= maxParticipants;
    if (enabled && !rejoin && !reenter && reachedMax) {
      return true;
    }

    return false;
  }

  private void respondWithJSONError(msgKey, msgValue, destUrl) {
    response.addHeader("Cache-Control", "no-cache")
    withFormat {
      json {
        def builder = new JsonBuilder()
        builder.response {
          returncode RESP_CODE_FAILED
          messageKey msgKey
          message msgValue
          url destUrl
        }
        render(contentType: "application/json", text: builder.toPrettyString())
      }
    }
  }

  private void respondWithErrors(errorList, redirectResponse = false) {
    log.debug CONTROLLER_NAME + "#invalid"
    if (redirectResponse) {
      ArrayList<Object> errors = new ArrayList<Object>();
      errorList.getErrors().each { error ->
        Map<String, String> errorMap = new LinkedHashMap<String, String>()
        errorMap.put("key", error[0])
        errorMap.put("message", error[1])
        errors.add(errorMap)
      }

      JSONArray errorsJSONArray = new JSONArray(errors);
      log.debug errorsJSONArray

      respondWithRedirect(errorsJSONArray)
    } else {
      response.addHeader("Cache-Control", "no-cache")
      withFormat {
        xml {
          render(text: responseBuilder.buildErrors(errorList.getErrors(), RESP_CODE_FAILED), contentType: "text/xml")
        }
        json {
          log.debug "Rendering as json"
          def builder = new JsonBuilder()
          builder.response {
            returncode RESP_CODE_FAILED
            messageKey key
            message msg
          }
          render(contentType: "application/json", text: builder.toPrettyString())
        }
      }
    }
  }

  //TODO: method added for backward compatibility, it will be removed in next versions after 0.8
  private void invalid(key, msg, redirectResponse = false) {
    // Note: This xml scheme will be DEPRECATED.
    log.debug CONTROLLER_NAME + "#invalid " + msg
    if (redirectResponse) {
      ArrayList<Object> errors = new ArrayList<Object>();
      Map<String, String> errorMap = new LinkedHashMap<String, String>()
      errorMap.put("key", key)
      errorMap.put("message", msg)
      errors.add(errorMap)

      JSONArray errorsJSONArray = new JSONArray(errors)
      log.debug "JSON Errors {}", errorsJSONArray.toString()

      respondWithRedirect(errorsJSONArray)
    } else {
      response.addHeader("Cache-Control", "no-cache")
      withFormat {
        xml {
          render(text: responseBuilder.buildError(key, msg, RESP_CODE_FAILED), contentType: "text/xml")
        }
        json {
          log.debug "Rendering as json"
          def builder = new JsonBuilder()
          builder.response {
            returncode RESP_CODE_FAILED
            messageKey key
            message msg
          }
          render(contentType: "application/json", text: builder.toPrettyString())
        }
      }
    }
  }

  private void respondWithRedirect(errorsJSONArray) {
    String logoutUrl = paramsProcessorUtil.getDefaultLogoutUrl()
    URI oldUri = URI.create(logoutUrl)

    if (!StringUtils.isEmpty(params.logoutURL)) {
      try {
        oldUri = URI.create(params.logoutURL)
      } catch (Exception e) {
        // Do nothing, the variable oldUri was already initialized
      }
    }

    String newQuery = oldUri.getQuery();

    if (newQuery == null) {
      newQuery = "errors="
    } else {
      newQuery += "&" + "errors="
    }
    newQuery += errorsJSONArray

    URI newUri = new URI(oldUri.getScheme(), oldUri.getAuthority(), oldUri.getPath(), newQuery, oldUri.getFragment())

    log.debug "Constructed logout URL {}", newUri.toString()
    redirect(url: newUri)
  }

  private Map.Entry<String, String> validateRequest(ValidationService.ApiCall apiCall, Map<String, String[]> params, String queryString) {
    Map<String, String> violations = validationService.validate(apiCall, params, queryString)
    Map.Entry<String, String> response = null

    if(!violations.isEmpty()) {
      for (Map.Entry<String, String> violation: violations.entrySet()) {
        log.error violation.getValue()
      }
      for(Map.Entry<String, String> violation: violations.entrySet()) {
        response = new AbstractMap.SimpleEntry<String, String>(violation.getKey(), violation.getValue())
        break
      }
    }

    return response
  }

}

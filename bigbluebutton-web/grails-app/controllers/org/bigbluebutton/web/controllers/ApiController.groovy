/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
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
import org.bigbluebutton.api.domain.RecordingMetadata
import org.bigbluebutton.api.util.ResponseBuilder

import javax.servlet.ServletRequest;

import java.net.URI;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.DateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Map;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang.RandomStringUtils;
import org.apache.commons.lang.StringUtils;
import org.bigbluebutton.api.domain.Config;
import org.bigbluebutton.api.domain.Meeting;
import org.bigbluebutton.api.domain.Recording;
import org.bigbluebutton.api.domain.User;
import org.bigbluebutton.api.domain.UserSession;
import org.bigbluebutton.api.ApiErrors;
import org.bigbluebutton.api.ClientConfigService;
import org.bigbluebutton.api.MeetingService;
import org.bigbluebutton.api.ParamsProcessorUtil;
import org.bigbluebutton.api.Util;
import org.bigbluebutton.presentation.PresentationUrlDownloadService;
import org.bigbluebutton.presentation.UploadedPresentation
import org.bigbluebutton.web.services.PresentationService
import org.bigbluebutton.web.services.turn.StunTurnService;
import org.bigbluebutton.web.services.turn.TurnEntry;
import org.json.JSONArray;
import org.json.JSONObject;
import org.bigbluebutton.api.util.ResponseBuilder
import freemarker.template.Configuration;
import freemarker.cache.WebappTemplateLoader;
import java.io.File;

class ApiController {
  private static final Integer SESSION_TIMEOUT = 14400  // 4 hours
  private static final String CONTROLLER_NAME = 'ApiController'
  private static final String RESP_CODE_SUCCESS = 'SUCCESS'
  private static final String RESP_CODE_FAILED = 'FAILED'
  private static final String ROLE_MODERATOR = "MODERATOR";
  private static final String ROLE_ATTENDEE = "VIEWER";
  private static final String SECURITY_SALT = '639259d4-9dd8-4b25-bf01-95f9567eaf4b'
  private static final String API_VERSION = '0.81'
  private static final String REDIRECT_RESPONSE = true

  MeetingService meetingService;
  PresentationService presentationService
  ParamsProcessorUtil paramsProcessorUtil
  ClientConfigService configService
  PresentationUrlDownloadService presDownloadService
  StunTurnService stunTurnService



  /* general methods */
  def index = {
    log.debug CONTROLLER_NAME + "#index"
    response.addHeader("Cache-Control", "no-cache")
    withFormat {
      xml {
        render(contentType:"text/xml") {
          response() {
            returncode(RESP_CODE_SUCCESS)
            version(paramsProcessorUtil.getApiVersion())
          }
        }
      }
    }
  }

  /***********************************
   * BREAKOUT TEST (API)
   ***********************************/
  def breakout = {
    if(!StringUtils.isEmpty(params.meetingId)) {
      String meetingId = StringUtils.strip(params.meetingId);
      println("MeetingId = " + meetingId)
    } else {
      println("Missing meetingId")
      return
    }

    if (StringUtils.isEmpty(params.password)) {
      println("Missing password")
      return
    }
  }

  /***********************************
   * CREATE (API)
   ***********************************/
  def create = {
    String API_CALL = 'create'
    log.debug CONTROLLER_NAME + "#${API_CALL}"
    log.debug params

    // BEGIN - backward compatibility
    if (StringUtils.isEmpty(params.checksum)) {
      invalid("checksumError", "You did not pass the checksum security check")
      return
    }

    if(!StringUtils.isEmpty(params.meetingID)) {
      params.meetingID = StringUtils.strip(params.meetingID);
      if (StringUtils.isEmpty(params.meetingID)) {
        invalid("missingParamMeetingID", "You must specify a meeting ID for the meeting.");
        return
      }
    } else {
      invalid("missingParamMeetingID", "You must specify a meeting ID for the meeting.");
      return
    }

    if (! paramsProcessorUtil.isChecksumSame(API_CALL, params.checksum, request.getQueryString())) {
      invalid("checksumError", "You did not pass the checksum security check")
      return
    }
    // END - backward compatibility

    ApiErrors errors = new ApiErrors();
    paramsProcessorUtil.processRequiredCreateParams(params, errors);

    if (errors.hasErrors()) {
      respondWithErrors(errors)
      return
    }

    // Do we agree with the checksum? If not, complain.
    if (! paramsProcessorUtil.isChecksumSame(API_CALL, params.checksum, request.getQueryString())) {
      errors.checksumError()
      respondWithErrors(errors)
      return
    }

    Meeting newMeeting = paramsProcessorUtil.processCreateParams(params);

    if (meetingService.createMeeting(newMeeting)) {
      // See if the request came with pre-uploading of presentation.
      uploadDocuments(newMeeting);
      respondWithConference(newMeeting, null, null)
    } else {
      // Translate the external meeting id into an internal meeting id.
      String internalMeetingId = paramsProcessorUtil.convertToInternalMeetingId(params.meetingID);
      Meeting existing = meetingService.getNotEndedMeetingWithId(internalMeetingId);
      if (existing != null) {
        log.debug "Existing conference found"
        Map<String, Object> updateParams = paramsProcessorUtil.processUpdateCreateParams(params);
        if (existing.getViewerPassword().equals(params.get("attendeePW")) && existing.getModeratorPassword().equals(params.get("moderatorPW"))) {
          paramsProcessorUtil.updateMeeting(updateParams, existing);
          // trying to create a conference a second time, return success, but give extra info
          // Ignore pre-uploaded presentations. We only allow uploading of presentation once.
          //uploadDocuments(existing);
          respondWithConference(existing, "duplicateWarning", "This conference was already in existence and may currently be in progress.");
        } else {
          // BEGIN - backward compatibility
          invalid("idNotUnique", "A meeting already exists with that meeting ID.  Please use a different meeting ID.");
          return;
          // END - backward compatibility

          // enforce meetingID unique-ness
          errors.nonUniqueMeetingIdError()
          respondWithErrors(errors)
        }

        return;
      }
    }
  }

  /**********************************************
   * JOIN API
   *********************************************/
  def join = {
    String API_CALL = 'join'
    log.debug CONTROLLER_NAME + "#${API_CALL}"
    ApiErrors errors = new ApiErrors()

    // BEGIN - backward compatibility
    if (StringUtils.isEmpty(params.checksum)) {
      invalid("checksumError", "You did not pass the checksum security check", REDIRECT_RESPONSE)
      return
    }

    //checking for an empty username or for a username containing whitespaces only
    if(!StringUtils.isEmpty(params.fullName)) {
      params.fullName = StringUtils.strip(params.fullName);
      if (StringUtils.isEmpty(params.fullName)) {
        invalid("missingParamFullName", "You must specify a name for the attendee who will be joining the meeting.", REDIRECT_RESPONSE);
        return
      }
    } else {
      invalid("missingParamFullName", "You must specify a name for the attendee who will be joining the meeting.", REDIRECT_RESPONSE);
      return
    }

    if(!StringUtils.isEmpty(params.meetingID)) {
      params.meetingID = StringUtils.strip(params.meetingID);
      if (StringUtils.isEmpty(params.meetingID)) {
        invalid("missingParamMeetingID", "You must specify a meeting ID for the meeting.", REDIRECT_RESPONSE);
        return
      }
    } else {
      invalid("missingParamMeetingID", "You must specify a meeting ID for the meeting.", REDIRECT_RESPONSE);
      return
    }

    if (StringUtils.isEmpty(params.password)) {
      invalid("invalidPassword","You either did not supply a password or the password supplied is neither the attendee or moderator password for this conference.", REDIRECT_RESPONSE);
      return
    }

    if (!paramsProcessorUtil.isChecksumSame(API_CALL, params.checksum, request.getQueryString())) {
      invalid("checksumError", "You did not pass the checksum security check", REDIRECT_RESPONSE)
      return
    }

    // END - backward compatibility

    // Do we have a checksum? If none, complain.
    if (StringUtils.isEmpty(params.checksum)) {
      errors.missingParamError("checksum");
    }

    Boolean guest = false;
    if (!StringUtils.isEmpty(params.guest)) {
      guest = Boolean.parseBoolean(params.guest)
    }

    Boolean authenticated = false;
    if (!StringUtils.isEmpty(params.auth)) {
      authenticated = Boolean.parseBoolean(params.auth)
    }

    Boolean joinViaHtml5 = false;
    if (!StringUtils.isEmpty(params.joinViaHtml5)) {
      joinViaHtml5 = Boolean.parseBoolean(params.joinViaHtml5)
    }

    // Do we have a name for the user joining? If none, complain.
    if(!StringUtils.isEmpty(params.fullName)) {
      params.fullName = StringUtils.strip(params.fullName);
      if (StringUtils.isEmpty(params.fullName)) {
        errors.missingParamError("fullName");
      }
    } else {
      errors.missingParamError("fullName");
    }
    String fullName = params.fullName

    // Do we have a meeting id? If none, complain.
    if(!StringUtils.isEmpty(params.meetingID)) {
      params.meetingID = StringUtils.strip(params.meetingID);
      if (StringUtils.isEmpty(params.meetingID)) {
        errors.missingParamError("meetingID");
      }
    }
    else {
      errors.missingParamError("meetingID");
    }
    String externalMeetingId = params.meetingID

    // Do we have a password? If not, complain.
    String attPW = params.password
    if (StringUtils.isEmpty(attPW)) {
      errors.missingParamError("password");
    }

    // Do we agree on the checksum? If not, complain.
    if (! paramsProcessorUtil.isChecksumSame(API_CALL, params.checksum, request.getQueryString())) {
      errors.checksumError()
    }

    if (errors.hasErrors()) {
      respondWithErrors(errors, REDIRECT_RESPONSE)
      return
    }

    // Everything is good so far. Translate the external meeting id to an internal meeting id. If
    // we can't find the meeting, complain.
    String internalMeetingId = paramsProcessorUtil.convertToInternalMeetingId(externalMeetingId);

    log.info("Retrieving meeting ${internalMeetingId}")
    Meeting meeting = meetingService.getMeeting(internalMeetingId);
    if (meeting == null) {
      // BEGIN - backward compatibility
      invalid("invalidMeetingIdentifier", "The meeting ID that you supplied did not match any existing meetings", REDIRECT_RESPONSE);
      return;
      // END - backward compatibility

      errors.invalidMeetingIdError();
      respondWithErrors(errors, REDIRECT_RESPONSE)
      return;
    }

    // the createTime mismatch with meeting's createTime, complain
    // In the future, the createTime param will be required
    if (params.createTime != null) {
      long createTime = 0;
      try{
        createTime=Long.parseLong(params.createTime);
      } catch(Exception e){
        log.warn("could not parse createTime param");
        createTime = -1;
      }
      if(createTime != meeting.getCreateTime()) {
        // BEGIN - backward compatibility
        invalid("mismatchCreateTimeParam", "The createTime parameter submitted mismatches with the current meeting.", REDIRECT_RESPONSE);
        return;
        // END - backward compatibility

        errors.mismatchCreateTimeParam();
        respondWithErrors(errors, REDIRECT_RESPONSE);
        return;
      }
    }

    // Is this user joining a meeting that has been ended. If so, complain.
    if (meeting.isForciblyEnded()) {
      // BEGIN - backward compatibility
      invalid("meetingForciblyEnded", "You can not re-join a meeting that has already been forcibly ended.  However, once the meeting is removed from memory (according to the timeout configured on this server, you will be able to once again create a meeting with the same meeting ID", REDIRECT_RESPONSE);
      return;
      // END - backward compatibility

      errors.meetingForciblyEndedError();
      respondWithErrors(errors, REDIRECT_RESPONSE)
      return;
    }

    // Now determine if this user is a moderator or a viewer.
    String role = null;
    if (meeting.getModeratorPassword().equals(attPW)) {
      role = ROLE_MODERATOR;
    } else if (meeting.getViewerPassword().equals(attPW)) {
      role = ROLE_ATTENDEE;
    }

    if (role == null) {
      // BEGIN - backward compatibility
      invalid("invalidPassword","You either did not supply a password or the password supplied is neither the attendee or moderator password for this conference.", REDIRECT_RESPONSE);
      return
      // END - backward compatibility

      errors.invalidPasswordError()
      respondWithErrors(errors, REDIRECT_RESPONSE)
      return;
    }

    String webVoice = StringUtils.isEmpty(params.webVoiceConf) ? meeting.getTelVoice() : params.webVoiceConf

    boolean redirectImm = parseBoolean(params.redirectImmediately)

    // We preprend "w_" to our internal meeting Id to indicate that this is a web user.
    // For users joining using the phone, we will prepend "v_" so it will be easier
    // to distinguish users who doesn't have a web client. (ralam june 12, 2017)
    String internalUserID = "w_" + RandomStringUtils.randomAlphanumeric(12).toLowerCase()

    String authToken =  RandomStringUtils.randomAlphanumeric(12).toLowerCase()

    String sessionToken = RandomStringUtils.randomAlphanumeric(16).toLowerCase()

    String externUserID = params.userID
    if (StringUtils.isEmpty(externUserID)) {
      externUserID = internalUserID
    }

    //Return a Map with the user custom data
    Map<String,String> userCustomData = paramsProcessorUtil.getUserCustomData(params);

    //Currently, it's associated with the externalUserID
    if (userCustomData.size() > 0)
      meetingService.addUserCustomData(meeting.getInternalId(), externUserID, userCustomData);

    String configxml = null;

    if (! StringUtils.isEmpty(params.configToken)) {
      Config conf = meeting.getConfig(params.configToken);
      if (conf == null) {
        // Check if this config is one of our pre-built config
        configxml = configService.getConfig(params.configToken)
        if (configxml == null) {
          // BEGIN - backward compatibility
          invalid("noConfigFound","We could not find a config for this request.", REDIRECT_RESPONSE);
          return
          // END - backward compatibility

          errors.noConfigFound();
          respondWithErrors(errors);
        }
      } else {
        configxml = conf.config;
      }
    } else {
      Config conf = meeting.getDefaultConfig();
      if (conf == null) {
        // BEGIN - backward compatibility
        invalid("noConfigFound","We could not find a config for this request.", REDIRECT_RESPONSE);
        return
        // END - backward compatibility

        errors.noConfigFound();
        respondWithErrors(errors);
      } else {
        configxml = conf.config;
      }
    }

    if (StringUtils.isEmpty(configxml)) {
      // BEGIN - backward compatibility
      invalid("noConfigFound","We could not find a config for this request.", REDIRECT_RESPONSE);
      return
      // END - backward compatibility

      errors.noConfigFound();
      respondWithErrors(errors);
    }
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
    us.logoutUrl = meeting.getLogoutUrl();
    us.configXML = configxml;

    if (! StringUtils.isEmpty(params.defaultLayout)) {
      us.defaultLayout = params.defaultLayout;
    }

    if (! StringUtils.isEmpty(params.avatarURL)) {
      us.avatarURL = params.avatarURL;
    } else {
      us.avatarURL = meeting.defaultAvatarURL
    }

    session[sessionToken] = sessionToken
    meetingService.addUserSession(sessionToken, us);

    // Register user into the meeting.
    meetingService.registerUser(us.meetingID, us.internalUserId, us.fullname, us.role, us.externUserID,
            us.authToken, us.avatarURL, us.guest, us.authed)

    // Validate if the maxParticipants limit has been reached based on registeredUsers. If so, complain.
    // when maxUsers is set to 0, the validation is ignored
    int maxUsers = meeting.getMaxUsers();
    if (maxUsers > 0 && meeting.getRegisteredUsers().size() >= maxUsers) {
        // BEGIN - backward compatibility
        invalid("maxParticipantsReached","The number of participants allowed for this meeting has been reached.", REDIRECT_RESPONSE);
        return
        // END - backward compatibility

        errors.maxParticipantsReached();
        respondWithErrors(errors, REDIRECT_RESPONSE);
        return;
    }

    // Mark user as registered
    meeting.userRegistered(internalUserID);

    //Identify which of these to logs should be used. sessionToken or user-token
    log.info("Session sessionToken for " + us.fullname + " [" + session[sessionToken]+ "]")
    log.info("Session user-token for " + us.fullname + " [" + session['user-token'] + "]")
    session.setMaxInactiveInterval(SESSION_TIMEOUT);

    //check if exists the param redirect
    boolean redirectClient = true;
    String clientURL = paramsProcessorUtil.getDefaultClientUrl();

    // server-wide configuration:
    // Depending on configuration, prefer the HTML5 client over Flash for moderators
    if (paramsProcessorUtil.getModeratorsJoinViaHTML5Client() && role == ROLE_MODERATOR) {
      clientURL = paramsProcessorUtil.getHTML5ClientUrl();
    }

    // Depending on configuration, prefer the HTML5 client over Flash for attendees
    if (paramsProcessorUtil.getAttendeesJoinViaHTML5Client() && role == ROLE_ATTENDEE) {
      clientURL = paramsProcessorUtil.getHTML5ClientUrl();
    }

    // single client join configuration:
    // Depending on configuration, prefer the HTML5 client over Flash client
    if (joinViaHtml5) {
      clientURL = paramsProcessorUtil.getHTML5ClientUrl();
    } else {
      if(!StringUtils.isEmpty(params.clientURL)){
        clientURL = params.clientURL;
      }
    }

    if(! StringUtils.isEmpty(params.redirect)) {
      try{
        redirectClient = Boolean.parseBoolean(params.redirect);
      }catch(Exception e){
        redirectClient = true;
      }
    }


    if (redirectClient){
      String destUrl = clientURL + "?sessionToken=" + sessionToken
      log.info("Successfully joined. Redirecting to ${destUrl}");
      redirect(url: destUrl);
    } else {
      log.info("Successfully joined. Sending XML response.");
      response.addHeader("Cache-Control", "no-cache")
      withFormat {
        xml {
          render(contentType:"text/xml") {
            response() {
              returncode(RESP_CODE_SUCCESS)
              messageKey("successfullyJoined")
              message("You have joined successfully.")
              meeting_id() { mkp.yield(us.meetingID) }
              user_id(us.internalUserId)
              auth_token(us.authToken)
              session_token(session[sessionToken])
            }
          }
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

    // BEGIN - backward compatibility
    if (StringUtils.isEmpty(params.checksum)) {
      invalid("checksumError", "You did not pass the checksum security check")
      return
    }

    if(!StringUtils.isEmpty(params.meetingID)) {
      params.meetingID = StringUtils.strip(params.meetingID);
      if (StringUtils.isEmpty(params.meetingID)) {
        invalid("missingParamMeetingID", "You must specify a meeting ID for the meeting.");
        return
      }
    } else {
      invalid("missingParamMeetingID", "You must specify a meeting ID for the meeting.");
      return
    }

    if (! paramsProcessorUtil.isChecksumSame(API_CALL, params.checksum, request.getQueryString())) {
      invalid("checksumError", "You did not pass the checksum security check")
      return
    }
    // END - backward compatibility

    ApiErrors errors = new ApiErrors()

    // Do we have a checksum? If none, complain.
    if (StringUtils.isEmpty(params.checksum)) {
      errors.missingParamError("checksum");
    }

    // Do we have a meeting id? If none, complain.
    if(!StringUtils.isEmpty(params.meetingID)) {
      params.meetingID = StringUtils.strip(params.meetingID);
      if (StringUtils.isEmpty(params.meetingID)) {
        errors.missingParamError("meetingID");
      }
    } else {
      errors.missingParamError("meetingID");
    }
    String externalMeetingId = params.meetingID


    if (errors.hasErrors()) {
      respondWithErrors(errors)
      return
    }

    // Do we agree on the checksum? If not, complain.
    if (! paramsProcessorUtil.isChecksumSame(API_CALL, params.checksum, request.getQueryString())) {
      errors.checksumError()
      respondWithErrors(errors)
      return
    }

    // Everything is good so far. Translate the external meeting id to an internal meeting id. If
    // we can't find the meeting, complain.
    String internalMeetingId = paramsProcessorUtil.convertToInternalMeetingId(externalMeetingId);
    log.info("Retrieving meeting ${internalMeetingId}")
    Meeting meeting = meetingService.getMeeting(internalMeetingId);
    boolean isRunning = meeting != null && meeting.isRunning();

    response.addHeader("Cache-Control", "no-cache")
    withFormat {
      xml {
        render(contentType:"text/xml") {
          response() {
            returncode(RESP_CODE_SUCCESS)
            running(isRunning ? "true" : "false")
          }
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

    // BEGIN - backward compatibility
    if (StringUtils.isEmpty(params.checksum)) {
      invalid("checksumError", "You did not pass the checksum security check")
      return
    }

    if(!StringUtils.isEmpty(params.meetingID)) {
      params.meetingID = StringUtils.strip(params.meetingID);
      if (StringUtils.isEmpty(params.meetingID)) {
        invalid("missingParamMeetingID", "You must specify a meeting ID for the meeting.");
        return
      }
    } else {
      invalid("missingParamMeetingID", "You must specify a meeting ID for the meeting.");
      return
    }

    if (StringUtils.isEmpty(params.password)) {
      invalid("invalidPassword","You must supply the moderator password for this call.");
      return
    }

    if (! paramsProcessorUtil.isChecksumSame(API_CALL, params.checksum, request.getQueryString())) {
      invalid("checksumError", "You did not pass the checksum security check")
      return
    }
    // END - backward compatibility

    ApiErrors errors = new ApiErrors()

    // Do we have a checksum? If none, complain.
    if (StringUtils.isEmpty(params.checksum)) {
      errors.missingParamError("checksum");
    }

    // Do we have a meeting id? If none, complain.
    if(!StringUtils.isEmpty(params.meetingID)) {
      params.meetingID = StringUtils.strip(params.meetingID);
      if (StringUtils.isEmpty(params.meetingID)) {
        errors.missingParamError("meetingID");
      }
    } else {
      errors.missingParamError("meetingID");
    }
    String externalMeetingId = params.meetingID

    // Do we have a password? If not, complain.
    String modPW = params.password
    if (StringUtils.isEmpty(modPW)) {
      errors.missingParamError("password");
    }

    if (errors.hasErrors()) {
      respondWithErrors(errors)
      return
    }

    // Do we agree on the checksum? If not, complain.
    if (! paramsProcessorUtil.isChecksumSame(API_CALL, params.checksum, request.getQueryString())) {
      errors.checksumError()
      respondWithErrors(errors)
      return
    }

    // Everything is good so far. Translate the external meeting id to an internal meeting id. If
    // we can't find the meeting, complain.
    String internalMeetingId = paramsProcessorUtil.convertToInternalMeetingId(externalMeetingId);
    log.info("Retrieving meeting ${internalMeetingId}")
    Meeting meeting = meetingService.getMeeting(internalMeetingId);
    if (meeting == null) {
      // BEGIN - backward compatibility
      invalid("notFound", "We could not find a meeting with that meeting ID - perhaps the meeting is not yet running?");
      return;
      // END - backward compatibility

      errors.invalidMeetingIdError();
      respondWithErrors(errors)
      return;
    }

    if (meeting.getModeratorPassword().equals(modPW) == false) {
      // BEGIN - backward compatibility
      invalid("invalidPassword","You must supply the moderator password for this call.");
      return;
      // END - backward compatibility

      errors.invalidPasswordError();
      respondWithErrors(errors)
      return;
    }

    meetingService.endMeeting(meeting.getInternalId());

    response.addHeader("Cache-Control", "no-cache")
    withFormat {
      xml {
        render(contentType:"text/xml") {
          response() {
            returncode(RESP_CODE_SUCCESS)
            messageKey("sentEndMeetingRequest")
            message("A request to end the meeting was sent.  Please wait a few seconds, and then use the getMeetingInfo or isMeetingRunning API calls to verify that it was ended.")
          }
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

    // BEGIN - backward compatibility
    if (StringUtils.isEmpty(params.checksum)) {
      invalid("checksumError", "You did not pass the checksum security check")
      return
    }

    if(!StringUtils.isEmpty(params.meetingID)) {
      params.meetingID = StringUtils.strip(params.meetingID);
      if (StringUtils.isEmpty(params.meetingID)) {
        invalid("missingParamMeetingID", "You must specify a meeting ID for the meeting.");
        return
      }
    } else {
      invalid("missingParamMeetingID", "You must specify a meeting ID for the meeting.");
      return
    }

    if (! paramsProcessorUtil.isChecksumSame(API_CALL, params.checksum, request.getQueryString())) {
      invalid("checksumError", "You did not pass the checksum security check")
      return
    }
    // END - backward compatibility

    ApiErrors errors = new ApiErrors()

    // Do we have a checksum? If none, complain.
    if (StringUtils.isEmpty(params.checksum)) {
      errors.missingParamError("checksum");
    }

    // Do we have a meeting id? If none, complain.
    if(!StringUtils.isEmpty(params.meetingID)) {
      params.meetingID = StringUtils.strip(params.meetingID);
      if (StringUtils.isEmpty(params.meetingID)) {
        errors.missingParamError("meetingID");
      }
    } else {
      errors.missingParamError("meetingID");
    }
    String externalMeetingId = params.meetingID

    if (errors.hasErrors()) {
      respondWithErrors(errors)
      return
    }

    // Do we agree on the checksum? If not, complain.
    if (! paramsProcessorUtil.isChecksumSame(API_CALL, params.checksum, request.getQueryString())) {
      errors.checksumError()
      respondWithErrors(errors)
      return
    }

    // Everything is good so far. Translate the external meeting id to an internal meeting id. If
    // we can't find the meeting, complain.
    String internalMeetingId = paramsProcessorUtil.convertToInternalMeetingId(externalMeetingId);
    log.info("Retrieving meeting ${internalMeetingId}")
    Meeting meeting = meetingService.getMeeting(internalMeetingId);
    if (meeting == null) {
      // BEGIN - backward compatibility
      invalid("notFound", "We could not find a meeting with that meeting ID");
      return;
      // END - backward compatibility

      errors.invalidMeetingIdError();
      respondWithErrors(errors)
      return;
    }

    def templateLoc = getServletContext().getRealPath("/WEB-INF/freemarker")
    ResponseBuilder responseBuilder = new ResponseBuilder(new File(templateLoc))

    def xmlText = responseBuilder.buildGetMeetingInfoResponse(meeting, RESP_CODE_SUCCESS)
    withFormat {
      xml {
        render(text: xmlText, contentType: "text/xml")
      }
    }
  }

  /************************************
   *  GETMEETINGS API
   ************************************/
  def getMeetingsHandler = {
    String API_CALL = "getMeetings"
    log.debug CONTROLLER_NAME + "#${API_CALL}"

    // BEGIN - backward compatibility
    if (StringUtils.isEmpty(params.checksum)) {
      invalid("checksumError", "You did not pass the checksum security check")
      return
    }

    if (! paramsProcessorUtil.isChecksumSame(API_CALL, params.checksum, request.getQueryString())) {
      invalid("checksumError", "You did not pass the checksum security check")
      return
    }
    // END - backward compatibility

    ApiErrors errors = new ApiErrors()

    // Do we have a checksum? If none, complain.
    if (StringUtils.isEmpty(params.checksum)) {
      errors.missingParamError("checksum");
    }

    if (errors.hasErrors()) {
      respondWithErrors(errors)
      return
    }

    // Do we agree on the checksum? If not, complain.
    if (! paramsProcessorUtil.isChecksumSame(API_CALL, params.checksum, request.getQueryString())) {
      errors.checksumError()
      respondWithErrors(errors)
      return
    }

    Collection<Meeting> mtgs = meetingService.getMeetings();

    if (mtgs == null || mtgs.isEmpty()) {
      response.addHeader("Cache-Control", "no-cache")
      withFormat {
        xml {
          render(contentType:"text/xml") {
            response() {
              returncode(RESP_CODE_SUCCESS)
              meetings()
              messageKey("noMeetings")
              message("no meetings were found on this server")
            }
          }
        }
      }
    } else {
      response.addHeader("Cache-Control", "no-cache")

      def templateLoc = getServletContext().getRealPath("/WEB-INF/freemarker")
      ResponseBuilder responseBuilder = new ResponseBuilder(new File(templateLoc))

      def xmlText = responseBuilder.buildGetMeetingsResponse(mtgs, RESP_CODE_SUCCESS)
      withFormat {
        xml {
          render(text: xmlText, contentType: "text/xml")
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

    // BEGIN - backward compatibility
    if (StringUtils.isEmpty(params.checksum)) {
      invalid("checksumError", "You did not pass the checksum security check")
      return
    }

    if (! paramsProcessorUtil.isChecksumSame(API_CALL, params.checksum, request.getQueryString())) {
      invalid("checksumError", "You did not pass the checksum security check")
      return
    }
    // END - backward compatibility

    ApiErrors errors = new ApiErrors()

    // Do we have a checksum? If none, complain.
    if (StringUtils.isEmpty(params.checksum)) {
      errors.missingParamError("checksum");
    }

    if (errors.hasErrors()) {
      respondWithErrors(errors)
      return
    }

    // Do we agree on the checksum? If not, complain.
    if (! paramsProcessorUtil.isChecksumSame(API_CALL, params.checksum, request.getQueryString())) {
      errors.checksumError()
      respondWithErrors(errors)
      return
    }

    Collection<Meeting> sssns = meetingService.getSessions();

    if (sssns == null || sssns.isEmpty()) {
      response.addHeader("Cache-Control", "no-cache")
      withFormat {
        xml {
          render(contentType:"text/xml") {
            response() {
              returncode(RESP_CODE_SUCCESS)
              sessions()
              messageKey("noSessions")
              message("no sessions were found on this server")
            }
          }
        }
      }
    } else {
      response.addHeader("Cache-Control", "no-cache")
      withFormat {
        xml {
          render(contentType:"text/xml") {
            response() {
              returncode(RESP_CODE_SUCCESS)
              sessions {
                for (m in sssns) {
                  meeting {
                    meetingID() { mkp.yield(m.meetingID) }
                    meetingName() { mkp.yield(m.conferencename) }
                    userName() { mkp.yield(m.fullname) }
                  }
                }
              }
            }
          }
        }
      }
    }
  }


  private Map<String, String[]> getParameters(ServletRequest request) {
    // Copy the parameters into our own Map as we can't pass the paramMap
    // from the request as it's an unmodifiable map.
    Map<String, String[]> reqParams = new HashMap<String, String[]>();
    Map<String, String[]> unModReqParams = request.getParameterMap();

    SortedSet<String> keys = new TreeSet<String>(unModReqParams.keySet());

    for (String key: keys) {
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

    if (StringUtils.isEmpty(params.checksum)) {
      invalid("checksumError", "You did not pass the checksum security check")
      return
    }

    if (StringUtils.isEmpty(params.pollXML)) {
      invalid("configXMLError", "You did not pass a poll XML")
      return
    }

    if(!StringUtils.isEmpty(params.meetingID)) {
      params.meetingID = StringUtils.strip(params.meetingID);
      if (StringUtils.isEmpty(params.meetingID)) {
        invalid("missingParamMeetingID", "You must specify a meeting ID for the meeting.");
        return
      }
    } else {
      invalid("missingParamMeetingID", "You must specify a meeting ID for the meeting.");
      return
    }

    // Translate the external meeting id into an internal meeting id.
    String internalMeetingId = paramsProcessorUtil.convertToInternalMeetingId(params.meetingID);
    Meeting meeting = meetingService.getMeeting(internalMeetingId);
    if (meeting == null) {
      // BEGIN - backward compatibility
      invalid("invalidMeetingIdentifier", "The meeting ID that you supplied did not match any existing meetings");
      return;
      // END - backward compatibility
    }

    Map<String, String[]> reqParams = getParameters(request)

    String pollXML = params.pollXML

    String decodedPollXML;

    try {
      decodedPollXML = URLDecoder.decode(pollXML, "UTF-8");
    } catch (UnsupportedEncodingException e) {
      log.error("Couldn't decode poll XML.");
      invalid("pollXMLError", "Cannot decode poll XML")
      return;
    }

    if (! paramsProcessorUtil.isPostChecksumSame(API_CALL, reqParams)) {
      response.addHeader("Cache-Control", "no-cache")
      withFormat {
        xml {
          render(contentType:"text/xml") {
            response() {
              returncode("FAILED")
              messageKey("pollXMLChecksumError")
              message("pollXMLChecksumError: request did not pass the checksum security check.")
            }
          }
        }
      }
    } else {

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
          render(contentType:"text/xml") {
            response() { returncode("SUCCESS") }
          }
        }
      }
    }
  }

  /***********************************************
   * CONFIG API
   ***********************************************/
  def setConfigXML = {
    String API_CALL = "setConfigXML"
    log.debug CONTROLLER_NAME + "#${API_CALL}"

    if (StringUtils.isEmpty(params.checksum)) {
      invalid("checksumError", "You did not pass the checksum security check")
      return
    }

    if (StringUtils.isEmpty(params.configXML)) {
      invalid("configXMLError", "You did not pass a config XML")
      return
    }

    if(!StringUtils.isEmpty(params.meetingID)) {
      params.meetingID = StringUtils.strip(params.meetingID);
      if (StringUtils.isEmpty(params.meetingID)) {
        invalid("missingParamMeetingID", "You must specify a meeting ID for the meeting.");
        return
      }
    } else {
      invalid("missingParamMeetingID", "You must specify a meeting ID for the meeting.");
      return
    }

    // Translate the external meeting id into an internal meeting id.
    String internalMeetingId = paramsProcessorUtil.convertToInternalMeetingId(params.meetingID);
    Meeting meeting = meetingService.getMeeting(internalMeetingId);
    if (meeting == null) {
      // BEGIN - backward compatibility
      invalid("invalidMeetingIdentifier", "The meeting ID that you supplied did not match any existing meetings");
      return;
      // END - backward compatibility
    }

    Map<String, String[]> reqParams = getParameters(request)

    String configXML = params.configXML

    String decodedConfigXML;

    try {
      decodedConfigXML = URLDecoder.decode(configXML, "UTF-8");
    } catch (UnsupportedEncodingException e) {
      log.error("Couldn't decode config XML.");
      invalid("configXMLError", "Cannot decode config XML")
      return;
    }

    if (! paramsProcessorUtil.isPostChecksumSame(API_CALL, reqParams)) {
      response.addHeader("Cache-Control", "no-cache")
      withFormat {
        xml {
          render(contentType:"text/xml") {
            response() {
              returncode("FAILED")
              messageKey("configXMLChecksumError")
              message("configXMLChecksumError: request did not pass the checksum security check.")
            }
          }
        }
      }
    } else {
      boolean defaultConfig = false;

      if (! StringUtils.isEmpty(params.defaultConfig)) {
        try {
          defaultConfig = Boolean.parseBoolean(params.defaultConfig);
        } catch(Exception e) {
          defaultConfig = false;
        }
      }

      String token = meeting.storeConfig(defaultConfig, decodedConfigXML);
      response.addHeader("Cache-Control", "no-cache")
      withFormat {
        xml {
          render(contentType:"text/xml") {
            response() {
              returncode("SUCCESS")
              configToken(token)
            }
          }
        }
      }
    }
  }

    def getDefaultConfigXML = {

        String API_CALL = "getDefaultConfigXML"
        ApiErrors errors = new ApiErrors();

        // BEGIN - backward compatibility
        if (StringUtils.isEmpty(params.checksum)) {
            invalid("checksumError", "You did not pass the checksum security check")
            return
        }

        if (!paramsProcessorUtil.isChecksumSame(API_CALL, params.checksum, request.getQueryString())) {
            invalid("checksumError", "You did not pass the checksum security check")
            return
        }
        // END - backward compatibility


        // Do we agree on the checksum? If not, complain.
        if (!paramsProcessorUtil.isChecksumSame(API_CALL, params.checksum, request.getQueryString())) {
            errors.checksumError()
            respondWithErrors(errors)
            return
        }

        String defConfigXML = paramsProcessorUtil.getDefaultConfigXML();

        response.addHeader("Cache-Control", "no-cache")
        render text: defConfigXML, contentType: 'text/xml'
    }

  def configXML = {
    String API_CALL = 'configXML'
    log.debug CONTROLLER_NAME + "#${API_CALL}"

    String logoutUrl = paramsProcessorUtil.getDefaultLogoutUrl()
    boolean reject = false
    String sessionToken = null
    UserSession us = null

    if (StringUtils.isEmpty(params.sessionToken)) {
      log.info("No session for user in conference.")
      reject = true
    } else {
      sessionToken = StringUtils.strip(params.sessionToken)
      log.info("Getting ConfigXml for SessionToken = " + sessionToken)
      if (!session[sessionToken]) {
          reject = true
      } else {
          us = meetingService.getUserSession(sessionToken);
          if (us == null) reject = true
      }
    }

    if (reject) {
      response.addHeader("Cache-Control", "no-cache")
      withFormat {
        xml {
          render(contentType:"text/xml") {
            response() {
              returncode("FAILED")
              message("Could not find conference.")
              logoutURL() { mkp.yield(logoutUrl) }
            }
          }
        }
      }
    } else {
      Map<String, Object> logData = new HashMap<String, Object>();
      logData.put("meetingId", us.meetingID);
      logData.put("externalMeetingId", us.externMeetingID);
      logData.put("name", us.fullname);
      logData.put("userId", us.internalUserId);
      logData.put("sessionToken", sessionToken);
      logData.put("message", "handle_configxml_api");
      logData.put("description", "Handling ConfigXml API.");

      Gson gson = new Gson();
      String logStr = gson.toJson(logData);

      log.info(logStr);

      response.addHeader("Cache-Control", "no-cache")
      render text: us.configXML, contentType: 'text/xml'
    }
  }

  /***********************************************
   * ENTER API
   ***********************************************/
  def enter = {
    boolean reject = false;

    if (StringUtils.isEmpty(params.sessionToken)) {
      println("SessionToken is missing.")
    }

    String sessionToken = StringUtils.strip(params.sessionToken)

    UserSession us = null;
    Meeting meeting = null;

    if (!session[sessionToken]) {
      reject = true;
    } else {
      if (meetingService.getUserSession(sessionToken) == null) {
        reject = true;
      } else {
        us = meetingService.getUserSession(sessionToken)
        meeting = meetingService.getMeeting(us.meetingID);
        if (meeting == null || meeting.isForciblyEnded()) {
          reject = true
        }
      }
    }

    if (reject) {
      log.info("No session for user in conference.")

      // Determine the logout url so we can send the user there.
      String logoutUrl = paramsProcessorUtil.getDefaultLogoutUrl()

      if (us != null) {
        logoutUrl = us.logoutUrl
      }

      response.addHeader("Cache-Control", "no-cache")
      withFormat {
        json {
          render(contentType: "application/json") {
            response = {
              returncode = "FAILED"
              message = "Could not find conference."
              logoutURL = logoutUrl
            }
          }
        }
      }
    } else {

      Map<String,String> userCustomData = paramsProcessorUtil.getUserCustomData(params);

      // Generate a new userId for this user. This prevents old connections from
      // removing the user when the user reconnects after being disconnected. (ralam jan 22, 2015)
      // We use underscore (_) to associate userid with the user. We are also able to track
      // how many times a user reconnects or refresh the browser.
      String newInternalUserID = us.internalUserId //+ "_" + us.incrementConnectionNum()

      Map<String, Object> logData = new HashMap<String, Object>();
      logData.put("meetingId", us.meetingID);
      logData.put("externalMeetingId", us.externMeetingID);
      logData.put("name", us.fullname);
      logData.put("userId", newInternalUserID);
      logData.put("sessionToken", sessionToken);
      logData.put("message", "handle_enter_api");
      logData.put("description", "Handling ENTER API.");

      Gson gson = new Gson();
      String logStr = gson.toJson(logData);

      log.info(logStr);

      response.addHeader("Cache-Control", "no-cache")
      withFormat {
        json {
          render(contentType: "application/json") {
            response = {
              returncode = "SUCCESS"
              fullname = us.fullname
              confname = us.conferencename
              meetingID = us.meetingID
              externMeetingID = us.externMeetingID
              externUserID = us.externUserID
              internalUserID = newInternalUserID
              authToken = us.authToken
              role = us.role
              guest = us.guest
              conference = us.conference
              room = us.room
              voicebridge = us.voicebridge
              dialnumber = meeting.getDialNumber()
              webvoiceconf = us.webvoiceconf
              mode = us.mode
              record = us.record
              isBreakout = meeting.isBreakout()
              logoutTimer = meeting.getLogoutTimer()
              allowStartStopRecording = meeting.getAllowStartStopRecording()
              welcome = us.welcome
              if (! StringUtils.isEmpty(meeting.moderatorOnlyMessage))
                modOnlyMessage = meeting.moderatorOnlyMessage

              customLogoURL = meeting.getCustomLogoURL()
              customCopyright = meeting.getCustomCopyright()
              muteOnStart = meeting.getMuteOnStart()
              logoutUrl = us.logoutUrl
              defaultLayout = us.defaultLayout
              avatarURL = us.avatarURL
              customdata = array {
                userCustomData.each { k, v ->
                  // Somehow we need to prepend something (custdata) for the JSON to work
                  custdata "$k" : v
                }
              }
              metadata = array {
                meeting.getMetadata().each{ k, v ->
                  metadata "$k" : v
                }
              }
            }
          }
        }
      }
    }
  }

  /***********************************************
   * STUN/TURN API
   ***********************************************/
  def stuns = {
    boolean reject = false;

    UserSession us = null;
    Meeting meeting = null;
    String sessionToken = null

    if (!StringUtils.isEmpty(params.sessionToken)) {
      sessionToken = StringUtils.strip(params.sessionToken)
      println("Session token = [" + sessionToken + "]")
    }

    if (!session[sessionToken]) {
      reject = true;
    } else {
      if (meetingService.getUserSession(session[sessionToken]) == null)
        reject = true;
      else {
        us = meetingService.getUserSession(session[sessionToken]);
        meeting = meetingService.getMeeting(us.meetingID);
        if (meeting == null || meeting.isForciblyEnded()) {
          reject = true
        }
      }
    }

    if (reject) {
      log.info("No session for user in conference.")

      String logoutUrl = paramsProcessorUtil.getDefaultLogoutUrl()

      response.addHeader("Cache-Control", "no-cache")
      withFormat {
        json {
          render(contentType: "application/json") {
            response = {
              returncode = "FAILED"
              message = "Could not find conference."
              logoutURL = logoutUrl
            }
          }
        }
      }
    } else {
      Set<String> stuns = stunTurnService.getStunServers()
      Set<TurnEntry> turns = stunTurnService.getStunAndTurnServersFor(us.internalUserId)
      Set<String> candidates = stunTurnService.getRemoteIceCandidates()

      response.addHeader("Cache-Control", "no-cache")
      withFormat {
        json {
          render(contentType: "application/json") {
            stunServers = array {
              stuns.each { stun ->
                stunData = { url = stun.url }
              }
            }
            turnServers = array {
              turns.each { turn ->
                turnData = {
                  username = turn.username
                  password = turn.password
                  url = turn.url
                  ttl = turn.ttl
                }
              }
            }
            remoteIceCandidates = array {
              candidates.each { candidate ->
                candidateData = { ip = candidate.ip }
              }
            }
          }
        }
      }
    }
  }


  /*************************************************
   * SIGNOUT API
   *************************************************/
  def signOut = {

    String sessionToken = null

    if (! StringUtils.isEmpty(params.sessionToken)) {
      sessionToken = StringUtils.strip(params.sessionToken)
      println("SessionToken = " + sessionToken)
    }

    Meeting meeting = null;

    if (sessionToken != null) {
      log.info("Found session for user in conference.")
      UserSession us = meetingService.removeUserSession(sessionToken);
      session.removeAttribute(sessionToken)
    }

    response.addHeader("Cache-Control", "no-cache")
    withFormat {
      xml {
        render(contentType:"text/xml") {
          response() { returncode(RESP_CODE_SUCCESS) }
        }
      }
    }
  }

  /******************************************************
   * GET_RECORDINGS API
   ******************************************************/
  def getRecordingsHandler = {
    String API_CALL = "getRecordings"
    log.debug CONTROLLER_NAME + "#${API_CALL}"

    // BEGIN - backward compatibility
    if (StringUtils.isEmpty(params.checksum)) {
      invalid("checksumError", "You did not pass the checksum security check")
      return
    }

    if (! paramsProcessorUtil.isChecksumSame(API_CALL, params.checksum, request.getQueryString())) {
      invalid("checksumError", "You did not pass the checksum security check")
      return
    }
    // END - backward compatibility

    ApiErrors errors = new ApiErrors()

    // Do we have a checksum? If none, complain.
    if (StringUtils.isEmpty(params.checksum)) {
      errors.missingParamError("checksum");
      respondWithErrors(errors)
      return
    }

    log.debug  request.getQueryString()

    // Do we agree on the checksum? If not, complain.
    if (! paramsProcessorUtil.isChecksumSame(API_CALL, params.checksum, request.getQueryString())) {
      errors.checksumError()
      respondWithErrors(errors)
      return
    }

    List<String> externalMeetingIds = new ArrayList<String>();
    if (!StringUtils.isEmpty(params.meetingID)) {
      externalMeetingIds=paramsProcessorUtil.decodeIds(params.meetingID);
    }

    ArrayList<String> internalRecordIds = new ArrayList<String>()
    if (!StringUtils.isEmpty(params.recordID)) {
      internalRecordIds = paramsProcessorUtil.decodeIds(params.recordID)
    }

    ArrayList<String> states = new ArrayList<String>()
    if (!StringUtils.isEmpty(params.state)) {
      states = paramsProcessorUtil.decodeIds(params.state)
    }

    // Everything is good so far.
    if ( internalRecordIds.size() == 0 && externalMeetingIds.size() > 0 ) {
      // No recordIDs, process the request based on meetingID(s)
      // Translate the external meeting ids to internal meeting ids (which is the seed for the recordIDs).
      internalRecordIds = paramsProcessorUtil.convertToInternalMeetingId(externalMeetingIds);
    }

    for(String intRecId : internalRecordIds){
      log.debug intRecId
    }

    Map<String, String> metadataFilters = ParamsProcessorUtil.processMetaParam(params);

    def getRecordingsResult = meetingService.getRecordings2x(internalRecordIds, states, metadataFilters)

    withFormat {
      xml {
        render(text: getRecordingsResult, contentType: "text/xml")
      }
    }
  }

  /******************************************************
   * PUBLISH_RECORDINGS API
   ******************************************************/
  def publishRecordings = {
    String API_CALL = "publishRecordings"
    log.debug CONTROLLER_NAME + "#${API_CALL}"

    // BEGIN - backward compatibility
    if (StringUtils.isEmpty(params.checksum)) {
      invalid("checksumError", "You did not pass the checksum security check")
      return
    }

    if (StringUtils.isEmpty(params.recordID)) {
      invalid("missingParamRecordID", "You must specify a recordID.");
      return
    }

    if (StringUtils.isEmpty(params.publish)) {
      invalid("missingParamPublish", "You must specify a publish value true or false.");
      return
    }

    if (! paramsProcessorUtil.isChecksumSame(API_CALL, params.checksum, request.getQueryString())) {
      invalid("checksumError", "You did not pass the checksum security check")
      return
    }
    // END - backward compatibility

    ApiErrors errors = new ApiErrors()

    // Do we have a checksum? If none, complain.
    if (StringUtils.isEmpty(params.checksum)) {
      errors.missingParamError("checksum");
    }

    // Do we have a recording id? If none, complain.
    String recordId = params.recordID
    if (StringUtils.isEmpty(recordId)) {
      errors.missingParamError("recordID");
    }
    // Do we have a publish status? If none, complain.
    String publish = params.publish
    if (StringUtils.isEmpty(publish)) {
      errors.missingParamError("publish");
    }

    if (errors.hasErrors()) {
      respondWithErrors(errors)
      return
    }

    // Do we agree on the checksum? If not, complain.
    if (! paramsProcessorUtil.isChecksumSame(API_CALL, params.checksum, request.getQueryString())) {
      errors.checksumError()
      respondWithErrors(errors)
      return
    }

    ArrayList<String> recordIdList = new ArrayList<String>();
    if (!StringUtils.isEmpty(recordId)) {
      recordIdList=paramsProcessorUtil.decodeIds(recordId);
    }

    if (!meetingService.existsAnyRecording(recordIdList)) {
      // BEGIN - backward compatibility
      invalid("notFound", "We could not find recordings");
      return;
      // END - backward compatibility

    }

    meetingService.setPublishRecording(recordIdList,publish.toBoolean());
    withFormat {
      xml {
        render(contentType:"text/xml") {
          response() {
            returncode(RESP_CODE_SUCCESS)
            published(publish)
          }
        }
      }
    }
  }

  /******************************************************
   * DELETE_RECORDINGS API
   ******************************************************/
  def deleteRecordings = {
    String API_CALL = "deleteRecordings"
    log.debug CONTROLLER_NAME + "#${API_CALL}"

    // BEGIN - backward compatibility
    if (StringUtils.isEmpty(params.checksum)) {
      invalid("checksumError", "You did not pass the checksum security check")
      return
    }

    if (StringUtils.isEmpty(params.recordID)) {
      invalid("missingParamRecordID", "You must specify a recordID.");
      return
    }

    if (! paramsProcessorUtil.isChecksumSame(API_CALL, params.checksum, request.getQueryString())) {
      invalid("checksumError", "You did not pass the checksum security check")
      return
    }
    // END - backward compatibility

    ApiErrors errors = new ApiErrors()

    // Do we have a checksum? If none, complain.
    if (StringUtils.isEmpty(params.checksum)) {
      errors.missingParamError("checksum");
    }

    // Do we have a recording id? If none, complain.
    String recordId = params.recordID
    if (StringUtils.isEmpty(recordId)) {
      errors.missingParamError("recordID");
    }

    if (errors.hasErrors()) {
      respondWithErrors(errors)
      return
    }

    // Do we agree on the checksum? If not, complain.
    if (! paramsProcessorUtil.isChecksumSame(API_CALL, params.checksum, request.getQueryString())) {
      errors.checksumError()
      respondWithErrors(errors)
      return
    }

    List<String> recordIdList = new ArrayList<String>();
    if (!StringUtils.isEmpty(recordId)) {
      recordIdList=paramsProcessorUtil.decodeIds(recordId);
    }

    if (!meetingService.existsAnyRecording(recordIdList)) {
      // BEGIN - backward compatibility
      invalid("notFound", "We could not find recordings");
      return;
      // END - backward compatibility
    }

    meetingService.deleteRecordings(recordIdList);
    withFormat {
      xml {
        render(contentType:"text/xml") {
          response() {
            returncode(RESP_CODE_SUCCESS)
            deleted(true)
          }
        }
      }
    }
  }

  /******************************************************
   * UPDATE_RECORDINGS API
   ******************************************************/
   def updateRecordingsHandler = {
     String API_CALL = "updateRecordings"
     log.debug CONTROLLER_NAME + "#${API_CALL}"

     // BEGIN - backward compatibility
     if (StringUtils.isEmpty(params.checksum)) {
       invalid("checksumError", "You did not pass the checksum security check")
       return
     }

     if (StringUtils.isEmpty(params.recordID)) {
       invalid("missingParamRecordID", "You must specify a recordID.");
       return
     }

     if (! paramsProcessorUtil.isChecksumSame(API_CALL, params.checksum, request.getQueryString())) {
       invalid("checksumError", "You did not pass the checksum security check")
       return
     }
     // END - backward compatibility

     ApiErrors errors = new ApiErrors()

     // Do we have a checksum? If none, complain.
     if (StringUtils.isEmpty(params.checksum)) {
       errors.missingParamError("checksum");
     }

     // Do we have a recording id? If none, complain.
     String recordId = params.recordID
     if (StringUtils.isEmpty(recordId)) {
       errors.missingParamError("recordID");
     }

     if (errors.hasErrors()) {
       respondWithErrors(errors)
       return
     }

     // Do we agree on the checksum? If not, complain.
     if (! paramsProcessorUtil.isChecksumSame(API_CALL, params.checksum, request.getQueryString())) {
       errors.checksumError()
       respondWithErrors(errors)
       return
     }

     List<String> recordIdList = new ArrayList<String>();
     if (!StringUtils.isEmpty(recordId)) {
       recordIdList=paramsProcessorUtil.decodeIds(recordId);
     }

     if (!meetingService.existsAnyRecording(recordIdList)) {
       // BEGIN - backward compatibility
       invalid("notFound", "We could not find recordings");
       return;
       // END - backward compatibility
     }

     //Execute code specific for this call
     Map<String, String> metaParams = ParamsProcessorUtil.processMetaParam(params)
     if ( !metaParams.empty ) {
         //Proceed with the update
         meetingService.updateRecordings(recordIdList, metaParams);
     }
     withFormat {
       xml {
         render(contentType:"text/xml") {
           response() {
             returncode(RESP_CODE_SUCCESS)
             updated(true)
           }
         }
       }
     }
   }

  def uploadDocuments(conf) {
    log.debug("ApiController#uploadDocuments(${conf.getInternalId()})");

    String requestBody = request.inputStream == null ? null : request.inputStream.text;
    requestBody = StringUtils.isEmpty(requestBody) ? null : requestBody;

    if (requestBody == null) {
      downloadAndProcessDocument(presentationService.defaultUploadedPresentation, conf.getInternalId(),
              true /* default presentation */ );
    } else {
      log.debug "Request body: \n" + requestBody;
      def xml = new XmlSlurper().parseText(requestBody);
      xml.children().each { module ->
        log.debug("module config found: [${module.@name}]");

        if ("presentation".equals(module.@name.toString())) {
          // need to iterate over presentation files and process them
          module.children().each { document ->
            if (!StringUtils.isEmpty(document.@url.toString())) {
              downloadAndProcessDocument(document.@url.toString(), conf.getInternalId(), true /* default presentation */);
            } else if (!StringUtils.isEmpty(document.@name.toString())) {
              def b64 = new Base64()
              def decodedBytes = b64.decode(document.text().getBytes())
              processDocumentFromRawBytes(decodedBytes, document.@name.toString(),
                      conf.getInternalId(), true /* default presentation */);
            } else {
              log.debug("presentation module config found, but it did not contain url or name attributes");
            }
          }
        }
      }
    }
  }

  def processDocumentFromRawBytes(bytes, presFilename, meetingId, current) {
    def filenameExt = FilenameUtils.getExtension(presFilename);
    String presentationDir = presentationService.getPresentationDir()
    def presId = Util.generatePresentationId(presFilename)
    File uploadDir = Util.createPresentationDirectory(meetingId, presentationDir, presId)
    if (uploadDir != null) {
      def newFilename = Util.createNewFilename(presId, filenameExt)
      def pres = new File(uploadDir.absolutePath + File.separatorChar + newFilename);

      FileOutputStream fos = new java.io.FileOutputStream(pres)
      fos.write(bytes)
      fos.flush()
      fos.close()

      processUploadedFile(meetingId, presId, presFilename, pres, current);
    }

  }

  def downloadAndProcessDocument(address, meetingId, current) {
    log.debug("ApiController#downloadAndProcessDocument(${address}, ${meetingId})");
    String presFilename = address.tokenize("/")[-1];
    def filenameExt = FilenameUtils.getExtension(presFilename);
    String presentationDir = presentationService.getPresentationDir()

    def presId = presDownloadService.generatePresentationId(presFilename)
    File uploadDir = presDownloadService.createPresentationDirectory(meetingId, presentationDir, presId)
    if (uploadDir != null) {
      def newFilename = Util.createNewFilename(presId, filenameExt)
      def newFilePath = uploadDir.absolutePath + File.separatorChar + newFilename

      if (presDownloadService.savePresentation(meetingId, newFilePath, address)) {
        def pres = new File(newFilePath)
        processUploadedFile(meetingId, presId, presFilename, pres, current);
      } else {
        log.error("Failed to download presentation=[${address}], meeting=[${meetingId}]")
      }
    }
  }


  def processUploadedFile(meetingId, presId, filename, presFile, current) {
    def presentationBaseUrl = presentationService.presentationBaseUrl
    UploadedPresentation uploadedPres = new UploadedPresentation(meetingId, presId, filename, presentationBaseUrl, current);
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

  def formatPrettyDate(timestamp) {
    //    SimpleDateFormat ft = new SimpleDateFormat ("E yyyy.MM.dd 'at' hh:mm:ss a zzz");
    //    return ft.format(new Date(timestamp))

    return new Date(timestamp).toString()
  }

  def respondWithConferenceDetails(meeting, room, msgKey, msg) {
    response.addHeader("Cache-Control", "no-cache")
    withFormat {
      xml {
        render(contentType:"text/xml") {
          response() {
            returncode(RESP_CODE_SUCCESS)
            meetingName() { mkp.yield(meeting.getName()) }
            isBreakout() { mkp.yield(meeting.isBreakout()) }
            meetingID() { mkp.yield(meeting.getExternalId()) }
            internalMeetingID(meeting.getInternalId())
            if (meeting.isBreakout()) {
                parentMeetingID() { mkp.yield(meeting.getParentMeetingId()) }
                sequence() { mkp.yield(meeting.getSequence()) }
                freeJoin() { mkp.yield(meeting.isFreeJoin()) }
            }
            createTime(meeting.getCreateTime())
            createDate(formatPrettyDate(meeting.getCreateTime()))
            voiceBridge() { mkp.yield(meeting.getTelVoice()) }
            dialNumber() { mkp.yield(meeting.getDialNumber()) }
            attendeePW() { mkp.yield(meeting.getViewerPassword()) }
            moderatorPW() { mkp.yield(meeting.getModeratorPassword()) }
            running(meeting.isRunning() ? "true" : "false")
            duration(meeting.duration)
            hasUserJoined(meeting.hasUserJoined())
            recording(meeting.isRecord() ? "true" : "false")
            hasBeenForciblyEnded(meeting.isForciblyEnded() ? "true" : "false")
            startTime(meeting.getStartTime())
            endTime(meeting.getEndTime())
            participantCount(meeting.getNumUsers())
            listenerCount(meeting.getNumListenOnly())
            voiceParticipantCount(meeting.getNumVoiceJoined())
            videoCount(meeting.getNumVideos())
            maxUsers(meeting.getMaxUsers())
            moderatorCount(meeting.getNumModerators())
            attendees() {
              meeting.getUsers().each { att ->
                attendee() {
                  userID() { mkp.yield("${att.externalUserId}") }
                  fullName() { mkp.yield("${att.fullname}") }
                  role("${att.role}")
                  guest("${att.guest}")
                  waitingForAcceptance("${att.waitingForAcceptance}")
                  isPresenter("${att.isPresenter()}")
                  isListeningOnly("${att.isListeningOnly()}")
                  hasJoinedVoice("${att.isVoiceJoined()}")
                  hasVideo("${att.hasVideo()}")
                  clientType() { mkp.yield("${att.clientType}") }
                  videoStreams() {
                    att.getStreams().each { s ->
                      streamName("${s}")
                    }
                  }
                  customdata(){
                    meeting.getUserCustomData(att.externalUserId).each{ k,v ->
                      "$k"("$v")
                    }
                  }
                }
              }
            }
            metadata(){
              meeting.getMetadata().each{ k,v ->
                "$k"("$v")
              }
            }
            messageKey(msgKey == null ? "" : msgKey)
            message(msg == null ? "" : msg)
          }
        }
      }
    }
  }

  def respondWithConference(meeting, msgKey, msg) {
    response.addHeader("Cache-Control", "no-cache")
    withFormat {
      xml {
        log.debug "Rendering as xml"
        render(contentType:"text/xml") {
          response() {
            returncode(RESP_CODE_SUCCESS)
            meetingID() { mkp.yield(meeting.getExternalId()) }
            internalMeetingID() { mkp.yield(meeting.getInternalId()) }
            parentMeetingID() { mkp.yield(meeting.getParentMeetingId()) }
            attendeePW() { mkp.yield(meeting.getViewerPassword()) }
            moderatorPW() { mkp.yield(meeting.getModeratorPassword()) }
            createTime(meeting.getCreateTime())
            voiceBridge() { mkp.yield(meeting.getTelVoice()) }
            dialNumber()  { mkp.yield(meeting.getDialNumber()) }
            createDate(formatPrettyDate(meeting.getCreateTime()))
            hasUserJoined(meeting.hasUserJoined())
            duration(meeting.duration)
            hasBeenForciblyEnded(meeting.isForciblyEnded() ? "true" : "false")
            messageKey(msgKey == null ? "" : msgKey)
            message(msg == null ? "" : msg)
          }
        }
      }
    }
  }

  private void respondWithErrors(errorList, redirectResponse=false) {
    log.debug CONTROLLER_NAME + "#invalid"
    if (redirectResponse) {
        ArrayList<Object> errors = new ArrayList<Object>();
        errorList.getErrors().each { error ->
            Map<String,String> errorMap = new LinkedHashMap<String,String>()
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
            render(contentType:"text/xml") {
              response() {
                returncode(RESP_CODE_FAILED)
                errors() {
                  ArrayList errs = errorList.getErrors();
                  Iterator itr = errs.iterator();
                  while (itr.hasNext()){
                    String[] er = (String[]) itr.next();
                    log.debug CONTROLLER_NAME + "#invalid" + er[0]
                    error(key: er[0], message: er[1])
                  }
                }
              }
            }
          }
          json {
            log.debug "Rendering as json"
            render(contentType:"text/json") {
              returncode(RESP_CODE_FAILED)
              messageKey(key)
              message(msg)
            }
          }
        }
    }
  }
  //TODO: method added for backward compatibility, it will be removed in next versions after 0.8
  private void invalid(key, msg, redirectResponse=false) {
    // Note: This xml scheme will be DEPRECATED.
    log.debug CONTROLLER_NAME + "#invalid " + msg
    if (redirectResponse) {
        ArrayList<Object> errors = new ArrayList<Object>();
        Map<String,String> errorMap = new LinkedHashMap<String,String>()
        errorMap.put("key", key)
        errorMap.put("message", msg)
        errors.add(errorMap)

        JSONArray errorsJSONArray = new JSONArray(errors);
        log.debug errorsJSONArray

        respondWithRedirect(errorsJSONArray)
    } else {
        response.addHeader("Cache-Control", "no-cache")
        withFormat {
          xml {
            render(contentType:"text/xml") {
              response() {
                returncode(RESP_CODE_FAILED)
                messageKey(key)
                message(msg)
              }
            }
          }
          json {
            log.debug "Rendering as json"
            render(contentType:"text/json") {
              returncode(RESP_CODE_FAILED)
              messageKey(key)
              message(msg)
            }
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
        } catch ( Exception e ) {
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

    URI newUri = new URI(oldUri.getScheme(), oldUri.getAuthority(), oldUri.getPath(), newQuery, oldUri.getFragment());

    log.debug newUri
    redirect(url: newUri);
  }

  def parseBoolean(obj) {
    if (obj instanceof Number) {
      return ((Number) obj).intValue() == 1;
    }
    return false
  }

}

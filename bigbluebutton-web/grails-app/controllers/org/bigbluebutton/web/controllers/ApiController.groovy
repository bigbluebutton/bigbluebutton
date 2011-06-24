/* BigBlueButton - http://www.bigbluebutton.org
 * 
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * @author Jeremy Thomerson <jthomerson@genericconf.com>
 * @version $Id: $
 */
package org.bigbluebutton.web.controllers


import java.text.MessageFormat;
import java.util.Collections;
import org.apache.commons.codec.binary.Hex;
import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.codec.binary.Base64;
import org.apache.commons.lang.RandomStringUtils;
import org.apache.commons.lang.StringUtils;
import org.bigbluebutton.api.domain.Meeting;
import org.bigbluebutton.api.MeetingService;
import org.bigbluebutton.api.domain.Recording;
import org.bigbluebutton.web.services.PresentationService
import org.bigbluebutton.presentation.UploadedPresentation
import org.codehaus.groovy.grails.commons.ConfigurationHolder;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import grails.converters.XML;
import org.bigbluebutton.api.ApiErrors;
import org.bigbluebutton.api.ParamsProcessorUtil;
import java.util.Iterator;
import java.util.ArrayList;

class ApiController {
  private static final Integer SESSION_TIMEOUT = 10800  // 3 hours    
  private static final String CONTROLLER_NAME = 'ApiController'		
  private static final String RESP_CODE_SUCCESS = 'SUCCESS'
  private static final String RESP_CODE_FAILED = 'FAILED'
  private static final String ROLE_MODERATOR = "MODERATOR";
  private static final String ROLE_ATTENDEE = "VIEWER";
  private static final String SECURITY_SALT = '639259d4-9dd8-4b25-bf01-95f9567eaf4b'
    
  MeetingService meetingService;
  PresentationService presentationService
  ParamsProcessorUtil paramsProcessorUtil
  
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
   * CREATE (API) 
   ***********************************/
  def create = {
    String API_CALL = 'create'
    log.debug CONTROLLER_NAME + "#${API_CALL}"
  	
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
    
    
    // Translate the external meeting id into an internal meeting id.
    String internalMeetingId = paramsProcessorUtil.convertToInternalMeetingId(params.meetingID);		
    Meeting existing = meetingService.getMeeting(internalMeetingId);
    if (existing != null) {
      log.debug "Existing conference found"
      Map<String, Object> updateParams = paramsProcessorUtil.processUpdateCreateParams(params);
      if (existing.getViewerPassword().equals(params.get("attendeePW")) && existing.getModeratorPassword().equals(params.get("moderatorPW"))) {
        paramsProcessorUtil.updateMeeting(updateParams, existing);
        // trying to create a conference a second time, return success, but give extra info
        uploadDocuments(existing);
        respondWithConference(existing, "duplicateWarning", "This conference was already in existence and may currently be in progress.");
      } else {
        // enforce meetingID unique-ness
        errors.nonUniqueMeetingIdError()
        respondWithErrors(errors)
      } 
      
      return;    
    }
     
    Meeting newMeeting = paramsProcessorUtil.processCreateParams(params);            
    meetingService.createMeeting(newMeeting);
    
    // See if the request came with pre-uploading of presentation.
    uploadDocuments(newMeeting);
    
    respondWithConference(newMeeting, null, null)
  }

  /**********************************************
   * JOIN API
   *********************************************/
  def join = {
    String API_CALL = 'join'
    log.debug CONTROLLER_NAME + "#${API_CALL}"
  	ApiErrors errors = new ApiErrors()
  	  
    // Do we have a checksum? If none, complain.
    if (StringUtils.isEmpty(params.checksum)) {
      errors.missingParamError("checksum");		
    }

    // Do we have a name for the user joining? If none, complain.
    String fullName = params.fullName
    if (StringUtils.isEmpty(fullName)) {
      errors.missingParamError("fullName");
    }

    // Do we have a meeting id? If none, complain.
    String externalMeetingId = params.meetingID
    if (StringUtils.isEmpty(externalMeetingId)) {
      errors.missingParamError("meetingID");
    }

    // Do we have a password? If not, complain.
    String attPW = params.password
    if (StringUtils.isEmpty(attPW)) {
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

    String createTime = params.createTime
//    if (StringUtils.isEmpty(createTime)) {
//      errors.missingParamError("createTime");
//    }
    
    // Everything is good so far. Translate the external meeting id to an internal meeting id. If
    // we can't find the meeting, complain.					        
    String internalMeetingId = paramsProcessorUtil.convertToInternalMeetingId(externalMeetingId);
    log.info("Retrieving meeting ${internalMeetingId}")		
    Meeting meeting = meetingService.getMeeting(internalMeetingId);
    if (meeting == null) {
	   errors.invalidMeetingIdError();
	   respondWithErrors(errors)
	   return;
    }
    
    // Is this user joining a meeting that has been ended. If so, complain.
    if (meeting.isForciblyEnded()) {
      errors.meetingForciblyEndedError();
      respondWithErrors(errors)
      return;
    }

    // Now determine if this user is a moderator or a viewer.
    String role = null;
    if (meeting.getModeratorPassword().equals(attPW)) {
      role = ROLE_MODERATOR;
    } else if (meeting.getAttendeePassword().equals(attPW)) {
      role = ROLE_ATTENDEE;
    }
    
    if (role == null) {
    	errors.invalidPasswordError()
	    respondWithErrors(errors)
	    return;
    }
        
    String webVoice = StringUtils.isEmpty(params.webVoiceConf) ? meeting.getTelVoice() : params.webVoiceConf

    boolean redirectImm = parseBoolean(params.redirectImmediately)
    
    String externUserID = params.userID
    if (StringUtils.isEmpty(externUserID)) {
      externUserID = RandomStringUtils.randomAlphanumeric(12).toLowerCase()
    }
    
    session["conferencename"] = meeting.getName()
    session["meetingID"] = meeting.getInternalId()
    session["externUserID"] = externUserID
    session["fullname"] = fullName 
    session["role"] = role
    session["conference"] = meeting.getInternalId()
    session["room"] = meeting.getInternalId()
    session["voicebridge"] = meeting.getTelVoice()
    session["webvoiceconf"] = meeting.getWebVoice()
    session["mode"] = "LIVE"
    session["record"] = meeting.isRecord()
    session['welcome'] = meeting.getWelcomeMessage()
    
    session.setMaxInactiveInterval(SESSION_TIMEOUT);
    
    log.info("Successfully joined. Redirecting to ${paramsProcessorUtil.getDefaultClientUrl()}"); 		
    redirect(url: paramsProcessorUtil.getDefaultClientUrl())
  }

  /*******************************************
   * IS_MEETING_RUNNING API
   *******************************************/
  def isMeetingRunning = {
    String API_CALL = 'isMeetingRunning'
    log.debug CONTROLLER_NAME + "#${API_CALL}"

  	ApiErrors errors = new ApiErrors()
  	
    // Do we have a checksum? If none, complain.
    if (StringUtils.isEmpty(params.checksum)) {
      errors.missingParamError("checksum");			
    }

    // Do we have a meeting id? If none, complain.
    String externalMeetingId = params.meetingID
    if (StringUtils.isEmpty(externalMeetingId)) {
      errors.missingParamError("meetingID");
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
	   errors.invalidMeetingIdError();
	   respondWithErrors(errors)
	   return;
    }
    
    response.addHeader("Cache-Control", "no-cache")
    withFormat {	
      xml {
        render(contentType:"text/xml") {
          response() {
            returncode(RESP_CODE_SUCCESS)
            running(meeting.isRunning() ? "true" : "false")
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
    ApiErrors errors = new ApiErrors()
    
    // Do we have a checksum? If none, complain.
    if (StringUtils.isEmpty(params.checksum)) {
      errors.missingParamError("checksum");		
    }

    // Do we have a meeting id? If none, complain.
    String externalMeetingId = params.meetingID
    if (StringUtils.isEmpty(externalMeetingId)) {
      errors.missingParamError("meetingID");
    }

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
	   errors.invalidMeetingIdError();
	   respondWithErrors(errors)
	   return;
    }
    
    if (meeting.getModeratorPassword().equals(modPW) == false) {
	   errors.invalidPasswordError();
	   respondWithErrors(errors)
	   return;
    }
       
    meetingService.endMeeting(internalMeetingId);
    
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
    
    ApiErrors errors = new ApiErrors()
        
    // Do we have a checksum? If none, complain.
    if (StringUtils.isEmpty(params.checksum)) {
      errors.missingParamError("checksum");				
    }

    // Do we have a meeting id? If none, complain.
    String externalMeetingId = params.meetingID
    if (StringUtils.isEmpty(externalMeetingId)) {
      errors.missingParamError("meetingID");
    }

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
	   errors.invalidMeetingIdError();
	   respondWithErrors(errors)
	   return;
    }
    
    if (meeting.getModeratorPassword().equals(modPW) == false) {
	   errors.invalidPasswordError();
	   respondWithErrors(errors)
	   return;
    }
    
    respondWithConferenceDetails(meeting, null, null, null);
  }
  
  /************************************
   *	GETMEETINGS API
   ************************************/
  def getMeetings = {
    String API_CALL = "getMeetings"
    log.debug CONTROLLER_NAME + "#${API_CALL}"
    
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
              meetings(null)
              messageKey("noMeetings")
              message("no meetings were found on this server")
            }
          }
        }
      }
      return;
    }
    
    response.addHeader("Cache-Control", "no-cache")
    withFormat {	
      xml {
        render(contentType:"text/xml") {
          response() {
            returncode(RESP_CODE_SUCCESS)
            meetings() {
              mtgs.each { m ->
                meeting() {
                  meetingID(m.getExternalId())
                  attendeePW(m.getViewerPassword())
                  moderatorPW(m.getModeratorPassword())
                  hasBeenForciblyEnded(m.isForciblyEnded() ? "true" : "false")
                  running(m.isRunning() ? "true" : "false")
                }
              }
            }
          }
        }
      }
    }
  }

  /***********************************************
   * ENTER API
   ***********************************************/
  def enter = {
    def fname = session["fullname"]
      def rl = session["role"]
      def cnf = session["conference"]
      def rm = session["room"]
    def vb = session["voicebridge"] 
    def wbv = session["webvoiceconf"]  
      def rec = session["record"]
      def md = session["mode"]
      def confName = session["conferencename"]
      def welcomeMsg = session['welcome']
      def meetID = session["meetingID"] 
        def externUID = session["externUserID"] 
        
      if (!rm) {
        println "Could not find conference"
        response.addHeader("Cache-Control", "no-cache")
        withFormat {				
        xml {
          render(contentType:"text/xml") {
            response() {
              returncode("FAILED")
              message("Could not find conference ${params.conference}.")
            }
          }
        }
      }
      } else {	
        println "Found conference"
        response.addHeader("Cache-Control", "no-cache")
        withFormat {				
        xml {
          render(contentType:"text/xml") {
            response() {
              returncode("SUCCESS")
              fullname("$fname")
              confname("$confName")
              meetingID("$meetID")
              externUserID("$externUID")
                  role("$rl")
                  conference("$cnf")
                  room("$rm")
                  voicebridge("${vb}")
                  webvoiceconf("${wbv}")
                  mode("$md")
                  record("$rec")
                  welcome("$welcomeMsg")
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
  	String meetingId = session["conference"]
  	Meeting meeting = meetingService.getMeeting(meetingId);
  	String logoutUrl = paramsProcessorUtil.getDefaultLogoutUrl()
      log.debug("Logging out from [" + meeting.getInternalId() + "]");
               
  	// Log the user out of the application.
  	session.invalidate()
  
  	if (meeting != null) {
  		logoutUrl = meeting.getLogoutUrl();
  		if (meeting.isRecord()) {
  			log.debug("[" + meeting.getInternalId() + "] is recorded. Process it.");		
  			meetingService.processRecording(meeting.getInternalId())
  		}
  	} else {
  		log.warn("Signing out from a non-existing meeting [" + meetingId + "]");	
  	}      
   
  	log.debug("Signing out. Redirecting to " + logoutUrl)
  	redirect(url: logoutUrl)
  }
 
  def getRecordings = {
     ArrayList<Recording> r = meetingService.getRecordings();
     if (r.isEmpty()) {
     
     } else {
     
     }
  } 
  
  def uploadDocuments(conf) { 
    log.debug("ApiController#uploadDocuments(${conf.getInternalId()})");

    String requestBody = request.inputStream == null ? null : request.inputStream.text;
    requestBody = StringUtils.isEmpty(requestBody) ? null : requestBody;

    if (requestBody == null) {
      return;
    }
        
    log.debug "Request body: \n" + requestBody;

    def xml = XML.parse(requestBody);
    xml.children().each { module ->
      log.debug("module config found: [${module.@name}]");
      if ("presentation".equals(module.@name.toString())) {
        // need to iterate over presentation files and process them
        module.children().each { document -> 
          if (!StringUtils.isEmpty(document.@url.toString())) {
            downloadAndProcessDocument(document.@url.toString(), conf);
          } else if (!StringUtils.isEmpty(document.@name.toString())) {
            def b64 = new Base64()
            def decodedBytes = b64.decode(document.text().getBytes())
            processDocumentFromRawBytes(decodedBytes, document.@name.toString(), conf);
          } else {
            log.debug("presentation module config found, but it did not contain url or name attributes");
          }
        }
      }
    }
  }



  def cleanFilename(filename) {
    def notValidCharsRegExp = /[^0-9a-zA-Z_\.]/
    return filename.replaceAll(notValidCharsRegExp, '-')
  }
  
  def processDocumentFromRawBytes(bytes, filename, conf) {
    def cleanName = cleanFilename(filename);

    File uploadDir = presentationService.uploadedPresentationDirectory(conf.getInternalId(), conf.getInternalId(), cleanName);
    def pres = new File(uploadDir.absolutePath + File.separatorChar + cleanName);
    
    FileOutputStream fos = new java.io.FileOutputStream(pres)
    fos.write(bytes)
    fos.flush()
    fos.close()
    
    processUploadedFile(cleanName, pres, conf);
  }
    
  def downloadAndProcessDocument(address, conf) {
    log.debug("ApiController#downloadAndProcessDocument({$address}, ${conf.getInternalId()})");
    String name = cleanFilename(address.tokenize("/")[-1]);
    log.debug("Uploading presentation: ${name} from ${address} [starting download]");
    
    def out;
    def pres;
    try {
      File uploadDir = presentationService.uploadedPresentationDirectory(conf.getInternalId(), conf.getInternalId(), name);
      pres = new File(uploadDir.absolutePath + File.separatorChar + name);
      out = new BufferedOutputStream(new FileOutputStream(pres))
      out << new URL(address).openStream()
    } finally {
      if (out != null) {
        out.close()
      }
    }

    processUploadedFile(name, pres, conf);
  }
  
  def processUploadedFile(name, pres, conf) {
    UploadedPresentation uploadedPres = new UploadedPresentation(conf.getInternalId(), conf.getInternalId(), name);
    uploadedPres.setUploadedFile(pres);
    presentationService.processUploadedPresentation(uploadedPres);
  }
  
  def beforeInterceptor = {
    if (paramsProcessorUtil.isServiceEnabled() == false) {
      log.info("apiNotEnabled: The API service and/or controller is not enabled on this server.  To use it, you must first enable it.")
      // TODO: this doesn't stop the request - so it generates invalid XML
      //			since the request continues and renders a second response
      invalid("apiNotEnabled", "The API service and/or controller is not enabled on this server.  To use it, you must first enable it.")
    }
  }

  def respondWithConferenceDetails(meeting, room, msgKey, msg) {
    response.addHeader("Cache-Control", "no-cache")
    withFormat {				
      xml {
        render(contentType:"text/xml") {
          response() {
            returncode(RESP_CODE_SUCCESS)
            meetingID(meeting.getExternalId())
            attendeePW(meeting.getViewerPassword())
            moderatorPW(meeting.getModeratorPassword())
            running(meeting.isRunning() ? "true" : "false")
            hasBeenForciblyEnded(meeting.isForciblyEnded() ? "true" : "false")
            startTime(meeting.getStartTime())
            endTime(meeting.getEndTime())
            participantCount(meeting.getNumUsers())
            maxUsers(meeting.getMaxUsers())
            moderatorCount(meeting.getNumModerators())
            attendees() {
              meeting.getUsers().each { att ->
                attendee() {
                  userID("${att.userid}")
                  fullName("${att.fullname}")
                  role("${att.role}")
                }
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
            meetingID(meeting.getExternalId())
            attendeePW(meeting.getViewerPassword())
            moderatorPW(meeting.getModeratorPassword())
            createTime(meeting.getCreateTime())
            hasBeenForciblyEnded(meeting.isForciblyEnded() ? "true" : "false")
            messageKey(msgKey == null ? "" : msgKey)
            message(msg == null ? "" : msg)
          }
        }
      }
    }
  }
  
  def respondWithErrors(errorList) {
    log.debug CONTROLLER_NAME + "#invalid"
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
  
  def parseBoolean(obj) {
		if (obj instanceof Number) {
			return ((Number) obj).intValue() == 1;
		}
		return false
  }  
}

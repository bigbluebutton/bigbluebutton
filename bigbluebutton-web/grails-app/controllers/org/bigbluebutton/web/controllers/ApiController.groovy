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
import org.apache.commons.lang.StringUtils;

import org.bigbluebutton.web.services.DynamicConferenceService;
import org.bigbluebutton.api.domain.DynamicConference;
import org.bigbluebutton.conference.Room
import org.bigbluebutton.api.IApiConferenceEventListener;

import org.codehaus.groovy.grails.commons.ConfigurationHolder;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

class ApiController {

	private static final String CONTROLLER_NAME = 'ApiController'		
	private static final String RESP_CODE_SUCCESS = 'SUCCESS'
	private static final String RESP_CODE_FAILED = 'FAILED'
	private static final String ROLE_MODERATOR = "MODERATOR";
	private static final String ROLE_ATTENDEE = "VIEWER";

	private static final String SECURITY_SALT = '639259d4-9dd8-4b25-bf01-95f9567eaf4b'

	def DIAL_NUM = /%%DIALNUM%%/
	def CONF_NUM = /%%CONFNUM%%/
	def CONF_NAME = /%%CONFNAME%%/
	
	def keywordList = [DIAL_NUM, CONF_NUM, CONF_NAME];
		
	DynamicConferenceService dynamicConferenceService;
	IApiConferenceEventListener conferenceEventListener;

	/* general methods */
	def index = {
			log.debug CONTROLLER_NAME + "#index"
			invalid("noActionSpecified", "You did not specify an API action.")
	}

	/* interface (API) methods */
	def create = {
		log.debug CONTROLLER_NAME + "#create"

		if (!doChecksumSecurity()) {
			invalidChecksum(); return;
		}

		String name = params.name
		if (name == null) {
			invalid("missingParamName", "You must specify a name for the meeting.");
			return
		}
		
		log.debug("passed parameter validation - creating conference");
		String mtgID = params.meetingID
		String attPW = params.attendeePW
		String modPW = params.moderatorPW
		String voiceBr = params.voiceBridge
		String welcomeMessage = params.welcome
		String dialNumber = params.dialNumber
		String logoutUrl = params.logoutURL
		
		Integer maxParts = -1;
		try {
			maxParts = Integer.parseInt(params.maxParticipants);
		} catch(Exception ex) { /* do nothing */ }
		String mmRoom = params.meetmeRoom
		String mmServer = params.meetmeServer

		// check for existing:
		DynamicConference existing = dynamicConferenceService.getConferenceByMeetingID(mtgID);
		if (existing != null) {
			log.debug "Existing conference found"
			if (existing.getAttendeePassword().equals(attPW) && existing.getModeratorPassword().equals(modPW)) {
				// trying to create a conference a second time
				// return success, but give extra info
				respondWithConference(existing, "duplicateWarning", "This conference was already in existence and may currently be in progress.");
			} else {
				// enforce meetingID unique-ness
				invalid("idNotUnique", "A meeting already exists with that meeting ID.  Please use a different meeting ID.");
			}
			return;
		}
		DynamicConference conf = new DynamicConference(name, mtgID, attPW, modPW, maxParts)
		conf.setVoiceBridge(voiceBr == null || voiceBr == "" ? mtgID : voiceBr)
		
		if ((dynamicConferenceService.testVoiceBridge != null) && (conf.voiceBridge == dynamicConferenceService.testVoiceBridge)) {
			if (dynamicConferenceService.testConferenceMock != null) 
				conf.meetingToken = dynamicConferenceService.testConferenceMock
			else
				log.warn("Cannot set test conference because it is not set in bigbluebutton.properties")	
		} 
		
		if ((logoutUrl != null) || (logoutUrl != "")) {
			conf.logoutUrl = logoutUrl
		}
		
		if (welcomeMessage == null || welcomeMessage == "") {
			welcomeMessage = dynamicConferenceService.defaultWelcomeMessage
		}

		if ((dialNumber == null) || (dialNumber == "")) {
			dialNumber = dynamicConferenceService.defaultDialAccessNumber
		}

		if (welcomeMessage != null || welcomeMessage != "") {
			log.debug "Substituting keywords"
			
			keywordList.each{ keyword ->
				switch(keyword){
					case DIAL_NUM:
						if ((dialNumber != null) || (dialNumber != "")) {
							welcomeMessage = welcomeMessage.replaceAll(DIAL_NUM, dialNumber)
						}
						break
					case CONF_NUM:
						welcomeMessage = welcomeMessage.replaceAll(CONF_NUM, conf.voiceBridge)
						break
					case CONF_NAME:
						welcomeMessage = welcomeMessage.replaceAll(CONF_NAME, conf.name)
						break
				}			  
			}
		}
				
		conf.welcome = welcomeMessage
								
		log.debug("Conference created: " + conf);
		// TODO: support voiceBridge and voiceServer

		// success!
		dynamicConferenceService.storeConference(conf);
		respondWithConference(conf, null, null)
	}

	def join = {
		log.debug CONTROLLER_NAME + "#join"

		if (!doChecksumSecurity()) {
			invalidChecksum(); return;
		}

		String fullName = params.fullName
		if (fullName == null) {
			invalid("missingParamFullName", "You must specify a name for the attendee who will be joining the meeting.");
			return
		}
		
		String mtgToken = params.meetingToken
		String mtgID = params.meetingID
		String attPW = params.password
		boolean redirectImm = parseBoolean(params.redirectImmediately)

		// check for existing:
		DynamicConference conf = dynamicConferenceService.findConference(mtgToken, mtgID);
		if (conf == null) {
			invalid("invalidMeetingIdentifier", "The meeting ID or token that you supplied did not match any existing meetings");
			return;
		}

		String role = null;
		if (conf.getModeratorPassword().equals(attPW)) {
			role = ROLE_MODERATOR;
		} else if (conf.getAttendeePassword().equals(attPW)) {
			role = ROLE_ATTENDEE;
		}
		if (role == null) {
			invalidPassword("You either did not supply a password or the password supplied is neither the attendee or moderator password for this conference."); return;
		}
		
		
		// TODO: success....
		log.debug "join successful - setting session parameters and redirecting to join"
		session["conferencename"] = conf.meetingID
		session["fullname"] = fullName 
		session["role"] = role
		session["conference"] = conf.getMeetingToken()
		session["room"] = conf.getMeetingToken()
		session["voicebridge"] = conf.getVoiceBridge()
		session["mode"] = "LIVE"
		session["record"] = false
		session['welcome'] = conf.welcome
		
    	def config = ConfigurationHolder.config
    	def hostURL = config.bigbluebutton.web.serverURL
    	redirect(url:"${hostURL}/client/BigBlueButton.html")
	}

	def isMeetingRunning = {
		log.debug CONTROLLER_NAME + "#isMeetingRunning"

		if (!doChecksumSecurity()) {
			invalidChecksum(); return;
		}

		String mtgToken = params.meetingToken
		String mtgID = params.meetingID

		// check for existing:
		DynamicConference conf = dynamicConferenceService.findConference(mtgToken, mtgID);
		boolean isRunning = conf != null && conf.isRunning();
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

	def end = {
		log.debug CONTROLLER_NAME + "#end"

		if (!doChecksumSecurity()) {
			invalidChecksum(); return;
		}

		String mtgToken = params.meetingToken
		String mtgID = params.meetingID
		String callPW = params.password

		// check for existing:
		DynamicConference conf = dynamicConferenceService.findConference(mtgToken, mtgID);
		Room room = dynamicConferenceService.findRoom(mtgToken, mtgID);
		
		if (conf == null || room == null) {
			invalid("notFound", "We could not find a meeting with that token or ID - perhaps the meeting is not yet running?");
			return;
		}
		
		if (conf.getModeratorPassword().equals(callPW) == false) {
			invalidPassword("You must supply the moderator password for this call."); return;
		}
		
		conferenceEventListener.endMeetingRequest(room);
		
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

	def getMeetingInfo = {
		log.debug CONTROLLER_NAME + "#getMeetingInfo"

		if (!doChecksumSecurity()) {
			invalidChecksum(); return;
		}

		String mtgToken = params.meetingToken
		String mtgID = params.meetingID
		String callPW = params.password

		// check for existing:
		DynamicConference conf = dynamicConferenceService.findConference(mtgToken, mtgID);
		Room room = dynamicConferenceService.findRoom(mtgToken, mtgID);
		
		if (conf == null) {
			invalid("notFound", "We could not find a meeting with that token or ID");
			return;
		}
		
		if (conf.getModeratorPassword().equals(callPW) == false) {
			invalidPassword("You must supply the moderator password for this call."); return;
		}

		respondWithConferenceDetails(conf, room, null, null);
	}
	
	def getMeetings = {
		log.debug CONTROLLER_NAME + "#getMeetings"

		String random = params.random
		if (StringUtils.isEmpty(random)) {
			invalid("missingParamRandom", "You must specify a parameter named 'random' with any random value so that it can be used for the checksum security");
			return
		}
		
		if (!doChecksumSecurity()) {
			invalidChecksum(); return;
		}

		// check for existing:
		Collection<DynamicConference> confs = dynamicConferenceService.getAllConferences();
		
		if (confs == null || confs.size() == 0) {
			response.addHeader("Cache-Control", "no-cache")
			withFormat {	
				xml {
					log.debug "Rendering as xml"
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
				log.debug "Rendering as xml"
				render(contentType:"text/xml", encoding:"UTF-16") {
					response() {
						returncode(RESP_CODE_SUCCESS)
						meetings() {
							confs.each { conf ->
								meeting() {
									meetingToken("${conf.meetingToken}")
									meetingID("${conf.meetingID}")
									attendeePW("${conf.attendeePassword}")
									moderatorPW("${conf.moderatorPassword}")
									running(conf.isRunning() ? "true" : "false")
								}
							}
						}
					}
				}
			}
		}
	}
	
	/* helper methods */
	def doChecksumSecurity() {
		log.debug CONTROLLER_NAME + "#doChecksumSecurity"
		log.debug "checksum: " + params.checksum + "; query string: " + request.getQueryString()
		if (StringUtils.isEmpty(request.getQueryString())) {
			invalid("noQueryString", "No query string was found in your request.")
			return false;
		}
	
		if (StringUtils.isEmpty(securitySalt()) == false) {
			String qs = request.getQueryString()
			// handle either checksum as first or middle / end parameter
			// TODO: this is hackish - should be done better
			qs = qs.replace("&checksum=" + params.checksum, "")
			qs = qs.replace("checksum=" + params.checksum + "&", "")
			log.debug "query string after checksum removed: " + qs
			String cs = getHash(qs, securitySalt())
			log.debug "our checksum: " + cs
			if (cs == null || cs.equals(params.checksum) == false) {
				log.info("checksumError: request did not pass the checksum security check")
				return false;
			}
			log.debug("checksum ok: request passed the checksum security check")
			return true; 
		}
		
		log.warn "Security is disabled in this service. Make sure this is intentional."
		return true;
	}

	private String securitySalt() {
		return dynamicConferenceService.securitySalt
	}
	
	public String getHash(String string, String salt) throws NoSuchAlgorithmException {
		return DigestUtils.shaHex(string + salt)
	}

	def beforeInterceptor = {
		if (dynamicConferenceService.serviceEnabled == false) {
			log.info("apiNotEnabled: The API service and/or controller is not enabled on this server.  To use it, you must first enable it.")
			// TODO: this doesn't stop the request - so it generates invalid XML
			//			since the request continues and renders a second response
			invalid("apiNotEnabled", "The API service and/or controller is not enabled on this server.  To use it, you must first enable it.")
		}
	}

	def respondWithConferenceDetails(conf, room, msgKey, msg) {
		response.addHeader("Cache-Control", "no-cache")
		withFormat {				
			xml {
				render(contentType:"text/xml", encoding:"UTF-16") {
					response() {
						returncode(RESP_CODE_SUCCESS)
						meetingToken("${conf.meetingToken}")
						meetingID("${conf.meetingID}")
						attendeePW("${conf.attendeePassword}")
						moderatorPW("${conf.moderatorPassword}")
						running(conf.isRunning() ? "true" : "false")
						startTime("${conf.startTime}")
						endTime("${conf.endTime}")
						participantCount(room == null ? 0 : room.getNumberOfParticipants())
						moderatorCount(room == null ? 0 : room.getNumberOfModerators())
						attendees() {
							room == null ? Collections.emptyList() : room.participantCollection.each { att ->
								attendee() {
									userID("${att.userid}")
									fullName("${att.name}")
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

	def respondWithConference(conf, msgKey, msg) {
		response.addHeader("Cache-Control", "no-cache")
		withFormat {	
			xml {
				log.debug "Rendering as xml"
				render(contentType:"text/xml", encoding:"UTF-16") {
					response() {
						returncode(RESP_CODE_SUCCESS)
						meetingToken("${conf.meetingToken}")
						meetingID("${conf.meetingID}")
						attendeePW("${conf.attendeePassword}")
						moderatorPW("${conf.moderatorPassword}")
						messageKey(msgKey == null ? "" : msgKey)
						message(msg == null ? "" : msg)
					}
				}
			}
			json {
				log.debug "Rendering as json"
				render(contentType:"text/json", encoding:"UTF-16") {
						returncode(RESP_CODE_SUCCESS)
						meetingToken("${conf.meetingToken}")
						meetingID("${conf.meetingID}")
						attendeePW("${conf.attendeePassword}")
						moderatorPW("${conf.moderatorPassword}")
						messageKey(msgKey == null ? "" : msgKey)
						message(msg == null ? "" : msg)
				}
			}
		}
	}
	
	def invalidPassword(msg) {
		invalid("invalidPassword", msg);
	}
	
	def invalidChecksum() {
		invalid("checksumError", "You did not pass the checksum security check")
	}
	
	def invalid(key, msg) {
		log.debug CONTROLLER_NAME + "#invalid"
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

	def parseBoolean(obj) {
		if (obj instanceof Number) {
			return ((Number) obj).intValue() == 1;
		}
		return false
	}
}

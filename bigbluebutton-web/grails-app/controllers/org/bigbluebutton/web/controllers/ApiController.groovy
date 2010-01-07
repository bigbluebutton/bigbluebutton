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



import org.apache.commons.codec.binary.Hex;

import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.lang.StringUtils;

import org.bigbluebutton.web.services.DynamicConferenceService;
import org.bigbluebutton.api.domain.DynamicConference;

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

	DynamicConferenceService dynamicConferenceService;

	/* general methods */
	def index = {
			log.debug CONTROLLER_NAME + "#index"
			invalid("noActionSpecified", "You did not specify an API action.")
	}

	/* interface (API) methods */
	def create = {
		log.debug CONTROLLER_NAME + "#create"

		if (!doChecksumSecurity()) {
			invalid("checksumError", "You did not pass the checksum security check")
			return
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
				respondWithConference(existing, "duplicateWarning", "This conference was already in existance and may currently be in progress.");
			} else {
				// enforce meetingID unique-ness
				invalid("idNotUnique", "A meeting already exists with that meeting ID.  Please use a different meeting ID.");
			}
			return;
		}
		DynamicConference conf = new DynamicConference(name, mtgID, attPW, modPW, maxParts)
		conf.setVoiceBridge(voiceBr == null || voiceBr == "" ? mtgID : voiceBr)
		log.debug("Conference created: " + conf);
		// TODO: support voiceBridge and voiceServer

		// success!
		dynamicConferenceService.storeConference(conf);
		respondWithConference(conf, null, null)
	}

	def join = {
		log.debug CONTROLLER_NAME + "#join"

		if (!doChecksumSecurity()) {
			invalid("checksumError", "You did not pass the checksum security check")
			return
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
			invalid("invalidPassword", "You either did not supply a password or the password supplied is neither the attendee or moderator password for this conference.");
			return;
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
    	def config = ConfigurationHolder.config
    	def hostURL = config.bigbluebutton.web.serverURL
    	redirect(url:"${hostURL}/client/BigBlueButton.html")
	}

	def isMeetingRunning = {
		log.debug CONTROLLER_NAME + "#isMeetingRunning"

		if (!doChecksumSecurity()) {
			return
		}

		String mtgToken = params.meetingToken
		String mtgID = params.meetingID
		String attPW = params.password

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

	def listAttendees = {
		invalid("notImplemented", "This call is not yet implemented.")
	}

	def endMeeting = {
		invalid("notImplemented", "This call is not yet implemented.")
	}

	def getMeetingInfo = {
		invalid("notImplemented", "This call is not yet implemented.")
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
		dynamicConferenceService.securitySalt
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

	def respondWithConference(conf, msgKey, msg) {
		response.addHeader("Cache-Control", "no-cache")
		withFormat {	
			xml {
				log.debug "Rendering as xml"
				render(contentType:"text/xml") {
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
				render(contentType:"text/json") {
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

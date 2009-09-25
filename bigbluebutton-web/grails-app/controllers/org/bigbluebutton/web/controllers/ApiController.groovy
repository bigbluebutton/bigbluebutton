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

import org.bigbluebutton.api.domain.DynamicConference;
import org.bigbluebutton.web.services.DynamicConferenceService
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

class ApiController {

	// TODO: turn println back into log.debug and log.info - not sure why those weren't working
	//			but it must be a configuration thing
	
	private static final String CONTROLLER_NAME = 'ApiController'
		
	private static final String RESP_CODE_SUCCESS = 'SUCCESS'
	private static final String RESP_CODE_FAILED = 'FAILED'

	private static final String SECURITY_SALT = '639259d4-9dd8-4b25-bf01-95f9567eaf4b'

	// TODO: security salt will obviously need to be a part of the server configuration
	//			and not hard-coded here.  This is just for development / testing
	String securitySalt = SECURITY_SALT;
	DynamicConferenceService dynamicConferenceService;

	/* general methods */
	def index = {
			println CONTROLLER_NAME + "#index"
			invalid("noActionSpecified", "You did not specify an API action.")
	}

	/* interface (API) methods */
	def create = {
		println CONTROLLER_NAME + "#create"

		if (!doChecksumSecurity()) {
			return
		}

		String name = params.name
		if (name == null) {
			invalid("missingParamName", "You must specify a name for the meeting.");
			return
		}
		
		println("passed parameter validation - creating conference");
		String mtgID = params.meetingID
		String attPW = params.attendeePW
		String modPW = params.moderatorPW
		Integer maxParts = params.maxParticipants
		String mmRoom = params.meetmeRoom
		String mmServer = params.meetmeServer

		// check for existing:
		DynamicConference existing = dynamicConferenceService.getConferenceByMeetingID(mtgID);
		if (existing != null) {
			println "Existing conference found"
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
		println("Conference created: " + conf);
		// TODO: support meetmeRoom and meetmeServer

		// success!
		dynamicConferenceService.storeConference(conf);
		respondWithConference(conf)
	}

	def join = {
		invalid("notImplemented", "This call is not yet implemented.")
	}

	def isMeetingRunning = {
		invalid("notImplemented", "This call is not yet implemented.")
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
		println CONTROLLER_NAME + "#doChecksumSecurity"
		println "checksum: " + params.checksum + "; query string: " + request.getQueryString()
		if (StringUtils.isEmpty(request.getQueryString())) {
			invalid("noQueryString", "No query string was found in your request.")
			return false;
		}
		if (StringUtils.isEmpty(securitySalt) == false) {
			String qs = request.getQueryString()
			// handle either checksum as first or middle / end parameter
			// TODO: this is hackish - should be done better
			qs = qs.replace("&checksum=" + params.checksum, "")
			qs = qs.replace("checksum=" + params.checksum + "&", "")
			println "query string after checksum removed: " + qs
			String cs = getHash(qs, securitySalt)
			println "our checksum: " + cs
			if (cs == null || cs.equals(params.checksum) == false) {
				invalid("checksumError", "You did not pass the checksum security check")
				return false;
			}
			return true; 
		}
		println "Security is disabled in this service currently."
		return true;
	}

	public String getHash(String string, String salt) throws NoSuchAlgorithmException {
		return DigestUtils.shaHex(string + salt)
	}

	def beforeInterceptor = {
		if (dynamicConferenceService.serviceEnabled) {
			invalid("apiNotEnabled", "The API service and/or controller is not enabled on this server.  To use it, you must first enable it.")
		}
	}

	def respondWithConference(conf, msgKey, msg) {
		response.addHeader("Cache-Control", "no-cache")
		withFormat {	
			xml {
				println "Rendering as xml"
				render(contentType:"text/xml") {
					response() {
						returncode(RESP_CODE_SUCCESS)
						meetingToken("${conf.meetingToken}")
						meetingID("${conf.meetingID}")
						attendeePW("${conf.attendeePassword}")
						moderatorPW("${conf.moderatorPassword}")
						messageKey(msgKey)
						message(msg)
					}
				}
			}
		}
	}
	
	def invalid(key, msg) {
		println CONTROLLER_NAME + "#invalid"
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
		}			 
	}

}

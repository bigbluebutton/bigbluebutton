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

import org.jsecurity.authc.UnknownAccountException
import org.bigbluebutton.web.domain.ScheduledSession
import org.bigbluebutton.web.domain.Conference
import org.bigbluebutton.web.domain.User
import grails.converters.*
import org.codehaus.groovy.grails.commons.*
import org.mortbay.log.Log;

class PortalController {
		
	def index = {
		log.info "PortalController#index"
	    redirect(action:invalid)
	}

	def invalid = {
		log.info "PortalController#invalid"
		response.addHeader("Cache-Control", "no-cache")
	    withFormat {				
			xml {
				render(contentType:"text/xml") {
					'response'() {
						returncode("FAILED")
						messageKey("invalidRequest")
						message("Invalid request.")
					}
				}
			}
		}
	}
	
	def create = {
		log.info "PortalController#create"
		Integer atts = Integer.valueOf(params.maxAtts)
		def num = params.confNum
		def creator = params.creator
		def name = params.name
		String voiceConferenceBridge = params.voiceConfBridge
		String hostPassword = params.hostPW
		String moderatorPassword = params.moderatorPW
		String attendeePassword = params.attendeePW
		
		log.info "checking for duplicate conference"

		def existing = Conference.findByConferenceNumber(num)
		if (existing != null) {
			existing.sessions.each {
				if (it.hostPassword == hostPassword && it.attendeePassword == attendeePassword 
						&& it.moderatorPassword == moderatorPassword) {
					
					// found the one that's attempting to be created
					// TODO: this needs more thought - need to better understand the conf number purpose, etc...
					log.info "found matching duplicate - returning success w/ warning"
					def sess = it
					def conf = existing
					response.addHeader("Cache-Control", "no-cache")
				    withFormat {				
						xml {
							render(contentType:"text/xml") {
								'createresp'() {
									returncode("SUCCESS")
									session("$sess.sessionId")
			        				token("$sess.tokenId")
			        				confID("$conf.id")
									messageKey("duplicateWarning")
									message("This may be a duplicate. It was retrieved, not created.")
								}
							}
						}
					}
				} 						
			}
		} else {
			
			def username = "admin@test.com"
			User user = User.findByUsername("${username}")
	        if (!user) {
	            throw new UnknownAccountException("No account found for user [${username}]")
	        }

			def conf = new Conference(
					name: name, conferenceNumber: num, 
					user: user, createdBy: creator, updatedBy: creator)
			log.info "conf.save() = " + conf.save()
		
			log.info "conf has errors: " + conf.hasErrors()
			if (conf.hasErrors()) {
				conf.errors.each {
					log.info it
				}
			}
			log.info "conf id: " + conf.id
			
			String sessionId = UUID.randomUUID()
			String tokenId = UUID.randomUUID()
			Integer numberOfAttendees = atts
			Boolean timeLimited = false
			Date startDateTime = new Date()
			//Date endDateTime = calendar.getTime()
			Date endDateTime = null
			
			def sess = new ScheduledSession(
				name: name, description: name,
				createdBy: creator, modifiedBy: creator, sessionId: sessionId, tokenId: tokenId,
				numberOfAttendees: atts, timeLimited: timeLimited, startDateTime: startDateTime,
				endDateTime: startDateTime, record: false, passwordProtect: true, hostPassword: hostPassword,
				moderatorPassword: moderatorPassword, attendeePassword: attendeePassword, 
				voiceConferenceBridge: voiceConferenceBridge, conference: conf
			)
			log.info "sess.save() = " + sess.save()

			log.info "sess has errors: " + sess.hasErrors()
			if (sess.hasErrors()) {
				sess.errors.each {
					log.info it
				}
			}
			log.info "sess id: " + sess.id

			if (sess.id != null) {
				log.info "sending success"
				response.addHeader("Cache-Control", "no-cache")
			    withFormat {				
					xml {
						render(contentType:"text/xml") {
							'createresp'() {
								returncode("SUCCESS")
								session("$sess.sessionId")
		        				token("$sess.tokenId")
		        				confID("$conf.id")
		        			}
						}
					}
				}
			} else {
				log.info "sending fail"
				// TODO: obviously need much better error handling here
				response.addHeader("Cache-Control", "no-cache")
			    withFormat {				
					xml {
						render(contentType:"text/xml") {
							'createresp'() {
								returncode("FAIL")
								messageKey("generalError")
								message("error creating conf")
		        			}
						}
					}
				}
			}
		}
	}

	def join = {
		def sess = ScheduledSession.findByTokenId(params.tokenId)

		if(!sess) {
			response.addHeader("Cache-Control", "no-cache")
		    withFormat {				
				xml {
					render(contentType:"text/xml") {
						'joinresp'() {
							returncode("FAIL")
							messageKey("badTokenId")
							message("no session with that tokenId")
	        			}
					}
				}
			}
	    } else {
	    	def config = ConfigurationHolder.config
        	def hostURL = config.bigbluebutton.web.serverURL
        	log.debug "serverURL $hostURL"
	       	def now = new Date().time
	       	def signedIn = false
			def role = ''
			switch (params.password) {
				case sess.hostPassword:
					log.debug "Logged in as host"
					// Let us set role to MODERATOR for now as we don't support HOST yet
					role = "MODERATOR"
					signedIn = true
					break
				case sess.moderatorPassword:
					log.debug "Logged in as as moderator"
					role = "MODERATOR"
					signedIn = true
					break
				case sess.attendeePassword:
					log.debug "Logged in as viewer"
					role = "VIEWER"
					signedIn = true
					break
			}

	    	if (signedIn) {
				log.debug "Login successful...setting in session information"
				log.info "fullname = " + params.fullname
	   			session["fullname"] = params.fullname 
				session["role"] = role
				session["conference"] = sess.tokenId
				session["room"] = sess.sessionId
				session["voicebridge"] = sess.voiceConferenceBridge
		
				session["mode"] = "LIVE"
				session["record"] = false
				if (sess.record) {
					session["record"] = true
				}
				log.debug "Joining LIVE and recording is ${sess.record}"
			    log.debug "Displaying session information"
			    //redirect(action:show)		
	        	redirect(url:"${hostURL}/client/BigBlueButton.html")
	    	} else {
				response.addHeader("Cache-Control", "no-cache")
			    withFormat {				
					xml {
						render(contentType:"text/xml") {
							'joinresp'() {
								returncode("FAIL")
								messageKey("badPass")
								message("incorrect password")
		        			}
						}
					}
				}
	    	}
	    }
	}

	def getToken = {
		log.info "PortalController#getToken"
		def num = params.confNum
		String attendeePassword = params.attendeePW
		
		def conf = Conference.findByConferenceNumber(num)
		def found = false
		if (conf != null) {
			conf.sessions.each {
				if (it.attendeePassword == attendeePassword) {
					// found the one that's attempting to be created
					// TODO: this needs more thought - need to better understand the conf number purpose, etc...
					log.info "found matching duplicate - returning success w/ warning"
					def sess = it
					found = true
					response.addHeader("Cache-Control", "no-cache")
				    withFormat {				
						xml {
							render(contentType:"text/xml") {
								'createresp'() {
									returncode("SUCCESS")
									session("$sess.sessionId")
			        				token("$sess.tokenId")
			        				confID("$conf.id")
								}
							}
						}
					}
				}
			}
		}

		if (!found) {
			response.addHeader("Cache-Control", "no-cache")
		    withFormat {				
				xml {
					render(contentType:"text/xml") {
						'joinresp'() {
							returncode("FAIL")
							messageKey("confNotFound")
							message("no conference found with that number and attendee password")
	        			}
					}
				}
			}
		}
	}
}

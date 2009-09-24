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
 * @version $Id: $
 */
package org.bigbluebutton.web.controllers

import grails.converters.*
import org.codehaus.groovy.grails.commons.*

import org.bigbluebutton.presentation.service.AdhocConference 
import org.bigbluebutton.web.services.AdhocConferenceService

class AdhocController {

	 private final static String ROLE = 'role'
	 private final static String VIEWER = 'VIEWER'
	 private final static String MODERATOR = 'MODERATOR'
	 private final static String FULLNAME = 'fullname'
	 private final static String CONFERENCE = 'conference'
	 private final static String ROOM = 'room'
	 private final static String VOICEBRIDGE = 'voiceBridge'
	 private final static String MODE = 'mode'
	 private final static String LIVE = 'LIVE'
	 private final static String RECORD = 'record'
	 private final static String SUCCESS = 'SUCCESS'
	 private final static String FAILED = 'FAILED'
	 private final static String RESPONSE = 'response'
			
	AdhocConferenceService adhocConferenceService
	
	def beforeInterceptor = {
		 if (!adhocConferenceService.serviceEnabled) {
			response.addHeader("Cache-Control", "no-cache")
			withFormat {				
				xml {
					render(contentType:"text/xml") {
						response() {
							returncode("FAILED")
							messageKey("invalidRequest")
							message("Invalid request.")
						}
					}
				}
			}			 
		 }
	}
	 
	def index = {
		log.info "AdhocController#index"
	    redirect(action:invalid)
	}

	def invalid = {
		log.info "AdhocController#invalid"
		response.addHeader("Cache-Control", "no-cache")
	    withFormat {				
			xml {
				render(contentType:"text/xml") {
					response() {
						returncode("FAILED")
						messageKey("invalidRequest")
						message("Invalid request.")
					}
				}
			}
		}
	}
	
	def createConference = {
		log.info "AdhocController#create: format $request.format"	
		
		String voiceConf
		if (request.format == 'xml') {
			voiceConf = params.conference.voiceBridge
		} else {
			voiceConf = params.voiceBridge
		}
	
		log.debug "Got voiceBridge ${voiceConf}"
			
		adhocConferenceService.createConference(voiceConf)
		
		AdhocConference conf = adhocConferenceService.getConferenceWithVoiceBridge(voiceConf)
		
		response.addHeader("Cache-Control", "no-cache")
	    withFormat {	
			xml form {
				log.debug "Respond using xml format"
				render(contentType:"text/xml") {
					response() {
						returncode(SUCCESS)
						voiceBridge("${conf.voiceBridge}")
						moderatorToken("${conf.moderatorToken}")
						viewerToken("${conf.viewerToken}")
					}
				}
			}
			html {
				log.debug "Respond using xml format event if request is in html format"
				render(contentType:"text/xml") {
					response() {
						returncode(SUCCESS)
						voiceBridge("${conf.voiceBridge}")
						moderatorToken("${conf.moderatorToken}")
						viewerToken("${conf.viewerToken}")
					}
				}				
			}
			json {
				log.debug "REspond using json format"
				render(contentType:"text/json") {
					returncode SUCCESS
					voiceBridge conf.voiceBridge
					moderatorToken conf.moderatorToken
					viewerToken conf.viewerToken
				}				
			}
		}
	}

	def showConference = {
		log.info "AdhocController#show"		
		def voiceConf = params.voiceBridge
		log.debug "Got voiceBridge ${voiceConf}"
		AdhocConference conf = adhocConferenceService.getConferenceWithVoiceBridge(voiceConf)
			
		response.addHeader("Cache-Control", "no-cache")
	    withFormat {				
			xml {
				render(contentType:"text/xml") {
					response() {
						returncode(SUCCESS)
						moderatorToken("${conf.moderatorToken}")
						viewerToken("${conf.viewerToken}")
					}
				}
			}
			html {
				render(view:'joindemo')
			}
		}		
			
	}
	
	def joinConference = {
		log.info "AdhocController#join"

		String authToken
		String fullname
		
		if (request.format == 'xml') {
			authToken = params.conference.authToken
			fullname = params.conference.fullname
		} else {
			authToken = params.authToken
			fullname = params.fullname
		}
		
		log.debug "Joining as $fullname using token $authToken"
		AdhocConference conf = adhocConferenceService.getConferenceWithViewerToken(authToken)
		
		if (conf == null) {
			conf = adhocConferenceService.getConferenceWithModeratorToken(authToken)
		}
		
		if (conf == null) {
			log.info "Could not find any conference."
			response.addHeader("Cache-Control", "no-cache")
		    withFormat {				
				xml {
					render(contentType:"text/xml") {
						response() {
							returncode(FAILED)
							messageKey("invalidToken")
							message("Conference not found.")
							token("${authToken}")
						}
					}
				}
			}			
		} else {
			session[ROLE] = VIEWER
			if (conf.moderatorToken == authToken) {	   			 
				session[ROLE] = MODERATOR			
			} 
			
			session[FULLNAME] = fullname
			session[CONFERENCE] = conf.room
			session[ROOM] = conf.room
			session[VOICEBRIDGE] = conf.voiceBridge
			session[MODE] = LIVE
			session[RECORD] = false
			
			response.addHeader("Cache-Control", "no-cache")
		    withFormat {				
				xml {
					render(contentType:"text/xml") {
						response() {
							returncode(SUCCESS)
						}
					}
				}
				html {
					def hostUrl = getClientUrl()
					redirect(url:"${hostUrl}/client/BigBlueButton.html")
				}
			}			
		}		
	}

	def enterConference = {
		log.info "AdhocController#enter"
	
	    if (!session[ROOM]) {
	    	log.info "No room found."
	    	response.addHeader("Cache-Control", "no-cache")
	    	withFormat {				
	    		xml {
					render(contentType:"text/xml") {
						response() {
							returncode(FAILED)
							messageKey("invalidSession")
							message("No session found.")
						}
					}
				}
			}
	    } else {	
	    	log.debug "Found room"
	    	response.addHeader("Cache-Control", "no-cache")
	    	withFormat {				
				xml {
					render(contentType:"text/xml") {
						response() {
							returncode(SUCCESS)
							fullname(session[FULLNAME])
	        				role(session[ROLE])
	        				conference(session[CONFERENCE])
	        				room(session[ROOM])
	        				voicebridge(session[VOICEBRIDGE])
	        				mode(session[MODE])
	        				record(session[RECORD])
						}
					}
				}
			}
	    }    
	}
	 
	private String getClientUrl() {
	    def config = ConfigurationHolder.config
        return config.bigbluebutton.web.serverURL
	}
}

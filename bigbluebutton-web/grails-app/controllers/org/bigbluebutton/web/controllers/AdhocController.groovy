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
	
	AdhocConferenceService adhocConferenceService
	
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
		println "AdhocController#create"
//		if (!adhocConferenceService.enabled) redirect(action:invalid);
		
		println "Got voiceBridge ${params.voiceBridge}"
		adhocConferenceService.createConference(params.voiceBridge)
		
		AdhocConference conf = adhocConferenceService.getConferenceWithVoiceBridge(params.voiceBridge)
		
		response.addHeader("Cache-Control", "no-cache")
	    withFormat {	
			xml {
				println "Rendering as xml"
				render(contentType:"text/xml") {
					'response'() {
						returncode("SUCCESS")
						moderatorToken("${conf.moderatorToken}")
						attendeeToken("${conf.attendeeToken}")
					}
				}
			}
		}

//		render "Hello world"
	}

	def show = {
		println "AdhocController#show"
		if (!adhocConferenceService.enabled) redirect(action:invalid);
			
	//	println "Got voiceBridge ${params.voiceBridge}"
					
		AdhocConference conf = adhocConferenceService.getConferenceWithVoiceBridge('85115')
			
		response.addHeader("Cache-Control", "no-cache")
	    withFormat {				
			xml {
				render(contentType:"text/xml") {
					'response'() {
						returncode("SUCCESS")
						moderatorToken("${conf.moderatorToken}")
						attendeeToken("${conf.attendeeToken}")
					}
				}
			}
		}		
			
	}
	
	def join = {
		String authToken = params.authToken
		String fullname = params.fullname
	}

}

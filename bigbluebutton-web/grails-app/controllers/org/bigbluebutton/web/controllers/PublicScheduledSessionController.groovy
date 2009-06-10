package org.bigbluebutton.web.controllers

import org.bigbluebutton.web.domain.ScheduledSession
import org.bigbluebutton.web.domain.Conference
import grails.converters.*
import org.codehaus.groovy.grails.commons.*

class PublicScheduledSessionController {
		
	def index = {
	    redirect(action:joinIn)
	}
	
	def show = {
		def tokenId = session['conference']
		def sessionId = session['room']
		
		if (!tokenId || !sessionId) {
			redirect(action:joinIn,id:tokenId)
		}
		
		def scheduledSessionInstance = ScheduledSession.findByTokenId( tokenId )

		if(!scheduledSessionInstance) {
			flash.message = "Could not find conference session."
	        redirect(action:joinIn)
	    }
	    else { 
	    	def config = ConfigurationHolder.config
        	def hostURL = config.bigbluebutton.web.serverURL
        	println "serverURL $hostURL"
	       	def now = new Date().time	       	
	       	def inSession = ((now > scheduledSessionInstance.startDateTime.time) && (now < scheduledSessionInstance.endDateTime.time))
	       	return [ scheduledSessionInstance : scheduledSessionInstance, hostUrl:hostURL, inSession:inSession ] 
	    }
	}
	
	def joinIn = {
	    session.invalidate()
	    def sessionInfo
	    
	    if (params.id) {
	    	def conference = Conference.findByConferenceNumber(params.id)
	    	if (conference) {
	    		def c = ScheduledSession.createCriteria()
				def now = new Date()
				def results = c {
					eq('voiceConferenceBridge', conference.conferenceNumber.toString())
					and {
						le('startDateTime', now)
						and {
							gt('endDateTime', now)
						}
					}
					maxResults(1)
				}	    		
				if (results) {
					def confSession = results[0];
					sessionInfo = [name: confSession.name, description: confSession.description]
				}
	    	}
	    }
       
       	return [ fullname: params.fullname, id:(params.id), password: params.password, info:sessionInfo ]

	}
	
    def signIn = {    
		log.debug "Attempting to sign in to ${params.id}"	
		def conference = Conference.findByConferenceNumber(params.id)
		def signedIn = false
		if (conference) {
			def c = ScheduledSession.createCriteria()
			def now = new Date()
			def results = c {
				eq('voiceConferenceBridge', conference.conferenceNumber.toString())
				and {
					le('startDateTime', now)
					and {
						gt('endDateTime', now)
					}
				}
				maxResults(1)
			}

			if (results) {
				def confSession = results[0];
				def role = ''
											
				if (confSession) {
					log.debug "Found conference session ${confSession.name}"
					switch (params.password) {
						case confSession.hostPassword:
							log.debug "Logged in as host"
							// Let us set role to MODERATOR for now as we don't support HOST yet
							role = "MODERATOR"
							signedIn = true
							break
						case confSession.moderatorPassword:
							log.debug "Logged in as as moderator"
							role = "MODERATOR"
							signedIn = true
							break
						case confSession.attendeePassword:
							log.debug "Logged in as viewer"
							role = "VIEWER"
							signedIn = true
							break
					}
					if (signedIn) {						
						log.debug "Login successful...setting in session information"
			   			session["fullname"] = params.fullname 
						session["role"] = role
						session["conference"] = confSession.tokenId
						session["room"] = confSession.sessionId
						session["voicebridge"] = confSession.voiceConferenceBridge
				
						def long _10_MINUTES = 10*60*1000
					
						def startTime = confSession.startDateTime.time - _10_MINUTES
						def endTime = confSession.endDateTime.time + _10_MINUTES
							
						if ((startTime <= now.time) && (now.time <= endTime)) {
							session["mode"] = "LIVE"
							session["record"] = false
							if (confSession.record) {
								session["record"] = true
							}
							log.debug "Joining LIVE and recording is ${confSession.record}"
						} else {
							session["mode"] = "PLAYBACK"
							log.debug "Joining PLAYBACK"
						}
						    	
					    log.debug "Displaying session information"
					    //redirect(action:show)		
				    	def config = ConfigurationHolder.config
			        	def hostUrl = config.bigbluebutton.web.serverURL
			        	redirect(url:"${hostUrl}/client/BigBlueButton.html")
					}
				}					
			}	
		}
		
		if (!signedIn) {
			flash.message = "Could not log you into the conference. Please check if your conference number or schedule is correct."
			render(view:"joinIn",model: [id:params.id, fullname:params.fullname])
		}	
	}
	
    def signIn2 = {    
		println 'signIn start'		
		def confSession = ScheduledSession.findByTokenId(params.id)
		def role = ''
		def signedIn = false
			
		if (confSession) {
			println 'signIn: has conference session'
			
			println 'Found scheduled session'
			switch (params.password) {
				case confSession.hostPassword:
					println 'as host'
					// Let us set role to MODERATOR for now as we don't support HOST yet
					role = "MODERATOR"
					signedIn = true
					break
				case confSession.moderatorPassword:
					println 'as moderator'
					role = "MODERATOR"
					signedIn = true
					break
				case confSession.attendeePassword:
					println 'as viewer'
					role = "VIEWER"
					signedIn = true
					break
			}
			if (signedIn) {						
		    	println 'successful'
	   			session["fullname"] = params.fullname 
				session["role"] = role
				session["conference"] = params.id
				session["room"] = confSession.sessionId
				session["voicebridge"] = confSession.voiceConferenceBridge
			}
						
			def long _10_MINUTES = 10*60*1000
			def now = new Date().time
							
			def startTime = confSession.startDateTime.time - _10_MINUTES
			def endTime = confSession.endDateTime.time + _10_MINUTES
			
			if ((startTime <= now) && (now <= endTime)) {
				session["mode"] = "LIVE"
				session["record"] = false
				if (confSession.record) {
					session["record"] = true
				}
			} else {
				session["mode"] = "PLAYBACK"
			}
		    	
		    println 'rendering signIn'

		    redirect(action:show)			
		}
		
		if (!signedIn) {
			println 'failed'
			flash.message = "Failed to join the conference session."
			redirect(action:joinIn,id:params.id, params:[fullname:params.fullname])		
		}
	}
		
	def enter = {
	    def fname = session["fullname"]
	    def rl = session["role"]
	    def cnf = session["conference"]
	    def rm = session["room"]
		def vb = session["voicebridge"]   
	    def rec = session["record"]
	    def md = session["mode"]
	    
	    if (!rm) {
	    	response.addHeader("Cache-Control", "no-cache")
	    	withFormat {				
				xml {
					render(contentType:"text/xml") {
						'join'() {
							returnCode("FAILED")
							message("Could not find conference ${params.conference}.")
						}
					}
				}
			}
	    } else {	
	    	response.addHeader("Cache-Control", "no-cache")
	    	withFormat {				
				xml {
					render(contentType:"text/xml") {
						'join'() {
							returncode("SUCCESS")
							fullname("$fname")
	        				role("$rl")
	        				conference("$cnf")
	        				room("$rm")
	        				voicebridge("${vb}")
	        				mode("$md")
	        				record("$rec")
						}
					}
				}
			}
	    }    
	}

	def signOut = {
		// Log the user out of the application.
	    session.invalidate()

	    // For now, redirect back to the home page.
	    redirect(uri: '/')
	}
}

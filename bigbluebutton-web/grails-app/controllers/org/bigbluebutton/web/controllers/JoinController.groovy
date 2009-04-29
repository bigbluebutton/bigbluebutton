package org.bigbluebutton.web.controllers

import org.jsecurity.authc.AuthenticationException
import org.jsecurity.authc.UsernamePasswordToken
import org.jsecurity.SecurityUtils
import org.jsecurity.session.Session
import org.jsecurity.subject.Subject
import grails.converters.*
import org.bigbluebutton.web.domain.Conference

class JoinController {
 
    def index = { redirect(action: 'login', params: params) }

    def joinIn = {
        println "join $params.id"
        return [ fullname: params.fullname, id: (params.id), password: params.password ]
    }
    
    def login = {
        return [ fullname: params.fullname, conference: (params.conference), password: params.password ]
    }

    def signIn = {    
		def fullname = params.fullname		
		def conference = Conference.findByConferenceNumber(params.conference)
		def schedule = null
		def role = ''
		
		if (!conference) {
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
			def long _10_minutes = 10*60*1000
			def now = new Date().time
						
			conference.schedules.each {
				def startTime = it.startDateTime.time - _10_minutes
				def endTime = it.startDateTime.time + _10_minutes + (it.lengthOfConference * 60 * 60 * 1000) // length * min * sec * ms
				
				if ((startTime <= now) && (now <= endTime)) {
					if (it.hostPassword == params.password) {
						role = "MODERATOR"
						schedule = it
					} else if (it.attendeePassword == params.password) {
						role = "VIEWER"
						schedule = it
					} 						
				}
			}
			
	        if (!schedule) {
	        	withFormat {				
					xml {
						render(contentType:"text/xml") {
							'join'() {
								returnCode("FAILED")
								message("Could not find schedule for conference ${params.conference}.")
							}
						}
					}
				}
	        } else {
   				session["fullname"] = params.fullname 
				session["role"] = role
				session["conference"] = params.conference
				session["room"] = schedule.scheduleId
	        	
	        	def fname = session["fullname"]
	        	def rl = session["role"]
	        	def cnf = session["conference"]
	        	def rm = session["room"]
	        	
	        	withFormat {				
	        		xml {
	        			render(contentType:"text/xml") {
	        				'join'() {
	        					returncode("SUCCESS")
	        					schedulename("${schedule.scheduleName}")
	        					participantname("$fname")
	        					participantrole("$rl")
	        					conferencenumber("$cnf")
	        					conferenceroom("$rm")
	        				}
	        			}
	        		}
	        	}
	        }
		}   
    }
    
    def enter = {
//    	Subject currentUser = SecurityUtils.getSubject() 
//		Session session = currentUser.getSession()

	    def fname = session["fullname"]
	    def rl = session["role"]
	    def cnf = session["conference"]
	    def rm = session["room"]
	        	
	    if (!rm) {
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
	    	withFormat {				
				xml {
					render(contentType:"text/xml") {
						'join'() {
							returnCode("SUCCESS")
							fullname("$fname")
	        				role("$rl")
	        				conference("$cnf")
	        				room("$rm")
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

    def unauthorized = {
        render 'You do not have permission to access this page.'
    }
}



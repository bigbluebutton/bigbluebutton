/*
 * BigBlueButton - http://www.bigbluebutton.org
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
 * $Id: $
 */
package org.bigbluebutton.web.controllers

import org.bigbluebutton.web.domain.ScheduledSession
import java.util.UUID
import org.bigbluebutton.web.domain.User
import org.bigbluebutton.web.domain.Conference
import org.codehaus.groovy.grails.commons.*
import java.text.DateFormat

class ScheduledSessionController {
    
    def index = { redirect(action:list,params:params) }

    // the delete, save and update actions only accept POST requests
    def allowedMethods = [delete:'POST', save:'POST', update:'POST']

    def list = {
        if(!params.max) params.max = 10
        [ scheduledSessionInstanceList: ScheduledSession.list( params ) ]
    }

    def show = {
        def scheduledSessionInstance = ScheduledSession.get( params.id )

        if(!scheduledSessionInstance) {
            flash.message = "ScheduledSession not found with id ${params.id}"
            redirect(action:list)
        }
        else { 
        	def config = ConfigurationHolder.config
        	def hostURL = config.bigbluebutton.web.serverURL
        	println "serverURL $hostURL"
        	return [ scheduledSessionInstance : scheduledSessionInstance, hostUrl:hostURL ] 
        }
    }

    def delete = {
        def scheduledSessionInstance = ScheduledSession.get( params.id )
        if(scheduledSessionInstance) {
            scheduledSessionInstance.delete()
            flash.message = "ScheduledSession ${params.id} deleted"
            redirect(action:list)
        }
        else {
            flash.message = "ScheduledSession not found with id ${params.id}"
            redirect(action:list)
        }
    }

    def edit = {
        def scheduledSessionInstance = ScheduledSession.get( params.id )

        if(!scheduledSessionInstance) {
            flash.message = "ScheduledSession not found with id ${params.id}"
            redirect(action:list)
        }
        else {
            return [ scheduledSessionInstance : scheduledSessionInstance ]
        }
    }

    def update = {
        def scheduledSessionInstance = ScheduledSession.get( params.id )
        if(scheduledSessionInstance) {
            scheduledSessionInstance.properties = params
            if(!scheduledSessionInstance.hasErrors() && scheduledSessionInstance.save()) {
                flash.message = "ScheduledSession ${params.id} updated"
                redirect(action:show,id:scheduledSessionInstance.id)
            }
            else {
                render(view:'edit',model:[scheduledSessionInstance:scheduledSessionInstance])
            }
        }
        else {
            flash.message = "ScheduledSession not found with id ${params.id}"
            redirect(action:edit,id:params.id)
        }
    }

    def create = {
        def scheduledSessionInstance = new ScheduledSession()
        scheduledSessionInstance.properties = params
        println "Conference Id = ${params.id}"
        return ['scheduledSessionInstance':scheduledSessionInstance, conferenceId:params.id]
    }

    def save = {
    	def userid =  session["userid"]
       	def user = User.get(userid)
    	
       	params.createdBy = user.fullName
    	params.modifiedBy = user.fullName
    	   	
    	def conf = Conference.get(params.conferenceId)
    	
    	def scheduledSessionInstance = new ScheduledSession(params)
    	
		def c = ScheduledSession.createCriteria()
		def results = c {
			eq('voiceConferenceBridge', conf.conferenceNumber.toString())
			maxResults(1)
		}    	

    	def conflict = false
    	
    	def sched
    	
    	if (results.size() > 0) {
        	sched = results[0]    	
       		if ((scheduledSessionInstance.startDateTime > sched.startDateTime) && (scheduledSessionInstance.startDateTime < sched.endDateTime)) {
       			log.debug "Start time is between start and date time of session ${sched.name}"
       			conflict = true
       		} else {
       			if ((scheduledSessionInstance.endDateTime > sched.startDateTime) && (scheduledSessionInstance.endDateTime < sched.endDateTime )) {
       				log.debug "End time is between start and date time of session ${sched.name}"
       				conflict = true
       			}
       		}     		
    	}
  	   	
    	if(conflict) {
    		log.debug "There is a conflict with ${sched.name}"
            flash.message = "There is a conflict with ${sched.name}."
            render(view:'create',model:[scheduledSessionInstance:scheduledSessionInstance, conferenceId:params.conferenceId])
        } else {	        
	    	scheduledSessionInstance.sessionId = UUID.randomUUID()
	    	scheduledSessionInstance.tokenId = UUID.randomUUID()
	    	scheduledSessionInstance.conference = conf
	    	
	    	//scheduledSessionInstance.voiceConferenceBridge = generateUniqueVoiceConferenceBridgeNumber()
	    	
	    	// Let's use the manually created conference number
	    	scheduledSessionInstance.voiceConferenceBridge = conf.conferenceNumber.toString()
	    	    	
	        if(!scheduledSessionInstance.hasErrors() && scheduledSessionInstance.save()) {
	            flash.message = "ScheduledSession ${scheduledSessionInstance.id} created"
	            redirect(action:show,id:scheduledSessionInstance.id)
	        }
	        else {
	        	println "Returning conference id ${params.conferenceId}"
	            render(view:'create',model:[scheduledSessionInstance:scheduledSessionInstance, conferenceId:params.conferenceId])
	        }
        }
    }
    
    def generateVoiceConferenceBridgeNumber = {
    	// Let's setup our conference number as six digits
    	def MAX = 999999
    	def MIN = 100000
    	
    	return new Integer((int) (Math.random() * (MAX - MIN + 1)) + MIN)
    }
    
    def generateUniqueVoiceConferenceBridgeNumber() {
    	def bridgeExists = true
    	def voiceBridge
    	while (bridgeExists) {
    		voiceBridge = generateVoiceConferenceBridgeNumber()
    		// Check if the bridge has already exists
    		def vb = ScheduledSession.findByVoiceConferenceBridge(voiceBridge.toString())
    		if (vb == null) {
    			bridgeExists = false
    		}
    	}
    	
    	return voiceBridge
    }
}

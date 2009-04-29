package org.bigbluebutton.web.controllers

import org.bigbluebutton.web.domain.ScheduledSession
import java.util.UUID
import org.bigbluebutton.web.domain.User
import org.bigbluebutton.web.domain.Conference

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
        	def hostUrl = grailsApplication.config.grails.serverURL
        	
        	return [ scheduledSessionInstance : scheduledSessionInstance, hostUrl:hostUrl ] 
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
    	scheduledSessionInstance.sessionId = UUID.randomUUID()
    	scheduledSessionInstance.tokenId = UUID.randomUUID()
    	scheduledSessionInstance.conference = conf
    	
    	scheduledSessionInstance.voiceConferenceBridge = generateUniqueVoiceConferenceBridgeNumber()
    	    	
        if(!scheduledSessionInstance.hasErrors() && scheduledSessionInstance.save()) {
            flash.message = "ScheduledSession ${scheduledSessionInstance.id} created"
            redirect(action:show,id:scheduledSessionInstance.id)
        }
        else {
        	println "Returning conference id ${params.conferenceId}"
            render(view:'create',model:[scheduledSessionInstance:scheduledSessionInstance, conferenceId:params.conferenceId])
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

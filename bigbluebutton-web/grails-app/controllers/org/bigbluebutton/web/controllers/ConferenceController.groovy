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

import org.jsecurity.SecurityUtils
import org.jsecurity.session.Session
import org.jsecurity.subject.Subject
import org.bigbluebutton.web.domain.Conference
import org.bigbluebutton.web.domain.User
import org.bigbluebutton.web.domain.ScheduledSession

class ConferenceController {
    def index = { redirect(action:list,params:params) }

    // the delete, save and update actions only accept POST requests
    static def allowedMethods = [delete:'POST', save:'POST', update:'POST']

    def list = {
        if(!params.max) params.max = 10 
   		def username = session["username"]
   		log.debug "Getting conference owned by $username"
   		def user = User.findByUsername(username)
   		def conferenceList = Conference.findAllByUser(user)
   		if (conferenceList == null) conferenceList = []
        return [ conferenceList: conferenceList]       	
    }

    def show = {
        def conference = Conference.get( params.id )

        if(!conference) {
            flash.message = "Conference not found with id ${params.id}"
            redirect(action:list)
        }
        else {         	
        	def scheduledSessions = ScheduledSession.findAllByConference(conference)
        	def sessionsList = []
        	def hostUrl = grailsApplication.config.grails.serverURL
        	
        	scheduledSessions.each {
        		def sss = new Expando()
        		sss.id = it.id
        		sss.name = it.name
        		sss.token = it.tokenId
        		sss.hostUrl = hostUrl
        		sss.expired = true
        		sessionsList << sss
        	}
        	return [ conference : conference, sessions : sessionsList ] 
        }
    }

    def delete = {
        def conference = Conference.get( params.id )
        if(conference) {
            conference.delete()
            flash.message = "${conference.name} has been deleted."
            redirect(action:list)
        }
        else {
            flash.message = "Cannot find conference."
            redirect(action:list)
        }
    }

    def edit = {
        def conference = Conference.get( params.id )

        if(!conference) {
            flash.message = "Cannot find conference ${conference.name}."
            redirect(action:list)
        }
        else {
            return [ conference : conference ]
        }
    }

    def update = {
        def conference = Conference.get( params.id )
        if(conference) {
            conference.properties = params
            def userid =  session["userid"]
       		def user = User.get(userid)
       		conference.updatedBy = user.fullName
            if(!conference.hasErrors() && conference.save()) {
                flash.message = "The conference has been updated."
                redirect(action:show,id:conference.id)
            }
            else {
                render(view:'edit',model:[conference:conference])
            }
        }
        else {
            flash.message = "Conference not found with id ${params.id}"
            redirect(action:edit,id:params.id)
        }
    }

    def create = {
        def conference = new Conference()
        conference.properties = params      
        def now = new Date()
        conference.name = "$now Conference"   
        return ['conference':conference]
    }

    def save = {
   		def conference = new Conference(params)
   		 
   		def userid =  session["userid"]
   		def user = User.get(userid)
   		conference.createdBy = user.fullName
   		conference.updatedBy = user.fullName
   		conference.user = user
   		
        if(!conference.hasErrors() && conference.save()) {
            flash.message = "You have successfully created a conference."
            redirect(action:show,id:conference.id)
        }
        else {
            render(view:'create',model:[conference:conference])
        }
    }
}
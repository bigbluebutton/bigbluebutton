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

package org.bigbluebutton.conference.service.voice

import java.util.Map
import org.bigbluebutton.conference.service.archive.record.IEventRecorder
import org.bigbluebutton.conference.service.archive.record.IRecorderimport org.red5.server.api.so.ISharedObject
import org.bigbluebutton.conference.Participant
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.red5.logging.Red5LoggerFactoryimport groovy.xml.MarkupBuilder

public class VoiceEventRecorder implements IEventRecorder, IVoiceRoomListener {
	private static Logger log = Red5LoggerFactory.getLogger( VoiceEventRecorder.class, "bigbluebutton" )
	
	IRecorder recorder
	private ISharedObject so
	private final Boolean record
	
	def APP_NAME = 'VOICE'
	
	def acceptRecorder(IRecorder recorder){
		log.debug("Accepting IRecorder")
		this.recorder = recorder
	}
	
	def getName() {
		return APP_NAME
	}
	
	def recordEvent(Map event){
		if (record) {
			recorder.recordEvent(event)
		}
	}
	
	public VoiceEventRecorder(ISharedObject so, Boolean record) {
		this.so = so 
		this.record = record
	}
	
	def joined(user, name, muted, talking){
		log.debug("Participant $name joining")
		// Just send the name to represent callerId number for now
		so.sendMessage("userJoin", [user, name, name, muted, talking])
		
		/* Comment out for now (ralam 4/17/2009)
		def writer = new StringWriter()
		def xml = new MarkupBuilder(writer)
		xml.event(name:'joined', date:new Date().time, application:APP_NAME) {
			participant(id:user, name:name, muted:muted, talking:talking)
		}
		recorder.recordXmlEvent(writer.toString())
		*/
		
		Map event = new HashMap()
		event.put("date", new Date().time)
		event.put("application", APP_NAME)
		event.put("event", "joined")
		event.put('participant', user)
		event.put('name', name)
		event.put('muted', muted)
		event.put('talking', talking)
		recordEvent(event)	
	}
	
	def left(user){
		log.debug("Participant $user leaving")
		so.sendMessage("userLeft", [user])

		/* Comment out for now (ralam 4/17/2009)
		def writer = new StringWriter()
		def xml = new MarkupBuilder(writer)
		xml.event(name:'left', date:new Date().time, application:APP_NAME) {
			participant(id:user)
		}
		recorder.recordXmlEvent(writer.toString())
		*/
		
		Map event = new HashMap()
		event.put("date", new Date().time)
		event.put("application", APP_NAME)
		event.put("event", "left")
		event.put('participant', user)
		recordEvent(event)
	}
	
	def mute(user, muted){
		log.debug("Participant $user mute $muted")
		so.sendMessage("userMute", [user, muted])

		/* Comment out for now (ralam 4/17/2009)
		def writer = new StringWriter()
		def xml = new MarkupBuilder(writer)
		xml.event(name:'mute', date:new Date().time, application:APP_NAME) {
			participant(id:user, mute:muted)
		}
		recorder.recordXmlEvent(writer.toString())
		*/
		
		Map event = new HashMap()
		event.put("date", new Date().time)
		event.put("application", APP_NAME)
		event.put("event", "mute")
		event.put('participant', user)
		event.put('mute', muted)
		recordEvent(event)
	}
	
	def talk(user, talking){
		log.debug("Participant $user talk $talking")
		so.sendMessage("userTalk", [user, talking])

		/* Comment out for now (ralam 4/17/2009)
		def writer = new StringWriter()
		def xml = new MarkupBuilder(writer)
		xml.event(name:'talk', date:new Date().time, application:APP_NAME) {
			'participant'(id:user, talk:talking)
		}
		recorder.recordXmlEvent(writer.toString())
		*/
		
		Map event = new HashMap()
		event.put("date", new Date().time)
		event.put("application", APP_NAME)
		event.put("event", "talk")
		event.put('participant', user)
		event.put('talk', talking)
		recordEvent(event)
	}
}

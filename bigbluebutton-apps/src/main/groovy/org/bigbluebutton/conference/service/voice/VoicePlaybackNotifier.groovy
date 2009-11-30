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
import org.bigbluebutton.conference.service.archive.playback.IPlaybackNotifier
import org.red5.server.api.so.ISharedObjectimport org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.red5.logging.Red5LoggerFactory
public class VoicePlaybackNotifier implements IPlaybackNotifier{
	private static Logger log = Red5LoggerFactory.getLogger( VoicePlaybackNotifier.class, "bigbluebutton" )
	
	private ISharedObject so
	def name = 'VOICE'
	
	public VoicePlaybackNotifier(ISharedObject so) {
		this.so = so
	}
	
	def sendMessage(Map event){
		log.debug("Playing event " + event['event'])
		switch (event['event']) {
		case 'joined':
			joined(event['participant'], event['name'], event['muted'], event['talking'])
			break
		case 'left':
			left(event['participant'])
			break
		case 'mute':
			mute(event['participant'], event['mute'])
			break
		case 'talk':
			talk(event['participant'], event['talk'])
			break
		}
	}
	
	def notifierName(){
		return name
	}
	
	def joined(participant, name, muted, talking){
		log.debug("Participant $name joining")
		
		// Just send the name to represent callerId number for now
		so.sendMessage("userJoin", [participant, name, name, muted, talking])		
	}
	
	def left(participant){
		log.debug("Participant $participant leaving")
		so.sendMessage("userLeft", [participant])
	}
	
	def mute(participant, mute){
		log.debug("Participant $participant mute $mute")
		so.sendMessage("userMute", [participant, mute])
	}
	

	def talk(participant, talk){
		log.debug("Participant $participant talk $talk")
		so.sendMessage("userTalk", [participant, talk])
	}
}

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

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.red5.logging.Red5LoggerFactory
public class ConferenceServerListener implements IConferenceServerListener{
	private static Logger log = Red5LoggerFactory.getLogger( ConferenceServerListener.class, "bigbluebutton" )
	
	private VoiceApplication voiceApplication
	
	def joined(room, participant, name, muted, talking){
		log.debug("joined: $room $participant $name $muted $talking")
		voiceApplication.joined(room, participant, name, muted, talking)
	}
	

	def left(room, participant){
		log.debug("left: $room $participant")
		voiceApplication.left(room, participant)
	}
	

	def mute(participant, room, mute){
		log.debug("mute: $participant $room $mute")
		voiceApplication.mute(participant, room, mute)
	}
	

	def talk(participant, room, talk){
		log.debug("talk: $participant $room $talk")
		voiceApplication.talk(participant, room, talk)
	}
	
	public void setVoiceApplication(VoiceApplication a) {
		log.debug('setting voice application')
		voiceApplication = a
		log.debug('setting voice application DONE')
	}
}

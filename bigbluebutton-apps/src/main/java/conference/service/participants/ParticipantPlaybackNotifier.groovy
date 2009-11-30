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

package org.bigbluebutton.conference.service.participants

import java.util.Map
import org.bigbluebutton.conference.service.archive.playback.IPlaybackNotifier
import org.red5.server.api.so.ISharedObjectimport org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.red5.logging.Red5LoggerFactory

import org.bigbluebutton.conference.Participant
public class ParticipantPlaybackNotifier implements IPlaybackNotifier{
	private static Logger log = Red5LoggerFactory.getLogger( ParticipantPlaybackNotifier.class, "bigbluebutton" )
	
	private ISharedObject so
	def name = 'PARTICIPANT'
	
	public ParticipantPlaybackNotifier(ISharedObject so) {
		this.so = so
	}
	
	def sendMessage(Map event){
		switch (event['event']) {
			case 'participantStatusChange' :
				def status = event['status']
				def userid = event['userid']
				def value = event['value']
				participantStatusChange(userid, status, value)				
				break
			case 'participantJoined':
				def status = event['user']['status']
				def userid = event['user']['userid']
				def name = event['user']['name']
				def role = event['user']['role']
				def p = new Participant(userid, name, role, status)
				participantJoined(p)
				break
			case 'participantLeft' :
				def userid = event['userid']
				participantLeft(userid)
				break			
		}
	}
	
	def notifierName(){
		return name
	}

	private void participantStatusChange(def userid, def status, def value){
		log.debug("A participant's status has changed ${userid} $status $value.")
		so.sendMessage("participantStatusChange", [userid, status, value])
	}
	
	private void participantJoined(Participant p) {
		log.debug("A participant has joined ${p.userid}.")
		List args = new ArrayList()
		args.add(p.toMap())
		log.debug("Sending participantJoined ${p.userid} to client.")
		so.sendMessage("participantJoined", args)
	}
	
	private void participantLeft(Long userid) {		
		List args = new ArrayList()
		args.add(userid)
		so.sendMessage("participantLeft", args)
	}
}

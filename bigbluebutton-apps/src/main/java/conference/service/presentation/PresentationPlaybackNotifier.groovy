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

package org.bigbluebutton.conference.service.presentation

import java.util.Map
import org.bigbluebutton.conference.service.archive.playback.IPlaybackNotifier
import org.red5.server.api.so.ISharedObjectimport org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.red5.logging.Red5LoggerFactory

public class PresentationPlaybackNotifier implements IPlaybackNotifier{
	private static Logger log = Red5LoggerFactory.getLogger( PresentationPlaybackNotifier.class, "bigbluebutton" )
	
	private ISharedObject so
	def name = 'PRESENTATION'
	
	public PresentationPlaybackNotifier(ISharedObject so) {
		this.so = so
	}
	
	def sendMessage(Map event){
		log.debug("Playback presentation message...")

		switch (event['event']) {
			case 'assignPresenter' :
				def userid = event['userid']
				def name = event['name']
				def assignedBy = event['assignedBy']
				so.sendMessage("assignPresenterCallback", [userid, name, assignedBy])				
				break
			case 'gotoSlide':
				def slide = event['slide']
				so.sendMessage("gotoSlideCallback", [new Integer(slide)] )
				break	
			case 'sharePresentation':
				def presentationName = event["presentationName"]
				def share  = event["share"]
				so.sendMessage("sharePresentationCallback", [presentationName, share] )
				break
		}
	}
	
	def notifierName(){
		return name
	}
}

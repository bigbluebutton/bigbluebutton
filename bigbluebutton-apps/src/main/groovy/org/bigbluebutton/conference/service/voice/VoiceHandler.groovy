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

import org.red5.server.adapter.IApplication
import org.red5.server.api.IClient
import org.red5.server.api.IConnection
import org.red5.server.api.IScope
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.red5.server.api.so.ISharedObject
import org.red5.server.adapter.ApplicationAdapter
import org.red5.server.api.Red5import java.util.Mapimport org.bigbluebutton.conference.BigBlueButtonSessionimport org.bigbluebutton.conference.Constantsimport org.bigbluebutton.conference.service.archive.ArchiveApplicationimport org.red5.logging.Red5LoggerFactory
public class VoiceHandler extends ApplicationAdapter implements IApplication{
	private static Logger log = Red5LoggerFactory.getLogger( VoiceHandler.class, "bigbluebutton" )

	private static final String VOICE = "VOICE"
	private static final String VOICE_SO = "meetMeUsersSO"
	private static final String APP = "VOICE"

	private ArchiveApplication archiveApplication
	private VoiceApplication voiceApplication
	private IVoiceServer voiceServer
	
	@Override
	public boolean appConnect(IConnection conn, Object[] params) {
		log.debug("${APP}:appConnect")
		return true
	}

	@Override
	public void appDisconnect(IConnection conn) {
		log.debug( "${APP}:appDisconnect")
	}

	@Override
	public boolean appJoin(IClient client, IScope scope) {
		log.debug( "${APP}:appJoin ${scope.name}")
		return true
	}

	@Override
	public void appLeave(IClient client, IScope scope) {
		log.debug("${APP}:appLeave ${scope.name}")

	}

	@Override
	public boolean appStart(IScope scope) {
		log.debug("${APP}:appStart ${scope.name}")
		voiceServer.start()
		return true;
	}

	@Override
	public void appStop(IScope scope) {
		log.debug("${APP}:appStop ${scope.name}")
		voiceServer.stop()
	}

	@Override
	public boolean roomConnect(IConnection connection, Object[] params) {
		log.debug("${APP}:roomConnect")
		if (getBbbSession().playbackMode()) {
			log.debug("In playback mode")
			ISharedObject so = getSharedObject(connection.scope, VOICE_SO)
			VoicePlaybackNotifier notifier = new VoicePlaybackNotifier(so)
			archiveApplication.addPlaybackNotifier(connection.scope.name, notifier)
		} else {
			log.debug("In live mode")
			ISharedObject so = getSharedObject(connection.scope, VOICE_SO)
			
			log.debug("Setting up recorder")
			VoiceEventRecorder recorder = new VoiceEventRecorder(so, getBbbSession().record)
			log.debug("adding event recorder to ${connection.scope.name}")
			archiveApplication.addEventRecorder(connection.scope.name, recorder)
			
			log.debug("Adding room listener")
    		voiceApplication.addRoomListener(connection.scope.name, recorder)
    		
    		def voiceBridge = getBbbSession().voiceBridge    		
    		log.debug("Setting up voiceBridge $voiceBridge")
    		voiceApplication.setConference(connection.scope.name, voiceBridge)
    		voiceServer.initializeRoom(voiceBridge)
		}
    	return true;
	}

	@Override
	public void roomDisconnect(IConnection connection) {
		log.debug("${APP}:roomDisconnect")

	}

	@Override
	public boolean roomJoin(IClient client, IScope scope) {
		log.debug("${APP}:roomJoin ${scope.name} - ${scope.parent.name}")
		return true;
	}

	@Override
	public void roomLeave(IClient client, IScope scope) {
		log.debug("${APP}:roomLeave ${scope.name}")
	}

	@Override
	public boolean roomStart(IScope scope) {
		log.debug("${APP} - roomStart ${scope.name}")
		voiceApplication.createRoom(scope.name)
    	if (!hasSharedObject(scope, VOICE_SO)) {
    		if (createSharedObject(scope, VOICE_SO, false)) {    			
    			return true 			
    		}    		
    	}  	
		log.error("Failed to start room ${scope.name}")
    	return false;
	}

	@Override
	public void roomStop(IScope scope) {
		log.debug("${APP}:roomStop ${scope.name}")
		voiceApplication.destroyRoom(scope.name)
		if (!hasSharedObject(scope, VOICE_SO)) {
    		clearSharedObjects(scope, VOICE_SO)
    	}
	}
	
	public void setVoiceApplication(VoiceApplication a) {
		log.debug("Setting voice application")
		voiceApplication = a
	}
	
	public void setIVoiceServer(IVoiceServer s) {
		log.debug("Setting voice server")
		voiceServer = s
		log.debug("Setting voice server DONE")
	}
	
	public void setArchiveApplication(ArchiveApplication a) {
		log.debug("Setting archive application")
		archiveApplication = a
		log.debug("Setting archive application DONE")
	}
	
	private BigBlueButtonSession getBbbSession() {
		return Red5.connectionLocal.getAttribute(Constants.SESSION)
	}
}

/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/
package org.bigbluebutton.conference.service.voice;

import org.red5.server.adapter.IApplication;
import org.red5.server.api.IClient;
import org.red5.server.api.IConnection;
import org.slf4j.Logger;
import org.red5.server.api.scope.IScope;
import org.red5.server.api.so.ISharedObject;
import org.red5.server.adapter.ApplicationAdapter;
import org.red5.server.api.Red5;import org.bigbluebutton.conference.BigBlueButtonSession;import org.bigbluebutton.conference.Constants;import org.red5.logging.Red5LoggerFactory;
import org.bigbluebutton.webconference.voice.ConferenceService;
import org.bigbluebutton.webconference.red5.voice.ClientNotifier; 
public class VoiceHandler extends ApplicationAdapter implements IApplication{
	private static Logger log = Red5LoggerFactory.getLogger(VoiceHandler.class, "bigbluebutton");

	private static final String VOICE_SO = "meetMeUsersSO";
	private static final String APP = "VOICE";

	private ClientNotifier clientManager;
	private ConferenceService conferenceService;

	@Override
	public boolean appConnect(IConnection conn, Object[] params) {
		log.debug("***** " + APP + " [ " + " appConnect *********");
		return true;
	}

	@Override
	public void appDisconnect(IConnection conn) {
		log.debug("***** " + APP + " [ " + " appDisconnect *********");
	}

	@Override
	public boolean appJoin(IClient client, IScope scope) {
		log.debug("***** " + APP + " [ " + " appJoin [ " + scope.getName() + "] *********");
		return true;
	}

	@Override
	public void appLeave(IClient client, IScope scope) {
		log.debug("***** " + APP + " [ " + " appLeave [ " + scope.getName() + "] *********");
	}

	@Override
	public boolean appStart(IScope scope) {
		log.debug("***** " + APP + " [ " + " appStart [ " + scope.getName() + "] *********");
		return conferenceService.startup();
	}

	@Override
	public void appStop(IScope scope) {
		log.debug("***** " + APP + " [ " + " appStop [ " + scope.getName() + "] *********");
		conferenceService.shutdown();
	}
	
	@Override
	public void roomDisconnect(IConnection connection) {
		log.debug("***** " + APP + " [ " + " roomDisconnect [ " + connection.getScope().getName() + "] *********");
	}

	@Override
	public boolean roomJoin(IClient client, IScope scope) {
		log.debug(APP + ":roomJoin " + scope.getName() + " - " + scope.getParent().getName());
		return true;
	}

	@Override
	public void roomLeave(IClient client, IScope scope) {
		log.debug("***** " + APP + " [ " + " roomLeave [ " + scope.getName() + "] *********");
		
		System.out.println("********************* DISCONNECTING FROM VOICE ROOM **************************** ");
		if (scope.hasAttribute(VOICE_BRIDGE)) {
			String voiceBridge = (String) scope.getAttribute(VOICE_BRIDGE);
			String userID = getBbbSession().getExternUserID();
			log.info("User has left the meeting. Try to hangup user=[" + userID + "] from [" + voiceBridge + "] ");
			conferenceService.hangupUser(userID, voiceBridge);
		}
	}
	
	@Override
	public boolean roomStart(IScope scope) {
		log.debug("***** " + APP + " [ " + " roomStart [ " + scope.getName() + "] *********");
		
    	return true;
	}

	private static final String VOICE_BRIDGE = "VOICE_BRIDGE";
	
	@Override
	public boolean roomConnect(IConnection connection, Object[] params) {
		log.debug("***** " + APP + " [ " + " roomConnect [ " + connection.getScope().getName() + "] *********");
		  			
		ISharedObject so = getSharedObject(connection.getScope(), VOICE_SO, false);
	    		
    	String voiceBridge = getBbbSession().getVoiceBridge();
    	String meetingid = getBbbSession().getRoom(); 
    	Boolean record = getBbbSession().getRecord();
    	
    	if (!connection.getScope().hasAttribute(VOICE_BRIDGE)) {
    		connection.getScope().setAttribute(VOICE_BRIDGE, getBbbSession().getVoiceBridge());
    	}
    	
    	log.debug("Setting up voiceBridge " + voiceBridge);
    	clientManager.addSharedObject(connection.getScope().getName(), voiceBridge, so);
    	conferenceService.createConference(voiceBridge, meetingid, record); 			

		return true;
	}



	@Override
	public void roomStop(IScope scope) {
		log.debug("***** " + APP + " [ " + " roomStop [ " + scope.getName() + "] *********");
		/**
		 * Remove the voicebridge from the list of running
		 * voice conference.
		 */
		String voiceBridge = (String) scope.getAttribute(VOICE_BRIDGE);
		conferenceService.destroyConference(voiceBridge);
		clientManager.removeSharedObject(scope.getName());
		if (hasSharedObject(scope, VOICE_SO)) {
    		clearSharedObjects(scope, VOICE_SO);
    	}
	}
	
	public void setClientNotifier(ClientNotifier c) {
		log.debug("Setting voice application");
		clientManager = c;
	}
	
	public void setConferenceService(ConferenceService s) {
		log.debug("Setting voice server");
		conferenceService = s;
		log.debug("Setting voice server DONE");
	}

	
	private BigBlueButtonSession getBbbSession() {
		return (BigBlueButtonSession) Red5.getConnectionLocal().getAttribute(Constants.SESSION);
	}
}

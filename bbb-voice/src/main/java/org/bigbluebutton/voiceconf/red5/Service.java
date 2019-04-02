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
package org.bigbluebutton.voiceconf.red5;

import java.text.MessageFormat;
import org.slf4j.Logger;
import org.bigbluebutton.voiceconf.sip.PeerNotFoundException;
import org.bigbluebutton.voiceconf.sip.SipPeerManager;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.IConnection;
import org.red5.server.api.Red5;
import org.bigbluebutton.voiceconf.sip.GlobalCall;

public class Service {
    private static Logger log = Red5LoggerFactory.getLogger(Service.class, "sip");

    private SipPeerManager sipPeerManager;
	
	private MessageFormat callExtensionPattern = new MessageFormat("{0}");
    	
	public Boolean call(String peerId, String callerName, String destination, Boolean listenOnly) {
		if (listenOnly) {
			if (GlobalCall.reservePlaceToCreateGlobal(destination)) {
				String extension = callExtensionPattern.format(new String[] { destination });
				try {
					sipPeerManager.call(peerId, destination, "GLOBAL_AUDIO_" + destination, extension);
					Red5.getConnectionLocal().setAttribute("VOICE_CONF_PEER", peerId);
				} catch (PeerNotFoundException e) {
					log.error("PeerNotFound {}", peerId);
					return false;
				}
			}
			sipPeerManager.connectToGlobalStream(peerId, getClientId(), callerName, destination);
			Red5.getConnectionLocal().setAttribute("VOICE_CONF_PEER", peerId);
			return true;
		} else {
			Boolean result = call(peerId, callerName, destination);
			return result;
		}
	}

	public Boolean call(String peerId, String callerName, String destination) {
    	String clientId = Red5.getConnectionLocal().getClient().getId();
    	String userid = getUserId();
    	String username = getUsername();		
    	log.debug("{} is requesting to join into the conference {}", username + "[uid=" + userid + "][clientid=" + clientId + "]", destination);
		
		String extension = callExtensionPattern.format(new String[] { destination });
		try {
			sipPeerManager.call(peerId, getClientId(), callerName, extension);
			Red5.getConnectionLocal().setAttribute("VOICE_CONF_PEER", peerId);
			return true;
		} catch (PeerNotFoundException e) {
			log.error("PeerNotFound {}", peerId);
			return false;
		}
	}

	public Boolean hangup(String peerId) {
    	String clientId = Red5.getConnectionLocal().getClient().getId();
    	String userid = getUserId();
    	String username = getUsername();		
    	log.debug("{} is requesting to hang up from the conference.", username + "[uid=" + userid + "][clientid=" + clientId + "]");
		try {
			sipPeerManager.hangup(peerId, getClientId(), true);
			return true;
		} catch (PeerNotFoundException e) {
			log.error("PeerNotFound {}", peerId);
			return false;
		}
	}

	private String getClientId() {
		IConnection conn = Red5.getConnectionLocal();
		return conn.getClient().getId();
	}
	
	public void setCallExtensionPattern(String callExtensionPattern) {
		this.callExtensionPattern = new MessageFormat(callExtensionPattern);
	}
	
	public void setSipPeerManager(SipPeerManager sum) {
		sipPeerManager = sum;
	}
	
	private String getUserId() {
		String userid = (String) Red5.getConnectionLocal().getAttribute("USERID");
		if ((userid == null) || ("".equals(userid))) userid = "unknown-userid";
		return userid;
	}
	
	private String getUsername() {
		String username = (String) Red5.getConnectionLocal().getAttribute("USERNAME");
		if ((username == null) || ("".equals(username))) username = "UNKNOWN-CALLER";
		return username;
	}
}

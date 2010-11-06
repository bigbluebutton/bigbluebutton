/** 
*
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
* 
**/
package org.bigbluebutton.voiceconf.red5;

import java.text.MessageFormat;
import org.slf4j.Logger;
import org.bigbluebutton.voiceconf.sip.PeerNotFoundException;
import org.bigbluebutton.voiceconf.sip.SipPeerManager;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.IConnection;
import org.red5.server.api.Red5;

public class Service {
    private static Logger log = Red5LoggerFactory.getLogger(Service.class, "sip");

    private SipPeerManager sipPeerManager;
	
	private MessageFormat callExtensionPattern = new MessageFormat("{0}");
    	
	public Boolean call(String peerId, String callerName, String destination) {
		log.debug("Joining voice conference " + destination);
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
		log.debug("Red5SIP Hangup");
		try {
			sipPeerManager.hangup(peerId, getClientId());
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
}

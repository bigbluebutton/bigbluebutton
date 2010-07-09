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
package org.bigbluebutton.voiceconf.sip;

import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;
import org.zoolu.sip.message.Message;
import org.zoolu.sip.message.MessageFactory;
import org.zoolu.sip.provider.SipProvider;
import org.zoolu.sip.provider.SipProviderListener;

public class OptionMethodListener implements SipProviderListener {

	protected static Logger log = Red5LoggerFactory.getLogger( OptionMethodListener.class, "sip" );
	
	public void onReceivedMessage(SipProvider sip_provider, Message message) {
		if (message.isOption()) {
			log.debug("Received OPTION message");
			Message response = MessageFactory.createResponse(message, 200, "OK", message.getFromHeader().getNameAddress());
			sip_provider.sendMessage(response);
		}
	}

}

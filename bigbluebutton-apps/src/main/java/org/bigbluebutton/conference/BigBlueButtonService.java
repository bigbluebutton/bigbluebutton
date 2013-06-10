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

package org.bigbluebutton.conference;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import org.bigbluebutton.conference.meeting.messaging.red5.BroadcastClientMessage;
import org.bigbluebutton.conference.meeting.messaging.red5.ConnectionInvokerService;
import org.red5.server.api.Red5;

public class BigBlueButtonService {
	private ConnectionInvokerService connInvokerService;
	
	public void sendMessage(HashMap<String, Object> params) {
		
		Map<String, Object> messageToSend = new HashMap<String, Object>();
		
	    for (Iterator<String> it = params.keySet().iterator(); it.hasNext();) {
	        String key = it.next();
	        messageToSend.put(key, params.get(key));
	    }
	    		
		BroadcastClientMessage m = new BroadcastClientMessage(getMeetingId(), (String) params.get("messageID"), messageToSend);
		connInvokerService.sendMessage(m);
	}
	
	private String getMeetingId(){
		return Red5.getConnectionLocal().getScope().getName();
	}
	
	public void setConnInvokerService(ConnectionInvokerService connInvokerService) {
		this.connInvokerService = connInvokerService;
	}
	
}

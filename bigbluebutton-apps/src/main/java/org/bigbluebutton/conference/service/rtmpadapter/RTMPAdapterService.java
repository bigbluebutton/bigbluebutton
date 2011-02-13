/** 
* ===License Header===
*
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
* 
* ===License Header===
*/
package org.bigbluebutton.conference.service.rtmpadapter;

import java.util.List;

import org.red5.compatibility.flex.messaging.io.ArrayCollection;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class RTMPAdapterService {

	private static Logger log = Red5LoggerFactory.getLogger(RTMPAdapterService.class, "bigbluebutton");
	
	private RTMPAdapterApp application;
	
	public void setRTMPAdapter(RTMPAdapterApp a){
		log.info("RTMPAdapterService: setting application instance");
		this.application = a;
	}

	public void sendData(String appName, String method, String data){
		application.sendData(appName, method, data);
	}
	
}

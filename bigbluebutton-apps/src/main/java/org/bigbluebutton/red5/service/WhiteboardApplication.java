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
package org.bigbluebutton.red5.service;

import org.red5.logging.Red5LoggerFactory;
import org.red5.server.adapter.IApplication;
import org.red5.server.api.IClient;
import org.red5.server.api.IConnection;
import org.red5.server.api.scope.IScope;
import org.slf4j.Logger;
import org.bigbluebutton.red5.pubsub.MessagePublisher;

public class WhiteboardApplication implements IApplication {	
	private static Logger log = Red5LoggerFactory.getLogger(WhiteboardApplication.class, "bigbluebutton");

	private MessagePublisher red5BBBInGW;

	public void setRed5Publisher(MessagePublisher inGW) {
		red5BBBInGW = inGW;
	}

	@Override
	public boolean appConnect(IConnection conn, Object[] params) {
		return true;
	}

	@Override
	public void appDisconnect(IConnection conn) {
	}

	@Override
	public boolean appJoin(IClient client, IScope scope) {
		return true;
	}

	@Override
	public void appLeave(IClient client, IScope scope) {
	}

	@Override
	public boolean appStart(IScope scope) {
		return true;
	}

	@Override
	public void appStop(IScope scope) {
	}
	
	@Override
	public boolean roomConnect(IConnection connection, Object[] params) {
    	return true;
	}

	@Override
	public void roomDisconnect(IConnection connection) {
		
	}

	@Override
	public boolean roomJoin(IClient client, IScope scope) {
		return true;
	}

	@Override
	public void roomLeave(IClient client, IScope scope) {
	}

	@Override
	public boolean roomStart(IScope scope) {
		return true;
	}

	@Override
	public void roomStop(IScope scope) {
	}

	public void requestAnnotationHistory(String meetingID, String requesterID, String whiteboardId) {
	// Just hardcode as we don't really need it for flash client. (ralam may 7, 2014)
		String replyTo = meetingID + "/" + requesterID; 
		red5BBBInGW.requestWhiteboardAnnotationHistory(meetingID, requesterID, whiteboardId, replyTo);
	}

	public void sendWhiteboardAnnotation(String meetingID, String requesterID, java.util.Map<String, Object> shape) {
		red5BBBInGW.sendWhiteboardAnnotation(meetingID, requesterID, shape);
	}

	public void clearWhiteboard(String meetingID, String requesterID, String whiteboardId) {
		red5BBBInGW.clearWhiteboard(meetingID, requesterID, whiteboardId);
	}

	public void undoWhiteboard(String meetingID, String requesterID, String whiteboardId) {
		red5BBBInGW.undoWhiteboard(meetingID, requesterID, whiteboardId);
	}

	public void setWhiteboardEnable(String meetingID, String requesterID, Boolean enable) {
		red5BBBInGW.enableWhiteboard(meetingID, requesterID, enable);
	}

	public void setIsWhiteboardEnabled(String meetingID, String requesterID) {
		// Just hardcode as we don't really need it for flash client. (ralam may 7, 2014)
		String replyTo = meetingID + "/" + requesterID; 
		red5BBBInGW.isWhiteboardEnabled(meetingID, requesterID, replyTo);
	}

}
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
package org.bigbluebutton.conference.service.whiteboard;

import java.util.List;
import org.bigbluebutton.conference.BigBlueButtonSession;
import org.bigbluebutton.conference.Constants;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.adapter.ApplicationAdapter;
import org.red5.server.adapter.IApplication;
import org.red5.server.api.IClient;
import org.red5.server.api.IConnection;
import org.red5.server.api.Red5;
import org.red5.server.api.scope.IScope;
import org.slf4j.Logger;
import org.bigbluebutton.conference.service.whiteboard.red5.ClientMessageSender;
import org.bigbluebutton.conference.service.whiteboard.shapes.Annotation;
import org.bigbluebutton.core.api.IBigBlueButtonInGW;

import java.util.concurrent.ConcurrentHashMap;

public class WhiteboardApplication extends ApplicationAdapter implements IApplication {	
	private static Logger log = Red5LoggerFactory.getLogger(WhiteboardApplication.class, "bigbluebutton");

	private IBigBlueButtonInGW bbbInGW;
	
	public void setBigBlueButtonInGW(IBigBlueButtonInGW inGW) {
		bbbInGW = inGW;
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
	
	public void requestAnnotationHistory(String meetingID, String requesterID, String presentationID, Integer pageNum) {
		bbbInGW.requestWhiteboardAnnotationHistory(meetingID, requesterID, presentationID, pageNum);
	}
	
	public void sendWhiteboardAnnotation(String meetingID, String requesterID, java.util.Map<String, Object> shape) {
		bbbInGW.sendWhiteboardAnnotation(meetingID, requesterID, shape);
	}
	
	public void changeWhiteboardPage(String meetingID, String requesterID, Integer page) {
		bbbInGW.setWhiteboardActivePage(meetingID, requesterID, page);
	}
	
	public void clearWhiteboard(String meetingID, String requesterID) {
		bbbInGW.clearWhiteboard(meetingID, requesterID);
	}
	
	public void undoWhiteboard(String meetingID, String requesterID) {
		bbbInGW.undoWhiteboard(meetingID, requesterID);
	}
	
	public void setWhiteboardActivePresentation(String meetingID, String requesterID, String presentationID, Integer numPages) {
		bbbInGW.setActivePresentation(meetingID, requesterID, presentationID, numPages);
	}
	
	public void setWhiteboardEnable(String meetingID, String requesterID, Boolean enable) {
		bbbInGW.enableWhiteboard(meetingID, requesterID, enable);
	}
	
	public void setIsWhiteboardEnabled(String meetingID, String requesterID) {
		bbbInGW.isWhiteboardEnabled(meetingID, requesterID);
	}
	
}

/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Affero General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * $Id: $
 */
package org.bigbluebutton.deskshare.socket;

import org.apache.mina.core.service.IoHandlerAdapter;
import org.apache.mina.core.session.IdleStatus;
import org.apache.mina.core.session.IoSession;
import org.bigbluebutton.deskshare.CaptureEndEvent;
import org.bigbluebutton.deskshare.CaptureMessage;
import org.bigbluebutton.deskshare.CaptureUpdateEvent;
import org.bigbluebutton.deskshare.CaptureStartEvent;
import org.bigbluebutton.deskshare.ICaptureEvent;
import org.bigbluebutton.deskshare.StreamerGateway;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class ScreenCaptureMessageHandler extends IoHandlerAdapter {
	final private Logger log = Red5LoggerFactory.getLogger(ScreenCaptureMessageHandler.class, "deskshare");
	
	private StreamerGateway streamerGateway;
	
    @Override
    public void exceptionCaught( IoSession session, Throwable cause ) throws Exception
    {
        log.warn(cause.toString() + " \n " + cause.getMessage());
        cause.printStackTrace();
    }

    @Override
    public void messageReceived( IoSession session, Object message ) throws Exception
    {
    	CaptureMessage msgType = ((ICaptureEvent) message).getMessageType();
    	
    	if (msgType == CaptureMessage.CAPTURE_START) {
    		log.debug("Received CAPTURE_START");
    		sendCaptureStartEvent((CaptureStartEvent) message);
    	} else if (msgType == CaptureMessage.CAPTURE_UPDATE) {
 //   		log.debug("Received CAPTURE_UPDATE");
    		sendCaptureUpdateEvent((CaptureUpdateEvent) message);
    	}       
    }

    @Override
    public void sessionIdle( IoSession session, IdleStatus status ) throws Exception
    {
    	log.debug( "IDLE " + session.getIdleCount( status ));
    }
    
    @Override
    public void sessionCreated(IoSession session) throws Exception {
    	log.debug("Session Created");
    }
    
    @Override
    public void sessionOpened(IoSession session) throws Exception {
    	log.debug("Session Opened.");
    }
    
    @Override
    public void sessionClosed(IoSession session) throws Exception {
    	log.debug("Session Closed.");
    	String room = (String) session.getAttribute("ROOM");
    	sendCaptureEndEvent(room);
    }
    
    private void sendCaptureEndEvent(String room) {
    	streamerGateway.onCaptureEndEvent(new CaptureEndEvent(room));
    }
    
    private void sendCaptureUpdateEvent(CaptureUpdateEvent event) {
    	streamerGateway.onCaptureEvent(event);
    }
    
    private void sendCaptureStartEvent(CaptureStartEvent event) {
    	streamerGateway.onCaptureStartEvent(event);
    }
    
    public void setStreamerGateway(StreamerGateway sg) {
    	streamerGateway = sg;
    }
}

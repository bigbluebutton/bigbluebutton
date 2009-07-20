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
package org.bigbluebutton.deskshare.socket;

import org.apache.mina.core.service.IoHandlerAdapter;
import org.apache.mina.core.session.IdleStatus;
import org.apache.mina.core.session.IoSession;
import org.bigbluebutton.deskshare.CaptureEndEvent;
import org.bigbluebutton.deskshare.CaptureEvent;
import org.bigbluebutton.deskshare.CaptureStartEvent;
import org.bigbluebutton.deskshare.CapturedScreen;
import org.bigbluebutton.deskshare.StreamerGateway;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class ScreenCaptureMessageHandler extends IoHandlerAdapter {
	final private Logger log = Red5LoggerFactory.getLogger(ScreenCaptureMessageHandler.class, "deskshare");
	
	private StreamerGateway streamerGateway;
	
    @Override
    public void exceptionCaught( IoSession session, Throwable cause ) throws Exception
    {
        log.warn(cause.toString());
        cause.printStackTrace();
    }

    @Override
    public void messageReceived( IoSession session, Object message ) throws Exception
    {
    	CapturedScreen cs = (CapturedScreen) message;
        String room = cs.getRoom();
        log.debug("Got room {}", room);
        
        if (session.containsAttribute("room")) {
        	sendCaptureEvent(cs);
        } else {
        	session.setAttribute("room", room);
        	sendCaptureStartEvent(cs);
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
    	String room = (String) session.getAttribute("room");
    	sendCaptureEndEvent(room);
    }
    
    private void sendCaptureEndEvent(String room) {
    	streamerGateway.onCaptureEndEvent(new CaptureEndEvent(room));
    }
    
    private void sendCaptureEvent(CapturedScreen cs) {
    	streamerGateway.onCaptureEvent(new CaptureEvent(cs));
    }
    
    private void sendCaptureStartEvent(CapturedScreen cs) {
    	
    	streamerGateway.onCaptureStartEvent(new CaptureStartEvent(cs));
    }
    
    public void setStreamerGateway(StreamerGateway sg) {
    	streamerGateway = sg;
    }
}

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
package org.bigbluebutton.app.screenshare.server.socket;

import org.apache.mina.core.future.CloseFuture;
import org.bigbluebutton.app.screenshare.IScreenShareApplication;
import org.bigbluebutton.app.screenshare.SharingStatus;
import org.bigbluebutton.app.screenshare.server.messages.CaptureEndMessage;
import org.bigbluebutton.app.screenshare.server.messages.CaptureStartMessage;
import org.bigbluebutton.app.screenshare.server.messages.CaptureUpdateMessage;
import org.bigbluebutton.app.screenshare.server.messages.MouseLocationMessage;
import org.apache.mina.core.service.IoHandlerAdapter;
import org.apache.mina.core.session.IdleStatus;
import org.apache.mina.core.session.IoSession;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class BlockStreamEventMessageHandler extends IoHandlerAdapter {
	final private Logger log = Red5LoggerFactory.getLogger(BlockStreamEventMessageHandler.class, "screenshare");
	
	private IScreenShareApplication app;
	private static final String ROOM = "ROOM";
	
    @Override
    public void exceptionCaught( IoSession session, Throwable cause ) throws Exception {
        log.warn(cause.toString() + " \n " + cause.getMessage());
        cause.printStackTrace();
        closeSession(session);
    }
    
    private void closeSession(IoSession session) {
			String room = (String)session.getAttribute(ROOM, null);
			if (room != null) {
				log.info("Closing session [" + room + "]. ");
			} else {
				log.info("Cannot determine session to close.");
			}
    	CloseFuture future = session.close(true);   	    	
    }    

    @Override
    public void messageReceived( IoSession session, Object message ) throws Exception
    {
    	if (message instanceof CaptureStartMessage) {
    		System.out.println("Got CaptureStartBlockEvent");
    		CaptureStartMessage event = (CaptureStartMessage) message;
//    		sessionManager.createSession(event.getRoom());
    	} else if (message instanceof CaptureUpdateMessage) {
//    		System.out.println("Got CaptureUpdateBlockEvent");
    		CaptureUpdateMessage event = (CaptureUpdateMessage) message;
//    		sessionManager.updateBlock(event.getRoom(), event.getSequenceNum());
			SharingStatus sharingStatus = app.getSharingStatus(event.getRoom(), event.getRoom()) ;
    		if (sharingStatus.equals("STOP")) {
    			// The flash client told us to stop sharing. Force stopping by closing connection from applet.
    			// We're changing how to tell the applet to stop sharing as AS ExternalInterface to JS to Applet calls
    			// generates a popup dialog that users may or may not see causing the browser to hang. (ralam aug 24, 2014)
    			log.info("Sharing has stopped for meeting [" + event.getRoom() + "]. Closing connection.");
    			session.close(true);
    		}
    	} else if (message instanceof CaptureEndMessage) {
    		CaptureEndMessage event = (CaptureEndMessage) message;
//    		sessionManager.removeSession(event.getRoom(), event.getSequenceNum());
    	} else if (message instanceof MouseLocationMessage) {
    		MouseLocationMessage event = (MouseLocationMessage) message;
//    		sessionManager.updateMouseLocation(event.getRoom(), event.getLoc(), event.getSequenceNum());
    	}
    }

    @Override
    public void sessionIdle( IoSession session, IdleStatus status ) throws Exception
    {
    	log.debug( "IDLE " + session.getIdleCount( status ));
    	super.sessionIdle(session, status);
    }
    
    @Override
    public void sessionCreated(IoSession session) throws Exception {
    	log.debug("Session Created");
    	super.sessionCreated(session);
    }
    
    @Override
    public void sessionOpened(IoSession session) throws Exception {
    	log.debug("Session Opened.");
    	super.sessionOpened(session);
    }
    
    @Override
    public void sessionClosed(IoSession session) throws Exception {
    	log.debug("Session Closed.");
    	
    	String room = (String) session.getAttribute("ROOM");
    	if (room != null) {
    		log.debug("Session Closed for room " + room);
    		app.sharingStopped(room, room);
    	} else {
    		log.warn("Closing session for a NULL room");
    	}
    }
    
    public void setApplication(IScreenShareApplication app) {
      this.app = app;
    }
}

/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2008 by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* This program is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with this program; if not, write to the Free Software Foundation, Inc.,
* 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
* 
*/
package org.bigbluebuttonproject.asterisk.meetme;


import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.asteriskjava.live.ManagerCommunicationException;
import org.asteriskjava.live.MeetMeUser;

import org.bigbluebuttonproject.asterisk.AsteriskVoiceService;

import org.red5.server.api.IClient;
import org.red5.server.api.IConnection;
import org.red5.server.api.Red5;
import org.red5.server.adapter.ApplicationAdapter;
import org.red5.server.api.IScope;
import org.red5.server.api.service.IPendingServiceCall;
import org.red5.server.api.service.IPendingServiceCallback;
import org.red5.server.api.service.IServiceCapableConnection;
import org.red5.server.api.so.ISharedObject;


/**
 * The Class Application.
 */
public class Application extends ApplicationAdapter implements
		IPendingServiceCallback	{
	
	/** The log. */
	protected static Logger log = LoggerFactory.getLogger( Application.class );

	/** The app scope. */
	private static IScope appScope;

	/** The voice service. */
	private AsteriskVoiceService voiceService;
	
	/** The room listener. */
	private ConferenceRoomListener roomListener;
	private boolean listenerStarted = false;
	
    /**
     * @see org.red5.server.adapter.MultiThreadedApplicationAdapter#appStart(org.red5.server.api.IScope)
     */
    @Override
    public boolean appStart(IScope app )
    {
    	super.appStart(app);
    	
        log.info( "MeetMe::appStart - " );
        appScope = app;
    	//initialize();
        return true;
    }
    
    /**
     * Initialize.
     */
    private void initialize() 
    {	
    	try {
    		if (! listenerStarted) {
    			voiceService.addAsteriskServerListener(roomListener);
    			listenerStarted = true;
    		}
		} catch (ManagerCommunicationException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} 
    }

    /**
     * App stop.
     */
    public void appStop ( )
    {
        log.info( "Asterisk Meetme Stopping" );
    }

    /**
     * @see org.red5.server.adapter.MultiThreadedApplicationAdapter#appConnect(org.red5.server.api.IConnection, java.lang.Object[])
     */
    public boolean appConnect( IConnection conn , Object[] params )
    {
    	super.appConnect(conn, params);
    	
        log.info( "MeetMe::appConnect - " + conn.getClient().getId() );
        return true;
    }

    /**
     * @see org.red5.server.adapter.MultiThreadedApplicationAdapter#appDisconnect(org.red5.server.api.IConnection)
     */
    public void appDisconnect( IConnection conn)
    {
        log.info( "MeetMe::appDisconnect - " + conn.getClient().getId() );
    }
    
    /**
     * @see org.red5.server.adapter.MultiThreadedApplicationAdapter#roomStart(org.red5.server.api.IScope)
     */
    public boolean roomStart(IScope room) {
    	log.info( "MeetMe::roomStart - " + room.getName() );

    	if (!super.roomStart(room))
    		return false;
    	
    	initialize();
    	
    	if (!hasSharedObject(room, "meetMeUsersSO")) {
    		createSharedObject(room, "meetMeUsersSO", false);
    		ISharedObject so = getSharedObject(room, "meetMeUsersSO", false);
    		roomListener.addRoom(room.getName(), so);
    	} else {        	
        	ISharedObject so = getSharedObject(room, "meetMeUsersSO", false);        	   		
    	}
    	
    	roomListener.initializeConferenceUsers(room.getName());
    	return true;
    }
    
    /**
     * @see org.red5.server.adapter.MultiThreadedApplicationAdapter#roomConnect(org.red5.server.api.IConnection, java.lang.Object[])
     */
    public boolean roomConnect(IConnection conn, Object[] params) {
    	super.roomConnect(conn, params);
    	
    	log.info( "MeetMe::roomConnect " + conn.getClient().getId() );
    	
    	if (!hasSharedObject(conn.getScope(), "meetMeUsersSO")) {
    		createSharedObject(conn.getScope(), "meetMeUsersSO", false);
    		ISharedObject so = getSharedObject(conn.getScope(), "meetMeUsersSO", false);
    		roomListener.addRoom(conn.getScope().getName(), so);
    	} else {        	
        	ISharedObject so = getSharedObject(conn.getScope(), "meetMeUsersSO", false);        	   		
    	}

    	return true;
    }

    
    /**
     * @see org.red5.server.adapter.MultiThreadedApplicationAdapter#roomLeave(org.red5.server.api.IClient, org.red5.server.api.IScope)
     */
    public void roomLeave(IClient client, IScope room) {
    	super.roomLeave(client, room);
    	
    	log.info("MeetMe::roomLeave - " + client.getId());
    }
    
    /**
     * @see org.red5.server.adapter.MultiThreadedApplicationAdapter#roomJoin(org.red5.server.api.IClient, org.red5.server.api.IScope)
     */
    public boolean roomJoin(IClient client, IScope room) {
    	super.roomJoin(client, room);    	
    	log.info("MeetMe::roomJoin - " + client.getId());
    	return true;
    }
    
    /**
     * Adds the.
     * 
     * @param a the a
     * @param b the b
     * 
     * @return the double
     */
    public double add(double a, double b){
        return a + b;
    }

	/**
	 * Sets the voice service.
	 * 
	 * @param voiceService the new voice service
	 */
	public void setVoiceService(AsteriskVoiceService voiceService) {
		log.debug("Setting voice Services...");
		this.voiceService = voiceService;
	}

	/**
	 * Sets the room listener.
	 * 
	 * @param roomListener the new room listener
	 */
	public void setRoomListener(ConferenceRoomListener roomListener) {
		this.roomListener = roomListener;	
	}

	/**
	 * @see org.red5.server.api.service.IPendingServiceCallback#resultReceived(org.red5.server.api.service.IPendingServiceCall)
	 */
	public void resultReceived(IPendingServiceCall call) {
		log.info("Received result " + call.getResult() + " for "
				+ call.getServiceMethodName());
	}
   
}

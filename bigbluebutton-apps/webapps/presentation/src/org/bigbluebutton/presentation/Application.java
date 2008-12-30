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

package org.bigbluebutton.presentation;
import java.util.ArrayList;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
 * This is the base class of presentation server application. It overwrites the methods of ApplicationAdapter class.
 * [See ApplicationAdapter description in Conference Application section.]
 * Plays a role in presentation, updating the presenter client about upload progress and notifying about the error messages.
 */
public class Application extends ApplicationAdapter implements
		IPendingServiceCallback	{
	
	/** The log. */
	protected static Logger log = LoggerFactory.getLogger( Application.class );

	/** The app scope. */
	private static IScope appScope;

	/** The updates listener. */
	private ConversionUpdatesListener updatesListener;
	
    /**
     * @see org.red5.server.adapter.MultiThreadedApplicationAdapter#appStart(org.red5.server.api.IScope)
     */
    @Override
    public boolean appStart (IScope app )
    {
    	super.appStart(app);
    	
        log.info( "Presentation::appStart - " );
        appScope = app;
    
        return true;
    }
    
     /**
     * App stop.
     */
    public void appStop ( )
    {
        log.info( "Presentation::Stopping" );
    }

    /**
     * @see org.red5.server.adapter.MultiThreadedApplicationAdapter#appConnect(org.red5.server.api.IConnection, java.lang.Object[])
     */
    public boolean appConnect( IConnection conn , Object[] params )
    {
    	super.appConnect(conn, params);
    	
        log.info( "Presentation::appConnect - " + conn.getClient().getId() );

//        initialize();       
        
//        boolean accept = ((Boolean)params[0]).booleanValue();

//        if ( !accept ) rejectClient( "you passed false..." );

        return true;
    }

    /**
     * @see org.red5.server.adapter.MultiThreadedApplicationAdapter#appDisconnect(org.red5.server.api.IConnection)
     */
    public void appDisconnect( IConnection conn)
    {
        log.info( "Presentation::appDisconnect - " + conn.getClient().getId() );
    }
    
    /**
     * @see org.red5.server.adapter.MultiThreadedApplicationAdapter#roomStart(org.red5.server.api.IScope)
     */
    public boolean roomStart(IScope room) {
    	log.info( "Presentation::roomStart - " + room.getName() );
    	if (!super.roomStart(room))
    		return false;

    //	initialize();
    	return true;
    }
    
    /**
     * This method is called every time new client connects to the room scope. NetConnection.connect() call from client side, call this function in server side.
     * It also takes parameters from the client. This method is a powerful handler method which allows developers to add tasks here that are needed to be executed every time a new client connects to the scope.
     * Makes sure that sharedobject is available for clients. 
     * Also adds the sharedobject to the updatesListener to allow it to communicate with the clients connected to the sharedobject.
     * @see org.red5.server.adapter.MultiThreadedApplicationAdapter#roomConnect(org.red5.server.api.IConnection, java.lang.Object[])
     */
    public boolean roomConnect(IConnection conn, Object[] params) {
    	super.roomConnect(conn, params);
    	
    	log.info( "Presentation::roomConnect " + conn.getClient().getId() );
    	if (!hasSharedObject(conn.getScope(), "presentationSO")) {
    		createSharedObject(conn.getScope(), "presentationSO", false);
    		ISharedObject so = getSharedObject(conn.getScope(), "presentationSO", false);
    		updatesListener.addRoom(new Integer(conn.getScope().getName()), so);
    	} else {        	
        	ISharedObject so = getSharedObject(conn.getScope(), "presentationSO", false);        	   		
    	}

    	return true;
    }
    
    /**
     * Called when a client leaves the room scope.
     * @see org.red5.server.adapter.MultiThreadedApplicationAdapter#roomLeave(org.red5.server.api.IClient, org.red5.server.api.IScope)
     */
    public void roomLeave(IClient client, IScope room) {
    	super.roomLeave(client, room);
    	
    	log.info("Presentation::roomLeave - " + client.getId());
    }
    
    /**
     * Called when a client joins the room scope.
     * @see org.red5.server.adapter.MultiThreadedApplicationAdapter#roomJoin(org.red5.server.api.IClient, org.red5.server.api.IScope)
     */
    public boolean roomJoin(IClient client, IScope room) {
    	super.roomJoin(client, room);    	
    	log.info("Presentation::roomJoin - " + client.getId());
	
    	return true;
    }
    
	/**
	 * 
	 * @see org.red5.server.api.service.IPendingServiceCallback#resultReceived(org.red5.server.api.service.IPendingServiceCall)
	 */
	public void resultReceived(IPendingServiceCall call) {
		log.info("Received result " + call.getResult() + " for "
				+ call.getServiceMethodName());
	}

	/**
	 * Sets the updates listener.
	 * 
	 * @param updatesListener the new updates listener
	 */
	public void setUpdatesListener(ConversionUpdatesListener updatesListener) {
		this.updatesListener = updatesListener;
	}
   
}

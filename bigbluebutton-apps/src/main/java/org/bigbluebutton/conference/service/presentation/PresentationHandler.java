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

package org.bigbluebutton.conference.service.presentation;

import org.red5.server.adapter.IApplication;
import org.red5.server.api.IClient;
import org.red5.server.api.IConnection;
import org.red5.server.api.IScope;
import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;

import org.red5.server.api.so.ISharedObject;
import org.red5.server.adapter.ApplicationAdapter;
import org.red5.server.api.Red5;import org.bigbluebutton.conference.BigBlueButtonSession;import org.bigbluebutton.conference.Constants;import org.bigbluebutton.conference.service.recorder.RecorderApplication;

public class PresentationHandler extends ApplicationAdapter implements IApplication{
	private static Logger log = Red5LoggerFactory.getLogger( PresentationHandler.class, "bigbluebutton" );

	private static final String PRESENTATION = "PRESENTATION";
	private static final String PRESENTATION_SO = "presentationSO";   
	private static final String APP = "PRESENTATION";

	private RecorderApplication recorderApplication;
	private PresentationApplication presentationApplication;
	private ConversionUpdatesMessageListener conversionUpdatesMessageListener;
	
	@Override
	public boolean appConnect(IConnection conn, Object[] params) {
		log.debug("${APP}:appConnect");
		return true;
	}

	@Override
	public void appDisconnect(IConnection conn) {
		log.debug( "${APP}:appDisconnect");
	}

	@Override
	public boolean appJoin(IClient client, IScope scope) {
		log.debug( "${APP}:appJoin ${scope.name}");
		return true;
	}

	@Override
	public void appLeave(IClient client, IScope scope) {
		log.debug("${APP}:appLeave ${scope.name}");

	}

	@Override
	public boolean appStart(IScope scope) {
		log.debug("${APP}:appStart ${scope.name}");
		conversionUpdatesMessageListener.start();
		return true;
	}

	@Override
	public void appStop(IScope scope) {
		log.debug("${APP}:appStop ${scope.name}");
		conversionUpdatesMessageListener.stop();
	}

	@Override
	public boolean roomConnect(IConnection connection, Object[] params) {
		log.debug("${APP}:roomConnect");
		
		log.debug("In live mode");
		ISharedObject so = getSharedObject(connection.getScope(), PRESENTATION_SO);
		
		log.debug("Setting up recorder");
		PresentationEventRecorder recorder = new PresentationEventRecorder(so, getBbbSession().getRecord());
		log.debug("adding event recorder to ${connection.scope.name}");
		recorderApplication.addEventRecorder(connection.getScope().getName(), recorder);				
		
		log.debug("Adding room listener");
		presentationApplication.addRoomListener(connection.getScope().getName(), recorder);
		log.debug("Done setting up recorder and listener");
		return true;
	}

	@Override
	public void roomDisconnect(IConnection connection) {
		log.debug("${APP}:roomDisconnect");

	}

	@Override
	public boolean roomJoin(IClient client, IScope scope) {
		log.debug("${APP}:roomJoin ${scope.name} - ${scope.parent.name}");
		return true;
	}

	@Override
	public void roomLeave(IClient client, IScope scope) {
		log.debug("${APP}:roomLeave ${scope.name}");
	}

	@Override
	public boolean roomStart(IScope scope) {
		log.debug("${APP} - roomStart ${scope.name}");
		presentationApplication.createRoom(scope.getName());
    	if (!hasSharedObject(scope, PRESENTATION_SO)) {
    		if (createSharedObject(scope, PRESENTATION_SO, false)) {    			
    			return true; 			
    		}    		
    	}  	
		log.error("Failed to start room ${scope.name}");
    	return false;
	}

	@Override
	public void roomStop(IScope scope) {
		log.debug("${APP}:roomStop ${scope.name}");
		presentationApplication.destroyRoom(scope.getName());
		if (!hasSharedObject(scope, PRESENTATION_SO)) {
    		clearSharedObjects(scope, PRESENTATION_SO);
    	}
	}
	
	public void setPresentationApplication(PresentationApplication a) {
		log.debug("Setting presentation application");
		presentationApplication = a;
	}
	
	public void setRecorderApplication(RecorderApplication a) {
		log.debug("Setting archive application");
		recorderApplication = a;
	}
	
	public void setConversionUpdatesMessageListener(ConversionUpdatesMessageListener service) {
		log.debug("Setting conversionUpdatesMessageListener");
		conversionUpdatesMessageListener = service;
	}
	
	private BigBlueButtonSession getBbbSession() {
		return (BigBlueButtonSession) Red5.getConnectionLocal().getAttribute(Constants.SESSION);
	}
}

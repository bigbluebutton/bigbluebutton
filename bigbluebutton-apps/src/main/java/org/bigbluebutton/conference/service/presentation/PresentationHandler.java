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

package org.bigbluebutton.conference.service.presentation;

import java.io.File;
import java.io.FileFilter;

import org.red5.server.adapter.IApplication;
import org.red5.server.api.IClient;
import org.red5.server.api.IConnection;
import org.red5.server.api.IScope;
import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;

import org.red5.server.api.so.ISharedObject;
import org.red5.server.adapter.ApplicationAdapter;
import org.red5.server.api.Red5;
import org.bigbluebutton.conference.BigBlueButtonSession;
import org.bigbluebutton.conference.Constants;
import org.bigbluebutton.conference.service.recorder.RecorderApplication;
import org.bigbluebutton.conference.service.recorder.presentation.PresentationEventRecorder;

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
		log.debug(APP + ":appConnect");
		return true;
	}

	@Override
	public void appDisconnect(IConnection conn) {
		log.debug(APP + ":appDisconnect");
	}

	@Override
	public boolean appJoin(IClient client, IScope scope) {
		log.debug(APP + ":appJoin " + scope.getName());
		return true;
	}

	@Override
	public void appLeave(IClient client, IScope scope) {
		log.debug(APP + ":appLeave " + scope.getName());
	}

	@Override
	public boolean appStart(IScope scope) {
		log.debug(APP + ":appStart " + scope.getName());
		conversionUpdatesMessageListener.start();
		return true;
	}

	@Override
	public void appStop(IScope scope) {
		log.debug(APP + ":appStop " + scope.getName());
		conversionUpdatesMessageListener.stop();
	}

	@Override
	public boolean roomConnect(IConnection connection, Object[] params) {
		log.debug(APP + ":roomConnect");
		
		log.debug("In live mode");
		ISharedObject so = getSharedObject(connection.getScope(), PRESENTATION_SO);
		
		log.debug("Setting up recorder");
		PresentationEventSender sender = new PresentationEventSender(so);
		PresentationEventRecorder recorder = new PresentationEventRecorder(connection.getScope().getName(), recorderApplication);
						
		log.debug("Adding room listener");
		presentationApplication.addRoomListener(connection.getScope().getName(), recorder);
		presentationApplication.addRoomListener(connection.getScope().getName(), sender);
		log.debug("Done setting up recorder and listener");
		return true;
	}

	@Override
	public void roomDisconnect(IConnection connection) {
		log.debug(APP + ":roomDisconnect");

	}

	@Override
	public boolean roomJoin(IClient client, IScope scope) {
		log.debug(APP + ":roomJoin " + scope.getName() + " - " + scope.getParent().getName());
		return true;
	}

	@Override
	public void roomLeave(IClient client, IScope scope) {
		log.debug(APP + ":roomLeave " + scope.getName());
	}

	@Override
	public boolean roomStart(IScope scope) {
		log.debug(APP + " - roomStart "+ scope.getName());
		presentationApplication.createRoom(scope.getName());
    	if (!hasSharedObject(scope, PRESENTATION_SO)) {
    		if (createSharedObject(scope, PRESENTATION_SO, false)) {    			
				log.debug(APP + " - scanning for presentations - " + scope.getName());
				try {
					// TODO: this is hard-coded, and not really a great abstraction.  need to fix this up later
					String folderPath = "/var/bigbluebutton/" + scope.getName() + "/" + scope.getName();
					File folder = new File(folderPath);
					//log.debug("folder: {} - exists: {} - isDir: {}", folder.getAbsolutePath(), folder.exists(), folder.isDirectory());
					if (folder.exists() && folder.isDirectory()) {
						File[] presentations = folder.listFiles(new FileFilter() {
							public boolean accept(File path) {
								log.debug("\tfound: " + path.getAbsolutePath());
								return path.isDirectory();
							}
						});
						for (File presFile : presentations) {
							log.debug("\tshare: " + presFile.getName());
							presentationApplication.sharePresentation(scope.getName(), presFile.getName(), true);
						}
					}
				} catch (Exception ex) {
					log.error(scope.getName() + ": error scanning for existing presentations [" + ex.getMessage() + "]", ex);
				}
    			return true; 			
    		}    		
    	}  	
		log.error("Failed to start room " + scope.getName());
    	return false;
	}

	@Override
	public void roomStop(IScope scope) {
		log.debug(APP + ":roomStop " + scope.getName());
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
	
}

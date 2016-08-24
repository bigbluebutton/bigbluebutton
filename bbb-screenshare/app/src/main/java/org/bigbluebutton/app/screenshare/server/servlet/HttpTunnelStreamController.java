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
package org.bigbluebutton.app.screenshare.server.servlet;

import java.util.*;
import java.awt.Point;
import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.bigbluebutton.app.screenshare.IScreenShareApplication;
import org.bigbluebutton.app.screenshare.SharingStatus;
import org.bigbluebutton.app.screenshare.server.session.Dimension;
import org.bigbluebutton.app.screenshare.server.session.ISessionManagerGateway;
import org.bigbluebutton.app.screenshare.server.socket.BlockStreamEventMessageHandler;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;
import org.springframework.context.ApplicationContext;
import org.springframework.http.HttpStatus;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.multiaction.MultiActionController;

public class HttpTunnelStreamController extends MultiActionController {
    final private Logger log = Red5LoggerFactory.getLogger(HttpTunnelStreamController.class, "screenshare");
  
	private boolean hasSessionManager = false;
	private IScreenShareApplication screenShareApplication;
	
	public ModelAndView screenCaptureHandler(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		String event = request.getParameterValues("event")[0];	
		int captureRequest = Integer.parseInt(event);

		if (0 == captureRequest) {
			handleCaptureStartRequest(request, response);
			response.setStatus(HttpServletResponse.SC_OK);
		} else if (1 == captureRequest) {
			handleCaptureUpdateRequest(request, response);
			response.setStatus(HttpServletResponse.SC_OK);
			SharingStatus sharingStatus =  getSharingStatus(request, response);
			//log.warn("SHARING_STATUS " + sharingStatus.status);
			response.addHeader("SHARING_STATUS", sharingStatus.status);
			if (sharingStatus.status.toUpperCase().equals("START") && sharingStatus.status != null) {
				response.addHeader("SHARING_STATUS_STREAMID", sharingStatus.streamId);
			}
		} else if (2 == captureRequest) {
			handleCaptureEndRequest(request, response);
			response.setStatus(HttpServletResponse.SC_OK);
		} else {
			log.warn("Cannot handle screen capture event " + captureRequest);
			response.setStatus(HttpServletResponse.SC_OK);
		}
		return null;
	}	
		
	private SharingStatus getSharingStatus(HttpServletRequest request, HttpServletResponse response) throws Exception {
		String meetingId = request.getParameterValues("meetingId")[0];
		String streamId = request.getParameterValues("streamId")[0];
		SharingStatus sharingStatus = screenShareApplication.getSharingStatus(meetingId, streamId);
		return sharingStatus;
	}
	
	private void handleCaptureStartRequest(HttpServletRequest request, HttpServletResponse response) throws Exception {
		String meetingId = request.getParameterValues("meetingId")[0];
		String streamId = request.getParameterValues("streamId")[0];
		String screenInfo = request.getParameterValues("screenInfo")[0];
		
		String[] screen = screenInfo.split("x");
			
		if (! hasSessionManager) {
		    screenShareApplication = getScreenShareApplication();
			hasSessionManager = true;
		}
		screenShareApplication.sharingStarted(meetingId, streamId, Integer.parseInt(screen[0]), Integer.parseInt(screen[1]));
	}	
	
	private void handleCaptureUpdateRequest(HttpServletRequest request, HttpServletResponse response) throws Exception {
      String meetingId = request.getParameterValues("meetingId")[0];
      String streamId = request.getParameterValues("streamId")[0];

      //log.debug("Received stream update message for meetingId={} streamId={}", meetingId, streamId);
				
      if (! hasSessionManager) {
        screenShareApplication = getScreenShareApplication();
		hasSessionManager = true;
      }
			
      screenShareApplication.updateShareStatus(meetingId, streamId, 0);

	}
	
	private void handleCaptureEndRequest(HttpServletRequest request, HttpServletResponse response) throws Exception {	
      String meetingId = request.getParameterValues("meetingId")[0];
      String streamId = request.getParameterValues("streamId")[0];
      
		if (! hasSessionManager) {
		  screenShareApplication = getScreenShareApplication();
			hasSessionManager = true;
		}
		System.out.println("HttpTunnel: Received Capture End Event.");
		screenShareApplication.sharingStopped(meetingId, streamId);
	}
	    
	private IScreenShareApplication getScreenShareApplication() {
		//Get the servlet context
		ServletContext ctx = getServletContext();
		//Grab a reference to the application context
		ApplicationContext appCtx = (ApplicationContext) ctx.getAttribute(WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE);

		//Get the bean holding the parameter
		IScreenShareApplication manager = (IScreenShareApplication) appCtx.getBean("screenShareApplication");
		if (manager != null) {
			log.debug("Got the IScreenShareApplication context: *****");
		}
		return manager;
	}
}

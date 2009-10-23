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
 * Author: Richard Alam <ritzalam@gmail.com>
 *
 * $Id: $x
 */
package org.bigbluebutton.deskshare.server.servlet;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.InputStream;

import javax.imageio.ImageIO;
import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.mina.core.buffer.IoBuffer;
import org.bigbluebutton.deskshare.server.CaptureEndEvent;
import org.bigbluebutton.deskshare.server.CaptureEvents;
import org.bigbluebutton.deskshare.server.CaptureStartEvent;
import org.bigbluebutton.deskshare.server.CaptureUpdateEvent;
import org.bigbluebutton.deskshare.server.CapturedScreen;
import org.bigbluebutton.deskshare.server.StreamerGateway;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;
import org.springframework.context.ApplicationContext;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.multiaction.MultiActionController;

public class TunnelController extends MultiActionController {
	private static Logger log = Red5LoggerFactory.getLogger(TunnelController.class, "deskshare");
	
	private StreamerGateway streamerGateway;
	private boolean hasGateway = false;
	
	public ModelAndView screenCaptureHandler(HttpServletRequest request, HttpServletResponse response) throws Exception {		

		String event = request.getParameterValues("event")[0];
		System.out.println("Got screenCaptureStart request for event " + event);
		
		int captureRequest = Integer.valueOf(request.getParameterValues("event")[0]).intValue();

		if (CaptureEvents.CAPTURE_START.getEvent() == captureRequest) {
			handleCaptureStartRequest(request, response);
		} else if (CaptureEvents.CAPTURE_UPDATE.getEvent() == captureRequest) {
			handleCaptureUpdateRequest(request, response);
		} else if (CaptureEvents.CAPTURE_END.getEvent() == captureRequest) {
			handleCaptureEndRequest(request, response);
		} else {
			log.debug("Cannot handle screen capture event " + captureRequest);
			System.out.println("Cannot handle screen capture event " + captureRequest);
		}
		return null;
	}	
	
	private void handleCaptureStartRequest(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		String room = request.getParameterValues("room")[0];
		log.warn("Got screenCaptureStart request for room {}", room);
		
		String videoInfo = request.getParameterValues("videoInfo")[0];
		log.warn("Received image from videoInfo {}", videoInfo);
		
		String[] screenDimensions = videoInfo.split("x");
		int width = Integer.parseInt(screenDimensions[0]);
		int height = Integer.parseInt(screenDimensions[1]);
		
		if (! hasGateway) {
			streamerGateway = getStreamerGateway();
			hasGateway = true;
		}
		
		CaptureStartEvent event = new CaptureStartEvent(room, width, height);		
		streamerGateway.onCaptureStartEvent(event);		
	}	
	
	private void handleCaptureUpdateRequest(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		MultipartHttpServletRequest multipartRequest = (MultipartHttpServletRequest) request;
		// MultipartFile is a copy of file in memory, not in file system
		MultipartFile multipartFile = multipartRequest.getFile("videodata");
	
		long startRx = System.currentTimeMillis();
		
		byte[] videoData = multipartFile.getBytes();
		IoBuffer buffer = IoBuffer.allocate(videoData.length, false);
		buffer.put(videoData);
		
		/* Set the marker back to zero position so that "gets" start from the beginning.
		 * Otherwise, you get BufferUnderFlowException.
		 */		
		buffer.rewind();
		
		String room = request.getParameterValues("room")[0];
		log.debug("Received image from room {}", room);
		String keyframe = request.getParameterValues("keyframe")[0];
		log.debug("Received keyframe {}", keyframe);
		
		System.out.println("Room " + room + " keyFrame " + Boolean.parseBoolean(keyframe) 
				+ " data size " + videoData.length + " buffer size " + buffer.remaining());
		CaptureUpdateEvent cse = new CaptureUpdateEvent(room, buffer);
				
		if (! hasGateway) {
			streamerGateway = getStreamerGateway();
			hasGateway = true;
		}
			
		streamerGateway.onCaptureEvent(cse);	
		long completeRx = System.currentTimeMillis();
		System.out.println("Http receive and send took " + (completeRx - startRx) + "ms.");
	}
	
	private void handleCaptureEndRequest(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		String room = request.getParameterValues("room")[0];
		log.warn("Got screenCaptureEnd request for room {}", room);
		
		if (! hasGateway) {
			streamerGateway = getStreamerGateway();
			hasGateway = true;
		}
		
		CaptureEndEvent event = new CaptureEndEvent(room);
		
		streamerGateway.onCaptureEndEvent(event);
		
	}
	    
	private StreamerGateway getStreamerGateway() {
		//Get the servlet context
		ServletContext ctx = getServletContext();
		log.info("Got the servlet context: {}", ctx);
		
		//Grab a reference to the application context
		ApplicationContext appCtx = (ApplicationContext) ctx.getAttribute(WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE);
		log.info("Got the application context: {}", appCtx);
		
		//Get the bean holding the parameter
		StreamerGateway streamerGateway = (StreamerGateway) appCtx.getBean("streamerGateway");
		if (streamerGateway != null) {
			log.info("Got the streamerGateway context: {}", appCtx);
		}
		return streamerGateway;
	}
}

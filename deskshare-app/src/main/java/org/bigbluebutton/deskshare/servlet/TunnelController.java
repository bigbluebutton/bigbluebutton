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
package org.bigbluebutton.deskshare.servlet;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.InputStream;

import javax.imageio.ImageIO;
import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.bigbluebutton.deskshare.CaptureEndEvent;
import org.bigbluebutton.deskshare.CaptureUpdateEvent;
import org.bigbluebutton.deskshare.CaptureStartEvent;
import org.bigbluebutton.deskshare.CapturedScreen;
import org.bigbluebutton.deskshare.StreamerGateway;
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
		log.warn("Got here");
		MultipartHttpServletRequest multipartRequest = (MultipartHttpServletRequest) request;
		// MultipartFile is a copy of file in memory, not in file system
		MultipartFile multipartFile = multipartRequest.getFile("upload");
	
		byte[] file = multipartFile.getBytes();
		
		InputStream imageData = new ByteArrayInputStream(file);
		//re-Create a BufferedImage we received over the network 
		BufferedImage image = ImageIO.read(imageData);
		log.warn("Received image size {}", file.length);
		String room = request.getParameterValues("room")[0];
		log.warn("Received image from room {}", room);
		String videoInfo = request.getParameterValues("videoInfo")[0];
		log.warn("Received image from videoInfo {}", videoInfo);
		
		String[] screenDimensions = videoInfo.split("x");
		int width = Integer.parseInt(screenDimensions[0]);
		int height = Integer.parseInt(screenDimensions[1]);
		int frameRate = Integer.parseInt(screenDimensions[2]);
		
		Boolean startCapture = Boolean.valueOf(request.getParameter("startCapture"));
		log.warn("Received startCapture {}", startCapture);
		
		if (! hasGateway) {
			streamerGateway = getStreamerGateway();
			hasGateway = true;
		}
		
		CapturedScreen cs = new CapturedScreen(image, room, width, height, frameRate);
		
		if (startCapture) {
			sendCaptureStartEvent(cs);
		} else {
			sendCaptureEvent(cs);
		}
		return null;
	}	
	
	
	private void sendCaptureEndEvent(String room) {
    	streamerGateway.onCaptureEndEvent(new CaptureEndEvent(room));
    }
    
    private void sendCaptureEvent(CapturedScreen cs) {
    	streamerGateway.onCaptureEvent(new CaptureUpdateEvent(cs));
    }
    
    private void sendCaptureStartEvent(CapturedScreen cs) {
    	
    	streamerGateway.onCaptureStartEvent(new CaptureStartEvent(cs));
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

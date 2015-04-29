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
package org.bigbluebutton.deskshare.server.servlet;

import java.util.*;

import java.awt.Point;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.bigbluebutton.deskshare.common.Dimension;
import org.bigbluebutton.deskshare.server.session.ISessionManagerGateway;
import org.springframework.context.ApplicationContext;
import org.springframework.http.HttpStatus;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.multiaction.MultiActionController;

public class HttpTunnelStreamController extends MultiActionController {

	private boolean hasSessionManager = false;
	private ISessionManagerGateway sessionManager;
	
	public ModelAndView screenCaptureHandler(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		String event = request.getParameterValues("event")[0];	
		int captureRequest = Integer.parseInt(event);

		if (0 == captureRequest) {
			handleCaptureStartRequest(request, response);
		} else if (1 == captureRequest) {
			handleCaptureUpdateRequest(request, response);
			if (isSharingStopped(request, response)) {
				response.setStatus(HttpServletResponse.SC_NOT_FOUND);
			}			
		} else if (2 == captureRequest) {
			handleCaptureEndRequest(request, response);
		} else if (3 == captureRequest) {
			handleUpdateMouseLocationRequest(request, response);
		} else {		
			System.out.println("****Cannot handle screen capture event " + captureRequest);
		}
		return null;
	}	
	
	private void handleUpdateMouseLocationRequest(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		String room = request.getParameterValues("room")[0];
		String mouseX = request.getParameterValues("mousex")[0];
		String mouseY = request.getParameterValues("mousey")[0];		
		String seqNum = request.getParameterValues("sequenceNumber")[0];
		Point loc = new Point(Integer.parseInt(mouseX), Integer.parseInt(mouseY));

		if (! hasSessionManager) {
			sessionManager = getSessionManager();
			hasSessionManager = true;
		}
		sessionManager.updateMouseLocation(room, loc, Integer.parseInt(seqNum));		
	}
	
	private Boolean isSharingStopped(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		String room = request.getParameterValues("room")[0];
		return sessionManager.isSharingStopped(room);
	}
	
	private void handleCaptureStartRequest(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		String room = request.getParameterValues("room")[0];
		String seqNum = request.getParameterValues("sequenceNumber")[0];
		String screenInfo = request.getParameterValues("screenInfo")[0];
		String blockInfo = request.getParameterValues("blockInfo")[0];
		String svc2Info = request.getParameterValues("svc2")[0];
		
		String[] screen = screenInfo.split("x");
		String[] block = blockInfo.split("x");
		
		Dimension screenDim, blockDim;
		screenDim = new Dimension(Integer.parseInt(screen[0]), Integer.parseInt(screen[1]));
		blockDim = new Dimension(Integer.parseInt(block[0]), Integer.parseInt(block[1]));
		
		boolean useSVC2 = Boolean.parseBoolean(svc2Info);
		
		if (! hasSessionManager) {
			sessionManager = getSessionManager();
			hasSessionManager = true;
		}
		sessionManager.createSession(room, screenDim, blockDim, Integer.parseInt(seqNum), useSVC2);		
	}	
	
	private void handleCaptureUpdateRequest(HttpServletRequest request, HttpServletResponse response) throws Exception {

		MultipartHttpServletRequest multipartRequest = (MultipartHttpServletRequest) request;


      String room = request.getParameterValues("room")[0];
      String keyframe = "false";  // This data is never a keyframe

      //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
      // Get the list of multipart files that are in this POST request.
      // Get the block info from each embedded file and send it to the
      // session manager to update the viewers.
      //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
      Iterator uploadedFilenames = multipartRequest.getFileNames();
      while(uploadedFilenames.hasNext())
      { // process each embedded upload-file (block)

         String uploadedFilename = (String)uploadedFilenames.next();
         MultipartFile multipartFile = multipartRequest.getFile(uploadedFilename);

         // Parse the block info out of the upload file name
         // The file name is of format "blockgroup_<seqnum>_<position>".
         String[] uploadedFileInfo = uploadedFilename.split("[_]");
         
         String seqNum = uploadedFileInfo[1];
         String position = uploadedFileInfo[2];

         // Update the viewers with the uploaded block data.
         sessionManager.updateBlock(room,
                                    Integer.valueOf(position),
                                    multipartFile.getBytes(),
                                    false, // This data is never a keyframe
                                    Integer.parseInt(seqNum));

      } // process each embedded upload-file (block)

 /*
		// MultipartFile is a copy of file in memory, not in file system
		MultipartFile multipartFile = multipartRequest.getFile("blockdata");
	
		long startRx = System.currentTimeMillis();
		
		byte[] blockData = multipartFile.getBytes();
		String room = request.getParameterValues("room")[0];
		String seqNum = request.getParameterValues("sequenceNumber")[0];
		String keyframe = request.getParameterValues("keyframe")[0];
		String position = request.getParameterValues("position")[0];
				
		if (! hasSessionManager) {
			sessionManager = getSessionManager();
			hasSessionManager = true;
		}
			
		sessionManager.updateBlock(room, Integer.valueOf(position), blockData, Boolean.parseBoolean(keyframe), Integer.parseInt(seqNum));
*/

	}
	
	private void handleCaptureEndRequest(HttpServletRequest request, HttpServletResponse response) throws Exception {	
		String room = request.getParameterValues("room")[0];
		String seqNum = request.getParameterValues("sequenceNumber")[0];
		if (! hasSessionManager) {
			sessionManager = getSessionManager();
			hasSessionManager = true;
		}
		System.out.println("HttpTunnel: Received Capture Enfd Event.");
    	sessionManager.removeSession(room, Integer.parseInt(seqNum));
	}
	    
	private ISessionManagerGateway getSessionManager() {
		//Get the servlet context
		ServletContext ctx = getServletContext();
		//Grab a reference to the application context
		ApplicationContext appCtx = (ApplicationContext) ctx.getAttribute(WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE);

		//Get the bean holding the parameter
		ISessionManagerGateway manager = (ISessionManagerGateway) appCtx.getBean("sessionManagerGateway");
		if (manager != null) {
			System.out.println("****Got the SessionManager context: *****");
		}
		return manager;
	}
}

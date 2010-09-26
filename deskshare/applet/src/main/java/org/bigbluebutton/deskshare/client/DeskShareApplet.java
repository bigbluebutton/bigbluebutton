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
package org.bigbluebutton.deskshare.client;

import javax.swing.JApplet;
import java.awt.Image;

public class DeskShareApplet extends JApplet implements ClientListener {
	private static final long serialVersionUID = 1L;

	String hostValue = "localhost";
    Integer portValue = new Integer(9123);
    String roomValue = "85115";
    Integer cWidthValue = new Integer(800);
    Integer cHeightValue = new Integer(600);
    Integer sWidthValue = new Integer(800);
    Integer sHeightValue = new Integer(600);   
    Boolean qualityValue = false;
    Boolean aspectRatioValue = false;
    Integer xValue = new Integer(0);
    Integer yValue = new Integer(0);
    Boolean tunnelValue = true;
    Boolean fullScreenValue = false;
    DeskshareClient client;
    Image icon;
    
    public boolean isSharing = false;
    
	public void init() {		
		hostValue = getParameter("IP");
		String port = getParameter("PORT");
		if (port != null) portValue = Integer.parseInt(port);
		roomValue = getParameter("ROOM");
		//cWidthValue = Integer.parseInt(getParameter("CAPTURE_WIDTH"));
		//cHeightValue = Integer.parseInt(getParameter("CAPTURE_HEIGHT"));				
		//xValue = Integer.parseInt(getParameter("X"));
		//yValue = Integer.parseInt(getParameter("Y"));
				
		sWidthValue = cWidthValue;
		String scaleWidth = getParameter("SCALE_WIDTH");
		if (scaleWidth != null) sWidthValue = Integer.parseInt(scaleWidth);
		
		sHeightValue = cHeightValue;
		String scaleHeight = getParameter("SCALE_HEIGHT");
		if (scaleHeight != null) sHeightValue = Integer.parseInt(scaleHeight);
		
		String qualityCapture = getParameter("SCALE_WITH_QUALITY");
		if (qualityCapture != null) qualityValue = Boolean.parseBoolean(qualityCapture);
		
		String aspectRatio = getParameter("MAINTAIN_ASPECT_RATIO");
		if (aspectRatio != null) aspectRatioValue = Boolean.parseBoolean(aspectRatio);

		String captureFullScreen = getParameter("CAPTURE_FULL_SCREEN");
		if (captureFullScreen != null) fullScreenValue = Boolean.parseBoolean(captureFullScreen);
		
		String tunnel = getParameter("HTTP_TUNNEL");
		if (tunnel != null) tunnelValue = Boolean.parseBoolean(tunnel);
		icon = getImage(getCodeBase(), "bbb.gif");
	}
		
	public void start() {		 	
		client = new DeskshareClient.ClientBuilder().host(hostValue).port(portValue)
							.room(roomValue).captureWidth(cWidthValue)
							.captureHeight(cHeightValue).scaleWidth(sWidthValue).scaleHeight(sHeightValue)
							.quality(qualityValue).aspectRatio(aspectRatioValue)
							.x(xValue).y(yValue).fullScreen(fullScreenValue)
							.httpTunnel(tunnelValue).trayIcon(icon).enableTrayIconActions(false).build();
		client.start();
	}
	
	public void setDimensions(int X, int Y, int width, int height){
		cWidthValue = width;
		cHeightValue = height;
		xValue = X;
		yValue = Y;
		sWidthValue = width;
		sHeightValue = height;
	}
				
	/**
	 * This method is called when the user closes the browser window containing the applet
	 * It is very important that the connection to the server is closed at this point. That way the server knows to
	 * close the stream.
	 */
	public void destroy() {
		System.out.println("Destroy");
		stop();
	}

	public void stop() {
		System.out.println("Stop");
		client.stop();			
	}
	
	public void onClientStop(ExitCode reason) {
		stop();
	}
	
}

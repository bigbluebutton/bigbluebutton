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

import java.applet.Applet;
import java.awt.Image;

import org.bigbluebutton.deskshare.client.frame.RecordingAppletFrame;

public class DeskShareApplet extends Applet implements ClientListener {
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
    DeskshareClient client;
    Image icon;
    
    private RecordingAppletFrame raf;
    public boolean isSharing = false;
    
	public void init() {
		raf = new RecordingAppletFrame(5);
		raf.setHeight(300);
		raf.setWidth(600);
		raf.centerOnScreen();
		raf.setVisible(true);
		raf.setApplet(this);
		
		hostValue = getParameter("IP");
		String port = getParameter("PORT");
		if (port != null) portValue = Integer.parseInt(port);
		roomValue = getParameter("ROOM");
		//cWidthValue = Integer.parseInt(getParameter("CAPTURE_WIDTH"));
		//cHeightValue = Integer.parseInt(getParameter("CAPTURE_HEIGHT"));				
		//xValue = Integer.parseInt(getParameter("X"));
		//yValue = Integer.parseInt(getParameter("Y"));
		
		cWidthValue = raf.getWidth();
		cHeightValue = raf.getHeight();
		xValue = raf.getX();
		yValue = raf.getY();
		
		sWidthValue = cWidthValue;
		//String scaleWidth = getParameter("SCALE_WIDTH");
		//if (scaleWidth != null) sWidthValue = Integer.parseInt(scaleWidth);
		
		sHeightValue = cHeightValue;
		//String scaleHeight = getParameter("SCALE_HEIGHT");
		//if (scaleHeight != null) sHeightValue = Integer.parseInt(scaleHeight);
		
		String qualityCapture = getParameter("SCALE_WITH_QUALITY");
		if (qualityCapture != null) qualityValue = Boolean.parseBoolean(qualityCapture);
		
		String aspectRatio = getParameter("MAINTAIN_ASPECT_RATIO");
		if (aspectRatio != null) aspectRatioValue = Boolean.parseBoolean(aspectRatio);
		
		String tunnel = getParameter("HTTP_TUNNEL");
		if (tunnel != null) tunnelValue = Boolean.parseBoolean(tunnel);
		icon = getImage(getCodeBase(), "bbb.gif");
	}
		
	public void start() {		 
		/*System.out.println("Start");	
		client = new DeskshareClient.Builder().host(hostValue).port(portValue)
							.room(roomValue).captureWidth(cWidthValue)
							.captureHeight(cHeightValue).scaleWidth(sWidthValue).scaleHeight(sHeightValue)
							.quality(qualityValue).aspectRatio(aspectRatioValue)
							.x(xValue).y(yValue)
							.httpTunnel(tunnelValue).trayIcon(icon).enableTrayIconActions(false).build();
		client.start();*/
		//raf.setDimensionsListener(client);
	}
	
	public void setDimensions(int X, int Y, int width, int height){
		cWidthValue = width;
		cHeightValue = height;
		xValue = X;
		yValue = Y;
		sWidthValue = width;
		sHeightValue = height;
	}
	
	public void setScreenCoordinates(int X, int Y){
		if (client != null) client.setScreenCoordinates(X, Y);
	}
	
	public void startSharing(){
		System.out.println("Start Sharing");	
		client = new DeskshareClient.Builder().host(hostValue).port(portValue)
							.room(roomValue).captureWidth(cWidthValue)
							.captureHeight(cHeightValue).scaleWidth(sWidthValue).scaleHeight(sHeightValue)
							.quality(qualityValue).aspectRatio(aspectRatioValue)
							.x(xValue).y(yValue)
							.httpTunnel(tunnelValue).trayIcon(icon).enableTrayIconActions(false).build();
		raf.setDimensionsListener(this);
		isSharing = true;
		client.start();
		
		raf.btnStartStop.setLabel("Stop Sharing");
		raf.removeResizeListeners();
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

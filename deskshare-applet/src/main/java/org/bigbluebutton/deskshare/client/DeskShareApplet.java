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

import java.awt.image.BufferedImage;

import javax.swing.JApplet;

import org.bigbluebutton.deskshare.client.net.HttpScreenCaptureSender;
import org.bigbluebutton.deskshare.client.net.SocketScreenCaptureSender;

public class DeskShareApplet extends JApplet implements IScreenCaptureListener {

	private static final long serialVersionUID = 1L;
	private ScreenCaptureTaker captureTaker;
	private ScreenCapture capture;
	private Thread captureTakerThread;
	private IScreenCaptureSender captureSender;
	
	private int screenWidth = 800;
	private int screenHeight = 600;
	private int x = 0;
	private int y = 0;
	private boolean httpTunnel = true;
	
	private String room = "f7e8821f-8528-4c28-994e-2db7659f9538";
	private String host = "192.168.0.136";
	
	public void init(){
		System.out.println("Applet built july 20, 2009 at 3:03PM");
		screenWidth = Integer.parseInt(getParameter("CAPTURE_WIDTH"));
		screenHeight = Integer.parseInt(getParameter("CAPTURE_HEIGHT"));
		x = Integer.parseInt(getParameter("X"));
		y = Integer.parseInt(getParameter("Y"));
		room = getParameter("ROOM");
		host = getParameter("IP");
		
		httpTunnel = Boolean.parseBoolean(getParameter("TUNNEL"));
		System.out.println("Tunnel " + httpTunnel);
		String t = getParameter("TUNNEL");
		System.out.println("Tunnel param " + t);
	}
	
	public void stop(){
		captureTaker.setCapture(false);
		if (!httpTunnel) {
			captureSender.disconnect();
		}		
	}
	
	public void start(){
		System.out.println("RunnerApplet start()");
		capture = new ScreenCapture(x, y, screenWidth, screenHeight);
		captureTaker = new ScreenCaptureTaker(capture);
		
		if (httpTunnel) {
			captureSender = new HttpScreenCaptureSender();
		} else {
			captureSender = new SocketScreenCaptureSender();

		}

		captureSender.connect(host, room, capture.getVideoWidth(),
				capture.getVideoHeight(), capture.getProperFrameRate());
		
		captureTaker.addListener(this);
		captureTaker.setCapture(true);
		
		captureTakerThread = new Thread(captureTaker);
		captureTakerThread.start();
	}
	
	/**
	 * This method is called when the user closes the browser window containing the applet
	 * It is very important that the connection to the server is closed at this point. That way the server knows to
	 * close the stream.
	 */
	public void destroy(){
		stop();
	}
	
	public void setScreenCoordinates(int x, int y){
		capture.setX(x);
		capture.setY(y);
	}
	


	public void onScreenCaptured(BufferedImage screen) {
		captureSender.send(screen);
	}

	static public void main (String argv[]) {
	    final JApplet applet = new DeskShareApplet();
	    applet.start();
	}
}

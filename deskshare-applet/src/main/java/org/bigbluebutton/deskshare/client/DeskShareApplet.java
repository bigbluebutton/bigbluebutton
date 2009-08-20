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

import java.awt.image.BufferedImage;


import org.bigbluebutton.deskshare.client.net.HttpScreenCaptureSender;
import org.bigbluebutton.deskshare.client.net.ScreenCaptureSender;
import org.bigbluebutton.deskshare.client.net.SocketScreenCaptureSender;
import org.bigbluebutton.deskshare.client.tiles.ChangedTile;
import org.bigbluebutton.deskshare.client.tiles.ChangedTilesListener;
import org.bigbluebutton.deskshare.client.tiles.Dimension;
import org.bigbluebutton.deskshare.client.tiles.Tile;
import org.bigbluebutton.deskshare.client.tiles.TileManager;

public class DeskShareApplet extends Applet implements IScreenCaptureListener, ChangedTilesListener {

	private static final long serialVersionUID = 1L;
	private ScreenCaptureTaker captureTaker;
	private ScreenCapture capture;
	private Thread captureTakerThread;
	private ScreenCaptureSender captureSender;
	
	private int screenWidth = 1400;
	private int screenHeight = 1000;
	private int x = 0;
	private int y = 0;
	private boolean httpTunnel = false;
	private TileManager tileManager;
	
	private String room = "f7e8821f-8528-4c28-994e-2db7659f9538";
	private String host = "192.168.0.136";
	
	public void init(){

		System.out.println("Applet built aug 20, 2009 at 11:50AM");
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

		Dimension screenDim = new Dimension(screenWidth, screenHeight);
		Dimension tileDim = new Dimension(32, 32);
		tileManager = new TileManager();
		tileManager.addListener(this);
		tileManager.initialize(screenDim, tileDim);
		
		captureSender.connect(host, room, capture.getWidth(),
				capture.getHeight(), capture.getProperFrameRate());
		
		captureTaker.addListener(this);
		captureTaker.setCapture(true);
		
		captureTakerThread = new Thread(captureTaker, "ScreenCapture");
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
		tileManager.processCapturedScreen(screen);
	}

	static public void main (String argv[]) {
	    final Applet applet = new DeskShareApplet();
	    applet.start();
	}

	public void onChangedTiles(Tile changedTile) {
//		System.out.println("On ChangedTiles " + changedTiles.size());
		captureSender.send(changedTile);
	}
}

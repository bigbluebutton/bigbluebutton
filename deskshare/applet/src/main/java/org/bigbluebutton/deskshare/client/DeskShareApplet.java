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
package org.bigbluebutton.deskshare.client;

import java.applet.Applet;

import java.awt.image.BufferedImage;
import org.bigbluebutton.deskshare.client.blocks.BlockManager;
import org.bigbluebutton.deskshare.client.blocks.ChangedBlocksListener;
import org.bigbluebutton.deskshare.client.net.ConnectionException;
import org.bigbluebutton.deskshare.client.net.NetworkStreamSender;
import org.bigbluebutton.deskshare.common.Dimension;

public class DeskShareApplet extends Applet implements IScreenCaptureListener, ChangedBlocksListener {
	private static final long serialVersionUID = 1L;
	private static final String LICENSE_HEADER = "This program is free software: you can redistribute it and/or modify\n" +
		"it under the terms of the GNU AFFERO General Public License as published by\n" +
		"the Free Software Foundation, either version 3 of the License, or\n" +
		"(at your option) any later version.\n\n" +
		"This program is distributed in the hope that it will be useful,\n" +
		"but WITHOUT ANY WARRANTY; without even the implied warranty of\n" +
		"MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the\n" +
		"GNU General Public License for more details.\n\n" +
		"You should have received a copy of the GNU AFFERO General Public License\n" +
		"along with this program.  If not, see <http://www.gnu.org/licenses/>.\n\n" +
		"To download the source of this program, see. \n" +
		"http://code.google.com/p/bigbluebutton/wiki/InstallingDesktopSharing\n\n" +
		"Copyright 2010 Blindside Networks. All Rights Reserved.\n\n";
	
	private ScreenCaptureTaker captureTaker;
	private ScreenCapture capture;
	private Thread captureTakerThread;

	private int screenWidth = 1680; //1536;
	private int screenHeight = 1050; //1024;
	private int x = 0;
	private int y = 0;
	private BlockManager blockManager;
	private int blockWidth = 64;
	private int blockHeight = 64;
	private String room = "testroom";
	private String host = "192.168.0.182";
	
	boolean connected = false;
	private boolean started = false;
	private NetworkStreamSender sender;
	
	public void init() {
		System.out.println(LICENSE_HEADER);
		System.out.println("Deskshare Applet v0.64");
		screenWidth = Integer.parseInt(getParameter("CAPTURE_WIDTH"));
		screenHeight = Integer.parseInt(getParameter("CAPTURE_HEIGHT"));
				
		x = Integer.parseInt(getParameter("X"));
		y = Integer.parseInt(getParameter("Y"));
		room = getParameter("ROOM");
		host = getParameter("IP");
	}
		
	public void start() {		 
		System.out.println("Start");		
		startCapture();		
		started = true;
	}

	public void startCapture() {
		capture = new ScreenCapture(x, y, screenWidth, screenHeight);
		captureTaker = new ScreenCaptureTaker(capture);
		
		Dimension screenDim = new Dimension(screenWidth, screenHeight);
		Dimension tileDim = new Dimension(blockWidth, blockHeight);
		blockManager = new BlockManager();
		blockManager.addListener(this);
		blockManager.initialize(screenDim, tileDim);
	
		sender = new NetworkStreamSender(blockManager, host, room, screenDim, tileDim);
		connected = sender.connect();
		if (connected) {
			captureTaker.addListener(this);
			captureTaker.setCapture(true);
			
			captureTakerThread = new Thread(captureTaker, "ScreenCaptureTaker");
			captureTakerThread.start();	
			sender.start();
		}		
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
		captureTaker.setCapture(false);
		if (connected && started) {
			try {
				sender.stop();
				started = false;
				connected = false;
			} catch (ConnectionException e) {
				e.printStackTrace();
			}
		}			
	}
	
	public void setScreenCoordinates(int x, int y) {
		capture.setX(x);
		capture.setY(y);
	}
	
	public void onScreenCaptured(BufferedImage screen) {
		blockManager.processCapturedScreen(screen);		
	}
	
	
	public void screenCaptureStopped() {
		System.out.println("Screencapture stopped");
		destroy();
	}

	public void onChangedBlock(Integer blockPosition) {
		sender.send(blockPosition);
	}
	
	static public void main (String argv[]) {
	    final Applet applet = new DeskShareApplet();
	    applet.start();
	}
}

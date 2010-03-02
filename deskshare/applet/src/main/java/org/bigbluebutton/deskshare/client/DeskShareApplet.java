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
import java.io.ByteArrayOutputStream;

import org.bigbluebutton.deskshare.client.blocks.BlockManager;
import org.bigbluebutton.deskshare.client.blocks.ChangedBlocksListener;
import org.bigbluebutton.deskshare.client.net.ConnectionException;
import org.bigbluebutton.deskshare.client.net.NetworkStreamSender;
import org.bigbluebutton.deskshare.common.Dimension;
import netscape.javascript.*;

public class DeskShareApplet extends Applet implements IScreenCaptureListener, ChangedBlocksListener {

	private static final long serialVersionUID = 1L;
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
	private boolean senderStarted = false;
	private NetworkStreamSender sender;
	
	public void init() {
		System.out.println("(c) 2010 Blindside Networks. All Rights Reserved.");
		screenWidth = Integer.parseInt(getParameter("CAPTURE_WIDTH"));
		screenHeight = Integer.parseInt(getParameter("CAPTURE_HEIGHT"));
				
		x = Integer.parseInt(getParameter("X"));
		y = Integer.parseInt(getParameter("Y"));
		room = getParameter("ROOM");
		host = getParameter("IP");
		
		String t = getParameter("TUNNEL");
		System.out.println("Tunnel param " + t);
	}
	
	public void stop() {
		System.out.println("Stopping applet");
		captureTaker.setCapture(false);
		if (connected) {
			try {
				if (senderStarted)
					sender.stop();
			} catch (ConnectionException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}			
	}
	
	public void start() {		 
		System.out.println("RunnerApplet start()");
		
		startCapture();		
	}

	public void startCapture() {
		capture = new ScreenCapture(x, y, screenWidth, screenHeight);
		captureTaker = new ScreenCaptureTaker(capture);
		
		Dimension screenDim = new Dimension(screenWidth, screenHeight);
		Dimension tileDim = new Dimension(blockWidth, blockHeight);
		blockManager = new BlockManager();
		blockManager.addListener(this);
		blockManager.initialize(screenDim, tileDim);
	
		sender = new NetworkStreamSender(blockManager, host, room);
		connected = sender.connect();
		if (connected) {
			captureTaker.addListener(this);
			captureTaker.setCapture(true);
			
			captureTakerThread = new Thread(captureTaker, "ScreenCaptureTaker");
			captureTakerThread.start();	
		}
	}
	
	private void testFunctionCall() {
        try {
            System.out.println("testFunctionCall: test started");
            JSObject window = JSObject.getWindow(this);
            System.out.println("Calling JavaScript getString();");
            if (window == null) System.out.println("WINDOW IS NULL");
            else System.out.println("WINDOW IS NOT NULL");
            
            String res = (String) window.eval("getString();");
            System.out.println("Got string from JavaScript: \"" + res + "\"");
            if (!res.equals("Hello, world!")) {
                throw new RuntimeException("string value did not match expected value");
            }
            Number num = (Number) window.eval("getNumber()");
            System.out.println("Got number from JavaScript: " + num);
            if (num.intValue() != 5) {
                throw new RuntimeException("number value did not match expected value");
            }
            System.out.println("testFunctionCall: test passed.");
        } catch (JSException e) {
            e.printStackTrace();
            System.out.println("TEST FAILED");
        } catch (Exception e2) {
            e2.printStackTrace();
            System.out.println("TEST FAILED");
        }
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
	
	public void onScreenCaptured(BufferedImage screen, boolean isKeyFrame) {
		blockManager.processCapturedScreen(screen, isKeyFrame);		
	}
	
	
	public void screenCaptureStopped() {
		System.out.println("Screencapture stopped");
		destroy();
	}

	public void onChangedTiles(ByteArrayOutputStream pixelData, boolean isKeyFrame) {
		if (! senderStarted) {
			sender.start();
			senderStarted = true;
		}
	}
	
	static public void main (String argv[]) {
	    final Applet applet = new DeskShareApplet();
	    applet.start();
	}
}

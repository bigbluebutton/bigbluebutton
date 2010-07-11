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

import java.awt.Image;
import java.awt.Point;
import java.awt.image.BufferedImage;

import org.bigbluebutton.deskshare.client.blocks.BlockManager;
import org.bigbluebutton.deskshare.client.blocks.ChangedBlocksListener;
import org.bigbluebutton.deskshare.client.net.BlockMessage;
import org.bigbluebutton.deskshare.client.net.CursorMessage;
import org.bigbluebutton.deskshare.client.net.NetworkConnectionListener;
import org.bigbluebutton.deskshare.client.net.NetworkStreamSender;
import org.bigbluebutton.deskshare.common.Dimension;
import org.bigbluebutton.deskshare.client.net.ConnectionException;

class DeskshareClient implements IScreenCaptureListener, ChangedBlocksListener, SystemTrayListener, 
			MouseLocationListener, NetworkConnectionListener {
	private static final String LICENSE_HEADER = "This program is free software: you can redistribute it and/or modify\n" +
	"it under the terms of the GNU Lesser General Public License as published by\n" +
	"the Free Software Foundation, either version 3 of the License, or\n" +
	"(at your option) any later version.\n\n" +
	"This program is distributed in the hope that it will be useful,\n" +
	"but WITHOUT ANY WARRANTY; without even the implied warranty of\n" +
	"MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the\n" +
	"GNU General Public License for more details.\n\n" +
	"You should have received a copy of the GNU Lesser General Public License\n" +
	"along with this program.  If not, see <http://www.gnu.org/licenses/>.\n\n" +
	"Copyright 2010 BigBlueButton. All Rights Reserved.\n\n";
	
	private ScreenCaptureTaker captureTaker;
	private ScreenCapture capture;
	private Thread captureTakerThread;
	private BlockManager blockManager;
	private int blockWidth = 64;
	private int blockHeight = 64;	
	boolean connected = false;
	private boolean started = false;
	private NetworkStreamSender sender;
	
   	private String host;
   	private int port;
   	private String room;
   	private int captureWidth;
   	private int captureHeight;
   	private int scaleWidth;
   	private int scaleHeight;
   	private boolean quality;
   	private boolean aspectRatio;
	private int x;
	private int y;
	private boolean httpTunnel;
	private Image sysTrayIcon;
	private boolean enableTrayActions;
	
	private DeskshareSystemTray tray = new DeskshareSystemTray();
	private ClientListener listener;
	private MouseLocationTaker mTaker;
	private Thread mouseLocationTakerThread;
	
	public void start() {	
		System.out.println(LICENSE_HEADER);
		System.out.println("Desktop Sharing v0.7");
		System.out.println("Start");
		System.out.println("Connecting to " + host + ":" + port + " room " + room);
		System.out.println("Sharing " + captureWidth + "x" + captureHeight + " at " + x + "," + y);
		System.out.println("Scale to " + scaleWidth + "x" + scaleHeight + " with quality = " + quality);
		System.out.println("Http Tunnel: " + httpTunnel);
		tray.addSystemTrayListener(this);
		tray.displayIconOnSystemTray(sysTrayIcon, enableTrayActions);
		
		startCapture();		
		started = true;
	}

	private void startCapture() {
		if (aspectRatio) {
			recalculateScaleDimensionsToMaintainAspectRatio();
//			System.out.println("[" + scaleWidth + "x" + scaleHeight + "]");
		}
		
		capture = new ScreenCapture(x, y, captureWidth, captureHeight, scaleWidth, scaleHeight, quality);
		captureTaker = new ScreenCaptureTaker(capture);
		mTaker = new MouseLocationTaker(captureWidth, captureHeight, scaleWidth, scaleHeight);
		
		// Use the scaleWidth and scaleHeight as the dimension we pass to the BlockManager.
		// If there is no scaling required, the scaleWidth and scaleHeight will be the same as 
		// captureWidth and captureHeight (ritzalam 05/27/2010)
		Dimension screenDim = new Dimension(scaleWidth, scaleHeight);
		Dimension tileDim = new Dimension(blockWidth, blockHeight);
		blockManager = new BlockManager();
		blockManager.addListener(this);
		blockManager.initialize(screenDim, tileDim);
		
		sender = new NetworkStreamSender(blockManager, host, port, room, screenDim, tileDim, httpTunnel);
		connected = sender.connect();
		if (connected) {
			sender.addNetworkConnectionListener(this);
			captureTaker.addListener(this);
			captureTaker.start();
			
			captureTakerThread = new Thread(captureTaker, "ScreenCaptureTaker");
			captureTakerThread.start();	
			sender.start();
			
			mTaker.start();
			mouseLocationTakerThread = new Thread(mTaker, "MouseLocationTakerThread");
			mTaker.addListener(this);
			mouseLocationTakerThread.start();			
		} else {
			notifyListener(ExitCode.DESKSHARE_SERVICE_UNAVAILABLE);
		}
	}
	
	private void recalculateScaleDimensionsToMaintainAspectRatio() {
		if (captureWidth < captureHeight) {
			double ratio = (double)captureHeight/(double)captureWidth;
			scaleHeight = (int)((double)scaleWidth * ratio);
		} else {
			double ratio = (double)captureWidth/(double)captureHeight;
			scaleWidth = (int)((double)scaleHeight * ratio);
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
		captureTaker.stop();
		mTaker.stop();
		if (connected && started) {
			try {
				sender.stop();
				started = false;
				connected = false;
			} catch (ConnectionException e) {
				e.printStackTrace();
			}
		}		
		tray.removeIconFromSystemTray();
	}
	
	public void setScreenCoordinates(int x, int y) {
		capture.setX(x);
		capture.setY(y);
	}
	
	public void onScreenCaptured(BufferedImage screen) {
		blockManager.processCapturedScreen(screen);				
	}
	
	public void mouseLocation(Point loc) {
		CursorMessage msg = new CursorMessage(loc, room);
		sender.send(msg);
	}
	
	public void screenCaptureStopped() {
		System.out.println("Screencapture stopped");
		destroy();
	}

	public void onChangedBlock(BlockMessage message) {
		sender.send(message);
	}

	public void onStopSharingSysTrayMenuClicked() {
		notifyListener(ExitCode.NORMAL);
	}

	private void notifyListener(ExitCode reason) {
		if (listener != null) {
			System.out.println("Notifying app of client stopping.");
			listener.onClientStop(reason);
		}
	}
	
	public void addClientListeners(ClientListener l) {
		listener = l;
	}

	@Override
	public void networkConnectionException(ExitCode reason) {
		System.out.println("Notifying client of network stopping.");
		notifyListener(reason);
	}	
	
	private DeskshareClient(Builder builder) {
       	room = builder.room;
       	host = builder.host;
       	port = builder.port;
       	captureWidth = builder.captureWidth;  
       	captureHeight = builder.captureHeight;
       	scaleWidth = builder.scaleWidth;
       	scaleHeight = builder.scaleHeight;
       	quality = builder.quality;
       	aspectRatio = builder.aspectRatio;
       	x = builder.x;
       	y = builder.y;
       	httpTunnel = builder.httpTunnel;
       	sysTrayIcon = builder.sysTrayIcon;
       	enableTrayActions = builder.enableTrayActions;
    }

	
	/********************************************
	 * Helper class
	 ********************************************/
	
    public static class Builder {
       	private String host;
       	private int port;
       	private String room;
       	private int captureWidth;
       	private int captureHeight;
       	private int scaleWidth;
       	private int scaleHeight;
       	private boolean quality;
       	private boolean aspectRatio;
    	private int x;
    	private int y;
    	private boolean httpTunnel;
    	private Image sysTrayIcon;
    	private boolean enableTrayActions;
    	
    	public Builder() {}
    	
    	public Builder host(String host) {
    		this.host = host;
    		return this;
    	}
    	
    	public Builder port(int port) {  		
	    	this.port = port;
	    	return this;
	    }
    	
    	public Builder room(String room) {
    		this.room = room;
    		return this;
    	}
    	
    	public Builder captureWidth(int width) {
    		this.captureWidth = width;
    		return this;
    	}

    	public Builder captureHeight(int height) {
    		this.captureHeight = height;
    		return this;
    	}
    	
    	public Builder scaleWidth(int width) {
    		this.scaleWidth = width;
    		return this;
    	}

    	public Builder scaleHeight(int height) {
    		this.scaleHeight = height;
    		return this;
    	}
    	
    	public Builder quality(boolean quality) {
    		this.quality = quality;
    		return this;
    	}
    	
    	public Builder aspectRatio(boolean aspectRatio) {
    		this.aspectRatio = aspectRatio;
    		return this;
    	}
    	
    	public Builder x(int x) {
    		this.x = x;
    		return this;
    	}
    	
    	public Builder y(int y) {
    		this.y = y;
    		return this;
    	}
    	
    	public Builder httpTunnel(boolean httpTunnel) {
    		this.httpTunnel = httpTunnel;
    		return this;
    	}
    	
    	public Builder trayIcon(Image icon) {
    		this.sysTrayIcon = icon;
    		return this;
    	}
    	
    	public Builder enableTrayIconActions(boolean enableActions) {
    		enableTrayActions = enableActions;
    		return this;
    	}
    	
    	public DeskshareClient build() {
    		return new DeskshareClient(this);
    	}
    }



}

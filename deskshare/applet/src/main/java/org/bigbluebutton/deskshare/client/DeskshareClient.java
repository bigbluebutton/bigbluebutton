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
import java.awt.Toolkit;
import org.bigbluebutton.deskshare.client.blocks.BlockManager;
import org.bigbluebutton.deskshare.client.blocks.ChangedBlocksListener;
import org.bigbluebutton.deskshare.client.frame.CaptureRegionFrame;
import org.bigbluebutton.deskshare.client.frame.CaptureRegionListener;
import org.bigbluebutton.deskshare.client.net.NetworkConnectionListener;
import org.bigbluebutton.deskshare.client.net.NetworkStreamSender;
import org.bigbluebutton.deskshare.common.Dimension;
import org.bigbluebutton.deskshare.client.net.ConnectionException;

public class DeskshareClient {
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
//	private ScreenCapture capture;
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
	private boolean fullScreen;
	
	private DeskshareSystemTray tray = new DeskshareSystemTray();
	private ClientListener listener;
	private MouseLocationTaker mouseLocTaker;

	public void start() {	
		System.out.println(LICENSE_HEADER);
		System.out.println("Desktop Sharing v0.71-dev");
		System.out.println("Start");
		System.out.println("Connecting to " + host + ":" + port + " room " + room);
		System.out.println("Sharing " + captureWidth + "x" + captureHeight + " at " + x + "," + y);
		System.out.println("Scale to " + scaleWidth + "x" + scaleHeight + " with quality = " + quality);
		System.out.println("Http Tunnel: " + httpTunnel);
		
		if (fullScreen) {
			startCapture();
		} else {
			shareWithFrame();
		}
		started = true;
	}

	private void shareWithFrame() {
		CaptureRegionListener crl = new CaptureRegionListenerImp(captureTaker, mouseLocTaker);
		CaptureRegionFrame frame = new CaptureRegionFrame(crl, 3);
		frame.setHeight(captureHeight);
		frame.setWidth(captureWidth);
		frame.setLocation(x, y);
		frame.setVisible(true);		
	}
		
	private void startCapture() {		
		captureTaker = new ScreenCaptureTaker(x, y, captureWidth, captureHeight, scaleWidth, scaleHeight, quality);
		mouseLocTaker = new MouseLocationTaker(captureWidth, captureHeight, scaleWidth, scaleHeight, x, y);
		
		// Use the scaleWidth and scaleHeight as the dimension we pass to the BlockManager.
		// If there is no scaling required, the scaleWidth and scaleHeight will be the same as 
		// captureWidth and captureHeight (ritzalam 05/27/2010)
		Dimension screenDim = new Dimension(scaleWidth, scaleHeight);
		Dimension tileDim = new Dimension(blockWidth, blockHeight);
		blockManager = new BlockManager();		
		blockManager.initialize(screenDim, tileDim);
		
		sender = new NetworkStreamSender(blockManager, host, port, room, screenDim, tileDim, httpTunnel);
		connected = sender.connect();
		if (connected) {
			ChangedBlocksListener changedBlocksListener = new ChangedBlockListenerImp(sender);
			blockManager.addListener(changedBlocksListener);
			ScreenCaptureListener screenCapListener = new ScreenCaptureListenerImp(blockManager);
			captureTaker.addListener(screenCapListener);
			captureTaker.start();			
			sender.start();
			MouseLocationListenerImp mouseLocListener = new MouseLocationListenerImp(sender, room);
			mouseLocTaker.addListener(mouseLocListener);
			mouseLocTaker.start();			
		} else {
			notifyListener(ExitCode.DESKSHARE_SERVICE_UNAVAILABLE);
		}
	}
	
	public void stop() {
		System.out.println("Stop");
		captureTaker.stop();
		mouseLocTaker.stop();
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
			
	private void notifyListener(ExitCode reason) {
		if (listener != null) {
			System.out.println("Notifying app of client stopping.");
			listener.onClientStop(reason);
		}
	}
	
	public void addClientListeners(ClientListener l) {
		listener = l;
		SystemTrayListener systrayListener = new SystemTrayListenerImp(listener);
		tray.addSystemTrayListener(systrayListener);
		tray.displayIconOnSystemTray(sysTrayIcon, enableTrayActions);	
		
		NetworkConnectionListener netConnListener = new NetworkConnectionListenerImp(listener);
		if (sender != null)
			sender.addNetworkConnectionListener(netConnListener);
		else
			System.out.println("ERROR: Cannot add listener to network connection.");
	}

	private DeskshareClient(ClientBuilder builder) {
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
       	fullScreen = builder.fullScreen;
       	enableTrayActions = builder.enableTrayActions;
    }

	
	/********************************************
	 * Helper class
	 ********************************************/
	
	/**
	 * Builds the Deskstop Sharing Client.
	 *
	*/	
    public static class ClientBuilder {
       	private String host = "localhost";
       	private int port = 9123;
       	private String room = "default-room";
       	private int captureWidth = 0;
       	private int captureHeight = 0;
       	private int scaleWidth = 0;
       	private int scaleHeight = 0;
       	private boolean quality = false;
       	private boolean aspectRatio = false; 
    	private int x = -1;
    	private int y = -1;
    	private boolean httpTunnel = true;
    	private Image sysTrayIcon;
    	private boolean enableTrayActions = false;
    	private boolean fullScreen = false;
    	
    	public ClientBuilder host(String host) {
    		this.host = host;
    		return this;
    	}
    	
    	public ClientBuilder port(int port) {  		
	    	this.port = port;
	    	return this;
	    }
    	
    	public ClientBuilder room(String room) {
    		this.room = room;
    		return this;
    	}
    	
    	public ClientBuilder captureWidth(int width) {
    		this.captureWidth = width;
    		return this;
    	}

    	public ClientBuilder captureHeight(int height) {
    		this.captureHeight = height;
    		return this;
    	}
    	
    	public ClientBuilder scaleWidth(int width) {
    		this.scaleWidth = width;
    		return this;
    	}

    	public ClientBuilder scaleHeight(int height) {
    		this.scaleHeight = height;
    		return this;
    	}
    	
    	public ClientBuilder quality(boolean quality) {
    		this.quality = quality;
    		return this;
    	}
    	
    	public ClientBuilder aspectRatio(boolean aspectRatio) {
    		this.aspectRatio = aspectRatio;
    		return this;
    	}
    	
    	public ClientBuilder x(int x) {
    		this.x = x;
    		return this;
    	}
    	
    	public ClientBuilder y(int y) {
    		this.y = y;
    		return this;
    	}
    	
    	public ClientBuilder httpTunnel(boolean httpTunnel) {
    		this.httpTunnel = httpTunnel;
    		return this;
    	}

    	public ClientBuilder fullScreen(boolean fullScreen) {
    		this.fullScreen = fullScreen;
    		return this;
    	}
    	
    	public ClientBuilder trayIcon(Image icon) {
    		this.sysTrayIcon = icon;
    		return this;
    	}
    	
    	public ClientBuilder enableTrayIconActions(boolean enableActions) {
    		enableTrayActions = enableActions;
    		return this;
    	}
    	
    	public DeskshareClient build() {
    		if (fullScreen) {
    			setupFullScreen();
    		} else {
    			setupCaptureRegion();
    		}
    		return new DeskshareClient(this);
    	}
    	
    	private void setupCaptureRegion() {
    		if (captureWidth > 0 && captureHeight > 0) {
    			if (x < 0 || y < 0) {
        			java.awt.Dimension fullScreenSize = Toolkit.getDefaultToolkit().getScreenSize();
        			x = ((int) fullScreenSize.getWidth() - captureWidth) / 2;
        			y = ((int) fullScreenSize.getHeight() - captureHeight) / 2;    				
    			}
    			
    			calculateDimensionsToMaintainAspectRation();
    		}
    	}
    	
    	private void calculateDimensionsToMaintainAspectRation() {
    		if (scaleWidth > 0 && scaleHeight > 0) {
    			if (aspectRatio) {
    				recalculateScaleDimensionsToMaintainAspectRatio();
    			}
    		} else {
    			scaleWidth = captureWidth;
    			scaleHeight = captureHeight;
    		}    		
    	}
    	
    	private void setupFullScreen() {
    		java.awt.Dimension fullScreenSize = Toolkit.getDefaultToolkit().getScreenSize();
    		captureWidth = (int) fullScreenSize.getWidth();
    		captureHeight = (int) fullScreenSize.getHeight();
    		x = 0;
    		y = 0;
    		
    		calculateDimensionsToMaintainAspectRation();
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
    	
    }
}

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
package org.bigbluebutton.deskshare.client;

import org.bigbluebutton.deskshare.client.blocks.BlockManager;
import org.bigbluebutton.deskshare.client.blocks.ChangedBlocksListener;
import org.bigbluebutton.deskshare.client.net.ConnectionException;
import org.bigbluebutton.deskshare.client.net.NetworkConnectionListener;
import org.bigbluebutton.deskshare.client.net.NetworkStreamSender;
import org.bigbluebutton.deskshare.common.Dimension;

public class ScreenSharerRunner {
	public static final String NAME = "SCREENSHARERUNNER: ";
	
	private ScreenCaptureTaker captureTaker;
	private BlockManager blockManager;
	private int blockWidth = 64;
	private int blockHeight = 64;	
	boolean connected = false;
	private boolean started = false;
	private NetworkStreamSender sender;
	
	private final ScreenShareInfo ssi;
	
	private DeskshareSystemTray tray = new DeskshareSystemTray();
	private ClientListener listener;
	private MouseLocationTaker mouseLocTaker;
	
	public ScreenSharerRunner(ScreenShareInfo ssi) {
		this.ssi = ssi;
		
//		if (! ssi.fullScreen) {
			calculateScaledCapturedWidthAndHeight();
//		}
				
		System.out.println("ScreenSharerRunner[captureWidth=" + ssi.captureWidth + ",captureHeight=" + ssi.captureHeight + "][" + ssi.x + "," + ssi.y +"]"
				+ "[scaleWidth=" + ssi.scaleWidth + ",scaleHeight=" + ssi.scaleHeight + "]");
		
		captureTaker = new ScreenCaptureTaker(ssi.x, ssi.y, ssi.captureWidth, ssi.captureHeight, ssi.scaleWidth, ssi.scaleHeight, ssi.quality);
		mouseLocTaker = new MouseLocationTaker(ssi.captureWidth, ssi.captureHeight, ssi.scaleWidth, ssi.scaleHeight, ssi.x, ssi.y);
		
		// Use the scaleWidth and scaleHeight as the dimension we pass to the BlockManager.
		// If there is no scaling required, the scaleWidth and scaleHeight will be the same as 
		// captureWidth and captureHeight (ritzalam 05/27/2010)
		Dimension screenDim = new Dimension(ssi.scaleWidth, ssi.scaleHeight);
		Dimension tileDim = new Dimension(blockWidth, blockHeight);
		blockManager = new BlockManager();		
		blockManager.initialize(screenDim, tileDim, ssi.useSVC2);
		
		sender = new NetworkStreamSender(blockManager, ssi.host, ssi.port , ssi.useTLS, ssi.room, screenDim, tileDim, ssi.httpTunnel, ssi.useSVC2);
	}
	
	public void startSharing() {	
		printHeader();
		
		connected = sender.connect();
		if (connected) {
			ChangedBlocksListener changedBlocksListener = new ChangedBlockListenerImp(sender);
			blockManager.addListener(changedBlocksListener);
			ScreenCaptureListener screenCapListener = new ScreenCaptureListenerImp(blockManager);
			captureTaker.addListener(screenCapListener);
			captureTaker.start();			
			sender.start();
			MouseLocationListenerImp mouseLocListener = new MouseLocationListenerImp(sender, ssi.room);
			mouseLocTaker.addListener(mouseLocListener);
			mouseLocTaker.start();			
			started = true;
		} else {
			notifyListener(ExitCode.DESKSHARE_SERVICE_UNAVAILABLE);
		}
	}
	

	public void disconnectSharing(){
		System.out.println(NAME + "Disconneted");
		System.out.println(NAME + "Change system tray icon message");
		tray.disconnectIconSystemTrayMessage();
		captureTaker.stop();
		mouseLocTaker.stop();
	} // END FUNCTION disconnectSharing
	
	public void stopSharing() {
		System.out.println(NAME + "Stopping");
		System.out.println(NAME + "Removing icon from system tray.");
		tray.removeIconFromSystemTray();
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
	}

	public void setCaptureCoordinates(int x, int y) {
		captureTaker.setCaptureCoordinates(x, y);
		mouseLocTaker.setCaptureCoordinates(x, y);
	}
	
	private void calculateScaledCapturedWidthAndHeight() {
		double imgWidth = ssi.captureWidth;
		double imgHeight = ssi.captureHeight;
		
		if ((ssi.captureWidth == ssi.scaleWidth) && (ssi.captureHeight == ssi.scaleHeight)) {
			return;
		}
		
		if (ssi.captureWidth < ssi.scaleWidth || ssi.captureHeight <  ssi.scaleHeight) {
						
			if (imgWidth < ssi.scaleWidth && imgHeight < ssi.scaleHeight) {
				System.out.println("Capture is smaller than scale dims. Just draw the image.");
				System.out.println("Screen capture. capture=[" + imgWidth + "," + imgHeight + "] scale=[" + ssi.scaleWidth + "," + ssi.scaleHeight + "]");				
			} else {
	    		if (imgWidth > ssi.scaleWidth) {
//	    			System.out.println("Fit to width.");
	    			double ratio = imgHeight/imgWidth;
	    			imgWidth = ssi.scaleWidth;
	    			imgHeight = imgWidth * ratio;
	    		} else {
//	    			System.out.println("Fit to height.");
	    			double ratio = imgWidth/imgHeight;
	    			imgHeight = ssi.scaleHeight;
	    			imgWidth = imgHeight * ratio;
	    		}			
			}
		} else {
			System.out.println("Both capture sides are greater than the scaled dims. Downscale image.");
			
    		if (ssi.captureWidth >= ssi.captureHeight) {
    	        System.out.println("fitToWidthAndAdjustHeightToMaintainAspectRatio");  
    			imgWidth = ssi.scaleWidth;

    	        // Maintain aspect-ratio
    			imgHeight = (double)ssi.captureHeight * ((double)ssi.scaleWidth / (double)ssi.captureWidth);

    	        if (imgHeight > ssi.scaleHeight) {
    	        	// The height is still bigger than the requested scale height. Downscale some more. This time, we
    	        	// do fit-to-height.
    	        	imgWidth = imgWidth * ((double)ssi.scaleHeight / imgHeight);
    	        	imgHeight = ssi.scaleHeight;
    	        }
    		} else {
    	        System.out.println("fitToHeightAndAdjustWidthToMaintainAspectRatio");   
    	        imgHeight = ssi.scaleHeight;
    	        
    	        // Maintain aspect-ratio
    			imgWidth = (double)ssi.captureWidth * ((double)ssi.scaleHeight / (double)ssi.captureHeight);

    	        if (imgWidth > ssi.scaleWidth) {
    	        	// The width is still bigger than the requested scale width. Downscale some more. This time, we
    	        	// do fit-to-width.
    	        	imgHeight = imgHeight * ((double)ssi.scaleWidth / imgWidth);
    	        	imgWidth = ssi.scaleWidth;
    	        }
    		}				
		}
		
		ssi.scaleWidth = (int)imgWidth;
		ssi.scaleHeight = (int)imgHeight;
	}
	
	private void notifyListener(ExitCode reason) {
		if (listener != null) {
			System.out.println(NAME + "Notifying app of client stopping.");
			listener.onClientStop(reason);
		}
	}
	
	public void addClientListener(ClientListener l) {
		listener = l;
		SystemTrayListener systrayListener = new SystemTrayListenerImp(listener);
		tray.addSystemTrayListener(systrayListener);
		tray.displayIconOnSystemTray(ssi.sysTrayIcon, ssi.enableTrayActions);	
		
		NetworkConnectionListener netConnListener = new NetworkConnectionListenerImp(listener);
		if (sender != null)
			sender.addNetworkConnectionListener(netConnListener);
		else
			System.out.println(NAME + "ERROR - Cannot add listener to network connection.");
	}
	
	private void printHeader() {
		System.out.println("-----------------------------------------------------------------------");
		System.out.println(LICENSE_HEADER);
		System.out.println("-----------------------------------------------------------------------\n\n");
		System.out.println("Desktop Sharing v0.9.0");
		System.out.println("Start");
		System.out.println("Connecting to " + ssi.host + ":" + ssi.port + " room " + ssi.room);
		System.out.println("Sharing " + ssi.captureWidth + "x" + ssi.captureHeight + " at " + ssi.x + "," + ssi.y);
		System.out.println("Scale to " + ssi.scaleWidth + "x" + ssi.scaleHeight + " with quality = " + ssi.quality);
//		System.out.println("Http Tunnel: " + ssi.httpTunnel);
	}
	
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
}

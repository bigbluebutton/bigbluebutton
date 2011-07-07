/** 
* ===License Header===
*
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
* 
* ===License Header===
*/
package org.bigbluebutton.deskshare.client;

import java.awt.Image;
import java.awt.Toolkit;

public class DeskshareClient {	
	public static final String NAME = "DESKSHARECLIENT: ";
	
	private ScreenShareInfo ssi;
	private ClientListener listener;
	private ScreenSharer screenSharer;
	
	public void addClientListener(ClientListener l) {
		listener = l;
	}

	public void start() {			
		if (ssi.fullScreen) {
			System.out.println(NAME + "Sharing full screen.");
			shareFullScreen();
		} else {
			System.out.println(NAME + "Sharing region of screen.");
			shareWithFrame();
		}
	}

	private void shareWithFrame() {
		screenSharer = new ScreenRegionSharer(ssi);
		screenSharer.addClientListener(listener);
		screenSharer.start();		
	}
		
	private void shareFullScreen() {
		screenSharer = new FullScreenSharer(ssi);
		screenSharer.addClientListener(listener);
		screenSharer.start();
	}
	
	/*****************************************************************************
    ;  disconnected
    ;----------------------------------------------------------------------------
	; DESCRIPTION
	;   This routine is used to set the desktop sharing string to disconnected.
	;
	; RETURNS : N/A
	;
	; INTERFACE NOTES
	; 
	;       INPUT : N/A
	; 
	;       OUTPUT : N/A
	; 
	; IMPLEMENTATION
	;
	; HISTORY
	; __date__ :        PTS:  
	; 2010.11.19		problem 272
	;
	******************************************************************************/
	public void disconnected(){
		System.out.println(NAME + "Disconneted");
		screenSharer.disconnected();
	} // END FUNCTION disconnected
	
	public void stop() {
		System.out.println(NAME + "Stop");		
		screenSharer.stop();
	}
			
	private DeskshareClient(ScreenShareInfo ssi) {		
		this.ssi = ssi;
    }

	
	/********************************************
	 * Helper class
	 ********************************************/
	
	/**
	 * Builds the Deskstop Sharing Client.
	 *
	*/	
    public static class NewBuilder {
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
    	
    	public NewBuilder host(String host) {
    		this.host = host;
    		return this;
    	}
    	
    	public NewBuilder port(int port) {  		
	    	this.port = port;
	    	return this;
	    }
    	
    	public NewBuilder room(String room) {
    		this.room = room;
    		return this;
    	}
    	
    	public NewBuilder captureWidth(int width) {
    		this.captureWidth = width;
    		return this;
    	}

    	public NewBuilder captureHeight(int height) {
    		this.captureHeight = height;
    		return this;
    	}
    	
    	public NewBuilder scaleWidth(int width) {
    		this.scaleWidth = width;
    		return this;
    	}

    	public NewBuilder scaleHeight(int height) {
    		this.scaleHeight = height;
    		return this;
    	}
    	
    	public NewBuilder quality(boolean quality) {
    		this.quality = quality;
    		return this;
    	}
    	
    	public NewBuilder aspectRatio(boolean aspectRatio) {
    		this.aspectRatio = aspectRatio;
    		return this;
    	}
    	
    	public NewBuilder x(int x) {
    		this.x = x;
    		return this;
    	}
    	
    	public NewBuilder y(int y) {
    		this.y = y;
    		return this;
    	}
    	
    	public NewBuilder httpTunnel(boolean httpTunnel) {
    		this.httpTunnel = httpTunnel;
    		return this;
    	}

    	public NewBuilder fullScreen(boolean fullScreen) {
    		this.fullScreen = fullScreen;
    		return this;
    	}
    	
    	public NewBuilder trayIcon(Image icon) {
    		this.sysTrayIcon = icon;
    		return this;
    	}
    	
    	public NewBuilder enableTrayIconActions(boolean enableActions) {
    		enableTrayActions = enableActions;
    		return this;
    	}
    	
    	public DeskshareClient build() {
    		if (fullScreen) {
    			System.out.println("Sharing full screen.");
    			setupFullScreen();
    		} else {
    			System.out.println("Sharing region screen.");
    			setupCaptureRegion();
    		}
    		
    		ScreenShareInfo ssi = new ScreenShareInfo();
    		ssi.host = host;
    		ssi.port = port;
    		ssi.room = room;
    		ssi.captureWidth = captureWidth;
    		ssi.captureHeight = captureHeight;
    		ssi.scaleWidth = scaleWidth;
    		ssi.scaleHeight = scaleHeight;
    		ssi.quality = quality;
    		ssi.aspectRatio = aspectRatio;
    		ssi.x = x;
    		ssi.y = y;
    		ssi.httpTunnel = httpTunnel;
    		ssi.fullScreen = fullScreen;
    		ssi.sysTrayIcon = sysTrayIcon;
    		ssi.enableTrayActions = enableTrayActions;
    		return new DeskshareClient(ssi);
    	}
    	    	
    	private void setupCaptureRegion() {
    		if (captureWidth > 0 && captureHeight > 0) {
        			java.awt.Dimension fullScreenSize = Toolkit.getDefaultToolkit().getScreenSize();
        			x = ((int) fullScreenSize.getWidth() - captureWidth) / 2;
        			y = ((int) fullScreenSize.getHeight() - captureHeight) / 2;    
        			System.out.println("Info[" + captureWidth + "," + captureHeight + "][" + x + "," + y +"]"
        					+ "[" + fullScreenSize.getWidth() + "," + fullScreenSize.getHeight() + "]");
//    			calculateDimensionsToMaintainAspectRatio();
    		}
    	}
    	
    	private void calculateDimensionsToMaintainAspectRatio() {
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
    		scaleWidth = captureWidth;
    		scaleHeight = captureHeight;
    		x = 0;
    		y = 0;

    		System.out.println("Check for scaling[" + captureWidth + "," + captureHeight +"][" + scaleWidth + "," + scaleHeight + "]");

    		if (scaleWidth > 1280) {   
    			scaleWidth = 1280;
    			double ratio = (double)captureHeight/(double)captureWidth;
    			scaleHeight = (int)((double)scaleWidth * ratio);
    			System.out.println("Scaling[" + captureWidth + "," + captureHeight +"][" + scaleWidth + "," + scaleHeight + "]");
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
    	
    }
}

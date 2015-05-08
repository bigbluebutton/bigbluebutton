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
		screenSharer.start(false);		
	}
		
	private void shareFullScreen() {
		screenSharer = new ScreenRegionSharer(ssi);
		screenSharer.addClientListener(listener);
		screenSharer.start(true);
	}
	
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
		private boolean useTLS = false;
       	private String room = "default-room";
       	private int captureWidth = 0;
       	private int captureHeight = 0;
       	private int scaleWidth = 0;
       	private int scaleHeight = 0;
       	private boolean quality = false;
       	private double scale = 1; 
    	private int x = -1;
    	private int y = -1;
    	private boolean httpTunnel = true;
    	private Image sysTrayIcon;
    	private boolean enableTrayActions = false;
    	private boolean fullScreen = false;
    	private boolean useSVC2 = false;
    	
    	public NewBuilder host(String host) {
    		this.host = host;
    		return this;
    	}
    	
    	public NewBuilder port(int port) {  		
	    	this.port = port;
	    	return this;
	    }
    	
		public NewBuilder useTLS(boolean useTLS) {
			this.useTLS = useTLS;
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
    	
    	public NewBuilder autoScale(double scaleTo) {
    		this.scale = scaleTo;
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
    	
    	public NewBuilder useSVC2(boolean useSVC2) {
    		this.useSVC2 = useSVC2;
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
			ssi.useTLS = useTLS;
    		ssi.room = room;
    		ssi.captureWidth = captureWidth;
    		ssi.captureHeight = captureHeight;
    		ssi.scaleWidth = scaleWidth;
    		ssi.scaleHeight = scaleHeight;
    		ssi.quality = quality;
    		ssi.scale = scale;
    		ssi.x = x;
    		ssi.y = y;
    		ssi.httpTunnel = httpTunnel;
    		ssi.fullScreen = fullScreen;
    		ssi.useSVC2 = useSVC2;
    		ssi.sysTrayIcon = sysTrayIcon;
    		ssi.enableTrayActions = enableTrayActions;
    		
    		System.out.println("ScreenShareInfo[captureWidth=" + captureWidth + ",captureHeight=" + captureHeight + "][" + x + "," + y +"]"
					+ "[scaleWidth=" + scaleWidth + ",scaleHeight=" + scaleHeight + "]");
    		
    		return new DeskshareClient(ssi);
    	}
    	    	
    	private void setupCaptureRegion() {
    		if (captureWidth > 0 && captureHeight > 0) {
        			java.awt.Dimension fullScreenSize = Toolkit.getDefaultToolkit().getScreenSize();
        			x = ((int) fullScreenSize.getWidth() - captureWidth) / 2;
        			y = ((int) fullScreenSize.getHeight() - captureHeight) / 2;    
        			System.out.println("Info[" + captureWidth + "," + captureHeight + "][" + x + "," + y +"]"
        					+ "[" + fullScreenSize.getWidth() + "," + fullScreenSize.getHeight() + "]");
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


    		if (scale > 0 && scale <= 0.8) {
        		scaleWidth = (int)(scale * (double)captureWidth);
        		scaleHeight = (int)(scale * (double)captureHeight);     			
     		} 
		
			System.out.println("Check for scaling[" + captureWidth + "," + captureHeight +"][" + scaleWidth + "," + scaleHeight + "]");

			if (scale == 1) {
				scaleWidth = captureWidth;
				scaleHeight = captureHeight;
			} else {
				if (scaleWidth > 1280) {   
					scaleWidth = 1280;
					double ratio = (double)captureHeight/(double)captureWidth;
					scaleHeight = (int)((double)scaleWidth * ratio);
					System.out.println("Scaling[" + captureWidth + "," + captureHeight +"][" + scaleWidth + "," + scaleHeight + "]");
				}				
			}

    	}
    	  	
    }
}

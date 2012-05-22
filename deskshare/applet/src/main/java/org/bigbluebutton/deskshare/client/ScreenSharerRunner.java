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
		captureTaker = new ScreenCaptureTaker(ssi.x, ssi.y, ssi.captureWidth, ssi.captureHeight, ssi.scaleWidth, 
				ssi.scaleHeight, ssi.quality);
		mouseLocTaker = new MouseLocationTaker(ssi.captureWidth, ssi.captureHeight, ssi.scaleWidth, ssi.scaleHeight, ssi.x, ssi.y);
		
		// Use the scaleWidth and scaleHeight as the dimension we pass to the BlockManager.
		// If there is no scaling required, the scaleWidth and scaleHeight will be the same as 
		// captureWidth and captureHeight (ritzalam 05/27/2010)
		Dimension screenDim = new Dimension(ssi.scaleWidth, ssi.scaleHeight);
		Dimension tileDim = new Dimension(blockWidth, blockHeight);
		blockManager = new BlockManager();		
		blockManager.initialize(screenDim, tileDim);
		
		sender = new NetworkStreamSender(blockManager, ssi.host, ssi.port, ssi.room, screenDim, tileDim, ssi.httpTunnel);
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
	
	/*****************************************************************************
    ;  disconnectSharing
    ;----------------------------------------------------------------------------
	; DESCRIPTION
	;   This routine is used to stop the screen capture, change desktop 
	;   sharing system icon tray message.
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
		System.out.println("Desktop Sharing v0.8");
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

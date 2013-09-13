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

import java.awt.*;
import java.awt.event.*;

public class DeskshareSystemTray {
	private SystemTrayListener listener;
	private TrayIcon trayIcon = null;
	private SystemTray tray = null;
	
	public void addSystemTrayListener(SystemTrayListener l) {
		listener = l;
	}
	
	public void displayIconOnSystemTray(final Image image, final boolean enableActions) {
		Runnable runner = new Runnable() {
			public void run() {
				if (SystemTray.isSupported()) {
					tray = SystemTray.getSystemTray();
		          
					PopupMenu popup = new PopupMenu();
					trayIcon = new TrayIcon(image, "Sharing Desktop", popup);		          

					if (enableActions) {
						MenuItem stopItem = new MenuItem("Stop Sharing");
						stopItem.addActionListener(new StopSharingListener(
								trayIcon, "Stop Desktop Sharing", "Stop sharing your desktop", TrayIcon.MessageType.INFO));
						popup.add(stopItem);						
					}

		          
					try {
						tray.add(trayIcon);
						trayIcon.displayMessage("Sharing Desktop", "You are now sharing your desktop", TrayIcon.MessageType.INFO);
					} catch (AWTException e) {
						System.err.println("Can't add to tray");
					}
				} else {
					System.err.println("Tray unavailable");
				}
			}
		};
		EventQueue.invokeLater(runner);
	}
	
	/*****************************************************************************
    ;  disconnectIconSystemTrayMessage
    ;----------------------------------------------------------------------------
	; DESCRIPTION
	;   This routine is used to change icon system tray message string 
	;   to disconnect.
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
	public void disconnectIconSystemTrayMessage(){
		trayIcon.setToolTip("Disconnected");
		trayIcon.displayMessage("Deskshare Disconnected" , 
				                "You're disconnected from desktop sharing", 
				                TrayIcon.MessageType.ERROR);
	} // END FUNCTION disconnectIconSystemTrayMessage
	
    public void removeIconFromSystemTray() {
    	if (tray != null && trayIcon != null) {
    		tray.remove(trayIcon);
    	}
    }
    
	class StopSharingListener implements ActionListener {
		TrayIcon trayIcon;
		String title;
		String message;
		TrayIcon.MessageType messageType;
		    
		StopSharingListener(TrayIcon trayIcon, String title,
		        String message, TrayIcon.MessageType messageType) {
			this.trayIcon = trayIcon;
			this.title = title;
			this.message = message;
			this.messageType = messageType;
		}
		    
		public void actionPerformed(ActionEvent e) {
			trayIcon.displayMessage(title, message, messageType);
			if (listener != null) {
				listener.onStopSharingSysTrayMenuClicked();
			}
		}
	}

}

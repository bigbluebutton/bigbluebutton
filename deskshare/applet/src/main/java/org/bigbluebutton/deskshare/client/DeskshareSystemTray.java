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
					trayIcon = new TrayIcon(image, "Sharing Deskstop", popup);		          

					if (enableActions) {
						MenuItem stopItem = new MenuItem("Stop Sharing");
						stopItem.addActionListener(new StopSharingListener(
								trayIcon, "Stop Desktop Sharing", "Stop sharing your desktop", TrayIcon.MessageType.INFO));
						popup.add(stopItem);						
					}

		          
					try {
						tray.add(trayIcon);
						trayIcon.displayMessage("Sharing Desktop", "You are now sharing your dekstop", TrayIcon.MessageType.INFO);
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

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
import java.awt.Image;

public class DeskShareApplet extends Applet implements ClientListener {
	private static final long serialVersionUID = 1L;

	String hostValue = "localhost";
    Integer portValue = new Integer(9123);
    String roomValue = "85115";
    Integer widthValue = new Integer(800);
    Integer heightValue = new Integer(600);
    Integer xValue = new Integer(0);
    Integer yValue = new Integer(0);
    Boolean tunnelValue = true;
    DeskshareClient client;
    Image icon;
    
	public void init() {
		hostValue = getParameter("IP");
		String port = getParameter("PORT");
		if (port != null) portValue = Integer.parseInt(port);
		roomValue = getParameter("ROOM");
		widthValue = Integer.parseInt(getParameter("CAPTURE_WIDTH"));
		heightValue = Integer.parseInt(getParameter("CAPTURE_HEIGHT"));				
		xValue = Integer.parseInt(getParameter("X"));
		yValue = Integer.parseInt(getParameter("Y"));
		String tunnel = getParameter("HTTP_TUNNEL");
		if (tunnel != null) tunnelValue = Boolean.parseBoolean(tunnel);
		icon = getImage(getCodeBase(), "bbb.gif");
	}
		
	public void start() {		 
		System.out.println("Start");	
		client = new DeskshareClient.Builder().host(hostValue).port(portValue)
								.room(roomValue).width(widthValue)
								.height(heightValue).x(xValue).y(yValue)
								.httpTunnel(tunnelValue).trayIcon(icon).enableTrayIconActions(false).build();
		client.start();
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
		client.stop();			
	}
	
	public void onClientStop(ExitCode reason) {
		stop();
	}
}

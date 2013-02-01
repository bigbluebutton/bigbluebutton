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

import java.net.*;
import java.io.*;

public class LifeLine {

	private int port;
	private ServerSocket serverSocket = null;
	private Socket clientSocket = null;
	private boolean connected = false;
	private PrintWriter out = null;
    private BufferedReader in = null;
    private LifeLineListener listener = null;
    private Thread lifeLineThread;
    private LifeLineServer lifeLineServer;
    
	public LifeLine(int port, LifeLineListener listener) {
		this.port = port;
		this.listener = listener;
	}
	
	public void listen() {
		
		lifeLineServer = new LifeLineServer();
		lifeLineThread = new Thread(lifeLineServer, "LifeLineServer");
		lifeLineThread.start();       
	}
		
	public void disconnect() {	
		lifeLineServer.close();
	}
	
	private void notifyListener(ExitCode reason) {
		if (listener != null) listener.disconnected(reason);
	}
	
	private class LifeLineServer implements Runnable {		
		@Override
		public void run() {
			 try {
		            serverSocket = new ServerSocket();
		            serverSocket.bind(new InetSocketAddress("127.0.0.1", port));
		        } catch (IOException e) {
		            System.err.println("Could not listen on port: " + port);
		            notifyListener(ExitCode.CANNOT_BIND_TO_LIFELINE_PORT);
		        }
		        
		        try {
		        	System.out.println("Starting listener on [" + serverSocket.getInetAddress() + ":" + port + "]");
		            clientSocket = serverSocket.accept();
		            clientSocket.setKeepAlive(true);
		            out = new PrintWriter(clientSocket.getOutputStream(), true);
		            in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
		            String inputLine;
		            connected = true;
		            while ((inputLine = in.readLine()) != null) {
		            	// do nothing
		            }           
		        } catch (IOException e) {
		        	System.out.println("IOException listener");
		            System.err.println("Accept failed.");
		            notifyListener(ExitCode.ERROR_ON_LIFELINE_CONNECTION);
		        }
		        close();       
				System.out.println("Stopped listener");	
				notifyListener(ExitCode.LIFELINE_CONNECTION_CLOSED);
		}
		
		public void close() {
			try {
				if (out != null) out.close();
	            if (in != null) in.close();		       
		        if (clientSocket != null) clientSocket.close();
				if (serverSocket != null) serverSocket.close();	
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		
	}
}

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
		System.out.println("Starting listener on port " + port);
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
		            serverSocket = new ServerSocket(port);
		        } catch (IOException e) {
		            System.err.println("Could not listen on port: " + port);
		            notifyListener(ExitCode.CANNOT_BIND_TO_LIFELINE_PORT);
		        }
		        
		        try {
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

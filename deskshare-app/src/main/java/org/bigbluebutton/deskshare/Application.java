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
package org.bigbluebutton.deskshare;

import java.util.List;

import org.red5.logging.Red5LoggerFactory;
import org.red5.server.adapter.MultiThreadedApplicationAdapter;
import org.red5.server.api.IBandwidthConfigure;
import org.red5.server.api.IConnection;
import org.red5.server.api.IScope;
import org.red5.server.api.Red5;
import org.red5.server.api.stream.IServerStream;
import org.red5.server.api.stream.IStreamCapableConnection;
import org.red5.server.api.stream.support.SimpleConnectionBWConfig;

import org.slf4j.Logger;

/**
 * The Application class is the main class of the deskShare server side
 * @author Snap
 *
 */
public class Application extends MultiThreadedApplicationAdapter {
	private static Logger log = Red5LoggerFactory.getLogger(Application.class, "deskshare");
	
	private IScope appScope;
	private IServerStream serverStream;
	
	private ClientProxy clientProxy;
	
	{
		log.info("deskShare created");
		System.out.println("deskShare created");
	}
	
	public void init(){
		
	}
	
	/**
	 * Runs when the application is first started. Sets up relevant objects to listen to the deskShare client
	 * and publish the stream on red5
	 */
	public boolean appStart(IScope app){
		log.info("deskShare appStart");
		System.out.println("deskShare appStart");
		this.appScope = app;
		
		clientProxy = new ClientProxy(this);
		Thread clientThread = new Thread(clientProxy);
		clientThread.start();
		
		return true;
	}
	
	public boolean appConnect(IConnection conn, Object[] params){
		log.info("deskShare appConnect to scope " + conn.getScope().getContext().toString());
		System.out.println("deskShare appConnect to scope " + conn.getScope().getContextPath());
		measureBandwidth(conn);
		
		if (conn instanceof IStreamCapableConnection){
			IStreamCapableConnection streamConn = (IStreamCapableConnection) conn;
			SimpleConnectionBWConfig bwConfig = new SimpleConnectionBWConfig();
			bwConfig.getChannelBandwidth()[IBandwidthConfigure.OVERALL_CHANNEL] =
				1024*1024;
			bwConfig.getChannelInitialBurst()[IBandwidthConfigure.OVERALL_CHANNEL] =
				128*1024;
			streamConn.setBandwidthConfigure(bwConfig);
		}
		
		return super.appConnect(conn, params);
	}
	
	public void appDisconnect(IConnection conn){
		log.info("deskShare appDisconnect");
		if (getAppScope() == conn.getScope() && serverStream != null){
			serverStream.close();
		}
		super.appDisconnect(conn);
	}
	
	public List<String> getStreams(){
		IConnection conn = Red5.getConnectionLocal();
		return getBroadcastStreamNames(conn.getScope());
	}
	
	public boolean checkIfStreamIsPublishing(){
		String roomName = Red5.getConnectionLocal().getScope().getName();
		return clientProxy.isStreaming(roomName);
	}
	
	public int getVideoWidth(){
		String roomName = Red5.getConnectionLocal().getScope().getName();
		return clientProxy.getRoomVideoWidth(roomName);
	}
	
	public int getVideoHeight(){
		String roomName = Red5.getConnectionLocal().getScope().getName();
		return clientProxy.getRoomVideoHeight(roomName);
	}

	/**
	 * @return the appScope
	 */
	public IScope getAppScope() {
		return appScope;
	}
	
	/**
	 * Called when the application is stopped
	 */
	public void appStop(){
		clientProxy.closeSockets();
	}
	
}

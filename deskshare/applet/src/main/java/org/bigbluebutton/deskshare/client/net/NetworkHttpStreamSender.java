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
package org.bigbluebutton.deskshare.client.net;

import java.awt.Point;
import java.io.ByteArrayInputStream;
import java.io.IOException;

import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;

import org.bigbluebutton.deskshare.client.ExitCode;
import org.bigbluebutton.deskshare.common.CaptureEvents;
import org.bigbluebutton.deskshare.common.Dimension;

import com.myjavatools.web.ClientHttpRequest;

public class NetworkHttpStreamSender implements Runnable {
	private String host = "localhost";
	private static final String SCREEN_CAPTURE__URL = "/deskshare/tunnel/screenCapture";
	private URL url;
	URLConnection conn;
	private String room;
	private Dimension screenDim;
	private Dimension blockDim;
	private final NextBlockRetriever retriever;
	private volatile boolean processBlocks = false;
	private final int id;
	private NetworkStreamListener listener;
	
	public NetworkHttpStreamSender(int id, NextBlockRetriever retriever, String room, Dimension screenDim, Dimension blockDim) {
		this.id = id;
		this.retriever = retriever;
		this.room = room;
		this.screenDim = screenDim;
		this.blockDim = blockDim;
	}
	
	public void addListener(NetworkStreamListener listener) {
		this.listener = listener;
	}
	
	private void notifyNetworkStreamListener(ExitCode reason) {
		if (listener != null) listener.networkException(id,reason);
	}
	
	public void connect(String host) throws ConnectionException {
		this.host = host;
		System.out.println("Starting NetworkHttpStreamSender to " + host);
		openConnection();
	}

	private void openConnection() throws ConnectionException {
		/**
		 * Need to re-establish connection each time, otherwise, 
		 * we get java.net.ProtocolException: Cannot write output after reading input.
		 * 
		 * http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4382944
		 * 
		 */				
		try {			
			url = new URL("http://" + host + SCREEN_CAPTURE__URL);
			conn = url.openConnection();
		} catch (MalformedURLException e) {
			e.printStackTrace();
			throw new ConnectionException("MalformedURLException " + url.toString());
		} catch (IOException e) {
			e.printStackTrace();
			throw new ConnectionException("IOException while connecting to " + url.toString());
		}
	}
	
	public void sendStartStreamMessage() {
		try {
			openConnection();
			sendCaptureStartEvent(screenDim, blockDim);
		} catch (ConnectionException e) {
			e.printStackTrace();
			notifyNetworkStreamListener(ExitCode.DESKSHARE_SERVICE_UNAVAILABLE);
		}
	}

	private void sendCaptureStartEvent(Dimension screen, Dimension block) throws ConnectionException {
		ClientHttpRequest chr;
		try {
			chr = new ClientHttpRequest(conn);
			chr.setParameter("room", room);
			
			String screenInfo = Integer.toString(screen.getWidth())
								+ "x" + Integer.toString(screen.getHeight());

			chr.setParameter("screenInfo", screenInfo);
			
			String blockInfo = Integer.toString(block.getWidth())
								+ "x" + Integer.toString(block.getHeight());

			chr.setParameter("blockInfo", blockInfo);

			chr.setParameter("event", CaptureEvents.CAPTURE_START.getEvent());
			chr.post();
		} catch (IOException e) {
			e.printStackTrace();
			throw new ConnectionException("IOException while sending capture start event.");
		}

	}
	
	public void disconnect() throws ConnectionException {
		try {
			openConnection();
			sendCaptureEndEvent();
		} catch (ConnectionException e) {
			e.printStackTrace();
			notifyNetworkStreamListener(ExitCode.DESKSHARE_SERVICE_UNAVAILABLE);
			throw e;
			
		} finally {
			processBlocks = false;
		}
	}

	private void sendCaptureEndEvent() throws ConnectionException {
		ClientHttpRequest chr;
		try {
			chr = new ClientHttpRequest(conn);
			chr.setParameter("room", room);
			
			chr.setParameter("event", CaptureEvents.CAPTURE_END.getEvent());
			chr.post();
		} catch (IOException e) {
			e.printStackTrace();
			throw new ConnectionException("IOException while sending capture end event.");
		}
	}
	
	private void processNextMessageToSend(Message message) {
		if (message.getMessageType() == Message.MessageType.BLOCK) {
			EncodedBlockData block = retriever.getBlockToSend(((BlockMessage)message).getPosition());
			BlockVideoData	bv = new BlockVideoData(room, block.getPosition(), block.getVideoData(), false /* should remove later */);									
			sendBlockData(bv);
		} else if (message.getMessageType() == Message.MessageType.CURSOR) {
			CursorMessage msg = (CursorMessage)message;
			sendCursor(msg.getMouseLocation(), msg.getRoom());
		}
	}
	
	public void run() {
		processBlocks = true;
		
		while (processBlocks) {
			Message message;
			try {
				message = retriever.getNextMessageToSend();
				processNextMessageToSend(message);
			} catch (InterruptedException e) {
				e.printStackTrace();
				notifyNetworkStreamListener(ExitCode.DESKSHARE_SERVICE_UNAVAILABLE);
				processBlocks = false;
			}								
		}
	}
	
	private void sendCursor(Point mouseLoc, String room) {
		ClientHttpRequest chr;
		try {
			openConnection();
			chr = new ClientHttpRequest(conn);
			chr.setParameter("room", room);
			chr.setParameter("event", CaptureEvents.MOUSE_LOCATION_EVENT.getEvent());
			chr.setParameter("mousex", mouseLoc.x);
			chr.setParameter("mousey", mouseLoc.y);
			chr.post();		
			} catch (IOException e) {
				e.printStackTrace();
			} catch (ConnectionException e) {
				System.out.println("ERROR: Failed to send block data.");
			}
	}
	
	private void sendBlockData(BlockVideoData blockData) {
	    ClientHttpRequest chr;
		try {
			openConnection();
			chr = new ClientHttpRequest(conn);
		    chr.setParameter("room", blockData.getRoom());
		    chr.setParameter("position", blockData.getPosition());
		    chr.setParameter("keyframe", blockData.isKeyFrame());
		    chr.setParameter("event", CaptureEvents.CAPTURE_UPDATE.getEvent());
			ByteArrayInputStream block = new ByteArrayInputStream(blockData.getVideoData());				
			chr.setParameter("blockdata", "block", block);
			chr.post();		
		} catch (IOException e) {
			e.printStackTrace();
		} catch (ConnectionException e) {
			System.out.println("ERROR: Failed to send block data.");
		}
	}		
}

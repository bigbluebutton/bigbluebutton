/** 
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
**/
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
	private static final String SEQ_NUM = "sequenceNumber";
	private static final String ROOM = "room";
	private static final String BLOCK = "blockInfo";
	private static final String EVENT = "event";
	private static final String SCREEN = "screenInfo";
	private static final String POSITION = "position";
	private static final String KEYFRAME = "keyframe";
	private static final String BLOCKDATA = "blockdata";
	private static final String MOUSEX = "mousex";
	private static final String MOUSEY = "mousey";
	
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
	private final SequenceNumberGenerator seqNumGenerator;
	
	public NetworkHttpStreamSender(int id, NextBlockRetriever retriever, String room, 
									Dimension screenDim, Dimension blockDim, SequenceNumberGenerator seqNumGenerator) {
		this.id = id;
		this.retriever = retriever;
		this.room = room;
		this.screenDim = screenDim;
		this.blockDim = blockDim;
		this.seqNumGenerator = seqNumGenerator;
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
		long start = System.currentTimeMillis();
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
		long end = System.currentTimeMillis();
		System.out.println("Http[" + id + "] Open connection took [" + (end-start) + " ms]");
	}
	
	public void sendStartStreamMessage() {
		try {
			System.out.println("Http[" + id + "] Open connection. In sendStartStreamMessage");
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
			chr.setParameter(ROOM, room);			
			chr.setParameter(SEQ_NUM, seqNumGenerator.getNext());
			String screenInfo = Integer.toString(screen.getWidth()) + "x" + Integer.toString(screen.getHeight());
			chr.setParameter(SCREEN, screenInfo);			
			String blockInfo = Integer.toString(block.getWidth()) + "x" + Integer.toString(block.getHeight());
			chr.setParameter(BLOCK, blockInfo);
			chr.setParameter(EVENT, CaptureEvents.CAPTURE_START.getEvent());
			chr.post();
		} catch (IOException e) {
			e.printStackTrace();
			throw new ConnectionException("IOException while sending capture start event.");
		}

	}
	
	public void disconnect() throws ConnectionException {
		try {
			System.out.println("Http[" + id + "] Open connection. In disconnect");
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
			chr.setParameter(ROOM, room);
			chr.setParameter(SEQ_NUM, seqNumGenerator.getNext());
			chr.setParameter(EVENT, CaptureEvents.CAPTURE_END.getEvent());
			chr.post();
		} catch (IOException e) {
			e.printStackTrace();
			throw new ConnectionException("IOException while sending capture end event.");
		}
	}
	
	private void processNextMessageToSend(Message message) {
		if (message.getMessageType() == Message.MessageType.BLOCK) {	
			long start = System.currentTimeMillis();
			Integer[] changedBlocks = ((BlockMessage)message).getBlocks();
			String blockSize = "Http[" + id + "] Block length [";
			String encodeTime = "Http[" + id + "]Encode times [";
			long encStart = 0;
			long encEnd = 0;
			int totalBytes = 0;
			long totalMillis = 0;
			for (int i = 0; i < changedBlocks.length; i++) {
				encStart = System.currentTimeMillis();
				EncodedBlockData block = retriever.getBlockToSend((Integer)changedBlocks[i]);
				totalBytes += block.getVideoData().length;
				blockSize += block.getVideoData().length + ",";
				encEnd = System.currentTimeMillis();
				totalMillis += (encEnd - encStart);
				encodeTime += (encEnd - encStart) + ",";
				BlockVideoData	bv = new BlockVideoData(room, block.getPosition(), block.getVideoData(), false /* should remove later */);	
				sendBlockData(bv);
			}
			System.out.println(blockSize + "] total=" + totalBytes + " bytes");
			System.out.println(encodeTime + "] total=" + totalMillis + " ms");
			for (int i = 0; i< changedBlocks.length; i++) {
				retriever.blockSent((Integer)changedBlocks[i]);
			}
			long end = System.currentTimeMillis();
			System.out.println("[HTTP " + id + "] Sending " + changedBlocks.length + " blocks took " + (end - start) + " millis");
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
			System.out.println("Http[" + id + "] Open connection. In sendCursor");
			openConnection();
			chr = new ClientHttpRequest(conn);
			chr.setParameter(ROOM, room);
			chr.setParameter(SEQ_NUM, seqNumGenerator.getNext());
			chr.setParameter(EVENT, CaptureEvents.MOUSE_LOCATION_EVENT.getEvent());
			chr.setParameter(MOUSEX, mouseLoc.x);
			chr.setParameter(MOUSEY, mouseLoc.y);
			chr.post();		
			} catch (IOException e) {
				e.printStackTrace();
			} catch (ConnectionException e) {
				System.out.println("ERROR: Failed to send block data.");
			}
	}
	
	private void sendBlockData(BlockVideoData blockData) {
		long start = System.currentTimeMillis();
	    ClientHttpRequest chr;
		try {
			System.out.println("Http[" + id + "] Open connection. In sendBlockData");
			openConnection();
			chr = new ClientHttpRequest(conn);
		    chr.setParameter(ROOM, blockData.getRoom());
		    chr.setParameter(SEQ_NUM, seqNumGenerator.getNext());
		    chr.setParameter(POSITION, blockData.getPosition());
		    chr.setParameter(KEYFRAME, blockData.isKeyFrame());
		    chr.setParameter(EVENT, CaptureEvents.CAPTURE_UPDATE.getEvent());
			ByteArrayInputStream block = new ByteArrayInputStream(blockData.getVideoData());				
			chr.setParameter(BLOCKDATA, "block", block);
			chr.post();		
		} catch (IOException e) {
			e.printStackTrace();
		} catch (ConnectionException e) {
			System.out.println("ERROR: Failed to send block data.");
		}
		long end = System.currentTimeMillis();
		System.out.println("[HTTP " + id + "] Sending " + blockData.getVideoData().length + " bytes took " + (end - start) + " ms");
	}		
}

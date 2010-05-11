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
import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.net.Socket;
import java.net.UnknownHostException;
import org.bigbluebutton.deskshare.common.Dimension;

public class NetworkSocketStreamSender implements Runnable {
	private static final int PORT = 9123;
	
	private Socket socket = null;
	
	private DataOutputStream outstream = null;
	private String room;
	private Dimension screenDim;
	private Dimension blockDim;
	private final NextBlockRetriever retriever;
	private volatile boolean processBlocks = false;
	 
	public NetworkSocketStreamSender(NextBlockRetriever retriever, String room, Dimension screenDim, Dimension blockDim) {
		this.retriever = retriever;
		this.room = room;
		this.screenDim = screenDim;
		this.blockDim = blockDim;
	
	}
	
	public void connect(String host) throws ConnectionException {
		System.out.println("Starting NetworkSocketStreamSender ");
		try {
			socket = new Socket(host, PORT);
			outstream = new DataOutputStream(socket.getOutputStream());
		} catch (UnknownHostException e) {
			e.printStackTrace();
			throw new ConnectionException("UnknownHostException: " + host);
		} catch (IOException e) {
			e.printStackTrace();
			throw new ConnectionException("IOException: " + host + ":" + PORT);
		}
	}
	
	public void sendStartStreamMessage() {		
		try {
			ByteArrayOutputStream dataToSend = new ByteArrayOutputStream();
			dataToSend.reset();
			BlockStreamProtocolEncoder.encodeStartStreamMessage(room, screenDim, blockDim, dataToSend);
			sendHeader(BlockStreamProtocolEncoder.encodeHeaderAndLength(dataToSend));
			sendToStream(dataToSend);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	private void sendCursor(Point mouseLoc, String room) {
		try {
			ByteArrayOutputStream dataToSend = new ByteArrayOutputStream();
			dataToSend.reset();
			BlockStreamProtocolEncoder.encodeMouseLocation(mouseLoc, room, dataToSend);
			sendHeader(BlockStreamProtocolEncoder.encodeHeaderAndLength(dataToSend));
			sendToStream(dataToSend);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	private void sendBlock(BlockVideoData block) {
		long start = System.currentTimeMillis();
		try {
			ByteArrayOutputStream dataToSend = new ByteArrayOutputStream();
			dataToSend.reset();
			BlockStreamProtocolEncoder.encodeBlock(block, dataToSend);
			sendHeader(BlockStreamProtocolEncoder.encodeHeaderAndLength(dataToSend));
			sendToStream(dataToSend);
			long end = System.currentTimeMillis();
//			if ((end - start) > 200)
//				System.out.println("Sending " + dataToSend.size() + " bytes took " + (end - start) + "ms");
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	private void sendHeader(byte[] header) throws IOException {
		if (outstream != null) outstream.write(header);
	}
	
	private void sendToStream(ByteArrayOutputStream dataToSend) throws IOException {
		if (outstream != null) dataToSend.writeTo(outstream);
	}
	
		
	public void disconnect() throws ConnectionException {
		System.out.println("Disconnecting socket stream");
		try {
			ByteArrayOutputStream dataToSend = new ByteArrayOutputStream();
			dataToSend.reset();
			BlockStreamProtocolEncoder.encodeEndStreamMessage(room, dataToSend);
			sendHeader(BlockStreamProtocolEncoder.encodeHeaderAndLength(dataToSend));
			sendToStream(dataToSend);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} finally {
			processBlocks = false;
		}
	}
	
	private void processNextMessageToSend(Message message) {
		if (message.getMessageType() == Message.MessageType.BLOCK) {
			EncodedBlockData block = retriever.getBlockToSend(((BlockMessage)message).getPosition());
			BlockVideoData	bv = new BlockVideoData(room, block.getPosition(), block.getVideoData(), false /* should remove later */);									
			sendBlock(bv);
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
				// TODO Auto-generated catch block
				e.printStackTrace();
			}							
		}
		
		try {
			outstream.close();
			outstream = null;
			socket.close();		
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}

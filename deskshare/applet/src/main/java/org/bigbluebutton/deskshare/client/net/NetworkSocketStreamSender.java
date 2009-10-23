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

import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.net.Socket;
import java.net.UnknownHostException;

import org.bigbluebutton.deskshare.client.blocks.Block;
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
	
	public NetworkSocketStreamSender(NextBlockRetriever retriever) {
		this.retriever = retriever;
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
	
	public void sendStartStreamMessage(String room, Dimension screen, Dimension block) {
		this.room = room;
		screenDim = screen;
		blockDim = block;
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
	
	private void sendBlock(BlockVideoData block) {
		long start = System.currentTimeMillis();
		try {
			ByteArrayOutputStream dataToSend = new ByteArrayOutputStream();
			dataToSend.reset();
			BlockStreamProtocolEncoder.encodeBlock(block, dataToSend);
			sendHeader(BlockStreamProtocolEncoder.encodeHeaderAndLength(dataToSend));
			sendToStream(dataToSend);
			long end = System.currentTimeMillis();
			if ((end - start) > 200)
				System.out.println("Sending " + dataToSend.size() + " bytes took " + (end - start) + "ms");
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}
	
	private void sendHeader(byte[] header) throws IOException {
		outstream.write(header);
	}
	
	private void sendToStream(ByteArrayOutputStream dataToSend) throws IOException {
		dataToSend.writeTo(outstream);
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

	public void run() {
		processBlocks = true;		
		while (processBlocks) {
			Block block = retriever.fetchNextBlockToSend();
			EncodedBlockData ebd = block.encode();
			if (ebd.hasChanged()) {					
				BlockVideoData	bv = new BlockVideoData(room, ebd.getPosition(), ebd.getVideoData(), ebd.isKeyFrame());	
				sendBlock(bv);
			}						
		}

	}
}

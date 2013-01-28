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
package org.bigbluebutton.deskshare.client.net;

import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.net.Socket;
import java.net.UnknownHostException;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;

import org.bigbluebutton.deskshare.client.blocks.Block;
import org.bigbluebutton.deskshare.client.blocks.BlockManager;
import org.bigbluebutton.deskshare.common.Dimension;

public class BlockStreamSender implements ScreenCaptureSender {
	private static final int PORT = 9123;
	
	private Socket socket = null;
	
	private DataOutputStream outStream = null;
	private String room;
	
	private BlockingQueue<BlockVideoData> screenQ = new LinkedBlockingQueue<BlockVideoData>(500);
	private final Executor exec = Executors.newSingleThreadExecutor();
	private Runnable capturedScreenSender;
	private volatile boolean sendCapturedScreen = false;
	
	private BlockManager blockManager;

	private ByteArrayOutputStream dataToSend;
	
	private static final byte[] HEADER = new byte[] {'B', 'B', 'B', '-', 'D', 'S'}; 
    private static final byte CAPTURE_START_EVENT = 0;
    private static final byte CAPTURE_UPDATE_EVENT = 1;
    private static final byte CAPTURE_END_EVENT = 2;
    
	public BlockStreamSender(BlockManager blockManager) {
		this.blockManager = blockManager;
		dataToSend = new ByteArrayOutputStream();
	}
	
	public void connect(String host, String room, int width, int height) throws ConnectionException {
		this.room = room;
		
		System.out.println("Starting capturedScreenSender ");
		try {
			socket = new Socket(host, PORT);
			outStream = new DataOutputStream(socket.getOutputStream());
			sendStartStreamMessage(room, blockManager.getScreenDim(), blockManager.getBlockDim());
			outStream.flush();
		} catch (UnknownHostException e) {
			e.printStackTrace();
			throw new ConnectionException("UnknownHostException: " + host);
		} catch (IOException e) {
			e.printStackTrace();
			throw new ConnectionException("IOException: " + host + ":" + PORT);
		}
						
		sendCapturedScreen = true;
		capturedScreenSender = new Runnable() {
			public void run() {
				while (sendCapturedScreen) {
					try {
						BlockVideoData block = screenQ.take();
						
//						long now = System.currentTimeMillis();
//						if ((now - block.getTimestamp()) < 500) {
							sendBlock(block);
//							if (screenQ.size() == 500) screenQ.clear();
//						} else {
//							System.out.println("Discarding stale block.");
//						}
					} catch (InterruptedException e) {
						System.out.println("InterruptedExeption while taking event.");
					}
				}
			}
		};
		exec.execute(capturedScreenSender);	
	}
	
	private void sendStartStreamMessage(String room, Dimension screen, Dimension block) {
		dataToSend.reset();
		
		try {
			dataToSend.write(CAPTURE_START_EVENT);
			dataToSend.write(room.length());
			dataToSend.write(room.getBytes());		
			dataToSend.write(intToByte(block.getWidth()));
			dataToSend.write(intToByte(block.getHeight()));
			dataToSend.write(intToByte(screen.getWidth()));
			dataToSend.write(intToByte(screen.getHeight()));
			sendToStream(dataToSend);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	private void sendBlock(BlockVideoData block) {
		long start = System.currentTimeMillis();
		dataToSend.reset();
		try {
			dataToSend.write(CAPTURE_UPDATE_EVENT);
			dataToSend.write(block.getRoom().length());
			dataToSend.write(block.getRoom().getBytes());
			
			byte[] position = new byte[2];
			int pos = block.getPosition();
			position[0] = (byte)((pos >> 8) & 0xff);
			position[1] = (byte)(pos & 0xff);
			
			dataToSend.write(position);
			dataToSend.write(block.isKeyFrame() ? 1:0);
			
			int length = block.getVideoData().length;			
//			System.out.println("position=" + pos + " keyframe=" + block.isKeyFrame() + " data length=" + length);
			dataToSend.write(intToByte(length));
			
			dataToSend.write(block.getVideoData());	
			sendToStream(dataToSend);
		} catch (IOException e) {
			e.printStackTrace();
		}		
		long end = System.currentTimeMillis();
		if ((end - start) > 200) {
			System.out.println("Sending " + dataToSend.size() + " bytes took " + (end-start) + " ms.");
		}
	}
	
	private byte[] intToByte(int i) {
		byte[] data = new byte[4];
		data[0] = (byte)((i >> 24) & 0xff);
		data[1] = (byte)((i >> 16) & 0xff);
		data[2] = (byte)((i >> 8) & 0xff);
		data[3] = (byte)(i & 0xff);		
		return data;
	}
	
	private void sendToStream(ByteArrayOutputStream data) throws IOException {
//		System.out.println("Sending length " + data.size());
		outStream.write(HEADER);
		outStream.writeInt(data.size());
		//outStream.write(data.toByteArray());
		data.writeTo(outStream);
	}
	
	public void send(ByteArrayOutputStream videoData, boolean isKeyFrame) throws ConnectionException {
		int totalBlocks = blockManager.getColumnCount() * blockManager.getRowCount();
		for (int i = 1; i <= totalBlocks; i++) {
				Block block = blockManager.getBlock(i);
//				if (block.getEncodedBlock().length < 5) continue;
//				BlockVideoData blockData = new BlockVideoData(room, block.getPosition(), block.getEncodedBlock(), block.isKeyFrame());
//				try {
//					screenQ.put(blockData);
//				} catch (InterruptedException e) {
//					e.printStackTrace();
//				}
		}
	}

	public void disconnect() throws ConnectionException {
		System.out.println("Closing connection.");
		sendCapturedScreen = false;

		dataToSend.reset();
		try {
			dataToSend.write(CAPTURE_END_EVENT);
			dataToSend.write(room.length());
			dataToSend.write(room.getBytes());
			sendToStream(dataToSend);
		} catch (IOException e) {
			e.printStackTrace();
		}	
	}
}

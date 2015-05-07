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

import java.awt.Point;
import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.net.Socket;
import java.net.UnknownHostException;
import java.util.Vector;
import org.bigbluebutton.deskshare.client.ExitCode;
import org.bigbluebutton.deskshare.common.Dimension;

import javax.net.ssl.SSLSocket;
import javax.net.ssl.SSLSocketFactory;

public class NetworkSocketStreamSender implements Runnable {
	private Socket socket = null;
	
	private DataOutputStream outstream = null;
	private String room;
	private Dimension screenDim;
	private Dimension blockDim;
	private boolean useSVC2;
	private final NextBlockRetriever retriever;
	private volatile boolean processMessages = false;
	private final int id;
	private NetworkStreamListener listener;
	private final SequenceNumberGenerator seqNumGenerator;
	
	private SSLSocket sslSocket = null;
	private SSLSocketFactory sslSocketFactory = null ;
	
	private Boolean useTLS = false;
	
	public NetworkSocketStreamSender(int id, NextBlockRetriever retriever, String room, 
			Dimension screenDim, Dimension blockDim, SequenceNumberGenerator seqNumGenerator, boolean useSVC2) {
		this.id = id;
		this.retriever = retriever;
		this.room = room;
		this.screenDim = screenDim;
		this.blockDim = blockDim;	
		this.seqNumGenerator = seqNumGenerator;
		this.useSVC2 = useSVC2;
	}
	
	public void addListener(NetworkStreamListener listener) {
		this.listener = listener;
	}
	
	private void notifyNetworkStreamListener(ExitCode reason) {
		if (listener != null) listener.networkException(id,reason);
	}
	
	public void connect(String host, int port , boolean useTLS ) throws ConnectionException {
		//We use this value to devie how to create the socket
		this.useTLS = useTLS;
		
		System.out.println("NetworkSocketStreamSender: connecting to " + host + ":" + port);
		try {
			
			//Creating the ssl socket
            //Host and port should point to Stunnel or the TLS terminating service
            //Handling if TLS is enabled or not
            if(useTLS){   
				System.out.println("Connecting over TLS");			
                sslSocketFactory = (SSLSocketFactory) SSLSocketFactory.getDefault();
                sslSocket = (SSLSocket) sslSocketFactory.createSocket(host, port);
                outstream = new DataOutputStream(sslSocket.getOutputStream());
            }
            else{
                //If not use regular socket
                socket = new Socket(host, port);
                outstream = new DataOutputStream(socket.getOutputStream());
            }
		} catch (UnknownHostException e) {
			e.printStackTrace();
			throw new ConnectionException("UnknownHostException: " + host);
		} catch (IOException e) {
			e.printStackTrace();
			throw new ConnectionException("IOException: " + host + ":" + port);
		}
	}
	
	public void sendStartStreamMessage() throws ConnectionException {		
		try {
			ByteArrayOutputStream dataToSend = new ByteArrayOutputStream();
			dataToSend.reset();
			BlockStreamProtocolEncoder.encodeStartStreamMessage(room, screenDim, blockDim, dataToSend, seqNumGenerator.getNext(), useSVC2);
			BlockStreamProtocolEncoder.encodeDelimiter(dataToSend);
			sendHeader(BlockStreamProtocolEncoder.encodeHeaderAndLength(dataToSend));
			sendToStream(dataToSend);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	private void sendCursor(Point mouseLoc, String room) throws IOException {
		ByteArrayOutputStream dataToSend = new ByteArrayOutputStream();
		dataToSend.reset();
		BlockStreamProtocolEncoder.encodeMouseLocation(mouseLoc, room, dataToSend, seqNumGenerator.getNext());
		BlockStreamProtocolEncoder.encodeDelimiter(dataToSend);
		sendHeader(BlockStreamProtocolEncoder.encodeHeaderAndLength(dataToSend));
		sendToStream(dataToSend);
	}
	
	private void sendBlock(BlockVideoData block) throws IOException {
		ByteArrayOutputStream dataToSend = new ByteArrayOutputStream();
		dataToSend.reset();
		BlockStreamProtocolEncoder.encodeBlock(block, dataToSend, seqNumGenerator.getNext());
		sendHeader(BlockStreamProtocolEncoder.encodeHeaderAndLength(dataToSend));
		sendToStream(dataToSend);
	}
	
	private void sendHeader(byte[] header) throws IOException {
		if (outstream != null) outstream.write(header);
	}
	
	private void sendToStream(ByteArrayOutputStream dataToSend) throws IOException {
		if (outstream != null) dataToSend.writeTo(outstream);
	}
			
	public void disconnect() throws ConnectionException {
		System.out.println("Disconnecting socket stream");
		if (!processMessages) return;
	}
	
	private void processNextMessageToSend(Message message) throws IOException {
		if (message.getMessageType() == Message.MessageType.BLOCK) {
			long start = System.currentTimeMillis();
			ByteArrayOutputStream dataToSend = new ByteArrayOutputStream();
			dataToSend.reset();
			BlockStreamProtocolEncoder.encodeRoomAndSequenceNumber(room, seqNumGenerator.getNext(), dataToSend);			
			Integer[] changedBlocks = ((BlockMessage)message).getBlocks();
			BlockStreamProtocolEncoder.numBlocksChanged(changedBlocks.length, dataToSend);
			
			String blockSize = "Block length [";
			String encodeTime = "Encode times [";
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
				BlockStreamProtocolEncoder.encodeBlock(bv, dataToSend);
			}
			
//			System.out.println(blockSize + "] total=" + totalBytes + " bytes");
//			System.out.println(encodeTime + "] total=" + totalMillis + " ms");

			BlockStreamProtocolEncoder.encodeDelimiter(dataToSend);
			sendHeader(BlockStreamProtocolEncoder.encodeHeaderAndLength(dataToSend));
			sendToStream(dataToSend);
			for (int i = 0; i< changedBlocks.length; i++) {
				retriever.blockSent((Integer)changedBlocks[i]);
			}
			long end = System.currentTimeMillis();
//			System.out.println("[Socket Thread " + id + "] Sending " + changedBlocks.length + " blocks took " + (end - start) + " millis");
		} else if (message.getMessageType() == Message.MessageType.CURSOR) {
			CursorMessage msg = (CursorMessage)message;
			sendCursor(msg.getMouseLocation(), msg.getRoom());
		} else if (message.getMessageType() == Message.MessageType.POISON) {
			System.out.println("Received poison message.");
			try {
				ByteArrayOutputStream dataToSend = new ByteArrayOutputStream();
				dataToSend.reset();
				BlockStreamProtocolEncoder.encodeEndStreamMessage(room, dataToSend, seqNumGenerator.getNext());
				BlockStreamProtocolEncoder.encodeDelimiter(dataToSend);
				sendHeader(BlockStreamProtocolEncoder.encodeHeaderAndLength(dataToSend));
				sendToStream(dataToSend);
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} finally {
				processMessages = false;
				System.out.println("Disconnected socket stream");
			}			
		}
	}
	
	public void run() {
		processMessages = true;		
		while (processMessages) {
			Message message;
			try {
				message = retriever.getNextMessageToSend();
				processNextMessageToSend(message);
			} catch (InterruptedException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
				processMessages = false;
				notifyNetworkStreamListener(ExitCode.CONNECTION_TO_DESKSHARE_SERVER_DROPPED);
			}
		}
		
		try {
			outstream.close();
			outstream = null;
			if(this.useTLS){
				sslSocket.close();
			}else{
				socket.close();		
			}
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}

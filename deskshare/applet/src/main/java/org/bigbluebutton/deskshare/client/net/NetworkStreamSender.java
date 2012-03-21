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

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import net.jcip.annotations.ThreadSafe;

import org.bigbluebutton.deskshare.client.ExitCode;
import org.bigbluebutton.deskshare.client.blocks.BlockManager;
import org.bigbluebutton.deskshare.common.Dimension;

@ThreadSafe
public class NetworkStreamSender implements NextBlockRetriever, NetworkStreamListener {	
	public static final String NAME = "NETWORKSTREAMSENDER: ";
	
	private ExecutorService executor;	
    private final BlockingQueue<Message> blockDataQ = new LinkedBlockingQueue<Message>();
    
    private final int numThreads;
    private final String host;
    private final int port;
    private final String room;
    private final boolean httpTunnel;
    private NetworkSocketStreamSender[] socketSenders;
    private NetworkHttpStreamSender[] httpSenders;
    private boolean tunneling = false;
    private boolean stopped = true;
    private int numRunningThreads = 0;
	private Dimension screenDim;
	private Dimension blockDim;
	private BlockManager blockManager;
	private NetworkConnectionListener listener;
	private final SequenceNumberGenerator seqNumGenerator = new SequenceNumberGenerator();
	
	public NetworkStreamSender(BlockManager blockManager, String host, int port,
			String room, Dimension screenDim, Dimension blockDim, boolean httpTunnel) {
		this.blockManager = blockManager;
		this.host = host;
		this.port = port;
		this.room = room;
		this.screenDim = screenDim;
		this.blockDim = blockDim;
		this.httpTunnel = httpTunnel;
		
		numThreads = Runtime.getRuntime().availableProcessors();
		System.out.println(NAME + "Starting up " + numThreads + " sender threads.");
		executor = Executors.newFixedThreadPool(numThreads);
	}
	
	public void addNetworkConnectionListener(NetworkConnectionListener listener) {
		this.listener = listener;
	}
	
	private void notifyNetworkConnectionListener(ExitCode reason) {
		if (listener != null) listener.networkConnectionException(reason);
	}
	
	public boolean connect() {	
		socketSenders = new NetworkSocketStreamSender[numThreads];
		int failedAttempts = 0;
		for (int i = 0; i < numThreads; i++) {
			try {
				createSender(i);
				numRunningThreads++;
			} catch (ConnectionException e) {
				failedAttempts++;
			}
		}
		
		if ((failedAttempts == numThreads) && httpTunnel) {
			System.out.println(NAME + "Trying http tunneling");
			failedAttempts = 0;
			numRunningThreads = 0;
			if (tryHttpTunneling()) {
				tunneling = true;
				System.out.println(NAME + "Will use http tunneling");
				httpSenders = new NetworkHttpStreamSender[numThreads];
				for (int i = 0; i < numThreads; i++) {
					try {
						createHttpSender(i);
						numRunningThreads++;
					} catch (ConnectionException e) {
						failedAttempts++;
					}					
				}
				if (failedAttempts == numThreads) {
					return false;
				} else {
					return true;
				}
			}
		} else {
			if (numRunningThreads != numThreads) {
				try {
					stop();
				} catch (ConnectionException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				return false;
			} else {
				return true;
			}
		}
		System.out.println(NAME + "Http tunneling failed.");
		return false;
	}
	
	private void createSender(int i) throws ConnectionException {
		socketSenders[i] = new NetworkSocketStreamSender(i, this, room, screenDim, blockDim, seqNumGenerator);
		socketSenders[i].addListener(this);
		socketSenders[i].connect(host, port);		
	}
	
	private void createHttpSender(int i) throws ConnectionException {
		httpSenders[i] = new NetworkHttpStreamSender(i, this, room, screenDim, blockDim, seqNumGenerator);
		httpSenders[i].addListener(this);
		httpSenders[i].connect(host);
	}
	
	public void send(Message message) {
		blockDataQ.offer(message);
	}
	
	public void start() {
		System.out.println(NAME + "Starting network sender.");		
		if (tunneling) {
			for (int i = 0; i < numRunningThreads; i++) {
				httpSenders[i].sendStartStreamMessage();
				executor.execute(httpSenders[i]);
			}
		} else {			
			for (int i = 0; i < numRunningThreads; i++) {					
				try {
					socketSenders[i].sendStartStreamMessage();
					executor.execute(socketSenders[i]);
				} catch (ConnectionException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}					
			}
		}

		stopped = false;
	}
	
	private volatile boolean clearQ = true;
	
	public void stop() throws ConnectionException {
		stopped = true;
		System.out.println(NAME + "Stopping network sender");
		for (int i = 0; i < numRunningThreads; i++) {
			if (tunneling) {
				httpSenders[i].disconnect();
			} else {
			//	socketSenders[i].disconnect();
				if (clearQ) {
					clearQ = false;
					blockDataQ.clear();
					
				}
				send(new PoisonMessage());
			}				
		}
		System.out.println("Shutting down executor");
		executor.shutdownNow();
		System.out.println("Shutting down executor [DONE]");
		httpSenders = null;
		socketSenders = null;
		
	}

	private boolean tryHttpTunneling() {
		NetworkHttpStreamSender httpSender = new NetworkHttpStreamSender(0, this, room, screenDim, blockDim, seqNumGenerator);
		try {
			httpSender.connect(host);
			return true;
		} catch (ConnectionException e) {
			System.out.println(NAME + "Problem connecting to " + host);
		}
		return false;
	}
	
	public void blockSent(int position) {
		blockManager.blockSent(position);
	}
	
	public EncodedBlockData getBlockToSend(int position) {		
		return blockManager.getBlock(position).encode();
	}	
	
	public Message getNextMessageToSend() throws InterruptedException {
		try {
			return (Message) blockDataQ.take();			
		} catch (InterruptedException e) {
			if (!stopped)
				e.printStackTrace();
			throw e;
		}
	}

	@Override
	public void networkException(int id, ExitCode reason) {
		try {
			numRunningThreads--;
		
			if (tunneling) {								
//				httpSenders[id].disconnect();
				System.out.println(NAME + "Failed to use http tunneling. Stopping.");
				stop();
				notifyNetworkConnectionListener(reason);
			} else {
				socketSenders[id].disconnect();
			}
			if (numRunningThreads < 1) {
				System.out.println(NAME + "No more sender threads. Stopping.");
				stop();
				notifyNetworkConnectionListener(reason);
			} else {
				System.out.println(NAME + "Sender thread stopped. " + numRunningThreads + " sender threads remaining.");
			}
		} catch (ConnectionException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			if (numRunningThreads < 1) {
				System.out.println(NAME + "No more sender threads. Stopping.");
				notifyNetworkConnectionListener(reason);
			} else {
				System.out.println(NAME + "Sender thread stopped. " + numRunningThreads + " sender threads remaining.");
			}
		}		
	}
	
}

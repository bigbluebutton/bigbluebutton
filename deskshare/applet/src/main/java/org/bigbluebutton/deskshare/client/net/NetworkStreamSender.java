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
		System.out.println("Starting up " + numThreads + " sender threads.");
		executor = Executors.newFixedThreadPool(numThreads);
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
			System.out.println("Trying http tunneling");
			failedAttempts = 0;
			numRunningThreads = 0;
			if (tryHttpTunneling()) {
				tunneling = true;
				System.out.println("Will use http tunneling");
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
		System.out.println("Http tunneling failed.");
		return false;
	}
	
	private void createSender(int i) throws ConnectionException {
		socketSenders[i] = new NetworkSocketStreamSender(i, this, room, screenDim, blockDim);
		socketSenders[i].connect(host, port);		
	}
	
	private void createHttpSender(int i) throws ConnectionException {
		httpSenders[i] = new NetworkHttpStreamSender(i, this, room, screenDim, blockDim);
		httpSenders[i].connect(host);
	}
	
	public void send(Message message) {
		blockDataQ.offer(message);
	}
	
	public void start() {
		System.out.println("Starting network sender.");		
		if (tunneling) {
			for (int i = 0; i < 1; i++) {
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
	
	public void stop() throws ConnectionException {
		System.out.println("Stopping network sender");
		for (int i = 0; i < numRunningThreads; i++) {
			if (tunneling) {
				httpSenders[i].disconnect();
			} else {
				socketSenders[i].disconnect();
			}				
		}
		stopped = true;
		executor.shutdownNow();
		httpSenders = null;
		socketSenders = null;
	}

	private boolean tryHttpTunneling() {
		NetworkHttpStreamSender httpSender = new NetworkHttpStreamSender(0, this, room, screenDim, blockDim);
		try {
			httpSender.connect(host);
			return true;
		} catch (ConnectionException e) {
			System.out.println("Problem connecting to " + host);
		}
		return false;
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
				httpSenders[id].disconnect();				
			} else {
				socketSenders[id].disconnect();
			}
			if (numRunningThreads < 1) stop();
		} catch (ConnectionException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}		
	}
	
}

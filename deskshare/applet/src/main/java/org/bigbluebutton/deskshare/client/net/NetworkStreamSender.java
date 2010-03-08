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

import org.bigbluebutton.deskshare.client.blocks.BlockManager;
import org.bigbluebutton.deskshare.common.Dimension;

@ThreadSafe
public class NetworkStreamSender implements NextBlockRetriever {	
	private ExecutorService executor;	
    private final BlockingQueue<Integer> blockDataQ = new LinkedBlockingQueue<Integer>();
    
    private final int numThreads;
    private final String host;
    private final String room;
    private NetworkSocketStreamSender[] senders;
    private NetworkHttpStreamSender[] httpSenders;
    private boolean tunneling = false;
    private boolean stopped = true;
    private int numRunningThreads = 0;
	private Dimension screenDim;
	private Dimension blockDim;
	private BlockManager blockManager;
	
	public NetworkStreamSender(BlockManager blockManager, String host, String room, Dimension screenDim, Dimension blockDim) {
		this.blockManager = blockManager;
		this.host = host;
		this.room = room;
		this.screenDim = screenDim;
		this.blockDim = blockDim;
		
		numThreads = Runtime.getRuntime().availableProcessors();
		System.out.println("Starting up " + numThreads + " sender threads.");
		executor = Executors.newFixedThreadPool(numThreads);
	}
	
	public boolean connect() {	
		senders = new NetworkSocketStreamSender[numThreads];
		int failedAttempts = 0;
		for (int i = 0; i < numThreads; i++) {
			try {
				createSender(i);
				numRunningThreads++;
			} catch (ConnectionException e) {
				failedAttempts++;
			}
		}
		
		if (failedAttempts == numThreads) {
			System.out.println("Trying http tunneling");
			if (tryHttpTunneling()) {
				tunneling = true;
				httpSenders = new NetworkHttpStreamSender[numThreads];
				return true;
			}
		} else {
			return true;
		}
		System.out.println("Http tunneling failed.");
		return false;
	}
	
	private void createSender(int i) throws ConnectionException {
		senders[i] = new NetworkSocketStreamSender(this, room, screenDim, blockDim);
		senders[i].connect(host);		
	}
	
	public void send(Integer blockPosition) {
		blockDataQ.offer(blockPosition);
	}
	
	public void start() {
		for (int i = 0; i < numRunningThreads; i++) {
			if (tunneling) {
				httpSenders[i].sendStartStreamMessage();
				executor.execute(httpSenders[i]);
			} else {			
				senders[i].sendStartStreamMessage();
				executor.execute(senders[i]);	
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
				senders[i].disconnect();
			}				
		}
		stopped = true;
		executor.shutdownNow();
	}

	private boolean tryHttpTunneling() {
		NetworkHttpStreamSender httpSender = new NetworkHttpStreamSender(this, room, screenDim, blockDim);
		try {
			httpSender.connect(host);
			return true;
		} catch (ConnectionException e) {
			System.out.println("Problem connecting to " + host);
		}
		return false;
	}
	
	public EncodedBlockData fetchNextBlockToSend() {
		Integer position = 1;
		try {
			position = (Integer) blockDataQ.take();			
		} catch (InterruptedException e) {
			if (!stopped)
				e.printStackTrace();
		}
		return blockManager.getBlock(position).encode();
	}	
}

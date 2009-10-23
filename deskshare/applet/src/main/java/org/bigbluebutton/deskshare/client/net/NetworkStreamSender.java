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

import java.util.Map;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import net.jcip.annotations.GuardedBy;
import net.jcip.annotations.ThreadSafe;

import org.bigbluebutton.deskshare.client.blocks.Block;
import org.bigbluebutton.deskshare.client.blocks.BlockManager;

@ThreadSafe
public class NetworkStreamSender implements NextBlockRetriever {	
	private BlockManager blockManager;
	private ExecutorService executor;
	
	@GuardedBy("this") private int nextBlockToSend = 1;
    private final Map<Integer, Block> blocksMap;
    private final int numThreads;
    private final String host;
    private final String room;
    private NetworkSocketStreamSender[] senders;
    private NetworkHttpStreamSender httpSender;
    private boolean tunneling = false;
    private int numRunningThreads = 0;
    
	public NetworkStreamSender(BlockManager blockManager, String host, String room) {
		this.blockManager = blockManager;
		blocksMap = blockManager.getBlocks();
		this.host = host;
		this.room = room;
		
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
				return true;
			}
		} else {
			return true;
		}
		System.out.println("Http tunneling failed.");
		return false;
	}
	
	private void createSender(int i) throws ConnectionException {
		senders[i] = new NetworkSocketStreamSender(this);
		senders[i].connect(host);		
	}
	
	public void start() {
		if (tunneling) {
			httpSender.sendStartStreamMessage(room, blockManager.getScreenDim(), blockManager.getBlockDim());
			executor.execute(httpSender);
		} else {
			for (int i = 0; i < numRunningThreads; i++) {
				senders[i].sendStartStreamMessage(room, blockManager.getScreenDim(), blockManager.getBlockDim());
				executor.execute(senders[i]);
			}	
		}
	}
	
	public void stop() throws ConnectionException {
		System.out.println("Stopping network sender");
		if (tunneling) {
			httpSender.disconnect();
		} else {
			for (int i = 0; i < numRunningThreads; i++) {
				senders[i].disconnect();
			}				
		}
	
		executor.shutdownNow();
	}

	private boolean tryHttpTunneling() {
		httpSender = new NetworkHttpStreamSender(this);
		try {
			httpSender.connect(host);
			return true;
		} catch (ConnectionException e) {
			System.out.println("Problem connecting to " + host);
		}
		return false;
	}
	
	public Block fetchNextBlockToSend() {
		synchronized(this) {
			//Block block = blocksMap.get(new Integer(nextBlockToSend));
			Block block = blockManager.getBlock(nextBlockToSend);
//			System.out.println("Fetched block " + nextBlockToSend);
			nextBlockToSend++;
			if (nextBlockToSend > blocksMap.size()) nextBlockToSend = 1;
			return block;
		}
	}
}

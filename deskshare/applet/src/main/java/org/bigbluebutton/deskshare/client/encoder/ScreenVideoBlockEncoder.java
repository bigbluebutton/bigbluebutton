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
package org.bigbluebutton.deskshare.client.encoder;

import java.util.concurrent.Callable;
import java.util.concurrent.CompletionService;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorCompletionService;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import org.bigbluebutton.deskshare.client.blocks.Block;

public class ScreenVideoBlockEncoder {
	private ExecutorService executor;
	private CompletionService<Block> completionService;
	
	public ScreenVideoBlockEncoder() {
		int numThreads = Runtime.getRuntime().availableProcessors();
		System.out.println("Starting up " + numThreads + " threads.");
		executor = Executors.newFixedThreadPool(numThreads);
		completionService = new ExecutorCompletionService<Block>(executor);
	}

	public void encode(Block[] blocks) throws BlockEncodeException {
/*		long start = System.currentTimeMillis();
		for (int i = 0; i < blocks.length; i++) {
			final Block block = blocks[i];
			completionService.submit(new Callable<Block>() {
				public Block call() {
					return block.encode();
				}
			});
		}
		
		for (int t = 0; t < blocks.length; t++) {
			Future<Block> f;
			try {
				f = completionService.take();
				Block block = f.get();
				block.encodeDone();
			} catch (InterruptedException e) {
				e.printStackTrace();
				throw new BlockEncodeException("InterruptedException while encoding block.");
			} catch (ExecutionException e) {
				e.printStackTrace();
				throw new BlockEncodeException("ExecutionException while encoding block.");
			}
		}
		long end = System.currentTimeMillis();
		System.out.println("Encoding blocks[" + blocks.length + "] took " + (end-start) + " ms.");
*/
	}
}

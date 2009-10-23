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
package org.bigbluebutton.deskshare.server.session;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.bigbluebutton.deskshare.common.ScreenVideoEncoder;
import org.bigbluebutton.deskshare.common.Dimension;

public class BlockManager {

	private final ConcurrentMap<Integer, Block> blocksMap;

	private final Dimension screenDim;
	private final Dimension blockDim;
	private final String room;
	
	private final int numberOfRows;
	private final int numberOfColumns;
    private long lastFrameTime = 0;
    private long lastKeyFrameTime = 0;
    private final static int KEYFRAME_INTERVAL = 20000;
    private ByteArrayOutputStream screenVideoFrame;
    
    private FrameStreamer streamer;
    
	public BlockManager(String room, Dimension screen, Dimension block, FrameStreamer streamer) {
		screenDim = screen;
		blockDim = block;
		this.room = room;
		
		blocksMap = new ConcurrentHashMap<Integer, Block>();

		numberOfRows = BlockFactory.getNumberOfRows(screen, block);
		numberOfColumns = BlockFactory.getNumberOfColumns(screen, block);
		
		screenVideoFrame = new ByteArrayOutputStream();
				
		this.streamer = streamer;
	}
	
	public void initialize() {
		System.out.println("Initialize BlockManager");
		int numberOfBlocks = numberOfRows * numberOfColumns;
		for (int position = 1; position <= numberOfBlocks; position++)  {
			Block block = BlockFactory.createBlock(screenDim, blockDim, position);
			initializeBlock(block);
			blocksMap.put(new Integer(position), block);
		}
		generateFrame(true);
	}
	
	private void initializeBlock(Block block) {
		Dimension dim = block.getDimension();
		int width = dim.getWidth();
		int height = dim.getHeight();
		int[] blankPixels = new int[width * height];
		for (int i = 0; i < blankPixels.length; i++) {
			blankPixels[i] = 0xFFFF;
		}
		byte[] encodedPixels = ScreenVideoEncoder.encodePixels(blankPixels, width, height, false, true);
		block.update(encodedPixels, true);
	}
	
	public void updateBlock(int position, byte[] videoData, boolean keyFrame) {
		Block block = blocksMap.get(new Integer(position));
		block.update(videoData, keyFrame);
    	long now = System.currentTimeMillis();
    	if ((now - lastFrameTime) > 100) {
    		lastFrameTime = now;
//    		if ((now-lastKeyFrameTime) > KEYFRAME_INTERVAL){
//    			generateFrame(true);
//    		} else {
 //   			generateFrame(false);
 //   		}
    		generateFrame(false);	
    	}
	}
	
	private void generateFrame(boolean genKeyFrame) {
//		System.out.println("Generating frame " + genKeyFrame);
		Map<Integer, Block> blocks = Collections.unmodifiableMap(new HashMap<Integer, Block>(blocksMap));
		
		screenVideoFrame.reset();
		byte[] encodedDim = ScreenVideoEncoder.encodeBlockAndScreenDimensions(blockDim.getWidth(), screenDim.getWidth(), blockDim.getHeight(), screenDim.getHeight());
     	    	
		try {
    		int numberOfBlocks = numberOfRows * numberOfColumns;   		
    		byte videoDataHeader = ScreenVideoEncoder.encodeFlvVideoDataHeader(genKeyFrame);
    		    		
    		screenVideoFrame.write(videoDataHeader);
    		screenVideoFrame.write(encodedDim);
    		
    		for (int position = 1; position <= numberOfBlocks; position++)  {
    			Block block = (Block) blocks.get(new Integer(position));
    			byte[] encodedBlock = ScreenVideoEncoder.encodeBlockUnchanged();
    			if (block.hasChanged() || genKeyFrame) {
    				encodedBlock = block.getEncodedBlock();
    			}
    			screenVideoFrame.write(encodedBlock, 0, encodedBlock.length);
    		}
    		ScreenVideoFrame frame = new ScreenVideoFrame(room, screenVideoFrame);
    		streamer.sendFrame(frame);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}		
	}
}

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
package org.bigbluebutton.deskshare.client.blocks;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.bigbluebutton.deskshare.client.encoder.BlockEncodeException;
import org.bigbluebutton.deskshare.client.encoder.ScreenVideoBlockEncoder;
import org.bigbluebutton.deskshare.common.ScreenVideoEncoder;
import org.bigbluebutton.deskshare.common.Dimension;

public class BlockManager {
    private final Map<Integer, Block> blocksMap;
    private final Map<Integer, Block> unmodifiableBlocksMap;
    private int numColumns;
    private int numRows;
    
    private BlockFactory factory;
    private ChangedBlocksListener listeners;
    
    private ByteArrayOutputStream encodedPixelStream = new ByteArrayOutputStream();
    private Dimension screenDim, blockDim;
    
//    private ScreenVideoBlockEncoder encoder;
    
    public BlockManager() {
    	blocksMap = new HashMap<Integer, Block>();
    	unmodifiableBlocksMap = Collections.unmodifiableMap(blocksMap);
 //   	encoder = new ScreenVideoBlockEncoder();
    }
    
    public void initialize(Dimension screen, Dimension tile) {
    	screenDim = screen;
    	blockDim = tile;
    	
    	factory = new BlockFactory(screen, tile);
        
        numColumns = factory.getColumnCount();
        numRows = factory.getRowCount();
        int numberOfBlocks = numColumns * numRows;
        
        for (int position = 1; position <= numberOfBlocks; position++) {
        	Block block = factory.createBlock(position);
        	blocksMap.put(new Integer(position), block);
        }  
    }
    
    public void processCapturedScreen(BufferedImage capturedScreen, boolean isKeyFrame)
    {    	
    	long start = System.currentTimeMillis();
//		Block[] blocks = new Block[numRows * numColumns];
		int index = 0;
		int numberOfBlocks = numColumns * numRows;
        for (int position = 1; position <= numberOfBlocks; position++) {
        	Block block = blocksMap.get(new Integer(position));
        	block.updateBlock(capturedScreen, isKeyFrame);
        	
        	
//            blocks[index++] = block;
        }
        
		long qEncode = System.currentTimeMillis();
//		System.out.println("Grabbing pixels for blocks[" + numberOfBlocks + "] took " + (qEncode-start) + " ms.");   
		
//        try {
//			encoder.encode(blocks);
//			sendEncodedData(isKeyFrame);
//		} catch (BlockEncodeException e) {
//			e.printStackTrace();
//		}
		notifyChangedTilesListener(null, isKeyFrame);
		long end = System.currentTimeMillis();
		System.out.println("ProcessCapturedScreen took " + (end-start) + " ms.");
    }
/*    
    private void sendEncodedData(boolean isKeyFrame) {
    	long start = System.currentTimeMillis();
    	encodedPixelStream.reset();
    	byte[] encodedDim = ScreenVideoEncoder.encodeBlockDimensionsAndGridSize(blockDim.getWidth(), screenDim.getWidth(), blockDim.getHeight(), screenDim.getHeight());
     	byte videoDataHeader = ScreenVideoEncoder.encodeFlvVideoDataHeader(isKeyFrame);
    	try {
    		encodedPixelStream.write(videoDataHeader);
			encodedPixelStream.write(encodedDim);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		int numberOfBlocks = numColumns * numRows;
        for (int position = 1; position <= numberOfBlocks; position++) {
        	Block block = blocksMap.get(new Integer(position));
        	byte[] data = block.getEncodedBlock();
           	encodedPixelStream.write(data, 0, data.length);
        }
        
//	    System.out.println("Encoded data length = " + encodedPixelStream.size());
	    notifyChangedTilesListener(encodedPixelStream, isKeyFrame);	
	    long end = System.currentTimeMillis();
	    System.out.println("Sending encoded data took " + (end-start) + " ms.");
    }
*/    
    private void notifyChangedTilesListener(ByteArrayOutputStream encodedPixelStream, boolean isKeyFrame) {
    	listeners.onChangedTiles(encodedPixelStream, isKeyFrame);
    }
    

	public void addListener(ChangedBlocksListener listener) {
		listeners = listener;
	}


	public void removeListener(ChangedBlocksListener listener) {
		//listeners.remove(listener);
		listeners = null;
	}
    
	public Block getBlock(int position) {
		return (Block) blocksMap.get(Integer.valueOf(position));
	}
	
    public int getRowCount()
    {
        return numRows;
    }
    
    public int getColumnCount()
    {
        return numColumns;
    }

    public Dimension getScreenDim() {
		return screenDim;
	}

	public Dimension getBlockDim() {
		return blockDim;
	}

	/*
	 * Returns a read-only "live" view of the blocks;
	 */
	public Map<Integer, Block> getBlocks() {
		return unmodifiableBlocksMap;
	}
}

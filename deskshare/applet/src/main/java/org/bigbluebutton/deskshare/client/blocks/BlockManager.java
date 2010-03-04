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
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import org.bigbluebutton.deskshare.common.Dimension;
import org.bigbluebutton.deskshare.client.net.EncodedBlockData;

public class BlockManager {
    private final Map<Integer, Block> blocksMap;
    private final Map<Integer, Block> unmodifiableBlocksMap;
    private int numColumns;
    private int numRows;
    
    private BlockFactory factory;
    private ChangedBlocksListener listeners;
    
    private ByteArrayOutputStream encodedPixelStream = new ByteArrayOutputStream();
    private Dimension screenDim, blockDim;
    
    public BlockManager() {
    	blocksMap = new HashMap<Integer, Block>();
    	unmodifiableBlocksMap = Collections.unmodifiableMap(blocksMap);
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
    
    public void processCapturedScreen(BufferedImage capturedScreen) {    	
    	long start = System.currentTimeMillis();
		int numberOfBlocks = numColumns * numRows;
        for (int position = 1; position <= numberOfBlocks; position++) {
        	Block block = blocksMap.get(new Integer(position));
        	block.updateBlock(capturedScreen);
        	if (block.hasChanged()) {
        		System.out.println("Block " + block.getPosition() + " has changed.");
        		notifyChangedBlockListener(block.encode());
        	}
        }
        
		long end = System.currentTimeMillis();
		System.out.println("ProcessCapturedScreen took " + (end-start) + " ms.");
    }
    
    private void notifyChangedBlockListener(EncodedBlockData encodedData) {
    	listeners.onChangedBlock(encodedData);
    }
    

	public void addListener(ChangedBlocksListener listener) {
		listeners = listener;
	}

	public void removeListener(ChangedBlocksListener listener) {
		listeners = null;
	}
    
	public Block getBlock(int position) {
		return (Block) blocksMap.get(Integer.valueOf(position));
	}
	
    public int getRowCount() {
        return numRows;
    }
    
    public int getColumnCount() {
        return numColumns;
    }

    public Dimension getScreenDim() {
		return screenDim;
	}

	public Dimension getBlockDim() {
		return blockDim;
	}
}

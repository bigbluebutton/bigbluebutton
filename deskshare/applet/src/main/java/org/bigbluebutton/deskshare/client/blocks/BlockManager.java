/** 
* ===License Header===
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
* ===License Header===
*/
package org.bigbluebutton.deskshare.client.blocks;

import java.awt.image.BufferedImage;
import java.util.HashMap;
import java.util.Map;
import java.util.Vector;

import org.bigbluebutton.deskshare.client.net.BlockMessage;
import org.bigbluebutton.deskshare.common.Dimension;

public class BlockManager {
    private final Map<Integer, Block> blocksMap;
    private int numColumns;
    private int numRows;
    
    private BlockFactory factory;
    private ChangedBlocksListener listeners;
    private Dimension screenDim, blockDim;
    
    public BlockManager() {
    	blocksMap = new HashMap<Integer, Block>();
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

    	Vector<Integer> changedBlocks = new Vector<Integer>();
/*		
		int numberOfBlocks = numColumns * numRows;
		for (int position = 1; position <= numberOfBlocks; position++) {
			Block block = blocksMap.get(new Integer(position));
        	if (block.hasChanged(capturedScreen)) {
        		changedBlocks.add(new Integer(position));        		
        	}
		}  
    	
		if (changedBlocks.size() > 0) {
			Integer[] bc = new Integer[changedBlocks.size()];
			System.arraycopy(changedBlocks.toArray(), 0, bc, 0, bc.length);
			changedBlocks.clear();
			notifyChangedBlockListener(new BlockMessage(bc));
		}
*/
		
		int numberOfBlocks = numColumns * numRows;
		for (int position = 1; position <= numberOfBlocks; position++) {
			Block block = blocksMap.get(new Integer(position));
        	if (block.hasChanged(capturedScreen)) {
        		changedBlocks.add(new Integer(position));        		
        	}
        	
    		if ((position % numColumns == 0) && (changedBlocks.size() > 0)) {
    			Integer[] bc = new Integer[changedBlocks.size()];
    			System.arraycopy(changedBlocks.toArray(), 0, bc, 0, bc.length);
    			changedBlocks.clear();
    			notifyChangedBlockListener(new BlockMessage(bc));
    		}
		}

    }
        
    private void notifyChangedBlockListener(BlockMessage position) {
    	listeners.onChangedBlock(position);
    }
    

	public void addListener(ChangedBlocksListener listener) {
		listeners = listener;
	}

	public void removeListener(ChangedBlocksListener listener) {
		listeners = null;
	}
    
	public void blockSent(int position) {
		Block block = (Block) blocksMap.get(new Integer(position));
		block.sent();
	}
	
	public Block getBlock(int position) {
		return (Block) blocksMap.get(new Integer(position));
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

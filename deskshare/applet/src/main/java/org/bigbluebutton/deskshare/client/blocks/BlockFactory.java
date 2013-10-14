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
package org.bigbluebutton.deskshare.client.blocks;

import java.awt.Point;

import org.bigbluebutton.deskshare.common.Dimension;

class BlockFactory {
    private int numColumns;
    private int numRows;
    private Dimension screenDim;
    private Dimension tileDim;
        
    public BlockFactory(Dimension screen, Dimension tile) {
        this.screenDim = screen;
        this.tileDim = tile;
        
        numColumns = computeNumberOfColumnTiles();
        numRows = computeNumberOfRowTiles();
    }
    
    private int computeNumberOfColumnTiles() {
    	int columns = screenDim.getWidth() / tileDim.getWidth();
    	if (hasPartialColumnTile()) {
    		columns += 1;
    	}
    	return columns;
    }
    
    private boolean hasPartialColumnTile() {
    	return (screenDim.getWidth() % tileDim.getWidth()) != 0;
    }
    
    private int computeNumberOfRowTiles() {
    	int rows = screenDim.getHeight() / tileDim.getHeight();
    	if (hasPartialRowTile()) {
    		rows += 1;
    	}
    	return rows;
    }
    
    private boolean hasPartialRowTile() {
    	return (screenDim.getHeight() % tileDim.getHeight()) != 0;
    }
  
    Block createBlock(int position, boolean useSVC2) {
    	int col = computeColumn(position);
    	int row = computeRow(position);
		int w = computeTileWidth(col);
		int h = computeTileHeight(row);		
		int x = computeTileXLocation(col);
		int y = computeTileYLocation(row);
		int pos = computeTilePosition(row, col);
		
		Block t = new Block(new Dimension(w, h), pos, new Point(x,y), useSVC2);

		return t;
    }
    
    private int computeTilePosition(int row, int col) {
    	return (((numRows - (row+1)) * numColumns) + (col + 1));
    }
    
    private int computeTileXLocation(int col) {
    	return col * tileDim.getWidth();
    }
    
    private int computeTileYLocation(int row) {
    	if (isTopRowTile(row)) return 0;
    	return screenDim.getHeight() - ((numRows - row) * tileDim.getHeight());
    }
    
    Point positionToIndex(int position) {    
    	return new Point(computeRow(position), computeColumn(position));
    }
    
    int indexToPosition(int row, int col) {
    	return computeTilePosition(row, col);
    }
    
    private int computeRow(int position) {
    	return -(position - (getRowCount() * getColumnCount())) / getColumnCount();
    }
    
    private int computeColumn(int position) {
		return (position - 1) % getColumnCount();    	
    }
    
    private int computeTileWidth(int col) {
    	if (isLastColumnTile(col)) {
    		if (hasPartialColumnTile()) {
    			return partialTileWidth();
    		}
    	}
    	return tileDim.getWidth();
    }
    
    private int partialTileWidth() {
    	return screenDim.getWidth() % tileDim.getWidth();
    }
    
    private int computeTileHeight(int row) {
    	if (isTopRowTile(row)) {
    		if (hasPartialRowTile()) {
    			return partialTileHeight();
    		}
    	}
    	return tileDim.getWidth();
    }
    
    private int partialTileHeight() {
    	return screenDim.getHeight() % tileDim.getHeight();
    }

    private boolean isLastColumnTile(int col) {
    	return ((col+1) % numColumns) == 0;
    }
    
    private boolean isTopRowTile(int row) {
    	return (row == 0);
    }

    
    int getRowCount()
    {
        return numRows;
    }
    
    int getColumnCount()
    {
        return numColumns;
    }
}

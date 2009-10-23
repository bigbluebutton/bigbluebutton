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

import org.bigbluebutton.deskshare.common.Dimension;

public class BlockFactory {

    public static int getNumberOfColumns(Dimension screenDim, Dimension blockDim) {
    	int columns = screenDim.getWidth() / blockDim.getWidth();
    	if (hasPartialColumnBlock(screenDim, blockDim)) {
    		columns += 1;
    	}
    	return columns;
    }
    
    private static boolean hasPartialColumnBlock(Dimension screenDim, Dimension blockDim) {
    	return (screenDim.getWidth() % blockDim.getWidth()) != 0;
    }
    
    public static int getNumberOfRows(Dimension screenDim, Dimension blockDim) {
    	int rows = screenDim.getHeight() / blockDim.getHeight();
    	if (hasPartialRowBlock(screenDim, blockDim)) {
    		rows += 1;
    	}
    	return rows;
    }
    
    private static boolean hasPartialRowBlock(Dimension screenDim, Dimension blockDim) {
    	return (screenDim.getHeight() % blockDim.getHeight()) != 0;
    }
  
    public static Block createBlock(Dimension screenDim, Dimension blockDim, int position) {
    	int numRows = getNumberOfRows(screenDim, blockDim);
    	int numColumns = getNumberOfColumns(screenDim, blockDim);
    	
    	int col = computeColumn(position, numColumns);
    	int row = computeRow(position, numRows, numColumns);
		int w = computeTileWidth(col, screenDim, blockDim);
		int h = computeTileHeight(row, screenDim, blockDim);		
		
		Block t = new Block(new Dimension(w, h), position);

		return t;
    }
       
    private static int computeRow(int position, int numRows, int numColumns) {
    	return -(position - (numRows * numColumns)) / numColumns;
    }
    
    private static int computeColumn(int position, int numColumns) {
		return (position - 1) % numColumns;    	
    }
    
    private static int computeTileWidth(int col, Dimension screenDim, Dimension blockDim) {
    	int numColumns = getNumberOfColumns(screenDim, blockDim);
    	if (isLastColumnTile(col, numColumns)) {
    		if (hasPartialColumnBlock(screenDim, blockDim)) {
    			return partialTileWidth(screenDim, blockDim);
    		}
    	}
    	return blockDim.getWidth();
    }
    
    private static int partialTileWidth(Dimension screenDim, Dimension blockDim) {
    	return screenDim.getWidth() % blockDim.getWidth();
    }
    
    private static int computeTileHeight(int row, Dimension screenDim, Dimension blockDim) {
    	if (isTopRowTile(row)) {
    		if (hasPartialRowBlock(screenDim, blockDim)) {
    			return partialTileHeight(screenDim, blockDim);
    		}
    	}
    	return blockDim.getWidth();
    }
    
    private static int partialTileHeight(Dimension screenDim, Dimension blockDim) {
    	return screenDim.getHeight() % blockDim.getHeight();
    }

    private static boolean isLastColumnTile(int col, int numColumns) {
    	return ((col+1) % numColumns) == 0;
    }
    
    private static boolean isTopRowTile(int row) {
    	return (row == 0);
    }
}

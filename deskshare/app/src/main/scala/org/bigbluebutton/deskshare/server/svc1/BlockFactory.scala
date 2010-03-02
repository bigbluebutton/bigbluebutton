package org.bigbluebutton.deskshare.server.svc1

trait BlockFactory {
  
	def getNumberOfColumns(screenDim: Dimension , blockDim: Dimension ): Int = {
    	var columns: Int = screenDim.width / blockDim.width
    	if (hasPartialColumnBlock(screenDim, blockDim)) {
    		columns += 1
    	}
     
    	return columns;
    }
    
    private def hasPartialColumnBlock(screenDim: Dimension , blockDim: Dimension): Boolean = {
    	return (screenDim.width % blockDim.width) != 0
    }
    
    def getNumberOfRows(screenDim: Dimension, blockDim: Dimension ): Int = {
    	var rows: Int = screenDim.height / blockDim.height
    	if (hasPartialRowBlock(screenDim, blockDim)) {
    		rows += 1
    	}
    	return rows
    }
    
    private def hasPartialRowBlock(screenDim: Dimension, blockDim: Dimension): Boolean = {
    	return (screenDim.height % blockDim.height) != 0;
    }
  
    def createBlock(screenDim: Dimension, blockDim: Dimension, position: Int): Block = {
    	val numRows: Int = getNumberOfRows(screenDim, blockDim)
    	val numColumns: Int = getNumberOfColumns(screenDim, blockDim)
    	
    	val col: Int = computeColumn(position, numColumns)
    	val row: Int = computeRow(position, numRows, numColumns)
		val w: Int = computeTileWidth(col, screenDim, blockDim)
		val h: Int = computeTileHeight(row, screenDim, blockDim)	
		
		return new Block(new Dimension(w, h), position) 
    }
       
    private def computeRow(position: Int, numRows: Int, numColumns: Int): Int = {
    	return -(position - (numRows * numColumns)) / numColumns
    }
    
    private def computeColumn(position: Int, numColumns: Int): Int = {
		return (position - 1) % numColumns    	
    }
    
    private def computeTileWidth(col: Int, screenDim: Dimension, blockDim: Dimension): Int = {
    	val numColumns: Int = getNumberOfColumns(screenDim, blockDim)
    	if (isLastColumnTile(col, numColumns)) {
    		if (hasPartialColumnBlock(screenDim, blockDim)) {
    			return partialTileWidth(screenDim, blockDim)
    		}
    	}
    	return blockDim.width
    }
    
    private def partialTileWidth(screenDim: Dimension, blockDim: Dimension): Int = {
    	return screenDim.width % blockDim.width
    }
    
    private def computeTileHeight(row: Int, screenDim: Dimension, blockDim: Dimension): Int = {
    	if (isTopRowTile(row)) {
    		if (hasPartialRowBlock(screenDim, blockDim)) {
    			return partialTileHeight(screenDim, blockDim)
    		}
    	}
    	return blockDim.width
    }
    
    private def partialTileHeight(screenDim: Dimension, blockDim: Dimension): Int = {
    	return screenDim.height % blockDim.height
    }

    private def  isLastColumnTile(col: Int, numColumns: Int): Boolean = {
    	return ((col+1) % numColumns) == 0;
    }
    
    private def  isTopRowTile(row: Int): Boolean = {
    	return (row == 0);
    }
}

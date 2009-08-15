package org.bigbluebutton.deskshare.client.tiles;

import java.awt.Point;

class TileFactory {
    private int numColumns;
    private int numRows;
    private Dimension screenDim;
    private Dimension tileDim;
        
    TileFactory(Dimension screen, Dimension tile) {
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
  
    Tile createTile(int position) {
    	int col = computeColumn(position);
    	int row = computeRow(position);
		int w = computeTileWidth(col);
		int h = computeTileHeight(row);		
		int x = computeTileXLocation(col);
		int y = computeTileYLocation(row);
		int pos = computeTilePosition(row, col);
		
		System.out.println("Tile dim=" + w + "x" + h + " index=" + row + "," + col + " loc=" + x + "," + y);
		Tile t = new Tile(new Dimension(w, h), pos, new Point(x,y));

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

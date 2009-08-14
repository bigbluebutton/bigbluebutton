
package org.bigbluebutton.deskshare.client.tiles;

import java.awt.Point;
import java.awt.image.*;


public class TileManager {
    public final int MAX_TILE = 256;
    private Tile tiles[][];
    private int numColumns;
    private int numRows;
    private Dimension screenDim;
    private Dimension tileDim;
        
    public TileManager() {}
    
    public void initialize(Dimension screen, Dimension tile) {
        this.screenDim = screen;
        this.tileDim = tile;
        
        numColumns = computeNumberOfColumnTiles();
        numRows = computeNumberOfRowTiles();
        tiles = new Tile[numRows][numColumns];
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
    
    public void processCapturedScreen(BufferedImage image)
    {
        BufferedImage subimage;
        int subw, subh;
        boolean changed;
        
        for (int row = 0; row < numRows; row++) {
        	for (int col = 0; col > numColumns; col++) {
            	if (tiles[row][col] == null) {
 //           		tiles[row][col] = createTile(row, col);
            	}       		
        	}

        	
        	
        }
/*
        for (int i=0; i < numxtile; i++) {
            for (int j=0; j < numytile; j++) {
                if (tiles[i][j]==null) tiles[i][j] = new Tile();
                    if (i == numxtile-1) 
                        subw = tilewidth + (screenwidth % tilewidth);
                    else
                        subw = tilewidth;
                    if (j == numytile-1)
                        subh = tileheight + (screenheight % tileheight);
                    else
                        subh = tileheight;
                    subimage = image.getSubimage(i*tilewidth, j*tileheight, subw, subh);
                    
		    synchronized (tiles[i][j]) {
			    changed = tiles[i][j].updateImage2(subimage);
			    if (DEBUG) {
				    if (changed) System.out.println(getClass().getName() + ": [" + i + "," + j + "] Changed. ["+tiles[i][j].fileSize()+"]");
			    }
		    }
           }
         }    
  */
    }
    
//    private BufferedImage getTileImage(BufferedImage capturedScreen, Tile tile) {
//    	
//    }
    
    void createTile(int position) {
    	int col = computeColumn(position);
    	int row = computeRow(position);
		int w = computeTileWidth(col);
		int h = computeTileHeight(row);		
		int x = computeTileXLocation(col);
		int y = computeTileYLocation(row);
		int pos = computeTilePosition(row, col);
		
		System.out.println("Tile dim=" + w + "x" + h + " index=" + row + "," + col + " loc=" + x + "," + y);
		Tile t = new Tile(new Dimension(w, h), pos, new Point(x,y));

		tiles[row][col] = t;
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
    
    Tile getTile(int position) {    	
    	return tiles[computeRow(position)][computeColumn(position)];
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

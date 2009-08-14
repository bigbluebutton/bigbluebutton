
package org.bigbluebutton.deskshare.client;

import java.awt.image.*;

public class TileManager {
    
    private boolean DEBUG = true;
    
    public final int MAX_TILE = 256;
    private Tile tiles[];
    private int numColumns;
    private int numRows;
    private Dimension screen;
    private Dimension tile;
        
    public TileManager() {}
    
    public void initialize(Dimension screen, Dimension tile) {
        this.screen = screen;
        this.tile = tile;
        
        numColumns = computeNumberOfColumnTiles();
        numRows = computeNumberOfRowTiles();
        tiles = new Tile[numRows + numColumns];
    }
    
    private int computeNumberOfColumnTiles() {
    	int columns = screen.getWidth() / tile.getWidth();
    	if (hasPartialColumnTile()) {
    		columns += 1;
    	}
    	return columns;
    }
    
    private boolean hasPartialColumnTile() {
    	return (screen.getWidth() % tile.getWidth()) != 0;
    }
    
    private int computeNumberOfRowTiles() {
    	int rows = screen.getHeight() / tile.getHeight();
    	if (hasPartialRowTile()) {
    		rows += 1;
    	}
    	return rows;
    }
    
    private boolean hasPartialRowTile() {
    	return (screen.getHeight() % tile.getHeight()) != 0;
    }
    
    public void processCapturedScreen(BufferedImage image)
    {
        BufferedImage subimage;
        int subw, subh;
        boolean changed;
        
        for (int i = 0; i < numRows + numColumns; i++) {
        	if (tiles[i] == null) {
        		int w = computeTileWidth(i);
        		int h = computeTileHeight(i);
        		
        		tiles[i] = new Tile(w, h, i);
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
    
    public int computeTileXLocation(Tile tile) {
    	int position = tile.getTilePosition();
    	if (isLastColumnTile(position)) {
    		System.out.println("Last column tile " + screen.getWidth() + " " + tile.getWidth());
    		return screen.getWidth() - tile.getWidth();
    	} else {
    		int columnLocation = position % numColumns;
    		return tile.getWidth() * (columnLocation-1);
    	}
    }
    
    public int computeTileYLocation(Tile tile) {
    	int position = tile.getTilePosition();
    	if (isTopRowTile(position)) {
    		return 0;
    	} else {
    		int rowLocation = position % numRows;
    		return -1;
    	}
    }
    
    public Tile createTile(int position) {
    	int tileWidth = computeTileWidth(position);
    	int tileHeight = computeTileHeight(position);

    	Tile newTile = new Tile(tileWidth, tileHeight, position);
    	newTile.setLastColumnTile(isLastColumnTile(position));
    	newTile.setTopRowTile(isTopRowTile(position));
    	newTile.setX(computeTileXLocation(newTile));
    	newTile.setY(computeTileYLocation(newTile));
    	
    	return newTile;
    }
    
    private int computeTileWidth(int position) {
    	if (isLastColumnTile(position)) {
    		if (hasPartialColumnTile()) {
    			return screen.getWidth() % tile.getWidth();
    		}
    	}
    	return tile.getWidth();
    }
    
    private int computeTileHeight(int position) {
    	if (isTopRowTile(position)) {
    		if (hasPartialRowTile()) {
    			return screen.getHeight() % tile.getHeight();
    		}
    	}
    	return tile.getWidth();
    }

    private boolean isLastColumnTile(int position) {
    	return ((position % numColumns) == 0);
    }
    
    private boolean isTopRowTile(int position) {
    	return ((position % numRows) == 0);
    }
    
    public int getRowCount()
    {
        return numRows;
    }
    
    public int getColumnCount()
    {
        return numColumns;
    }
   
    
}

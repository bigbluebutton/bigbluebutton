
package org.bigbluebutton.deskshare.client.tiles;

import java.awt.Point;
import java.awt.image.*;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;

public class TileManager {
    private Tile tiles[][];
    private int numColumns;
    private int numRows;
    
    private TileFactory factory;
    private ChangedTilesListener listeners;
    //private Set<ChangedTilesListener> listeners = new HashSet<ChangedTilesListener>();
    
    public TileManager() {}
    
    public void initialize(Dimension screen, Dimension tile) {
    	factory = new TileFactory(screen, tile);
        
        numColumns = factory.getColumnCount();
        numRows = factory.getRowCount();
        tiles = new Tile[numRows][numColumns];

        System.out.println("Setting tiles " + numRows + " " + numColumns);
        for (int row = 0; row < numRows; row++) {
        	for (int col = 0; col < numColumns; col++) {
            	if (tiles[row][col] == null) {
            		int position = factory.indexToPosition(row, col);
            		tiles[row][col] = factory.createTile(position);
            	}       		
        	}        	
        }    
    }
    
    public void processCapturedScreen(BufferedImage capturedScreen)
    {
    	System.out.println("Processing captured screen."); 
        for (int row = 0; row < numRows; row++) {
        	for (int col = 0; col < numColumns; col++) {
        		int position = factory.indexToPosition(row, col);
            	Tile tile =  getTile(position);   
            	tile.updateTile(capturedScreen);
            	if (tile.isDirty()) {
            		//ChangedTileImp ct = new ChangedTileImp(tile.getDimension(), tile.getTilePosition(), tile.getLocation(), tile.getImage());
            		notifyChangedTilesListener(tile);
            	}
        	}        	
        }
        
//        if (changedTiles.size() > 0) {
//        	notifyChangedTilesListener(changedTiles);
//        }
        
//        capturedScreen = null;
    }
    
    private void notifyChangedTilesListener(Tile changedTile) {
//    	for (ChangedTilesListener ctl : listeners) {
//    		ctl.onChangedTiles(changedTile);
//    	}
    	listeners.onChangedTiles(changedTile);
    }
    

	public void addListener(ChangedTilesListener listener) {
		listeners = listener;
	}


	public void removeListener(ChangedTilesListener listener) {
		//listeners.remove(listener);
		listeners = null;
	}
    
    void createTile(int position) {		
    	Point coord = factory.positionToIndex(position);
		tiles[coord.x][coord.y] = factory.createTile(position);
    }
    
    Tile getTile(int position) {
    	Point coord = factory.positionToIndex(position);
    	return tiles[coord.x][coord.y];
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

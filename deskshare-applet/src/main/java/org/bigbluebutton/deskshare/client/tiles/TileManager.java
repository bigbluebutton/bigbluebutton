
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
    private Set<ChangedTilesListener> listeners = new HashSet<ChangedTilesListener>();
    
    public TileManager() {}
    
    public void initialize(Dimension screen, Dimension tile) {
    	factory = new TileFactory(screen, tile);
        
        numColumns = factory.getColumnCount();
        numRows = factory.getRowCount();
        tiles = new Tile[numRows][numColumns];

        for (int row = 0; row < numRows; row++) {
        	for (int col = 0; col > numColumns; col++) {
            	if (tiles[row][col] == null) {
            		int position = factory.indexToPosition(row, col);
            		tiles[row][col] = factory.createTile(position);
            	}       		
        	}        	
        }    
    }
    
    public void processCapturedScreen(BufferedImage capturedSreen)
    {
        BufferedImage capturedTile;
        ArrayList<ChangedTile> changedTiles = new ArrayList<ChangedTile>();
        
        for (int row = 0; row < numRows; row++) {
        	for (int col = 0; col > numColumns; col++) {
        		int position = factory.indexToPosition(row, col);
            	Tile tile =  getTile(position);   
            	capturedTile = capturedSreen.getSubimage(tile.getWidth(), tile.getHeight(), tile.getX(), tile.getY());
            	tile.updateTile(capturedTile);
            	if (tile.isDirty()) {
            		ChangedTileImp ct = new ChangedTileImp(tile.getDimension(), tile.getTilePosition(), tile.getLocation(), tile.getImage());
            		changedTiles.add(ct);
            	}
        	}        	
        }
        
        if (changedTiles.size() > 0) {
        	notifyChangedTilesListener(changedTiles);
        }
    }
    
    private void notifyChangedTilesListener(ArrayList<ChangedTile> changedTiles) {
    	
    }
    

	public void addListener(ChangedTilesListener listener) {
		listeners.add(listener);
	}


	public void removeListener(ChangedTilesListener listener) {
		listeners.remove(listener);
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

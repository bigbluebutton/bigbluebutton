
package org.bigbluebutton.deskshare.client.tiles;

import java.awt.Point;
import java.awt.image.*;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;

import org.bigbluebutton.deskshare.client.encoder.ScreenVideoEncoder;

public class TileManager {
    private Tile tiles[][];
    private int numColumns;
    private int numRows;
    
    private TileFactory factory;
    private ChangedTilesListener listeners;
    
    ByteArrayOutputStream encodedPixelStream = new ByteArrayOutputStream();
    Dimension screenDim, blockDim;
    
    
    public TileManager() {}
    
    public void initialize(Dimension screen, Dimension tile) {
    	screenDim = screen;
    	blockDim = tile;
    	
    	factory = new TileFactory(screen, tile);
        
        numColumns = factory.getColumnCount();
        numRows = factory.getRowCount();
        tiles = new Tile[numRows][numColumns];

        System.out.println("Setting tiles " + numRows + " " + numColumns + " for " + screenDim.getWidth() + "," + screenDim.getHeight());
        for (int row = numRows - 1; row >= 0; row--) {
        	for (int col = 0; col < numColumns; col++) {
            	if (tiles[row][col] == null) {
            		int position = factory.indexToPosition(row, col);
            		tiles[row][col] = factory.createTile(position);
            	}       		
        	}        	
        }    
    }
    
    public void processCapturedScreen(BufferedImage capturedScreen, boolean isKeyFrame)
    {
    	encodedPixelStream.reset();
    	byte[] encodedDim = ScreenVideoEncoder.encodeBlockDimensionsAndGridSize(blockDim.getWidth(), screenDim.getWidth(), blockDim.getHeight(), screenDim.getHeight());
     	byte videoDataHeader = ScreenVideoEncoder.encodeFlvVideoDataHeader(isKeyFrame);
    	try {
    		encodedPixelStream.write(videoDataHeader);
			encodedPixelStream.write(encodedDim);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
    	
    	System.out.println("Processing captured screen."); 
        for (int row = numRows - 1; row >= 0; row--) {
        	for (int col = 0; col < numColumns; col++) {
        		int position = factory.indexToPosition(row, col);
            	Tile tile =  getTile(position);   
            	byte[] data = tile.updateTile(capturedScreen, isKeyFrame);
//            	System.out.println("Tile = " + tile.getTilePosition() + "[" + tile.getX() + "," + tile.getY() + "," + tile.getWidth() + "," + tile.getHeight() + "]");
//            	System.out.println("Writing data for tile " + tile.getTilePosition() + " " + data.length + " to stream starting from " + encodedPixelStream.size());
            	encodedPixelStream.write(data, 0, data.length);
        	}        	
        }

/*        
        byte[] temp = encodedPixelStream.toByteArray();
        
        String tempStr = "videodata = ";
        for (int x=0; x<temp.length; x++) {
        	tempStr += " " + temp[x] + "(" + Integer.toHexString( ((int) temp[x]) & 0xFFF) + ")";
        }
        
        System.out.println (tempStr);
*/        
        System.out.println("Update size = " + encodedPixelStream.size());
        notifyChangedTilesListener(encodedPixelStream, isKeyFrame);
    }
    
    private void notifyChangedTilesListener(ByteArrayOutputStream encodedPixelStream, boolean isKeyFrame) {
    	listeners.onChangedTiles(encodedPixelStream, isKeyFrame);
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

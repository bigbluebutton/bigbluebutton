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
package org.bigbluebutton.deskshare.client.blocks;

import java.awt.Point;
import java.awt.image.BufferedImage;
import java.util.Random;
import java.util.zip.Adler32;

import org.bigbluebutton.deskshare.client.net.EncodedBlockData;
import org.bigbluebutton.deskshare.common.PixelExtractException;
import org.bigbluebutton.deskshare.common.ScreenVideoEncoder;
import org.bigbluebutton.deskshare.common.Dimension;

public final class Block {   
	Random random = new Random();
    private final Adler32 checksum;
    private final Dimension dim;
    private final int position;
    private final Point location;
    
    private boolean isKeyFrame = false;
    private int[] pixels;
    private EncodedBlockData encodedBlockData;

    private int nextForceUpdate = 10000;
    private final static int MIN_DURATION = 5000;
    private final static int MAX_DURATION = 10000;
    private long lastChanged;
    
    Block(Dimension dim, int position, Point location) {
        checksum = new Adler32();
        this.dim = dim;
        this.position = position;
        this.location = location;
    }
    
    public void updateBlock(BufferedImage capturedScreen, boolean isKeyFrame)
    {	
    	synchronized(this) {
        	this.isKeyFrame = isKeyFrame;        	
        	try {
    			pixels = ScreenVideoEncoder.getPixels(capturedScreen, getX(), getY(), getWidth(), getHeight());
        	} catch (PixelExtractException e) {
        		System.out.println(e.toString());
    		}    		
    	}
    }
    
    public  EncodedBlockData encode() {
    	int[] pixelsCopy = new int[pixels.length];
    	synchronized (this) {           
            System.arraycopy(pixels, 0, pixelsCopy, 0, pixels.length);
		}
    	
        byte[] encodedBlock;
        boolean hasChanged = false;

        /** Seems that this thing isn't working properly.
         *  The blocks only gets sent after forceUpdate. (ralam Oct 29, 2009)
         */
        if (!checksumSame(pixelsCopy)) { 
        //if (!checksumSame(pixelsCopy) || isKeyFrame) {
         	encodedBlock = ScreenVideoEncoder.encodePixels(pixelsCopy, getWidth(), getHeight(), false, isKeyFrame);
           	hasChanged = true;           	
        } else {
           	encodedBlock = ScreenVideoEncoder.encodeBlockUnchanged();  
           	hasChanged = false;
        }    	    
        
        EncodedBlockData data = new EncodedBlockData(position, hasChanged, encodedBlock, isKeyFrame);
        return data;			
    }
    
    private boolean checksumSame(int[] pixelsCopy) {
    	long oldsum;
        oldsum = checksum.getValue(); 
        calcChecksum(pixelsCopy);  
        return (oldsum == checksum.getValue());
    }
    
    private boolean forceUpdate() {         
        long now = System.currentTimeMillis();    
        boolean update = ((now - lastChanged) > nextForceUpdate);
        if (update) {
        	synchronized(this) {
        		nextUpdate();
        		lastChanged = now;
        	}       	
        }
        return update;
    }
    
    private void nextUpdate() {
        //get the range, casting to long to avoid overflow problems
        long range = (long)MAX_DURATION - (long)MIN_DURATION + 1;
        // compute a fraction of the range, 0 <= frac < range
        long fraction = (long)(range * random.nextDouble());
        nextForceUpdate =  (int)(fraction + 5000); 
    }
    
    public synchronized EncodedBlockData getEncodedBlockData() {
    	return encodedBlockData;
    }
    
    private synchronized void calcChecksum(int pixelsCopy[])
    {
    	checksum.reset();   
    	int height = getHeight();
    	int width = getWidth();
		for (int i = 0; i < height; i++) {
		    for (int j = 0; j < width; j++) {
		    	if ((i * width + i) % 13 == 0)
		    		checksum.update(pixelsCopy[i * width + j]);
		    }
		}	 
    }

    public int getWidth()
    {
        return new Integer(dim.getWidth()).intValue();
    }
    
    public int getHeight()
    {
        return new Integer(dim.getHeight()).intValue();
    }
    
    public int getPosition() {
		return new Integer(position).intValue();
	}
    
    public int getX() {
		return new Integer(location.x).intValue();
	}

    public int getY() {
		return new Integer(location.y).intValue();
	}
	
    Dimension getDimension() {
		return new Dimension(dim.getWidth(), dim.getHeight());
	}
	
    Point getLocation() {
		return new Point(location.x, location.y);
	}
}

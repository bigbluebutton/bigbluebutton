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
    private int[] pixels;
    private boolean firstTime = true;
    
    Block(Dimension dim, int position, Point location) {
        checksum = new Adler32();
        this.dim = dim;
        this.position = position;
        this.location = location;
    }
    
    public void updateBlock(BufferedImage capturedScreen) {	
    	synchronized(this) {     	
        	try {
    			pixels = ScreenVideoEncoder.getPixels(capturedScreen, getX(), getY(), getWidth(), getHeight());
        	} catch (PixelExtractException e) {
        		System.out.println(e.toString());
    		}    		
    	}
    }
    
    public boolean hasChanged() {
    	if (firstTime) {
    		firstTime = false;
    		return true;
    	}
    	return ! checksumSame();
    }
    
    public  EncodedBlockData encode() {    	
        byte[] encodedBlock = ScreenVideoEncoder.encodePixels(pixels, getWidth(), getHeight()); 	        
        return new EncodedBlockData(position, encodedBlock);		
    }
    
    private boolean checksumSame() {
    	long oldsum;
        oldsum = checksum.getValue(); 
        calcChecksum();  
        return (oldsum == checksum.getValue());
    }
          
    private void calcChecksum() {
    	checksum.reset();   
    	int height = getHeight();
    	int width = getWidth();
	
		for (int i = 0; i < height; i++) {
		    for (int j = 0; j < width; j++) {
		    	if ((i * width + j) % 5 == 0)
		    		checksum.update(pixels[i * width + j]);
		    }
		}	 
    }

    public int getWidth() {
        return new Integer(dim.getWidth()).intValue();
    }
    
    public int getHeight() {
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

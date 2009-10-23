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
import java.util.zip.Adler32;

import org.bigbluebutton.deskshare.common.PixelExtractException;
import org.bigbluebutton.deskshare.common.ScreenVideoEncoder;
import org.bigbluebutton.deskshare.common.Dimension;

public final class BlockImp implements IBlock {    
    private final Adler32 checksum;
    private final Dimension dim;
    private final int position;
    private final Point location;
    
    private boolean isKeyFrame = false;
    private byte[] encodedBlock;
    private int[] pixels;
    
    private boolean encoded = false;

    BlockImp(Dimension dim, int position, Point location) {
        checksum = new Adler32();
        this.dim = dim;
        this.position = position;
        this.location = location;
    }
    
    public synchronized void updateBlock(BufferedImage capturedScreen, boolean isKeyFrame)
    {	
    	this.isKeyFrame = isKeyFrame;
    	
    	try {
			pixels = ScreenVideoEncoder.getPixels(capturedScreen, getX(), getY(), getWidth(), getHeight());
    	} catch (PixelExtractException e) {
    		System.out.println(e.toString());
    		encodedBlock = ScreenVideoEncoder.encodeBlockUnchanged();
		}
    }
    
    public synchronized byte[] encode() {
        long oldsum;
        oldsum = checksum.getValue(); 
        calcChecksum(pixels);

        if ((oldsum == checksum.getValue()) && !isKeyFrame) {
        	encodedBlock = ScreenVideoEncoder.encodeBlockUnchanged();  
        }
        else {
        	encodedBlock = ScreenVideoEncoder.encodePixels(pixels, getWidth(), getHeight(), false, isKeyFrame);
        }    	    	        
    	return encodedBlock;
    }
    
    public byte[] getEncodedBlock() {
    	return encodedBlock;
    }
    
    private synchronized void calcChecksum(int pixels[])
    {
    	checksum.reset();   
    	int height = getHeight();
    	int width = getWidth();
		for (int i = 0; i < height; i++) {
		    for (int j = 0; j < width; j++) {
		    	if ((i * width + i) % 13 == 0)
		    		checksum.update(pixels[i * width + j]);
		    }
		}	 
    }
    
    public synchronized boolean isKeyFrame() {
    	return isKeyFrame;
    }
    
    public synchronized boolean hasChanged() {
        long oldsum;
        oldsum = checksum.getValue(); 
        calcChecksum(pixels);

        return ((oldsum == checksum.getValue()) && !isKeyFrame);
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

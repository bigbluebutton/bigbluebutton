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
package org.bigbluebutton.deskshare.server.session;

import java.util.Random;

import org.bigbluebutton.deskshare.common.Dimension;

public class Block {
	Random random = new Random();
    private final Dimension dim;
//    private final int position;
 
    private boolean isKeyFrame = false;
    private byte[] encodedBlock;
//    private int[] pixels;
    
//    private boolean encoded = false;
    private boolean hasChanged = false;
//    private static int FORCE_UPDATE_DURATION = 10000;
    private int nextForceUpdate = 10000;
    private static int MIN_DURATION = 5000;
    private static int MAX_DURATION = 10000;
    private long lastChanged;
    
    Block(Dimension dim, int position) {
        this.dim = dim;
//        this.position = position;
    }
    
    public synchronized void update(byte[] videoData, boolean isKeyFrame)
    {	
    	this.isKeyFrame = isKeyFrame;
    	encodedBlock = videoData;
    	hasChanged = true;
    }
 
    public synchronized byte[] getEncodedBlock() {
    	hasChanged = false;
    	return encodedBlock;
    }
    
    public Dimension getDimension() {
    	return dim;
    }

	public boolean isKeyFrame() {
		return isKeyFrame;
	}
    
    public boolean hasChanged() {
    	return (hasChanged || forceUpdate());
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
}

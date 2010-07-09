/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * $Id: $
 */
package org.bigbluebutton.deskshare.server.svc1

import java.util.Random

class Block(val dim: Dimension, val position: Int) {

    val nextForceUpdate = 10000
    val MIN_DURATION = 5000
    val MAX_DURATION = 10000
    
    var isKeyFrame = false
    var hasChanged = false
    var lastChanged = 0L
    var encodedBlock: Array[Byte] = null
    
    val random: Random = new Random();
    
    def update(videoData: Array[Byte], isKeyFrame: Boolean): Unit =  {	
    	this.isKeyFrame = isKeyFrame;
    	encodedBlock = videoData;
    	hasChanged = true;
    }
 
    def getEncodedBlock(): Array[Byte] = {
    	hasChanged = false;
    	return encodedBlock;
    }
    
    def getDimension(): Dimension = {
    	return dim;
    }
    
    def hasBlockChanged(): Boolean = {
    	return (hasChanged || forceUpdate());
    }
    
    private def forceUpdate(): Boolean = {         
        val now: Long = System.currentTimeMillis();    
        val update: Boolean = ((now - lastChanged) > nextForceUpdate);
        if (update) {
        	nextUpdate();
        	lastChanged = now;  	
        }
        return update;
    }
    
    private def nextUpdate(): Unit = {
        //get the range, casting to long to avoid overflow problems
//        val range: Long = MAX_DURATION - (MIN_DURATION + 1)
        // compute a fraction of the range, 0 <= frac < range
//        val fraction: Long = (range * random.nextDouble())
//        nextForceUpdate =  (int)(fraction + 5000); 
 //       nextForceUpdate = 5000
    }
}

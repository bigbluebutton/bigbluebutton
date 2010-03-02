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

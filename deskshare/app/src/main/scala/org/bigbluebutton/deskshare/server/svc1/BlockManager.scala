/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/
package org.bigbluebutton.deskshare.server.svc1

import java.io.ByteArrayOutputStream
import java.util.concurrent.ConcurrentHashMap
import org.bigbluebutton.deskshare.common.ScreenVideoEncoder
import org.bigbluebutton.deskshare.server.session.ScreenVideoFrame
import net.lag.logging.Logger

class BlockManager(room: String, screenDim: Dimension, blockDim: Dimension, waitForAllBlocks: Boolean, useSVC2: Boolean) extends BlockFactory {
    private val log = Logger.get
    
	private var blocksMap = new ConcurrentHashMap[Int, Block]
	
	private var numberOfRows = getNumberOfRows(screenDim, blockDim)
	private var numberOfColumns = getNumberOfColumns(screenDim, blockDim)
    private var lastFrameTime = 0L
    private var lastKeyFrameTime = 0L
    private val KEYFRAME_INTERVAL = 20000
    private var rowToUpdate = 1
    private var startTime = 0L
	private var gotAllBlocksTime = 0L
	private var gotAllBlocks = false;
	
	def initialize(): Unit = {
		println("Initialize BlockManager")
		val numberOfBlocks: Int = numberOfRows * numberOfColumns
		for (position: Int <- 1 to numberOfBlocks) {
			var block: Block = createBlock(screenDim, blockDim, position)
			val dim: Dimension = block.getDimension();
//			var blankPixels = new Array[Int](dim.width * dim.height)
//			for (i: Int <- 0 until blankPixels.length) {
//				blankPixels(i) = 0xCECECE;
//			}
//			val encodedPixels = ScreenVideoEncoder.encodePixels(blankPixels, dim.width, dim.height)
//			block.update(encodedPixels, true, 0)
			blocksMap.put(position, block)
		}
		
		startTime = System.currentTimeMillis()
	}
	
	def updateBlock(position: Int, videoData: Array[Byte], keyFrame: Boolean, seqNum: Int): Unit = {
		val block: Block = blocksMap.get(position)
		block.update(videoData, keyFrame, seqNum)
		
		if (! gotAllBlocks ) {
		  val numberOfBlocks = numberOfRows * numberOfColumns
    	  gotAllBlocks = allBlocksReceived(numberOfBlocks)
    	}
	}
	
	def hasReceivedAllBlocks():Boolean = {
	  gotAllBlocks;
	}
	
	private def allBlocksReceived(numberOfBlocks: Int):Boolean = {
		for (position: Int <- 1 to numberOfBlocks) {
		  var block: Block = blocksMap.get(position)
		  if (!block.firstBlockReceived) {
		    return false;
		  }
		}
		gotAllBlocksTime = System.currentTimeMillis()
		log.info("Received all blocks in " + (gotAllBlocksTime - startTime) + " ms.")
		return true;
	}
	
	def generateFrame(genKeyFrame: Boolean): Array[Byte] = {
		var screenVideoFrame: ByteArrayOutputStream = new ByteArrayOutputStream()
		val encodedDim: Array[Byte] = ScreenVideoEncoder.encodeBlockAndScreenDimensions(blockDim.width, screenDim.width, blockDim.height, screenDim.height)
     	    	
    	val numberOfBlocks = numberOfRows * numberOfColumns 		
    	val videoDataHeader: Byte = ScreenVideoEncoder.encodeFlvVideoDataHeader(genKeyFrame, useSVC2)
    		    		
    	screenVideoFrame.write(videoDataHeader)
    	screenVideoFrame.write(encodedDim)
    	
    	if (useSVC2) {
    	  val flags : Byte = 0; // 6 bits reserved (0); HasIFrameImage=0; HasPaletteInfo=0
    	  screenVideoFrame.write(flags);
    	}
    			
    	for (position: Int <- 1 to numberOfBlocks)  {
    		var block: Block = blocksMap.get(position)
    		var encodedBlock: Array[Byte] = ScreenVideoEncoder.encodeBlockUnchanged()
    		if (waitForAllBlocks && !gotAllBlocks) {
    		  // We need to wait for all the blocks. Just encode a blank block.
    		  encodedBlock = block.getEncodedBlock(true);
    		} else {
	    		if (block.hasChanged || (position/numberOfColumns == rowToUpdate) || genKeyFrame) {    		
	    			encodedBlock = block.getEncodedBlock(false);
	//    			println("Encoded block length[" + position + "] = " + encodedBlock.length)
	    		}    		  
    		}

    		screenVideoFrame.write(encodedBlock, 0, encodedBlock.length)
    	}

		rowToUpdate += 1;
		if (rowToUpdate > numberOfRows) rowToUpdate = 1;
    	
//		println("Key=" + genKeyFrame + " frame length=" + screenVideoFrame.toByteArray.length)
		
    	return screenVideoFrame.toByteArray	
	}
}

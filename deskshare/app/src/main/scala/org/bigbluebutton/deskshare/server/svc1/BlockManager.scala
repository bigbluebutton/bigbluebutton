/** 
* ===License Header===
*
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
* 
* ===License Header===
*/
package org.bigbluebutton.deskshare.server.svc1

import java.io.ByteArrayOutputStream

import java.util.concurrent.ConcurrentHashMap
import org.bigbluebutton.deskshare.common.ScreenVideoEncoder
import org.bigbluebutton.deskshare.server.session.ScreenVideoFrame

class BlockManager(room: String, screenDim: Dimension, blockDim: Dimension) extends BlockFactory {
   
	private var blocksMap = new ConcurrentHashMap[Integer, Block]
	
	private var numberOfRows = getNumberOfRows(screenDim, blockDim)
	private var numberOfColumns = getNumberOfColumns(screenDim, blockDim)
    private var lastFrameTime = 0L
    private var lastKeyFrameTime = 0L
    private val KEYFRAME_INTERVAL = 20000
    private var blockToUpdate = 1;
    
	def initialize(): Unit = {
		println("Initialize BlockManager")
		val numberOfBlocks: Int = numberOfRows * numberOfColumns
		for (position: Int <- 1 to numberOfBlocks) {
			var block: Block = createBlock(screenDim, blockDim, position)
			val dim: Dimension = block.getDimension();
			var blankPixels = new Array[Int](dim.width * dim.height)
			for (i: Int <- 0 until blankPixels.length) {
				blankPixels(i) = 0xF;
			}
			val encodedPixels = ScreenVideoEncoder.encodePixels(blankPixels, dim.width, dim.height)
			block.update(encodedPixels, true, 0)
			blocksMap.put(position, block)
		}
	}
	
	def updateBlock(position: Int, videoData: Array[Byte], keyFrame: Boolean, seqNum: Int): Unit = {
		val block: Block = blocksMap.get(position)
		block.update(videoData, keyFrame, seqNum)
	}
	
	def generateFrame(genKeyFrame: Boolean): Array[Byte] = {
		var screenVideoFrame: ByteArrayOutputStream = new ByteArrayOutputStream()
		
		val encodedDim: Array[Byte] = ScreenVideoEncoder.encodeBlockAndScreenDimensions(blockDim.width, screenDim.width, blockDim.height, screenDim.height)
     	    	
    	val numberOfBlocks = numberOfRows * numberOfColumns 		
    	val videoDataHeader: Byte = ScreenVideoEncoder.encodeFlvVideoDataHeader(genKeyFrame)
    		    		
    	screenVideoFrame.write(videoDataHeader)
    	screenVideoFrame.write(encodedDim)
    		
    	for (position: Int <- 1 to numberOfBlocks)  {
    		var block: Block = blocksMap.get(position)
    		var encodedBlock: Array[Byte] = ScreenVideoEncoder.encodeBlockUnchanged()
    		if (block.hasChanged || (position == blockToUpdate)) {    		
    			encodedBlock = block.getEncodedBlock();
//    			println("Encoded block length[" + position + "] = " + encodedBlock.length)
    		}
    		screenVideoFrame.write(encodedBlock, 0, encodedBlock.length)
    	}

		blockToUpdate += 1;
		if (blockToUpdate > numberOfBlocks) blockToUpdate = 1;
    			
    	return screenVideoFrame.toByteArray	
	}
}

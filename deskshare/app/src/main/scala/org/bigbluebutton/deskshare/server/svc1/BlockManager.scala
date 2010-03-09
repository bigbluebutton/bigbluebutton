package org.bigbluebutton.deskshare.server.svc1

import java.io.ByteArrayOutputStream

import java.util.concurrent.ConcurrentHashMap
import org.bigbluebutton.deskshare.common.ScreenVideoEncoder
import org.bigbluebutton.deskshare.server.session.ScreenVideoFrame

class BlockManager(room: String, screenDim: Dimension, blockDim: Dimension) extends BlockFactory {
   
	private val blocksMap = new ConcurrentHashMap[Integer, Block]
	
	private var numberOfRows = getNumberOfRows(screenDim, blockDim)
	private var numberOfColumns = getNumberOfColumns(screenDim, blockDim)
    private var lastFrameTime = 0L
    private var lastKeyFrameTime = 0L
    private val KEYFRAME_INTERVAL = 20000
    
    private var screenVideoFrame: ByteArrayOutputStream = new ByteArrayOutputStream()
    
	def initialize(): Unit = {
		println("Initialize BlockManager")
		val numberOfBlocks: Int = numberOfRows * numberOfColumns
		for (position: Int <- 1 to numberOfBlocks) {
			var block: Block = createBlock(screenDim, blockDim, position)
			val dim: Dimension = block.getDimension();
			var blankPixels = new Array[Int](dim.width * dim.height)
			for (i: Int <- 0 until blankPixels.length) {
				blankPixels(i) = 0xFFFF;
			}
			val encodedPixels = ScreenVideoEncoder.encodePixels(blankPixels, dim.width, dim.height)
			block.update(encodedPixels, true)
			blocksMap.put(position, block)
		}
	}
	
	def updateBlock(position: Int, videoData: Array[Byte], keyFrame: Boolean): Unit = {
		val block: Block = blocksMap.get(position)
		block.update(videoData, keyFrame)
	}
	
	def generateFrame(genKeyFrame: Boolean): Array[Byte] = {
		screenVideoFrame.reset();
		val encodedDim: Array[Byte] = ScreenVideoEncoder.encodeBlockAndScreenDimensions(blockDim.width, screenDim.width, blockDim.height, screenDim.height)
     	    	
    	val numberOfBlocks = numberOfRows * numberOfColumns 		
    	val videoDataHeader: Byte = ScreenVideoEncoder.encodeFlvVideoDataHeader(genKeyFrame)
    		    		
    	screenVideoFrame.write(videoDataHeader)
    	screenVideoFrame.write(encodedDim)
    		
    	for (position: Int <- 1 to numberOfBlocks)  {
    		var block: Block = blocksMap.get(position)
    		var encodedBlock: Array[Byte] = ScreenVideoEncoder.encodeBlockUnchanged()
    		if (block.hasChanged || genKeyFrame) {    		
    			encodedBlock = block.getEncodedBlock();
    		}
    		screenVideoFrame.write(encodedBlock, 0, encodedBlock.length)
    	}
     
    	return screenVideoFrame.toByteArray	
	}
}

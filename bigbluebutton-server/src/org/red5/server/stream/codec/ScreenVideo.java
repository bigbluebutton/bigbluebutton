package org.red5.server.stream.codec;

/*
 * RED5 Open Source Flash Server - http://www.osflash.org/red5
 * 
 * Copyright (c) 2006-2007 by respective authors (see below). All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 2.1 of the License, or (at your option) any later 
 * version. 
 * 
 * This library is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with this library; if not, write to the Free Software Foundation, Inc., 
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA 
 */

import org.apache.mina.common.ByteBuffer;
import org.red5.server.api.stream.IVideoStreamCodec;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * Red5 video codec for the screen capture format.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 */
public class ScreenVideo implements IVideoStreamCodec {
    
    /** The log. */
	private Logger log = LoggerFactory.getLogger(ScreenVideo.class);
    
    /** FLV codec name constant. */
	static final String CODEC_NAME = "ScreenVideo";
    
    /** FLV frame key marker constant. */
	static final byte FLV_FRAME_KEY = 0x10;
    
    /** FLV codec screen marker constant. */
	static final byte FLV_CODEC_SCREEN = 0x03;
    
    /** Block data. */
	private byte[] blockData;
    
    /** Block size. */
	private int[] blockSize;
    
    /** Video width. */
	private int width;
    
    /** Video height. */
	private int height;
    
    /** Width info. */
	private int widthInfo;
    
    /** Height info. */
	private int heightInfo;
    
    /** Block width. */
	private int blockWidth;
    
    /** Block height. */
	private int blockHeight;
    
    /** Number of blocks. */
	private int blockCount;
    
    /** Block data size. */
	private int blockDataSize;
    
    /** Total block data size. */
	private int totalBlockDataSize;

	/**
	 * Constructs a new ScreenVideo.
	 */
    public ScreenVideo() {
		this.reset();
	}

	/** {@inheritDoc} */
    public String getName() {
		return CODEC_NAME;
	}

	/** {@inheritDoc} */
    public void reset() {
		this.blockData = null;
		this.blockSize = null;
		this.width = 0;
		this.height = 0;
		this.widthInfo = 0;
		this.heightInfo = 0;
		this.blockWidth = 0;
		this.blockHeight = 0;
		this.blockCount = 0;
		this.blockDataSize = 0;
		this.totalBlockDataSize = 0;
	}

	/** {@inheritDoc} */
    public boolean canHandleData(ByteBuffer data) {
		byte first = data.get();
		boolean result = ((first & 0x0f) == FLV_CODEC_SCREEN);
		data.rewind();
		return result;
	}

	/** {@inheritDoc} */
    public boolean canDropFrames() {
		return false;
	}

	/*
	 * This uses the same algorithm as "compressBound" from zlib
	 */
	/**
	 * Max compressed size.
	 * 
	 * @param size the size
	 * 
	 * @return the int
	 */
	private int maxCompressedSize(int size) {
		return size + (size >> 12) + (size >> 14) + 11;
	}

    /**
     * Update total block size.
     * 
     * @param data      Byte buffer
     */
	private void updateSize(ByteBuffer data) {
		this.widthInfo = data.getShort();
		this.heightInfo = data.getShort();
		// extract width and height of the frame
		this.width = this.widthInfo & 0xfff;
		this.height = this.heightInfo & 0xfff;
		// calculate size of blocks
		this.blockWidth = this.widthInfo & 0xf000; 
		this.blockWidth = (this.blockWidth >> 12) + 1;
		this.blockWidth <<= 4;
		
		this.blockHeight = this.heightInfo & 0xf000;
		this.blockHeight = (this.blockHeight >> 12) + 1;
		this.blockHeight <<= 4;

		int xblocks = this.width / this.blockWidth;
		if ((this.width % this.blockWidth) != 0) {
			// partial block
			xblocks += 1;
		}

		int yblocks = this.height / this.blockHeight;
		if ((this.height % this.blockHeight) != 0) {
			// partial block
			yblocks += 1;
		}

		this.blockCount = xblocks * yblocks;

		int blockSize = this.maxCompressedSize(this.blockWidth
				* this.blockHeight * 3);
		int totalBlockSize = blockSize * this.blockCount;
		if (this.totalBlockDataSize != totalBlockSize) {
			log.info("Allocating memory for " + this.blockCount
					+ " compressed blocks.");
			this.blockDataSize = blockSize;
			this.totalBlockDataSize = totalBlockSize;
			this.blockData = new byte[blockSize * this.blockCount];
			this.blockSize = new int[blockSize * this.blockCount];
			// Reset the sizes to zero
			for (int idx = 0; idx < this.blockCount; idx++) {
				this.blockSize[idx] = 0;
			}
		}
	}

	/** {@inheritDoc} */
    public boolean addData(ByteBuffer data) {
		if (!this.canHandleData(data)) {
			return false;
		}

		data.get();
		this.updateSize(data);
		int idx = 0;
		int pos = 0;
		byte[] tmpData = new byte[this.blockDataSize];

		int countBlocks = this.blockCount;
		while (data.remaining() > 0 && countBlocks > 0) {
			short size = data.getShort();
			countBlocks--;
			if (size == 0) {
				// Block has not been modified
				idx += 1;
				pos += this.blockDataSize;
				continue;
			}

			// Store new block data
			this.blockSize[idx] = size;
			data.get(tmpData, 0, size);
			System.arraycopy(tmpData, 0, this.blockData, pos, size);
			idx += 1;
			pos += this.blockDataSize;
		}

		data.rewind();
		return true;
	}

	/** {@inheritDoc} */
    public ByteBuffer getKeyframe() {
		ByteBuffer result = ByteBuffer.allocate(1024);
		result.setAutoExpand(true);

		// Header
		result.put((byte) (FLV_FRAME_KEY | FLV_CODEC_SCREEN));

		// Frame size
		result.putShort((short) this.widthInfo);
		result.putShort((short) this.heightInfo);

		// Get compressed blocks
		byte[] tmpData = new byte[this.blockDataSize];
		int pos = 0;
		for (int idx = 0; idx < this.blockCount; idx++) {
			int size = this.blockSize[idx];
			if (size == 0) {
				// this should not happen: no data for this block
				return null;
			}

			result.putShort((short) size);
			System.arraycopy(this.blockData, pos, tmpData, 0, size);
			result.put(tmpData, 0, size);
			pos += this.blockDataSize;
		}

		result.rewind();
		return result;
	}

}

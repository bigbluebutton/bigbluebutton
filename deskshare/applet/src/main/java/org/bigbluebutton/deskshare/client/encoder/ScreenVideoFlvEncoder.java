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
package org.bigbluebutton.deskshare.client.encoder;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

public final class ScreenVideoFlvEncoder {
	private final static byte[] flvHeader = {'F','L','V',0x01,0x01,0x00,0x00,0x00,0x09};
	private final static byte[] videoTagType = {0x09};
	private final static byte[] streamId = {0, 0, 0};
	private long startTimestamp = 0;
	private boolean firstTag = true;
	
	private static byte FLV_TAG_HEADER_SIZE = 11;
	
	ByteArrayOutputStream flvDataStream = new ByteArrayOutputStream();
	
	public byte[] encodeHeader() {
		byte[] prevTagSize =  encodePreviousTagSize(0);
		byte[] header = new byte[flvHeader.length + prevTagSize.length];
		
		System.arraycopy(flvHeader, 0, header, 0, flvHeader.length);
		System.arraycopy(prevTagSize, 0, header, flvHeader.length, prevTagSize.length);
		return header;
	}
	
    private byte[] encodePreviousTagSize(long previousTagSize) {    	
    	int byte1 = (int)previousTagSize >> 24;
    	int byte2 = (int)previousTagSize >> 16;
    	int byte3 = (int)previousTagSize >> 8;
    	int byte4 = (int)previousTagSize & 0xff;
    	
    	return new byte[] {(byte)byte1, (byte)byte2, (byte)byte3, (byte)byte4};
    }
    
    public byte[] encodeFlvData (ByteArrayOutputStream screenVideoData) throws FlvEncodeException {
        byte[] blockData = screenVideoData.toByteArray();

        byte[] flvData;
		try {
			flvData = encodeFlvTag(blockData);
		} catch (IOException e) {
			throw new FlvEncodeException("Failed to encode FLV data.");
		}   
        return flvData;
	}
	
	private byte[] encodeFlvTag(byte[] videoData) throws IOException {   

		flvDataStream.reset();
		
		flvDataStream.write(videoTagType);
		flvDataStream.write(encodeDataSize(videoData.length));
	    flvDataStream.write(encodeTimestamp());
	    flvDataStream.write(streamId);
	    flvDataStream.write(videoData);
	    flvDataStream.write(encodePreviousTagSize(FLV_TAG_HEADER_SIZE + videoData.length));
	    
	    return flvDataStream.toByteArray();
	}	
	        
    private byte[] encodeDataSize(int size) {
    	int byte1 = (size >> 16);
    	int byte2 = (size >> 8);
    	int byte3 = (size & 0x0ff);
    	
    	return new byte[] {(byte) byte1, (byte) byte2, (byte) byte3};
    }
    
    private byte[] encodeTimestamp() {
    	long now = System.currentTimeMillis();
    	
    	if (firstTag) {
    		startTimestamp = now;
    		firstTag = false;
    	}
    	
    	long elapsed = now - startTimestamp;
    	
    	int byte1 = (int)(elapsed & 0xff0000) >> 16;
    	int byte2 = (int)(elapsed & 0xff00) >> 8;
    	int byte3 = (int)(elapsed & 0xff);
    	int tsExtended = ((int)elapsed & 0xff000000) >> 24;
    	
    	return new byte[] {(byte) byte1, (byte) byte2, (byte) byte3, (byte) tsExtended};    		    	
    }   
}

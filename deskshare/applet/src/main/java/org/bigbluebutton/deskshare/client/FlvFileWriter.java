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
package org.bigbluebutton.deskshare.client;

import java.io.ByteArrayOutputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;

public class FlvFileWriter {

	private FileOutputStream fo;
	
	private long previousTagSize = 0;
	private final static byte[] header = {'F','L','V',0x01,0x01,0x00,0x00,0x00,0x09};
	private static final byte[] videoTagType = {0x09};
	private static final byte[] streamId = {0, 0, 0};
	private int dataSize = 0;
	private long startTimestamp = 0;
	private boolean firstTag = true;
	
	private static byte FLV_TAG_HEADER_SIZE = 11;
	
	public void init() {
		setupFlvFile();
	}
	
    public void writeDataToFile (ByteArrayOutputStream videoData) {

    		int size = videoData.size();
            byte[] blockData = videoData.toByteArray();
            
            try {
                writePreviousTagSize();
                writeFlvTag(blockData, size);                              
            } catch(Exception e) {
                System.out.println("exception: "+e.getMessage());
            }
    }
    
    private void writeFlvTag(byte[] videoData, int size) throws IOException {       
        writeTagType();
        writeDataSize(size);
        writeTimestamp();
        writeStreamId();
        writeVideoData(videoData);
    }
    
    private void setupFlvFile() {
    	try {
			fo = new FileOutputStream("D://temp/"+"ApiDemo.flv");
			fo.write(header);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
    }
    
    private void writePreviousTagSize() throws IOException {
    	
    	int byte1 = (int)previousTagSize >> 24;
    	int byte2 = (int)previousTagSize >> 16;
    	int byte3 = (int)previousTagSize >> 8;
    	int byte4 = (int)previousTagSize & 0xff;
    	
 //   	System.out.println("PrevTagSize: dec=" + previousTagSize + " hex=" + Long.toHexString(previousTagSize) + " bytes= " 
 //   			+ Integer.toHexString(byte1) + " " + Integer.toHexString(byte2) 
 //   			+ " " + Integer.toHexString(byte3) + " " + Integer.toHexString(byte4));
    	
    	fo.write(byte1);
    	fo.write(byte2);
    	fo.write(byte3);
    	fo.write(byte4);
    }
    
    private void writeTagType() throws IOException {
    	fo.write(videoTagType);
    }
    
    private void writeDataSize(int size) throws IOException {
    	int byte1 = (size >> 16);
    	int byte2 = (size >> 8);
    	int byte3 = (size & 0x0ff);
    	
//    	System.out.println("DataSize: dec=" + size + " hex=" + Integer.toHexString(size) + " bytes= " 
////    			+ Integer.toHexString(byte1) + " " + Integer.toHexString(byte2) 
 //   			+ " " + Integer.toHexString(byte3));
    	
    	fo.write(byte1);
    	fo.write(byte2);
    	fo.write(byte3);
    	
    	previousTagSize = FLV_TAG_HEADER_SIZE + size;
    }
    
    private void writeTimestamp() throws IOException {
    	long now = System.currentTimeMillis();
    	
    	if (firstTag) {
    		startTimestamp = now;
    		firstTag = false;
    	}
    	
    	long elapsed = now - startTimestamp;
    	
    	int fb = (int)(elapsed & 0xff0000) >> 16;
    	int sb = (int)(elapsed & 0xff00) >> 8;
    	int tb = (int)(elapsed & 0xff);
    	int ub = ((int)elapsed & 0xff000000) >> 24;
    	
//    	System.out.println("timestamp: dec=" + elapsed + " hex=" + Long.toHexString(elapsed) + " bytes=" + 
//    			Integer.toHexString(fb) + " " + Integer.toHexString(sb) + " " + Integer.toHexString(tb) + " " + Integer.toHexString(ub));
    	
    	fo.write(fb);
    	fo.write(sb);
    	fo.write(tb);
    	
    	fo.write(ub );
    	
    }
    
    private void writeStreamId() throws IOException {
    	fo.write(streamId);
    }
    
    private void writeVideoData(byte[] videoData) throws IOException {
    	fo.write(videoData);
    }
    
    public void stop() {
    	try {
    		System.out.println("Closing stream");
			fo.close();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
    }
}

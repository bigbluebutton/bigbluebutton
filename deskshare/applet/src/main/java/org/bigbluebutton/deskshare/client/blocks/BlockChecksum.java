package org.bigbluebutton.deskshare.client.blocks;

import java.util.zip.Adler32;

/*
 * Provides a wrapper for the checksum of a block so we can syncronize properly.
 */
class BlockChecksum {
	private final Adler32 checksum;
	
	public BlockChecksum() {
		checksum = new Adler32();
	}
	
	public synchronized boolean isChecksumSame(byte[] pixels) {
	    long oldsum = checksum.getValue(); 
	    checksum.reset();
	    checksum.update(pixels); 
	    return (oldsum == checksum.getValue());	
	}
	
	public synchronized void reset() {
		checksum.reset();
	}
}

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

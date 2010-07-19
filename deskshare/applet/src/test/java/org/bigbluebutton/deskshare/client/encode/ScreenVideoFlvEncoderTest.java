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

package org.bigbluebutton.deskshare.client.encode;

import org.bigbluebutton.deskshare.client.encoder.ScreenVideoFlvEncoder;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

public class ScreenVideoFlvEncoderTest {
	
	@BeforeMethod 
	public void setUp() {
		
	}
	
	@Test
	public void testEncodeFlvHeader() {
		final byte[] flvHeaderPlusPrevTagSize = {'F','L','V',0x01,0x01,0x00,0x00,0x00,0x09,0,0,0,0};
		ScreenVideoFlvEncoder svf = new ScreenVideoFlvEncoder();
		
		byte[] header = svf.encodeHeader();
		Assert.assertEquals(header, flvHeaderPlusPrevTagSize);
	}
	

	
}

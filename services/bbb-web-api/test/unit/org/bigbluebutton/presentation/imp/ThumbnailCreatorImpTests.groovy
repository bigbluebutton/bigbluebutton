/* BigBlueButton - http://www.bigbluebutton.org
 * 
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
 * Author: Richard Alam <ritzalam@gmail.com>
 * 		   DJP <DJP@architectes.org>
 * 
 * @version $Id: $
 */
package org.bigbluebutton.presentation.imp

import org.bigbluebutton.presentation.ThumbnailCreator

class ThumbnailCreatorImpTests extends GroovyTestCase {

	ThumbnailCreator tc
	static final String IMAGEMAGICK_DIR = "/usr/bin"
	static final String PRESENTATIONDIR = '/tmp/var/bigbluebutton'
	static final String BLANK_THUMBNAIL = '/var/bigbluebutton/blank/blank-thumb.png'
	
	void setUp() {
		println "Test setup"
		tc = new ThumbnailCreatorImp()		
		tc.imageMagickDir = IMAGEMAGICK_DIR	
		tc.blankThumbnail = BLANK_THUMBNAIL
	}
	
    void testCreateThumbnails() {
		def uploadedFilename = 'SeveralBigPagesPresentation.pdf'		
		def uploadedFile = new File("test/resources/$uploadedFilename")
		def conf = "test-conf"
		def rm = "test-room"
		def presName = "thumbs"
						    	    	
		def uploadedPresentation = new File("$PRESENTATIONDIR/$conf/$rm/$presName/$uploadedFilename")
		int copied = FileCopyUtils.copy(uploadedFile, uploadedPresentation) 
		assertTrue(uploadedPresentation.exists())
		
		boolean success = tc.createThumbnails(uploadedPresentation, 5)
		
		assertTrue success

    }
 
    void testFailToCreateThumbnails() {
		def uploadedFilename = 'CaratulasManualesNutrisol.pdf'	
		def uploadedFile = new File("test/resources/$uploadedFilename")
		def conf = "test-conf"
		def rm = "test-room"
		def presName = "thumbs"
						    	    	
		def uploadedPresentation = new File("$PRESENTATIONDIR/$conf/$rm/$presName/$uploadedFilename")
		int copied = FileCopyUtils.copy(uploadedFile, uploadedPresentation) 
		assertTrue(uploadedPresentation.exists())
		
		boolean success = tc.createThumbnails(uploadedPresentation, 2)
		
		assertTrue success

    }
    
    void testCreateBlankThumbnails() {
    	tc.createBlankThumbnails(new File("/tmp/var/bigbluebutton/test-conf/test-room/thumbs/thumbnails"), 5)
    }
    
    void tearDown() {
    	println "Test Teardown"
    }
}

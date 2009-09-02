package org.bigbluebutton.presentation

import org.springframework.util.FileCopyUtils

class ThumbnailCreatorImpTests extends GroovyTestCase {

	ThumbnailCreator tc
	static final String IMAGEMAGICK_DIR = "/usr/bin"
	static final String PRESENTATIONDIR = '/var/bigbluebutton'
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
		def uploadedFilename = 'Caratulas Manuales Nutrisol.pdf'	
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
    	tc.createBlankThumbnails(new File("/var/bigbluebutton/test-conf/test-room/thumbs/thumbnails"), 5)
    }
    
    void tearDown() {
    	println "Test Teardown"
    }
}

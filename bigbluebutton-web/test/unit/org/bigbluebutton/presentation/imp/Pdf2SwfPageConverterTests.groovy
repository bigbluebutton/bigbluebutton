package org.bigbluebutton.presentation.imp

import org.springframework.util.FileCopyUtils
import org.bigbluebutton.presentation.Util

class Pdf2SwfPageConverterTests extends GroovyTestCase {

	def pageConverter
	def SWFTOOLS_DIR = '/bin'
	def BLANK_SLIDE = '/var/bigbluebutton/blank/blank-slide.swf'
	static final String PRESENTATIONDIR = '/tmp/var/bigbluebutton'

	def conf = "test-conf"
	def rm = "test-room"
	def presName = "thumbs"
	def presDir
		
	void setUp() {
		println "Test setup"
		pageConverter = new Pdf2SwfPageConverter()		
		pageConverter.setSwfToolsDir(SWFTOOLS_DIR)	
		
		presDir = new File("$PRESENTATIONDIR/$conf/$rm/$presName")
		if (presDir.exists()) Util.deleteDirectory(presDir)
		
		presDir.mkdirs()
	}
	
    void testConvertSlidesSuccessfully() {
		def uploadedFilename = 'SeveralBigPagesPresentation.pdf'		
		def uploadedFile = new File("test/resources/$uploadedFilename")
							    	    	
		def uploadedPresentation = new File("$PRESENTATIONDIR/$conf/$rm/$presName/$uploadedFilename")
		int copied = FileCopyUtils.copy(uploadedFile, uploadedPresentation) 
		assertTrue(uploadedPresentation.exists())
		
		int page = 1
		File output = new File(uploadedPresentation.getParent() + File.separatorChar + "slide-" + page + ".swf")
		
		boolean success = pageConverter.convert(uploadedPresentation, output, page)
		assertTrue success
		
		page = 3
		output = new File(uploadedPresentation.getParent() + File.separatorChar + "slide-" + page + ".swf")
		success = pageConverter.convert(uploadedPresentation, output, page)
		assertFalse success
    }

    void testConvertSlidesFail() {
		def uploadedFilename = 'SeveralBigPagesPresentation.pdf'		
		def uploadedFile = new File("test/resources/$uploadedFilename")
							    	    	
		def uploadedPresentation = new File("$PRESENTATIONDIR/$conf/$rm/$presName/$uploadedFilename")
		int copied = FileCopyUtils.copy(uploadedFile, uploadedPresentation) 
		assertTrue(uploadedPresentation.exists())
				
		int page = 3
		File output = new File(uploadedPresentation.getParent() + File.separatorChar + "slide-" + page + ".swf")
		boolean success = pageConverter.convert(uploadedPresentation, output, page)
		assertFalse success
    }
    
    void tearDown() {
    	 
    }	
}

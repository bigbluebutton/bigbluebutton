package org.bigbluebutton.presentation

import org.springframework.util.FileCopyUtils

class Jpeg2SwfPageConverterTests extends GroovyTestCase {

	def pageConverter
	def SWFTOOLS_DIR = '/bin'
	def BLANK_SLIDE = '/var/bigbluebutton/blank/blank-slide.swf'
	static final String PRESENTATIONDIR = '/var/bigbluebutton'

	def conf = "test-conf"
	def rm = "test-room"
	def presName = "thumbs"
	def presDir
		
	void setUp() {
		println "Test setup"
		pageConverter = new Jpeg2SwfPageConverter()		
		pageConverter.setSwfToolsDir(SWFTOOLS_DIR)	

		presDir = new File("$PRESENTATIONDIR/$conf/$rm/$presName")
		if (presDir.exists()) Util.deleteDirectory(presDir)
		
		presDir.mkdirs()
	}
	
    void testConvertSlidesSuccessfully() {
		def uploadedFilename = 'sampleslide.jpeg'		
		def uploadedFile = new File("test/resources/$uploadedFilename")
							    	    	
		def uploadedPresentation = new File("$PRESENTATIONDIR/$conf/$rm/$presName/$uploadedFilename")
		int copied = FileCopyUtils.copy(uploadedFile, uploadedPresentation) 
		assertTrue(uploadedPresentation.exists())
		
		int page = 1
		File output = new File(uploadedPresentation.getParent() + File.separatorChar + "slide-" + page + ".swf")
		
		boolean success = pageConverter.convert(uploadedPresentation, output, page)
		assertTrue success

    }
}

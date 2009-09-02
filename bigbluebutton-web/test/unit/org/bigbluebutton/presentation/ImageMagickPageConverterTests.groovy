package org.bigbluebutton.presentation

import org.springframework.util.FileCopyUtils

class ImageMagickPageConverterTests extends GroovyTestCase {

	def pageConverter
	def IMAGEMAGICK_DIR = '/usr/bin'
	static final String PRESENTATIONDIR = '/var/bigbluebutton'

	def conf = "test-conf"
	def rm = "test-room"
	def presName = "thumbs"	
	def presDir
		
	void setUp() {
		println "Test setup"
		pageConverter = new ImageMagickPageConverter()		
		pageConverter.setImageMagickDir(IMAGEMAGICK_DIR)	

		presDir = new File("$PRESENTATIONDIR/$conf/$rm/$presName")
		if (presDir.exists()) Util.deleteDirectory(presDir)
		
		presDir.mkdirs()
	}
	
    void testConvertSuccess() {
		def uploadedFilename = 'big.pdf'		
		def uploadedFile = new File("test/resources/$uploadedFilename")
			
		def uploadedPresentation = new File(presDir.absolutePath + "/$uploadedFilename")
		int copied = FileCopyUtils.copy(uploadedFile, uploadedPresentation) 
		assertTrue(uploadedPresentation.exists())

		def tempDir = new File(uploadedPresentation.getParent() + File.separatorChar + "temp")
		tempDir.mkdir()
		
		int page = 1
		File outFile = new File(tempDir.getAbsolutePath() + "/temp-${page}.jpeg")
		
		boolean success = pageConverter.convert(uploadedPresentation, outFile, page)
		assertTrue success
				  	
    }
}

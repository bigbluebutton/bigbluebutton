package org.bigbluebutton.presentation.imp

import org.springframework.util.FileCopyUtils
import org.bigbluebutton.presentation.Util

class Pdf2SwfPageCounterTests extends GroovyTestCase {

	def pageCounter
	def SWFTOOLS_DIR = '/bin'
	static final String PRESENTATIONDIR = '/tmp/var/bigbluebutton'

	def conf = "test-conf"
	def rm = "test-room"
	def presName = "thumbs"	
	def presDir
			
	void setUp() {
		println "Test setup"
		pageCounter = new Pdf2SwfPageCounter()		
		pageCounter.setSwfToolsDir(SWFTOOLS_DIR)	
		
		presDir = new File("$PRESENTATIONDIR/$conf/$rm/$presName")
		if (presDir.exists()) Util.deleteDirectory(presDir)
		
		presDir.mkdirs()
	}
	
	
    void testCountPresentationPages() {
		def uploadedFilename = 'SeveralBigPagesPresentation.pdf'		
		def uploadedFile = new File("test/resources/$uploadedFilename")
			
		def uploadedPresentation = new File(presDir.absolutePath + "/$uploadedFilename")
		int copied = FileCopyUtils.copy(uploadedFile, uploadedPresentation) 
		assertTrue(uploadedPresentation.exists())
				
		int numPages = pageCounter.countNumberOfPages(uploadedPresentation)
   	
		assertEquals 5, numPages
    }
}

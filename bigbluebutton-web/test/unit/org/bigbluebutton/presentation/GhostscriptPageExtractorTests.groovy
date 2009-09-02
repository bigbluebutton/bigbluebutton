package org.bigbluebutton.presentation

import org.springframework.util.FileCopyUtils

class GhostscriptPageExtractorTests extends GroovyTestCase {

	def pageExtractor
	def GS_EXEC = '/usr/bin/gs'
	static final String PRESENTATIONDIR = '/var/bigbluebutton'
	def noPdfMarkWorkaround = "/etc/bigbluebutton/nopdfmark.ps"
	
	def conf = "test-conf"
	def rm = "test-room"
	def presName = "thumbs"	
	def presDir
		
	void setUp() {
		println "Test setup"
		pageExtractor = new GhostscriptPageExtractor()		
		pageExtractor.setGhostscriptExec(GS_EXEC)	
		pageExtractor.setNoPdfMarkWorkaround(noPdfMarkWorkaround)
		
		presDir = new File("$PRESENTATIONDIR/$conf/$rm/$presName")
		if (presDir.exists()) Util.deleteDirectory(presDir)
		
		presDir.mkdirs()
	}
	
    void testExtractPage() {
		def uploadedFilename = 'SeveralBigPagesPresentation.pdf'		
		def uploadedFile = new File("test/resources/$uploadedFilename")
			
		def uploadedPresentation = new File(presDir.absolutePath + "/$uploadedFilename")
		int copied = FileCopyUtils.copy(uploadedFile, uploadedPresentation) 
		assertTrue(uploadedPresentation.exists())
		
		def tempDir = new File(uploadedPresentation.parent + File.separatorChar + "temp")
		tempDir.mkdir()
		
		int page = 1
		File outFile = new File(tempDir.absolutePath + File.separator + "temp-${page}.pdf")
		
		boolean success = pageExtractor.extractPage(uploadedPresentation, outFile, page)
		assertTrue success
		
		page = 3
		outFile = new File(tempDir.absolutePath + File.separator + "temp-${page}.pdf")
		success = pageExtractor.extractPage(uploadedPresentation, outFile, page)
		assertTrue success
    }
    
}

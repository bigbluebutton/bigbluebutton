package org.bigbluebutton.web.services

//import org.springframework.util.FileCopyUtils
import org.codehaus.groovy.grails.commons.*

import groovy.mock.interceptor.StubFor

class PresentationServiceTests extends GroovyTestCase {
	
	def SWFTOOLS = "C:/swftools-0.9"
	def IMAGEMAGICK = "C:/ImageMagick-6.4.9-Q16/"
	def GHOSTSCRIPT = "C:/gs/gs8.63/bin/gswin32c.exe"
	def PRESENTATIONDIR = "c:/temp/bigbluebutton"
	
	def presService
	
	void setUp() {
		/* Get the values from bigbluebutton.properties
		 * We have to set this manually unlike when running
		 * as an application where spring injects these
		 * values for us.
		 */
		def config = ConfigurationHolder.config
		SWFTOOLS = config.swfToolsDir
		IMAGEMAGICK = config.imageMagickDir
		PRESENTATIONDIR = config.presentationDir
		GHOSTSCRIPT = config.ghostScriptExec
		
		presService = new PresentationService()		
		presService.swfToolsDir = SWFTOOLS
		presService.imageMagickDir = IMAGEMAGICK
		presService.ghostScriptExec = GHOSTSCRIPT
		presService.presentationDir = PRESENTATIONDIR
		presService.noPdfMarkWorkaround = config.noPdfMarkWorkaround
		
		presService.jmsTemplate = new FakeJmsTemplate()
	}
/**	
	void testGetUploadDirectory() {
		def uploadedFilename = 'sample-presentation.pdf'		
		def uploadedFile = new File("test/resources/$uploadedFilename")
    	def conf = "test-conf"
    	def rm = "test-room"
    	def presName = "test-presentation"
    	    	
		File uploadDir = presService.uploadedPresentationDirectory(conf, rm, presName)
		def uploadedPresentation = new File(uploadDir.absolutePath + File.separator + uploadedFilename)
    	uploadedPresentation = new File("$PRESENTATIONDIR/$conf/$rm/$presName/$uploadedFilename")
    	int copied = FileCopyUtils.copy(uploadedFile, uploadedPresentation) 
    	assertTrue(uploadedPresentation.exists())
	}
	
	void testPresentationThatShouldConvertSuccessfully() {
		def uploadedFilename = 'PresentationsTips.pdf'
		def uploadedFile = new File("test/resources/$uploadedFilename")
	    def conf = "test-conf"
	    def rm = "test-room"
	    def presName = "test-presentation"
	    	    	
		File uploadDir = presService.uploadedPresentationDirectory(conf, rm, presName)
		def uploadedPresentation = new File(uploadDir.absolutePath + File.separator + uploadedFilename)
	    uploadedPresentation = new File("$PRESENTATIONDIR/$conf/$rm/$presName/$uploadedFilename")
		
	    int copied = FileCopyUtils.copy(uploadedFile, uploadedPresentation) 
	    assertTrue(uploadedPresentation.exists())
	    
	    presService.convertUploadedPresentation(conf, rm, presName, uploadedPresentation, 21)
	    
		int numPages = presService.numberOfThumbnails(conf, rm, presName)
		assertEquals 21, numPages
	}

	void testProcessOneSlideWithTooManyObjectsPresentation() {
		def uploadedFilename = 'big.pdf'		
		def uploadedFile = new File("test/resources/$uploadedFilename")
		def conf = "test-conf"
		def rm = "test-room"
		def presName = "big"
	    	    	
		File uploadDir = presService.uploadedPresentationDirectory(conf, rm, presName)
		def uploadedPresentation = new File(uploadDir.absolutePath + File.separator + uploadedFilename)
	    uploadedPresentation = new File("$PRESENTATIONDIR/$conf/$rm/$presName/$uploadedFilename")
		
	    int copied = FileCopyUtils.copy(uploadedFile, uploadedPresentation) 
	    assertTrue(uploadedPresentation.exists())
	    
	    presService.convertUploadedPresentation(conf, rm, presName, uploadedPresentation, 1)
	    
		int numPages = presService.numberOfThumbnails(conf, rm, presName)
		assertEquals 1, numPages
	}	

	void testProcessSeveralSlidesWithTooManyObjectsPresentation() {
		def uploadedFilename = 'SeveralBigPagesPresentation.pdf'		
		def uploadedFile = new File("test/resources/$uploadedFilename")
		def conf = "test-conf"
		def rm = "test-room"
		def presName = "severalbig"
	    	    	
		File uploadDir = presService.uploadedPresentationDirectory(conf, rm, presName)
		def uploadedPresentation = new File(uploadDir.absolutePath + File.separator + uploadedFilename)
	    uploadedPresentation = new File("$PRESENTATIONDIR/$conf/$rm/$presName/$uploadedFilename")
		
	    int copied = FileCopyUtils.copy(uploadedFile, uploadedPresentation) 
	    assertTrue(uploadedPresentation.exists())
	    
	    presService.convertUploadedPresentation(conf, rm, presName, uploadedPresentation, 5)
	    
		int numPages = presService.numberOfThumbnails(conf, rm, presName)
		assertEquals 5, numPages
	}		

	void testProcessSlidesWithNoAvailableFontsPresentation() {
		def uploadedFilename = 'CaratulasManualesNutrisol.pdf'		
		def uploadedFile = new File("test/resources/$uploadedFilename")
		def conf = "test-conf"
		def rm = "test-room"
		def presName = "caratulas"
	    	    	
		File uploadDir = presService.uploadedPresentationDirectory(conf, rm, presName)
		def uploadedPresentation = new File(uploadDir.absolutePath + File.separator + uploadedFilename)
	    uploadedPresentation = new File("$PRESENTATIONDIR/$conf/$rm/$presName/$uploadedFilename")
		
	    int copied = FileCopyUtils.copy(uploadedFile, uploadedPresentation) 
	    assertTrue(uploadedPresentation.exists())
	    
	    presService.convertUploadedPresentation(conf, rm, presName, uploadedPresentation, 2)
	    
		int numPages = presService.numberOfThumbnails(conf, rm, presName)
		assertEquals 2, numPages
	}

	void testUseJpegWhenPresentationHasLotOfObjects() {
		def uploadedFilename = 'big-lots-of-objects.pdf'		
		def uploadedFile = new File("test/resources/$uploadedFilename")
		def conf = "test-conf"
		def rm = "test-room"
		def presName = "big-lots-of-objects"
	    	    	
		File uploadDir = presService.uploadedPresentationDirectory(conf, rm, presName)
		def uploadedPresentation = new File(uploadDir.absolutePath + File.separator + uploadedFilename)
	    uploadedPresentation = new File("$PRESENTATIONDIR/$conf/$rm/$presName/$uploadedFilename")
		
	    int copied = FileCopyUtils.copy(uploadedFile, uploadedPresentation) 
	    assertTrue(uploadedPresentation.exists())
	    
	    presService.convertUploadedPresentation(conf, rm, presName, uploadedPresentation, 2)
	    
		int numPages = presService.numberOfThumbnails(conf, rm, presName)
		assertEquals 2, numPages
	}

	void testSecuredSlides() {
		def uploadedFilename = 'secure-slides.pdf'		
		def uploadedFile = new File("test/resources/$uploadedFilename")
		def conf = "test-conf"
		def rm = "test-room"
		def presName = "secure-slides"
	    	    	
		File uploadDir = presService.uploadedPresentationDirectory(conf, rm, presName)
		def uploadedPresentation = new File(uploadDir.absolutePath + File.separator + uploadedFilename)
	    uploadedPresentation = new File("$PRESENTATIONDIR/$conf/$rm/$presName/$uploadedFilename")
		
	    int copied = FileCopyUtils.copy(uploadedFile, uploadedPresentation) 
	    assertTrue(uploadedPresentation.exists())
	    
	    presService.convertUploadedPresentation(conf, rm, presName, uploadedPresentation, 17)
	    
		int numPages = presService.numberOfThumbnails(conf, rm, presName)
		assertEquals 17, numPages
	}
**/

/*
	void testSlideWithTooManyObject() {
		def uploadedFilename = 'SalesNetworks.pdf'		
		def uploadedFile = new File("test/resources/$uploadedFilename")
		def conf = "test-conf"
		def rm = "test-room"
		def presName = "SalesNetworks"
	    	    	
		File uploadDir = presService.uploadedPresentationDirectory(conf, rm, presName)
		def uploadedPresentation = new File(uploadDir.absolutePath + File.separator + uploadedFilename)
	    uploadedPresentation = new File("$PRESENTATIONDIR/$conf/$rm/$presName/$uploadedFilename")
		
	    int copied = FileCopyUtils.copy(uploadedFile, uploadedPresentation) 
	    assertTrue(uploadedPresentation.exists())
	    
	    presService.convertUploadedPresentation(conf, rm, presName, uploadedPresentation, 12)
	    
		int numPages = presService.numberOfThumbnails(conf, rm, presName)
		assertEquals 12, numPages
	}
*/

}

/*** Helper classes **/
import java.io.FilenameFilter;
import java.io.File;
class JpegFilter implements FilenameFilter {
    public boolean accept(File dir, String name) {
        return (name.endsWith(".jpeg"));
    }
}

class PdfFilter implements FilenameFilter {
    public boolean accept(File dir, String name) {
        return (name.endsWith(".pdf"));
    }
}

class SwfFilter implements FilenameFilter {
    public boolean accept(File dir, String name) {
        return (name.endsWith(".swf"));
    }
}

/* Stub for JmsTemplate */
class FakeJmsTemplate {
	def convertAndSend(String queue, Map message) { /* do nothing */}
}

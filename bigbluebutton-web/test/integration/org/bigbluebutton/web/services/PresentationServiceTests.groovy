package org.bigbluebutton.web.services

import org.springframework.util.FileCopyUtils
import org.codehaus.groovy.grails.commons.*

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
		SWFTOOLS = config.swfTools
		IMAGEMAGICK = config.imageMagick
		PRESENTATIONDIR = config.presentationDir
		GHOSTSCRIPT = config.ghostScript
		
		presService = new PresentationService()		
		presService.swfTools = SWFTOOLS
		presService.imageMagick = IMAGEMAGICK
		presService.ghostScript = GHOSTSCRIPT
		presService.presentationDir = PRESENTATIONDIR
		
		
	}
	
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
	
	void testGetNumberOfPagesForPresentation() {
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
		int numPages = presService.determineNumberOfPages(uploadedPresentation)
		assertEquals 8, numPages
	}
		
	void testConvertUsingPdf2Swf() {
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
		int numPages = presService.determineNumberOfPages(uploadedPresentation)
		assertEquals 8, numPages
		
		for (int page = 1; page <= numPages; page++) {
			presService.convertUsingPdf2Swf(uploadedPresentation, page)
		}	    
	}

	void testExtractPageUsingGhostscript() {
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
		int numPages = presService.determineNumberOfPages(uploadedPresentation)
		assertEquals 8, numPages
			
		for (int page = 1; page <= numPages; page++) {
			def result = presService.extractPageUsingGhostScript(uploadedPresentation, page)
			assertTrue result
		}
		
		File tempdir = new File(uploadedPresentation.parent + File.separator + "temp")
        FilenameFilter filter = new PdfFilter();
        String[] files = tempdir.list(filter)
        assertEquals numPages, files.length
        
		for (int page = 1; page <= numPages; page++) {
			def result = presService.convertUsingImageMagick(uploadedPresentation, page)
			assertTrue result
		}
        
        filter = new JpegFilter();
        files = tempdir.list(filter)
        assertEquals numPages, files.length
        
		for (int page = 1; page <= numPages; page++) {
			def result = presService.convertUsingJpeg2Swf(uploadedPresentation, page)
			assertTrue result
		}
        
        File outDir = new File(uploadedPresentation.parent)
        filter = new SwfFilter();
        files = outDir.list(filter)
        assertEquals numPages, files.length
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
		int numPages = presService.determineNumberOfPages(uploadedPresentation)
		assertEquals 1, numPages
				
		for (int page = 1; page <= numPages; page++) {
			presService.extractPageUsingGhostScript(uploadedPresentation, page)
		}
			
		File tempdir = new File(uploadedPresentation.parent + File.separator + "temp")
	    FilenameFilter filter = new PdfFilter();
	    String[] files = tempdir.list(filter)
	    assertEquals numPages, files.length
	        
		for (int page = 1; page <= numPages; page++) {
			presService.convertUsingImageMagick(uploadedPresentation, page)
		}
	        
	    filter = new JpegFilter();
	    files = tempdir.list(filter)
	    assertEquals numPages, files.length
	        
		for (int page = 1; page <= numPages; page++) {
			presService.convertUsingJpeg2Swf(uploadedPresentation, page)
		}
	        
	    File outDir = new File(uploadedPresentation.parent)
	    filter = new SwfFilter();
	    files = outDir.list(filter)
	    assertEquals numPages, files.length    	
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
			int numPages = presService.determineNumberOfPages(uploadedPresentation)
			assertEquals 5, numPages
					
			for (int page = 1; page <= numPages; page++) {
				presService.extractPageUsingGhostScript(uploadedPresentation, page)
			}
				
			File tempdir = new File(uploadedPresentation.parent + File.separator + "temp")
		    FilenameFilter filter = new PdfFilter();
		    String[] files = tempdir.list(filter)
		    assertEquals numPages, files.length
		        
			for (int page = 1; page <= numPages; page++) {
				presService.convertUsingImageMagick(uploadedPresentation, page)
			}
		        
		    filter = new JpegFilter();
		    files = tempdir.list(filter)
		    assertEquals numPages, files.length
		        
			for (int page = 1; page <= numPages; page++) {
				presService.convertUsingJpeg2Swf(uploadedPresentation, page)
			}
		        
		    File outDir = new File(uploadedPresentation.parent)
		    filter = new SwfFilter();
		    files = outDir.list(filter)
		    assertEquals numPages, files.length       	
    }


    void testConvertPage() {
		def uploadedFilename = 'SeveralBigPagesPresentation.pdf'		
		def uploadedFile = new File("test/resources/$uploadedFilename")
		def conf = "test-conf"
		def rm = "test-room"
		def presName = "convertpage"
					    	    	
		File uploadDir = presService.uploadedPresentationDirectory(conf, rm, presName)
		def uploadedPresentation = new File(uploadDir.absolutePath + File.separator + uploadedFilename)
		uploadedPresentation = new File("$PRESENTATIONDIR/$conf/$rm/$presName/$uploadedFilename")
		int copied = FileCopyUtils.copy(uploadedFile, uploadedPresentation) 
		assertTrue(uploadedPresentation.exists())
		int numPages = presService.determineNumberOfPages(uploadedPresentation)
		assertEquals 5, numPages
					
		for (int page = 1; page <= numPages; page++) {
			presService.convertPage(uploadedPresentation, page)
		}
				   
		File outDir = new File(uploadedPresentation.parent)
		FilenameFilter filter = new SwfFilter();
		String[] files = outDir.list(filter)
		assertEquals numPages, files.length       	
    }

    void testCreateThumbnails() {
		def uploadedFilename = 'SeveralBigPagesPresentation.pdf'		
		def uploadedFile = new File("test/resources/$uploadedFilename")
		def conf = "test-conf"
		def rm = "test-room"
		def presName = "thumbs"
					    	    	
		File uploadDir = presService.uploadedPresentationDirectory(conf, rm, presName)
		def uploadedPresentation = new File(uploadDir.absolutePath + File.separator + uploadedFilename)
		uploadedPresentation = new File("$PRESENTATIONDIR/$conf/$rm/$presName/$uploadedFilename")
		int copied = FileCopyUtils.copy(uploadedFile, uploadedPresentation) 
		assertTrue(uploadedPresentation.exists())
		int numPages = presService.determineNumberOfPages(uploadedPresentation)
		assertEquals 5, numPages
					
		presService.createThumbnails(uploadedPresentation)
		
				   
//		File outDir = new File(uploadedPresentation.parent)
//		FilenameFilter filter = new SwfFilter();
//		String[] files = outDir.list(filter)
//		assertEquals numPages, files.length       	
    }
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

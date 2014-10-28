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

import org.codehaus.groovy.grails.commons.*

import groovy.mock.interceptor.StubFor
import org.bigbluebutton.presentation.*

class PdfToSwfSlidesGenerationServiceTests extends GroovyTestCase {
	
	def SWFTOOLS = "/bin"
	def IMAGEMAGICK_DIR = "/usr/bin"
	def GHOSTSCRIPT = "/usr/bin/gs"
	def PRESENTATIONDIR = "/tmp/var/bigbluebutton"
	def	noPdfMarkWorkaround = "/etc/bigbluebutton/nopdfmark.ps"
	def	BLANK_SLIDE = "/var/bigbluebutton/blank/blank-slide.swf"
	def BLANK_THUMBNAIL = "/var/bigbluebutton/blank/blank-thumb.png"
		
	def slidesGenerationService
	
	void setUp() {
		PageExtractor pageExtractor = new GhostscriptPageExtractor()		
		pageExtractor.setGhostscriptExec(GHOSTSCRIPT)	
		pageExtractor.setNoPdfMarkWorkaround(noPdfMarkWorkaround)
		
		PageConverter imageMagickPageConverter = new ImageMagickPageConverter()		
		imageMagickPageConverter.setImageMagickDir(IMAGEMAGICK_DIR)	
		
		PageConverter png2SwfConverter = new Png2SwfPageConverter()
		png2SwfConverter.setSwfToolsDir(SWFTOOLS)
		
		PageCounter pageCounter = new Pdf2SwfPageCounter()
		pageCounter.setSwfToolsDir(SWFTOOLS)
		
		PageCounterService pageCounterService = new PageCounterService();
		pageCounterService.setPageCounter(pageCounter)
				
		PageConverter pdf2SwfPageConverter = new Pdf2SwfPageConverter()
		pdf2SwfPageConverter.setSwfToolsDir(SWFTOOLS)
				
		PdfPageToImageConversionService imageConvSvc = new PdfPageToImageConversionService()
		imageConvSvc.setPageExtractor(pageExtractor)
		imageConvSvc.setPdfToImageConverter(imageMagickPageConverter)
		imageConvSvc.setImageToSwfConverter(png2SwfConverter)
			
		ThumbnailCreator thumbCreator = new ThumbnailCreatorImp()
		thumbCreator.setImageMagickDir(IMAGEMAGICK_DIR)
		thumbCreator.setBlankThumbnail(BLANK_THUMBNAIL)

		SwfSlidesGenerationProgressNotifier notifier = new SwfSlidesGenerationProgressNotifier()
		slidesGenerationService = new PdfToSwfSlidesGenerationService()
		slidesGenerationService.setPageConverter(pdf2SwfPageConverter) 
		slidesGenerationService.setCounterService(pageCounterService)
		slidesGenerationService.setThumbnailCreator(thumbCreator)
		slidesGenerationService.setMaxConversionTime(5) 
		slidesGenerationService.setPdfPageToImageConversionService(imageConvSvc)		
		slidesGenerationService.setBlankSlide(BLANK_SLIDE)
		slidesGenerationService.setSwfSlidesGenerationProgressNotifier(notifier)
	}
	
	void testGetUploadDirectory() {
		def uploadedFilename = 'sample-presentation.pdf'		
		def uploadedFile = new File("test/resources/$uploadedFilename")
    	def conf = "test-conf"
    	def rm = "test-room"
    	def presName = "test-presentation"
    	
    	def uploadDir = new File("$PRESENTATIONDIR/$conf/$rm/$presName")
		if (uploadDir.exists()) Util.deleteDirectory(uploadDir)
		uploadDir.mkdirs()
		assert uploadDir.exists()
		
    	def uploadedPresentation = new File("$uploadDir/$uploadedFilename")
    	int copied = FileCopyUtils.copy(uploadedFile, uploadedPresentation) 
    	assertTrue(uploadedPresentation.exists())
	}
	
	
	
	void testPresentationThatShouldConvertSuccessfully() {
		String uploadedFilename = 'PresentationsTips.pdf'
		File uploadedFile = new File("test/resources/$uploadedFilename")
	    String conf = "test-conf"
	    String rm = "test-room"
	    String presName = "test-presentation"
	    
	    String uploadDir = "$PRESENTATIONDIR/$conf/$rm/$presName"
		setupUploadDirectory(uploadDir)	    
		File uploadedPresentation = new File("$uploadDir/$uploadedFilename")		
		copyUploadedPresentation(uploadedFile, uploadedPresentation) 
		UploadedPresentation uploadedPres = setupUploadedPresentation(conf, rm, presName, uploadedPresentation)
		
		slidesGenerationService.generateSlides(uploadedPres)
		
		int numPages = getNumberOfThumbnails(uploadDir)
		assertEquals 21, numPages
	}

	void testProcessOneSlideWithTooManyObjectsPresentation() {
		String uploadedFilename = 'big.pdf'		
		File uploadedFile = new File("test/resources/$uploadedFilename")
		String conf = "test-conf"
		String rm = "test-room"
		String presName = "big"
	    	    	
		String uploadDir = "$PRESENTATIONDIR/$conf/$rm/$presName"
		setupUploadDirectory(uploadDir)		    
		File uploadedPresentation = new File("$uploadDir/$uploadedFilename")		
		copyUploadedPresentation(uploadedFile, uploadedPresentation) 
	    UploadedPresentation uploadedPres = setupUploadedPresentation(conf, rm, presName, uploadedPresentation)
		
		slidesGenerationService.generateSlides(uploadedPres)
	    
		int numPages = getNumberOfThumbnails(uploadDir)
		assertEquals 1, numPages
	}	
	

	void testProcessSeveralSlidesWithTooManyObjectsPresentation() {
		String uploadedFilename = 'SeveralBigPagesPresentation.pdf'		
		File uploadedFile = new File("test/resources/$uploadedFilename")
		String conf = "test-conf"
		String rm = "test-room"
		String presName = "severalbig"
	    	    	
		String uploadDir = "$PRESENTATIONDIR/$conf/$rm/$presName"
		setupUploadDirectory(uploadDir)		    
		File uploadedPresentation = new File("$uploadDir/$uploadedFilename")		
		copyUploadedPresentation(uploadedFile, uploadedPresentation) 
		UploadedPresentation uploadedPres = setupUploadedPresentation(conf, rm, presName, uploadedPresentation)
				
		slidesGenerationService.generateSlides(uploadedPres)
			    
		int numPages = getNumberOfThumbnails(uploadDir)
		assertEquals 5, numPages
	}		

	void testProcessSlidesWithNoAvailableFontsPresentation() {
		String uploadedFilename = 'CaratulasManualesNutrisol.pdf'		
		File uploadedFile = new File("test/resources/$uploadedFilename")
		String conf = "test-conf"
		String rm = "test-room"
		String presName = "caratulas"
	    	    	
		String uploadDir = "$PRESENTATIONDIR/$conf/$rm/$presName"
		setupUploadDirectory(uploadDir)		    
		File uploadedPresentation = new File("$uploadDir/$uploadedFilename")		
		copyUploadedPresentation(uploadedFile, uploadedPresentation) 
		UploadedPresentation uploadedPres = setupUploadedPresentation(conf, rm, presName, uploadedPresentation)
						
		slidesGenerationService.generateSlides(uploadedPres)
					    
		int numPages = getNumberOfThumbnails(uploadDir)
		assertEquals 2, numPages
	}

	void testUseJpegWhenPresentationHasLotOfObjects() {
		String uploadedFilename = 'big-lots-of-objects.pdf'		
		File uploadedFile = new File("test/resources/$uploadedFilename")
		String conf = "test-conf"
		String rm = "test-room"
		String presName = "big-lots-of-objects"
	    	    	
		String uploadDir = "$PRESENTATIONDIR/$conf/$rm/$presName"
		setupUploadDirectory(uploadDir)		    
		File uploadedPresentation = new File("$uploadDir/$uploadedFilename")		
		copyUploadedPresentation(uploadedFile, uploadedPresentation) 
		UploadedPresentation uploadedPres = setupUploadedPresentation(conf, rm, presName, uploadedPresentation)
								
		slidesGenerationService.generateSlides(uploadedPres)
							    
		int numPages = getNumberOfThumbnails(uploadDir)
		assertEquals 2, numPages
	}

	void testSecuredSlides() {
		String uploadedFilename = 'secure-slides.pdf'		
		File uploadedFile = new File("test/resources/$uploadedFilename")
		String conf = "test-conf"
		String rm = "test-room"
		String presName = "secure-slides"
	    	    	
		String uploadDir = "$PRESENTATIONDIR/$conf/$rm/$presName"
		setupUploadDirectory(uploadDir)		    
		File uploadedPresentation = new File("$uploadDir/$uploadedFilename")		
		copyUploadedPresentation(uploadedFile, uploadedPresentation) 
		UploadedPresentation uploadedPres = setupUploadedPresentation(conf, rm, presName, uploadedPresentation)
								
		slidesGenerationService.generateSlides(uploadedPres)
							    
		int numPages = getNumberOfThumbnails(uploadDir)
		assertEquals 17, numPages
	}


	private int getNumberOfThumbnails(String presDir) {
		println presDir
		def thumbDir = new File(presDir + File.separatorChar + "thumbnails")
		thumbDir.listFiles().length
	}

	private void setupUploadDirectory(String path) {
		def uploadDir = new File(path)
		if (uploadDir.exists()) Util.deleteDirectory(uploadDir)
		uploadDir.mkdirs()
		assert uploadDir.exists()
	}
	
	private void copyUploadedPresentation(File uploadedFile, File uploadedPresentation) {
		int copied = FileCopyUtils.copy(uploadedFile, uploadedPresentation) 
	    assertTrue(uploadedPresentation.exists())
	}

	private UploadedPresentation setupUploadedPresentation(String conf, String room, String presName, File uploadedPresentation) {
		UploadedPresentation uploadedPres = new UploadedPresentation(conf, room, presName);
		uploadedPres.setUploadedFile(uploadedPresentation);
		uploadedPres.setFileType('pdf')
		return uploadedPres;
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

/* Stub for JmsTemplate */
class FakeJmsTemplate {
	def convertAndSend(String queue, Map message) { /* do nothing */}
}

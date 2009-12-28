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
package org.bigbluebutton.web.services

import javax.jms.Message
import javax.jms.Session
import javax.jms.JMSException
import javax.jms.MapMessage
import org.springframework.jms.core.JmsTemplate
import java.util.*;
import java.util.concurrent.*;
import java.lang.InterruptedException
import org.springframework.util.FileCopyUtils

import org.bigbluebutton.presentation.imp.*
import org.bigbluebutton.presentation.*

class PresentationService {

    boolean transactional = false
	def jmsTemplate	
	def imageMagickDir
	def ghostScriptExec
	def swfToolsDir
	def presentationDir
	def BLANK_SLIDE = '/var/bigbluebutton/blank/blank-slide.swf'
	def BLANK_THUMBNAIL = '/var/bigbluebutton/blank/blank-thumb.png'
	
	/*
	 * This is a workaround for this problem.
	 * http://groups.google.com/group/comp.lang.postscript/browse_thread/thread/c2e264ca76534ce0?pli=1
	 */
	def noPdfMarkWorkaround
	    
	private static String JMS_UPDATES_Q = 'UpdatesQueue'
	    
    def deletePresentation = {conf, room, filename ->
    		def directory = new File(roomDirectory(conf, room).absolutePath + File.separatorChar + filename)
    		deleteDirectory(directory) 
	}
	
	def deleteDirectory = {directory ->
		log.debug "delete = ${directory}"
		/**
		 * Go through each directory and check if it's not empty.
		 * We need to delete files inside a directory before a
		 * directory can be deleted.
		**/
		File[] files = directory.listFiles();				
		for (int i = 0; i < files.length; i++) {
			if (files[i].isDirectory()) {
				deleteDirectory(files[i])
			} else {
				files[i].delete()
			}
		}
		// Now that the directory is empty. Delete it.
		directory.delete()	
	}
	
	def listPresentations = {conf, room ->
		def presentationsList = []
		def directory = roomDirectory(conf, room)
		log.debug "directory ${directory.absolutePath}"
		if( directory.exists() ){
			directory.eachFile(){ file->
				System.out.println(file.name)
				if( file.isDirectory() )
					presentationsList.add( file.name )
			}
		}	
		return presentationsList
	}
	
	public File uploadedPresentationDirectory(String conf, String room, String presentation_name) {
		File dir = new File(roomDirectory(conf, room).absolutePath + File.separatorChar + presentation_name)
		println "Uploaded presentation ${presentation_name} for conf ${conf} and room ${room} to dir ${dir.absolutePath}"

		/* If the presentation name already exist, delete it. We should provide a check later on to notify user
			that there is already a presentation with that name. */
		if (dir.exists()) deleteDirectory(dir)		
		dir.mkdirs()

		assert dir.exists()
		return dir
	}
	
	public File prepareFileType(String conference, String room, String presentationName, File presentationFile, String ext) {
		log.debug "Preparing file $ext"
		println "Preparing file $ext"
		
		switch(ext)
		{
			/* OFFICE FILE */
			case 'xls':
			case 'xlsx':
			case 'doc':
			case 'docx':
			case 'ppt':
			case 'pptx':
			case 'odt':
			case 'rtf':
			case 'txt':
			case 'ods':
			case 'odp':
				log.debug "Office File " + ext + ", converting to PDF..."
				println "Office File " + ext + ", converting to PDF..."
				try {
					PageConverter converter = new Office2PdfPageConverter()
					File output = new File(presentationFile.getAbsolutePath().substring(0, presentationFile.getAbsolutePath().lastIndexOf(".")) + ".pdf")
					println presentationFile.getAbsolutePath().substring(0, presentationFile.getAbsolutePath().lastIndexOf(".")) + ".pdf"
					Boolean convertion = converter.convert(presentationFile, output, 0)
					println convertion
					if (convertion)
						return (output);
					else
						throw new Exception("");
				} catch (Exception ex) {
					println("Error converting FileType " + ext + " to PDF...")
					sendConvertErrorMessage(conference, room, presentationName, presentationFile, "FAILED_CONVERT_SOFFICE")
				}
				break;
			case 'avi':
			case 'mpg':
				/* Testing requirements - ffmpeg */
				sendConvertErrorMessage(conference, room, presentationName, presentationFile, "FAILED_CONVERT_NOT_SUPPORTED")
				break;
			case 'mp3':
				/* Testing requirements - ffmpeg */
				sendConvertErrorMessage(conference, room, presentationName, presentationFile, "FAILED_CONVERT_NOT_SUPPORTED")
				break;
			/* DEFAULT SUPPORTED FILES - NO PREPARATION NEEDED*/
			case 'pdf':
			case 'jpg':
			case 'jpeg':
			case 'png':
				return (presentationFile);
				break;
			default:
				sendConvertErrorMessage(conference, room, presentationName, presentationFile, "FAILED_CONVERT_NOT_SUPPORTED")
				break;
		}
		
		return (null);
	}
	
	public boolean convertFileType(String conference, String room, String presentationName, File presentationFile, String ext, int numPages) {
		log.debug "Converting uploaded presentation $presentationFile.absolutePath"
		
		switch(ext)
		{
			/* OFFICE FILE CONVERTED TO PDF in prepareFileType */
			/* PDF FILE */
			case 'xls':
			case 'xlsx':
			case 'doc':
			case 'docx':
			case 'ppt':
			case 'pptx':
			case 'pdf':
			case 'odt':
			case 'rtf':
			case 'txt':
			case 'ods':
			case 'odp':
				try {
					for (int page = 1; page <= numPages; page++) 
					{	
						log.debug "Converting page $page of $presentationFile.absolutePath"			
						convertPage(presentationFile, page)
						sendConversionUpdateMessage(conference, room, presentationName, numPages, page)
					}
					return (true);
				} catch (Exception ex) {
					println("Error converting File " + ext + " to PDF...")
					sendConvertErrorMessage(conference, room, presentationName, presentationFile, "FAILED_CONVERT_SWF_PDF")
				}
				break;
			case 'jpg':
			case 'jpeg':
			case 'png':
				try {
					PageConverter converter;
					if (ext == 'png')
						converter = new Png2SwfPageConverter()
					else if (ext == 'jpg' || ext == 'jpeg')
						converter = new Jpeg2SwfPageConverter()
					else
						return (false);
					converter.setSwfToolsDir(swfToolsDir)

					File output = new File(presentationFile.getParent() + File.separatorChar + "slide-1.swf")
					if (!converter.convert(presentationFile, output, 1))
						generateBlankSlide(output.getAbsolutePath());
					sendConversionUpdateMessage(conference, room, presentationName, numPages, 1)
					return (true);
				} catch (Exception ex) {
					println("Error converting File " + ext + " to PDF...")
					sendConvertErrorMessage(conference, room, presentationName, presentationFile, "FAILED_CONVERT_SWF_IMAGE")
				}
				break;
			case 'avi':
			case 'mpg':
				/* Conversion to flv using ffmpeg */
				sendConvertErrorMessage(conference, room, presentationName, presentationFile, "FAILED_CONVERT_SWF")
				break;
			case 'mp3':
				/* Conversion to flv using ffmpeg */
				sendConvertErrorMessage(conference, room, presentationName, presentationFile, "FAILED_CONVERT_SWF")
				break;
			default:
				sendConvertErrorMessage(conference, room, presentationName, presentationFile, "FAILED_CONVERT_SWF")
				break;
		}
		return (false);
	}
	
	public int getnumPages(String conference, String room, String presentationName, File presentationFile, String ext) {
		log.debug "Determining number of pages"
		
		switch(ext)
		{
			/* OFFICE FILE CONVERTED TO PDF IN prepareFileType */
			/* PDF FILE */
			case 'xls':
			case 'xlsx':
			case 'doc':
			case 'docx':
			case 'ppt':
			case 'pptx':
			case 'pdf':
			case 'odt':
			case 'rtf':
			case 'txt':
			case 'ods':
			case 'odp':
				try
				{
					PageCounter pageCounter = new Pdf2SwfPageCounter()
					pageCounter.setSwfToolsDir(swfToolsDir)
					int numPages = pageCounter.countNumberOfPages(presentationFile)
					if (numPages > 100)
					{
						sendConvertErrorMessage(conference, room, presentationName, presentationFile, "FAILED_CONVERT_MAXNBPAGE_REACH")
						return (0);
					}
					else if (numPages > 0)
						return (numPages);
					else
						throw new Exception("");
				} catch (Exception ex) {
					println("Error getting number of pages")
					sendConvertErrorMessage(conference, room, presentationName, presentationFile, "FAILED_CONVERT_NBPAGE")
				}
				break;
			case 'avi':
			case 'mpg':
			case 'mp3':
			case 'jpg':
			case 'jpeg':
			case 'png':
				return (1);
				break;
			default:
				/* Problem getting number of pages "Error while getting number of pages" */
				sendConvertErrorMessage(conference, room, presentationName, presentationFile, "FAILED_CONVERT_NBPAGE")
				break;
		}
		return (0);
	}
	
	public boolean createThumbnails(String conference, String room, String presentationName, File presentationFile, String ext, int numPages) {
		log.debug "Creating thumbnails for presentation.absolutePath"
		// Send twice...seem to be loosing messages...need to understand some more 
		// how to set JMS producer-consumer
		sendCreatingThumbnailsUpdateMessage(conference, room, presentationName)
		sendCreatingThumbnailsUpdateMessage(conference, room, presentationName)
		
		switch(ext)
		{
			/* OFFICE FILE CONVERTED TO PDF in prepareFileType */
			/* PDF FILE */
			case 'xls':
			case 'xlsx':
			case 'doc':
			case 'docx':
			case 'ppt':
			case 'pptx':
			case 'pdf':
			case 'jpg':
			case 'jpeg':
			case 'png':
			case 'odt':
			case 'rtf':
			case 'txt':
			case 'ods':
			case 'odp':
				try
				{
					ThumbnailCreatorImp tc = new ThumbnailCreatorImp()
					tc.imageMagickDir = imageMagickDir
					tc.blankThumbnail = BLANK_THUMBNAIL
					tc.createThumbnails(presentationFile, numPages)
					return (true);
				} catch (Exception ex) {
					sendConvertErrorMessage(conference, room, presentationName, presentationFile, "FAILED_CONVERT_THUMBNAIL")
				}
				break;
			case 'avi':
			case 'mpg':
			case 'mp3':
				/* TODO ADD SUPPORT */
				sendConvertErrorMessage(conference, room, presentationName, presentationFile, "FAILED_CONVERT_THUMBNAIL")
				break;
			default:
				sendConvertErrorMessage(conference, room, presentationName, presentationFile, "FAILED_CONVERT_THUMBNAIL")
				break;
		}
		return (false);
	}

	def processUploadedPresentation = {uploadedPres ->	
		// Run conversion on another thread.
		new Timer().runAfter(1000) 
		{
			/* Getting file extension - Perhaps try to rely on smth more accurate than an extension type ? */
			String ext = presentationFile.getName().toLowerCase().substring(presentationFile.getName().toLowerCase().lastIndexOf('.') + 1)
			if (ext)
			{
				/* Prepare file convertion depending on filetype (OFFICE -> PDF) */
				File ConvertedPresentationFile = prepareFileType(conf, room, presentationName, presentationFile, ext)
				log.debug ConvertedPresentationFile
				
				if (ConvertedPresentationFile)
				{
					/* Getting number of pages, if available */
					int numPages = getnumPages(conf, room, presentationName, ConvertedPresentationFile, ext)
					log.info "There is/are $numPages slide(s) for $presentationFile.absolutePath"

					if (numPages)
					{
						/* Convert File to Presentation Pages */
						if (convertFileType(conf, room, presentationName, ConvertedPresentationFile, ext, numPages))
						{
							/* Create thumbnails for each pages */
							if (createThumbnails(conf, room, presentationName, ConvertedPresentationFile, ext, numPages))
							{
								/* We're done */
								sendConversionCompletedMessage(conf, room, presentationName, numPages)
							}
						}
					}
				}
			}
			else /* Problem with fileformat "Unable to determine file format" */
				sendConvertErrorMessage(conf, room, presentationName, presentationFile, "FAILED_CONVERT_FORMAT")
		}
	}
 	
	def showSlide(String conf, String room, String presentationName, String id) {
		new File(roomDirectory(conf, room).absolutePath + File.separatorChar + presentationName + File.separatorChar + "slide-${id}.swf")
	}
	
	def showPresentation = {conf, room, filename ->
		new File(roomDirectory(conf, room).absolutePath + File.separatorChar + filename + File.separatorChar + "slides.swf")
	}
	
	def showThumbnail = {conf, room, presentationName, thumb ->
		println "Show thumbnails request for $presentationName $thumb"
		def thumbFile = roomDirectory(conf, room).absolutePath + File.separatorChar + presentationName + File.separatorChar +
					"thumbnails" + File.separatorChar + "thumb-${thumb}.png"
		log.debug "showing $thumbFile"
		
		new File(thumbFile)
	}
	
	def numberOfThumbnails = {conf, room, name ->
		def thumbDir = new File(roomDirectory(conf, room).absolutePath + File.separatorChar + name + File.separatorChar + "thumbnails")
		thumbDir.listFiles().length
	}   
	
	def roomDirectory = {conf, room ->
		return new File(presentationDir + File.separatorChar + conf + File.separatorChar + room)
	}

	public boolean convertPage(File presentationFile, int page) {
		PageConverter converter = new Pdf2SwfPageConverter()
		converter.setSwfToolsDir(swfToolsDir)

		File output = new File(presentationFile.getParent() + File.separatorChar + "slide-" + page + ".swf")

		if (! converter.convert(presentationFile, output, page)) {
			log.info "cannot create ${output.absolutePath}"
			println "cannot create ${output.absolutePath}"
			convertPageAsAnImage(presentationFile, output, page)
		} else {
			println "The size of the swf file is " + output.size()
			// If the resulting swf file is greater than 500K, it probably contains a lot of objects
			// that it becomes very slow to render on the client. Take an image snapshot instead and
			// use it to generate the SWF file. (ralam Sept 2, 2009)
			if (output.size() > 500000) {
				convertPageAsAnImage(presentationFile, output, page)
			}
		}

		// If all fails, generate a blank slide.
		if (! output.exists()) {
			println "Creating blank slide for ${output.absolutePath}"
			generateBlankSlide(output.getAbsolutePath())
		}
		return true
	}
	
	private boolean convertPageAsAnImage(File presentationFile, File output, int page) {
		PageExtractor extractor = new GhostscriptPageExtractor()
		extractor.setGhostscriptExec(ghostScriptExec)
		extractor.setNoPdfMarkWorkaround(noPdfMarkWorkaround)

		def tempDir = new File(presentationFile.parent + File.separatorChar + "temp")
		tempDir.mkdir()

		File tempPdfFile = new File(tempDir.absolutePath + File.separator + "temp-${page}.pdf")

		if (extractor.extractPage(presentationFile, tempPdfFile, page)) {
			log.info "created using ghostscript ${tempPdfFile.absolutePath}"
			println "created using ghostscript ${tempPdfFile.absolutePath}"

			File tempPngFile = new File(tempDir.getAbsolutePath() + "/temp-${page}.png")

			PageConverter imConverter = new ImageMagickPageConverter()
			imConverter.setImageMagickDir(imageMagickDir)
			if (imConverter.convert(tempPdfFile, tempPngFile, 1)) {
				log.info "created using imagemagick ${tempPngFile.absolutePath}"
				println "created using imagemagick ${tempPngFile.absolutePath}"

				PageConverter pngConverter = new Png2SwfPageConverter()
				pngConverter.setSwfToolsDir(swfToolsDir)
				if (pngConverter.convert(tempPngFile, output, 1)) {
					log.info "converted ${tempPngFile.absolutePath} to ${output.absolutePath} "
					println "converted ${tempPngFile.absolutePath} to ${output.absolutePath}"
				}
			}
		}		
	}

	private void generateBlankSlide(String dest) {
		File slide = new File(dest);		
		FileCopyUtils.copy(new File(BLANK_SLIDE), slide);		
	}
	
	private void sendConvertErrorMessage(String conference, String room, String presName, File presentationFile, String returnCode) {
		def msg = new HashMap()
		msg.put("room", room)
		msg.put("returnCode", returnCode)
		msg.put("presentationName", presName)
		log.debug "Failed to convert $presentationFile.absolutePath to presentation file : " + returnCode
		println "Failed to convert $presentationFile.absolutePath to presentation file : " + returnCode
		sendJmsMessage(msg)
	}
	
	private void sendConversionUpdateMessage(String conference, String room, String presName, int totalSlides, int slidesCompleted) {
		def msg = new HashMap()
		msg.put("room", room)
		msg.put("returnCode", "CONVERT")
		msg.put("presentationName", presName)
		msg.put("totalSlides", new Integer(totalSlides))
		msg.put("slidesCompleted", new Integer(slidesCompleted))
		sendJmsMessage(msg)	
	}
	
	private void sendCreatingThumbnailsUpdateMessage(String conference, String room, String presName) {
		def msg = new HashMap()
		msg.put("room", room)
		msg.put("returnCode", "THUMBNAILS")
		msg.put("presentationName", presName)
		sendJmsMessage(msg)			
	}
	
	private void sendConversionCompletedMessage(String conference, String room, String presName, int numberOfPages) {
		
		String xml = generateUploadedPresentationInfo(conference, room, presName, numberOfPages)
		
		println xml
		
		def msg = new HashMap()
		msg.put("room", room)
		msg.put("returnCode", "SUCCESS")
		msg.put("presentationName", presName)
		msg.put("message", xml)
		log.debug "Sending presentation conversion success for ${room} ${presName}."
		sendJmsMessage(msg)		
		log.debug "Send another success message...looks like bbb-apps at Red5 sometimes miss the message...need to investigate"
		sendJmsMessage(msg)
		
	}
	
	private String generateUploadedPresentationInfo(String conf, String confRoom, String presName, int numberOfPages) {
		def writer = new java.io.StringWriter()
		def builder = new groovy.xml.MarkupBuilder(writer)
		        		
		def uploadedpresentation = builder.uploadedpresentation {        
		    conference(id:conf, room:confRoom) {
		       presentation(name:presName) {
		          slides(count:numberOfPages) {
		             for (def i = 1; i <= numberOfPages; i++) {
		                slide(number:"${i}", name:"slide/${i}", thumb:"thumbnail/${i}")
		             }
		          }
		       }
			}
		}
	
		return writer.toString()
	}
	
	private sendJmsMessage(HashMap message) {
		def msg = message.toString()
		log.debug "Send Jms message $msg"
		jmsTemplate.convertAndSend(JMS_UPDATES_Q, message)
	}
}	

/*** Helper classes **/
import java.io.FilenameFilter;
import java.io.File;
class PngFilter implements FilenameFilter {
    public boolean accept(File dir, String name) {
        return (name.endsWith(".png"));
    }
}

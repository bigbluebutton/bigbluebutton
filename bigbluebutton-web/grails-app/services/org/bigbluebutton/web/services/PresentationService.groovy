/*
 * BigBlueButton - http://www.bigbluebutton.org
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
 * $Id: $
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
	    println "Uploaded presentation ${presentation_name}"
		File dir = new File(roomDirectory(conf, room).absolutePath + File.separatorChar + presentation_name)
		println "upload to directory ${dir.absolutePath}"
			
		/* If the presentation name already exist, delete it. We should provide a check later on to notify user
			that there is already a presentation with that name. */
		if (dir.exists()) deleteDirectory(dir)		
		dir.mkdirs()
		
		assert dir.exists()
		return dir
    }

	def processUploadedPresentation = {conf, room, presentationName, presentationFile ->	
		// Run conversion on another thread.
		new Timer().runAfter(1000) 
		{
			//first we need to know how many pages in this pdf
			log.debug "Determining number of pages"
			PageCounter pageCounter = new Pdf2SwfPageCounter()
			pageCounter.setSwfToolsDir(swfToolsDir)
			
			int numPages = pageCounter.countNumberOfPages(presentationFile)
			log.info "There are $numPages pages in $presentationFile.absolutePath"
			convertUploadedPresentation(room, presentationName, presentationFile, numPages)		
		}
	}
 	
	def showSlide(String conf, String room, String presentationName, String id) {
		new File(roomDirectory(conf, room).absolutePath + File.separatorChar + presentationName + File.separatorChar + "slide-${id}.swf")
	}
	
	def showPresentation = {conf, room, filename ->
		new File(roomDirectory(conf, room).absolutePath + File.separatorChar + filename + File.separatorChar + "slides.swf")
	}
	
	def showThumbnail = {conf, room, presentationName, thumb ->
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

	public boolean convertUploadedPresentation(String room, String presentationName, File presentationFile, int numPages) {		
		log.debug "Converting uploaded presentation $presentationFile.absolutePath"
		for (int page = 1; page <= numPages; page++) 
	    {
			def msg = new HashMap()
			msg.put("room", room)
			msg.put("returnCode", "CONVERT")
			msg.put("presentationName", presentationName)
			msg.put("totalSlides", new Integer(numPages))
			msg.put("slidesCompleted", new Integer(page))
			sendJmsMessage(msg)
			
			log.debug "Converting page $page of $presentationFile.absolutePath"
			
			convertPage(presentationFile, page)
	    }

		log.debug "Creating thumbnails for $presentationFile.absolutePath"
		
		ThumbnailCreatorImp tc = new ThumbnailCreatorImp()
		tc.imageMagickDir = imageMagickDir
		tc.blankThumbnail = BLANK_THUMBNAIL
		tc.createThumbnails(presentationFile, numPages)
		
		def msg = new HashMap()
		msg.put("room", room)
		msg.put("returnCode", "SUCCESS")
		msg.put("presentationName", presentationName)
		msg.put("message", "The presentation is now ready.")
		log.debug "Sending presentation conversion success for $presentationFile.absolutePath."
		sendJmsMessage(msg)		
		log.debug "Send another success message...looks like bbb-apps at Red5 sometimes miss the message...need to investigate"
		sendJmsMessage(msg)
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
			println "Creating balnk slide for ${output.absolutePath}"
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

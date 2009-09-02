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
package org.bigbluebutton.presentation

import org.springframework.util.FileCopyUtils

public class ThumbnailCreatorImp implements ThumbnailCreator {

	String imageMagickDir
	String blankThumbnail
	
	private static String TEMP_THUMB_NAME = "temp-thumb"
	
	public boolean createThumbnails(File presentationFile, int pageCount){
		boolean success = false
	 	File thumbsDir = determineThumbnailDirectory(presentationFile)
	 	
	 	if (! thumbsDir.exists())
	 		thumbsDir.mkdir()
	 		
	 	cleanDirectory(thumbsDir)
	 	
		try {
			success = generateThumbnails(thumbsDir, presentationFile)
	    }
	    catch (InterruptedException e) {
	        println "exception happened - here's what I know: "
	        println e.printStackTrace()
	        success = false
	    }
	    
	    if (! success) createBlankThumbnails(thumbsDir, pageCount)
	    
	    renameThumbnails(thumbsDir)
	    
	    return true
	}

	private def generateThumbnails(File thumbsDir, File presentationFile) throws InterruptedException {
		println "Creating thumbnails:"
        
	 	def source = presentationFile.getAbsolutePath()
	 	def dest = thumbsDir.getAbsolutePath() + "/${TEMP_THUMB_NAME}.png"
	 	
        def command = imageMagickDir + "/convert -thumbnail 150x150 " + source + " " + dest
        println "Executing $command"
        Process p = Runtime.getRuntime().exec(command);       
	
		int exitValue = p.waitFor()

        if (exitValue == 0) return true
		
		return false		
	}
	
	private File determineThumbnailDirectory(File presentationFile) {
		return new File(presentationFile.getParent() + File.separatorChar + "thumbnails")
	}
	
	private def renameThumbnails(File dir) {
		
        dir.eachFile{ file ->
        	// filename should be something like 'c:/temp/bigluebutton/presname/thumbnails/temp-thumb-1.png'
        	def filename = file.absolutePath

        	// Extract the page number. There should be 3 matches.
        	// 1. c:/temp/bigluebutton/presname/thumbnails/temp-thumb
        	// 2. 1 ---> what we are interested in
        	// 3. .png
        	def infoRegExp = /(.+-thumb)-([0-9]+)(.png)/
        	def matcher = (filename =~ infoRegExp)
        	if (matcher.matches()) {  
        		// We are interested in the second match.
        	    int pageNum = new Integer(matcher[0][2]).intValue()
        	    println "Renaming thumnail ${pageNum}"
        	    def newFilename = "thumb-${++pageNum}.png"
        	    File renamedFile = new File(file.parent + File.separator + newFilename)
        	    file.renameTo(renamedFile)
        	}        	
        }
	}
	
	def createBlankThumbnails(File thumbsDir, int pageCount) {
		println "Creating blank thumbnail"
		File[] thumbs = thumbsDir.listFiles();
		
		if (thumbs.length != pageCount) {
			for (int i = 0; i < pageCount; i++) {
				File thumb = new File(thumbsDir.absolutePath + File.separator + "${TEMP_THUMB_NAME}-${i}.png")
				if (! thumb.exists()) {
					copyBlankThumbnail(thumb);
				}
			}
		}
	}
	
	private void copyBlankThumbnail(File thumb) {
		FileCopyUtils.copy(new File(blankThumbnail), thumb)		
	}
	
	private def cleanDirectory = {directory ->	
		File[] files = directory.listFiles();				
		for (int i = 0; i < files.length; i++) {
			files[i].delete()
		}
	}
}

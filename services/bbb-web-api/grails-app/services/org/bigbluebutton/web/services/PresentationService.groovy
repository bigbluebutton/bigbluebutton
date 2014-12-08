/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
*
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/
package org.bigbluebutton.web.services

import java.util.concurrent.*;
import java.lang.InterruptedException
import org.bigbluebutton.presentation.DocumentConversionService
import org.bigbluebutton.presentation.UploadedPresentation

class PresentationService {

    static transactional = false
	DocumentConversionService documentConversionService
	def presentationDir
	def testConferenceMock
	def testRoomMock
	def testPresentationName
	def testUploadedPresentation
	def defaultUploadedPresentation
	
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
	
	def processUploadedPresentation = {uploadedPres ->	
		// Run conversion on another thread.
		new Timer().runAfter(1000) 
		{
			documentConversionService.processDocument(uploadedPres)
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
	
	def showTextfile = {conf, room, presentationName, textfile ->
		println "Show textfiles request for $presentationName $textfile"
		def txt = roomDirectory(conf, room).absolutePath + File.separatorChar + presentationName + File.separatorChar +
					"textfiles" + File.separatorChar + "slide-${textfile}.txt"
		log.debug "showing $txt"
		
		new File(txt)
	}
	
	def numberOfThumbnails = {conf, room, name ->
		def thumbDir = new File(roomDirectory(conf, room).absolutePath + File.separatorChar + name + File.separatorChar + "thumbnails")
		thumbDir.listFiles().length
	}
	
	def numberOfTextfiles = {conf, room, name ->
		log.debug roomDirectory(conf, room).absolutePath + File.separatorChar + name + File.separatorChar + "textfiles"
		def textfilesDir = new File(roomDirectory(conf, room).absolutePath + File.separatorChar + name + File.separatorChar + "textfiles")
		textfilesDir.listFiles().length
	}
	
	def roomDirectory = {conf, room ->
		return new File(presentationDir + File.separatorChar + conf + File.separatorChar + room)
	}

	def testConversionProcess() {
		File presDir = new File(roomDirectory(testConferenceMock, testRoomMock).absolutePath + File.separatorChar + testPresentationName)
		
		if (presDir.exists()) {
			File pres = new File(presDir.getAbsolutePath() + File.separatorChar + testUploadedPresentation)
			if (pres.exists()) {
				UploadedPresentation uploadedPres = new UploadedPresentation(testConferenceMock, testRoomMock, testPresentationName);
				uploadedPres.setUploadedFile(pres);
				// Run conversion on another thread.
				new Timer().runAfter(1000) 
				{
					documentConversionService.processDocument(uploadedPres)
				}
			} else {
				log.error "${pres.absolutePath} does NOT exist"
			}			
		} else {
			log.error "${presDir.absolutePath} does NOT exist."
		}
		
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

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

package org.bigbluebutton.presentation.imp;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Writer;

import org.bigbluebutton.presentation.SupportedFileTypes;
import org.bigbluebutton.presentation.TextFileCreator;
import org.bigbluebutton.presentation.UploadedPresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class TextFileCreatorImp implements TextFileCreator {
	private static Logger log = LoggerFactory.getLogger(TextFileCreatorImp.class);
	
	private String IMAGEMAGICK_DIR;
	
	@Override
	public boolean createTextFiles(UploadedPresentation pres) {
		boolean success = false;
		File textfilesDir = determineTextfilesDirectory(pres.getUploadedFile());
		if (! textfilesDir.exists())
			textfilesDir.mkdir();
		
		cleanDirectory(textfilesDir);
		
		try {
			success = generateTextFiles(textfilesDir, pres);
	    } catch (InterruptedException e) {
	    	log.warn("Interrupted Exception while generating thumbnails.");
	        success = false;
	    }
	    
	    //TODO: in case that it doesn't generated the textfile, we should create a textfile with some message
	    // createUnavailableTextFile
		
		return success;
	}

	private boolean generateTextFiles(File textfilesDir, UploadedPresentation pres) throws InterruptedException {
	 	boolean success = true;
		String source = pres.getUploadedFile().getAbsolutePath();
	 	String dest;
	 	String COMMAND = "";
	 	
	 	if(SupportedFileTypes.isImageFile(pres.getFileType())){
	 		dest = textfilesDir.getAbsolutePath() + File.separator + "slide-1.txt";
	 		String text = "No text could be retrieved for the slide";
	 		 
            File file = new File(dest);
            Writer writer = null;
			try {
				writer = new BufferedWriter(new FileWriter(file));
				writer.write(text);
			} catch (IOException e) {
				log.error("Error: " + e.getMessage());
				success = false;
			} finally {
				try {
					writer.close();
				} catch (IOException e) {
					log.error("Error: " + e.getMessage());
					success = false;
				}
			}
            
	 	}else{
	 		dest = textfilesDir.getAbsolutePath() + File.separator + "slide-";
	 		// sudo apt-get install xpdf-utils
	 		for( int i = 1; i <= pres.getNumberOfPages(); i++){
	 			COMMAND = IMAGEMAGICK_DIR + "/pdftotext -raw -nopgbrk -f "+ i +" -l " + i + " " + source + " " + dest + i + ".txt";
	 			boolean done = new ExternalProcessExecutor().exec(COMMAND, 60000);
	 			if (!done) {
	 				success = false;
	 		 		log.warn("Failed to create textfiles: " + COMMAND);
	 		 		break;
	 		 	}
	 		}
	 		
	 	}

		return success;		
	}
	
	private File determineTextfilesDirectory(File presentationFile) {
		return new File(presentationFile.getParent() + File.separatorChar + "textfiles");
	}
	
	private void cleanDirectory(File directory) {	
		File[] files = directory.listFiles();				
		for (int i = 0; i < files.length; i++) {
			files[i].delete();
		}
	}

	public void setImageMagickDir(String imageMagickDir) {
		IMAGEMAGICK_DIR = imageMagickDir;
	}

}

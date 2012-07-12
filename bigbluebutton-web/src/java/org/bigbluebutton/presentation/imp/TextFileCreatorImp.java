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
package org.bigbluebutton.presentation.imp;

import java.io.File;

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
	 		/*dest = thumbsDir.getAbsolutePath() + File.separator + TEMP_THUMB_NAME + ".png";
	 		COMMAND = IMAGEMAGICK_DIR + "/convert -thumbnail 150x150 " + source + " " + dest;*/
	 		log.info("Image not supported for convert to textfile");
	 	}else{
	 		dest = textfilesDir.getAbsolutePath() + File.separator + "slide-";
	 		// sudo apt-get install xpdf-utils
	 		for( int i=1; i<=pres.getNumberOfPages(); i++){
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

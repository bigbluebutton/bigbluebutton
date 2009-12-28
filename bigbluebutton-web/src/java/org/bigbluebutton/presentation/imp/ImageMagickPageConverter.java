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
import java.io.IOException;

import org.bigbluebutton.presentation.PageConverter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ImageMagickPageConverter implements PageConverter {
	private static Logger log = LoggerFactory.getLogger(ImageMagickPageConverter.class);
	
	private String IMAGEMAGICK_DIR;
	
	public boolean convert(File presentationFile, File output, int page){
		
        String COMMAND = IMAGEMAGICK_DIR + "/convert -depth 8 " + presentationFile.getAbsolutePath() + " " + output.getAbsolutePath();          
		
		Process process;
		try {
			process = Runtime.getRuntime().exec(COMMAND);
			// Wait for the process to finish.
			int exitValue = process.waitFor();
			if (exitValue != 0) {
		    	log.warn("Exit Value != 0 while for " + COMMAND);
		    }
		} catch (IOException e) {
			log.error("IOException while processing " + COMMAND);
		} catch (InterruptedException e) {
			log.error("InterruptedException while processing " + COMMAND);
		}            
						
		if (output.exists()) {
			return true;		
		} else {
			log.warn("Failed to convert: " + output.getAbsolutePath() + " does not exist.");
			return false;
		}
		
	}

	public void setImageMagickDir(String dir) {
		IMAGEMAGICK_DIR = dir;
	}
}

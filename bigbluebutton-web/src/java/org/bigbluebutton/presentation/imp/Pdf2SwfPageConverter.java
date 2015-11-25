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

import java.io.File;
import org.bigbluebutton.presentation.PageConverter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Pdf2SwfPageConverter implements PageConverter {
	private static Logger log = LoggerFactory.getLogger(Pdf2SwfPageConverter.class);
	
	private String SWFTOOLS_DIR;
	private String fontsDir;
	
	public boolean convert(File presentation, File output, int page) {
	    String source = presentation.getAbsolutePath();
	    String dest = output.getAbsolutePath();
	    /* Using flash taget version 7 to support Adobe AIR. Otherwise pdf2swf will  /
	    /  insert an unsupported command "allowDomain" into the generated swf files */
	    String flashVersion = "-T7";
	    
	    String COMMAND = SWFTOOLS_DIR + File.separator + "pdf2swf " + flashVersion + " -F " + fontsDir + " -p " + page + " " + source + " -o " + dest;
	    log.debug("Executing: " + COMMAND);
	    
	    boolean done = new ExternalProcessExecutor().exec(COMMAND, 60000);      
		
		File destFile = new File(dest);
		if (done && destFile.exists()) {
			return true;		
		} else {
			COMMAND = SWFTOOLS_DIR + File.separator + "pdf2swf " + flashVersion + " -s poly2bitmap  -F " + fontsDir + " -p " + page + " " + source + " -o " + dest;
			log.debug("Converting graphics to bitmaps");
			log.debug("Executing: " + COMMAND);
			done = new ExternalProcessExecutor().exec(COMMAND, 60000);
			if (done && destFile.exists()){
				return true;
			} else {
				log.warn("Failed to convert: " + dest + " does not exist.");
				return false;
			}
		}
		
	}

	public void setSwfToolsDir(String dir) {
		SWFTOOLS_DIR = dir;
	}
	
	public void setFontsDir(String dir) {
		fontsDir = dir;
	}
}

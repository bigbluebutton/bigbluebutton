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
	    String AVM2SWF = "-T9";
	    
	    String COMMAND = SWFTOOLS_DIR + File.separator + "pdf2swf " + AVM2SWF + " -F " + fontsDir + " -p " + page + " " + source + " -o " + dest;    
	    log.debug("Executing: " + COMMAND);
	    
	    boolean done = new ExternalProcessExecutor().exec(COMMAND, 60000);      
		
		File destFile = new File(dest);
		if (done && destFile.exists()) {
			return true;		
		} else {
			log.warn("Failed to convert: " + dest + " does not exist.");
			return false;
		}
		
	}

	public void setSwfToolsDir(String dir) {
		SWFTOOLS_DIR = dir;
	}
	
	public void setFontsDir(String dir) {
		fontsDir = dir;
	}
}

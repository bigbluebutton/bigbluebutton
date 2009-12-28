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

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.bigbluebutton.presentation.PageCounter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Pdf2SwfPageCounter implements PageCounter {
	private static Logger log = LoggerFactory.getLogger(Pdf2SwfPageCounter.class);
	
	private static final Pattern PAGE_NUMBER_PATTERN = Pattern.compile("page=([0-9]+)(?: .+)");	
	private String SWFTOOLS_DIR;

	public int countNumberOfPages(File presentationFile) {		
		int numPages = 0; //total numbers of this pdf	

		String COMMAND = SWFTOOLS_DIR + "/pdf2swf -I " + presentationFile.getAbsolutePath(); 
		
		try {
			Process p = Runtime.getRuntime().exec(COMMAND);            
        	
			BufferedReader stdInput = new BufferedReader(new InputStreamReader(p.getInputStream()));
			BufferedReader stdError = new BufferedReader(new InputStreamReader(p.getErrorStream()));
			String info;
			Matcher matcher;
			while ((info = stdInput.readLine()) != null) {
				//The output would be something like this 'page=21 width=718.00 height=538.00'.
	    		//We need to extract the page number (i.e. 21) from it.
				matcher = PAGE_NUMBER_PATTERN.matcher(info);
	    		if (matcher.matches()) {
	    			numPages = Integer.valueOf(matcher.group(1).trim()).intValue();
	    		}
			}
			while ((info = stdError.readLine()) != null) {
				log.error(info);
			}
			stdInput.close();
			stdError.close();

			// Wait for the process to finish.
        	int exitValue = p.waitFor();
        	if (exitValue != 0) {
		    	log.warn("Exit Value != 0 while for " + COMMAND);
		    }
		} catch (IOException e) {
			log.error("IOException while processing " + COMMAND);
		} catch (InterruptedException e) {
			log.error("InterruptedException while processing " + COMMAND);
		}		

		return numPages;
	}
		
	public void setSwfToolsDir(String dir) {
		SWFTOOLS_DIR = dir;
	}
}

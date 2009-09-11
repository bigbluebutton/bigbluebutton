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


public class Png2SwfPageConverter implements PageConverter{

	private String SWFTOOLS_DIR
	
	public boolean convert(File presentationFile, File output, int page){

		def now = new Date()
		println "PNG2SWF starting $now"
		
        def command = SWFTOOLS_DIR + "/png2swf -o " + output.getAbsolutePath() + " " + presentationFile.getAbsolutePath()
        println "Executing $command"
	    def process = Runtime.getRuntime().exec(command);            

		// Wait for the process to finish.
		int exitValue = process.waitFor()
		
		now = new Date()
		println "PNG2SWF ended $now"
				    
		if (output.exists()) return true		
		return false
	}
	
	public void setSwfToolsDir(String dir) {
		SWFTOOLS_DIR = dir
	}
}

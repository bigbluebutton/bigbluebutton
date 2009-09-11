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


public class GhostscriptPageExtractor implements PageExtractor{

	private String GHOSTSCRIPT_EXEC
	private String noPdfMarkWorkaround
	
	public boolean extractPage(File presentationFile, File output, int page){
		
		String OPTIONS = "-sDEVICE=pdfwrite -dNOPAUSE -dQUIET -dBATCH"
		String PAGE = "-dFirstPage=${page} -dLastPage=${page}"
		String dest = output.getAbsolutePath()
		
		//extract that specific page and create a temp-pdf(only one page) with GhostScript
		def command = GHOSTSCRIPT_EXEC + " " + OPTIONS + " " + PAGE + " " + "-sOutputFile=${dest}" + " " + noPdfMarkWorkaround + " " + presentationFile          
        println "Executing $command"
        
        def process
        int exitVal = -1
        
        try {
        	process = Runtime.getRuntime().exec(command);            
        	
        	// Wait for the process to finish.
        	exitVal = process.waitFor()
    				
        } catch (InterruptedException e) {
        	System.out.println(e.toString());
        }
        
	    if (exitVal == 0) {
	    	return true
	    } else {
	    	return false
	    }
	}	
	
	public void setGhostscriptExec(String exec) {
		GHOSTSCRIPT_EXEC = exec
	}
	
	public void setNoPdfMarkWorkaround(String noPdfMarkWorkaround) {
		this.noPdfMarkWorkaround = noPdfMarkWorkaround
	}
}

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


public class Pdf2SwfPageCounter implements PageCounter{

	private String SWFTOOLS_DIR
	
	public int countNumberOfPages(File presentationFile){
		def numPages = -1 //total numbers of this pdf, also used as errorcode(-1)	

		try 
		{
			def command = SWFTOOLS_DIR + "/pdf2swf -I " + presentationFile.getAbsolutePath()        
			println "Executing with waitFor $command"
			def p = Runtime.getRuntime().exec(command);            
        	
			def stdInput = new BufferedReader(new InputStreamReader(p.getInputStream()));
			def stdError = new BufferedReader(new InputStreamReader(p.getErrorStream()));
			def info
			def str //output information to console for stdInput and stdError
			while ((info = stdInput.readLine()) != null) {
				//The output would be something like this 'page=21 width=718.00 height=538.00'.
	    		//We need to extract the page number (i.e. 21) from it.
	    		def infoRegExp = /page=([0-9]+)(?: .+)/
	    		def matcher = (info =~ infoRegExp)
	    		if (matcher.matches()) {
	    			numPages = matcher[0][1]
	    		} else {
	    			println "no match info: ${info}"
	    		}
			}
			while ((info = stdError.readLine()) != null) {
				System.out.println("Got error getting info from file):\n");
				System.out.println(str);
			}
			stdInput.close();
			stdError.close();

			// Wait for the process to finish.
        	int exitVal = p.waitFor()
		}
		catch (IOException e) {
			System.out.println("exception happened - here's what I know: ");
			e.printStackTrace();
		}		

		return new Integer(numPages).intValue()
	}
	
	public void setSwfToolsDir(String dir) {
		SWFTOOLS_DIR = dir;
	}
}

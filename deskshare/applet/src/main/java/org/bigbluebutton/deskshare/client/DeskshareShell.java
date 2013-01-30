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
package org.bigbluebutton.deskshare.client;

import java.io.IOException;

/*
 * An application that calls the VBScript to test if the application is returning the exit codes.
 */
public class DeskshareShell {
	
	public static void main(String[] args) {
		String COMMAND = "wscript deskshare.vbs -s 192.168.0.120 -r 6e87dfef-9f08-4f80-993f-c0ef5f7b999b";          
		
		Process process;
		try {
			process = Runtime.getRuntime().exec(COMMAND);
			// Wait for the process to finish.
			int exitValue = process.waitFor();
			System.out.println("Exit Value " + exitValue + " while for " + COMMAND);
			if (exitValue != 0) {
		    	System.out.println("Exit Value != 0 while for " + COMMAND);
		    }
		} catch (IOException e) {
			System.out.println("IOException while processing " + COMMAND);
		} catch (InterruptedException e) {
			System.out.println("InterruptedException while processing " + COMMAND);
		}
	}

}

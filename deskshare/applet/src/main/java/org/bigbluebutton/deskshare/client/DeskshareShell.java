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

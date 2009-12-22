package org.bigbluebutton.presentation.imp;

import java.io.File;
import java.io.IOException;

import org.bigbluebutton.presentation.PageConverter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Png2SwfPageConverter implements PageConverter {
	private static Logger log = LoggerFactory.getLogger(Png2SwfPageConverter.class);
	
	private String SWFTOOLS_DIR;
	
	public boolean convert(File presentationFile, File output, int page){		
		String COMMAND = SWFTOOLS_DIR + "/png2swf -o " + output.getAbsolutePath() + " " + presentationFile.getAbsolutePath();		
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
	
	public void setSwfToolsDir(String dir) {
		SWFTOOLS_DIR = dir;
	}

}

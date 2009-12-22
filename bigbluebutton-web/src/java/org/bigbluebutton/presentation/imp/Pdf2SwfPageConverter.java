package org.bigbluebutton.presentation.imp;

import java.io.File;
import java.io.IOException;

import org.bigbluebutton.presentation.PageConverter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Pdf2SwfPageConverter implements PageConverter {
	private static Logger log = LoggerFactory.getLogger(Pdf2SwfPageConverter.class);
	
	private String SWFTOOLS_DIR;

	public boolean convert(File presentation, File output, int page) {
	    String source = presentation.getAbsolutePath();
	    String dest = output.getAbsolutePath();
	    
	    String COMMAND = SWFTOOLS_DIR + File.separator + "pdf2swf -p " + page + " " + source + " -o " + dest;    
	    log.debug(COMMAND);
	    
		Process process;
		int exitValue = -1;
		
		try {
			process = Runtime.getRuntime().exec(COMMAND);			
			// Wait for the process to finish
			exitValue = process.waitFor();
			if (exitValue != 0) {
		    	log.warn("Exit Value != 0 while for " + COMMAND);
		    }
		} catch (IOException e) {
			log.error("IOException while processing " + COMMAND);
		} catch (InterruptedException e) {
			log.error("InterruptedException while processing " + COMMAND);
		}
		
		File destFile = new File(dest);
		if (destFile.exists()) {
			return true;		
		} else {
			log.warn("Failed to convert: " + dest + " does not exist.");
			return false;
		}
		
	}

	public void setSwfToolsDir(String dir) {
		SWFTOOLS_DIR = dir;
	}
}

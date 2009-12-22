package org.bigbluebutton.presentation.imp;

import java.io.File;
import java.io.IOException;

import org.bigbluebutton.presentation.PageExtractor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class GhostscriptPageExtractor implements PageExtractor {
	private static Logger log = LoggerFactory.getLogger(GhostscriptPageExtractor.class);
	
	private String GHOSTSCRIPT_EXEC;
	private String noPdfMarkWorkaround;
	private String SPACE = " ";
	
	public boolean extractPage(File presentationFile, File output, int page){		
		String OPTIONS = "-sDEVICE=pdfwrite -dNOPAUSE -dQUIET -dBATCH";
		String FIRST_PAGE = "-dFirstPage=" + page;
		String LAST_PAGE = "-dLastPage=" + page;		
		String DESTINATION = output.getAbsolutePath();
		String OUTPUT_FILE = "-sOutputFile=" + DESTINATION;
		
		//extract that specific page and create a temp-pdf(only one page) with GhostScript
		String COMMAND = GHOSTSCRIPT_EXEC + SPACE + OPTIONS + SPACE + FIRST_PAGE + SPACE + LAST_PAGE + SPACE 
							+ OUTPUT_FILE + SPACE + noPdfMarkWorkaround + SPACE + presentationFile.getAbsolutePath();
		
        log.debug(COMMAND);
        
        Process process;
        int exitVal = -1;
        
        try {
        	process = Runtime.getRuntime().exec(COMMAND);                    	
        	// Wait for the process to finish.
        	exitVal = process.waitFor();    				
        } catch (InterruptedException e) {
        	log.error("InterruptedException while processing " + COMMAND);
        } catch (IOException e) {
        	log.error("IOException while processing " + COMMAND);
		}
        
	    if (exitVal == 0) {
	    	return true;
	    } else {
	    	log.warn("Exit Value != 0 while for " + COMMAND);
	    	return false;
	    }
	}	
	
	public void setGhostscriptExec(String exec) {
		GHOSTSCRIPT_EXEC = exec;
	}
	
	public void setNoPdfMarkWorkaround(String noPdfMarkWorkaround) {
		this.noPdfMarkWorkaround = noPdfMarkWorkaround;
	}

}

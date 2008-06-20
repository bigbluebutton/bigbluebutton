/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2008 by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* This program is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with this program; if not, write to the Free Software Foundation, Inc.,
* 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
* 
*/

package org.bigbluebuttonproject.fileupload.document.impl;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.ConnectException;
import java.util.ArrayList;
import java.util.Iterator;

import org.apache.commons.io.FilenameUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;


/**
 * Class to convert pdf slide presentation files to swf format slide.
 * It invokes tools to do some tasks: pdfExtractor and swftoolConverter.
 * [pdfExtractor: splits pdf presentation slide pages into single page pdf files]
 * [swftoolConverter: converts pdf to swf]
 * 
 * @author ritzalam
 */
public class PdfToSwfDocumentHandler {
	
	/** The Constant logger. */
	private static final Log logger = LogFactory.getLog(PdfToSwfDocumentHandler.class);
	// message sender used to send messages to blindside server using ActiveMQ
	/** The updates msg sender. */
	private UpdatesMessageSender updatesMsgSender = null;
	
	// used to invoke the tools to do the operations
	/** The swftool converter. */
	private String swftoolConverter;
	
	/** The pdf extractor. */
	private String pdfExtractor;
	
	/** The room. */
	private Integer room;
	
	/**
	 * Setter for message sender used to send messages to blindside server using ActiveMQ.
	 * 
	 * @param updatesMsgSender the updates msg sender
	 */
    public void setUpdatesMsgSender(UpdatesMessageSender updatesMsgSender) {
		this.updatesMsgSender = updatesMsgSender;
	}
    
    /**
     * Setter for swftoolConverter name to be used to generate command to invoke the tool.
     * 
     * @param swftoolConverter the swftool converter
     */
	public void setSwftoolConverter(String swftoolConverter) {
		this.swftoolConverter = swftoolConverter;
	}
	
	/**
	 * Setter for PdfExtractor name to be used to generate command to invoke the tool.
	 * 
	 * @param pdfExtractor the pdf extractor
	 */
	public void setpdfExtractor(String pdfExtractor) {
		this.pdfExtractor = pdfExtractor;
	}
	
	/**
	 * Convert all the presentation slide from source directory, to swf format(for the conference room given).
	 * First by splitting it into single page pdf files and saving them in destination directory.
	 * And then converting them to SWF files by invoking convertPDFtoSWF() on every pdf file in source directory.
	 * 
	 * @param room conference ID
	 * @param fileSource source directory where pdf files are.
	 * @param destDir destination directory
	 */
    public synchronized void convert(Integer room, File fileSource, File destDir) {
    	this.room = room;
    	
        updatesMsgSender.sendMessage(room, ReturnCode.UPDATE, "Generating slides.");
        //extract pages
        extractPages(fileSource, destDir);
        
		ArrayList<File> files = getConvertedSlides(destDir.toString());
		
		int curSlide = 1;
		for (Iterator<File> it = files.iterator(); it.hasNext();) {
			File aFile = (File) it.next();
			String fname = aFile.getName();
			System.out.println("Filename = [" + fname + "]");
			
			int dot = fname.lastIndexOf('.');
			fname = fname.substring(0, dot);
			fname += ".swf";
			
			File outFile = new File(aFile.getParent() + File.separator + fname);
			
			System.out.println("Input = [" + aFile.getAbsolutePath() + "]");
			System.out.println("Output = [" + outFile.getAbsolutePath() + "]");
			convertPDFtoSWF(aFile, outFile);
			updatesMsgSender.sendMessage(room, ReturnCode.CONVERT, files.size(), curSlide++);
		}        
    }
    
    /**
     * This method extracts the pdf file given as the parameter,
     * input and outputs the resulting files in the location referenced by the parameter output.
     * 
     * @param input the input
     * @param output the output
     */
	private void extractPages(File input, File output) {
		String SPACE = " ";
		String BURST = "burst";
		String filenameFormat = room + "-slide-%1d.pdf";
		
        String s = null;
        String command = pdfExtractor + SPACE + input.getAbsolutePath() + SPACE + BURST
        		+ SPACE + "output " + output.getAbsolutePath() + File.separator + filenameFormat;
        
        logger.info("extracting command[" + command + "]");
        
        try {
                     
            Process p = Runtime.getRuntime().exec(command);
            
            BufferedReader stdInput = new BufferedReader(new 
                 InputStreamReader(p.getInputStream()));

            BufferedReader stdError = new BufferedReader(new 
                 InputStreamReader(p.getErrorStream()));

            // read the output from the command            	            
        	logger.debug("Here is the standard output of the command:\n");
            while ((s = stdInput.readLine()) != null) {
                logger.debug(s);
            }
            
            // read any errors from the attempted command
            logger.debug("Here is the standard error of the command (if any):\n");
            while ((s = stdError.readLine()) != null) {
            	logger.error(s);
            }
            stdInput.close();
            stdError.close();
        }
        catch (IOException e) {
            logger.error("exception happened - here's what I know: ");
            e.printStackTrace();
            updatesMsgSender.sendMessage(room, ReturnCode.SWFTOOLS, "Failed while trying to convert document to SWF.");
        }						
	}    
    
    /**
     * This methods converts the input file (given as parameter) to swf file by invoking swftoolconverter tool.
     * 
     * @param input file to be converted
     * @param output converted .swf file
     */
	private void convertPDFtoSWF(File input, File output) {
		String SPACE = " ";
		
        String s = null;
        String command = swftoolConverter + SPACE + input.getAbsolutePath() + " " + output.getAbsolutePath();
        try {
                     
            Process p = Runtime.getRuntime().exec(command);
            
            BufferedReader stdInput = new BufferedReader(new 
                 InputStreamReader(p.getInputStream()));

            BufferedReader stdError = new BufferedReader(new 
                 InputStreamReader(p.getErrorStream()));

            // read the output from the command            	            
        	logger.debug("Here is the standard output of the command:\n");
            while ((s = stdInput.readLine()) != null) {
                logger.debug(s);
            }
            
            // read any errors from the attempted command
            logger.debug("Here is the standard error of the command (if any):\n");
            while ((s = stdError.readLine()) != null) {
            	logger.error(s);
            }
            stdInput.close();
            stdError.close();
        }
        catch (IOException e) {
            logger.error("exception happened - here's what I know: ");
            e.printStackTrace();
            updatesMsgSender.sendMessage(room, ReturnCode.SWFTOOLS, "Failed while trying to convert document to SWF.");
        }						
	}
	
	/**
	 * This method loads all the pdf files in the source folder and returns them in an ArrayList.
	 * 
	 * @param sourceFolder which contains the slide files
	 * 
	 * @return ArrayList containing all pdf files
	 */
    private ArrayList<File> getConvertedSlides(String sourceFolder) 
    {
    	File file = new File(sourceFolder);
    		
    	File[] files = file.listFiles();
    		
    	ArrayList<File> listOfFiles = new ArrayList<File>();
    	
    	// checking all pdf format files in the source folder
    	for (int i= 0; i < files.length; i++) {
    		if (!files [i].isDirectory()) {
    			String filename = (String)files[i].getName();
    			if (filename.toLowerCase().endsWith(".pdf")) {
    				listOfFiles.add(files[i]);	
    			}
    		}
    	}
    		
    	return listOfFiles;
    }        
    
}

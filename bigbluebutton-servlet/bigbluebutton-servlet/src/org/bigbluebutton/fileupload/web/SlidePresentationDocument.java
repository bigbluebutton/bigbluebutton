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

package org.bigbluebutton.fileupload.web;

import org.bigbluebutton.fileupload.document.UnsupportedPresentationDocumentException;
import org.bigbluebutton.fileupload.document.ZipDocumentHandler;
import org.bigbluebutton.fileupload.document.impl.FileSystemSlideManager;
import org.bigbluebutton.fileupload.document.impl.PdfToSwfDocumentHandler;
import org.bigbluebutton.fileupload.document.impl.PptDocumentHandler;
import org.bigbluebutton.fileupload.document.impl.PptToSwfDocumentHandler;
import org.bigbluebutton.fileupload.document.impl.ReturnCode;
import org.bigbluebutton.fileupload.document.impl.UpdatesMessageSender;
import org.bigbluebutton.fileupload.manager.UploadListener;
import org.bigbluebutton.fileupload.manager.UploadListenerManager;
import org.bigbluebutton.fileupload.manager.UploadMonitor;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.io.File;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.jms.core.MessageCreator;

import com.artofsolving.jodconverter.openoffice.connection.OpenOfficeConnection;
import com.artofsolving.jodconverter.openoffice.connection.SocketOpenOfficeConnection;

import javax.jms.Destination;
import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.Session;

// TODO: Auto-generated Javadoc
/**
 * This class is used to convert the uploaded presentation slide to SWF file format.
 * It assigns the converting requests to appropriate document handler class.
 * 
 * @author ritzalam
 */


public class SlidePresentationDocument {
    
    /** The log. */
    private static Log log = LogFactory.getLog(SlidePresentationDocument.class);

    /** The slide manager. */
    private FileSystemSlideManager slideManager = null;
    
    /** The ppt document handler. */
    private PptDocumentHandler pptDocumentHandler = null;
    
    /** The zip document handler. */
    private ZipDocumentHandler zipDocumentHandler = null;
    // handler for converting ppt to swf
    /** The ppt to swf handler. */
    private PptToSwfDocumentHandler pptToSwfHandler = null;
    
    // handler for converting pdf to swf
    /** The pdf to swf handler. */
    private PdfToSwfDocumentHandler pdfToSwfHandler = null;
    
   
    /** The uploaded file. */
    private File uploadedFile = null;
    // directory of the file to be uploaded to memory from file System
    /** The dest dir. */
    private File destDir = null;
    
    /** The room. */
    private Integer room;
    // updatesMsgSender for sending updates to bigbluebutton red5 server
    /** The updates msg sender. */
    private UpdatesMessageSender updatesMsgSender = null;
	
	/**
	 * This method takes care of loading the slides in the extracted folder.
	 * 
	 * @param uploaded the uploaded
	 * @param room the room
	 * 
	 * @throws UnsupportedPresentationDocumentException the unsupported presentation document exception
	 */
    public void load(File uploaded, Integer room) 
		throws UnsupportedPresentationDocumentException
	{
        if ((uploaded.getName().toLowerCase().endsWith(".pdf")) ||
            (uploaded.getName().toLowerCase().endsWith(".ppt")))
        {            
            this.uploadedFile = uploaded;
            this.room = room;
            
			destDir = new File(slideManager.getBaseDirectory() + File.separator 
					+ room + File.separator + slideManager.getExtractedFolder());

			// Clean the directory of remnant files.
			if (destDir.exists()) {
				log.info("Directroy not empty = [" + destDir.getAbsolutePath() + "]- deleting");
				
				/** This delete seems not to work. **/
				// destDir.delete();
				// Let's just loop through the file and delete one-by-one
				File[] files = destDir.listFiles();				
				for (int i = 0; i < files.length; i++) {
					files[i].delete();
				}
			
			} else {	            
				// Create a clean directory
				destDir.mkdirs();				
			}	
     
            log.info("Loading file from [" + uploadedFile.getName() + "]");
            // create and start DocumentLoader thread to convert presentation slides to swf format
            DocumentLoader loader = new DocumentLoader();
            Thread docLoader = new Thread(loader, "Document Loader");
            docLoader.start();
        } else {
        	// send unsupported file format error
        	updatesMsgSender.sendMessage(room, ReturnCode.WRONG_FORMAT, "Unsupported file type.");
        	
        	throw new UnsupportedPresentationDocumentException("Unsupported file type.");
        }
	}
	
	/**
	 * setter for slideManger.
	 * 
	 * @param slideManager the slide manager
	 */
	public void setSlideManager(FileSystemSlideManager slideManager) {
		this.slideManager = slideManager;
	}
	
	/**
	 * setter for pptDocumentHandler.
	 * 
	 * @param pptDocumentHandler the ppt document handler
	 */
	public void setPptDocumentHandler(PptDocumentHandler pptDocumentHandler) {
		this.pptDocumentHandler = pptDocumentHandler;
	}

	/**
	 * Sets the zip document handler.
	 * 
	 * @param zipDocumentHandler the new zip document handler
	 */
	public void setZipDocumentHandler(ZipDocumentHandler zipDocumentHandler) {
		this.zipDocumentHandler = zipDocumentHandler;
	}
	
    /**
     * Internal class used to perform the background loading of a slide presentation.
     */
    private class DocumentLoader implements Runnable {

        /* (non-Javadoc)
         * @see java.lang.Runnable#run()
         */
        public void run() {

            try {
            	
                if (uploadedFile.getName().toLowerCase().endsWith(".pdf")) {
                	// converting pdf format slide presentation
                	pdfToSwfHandler.convert(room, uploadedFile, destDir);                    
                } else if (uploadedFile.getName().toLowerCase().endsWith(".ppt")) {
                	updatesMsgSender.sendMessage(room, ReturnCode.UPDATE, "Converting Powerpoint document.");
//                	if (pptDocumentHandler == null)
//                		log.error("PPTHandler == NULL!!!!");
//                	pptDocumentHandler.convert(uploadedFile, destDir);
                	// converting ppt format slide presentation
                	pptToSwfHandler.convert(room, uploadedFile, destDir);                	
                } else {
                    log.error("Unsupported File.");
                    updatesMsgSender.sendMessage(room, ReturnCode.WRONG_FORMAT, "Unsupported file type.");
                    return;
                }

                ArrayList<File> generatedFiles = new ArrayList<File>(0);
                log.info("Loading slides from '" + destDir + "'.");
                
                generatedFiles = slideManager.getExtractedSlides(destDir.getAbsolutePath());
                             
                // Update the user if no slides were generated (which is unlikely)
                if (generatedFiles.size() < 1) {
                    if (log.isErrorEnabled()) {
                        log.error("Failed to generate slides.");
                    }
                    
                    return;
                }
/*        
                File currentFile;

 * Don't do this for now. Need to get slides as quickly as possible.
 * Let's do this when we can provide feedback to user through DWR.
                // Create thumnails
                String thumbName = "thumb-";
                
                for (int i = 0; i < generatedFiles.size(); i++) {
                    currentFile = (File) generatedFiles.get(i);
                    String filePath = currentFile.getParent();
                    String fileName = currentFile.getName();
                    
                    File thumbNail = new File(filePath + File.separator + thumbName + fileName);
                    
            		try {
            			slideManager.resizeImage(currentFile, thumbNail, 1.0f, 150);
            			log.info("Creating thumbnail '" + currentFile + "'.");
            			
            		} catch (Exception e) {
                        if (log.isErrorEnabled()) {
                            log.error("Failed to create icon " + currentFile.getName());
                        }           			
            		}
                }                
*/                
/*                // Now resize the slides
                for (int i = 0; i < generatedFiles.size(); i++) {
                    currentFile = (File) generatedFiles.get(i);
            		try {
            			slideManager.resizeImage(currentFile, currentFile, 1.0f, 400);
            			log.info("Resizing image '" + currentFile + "'.");
            			
            		} catch (Exception e) {
                        if (log.isErrorEnabled()) {
                            log.error("Failed to resize image " + currentFile.getName());
                        }           			
            		}
                }
*/                    
                String slidesXml = slideManager.createXml(room);
                updatesMsgSender.sendMessage(room, ReturnCode.SUCCESS, slidesXml);                
            
            } catch (Exception e) {
                if (log.isErrorEnabled()) {
                    log.error("Could not load document: \n ");
                    e.printStackTrace();
                }
            }
        }        
    }

	/**
	 * Sets the ppt to swf handler.
	 * 
	 * @param pptToSwfHandler the new ppt to swf handler
	 */
	public void setPptToSwfHandler(PptToSwfDocumentHandler pptToSwfHandler) {
		this.pptToSwfHandler = pptToSwfHandler;
	}

	/**
	 * Sets the pdf to swf handler.
	 * 
	 * @param pdfToSwfHandler the new pdf to swf handler
	 */
	public void setPdfToSwfHandler(PdfToSwfDocumentHandler pdfToSwfHandler) {
		this.pdfToSwfHandler = pdfToSwfHandler;
	}	
	
	/**
	 * Sets the updates msg sender.
	 * 
	 * @param updatesMsgSender the new updates msg sender
	 */
	public void setUpdatesMsgSender(UpdatesMessageSender updatesMsgSender) {
		this.updatesMsgSender = updatesMsgSender;
	}	
}

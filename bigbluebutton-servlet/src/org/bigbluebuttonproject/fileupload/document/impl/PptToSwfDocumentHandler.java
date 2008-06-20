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
import java.io.File;
import java.net.ConnectException;

import org.apache.commons.io.FilenameUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.artofsolving.jodconverter.DocumentConverter;
import com.artofsolving.jodconverter.openoffice.connection.OpenOfficeConnection;
import com.artofsolving.jodconverter.openoffice.connection.SocketOpenOfficeConnection;


/**
 * The Class PptToSwfDocumentHandler.
 */
public class PptToSwfDocumentHandler {
	
	/** The Constant logger. */
	private static final Log logger = LogFactory.getLog(PptToSwfDocumentHandler.class);
	
	/** The open office host. */
	private String openOfficeHost = "localhost";
	
	/** The open office port. */
	private int openOfficePort = 8100;
	
	/** The updates msg sender. */
	private UpdatesMessageSender updatesMsgSender = null;

	/** The swftool converter. */
	private String swftoolConverter;
	
    /**
     * Sets the updates msg sender.
     * 
     * @param updatesMsgSender the new updates msg sender
     */
    public void setUpdatesMsgSender(UpdatesMessageSender updatesMsgSender) {
		this.updatesMsgSender = updatesMsgSender;
	}

	/**
	 * Sets the open office host.
	 * 
	 * @param host the new open office host
	 */
	public void setOpenOfficeHost(String host) {
    	this.openOfficeHost = host;
    }
    
    /**
     * Sets the open office port.
     * 
     * @param port the new open office port
     */
    public void setOpenOfficePort(int port) {
    	this.openOfficePort = port;
    }
    
    /**
     * Convert.
     * 
     * @param room the room
     * @param fileSource the file source
     * @param destDir the dest dir
     */
    public synchronized void convert(Integer room, File fileSource, File destDir) {

        OpenOfficeConnection connection = new SocketOpenOfficeConnection(openOfficeHost, openOfficePort);
        try {
            logger.info("-- connecting to OpenOffice.org on port " + openOfficePort);
            updatesMsgSender.sendMessage(room, ReturnCode.UPDATE, "Connecting to OpenOffice server.");
            connection.connect();
        } catch (ConnectException officeNotRunning) {
            logger.error("ERROR: connection failed. Please make sure OpenOffice is running and listening on port "
                            + openOfficePort + ".");
            updatesMsgSender.sendMessage(room, ReturnCode.OO_CONNECTION, "Cannot connect to OpenOffice.");
        }
        try {
        	updatesMsgSender.sendMessage(room, ReturnCode.UPDATE, "Successfully connected to OpenOffice server.");
            DocumentConverter converter = new PptToSwfConverter(updatesMsgSender, room, connection);
            File outputFile = new File(destDir.getAbsolutePath() + File.separator + "output.pdf");
            
            // Set the tool to be used to convert from PDF to SWF.
            ((PptToSwfConverter)converter).setSwftoolConverter(swftoolConverter);
            // Start converting the document
            converter.convert(fileSource, outputFile);
        } finally {
            logger.info("-- disconnecting");
            connection.disconnect();
        }
    }

	/**
	 * Sets the swftool converter.
	 * 
	 * @param swftoolConverter the new swftool converter
	 */
	public void setSwftoolConverter(String swftoolConverter) {
		this.swftoolConverter = swftoolConverter;
	}
}


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

import com.sun.star.uno.UnoRuntime;
import com.sun.star.lang.*;

// property access
import com.sun.star.beans.*;
// application specific classes
import com.sun.star.drawing.*;

// XExporter
import com.sun.star.document.XExporter;
import com.sun.star.document.XFilter;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.bigbluebuttonproject.fileupload.document.IProgressListener;

import java.io.*;


/**
 * The Class PptDocumentHandler.
 */
public class PptDocumentHandler
{
	
	/** The Constant logger. */
	private static final Log logger = LogFactory.getLog(PptDocumentHandler.class);
	
	/** The open office host. */
	private String openOfficeHost = "localhost";
	
	/** The open office port. */
	private int openOfficePort = 8100;
	
	/** The height. */
	private int height = 600;
	
	/** The width. */
	private int width = 800;
	
	/** The quality. */
	private int quality = 100;
	
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
     * Sets the height.
     * 
     * @param newHeight the new height
     */
    public void setHeight(int newHeight){
    	if (newHeight > 0){
    		height = newHeight;
    	}
    }
    
    /**
     * Sets the width.
     * 
     * @param newWidth the new width
     */
    public void setWidth(int newWidth){
    	if (newWidth > 0){
    		width = newWidth;
    	}
    }
    
    /**
     * Sets the quality.
     * 
     * @param newQuality the new quality
     */
    public void setQuality(int newQuality){
    	if (newQuality > 0){
    		quality = newQuality;
    	}
    }
    
    /**
     * Connect.
     * 
     * @return the oOO connection
     * 
     * @throws Exception the exception
     */
    private OOOConnection connect() throws Exception {
    	logger.info("Connecting to: " + openOfficeHost + ":" + openOfficePort);
    	
    	return Helper.connectEx(openOfficeHost, openOfficePort);
    }
    
    /**
     * Convert.
     * 
     * @param fileSource the file source
     * @param destDir the dest dir
     */
    public synchronized void convert(File fileSource, File destDir) {

        XComponent xComponent = null;        
        OOOConnection oooConn = null;
        OOODocument oooDoc = null;
        
        try
        {
            oooConn = connect();

            // suppress Presentation Autopilot when opening the document
            // properties are the same as described for
            // com.sun.star.document.MediaDescriptor
            PropertyValue[] pPropValues = new PropertyValue[ 1 ];
            pPropValues[ 0 ] = new PropertyValue();
            pPropValues[ 0 ].Name = "Hidden";
            pPropValues[ 0 ].Value = new Boolean( true );

            logger.info("PPTExporter - source canonical path: " + fileSource.getCanonicalPath());

            oooDoc = Helper.createDocument(oooConn.getComponentFactory(),
            		fileSource.getCanonicalPath(), "_blank", 0, pPropValues);
            
            Object graphicExportFilter = oooConn.getComponentFactory().createInstanceWithContext(
                "com.sun.star.drawing.GraphicExportFilter", oooDoc.getContext());
            
            XExporter xExporter = (XExporter) UnoRuntime.queryInterface( XExporter.class, graphicExportFilter );

            xComponent = oooDoc.getComponent();
            
            int numSlides = PageHelper.getDrawPageCount( xComponent );
            
            PropertyValue aFilterData[] = new PropertyValue[5];
            aFilterData[0] = new PropertyValue();
            aFilterData[0].Name = "PixelWidth";
            aFilterData[0].Value = new Integer(width);
            aFilterData[1] = new PropertyValue();
            aFilterData[1].Name = "PixelHeight";
            aFilterData[1].Value = new Integer(height);
            aFilterData[2] = new PropertyValue();
            aFilterData[2].Name = "LogicalWidth";
            aFilterData[2].Value = new Integer(width);
            aFilterData[3] = new PropertyValue();
            aFilterData[3].Name = "LogicalHeight";
            aFilterData[3].Value = new Integer(height);
            aFilterData[4] = new PropertyValue();
            aFilterData[4].Name = "Quality";
            aFilterData[4].Value = new Integer(quality);              
            
            for (int i = 0; i < numSlides; i++) {
                
            	PropertyValue aProps[] = new PropertyValue[3];
            	aProps[0] = new PropertyValue();
            	aProps[0].Name = "MediaType";
            	aProps[0].Value = "image/jpeg";
            	aProps[1] = new PropertyValue();
            	aProps[1].Name = "FilterData";
            	aProps[1].Value = aFilterData;        
            	
            	String slideName = destDir.getAbsolutePath() + "/slide" + i + ".jpg";
            	
            	java.io.File destFile = new java.io.File(slideName);
            	java.net.URL destUrl = destFile.toURL();
            
            	aProps[2] = new PropertyValue();
            	aProps[2].Name = "URL";
            	aProps[2].Value = destUrl.toString();
                
                XDrawPage xPage = PageHelper.getDrawPageByIndex( xComponent, i );
                String slideTitle = PageHelper.getDrawPageName(xPage);
                
                XComponent xComp = (XComponent) UnoRuntime.queryInterface( XComponent.class, xPage );
               
                xExporter.setSourceDocument( xComp );


                XFilter xFilter = (XFilter) UnoRuntime.queryInterface( XFilter.class, xExporter );
                xFilter.filter( aProps );
                logger.info( "*** graphics on page \"" + i
                                    + "\" with title '" + slideTitle + "' from file \"" + fileSource.toString()
                                    + "\" exported under the name \"" 
                                    + destDir.getAbsolutePath() + "\" in the local directory" );
                
        	}
        }
        catch( Exception ex )
        {
            logger.error( ex );
        } finally {
            try {
                if (null != xComponent){                    
                    xComponent.dispose();
                }
            } catch(Exception e){
            	logger.error("error calling dispose\n" + e);
            }
            try {
                if (null != oooConn){
                    Helper.closeConnection(oooConn);
                }
            } catch(Exception e){
            	logger.error("error closing connection\n" + e);
            }
        }
    }
}

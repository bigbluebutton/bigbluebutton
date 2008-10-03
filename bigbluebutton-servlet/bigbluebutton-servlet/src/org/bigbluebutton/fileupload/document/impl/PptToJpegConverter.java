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

package org.bigbluebutton.fileupload.document.impl;

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

import java.io.*;


/**
 * The Class PptToJpegConverter.
 */
public class PptToJpegConverter
{
	
	/** The Constant logger. */
	private static final Log logger = LogFactory.getLog(PptToJpegConverter.class);
/*
    public static void main(String[] args){ 	
    	
        SlideInfo[] slideInfos = exportSlides(
            new File("C:/temp/Balancing.ppt"), // new File(args[0]),
            new File("C:/temp/dest"), // new File(args[1]),
            "localhost", // args[2],
            8100, //Integer.parseInt(args[3]), 
            PptToJpegConverter.FORMAT_OPTIMAL
        );
        
        System.out.println(slideInfos.length + " slides exported: ");
        
        for(int i = 0; i < slideInfos.length; i++){
        	System.out.println("\t"+slideInfos[i].getPath());
        }

        System.exit(0);
    }
*/
    /** The Constant FILE_URL_PREFIX. */
public final static String FILE_URL_PREFIX = "file:///";
    
    /** The Constant OOO_FORMATS. */
    private static final String[] OOO_FORMATS = { "ppt", "sxi", "sxd", "odp", "odg" };

    /** The Constant FORMAT_JPEG. */
    public final static PptToJpegConverter FORMAT_JPEG = new PptToJpegConverter();
    
    /** The Constant FORMAT_GIF. */
    public final static PptToJpegConverter FORMAT_GIF = new PptToJpegConverter();
    
    /** The Constant FORMAT_PNG. */
    public final static PptToJpegConverter FORMAT_PNG = new PptToJpegConverter();
    
    /** The Constant FORMAT_OPTIMAL. */
    public final static PptToJpegConverter FORMAT_OPTIMAL = new PptToJpegConverter();

    /**
     * Instantiates a new ppt to jpeg converter.
     */
    private PptToJpegConverter(){}

    /**
     * Export slides.
     * 
     * @param fileSource the file source
     * @param fileOutDir the file out dir
     * @param strMachine the str machine
     * @param iPort the i port
     * @param format the format
     * 
     * @return the slide info[]
     */
    public static synchronized SlideInfo[] exportSlides(File fileSource,
            File fileOutDir, String strMachine, int iPort, PptToJpegConverter format){

//		String srcUrl = "C:/temp/Balancing.ppt";
//		String destDir = "C:/temp/dest";
		
    	logger.warn("Connecting to: " + strMachine + ":" + iPort);
    	
        XComponent xComponent = null;        
        SlideInfo[] slideInfos = null;
        OOOConnection oooConn = null;
        OOODocument oooDoc = null;
        
        try
        {
            oooConn = Helper.connectEx(strMachine, iPort);

            // suppress Presentation Autopilot when opening the document
            // properties are the same as described for
            // com.sun.star.document.MediaDescriptor
            PropertyValue[] pPropValues = new PropertyValue[ 1 ];
            pPropValues[ 0 ] = new PropertyValue();
            pPropValues[ 0 ].Name = "Hidden";
            pPropValues[ 0 ].Value = new Boolean( true );
            
//            java.io.File sourceFile = new java.io.File(srcUrl);
            StringBuffer sUrl = new StringBuffer(FILE_URL_PREFIX);
            sUrl.append(fileSource.getCanonicalPath().replace('\\', '/'));
            
            logger.info("PPTExporter - source canonical path: " + fileSource.getCanonicalPath());
            logger.info("PPTExporter - source: " + sUrl);

//            oooDoc = Helper.createDocument(oooConn.getComponentFactory(),
//                        sUrl.toString(), "_blank", 0, pPropValues);

            oooDoc = Helper.createDocument(oooConn.getComponentFactory(),
            		fileSource.getCanonicalPath(), "_blank", 0, pPropValues);
            
            Object graphicExportFilter = oooConn.getComponentFactory().createInstanceWithContext(
                "com.sun.star.drawing.GraphicExportFilter", oooDoc.getContext());
            
            XExporter xExporter = (XExporter) UnoRuntime.queryInterface( XExporter.class, graphicExportFilter );

            xComponent = oooDoc.getComponent();
            
            int numSlides = PageHelper.getDrawPageCount( xComponent );
            slideInfos = new SlideInfo[numSlides];
            
            PropertyValue aFilterData[] = new PropertyValue[5];
            aFilterData[0] = new PropertyValue();
            aFilterData[0].Name = "PixelWidth";
            aFilterData[0].Value = new Integer(800);
            aFilterData[1] = new PropertyValue();
            aFilterData[1].Name = "PixelHeight";
            aFilterData[1].Value = new Integer(600);
            aFilterData[2] = new PropertyValue();
            aFilterData[2].Name = "LogicalWidth";
            aFilterData[2].Value = new Integer(800);
            aFilterData[3] = new PropertyValue();
            aFilterData[3].Name = "LogicalHeight";
            aFilterData[3].Value = new Integer(600);
            aFilterData[4] = new PropertyValue();
            aFilterData[4].Name = "Quality";
            aFilterData[4].Value = new Integer(100);              
            
            for (int i = 0; i < numSlides; i++) {
                
            	PropertyValue aProps[] = new PropertyValue[3];
            	aProps[0] = new PropertyValue();
            	aProps[0].Name = "MediaType";
            	aProps[0].Value = "image/jpeg";
            	aProps[1] = new PropertyValue();
            	aProps[1].Name = "FilterData";
            	aProps[1].Value = aFilterData;        
            	
            	/* some graphics e.g. the Windows Metafile does not have a Media Type,
               	for this case
               	aProps[0].Name = "FilterName"; // it is possible to set a FilterName 
               	aProps[0].Value = "WMF";
            	 */
            	String slideName = fileOutDir.getAbsolutePath() + "/slide" + i + ".jpg";
            	
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
                                    + fileOutDir.getAbsolutePath() + "\" in the local directory" );
                
                slideInfos[i] = new SlideInfo( slideTitle, slideName, PptToJpegConverter.FORMAT_JPEG);
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
        return slideInfos;
    }
}

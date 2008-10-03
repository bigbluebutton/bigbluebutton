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

//from Helper.java sample from OpenOffice.org SDK

//__________ Imports __________

//base classes
import java.net.MalformedURLException;

import com.sun.star.ucb.XFileIdentifierConverter;
import com.sun.star.uno.Exception;
import com.sun.star.uno.UnoRuntime;
import com.sun.star.lang.*;
import com.sun.star.frame.XComponentLoader;

//property access
import com.sun.star.beans.*;
import com.sun.star.bridge.XBridge;
import com.sun.star.bridge.XBridgeFactory;
import com.sun.star.connection.XConnection;
import com.sun.star.connection.XConnector;
import com.sun.star.uno.XComponentContext;
//import java.util.logging.Logger;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;


/**
 * The Class Helper.
 */
public class Helper
{
	
	/** The Constant logger. */
	private static final Log logger = LogFactory.getLog(Helper.class);
 
 /** The file converter. */
 private static XFileIdentifierConverter fileConverter;
 
 /** The x office multi component factory. */
 private static XMultiComponentFactory xOfficeMultiComponentFactory;
 
 /** The x office component context. */
 private static XComponentContext xOfficeComponentContext;
 
 /**
  * Connect ex.
  * 
  * @param strHost the str host
  * @param iPort the i port
  * 
  * @return the oOO connection
  * 
  * @throws Exception the exception
  */
 static public OOOConnection connectEx( String strHost, int iPort)
		throws java.lang.Exception
 {
         String strConnectInfo = "socket,host=" + strHost + ",port=" + iPort;
         String strProtocol = "urp";
         String strServiceManager = "StarOffice.ServiceManager";
     
         XComponentContext ctx =
             com.sun.star.comp.helper.Bootstrap.createInitialComponentContext( null );

         // instantiate connector service
         Object x = ctx.getServiceManager().createInstanceWithContext(
             "com.sun.star.connection.Connector", ctx );

         XConnector xConnector = (XConnector )
             UnoRuntime.queryInterface(XConnector.class, x);
/*
         String a[] = parseUnoUrl( _url );
         if( null == a )
         {
             throw new com.sun.star.uno.Exception( "Couldn't parse uno-url "+ _url );
         }
*/
         // connect using the connection string part of the uno-url only.
         XConnection connection = xConnector.connect(strConnectInfo);

         x = ctx.getServiceManager().createInstanceWithContext(
             "com.sun.star.bridge.BridgeFactory", ctx);

         XBridgeFactory xBridgeFactory = (XBridgeFactory) UnoRuntime.queryInterface(
             XBridgeFactory.class , x );

         // create a bridge with no instance provider
         // using the middle part of the uno-url
         String strBridgeName = "OOoBridge:" + System.currentTimeMillis();
         XBridge bridge = xBridgeFactory.createBridge(strBridgeName, strProtocol , connection , null );
         
         // query for the XComponent interface and add this as event listener
         XComponent xComponent = (XComponent) UnoRuntime.queryInterface(
             XComponent.class, bridge );
         //xComponent.addEventListener( this );

         // get the remote instance
         x = bridge.getInstance(strServiceManager);

         // Did the remote server export this object ?
         if( null == x )
         {
             throw new com.sun.star.uno.Exception(
                 "Server didn't provide an instance for" + strServiceManager, null );
         }

         // Query the initial object for its main factory interface
         xOfficeMultiComponentFactory = ( XMultiComponentFactory )
             UnoRuntime.queryInterface( XMultiComponentFactory.class, x );
         

         //return xOfficeMultiComponentFactory;
         return new OOOConnection(xComponent, xOfficeMultiComponentFactory);
 }
 
 /**
  * Close connection.
  * 
  * @param conn the conn
  * 
  * @throws Exception the exception
  */
 static public void closeConnection(OOOConnection conn)
 throws Exception{
     //XBridge bridge = xBridgeFactorycreateBridge(strBridgeName, strProtocol , connection , null );
     if(null != conn && null != conn.getBridge()){
         conn.getBridge().dispose();
         logger.info("Closed OOo connection");
     }else{
         logger.info("error: could not close OOo connection");
     }
 }
 
 /**
  * creates and instantiates new document.
  * 
  * @param xOfficeMultiComponentFactory the x office multi component factory
  * @param sURL the s url
  * @param sTargetFrame the s target frame
  * @param nSearchFlags the n search flags
  * @param aArgs the a args
  * 
  * @return the OOO document
  * 
  * @throws Exception the exception
  */
 static public OOODocument createDocument( XMultiComponentFactory xOfficeMultiComponentFactory,//XMultiServiceFactory xMultiServiceFactory,
         String sURL, String sTargetFrame, int nSearchFlags, PropertyValue[] aArgs )
                 throws Exception
 {
     
     XComponent xComponent = null;
     /*
         XComponent xComponent = null;
         XComponentLoader aLoader = (XComponentLoader)UnoRuntime.queryInterface(
             XComponentLoader.class,
             xMultiComponentFactory.createInstance( "com.sun.star.frame.Desktop" ) 
         );
         */
         // retrieve the component context (it's not yet exported from the office)
         // Query for the XPropertySet interface.
         XPropertySet xProperySet = ( XPropertySet )
             UnoRuntime.queryInterface( XPropertySet.class, xOfficeMultiComponentFactory );

         // Get the default context from the office server.
         Object oDefaultContext =
             xProperySet.getPropertyValue( "DefaultContext" );

         // Query for the interface XComponentContext.
         xOfficeComponentContext = ( XComponentContext ) 
         		UnoRuntime.queryInterface(XComponentContext.class, oDefaultContext );

         // now create the desktop service
         // NOTE: use the office component context here !
         Object oDesktop = xOfficeMultiComponentFactory.createInstanceWithContext(
             "com.sun.star.frame.Desktop", xOfficeComponentContext );

         XComponentLoader officeComponentLoader = ( XComponentLoader )
             UnoRuntime.queryInterface( XComponentLoader.class, oDesktop );
     
         String internalUrl = createUNOFileURL(xOfficeComponentContext, sURL);
         
//         fileConverter = getFileContentProvider();
//         String internalUrl = fileConverter.getFileURLFromSystemPath("", sURL);
         logger.warn("UNOFileURL = " + internalUrl);
         xComponent = (XComponent)UnoRuntime.queryInterface( XComponent.class,
                 officeComponentLoader.loadComponentFromURL(
                 		internalUrl, sTargetFrame, nSearchFlags, aArgs ) );
         if ( xComponent == null )
                 throw new Exception( "could not create document: " + internalUrl );
         return new OOODocument(xComponent, xOfficeComponentContext);//xComponent;
 }   
 
 /**
  * Creating a correct File URL that OpenOffice can handle. This is
  * necessary to be platform independent.
  * 
  * @param filelocation the filelocation
  * @param componentContext the component context
  * 
  * @return the string
  */
 public static String createUNOFileURL(XComponentContext componentContext, String filelocation)
 {
     java.io.File newfile = new java.io.File(filelocation);

     java.net.URL before = null;
     try
     {
         before = newfile.toURL();
     }
     catch (MalformedURLException e) {
         logger.error(e);
     }
     // Create a URL, which can be used by UNO
     String myUNOFileURL =  com.sun.star.uri.ExternalUriReferenceTranslator
       .create(componentContext).translateToInternal(before.toExternalForm());

     if (myUNOFileURL.length() == 0 && filelocation.length() > 0)
     {
     	logger.error("File URL conversion failed. Filelocation " +
                 "contains illegal characters: " + filelocation);
     }
     
     logger.warn("UNOFileURL = " + myUNOFileURL);
            
     return myUNOFileURL;
 }

 /**
  * Gets the file content provider.
  * 
  * @return the file content provider
  */
 public static XFileIdentifierConverter getFileContentProvider() {
 	
 	Object service;
		try {
			service = xOfficeMultiComponentFactory.createInstanceWithContext("com.sun.star.ucb.FileContentProvider", xOfficeComponentContext);
	        return (XFileIdentifierConverter) UnoRuntime.queryInterface(XFileIdentifierConverter.class, service);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
 	
		return null;
 }
}






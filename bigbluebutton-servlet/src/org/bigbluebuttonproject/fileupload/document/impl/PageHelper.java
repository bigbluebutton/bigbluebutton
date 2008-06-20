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


//from PageHelper.java sample from OpenOffice.org SDK

//__________ Imports __________

//base classes
import com.sun.star.uno.UnoRuntime;
import com.sun.star.lang.*;


//application specific classes
import com.sun.star.drawing.*;

//presentation specific classes
import com.sun.star.presentation.*;

import com.sun.star.beans.XPropertySet;
import com.sun.star.awt.Size;
import com.sun.star.container.XNamed;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;


/**
 * The Class PageHelper.
 */
public class PageHelper
{
	
	/** The Constant logger. */
	private static final Log logger = LogFactory.getLog(PageHelper.class);

 /**
  * get the page count for standard pages.
  * 
  * @param xComponent the x component
  * 
  * @return the draw page count
  */
 static public int getDrawPageCount( XComponent xComponent )
 {
     XDrawPagesSupplier xDrawPagesSupplier =
         (XDrawPagesSupplier)UnoRuntime.queryInterface(
             XDrawPagesSupplier.class, xComponent );
     XDrawPages xDrawPages = xDrawPagesSupplier.getDrawPages();
     return xDrawPages.getCount();
 }

 /**
  * Gets the draw pages.
  * 
  * @param xComponent the x component
  * 
  * @return the draw pages
  */
 static public XDrawPages getDrawPages( XComponent xComponent )
 {
     XDrawPagesSupplier xDrawPagesSupplier =
         (XDrawPagesSupplier)UnoRuntime.queryInterface(
             XDrawPagesSupplier.class, xComponent );
     XDrawPages xDrawPages = xDrawPagesSupplier.getDrawPages();
     return xDrawPages;
 }
 
     /**
      * Gets the draw page name.
      * 
      * @param xComponent the x component
      * 
      * @return the draw page name
      */
     static public String getDrawPageName(XDrawPage xComponent){//XComponent xComponent ){

         XNamed xNamed = (XNamed)UnoRuntime.queryInterface(XNamed.class,
                                                             xComponent);
         if(null == xNamed){
         logger.info("PageHelper.getDrawPageName() "
             + " XNamed not found.");
     return null;
     }else{
     return xNamed.getName();
     }
     }

 /**
  * get draw page by index.
  * 
  * @param xComponent the x component
  * @param nIndex the n index
  * 
  * @return the draw page by index
  * 
  * @throws IndexOutOfBoundsException the index out of bounds exception
  * @throws WrappedTargetException the wrapped target exception
  */
 static public XDrawPage getDrawPageByIndex( XComponent xComponent, int nIndex )
     throws com.sun.star.lang.IndexOutOfBoundsException,
         com.sun.star.lang.WrappedTargetException
 {
     XDrawPagesSupplier xDrawPagesSupplier =
         (XDrawPagesSupplier)UnoRuntime.queryInterface(
             XDrawPagesSupplier.class, xComponent );
     XDrawPages xDrawPages = xDrawPagesSupplier.getDrawPages();
     return (XDrawPage)UnoRuntime.queryInterface(XDrawPage.class, xDrawPages.getByIndex( nIndex ));
 }

 /**
  * creates and inserts a draw page into the giving position,
  * the method returns the new created page.
  * 
  * @param xComponent the x component
  * @param nIndex the n index
  * 
  * @return the x draw page
  * 
  * @throws Exception the exception
  */
 static public XDrawPage insertNewDrawPageByIndex( XComponent xComponent, int nIndex )
     throws Exception
 {
     XDrawPagesSupplier xDrawPagesSupplier =
         (XDrawPagesSupplier)UnoRuntime.queryInterface(
             XDrawPagesSupplier.class, xComponent );
     XDrawPages xDrawPages = xDrawPagesSupplier.getDrawPages();
     return xDrawPages.insertNewByIndex( nIndex );
 }

 /**
  * removes the given page.
  * 
  * @param xComponent the x component
  * @param xDrawPage the x draw page
  */
 static public void removeDrawPage( XComponent xComponent, XDrawPage xDrawPage )
 {
     XDrawPagesSupplier xDrawPagesSupplier =
         (XDrawPagesSupplier)UnoRuntime.queryInterface(
             XDrawPagesSupplier.class, xComponent );
     XDrawPages xDrawPages = xDrawPagesSupplier.getDrawPages();
     xDrawPages.remove( xDrawPage );
 }

 /**
  * get size of the given page.
  * 
  * @param xDrawPage the x draw page
  * 
  * @return the page size
  * 
  * @throws UnknownPropertyException the unknown property exception
  * @throws WrappedTargetException the wrapped target exception
  */
 static public Size getPageSize( XDrawPage xDrawPage )
     throws com.sun.star.beans.UnknownPropertyException,
         com.sun.star.lang.WrappedTargetException
 {
     XPropertySet xPageProperties = (XPropertySet)
         UnoRuntime.queryInterface( XPropertySet.class, xDrawPage );
     return new Size(
         ((Integer)xPageProperties.getPropertyValue( "Width" )).intValue(),
         ((Integer)xPageProperties.getPropertyValue( "Height" )).intValue() );
 }

 // __________ master pages __________

 /**
  * get the page count for master pages.
  * 
  * @param xComponent the x component
  * 
  * @return the master page count
  */
 static public int getMasterPageCount( XComponent xComponent )
 {
     XMasterPagesSupplier xMasterPagesSupplier =
         (XMasterPagesSupplier)UnoRuntime.queryInterface(
             XMasterPagesSupplier.class, xComponent );
     XDrawPages xDrawPages = xMasterPagesSupplier.getMasterPages();
     return xDrawPages.getCount();
 }

 /**
  * get master page by index.
  * 
  * @param xComponent the x component
  * @param nIndex the n index
  * 
  * @return the master page by index
  * 
  * @throws IndexOutOfBoundsException the index out of bounds exception
  * @throws WrappedTargetException the wrapped target exception
  */
 static public XDrawPage getMasterPageByIndex( XComponent xComponent, int nIndex )
     throws com.sun.star.lang.IndexOutOfBoundsException,
         com.sun.star.lang.WrappedTargetException
 {
     XMasterPagesSupplier xMasterPagesSupplier =
         (XMasterPagesSupplier)UnoRuntime.queryInterface(
             XMasterPagesSupplier.class, xComponent );
     XDrawPages xDrawPages = xMasterPagesSupplier.getMasterPages();
     return (XDrawPage)UnoRuntime.queryInterface(XDrawPage.class, xDrawPages.getByIndex( nIndex ));
 }

 /**
  * creates and inserts a new master page into the giving position,
  * the method returns the new created page.
  * 
  * @param xComponent the x component
  * @param nIndex the n index
  * 
  * @return the x draw page
  */
 static public XDrawPage insertNewMasterPageByIndex( XComponent xComponent, int nIndex )
 {
     XMasterPagesSupplier xMasterPagesSupplier =
         (XMasterPagesSupplier)UnoRuntime.queryInterface(
             XMasterPagesSupplier.class, xComponent );
     XDrawPages xDrawPages = xMasterPagesSupplier.getMasterPages();
     return xDrawPages.insertNewByIndex( nIndex );
 }

 /**
  * removes the given page.
  * 
  * @param xComponent the x component
  * @param xDrawPage the x draw page
  */
 static public void removeMasterPage( XComponent xComponent, XDrawPage xDrawPage )
 {
     XMasterPagesSupplier xMasterPagesSupplier =
         (XMasterPagesSupplier)UnoRuntime.queryInterface(
             XMasterPagesSupplier.class, xComponent );
     XDrawPages xDrawPages = xMasterPagesSupplier.getMasterPages();
     xDrawPages.remove( xDrawPage );
 }

 /**
  * return the corresponding masterpage for the giving drawpage.
  * 
  * @param xDrawPage the x draw page
  * 
  * @return the master page
  */
 static public XDrawPage getMasterPage( XDrawPage xDrawPage )
 {
     XMasterPageTarget xMasterPageTarget =
         (XMasterPageTarget)UnoRuntime.queryInterface(
             XMasterPageTarget.class, xDrawPage );
     return xMasterPageTarget.getMasterPage();
 }

 /**
  * sets given masterpage at the drawpage.
  * 
  * @param xDrawPage the x draw page
  * @param xMasterPage the x master page
  */
 static public void setMasterPage( XDrawPage xDrawPage, XDrawPage xMasterPage )
 {
     XMasterPageTarget xMasterPageTarget =
         (XMasterPageTarget)UnoRuntime.queryInterface(
             XMasterPageTarget.class, xDrawPage );
     xMasterPageTarget.setMasterPage( xMasterPage );
 }

 // __________ presentation pages __________

 /**
  * test if a Presentation Document is supported.
  * This is important, because only presentation documents
  * have notes and handout pages
  * 
  * @param xComponent the x component
  * 
  * @return true, if checks if is impress document
  */
 static public boolean isImpressDocument( XComponent xComponent )
 {
     XServiceInfo xInfo = (XServiceInfo)UnoRuntime.queryInterface(
             XServiceInfo.class, xComponent );
     return xInfo.supportsService( "com.sun.star.presentation.PresentationDocument" );
 }

 /**
  * in impress documents each normal draw page has a corresponding notes page.
  * 
  * @param xDrawPage the x draw page
  * 
  * @return the notes page
  */
 static public XDrawPage getNotesPage( XDrawPage xDrawPage )
 {
     XPresentationPage aPresentationPage =
         (XPresentationPage)UnoRuntime.queryInterface(
             XPresentationPage.class, xDrawPage );
     return aPresentationPage.getNotesPage();
 }

 /**
  * in impress each documents has one handout page.
  * 
  * @param xComponent the x component
  * 
  * @return the handout master page
  */
 static public XDrawPage getHandoutMasterPage( XComponent xComponent )
 {
     XHandoutMasterSupplier aHandoutMasterSupplier =
         (XHandoutMasterSupplier)UnoRuntime.queryInterface(
             XHandoutMasterSupplier.class, xComponent );
     return aHandoutMasterSupplier.getHandoutMasterPage();
 }
}

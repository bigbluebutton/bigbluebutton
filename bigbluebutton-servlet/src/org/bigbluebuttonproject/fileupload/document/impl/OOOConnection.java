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

import com.sun.star.lang.XComponent;
import com.sun.star.lang.XMultiComponentFactory;


/**
 * The Class OOOConnection.
 */
public class OOOConnection {
    
    //private String strBridgeName;
    /** The component factory. */
    private XMultiComponentFactory componentFactory;
    
    /** The bridge. */
    private XComponent bridge;
    
    /**
     * Instantiates a new oOO connection.
     * 
     * @param bridge the bridge
     * @param componentFactory the component factory
     */
    public OOOConnection(
                //String strBridgeName, 
                XComponent bridge,
                XMultiComponentFactory componentFactory
                ){
        //this.strBridgeName = strBridgeName;
        this.componentFactory = componentFactory;
        this.bridge = bridge;
    }
    /*
    public String getBridgeName(){
        return this.strBridgeName;
    }
     **/
    
    /**
     * Gets the bridge.
     * 
     * @return the bridge
     */
    public XComponent getBridge(){
        return this.bridge;
    }
    
    /**
     * Gets the component factory.
     * 
     * @return the component factory
     */
    public XMultiComponentFactory getComponentFactory(){
        return this.componentFactory;
    }
    
}

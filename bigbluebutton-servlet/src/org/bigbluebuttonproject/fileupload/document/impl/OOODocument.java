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
import com.sun.star.uno.XComponentContext;


/**
 * The Class OOODocument.
 */
public class OOODocument {
    
    /** The comp. */
    private XComponent comp;
    
    /** The context. */
    private XComponentContext context;

    /**
     * Instantiates a new oOO document.
     * 
     * @param comp the comp
     * @param context the context
     */
    public OOODocument(XComponent comp, XComponentContext context) {
        this.comp = comp;
        this.context = context;
    }
    
    /**
     * Gets the component.
     * 
     * @return the component
     */
    public XComponent getComponent(){
        return this.comp;
    }
    
    /**
     * Gets the context.
     * 
     * @return the context
     */
    public XComponentContext getContext(){
        return this.context;
    }
    
}
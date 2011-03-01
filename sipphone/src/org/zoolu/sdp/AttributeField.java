/*
 * Copyright (C) 2005 Luca Veltri - University of Parma - Italy
 * 
 * This file is part of MjSip (http://www.mjsip.org)
 * 
 * MjSip is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 * 
 * MjSip is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with MjSip; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 * 
 * Author(s):
 * Luca Veltri (luca.veltri@unipr.it)
 */

package org.zoolu.sdp;


import org.zoolu.tools.Parser;


/** SDP attribute field.
  * <p>
  * <BLOCKQUOTE><PRE>
  *    attribute-fields = "a=" (att-field ":" att-value) | att-field CRLF
  * </PRE></BLOCKQUOTE>
  */
public class AttributeField extends SdpField
{  
   /** Creates a new AttributeField. */
   public AttributeField(String attribute)
   {  super('a',attribute);
   }

   /** Creates a new AttributeField. */
   public AttributeField(String attribute, String a_value)
   {  super('a',attribute+":"+a_value);
   }

   /** Creates a new AttributeField. */
   public AttributeField(SdpField sf)
   {  super(sf);
   }
      
   /** Gets the attribute name. */
   public String getAttributeName()
   {  int i=value.indexOf(":");
      if (i<0) return value; else return value.substring(0,i);
   }

   /** Gets the attribute value. */
   public String getAttributeValue()
   {  int i=value.indexOf(":");
      if (i<0) return null; else return value.substring(i+1);
   }

}

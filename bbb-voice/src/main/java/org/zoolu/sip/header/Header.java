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

package org.zoolu.sip.header;



/** Header is the base Class for all SIP Headers
 */
public class Header
{
   /** The header type */
   protected String name;
   /** The header string, without terminating CRLF */
   protected String value;

   /** Creates a void Header. */
   protected Header()
   {  name=null;
      value=null;
   }

   /** Creates a new Header. */
   public Header(String hname, String hvalue)
   {  name=hname;
      value=hvalue;
   }

   /** Creates a new Header. */
   public Header(Header hd)
   {  name=hd.getName();
      value=hd.getValue();
   }

   /** Creates and returns a copy of the Header */
   public Object clone()
   {  return new Header(getName(),getValue());
   }

   /** Whether the Header is equal to Object <i>obj</i> */
   public boolean equals(Object obj)
   {  try
      {  Header hd=(Header)obj;
         if (hd.getName().equals(this.getName()) && hd.getValue().equals(this.getValue())) return true;
         else return false;
      }
      catch (Exception e) {  return false;  }
   }

   /** Gets name of Header */
   public String getName()
   {  return name; 
   }

   /** Gets value of Header */
   public String getValue()
   {  return value;
   }

   /** Sets value of Header */
   public void setValue(String hvalue)
   {  value=hvalue; 
   }

   /** Gets string representation of Header */
   public String toString()
   {  return name+": "+value+"\r\n";
   }
}

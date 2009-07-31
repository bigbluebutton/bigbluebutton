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


/** SDP connection field.
  * <p>
  * <BLOCKQUOTE><PRE>
  *    connection-field = "c=" nettype SP addrtype SP connection-address CRLF
  *                       ;a connection field must be present
  *                       ;in every media description or at the
  *                       ;session-level
  * </PRE></BLOCKQUOTE>
  */
public class ConnectionField extends SdpField
{  
   /** Creates a new ConnectionField. */
   public ConnectionField(String connection_field)
   {  super('c',connection_field);
   }

   /** Creates a new ConnectionField. */
   public ConnectionField(String address_type, String address, int ttl, int num)
   {  super('c',null);
      value="IN "+address_type+" "+address;
      if (ttl>0) value+="/"+ttl;
      if (num>0) value+="/"+num;
   }

   /** Creates a new ConnectionField. */
   public ConnectionField(String address_type, String address)
   {  super('c',"IN "+address_type+" "+address);
   }

   /** Creates a new ConnectionField. */
   public ConnectionField(SdpField sf)
   {  super(sf);
   }
      
   /** Gets the connection address. */
   public String getAddressType()
   {  String type=(new Parser(value)).skipString().getString();
      return type;
   }

   /** Gets the connection address. */
   public String getAddress()
   {  String address=(new Parser(value)).skipString().skipString().getString();
      int i=address.indexOf("/");
      if (i<0) return address; else return address.substring(0,i);
   }

   /** Gets the TTL. */
   public int getTTL()
   {  String address=(new Parser(value)).skipString().skipString().getString();
      int i=address.indexOf("/");
      if (i<0) return 0;
      int j=address.indexOf("/",i);
      if (j<0) return Integer.parseInt(address.substring(i)); else return Integer.parseInt(address.substring(i,j));
   }

   /** Gets the number of addresses. */
   public int getNum()
   {  String address=(new Parser(value)).skipString().skipString().getString();
      int i=address.indexOf("/");
      if (i<0) return 0;
      int j=address.indexOf("/",i);
      if (j<0) return 0;
      return Integer.parseInt(address.substring(j));
   }
   
}

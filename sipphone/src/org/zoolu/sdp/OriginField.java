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


/** SDP origin field.
  * <p>
  * <BLOCKQUOTE><PRE>
  *    origin-field = "o=" username SP sess-id SP sess-version SP
  *                        nettype SP addrtype SP unicast-address CRLF
  * </PRE></BLOCKQUOTE>
  */
public class OriginField extends SdpField
{  
   /** Creates a new OriginField. */
   public OriginField(String origin)
   {  super('o',origin);
   }

   /** Creates a new OriginField. */
   public OriginField(String username, String sess_id, String sess_version, String addrtype, String address)
   {  super('o',username+" "+sess_id+" "+sess_version+" IN "+addrtype+" "+address);
   }

   /** Creates a new OriginField. */
   public OriginField(String username, String sess_id, String sess_version, String address)
   {  super('o',username+" "+sess_id+" "+sess_version+" IN IP4 "+address);
   }

   /** Creates a new OriginField. */
   public OriginField(SdpField sf)
   {  super(sf);
   }
      
   /** Gets the user name. */
   public String getUserName()
   {  return (new Parser(value)).getString();
   }

   /** Gets the session id. */
   public String getSessionId()
   {  return (new Parser(value)).skipString().getString();
   }

   /** Gets the session version. */
   public String getSessionVersion()
   {  return (new Parser(value)).skipString().skipString().getString();
   }

   /** Gets the address type. */
   public String getAddressType()
   {  return (new Parser(value)).skipString().skipString().skipString().skipString().getString();
   }

  /** Gets the address. */
   public String getAddress()
   {  return (new Parser(value)).skipString().skipString().skipString().skipString().skipString().getString();
   }

}

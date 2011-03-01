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


import org.zoolu.sip.address.*;


/** SIP Header From.
  * The From header field indicates the logical identity of the initiator
  * of the request, possibly the user's address-of-record.  Like the To
  * header field, it contains a URI and optionally a display name.
  * <BR> The From field MUST contain a new "tag" parameter, chosen by the UAC.
  */
public class FromHeader extends EndPointHeader
{
   //public FromHeader()
   //{  super(SipHeaders.From);
   //}

   public FromHeader(NameAddress nameaddr)
   {  super(SipHeaders.From,nameaddr);
   }

   public FromHeader(SipURL url)
   {  super(SipHeaders.From,url);
   }

   public FromHeader(NameAddress nameaddr, String tag)
   {  super(SipHeaders.From,nameaddr,tag);
   }

   public FromHeader(SipURL url, String tag)
   {  super(SipHeaders.From,url,tag);
   }

   public FromHeader(Header hd)
   {  super(hd);
   }
}


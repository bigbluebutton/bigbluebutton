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


/** SIP Header To.
  * The To header field specifies the desired
  * "logical" recipient of the request, or the address-of-record of the
  * user or resource that is the target of this request.  This may or may
  * not be the ultimate recipient of the request.  Like the From
  * header field, it contains a URI and optionally a display name.
  * <BR> A request outside of a dialog MUST NOT contain a To tag; the tag in
  * the To field of a request identifies the peer of the dialog.  Since
  * no dialog is established, no tag is present.
  * The original
  * recipient may or may not be the UAS processing the request, due to
  * call forwarding or other proxy operations.  A UAS MAY apply any
  * policy it wishes to determine whether to accept requests when the To
  * header field is not the identity of the UAS.  However, it is
  * RECOMMENDED that a UAS accept requests even if they do not recognize
  * the URI scheme (for example, a tel: URI) in the To header field, or
  * if the To header field does not address a known or current user of
  * this UAS.  If, on the other hand, the UAS decides to reject the
  * request, it SHOULD generate a response with a 403 (Forbidden) status
  * code and pass it to the server transaction for transmission. */
public class ToHeader extends EndPointHeader
{
   //public ToHeader()
   //{  super(sip.header.SipHeaders.To);
   //}


   public ToHeader(NameAddress nameaddr)
   {  super(SipHeaders.To,nameaddr);
   }

   public ToHeader(SipURL url)
   {  super(SipHeaders.To,url);
   }

   public ToHeader(NameAddress nameaddr, String tag)
   {  super(SipHeaders.To,nameaddr,tag);
   }

   public ToHeader(SipURL url, String tag)
   {  super(SipHeaders.To,url,tag);
   }

   public ToHeader(Header hd)
   {  super(hd);
   }
}


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


import org.zoolu.tools.Parser;


/** SIP Header Call-ID.
  * The Call-ID header field acts as a unique identifier to group
  * together a series of messages.  It MUST be the same for all requests
  * and responses sent by either UA in a dialog.  It SHOULD be the same
  * in each registration from a UA.
  * <BR> In a new request created by a UAC outside of any dialog, the Call-ID
  * header field MUST be selected by the UAC as a globally unique
  * identifier over space and time unless overridden by method-specific
  * behavior.
  * <BR> Use of cryptographically random identifiers in the
  * generation of Call-IDs is RECOMMENDED.  Implementations MAY use the
  * form "localid@host".  Call-IDs are case-sensitive and are simply
  * compared byte-by-byte.
  */
public class CallIdHeader extends Header
{
   /** Creates a CallIdHeader */
   //public CallIdHeader()
   //{  super(SipHeaders.Call_ID);
   //}

   /** Creates a CallIdHeader with value <i>hvalue</i> */
   public CallIdHeader(String hvalue)
   {  super(SipHeaders.Call_ID,hvalue);
   }

   /** Creates a new CallIdHeader equal to CallIdHeader <i>hd</i> */
   public CallIdHeader(Header hd)
   {  super(hd);
   }

   /** Gets Call-Id of CallIdHeader */
   public String getCallId()
   {  return (new Parser(value)).getString();
   }

   /** Sets Call-Id of CallIdHeader */
   public void setCallId(String callId)
   {  value=callId;
   }
}

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

package org.zoolu.sip.call;

import org.zoolu.sip.call.*;
import org.zoolu.sip.message.*;
import org.zoolu.sip.address.NameAddress;
import org.zoolu.sdp.*;
import java.util.Vector;


/** Interface ExtendedCallListener can be implemented to manage exteded SIP calls (sipx.call.ExtendedCall).
 *  <p> Objects of class ExtendedCall use ExtendedCallListener callback methods to signal
 *  specific call events.  
 */
public interface ExtendedCallListener extends CallListener
{  
   /** Callback function called when arriving a new REFER method (transfer request). */
   public void onCallTransfer(ExtendedCall call, NameAddress refer_to, NameAddress refered_by, Message refer);

   /** Callback function called when a call transfer is accepted. */
   public void onCallTransferAccepted(ExtendedCall call, Message resp);

   /** Callback function called when a call transfer is refused. */
   public void onCallTransferRefused(ExtendedCall call, String reason, Message resp);

   /** Callback function called when a call transfer is successfully completed. */
   public void onCallTransferSuccess(ExtendedCall call, Message notify);

   /** Callback function called when a call transfer is NOT sucessfully completed. */
   public void onCallTransferFailure(ExtendedCall call, String reason, Message notify);
   
}


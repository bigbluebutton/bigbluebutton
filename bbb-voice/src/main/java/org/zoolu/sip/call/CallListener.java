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

import org.zoolu.sip.message.*;
import org.zoolu.sip.address.NameAddress;
import org.zoolu.sdp.*;
import java.util.Vector;


/** Interface CallListener can be implemented to manage SIP calls (sipx.call.Call).
 *  <p> Objects of class Call use CallListener callback methods to signal
 *  specific call events.
 */
public interface CallListener
{
   /** Callback function called when arriving a new INVITE method (incoming call) */
   public void onCallIncoming(Call call, NameAddress callee, NameAddress caller, String sdp, Message invite);

   /** Callback function called when arriving a new Re-INVITE method (re-inviting/call modify) */
   public void onCallModifying(Call call, String sdp, Message invite);

   /** Callback function called when arriving a 180 Ringing */
   public void onCallRinging(Call call, Message resp);

   /** Callback function called when arriving a 2xx (call accepted) */
   public void onCallAccepted(Call call, String sdp, Message resp);

   /** Callback function called when arriving a 4xx (call failure) */
   public void onCallRefused(Call call, String reason, Message resp);

   /** Callback function called when arriving a 3xx (call redirection) */
   public void onCallRedirection(Call call, String reason, Vector contact_list, Message resp);

   /** Callback function called when arriving an ACK method (call confirmed) */
   public void onCallConfirmed(Call call, String sdp, Message ack);

   /** Callback function called when the invite expires */
   public void onCallTimeout(Call call);

   /** Callback function called when arriving a 2xx (re-invite/modify accepted) */
   public void onCallReInviteAccepted(Call call, String sdp, Message resp);

   /** Callback function called when arriving a 4xx (re-invite/modify failure) */
   public void onCallReInviteRefused(Call call, String reason, Message resp);

   /** Callback function called when a re-invite expires */
   public void onCallReInviteTimeout(Call call);

   /** Callback function called when arriving a 3xx (call redirection) */
   //public void onCallReInviteRedirection(Call call, String reason, Vector contact_list, Message resp);

   /** Callback function called when arriving a CANCEL request */
   public void onCallCanceling(Call call, Message cancel);

   /** Callback function called when arriving a BYE request */
   public void onCallClosing(Call call, Message bye);

   /** Callback function called when arriving a response for the BYE request (call closed) */
   public void onCallClosed(Call call, Message resp);
}


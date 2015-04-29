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

package org.zoolu.sip.dialog;


import org.zoolu.sip.message.Message;
import org.zoolu.sip.address.NameAddress;


/** A SubscriberDialogListener listens for SubscriberDialog events.
  * It collects all SubscriberDialog callback functions.
  */
public interface SubscriberDialogListener
{  
   /** When a 2xx successfull final response is received for an SUBSCRIBE transaction. */ 
   public void onDlgSubscriptionSuccess(SubscriberDialog dialog, int code, String reason, Message msg);

   /** When a 300-699 response is received for an SUBSCRIBE transaction. */ 
   public void onDlgSubscriptionFailure(SubscriberDialog dialog, int code, String reason, Message msg);

   /** When SUBSCRIBE transaction expires without a final response. */ 
   public void onDlgSubscribeTimeout(SubscriberDialog dialog);

   /** When the dialog is terminated. */ 
   public void onDlgSubscriptionTerminated(SubscriberDialog dialog);

   /** When an incoming NOTIFY is received. */ 
   public void onDlgNotify(SubscriberDialog dialog, NameAddress target, NameAddress notifier, NameAddress contact, String state, String content_type, String body, Message msg);

}

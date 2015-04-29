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
import org.zoolu.sip.address.SipURL;
import org.zoolu.sip.address.NameAddress;


/** A NotifierDialogListener listens for NotifierDialog events.
  * It collects all NOTIFY callback functions.
  */
public interface NotifierDialogListener
{  
   /** When an incoming SUBSCRIBE is received. */ 
   public void onDlgSubscribe(NotifierDialog dialog, NameAddress target, NameAddress subscriber, String event, String id, Message msg);

   /** When a re-SUBSCRIBE is received. */ 
   //public void onDlgReSubscribe(NotifierDialog dialog, Message msg);

   /** When NOTIFY transaction expires without a final response. */ 
   public void onDlgNotifyTimeout(NotifierDialog dialog);

   /** When a 300-699 response is received for a NOTIFY transaction. */ 
   public void onDlgNotificationFailure(NotifierDialog dialog, int code, String reason, Message msg);
   
   /** When a 2xx successfull final response is received for a NOTIFY transaction. */ 
   public void onDlgNotificationSuccess(NotifierDialog dialog, int code, String reason, Message msg);
   
}

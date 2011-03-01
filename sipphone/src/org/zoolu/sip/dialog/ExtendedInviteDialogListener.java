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

import org.zoolu.sip.address.NameAddress;
import org.zoolu.sip.message.Message;


/** An ExtendedInviteDialogListener listens for ExtendedInviteDialog events.
  * It extends InviteDialogListener by adding ExtendedInviteDialog-specific callback functions.
  */
public interface ExtendedInviteDialogListener extends org.zoolu.sip.dialog.InviteDialogListener
{  

   /** When an incoming REFER request is received within the dialog */ 
   public void onDlgRefer(org.zoolu.sip.dialog.InviteDialog dialog, NameAddress refer_to, NameAddress referred_by, Message msg);

   /** When a response is received for a REFER request within the dialog */ 
   public void onDlgReferResponse(org.zoolu.sip.dialog.InviteDialog dialog, int code, String reason, Message msg);

   /** When an incoming NOTIFY request is received within the dialog */ 
   public void onDlgNotify(org.zoolu.sip.dialog.InviteDialog dialog, String event, String sipfragment, Message msg);

   /** When a response is received for a NOTIFY request within the dialog */ 
   //public void onDlgNotifyResponse(org.zoolu.sip.dialog.InviteDialog dialog, int code, String reason, Message msg);

   /** When an incoming request is received within the dialog
     * different from INVITE, CANCEL, ACK, BYE, REFER, NOTIFY */ 
   public void onDlgAltRequest(org.zoolu.sip.dialog.InviteDialog dialog, String method, String body, Message msg);

   /** When a response is received for a request within the dialog 
     * different from INVITE, CANCEL, ACK, BYE, REFER, NOTIFY */ 
   public void onDlgAltResponse(org.zoolu.sip.dialog.InviteDialog dialog, String method, int code, String reason, String body, Message msg);

   /** When a request timeout expires within the dialog
     * different from INVITE, CANCEL, ACK, BYE, REFER, NOTIFY */ 
   //public void onDlgAltTimeout(org.zoolu.sip.dialog.InviteDialog dialog, String method);
}

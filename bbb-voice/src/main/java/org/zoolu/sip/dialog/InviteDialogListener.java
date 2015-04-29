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
import org.zoolu.sip.header.MultipleHeader;


/** An InviteDialogListener listens for InviteDialog events.
  * It collects all InviteDialog callback functions.
  */
public interface InviteDialogListener
{
   /** When an incoming INVITE is received */
   public void onDlgInvite(InviteDialog dialog, NameAddress callee, NameAddress caller, String body, Message msg);

   /** When an incoming Re-INVITE is received */
   public void onDlgReInvite(InviteDialog dialog, String body, Message msg);



   /** When a 1xx response response is received for an INVITE transaction */
   public void onDlgInviteProvisionalResponse(InviteDialog dialog, int code, String reason, String body, Message msg);

   /** When a 2xx successfull final response is received for an INVITE transaction */
   public void onDlgInviteSuccessResponse(InviteDialog dialog, int code, String reason, String body, Message msg);

   /** When a 3xx redirection response is received for an INVITE transaction */
   public void onDlgInviteRedirectResponse(InviteDialog dialog, int code, String reason, MultipleHeader contacts, Message msg);

   /** When a 400-699 failure response is received for an INVITE transaction */
   public void onDlgInviteFailureResponse(InviteDialog dialog, int code, String reason, Message msg);

   /** When INVITE transaction expires */
   public void onDlgTimeout(InviteDialog dialog);



   /** When a 1xx response response is received for a Re-INVITE transaction */
   public void onDlgReInviteProvisionalResponse(InviteDialog dialog, int code, String reason, String body, Message msg);

   /** When a 2xx successfull final response is received for a Re-INVITE transaction */
   public void onDlgReInviteSuccessResponse(InviteDialog dialog, int code, String reason, String body, Message msg);

   /** When a 3xx redirection response is received for a Re-INVITE transaction */
   //public void onDlgReInviteRedirectResponse(InviteDialog dialog, int code, String reason, MultipleHeader contacts, Message msg);

   /** When a 400-699 failure response is received for a Re-INVITE transaction */
   public void onDlgReInviteFailureResponse(InviteDialog dialog, int code, String reason, Message msg);

   /** When a Re-INVITE transaction expires */
   public void onDlgReInviteTimeout(InviteDialog dialog);



   /** When an incoming INVITE is accepted */
   //public void onDlgAccepted(InviteDialog dialog);

   /** When an incoming INVITE is refused */
   //public void onDlgRefused(InviteDialog dialog);

   /** When an incoming Re-INVITE is accepted */
   //public void onDlgReInviteAccepted(InviteDialog dialog);

   /** When an incoming Re-INVITE is refused */
   //public void onDlgReInviteRefused(InviteDialog dialog);



   /** When an incoming ACK is received for an INVITE transaction */
   public void onDlgAck(InviteDialog dialog, String body, Message msg);

   /** When the INVITE handshake is successful terminated */
   public void onDlgCall(InviteDialog dialog);



   /** When an incoming CANCEL is received for an INVITE transaction */
   public void onDlgCancel(InviteDialog dialog, Message msg);

   /** When an incoming BYE is received*/
   public void onDlgBye(InviteDialog dialog, Message msg);

   /** When a BYE request traqnsaction has been started */
   //public void onDlgByeing(InviteDialog dialog);

   /** When a success response is received for a Bye request */
   public void onDlgByeSuccessResponse(InviteDialog dialog, int code, String reason, Message msg);

   /** When a failure response is received for a Bye request */
   public void onDlgByeFailureResponse(InviteDialog dialog, int code, String reason, Message msg);

   /** When the dialog is finally closed */
   public void onDlgClose(InviteDialog dialog);
}

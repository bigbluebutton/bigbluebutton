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

import org.zoolu.sip.dialog.*;
import org.zoolu.sip.provider.*;
import org.zoolu.sip.message.*;
import org.zoolu.sip.address.NameAddress;
import org.zoolu.sip.header.MultipleHeader;
import org.zoolu.tools.Log;
import org.zoolu.tools.LogLevel;
import org.zoolu.sdp.*;
import java.util.Vector;


/** Class Call implements SIP calls.
  * <p>It handles both outgoing or incoming calls.
  * <p>Both offer/answer models are supported, that is:
  * <br> i) offer/answer in invite/2xx, or
  * <br> ii) offer/answer in 2xx/ack
  */
public class Call implements InviteDialogListener
{
   /** Event logger. */
   Log log;

   /** The SipProvider used for the call */
   protected SipProvider sip_provider;

   /** The invite dialog (sip.dialog.InviteDialog) */
   protected InviteDialog dialog;

   /** The user url */
   protected String from_url;

   /** The user contact url */
   protected String contact_url;

   /** The local sdp */
   protected String local_sdp;

   /** The remote sdp */
   protected String remote_sdp;

   /** The call listener (sipx.call.CallListener) */
   CallListener listener;

   private boolean callWasUsed=false;

   /** Creates a new Call. */
   public Call(SipProvider sip_provider, String from_url, String contact_url, CallListener call_listener)
   {  this.sip_provider=sip_provider;
      this.log=sip_provider.getLog();
      this.listener=call_listener;
      this.from_url=from_url;
      this.contact_url=contact_url;
      this.dialog=null;
      this.local_sdp=null;
      this.remote_sdp=null;
   }

   /** Creates a new Call specifing the sdp */
   /*public Call(SipProvider sip_provider, String from_url, String contact_url, String sdp, CallListener call_listener)
   {  this.sip_provider=sip_provider;
      this.log=sip_provider.getLog();
      this.listener=call_listener;
      this.from_url=from_url;
      this.contact_url=contact_url;
      local_sdp=sdp;
   }*/

   /** Gets the current invite dialog */
   /*public InviteDialog getInviteDialog()
   {  return dialog;
   }*/

   /** Gets the current local session descriptor */
   public String getLocalSessionDescriptor()
   {  return local_sdp;
   }

   /** Sets a new local session descriptor */
   public void setLocalSessionDescriptor(String sdp)
   {  local_sdp=sdp;
   }

   /** Gets the current remote session descriptor */
   public String getRemoteSessionDescriptor()
   {  return remote_sdp;
   }

   /** Whether the call is on (active). */
   public boolean isOnCall()
   {  return dialog.isSessionActive();
   }

   /** Waits for an incoming call */
   public void listen()
   {  dialog=new InviteDialog(sip_provider,this);
      dialog.listen();
   }

   /** Starts a new call, inviting a remote user (<i>callee</i>) */
   public void call(String callee)
   {  call(callee,null,null,null);
   }

   /** Starts a new call, inviting a remote user (<i>callee</i>) */
   public void call(String callee, String sdp)
   {  call(callee,null,null,sdp);
   }

   /** Starts a new call, inviting a remote user (<i>callee</i>) */
   public void call(String callee, String from, String contact, String sdp)
   {  printLog("calling "+callee,LogLevel.HIGH);
      callWasUsed=true;
      if (from==null) from=from_url;
      if (contact==null) contact=contact_url;
      if (sdp!=null) local_sdp=sdp;
      dialog=new InviteDialog(sip_provider,this);
      if (local_sdp!=null)
         dialog.invite(callee,from,contact,local_sdp);
      else dialog.inviteWithoutOffer(callee,from,contact);
   }

   /** Starts a new call with the <i>invite</i> message request */
   public void call(Message invite)
   {  dialog=new InviteDialog(sip_provider,this);
      callWasUsed=true;

      local_sdp=invite.getBody();
      if (local_sdp!=null)
         dialog.invite(invite);
      else dialog.inviteWithoutOffer(invite);
   }

   /** Answers at the 2xx/offer (in the ack message) */
   public void ackWithAnswer(String sdp)
   {  local_sdp=sdp;
      dialog.ackWithAnswer(contact_url,sdp);
   }

   /** Rings back for the incoming call */
   public void ring()
   {  if (dialog!=null) dialog.ring();
   }

   /** Respond to a incoming call (invite) with <i>resp</i> */
   public void respond(Message resp)
   {  if (dialog!=null) dialog.respond(resp);
   }

   /** Accepts the incoming call */
   /*public void accept()
   {  accept(local_sdp);
   }*/

   /** Accepts the incoming call */
   public void accept(String sdp)
   {  local_sdp=sdp;
      callWasUsed=true;

     if (dialog!=null) dialog.accept(contact_url,local_sdp);
   }

   /** Redirects the incoming call */
   public void redirect(String redirect_url)
   {  if (dialog!=null) dialog.redirect(302,"Moved Temporarily",redirect_url);
   }

   /** Refuses the incoming call */
   public void refuse()
   {  if (dialog!=null) dialog.refuse();
   }

   /** Cancels the outgoing call */
   public void cancel()
   {  if (dialog!=null) dialog.cancel();
   }

   /** Close the ongoing call */
   public void bye()
   {  if (dialog!=null) dialog.bye();
   }

   /** Modify the current call */
   public void modify(String contact, String sdp)
   {  local_sdp=sdp;
      if (dialog!=null) dialog.reInvite(contact,local_sdp);
   }

   /** Closes an ongoing or incoming/outgoing call
     * <p> It trys to fires refuse(), cancel(), and bye() methods */
   public void hangup()
      {
   	   hangup(403);
   }

   public void hangup(int status)
   {  if (dialog!=null && !dialog.isWaiting() && !dialog.isTerminated())
      {  // try dialog.refuse(), cancel(), and bye() methods..
         callWasUsed=true;
         dialog.refuse(status,SipResponses.reasonOf(status));
         dialog.cancel();
         dialog.bye();
      }
   }


   // ************** Inherited from InviteDialogListener **************

   /** Inherited from class InviteDialogListener and called by an InviteDialag. Normally you should not use it. Use specific callback methods instead (e.g. onCallIncoming()). */
   public void onDlgInvite(InviteDialog d, NameAddress callee, NameAddress caller, String sdp, Message msg)
   {  if (d!=dialog) {  printLog("NOT the current dialog",LogLevel.HIGH);  return;  }
      if (sdp!=null && sdp.length()!=0) remote_sdp=sdp;
      callWasUsed=true;
      if (listener!=null) listener.onCallIncoming(this,callee,caller,sdp,msg);
   }

   /** Inherited from class InviteDialogListener and called by an InviteDialag. Normally you should not use it. Use specific callback methods instead (e.g. onCallModifying()). */
   public void onDlgReInvite(InviteDialog d, String sdp, Message msg)
   {  if (d!=dialog) {  printLog("NOT the current dialog",LogLevel.HIGH);  return;  }
      if (sdp!=null && sdp.length()!=0) remote_sdp=sdp;
      if (listener!=null) listener.onCallModifying(this,sdp,msg);
   }

   /** Inherited from class InviteDialogListener and called by an InviteDialag. Normally you should not use it. Use specific callback methods instead (e.g. onCallRinging()). */
   public void onDlgInviteProvisionalResponse(InviteDialog d, int code, String reason, String sdp, Message msg)
   {  if (d!=dialog) {  printLog("NOT the current dialog",LogLevel.HIGH);  return;  }
      if (sdp!=null && sdp.length()!=0) remote_sdp=sdp;
      if (code==180) if (listener!=null) listener.onCallRinging(this,msg);
   }

   /** Inherited from class InviteDialogListener and called by an InviteDialag. Normally you should not use it. Use specific callback methods instead (e.g. onCallAccepted()). */
   public void onDlgInviteSuccessResponse(InviteDialog d, int code, String reason, String sdp, Message msg)
   {  if (d!=dialog) {  printLog("NOT the current dialog",LogLevel.HIGH);  return;  }
      if (sdp!=null && sdp.length()!=0) remote_sdp=sdp;
      if (listener!=null) listener.onCallAccepted(this,sdp,msg);
   }

   /** Inherited from class InviteDialogListener and called by an InviteDialag. Normally you should not use it. Use specific callback methods instead (e.g. onCallRedirection()). */
   public void onDlgInviteRedirectResponse(InviteDialog d, int code, String reason, MultipleHeader contacts, Message msg)
   {  if (d!=dialog) {  printLog("NOT the current dialog",LogLevel.HIGH);  return;  }
      if (listener!=null) listener.onCallRedirection(this,reason,contacts.getValues(),msg);
   }

   /** Inherited from class InviteDialogListener and called by an InviteDialag. Normally you should not use it. Use specific callback methods instead (e.g. onCallRefused()). */
   public void onDlgInviteFailureResponse(InviteDialog d, int code, String reason, Message msg)
   {  if (d!=dialog) {  printLog("NOT the current dialog",LogLevel.HIGH);  return;  }
      if (listener!=null) listener.onCallRefused(this,reason,msg);
   }

   /** Inherited from class InviteDialogListener and called by an InviteDialag. Normally you should not use it. Use specific callback methods instead (e.g. onCallTimeout()). */
   public void onDlgTimeout(InviteDialog d)
   {  if (d!=dialog) {  printLog("NOT the current dialog",LogLevel.HIGH);  return;  }
      if (listener!=null) listener.onCallTimeout(this);
   }

   /** Inherited from class InviteDialogListener and called by an InviteDialag. Normally you should not use it. */
   public void onDlgReInviteProvisionalResponse(InviteDialog d, int code, String reason, String sdp, Message msg)
   {  if (d!=dialog) {  printLog("NOT the current dialog",LogLevel.HIGH);  return;  }
      if (sdp!=null && sdp.length()!=0) remote_sdp=sdp;
   }

   /** Inherited from class InviteDialogListener and called by an InviteDialag. Normally you should not use it. Use specific callback methods instead (e.g. onCallReInviteAccepted()). */
   public void onDlgReInviteSuccessResponse(InviteDialog d, int code, String reason, String sdp, Message msg)
   {  if (d!=dialog) {  printLog("NOT the current dialog",LogLevel.HIGH);  return;  }
      if (sdp!=null && sdp.length()!=0) remote_sdp=sdp;
      if (listener!=null) listener.onCallReInviteAccepted(this,sdp,msg);
   }

   /** Inherited from class InviteDialogListener and called by an InviteDialag. Normally you should not use it. Use specific callback methods instead (e.g. onCallReInviteRedirection()). */
   //public void onDlgReInviteRedirectResponse(InviteDialog d, int code, String reason, MultipleHeader contacts, Message msg)
   //{  if (d!=dialog) {  printLog("NOT the current dialog",LogLevel.HIGH);  return;  }
   //   if (listener!=null) listener.onCallReInviteRedirection(this,reason,contacts.getValues(),msg);
   //}

   /** Inherited from class InviteDialogListener and called by an InviteDialag. Normally you should not use it. Use specific callback methods instead (e.g. onCallReInviteRefused()). */
   public void onDlgReInviteFailureResponse(InviteDialog d, int code, String reason, Message msg)
   {  if (d!=dialog) {  printLog("NOT the current dialog",LogLevel.HIGH);  return;  }
      if (listener!=null) listener.onCallReInviteRefused(this,reason,msg);
   }

   /** Inherited from class InviteDialogListener and called by an InviteDialag. Normally you should not use it. Use specific callback methods instead (e.g. onCallReInviteTimeout()). */
   public void onDlgReInviteTimeout(InviteDialog d)
   {  if (d!=dialog) {  printLog("NOT the current dialog",LogLevel.HIGH);  return;  }
      if (listener!=null) listener.onCallReInviteTimeout(this);
   }

   /** Inherited from class InviteDialogListener and called by an InviteDialag. Normally you should not use it. Use specific callback methods instead (e.g. onCallConfirmed()). */
   public void onDlgAck(InviteDialog d, String sdp, Message msg)
   {  if (d!=dialog) {  printLog("NOT the current dialog",LogLevel.HIGH);  return;  }
      if (sdp!=null && sdp.length()!=0) remote_sdp=sdp;
      if (listener!=null) listener.onCallConfirmed(this,sdp,msg);
   }

   /** Inherited from class InviteDialogListener and called by an InviteDialag. Normally you should not use it. Use specific callback methods instead (e.g. onCallClosing()). */
   public void onDlgCancel(InviteDialog d, Message msg)
   {  if (d!=dialog) {  printLog("NOT the current dialog",LogLevel.HIGH);  return;  }
      if (listener!=null) listener.onCallCanceling(this,msg);
   }

   /** Inherited from class InviteDialogListener and called by an InviteDialag. Normally you should not use it. Use specific callback methods instead (e.g. onClosing()). */
   public void onDlgBye(InviteDialog d, Message msg)
   {  if (d!=dialog) {  printLog("NOT the current dialog",LogLevel.HIGH);  return;  }
      if (listener!=null) listener.onCallClosing(this,msg);
   }

   /** Inherited from class InviteDialogListener and called by an InviteDialag. Normally you should not use it. Use specific callback methods instead (e.g. onClosed()). */
   public void onDlgByeFailureResponse(InviteDialog d, int code, String reason, Message msg)
   {  if (d!=dialog) {  printLog("NOT the current dialog",LogLevel.HIGH);  return;  }
      if (listener!=null) listener.onCallClosed(this,msg);
   }

   /** Inherited from class InviteDialogListener and called by an InviteDialag. Normally you should not use it. Use specific callback methods instead (e.g. onClosed()). */
   public void onDlgByeSuccessResponse(InviteDialog d, int code, String reason, Message msg)
   {  if (d!=dialog) {  printLog("NOT the current dialog",LogLevel.HIGH);  return;  }
      if (listener!=null) listener.onCallClosed(this,msg);
   }

   // -----------------------------------------------------

   /** When an incoming INVITE is accepted */
   //public void onDlgAccepted(InviteDialog dialog) {}

   /** When an incoming INVITE is refused */
   //public void onDlgRefused(InviteDialog dialog) {}

   /** When the INVITE handshake is successful terminated */
   public void onDlgCall(InviteDialog dialog) {}

   /** When an incoming Re-INVITE is accepted */
   //public void onDlgReInviteAccepted(InviteDialog dialog) {}

   /** When an incoming Re-INVITE is refused */
   //public void onDlgReInviteRefused(InviteDialog dialog) {}

   /** When a BYE request traqnsaction has been started */
   //public void onDlgByeing(InviteDialog dialog) {}

   /** When the dialog is finally closed */
   public void onDlgClose(InviteDialog d)
   {
	   if (d==dialog)
		   callWasUsed=true;

	   if (listener!=null) listener.onCallClosed(this,null);
	}





   //**************************** Logs ****************************/

   /** Adds a new string to the default Log */
   protected void printLog(String str, int level)
   {  if (log!=null) log.println("Call: "+str,level+SipStack.LOG_LEVEL_CALL);
   }
}


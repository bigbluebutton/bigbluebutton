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
import org.zoolu.sip.provider.*;
import org.zoolu.sip.message.*;
//import org.zoolu.sip.dialog.*;
import org.zoolu.sip.header.StatusLine;
import org.zoolu.sip.address.NameAddress;
import org.zoolu.sip.dialog.ExtendedInviteDialog;
import org.zoolu.sip.dialog.ExtendedInviteDialogListener;
import org.zoolu.tools.Log;
import org.zoolu.tools.LogLevel;
import org.zoolu.sdp.*;
import java.util.Vector;


/** Class ExtendedCall extends basic SIP calls.
  * <p>It implements:
  * <br>- call transfer (REFER/NOTIFY methods)
  */
public class ExtendedCall extends Call implements ExtendedInviteDialogListener
{  

   ExtendedCallListener xcall_listener;

   Message refer;


   /** User name. */
   String username;

   /** User name. */
   String realm;

   /** User's passwd. */
   String passwd;

   /** Nonce for the next authentication. */
   String next_nonce;

   /** Qop for the next authentication. */
   String qop;


   /** Creates a new ExtendedCall. */
   public ExtendedCall(SipProvider sip_provider, String from_url, String contact_url, ExtendedCallListener call_listener)
   {  super(sip_provider,from_url,contact_url,call_listener);
      this.xcall_listener=call_listener;
      this.refer=null;
      this.username=null;
      this.realm=null;
      this.passwd=null;
      this.next_nonce=null;
      this.qop=null;
   }


   /** Creates a new ExtendedCall specifing the sdp. */
   /*public ExtendedCall(SipProvider sip_provider, String from_url, String contact_url, String sdp, ExtendedCallListener call_listener)
   {  super(sip_provider,from_url,contact_url,sdp,call_listener);
      xcall_listener=call_listener;
   }*/


   /** Creates a new ExtendedCall. */
   public ExtendedCall(SipProvider sip_provider, String from_url, String contact_url, String username, String realm, String passwd, ExtendedCallListener call_listener)
   {  super(sip_provider,from_url,contact_url,call_listener);
      this.xcall_listener=call_listener;
      this.refer=null;
      this.username=username;
      this.realm=realm;
      this.passwd=passwd;
      this.next_nonce=null;
      this.qop=null;
   }


   /** Waits for an incoming call */
   public void listen()
   {  if (username!=null) dialog=new ExtendedInviteDialog(sip_provider,username,realm,passwd,this);
      else dialog=new ExtendedInviteDialog(sip_provider,this);
      dialog.listen();
   }


   /** Starts a new call, inviting a remote user (<i>r_user</i>) */
   public void call(String r_user, String from, String contact, String sdp)
   {  printLog("calling "+r_user,LogLevel.MEDIUM);
      if (username!=null) dialog=new ExtendedInviteDialog(sip_provider,username,realm,passwd,this);
      else dialog=new ExtendedInviteDialog(sip_provider,this);
      if (from==null) from=from_url;
      if (contact==null) contact=contact_url;
      if (sdp!=null) local_sdp=sdp;
      if (local_sdp!=null)
         dialog.invite(r_user,from,contact,local_sdp);
      else dialog.inviteWithoutOffer(r_user,from,contact);
   } 


   /** Starts a new call with the <i>invite</i> message request */
   public void call(Message invite)
   {  dialog=new ExtendedInviteDialog(sip_provider,this);
      local_sdp=invite.getBody();
      if (local_sdp!=null)
         dialog.invite(invite);
      else dialog.inviteWithoutOffer(invite);
   } 
   
   
   /** Requests a call transfer */
   public void transfer(String transfer_to)
   {  ((ExtendedInviteDialog)dialog).refer(new NameAddress(transfer_to));
   }

   /** Accepts a call transfer request */
   public void acceptTransfer()
   {  ((ExtendedInviteDialog)dialog).acceptRefer(refer);
   }


   /** Refuses a call transfer request */
   public void refuseTransfer()
   {  ((ExtendedInviteDialog)dialog).refuseRefer(refer);
   }


   /** Notifies the satus of an other call */
   public void notify(int code, String reason)
   {  ((ExtendedInviteDialog)dialog).notify(code,reason);
   }


   // ************** Inherited from InviteDialogListener **************


   /** When an incoming REFER request is received within the dialog */ 
   public void onDlgRefer(org.zoolu.sip.dialog.InviteDialog d, NameAddress refer_to, NameAddress referred_by, Message msg)
   {  if (d!=dialog) {  printLog("NOT the current dialog",LogLevel.HIGH);  return;  }
      printLog("onDlgRefer("+refer_to.toString()+")",LogLevel.LOW);       
      refer=msg;
      if (xcall_listener!=null) xcall_listener.onCallTransfer(this,refer_to,referred_by,msg);
   }

   /** When a response is received for a REFER request within the dialog */ 
   public void onDlgReferResponse(org.zoolu.sip.dialog.InviteDialog d, int code, String reason, Message msg)
   {  if (d!=dialog) {  printLog("NOT the current dialog",LogLevel.HIGH);  return;  }
      printLog("onDlgReferResponse("+code+" "+reason+")",LogLevel.LOW);       
      if (code>=200 && code <300)
      {  if(xcall_listener!=null) xcall_listener.onCallTransferAccepted(this,msg);
      }
      else
      if (code>=300)
      {  if(xcall_listener!=null) xcall_listener.onCallTransferRefused(this,reason,msg);
      }
   }

   /** When an incoming NOTIFY request is received within the dialog */
   public void onDlgNotify(org.zoolu.sip.dialog.InviteDialog d, String event, String sipfragment, Message msg)
   {  if (d!=dialog) {  printLog("NOT the current dialog",LogLevel.HIGH);  return;  }
      printLog("onDlgNotify("+event.substring(0,5)+")",LogLevel.LOW);
      //if (event.equals("refer"))
       if (event.substring(0,5).equals("refer"))
      {  Message fragment=new Message(sipfragment);
         printLog("Notify: "+sipfragment,LogLevel.LOW);
         if (fragment.isResponse())
         {  StatusLine status_line=fragment.getStatusLine();
            int code=status_line.getCode();
            String reason=status_line.getReason();
            if (code>=180 && code<300)
            {  printLog("Call successfully transferred",LogLevel.LOW);
               if(xcall_listener!=null) xcall_listener.onCallTransferSuccess(this,msg);
            }
            else
            if (code>=300)
            {  printLog("Call NOT transferred",LogLevel.LOW);
               if(xcall_listener!=null) xcall_listener.onCallTransferFailure(this,reason,msg);
            }
         }
      }
   }

   /** When an incoming request is received within the dialog
     * different from INVITE, CANCEL, ACK, BYE */
   public void onDlgAltRequest(org.zoolu.sip.dialog.InviteDialog d, String method, String body, Message msg)
   {
   }

   /** When a response is received for a request within the dialog
     * different from INVITE, CANCEL, ACK, BYE */
   public void onDlgAltResponse(org.zoolu.sip.dialog.InviteDialog d, String method, int code, String reason, String body, Message msg)
   {
   }


   //**************************** Logs ****************************/

   /** Adds a new string to the default Log */
   protected void printLog(String str, int level)
   {  if (log!=null) log.println("ExtendedCall: "+str,level+SipStack.LOG_LEVEL_CALL);
   }
}


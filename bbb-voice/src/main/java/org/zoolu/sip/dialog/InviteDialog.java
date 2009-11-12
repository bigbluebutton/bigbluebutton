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


import org.zoolu.sip.address.*;
import org.zoolu.sip.transaction.*;
import org.zoolu.sip.message.*;
import org.zoolu.sip.header.*;
import org.zoolu.sip.provider.*;
import org.zoolu.tools.LogLevel;


/** Class InviteDialog can be used to manage invite dialogs.
  * An InviteDialog can be both client or server.
  * (i.e. generating an INVITE request or responding to an incoming INVITE request).
  * <p>
  * An InviteDialog can be in state inviting/waiting/invited, accepted/refused, call,
  * byed/byeing, and close.
  * <p>
  * InviteDialog supports the offer/answer model for the sip body, with the following rules:
  * <br> - both INVITE-offer/2xx-answer and 2xx-offer/ACK-answer modes for incoming calls
  * <br> - INVITE-offer/2xx-answer mode for outgoing calls.
  */
public class InviteDialog extends Dialog implements TransactionClientListener, InviteTransactionServerListener, AckTransactionServerListener, SipProviderListener
{
   /** The last invite message */
   Message invite_req;
   /** The last ack message */
   Message ack_req;

   /** The InviteTransactionServer. */
   InviteTransactionServer invite_ts;
   /** The AckTransactionServer. */
   AckTransactionServer ack_ts;
   /** The BYE TransactionServer. */
   TransactionServer bye_ts;

   /** The InviteDialog listener */
   InviteDialogListener listener;


   /** Whether offer/answer are in INVITE/200_OK */
   boolean invite_offer;

   protected static final int D_INIT=0;
   protected static final int D_WAITING=1;
   protected static final int D_INVITING=2;
   protected static final int D_INVITED=3;
   protected static final int D_REFUSED=4;
   protected static final int D_ACCEPTED=5;
   protected static final int D_CALL=6;

   protected static final int D_ReWAITING=11;
   protected static final int D_ReINVITING=12;
   protected static final int D_ReINVITED=13;
   protected static final int D_ReREFUSED=14;
   protected static final int D_ReACCEPTED=15;

   protected static final int D_BYEING=7;
   protected static final int D_BYED=8;
   protected static final int D_CLOSE=9;

   /** Gets the dialog state */
   protected String getStatus()
   {  switch (status)
      {  case D_INIT       : return "D_INIT";
         case D_WAITING    : return "D_WAITING";
         case D_INVITING   : return "D_INVITING";
         case D_INVITED    : return "D_INVITED";
         case D_REFUSED    : return "D_REFUSED";
         case D_ACCEPTED   : return "D_ACCEPTED";
         case D_CALL       : return "D_CALL";
         case D_ReWAITING  : return "D_ReWAITING";
         case D_ReINVITING : return "D_ReINVITING";
         case D_ReINVITED  : return "D_ReINVITED";
         case D_ReREFUSED  : return "D_ReREFUSED";
         case D_ReACCEPTED : return "D_ReACCEPTED";
         case D_BYEING     : return "D_BYEING";
         case D_BYED       : return "D_BYED";
         case D_CLOSE      : return "D_CLOSE";
         default : return null;
      }
   }

   // ************************** Public methods **************************

   /** Whether the dialog is in "early" state. */
   public boolean isEarly()
   {  return status<D_ACCEPTED;
   }

   /** Whether the dialog is in "confirmed" state. */
   public boolean isConfirmed()
   {  return status>=D_ACCEPTED && status<D_CLOSE;
   }

   /** Whether the dialog is in "terminated" state. */
   public boolean isTerminated()
   {  return status==D_CLOSE;
   }

   /** Whether the session is "active". */
   public boolean isSessionActive()
   {  return (status==D_CALL);
   }

    /** Whether the dialog is waiting. */
      public boolean isWaiting()
      {
   	   printLog("isWaiting - callState="+status,LogLevel.MEDIUM);
   	   return (status==D_WAITING);
   }

   /** Gets the invite message */
   public Message getInviteMessage()
   {  return invite_req;
   }

   /** Creates a new InviteDialog. */
   public InviteDialog(SipProvider sip_provider, InviteDialogListener listener)
   {  super(sip_provider);
      init(listener);
   }

   /** Creates a new InviteDialog for the already received INVITE request <i>invite</i>. */
   public InviteDialog(SipProvider sip_provider, Message invite, InviteDialogListener listener)
   {  super(sip_provider);
      init(listener);

      changeStatus(D_INVITED);
      invite_req=invite;
      invite_ts=new InviteTransactionServer(sip_provider,invite_req,this);
      update(Dialog.UAS,invite_req);
   }

   /** Inits the InviteDialog. */
   private void init(InviteDialogListener listener)
   {  log=sip_provider.getLog();
      this.listener=listener;
      this.invite_req=null;
      this.ack_req=null;
      this.invite_offer=true;
      changeStatus(D_INIT);
   }

   /** Starts a new InviteTransactionServer. */
   public void listen()
   {  if (!statusIs(D_INIT)) return;
      //else
      changeStatus(D_WAITING);
      invite_ts=new InviteTransactionServer(sip_provider,this);
      invite_ts.listen();
   }

   /** Starts a new InviteTransactionClient
     * and initializes the dialog state information.
     * @param callee the callee url (and display name)
     * @param caller the caller url (and display name)
     * @param contact the contact url OR the contact username
     * @param session_descriptor SDP body
     */
   public void invite(String callee, String caller, String contact, String session_descriptor)
   {  printLog("inside invite(callee,caller,contact,sdp)",LogLevel.MEDIUM);
      if (!statusIs(D_INIT)) return;
      // else
      NameAddress to_url=new NameAddress(callee);
      NameAddress from_url=new NameAddress(caller);
      SipURL request_uri=to_url.getAddress();

      NameAddress contact_url=null;
      if (contact!=null)
      {  if (contact.indexOf("sip:")>=0) contact_url=new NameAddress(contact);
         else contact_url=new NameAddress(new SipURL(contact,sip_provider.getViaAddress(),sip_provider.getPort()));
      }
      else contact_url=from_url;

      Message invite=MessageFactory.createInviteRequest(sip_provider,request_uri,to_url,from_url,contact_url,session_descriptor);
      // do invite
      invite(invite);
   }

   /** Starts a new InviteTransactionClient
     * and initializes the dialog state information
     * @param invite the INVITE message
     */
   public void invite(Message invite)
   {  printLog("inside invite(invite)",LogLevel.MEDIUM);
      if (!statusIs(D_INIT)) return;
      // else
      changeStatus(D_INVITING);
      invite_req=invite;
      update(Dialog.UAC,invite_req);
      InviteTransactionClient invite_tc=new InviteTransactionClient(sip_provider,invite_req,this);
      invite_tc.request();
   }


   /** Starts a new InviteTransactionClient with offer/answer in 2xx/ack
     * and initializes the dialog state information */
   public void inviteWithoutOffer(String callee, String caller, String contact)
   {  invite_offer=false;
      invite(callee,caller,contact,null);
   }

   /** Starts a new InviteTransactionClient with offer/answer in 2xx/ack
     * and initializes the dialog state information */
   public void inviteWithoutOffer(Message invite)
   {  invite_offer=false;
      invite(invite);
   }


   /** Re-invites the remote user.
     * <p>Starts a new InviteTransactionClient and changes the dialog state information
     * <p> Parameters:
     * <br>- contact : the contact url OR the contact username; if null, the previous contact is used
     * <br>- session_descriptor : the message body
     */
   public void reInvite(String contact, String session_descriptor)
   {  printLog("inside reInvite(contact,sdp)",LogLevel.MEDIUM);
      if (!statusIs(D_CALL)) return;
      // else
      Message invite=MessageFactory.createInviteRequest(this,session_descriptor);
      if (contact!=null)
      {  NameAddress contact_url;
         if (contact.indexOf("sip:")>=0) contact_url=new NameAddress(contact);
         else contact_url=new NameAddress(new SipURL(contact,sip_provider.getViaAddress(),sip_provider.getPort()));
         invite.setContactHeader(new ContactHeader(contact_url));
      }
      reInvite(invite);
   }


   /** Re-invites the remote user.
     * <p>Starts a new InviteTransactionClient and changes the dialog state information */
   public void reInvite(Message invite)
   {  printLog("inside reInvite(invite)",LogLevel.MEDIUM);
      if (!statusIs(D_CALL)) return;
      // else
      changeStatus(D_ReINVITING);
      invite_req=invite;
      update(Dialog.UAC,invite_req);
      InviteTransactionClient invite_tc=new InviteTransactionClient(sip_provider,invite_req,this);
      invite_tc.request();
   }

   /** Re-invites the remote user with offer/answer in 2xx/ack
     * <p>Starts a new InviteTransactionClient and changes the dialog state information */
   public void reInviteWithoutOffer(Message invite)
   {  invite_offer=false;
      reInvite(invite);
   }

   /** Re-invites the remote user with offer/answer in 2xx/ack
     * <p>Starts a new InviteTransactionClient and changes the dialog state information */
   public void reInviteWithoutOffer(String contact, String session_descriptor)
   {  invite_offer=false;
      reInvite(contact,session_descriptor);
   }

   /** Sends the ack when offer/answer is in 2xx/ack */
   public void ackWithAnswer(String contact, String session_descriptor)
   {  if (contact!=null) setLocalContact(new NameAddress(contact));
      Message ack=MessageFactory.create2xxAckRequest(this,session_descriptor);
      ackWithAnswer(ack);
   }

   /** Sends the ack when offer/answer is in 2xx/ack */
   public void ackWithAnswer(Message ack)
   {  ack_req=ack;
      // reset the offer/answer flag to the default value
      invite_offer=true;
      AckTransactionClient ack_tc=new AckTransactionClient(sip_provider,ack,null);
      ack_tc.request();
   }


   /** Responds with <i>resp</i>.
     * This method can be called when the InviteDialog is in D_INVITED or D_BYED states.
     * <p>
     * If the CSeq method is INVITE and the response is 2xx,
     * it moves to state D_ACCEPTED, adds a new listener to the SipProviderListener,
     * and creates new AckTransactionServer
     * <p>
     * If the CSeq method is INVITE and the response is not 2xx,
     * it moves to state D_REFUSED, and sends the response. */
   public void respond(Message resp)
   //private void respond(Message resp)
   {  printLog("inside respond(resp)",LogLevel.MEDIUM);
      String method=resp.getCSeqHeader().getMethod();
      if (method.equals(SipMethods.INVITE))
      {  if (!verifyStatus(statusIs(D_INVITED)||statusIs(D_ReINVITED)))
         {  printLog("respond(): InviteDialog not in (re)invited state: No response now",LogLevel.HIGH);
            return;
         }

         int code=resp.getStatusLine().getCode();
         // 1xx provisional responses
         if (code>=100 && code<200)
         {  invite_ts.respondWith(resp);
            return;
         }
         // For all final responses establish the dialog
         if (code>=200)
         {  //changeStatus(D_ACCEPTED);
            update(Dialog.UAS,resp);
         }
         // 2xx success responses
         if (code>=200 && code<300)
         {  if(statusIs(D_INVITED)) changeStatus(D_ACCEPTED); else changeStatus(D_ReACCEPTED);
            // terminates the INVITE Transaction server and activates an ACK Transaction server
            invite_ts.terminate();
            ConnectionIdentifier conn_id=invite_ts.getConnectionId();
            ack_ts=new AckTransactionServer(sip_provider,conn_id,resp,this);
            ack_ts.respond();
            //if (statusIs(D_ReACCEPTED)) listener.onDlgReInviteAccepted(this);
            //else listener.onDlgAccepted(this);
            return;
         }
         else
         // 300-699 failure responses
         //if (code>=300)
         {  if(statusIs(D_INVITED)) changeStatus(D_REFUSED); else changeStatus(D_ReREFUSED);
            invite_ts.respondWith(resp);
            //if (statusIs(D_ReREFUSED)) listener.onDlgReInviteRefused(this);
            //else listener.onDlgRefused(this);
            return;
         }
      }
      if (method.equals(SipMethods.BYE))
      {  if (!verifyStatus(statusIs(D_BYED))) return;
         bye_ts.respondWith(resp);
      }
   }

   /** Responds with <i>code</i> and <i>reason</i>.
     * This method can be called when the InviteDialog is in D_INVITED, D_ReINVITED states */
   public void respond(int code, String reason, String contact, String sdp)
   {  printLog("inside respond("+code+","+reason+")",LogLevel.MEDIUM);
      if (statusIs(D_INVITED) || statusIs(D_ReINVITED))
      {  NameAddress contact_address=null;
         if (contact!=null) contact_address=new NameAddress(contact);
         Message resp=MessageFactory.createResponse(invite_req,code,reason,contact_address);
         resp.setBody(sdp);
         respond(resp);
      }
      else
      printWarning("Dialog isn't in \"invited\" state: cannot respond ("+code+"/"+getStatus()+"/"+getDialogID()+")",LogLevel.MEDIUM);
   }

   /** Signals that the phone is ringing.
     * This method should be called when the InviteDialog is in D_INVITED or D_ReINVITED state */
   public void ring()
   {  printLog("inside ring()",LogLevel.MEDIUM);
      respond(180,SipResponses.reasonOf(180),null,null);
   }

   /** Accepts the incoming call.
     * This method should be called when the InviteDialog is in D_INVITED or D_ReINVITED state */
   public void accept(String contact, String sdp)
   {  printLog("inside accept(sdp)",LogLevel.MEDIUM);
      respond(200,SipResponses.reasonOf(200),contact,sdp);
   }

   /** Refuses the incoming call.
     * This method should be called when the InviteDialog is in D_INVITED or D_ReINVITED state */
   public void refuse(int code, String reason)
   {  printLog("inside refuse("+code+","+reason+")",LogLevel.MEDIUM);
      respond(code,reason,null,null);
   }

   /** Refuses the incoming call.
     * This method should be called when the InviteDialog is in D_INVITED or D_ReINVITED state */
   public void refuse()
   {  printLog("inside refuse()",LogLevel.MEDIUM);
      //refuse(480,"Temporarily Unavailable");
      //refuse(603,"Decline");
      refuse(403,SipResponses.reasonOf(403));
   }

   /** Termiante the call.
     * This method should be called when the InviteDialog is in D_CALL state
     * <p>
     * Increments the Cseq, moves to state D_BYEING, and creates new BYE TransactionClient */
   public void bye()
   {  printLog("inside bye()",LogLevel.MEDIUM);
      if (statusIs(D_CALL))
      {  Message bye=MessageFactory.createByeRequest(this);
         bye(bye);
      }
   }

   /** Termiante the call.
     * This method should be called when the InviteDialog is in D_CALL state
     * <p>
     * Increments the Cseq, moves to state D_BYEING, and creates new BYE TransactionClient */
   public void bye(Message bye)
   {  printLog("inside bye(bye)",LogLevel.MEDIUM);
      if (statusIs(D_CALL))
      {  changeStatus(D_BYEING);
         //dialog_state.incLocalCSeq(); // done by MessageFactory.createRequest()
         TransactionClient tc=new TransactionClient(sip_provider,bye,this);
         tc.request();
         //listener.onDlgByeing(this);
      }
   }

   /** Cancel the ongoing call request or a call listening.
     * This method should be called when the InviteDialog is in D_INVITING or D_ReINVITING state
     * or in the D_WAITING state */
   public void cancel()
   {  printLog("inside cancel()",LogLevel.MEDIUM);
      if (statusIs(D_INVITING) || statusIs(D_ReINVITING))
      {  Message cancel=MessageFactory.createCancelRequest(invite_req);
         cancel(cancel);
      }
      else
      if (statusIs(D_WAITING) || statusIs(D_ReWAITING))
      {  invite_ts.terminate();
      }
   }

   /** Cancel the ongoing call request or a call listening.
     * This method should be called when the InviteDialog is in D_INVITING or D_ReINVITING state
     * or in the D_WAITING state */
   public void cancel(Message cancel)
   {  printLog("inside cancel(cancel)",LogLevel.MEDIUM);
      if (statusIs(D_INVITING) || statusIs(D_ReINVITING))
      {  //changeStatus(D_CANCELING);
         TransactionClient tc=new TransactionClient(sip_provider,cancel,null);
         tc.request();
      }
      else
      if (statusIs(D_WAITING) || statusIs(D_ReWAITING))
      {  invite_ts.terminate();
      }
   }

   /** Redirects the incoming call
     * , specifing the <i>code</i> and <i>reason</i>.
     * This method can be called when the InviteDialog is in D_INVITED or D_ReINVITED state */
   public void redirect(int code, String reason, String contact)
   {  printLog("inside redirect("+code+","+reason+","+contact+")",LogLevel.MEDIUM);
      respond(code,reason,contact,null);
   }

   // ************** Inherited from SipProviderListener **************

   /** Inherited from class SipProviderListener.
     * Called when a new message is received (out of any ongoing transaction)
     * for the current InviteDialog.
     * Always checks for out-of-date methods (CSeq header sequence number).
     * <p>
     * If the message is ACK(2xx/INVITE) request, it moves to D_CALL state, and fires <i>onDlgAck(this,body,msg)</i>.
     * <p>
     * If the message is 2xx(INVITE) response, it create a new AckTransactionClient
     * <p>
     * If the message is BYE,
     * it moves to D_BYED state, removes the listener from SipProvider, fires onDlgBye(this,msg)
     * then it responds with 200 OK, moves to D_CLOSE state and fires onDlgClose(this)
     */
   public void onReceivedMessage(SipProvider sip_provider, Message msg)
   {  printLog("inside onReceivedMessage(sip_provider,message)",LogLevel.MEDIUM);
      if (msg.isRequest() && !(msg.isAck() || msg.isCancel()) && msg.getCSeqHeader().getSequenceNumber()<=getRemoteCSeq())
      {  printLog("Request message is too late (CSeq too small): Message discarded",LogLevel.HIGH);
         return;
      }
      // invite received
      if (msg.isRequest() && msg.isInvite())
      {  verifyStatus(statusIs(D_INIT)||statusIs(D_CALL));
         // NOTE: if the invite_ts.listen() is used, you should not arrive here with the D_INIT state..
         //   however state D_INIT has been included for robustness against further changes.
         if (statusIs(D_INIT)) changeStatus(D_INVITED); else changeStatus(D_ReINVITED);
         invite_req=msg;
         invite_ts=new InviteTransactionServer(sip_provider,invite_req,this);
         //((TransactionServer)transaction).listen();
         update(Dialog.UAS,invite_req);
         if (statusIs(D_INVITED)) listener.onDlgInvite(this,invite_req.getToHeader().getNameAddress(),invite_req.getFromHeader().getNameAddress(),invite_req.getBody(),invite_req);
         else listener.onDlgReInvite(this,invite_req.getBody(),invite_req);
      }
      else
      // ack (of 2xx of INVITE)
      if (msg.isRequest() && msg.isAck())
      {  if (!verifyStatus(statusIs(D_ACCEPTED)||statusIs(D_ReACCEPTED))) return;
         changeStatus(D_CALL);
         // terminates the AckTransactionServer
         ack_ts.terminate();
         listener.onDlgAck(this,msg.getBody(),msg);
         listener.onDlgCall(this);
      }
      else
      // keep sending ACK (if already sent) for any "200 OK" received
      if (msg.isResponse())
      {  if (!verifyStatus(statusIs(D_CALL))) return;
         int code=msg.getStatusLine().getCode();
         verifyThat(code>=200 && code<300,"code 2xx was expected");
         if (ack_req!=null)
         {  AckTransactionClient ack_tc=new AckTransactionClient(sip_provider,ack_req,null);
            ack_tc.request();
         }
      }
      else
      // bye received
      if (msg.isRequest() && msg.isBye())
      {
		 //if (!verifyStatus(statusIs(D_CALL)||statusIs(D_BYEING))) return;
         changeStatus(D_BYED);
         bye_ts=new TransactionServer(sip_provider,msg,this);
         // automatically sends a 200 OK
         Message resp=MessageFactory.createResponse(msg,200,SipResponses.reasonOf(200),null);
         respond(resp);
         listener.onDlgBye(this,msg);
         changeStatus(D_CLOSE);
         listener.onDlgClose(this);
      }
      else
      // cancel received
      if (msg.isRequest() && msg.isCancel())
      {  if (!verifyStatus(statusIs(D_INVITED)||statusIs(D_ReINVITED))) return;
         // create a CANCEL TransactionServer and send a 200 OK (CANCEL)
         TransactionServer ts=new TransactionServer(sip_provider,msg,null);
         //ts.listen();
         ts.respondWith(MessageFactory.createResponse(msg,200,SipResponses.reasonOf(200),null));
         // automatically sends a 487 Cancelled
         Message resp=MessageFactory.createResponse(invite_req,487,SipResponses.reasonOf(487),null);
         respond(resp);
         listener.onDlgCancel(this,msg);
      }
      else
      // any other request received
      if (msg.isRequest())
      {  TransactionServer ts=new TransactionServer(sip_provider,msg,null);
         //ts.listen();
         ts.respondWith(MessageFactory.createResponse(msg,405,SipResponses.reasonOf(405),null));
      }
   }

   // ************** Inherited from InviteTransactionClientListener **************

   /** Inherited from TransactionClientListener.
     * When the TransactionClientListener is in "Proceeding" state and receives a new 1xx response
     * <p>
     * For INVITE transaction it fires <i>onFailureResponse(this,code,reason,body,msg)</i>. */
   public void onTransProvisionalResponse(TransactionClient tc, Message msg)
   {  printLog("inside onTransProvisionalResponse(tc,mdg)",LogLevel.LOW);
      if (tc.getTransactionMethod().equals(SipMethods.INVITE))
      {  StatusLine statusline=msg.getStatusLine();
         listener.onDlgInviteProvisionalResponse(this,statusline.getCode(),statusline.getReason(),msg.getBody(),msg);
      }
   }

   /** Inherited from TransactionClientListener.
     * When the TransactionClientListener goes into the "Completed" state, receiving a failure response
     * <p>
     * If called for a INVITE transaction, it moves to D_CLOSE state, removes the listener from SipProvider.
     * <p>
     * If called for a BYE transaction, it moves to D_CLOSE state,
     * removes the listener from SipProvider, and fires <i>onClose(this,msg)</i>. */
   public void onTransFailureResponse(TransactionClient tc, Message msg)
   {  printLog("inside onTransFailureResponse("+tc.getTransactionId()+",msg)",LogLevel.LOW);
      if (tc.getTransactionMethod().equals(SipMethods.INVITE))
      {  if (!verifyStatus(statusIs(D_INVITING)||statusIs(D_ReINVITING))) return;
         StatusLine statusline=msg.getStatusLine();
         int code=statusline.getCode();
         verifyThat(code>=300 && code <700,"error code was expected");
         // new code to fix not sending ack
		 Message ack=MessageFactory.createRequest(this,SipMethods.ACK,null);
		 AckTransactionClient ack_tc=new AckTransactionClient(sip_provider,ack,null);
		 ack_tc.request();

         if (statusIs(D_ReINVITING))
         {  changeStatus(D_CALL);
            listener.onDlgReInviteFailureResponse(this,code,statusline.getReason(),msg);
         }
         else
         {  changeStatus(D_CLOSE);
            if (code>=300 && code<400) listener.onDlgInviteRedirectResponse(this,code,statusline.getReason(),msg.getContacts(),msg);
            else listener.onDlgInviteFailureResponse(this,code,statusline.getReason(),msg);
            listener.onDlgClose(this);
         }
      }
      else
      if (tc.getTransactionMethod().equals(SipMethods.BYE))
      {  if (!verifyStatus(statusIs(D_BYEING))) return;
         StatusLine statusline=msg.getStatusLine();
         int code=statusline.getCode();
         verifyThat(code>=300 && code <700,"error code was expected");
         // new code to fix not sending ack

		 Message ack=MessageFactory.createRequest(this,SipMethods.ACK,null);

		 AckTransactionClient ack_tc=new AckTransactionClient(sip_provider,ack,null);

		 ack_tc.request();


         changeStatus(this.D_CALL);
         listener.onDlgByeFailureResponse(this,code,statusline.getReason(),msg);
      }
   }

   /** Inherited from TransactionClientListener.
     * When an TransactionClientListener goes into the "Terminated" state, receiving a 2xx response
     * <p>
     * If called for a INVITE transaction, it updates the dialog information, moves to D_CALL state,
     * add a listener to the SipProvider, creates a new AckTransactionClient(ack,this),
     * and fires <i>onSuccessResponse(this,code,body,msg)</i>.
     * <p>
     * If called for a BYE transaction, it moves to D_CLOSE state,
     * removes the listener from SipProvider, and fires <i>onClose(this,msg)</i>. */
   public void onTransSuccessResponse(TransactionClient tc, Message msg)
   {  printLog("inside onTransSuccessResponse(tc,msg)",LogLevel.LOW);
      if (tc.getTransactionMethod().equals(SipMethods.INVITE))
      {  if (!verifyStatus(statusIs(D_INVITING)||statusIs(D_ReINVITING))) return;
         StatusLine statusline=msg.getStatusLine();
         int code=statusline.getCode();
         if (!verifyThat(code>=200 && code <300 && msg.getTransactionMethod().equals(SipMethods.INVITE),"2xx for invite was expected")) return;
         boolean re_inviting=statusIs(D_ReINVITING);
         changeStatus(D_CALL);
         update(Dialog.UAC,msg);
         if (invite_offer)
         {  //invite_req=MessageFactory.createRequest(SipMethods.ACK,dialog_state,sdp.toString());
            //ack=MessageFactory.createRequest(this,SipMethods.ACK,null);
            ack_req=MessageFactory.create2xxAckRequest(this,null);
            AckTransactionClient ack_tc=new AckTransactionClient(sip_provider,ack_req,null);
            ack_tc.request();
         }
         if (!re_inviting)
         {  listener.onDlgInviteSuccessResponse(this,code,statusline.getReason(),msg.getBody(),msg);
            listener.onDlgCall(this);
         }
         else
            listener.onDlgReInviteSuccessResponse(this,code,statusline.getReason(),msg.getBody(),msg);
      }
      else
      if (tc.getTransactionMethod().equals(SipMethods.BYE))
      {  if (!verifyStatus(statusIs(D_BYEING))) return;
         StatusLine statusline=msg.getStatusLine();
         int code=statusline.getCode();
         verifyThat(code>=200 && code <300,"2xx for bye was expected");
         changeStatus(D_CLOSE);
         listener.onDlgByeSuccessResponse(this,code,statusline.getReason(),msg);
         listener.onDlgClose(this);
      }
   }

   /** Inherited from TransactionClientListener.
     * When the TransactionClient goes into the "Terminated" state, caused by transaction timeout */
   public void onTransTimeout(TransactionClient tc)
   {  printLog("inside onTransTimeout(tc,msg)",LogLevel.LOW);
      if (tc.getTransactionMethod().equals(SipMethods.INVITE))
      {  if (!verifyStatus(statusIs(D_INVITING)||statusIs(D_ReINVITING))) return;
         changeStatus(D_CLOSE);
         listener.onDlgTimeout(this);
         listener.onDlgClose(this);
      }
      else
      if (tc.getTransactionMethod().equals(SipMethods.BYE))
      {  if (!verifyStatus(statusIs(D_BYEING))) return;
         changeStatus(D_CLOSE);
         listener.onDlgClose(this);
      }
   }


   // ************** Inherited from InviteTransactionServerListener **************

   /** Inherited from TransactionServerListener.
     * When the TransactionServer goes into the "Trying" state receiving a request
     * <p>
     * If called for a INVITE transaction, it initializes the dialog information,
     * <br> moves to D_INVITED state, and add a listener to the SipProvider,
     * <br> and fires <i>onInvite(caller,body,msg)</i>. */
   public void onTransRequest(TransactionServer ts, Message req)
   {  printLog("inside onTransRequest(ts,msg)",LogLevel.LOW);
      if (ts.getTransactionMethod().equals(SipMethods.INVITE))
      {  if (!verifyStatus(statusIs(D_WAITING))) return;
         changeStatus(D_INVITED);
         invite_req=req;
         update(Dialog.UAS,invite_req);
         listener.onDlgInvite(this,invite_req.getToHeader().getNameAddress(),invite_req.getFromHeader().getNameAddress(),invite_req.getBody(),invite_req);
      }
   }

   /** Inherited from InviteTransactionServerListener.
     * When an InviteTransactionServer goes into the "Confirmed" state receining an ACK for NON-2xx response
     * <p>
     * It moves to D_CLOSE state and removes the listener from SipProvider. */
   public void onTransFailureAck(InviteTransactionServer ts, Message msg)
   {  printLog("inside onTransFailureAck(ts,msg)",LogLevel.LOW);
      if (!verifyStatus(statusIs(D_REFUSED)||statusIs(D_ReREFUSED))) return;
      if (statusIs(D_ReREFUSED))
      {  changeStatus(D_CALL);
      }
      else
      {  changeStatus(D_CLOSE);
         listener.onDlgClose(this);
      }
   }


   // ************ Inherited from AckTransactionServerListener ************

   /** When the AckTransactionServer goes into the "Terminated" state, caused by transaction timeout */
   public void onTransAckTimeout(AckTransactionServer ts)
   {  printLog("inside onAckSrvTimeout(ts)",LogLevel.LOW);
      if (!verifyStatus(statusIs(D_ACCEPTED)||statusIs(D_ReACCEPTED)||statusIs(D_REFUSED)||statusIs(D_ReREFUSED))) return;
      printLog("No ACK received..",LogLevel.HIGH);
      changeStatus(D_CLOSE);
      listener.onDlgClose(this);
   }


   //**************************** Logs ****************************/

   /** Adds a new string to the default Log */
   protected void printLog(String str, int level)
   {  if (log!=null) log.println("InviteDialog#"+dialog_sqn+": "+str,level+SipStack.LOG_LEVEL_DIALOG);
   }

}

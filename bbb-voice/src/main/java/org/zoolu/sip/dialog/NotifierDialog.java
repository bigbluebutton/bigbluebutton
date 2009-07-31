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

/* Modified by:
 * Daina Interrante (daina.interrante@studenti.unipr.it)
 */

package org.zoolu.sip.dialog;


import org.zoolu.sip.address.*;
import org.zoolu.sip.transaction.*;
import org.zoolu.sip.dialog.*;
import org.zoolu.sip.message.*;
import org.zoolu.sip.header.*;
import org.zoolu.sip.header.*;
import org.zoolu.sip.provider.*;
import org.zoolu.tools.LogLevel;

import java.util.Date;


/** NotifierDialog.
  */
public class NotifierDialog extends Dialog implements TransactionClientListener/*, TransactionServerListener*/
{  
   /** String "active" */
   protected static final String ACTIVE="active";
   /** String "pending" */
   protected static final String PENDING="pending";
   /** String "terminated" */
   protected static final String TERMINATED="terminated";

   /** The SubscriberDialog listener */
   NotifierDialogListener listener;

   /** The current subscribe method */
   Message subscribe_req;

   /** The current subscribe transaction */
   TransactionServer subscribe_transaction;

   /** The current notify transaction */
   TransactionClient notify_transaction;

   /** The event name */
   String event;         

   /** The subscription id */
   String id;

   /** Internal state D_INIT (the starting point) */
   protected static final int D_INIT=0;   
   /** Internal state D_WAITING (listening for the first subscription request) */
   protected static final int D_WAITING=1;   
   /** Internal state D_SUBSCRIBED (first subscription request arrived) */
   protected static final int D_SUBSCRIBED=2;   
   /** Internal state D_PENDING (first subscription request has been accepted) */
   protected static final int D_PENDING=3;
   /** Internal state D_ACTIVE (subscription has been activated) */
   protected static final int D_ACTIVE=4;   
   /** Internal state D_TERMINATED (first subscription request has been refused or subscription has been terminated) */
   protected static final int D_TERMINATED=9;

      
   // ************************* Protected methods ************************

   /** Gets the dialog state */
   protected String getStatus()
   {  switch (status)
      {  case D_INIT       : return "D_INIT";
         case D_WAITING    : return "D_WAITING";   
         case D_SUBSCRIBED : return "D_SUBSCRIBED";
         case D_PENDING    : return "D_PENDING";
         case D_ACTIVE     : return "D_ACTIVE";
         case D_TERMINATED : return "D_TERMINATED";   
         default : return null;
      }  
   }

   // ************************** Public methods **************************

   /** Whether the dialog is in "early" state. */
   public boolean isEarly()
   {  return (status<D_PENDING);
   }

   /** Whether the dialog is in "confirmed" state. */
   public boolean isConfirmed()
   {  return (status>=D_PENDING && status<D_TERMINATED);
   }

   /** Whether the dialog is in "active" state. */
   public boolean isTerminated()
   {  return (status==D_TERMINATED);
   }

   /** Whether the subscription is "pending". */
   public boolean isSubscriptionPending()
   {  return (status>=D_SUBSCRIBED && status<D_ACTIVE);
   }

   /** Whether the subscription is "active". */
   public boolean isSubscriptionActive()
   {  return (status==D_ACTIVE);
   }

   /** Whether the subscription is "terminated". */
   public boolean isSubscriptionTerminated()
   {  return (status==D_TERMINATED);
   }

   /** Gets event type. */   
   public String getEvent()
   {  return event;
   }

   /** Gets the event "id" parameter. */   
   public String getId()
   {  return id;
   }


   // **************************** Costructors ****************************

   /** Creates a new NotifierDialog. */
   public NotifierDialog(SipProvider sip_provider, NotifierDialogListener listener)
   {  super(sip_provider);
      init(listener);
   }

   /** Creates a new NotifierDialog for the already received SUBSCRIBE request <i>subscribe</i>. */
   public NotifierDialog(SipProvider sip_provider, Message subscribe, NotifierDialogListener listener)
   {  super(sip_provider);
      init(listener);
      
      changeStatus(D_SUBSCRIBED);
      subscribe_req=subscribe;
      subscribe_transaction=new TransactionServer(sip_provider,subscribe,null);
      update(Dialog.UAS,subscribe);
      EventHeader eh=subscribe.getEventHeader();
      if (eh!=null)
      {  event=eh.getEvent();
         id=eh.getId();
      }
   }
   
   /** Inits the NotifierDialog. */
   private void init(NotifierDialogListener listener)
   {  this.listener=listener;
      this.subscribe_transaction=null;
      this.notify_transaction=null;
      this.subscribe_req=null;
      this.event=null;
      this.id=null;
      changeStatus(D_INIT);
   }


   // *************************** Public methods **************************

   /** Listen for the first subscription request. */
   public void listen()
   {  printLog("inside method listen()",LogLevel.MEDIUM);
      if (!statusIs(D_INIT))
      {  printLog("first subscription already received",LogLevel.MEDIUM);
         return;
      }
      // else
      changeStatus(D_WAITING);
      // listen for the first SUBSCRIBE request
      sip_provider.addSipProviderListener(new MethodIdentifier(SipMethods.SUBSCRIBE),this);
   }  

   /** Accepts the subscription request (sends a "202 Accepted" response). */
   public void accept(int expires, String contact)
   {  printLog("inside accept()",LogLevel.MEDIUM);
      respond(202,SipResponses.reasonOf(202),expires,contact,null,null);      
   }

   /** Refuses the subscription request. */
   public void refuse()
   {  printLog("inside refuse()",LogLevel.MEDIUM);
      respond(403,SipResponses.reasonOf(403),-1,null,null,null);      
   }  

   /** Responds with <i>code</i> and <i>reason</i>.
     * This method can be called when the InviteDialog is in D_INVITED, D_ReINVITED states */
   public void respond(int code, String reason, int expires, String contact, String content_type, String body)
   {  printLog("inside respond("+code+","+reason+")",LogLevel.MEDIUM);
      NameAddress contact_url=null;
      if (contact!=null) contact_url=new NameAddress(contact);
      Message resp=MessageFactory.createResponse(subscribe_req,code,SipResponses.reasonOf(code),contact_url);
      if (expires>=0) resp.setExpiresHeader(new ExpiresHeader(expires));
      if (body!=null) resp.setBody(content_type,body); 
      respond(resp);      
   }

   /** Responds with <i>resp</i>. */
   public void respond(Message resp)
   {  printLog("inside respond(resp)",LogLevel.MEDIUM);      
      if (resp.getStatusLine().getCode()>=200) update(UAS,resp);
      subscribe_transaction.respondWith(resp);   
   } 
  
   /** Activates the subscription (subscription goes into 'active' state). */
   public void activate()
   {  activate(SipStack.default_expires);
   }

   /** Activates the subscription (subscription goes into 'active' state). */
   public void activate(int expires)
   {  notify(ACTIVE,expires,null,null);
   }

   /** Makes the subscription pending (subscription goes into 'pending' state). */
   public void pending()
   {  pending(SipStack.default_expires);
   }

   /** Makes the subscription pending (subscription goes into 'pending' state). */
   public void pending(int expires)
   {  notify(PENDING,expires,null,null);
   }

   /** Terminates the subscription (subscription goes into 'terminated' state). */
   public void terminate()
   {  terminate(null);
   }

   /** Terminates the subscription (subscription goes into 'terminated' state). */
   public void terminate(String reason)
   {  Message req=MessageFactory.createNotifyRequest(this,event,id,null,null);
      SubscriptionStateHeader sh=new SubscriptionStateHeader(TERMINATED);
      if (reason!=null) sh.setReason(reason);
      //sh.setExpires(0);
      req.setSubscriptionStateHeader(sh);
      notify(req);
   }

   /** Sends a NOTIFY. */
   public void notify(String state, int expires, String content_type, String body)
   {  Message req=MessageFactory.createNotifyRequest(this,event,id,content_type,body);
      if (state!=null)
      {  SubscriptionStateHeader sh=new SubscriptionStateHeader(state);
         if (expires>=0) sh.setExpires(expires);
         req.setSubscriptionStateHeader(sh);
      }
      notify(req);
   }  

   /** Sends a NOTIFY. */
   public void notify(Message req)
   {  String subscription_state=req.getSubscriptionStateHeader().getState();
      if (subscription_state.equalsIgnoreCase(ACTIVE) && (statusIs(D_SUBSCRIBED) || statusIs(D_PENDING))) changeStatus(D_ACTIVE);
      else
      if (subscription_state.equalsIgnoreCase(PENDING) && statusIs(D_SUBSCRIBED)) changeStatus(D_PENDING);
      else
      if (subscription_state.equalsIgnoreCase(TERMINATED) && !statusIs(D_TERMINATED)) changeStatus(D_TERMINATED);

      TransactionClient notify_transaction=new TransactionClient(sip_provider,req,this);
      notify_transaction.request();
   }


   // ************** Inherited from TransactionClientListener **************
  
   /** When the TransactionClient is (or goes) in "Proceeding" state and receives a new 1xx provisional response */
   public void onTransProvisionalResponse(TransactionClient tc, Message resp)
   {  printLog("onTransProvisionalResponse()",LogLevel.MEDIUM);
      // do nothing.
   }
   
   /** When the TransactionClient goes into the "Completed" state receiving a 2xx response */
   public void onTransSuccessResponse(TransactionClient tc, Message resp)
   {  printLog("onTransSuccessResponse()",LogLevel.MEDIUM);
         StatusLine status_line=resp.getStatusLine();
      if (listener!=null) listener.onDlgNotificationSuccess(this,status_line.getCode(),status_line.getReason(),resp);
   }

   /** When the TransactionClient goes into the "Completed" state receiving a 300-699 response */
   public void onTransFailureResponse(TransactionClient tc, Message resp)
   {  printLog("onTransFailureResponse()",LogLevel.MEDIUM);
      StatusLine status_line=resp.getStatusLine();
      if (listener!=null) listener.onDlgNotificationFailure(this,status_line.getCode(),status_line.getReason(),resp);
   }
   
   /** When the TransactionClient goes into the "Terminated" state, caused by transaction timeout */
   public void onTransTimeout(TransactionClient tc)
   {  printLog("onTransTimeout()",LogLevel.MEDIUM);
      if (!statusIs(D_TERMINATED))
      {  changeStatus(D_TERMINATED);
         if (listener!=null) listener.onDlgNotifyTimeout(this);
      }
   }


   // ************** Inherited from SipProviderListener **************

   /** When a new Message is received by the SipProvider. */
   public void onReceivedMessage(SipProvider provider, Message msg)
   {  printLog("onReceivedMessage()",LogLevel.MEDIUM);
      if (statusIs(D_TERMINATED))
      {  printLog("subscription already terminated: message discarded",LogLevel.MEDIUM);
         return;
      }
      // else
      if(msg.isRequest() && msg.isSubscribe())
      {  if (statusIs(this.D_WAITING))
         {  // the first SUBSCRIBE request
            changeStatus(D_SUBSCRIBED);
            sip_provider.removeSipProviderListener(new MethodIdentifier(SipMethods.SUBSCRIBE));
         }
         subscribe_req=msg;
         NameAddress target=msg.getToHeader().getNameAddress();
         NameAddress subscriber=msg.getFromHeader().getNameAddress();
         EventHeader eh=msg.getEventHeader();
         if (eh!=null)
         {  event=eh.getEvent();
            id=eh.getId();
         }
         update(UAS,msg);
         subscribe_transaction=new TransactionServer(sip_provider,msg,null);
         if (listener!=null) listener.onDlgSubscribe(this,target,subscriber,event,id,msg);
      }
      else
      {  printLog("message is not a SUBSCRIBE: message discarded",LogLevel.HIGH);
      }
   }


   //**************************** Logs ****************************/

   /** Adds a new string to the default Log */
   protected void printLog(String str, int level)
   {  if (log!=null) log.println("NotifierDialog#"+dialog_sqn+": "+str,level+SipStack.LOG_LEVEL_DIALOG);  
   }

}

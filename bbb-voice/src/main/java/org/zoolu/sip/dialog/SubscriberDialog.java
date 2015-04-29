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
import org.zoolu.sip.provider.*;
import org.zoolu.tools.LogLevel;

import java.util.Date;


/** SubscriberDialog.
  */
public class SubscriberDialog extends Dialog implements TransactionClientListener
{  
   /** String "active" */
   protected static final String ACTIVE="active";
   /** String "pending" */
   protected static final String PENDING="pending";
   /** String "terminated" */
   protected static final String TERMINATED="terminated";

   /** The current subscribe method */
   //Message subscribe=null;

   /** The subscribe transaction */
   TransactionClient subscribe_transaction;

   /** The notify transaction */
   //TransactionServer notify_transaction=null;

   /** The SubscriberDialog listener */
   SubscriberDialogListener listener;
   
   /** The event package name */
   String event;
   
   /** The subscription id */
   String id;

   /** Internal state D_INIT */
   protected static final int D_INIT=0;   
   /** Internal state D_SUBSCRIBING */
   protected static final int D_SUBSCRIBING=1;   
   /** Internal state D_SUBSCRIBED */
   protected static final int D_ACCEPTED=2;   
   /** Internal state D_PENDING */
   protected static final int D_PENDING=3;
   /** Internal state D_ACTIVE */
   protected static final int D_ACTIVE=4;   
   /** Internal state D_TERMINATED */
   protected static final int D_TERMINATED=9;

   /** Gets the dialog state */
   protected String getStatus()
   {  switch (status)
      {  case D_INIT       : return "D_INIT";
         case D_SUBSCRIBING: return "D_SUBSCRIBING";   
         case D_ACCEPTED   : return "D_ACCEPTED";
         case D_PENDING    : return "D_PENDING";
         case D_ACTIVE     : return "D_ACTIVE";
         case D_TERMINATED : return "D_TERMINATED";   
         default : return null;
      }
   }


   // *************************** Public methods **************************


   /** Whether the dialog is in "early" state. */
   public boolean isEarly()
   {  return (status<D_ACCEPTED);
   }

   /** Whether the dialog is in "confirmed" state. */
   public boolean isConfirmed()
   {  return (status>=D_ACCEPTED && status<D_TERMINATED);
   }

   /** Whether the dialog is in "active" state. */
   public boolean isTerminated()
   {  return (status==D_TERMINATED);
   }

   /** Whether the subscription is "pending". */
   public boolean isSubscriptionPending()
   {  return (status>=D_ACCEPTED && status<D_ACTIVE);
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

   /** Creates a new SubscriberDialog. */
   public SubscriberDialog(SipProvider sip_provider, /*String subscriber, String contact, */String event, String id, SubscriberDialogListener listener)
   {  super(sip_provider);
      this.listener=listener;
      this.subscribe_transaction=null;
      //this.from_url=new NameAddress(subscriber);
      //if (contact!=null) this.contact_url=new NameAddress(contact);
      //else this.contact_url=from_url;
      this.event=event;
      this.id=null;
      changeStatus(D_INIT);
   }


   // *************************** Public methods **************************

   /** Sends a new SUBSCRIBE request (starts a new subscription).
     * It also initializes the dialog state information.
     * @param target the target url (and display name)
     * @param subscriber the subscriber url (and display name)
     * @param contact the contact url OR the contact user-name
     */
   public void subscribe(String target, String subscriber, String contact, int expires)
   {  printLog("inside subscribe(target="+target+",subscriber="+subscriber+",contact="+contact+",id="+id+",expires="+expires+")",LogLevel.MEDIUM);
      SipURL request_uri=new SipURL(target);
      NameAddress to_url=new NameAddress(target);
      NameAddress from_url=new NameAddress(subscriber);
      NameAddress contact_url;
      if (contact!=null) contact_url=new NameAddress(contact); else contact_url=from_url;
      String content_type=null;
      String body=null;
      Message req=MessageFactory.createSubscribeRequest(sip_provider,request_uri,to_url,from_url,contact_url,event,id,content_type,body);
      req.setHeader(new AcceptHeader("application/pidf+xml"));
      req.setExpiresHeader(new ExpiresHeader(expires));
      subscribe(req);
   }

   /** Sends a new SUBSCRIBE request (starts a new subscription).
     * It also initializes the dialog state information.
     * @param req the SUBSCRIBE message
     */
   public void subscribe(Message req)
   {  printLog("inside subscribe(req)",LogLevel.MEDIUM);
      if (statusIs(D_TERMINATED))
      {  printLog("subscription already terminated: request aborted",LogLevel.MEDIUM);
         return;
      }
      // else
      if(statusIs(D_INIT))
      {  changeStatus(D_SUBSCRIBING);
      }
      update(UAC,req);
      // start client transaction
      subscribe_transaction=new TransactionClient(sip_provider,req,this);      
      subscribe_transaction.request();
   }


   /** Sends a new SUBSCRIBE request (starts a new subscription). */
   public void reSubscribe(String target, String subscriber, String contact, int expires)
   {  subscribe(target,subscriber,contact,expires);
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
      if(!statusIs(D_ACTIVE))
      {  changeStatus(D_ACCEPTED);
         update(UAC,resp);
         StatusLine status_line=resp.getStatusLine();
         if (listener!=null) listener.onDlgSubscriptionSuccess(this,status_line.getCode(),status_line.getReason(),resp);
      }
      else
      if(statusIs(D_ACTIVE))
      {  StatusLine status_line=resp.getStatusLine();
         if (listener!=null) listener.onDlgSubscriptionSuccess(this,status_line.getCode(),status_line.getReason(),resp);
      }
   }

   /** When the TransactionClient goes into the "Completed" state receiving a 300-699 response */
   public void onTransFailureResponse(TransactionClient tc, Message resp)
   {  printLog("onTransFailureResponse()",LogLevel.MEDIUM);
      changeStatus(D_TERMINATED);
      StatusLine status_line=resp.getStatusLine();
      if (listener!=null) listener.onDlgSubscriptionFailure(this,status_line.getCode(),status_line.getReason(),resp);
   }

   /** When the TransactionClient goes into the "Terminated" state, caused by transaction timeout */
   public void onTransTimeout(TransactionClient tc)
   {  printLog("onTransTimeout()",LogLevel.MEDIUM);
      changeStatus(D_TERMINATED);
      if (listener!=null) listener.onDlgSubscribeTimeout(this);
   }


   // ***************** Inherited from SipProviderListener *****************
   
   /** When a new Message is received by the SipProvider. */
   public void onReceivedMessage(SipProvider sip_provider, Message msg)
   {  printLog("onReceivedMessage()",LogLevel.MEDIUM);
      if (statusIs(D_TERMINATED))
      {  printLog("subscription already terminated: message discarded",LogLevel.MEDIUM);
         return;
      }
      // else
      if (msg.isRequest() && msg.isNotify())
      {  
         TransactionServer ts=new TransactionServer(sip_provider,msg,null);
         ts.respondWith(MessageFactory.createResponse(msg,200,SipResponses.reasonOf(200),null));

         NameAddress to=msg.getToHeader().getNameAddress();
         NameAddress from=msg.getFromHeader().getNameAddress();
         NameAddress contact=null;
         if (msg.hasContactHeader()) contact=msg.getContactHeader().getNameAddress();
         String state=null;
         if (msg.hasSubscriptionStateHeader()) state=msg.getSubscriptionStateHeader().getState();
         String content_type=null;
         if (msg.hasContentTypeHeader()) content_type=msg.getContentTypeHeader().getContentType();
         String body=null;
         if (msg.hasBody()) body=msg.getBody();

         if (listener!=null) listener.onDlgNotify(this,to,from,contact,state,content_type,body,msg);

         if (state!=null)
         {  if (state.equalsIgnoreCase(ACTIVE) && !statusIs(D_TERMINATED))
            {  changeStatus(D_ACTIVE);
            }
            else
            if (state.equalsIgnoreCase(PENDING) && statusIs(D_ACCEPTED))
            {  changeStatus(D_PENDING);
            }
            else
            if (state.equalsIgnoreCase(TERMINATED) && !statusIs(D_TERMINATED))
            {  changeStatus(D_TERMINATED);
               if (listener!=null) listener.onDlgSubscriptionTerminated(this);
            }
         }
      }
      else
      {  printLog("message is not a NOTIFY: message discarded",LogLevel.HIGH);
      }
   }
   
   
   //**************************** Logs ****************************/

   /** Adds a new string to the default Log */
   protected void printLog(String str, int level)
   {  if (log!=null) log.println("SubscriberDialog#"+dialog_sqn+": "+str,level+SipStack.LOG_LEVEL_DIALOG);  
   }

}

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

package org.zoolu.sip.transaction;


import org.zoolu.tools.Timer;
import org.zoolu.tools.TimerListener;
import org.zoolu.sip.address.SipURL;
import org.zoolu.sip.provider.*;
import org.zoolu.sip.message.*;
import org.zoolu.tools.LogLevel;


/** Generic server transaction as defined in RFC 3261 (Section 17.2.2).
  * A TransactionServer is responsable to create a new SIP transaction that starts with a request message received by the SipProvider and ends sending a final response.<BR>
  * The changes of the internal status and the received messages are fired to the TransactionListener passed to the TransactionServer object.<BR>
  * When costructing a new TransactionServer, the transaction type is passed as String parameter to the costructor (e.g. "CANCEL", "BYE", etc..)
  */
 
public class TransactionServer extends Transaction
{  
   /** the TransactionServerListener that captures the events fired by the TransactionServer */
   TransactionServerListener transaction_listener;

   /** last response message */
   Message response;
   
   /** clearing timeout ("Timer J" in RFC 3261) */
   Timer clearing_to;


   /** Costructs a new TransactionServer. */
   protected TransactionServer(SipProvider sip_provider)
   {  super(sip_provider);
      transaction_listener=null;
      response=null;
   } 
   
   /** Creates a new TransactionServer of type <i>method</i>. */
   public TransactionServer(SipProvider sip_provider, String method, TransactionServerListener listener)
   {  super(sip_provider);
      init(listener,new TransactionIdentifier(method),null);
   }  

   /** Creates a new TransactionServer for the already received request <i>req</i>. */
   public TransactionServer(SipProvider provider, Message req, TransactionServerListener listener)
   {  super(provider);
      request=new Message(req);
      init(listener,request.getTransactionId(),request.getConnectionId());
      
      printLog("start",LogLevel.LOW);
      changeStatus(STATE_TRYING);
      sip_provider.addSipProviderListener(transaction_id,this); 
   }  

   /** Initializes timeouts and listener. */
   void init(TransactionServerListener listener, TransactionIdentifier transaction_id, ConnectionIdentifier connaction_id)
   {  this.transaction_listener=listener;
      this.transaction_id=transaction_id;
      this.connection_id=connection_id;
      this.response=null;
      clearing_to=new Timer(SipStack.transaction_timeout,"Clearing",this);
      printLog("id: "+String.valueOf(transaction_id),LogLevel.HIGH);
      printLog("created",LogLevel.HIGH);
   }  

   /** Starts the TransactionServer. */
   public void listen()
   {  if (statusIs(STATE_IDLE))
      {  printLog("start",LogLevel.LOW);
         changeStatus(STATE_WAITING);  
         sip_provider.addSipProviderListener(transaction_id,this); 
      }
   }  

   /** Sends a response message */
   public void respondWith(Message resp)
   {  response=resp;
      if (statusIs(STATE_TRYING) || statusIs(STATE_PROCEEDING))
      {  sip_provider.sendMessage(response,connection_id);
         int code=response.getStatusLine().getCode();
         if (code>=100 && code<200 && statusIs(STATE_TRYING))
         {  changeStatus(STATE_PROCEEDING);
         }
         if (code>=200 && code<700)
         {  changeStatus(STATE_COMPLETED);
            if (connection_id==null) clearing_to.start();
            else
            {  printLog("clearing_to=0 for reliable transport",LogLevel.LOW);
               onTimeout(clearing_to);
            }
         }
      }
   }  

   /** Method derived from interface SipListener.
     * It's fired from the SipProvider when a new message is received for to the present TransactionServer. */
   public void onReceivedMessage(SipProvider provider, Message msg)
   {  if (msg.isRequest())
      {  if (statusIs(STATE_WAITING))
         {  request=new Message(msg);
            connection_id=msg.getConnectionId();
            sip_provider.removeSipProviderListener(transaction_id);
            transaction_id=request.getTransactionId();
            sip_provider.addSipProviderListener(transaction_id,this); 
            changeStatus(STATE_TRYING);
            if (transaction_listener!=null) transaction_listener.onTransRequest(this,msg);
            return;
         }
         if (statusIs(STATE_PROCEEDING) || statusIs(STATE_COMPLETED))
         {  // retransmission of the last response
            printLog("response retransmission",LogLevel.LOW);
            sip_provider.sendMessage(response,connection_id);
            return;
         }
      }
   }

   /** Method derived from interface TimerListener.
     * It's fired from an active Timer. */
   public void onTimeout(Timer to)
   {  try
      {  if (to.equals(clearing_to))
         {  printLog("Clearing timeout expired",LogLevel.HIGH);
            sip_provider.removeSipProviderListener(transaction_id);
            changeStatus(STATE_TERMINATED);
            transaction_listener=null;
            //clearing_to=null;
         }
      }
      catch (Exception e)
      {  printException(e,LogLevel.HIGH);
      }
   }   

   /** Terminates the transaction. */
   public void terminate()
   {  if (!statusIs(STATE_TERMINATED))
      {  clearing_to.halt();
         sip_provider.removeSipProviderListener(transaction_id);
         changeStatus(STATE_TERMINATED);
         transaction_listener=null;
         //clearing_to=null;
      }
   }


   //**************************** Logs ****************************/

   /** Adds a new string to the default Log */
   protected void printLog(String str, int level)
   {  if (log!=null) log.println("TransactionServer#"+transaction_sqn+": "+str,level+SipStack.LOG_LEVEL_TRANSACTION);  
   }

}


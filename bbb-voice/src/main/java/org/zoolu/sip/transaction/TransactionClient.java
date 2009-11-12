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


import org.zoolu.sip.address.SipURL;
import org.zoolu.sip.provider.*;
import org.zoolu.sip.message.*;
import org.zoolu.tools.Timer;
import org.zoolu.tools.TimerListener;
import org.zoolu.tools.LogLevel;


/** Generic client transaction as defined in RFC 3261 (Section 17.1.2).
 *  A TransactionClient is responsable to create a new SIP transaction, starting with a request message sent through the SipProvider and ending with a final response.<BR>
 *  The changes of the internal status and the received messages are fired to the TransactionListener passed to the TransactionClient object.<BR>
 */

public class TransactionClient extends Transaction
{
   /** the TransactionClientListener that captures the events fired by the TransactionClient */
   TransactionClientListener transaction_listener;

   /** retransmission timeout ("Timer E" in RFC 3261) */
   Timer retransmission_to;
   /** transaction timeout ("Timer F" in RFC 3261) */
   Timer transaction_to;
   /** clearing timeout ("Timer K" in RFC 3261)*/
   Timer clearing_to;


   /** Costructs a new TransactionClient. */
   protected TransactionClient(SipProvider sip_provider)
   {  super(sip_provider);
      transaction_listener=null;
   }

   /** Creates a new TransactionClient */
   public TransactionClient(SipProvider sip_provider, Message req, TransactionClientListener listener)
   {  super(sip_provider);
      request=new Message(req);
      init(listener,request.getTransactionId());
   }

   /** Initializes timeouts and listener. */
   void init(TransactionClientListener listener, TransactionIdentifier transaction_id)
   {  this.transaction_listener=listener;
      this.transaction_id=transaction_id;
      retransmission_to=new Timer(SipStack.retransmission_timeout,"Retransmission",this);
      transaction_to=new Timer(SipStack.transaction_timeout,"Transaction",this);
      clearing_to=new Timer(SipStack.clearing_timeout,"Clearing",this);
      printLog("id: "+String.valueOf(transaction_id),LogLevel.HIGH);
      printLog("created",LogLevel.HIGH);
   }

   /** Starts the TransactionClient and sends the transaction request. */
   public void request()
   {  printLog("start",LogLevel.LOW);
      changeStatus(STATE_TRYING);
      retransmission_to.start();
      transaction_to.start();

      sip_provider.addSipProviderListener(transaction_id,this);
      connection_id=sip_provider.sendMessage(request);
   }

   /** Method derived from interface SipListener.
     * It's fired from the SipProvider when a new message is received for to the present TransactionClient. */
   public void onReceivedMessage(SipProvider provider, Message msg)
   {  if (msg.isResponse())
      {  int code=msg.getStatusLine().getCode();
         if (code>=100 && code<200 && (statusIs(STATE_TRYING) || statusIs(STATE_PROCEEDING)))
         {  if (statusIs(STATE_TRYING)) changeStatus(STATE_PROCEEDING);
            if (transaction_listener!=null) transaction_listener.onTransProvisionalResponse(this,msg);
            return;
         }
         if (code>=200 && code<700 && (statusIs(STATE_TRYING) || statusIs(STATE_PROCEEDING)))
         {  retransmission_to.halt();
            transaction_to.halt();
            changeStatus(STATE_COMPLETED);
            if (code<300)
            {  if (transaction_listener!=null) transaction_listener.onTransSuccessResponse(this,msg);
            }
            else
            {
				if (transaction_listener!=null)  {
            		transaction_listener.onTransFailureResponse(this,msg);
				}
            }
            transaction_listener=null;
            if (connection_id==null) clearing_to.start();
            else
            {  printLog("clearing_to=0 for reliable transport",LogLevel.LOW);
               onTimeout(clearing_to);
            }
            return;
         }
      }
   }

   /** Method derived from interface TimerListener.
     * It's fired from an active Timer. */
   public void onTimeout(Timer to)
   {  try
      {  if (to.equals(retransmission_to) && (statusIs(STATE_TRYING) || statusIs(STATE_PROCEEDING)))
         {  printLog("Retransmission timeout expired",LogLevel.HIGH);
            // retransmission only for unreliable transport
            if (connection_id==null)
            {  sip_provider.sendMessage(request);
               long timeout=2*retransmission_to.getTime();
               if (timeout>SipStack.max_retransmission_timeout || statusIs(STATE_PROCEEDING)) timeout=SipStack.max_retransmission_timeout;
               retransmission_to=new Timer(timeout,retransmission_to.getLabel(),this);
               retransmission_to.start();
            }
            else printLog("No retransmissions for reliable transport ("+connection_id+")",LogLevel.LOW);
         }
         if (to.equals(transaction_to))
         {  printLog("Transaction timeout expired",LogLevel.HIGH);
            retransmission_to.halt();
            clearing_to.halt();
            sip_provider.removeSipProviderListener(transaction_id);
            changeStatus(STATE_TERMINATED);
            if (transaction_listener!=null) transaction_listener.onTransTimeout(this);
            transaction_listener=null;
         }
         if (to.equals(clearing_to))
         {  printLog("Clearing timeout expired",LogLevel.HIGH);
            retransmission_to.halt();
            transaction_to.halt();
            sip_provider.removeSipProviderListener(transaction_id);
            changeStatus(STATE_TERMINATED);
         }
      }
      catch (Exception e)
      {  printException(e,LogLevel.HIGH);
      }
   }

   /** Terminates the transaction. */
   public void terminate()
   {  if (!statusIs(STATE_TERMINATED))
      {  retransmission_to.halt();
         transaction_to.halt();
         clearing_to.halt();
         sip_provider.removeSipProviderListener(transaction_id);
         changeStatus(STATE_TERMINATED);
         transaction_listener=null;
      }
   }


   //**************************** Logs ****************************/

   /** Adds a new string to the default Log */
   protected void printLog(String str, int level)
   {  if (log!=null) log.println("TransactionClient#"+transaction_sqn+": "+str,level+SipStack.LOG_LEVEL_TRANSACTION);
   }

}

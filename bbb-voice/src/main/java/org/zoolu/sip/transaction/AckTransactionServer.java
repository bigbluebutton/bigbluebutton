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


/** ACK server transaction should follow an INVITE server transaction within an INVITE Dialog in a SIP UAC.
  * The AckTransactionServer sends the final response message and retransmits it
  * several times until the method terminate() is called or the trasaction timeout fires.
  */ 
public class AckTransactionServer extends Transaction
{  
   /** the TransactionServerListener that captures the events fired by the AckTransactionServer */
   AckTransactionServerListener transaction_listener;

   /** last response message */
   Message response;
   
   /** retransmission timeout */
   Timer retransmission_to;
   /** transaction timeout */
   Timer transaction_to;


   /** Initializes timeouts and state */
   /** Creates a new AckTransactionServer.
     * The AckTransactionServer starts sending a the <i>resp</i> message.
     * It retransmits the resp several times if no ACK request is received. */
   public AckTransactionServer(SipProvider sip_provider, Message resp, AckTransactionServerListener listener)
   {  super(sip_provider);
      response=resp;
      init(listener,new TransactionIdentifier(SipMethods.ACK),null);
   }  

   /** Creates a new AckTransactionServer.
     * The AckTransactionServer starts sending the response message <i>resp</i>
     * through the connection <i>conn_id</i>. */
   public AckTransactionServer(SipProvider sip_provider, ConnectionIdentifier connection_id, Message resp, AckTransactionServerListener listener)
   {  super(sip_provider);
      response=resp;
      init(listener,new TransactionIdentifier(SipMethods.ACK),connection_id);
   }  

   /** Initializes timeouts and listener. */
   void init(AckTransactionServerListener listener, TransactionIdentifier transaction_id, ConnectionIdentifier connaction_id)
   {  this.transaction_listener=listener;
      this.transaction_id=transaction_id;
      this.connection_id=connection_id;
      transaction_to=new Timer(SipStack.transaction_timeout,"Transaction",this);
      retransmission_to=new Timer(SipStack.retransmission_timeout,"Retransmission",this);
      // (CHANGE-040905) now timeouts started in listen()
      //transaction_to.start();
      //if (connection_id==null) retransmission_to.start();
      printLog("id: "+String.valueOf(transaction_id),LogLevel.HIGH);
      printLog("created",LogLevel.HIGH);
   }    

   /** Starts the AckTransactionServer. */
   public void respond()
   {  printLog("start",LogLevel.LOW);
      changeStatus(STATE_PROCEEDING); 
      //transaction_id=null; // it is not required since no SipProviderListener is implemented 
      // (CHANGE-040905) now timeouts started in listen()
      transaction_to.start();
      if (connection_id==null) retransmission_to.start();

      sip_provider.sendMessage(response,connection_id); 
   }  


   /** Method derived from interface TimerListener.
     * It's fired from an active Timer.
     */
   public void onTimeout(Timer to)
   {  try
      {  if (to.equals(retransmission_to) && statusIs(STATE_PROCEEDING))
         {  printLog("Retransmission timeout expired",LogLevel.HIGH);
            long timeout=2*retransmission_to.getTime();
            if (timeout>SipStack.max_retransmission_timeout) timeout=SipStack.max_retransmission_timeout;
            retransmission_to=new Timer(timeout,retransmission_to.getLabel(),this);
            retransmission_to.start();
            sip_provider.sendMessage(response,connection_id);
         }  
         if (to.equals(transaction_to) && statusIs(STATE_PROCEEDING))
         {  printLog("Transaction timeout expired",LogLevel.HIGH);
            changeStatus(STATE_TERMINATED);
            if (transaction_listener!=null) transaction_listener.onTransAckTimeout(this);
            // (CHANGE-040421) now it can free links to transaction_listener and timers
            transaction_listener=null;
            //retransmission_to=null;
            //transaction_to=null;
         }  
      }
      catch (Exception e)
      {  printException(e,LogLevel.HIGH);
      }
   }   

   /** Method used to drop an active transaction. */
   public void terminate()
   {  retransmission_to.halt();
      transaction_to.halt();  
      changeStatus(STATE_TERMINATED);
      //if (transaction_listener!=null) transaction_listener.onAckSrvTerminated(this);   
      // (CHANGE-040421) now it can free links to transaction_listener and timers
      transaction_listener=null;
      //retransmission_to=null;
      //transaction_to=null;
  }


   //**************************** Logs ****************************/

   /** Adds a new string to the default Log */
   protected void printLog(String str, int level)
   {  if (log!=null) log.println("AckTransactionServer#"+transaction_sqn+": "+str,level+SipStack.LOG_LEVEL_TRANSACTION);  
   }

}

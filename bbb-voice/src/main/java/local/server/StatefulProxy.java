/*
 * Copyright (C) 2005 Luca Veltri - University of Parma - Italy
 * 
 * This source code is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 * 
 * This source code is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this source code; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 * 
 * Author(s):
 * Luca Veltri (luca.veltri@unipr.it)
 */

package local.server;


import org.zoolu.sip.address.*;
import org.zoolu.sip.provider.*;
import org.zoolu.sip.header.RequestLine;
import org.zoolu.sip.header.Header;
import org.zoolu.sip.header.ViaHeader;
import org.zoolu.sip.header.MultipleHeader;
import org.zoolu.sip.header.RouteHeader;
import org.zoolu.sip.header.RecordRouteHeader;
import org.zoolu.sip.transaction.*;
import org.zoolu.sip.message.*;
import org.zoolu.tools.LogLevel;

import java.util.Vector;
import java.util.Iterator;
import java.util.HashSet;
import java.io.BufferedReader;
import java.io.InputStreamReader;


/** StatefulProxy server. 
  * Class StatefulProxy implement a stateful SIP proxy server.
  * It extends class Registrar. A StatefulProxy can work as simply SIP proxy,
  * or it can handle calls for registered users. 
  */
public class StatefulProxy extends Proxy implements TransactionClientListener
{
   /** Transactions state */
   protected StatefulProxyState state=null;
   
   /** end timeout server transactions ("Timer C" in RFC 3261) */
   //Timer end_to;
   
   /** SipProvider for client transactions */
   protected SipProvider sip_provider_client;   

   /** SipProvider for server transactions */
   protected SipProvider sip_provider_server;   
      
   /** Costructs a void StatefulProxy */
   protected StatefulProxy() {}

   /** Inits the stateful server */
   private void init()
   {  sip_provider_client=sip_provider;
      sip_provider_server=sip_provider;
      state=new StatefulProxyState();
   }   
      
   /** Costructs a new StatefulProxy that acts also as location server for registered users. */
   /*public StatefulProxy(SipProvider provider_server, SipProvider provider_client, ServerProfile server_profile)
   {  super(provider_server,server_profile);
      sip_provider_client=provider_client;
      sip_provider_server=provider_server;
      init();
   }*/

   /** Costructs a new StatefulProxy that acts also as location server for registered users. */
   public StatefulProxy(SipProvider provider, ServerProfile server_profile)
   {  super(provider,server_profile);
      init();
   }

   /** When a new request is received for the local server */
   public void processRequestToLocalServer(Message req)
   {  printLog("inside processRequestToLocalServer(msg)",LogLevel.MEDIUM);
      super.processRequestToLocalServer(req);
   }
   
   /** When a new request message is received for a local user */
   public void processRequestToLocalUser(Message msg)
   {  printLog("inside processRequestToLocalUser(msg)",LogLevel.MEDIUM);

      if (msg.isAck())
      {  printLog("ACK received out of an active InviteServerTransaction, message forwarded",LogLevel.MEDIUM);
         // just send the ack..
         super.processRequestToLocalUser(msg);
         return; 
      }
      
      TransactionServer ts;
      if (msg.isInvite()) ts=new InviteTransactionServer(sip_provider_server,msg,null);
      else ts=new TransactionServer(sip_provider_server,msg,null);
      //ts.listen();
   
      if (server_profile.do_proxy_authentication && !msg.isAck() && !msg.isCancel())
      {  // check message authentication
         Message err_resp=as.authenticateProxyRequest(msg);  
         if (err_resp!=null)
         {  ts.respondWith(err_resp);
            return;
         }
      }

      // message targets
      Vector targets=getTargets(msg);

      if (targets.isEmpty())
      {  // try to treat the request-URI as a phone URL
         SipURL request_uri=msg.getRequestLine().getAddress();
         SipURL new_target=getPhoneTarget(request_uri);
         if (new_target!=null) targets.addElement(new_target.toString());
      }
      if (targets.isEmpty())
      {  printLog("No target found, message discarded",LogLevel.HIGH);
         if (!msg.isAck()) statefulServerResponse(ts,MessageFactory.createResponse(msg,404,SipResponses.reasonOf(404),null));
         return;
      }

      printLog("message will be forwarded to all user's contacts",LogLevel.MEDIUM); 
      for (int i=0; i<targets.size(); i++) 
      {  SipURL url=new SipURL((String)(targets.elementAt(i)));
         Message request=new Message(msg);
         request.removeRequestLine();
         request.setRequestLine(new RequestLine(msg.getRequestLine().getMethod(),url));

         updateProxingRequest(request);         

         TransactionClient tc;
         if (msg.isInvite()) tc=new InviteTransactionClient(sip_provider_client,request,this);
         else tc=new TransactionClient(sip_provider_client,request,this);
         //printLog("DEBUG: processLocalRequest()\r\n"+tc.getRequestMessage().toString(),LogLevel.LOWER);
         state.addClient(ts,tc);
      }
      HashSet clients=state.getClients(ts);
      for (Iterator i=clients.iterator(); i.hasNext(); ) ((TransactionClient)i.next()).request();

   }
   
   /** When a new request message is received for a remote UA */
   public void processRequestToRemoteUA(Message msg)
   {  printLog("inside processRequestToRemoteUA(msg)",LogLevel.MEDIUM);
      if (msg.isAck())
      {  printLog("ACK received out of an active InviteServerTransaction, message forwarded",LogLevel.MEDIUM);
         // just send the ack..
         super.processRequestToRemoteUA(msg);
         return; 
      }
      TransactionServer ts;
      if (msg.isInvite()) ts=new InviteTransactionServer(sip_provider_server,msg,null);
      else ts=new TransactionServer(sip_provider_server,msg,null);
      //ts.listen();

      if (!server_profile.is_open_proxy)
      {  // check whether the caller is a local user 
         SipURL from_url=msg.getFromHeader().getNameAddress().getAddress();
         String from_username=from_url.getUserName();
         String from_hostaddr=from_url.getHost();
         String caller=(from_username==null)? from_hostaddr : from_username+"@"+from_hostaddr;
         if (!location_service.hasUser(caller))
         {  // but do not filter messages directed to local users
            SipURL to_url=msg.getToHeader().getNameAddress().getAddress();
            String to_username=to_url.getUserName();
            String to_hostaddr=to_url.getHost();
            String callee=(to_username==null)? to_hostaddr : to_username+"@"+to_hostaddr;
            if (!location_service.hasUser(callee))
            {  // both caller and callee are not registered with the local server
               printLog("both users "+caller+" and "+callee+" are not registered with the local server: proxy denied.",LogLevel.HIGH);
               ts.respondWith(MessageFactory.createResponse(msg,503,SipResponses.reasonOf(503),null));
               return;
            }
         }
      }

      if (server_profile.do_proxy_authentication && !msg.isAck() && !msg.isCancel())
      {  // check message authentication
         Message err_resp=as.authenticateProxyRequest(msg);  
         if (err_resp!=null)
         {  ts.respondWith(err_resp);
            return;
         }
      }

      updateProxingRequest(msg);         

      TransactionClient tc;
      if (msg.isInvite()) tc=new InviteTransactionClient(sip_provider_client,msg,this);
      else tc=new TransactionClient(sip_provider_client,msg,this);
      state.addClient(ts,tc);
      tc.request(); 
   }   

   /** When a new response message is received */
   public void processResponse(Message resp)
   {  printLog("inside processResponse(msg)",LogLevel.MEDIUM);
      //printLog("Response received out of an active ClientTransaction, message discarded",LogLevel.HIGH);
      super.processResponse(resp);   
   }
 
   
   /** Sends a server final response */
   protected void statefulServerResponse(TransactionServer ts, Message resp)
   {  printLog("inside statefulServerResponse(msg)",LogLevel.MEDIUM);
      printLog("Server response: "+resp.getStatusLine().toString(),LogLevel.MEDIUM);
      ts.respondWith(resp);
   }   

   /** Process provisional response */
   protected void processProvisionalResponse(Transaction transaction, Message resp)
   {  printLog("inside processProvisionalResponse(t,resp)",LogLevel.MEDIUM);
      int code=resp.getStatusLine().getCode();
      TransactionServer ts=state.getServer(transaction);
      if (ts!=null && code!=100)
      {  updateProxingResponse(resp);
         if (resp.hasViaHeader()) ts.respondWith(resp);
      }
   }
   
   /** Process failure response */
   protected void processFailureResponse(Transaction transaction, Message resp)
   {  printLog("inside processFailureResponse(t,resp)",LogLevel.MEDIUM);
      TransactionServer ts=state.getServer(transaction);
      state.removeClient(transaction);
      if (ts==null) return;
      if (!state.hasServer(ts)) return;
      // updates the non-2xx final response
      state.setFinalResponse(ts,resp);
      // if there are no more pending clients, sends the final response
      HashSet clients=state.getClients(ts);
      if (clients.isEmpty())
      {  printLog("only this tr_client remained: send the response",LogLevel.LOW);
         resp=state.getFinalResponse(ts);
         updateProxingResponse(resp);
         if (resp.hasViaHeader()) ts.respondWith(resp);
         state.removeServer(ts);
      }
   }

   /** Process success response */
   protected void processSuccessResponse(Transaction transaction, Message resp)
   {  printLog("inside processSuccessResponse(t,resp)",LogLevel.MEDIUM);
      TransactionServer ts=state.getServer(transaction);
      state.removeClient(transaction);
      if (ts==null) return;
      updateProxingResponse(resp);
      if (resp.hasViaHeader())
      {  ts.respondWith(resp);
         if (!state.hasServer(ts)) return;
         //else
         // cancel all other pending transaction clients
         HashSet clients=state.getClients(ts);
         //printLog("Cancel pending clients..",LogLevel.LOW);
         //if (clients==null) return;
         printLog("Cancelling "+clients.size()+" pending clients",LogLevel.LOW);
         for (Iterator i=clients.iterator(); i.hasNext(); )
         {  Transaction tc=(Transaction)i.next();
            Message cancel=MessageFactory.createCancelRequest(tc.getRequestMessage());
            TransactionClient tr_cancel=new TransactionClient(sip_provider_server,cancel,null);
            tr_cancel.request();
         }
         state.removeServer(ts);
      }
   }

   
   /** Process tmeout */
   protected void processTimeout(Transaction transaction)
   {  printLog("inside processTimeout(t)",LogLevel.MEDIUM);
      TransactionServer ts=state.getServer(transaction);
      state.removeClient(transaction);
      if (ts==null) return;
      HashSet clients=(HashSet)state.getClients(ts);
      if (clients==null) return;
      if (clients.isEmpty())
      {  printLog("DEBUG: responding..",LogLevel.LOW);
         //printLog("DEBUG:\r\n"+state.getFinalResponse(ts),LogLevel.LOW);
         Message resp=state.getFinalResponse(ts);
         updateProxingResponse(resp);
         if (resp.hasViaHeader()) statefulServerResponse(ts,resp);
         state.removeServer(ts);
      }      
   }

   // ******************* TransactionClient callback methods *******************

   /** When the TransactionClient is in "Proceeding" state and receives a new 1xx response */
   public void onTransProvisionalResponse(TransactionClient transaction, Message resp)
   {  processProvisionalResponse(transaction,resp);
   }
   
   /** When the TransactionClient goes into the "Completed" state, receiving a failure response */
   public void onTransFailureResponse(TransactionClient transaction, Message resp)
   {  processFailureResponse(transaction,resp);
   }
           
   /** When an TransactionClient goes into the "Terminated" state, receiving a 2xx response */
   public void onTransSuccessResponse(TransactionClient transaction, Message resp) 
   {  processSuccessResponse(transaction,resp);
   }

   /** When the TransactionClient goes into the "Terminated" state, caused by transaction timeout */
   public void onTransTimeout(TransactionClient transaction)
   {  processTimeout(transaction);
   }



   // ****************************** Logs *****************************

   /** Adds a new string to the default Log */
   private void printLog(String str, int level)
   {  if (log!=null) log.println("StatefulProxy: "+str,level+SipStack.LOG_LEVEL_UA);  
   }


   // ****************************** MAIN *****************************

   /** The main method. */
   public static void main(String[] args)
   {  
         
      String file=null;
      boolean prompt_exit=false;
      
      for (int i=0; i<args.length; i++)
      {  if (args[i].equals("-f") && args.length>(i+1))
         {  file=args[++i];
            continue;
         }
         if (args[i].equals("--prompt"))
         {  prompt_exit=true;
            continue;
         }
         if (args[i].equals("-h"))
         {  System.out.println("usage:\n   java StatefulProxy [options] \n");
            System.out.println("   options:");
            System.out.println("   -h               this help");
            System.out.println("   -f <config_file> specifies a configuration file");
            System.out.println("   --prompt         prompt for exit");
            System.exit(0);
         }
      }
                  
      SipStack.init(file);
      SipProvider sip_provider=new SipProvider(file);
      ServerProfile server_profile=new ServerProfile(file);
      
      StatefulProxy sproxy=new StatefulProxy(sip_provider,server_profile);   
      
      // promt before exit
      if (prompt_exit) 
      try
      {  System.out.println("press 'enter' to exit");
         BufferedReader in=new BufferedReader(new InputStreamReader(System.in)); 
         in.readLine();
         System.exit(0);
      }
      catch (Exception e) {}
   }
   
}
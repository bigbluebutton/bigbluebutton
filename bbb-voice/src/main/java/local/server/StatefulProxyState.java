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


import org.zoolu.sip.provider.SipStack;
import org.zoolu.sip.provider.TransactionIdentifier;
import org.zoolu.sip.transaction.*;
import org.zoolu.sip.message.*;
import org.zoolu.tools.LogLevel;

import java.util.Iterator;
import java.util.HashSet;
import java.util.Hashtable;


/** Class StatefulProxyState allows the record and management
  * of all TransactionServer-to-TransactionClient mappings in a stateful proxy */
public class StatefulProxyState
{
   /** Table : t_client -> t_server */
   Hashtable c_server;
   /** Table : t_server -> list of t_client (HashSet) */
   Hashtable s_clients;  
   /** Table : t_server -> resp message */
   Hashtable s_response;

   
   /** Creates the StatefulProxyState */
   public StatefulProxyState()
   {  c_server=new Hashtable();
      s_clients=new Hashtable();
      s_response=new Hashtable();
   }
     
   /** Adds a new server <i>ts</i> */
   public void addServer(TransactionServer ts)
   {  //printlog("addServer(ts)",LogLevel.LOW);
      if (hasServer(ts)) return;
      TransactionIdentifier sid=ts.getTransactionId();
      s_clients.put(sid,new HashSet());
      Message request=new Message(ts.getRequestMessage());
      //printlog("creating a possible server 408 final response",LogLevel.LOW);
      Message resp=MessageFactory.createResponse(request,408,SipResponses.reasonOf(408),null);
      //printlog("DEBUG: addServer()\r\n"+resp,LogLevel.LOW);
      s_response.put(sid,resp);
   }

   /** Appends a new client to server <i>ts</i>.
     * If server <i>ts</i> is new, adds it. */
   public void addClient(TransactionServer ts, Transaction tc)
   {  //printlog("addClient(ts,tc)",LogLevel.LOW);
      c_server.put(tc.getTransactionId(),ts);
      TransactionIdentifier sid=ts.getTransactionId();
      HashSet clients=(HashSet)s_clients.get(sid);
      if (clients==null) clients=new HashSet();
      clients.add(tc);
      s_clients.put(sid,clients);
      Message request=new Message(ts.getRequestMessage());
      //printlog("creating a possible server 408 final response",LogLevel.LOW);
      Message resp=MessageFactory.createResponse(request,408,SipResponses.reasonOf(408),null);
      //printlog("DEBUG addClient():\r\n"+resp,LogLevel.LOW);
      s_response.put(sid,resp);
   }
   
   /** Removes a client. */
   public void removeClient(Transaction tc)
   {  TransactionIdentifier cid=tc.getTransactionId();
      TransactionServer ts=(TransactionServer)c_server.get(cid);
      if (ts==null) return;
      c_server.remove(cid);
      TransactionIdentifier sid=ts.getTransactionId();
      HashSet clients=(HashSet)s_clients.get(sid);
      if (clients==null) return;
      Transaction target=null;
      Transaction aux;
      for (Iterator i=clients.iterator(); i.hasNext(); )
         if ((aux=(Transaction)i.next()).getTransactionId().equals(cid)) target=aux;
      if (target!=null) clients.remove(target);
   }
   
   /** Removes all clients bound to server <i>ts</i>. */
   public void clearClients(TransactionServer ts)
   {  TransactionIdentifier sid=ts.getTransactionId();
      s_clients.remove(sid);
      s_clients.put(sid,new HashSet());
   }

   /** Whether there is a server <i>ts</i>. */
   public boolean hasServer(TransactionServer ts)
   {  TransactionIdentifier sid=ts.getTransactionId();
      return s_clients.containsKey(sid);
   }

   /** Removes server <i>ts</i>. */
   public void removeServer(TransactionServer ts)
   {  TransactionIdentifier sid=ts.getTransactionId();
      s_clients.remove(sid);
      s_response.remove(sid);
   }

   /** Gets the server bound to client <i>tc</i> */
   public TransactionServer getServer(Transaction tc)
   {  return (TransactionServer)c_server.get(tc.getTransactionId());
   }

   /** Gets all clients bound to server <i>ts</i>. */
   public HashSet getClients(TransactionServer ts)
   {  return (HashSet)s_clients.get(ts.getTransactionId());
   }
      
   /** Sets the final response for server <i>ts</i>. */
   public void setFinalResponse(TransactionServer ts, Message resp)
   {  TransactionIdentifier sid=ts.getTransactionId();
      s_response.remove(sid);
      s_response.put(sid,resp);
   }
    
   /** Gets the final response for server <i>ts</i>. */
   public Message getFinalResponse(TransactionServer ts)
   {  return (Message)s_response.get(ts.getTransactionId());
   }
   
   /** Gets the number of active servers. */
   public int numOfServers()
   {  return s_clients.size();
   }
   
   /** Gets the number of active clients. */
   public int numOfClients()
   {  return c_server.size();
   }
   
}  
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

package org.zoolu.sip.provider;


import org.zoolu.sip.message.Message;


/** SipInterface is actually the SIP SAP (Service Access Point) and can be used to send
  * and receive SIP messages associated with a specific method, transaction, or dialog.
  * <p/>
  * SipInterface provides a simple interface to the multiplexing function provided
  * by the SipProvider layer.
  * <br/> It simply wraps the SipProvider by adding and removing the listener
  * for capturing received SIP messages.
  * <p/>
  * When creating a new SipInterface the following parameters, have to be specified:
  * <b> - <i>sip_provider<i/> is the SipProvider the SipInterface has to be bound to,
  * <b> - <i>id<i/> is the SIP interface identifier the SipInterface has to be bound to,
  * <b> - <i>listener<i/> is the SipInterfaceListener that received messages are passed to.
  * <p/>
  * The SIP interface <i>id<i/> specifies the type of messages the listener is going to
  * receive for. Together with the <i>sip_provider<i/>, it represents the complete SIP
  * Service Access Point (SAP) address/identifier used for demultiplexing SIP messages
  * at receiving side. 
  * <p/>
  * The identifier can be of one of the three following types: transaction_id, dialog_id,
  * or method_id. These types of identifiers characterize respectively:
  * <br> - messages within a specific transaction,
  * <br> - messages within a specific dialog,
  * <br> - messages related to a specific SIP method.
  * It is also possible to use the the identifier ANY to specify 
  * <br> - all messages that are out of any transactions, dialogs, or already specified
  *        method types.
  * <p>
  * When receiving a message, the underling SipProvider first tries to look for
  * a SipInterface associated to the corresponding transaction, then looks for
  * a SipInterface associated to the corresponding dialog, then for
  * a SipInterface associated to the corresponding method type, and finally for
  * a SipInterface associated to ANY messages.
  * If the present SipInterface id matches, the SipInterfaceListener method
  * <i>onReceivedMessage()</i> is fired.
  */
public class SipInterface implements SipProviderListener
{

   /** SipProvider */
   SipProvider sip_provider;  

   /** Identifier */
   Identifier id;  

   /** SipInterfaceListener */
   SipInterfaceListener listener;  
   

   // *************************** Costructors ***************************

   /** Creates a new SipInterface. */ 
   public SipInterface(SipProvider sip_provider, SipInterfaceListener listener)
   {  this.sip_provider=sip_provider;
      this.listener=listener;
      id=SipProvider.ANY;
      sip_provider.addSipProviderListener(id,this);
   }


   /** Creates a new SipInterface. */ 
   public SipInterface(SipProvider sip_provider, Identifier id, SipInterfaceListener listener)
   {  this.sip_provider=sip_provider;
      this.listener=listener;
      this.id=id;
      sip_provider.addSipProviderListener(id,this);
   }


   // ************************** Public methods *************************

   /** Close the SipInterface. */ 
   public void close()
   {  sip_provider.removeSipProviderListener(id);
   }


   /** Gets the SipProvider. */ 
   public SipProvider getSipProvider()
   {  return sip_provider;
   }


   /** Sends a Message, specifing the transport portocol, nexthop address and port.
     * <p> This is a low level method and
     * forces the message to be routed to a specific nexthop address, port and transport,
     * regardless whatever the Via, Route, or request-uri, address to. 
     * <p>
     * In case of connection-oriented transport, the connection is selected as follows:
     * <br> - if an existing connection is found matching the destination
     *        end point (socket), such connection is used, otherwise
     * <br> - a new connection is established
     *
     * @return It returns a Connection in case of connection-oriented delivery
     * (e.g. TCP) or null in case of connection-less delivery (e.g. UDP)
     */
   public ConnectionIdentifier sendMessage(Message msg, String proto, String dest_addr, int dest_port, int ttl)
   {  return sip_provider.sendMessage(msg,proto,dest_addr,dest_port,ttl); 
   }

   /** Sends the message <i>msg</i>.
     * <p>
     * The destination for the request is computed as follows:
     * <br> - if <i>outbound_addr</i> is set, <i>outbound_addr</i> and 
     *        <i>outbound_port</i> are used, otherwise
     * <br> - if message has Route header with lr option parameter (i.e. RFC3261 compliant),
     *        the first Route address is used, otherwise
     * <br> - the request's Request-URI is considered.
     * <p>
     * The destination for the response is computed based on the sent-by parameter in
     *     the Via header field (RFC3261 compliant)
     * <p>
     * As transport it is used the protocol specified in the 'via' header field 
     * <p>
     * In case of connection-oriented transport:
     * <br> - if an already established connection is found matching the destination
     *        end point (socket), such connection is used, otherwise
     * <br> - a new connection is established
     *
     * @return Returns a ConnectionIdentifier in case of connection-oriented delivery
     * (e.g. TCP) or null in case of connection-less delivery (e.g. UDP)
     */
   public ConnectionIdentifier sendMessage(Message msg)
   {  return sip_provider.sendMessage(msg); 
   }


   /** Sends the message <i>msg</i> using the specified connection. */
   public ConnectionIdentifier sendMessage(Message msg, ConnectionIdentifier conn_id)
   {  return sip_provider.sendMessage(msg,conn_id);
   }


   //************************* Callback methods *************************
   
   /** When a new Message is received by the SipProvider. */
   public void onReceivedMessage(SipProvider sip_provider, Message message)
   {  if (listener!=null) listener.onReceivedMessage(this,message);
   }

}

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


import org.zoolu.net.*;
import org.zoolu.sip.message.Message;
import java.io.IOException;


/** UdpTransport provides an UDP transport service for SIP.
  */
class UdpTransport implements Transport, UdpProviderListener
{
   /** UDP protocol type */
   public static final String PROTO_UDP="udp";


   /** UDP provider */
   UdpProvider udp_provider;  

       
   /** The protocol type */ 
   String proto;

   /** Transport listener */
   TransportListener listener;   


   /** Creates a new UdpTransport */ 
   public UdpTransport(int port, TransportListener listener) throws IOException
   {  this.listener=listener;
      UdpSocket socket=new UdpSocket(port);
      udp_provider=new UdpProvider(socket,this);
   }

   /** Creates a new UdpTransport */ 
   public UdpTransport(int port, IpAddress ipaddr, TransportListener listener) throws IOException
   {  this.listener=listener;
      UdpSocket socket=new UdpSocket(port,ipaddr);
      udp_provider=new UdpProvider(socket,this);
   }

   /** Creates a new UdpTransport */ 
   public UdpTransport(UdpSocket socket, TransportListener listener)
   {  this.listener=listener;
      udp_provider=new UdpProvider(socket,this);
   }


   /** Gets protocol type */ 
   public String getProtocol()
   {  return PROTO_UDP;
   }


   /** Sends a Message to a destination address and port */
   public void sendMessage(Message msg, IpAddress dest_ipaddr, int dest_port) throws IOException
   {  if (udp_provider!=null)
      {  byte[] data=msg.toString().getBytes();
         UdpPacket packet=new UdpPacket(data,data.length);
         packet.setIpAddress(dest_ipaddr);
         packet.setPort(dest_port);
         udp_provider.send(packet);
      }
   }


   /** Stops running */
   public void halt()
   {  if (udp_provider!=null) udp_provider.halt();
   }


   /** Gets a String representation of the Object */
   public String toString()
   {  if (udp_provider!=null) return udp_provider.toString();
      else return null;
   }


   //************************* Callback methods *************************
   
   /** When a new UDP datagram is received. */
   public void onReceivedPacket(UdpProvider udp, UdpPacket packet)
   {  Message msg=new Message(packet);
      msg.setRemoteAddress(packet.getIpAddress().toString());
      msg.setRemotePort(packet.getPort());
      msg.setTransport(PROTO_UDP);
      if (listener!=null) listener.onReceivedMessage(this,msg);
   }   


   /** When DatagramService stops receiving UDP datagrams. */
   public void onServiceTerminated(UdpProvider udp, Exception error)
   {  if (listener!=null) listener.onTransportTerminated(this,error);
      UdpSocket socket=udp.getUdpSocket();
      if (socket!=null) try { socket.close(); } catch (Exception e) {}
      this.udp_provider=null;
      this.listener=null;
   }   

}

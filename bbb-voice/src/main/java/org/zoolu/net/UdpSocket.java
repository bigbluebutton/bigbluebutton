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

package org.zoolu.net;


import java.net.DatagramSocket;
import java.net.DatagramPacket;
import java.net.InetAddress;


/** UdpSocket provides a uniform interface to UDP transport protocol,
  * regardless J2SE or J2ME is used.
  */
public class UdpSocket
{

   /** DatagramSocket */
   DatagramSocket socket;

   /** Creates a new UdpSocket */ 
   public UdpSocket() throws java.net.SocketException
   {  socket=new DatagramSocket();
   }

   /** Creates a new UdpSocket */ 
   public UdpSocket(int port) throws java.net.SocketException
   {  socket=new DatagramSocket(port);
   }

   /** Creates a new UdpSocket */ 
   UdpSocket(DatagramSocket sock)
   {  socket=sock;
   }

   /** Creates a new UdpSocket */ 
   public UdpSocket(int port, IpAddress ipaddr) throws java.net.SocketException
   {  socket=new DatagramSocket(port,ipaddr.getInetAddress());
   }
   
   /** Closes this datagram socket. */
   public void close()
   {  socket.close();
   }

   /** Gets the local address to which the socket is bound. */
   public IpAddress getLocalAddress()
   {  return new IpAddress(socket.getInetAddress());
   }
   
   /** Gets the port number on the local host to which this socket is bound. */
   public int getLocalPort()
   {  return socket.getLocalPort();
   }
   
   /** Gets the socket timeout. */
   public int getSoTimeout() throws java.net.SocketException
   {  return socket.getSoTimeout();
   }
   
   /** Enables/disables socket timeout with the specified timeout, in milliseconds. */
   public void setSoTimeout(int timeout) throws java.net.SocketException
   {  socket.setSoTimeout(timeout);
   }

   /** Receives a datagram packet from this socket. */
   public void receive(UdpPacket pkt) throws java.io.IOException
   {  DatagramPacket dgram=pkt.getDatagramPacket();
      socket.receive(dgram);
      pkt.setDatagramPacket(dgram);
   }
   
   /** Sends an UDP packet from this socket. */ 
   public void send(UdpPacket pkt) throws java.io.IOException
   {  socket.send(pkt.getDatagramPacket());
   }
   
   /** Converts this object to a String. */
   public String toString()
   {  return socket.toString();
   }

}

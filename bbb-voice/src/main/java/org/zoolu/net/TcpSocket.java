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


import java.net.Socket;
//import java.net.InetAddress;
import java.io.InputStream;
import java.io.OutputStream;


/** TcpSocket provides a uniform interface to TCP transport protocol,
  * regardless J2SE or J2ME is used.
  */
public class TcpSocket
{
   /** Socket */
   Socket socket;

   /** Creates a new TcpSocket */ 
   TcpSocket()
   { socket=null;
   }

   /** Creates a new TcpSocket */ 
   TcpSocket(Socket sock)
   { socket=sock;
   }

   /** Creates a new TcpSocket */ 
   public TcpSocket(String host, int port) throws java.io.IOException
   {  socket=new Socket(host,port);
   }

   /** Creates a new TcpSocket */ 
   public TcpSocket(String host, int port, IpAddress local_ipaddr, int local_port) throws java.io.IOException
   {  socket=new Socket(host,port,local_ipaddr.getInetAddress(),local_port);
   }

   /** Creates a new UdpSocket */ 
   public TcpSocket(IpAddress ipaddr, int port) throws java.io.IOException
   {  socket=new Socket(ipaddr.getInetAddress(),port);
   }

   /** Creates a new UdpSocket */ 
   public TcpSocket(IpAddress ipaddr, int port, IpAddress local_ipaddr, int local_port) throws java.io.IOException
   {  socket=new Socket(ipaddr.getInetAddress(),port,local_ipaddr.getInetAddress(),local_port);
   }

   /** Closes this socket. */
   public void close() throws java.io.IOException
   {  socket.close();
   }
   
   /** Gets the address to which the socket is connected. */
   public IpAddress getAddress()
   {  return new IpAddress(socket.getInetAddress());
   }
   
   /** Gets an input stream for this socket. */
   public InputStream getInputStream() throws java.io.IOException
   {  return socket.getInputStream();
   }
   
   /** Gets the local address to which the socket is bound. */
   public IpAddress getLocalAddress()
   {  return new IpAddress(socket.getLocalAddress());
   }
   
   /** Gets the local port to which this socket is bound. */
   public int getLocalPort()
   {  return socket.getLocalPort();
   }
   
   /** Gets an output stream for this socket. */
   public OutputStream getOutputStream() throws java.io.IOException
   {  return socket.getOutputStream();
   }
   
   /** Gets the remote port to which this socket is connected. */
   public int getPort()
   {  return socket.getPort();
   }
   
   /** Gets the socket timeout. */
   public int getSoTimeout() throws java.net.SocketException
   {  return socket.getSoTimeout();
   }
   
   /** Enables/disables the socket timeou, in milliseconds. */
   public void setSoTimeout(int timeout)  throws java.net.SocketException
   {  socket.setSoTimeout(timeout);
   }
   
   /** Converts this object to a String. */
   public String toString()
   {  return socket.toString();
   }

}

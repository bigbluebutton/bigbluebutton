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


import java.net.DatagramPacket;
//import java.net.InetAddress;


/** UdpPacket provides a uniform interface to UDP packets,
  * regardless J2SE or J2ME is used.
  */
public class UdpPacket
{
   /** The DatagramPacket */
   DatagramPacket packet;

   
   /** Creates a new UdpPacket */ 
   UdpPacket(DatagramPacket packet)
   {  this.packet=packet;
   }
   /**Gets the DatagramPacket */ 
   DatagramPacket getDatagramPacket()
   {  return packet;
   }
   /**Sets the DatagramPacket */ 
   void setDatagramPacket(DatagramPacket packet)
   {  this.packet=packet;
   }


   /** Creates a new UdpPacket */ 
   public UdpPacket(byte[] buf, int length)
   {  packet=new DatagramPacket(buf,length);
   }

   /** Creates a new UdpPacket */ 
   public UdpPacket(byte[] buf, int length, IpAddress ipaddr, int port)
   {  packet=new DatagramPacket(buf,length,ipaddr.getInetAddress(),port);
   }

   /** Creates a new UdpPacket */ 
   public UdpPacket(byte[] buf, int offset, int length)
   {  packet=new DatagramPacket(buf,offset,length);
   }

   /** Creates a new UdpPacket */ 
   public UdpPacket(byte[] buf, int offset, int length, IpAddress ipaddr, int port)
   {  packet=new DatagramPacket(buf,offset,length,ipaddr.getInetAddress(),port);
   }

   /** Gets the IP address of the machine to which this datagram is being sent or from which the datagram was received. */
   public IpAddress getIpAddress()
   {  return new IpAddress(packet.getAddress());
   }

   /** Gets the data received or the data to be sent. */
   public byte[] getData()
   {  return packet.getData();
   }

   /** Gets the length of the data to be sent or the length of the data received. */
   public int getLength()
   {  return packet.getLength();
   }

   /** Gets the offset of the data to be sent or the offset of the data received. */
   public int getOffset()
   {  return packet.getOffset();
   }

   /** Gets the port number on the remote host to which this datagram is being sent or from which the datagram was received. */
   public int getPort()
   {  return packet.getPort();
   }

   /** Sets the IP address of the machine to which this datagram is being sent. */
   public void setIpAddress(IpAddress ipaddr)
   {  packet.setAddress(ipaddr.getInetAddress());
   }

   /** Sets the data buffer for this packet. */
   public void setData(byte[] buf)
   {  packet.setData(buf);
   }

   /** Sets the data buffer for this packet. */
   public void setData(byte[] buf, int offset, int length)
   {  packet.setData(buf,offset,length);
   }

   /** Sets the length for this packet. */
   public void setLength(int length)
   {  packet.setLength(length);
   }

   /** Sets the port number on the remote host to which this datagram is being sent. */
   public void setPort(int iport)
   {  packet.setPort(iport);
   }

}

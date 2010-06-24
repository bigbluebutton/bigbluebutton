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

package local.net;

import java.net.InetAddress;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.io.IOException;


/** RtpSocket implements a RTP socket for receiving and sending RTP packets. 
  * <p> RtpSocket is associated to a DatagramSocket that is used
  * to send and/or receive RtpPackets.
  */
public class RtpSocket
{
   /** UDP socket */
   DatagramSocket socket;
        
   /** Remote address */
   InetAddress r_addr;

   /** Remote port */
   int r_port;

   /** Creates a new RTP socket (only receiver) */ 
   public RtpSocket(DatagramSocket datagram_socket)
   {  socket=datagram_socket;
      r_addr=null;
      r_port=0;
   }

   /** Creates a new RTP socket (sender and receiver) */ 
   public RtpSocket(DatagramSocket datagram_socket, InetAddress remote_address, int remote_port)
   {  socket=datagram_socket;
      r_addr=remote_address;
      r_port=remote_port;
   }

   /** Returns the RTP DatagramSocket */ 
   public DatagramSocket getDatagramSocket()
   {  return socket;
   }

   /** Receives a RTP packet from this socket */
   public void receive(RtpPacket rtpp) throws IOException
   {  DatagramPacket datagram=new DatagramPacket(rtpp.packet,rtpp.packet.length);
      socket.receive(datagram);
      rtpp.packet_len=datagram.getLength();     
   }
   
   /** Sends a RTP packet from this socket */      
   public void send(RtpPacket rtpp) throws IOException
   {  DatagramPacket datagram=new DatagramPacket(rtpp.packet,rtpp.packet_len);
      datagram.setAddress(r_addr);
      datagram.setPort(r_port);
      socket.send(datagram);
   }

   /** Closes this socket */      
   public void close()
   {  //socket.close();
   }

}

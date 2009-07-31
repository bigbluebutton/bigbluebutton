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
import java.net.DatagramSocket; 
import java.io.IOException; 
//import org.zoolu.tools.Random;


/** This class represents a RTP flow for sending rtp packets. 
 */
public class RtpOutputFlow extends RtpFlow
{
   static final int MAX_PACKET_SIZE=1500;

   /** Buffered RTP packet */
   RtpPacket packet;

   /** Creates a new RTP input flow */ 
   public RtpOutputFlow(DatagramSocket datagram_socket, InetAddress remote_address, int remote_port)
   {  super();
      socket=new RtpSocket(datagram_socket,remote_address,remote_port);
      byte[] buff=new byte[MAX_PACKET_SIZE];
      packet=new RtpPacket(buff,0);
   }

   /** Receives a block of RTP data */ 
   public void send(byte[] data) throws IOException 
   {  packet.setSequenceNumber(packet.getSequenceNumber()+1);           
      packet.setPayload(data,data.length);
   }

}

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


import java.net.DatagramSocket;
import java.io.IOException;


/** This class represents a RTP flow for receiving rtp packets. 
 */
public class RtpInputFlow extends RtpFlow
{
   static final int MAX_PACKET_SIZE=1500;

   /** Buffered RTP packet */
   RtpPacket packet;

   /** Creates a new RTP input flow */ 
   public RtpInputFlow(DatagramSocket datagram_socket)
   {  super();
      socket=new RtpSocket(datagram_socket);
      byte[] buff=new byte[MAX_PACKET_SIZE];
      packet=new RtpPacket(buff,0);
   }

   /** Receives a block of RTP data */ 
   public byte[] receive() throws IOException 
   {  socket.receive(packet);

      padding=packet.hasPadding();
      extension=packet.hasExtension();
      csrc_count=packet.getCscrCount();
      marker=packet.hasMarker();
      payload_type=packet.getPayloadType();
      sequence_number=packet.getSequenceNumber();
      timestamp=packet.getTimestamp();
      ssrc=packet.getSscr();
      csrc_list=packet.getCscrList();
         
      initialized=true;
      
      return packet.getPayload();
   }

}

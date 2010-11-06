/** 
*
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
* 
**/

package org.bigbluebutton.voiceconf.red5.media.net;

import java.net.InetAddress;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.io.IOException;


/** RtpSocket implements a RTP socket for receiving and sending RTP packets. 
  * <p> RtpSocket is associated to a DatagramSocket that is used
  * to send and/or receive RtpPackets.
  */
public class RtpSocket {
   /** UDP socket */
   DatagramSocket socket;
        
   /** Remote address */
   InetAddress r_addr;

   /** Remote port */
   int r_port;

   /** Creates a new RTP socket (only receiver) */ 
   public RtpSocket(DatagramSocket datagram_socket) {  
	   socket=datagram_socket;
	   r_addr=null;
	   r_port=0;
   }

   /** Creates a new RTP socket (sender and receiver) */ 
   public RtpSocket(DatagramSocket datagram_socket, InetAddress remote_address, int remote_port) {  
	   socket = datagram_socket;
	   r_addr = remote_address;
	   r_port = remote_port;
   }

   /** Returns the RTP DatagramSocket */ 
   public DatagramSocket getDatagramSocket() {  
	   return socket;
   }

   /** Receives a RTP packet from this socket */
   public void receive(RtpPacket rtpp) throws IOException {  
	   DatagramPacket datagram = new DatagramPacket(rtpp.getPacket(), rtpp.getLength());
	   socket.receive(datagram);
	   rtpp.setPacketLength(datagram.getLength());     
   }
   
   /** Sends a RTP packet from this socket */      
   public void send(RtpPacket rtpp) throws IOException {  
	   DatagramPacket datagram = new DatagramPacket(rtpp.getPacket(), rtpp.getLength());
	   datagram.setAddress(r_addr);
	   datagram.setPort(r_port);
	   socket.send(datagram);
   }

   /** Closes this socket */      
   public void close() {  
	   //socket.close();
   }
}

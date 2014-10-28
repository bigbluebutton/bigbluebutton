/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/
package org.bigbluebutton.voiceconf.sip;

import org.zoolu.net.*;

/** KeepAliveUdp thread, for keeping the connection up toward a target node
  * (e.g. toward the seriving proxy/gw or a remote UA).
  * It periodically sends keep-alive tokens in order to refresh NAT UDP session timeouts.
  * <p> It can be used for both signaling (SIP) or data plane (RTP/UDP). 
  */
public class KeepAliveUdp extends Thread
{
   /** Destination socket address (e.g. the registrar server) */
   protected SocketAddress target;

   /** Time between two keep-alive tokens [millisecs] */
   protected long delta_time;

   /** UdpSocket */
   UdpSocket udp_socket;

   /** Udp packet */
   UdpPacket udp_packet=null;

   /** Expiration date [millisecs] */
   long expire=0; 

   /** Whether it is running */
   boolean stop=false;


   /** Creates a new KeepAliveUdp daemon */
   protected KeepAliveUdp(SocketAddress target, long delta_time)
   {  this.target=target;
      this.delta_time=delta_time;
   }


   /** Creates a new KeepAliveUdp daemon */
   public KeepAliveUdp(UdpSocket udp_socket, SocketAddress target, long delta_time)
   {  this.target=target;
      this.delta_time=delta_time;
      init(udp_socket,null);
      start();
   }


   /** Creates a new KeepAliveUdp daemon */
   public KeepAliveUdp(UdpSocket udp_socket, SocketAddress target, UdpPacket udp_packet, long delta_time)
   {  this.target=target;
      this.delta_time=delta_time;
      init(udp_socket,udp_packet);
      start();
   }


   /** Inits the KeepAliveUdp */
   private void init(UdpSocket udp_socket, UdpPacket udp_packet)
   {  this.udp_socket=udp_socket;
      if (udp_packet==null)
      {  byte[] buff={(byte)'\r',(byte)'\n'};
         udp_packet=new UdpPacket(buff,0,buff.length);
      }
      if (target!=null)
      {  udp_packet.setIpAddress(target.getAddress());
         udp_packet.setPort(target.getPort());
      }
      this.udp_packet=udp_packet;
   }


   /** Whether the UDP relay is running */
   public boolean isRunning()
   {  return !stop;
   }

   /** Sets the time (in milliseconds) between two keep-alive tokens */
   public void setDeltaTime(long delta_time)
   {  this.delta_time=delta_time;
   }

   /** Gets the time (in milliseconds) between two keep-alive tokens */
   public long getDeltaTime()
   {  return delta_time;
   }


   /** Sets the destination SocketAddress */
   public void setDestSoAddress(SocketAddress soaddr)
   {  target=soaddr;
      if (udp_packet!=null && target!=null)
      {  udp_packet.setIpAddress(target.getAddress());
         udp_packet.setPort(target.getPort());
      }
         
   }

   /** Gets the destination SocketAddress */
   public SocketAddress getDestSoAddress()
   {  return target;
   }


   /** Sets the expiration time (in milliseconds) */
   public void setExpirationTime(long time)
   {  if (time==0) expire=0;
      else expire=System.currentTimeMillis()+time;
   }


   /** Stops sending keep-alive tokens */
   public void halt()
   {  stop=true;
   }


   /** Sends the kepp-alive packet now. */
   public void sendToken() throws java.io.IOException
   {  // do send?
      if (!stop && target!=null && udp_socket!=null)
      {  udp_socket.send(udp_packet);
      }
   }


   /** Main thread. */
   public void run()
   {  try   
      {  while(!stop)
         {  sendToken();
            Thread.sleep(delta_time);
            if (expire>0 && System.currentTimeMillis()>expire) halt(); 
         }
      }
      catch (Exception e) { e.printStackTrace(); }
      udp_socket=null;
   }
   
       
   /** Gets a String representation of the Object */
   public String toString()
   {  String str=null;
      if (udp_socket!=null)
      {  str="udp:"+udp_socket.getLocalAddress()+":"+udp_socket.getLocalPort()+"-->"+target.toString();
      }
      return str+" ("+delta_time+"ms)"; 
   }
    
}

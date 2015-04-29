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


import org.zoolu.tools.LogLevel;

import java.net.*;
import java.io.InterruptedIOException;


/** UdpRelay implements a direct UDP datagram relay agent. 
  * It receives UDP packets at a local port and relays them toward a remote UDP socket
  * (destination address/port).
  */
public class UdpRelay extends Thread
{
   // The maximum IP packet size
   //public static final int MAX_PKT_SIZE=65536;
   public static final int MAX_PKT_SIZE=2000;

   /** Local receiver/sender port */
   int local_port;  
   /** Remote source address */
   String src_addr;
   /** Remote source port */
   int src_port;  
   /** Destination address */
   String dest_addr;
   /** Destination port */
   int dest_port;  
   /** Whether it is running */
   boolean stop;
   /** Maximum time that the UDP relay can remain active after been halted (in milliseconds) */
   int socket_to=3000; // 3sec 
   /** Maximum time that the UDP relay remains active without receiving UDP datagrams (in seconds) */
   int alive_to=60; // 1min 
   /** UdpRelay listener */
   UdpRelayListener listener;   
     
   /** Creates a new UDP relay and starts it.
     * <p> The UdpRelay remains active until method halt() is called. */
   public UdpRelay(int local_port, String dest_addr, int dest_port, UdpRelayListener listener)
   {  init(local_port,dest_addr,dest_port,0,listener);
      start();
   }

   /** Creates a new UDP relay and starts it.
     * <p> The UdpRelay will automatically stop after <i>alive_time</i> seconds
     *     of idle time (i.e. without receiving UDP datagrams) */
   public UdpRelay(int local_port, String dest_addr, int dest_port, int alive_time, UdpRelayListener listener)
   {  init(local_port,dest_addr,dest_port,alive_time,listener);
      start();
   }
    
   /** Inits a new UDP relay */
   private void init(int local_port, String dest_addr, int dest_port, int alive_time, UdpRelayListener listener)
   {  this.local_port=local_port;     
      this.dest_addr=dest_addr;
      this.dest_port=dest_port;
      this.alive_to=alive_time;
      this.listener=listener;
      src_addr="0.0.0.0";
      src_port=0;
      stop=false;
   }

   /** Gets the local receiver/sender port */
   public int getLocalPort()
   {  return local_port;
   }

   /** Gets the destination address */
   /*public String getDestAddress()
   {  return dest_addr;
   }*/

   /** Gets the destination port */
   /*public int getDestPort()
   {  return dest_port;
   }*/

   /** Sets a new destination address */
   public UdpRelay setDestAddress(String dest_addr)
   {  this.dest_addr=dest_addr;
      return this;
   }

   /** Sets a new destination port */
   public UdpRelay setDestPort(int dest_port)
   {  this.dest_port=dest_port;
      return this;
   }

   /** Whether the UDP relay is running */
   public boolean isRunning()
   {  return !stop;
   }

   /** Stops the UDP relay */
   public void halt()
   {  stop=true;
   }

   /** Sets the maximum time that the UDP relay can remain active after been halted */
   public void setSoTimeout(int so_to)
   {  socket_to=so_to;
   }

   /** Gets the maximum time that the UDP relay can remain active after been halted */
   public int getSoTimeout()
   {  return socket_to;
   }
       
   /** Redirect packets received from remote source addr/port to destination addr/port  */
   public void run()
   {  //System.out.println("DEBUG: starting UdpRelay "+toString()+" (it expires after "+alive_to+" sec)");     
      try   
      {  DatagramSocket socket=new DatagramSocket(local_port);
         byte []buf=new byte[MAX_PKT_SIZE];
                           
         socket.setSoTimeout(socket_to);
         // datagram packet
         DatagramPacket packet=new DatagramPacket(buf, buf.length);
         
         // convert alive_to in milliseconds
         long keepalive_to=((1000)*(long)alive_to)-socket_to;
         
         // end time
         long expire=System.currentTimeMillis()+keepalive_to;
         // whether reset the receiver
         //boolean reset=true;
         
         while(!stop)
         {  // non-blocking receiver
            try
            {  socket.receive(packet);           
            }
            catch (InterruptedIOException ie)
            {  // if expired, stop relaying
               if (alive_to>0 && System.currentTimeMillis()>expire) halt();
               continue;
            }
            // check whether the source address and port are changed
            if (src_port!=packet.getPort() || !src_addr.equals(packet.getAddress().getHostAddress().toString()))
            {  src_port=packet.getPort();
               src_addr=packet.getAddress().getHostAddress();
               if (listener!=null) listener.onUdpRelaySourceChanged(this,src_addr,src_port);
            }
            // relay
            packet.setAddress(InetAddress.getByName(dest_addr));
            packet.setPort(dest_port);
            socket.send(packet);
            // reset
            packet=new DatagramPacket(buf, buf.length);
            expire=System.currentTimeMillis()+keepalive_to;
         }
         socket.close();
         if (listener!=null) listener.onUdpRelayTerminated(this);
      }
      catch (Exception e) { e.printStackTrace(); } 

      //System.out.println("DEBUG: closing UdpRelay "+toString())");     
   }
   
   
      
   /** Gets a String representation of the Object */
   public String toString()
   {  return Integer.toString(local_port)+"-->"+dest_addr+":"+dest_port;
   }


   // ********************************** MAIN *********************************

   /** The main method. */
   public static void main(String[] args)
   {  
      if (args.length<3)
      {
         System.out.println("usage:\n   java UdpRelay <local_port> <address> <port> [ <alive_time> ]");
         System.exit(0);
      }
      
      int local_port=Integer.parseInt(args[0]);
      int remote_port=Integer.parseInt(args[2]);
      String remote_address=args[1];
      
      int alive_time=0;
      if (args.length>3) alive_time=Integer.parseInt(args[3]);
      
      new UdpRelay(local_port,remote_address,remote_port,alive_time,null);
   }
}
 
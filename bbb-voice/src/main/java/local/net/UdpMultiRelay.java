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


import org.zoolu.net.*;
import java.io.InterruptedIOException;
import java.util.Vector;


/** UdpMultiRelay implements an UDP multiple relay agent. 
  * It receives UDP packets at a local port and relays them
  * toward a list of remote UDP sockets (a list of address/port pairs).
  */
public class UdpMultiRelay extends Thread
{
   /** Source port */
   int local_port;  
   /** Destination sockets */
   Vector dest_sockets;  
   /** Destination socket of remote host to which the packets must not be relayed */
   SocketAddress no_relay_dest_socket;  

   /** Whether it is running */
   boolean stop;
   /** Maximum time that the UDP relay can remain active after been halted */
   int socket_to=3000; // 3sec 

  
   /** Creates a new UDP relay and starts it */
   public UdpMultiRelay(int local_port, Vector dest_sockets, SocketAddress no_dest_socket)
   {  init(local_port,dest_sockets,no_dest_socket);
      start();
   }
    
   /** Creates a new UDP relay and starts it */
   public UdpMultiRelay(int local_port, Vector dest_sockets)
   {  init(local_port,dest_sockets,null);
      start();
   }

   /** Inits a new UDP relay and starts it */
   private void init(int local_port, Vector dest_sockets, SocketAddress no_dest_socket)
   {  this.local_port=local_port;     
      this.dest_sockets=dest_sockets;
      this.no_relay_dest_socket=no_dest_socket;
      stop=false;
   }

   /** Gets the local port */
   public int getLocalPort()
   {  return local_port;
   }

   /** Gets the destination sockets */
   public Vector getDestSockets()
   {  return dest_sockets;
   }

   /** Gets the destination socket to which the packets must not be relayed */
   public SocketAddress getNoRelayDestSocket()
   {  return no_relay_dest_socket;
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
       
   /** Redirect packets from source addr/port to destination addr/port  */
   public void run()
   {  try	
      {  UdpSocket socket=new UdpSocket(local_port);
         byte []buf = new byte[2000];
         
         socket.setSoTimeout(socket_to);
         while(!stop)
         {  UdpPacket packet = new UdpPacket(buf, buf.length);          
            
            // non-blocking receiver
            try
            {  socket.receive(packet);           
            }
            catch (InterruptedIOException ie) { continue; }
            
            for (int i=0; i<dest_sockets.size(); i++)
            {  try
               {  SocketAddress dest=(SocketAddress)dest_sockets.elementAt(i);
                  if (no_relay_dest_socket==null || !dest.equals(no_relay_dest_socket))
                  {  packet.setIpAddress(dest.getAddress());
                     packet.setPort(dest.getPort());
                     socket.send(packet);
                     //System.out.print("*");
                  }
                  //else System.out.print(".");
               }
               catch (ArrayIndexOutOfBoundsException e) { }
            }
         }
         socket.close();
      }
      catch (Exception e) { e.printStackTrace(); } 
   }  
   
}
 
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


import java.io.IOException;
import java.io.InterruptedIOException;


/** UdpProvider provides an UDP send/receive service.
  * On the receiver side it waits for UDP datagrams and passes them
  * to the UdpProviderListener.
  * <p> If the attribute <i>alive_time</i> has a non-zero value, the UdpProvider stops
  * after <i>alive_time</i> milliseconds of inactivity.
  * <p> When a new packet is received, the onReceivedPacket(UdpProvider,DatagramPacket)
  * method is fired.
  * <p> Method onServiceTerminated(UdpProvider) is fired when the the UdpProvider stops 
  * receiving packets.
  */
public class UdpProvider extends Thread
{
   /** The reading buffer size */
   public static final int BUFFER_SIZE=65535;
     
   /** Default value for the maximum time that the UDP receiver can remain active after been halted (in milliseconds) */
   public static final int DEFAULT_SOCKET_TIMEOUT=2000; // 2sec 

   /** UDP socket */
   UdpSocket socket;  

   /** Maximum time that the UDP receiver can remain active after been halted (in milliseconds) */
   int socket_timeout;

   /** Maximum time that the UDP receiver remains active without receiving UDP datagrams (in milliseconds) */
   long alive_time; 

   /** Minimum size for received packets. Shorter packets are silently discarded. */
   int minimum_length; 

   /** Whether it has been halted */
   boolean stop; 

   /** Whether it is running */
   boolean is_running; 

   /** UdpProvider listener */
   UdpProviderListener listener;   

       
   /** Creates a new UdpProvider */ 
   public UdpProvider(UdpSocket socket, UdpProviderListener listener)
   {  init(socket,0,listener);
      start();
   }


   /** Creates a new UdpProvider */ 
   public UdpProvider(UdpSocket socket, long alive_time, UdpProviderListener listener)
   {  init(socket,alive_time,listener);
      start();
   }


   /** Inits the UdpProvider */ 
   private void init(UdpSocket socket, long alive_time, UdpProviderListener listener)
   {  this.listener=listener;
      this.socket=socket;
      this.socket_timeout=DEFAULT_SOCKET_TIMEOUT;
      this.alive_time=alive_time;
      this.minimum_length=0; 
      this.stop=false; 
      this.is_running=true; 
   }


   /** Gets the UdpSocket */ 
   public UdpSocket getUdpSocket()
   {  return socket;
   }


   /** Sets a new UdpSocket */ 
   /*public void setUdpSocket(UdpSocket socket)
   {  this.socket=socket;
   }*/


   /** Whether the service is running */
   public boolean isRunning()
   {  return is_running;
   }


   /** Sets the maximum time that the UDP service can remain active after been halted */
   public void setSoTimeout(int timeout)
   {  socket_timeout=timeout;
   }


   /** Gets the maximum time that the UDP service can remain active after been halted */
   public int getSoTimeout()
   {  return socket_timeout;
   }


   /** Sets the minimum size for received packets.
     * Packets shorter than that are silently discarded. */
   public void setMinimumReceivedDataLength(int len)
   {  minimum_length=len;
   }


   /** Gets the minimum size for received packets.
     * Packets shorter than that are silently discarded. */
   public int getMinimumReceivedDataLength()
   {  return minimum_length;
   }


   /** Sends a UdpPacket */      
   public void send(UdpPacket packet) throws IOException
   {  if (!stop) socket.send(packet);
   }


   /** Stops running */
   public void halt()
   {  stop=true;
   }


   /** The main thread */
   public void run()
   {  
      byte[] buf=new byte[BUFFER_SIZE];
      UdpPacket packet=new UdpPacket(buf, buf.length);
               
      Exception error=null;
      long expire=0;
      if (alive_time>0) expire=System.currentTimeMillis()+alive_time;
      try   
      {  socket.setSoTimeout(socket_timeout);
         // loop
         while(!stop)
         {  try
            {  socket.receive(packet);           
            }
            catch (InterruptedIOException ie)
            {  if (alive_time>0 && System.currentTimeMillis()>expire) halt();
               continue;
            }
            if (packet.getLength()>=minimum_length)
            {  if (listener!=null) listener.onReceivedPacket(this,packet);
               if (alive_time>0) expire=System.currentTimeMillis()+alive_time;
            }
            packet=new UdpPacket(buf, buf.length);
         }
      }
      catch (Exception e)
      {  error=e;
         stop=true;
      } 
      is_running=false;
      if (listener!=null) listener.onServiceTerminated(this,error);
      listener=null;
   }

   
   /** Gets a String representation of the Object */
   public String toString()
   {  return "udp:"+socket.getLocalAddress()+":"+socket.getLocalPort();
   }

}

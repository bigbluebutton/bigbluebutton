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

package local.media;


import org.zoolu.net.UdpPacket;
import org.zoolu.net.UdpSocket;
import org.zoolu.net.IpAddress;

import java.io.*;


/** UdpStreamReceiver is a generic stream receiver.
  * It receives packets from UDP and writes them into an OutputStream.
  */
public class UdpStreamReceiver extends Thread
{

   /** Whether debug mode */
   private static final boolean DEBUG=true;

   /** Size of the read buffer */
   private static final int BUFFER_SIZE=32768;

   /** Maximum blocking time, spent waiting for reading new bytes [milliseconds] */
   private static final int SO_TIMEOUT=200;

   /** The OutputStream */
   OutputStream output_stream=null;

   /** The UdpSocket */
   UdpSocket udp_socket=null;

   /** Whether the socket has been created here */
   boolean socket_is_local=false;

   /** Whether it is running */
   boolean running=false;


   /** Constructs a UdpStreamReceiver.
     * @param output_stream the stream sink
     * @param local_port the local receiver port */
   public UdpStreamReceiver(OutputStream output_stream, int local_port)
   {  try
      {  UdpSocket socket=new UdpSocket(local_port);
         socket_is_local=true;
         init(output_stream,socket);
      }
      catch (Exception e) {  e.printStackTrace();  }
   }

   /** Constructs a UdpStreamReceiver.
     * @param output_stream the stream sink
     * @param socket the local receiver UdpSocket */
   public UdpStreamReceiver(OutputStream output_stream, UdpSocket socket)
   {  init(output_stream,socket);
   }

   /** Inits the UdpStreamReceiver */
   private void init(OutputStream output_stream, UdpSocket socket)
   {  this.output_stream=output_stream;
      if (socket!=null) udp_socket=socket;
   }


   /** Whether is running */
   public boolean isRunning()
   {  return running;
   }

   /** Stops running */
   public void halt()
   {  running=false;
   }

   /** Runs it in a new Thread. */
   public void run()
   {
      if (udp_socket==null)
      {  if (DEBUG) println("ERROR: RTP socket is null");
         return;
      }
      //else

      byte[] buffer=new byte[BUFFER_SIZE];
      UdpPacket udp_packet=new UdpPacket(buffer,0);

      if (DEBUG) println("Reading blocks of max "+buffer.length+" bytes");

      //byte[] aux=new byte[BUFFER_SIZE];

      running=true;
      try
      {  udp_socket.setSoTimeout(SO_TIMEOUT);
         while (running)
         {  try
            {  // read a block of data from the rtp socket
               udp_socket.receive(udp_packet);
               //if (DEBUG) System.out.print(".");
               
               // write this block to the output_stream (only if still running..)
               if (running) output_stream.write(udp_packet.getData(), udp_packet.getOffset(), udp_packet.getLength());
            }
            catch (java.io.InterruptedIOException e) { }
         }
      }
      catch (Exception e) {  running=false; e.printStackTrace();  }

      // close UdpSocket
      if (socket_is_local && udp_socket!=null) udp_socket.close();
      
      // free all
      output_stream=null;
      udp_socket=null;
      
      if (DEBUG) println("udp receiver terminated");
   }


   /** Debug output */
   private static void println(String str)
   {  System.out.println("UdpStreamReceiver: "+str);
   }
   
}



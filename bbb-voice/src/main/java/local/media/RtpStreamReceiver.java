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


import local.net.RtpPacket;
import local.net.RtpSocket;

import java.io.*;
import java.net.InetAddress;
import java.net.DatagramSocket;


/** RtpStreamReceiver is a generic stream receiver.
  * It receives packets from RTP and writes them into an OutputStream.
  */
public class RtpStreamReceiver extends Thread
{

   /** Whether working in debug mode. */
   //private static final boolean DEBUG=true;
   public static boolean DEBUG=false;

   /** Size of the read buffer */
   public static final int BUFFER_SIZE=32768;

   /** Maximum blocking time, spent waiting for reading new bytes [milliseconds] */
   public static final int SO_TIMEOUT=200;

   /** The OutputStream */
   OutputStream output_stream=null;

   /** The RtpSocket */
   RtpSocket rtp_socket=null;

   /** Whether the socket has been created here */
   boolean socket_is_local=false;

   /** Whether it is running */
   boolean running=false;


   /** Constructs a RtpStreamReceiver.
     * @param output_stream the stream sink
     * @param local_port the local receiver port */
   public RtpStreamReceiver(OutputStream output_stream, int local_port)
   {  try
      {  DatagramSocket socket=new DatagramSocket(local_port);
         socket_is_local=true;
         init(output_stream,socket);
      }
      catch (Exception e) {  e.printStackTrace();  }
   }

   /** Constructs a RtpStreamReceiver.
     * @param output_stream the stream sink
     * @param socket the local receiver DatagramSocket */
   public RtpStreamReceiver(OutputStream output_stream, DatagramSocket socket)
   {  init(output_stream,socket);
   }

   /** Inits the RtpStreamReceiver */
   private void init(OutputStream output_stream, DatagramSocket socket)
   {  this.output_stream=output_stream;
      if (socket!=null) rtp_socket=new RtpSocket(socket);
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
      if (rtp_socket==null)
      {  if (DEBUG) println("ERROR: RTP socket is null");
         return;
      }
      //else

      byte[] buffer=new byte[BUFFER_SIZE];
      RtpPacket rtp_packet=new RtpPacket(buffer,0);

      if (DEBUG) println("Reading blocks of max "+buffer.length+" bytes");

      //byte[] aux=new byte[BUFFER_SIZE];

      running=true;
      try
      {  rtp_socket.getDatagramSocket().setSoTimeout(SO_TIMEOUT);
         while (running)
         {  try
            {  // read a block of data from the rtp socket
               rtp_socket.receive(rtp_packet);
               //if (DEBUG) System.out.print(".");
               
               // write this block to the output_stream (only if still running..)
               if (running) output_stream.write(rtp_packet.getPacket(), rtp_packet.getHeaderLength(), rtp_packet.getPayloadLength());
               /*if (running)
               {  byte[] pkt=rtp_packet.getPacket();
                  int offset=rtp_packet.getHeaderLength();
                  int len=rtp_packet.getPayloadLength();
                  int pos=0;
                  for (int i=0; i<len; i++)
                  {  int linear=G711.ulaw2linear(pkt[offset+i]);
                     //aux[pos++]=(byte)(linear&0xFF);
                     //aux[pos++]=(byte)((linear&0xFF00)>>8);
                     aux[pos++]=(byte)G711.linear2ulaw(linear);
                  }
                  output_stream.write(aux,0,pos);
               }*/
            }
            catch (java.io.InterruptedIOException e) { }
         }
      }
      catch (Exception e) {  running=false;  e.printStackTrace();  }

      // close RtpSocket and local DatagramSocket
      DatagramSocket socket=rtp_socket.getDatagramSocket();
      rtp_socket.close();
      if (socket_is_local && socket!=null) socket.close();
      
      // free all
      output_stream=null;
      rtp_socket=null;
      
      if (DEBUG) println("rtp receiver terminated");
   }


   /** Debug output */
   private static void println(String str)
   {  System.out.println("RtpStreamReceiver: "+str);
   }
   

   public static int byte2int(byte b)
   {  //return (b>=0)? b : -((b^0xFF)+1);
      //return (b>=0)? b : b+0x100; 
      return (b+0x100)%0x100;
   }

   public static int byte2int(byte b1, byte b2)
   {  return (((b1+0x100)%0x100)<<8)+(b2+0x100)%0x100; 
   }
}



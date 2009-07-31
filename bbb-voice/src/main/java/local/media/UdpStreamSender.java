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

import java.io.InputStream;


/** UdpStreamSender is a generic stream sender.
  * It takes an InputStream and sends it through UDP.
  */
public class UdpStreamSender extends Thread
{
   /** Whether debug mode */
   private static final boolean DEBUG=true;  
   
   /** The InputStream */
   InputStream input_stream=null;
   
   /** The UdpSocket */
   UdpSocket udp_socket=null;
   
   /** Payload type */
   int p_type;
   
   /** Number of frame per second */
   long frame_rate;  

   /** Number of bytes per frame */
   int frame_size;

   /** Whether the socket has been created here */
   boolean socket_is_local=false;   

   /** Whether it works synchronously with a local clock, or it it acts as slave of the InputStream  */
   boolean do_sync=true;

   /** Whether it is running */
   boolean running=false;   


   /** Constructs a UdpStreamSender.
     * @param input_stream the stream source
     * @param do_sync whether time synchronization must be performed by the UdpStreamSender,
     *        or it is performed by the InputStream (e.g. the system audio input)
     * @param frame_rate the frame rate, i.e. the number of frames that should be sent per second;
     *        it is used to calculate the nominal packet time and,in case of do_sync==true,
              the next departure time
     * @param frame_size the size of the payload
     * @param dest_addr the destination address
     * @param dest_port the destination port */
   public UdpStreamSender(InputStream input_stream, boolean do_sync, long frame_rate, int frame_size, String dest_addr, int dest_port)
   {  init(input_stream,do_sync,frame_rate,frame_size,null,dest_addr,dest_port);
   }                


   /** Constructs a UdpStreamSender.
     * @param input_stream the stream to be sent
     * @param do_sync whether time synchronization must be performed by the UdpStreamSender,
     *        or it is performed by the InputStream (e.g. the system audio input)
     * @param frame_rate the frame rate, i.e. the number of frames that should be sent per second;
     *        it is used to calculate the nominal packet time and,in case of do_sync==true,
              the next departure time
     * @param frame_size the size of the payload
     * @param src_socket the socket used to send the UDP packet
     * @param dest_addr the destination address
     * @param dest_port the thestination port */
   public UdpStreamSender(InputStream input_stream, boolean do_sync, long frame_rate, int frame_size, UdpSocket src_socket, String dest_addr, int dest_port)
   {  init(input_stream,do_sync,frame_rate,frame_size,src_socket,dest_addr,dest_port);
   }                


   /** Inits the UdpStreamSender */
   private void init(InputStream input_stream, boolean do_sync, long frame_rate, int frame_size, UdpSocket src_socket, String dest_addr, int dest_port)
   {
      this.input_stream=input_stream;
      this.frame_rate=frame_rate;
      this.frame_size=frame_size;
      this.do_sync=do_sync;
      try
      {  if (src_socket==null)
         {  udp_socket=new UdpSocket();
            socket_is_local=true;
         }
         else
         {  udp_socket=src_socket;
            socket_is_local=false;
         }
      }
      catch (Exception e) {  e.printStackTrace();  }    
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
      if (udp_socket==null || input_stream==null) return;
      //else
      
      byte[] buffer=new byte[frame_size];
      UdpPacket udp_packet=new UdpPacket(buffer,0);
      long time=0;
      long start_time=System.currentTimeMillis();
      long byte_rate=frame_rate*frame_size;
      
      running=true;
            
      if (DEBUG) println("Reading blocks of "+(buffer.length)+" bytes");

      try
      {  while (running)
         {
            //if (DEBUG) System.out.print("o");
            int num=input_stream.read(buffer,12,buffer.length);
      		//if (DEBUG) System.out.print("*");
            if (num>0)
            {  udp_packet.setLength(num);
               udp_socket.send(udp_packet);
               // update rtp timestamp (in milliseconds)
               time+=(num*1000)/byte_rate;
               // wait fo next departure
               if (do_sync)
               {  long frame_time=start_time+time-System.currentTimeMillis();
                  // wait before next departure..
                  try {  Thread.sleep(frame_time);  } catch (Exception e) {}
               }
            }
            else
            if (num<0)
            {  println("Error reading from InputStream");
               running=false;
            }
         }
      }
      catch (Exception e) {  running=false; e.printStackTrace();  }     

      //if (DEBUG) println("rtp time:  "+time);
      //if (DEBUG) println("real time: "+(System.currentTimeMillis()-start_time));

      // close UdpSocket
      if (socket_is_local && udp_socket!=null) udp_socket.close();

      // free all
      input_stream=null;
      udp_socket=null;

      if (DEBUG) println("udp sender terminated");
   }
   

   /** Debug output */
   private static void println(String str)
   {  System.out.println("UdpStreamSender: "+str);
   }

}
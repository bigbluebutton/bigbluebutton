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

import java.io.InputStream;
import java.net.InetAddress;
import java.net.DatagramSocket;


/** RtpStreamSender is a generic stream sender.
  * It takes an InputStream and sends it through RTP.
  */
public class RtpStreamSender extends Thread
{
   /** Whether working in debug mode. */
   //private static final boolean DEBUG=true;
   public static boolean DEBUG=false;
   
   /** The InputStream */
   InputStream input_stream=null;
   
   /** The RtpSocket */
   RtpSocket rtp_socket=null;
   
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

   /** Synchronization correction value, in milliseconds.
     * It accellarates the sending rate respect to the nominal value,
     * in order to compensate program latencies. */
   int sync_adj=0;

   /** Whether it is running */
   boolean running=false;   


   /** Constructs a RtpStreamSender.
     * @param input_stream the stream source
     * @param do_sync whether time synchronization must be performed by the RtpStreamSender,
     *        or it is performed by the InputStream (e.g. the system audio input)
     * @param payload_type the payload type
     * @param frame_rate the frame rate, i.e. the number of frames that should be sent per second;
     *        it is used to calculate the nominal packet time and,in case of do_sync==true,
              the next departure time
     * @param frame_size the size of the payload
     * @param dest_addr the destination address
     * @param dest_port the destination port */
   public RtpStreamSender(InputStream input_stream, boolean do_sync, int payload_type, long frame_rate, int frame_size, String dest_addr, int dest_port)
   {  init(input_stream,do_sync,payload_type,frame_rate,frame_size,null,dest_addr,dest_port);
   }                


   /** Constructs a RtpStreamSender.
     * @param input_stream the stream source
     * @param do_sync whether time synchronization must be performed by the RtpStreamSender,
     *        or it is performed by the InputStream (e.g. the system audio input)
     * @param payload_type the payload type
     * @param frame_rate the frame rate, i.e. the number of frames that should be sent per second;
     *        it is used to calculate the nominal packet time and,in case of do_sync==true,
              the next departure time
     * @param frame_size the size of the payload
     * @param src_port the source port
     * @param dest_addr the destination address
     * @param dest_port the destination port */
   //public RtpStreamSender(InputStream input_stream, boolean do_sync, int payload_type, long frame_rate, int frame_size, int src_port, String dest_addr, int dest_port)
   //{  init(input_stream,do_sync,payload_type,frame_rate,frame_size,null,src_port,dest_addr,dest_port);
   //}                


   /** Constructs a RtpStreamSender.
     * @param input_stream the stream to be sent
     * @param do_sync whether time synchronization must be performed by the RtpStreamSender,
     *        or it is performed by the InputStream (e.g. the system audio input)
     * @param payload_type the payload type
     * @param frame_rate the frame rate, i.e. the number of frames that should be sent per second;
     *        it is used to calculate the nominal packet time and,in case of do_sync==true,
              the next departure time
     * @param frame_size the size of the payload
     * @param src_socket the socket used to send the RTP packet
     * @param dest_addr the destination address
     * @param dest_port the thestination port */
   public RtpStreamSender(InputStream input_stream, boolean do_sync, int payload_type, long frame_rate, int frame_size, DatagramSocket src_socket, String dest_addr, int dest_port)
   {  init(input_stream,do_sync,payload_type,frame_rate,frame_size,src_socket,dest_addr,dest_port);
   }                


   /** Inits the RtpStreamSender */
   private void init(InputStream input_stream, boolean do_sync, int payload_type, long frame_rate, int frame_size, DatagramSocket src_socket, /*int src_port,*/ String dest_addr, int dest_port)
   {
      this.input_stream=input_stream;
      this.p_type=payload_type;
      this.frame_rate=frame_rate;
      this.frame_size=frame_size;
      this.do_sync=do_sync;
      try
      {  if (src_socket==null)
         {  //if (src_port>0) src_socket=new DatagramSocket(src_port); else
            src_socket=new DatagramSocket();
            socket_is_local=true;
         }
         rtp_socket=new RtpSocket(src_socket,InetAddress.getByName(dest_addr),dest_port);
      }
      catch (Exception e) {  e.printStackTrace();  }    
   }          


   /** Sets the synchronization adjustment time (in milliseconds). */
   public void setSyncAdj(int millisecs)
   {  sync_adj=millisecs;
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
      if (rtp_socket==null || input_stream==null) return;
      //else
      
      byte[] buffer=new byte[frame_size+12];
      RtpPacket rtp_packet=new RtpPacket(buffer,0);
      rtp_packet.setPayloadType(p_type);      
      int seqn=0;
      long time=0;
      //long start_time=System.currentTimeMillis();
      long byte_rate=frame_rate*frame_size;
      
      running=true;
            
      if (DEBUG) println("Reading blocks of "+(buffer.length-12)+" bytes");

      try
      {  while (running)
         {
            //if (DEBUG) System.out.print("o");
            int num=input_stream.read(buffer,12,buffer.length-12);
      		//if (DEBUG) System.out.print("*");
            if (num>0)
            {  rtp_packet.setSequenceNumber(seqn++);
               rtp_packet.setTimestamp(time);
               rtp_packet.setPayloadLength(num);
               rtp_socket.send(rtp_packet);
               // update rtp timestamp (in milliseconds)
               long frame_time=(num*1000)/byte_rate;
               time+=frame_time;
               // wait fo next departure
               if (do_sync)
               {  // wait before next departure..
                  //long frame_time=start_time+time-System.currentTimeMillis();
                  // accellerate in order to compensate possible program latency.. ;)
                  frame_time-=sync_adj;
                  try {  Thread.sleep(frame_time);  } catch (Exception e) {}
               }
            }
            else
            if (num<0)
            {  running=false;
               if (DEBUG) println("Error reading from InputStream");
            }
         }
      }
      catch (Exception e) {  running=false;  e.printStackTrace();  }     

      //if (DEBUG) println("rtp time:  "+time);
      //if (DEBUG) println("real time: "+(System.currentTimeMillis()-start_time));

      // close RtpSocket and local DatagramSocket
      DatagramSocket socket=rtp_socket.getDatagramSocket();
      rtp_socket.close();
      if (socket_is_local && socket!=null) socket.close();

      // free all
      input_stream=null;
      rtp_socket=null;

      if (DEBUG) println("rtp sender terminated");
   }
   

   /** Debug output */
   private static void println(String str)
   {  System.out.println("RtpStreamSender: "+str);
   }

}
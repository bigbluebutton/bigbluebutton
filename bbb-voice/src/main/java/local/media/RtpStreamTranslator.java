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
public class RtpStreamTranslator extends Thread
{

   /** Whether debug mode */
   private static final boolean DEBUG=true;

   /** Size of the read buffer */
   private static final int BUFFER_SIZE=32768;

   /** Maximum blocking time, spent waiting for reading new bytes [milliseconds] */
   private static final int SO_TIMEOUT=200;

   /** The OutputStream */
   OutputStream output_stream=null;

   /** The input RtpSocket */
   RtpSocket rtp_socket_in=null;

   /** The input RtpSocket */
   RtpSocket rtp_socket_out=null;

   /** Whether the receive socket has been created here */
   boolean socket_in_is_local=false;

   /** Whether the send socket has been created here */
   boolean socket_out_is_local=false;

   /** Whether it is running */
   boolean running=false;


   /** Constructs a RtpStreamTranslator.
     * @param recv_port the local receiver port
     * @param dest_addr the destination address
     * @param dest_port the thestination port */
   public RtpStreamTranslator(int recv_port, String dest_addr, int dest_port)
   {  try
      {  DatagramSocket recv_socket=new DatagramSocket(recv_port);
         socket_in_is_local=true;
         init(recv_socket,null,dest_addr,dest_port);
      }
      catch (Exception e) {  e.printStackTrace();  }
   }

   /** Constructs a RtpStreamTranslator.
     * @param socket_in the local receiver socket
     * @param socket_out the socket used to send the RTP packet
     * @param dest_addr the destination address
     * @param dest_port the thestination port */
   public RtpStreamTranslator(DatagramSocket socket_in, DatagramSocket socket_out, String dest_addr, int dest_port)
   {  init(socket_in,socket_out,dest_addr,dest_port);
   }

   /** Inits the RtpStreamTranslator */
   private void init(DatagramSocket socket_in, DatagramSocket socket_out, String dest_addr, int dest_port)
   {  
      try
      {  if (socket_out==null)
         {  socket_out=new DatagramSocket();
            socket_out_is_local=true;
         }
         rtp_socket_in=new RtpSocket(socket_in);
         rtp_socket_out=new RtpSocket(socket_out,InetAddress.getByName(dest_addr),dest_port);
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
      if (rtp_socket_in==null || rtp_socket_out==null)
      {  if (DEBUG) println("ERROR: RTP socket_in or socket_out is null");
         return;
      }
      //else

      byte[] buffer_in=new byte[BUFFER_SIZE];
      RtpPacket rtp_packet_in=new RtpPacket(buffer_in,0);
 
      byte[] buffer_out=new byte[BUFFER_SIZE];
      RtpPacket rtp_packet_out=new RtpPacket(buffer_out,0);
      //rtp_packet_out.setPayloadType(p_type);      

      if (DEBUG) println("Reading blocks of max "+BUFFER_SIZE+" bytes");

      //File file=new File("audio.wav");
      //javax.sound.sampled.AudioInputStream audio_input_stream=null;
      //try {  audio_input_stream=javax.sound.sampled.AudioSystem.getAudioInputStream(file);  } catch (Exception e) {  e.printStackTrace();  }

      running=true;
      try
      {  rtp_socket_in.getDatagramSocket().setSoTimeout(SO_TIMEOUT);
         while (running)
         {  try
            {  // read a block of data from the rtp_socket_in
               rtp_socket_in.receive(rtp_packet_in);
               //if (DEBUG) System.out.print(".");
               
               // send the block to the rtp_socket_out (if still running..)
               if (running)
               {  byte[] pkt1=rtp_packet_in.getPacket();
                  int offset1=rtp_packet_in.getHeaderLength();
                  int len1=rtp_packet_in.getPayloadLength();

                  byte[] pkt2=rtp_packet_out.getPacket();
                  int offset2=rtp_packet_out.getHeaderLength();
                  int pos2=offset2;
                  
                  for (int i=0; i<len1; i++)
                  {  int linear=G711.ulaw2linear(pkt1[offset1+i]);
                     //aux[pos++]=(byte)(linear&0xFF);
                     //aux[pos++]=(byte)((linear&0xFF00)>>8);
                     //int linear2=G711.ulaw2linear(audio_input_stream.read());
                     //linear+=linear2;
                     pkt2[pos2++]=(byte)G711.linear2ulaw(linear);
                  }             
                  rtp_packet_out.setPayloadType(rtp_packet_in.getPayloadType());
                  rtp_packet_out.setSequenceNumber(rtp_packet_in.getSequenceNumber());
                  rtp_packet_out.setTimestamp(rtp_packet_in.getTimestamp());
                  rtp_packet_out.setPayloadLength(pos2-offset2);
                  rtp_socket_out.send(rtp_packet_out);
               }

            }
            catch (java.io.InterruptedIOException e) { }
         }
      }
      catch (Exception e) {  running=false; e.printStackTrace();  }

      // close RtpSocket and local DatagramSocket
      DatagramSocket socket_in=rtp_socket_in.getDatagramSocket();
      rtp_socket_in.close();
      if (socket_in_is_local && socket_in!=null) socket_in.close();
      DatagramSocket socket_out=rtp_socket_out.getDatagramSocket();
      rtp_socket_out.close();
      if (socket_out_is_local && socket_out!=null) socket_out.close();
      
      // free all
      rtp_socket_in=null;
      rtp_socket_out=null;
      
      if (DEBUG) println("rtp translator terminated");
   }


   /** Debug output */
   private static void println(String str)
   {  System.out.println("RtpStreamTranslator: "+str);
   }
   

   public static int byte2int(byte b)
   {  //return (b>=0)? b : -((b^0xFF)+1);
      //return (b>=0)? b : b+0x100; 
      return (b+0x100)%0x100;
   }


   public static int byte2int(byte b1, byte b2)
   {  return (((b1+0x100)%0x100)<<8)+(b2+0x100)%0x100; 
   }
   
   
   // ******************************* MAIN *******************************

   /** The main method. */
   public static void main(String[] args)
   {
      String daddr=null;
      int dport=0;
      int rport=0;

      boolean help=true;

      for (int i=0; i<args.length; i++)
      {
         if (args[i].equals("-h"))
         {  break;
         }
         if (i==0 && args.length>1)
         {  rport=Integer.parseInt(args[i++]);
            daddr=args[i++];
            dport=Integer.parseInt(args[i++]);
            help=false;
            continue;
         }

         // else, do:
         System.out.println("unrecognized param '"+args[i]+"'\n");
         help=true;
      }
              
      if (help)
      {  System.out.println("usage:\n  java RtpStreamTranslator <recv_port> <dest_addr> <dest_port> [options]");
         System.out.println("   options:");
         System.out.println("   -h               this help");
         System.exit(0);
      }         
            
      RtpStreamTranslator translator=new RtpStreamTranslator(rport,daddr,dport);
      translator.start();
   }

}



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


import java.net.ServerSocket;
import java.io.InterruptedIOException;



/** TcpServer implements a TCP server wainting for incoming connection.
  */
public class TcpServer extends Thread
{
   /** Default value for the maximum time that the tcp server can remain active after been halted (in milliseconds) */
   public static final int DEFAULT_SOCKET_TIMEOUT=5000; // 5sec

   /** Default ServerSocket backlog value */
   static int socket_backlog=50;

   /** The protocol type */
   //protected static final String PROTO="tcp";

   /** The TCP server socket */
   ServerSocket server_socket;

   /** Maximum time that the connection can remain active after been halted (in milliseconds) */
   int socket_timeout;

   /** Maximum time that the server remains active without incoming connections (in milliseconds) */
   long alive_time;

   /** Whether it has been halted */
   boolean stop;

   /** Whether it is running */
   boolean is_running;

   /** TcpServer listener */
   TcpServerListener listener;


   /** Costructs a new TcpServer */
   public TcpServer(int port, TcpServerListener listener)  throws java.io.IOException
   {  init(port,null,0,listener);
      start();
   }


   /** Costructs a new TcpServer */
   public TcpServer(int port, IpAddress bind_ipaddr, TcpServerListener listener)  throws java.io.IOException
   {  init(port,bind_ipaddr,0,listener);
      start();
   }


   /** Costructs a new TcpServer */
   public TcpServer(int port, IpAddress bind_ipaddr, long alive_time, TcpServerListener listener)  throws java.io.IOException
   {  init(port,bind_ipaddr,alive_time,listener);
      start();
   }


   /** Inits the TcpServer */
   private void init(int port, IpAddress bind_ipaddr, long alive_time, TcpServerListener listener) throws java.io.IOException
   {
	   this.setName(this.getClass().getName()+".T"+this.getName().replaceAll("Thread-", ""));
	   this.listener=listener;
      if (bind_ipaddr==null) server_socket=new ServerSocket(port);
      else server_socket=new ServerSocket(port,socket_backlog,bind_ipaddr.getInetAddress());
      this.socket_timeout=DEFAULT_SOCKET_TIMEOUT;
      this.alive_time=alive_time;
      this.stop=false;
      this.is_running=true;
   }


   /** Whether the service is running */
   public boolean isRunning()
   {  return is_running;
   }


   /** Stops running */
   public void halt()
   {  stop=true;
      int waitcnt=0;
	  	   while (is_running && waitcnt++<(socket_timeout/500+4))
	  	   {
	  	 	  try{sleep(500);}catch(Exception e){}
	  	   }
	  	   if (server_socket!=null)
	  	   {
	  		   try
	  		   {
	  			   server_socket.close();
	  		   }
	  		   catch(Exception e)
	  		   {}
	   }
   }


   /** Runs the server */
   public void run()
   {  Exception error=null;
      try
      {  server_socket.setSoTimeout(socket_timeout);
         long expire=0;
         if (alive_time>0) expire=System.currentTimeMillis()+alive_time;
         // loop
         while (!stop)
         {  TcpSocket socket=null;
            try
            {  socket=new TcpSocket(server_socket.accept());
            }
            catch (InterruptedIOException ie)
            {  if (alive_time>0 && System.currentTimeMillis()>expire) halt();
               continue;
            }
            if (listener!=null) listener.onIncomingConnection(this,socket);
            if (alive_time>0) expire=System.currentTimeMillis()+alive_time;
         }
      }
      catch (Exception e)
      {  error=e;
         stop=true;
      }
      is_running=false;
      try
      {  server_socket.close();
      }
      catch (java.io.IOException e) {}
      server_socket=null;

      if (listener!=null) listener.onServerTerminated(this,error);
      listener=null;
   }


   /** Gets a String representation of the Object */
   public String toString()
   { if (server_socket!=null) return "tcp:"+server_socket.getInetAddress()+":"+server_socket.getLocalPort();
    else return null;
   }

}

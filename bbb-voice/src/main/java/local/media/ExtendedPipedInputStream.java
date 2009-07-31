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


import java.io.PipedInputStream;
import java.io.PipedOutputStream;
import java.io.IOException;


/** ExtendedPipedInputStream. 
  */
public class ExtendedPipedInputStream extends PipedInputStream
{

   /** The circular buffer size. */
   public static int EXT_PIPE_SIZE=32768;


   /** Creates a new ExtendedPipedInputStream. */
   public ExtendedPipedInputStream()
   {  super();
      buffer=new byte[EXT_PIPE_SIZE];
   }

   /** Creates a new ExtendedPipedInputStream. */
   public ExtendedPipedInputStream(PipedOutputStream src) throws IOException
   {  super(src);
      buffer=new byte[EXT_PIPE_SIZE];
   }

   /** Returns the number of bytes that can be read from this input stream without blocking. */
   //public int available()
   
   /** Closes this piped input stream and releases any system resources associated with the stream. */
   //public void close() throws IOException
   
   /** Causes this piped input stream to be connected to the piped output stream src. */
   //public void connect(PipedOutputStream src) throws IOException
   
   /** Reads the next byte of data from this piped input stream. */
   public int read() throws IOException
   {  try
      {  return super.read();
      }
      catch (IOException e) {  return -1;  }
   }
   
   /** Reads up to len bytes of data from this piped input stream into an array of bytes. */
   //public int read(byte[] b, int off, int len)
   
   /** Receives a byte of data. */
   protected void receive(int b) throws IOException
   {  try
      {  if (in!=out) super.receive(b);
      }
      catch (IOException e) {}
   }

}
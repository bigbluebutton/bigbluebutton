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


/** ExtendedPipedOutputStream. 
  */
public class ExtendedPipedOutputStream extends PipedOutputStream
{

   /** Creates a new ExtendedPipedOutputStream. */
   public ExtendedPipedOutputStream()
   {  super();
   }

   /** Creates a new ExtendedPipedOutputStream. */
   public ExtendedPipedOutputStream(PipedInputStream snk) throws IOException
   {  super(snk);
   }
   
   /** Closes this piped output stream and releases any system resources associated with this stream. */
   //public void close()
   
   /** Connects this piped output stream to a receiver. */
   //public void connect(PipedInputStream snk) throws IOException
   
   /** Flushes this output stream and forces any buffered output bytes to be written out. */
   //public void flush()
   
   /** Writes len bytes from the specified byte array starting at offset off to this piped output stream. */
   //public void write(byte[] b, int off, int len)
   
   /** Writes the specified byte to the piped output stream. */
   //public void write(int b) throws IOException

}
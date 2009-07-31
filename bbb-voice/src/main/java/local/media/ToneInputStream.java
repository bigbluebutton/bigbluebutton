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


//import java.io.*;
import java.lang.Math;


/** Generates a single tone.
  */
public class ToneInputStream extends java.io.InputStream
{
   /** The number of bytes that are notified as available */
   static int MAX_AVAILABLE_BYTES=65536;

   /** Identifier of linear unsigned PCM */
   public static final int PCM_LINEAR_UNSIGNED=0;

   /** Identifier of linear signed PCM */
   public static final int PCM_LINEAR_SIGNED=1;


   /** Tone frequence */
   int f0;
   /** Tone ampliture in the interval [0:2^(n-1)] where n is the sample sinze in bits.  */
   double A;
   /** Offset to be added in case uo unsigned PCM */
   double zero;
   /** Sample rate [samples per seconds] */
   int fs;
   /** Sample size [bytes] */
   int size;
   /** Whether use big endian foramt */
   boolean big_endian;
  
   /** B=2*Pi*f0/fs */
   double B;
   /** Sample sequence number */
   double k;
   /** Buffer containing the current sample */
   byte[] s_buff;
   /** Index within s_buff */
   int s_index;
  
   /** Creates a new 8-bit per sample ToneInputStream */
   /*public ToneInputStream(int frequence, double ampliture, int sample_rate, int codec)
   {  init(frequence,ampliture,sample_rate,1,codec);
   }*/

   /** Creates a new ToneInputStream */
   public ToneInputStream(int frequence, double ampliture, int sample_rate, int sample_size, int codec, boolean big_endian)
   {  init(frequence,ampliture,sample_rate,sample_size,codec,big_endian);
   }

   /** Inits the ToneInputStream */
   private void init(int frequence, double ampliture, int sample_rate, int sample_size, int codec, boolean big_endian)
   {  this.f0=frequence;
      this.fs=sample_rate;
      this.size=sample_size;
      this.big_endian=big_endian;
      B=(2*Math.PI*f0)/fs;
      long range=((long)1)<<((sample_size*8)-1);
      A=ampliture*range;
      if (codec==PCM_LINEAR_SIGNED) zero=0.0F;
      else zero=range/2;
      k=0;
      s_index=0;
      s_buff=new byte[size];

      //System.out.println("Tone: PI: "+Math.PI);
      //System.out.println("Tone: sin(PI/6): "+Math.sin(Math.PI/6));
      //System.out.println("Tone: s_rate: "+fs);
      //System.out.println("Tone: s_size: "+size);
      //System.out.println("Tone: A: "+A);
      //System.out.println("Tone: 0: "+zero);
   }
     
   
   /** Returns the number of bytes that can be read (or skipped over) from this input stream without blocking by the next caller of a method for this input stream. */
   public int available() 
   {  return MAX_AVAILABLE_BYTES;
   }


   /** Reads the next sample. */
   private double nextSample() 
   {  return A*Math.sin(B*(k++))+zero;
   }

   /** Reads the next byte of data from the input stream. */
   public int read() 
   {  if (s_index==0)
      {  // get next sample
         long next_sample=(long)(nextSample());
         // set the s_buff
         for (int i=0; i<size; i++)
         {  int pos=(big_endian)? size-i-1 : i ;
            s_buff[pos]=(byte)((next_sample/(((long)1)<<(i*8)))%256);
         }
      }
      int b=s_buff[s_index];
      s_index=(++s_index)%size;
      return b;
   }


   /** Reads some number of bytes from the input stream and stores them into the buffer array b. */
   public int read(byte[] b) 
   {  return read(b,0,b.length);
   }

   /** Reads up to len bytes of data from the input stream into an array of bytes. */
   public int read(byte[] b, int off, int len) 
   {  for (int i=off; i<off+len; i++)
      {  b[i]=(byte)read();
      }
      return len;
   }

   /** Skips over and discards n bytes of data from this input stream. */
   public long skip(long n) 
   {  // to do..
      return 0;
   }

   /** Closes this input stream and releases any system resources associated with the stream. */
   public void close() 
   {  // do nothing
   }

   /** Tests if this input stream supports the mark and reset methods. */
   public boolean markSupported() 
   {  return false;
   }

   /** Marks the current position in this input stream. */
   public void mark(int readlimit) 
   {
   }

   /** Repositions this stream to the position at the time the mark method was last called on this input stream. */
   public void reset() 
   {
   }


}



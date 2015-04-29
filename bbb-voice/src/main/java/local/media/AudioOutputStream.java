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


import javax.sound.sampled.*;
import java.io.*;


/** AudioOutputStream is equivalent to javax.sound.sampled.AudioInputStream
  * for audio playout.
  * <p/>
  * AudioOutputStream also provides audio codec conversion, as
  * javax.sound.sampled.AudioSystem does for the corresponding
  * javax.sound.sampled.AudioInputStream class.
  */
class AudioOutputStream extends OutputStream
{
   static final int INTERNAL_BUFFER_SIZE=40960;

   /** The SourceDataLine */
   protected SourceDataLine source_line;

   /** Converted InputStream. */
   protected InputStream input_stream;

   /** Piped OutputStream. */
   protected OutputStream output_stream;

   /** Internal buffer. */
   private byte[] buff=new byte[INTERNAL_BUFFER_SIZE];


   /** Creates a new AudioOutputStream from a SourceDataLine. */
   public AudioOutputStream(SourceDataLine source_line)
   {  this.source_line=source_line;
      input_stream=null;
      output_stream=null;
   }
   
   /** Creates a new AudioOutputStream from a SourceDataLine converting the audio format. */
   public AudioOutputStream(SourceDataLine source_line, AudioFormat format) throws IOException
   {  this.source_line=source_line;

      PipedInputStream piped_input_stream=new PipedInputStream();
      output_stream=new PipedOutputStream(piped_input_stream);

      AudioInputStream audio_input_stream=new AudioInputStream(piped_input_stream,format,-1);
      if (audio_input_stream==null)
      {  String err="Failed while creating a new AudioInputStream.";
         throw new IOException(err);
      }
      
      input_stream=AudioSystem.getAudioInputStream(source_line.getFormat(),audio_input_stream);
      if (input_stream==null)
      {  String err="Failed while getting a transcoded AudioInputStream from AudioSystem.";
         err+="\n       input codec: "+format.toString();
         err+="\n       output codec:"+source_line.getFormat().toString();
         throw new IOException(err);
      }
   }
   
   /** Closes this output stream and releases any system resources associated with this stream. */
   public void close()
   {  //source_line.close();
   }
   
   /** Flushes this output stream and forces any buffered output bytes to be written out. */
   public void flush()
   {  source_line.flush();
   }
   
   /** Writes b.length bytes from the specified byte array to this output stream. */
   public void write(byte[] b) throws IOException
   {  if (output_stream!=null)
      {  output_stream.write(b);
         int len=input_stream.read(buff,0,buff.length);
         source_line.write(buff,0,len);
      }
      else
      {  source_line.write(b,0,b.length);
      }
   }
   
   /** Writes len bytes from the specified byte array starting at offset off to this output stream. */
   public void write(byte[] b, int off, int len) throws IOException
   {  if (output_stream!=null)
      {  output_stream.write(b,off,len);
         len=input_stream.read(buff,0,buff.length);
         source_line.write(buff,0,len);
      }
      else
      {  source_line.write(b,off,len);
      }
   }
   
   /** Writes the specified byte to this output stream. */
   public void write(int b) throws IOException
   {  if (output_stream!=null)
      {  output_stream.write(b);
         int len=input_stream.read(buff,0,buff.length);
         source_line.write(buff,0,len);
      }
      else
      {  buff[0]=(byte)b;
         source_line.write(buff,0,1);
      }
   }

}

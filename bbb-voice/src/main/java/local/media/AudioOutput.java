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


/** AudioOutput allows the access of system audio output in pure-java manner.
  * It uses the javax.sound library (package).
  */
public class AudioOutput
{

   // ####################### BEGIN STATIC #######################

   static boolean DEBUG=true;
   
   static final int INTERNAL_BUFFER_SIZE=40960;
   
   private static SourceDataLine source_line;

   
   /** Init the static system audio output line */
   public static void initAudioLine()
   {
      /*println("Available Mixers:");
      Mixer.Info[] aInfos=AudioSystem.getMixerInfo();
      for (int i=0; i < aInfos.length; i++) print("   "+i+") "+aInfos[i].getName()+"\n");      
      if (aInfos.length == 0)
      {  println("WARNING: NO mixers available.");
         //System.exit(0);
         return;
      }*/

      // 44100 Hz, Linear, 16bit, Stereo :
      //float fFrameRate = 44100.0F;
      //AudioFormat format = new AudioFormat(AudioFormat.Encoding.PCM_SIGNED, fFrameRate, 16, 2, 4, fFrameRate, false);
      
      // 44100 Hz, Linear, 16bit, Mono :
      //float fFrameRate = 44100.0F;
      //AudioFormat format = new AudioFormat(AudioFormat.Encoding.PCM_SIGNED, fFrameRate, 16, 1, 2, fFrameRate, false);

      // 8000 Hz, Linear, 16bit, Mono :
      float fFrameRate=8000.0F;
      AudioFormat format=new AudioFormat(AudioFormat.Encoding.PCM_SIGNED, fFrameRate, 16, 1, 2, fFrameRate, false);
      
      DataLine.Info lineInfo=new DataLine.Info(SourceDataLine.class, format, INTERNAL_BUFFER_SIZE);

      if (!AudioSystem.isLineSupported(lineInfo))
      {  System.err.println("ERROR: AudioLine not supported by this System.");
      }
      try
      {  source_line=(SourceDataLine)AudioSystem.getLine(lineInfo);
         if (DEBUG) println("SourceDataLine: "+source_line);
         source_line.open(format,INTERNAL_BUFFER_SIZE);
      }
      catch (LineUnavailableException e) 
      {  System.err.println("ERROR: LineUnavailableException at AudioReceiver()");
         e.printStackTrace();
      }      
   }          

   /** Closes the static system audio output line */
   static public void closeAudioLine()
   {  source_line.close();
   }


   // ######################## END STATIC ########################


   AudioOutputStream audio_output_stream=null;


   /** Constructs an AudioOutput with audio_format=[8000 Hz, ULAW, 8bit, Mono] */
   public AudioOutput()
   {  init(null);
   }          

   /** Constructs an AudioOutput */
   public AudioOutput(AudioFormat audio_format)
   {  init(audio_format);
   }          

   /** Inits an AudioOutput */
   private void init(AudioFormat format)
   {
      if (source_line==null) initAudioLine();
      
      if (format==null) 
      {  // by default use 8000 Hz, ULAW, 8bit, Mono
         float fFrameRate=8000.0F;
         format=new AudioFormat(AudioFormat.Encoding.ULAW, fFrameRate, 8, 1, 1, fFrameRate, false);
      }
      
      if (source_line.isOpen())
      {  // convert the audio stream to the selected format
         try
         {  audio_output_stream=new AudioOutputStream(source_line,format);
         }
         catch (Exception e)
         {  e.printStackTrace();
         }
      }
      else
      {  System.err.print("WARNING: Audio init error: source line is not open.");
      }
      
   } 
   
   
   /** Gets the audio OuputStream */
   public OutputStream getOuputStream()
   {  //return output_stream;
      return audio_output_stream;
   }
  

   /** Starts playing */
   public void play()
   {  if (source_line.isOpen()) source_line.start();
      else
      {  System.err.print("WARNING: Audio play error: source line is not open.");
      }
   }


   /** Stops playing */
   public void stop()
   {  if (source_line.isOpen())
      {  source_line.drain();
         source_line.stop();
      }
      else
      {  System.err.print("WARNING: Audio stop error: source line is not open.");
      }
      //source_line.close();
   }


   /** Debug output */
   private static void println(String str)
   {  System.out.println("AudioOutput: "+str);
   }

   /** Debug output */
   private static void print(String str)
   {  System.out.print("AudioOutput: "+str);
   }

}



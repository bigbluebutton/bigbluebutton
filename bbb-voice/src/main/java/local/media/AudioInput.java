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
import java.io.InputStream;


/** AudioInput allows the access of system audio input in pure-java manner.
  * It uses the javax.sound library (package).
  */
public class AudioInput
{


   // ####################### BEGIN STATIC #######################

   static boolean DEBUG=true;
   
   static final int INTERNAL_BUFFER_SIZE=40960;
   
   static TargetDataLine target_line=null;
   
   
   /** Inits the static system audio input line */
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

      DataLine.Info lineInfo=new DataLine.Info(TargetDataLine.class,format,INTERNAL_BUFFER_SIZE);
      
      if (!AudioSystem.isLineSupported(lineInfo))
      {  System.err.println("ERROR: AudioLine not supported by this System.");
      }
      try
      {  target_line=(TargetDataLine)AudioSystem.getLine(lineInfo);
         if (DEBUG) println("TargetDataLine: "+target_line);
         target_line.open(format,INTERNAL_BUFFER_SIZE);
      }
      catch (LineUnavailableException e)
      {  System.err.println("ERROR: LineUnavailableException at AudioSender()");
         e.printStackTrace();
      }
   }

   /** Closes the static system audio input line */
   static public void closeAudioLine()
   {  target_line.close();
   }


   // ######################## END STATIC ########################



   AudioInputStream audio_input_stream=null;


   /** Constructs an AudioInput with audio_format=[8000 Hz, ULAW, 8bit, Mono] */
   public AudioInput()
   {  init(null);
   }          

   /** Constructs an AudioInput */
   public AudioInput(AudioFormat audio_format)
   {  init(audio_format);
   }          
      
   /** Inits the AudioInput */
   private void init(AudioFormat format)
   {
      if (target_line==null) initAudioLine(); 
      
      if (format==null) 
      {  // by default use 8000 Hz, ULAW, 8bit, Mono
         float fFrameRate=8000.0F;
         format=new AudioFormat(AudioFormat.Encoding.ULAW, fFrameRate, 8, 1, 1, fFrameRate, false);
      }
      
      if (target_line.isOpen())
      {  audio_input_stream=new AudioInputStream(target_line);
         // convert the audio stream to the selected format
         audio_input_stream=AudioSystem.getAudioInputStream(format,audio_input_stream);
      }
      else
      {  System.err.print("WARNING: Audio init error: target line is not open.");
      }
   }          


   /** Gets the audio InputStream */
   public InputStream getInputStream()
   {  return audio_input_stream;
   }



   /** Starts playing */
   public void play()
   {  if (target_line.isOpen()) target_line.start();
      else
      {  System.err.print("WARNING: Audio play error: target line is not open.");
      }
   }


   /** Stops playing */
   public void stop()
   {  if (target_line.isOpen()) target_line.stop();
      else
      {  System.err.print("WARNING: Audio stop error: target line is not open.");
      }
      //target_line.close();
   }


   /** Debug output */
   private static void println(String str)
   {  System.out.println("AudioInput: "+str);
   }

   /** Debug output */
   private static void print(String str)
   {  System.out.print("AudioInput: "+str);
   }

}
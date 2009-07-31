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


import java.io.*;

import javax.sound.sampled.AudioFormat;
import javax.sound.sampled.AudioInputStream;
import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.Clip;
import javax.sound.sampled.DataLine;
import javax.sound.sampled.LineEvent;
import javax.sound.sampled.LineListener;


/** Plays an audio file.
  */
public class AudioClipPlayer implements LineListener 
{
   /** The sound clip */
   Clip clip=null;

   /** The player listener */
   AudioClipPlayerListener p_listener=null; 


   /** Creates the SoundPlayer */
   public AudioClipPlayer(String filename, AudioClipPlayerListener listener)
   {  try
      {  FileInputStream inputstream=new FileInputStream(new File(filename));
         AudioInputStream audio_inputstream=AudioSystem.getAudioInputStream(inputstream);
         init(audio_inputstream,listener);
      }
      catch (Exception e) { e.printStackTrace(); }
   }


   /** Creates the SoundPlayer */
   public AudioClipPlayer(File file, AudioClipPlayerListener listener)
   {  try
      {  AudioInputStream audio_inputstream=AudioSystem.getAudioInputStream(new FileInputStream(file));
         init(audio_inputstream,listener);
      }
      catch (Exception e) { e.printStackTrace(); }
   }


   /** Creates the SoundPlayer */
   public AudioClipPlayer(InputStream inputstream, AudioClipPlayerListener listener)
   {  try
      {  AudioInputStream audio_inputstream=AudioSystem.getAudioInputStream(inputstream);
         init(audio_inputstream,listener);
      }
      catch (Exception e) { e.printStackTrace(); }
   }


   /** Creates the SoundPlayer */
   public AudioClipPlayer(AudioInputStream audio_inputstream, AudioClipPlayerListener listener)
   {  
      init(audio_inputstream,listener);
   }


   /** Inits the SoundPlayer */
   void init(AudioInputStream audio_inputstream, AudioClipPlayerListener listener)
   {  p_listener=listener;
      if (audio_inputstream!=null)
      try
      {  AudioFormat format=audio_inputstream.getFormat();
         DataLine.Info info=new DataLine.Info(Clip.class,format);
         clip=(Clip)AudioSystem.getLine(info);
         clip.addLineListener(this);
         clip.open(audio_inputstream);
      }
      catch (Exception e) { e.printStackTrace(); }
   }


   /** Loops the sound until stopped */
   public void loop()
   {  
      loop(0);
   }


   /** Loops the sound n times.
     * if <i>n</i>=0, it loops until stopped */
   public void loop(int n)
   {  
      rewind(); 
      if (clip!=null)
      {  if (n<=0) clip.loop(Clip.LOOP_CONTINUOUSLY);
         else clip.loop(n-1);
      }
   }


   /** Plays the sound */
   public void play()
   {  
      if (clip!=null) clip.start();
   }


   /** Stops and rewinds the sound */
   public void stop()
   {  
      if (clip!=null) clip.stop();
   }


   /** Rewinds the sound */
   public void rewind()
   {  
      if (clip!=null) clip.setMicrosecondPosition(0);
   }


   /** Goes to a time position */
   public void goTo(long millisec)
   {  
      if (clip!=null) clip.setMicrosecondPosition(millisec);
   }


   /** Plays the sound from begining (restart) */
   public void replay()
   {  
      if (clip!=null) { rewind(); clip.start(); }
   }


   /** Called by the sound line */
   public void update(LineEvent event)
   {
      if (event.getType().equals(LineEvent.Type.STOP))
      {  //System.out.println("DEBUG: clip stop");
         //clip.close();
         if (p_listener!=null) p_listener.onAudioClipStop(this);
      }
   }


   // ***************************** MAIN *****************************
   
   /** The main method. */
    public static void main(String[] args)
    {
        if (args.length<1)
        {
            System.out.println("AudioClipPlayer: usage:\n  java AudioClipPlayer <filename>");
            System.exit(0);
        }

        AudioClipPlayer p=new AudioClipPlayer(args[0],null);
        p.play();
        //try { Thread.sleep(3000); } catch (Exception e) { e.printStackTrace(); }
        //p.stop(); 
    }
}



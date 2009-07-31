package local.ua;


import local.media.AudioInput;
import local.media.AudioOutput;
import local.media.RtpStreamSender;
import local.media.RtpStreamReceiver;
import org.zoolu.sip.provider.SipStack;
import org.zoolu.tools.Log;
import org.zoolu.tools.LogLevel;

import java.net.DatagramSocket;
import javax.sound.sampled.AudioFormat;

// Test..
import local.media.ToneInputStream;
import java.io.InputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import javax.sound.sampled.AudioFileFormat;
import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.AudioInputStream;


/** Audio launcher based on javax.sound  */
public class JAudioLauncher implements MediaLauncher
{  
   /** Event logger. */
   Log log=null;

   /** Payload type */
   int payload_type=0;
   /** Sample rate [bytes] */
   int sample_rate=8000;
   /** Sample size [bytes] */
   int sample_size=1;
   /** Frame size [bytes] */
   int frame_size=500;
   /** Frame rate [frames per second] */
   int frame_rate=16; //=sample_rate/(frame_size/sample_size);
   AudioFormat.Encoding codec=AudioFormat.Encoding.ULAW;
   boolean signed=false; 
   boolean big_endian=false;

   //String filename="audio.wav"; 

   /** Test tone */
   public static final String TONE="TONE";

   /** Test tone frequency [Hz] */
   public static int tone_freq=100;
   /** Test tone ampliture (from 0.0 to 1.0) */
   public static double tone_amp=1.0;

   /** Runtime media process */
   Process media_process=null;
   
   int dir; // duplex= 0, recv-only= -1, send-only= +1; 

   DatagramSocket socket=null;
   RtpStreamSender sender=null;
   RtpStreamReceiver receiver=null;
   AudioInput audio_input=null;
   AudioOutput audio_output=null;
   
   ToneInputStream tone=null;
   
   /** Costructs the audio launcher */
   public JAudioLauncher(RtpStreamSender rtp_sender, RtpStreamReceiver rtp_receiver, Log logger)
   {  log=logger;
      sender=rtp_sender;
      receiver=rtp_receiver;
   }


   /** Costructs the audio launcher */
   public JAudioLauncher(int local_port, String remote_addr, int remote_port, int direction, Log logger)
   {  log=logger;
      try
      {  socket=new DatagramSocket(local_port);
         dir=direction;
         // sender
         if (dir>=0)
         {  printLog("new audio sender to "+remote_addr+":"+remote_port,LogLevel.MEDIUM);
            //audio_input=new AudioInput();
            AudioFormat format=new AudioFormat(codec,sample_rate,8*sample_size,1,sample_size,sample_rate,big_endian);
            audio_input=new AudioInput(format);
            //sender=new RtpStreamSender(audio_input.getInputStream(),false,payload_type,frame_rate,frame_size,socket,remote_addr,remote_port);
            sender=new RtpStreamSender(audio_input.getInputStream(),true,payload_type,frame_rate,frame_size,socket,remote_addr,remote_port);
            sender.setSyncAdj(2);
         }
         // receiver
         if (dir<=0)
         {  printLog("new audio receiver on "+local_port,LogLevel.MEDIUM);
            //audio_output=new AudioOutput();
            AudioFormat format=new AudioFormat(codec,sample_rate,8*sample_size,1,sample_size,sample_rate,big_endian);
            audio_output=new AudioOutput(format);
            receiver=new RtpStreamReceiver(audio_output.getOuputStream(),socket);
         }
      }
      catch (Exception e) {  printException(e,LogLevel.HIGH);  }
   }


   /** Costructs the audio launcher */
   public JAudioLauncher(int local_port, String remote_addr, int remote_port, int direction, String audiofile_in, String audiofile_out, int sample_rate, int sample_size, int frame_size, Log logger)
   {  log=logger;
      frame_rate=sample_rate/frame_size;
      try
      {  socket=new DatagramSocket(local_port);
         dir=direction;
         // sender
         if (dir>=0 && audiofile_in!=null && audiofile_in.equals(JAudioLauncher.TONE))
         {  printLog("new audio sender to "+remote_addr+":"+remote_port,LogLevel.MEDIUM);
            printLog("Tone generator: "+tone_freq+" Hz");
            tone=new ToneInputStream(tone_freq,tone_amp,sample_rate,sample_size,ToneInputStream.PCM_LINEAR_UNSIGNED,big_endian);
            sender=new RtpStreamSender(tone,true,payload_type,frame_rate,frame_size,socket,remote_addr,remote_port);
         }
         else
         if (dir>=0 && audiofile_in!=null)
         {  printLog("new audio sender to "+remote_addr+":"+remote_port,LogLevel.MEDIUM);
            File file=new File(audiofile_in);
            if (audiofile_in.indexOf(".wav")>0)
            {  AudioFileFormat format=AudioSystem.getAudioFileFormat(file);
               printLog("File audio format: "+format);
               AudioInputStream input_stream=AudioSystem.getAudioInputStream(file);
               sender=new RtpStreamSender(input_stream,true,payload_type,frame_rate,frame_size,socket,remote_addr,remote_port);
            }
            else
            {  FileInputStream input_stream=new FileInputStream(file);
               sender=new RtpStreamSender(input_stream,true,payload_type,frame_rate,frame_size,socket,remote_addr,remote_port);
            }
         }
         else
         if (dir>=0)
         {  printLog("new audio sender to "+remote_addr+":"+remote_port,LogLevel.MEDIUM);
            //audio_input=new AudioInput();
            AudioFormat format=new AudioFormat(codec,sample_rate,8*sample_size,1,sample_size,sample_rate,big_endian);
            audio_input=new AudioInput(format);
            //sender=new RtpStreamSender(audio_input.getInputStream(),false,payload_type,frame_rate,frame_size,socket,remote_addr,remote_port);
            sender=new RtpStreamSender(audio_input.getInputStream(),true,payload_type,frame_rate,frame_size,socket,remote_addr,remote_port);
            sender.setSyncAdj(2);
         }
         
         // receiver
         if (dir<=0 && audiofile_out!=null)
         {  printLog("new audio receiver on "+local_port,LogLevel.MEDIUM);
            File file=new File(audiofile_out);
            FileOutputStream output_stream=new FileOutputStream(file);
            receiver=new RtpStreamReceiver(output_stream,socket);
         }
         else
         if (dir<=0)
         {  printLog("new audio receiver on "+local_port,LogLevel.MEDIUM);
            //audio_output=new AudioOutput();
            AudioFormat format=new AudioFormat(codec,sample_rate,8*sample_size,1,sample_size,sample_rate,big_endian);
            audio_output=new AudioOutput(format);
            receiver=new RtpStreamReceiver(audio_output.getOuputStream(),socket);
         }
      }
      catch (Exception e) {  printException(e,LogLevel.HIGH);  }
   }


   /** Starts media application */
   public boolean startMedia()
   {  printLog("starting java audio..",LogLevel.HIGH);

      if (sender!=null)
      {  printLog("start sending",LogLevel.LOW);
         sender.start();
         if (audio_input!=null) audio_input.play();
      }
      if (receiver!=null)
      {  printLog("start receiving",LogLevel.LOW);
         receiver.start();
         if (audio_output!=null) audio_output.play();
      }
      
      return true;      
   }


   /** Stops media application */
   public boolean stopMedia()
   {  printLog("halting java audio..",LogLevel.HIGH);    
      if (sender!=null)
      {  sender.halt(); sender=null;
         printLog("sender halted",LogLevel.LOW);
      }      
      if (audio_input!=null)
      {  audio_input.stop(); audio_output=null;
      }      
      if (receiver!=null)
      {  receiver.halt(); receiver=null;
         printLog("receiver halted",LogLevel.LOW);
      }      
      if (audio_output!=null)
      {  audio_output.stop(); audio_output=null;
      }
      // take into account the resilience of RtpStreamSender
      // (NOTE: it does not take into acconunt the resilience of RtpStreamReceiver; this can cause SocketException)
      try { Thread.sleep(RtpStreamReceiver.SO_TIMEOUT); } catch (Exception e) {}
      socket.close();
      return true;
   }



   // ****************************** Logs *****************************

   /** Adds a new string to the default Log */
   private void printLog(String str)
   {  printLog(str,LogLevel.HIGH);
   }


   /** Adds a new string to the default Log */
   private void printLog(String str, int level)
   {  if (log!=null) log.println("AudioLauncher: "+str,level+SipStack.LOG_LEVEL_UA);  
      if (level<=LogLevel.HIGH) System.out.println("AudioLauncher: "+str);
   }

   /** Adds the Exception message to the default Log */
   void printException(Exception e,int level)
   {  if (log!=null) log.printException(e,level+SipStack.LOG_LEVEL_UA);
      if (level<=LogLevel.HIGH) e.printStackTrace();
   }

}
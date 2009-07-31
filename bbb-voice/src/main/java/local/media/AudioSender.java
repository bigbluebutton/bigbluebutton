package local.media;


import javax.sound.sampled.AudioFormat;
import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.AudioInputStream;
import javax.sound.sampled.AudioFileFormat;
import java.io.File;
import java.io.FileInputStream;


/** AudioSender is a pure-java audio stream sender.
  * It uses the javax.sound library (package).
  */
public class AudioSender
{

   // ******************************* MAIN *******************************

   /** The main method. */
   public static void main(String[] args)
   {
      String daddr=null;
      int dport=0;
      int payload_type=0;

      int tone_freq=500;
      double tone_amp=1.0;
      int sample_rate=8000;
      int sample_size=1;
      int frame_size=500;
      int frame_rate; //=sample_rate/(frame_size/sample_size);
      // byte_rate=frame_rate/frame_size=8000
      boolean linear_signed=false; 
      boolean pcmu=false;
      boolean big_endian=false;
      String filename=null;
      boolean sound=true;

      boolean help=true;

      for (int i=0; i<args.length; i++)
      {
         if (args[i].equals("-h"))
         {  break;
         }
         if (i==0 && args.length>1)
         {  daddr=args[i];
            dport=Integer.parseInt(args[++i]);
            help=false;
            continue;
         }
         if (args[i].equals("-p") && args.length>(i+1))
         {  payload_type=Integer.parseInt(args[++i]);
            continue;
         }
         if (args[i].equals("-F") && args.length>(i+1))
         {  sound=false;
            filename=args[++i];
            continue;
         }
         if (args[i].equals("-T") && args.length>(i+1))
         {  sound=false;
            tone_freq=Integer.parseInt(args[++i]);
            continue;
         }
         if (args[i].equals("-A") && args.length>(i+1))
         {  tone_amp=Double.parseDouble(args[++i]);
            continue;
         }
         if (args[i].equals("-S") && args.length>(i+2))
         {  sample_rate=Integer.parseInt(args[++i]);
            sample_size=Integer.parseInt(args[++i]);
            continue;
         }      
         if (args[i].equals("-L") && args.length>(i+1))
         {  frame_size=Integer.parseInt(args[++i]);
            continue;
         }      
         if (args[i].equals("-Z"))
         {  linear_signed=true;
            continue;
         }
         if (args[i].equals("-U"))
         {  pcmu=true;
            continue;
         }
         if (args[i].equals("-E"))
         {  big_endian=true;
            continue;
         }      

         // else, do:
         System.out.println("unrecognized param '"+args[i]+"'\n");
         help=true;
      }
              
      if (help)
      {  System.out.println("usage:\n  java AudioSender <dest_addr> <dest_port> [options]");
         System.out.println("   options:");
         System.out.println("   -h               this help");
         System.out.println("   -p <type>        payload type");
         System.out.println("   -F <audio_file>  sends an audio file");
         System.out.println("   -T <frequency>   sends a tone of given frequency [Hz]");
         System.out.println("   -A <amplitude>   sets an amplitude factor [0:1]");
         System.out.println("   -S <rate> <size> sample rate [B/s], and size [B]");
         System.out.println("   -L <size>        frame size");
         System.out.println("   -Z               uses PCM linear signed format (linear unsigned is used as default)");
         System.out.println("   -U               uses PCMU format");
         System.out.println("   -E               uses big endian format");
         System.exit(0);
      }         
            
      frame_rate=sample_rate/(frame_size/sample_size);

      AudioFormat.Encoding codec;

      if (pcmu) codec=AudioFormat.Encoding.ULAW;
      else
      if (linear_signed) codec=AudioFormat.Encoding.PCM_SIGNED;
      else
         codec=AudioFormat.Encoding.PCM_UNSIGNED; // default

      int tone_codec=ToneInputStream.PCM_LINEAR_UNSIGNED;
      if (linear_signed) tone_codec=ToneInputStream.PCM_LINEAR_SIGNED;

      try
      {  RtpStreamSender sender;
         AudioInput audio_input=null;
         
         if (sound) AudioInput.initAudioLine();
         
         if (sound)
         {  AudioFormat format=new AudioFormat(codec,sample_rate,8*sample_size,1,sample_size,sample_rate,big_endian);
            System.out.println("System audio format: "+format);
            audio_input=new AudioInput(format);
            sender=new RtpStreamSender(audio_input.getInputStream(),false,payload_type,frame_rate,frame_size,daddr,dport);
         }
         else
         if (filename!=null)
         {  File file=new File(filename);
            if (filename.indexOf(".wav")>0)
            {  AudioFileFormat format=AudioSystem.getAudioFileFormat(file);
               System.out.println("File audio format: "+format);
               AudioInputStream audio_input_stream=AudioSystem.getAudioInputStream(file);
               sender=new RtpStreamSender(audio_input_stream,true,payload_type,frame_rate,frame_size,daddr,dport);
            }
            else
            {  FileInputStream input_stream=new FileInputStream(file);
               sender=new RtpStreamSender(input_stream,true,payload_type,frame_rate,frame_size,daddr,dport);
            }
         }
         else
         {  ToneInputStream tone=new ToneInputStream(tone_freq,tone_amp,sample_rate,sample_size,tone_codec,big_endian);
            sender=new RtpStreamSender(tone,true,payload_type,frame_rate,frame_size,daddr,dport);
         }
         if (sender!=null)
         {  
            sender.start();      
            if (sound) audio_input.play();
         
            System.out.println("Press 'Return' to stop");
            System.in.read();
         
            sender.halt();
            if (sound) audio_input.stop();
            if (sound) AudioInput.closeAudioLine();
         }
         else
         {  System.out.println("Error creating the rtp stream.");
         }
      }
      catch (Exception e) { e.printStackTrace(); }
   }

}
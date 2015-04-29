package local.media;


import javax.sound.sampled.AudioFormat;
import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.AudioFileFormat;
import java.io.File;
import java.io.FileOutputStream;


/** AudioReceiver is a pure-java audio stream receiver.
  * It uses the javax.sound library (package).
  */
public class AudioReceiver
{

   // ******************************* MAIN *******************************

   /** The main method. */
   public static void main(String[] args)
   {
      int port=0;

      int sample_rate=8000;
      int sample_size=1;
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
         if (i==0)
         {  port=Integer.parseInt(args[i]);
            help=false;
            continue;
         }
         if (args[i].equals("-F") && args.length>(i+1))
         {  sound=false;
            filename=args[++i];
            continue;
         }
         if (args[i].equals("-S") && args.length>(i+2))
         {  sample_rate=Integer.parseInt(args[++i]);
            sample_size=Integer.parseInt(args[++i]);
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
      {  System.out.println("usage:\n  java AudioReceiver <local_port> [options]");
         System.out.println("   options:");
         System.out.println("   -h               this help");
         System.out.println("   -F <audio_file>  records to audio file");
         System.out.println("   -S <rate> <size> sample rate [B/s], and size [B]");
         System.out.println("   -Z               uses PCM linear signed format (linear unsigned is used as default)");
         System.out.println("   -U               uses PCMU format");
         System.out.println("   -E               uses big endian format");
         System.exit(0);
      }         
            
      AudioFormat.Encoding codec;

      if (pcmu) codec=AudioFormat.Encoding.ULAW;
      else
      if (linear_signed) codec=AudioFormat.Encoding.PCM_SIGNED;
      else
         codec=AudioFormat.Encoding.PCM_UNSIGNED;

      try
      {  RtpStreamReceiver receiver;    
         AudioOutput audio_output=null;
         if (sound) AudioOutput.initAudioLine(); 
                         
         if (sound)
         {  AudioFormat format=new AudioFormat(codec,sample_rate,8*sample_size,1,sample_size,sample_rate,big_endian);
            audio_output=new AudioOutput(format);
            receiver=new RtpStreamReceiver(audio_output.getOuputStream(),port);
         }
         else
         //if (filename!=null)
         {  File file=new File(filename);
            /*
            AudioFileFormat format=AudioSystem.getAudioFileFormat(file);
            System.out.println("File audio format: "+format);
            OutputStream output_stream=new OutputStream() { public void write(int b) {} };
            receiver=new RtpStreamReceiver(output_stream,port);
            */
            FileOutputStream output_stream=new FileOutputStream(file);
            receiver=new RtpStreamReceiver(output_stream,port);
         }

         receiver.start();
         if (sound) audio_output.play();

         System.out.println("Press 'Return' to stop");
         System.in.read();
         
         receiver.halt();
         if (sound) audio_output.stop();
         if (sound) AudioOutput.closeAudioLine();
      }
      catch (Exception e) { e.printStackTrace(); }   
   }

}


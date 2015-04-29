package local.ua;


import local.media.JMediaReceiver;
import local.media.JMediaSender;
import org.zoolu.sip.provider.SipStack;
import org.zoolu.tools.Log;
import org.zoolu.tools.LogLevel;
//import org.zoolu.tools.Parser;

//import java.util.Iterator;
//import java.util.Vector;
//import java.io.*;


/** Audio launcher */
public class JMFAudioLauncher implements MediaLauncher
{
   /** Event logger. */
   Log log=null;

   /** Runtime media process */
   Process media_process=null;
   
   int localport;
   int remoteport;
   String remoteaddr;
   
   int dir; // duplex= 0, recv-only= -1, send-only= +1; 

   JMediaSender sender=null;
   JMediaReceiver receiver=null;

   /** Costructs the audio launcher */
   public JMFAudioLauncher(int local_port, String remote_addr, int remote_port, int direction, Log logger)
   {  log=logger;
      localport=local_port;
      remoteport=remote_port;
      remoteaddr=remote_addr;
      // Patch for working with JMF with local streams
      if (remote_addr.startsWith("127."))
      {  printLog("Patch for JMF: replaced local destination address "+remote_addr+" with 255.255.255.255");
         remote_addr="255.255.255.255";
      }
      dir=direction;
      if (dir>=0) sender=new JMediaSender("audio",null,remote_addr,remote_port);
      if (dir<=0) receiver=new JMediaReceiver("audio",local_port,null);
   }

   /** Starts media application */
   public boolean startMedia()
   {  printLog("launching JMF-Audio...");
      String err1=null, err2=null;

      if (sender!=null) err1=sender.start();
      if (err1!=null) printLog("Error trying to send audio stream: "+err1);    

      if (receiver!=null) err2=receiver.start();
      if (err2!=null) printLog("Error trying to receive audio stream: "+err2);    

      return (err1==null && err2==null);      
   }

   /** Stops media application */
   public boolean stopMedia()
   {  String err1=null, err2=null;

      if (sender!=null) err1=sender.stop();      
      if (err1!=null) printLog("Error stopping audio sender: "+err1);    

      if (receiver!=null) err2=receiver.stop();      
      if (err2!=null) printLog("Error stopping audio receiver: "+err2);    

      return (err1==null && err2==null);      
   }



   // ****************************** Logs *****************************

   /** Adds a new string to the default Log */
   private void printLog(String str)
   {  if (log!=null) log.println("JMFAudioLauncher: "+str,SipStack.LOG_LEVEL_UA+LogLevel.HIGH);  
      //if (LOG_LEVEL<=LogLevel.HIGH) System.out.println("JMFAudioLauncher: "+str);
      System.out.println("JMFAudioLauncher: "+str);
   }
}
package local.ua;


import local.media.JMediaSender;
import local.media.JVisualReceiver;
import org.zoolu.sip.provider.SipStack;
import org.zoolu.tools.Log;
import org.zoolu.tools.LogLevel;
//import org.zoolu.tools.Parser;

//import java.util.Iterator;
//import java.util.Vector;
//import java.io.*;


/** Video launcher */
public class JMFVideoLauncher implements MediaLauncher
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
   JVisualReceiver receiver=null;
   
   /** Costructs the video launcher */
   public JMFVideoLauncher(int local_port, String remote_addr, int remote_port, int direction, Log logger)
   {  log=logger;
      localport=local_port;
      remoteport=remote_port;
      remoteaddr=remote_addr;
      dir=direction;
      // Patch for working with JMF with local streams
      if (remote_addr.startsWith("127."))
      {  printLog("Patch for JMF: replaced local destination address "+remote_addr+" with 255.255.255.255");
         remote_addr="255.255.255.255";
      }
      if (dir>=0) sender=new JMediaSender("video",null,remote_addr,remote_port);
      //if (dir>=0) sender=new JMediaSender("video","file://C:\\users\\mp3\\__video\\cartoons\\ufo_robot.mpg",remote_addr,remote_port);
      if (dir<=0) receiver=new JVisualReceiver("video",local_port);
   }

   /** Starts media application */
   public boolean startMedia()
   {  printLog("launching JMF-Video...");
      String err1=null, err2=null;

      if (sender!=null) err1=sender.start();
      if (err1!=null) printLog("Error trying to send video stream: "+err1);    

      if (receiver!=null) err2=receiver.start();
      if (err2!=null) printLog("Error trying to receive video stream: "+err2);    

      return (err1==null && err2==null);      
   }

   /** Stops media application */
   public boolean stopMedia()
   {  String err1=null, err2=null;

      if (sender!=null) err1=sender.stop();      
      if (err1!=null) printLog("Error stopping video sender: "+err1);    

      if (receiver!=null) err2=receiver.stop();      
      if (err2!=null) printLog("Error stopping video receiver: "+err2);    

      return (err1==null && err2==null);      
   }



   // ****************************** Logs *****************************

   /** Adds a new string to the default Log */
   private void printLog(String str)
   {  if (log!=null) log.println("JMFVideoLauncher: "+str,SipStack.LOG_LEVEL_UA+LogLevel.HIGH);  
      //if (LOG_LEVEL<=LogLevel.HIGH) System.out.println("JMFVideoLauncher: "+str);
      System.out.println("JMFVideoLauncher: "+str);
   }

}
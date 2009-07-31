package local.ua;


import local.net.UdpRelay;
import org.zoolu.sip.provider.SipStack;
import org.zoolu.tools.Log;
import org.zoolu.tools.LogLevel;
//import tools.Parser;

//import java.util.Iterator;
//import java.util.Vector;
//import java.io.*;


/** RAT launcher */
public class RATLauncher implements MediaLauncher
{
   /** Event logger. */
   Log log=null;

   /** Runtime media process (RAT application) */
   Process media_process=null;
   
   int localport;
   int remoteport;
   String remoteaddr;
   
   /** Media application command */
   String command;

   /** Costructs the RAT launcher 
     * <p> <i>attributes</i> is a Vector of the sdp media attributes */
   public  RATLauncher(String rat_comm, int local_port, String remote_addr, int remote_port, Log logger)
   {  log=logger;
      command=rat_comm;
      localport=local_port;
      remoteport=remote_port;
      remoteaddr=remote_addr;
   }

   /** Starts media application */
   public boolean startMedia()
   {  // udp flow adaptation for RAT application
      if (localport!=remoteport) 
      {  printLog("UDP local relay: src_port="+localport+", dest_port="+remoteport);
         printLog("UDP local relay: src_port="+(localport+1)+", dest_port="+(remoteport+1));
         new UdpRelay(localport,"127.0.0.1",remoteport,null);
         new UdpRelay(localport+1,"127.0.0.1",remoteport+1,null);  
      }
      else
      {  printLog("local_port==remote_port --> no UDP relay is needed");
      }

      //debug...
      printLog("launching RAT-Audio...");

      String cmds[] = {"","",""};
      cmds[0] = command;
      cmds[1] = remoteaddr+"/"+remoteport;

      // try to start the RAT
      try
      {  media_process=Runtime.getRuntime().exec(cmds);
         return true;
      }
      catch (Exception e)
      {  e.printStackTrace();
         return false;
      }          
   }

   /** Stops media application */
   public boolean stopMedia()
   {  if (media_process!=null) media_process.destroy();
      return true;
   }


   // ****************************** Logs *****************************

   /** Adds a new string to the default Log */
   private void printLog(String str)
   {  if (log!=null) log.println("RATLauncher: "+str,SipStack.LOG_LEVEL_UA+LogLevel.HIGH);  
      //if (LOG_LEVEL<=LogLevel.HIGH) System.out.println("RATLauncher: "+str);
      System.out.println("RATLauncher: "+str);
   }
      
}
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

package local.ua;


import org.zoolu.sip.address.*;
import org.zoolu.sip.provider.SipStack;
import org.zoolu.sip.provider.SipProvider;
import org.zoolu.tools.Log;
import org.zoolu.tools.LogLevel;
import java.io.*;


/** MiniJukebox is a simple audio server that automatically responds to all incoming calls
  * and sends the audio file as selected by the caller through the request-line parameter
  * 'audiofile'.
  */
public class MiniJukebox extends CommandLineUA
{           

   public static String PARAM_RESOURCE="resource";

   /** Costructs a new MiniJukebox. */
   public MiniJukebox(SipProvider sip_provider, UserAgentProfile user_profile)
   {  super(sip_provider,user_profile);
   }


   // ******************* UserAgent callback functions *******************

   /** When a new call is incoming */
   public void onUaCallIncoming(UserAgent ua, NameAddress callee, NameAddress caller)
   {  printOut("incoming call from "+caller.toString());
      String audio_file=callee.getAddress().getParameter(PARAM_RESOURCE);
      if (audio_file!=null)
      {  if (new File(audio_file).isFile())
         {  user_profile.send_file=audio_file;
         }
      }
      if (user_profile.send_file!=null) ua.accept();      
      else ua.hangup();
   }
   
   // ******************************* MAIN *******************************

   /** The main method. */
   public static void main(String[] args)
   {         
      String file=null;
      boolean opt_regist=false;
      boolean opt_unregist=false;
      boolean opt_unregist_all=false;
      int     opt_expires=0;
      int     opt_hangup_time=0;
      int     opt_media_port=21068;
      String  opt_send_file=null;
      boolean opt_no_prompt=false;
 
      try
      {  
         for (int i=0; i<args.length; i++)
         {
            if (args[i].equals("-f") && args.length>(i+1))
            {  file=args[++i];
               continue;
            }
            if (args[i].equals("-p") && args.length>(i+1)) // set the local port
            {  opt_media_port=Integer.parseInt(args[++i]);
               continue;
            }
            if (args[i].equals("-g") && args.length>(i+1)) // registrate the contact url
            {  opt_regist=true;
               String time=args[++i];
               if (time.charAt(time.length()-1)=='h') opt_expires=Integer.parseInt(time.substring(0,time.length()-1))*3600;
               else opt_expires=Integer.parseInt(time);
               continue;
            }
            if (args[i].equals("-u")) // unregistrate the contact url
            {  opt_unregist=true;
               continue;
            }
            if (args[i].equals("-z")) // unregistrate all contact urls
            {  opt_unregist_all=true;
               continue;
            }
            if (args[i].equals("-t") && args.length>(i+1)) // set the call duration
            {  opt_hangup_time=Integer.parseInt(args[++i]);
               continue;
            }
            if (args[i].equals("--send-file")) // send audio file
            {  opt_send_file=args[++i];
               continue;
            }
            if (args[i].equals("--no-prompt")) // do not prompt
            {  opt_no_prompt=true;
               continue;
            }
            
            // else, do:
            if (!args[i].equals("-h"))
               System.out.println("unrecognized param '"+args[i]+"'\n");
            
            System.out.println("usage:\n   java MiniJukebox [options]");
            System.out.println("   options:");
            System.out.println("   -h                 this help");
            System.out.println("   -f <config_file>   specifies a configuration file");
            System.out.println("   -t <secs>          specipies the call duration (0 means manual hangup)");
            System.out.println("   -p <port>          local media port");
            System.out.println("   -g <time>          registers the contact URL with the registrar server");
            System.out.println("                      where time is the duration of the registration, and can be");
            System.out.println("                      in seconds (default) or hours ( -r 7200 is the same as -r 2h )");
            System.out.println("   -u                 unregisters the contact URL with the registrar server");
            System.out.println("                      (is the same as -g 0)");
            System.out.println("   -z                 unregisters ALL the contact URLs");
            System.out.println("   --send-file <file> default audio file");
            System.out.println("   --no-prompt        do not prompt");
            System.exit(0);
         }
                     
         SipStack.init(file);
         SipProvider sip_provider=new SipProvider(file);
         UserAgentProfile user_profile=new UserAgentProfile(file);
         
         if (opt_regist) user_profile.do_register=true;
         if (opt_unregist) user_profile.do_unregister=true;
         if (opt_unregist_all) user_profile.do_unregister_all=true;
         if (opt_expires>0) user_profile.expires=opt_expires;
         if (opt_hangup_time>0) user_profile.hangup_time=opt_hangup_time;
         if (opt_media_port!=21068) user_profile.video_port=(user_profile.audio_port=opt_media_port)+2;
         if (opt_send_file!=null) user_profile.send_file=opt_send_file;
         if (opt_no_prompt) user_profile.no_prompt=true;
         user_profile.accept_time=0;
         user_profile.audio=true;
         user_profile.send_only=true;             
     
         new MiniJukebox(sip_provider,user_profile);
      }
      catch (Exception e)  {  e.printStackTrace(); System.exit(0);  }
   }    
   

   // ****************************** Logs *****************************

   /** Adds a new string to the default Log */
   void printLog(String str)
   {  printLog(str,LogLevel.HIGH);
   }

   /** Adds a new string to the default Log */
   void printLog(String str, int level)
   {  if (log!=null) log.println("Jukebox: "+str,level+SipStack.LOG_LEVEL_UA);  
   }

   /** Adds the Exception message to the default Log */
   void printException(Exception e,int level)
   {  if (log!=null) log.printException(e,level+SipStack.LOG_LEVEL_UA);
   }

}

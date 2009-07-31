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


/** Jukebox is a simple audio server that automatically responds to all incoming calls
  * and sends the audio file as selected by the caller through the request-line parameter
  * 'audiofile'.
  */
public class Jukebox implements UserAgentListener, RegisterAgentListener
{           

   public static String PARAM_RESOURCE="resource";

   /** Event logger. */
   Log log;
   
   /** UserAgentProfile */
   UserAgentProfile user_profile;
         
   /** SipProvider */
   SipProvider sip_provider;

   /** Standard output */
   PrintStream stdout=null; 


   /** Costructs a new Jukebox. */
   public Jukebox(SipProvider sip_provider, UserAgentProfile user_profile)
   {  log=sip_provider.getLog();
      this.user_profile=user_profile;
      this.sip_provider=sip_provider;

      if (user_profile.contact_url==null) user_profile.contact_url=user_profile.username+"@"+sip_provider.getViaAddress()+":"+sip_provider.getPort();

      if (!user_profile.no_prompt) stdout=System.out; 

      if (user_profile.do_register)
      {  RegisterAgent ra=new RegisterAgent(sip_provider,user_profile.from_url,user_profile.contact_url,user_profile.username,user_profile.realm,user_profile.passwd,this);
         ra.loopRegister(user_profile.expires,user_profile.expires/2);
      }         
      
      UserAgent ua=new UserAgent(sip_provider,user_profile,this);      
      ua.listen(); 
   } 


   // ******************* UserAgent callback functions ******************

   /** When a new call is incoming */
   public void onUaCallIncoming(UserAgent ua, NameAddress callee, NameAddress caller)
   {  printOut("Incoming Call from "+caller.toString());

      String audio_file=callee.getAddress().getParameter(PARAM_RESOURCE);
      if (audio_file!=null) if (new File(audio_file).isFile()) user_profile.send_file=audio_file;

      if (user_profile.send_file!=null) ua.accept(); else ua.hangup();

      user_profile.audio_port++;
      ua=new UserAgent(sip_provider,user_profile,this);      
      ua.listen(); 
   }
   
   /** When an ougoing call is remotly ringing */
   public void onUaCallRinging(UserAgent ua)
   {  
   }

   /** When an ougoing call has been accepted */
   public void onUaCallAccepted(UserAgent ua)
   {
   }
   
   /** When a call has been trasferred */
   public void onUaCallTrasferred(UserAgent ua)
   {  
   }

   /** When an incoming call has been cancelled */
   public void onUaCallCancelled(UserAgent ua)
   {
   }

   /** When an ougoing call has been refused or timeout */
   public void onUaCallFailed(UserAgent ua)
   {  
   }

   /** When a call has been locally or remotely closed */
   public void onUaCallClosed(UserAgent ua)
   {  
   }


   // **************** RegisterAgent callback functions *****************

   /** When a UA has been successfully (un)registered. */
   public void onUaRegistrationSuccess(RegisterAgent ra, NameAddress target, NameAddress contact, String result)
   {  printLog("Registration success: "+result,LogLevel.HIGH);
   }

   /** When a UA failed on (un)registering. */
   public void onUaRegistrationFailure(RegisterAgent ra, NameAddress target, NameAddress contact, String result)
   {  printLog("Registration failure: "+result,LogLevel.HIGH);
   }

   
   // ******************************* MAIN *******************************

   /** The main method. */
   public static void main(String[] args)
   {         
      String file=null;
      boolean opt_regist=false;
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
            if (args[i].equals("-g") && args.length>(i+1)) // registrate the contact url
            {  opt_regist=true;
               String time=args[++i];
               if (time.charAt(time.length()-1)=='h') opt_expires=Integer.parseInt(time.substring(0,time.length()-1))*3600;
               else opt_expires=Integer.parseInt(time);
               continue;
            }
            if (args[i].equals("-p") && args.length>(i+1)) // set the local port
            {  opt_media_port=Integer.parseInt(args[++i]);
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
            
            System.out.println("usage:\n   java Jukebox [options]");
            System.out.println("   options:");
            System.out.println("   -h                 this help");
            System.out.println("   -f <config_file>   specifies a configuration file");
            System.out.println("   -g <time>          registers the contact URL with the registrar server");
            System.out.println("                      where time is the duration of the registration, and can be");
            System.out.println("                      in seconds (default) or hours ( -g 7200 is the same as -g 2h )");
            System.out.println("   -t <secs>          specipies the call duration (0 means manual hangup)");
            System.out.println("   -p <port>          local media port");
            System.out.println("   --send-file <file> default audio file");
            System.out.println("   --no-prompt        do not prompt");
            System.exit(0);
         }
                     
         SipStack.init(file);
         SipProvider sip_provider=new SipProvider(file);
         UserAgentProfile user_profile=new UserAgentProfile(file);
         
         if (opt_regist) user_profile.do_register=true;
         if (opt_expires>0) user_profile.expires=opt_expires;
         if (opt_hangup_time>0) user_profile.hangup_time=opt_hangup_time;
         if (opt_media_port!=21068) user_profile.video_port=(user_profile.audio_port=opt_media_port)+2;
         if (opt_send_file!=null) user_profile.send_file=opt_send_file;
         if (opt_no_prompt) user_profile.no_prompt=true;     
         user_profile.audio=true;
         user_profile.send_only=true;             

         new Jukebox(sip_provider,user_profile);
      }
      catch (Exception e)  {  e.printStackTrace(); System.exit(0);  }
   }    
   

   // ****************************** Logs *****************************

   /** Print to stantard output. */
   void printOut(String str)
   {  if (stdout!=null) System.out.println(str);
   }

   /** Adds a new string to the default Log */
   void printLog(String str)
   {  printLog(str,LogLevel.HIGH);
   }

   /** Adds a new string to the default Log */
   void printLog(String str, int level)
   {  if (log!=null) log.println("Jukebox: "+str,level+SipStack.LOG_LEVEL_UA);  
   }

}

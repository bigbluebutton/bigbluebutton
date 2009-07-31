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
import org.zoolu.sip.provider.*;
import org.zoolu.tools.Log;
import org.zoolu.tools.LogLevel;

import java.io.*;


/** Simple command-line Presence Agent (PA).
  * It allows a user to subscribe for a presence service and/or
  * respond to subscription requests, using a command-line interface.
  */
public class CommandLinePA implements PresenceAgentListener, RegisterAgentListener
{     
   /** Event logger. */
   Log log;
   
   /** Presence Agent */
   PresenceAgent pa;

   /** Register Agent */
   RegisterAgent ra;

   /** Remote presentity. */
   //NameAddress remote_presentity;

   /** Standard input */
   BufferedReader stdin=null; 
         
   /** Standard output */
   PrintStream stdout=null; 
   
   
   /** Costructs a new CommandLinePA. */
   public CommandLinePA(SipProvider sip_provider, UserAgentProfile user_profile)
   {  log=sip_provider.getLog();
      pa=new PresenceAgent(sip_provider,user_profile,this);
      ra=new RegisterAgent(sip_provider,user_profile.from_url,user_profile.contact_url,this);

      if (!user_profile.no_prompt) stdin=new BufferedReader(new InputStreamReader(System.in)); 
      if (!user_profile.no_prompt) stdout=System.out;
   }


   /** Register with the registrar server. */
   public void subscribe(String presentity)
   {  pa.subscribe(presentity,SipStack.default_expires);
   }


   /** Register with the registrar server. */
   public void unsubscribe(String presentity)
   {  pa.subscribe(presentity,0);
   }


   /** Register with the registrar server. */
   public void register(int expire_time)
   {  ra.register(expire_time);
   }


   /** Unregister with the registrar server */
   public void unregister()
   {  ra.unregister();
   }


   /** Unregister all contacts with the registrar server */
   public void unregisterall()
   {  ra.unregisterall();
   }


   // *********************** callback functions *********************
 
   /** When a new SUBSCRIBE is received. */
   public void onPaSubscriptionRequest(PresenceAgent pa, NameAddress presentity, NameAddress watcher)
   {  printLog("Subscription request from "+watcher,LogLevel.HIGH);
      pa.accept();
      if (pa.user_profile.accept_time>=0)
      {  pa.activate();
      }
      else
      {  if (stdin!=null)
         {  printOut("Do you want to activate the subscription? [yes/no]");
            String line=readLine();
            if (line.toLowerCase().startsWith("n"))
            {  pa.terminate();
            }
            else
            {  pa.activate();             
            }
         }
         else pa.terminate();
      }
   }
   
   /** When a subscription request successes. */
   public void onPaSubscriptionSuccess(PresenceAgent pa, NameAddress presentity)
   {  printLog("Subscription for "+presentity+" accepted. ",LogLevel.HIGH);
   }
   
   /** When a subscription terminates. */
   public void onPaSubscriptionTerminated(PresenceAgent pa, NameAddress presentity, String reason)
   {  printLog("Subscription for "+presentity+" terminated (reason: "+reason+").",LogLevel.HIGH);
   }

   /** When a new NOTIFY is received. */
   public void onPaNotificationRequest(PresenceAgent pa, NameAddress recipient, NameAddress notifier, String state, String content_type, String body)
   {  if (body!=null) printLog("Notification: "+body,LogLevel.HIGH);
      else printLog("Notification: "+state,LogLevel.HIGH);
   }

   /** When a subscription request successes. */
   public void onPaNotificationFailure(PresenceAgent pa, NameAddress recipient, String reason)
   {  printLog("Notification failure (reason: "+reason+").",LogLevel.HIGH);
   }
 
   /** When a UA has been successfully (un)registered. */
   public void onUaRegistrationSuccess(RegisterAgent ra, NameAddress target, NameAddress contact, String result)
   {  printLog("Registration success: "+result,LogLevel.HIGH);
   }

   /** When a UA failed on (un)registering. */
   public void onUaRegistrationFailure(RegisterAgent ra, NameAddress target, NameAddress contact, String result)
   {  printLog("Registration failure: "+result,LogLevel.HIGH);
   }


   // ***************************** MAIN *****************************
   
   /** The main method. */
   public static void main(String[] args)
   {  
         
      String file=null;
      boolean opt_regist=false;
      boolean opt_unregist=false;
      boolean opt_unregist_all=false;
      int     opt_expires=0;
      String  opt_subscribe_for=null;      
      int     opt_accept_time=-1;      
      boolean opt_no_prompt=false;
      
      for (int i=0; i<args.length; i++)
      {  if (args[i].equals("-f") && args.length>(i+1))
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
         if (args[i].equals("-u")) // unregistrate the contact url
         {  opt_unregist=true;
            continue;
         }
         if (args[i].equals("-z")) // unregistrate all contact urls
         {  opt_unregist_all=true;
            continue;
         }
         if (args[i].equals("-y") && args.length>(i+1)) // set automatic accept time
         {  opt_accept_time=Integer.parseInt(args[++i]);
            continue;
         }
         if (args[i].equals("-s") && args.length>(i+1)) // sebscribe for a presentity
         {  opt_subscribe_for=args[++i];
            continue;
         }
         if (args[i].equals("--no-prompt")) // do not prompt
         {  opt_no_prompt=true;
            continue;
         }
         // else, do:
         if (!args[i].equals("-h"))
            System.out.println("unrecognized param '"+args[i]+"'\n");
         
         System.out.println("usage:\n   java CommandLinePA [options]");
         System.out.println("   options:");
         System.out.println("   -h               this help");
         System.out.println("   -f <config_file> specifies a configuration file");
         System.out.println("   -g <time>        registers the contact URL with the registrar server");
         System.out.println("                    where time is the duration of the registration, and can be");
         System.out.println("                    in seconds (default) or hours ( -r 7200 is the same as -r 2h )");
         System.out.println("   -u               unregisters the contact URL with the registrar server");
         System.out.println("                    (is the same as -r 0)");
         System.out.println("   -z               unregisters ALL the contact URLs");
         System.out.println("   -s <presentity>  subscribe for the given presentity");
         System.out.println("   -y <secs>        auto accept time");
         System.out.println("   --no-prompt         do not prompt");
         System.exit(0);
      }            
            
      SipStack.init(file);
      UserAgentProfile user_profile=new UserAgentProfile(file);         
      
      if (opt_regist) user_profile.do_register=true;
      if (opt_unregist) user_profile.do_unregister=true;
      if (opt_unregist_all) user_profile.do_unregister_all=true;
      if (opt_accept_time>=0) user_profile.accept_time=opt_accept_time;
      if (opt_no_prompt) user_profile.no_prompt=true;


      CommandLinePA command_pa=new CommandLinePA(new SipProvider(file),user_profile);

      // do..
      if (user_profile.do_unregister_all)
      {  command_pa.printLog("UNREGISTER ALL contact URLs");
         command_pa.unregisterall();
      } 

      if (user_profile.do_unregister)
      {  command_pa.printLog("UNREGISTER the contact URL");
         command_pa.unregister();
      } 

      if (user_profile.do_register)
      {  command_pa.printLog("REGISTRATION");
         command_pa.register(user_profile.expires);
      } 

      if (opt_subscribe_for!=null)
      {  command_pa.printLog("SUBSCRIPTION");
         command_pa.subscribe(opt_subscribe_for);
      } 
   } 
   
   // ****************************** Logs *****************************

   /** Read a new line from stantard input. */
   protected String readLine()
   {  try { if (stdin!=null) return stdin.readLine(); } catch (IOException e) {}
      return null;
   }

   /** Print to stantard output. */
   protected void printOut(String str)
   {  if (stdout!=null) System.out.println(str);
   }

   /** Adds a new string to the default Log */
   void printLog(String str)
   {  printLog(str,LogLevel.HIGH);
   }

   /** Adds a new string to the default Log */
   void printLog(String str, int level)
   {  if (log!=null) log.println("CommandLinePA: "+str,level+SipStack.LOG_LEVEL_UA); 
      printOut(str); 
   }
}
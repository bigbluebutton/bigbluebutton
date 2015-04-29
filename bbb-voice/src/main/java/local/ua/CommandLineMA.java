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


/** Simple command-line short-message UA.
  * It allows a user to send and receive short messages, using a command-line interface.
  */
public class CommandLineMA implements RegisterAgentListener, MessageAgentListener
{     
   /** Event logger. */
   Log log;
   
   /** Message Agent */
   MessageAgent ma;

   /** Register Agent */
   RegisterAgent ra;

   /** Remote user. */
   NameAddress remote_user;
   
   
   /** Costructs a new CommandLineMA. */
   public CommandLineMA(SipProvider sip_provider, UserAgentProfile user_profile)
   {  log=sip_provider.getLog();
      ma=new MessageAgent(sip_provider,user_profile,this);
      ma.receive();
      ra=new RegisterAgent(sip_provider,user_profile.from_url,user_profile.contact_url,this);
   }

   
   /** Gets the remote peer of the last received/sent message. */
   public String getRemoteUser()
   {  return remote_user.toString();
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


   /** Sends a new message. */
   public void send(String recipient, String subject, String text)
   {  ma.send(recipient,subject,text);
   }   


   // *********************** callback functions *********************
 
   /** When a new Message is received. */
   public void onMaReceivedMessage(MessageAgent ma, NameAddress sender, NameAddress recipient, String subject, String content_type, String content)
   {  remote_user=sender;
      printLog("NEW MESSAGE:");
      printLog("From: "+sender);
      if (subject!=null) printLog("Subject: "+subject);
      printLog("Content: "+content);
   }

   /** When a message delivery successes. */
   public void onMaDeliverySuccess(MessageAgent ma, NameAddress recipient, String subject, String result)
   {  //printLog("Delivery success: "+result,LogLevel.HIGH);
   }

   /** When a message delivery fails. */
   public void onMaDeliveryFailure(MessageAgent ma, NameAddress recipient, String subject, String result)
   {  //printLog("Delivery failure: "+result,LogLevel.HIGH);
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
      String remote_user=null;      
      boolean opt_regist=false;
      boolean opt_unregist=false;
      boolean opt_unregist_all=false;
      int     opt_expires=0;
      
      for (int i=0; i<args.length; i++)
      {  if (args[i].equals("-f") && args.length>(i+1))
         {  file=args[++i];
            continue;
         }
         if (args[i].equals("-c"))
         {  remote_user=args[++i];
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
         // else, do:
         if (!args[i].equals("-h"))
            System.out.println("unrecognized param '"+args[i]+"'\n");
         
         System.out.println("usage:\n   java CommandLineMA [options]");
         System.out.println("   options:");
         System.out.println("   -h               this help");
         System.out.println("   -f <config_file> specifies a configuration file");
         System.out.println("   -c <remote_user> the corresponding user");
         System.out.println("   -g <time>        registers the contact URL with the registrar server");
         System.out.println("                    where time is the duration of the registration, and can be");
         System.out.println("                    in seconds (default) or hours ( -r 7200 is the same as -r 2h )");
         System.out.println("   -u               unregisters the contact URL with the registrar server");
         System.out.println("                    (is the same as -r 0)");
         System.out.println("   -z               unregisters ALL the contact URLs");
         System.exit(0);
      }            
            
      SipStack.init(file);
      UserAgentProfile user_profile=new UserAgentProfile(file);         
      
      if (opt_regist) user_profile.do_register=true;
      if (opt_unregist) user_profile.do_unregister=true;
      if (opt_unregist_all) user_profile.do_unregister_all=true;

      CommandLineMA command_ma=new CommandLineMA(new SipProvider(file),user_profile);

      if (user_profile.do_unregister_all)
      {  command_ma.printLog("UNREGISTER ALL contact URLs");
         command_ma.unregisterall();
      } 

      if (user_profile.do_unregister)
      {  command_ma.printLog("UNREGISTER the contact URL");
         command_ma.unregister();
      } 

      if (user_profile.do_register)
      {  command_ma.printLog("REGISTRATION");
         command_ma.register(user_profile.expires);
      } 
      
      // start sending messages
      System.out.println("type the messages to send or 'exit' to quit:");
      while (true)
      {  try
         {  BufferedReader in=new BufferedReader(new InputStreamReader(System.in));
            String subject=null;
            String message=in.readLine();
            if (message.equals("exit")) System.exit(0);
            // else
            if (remote_user==null) remote_user=command_ma.getRemoteUser();
            command_ma.send(remote_user,subject,message);
         }
         catch (Exception e) {  e.printStackTrace();  }
      } 
   } 
   
   //**************************** Logs ****************************/

   /** Starting log level for this class */
   //private static final int LOG_OFFSET=SipStack.LOG_LEVEL_UA;

   /** Adds a new string to the default Log */
   private void printLog(String str)
   {  printLog(str,LogLevel.HIGH);
   }

   /** Adds a new string to the default Log */
   private void printLog(String str, int level)
   {  if (log!=null) log.println("CommandLineMA: "+str,level+SipStack.LOG_LEVEL_UA);
      System.out.println("MA: "+str);  
   }
}
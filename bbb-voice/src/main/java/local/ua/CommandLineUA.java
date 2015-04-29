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
import org.zoolu.net.SocketAddress;
import org.zoolu.tools.Log;
import org.zoolu.tools.LogLevel;

import java.io.*;


/** Simple command-line-based SIP user agent (UA).
  * It includes audio/video applications.
  * <p>It can use external audio/video tools as media applications.
  * Currently only RAT (Robust Audio Tool) and VIC are supported as external applications.
  */
public class CommandLineUA implements UserAgentListener, RegisterAgentListener
{           

   /** Event logger. */
   Log log;
   
   /** User Agent */
   UserAgent ua;

   /** Register Agent */
   RegisterAgent ra;
   
   /** UserAgentProfile */
   UserAgentProfile user_profile;
         
   /** Standard input */
   BufferedReader stdin=null; 
         
   /** Standard output */
   PrintStream stdout=null; 

        
   /** Costructs a UA with a default media port */
   public CommandLineUA(SipProvider sip_provider, UserAgentProfile user_profile)
   {  log=sip_provider.getLog();
      this.user_profile=user_profile;

      ua=new UserAgent(sip_provider,user_profile,this);      
      ra=new RegisterAgent(sip_provider,user_profile.from_url,user_profile.contact_url,user_profile.username,user_profile.realm,user_profile.passwd,this);

      if (!user_profile.no_prompt) stdin=new BufferedReader(new InputStreamReader(System.in)); 
      if (!user_profile.no_prompt) stdout=System.out;
      
      run();
   }


   /** Register with the registrar server.
     * @param expire_time expiration time in seconds */
   public void register(int expire_time)
   {  if (ra.isRegistering()) ra.halt();
      ra.register(expire_time);
   }


   /** Periodically registers the contact address with the registrar server.
     * @param expire_time expiration time in seconds
     * @param renew_time renew time in seconds
     * @param keepalive_time keep-alive packet rate (inter-arrival time) in milliseconds */
   public void loopRegister(int expire_time, int renew_time, long keepalive_time)
   {  if (ra.isRegistering()) ra.halt();
      ra.loopRegister(expire_time,renew_time,keepalive_time);
   }


   /** Unregister with the registrar server */
   public void unregister()
   {  if (ra.isRegistering()) ra.halt();
      ra.unregister();
   }


   /** Unregister all contacts with the registrar server */
   public void unregisterall()
   {  if (ra.isRegistering()) ra.halt();
      ra.unregisterall();
   }


   /** Makes a new call */
   public void call(String target_url)
   {  ua.hangup();
      ua.printLog("UAC: CALLING "+target_url);
      if (!ua.user_profile.audio && !ua.user_profile.video) ua.printLog("ONLY SIGNALING, NO MEDIA");       
      ua.call(target_url);       
   } 
         
         
   /** Receives incoming calls (auto accept) */
   public void listen()
   {  ua.printLog("UAS: WAITING FOR INCOMING CALL");
      if (!ua.user_profile.audio && !ua.user_profile.video) ua.printLog("ONLY SIGNALING, NO MEDIA");       
      ua.listen(); 
      printOut("digit the callee's URL to make a call or press 'enter' to exit");
   } 


   /** Starts the UA */
   void run()
   {
      try
      {  // Set the re-invite
         if (user_profile.re_invite_time>0)
         {  ua.reInvite(user_profile.contact_url,user_profile.re_invite_time);
         }

         // Set the transfer (REFER)
         if (user_profile.transfer_to!=null && user_profile.transfer_time>0)
         {  ua.callTransfer(user_profile.transfer_to,user_profile.transfer_time);
         }

         if (user_profile.do_unregister_all)
         // ########## unregisters ALL contact URLs
         {  ua.printLog("UNREGISTER ALL contact URLs");
            unregisterall();
         } 

         if (user_profile.do_unregister)
         // unregisters the contact URL
         {  ua.printLog("UNREGISTER the contact URL");
            unregister();
         } 

         if (user_profile.do_register)
         // ########## registers the contact URL with the registrar server
         {  ua.printLog("REGISTRATION");
            loopRegister(user_profile.expires,user_profile.expires/2,user_profile.keepalive_time);
         }         
         
         if (user_profile.call_to!=null)
         {  // UAC
            call(user_profile.call_to); 
            printOut("press 'enter' to hangup");
            readLine();
            ua.hangup();
            exit();
         }
         else
         {  // UAS
            if (user_profile.accept_time>=0) ua.printLog("UAS: AUTO ACCEPT MODE");
            listen();
            while (stdin!=null)
            {  String line=readLine();
               if (ua.statusIs(UserAgent.UA_INCOMING_CALL))
               {  if (line.toLowerCase().startsWith("n"))
                  {  ua.hangup();
                  }
                  else
                  {  ua.accept();             
                  }
               }
               else
               if (ua.statusIs(UserAgent.UA_IDLE))
               {  if (line!=null && line.length()>0)
                  {  call(line);
                  }
                  else
                  {  exit();
                  }
               }
               else
               if (ua.statusIs(UserAgent.UA_ONCALL))
               {  ua.hangup();
               }
            }
         }
      }
      catch (Exception e)  {  e.printStackTrace(); System.exit(0);  }
   }


   /** Exits */
   public void exit()
   {  try {  Thread.sleep(1000);  } catch (Exception e) {}
      System.exit(0);
   }


   // ******************* UserAgent callback functions ******************

   /** When a new call is incoming */
   public void onUaCallIncoming(UserAgent ua, NameAddress callee, NameAddress caller)
   {  if (ua.user_profile.redirect_to!=null) // redirect the call
      {  ua.redirect(ua.user_profile.redirect_to);
         printOut("call redirected to "+ua.user_profile.redirect_to);
      }         
      else
      if (ua.user_profile.accept_time>=0) // automatically accept the call
      {  //ua.accept();
         //printOut("press 'enter' to hangup"); 
         ua.automaticAccept(ua.user_profile.accept_time);
      }
      else         
      {  printOut("incoming call from "+caller.toString());
         printOut("accept? [yes/no]");
      }
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
   {  listen();
   }

   /** When an ougoing call has been refused or timeout */
   public void onUaCallFailed(UserAgent ua)
   {  if (ua.user_profile.call_to!=null) exit();
      else listen();
   }

   /** When a call has been locally or remotely closed */
   public void onUaCallClosed(UserAgent ua)
   {  if (ua.user_profile.call_to!=null) exit();
      else listen();     
   }


   // **************** RegisterAgent callback functions *****************

   /** When a UA has been successfully (un)registered. */
   public void onUaRegistrationSuccess(RegisterAgent ra, NameAddress target, NameAddress contact, String result)
   {  ua.printLog("Registration success: "+result,LogLevel.HIGH);
   }

   /** When a UA failed on (un)registering. */
   public void onUaRegistrationFailure(RegisterAgent ra, NameAddress target, NameAddress contact, String result)
   {  ua.printLog("Registration failure: "+result,LogLevel.HIGH);
   }
   

   // ***************************** MAIN *****************************


   /** The main method. */
   public static void main(String[] args)
   {         
      String file=null;
      boolean opt_regist=false;
      boolean opt_unregist=false;
      boolean opt_unregist_all=false;
      int     opt_expires=-1;
      long    opt_keepalive_time=-1;
      boolean opt_no_offer=false;
      String  opt_call_to=null;      
      int     opt_accept_time=-1;      
      int     opt_hangup_time=-1;
      String  opt_redirect_to=null;
      String  opt_transfer_to=null;
      int     opt_transfer_time=-1;
      int     opt_re_invite_time=-1;
      boolean opt_audio=false;
      boolean opt_video=false;
      int     opt_media_port=0;
      boolean opt_recv_only=false;
      boolean opt_send_only=false;
      boolean opt_send_tone=false;
      String  opt_send_file=null;
      String  opt_recv_file=null;
      boolean opt_no_prompt=false;
 
      String opt_from_url=null;
      String opt_contact_url=null;
      String opt_username=null;
      String opt_realm=null;
      String opt_passwd=null;

      int opt_debug_level=-1;
      String opt_log_path=null;
      String opt_outbound_proxy=null;
      String opt_via_addr=SipProvider.AUTO_CONFIGURATION;
      int opt_host_port=SipStack.default_port;

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
            if (args[i].equals("-u")) // unregistrate the contact url
            {  opt_unregist=true;
               continue;
            }
            if (args[i].equals("-z")) // unregistrate all contact urls
            {  opt_unregist_all=true;
               continue;
            }
            if (args[i].equals("-n")) // no offer in the invite
            {  opt_no_offer=true;
               continue;
            }
            if (args[i].equals("-c") && args.length>(i+1)) // make a call with a remote user (url)
            {  opt_call_to=args[++i];
               continue;
            }
            if (args[i].equals("-y") && args.length>(i+1)) // set automatic accept time
            {  opt_accept_time=Integer.parseInt(args[++i]);
               continue;
            }
            if (args[i].equals("-t") && args.length>(i+1)) // set the call duration
            {  opt_hangup_time=Integer.parseInt(args[++i]);
               continue;
            }
            if (args[i].equals("-i") && args.length>(i+1)) // set the re-invite time
            {  opt_re_invite_time=Integer.parseInt(args[++i]);
               continue;
            }
            if (args[i].equals("-r") && args.length>(i+1)) // redirect the call to a new url
            {  opt_accept_time=0;
               opt_redirect_to=args[++i];
               continue;
            }
            if (args[i].equals("-q") && args.length>(i+1)) // transfers the call to a new user (REFER)
            {  opt_transfer_to=args[++i];
               opt_transfer_time=Integer.parseInt(args[++i]);
               continue;
            }
            if (args[i].equals("-a")) // use audio
            {  opt_audio=true;
               continue;
            }
            if (args[i].equals("-v")) // use video
            {  opt_video=true;
               continue;
            }
            if (args[i].equals("-m") && args.length>(i+1)) // set the local media port
            {  opt_media_port=Integer.parseInt(args[++i]);
               continue;
            }
            if (args[i].equals("-o") && args.length>(i+1)) // outbound proxy
            {  opt_outbound_proxy=args[++i];
               continue;
            }
            if (args[i].equals("--via-addr") && args.length>(i+1)) // via addr
            {  opt_via_addr=args[++i];
               continue;
            }
            if (args[i].equals("-p") && args.length>(i+1)) // set the local sip port
            {  opt_host_port=Integer.parseInt(args[++i]);
               continue;
            }
            if (args[i].equals("--keep-alive") && args.length>(i+1)) // keep-alive
            {  opt_keepalive_time=Integer.parseInt(args[++i]);
               continue;
            }
            if (args[i].equals("--from-url") && args.length>(i+1)) // user's AOR
            {  opt_from_url=args[++i];
               continue;
            }
            if (args[i].equals("--contact-url") && args.length>(i+1)) // user's contact_url
            {  opt_contact_url=args[++i];
               continue;
            }
            if (args[i].equals("--username") && args.length>(i+1)) // username
            {  opt_username=args[++i];
               continue;
            }
            if (args[i].equals("--realm") && args.length>(i+1)) // realm
            {  opt_realm=args[++i];
               continue;
            }
            if (args[i].equals("--passwd") && args.length>(i+1)) // passwd
            {  opt_passwd=args[++i];
               continue;
            }
            if (args[i].equals("--recv-only")) // receive only mode
            {  opt_recv_only=true;
               continue;
            }
            if (args[i].equals("--send-only")) // send only mode
            {  opt_send_only=true;
               continue;
            }
            if (args[i].equals("--send-tone")) // send only mode
            {  opt_send_only=true;
               opt_send_tone=true;
               continue;
            }
            if (args[i].equals("--send-file") && args.length>(i+1)) // send audio file
            {  opt_send_file=args[++i];
               continue;
            }
            if (args[i].equals("--recv-file") && args.length>(i+1)) // receive audio file
            {  opt_recv_file=args[++i];
               continue;
            }
            if (args[i].equals("--debug-level") && args.length>(i+1)) // debug level
            {  opt_debug_level=Integer.parseInt(args[++i]);
               continue;
            }
            if (args[i].equals("--log-path") && args.length>(i+1)) // log path
            {  opt_log_path=args[++i];
               continue;
            }
            if (args[i].equals("--no-prompt")) // do not prompt
            {  opt_no_prompt=true;
               continue;
            }
            
            // else, do:
            if (!args[i].equals("-h"))
               System.out.println("unrecognized param '"+args[i]+"'\n");
            
            System.out.println("usage:\n   java CommandLineUA [options]");
            System.out.println("   options:");
            System.out.println("   -h              this help");
            System.out.println("   -f <file>       specifies a configuration file");
            System.out.println("   -t <secs>       auto hangup time (0 means manual hangup)");
            System.out.println("   -g <time>       registers the contact URL with the registrar server");
            System.out.println("                   where time is the duration of the registration, and can be");
            System.out.println("                   in seconds (default) or hours (-g 7200 is the same as -g 2h)");
            System.out.println("   -u              unregisters the contact URL with the registrar server");
            System.out.println("                   (is the same as -g 0)");
            System.out.println("   -z              unregisters ALL the contact URLs");
            System.out.println("   -n              no offer in invite (offer/answer in 2xx/ack)");
            System.out.println("   -c <call_to>    calls a remote user");
            System.out.println("   -y <secs>       auto answer time");
            System.out.println("   -i <secs>       re-invite after <secs> seconds");
            System.out.println("   -r <url>        redirects the call to new user <url>");
            System.out.println("   -q <url> <secs> transfers the call to <url> after <secs> seconds");
            System.out.println("   -a              audio");
            System.out.println("   -v              video");
            System.out.println("   -m <port>       (first) local media port");
            System.out.println("   -p <port>       local SIP port, used ONLY without -f option");
            System.out.println("   -o <addr>[:<port>]  use the specified outbound proxy");
            System.out.println("   --via-addr <addr>   host via address, used ONLY without -f option");
            System.out.println("   --keep-alive <millisecs>   send keep-alive packets each <millisecs>");
            System.out.println("   --from-url <url>    user's address-of-record (AOR)");
            System.out.println("   --contact-url <url> user's contact url");
            System.out.println("   --username <name>   user name used for authentication");
            System.out.println("   --realm <realm>     realm used for authentication");
            System.out.println("   --passwd <passwd>   passwd used for authentication");
            System.out.println("   --recv-only         receive only mode, no media is sent");
            System.out.println("   --send-only         send only mode, no media is received");
            System.out.println("   --send-tone         send only mode, an audio test tone is generated");
            System.out.println("   --send-file <file>  audio is played from the specified file");
            System.out.println("   --recv-file <file>  audio is recorded to the specified file");
            System.out.println("   --debug-level <n>   debug level (level=0 means no log)");
            System.out.println("   --log-path <path>   base path for all logs (./log is the default value)");
            System.out.println("   --no-prompt         do not prompt");
            System.exit(0);
         }
                     
         SipStack.init(file);
         if (opt_debug_level>=0) SipStack.debug_level=opt_debug_level;
         if (opt_log_path!=null) SipStack.log_path=opt_log_path;
         SipProvider sip_provider;
         if (file!=null) sip_provider=new SipProvider(file); else sip_provider=new SipProvider(opt_via_addr,opt_host_port);
         if (opt_outbound_proxy!=null) sip_provider.setOutboundProxy(new SocketAddress(opt_outbound_proxy));
         UserAgentProfile user_profile=new UserAgentProfile(file);
         
         if (opt_regist) user_profile.do_register=true;
         if (opt_unregist) user_profile.do_unregister=true;
         if (opt_unregist_all) user_profile.do_unregister_all=true;
         if (opt_expires>0) user_profile.expires=opt_expires;
         if (opt_keepalive_time>=0) user_profile.keepalive_time=opt_keepalive_time;
         if (opt_no_offer) user_profile.no_offer=true;
         if (opt_call_to!=null) user_profile.call_to=opt_call_to;
         if (opt_accept_time>=0) user_profile.accept_time=opt_accept_time;
         if (opt_hangup_time>0) user_profile.hangup_time=opt_hangup_time;
         if (opt_redirect_to!=null) user_profile.redirect_to=opt_redirect_to;
         if (opt_re_invite_time>0) user_profile.re_invite_time=opt_re_invite_time;
         if (opt_transfer_to!=null) user_profile.transfer_to=opt_transfer_to;
         if (opt_transfer_time>0) user_profile.transfer_time=opt_transfer_time;
         if (opt_audio) user_profile.audio=true;
         if (opt_video) user_profile.video=true;
         if (opt_media_port>0) user_profile.video_port=(user_profile.audio_port=opt_media_port)+2;
         if (opt_from_url!=null) user_profile.from_url=opt_from_url;
         if (opt_contact_url!=null) user_profile.contact_url=opt_contact_url;
         if (opt_username!=null) user_profile.username=opt_username;
         if (opt_realm!=null) user_profile.realm=opt_realm;
         if (opt_passwd!=null) user_profile.passwd=opt_passwd;
         if (opt_recv_only) user_profile.recv_only=true;
         if (opt_send_only) user_profile.send_only=true;             
         if (opt_send_tone) user_profile.send_tone=true;
         if (opt_send_file!=null) user_profile.send_file=opt_send_file;
         if (opt_recv_file!=null) user_profile.recv_file=opt_recv_file;
         if (opt_no_prompt) user_profile.no_prompt=true;
         
         // use audio as default media in case of..
         if ((opt_recv_only || opt_send_only || opt_send_tone || opt_send_file!=null || opt_recv_file!=null) && !opt_video) user_profile.audio=true;

         new CommandLineUA(sip_provider,user_profile);
      }
      catch (Exception e)  {  e.printStackTrace(); System.exit(0);  }
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
   {  if (log!=null) log.println("CommandLineUA: "+str,level+SipStack.LOG_LEVEL_UA);  
   }

   /** Adds the Exception message to the default Log */
   void printException(Exception e,int level)
   {  if (log!=null) log.printException(e,level+SipStack.LOG_LEVEL_UA);
   }

}

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

package local.server;


import org.zoolu.sip.address.*;
import org.zoolu.sip.provider.*;
import org.zoolu.sip.header.RequestLine;
import org.zoolu.sip.header.Header;
import org.zoolu.sip.header.ViaHeader;
import org.zoolu.sip.header.MaxForwardsHeader;
import org.zoolu.sip.header.MultipleHeader;
import org.zoolu.sip.header.RouteHeader;
import org.zoolu.sip.header.RecordRouteHeader;
import org.zoolu.sip.message.Message;
import org.zoolu.sip.message.MessageFactory;
import org.zoolu.sip.message.SipResponses;
import org.zoolu.tools.LogLevel;


//import java.util.Enumeration;
import java.util.Vector;
import java.io.BufferedReader;
import java.io.InputStreamReader;


/** Class Proxy implement a Proxy SIP Server.
  * It extends class Registrar. A Proxy can work as simply SIP Proxy,
  * or it can handle calls for registered users. 
  */
public class Proxy extends Registrar
{   
   /** Log of processed calls */
   CallLogger call_logger;

   /** Costructs a void Proxy */
   protected Proxy() {}

   /** Costructs a new Proxy that acts also as location server for registered users. */
   public Proxy(SipProvider provider, ServerProfile server_profile)
   {  super(provider,server_profile);
      if (server_profile.call_log) call_logger=new CallLoggerImpl(SipStack.log_path+"//"+provider.getViaAddress()+"."+provider.getPort()+"_calls.log");
   }


   /** When a new request is received for the local server. */
   public void processRequestToLocalServer(Message msg)
   {  printLog("inside processRequestToLocalServer(msg)",LogLevel.MEDIUM);
      if (msg.isRegister())
      {  super.processRequestToLocalServer(msg);
      }
      else
      if (!msg.isAck())
      {  // send a stateless error response
         //int result=501; // response code 501 ("Not Implemented")
         //int result=485; // response code 485 ("Ambiguous");
         int result=484; // response code 484 ("Address Incomplete");
         Message resp=MessageFactory.createResponse(msg,result,SipResponses.reasonOf(result),null);
         sip_provider.sendMessage(resp);
      }
   }


   /** When a new request message is received for a local user */
   public void processRequestToLocalUser(Message msg)
   {  printLog("inside processRequestToLocalUser(msg)",LogLevel.MEDIUM);

      if (server_profile.call_log) call_logger.update(msg);

      if (server_profile.do_proxy_authentication && !msg.isAck() && !msg.isCancel())
      {  // check message authentication
         Message err_resp=as.authenticateProxyRequest(msg);  
         if (err_resp!=null)
         {  sip_provider.sendMessage(err_resp);
            return;
         }
      }

      // message targets
      Vector targets=getTargets(msg);
      
      if (targets.isEmpty())
      {  // try to treat the request-URI as a local username or phone URL with a prefix-based nexthop rule
         SipURL request_uri=msg.getRequestLine().getAddress();
         SipURL new_target=getPhoneTarget(request_uri);
         if (new_target!=null) targets.addElement(new_target.toString());
      }
      if (targets.isEmpty())
      {  printLog("No target found, message discarded",LogLevel.HIGH);
         if (!msg.isAck()) sip_provider.sendMessage(MessageFactory.createResponse(msg,404,SipResponses.reasonOf(404),null));
         return;
      }           
      
      printLog("message will be forwarded to all user's contacts",LogLevel.MEDIUM); 
      for (int i=0; i<targets.size(); i++) 
      {  SipURL url=new SipURL((String)(targets.elementAt(i)));
         Message request=new Message(msg);
         request.removeRequestLine();
         request.setRequestLine(new RequestLine(msg.getRequestLine().getMethod(),url));
         
         updateProxingRequest(request);
         sip_provider.sendMessage(request);
      }
   }

   
   /** When a new request message is received for a remote UA */
   public void processRequestToRemoteUA(Message msg)
   {  printLog("inside processRequestToRemoteUA(msg)",LogLevel.MEDIUM);
   
      if (call_logger!=null) call_logger.update(msg);

      if (!server_profile.is_open_proxy)
      {  // check whether the caller is a local user 
         SipURL from_url=msg.getFromHeader().getNameAddress().getAddress();
         String from_username=from_url.getUserName();
         String from_hostaddr=from_url.getHost();
         String caller=(from_username==null)? from_hostaddr : from_username+"@"+from_hostaddr;
         if (!location_service.hasUser(caller))
         {  // but do not filter messages directed to local users
            SipURL to_url=msg.getToHeader().getNameAddress().getAddress();
            String to_username=to_url.getUserName();
            String to_hostaddr=to_url.getHost();
            String callee=(to_username==null)? to_hostaddr : to_username+"@"+to_hostaddr;
            if (!location_service.hasUser(callee))
            {  // both caller and callee are not registered with the local server
               printLog("both users "+caller+" and "+callee+" are not registered with the local server: proxy denied.",LogLevel.HIGH);
               sip_provider.sendMessage(MessageFactory.createResponse(msg,503,SipResponses.reasonOf(503),null));
               return;
            }
         }
      }
      
      if (server_profile.do_proxy_authentication && !msg.isAck() && !msg.isCancel())
      {  // check message authentication
         Message err_resp=as.authenticateProxyRequest(msg);  
         if (err_resp!=null)
         {  sip_provider.sendMessage(err_resp);
            return;
         }
      }

      updateProxingRequest(msg);      
      sip_provider.sendMessage(msg);
   }

   
   /** Processes the Proxy headers of the request.
     * Such headers are: Via, Record-Route, Route, Max-Forwards, etc. */
   protected Message updateProxingRequest(Message msg)
   {  printLog("inside updateProxingRequest(msg)",LogLevel.LOW);

      // remove Route if present
      boolean is_on_route=false;  
      if (msg.hasRouteHeader())
      {  MultipleHeader mr=msg.getRoutes();
         SipURL route=(new RouteHeader(mr.getTop())).getNameAddress().getAddress();
         if (isResponsibleFor(route.getHost(),route.getPort()))
         {  mr.removeTop();
            if (mr.size()>0) msg.setRoutes(mr);
            else msg.removeRoutes();
            is_on_route=true;
         }
      }
      // add Record-Route?
      if (server_profile.on_route && msg.isInvite() && !is_on_route)
      {  SipURL rr_url;
         if (sip_provider.getPort()==SipStack.default_port) rr_url=new SipURL(sip_provider.getViaAddress());
         else rr_url=new SipURL(sip_provider.getViaAddress(),sip_provider.getPort());
         if (server_profile.loose_route) rr_url.addLr();
         RecordRouteHeader rrh=new RecordRouteHeader(new NameAddress(rr_url));
         msg.addRecordRouteHeader(rrh);
      }
      // which protocol?
      String proto=null;
      if (msg.hasRouteHeader())
      {  SipURL route=msg.getRouteHeader().getNameAddress().getAddress();
         if (route.hasTransport()) proto=route.getTransport();
      }
      else proto=msg.getRequestLine().getAddress().getTransport();
      if (proto==null) proto=sip_provider.getDefaultTransport();
      
      // add Via
      ViaHeader via=new ViaHeader(proto,sip_provider.getViaAddress(),sip_provider.getPort());
      if (sip_provider.isRportSet()) via.setRport();
      String branch=sip_provider.pickBranch(msg);
      if (server_profile.loop_detection)
      {  String loop_tag=msg.getHeader(Loop_Tag).getValue();
         if (loop_tag!=null)
         {  msg.removeHeader(Loop_Tag);
            branch+=loop_tag;
         }
      }
      via.setBranch(branch);
      msg.addViaHeader(via);

      // decrement Max-Forwards
      MaxForwardsHeader maxfwd=msg.getMaxForwardsHeader();
      if (maxfwd!=null) maxfwd.decrement();
      else maxfwd=new MaxForwardsHeader(SipStack.max_forwards);
      msg.setMaxForwardsHeader(maxfwd);

      // domain name routing
      if (server_profile.domain_routing_rules!=null && server_profile.domain_routing_rules.length>0)
      {  RequestLine rl=msg.getRequestLine();
         SipURL request_uri=rl.getAddress();
         for (int i=0; i<server_profile.domain_routing_rules.length; i++)
         {  RoutingRule rule=(RoutingRule)server_profile.domain_routing_rules[i];
            SipURL nexthop=rule.getNexthop(request_uri);
            if (nexthop!=null)
            {  printLog("domain-based routing: "+rule.toString()+": YES",LogLevel.MEDIUM);
               printLog("target="+nexthop.toString(),LogLevel.MEDIUM);
               rl=new RequestLine(rl.getMethod(),nexthop);
               msg.setRequestLine(rl);
               break;
            }
            else printLog("prefix-based routing: "+rule.toString()+": NO",LogLevel.MEDIUM);
         }
      }
      

      // check whether the next Route is formed according to RFC2543
      msg.rfc2543RouteAdapt();
              
      return msg;                             
   }
   

   /** When a new response message is received */
   public void processResponse(Message resp)
   {  printLog("inside processResponse(msg)",LogLevel.MEDIUM);
   
      if(call_logger!=null) call_logger.update(resp);

      updateProxingResponse(resp);
      
      if (resp.hasViaHeader()) sip_provider.sendMessage(resp);
      else
         printLog("no VIA header found: message discarded",LogLevel.HIGH);            
   }
   
   
   /** Processes the Proxy headers of the response.
     * Such headers are: Via, .. */
   protected Message updateProxingResponse(Message resp)
   {  printLog("inside updateProxingResponse(resp)",LogLevel.MEDIUM);
      ViaHeader vh=new ViaHeader((Header)resp.getVias().getHeaders().elementAt(0));
      if (vh.getHost().equals(sip_provider.getViaAddress())) resp.removeViaHeader();
      return resp;
   }
   

   /** Tries to find the target for a username or phone URL not registered within the location service. */
   protected SipURL getPhoneTarget(SipURL request_uri)
   {  String username=request_uri.getUserName();
      if (username!=null && isPhoneNumber(username))
      {  printLog(username+" is a phone number",LogLevel.MEDIUM);
         for (int i=0; i<server_profile.phone_routing_rules.length; i++)
         {  RoutingRule rule=(RoutingRule)server_profile.phone_routing_rules[i];
            SipURL nexthop=rule.getNexthop(request_uri);
            if (nexthop!=null)
            {  printLog("prefix-based routing: "+rule.toString()+": YES",LogLevel.MEDIUM);
               printLog("target="+nexthop.toString(),LogLevel.MEDIUM);
               return nexthop;
            }
            else printLog("prefix-based routing: "+rule.toString()+": NO",LogLevel.MEDIUM);
         }
      }
      return null;
   }


   /** Whether the String is a phone number. */
   protected boolean isPhoneNumber(String str)
   {  if (str==null || str.length()==0) return false;
      for (int i=0; i<str.length(); i++)
      {  char c=str.charAt(i);
         if (c!='+' && c!='-' && (c<'0' || c>'9')) return false;
      }
      return true;
   }   


   // ****************************** Logs *****************************

   /** Adds a new string to the default Log */
   private void printLog(String str, int level)
   {  if (log!=null) log.println("Proxy: "+str,level+SipStack.LOG_LEVEL_UA);  
   }


   // ****************************** MAIN *****************************

   /** The main method. */
   public static void main(String[] args)
   {  
         
      String file=null;
      boolean prompt_exit=false;
      
      for (int i=0; i<args.length; i++)
      {  if (args[i].equals("-f") && args.length>(i+1))
         {  file=args[++i];
            continue;
         }
         if (args[i].equals("--prompt"))
         {  prompt_exit=true;
            continue;
         }
         if (args[i].equals("-h"))
         {  System.out.println("usage:\n   java Proxy [options] \n");
            System.out.println("   options:");
            System.out.println("   -h               this help");
            System.out.println("   -f <config_file> specifies a configuration file");
            System.out.println("   --prompt         prompt for exit");
            System.exit(0);
         }
      }
                  
      SipStack.init(file);
      SipProvider sip_provider=new SipProvider(file);
      ServerProfile server_profile=new ServerProfile(file);

      new Proxy(sip_provider,server_profile);
      
      // promt before exit
      if (prompt_exit) 
      try
      {  System.out.println("press 'enter' to exit");
         BufferedReader in=new BufferedReader(new InputStreamReader(System.in)); 
         in.readLine();
         System.exit(0);
      }
      catch (Exception e) {}
   }
  
}
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


import org.zoolu.sip.address.SipURL;
import org.zoolu.sip.provider.*;
import org.zoolu.sip.header.MultipleHeader;
import org.zoolu.sip.header.ViaHeader;
import org.zoolu.sip.header.Header;
import org.zoolu.sip.header.RouteHeader;
import org.zoolu.sip.header.RequestLine;
import org.zoolu.sip.header.MaxForwardsHeader;
import org.zoolu.sip.header.MultipleHeader;
import org.zoolu.sip.message.Message;
import org.zoolu.sip.message.SipResponses;
import org.zoolu.sip.message.MessageFactory;
import org.zoolu.tools.Log;
import org.zoolu.tools.LogLevel;
import org.zoolu.tools.SimpleDigest;

import java.util.Vector;


/** Class ServerEngine implement a stateless abstract SIP Server.
  * The ServerEngine can act as SIP Proxy Server, SIP Registrar Server or both.
  * <p> For each incoming message, the ServerEngine fires one of the following
  * abstract methods:
  * <ul>
  * <li>public abstract processRequestToRemoteUA(Message),</li>
  * <li>public abstract processRequestToLocalServer(Message),</li>
  * <li>public abstract processRequestToLocalServer(Message),</li>
  * <li>public abstract processResponse(Message).</li>
  * </ul>
  * depending of the type of received message.
  */
public abstract class ServerEngine implements SipProviderListener
{
   /** Name of the Loop-Tag header field.
     * It is used as temporary filed for carry loop detection information,
     * added to the via branch parameter of the forwarded requests. */
   protected static final String Loop_Tag="Loop-Tag";

   /** Event logger. */
   protected Log log=null;

   /** ServerProfile of the server. */
   protected ServerProfile server_profile=null;

   /** SipProvider used by the server. */
   protected SipProvider sip_provider=null;
   
   /** Costructs a void ServerEngine */
   protected ServerEngine() {}


   // *************************** abstract methods ***************************

   /** When a new request message is received for a remote UA */
   public abstract void processRequestToRemoteUA(Message req);

   /** When a new request message is received for a locally registered user */
   public abstract void processRequestToLocalUser(Message req);

   /** When a new request request is received for the local server */
   public abstract void processRequestToLocalServer(Message req);
   
   /** When a new response message is received */
   public abstract void processResponse(Message resp);
   

   // **************************** public methods ****************************

   /** Costructs a new ServerEngine on SipProvider <i>provider</i>,
     * and adds it as SipProviderListener. */
   public ServerEngine(SipProvider provider, ServerProfile profile)
   {  server_profile=profile;
      sip_provider=provider;
      log=sip_provider.getLog();
      sip_provider.addSipProviderListener(SipProvider.ANY,this);
   }
   
   /** When a new message is received by the SipProvider.
     * If the received message is a request, it cheks for loops, */
   public void onReceivedMessage(SipProvider provider, Message msg)
   {  printLog("message received",LogLevel.MEDIUM);
      if (msg.isRequest()) // it is an INVITE or ACK or BYE or OPTIONS or REGISTER or CANCEL
      {  printLog("message is a request",LogLevel.MEDIUM);

         // validate the message
         Message err_resp=validateRequest(msg);
         if (err_resp!=null)
         {  // for non-ACK requests respond with an error message
            if (!msg.isAck()) sip_provider.sendMessage(err_resp);
            return;
         }

         // target
         SipURL target=msg.getRequestLine().getAddress();  
         
         // check if this server is the target
         //boolean this_is_target=isResponsibleFor(target.getHost(),target.getPort());         

         // look if the msg sent by the previous UA is compliant with the RFC2543 Strict Route rule..
         if (isResponsibleFor(target.getHost(),target.getPort()) && msg.hasRouteHeader())
         {  
            //SipURL route_url=msg.getRouteHeader().getNameAddress().getAddress();
            SipURL route_url=(new RouteHeader(msg.getRoutes().getBottom())).getNameAddress().getAddress();
            if (!route_url.hasLr())
            {  printLog("probably the message was compliant to RFC2543 Strict Route rule: message is updated to RFC3261",LogLevel.MEDIUM);

               // the message has been sent to this server according with RFC2543 Strict Route
               // the proxy MUST replace the Request-URI in the request with the last
               // value from the Route header field, and remove that value from the
               // Route header field. The proxy MUST then proceed as if it received
               // this modified request.
               msg.rfc2543toRfc3261RouteUpdate();
               
               // update the target
               target=msg.getRequestLine().getAddress();
               printLog("new recipient: "+target.toString(),LogLevel.LOW);
               
               // check again if this server is the target
               //this_is_target=matchesDomainName(target.getHost(),target.getPort());
            }
         }
         
         // removes the local Route value, if present
         /*if (msg.hasRouteHeader())
         {  MultipleHeader mr=msg.getRoutes();
            SipURL top_route=(new RouteHeader(mr.getTop())).getNameAddress().getAddress();
            if (matchesDomainName(top_route.getHost(),top_route.getPort()))
            {  mr.removeTop();
               if (mr.size()>0) msg.setRoutes(mr);
               else msg.removeRoutes();
            }
         }*/

         // check whether the request is for a domain the server is responsible for
         if (isResponsibleFor(msg))
         {  
            printLog("the request is for the local server",LogLevel.LOW);
            
            if (target.hasUserName())
            {  printLog("the request is for a local user",LogLevel.LOW);
               processRequestToLocalUser(msg);
            }
            else
            {  printLog("no username: the request is for the local server",LogLevel.LOW);
               processRequestToLocalServer(msg);
            }
         }
         else // the request is NOT for the "local" server
         {  
            printLog("the request is not for the local server",LogLevel.LOW);
            processRequestToRemoteUA(msg);
         }
      }
      else // the message may be a response
      {  
         if (msg.isResponse())
         {  printLog("message is a response",LogLevel.LOW);
            processResponse(msg);
         }
         else printWarning("received message is not recognized as a request nor a response: discarded",LogLevel.HIGH);
      }
   }

   /** Relays the massage.
     * Called after a received message has been successful processed for being relayed */
   //protected void sendMessage(Message msg)
   //{  printLog("sending the successfully processed message",LogLevel.MEDIUM);
   //   sip_provider.sendMessage(msg);
   //}
   
   /** Whether the server is responsible for the given <i>domain</i>
     * (i.e. the <i>domain</i> is included in the local domain names list)
     * and <i>port</i> (if >0) matches the local server port. */
   protected boolean isResponsibleFor(String domain, int port)
   {  // check port
      if (!server_profile.domain_port_any && port>0 && port!=sip_provider.getPort()) return false;
      // check host address
      if (domain.equals(sip_provider.getViaAddress())) return true;
      // check domain name
      boolean it_is=false;
      for (int i=0; i<server_profile.domain_names.length; i++)
      {  if (server_profile.domain_names[i].equals(domain)) { it_is=true; break; }
      }
      return it_is;
   }
   
   /** Whether the server is responsible for the request-uri of the request <i>req</i>. */
   protected boolean isResponsibleFor(Message req)
   {  SipURL target=req.getRequestLine().getAddress();
      return isResponsibleFor(target.getHost(),target.getPort());
   }

   /** Whether the request is for the local server */
   /*protected boolean isTargetOf(Message req)
   {  SipURL target=req.getRequestLine().getAddress();
      if (!isResponsibleFor(target.getHost(),target.getPort())) return false;
      // else, request-uri matches a domain the server is responsible for
      if (!req.hasRouteHeader()) return true; 
      // else, has route..
      MultipleHeader route=req.getRoutes();
      if (route.size()>1) return false;
      // else, only 1 route, check it
      target=(new RouteHeader(route.getTop())).getNameAddress().getAddress();
      if (!isResponsibleFor(target.getHost(),target.getPort()))  return false;
      // else
      return true;
   }*/

   /** Gets a String of the list of local domain names. */
   protected String getLocalDomains()
   {  if (server_profile.domain_names.length>0)
      {  String str="";
         for (int i=0; i<server_profile.domain_names.length-1; i++)
         {  str+=server_profile.domain_names[i]+", ";
         }
         return str+server_profile.domain_names[server_profile.domain_names.length-1];
      }
      else return "";
   }
   
   /** Validates the message.
     * @return It returns 0 if the message validation successes, otherwise return the error code. */
   protected Message validateRequest(Message msg)
   {  printLog("inside validateRequest(msg)",LogLevel.LOW);
   
      int err_code=0;
      
      // Max-Forwads
      if (err_code==0) 
      {  MaxForwardsHeader mfh=msg.getMaxForwardsHeader();
         if (mfh!=null && mfh.getNumber()==0) err_code=483;
      }
      // Loops
      // Insert also a temporary Loop-Tag header field in order to correctly compose
      // the branch field when forwarding the message.
      // This behaviour has been choosen since the message validation is done
      // when receiving the message while the information used for loop detection
      // (the branch parameter) is calculated and added when sending the message.
      // Note that the RFC suggests to calculate the branch parameter based on
      // the original request-uri, but the request-uri has been already replaced
      // and forgotten when processing the message for calculating the branch! ;)
      if (err_code==0 && server_profile.loop_detection)
      {  String loop_tag=pickLoopTag(msg);
         // add temporary Loop-Tag header field
         msg.setHeader(new Header(Loop_Tag,loop_tag));
         // check for loop
         if (!msg.hasRouteHeader()) 
         {  Vector v=msg.getVias().getHeaders();
            for (int i=0; i<v.size(); i++)
            {  ViaHeader vh=new ViaHeader((Header)v.elementAt(i));
               if (sip_provider.getViaAddress().equals(vh.getHost()) && sip_provider.getPort()==vh.getPort())
               {  // possible loop
                  if (!vh.hasBranch()) err_code=482;
                  else
                  {  // check branch
                     String branch=vh.getBranch();
                     if (branch.indexOf(loop_tag,branch.length()-loop_tag.length())>=0) err_code=482;
                  }
               }
            }
         }
      } 
            
      // Proxy-Require

      // Proxy-Authorization
     
      if (err_code>0)
      {  String reason=SipResponses.reasonOf(err_code);
         printLog("Message validation failed ("+reason+"), message discarded",LogLevel.HIGH);
         return MessageFactory.createResponse(msg,err_code,reason,null);
      }
      else return null;
   }

   /** Picks an unique branch value based on a SIP message.
     * This value could also be used for loop detection. */
   /*public String pickBranch(Message msg)
   {  String branch=sip_provider.pickBranch(msg);
      if (server_profile.loop_detection) branch+=pickLoopTag(msg);
      return branch;
   }*/

   /** Picks the token used for loop detection. */
   private String pickLoopTag(Message msg)
   {  StringBuffer sb=new StringBuffer();
      sb.append(msg.getToHeader().getTag());
      sb.append(msg.getFromHeader().getTag());
      sb.append(msg.getCallIdHeader().getCallId());
      sb.append(msg.getRequestLine().getAddress().toString());
      sb.append(msg.getCSeqHeader().getSequenceNumber());
      MultipleHeader rr=msg.getRoutes();
      if (rr!=null) sb.append(rr.size());
      return (new SimpleDigest(7,sb.toString())).asHex();
   }


   // ********************************* logs *********************************

   /** Adds a new string to the default Log */
   private void printLog(String str, int level)
   {  if (log!=null) log.println("ServerEngine: "+str,level+SipStack.LOG_LEVEL_UA);  
   }

   /** Adds a Warning message to the default Log */
   private final void printWarning(String str, int level)
   {  printLog("WARNING: "+str,level); 
   }

}
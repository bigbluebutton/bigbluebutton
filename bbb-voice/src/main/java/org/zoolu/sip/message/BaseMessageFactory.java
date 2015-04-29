/*
 * Copyright (C) 2005 Luca Veltri - University of Parma - Italy
 *
 * This file is part of MjSip (http://www.mjsip.org)
 *
 * MjSip is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * MjSip is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with MjSip; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 *
 * Author(s):
 * Luca Veltri (luca.veltri@unipr.it)
 */

package org.zoolu.sip.message;


import org.zoolu.sip.address.*;
import org.zoolu.sip.header.*;
import org.zoolu.sip.dialog.Dialog;
import org.zoolu.sip.provider.SipStack;
import org.zoolu.sip.provider.SipProvider;
import org.zoolu.sip.message.Message;
import org.zoolu.sip.message.SipMethods;
import org.zoolu.sip.message.SipResponses;

import java.util.Vector;


/** BaseMessageFactory is used to create SIP messages, requests and
  * responses by means of
  * two static methods: createRequest(), createResponse().
  * <BR> A valid SIP request sent by a UAC MUST, at least, contain
  * the following header fields: To, From, CSeq, Call-ID, Max-Forwards,
  * and Via; all of these header fields are mandatory in all SIP
  * requests.  These sip header fields are the fundamental building
  * blocks of a SIP message, as they jointly provide for most of the
  * critical message routing services including the addressing of
  * messages, the routing of responses, limiting message propagation,
  * ordering of messages, and the unique identification of transactions.
  * These header fields are in addition to the mandatory request line,
  * which contains the method, Request-URI, and SIP version.
  */
public abstract class BaseMessageFactory
{

   /** Creates a SIP request message.
     * @param method      method name
     * @param request_uri request-uri
     * @param to          ToHeader NameAddress
     * @param from        FromHeader NameAddress
     * @param contact     Contact NameAddress (if null, no ContactHeader is added)
     * @param host_addr   Via address
     * @param host_port   Via port number
     * @param call_id     Call-ID value
     * @param cseq        CSeq value
     * @param local_tag   tag in FromHeader
     * @param remote_tag  tag in ToHeader (if null, no tag is added)
     * @param branch      branch value (if null, a random value is picked)
     * @param body        body (if null, no body is added) */
   public static Message createRequest(String method, SipURL request_uri, NameAddress to, NameAddress from, NameAddress contact, String proto, String via_addr, int host_port, boolean rport, String call_id, long cseq, String local_tag, String remote_tag, String branch, String body)
   {  Message req=new Message();
      //mandatory headers first (To, From, Via, Max-Forwards, Call-ID, CSeq):
      req.setRequestLine(new RequestLine(method,request_uri));
      ViaHeader via=new ViaHeader(proto,via_addr,host_port);
      if (rport) via.setRport();
      if (branch==null) branch=SipProvider.pickBranch();
      via.setBranch(branch);
      req.addViaHeader(via);
      req.setMaxForwardsHeader(new MaxForwardsHeader(70));
      if (remote_tag==null) req.setToHeader(new ToHeader(to));
         else req.setToHeader(new ToHeader(to,remote_tag));
      req.setFromHeader(new FromHeader(from,local_tag));
      req.setCallIdHeader(new CallIdHeader(call_id));
      req.setCSeqHeader(new CSeqHeader(cseq,method));
      //optional headers:
      if (contact!=null)
      {  MultipleHeader contacts=new MultipleHeader(SipHeaders.Contact);
         contacts.addBottom(new ContactHeader(contact));
         //System.out.println("DEBUG: Contact: "+contact.toString());
         req.setContacts(contacts);
      }
      req.setExpiresHeader(new ExpiresHeader(String.valueOf(SipStack.default_expires)));
      // add User-Agent header field
      if (SipStack.ua_info!=null) req.setUserAgentHeader(new UserAgentHeader(SipStack.ua_info));
      //if (body!=null) req.setBody(body); else req.setBody("");
      req.setBody(body);
      //System.out.println("DEBUG: MessageFactory: request:\n"+req);
      return req;
   }


   /** Creates a SIP request message.
     * Where <UL>
     * <LI> via address and port are taken from SipProvider
     * <LI> transport protocol is taken from request-uri (if transport parameter is present)
     *      or the default transport for the SipProvider is used.
     * </UL>
     * @param sip_provider the SipProvider used to fill the Via field
     * @see #createRequest(String,SipURL,NameAddress,NameAddress,NameAddress,String,String,int,String,long,String,String,String,String) */
   public static Message createRequest(SipProvider sip_provider, String method, SipURL request_uri, NameAddress to, NameAddress from, NameAddress contact, String call_id, long cseq, String local_tag, String remote_tag, String branch, String body)
   {  String via_addr=sip_provider.getViaAddress();
      int host_port=sip_provider.getPort();
      boolean rport=sip_provider.isRportSet();
      String proto;
      if (request_uri.hasTransport()) proto=request_uri.getTransport();
      else proto=sip_provider.getDefaultTransport();

      return createRequest(method,request_uri,to,from,contact,proto,via_addr,host_port,rport,call_id,cseq,local_tag,remote_tag,branch,body);
   }


   /** Creates a SIP request message.
     * Where <UL>
     * <LI> request-uri equals the To sip url
     * <LI> via address and port are taken from SipProvider
     * <LI> transport protocol is taken from request-uri (if transport parameter is present)
     *      or the default transport for the SipProvider is used.
     * <LI> call_id is picked random
     * <LI> cseq is picked random
     * <LI> local_tag is picked random
     * <LI> branch is picked random
     * </UL>
     * @see #createRequest(String,SipURL,NameAddress,NameAddress,NameAddress,String,String,int,String,long,String,String,String,String) */
   public static Message createRequest(SipProvider sip_provider, String method, SipURL request_uri, NameAddress to, NameAddress from, NameAddress contact, String body)
   {  //SipURL request_uri=to.getAddress();
      String call_id=sip_provider.pickCallId();
      int cseq=SipProvider.pickInitialCSeq();
      String local_tag=SipProvider.pickTag();
      //String branch=SipStack.pickBranch();
      return createRequest(sip_provider,method,request_uri,to,from,contact,call_id,cseq,local_tag,null,null,body);
   }


   /** Creates a SIP request message.
     * Where <UL>
     * <LI> request-uri equals the To sip url
     * <LI> via address and port are taken from SipProvider
     * <LI> transport protocol is taken from request-uri (if transport parameter is present)
     *      or the default transport for the SipProvider is used.
     * <LI> contact is formed by the 'From' user-name and by the address and port taken from SipProvider
     * <LI> call_id is picked random
     * <LI> cseq is picked random
     * <LI> local_tag is picked random
     * <LI> branch is picked random
     * </UL>
     * @see #createRequest(SipProvider,String,NameAddress,NameAddress,NameAddress,String) */
   public static Message createRequest(SipProvider sip_provider, String method, NameAddress to, NameAddress from, String body)
   {  String contact_user=from.getAddress().getUserName();
      NameAddress contact=new NameAddress(new SipURL(contact_user,sip_provider.getViaAddress(),sip_provider.getPort()));
      return createRequest(sip_provider,method,to.getAddress(),to,from,contact,body);
   }


   /** Creates a SIP request message within a dialog, with a new branch via-parameter.
     * @param dialog the Dialog used to compose the various Message headers
     * @param method the request method
     * @param body the message body */
   public static Message createRequest(Dialog dialog, String method, String body)
   {  NameAddress to=dialog.getRemoteName();
      NameAddress from=dialog.getLocalName();
      NameAddress target=dialog.getRemoteContact();
      if (target==null) target=to;
      SipURL request_uri=target.getAddress();
      if (request_uri==null) request_uri=dialog.getRemoteName().getAddress();
      SipProvider sip_provider=dialog.getSipProvider();
      String via_addr=sip_provider.getViaAddress();
      int host_port=sip_provider.getPort();
      boolean rport=sip_provider.isRportSet();
      String proto;
      if (target.getAddress().hasTransport()) proto=target.getAddress().getTransport();
      else proto=sip_provider.getDefaultTransport();
      NameAddress contact=dialog.getLocalContact();
      if (contact==null) contact=from;
      // increment the CSeq, if method is not ACK nor CANCEL
      if (!SipMethods.isAck(method) && !SipMethods.isCancel(method)) dialog.incLocalCSeq();
      String call_id=dialog.getCallID();
      long cseq=dialog.getLocalCSeq();
      String local_tag=dialog.getLocalTag();
      String remote_tag=dialog.getRemoteTag();
      //String branch=SipStack.pickBranch();
      Message req=createRequest(method,request_uri,to,from,contact,proto,via_addr,host_port,rport,call_id,cseq,local_tag,remote_tag,null,body);
      Vector route=dialog.getRoute();
      if (route!=null && route.size()>0)
         req.addRoutes(new MultipleHeader(SipHeaders.Route,route));
      req.rfc2543RouteAdapt();
      return req;
   }


    /** Creates a SIP ACK request message within a dialog, with a same branch via-parameter.
	     * @param dialog the Dialog used to compose the various Message headers
	     * @param method the request method
	     * @param body the message body */
	// Lior add
	public static Message createACKRequest(Dialog dialog, String method, String body)
	   {  NameAddress to=dialog.getRemoteName();
	      NameAddress from=dialog.getLocalName();
	      NameAddress target=dialog.getRemoteContact();
	      if (target==null) target=to;
	      SipURL request_uri=target.getAddress();
	      if (request_uri==null) request_uri=dialog.getRemoteName().getAddress();
	      SipProvider sip_provider=dialog.getSipProvider();
	      String via_addr=sip_provider.getViaAddress();
	      int host_port=sip_provider.getPort();
	      boolean rport=sip_provider.isRportSet();
	      String proto;
	      if (target.getAddress().hasTransport()) proto=target.getAddress().getTransport();
	      else proto=sip_provider.getDefaultTransport();
	      NameAddress contact=dialog.getLocalContact();
	      if (contact==null) contact=from;
	      // increment the CSeq, if method is not ACK nor CANCEL
	      if (!SipMethods.isAck(method) && !SipMethods.isCancel(method)) dialog.incLocalCSeq();
	      String call_id=dialog.getCallID();
	      long cseq=dialog.getLocalCSeq();
	      String local_tag=dialog.getLocalTag();
	      String remote_tag=dialog.getRemoteTag();
	      //String branch=SipStack.pickBranch();
	      Message req=createRequest(method,request_uri,to,from,contact,proto,via_addr,host_port,rport,call_id,cseq,local_tag,remote_tag,null,body);
	      Vector route=dialog.getRoute();
	      if (route!=null && route.size()>0)
	         req.addRoutes(new MultipleHeader(SipHeaders.Route,route));
	      req.rfc2543RouteAdapt();
	      return req;
   }
   /** Creates a new INVITE request out of any pre-existing dialogs.
     * @see #createRequest(String,SipURL,NameAddress,NameAddress,NameAddress,String,String,int,boolean,String,long,String,String,String,String) */
   public static Message createInviteRequest(SipProvider sip_provider, SipURL request_uri, NameAddress to, NameAddress from, NameAddress contact, String body)
   {  String call_id=sip_provider.pickCallId();
      int cseq=SipProvider.pickInitialCSeq();
      String local_tag=SipProvider.pickTag();
      //String branch=SipStack.pickBranch();
      if (contact==null) contact=from;
      return createRequest(sip_provider,SipMethods.INVITE,request_uri,to,from,contact,call_id,cseq,local_tag,null,null,body);
   }


   /** Creates a new INVITE request within a dialog (re-invite).
     * @see #createRequest(Dialog,String,String) */
   public static Message createInviteRequest(Dialog dialog, String body)
   {  return createRequest(dialog,SipMethods.INVITE,body);
   }


   /** Creates an ACK request for a 2xx response.
     * @see #createRequest(Dialog,String,String) */
   public static Message create2xxAckRequest(Dialog dialog, String body)
   {  return createRequest(dialog,SipMethods.ACK,body);
   }


   /** Creates an ACK request for a non-2xx response */
   public static Message createNon2xxAckRequest(SipProvider sip_provider, Message method, Message resp)
   {  SipURL request_uri=method.getRequestLine().getAddress();
      FromHeader from=method.getFromHeader();
      ToHeader to=resp.getToHeader();
      String via_addr=sip_provider.getViaAddress();
      int host_port=sip_provider.getPort();
      boolean rport=sip_provider.isRportSet();
      String proto;
      if (request_uri.hasTransport()) proto=request_uri.getTransport();
      else proto=sip_provider.getDefaultTransport();
      String branch=method.getViaHeader().getBranch();
      NameAddress contact=null;
      Message ack=createRequest(SipMethods.ACK,request_uri,to.getNameAddress(),from.getNameAddress(),contact,proto,via_addr,host_port,rport,method.getCallIdHeader().getCallId(),method.getCSeqHeader().getSequenceNumber(),from.getParameter("tag"),to.getParameter("tag"),branch,null);
      ack.removeExpiresHeader();
      if (method.hasRouteHeader()) ack.setRoutes(method.getRoutes());
      return ack;
   }


   /** Creates an ACK request for a 2xx-response. Contact value is taken from SipStack */
   /*public static Message create2xxAckRequest(Message resp, String body)
   {  ToHeader to=resp.getToHeader();
      FromHeader from=resp.getFromHeader();
      int code=resp.getStatusLine().getCode();
      SipURL request_uri;
      request_uri=resp.getContactHeader().getNameAddress().getAddress();
      if (request_uri==null) request_uri=to.getNameAddress().getAddress();
      String branch=SipStack.pickBranch();
      NameAddress contact=null;
      if (SipStack.contact_url!=null) contact=new NameAddress(SipStack.contact_url);
      return createRequest(SipMethods.ACK,request_uri,to.getNameAddress(),from.getNameAddress(),contact,resp.getCallIdHeader().getCallId(),resp.getCSeqHeader().getSequenceNumber(),from.getParameter("tag"),to.getParameter("tag"),branch,body);
   }*/


   /** Creates an ACK request for a 2xx-response within a dialog */
   /*public static Message create2xxAckRequest(Dialog dialog, NameAddress contact, String body)
   {  return createRequest(SipMethods.ACK,dialog,contact,body);
   }*/


   /** Creates an ACK request for a 2xx-response within a dialog */
   /*public static Message create2xxAckRequest(Dialog dialog, String body)
   {  return createRequest(SipMethods.ACK,dialog,body);
   }*/


   /** Creates a CANCEL request. */
   public static Message createCancelRequest(Message method)
   {  ToHeader to=method.getToHeader();
      FromHeader from=method.getFromHeader();
      SipURL request_uri=method.getRequestLine().getAddress();
      NameAddress contact=method.getContactHeader().getNameAddress();
      ViaHeader via=method.getViaHeader();
      String host_addr=via.getHost();
      int host_port=via.getPort();
      boolean rport=via.hasRport();
      String proto=via.getProtocol();
      String branch=method.getViaHeader().getBranch();
      return createRequest(SipMethods.CANCEL,request_uri,to.getNameAddress(),from.getNameAddress(),contact,proto,host_addr,host_port,rport,method.getCallIdHeader().getCallId(),method.getCSeqHeader().getSequenceNumber(),from.getParameter("tag"),to.getParameter("tag"),branch,"");
   }


   /** Creates a BYE request. */
   public static Message createByeRequest(Dialog dialog)
   {  Message msg=createRequest(dialog,SipMethods.BYE,null);
      msg.removeExpiresHeader();
      msg.removeContacts();
      return msg;
   }


   /** Creates a new REGISTER request.
     * <p> If contact is null, set contact as star * (register all) */
   public static Message createRegisterRequest(SipProvider sip_provider, NameAddress to, NameAddress from, NameAddress contact)
   {  SipURL to_url=to.getAddress();
      SipURL registrar=new SipURL(to_url.getHost(),to_url.getPort());
      String via_addr=sip_provider.getViaAddress();
      int host_port=sip_provider.getPort();
      boolean rport=sip_provider.isRportSet();
      String proto;
      if (to_url.hasTransport()) proto=to_url.getTransport();
      else proto=sip_provider.getDefaultTransport();
      String call_id=sip_provider.pickCallId();
      int cseq=SipProvider.pickInitialCSeq();
      String local_tag=SipProvider.pickTag();
      //String branch=SipStack.pickBranch();
      Message req=createRequest(SipMethods.REGISTER,registrar,to,from,contact,proto,via_addr,host_port,rport,call_id,cseq,local_tag,null,null,null);
      // if no contact, deregister all
      if (contact==null)
      {  ContactHeader star=new ContactHeader(); // contact is *
         req.setContactHeader(star);
         req.setExpiresHeader(new ExpiresHeader(String.valueOf(SipStack.default_expires)));
      }
      return req;
   }


   //################ Can be removed? ################
   /** Creates a new REGISTER request.
     * <p> If contact is null, set contact as star * (register all) */
   /*public static Message createRegisterRequest(SipProvider sip_provider, NameAddress to, NameAddress contact)
   {  return createRegisterRequest(sip_provider,to,to,contact);
   }*/


   /** Creates a SIP response message.
     * @param req the request message
     * @param code the response code
     * @param reason the response reason
     * @param contact the contact address
     * @param local_tag the local tag in the 'To' header
     * @param body the message body */
   public static Message createResponse(Message req, int code, String reason, String local_tag, NameAddress contact, String content_type, String body)
   {  Message resp=new Message();
      resp.setStatusLine(new StatusLine(code,reason));
      resp.setVias(req.getVias());
      if (code>=180 && code<300 && req.hasRecordRouteHeader())
         resp.setRecordRoutes(req.getRecordRoutes());
      ToHeader toh=req.getToHeader();
      if (local_tag!=null)
         toh.setParameter("tag",local_tag);
      resp.setToHeader(toh);
      resp.setFromHeader(req.getFromHeader());
      resp.setCallIdHeader(req.getCallIdHeader());
      resp.setCSeqHeader(req.getCSeqHeader());
      if (contact!=null) resp.setContactHeader(new ContactHeader(contact));
      // add Server header field
      if (SipStack.server_info!=null) resp.setServerHeader(new ServerHeader(SipStack.server_info));
      //if (body!=null) resp.setBody(body); else resp.setBody("");
      if (content_type==null) resp.setBody(body);
      else resp.setBody(content_type,body);
      //System.out.println("DEBUG: MessageFactory: response:\n"+resp.toString());
      return resp;
   }

   /** Creates a SIP response message. For 2xx responses generates the local tag by means of the SipStack.pickTag(req) method.
     * @see #createResponse(Message,int,String,NameAddress,String,String body) */
   public static Message createResponse(Message req, int code, String reason, NameAddress contact)
   {  //String reason=SipResponses.reasonOf(code);
      String localtag=null;
      if (req.createsDialog() && !req.getToHeader().hasTag())
      {  if (SipStack.early_dialog || (code>=200 && code<300)) localtag=SipProvider.pickTag(req);
      }
      return createResponse(req,code,reason,localtag,contact,null,null);
   }

}
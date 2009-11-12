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
import org.zoolu.sip.header.ContentLengthHeader;
import org.zoolu.sip.header.ContentTypeHeader;
import org.zoolu.sip.header.SubjectHeader;
import org.zoolu.sip.header.ReferToHeader;
import org.zoolu.sip.header.ReferredByHeader;
import org.zoolu.sip.header.EventHeader;
import org.zoolu.sip.dialog.Dialog;
import org.zoolu.sip.provider.SipStack;
import org.zoolu.sip.provider.SipProvider;



/** Class sipx.message.MessageFactory extends class sip.message.BaseMessageFactory.
  * <p />
  * MessageFactory is used to create SIP messages (requests and
  * responses).
  * <br /> A valid SIP request sent by a UAC MUST, at least, contain
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
public class MessageFactory extends org.zoolu.sip.message.BaseMessageFactory
{

   /** Creates a new MESSAGE request (RFC3428) */
   public static Message createMessageRequest(SipProvider sip_provider, NameAddress recipient, NameAddress from, String subject, String type, String body)
   {  SipURL request_uri=recipient.getAddress();
      String callid=sip_provider.pickCallId();
      int cseq=SipProvider.pickInitialCSeq();
      String localtag=SipProvider.pickTag();
      //String branch=SipStack.pickBranch();
      Message req=createRequest(sip_provider,SipMethods.MESSAGE,request_uri,recipient,from,null,callid,cseq,localtag,null,null,null);
      if (subject!=null) req.setSubjectHeader(new SubjectHeader(subject));
      req.setBody(type,body);
      return req;
   }

   /** Creates a new REFER request (RFC3515) */
   public static Message createReferRequest(SipProvider sip_provider, NameAddress recipient, NameAddress from, NameAddress contact, NameAddress refer_to/*, NameAddress referred_by*/)
   {  SipURL request_uri=recipient.getAddress();
      String callid=sip_provider.pickCallId();
      int cseq=SipProvider.pickInitialCSeq();
      String localtag=SipProvider.pickTag();
      //String branch=SipStack.pickBranch();
      Message req=createRequest(sip_provider,SipMethods.REFER,request_uri,recipient,from,contact,callid,cseq,localtag,null,null,null);
      req.setReferToHeader(new ReferToHeader(refer_to));
      //if (referred_by!=null) req.setReferredByHeader(new ReferredByHeader(referred_by));
      req.setReferredByHeader(new ReferredByHeader(from));
      return req;
   }

   /** Creates a new REFER request (RFC3515) within a dialog
     * <p> parameters:
     * <br> - <i>refer_to</i> mandatory
     * <br> - <i>referred_by</i> optional
     */
   public static Message createReferRequest(Dialog dialog, NameAddress refer_to, NameAddress referred_by)
   {  Message req=createRequest(dialog,SipMethods.REFER,null);
      req.setReferToHeader(new ReferToHeader(refer_to));
      if (referred_by!=null) req.setReferredByHeader(new ReferredByHeader(referred_by));
      else req.setReferredByHeader(new ReferredByHeader(dialog.getLocalName()));
      return req;
   }

   /** Creates a new SUBSCRIBE request (RFC3265) out of any pre-existing dialogs. */
   public static Message createSubscribeRequest(SipProvider sip_provider, SipURL recipient, NameAddress to, NameAddress from, NameAddress contact, String event, String id, String content_type, String body)
   {  Message req=createRequest(sip_provider,SipMethods.SUBSCRIBE,recipient,to,from,contact,null);
      req.setEventHeader(new EventHeader(event,id));
      req.setBody(content_type,body);
      return req;
   }


   /** Creates a new SUBSCRIBE request (RFC3265) within a dialog (re-subscribe). */
   public static Message createSubscribeRequest(Dialog dialog, String event, String id, String content_type, String body)
   {  Message req=createRequest(dialog,SipMethods.SUBSCRIBE,null);
      req.setEventHeader(new EventHeader(event,id));
      req.setBody(content_type,body);
      return req;
   }


   /** Creates a new NOTIFY request (RFC3265) within a dialog */
   public static Message createNotifyRequest(Dialog dialog, String event, String id, String content_type, String body)
   {  Message req=createRequest(dialog,SipMethods.NOTIFY,null);
      req.removeExpiresHeader();
      req.setEventHeader(new EventHeader(event,id));
      req.setBody(content_type,body);
      return req;
   }


   /** Creates a new NOTIFY request (RFC3265) within a dialog */
   public static Message createNotifyRequest(Dialog dialog, String event, String id, String sipfragment)
   {  Message req=createRequest(dialog,SipMethods.NOTIFY,null);
      req.removeExpiresHeader();
      req.setEventHeader(new EventHeader(event,id));
      req.setBody("message/sipfrag;version=2.0",sipfragment);
      return req;
   }

}  

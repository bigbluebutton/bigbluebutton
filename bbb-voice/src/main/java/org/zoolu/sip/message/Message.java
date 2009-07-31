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


import org.zoolu.sip.header.Header;
import org.zoolu.sip.header.MultipleHeader;
import org.zoolu.sip.header.ReferToHeader;
import org.zoolu.sip.header.ReferredByHeader;
import org.zoolu.sip.header.EventHeader;
import org.zoolu.sip.header.AllowEventsHeader;
import org.zoolu.sip.header.SubscriptionStateHeader;
import org.zoolu.sip.header.SipHeaders;
import org.zoolu.net.UdpPacket;


/** Class Message extends class sip.message.BaseMessage adding some SIP extensions.
  * <p />
  * Class Message supports all methods and header definened in RFC3261, plus:
  * <ul>
  * <li> method MESSAGE (RFC3428) </>
  * <li> method REFER (RFC3515) </>
  * <li> header Refer-To </>
  * <li> header Referred-By </>
  * <li> header Event </>
  * </ul>
  */
public class Message extends org.zoolu.sip.message.BaseMessage
{
   /** Costructs a new empty Message */
   public Message() { super(); }

   /** Costructs a new Message */
   public Message(String str)
   {  super(str);
   }

   /** Costructs a new Message */
   public Message(byte[] buff, int offset, int len)
   {  super(buff,offset,len);
   }

   /** Costructs a new Message */
   public Message(UdpPacket packet)
   {  super(packet);
   }

   /** Costructs a new Message */
   public Message(Message msg)
   {  super(msg);
   }
   
   /** Creates and returns a clone of the Message */
   public Object clone()
   {  return new Message(this);
   }


   //****************************** Extensions *******************************/

   /** Returns boolean value to indicate if Message is a MESSAGE request (RFC3428) */
   public boolean isMessage() throws NullPointerException
   {  return isRequest(SipMethods.MESSAGE);
   }

   /** Returns boolean value to indicate if Message is a REFER request (RFC3515) */
   public boolean isRefer() throws NullPointerException
   {  return isRequest(SipMethods.REFER);
   }

   /** Returns boolean value to indicate if Message is a NOTIFY request (RFC3265) */
   public boolean isNotify() throws NullPointerException
   {  return isRequest(SipMethods.NOTIFY);
   }

   /** Returns boolean value to indicate if Message is a SUBSCRIBE request (RFC3265) */
   public boolean isSubscribe() throws NullPointerException
   {  return isRequest(SipMethods.SUBSCRIBE);
   }

   /** Returns boolean value to indicate if Message is a PUBLISH request (RFC3903) */
   public boolean isPublish() throws NullPointerException
   {  return isRequest(SipMethods.PUBLISH);
   }


   /** Whether the message has the Refer-To header */   
   public boolean hasReferToHeader()
   {  return hasHeader(SipHeaders.Refer_To);
   }
   /** Gets ReferToHeader */
   public ReferToHeader getReferToHeader()
   {  Header h=getHeader(SipHeaders.Refer_To);
      if (h==null) return null;
      return new ReferToHeader(h);
   }  
   /** Sets ReferToHeader */
   public void setReferToHeader(ReferToHeader h) 
   {  setHeader(h);
   } 
   /** Removes ReferToHeader from Message (if it exists) */
   public void removeReferToHeader() 
   {  removeHeader(SipHeaders.Refer_To);
   }



   /** Whether the message has the Referred-By header */   
   public boolean hasReferredByHeader()
   {  return hasHeader(SipHeaders.Refer_To);
   }
   /** Gets ReferredByHeader */
   public ReferredByHeader getReferredByHeader()
   {  Header h=getHeader(SipHeaders.Referred_By);
      if (h==null) return null;
      return new ReferredByHeader(h);
   }  
   /** Sets ReferredByHeader */
   public void setReferredByHeader(ReferredByHeader h) 
   {  setHeader(h);
   } 
   /** Removes ReferredByHeader from Message (if it exists) */
   public void removeReferredByHeader() 
   {  removeHeader(SipHeaders.Referred_By);
   }



   /** Whether the message has the EventHeader */   
   public boolean hasEventHeader()
   {  return hasHeader(SipHeaders.Event);
   }
   /** Gets EventHeader */
   public EventHeader getEventHeader()
   {  Header h=getHeader(SipHeaders.Event);
      if (h==null) return null;
      return new EventHeader(h);
   }  
   /** Sets EventHeader */
   public void setEventHeader(EventHeader h) 
   {  setHeader(h);
   } 
   /** Removes EventHeader from Message (if it exists) */
   public void removeEventHeader() 
   {  removeHeader(SipHeaders.Event);
   }


   /** Whether the message has the AllowEventsHeader */   
   public boolean hasAllowEventsHeader()
   {  return hasHeader(SipHeaders.Allow_Events);
   }
   /** Gets AllowEventsHeader */
   public AllowEventsHeader getAllowEventsHeader()
   {  Header h=getHeader(SipHeaders.Allow_Events);
      if (h==null) return null;
      return new AllowEventsHeader(h);
   }  
   /** Sets AllowEventsHeader */
   public void setAllowEventsHeader(AllowEventsHeader h) 
   {  setHeader(h);
   } 
   /** Removes AllowEventsHeader from Message (if it exists) */
   public void removeAllowEventsHeader() 
   {  removeHeader(SipHeaders.Allow_Events);
   }


   /** Whether the message has the Subscription-State header */   
   public boolean hasSubscriptionStateHeader()
   {  return hasHeader(SipHeaders.Subscription_State);
   }
   /** Gets SubscriptionStateHeader */
   public SubscriptionStateHeader getSubscriptionStateHeader()
   {  Header h=getHeader(SipHeaders.Subscription_State);
      if (h==null) return null;
      return new SubscriptionStateHeader(h);
   }  
   /** Sets SubscriptionStateHeader */
   public void setSubscriptionStateHeader(SubscriptionStateHeader h) 
   {  setHeader(h);
   } 
   /** Removes SubscriptionStateHeader from Message (if it exists) */
   public void removeSubscriptionStateHeader() 
   {  removeHeader(SipHeaders.Subscription_State);
   }

}

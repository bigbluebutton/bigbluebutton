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

package org.zoolu.sip.header;


import org.zoolu.tools.Parser;


/** Subscription-State header (see RFC3265 for details). */
public class SubscriptionStateHeader extends ParametricHeader
{
   /** State "active" */
   public static final String ACTIVE="active";

   /** State "pending" */
   public static final String PENDING="pending";

   /** State "terminated" */
   public static final String TERMINATED="terminated";

   /** State delimiters. */
   private static final char [] delim={',', ';', ' ', '\t', '\n', '\r'};
      

   /** Costructs a new SubscriptionStateHeader. */
   public SubscriptionStateHeader(String state)
   {  super(SipHeaders.Subscription_State,state);
   }

   /** Costructs a new SubscriptionStateHeader. */
   public SubscriptionStateHeader(Header hd)
   {  super(hd);
   }
   
   /** Gets the subscription state. */
   public String getState()
   {  return new Parser(value).getWord(delim);
   }
   
   /** Whether the subscription is active. */
   public boolean isActive()
   {  return getState().equals(ACTIVE);
   }

   /** Whether the subscription is pending. */
   public boolean isPending()
   {  return getState().equals(PENDING);
   }

   /** Whether the subscription is terminated. */
   public boolean isTerminated()
   {  return getState().equals(TERMINATED);
   }
   
   /** Sets the 'expires' param. */
   public SubscriptionStateHeader setExpires(int secs)
   {  setParameter("expires",Integer.toString(secs));
      return this;
   }
   
   /** Whether there is the 'expires' param. */
   public boolean hasExpires()
   {  return hasParameter("expires");
   }

   /** Gets the 'expires' param. */
   public int getExpires()
   {  String exp=getParameter("expires");
      if (exp!=null) return Integer.parseInt(exp);
      else return -1;
   }

   /** Sets the 'reason' param. */
   public SubscriptionStateHeader setReason(String reason)
   {  setParameter("reason",reason);
      return this;
   }
   
   /** Whether there is the 'reason' param. */
   public boolean hasReason()
   {  return hasParameter("reason");
   }

   /** Gets the 'reason' param. */
   public String getReason()
   {  return getParameter("reason");
   }

}



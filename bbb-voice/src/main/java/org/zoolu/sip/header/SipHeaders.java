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

/** SipHeaders extends class sip.header.SipHeaders by adding new SIP header names. */
public class SipHeaders extends BaseSipHeaders
{

   //****************************** Extensions *******************************/

   /** String "Refer-To" */
   public static final String Refer_To="Refer-To";  
   /** Whether <i>str</i> is "Refer-To" */
   public static boolean isReferTo(String str) { return same(str,Refer_To); }

   /** String "Referred-By" */
   public static final String Referred_By="Referred-By"; 
   /** Whether <i>str</i> is "Referred-By" */
   public static boolean isReferredBy(String str) { return same(str,Referred_By); }

   /** String "Event" */
   public static final String Event="Event";
   /** String "o" */
   public static final String Event_short="o";
   /** Whether <i>str</i> is an Event field */
   public static boolean isEvent(String str) { return same(str,Event) || same(str,Event_short); }

   /** String "Allow-Events" */
   public static final String Allow_Events="Allow-Events";
   /** Whether <i>str</i> is "Allow-Events" */
   public static boolean isAllowEvents(String str) { return same(str,Allow_Events); }

   /** String "Subscription-State" */
   public static final String Subscription_State="Subscription-State";
   /** Whether <i>str</i> is an Subscription_State field */
   public static boolean isSubscriptionState(String str) { return same(str,Subscription_State); }

}

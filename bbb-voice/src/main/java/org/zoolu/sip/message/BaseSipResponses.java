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




/** Class SipResponses provides all raeson-phrases
  * corrspondent to the various SIP response codes */
public abstract class BaseSipResponses
{
   //static Hashtable reasons;
   protected static String[] reasons;
   
   private static boolean is_init=false;
   
   protected static void init()
   {  if (is_init) return;
      //else

      //reasons=new Hashtable();
      //reasons.put(new Integer(100),"Trying");
      //..
      reasons=new String[700];
      for (int i=0; i<700; i++) reasons[i]=null;

      // Not defined (included just to robustness)
      reasons[0]="Internal error";
      
      // Informational
      reasons[100]="Trying";
      reasons[180]="Ringing";
      reasons[181]="Call Is Being Forwarded";
      reasons[182]="Queued";
      reasons[183]="Session Progress";
      
      // Success
      reasons[200]="OK";

      // Redirection
      reasons[300]="Multiple Choices";
      reasons[301]="Moved Permanently";
      reasons[302]="Moved Temporarily";
      reasons[305]="Use Proxy";
      reasons[380]="Alternative Service";

      // Client-Error
      reasons[400]="Bad Request";
      reasons[401]="Unauthorized";
      reasons[402]="Payment Required";
      reasons[403]="Forbidden";
      reasons[404]="Not Found";
      reasons[405]="Method Not Allowed";
      reasons[406]="Not Acceptable";
      reasons[407]="Proxy Authentication Required";
      reasons[408]="Request Timeout";
      reasons[410]="Gone";
      reasons[413]="Request Entity Too Large";
      reasons[414]="Request-URI Too Large";
      reasons[415]="Unsupported Media Type";
      reasons[416]="Unsupported URI Scheme";
      reasons[420]="Bad Extension";
      reasons[421]="Extension Required";
      reasons[423]="Interval Too Brief";
      reasons[480]="Temporarily not available";
      reasons[481]="Call Leg/Transaction Does Not Exist";
      reasons[482]="Loop Detected";
      reasons[483]="Too Many Hops";
      reasons[484]="Address Incomplete";
      reasons[485]="Ambiguous";
      reasons[486]="Busy Here";
      reasons[487]="Request Terminated";
      reasons[488]="Not Acceptable Here";
      reasons[491]="Request Pending";
      reasons[493]="Undecipherable";

      // Server-Error
      reasons[500]="Internal Server Error";
      reasons[501]="Not Implemented";
      reasons[502]="Bad Gateway";
      reasons[503]="Service Unavailable";
      reasons[504]="Server Time-out";
      reasons[505]="SIP Version not supported";
      reasons[513]="Message Too Large";

      // Global-Failure
      reasons[600]="Busy Everywhere";
      reasons[603]="Decline";
      reasons[604]="Does not exist anywhere";
      reasons[606]="Not Acceptable";

      is_init=true;
   }
   
   /** Gets the reason phrase of a given response <i>code</i> */
   public static String reasonOf(int code)
   {  if (!is_init) init();
      if (reasons[code]!=null) return reasons[code];
      else return reasons[((int)(code/100))*100];
   }
   
   /** Sets the reason phrase for a given response <i>code</i> */
   /*public static void setReason(int code, String reason)
   {  reasons[((int)(code/100))*100]=reason;
   }*/
}
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




/** SipHeaders simply collects all standard SIP header names. */
public abstract class BaseSipHeaders
{
   /** String "Accept" */
   public static final String Accept="Accept";
   /** String "Alert-Info" */
   public static final String Alert_Info="Alert-Info";
   /** String "Allow" */
   public static final String Allow="Allow";
   /** String "Authentication-Info" */
   public static final String Authentication_Info="Authentication-Info";
   /** String "Authorization" */
   public static final String Authorization="Authorization";
   /** String "Call-ID" */
   public static final String Call_ID="Call-ID";
   /** String "i" */
   public static final String Call_ID_short="i";
   /** String "Contact" */
   public static final String Contact="Contact";
   /** String "m" */
   public static final String Contact_short="m";
   /** String "Content-Length" */
   public static final String Content_Length="Content-Length";  
   /** String "l" */
   public static final String Content_Length_short="l";  
   /** String "Content-Type" */
   public static final String Content_Type="Content-Type"; 
   /** String "c" */
   public static final String Content_Type_short="c"; 
   /** String "CSeq" */
   public static final String CSeq="CSeq";
   /** String "Date" */
   public static final String Date="Date";
   /** String "Expires" */
   public static final String Expires="Expires";
   /** String "From" */
   public static final String From="From";
   /** String "f" */
   public static final String From_short="f";
   /** String "User-Agent" */
   public static final String User_Agent="User-Agent";  
   /** String "Max-Forwards" */
   public static final String Max_Forwards="Max-Forwards";  
   /** String "Proxy-Authenticate" */
   public static final String Proxy_Authenticate="Proxy-Authenticate";   
   /** String "Proxy-Authorization" */
   public static final String Proxy_Authorization="Proxy-Authorization";   
   /** String "Proxy-Require" */
   public static final String Proxy_Require="Proxy-Require";   
   /** String "Record-Route" */
   public static final String Record_Route="Record-Route"; 
   /** String "Require" */
   public static final String Require="Require";   
   /** String "Route" */
   public static final String Route="Route";   
   /** String "Server" */
   public static final String Server="Server";  
   /** String "Subject" */
   public static final String Subject="Subject";  
   /** String "s" */
   public static final String Subject_short="s";  
   /** String "Supported" */
   public static final String Supported="Supported";   
   /** String "k" */
   public static final String Supported_short="k";   
   /** String "To" */
   public static final String To="To";
   /** String "t" */
   public static final String To_short="t";
   /** String "Unsupported" */
   public static final String Unsupported="Unsupported";   
   /** String "Via" */
   public static final String Via="Via";
   /** String "v" */
   public static final String Via_short="v";
   /** String "WWW-Authenticate" */
   public static final String WWW_Authenticate="WWW-Authenticate";

   /** Whether <i>s1</i> and <i>s2</i> are case-unsensitive-equal. */
   protected static boolean same(String s1, String s2)
   { //return s1.compareToIgnoreCase(s2)==0;
      return s1.equalsIgnoreCase(s2);
   }

   /** Whether <i>str</i> is a Accept field */
   public static boolean isAccept(String str) { return same(str,Accept); }
   /** Whether <i>str</i> is a Alert_Info field */
   public static boolean isAlert_Info(String str) { return same(str,Alert_Info); }
   /** Whether <i>str</i> is a Allow field */
   public static boolean isAllow(String str) { return same(str,Allow); }
   /** Whether <i>str</i> is a Authentication_Info field */
   public static boolean isAuthentication_Info(String str) { return same(str,Authentication_Info); }
   /** Whether <i>str</i> is a Authorization field */
   public static boolean isAuthorization(String str) { return same(str,Authorization); }
   /** Whether <i>str</i> is a Call-ID field */
   public static boolean isCallId(String str) { return same(str,Call_ID) || same(str,Call_ID_short); }
   /** Whether <i>str</i> is a Contact field */
   public static boolean isContact(String str) { return same(str,Contact) || same(str,Contact_short); }
   /** Whether <i>str</i> is a Content_Length field */
   public static boolean isContent_Length(String str) { return same(str,Content_Length) || same(str,Content_Length_short); }
   /** Whether <i>str</i> is a Content_Type field */
   public static boolean isContent_Type(String str) { return same(str,Content_Type) || same(str,Content_Type_short); }
   /** Whether <i>str</i> is a CSeq field */
   public static boolean isCSeq(String str) { return same(str,CSeq); }
   /** Whether <i>str</i> is a Date field */
   public static boolean isDate(String str) { return same(str,Date); }
   /** Whether <i>str</i> is a Expires field */
   public static boolean isExpires(String str) { return same(str,Expires); }
   /** Whether <i>str</i> is a From field */
   public static boolean isFrom(String str) { return same(str,From) || same(str,From_short); }
   /** Whether <i>str</i> is a User_Agent field */
   public static boolean isUser_Agent(String str) { return same(str,User_Agent); }
   /** Whether <i>str</i> is a Max_Forwards field */
   public static boolean isMax_Forwards(String str) { return same(str,Max_Forwards); }
   /** Whether <i>str</i> is a Proxy_Authenticate field */
   public static boolean isProxy_Authenticate(String str) { return same(str,Proxy_Authenticate); }
   /** Whether <i>str</i> is a Proxy_Authorization field */
   public static boolean isProxy_Authorization(String str) { return same(str,Proxy_Authorization); }
   /** Whether <i>str</i> is a Proxy_Require field */
   public static boolean isProxy_Require(String str) { return same(str,Proxy_Require); }
   /** Whether <i>str</i> is a Record_Route field */
   public static boolean isRecord_Route(String str) { return same(str,Record_Route); }
   /** Whether <i>str</i> is a Require field */
   public static boolean isRequire(String str) { return same(str,Require); }
   /** Whether <i>str</i> is a Route field */
   public static boolean isRoute(String str) { return same(str,Route); }
   /** Whether <i>str</i> is a Server field */
   public static boolean isServer(String str) { return same(str,Server); }
   /** Whether <i>str</i> is a Subject field */
   public static boolean isSubject(String str) { return same(str,Subject) || same(str,Subject_short); }
   /** Whether <i>str</i> is a Supported field */
   public static boolean isSupported(String str) { return same(str,Supported) || same(str,Supported_short); }
   /** Whether <i>str</i> is a To field */
   public static boolean isTo(String str) { return same(str,To) || same(str,To_short); }
   /** Whether <i>str</i> is a Unsupported field */
   public static boolean isUnsupported(String str) { return same(str,Unsupported); }
   /** Whether <i>str</i> is a Via field */
   public static boolean isVia(String str) { return same(str,Via) || same(str,Via_short); }
   /** Whether <i>str</i> is a WWW_Authenticate field */
   public static boolean isWWW_Authenticate(String str) { return same(str,WWW_Authenticate); }
   
}

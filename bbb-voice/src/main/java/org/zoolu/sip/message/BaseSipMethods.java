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




/** Class BaseSipMethods collects all SIP method names.
 */
public abstract class BaseSipMethods
{
   /** String "INVITE" */
   public static final String INVITE="INVITE";
   /** Whether <i>str</i> is INVITE */
   public static boolean isInvite(String str) { return same(str,INVITE); }
   /** String "ACK" */
   public static final String ACK="ACK";
   /** Whether <i>str</i> is ACK */
   public static boolean isAck(String str) { return same(str,ACK); }
   /** String "CANCEL" */
   public static final String CANCEL="CANCEL";
   /** Whether <i>str</i> is CANCEL */
   public static boolean isCancel(String str) { return same(str,CANCEL); }
   /** String "BYE" */
   public static final String BYE="BYE";
   /** Whether <i>str</i> is BYE */
   public static boolean isBye(String str) { return same(str,BYE); }
   /** String "INFO" */
   public static final String INFO="INFO";
   /** Whether <i>str</i> is INFO */
   public static boolean isInfo(String str) { return same(str,INFO); }
   /** String "OPTION" */
   public static final String OPTION="OPTION";
   /** Whether <i>str</i> is OPTION */
   public static boolean isOption(String str) { return same(str,OPTION); }
   /** String "REGISTER" */
   public static final String REGISTER="REGISTER";
   /** Whether <i>str</i> is REGISTER */
   public static boolean isRegister(String str) { return same(str,REGISTER); }
   /** String "UPDATE" */
   public static final String UPDATE="UPDATE";
   /** Whether <i>str</i> is UPDATE */
   public static boolean isUpdate(String str) { return same(str,UPDATE); }
   
   /** Whether <i>s1</i> and <i>s2</i> are case-unsensitive-equal. */
   protected static boolean same(String s1, String s2)
   {  //return s1.compareToIgnoreCase(s2)==0;
      return s1.equalsIgnoreCase(s2);
   } 
   
   /** Array of standard methods */
   public static final String[] methods={ INVITE,ACK,CANCEL,BYE,INFO,OPTION,REGISTER,UPDATE };

   /** Array of standards methods that creates a dialog */
   public static final String[] dialog_methods={ INVITE };
}

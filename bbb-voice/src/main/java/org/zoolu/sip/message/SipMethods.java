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




/** Class SipMethods extends org.zoolu.sip.message.BaseSipMethods
  * and collects all SIP method names.
 */
public class SipMethods extends BaseSipMethods
{   

   //****************************** Extensions *******************************/

   /** String "SUBSCRIBE" */
   public static final String SUBSCRIBE="SUBSCRIBE";
   /** Whether <i>str</i> is SUBSCRIBE */
   public static boolean isSubscribe(String str) { return same(str,SUBSCRIBE); }

   /** String "NOTIFY" */
   public static final String NOTIFY="NOTIFY";
   /** Whether <i>str</i> is NOTIFY */
   public static boolean isNotify(String str) { return same(str,NOTIFY); }

   /** String "MESSAGE" for method MESSAGE defined in RFC3428 */
   public static final String MESSAGE="MESSAGE";
   /** Whether <i>str</i> is MESSAGE */
   public static boolean isMessage(String str) { return same(str,MESSAGE); }

   /** String "REFER" for method REFER defined in RFC3515 */
   public static final String REFER="REFER";
   /** Whether <i>str</i> is REFER */
   public static boolean isRefer(String str) { return same(str,REFER); }

   /** String "PUBLISH" for method PUBLISH defined in RFC3903 */
   public static final String PUBLISH="PUBLISH";
   /** Whether <i>str</i> is PUBLISH */
   public static boolean isPublish(String str) { return same(str,PUBLISH); }


   /** Array of all methods ( standard (RFC3261) + new (RFC3428,..) ) */
   public static final String[] methods={ INVITE,ACK,CANCEL,BYE,INFO,OPTION,REGISTER,UPDATE,SUBSCRIBE,NOTIFY,MESSAGE,REFER,PUBLISH };

   /** Array of all methods that create a dialog */
   public static final String[] dialog_methods={ INVITE,SUBSCRIBE };
}

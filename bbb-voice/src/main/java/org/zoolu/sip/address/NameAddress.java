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

package org.zoolu.sip.address;

import org.zoolu.sip.provider.SipParser;

/** Class <i>NameAddress</i> is used to rapresent any valid SIP Name Address.
  * It contains a SIP URI and optionally a display name.
  * <BR> A  SIP Name Address is a string of the form of:
  * <BR><BLOCKQUOTE><PRE>&nbsp&nbsp [ display-name ] address
  * <BR>&nbsp&nbsp where address can be a valid SIP URL</PRE></BLOCKQUOTE>
*/
public class NameAddress {
   String name;
   SipURL url;

   public NameAddress(String displayname, SipURL sipurl) {  
	   name = displayname;
       url = sipurl;
   }

   public NameAddress(SipURL sipurl) {  
	   name = null;
       url = sipurl;
   }

   public NameAddress(NameAddress name_address) {  
	   name = name_address.getDisplayName();
       url = name_address.getAddress();
   }

   public NameAddress(String naddr) {  
	   SipParser par = new SipParser(naddr);
       NameAddress na = par.getNameAddress();
      //DEBUG
      //if (na==null)
      //{  System.out.println("DEBUG: NameAddress: par:\r\n"+par.getWholeString());
      //   System.exit(0);
      //}
      name = na.name;
      url = na.url;
   }
   
   /** Creates and returns a copy of NameAddress */
   public Object clone() {  
	   return new NameAddress(this);
   }

   /** Indicates whether some other Object is "equal to" this NameAddress */
   public boolean equals(Object obj) {  
	   NameAddress naddr = (NameAddress)obj;
       return url.equals(naddr.getAddress());
   }

   /** Gets address of NameAddress */
   public SipURL getAddress() {  
	   return url;
   }

   /** Gets display name of NameAddress (Returns null id display name does not exist) */
   public String getDisplayName() {  
	   return name;
   }

   /** Gets boolean value to indicate if NameAddress has display name */
   public boolean hasDisplayName() {  
	   return name!=null;
   }

   /** Removes display name from NameAddress (if it exists) */
   public void removeDisplayName() {  
	   name = null;
   }

   /** Sets address of NameAddress */
   public void setAddress(SipURL address) {  
	   url = address;
   }

   /** Sets display name of Header */
   public void setDisplayName(String displayName) {  
	   name = displayName;
   }

   /** Whether two NameAddresses are equals */
   public boolean equals(NameAddress naddr) {  
	   return (name == naddr.name && url == naddr.url);
   }

   /** Gets string representation of NameAddress */
   public String toString() {  
	   String str;
       if (hasDisplayName())
         str = "\"" + name + "\" <" + url +">";
       else str = "<" + url + ">";
         
      return str;
   }

}

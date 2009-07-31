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


import org.zoolu.sip.address.*;
import org.zoolu.sip.provider.SipParser;


/** Abstract EndPointHeader is the base Class for SIP Headers such as FromHeader, ToHeader.
  * The "tag" parameter is used in the EndPointHeader.
  * It serves as a general mechanism to identify a dialog,
  * which is the combination of the Call-ID along with two tags, one from
  * each participant in the dialog.
  */
public abstract class EndPointHeader extends NameAddressHeader
{
   /** EndPoint parameters that should be removed from the returned NameAddress.
     * This tries to resolve a bug (?) of SIP when using SIP URL parameters in a name-address
     * within an EndPointHeader that may have some header parameters. */
   static final String[] ENDPOINT_PARAMS={"tag","expires"}; 


   /** Creates a new EndPointHeader. */
   //public EndPointHeader(String hname)
   //{  super(hname);
   //}

   /** Creates a new EndPointHeader. */
   public EndPointHeader(String hname, NameAddress nameaddr)
   {  super(hname,nameaddr);
   }

   /** Creates a new EndPointHeader. */
   public EndPointHeader(String hname, SipURL url)
   {  super(hname,url);
   }

   /** Creates a new EndPointHeader. */
   public EndPointHeader(String hname, NameAddress nameaddr, String tag)
   {  super(hname,nameaddr);
      if (tag!=null) setParameter("tag",tag);
   }

   /** Creates a new EndPointHeader. */
   public EndPointHeader(String hname, SipURL url, String tag)
   {  super(hname,url);
      if (tag!=null) setParameter("tag",tag);
   }

   /** Creates a new EndPointHeader. */
   public EndPointHeader(Header hd)
   {  super(hd);
   }
   
   /** Gets 'tag' parameter. */
   public String getTag()
   {  return this.getParameter("tag");
   }
   
   /** Whether it has 'tag' parameter. */
   public boolean hasTag()
   {  return this.hasParameter("tag");
   }
   
   /** Gets NameAddress from the EndPointHeader.
     * <br> It extends the NameAddressHeader.getNameAddress() method, by removing
     * eventual EndPointHeader field parameters (e.g. 'tag' param) from the returnerd NameAddress.
     * @return the end point NameAddress or null if NameAddress does not exist
     * (that leads to the wildcard in case of ContactHeader) */
   public NameAddress getNameAddress()
   {  NameAddress naddr=(new SipParser(value)).getNameAddress();
      // patch for removing eventual 'tag' or other EndPointHeader parameters from NameAddress
      SipURL url=naddr.getAddress();
      for (int i=0; i< ENDPOINT_PARAMS.length; i++)
      {  if (url.hasParameter(ENDPOINT_PARAMS[i]))
         {  url.removeParameter(ENDPOINT_PARAMS[i]);
            naddr=new NameAddress(naddr.getDisplayName(),url);
         }
      }
      return naddr;
   }

}

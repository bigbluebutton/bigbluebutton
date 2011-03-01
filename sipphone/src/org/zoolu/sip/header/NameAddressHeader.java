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
import org.zoolu.tools.Parser;


/** Abstract NameAddress Header is the base Class for SIP Headers such as EndPointHeader.
  * It contains a NameAddress, formed by a SIP URI and optionally a display name.
  */
public abstract class NameAddressHeader extends ParametricHeader
{
   /** Creates a new NameAddressHeader. */
   //public NameAddressHeader(String hname)
   //{  super(hname);
   //}

   /** Creates a new NameAddressHeader. */
   public NameAddressHeader(String hname, NameAddress nameaddr)
   {  super(hname,nameaddr.toString());
   }

   /** Creates a new NameAddressHeader. */
   public NameAddressHeader(String hname, SipURL url)
   {  super(hname,url.toString());
   }

   /** Creates a new NameAddressHeader. */
   public NameAddressHeader(Header hd)
   {  super(hd);
   }

   /** Gets NameAddress of NameAddressHeader (Returns null if NameAddress does not exist - i.e. wildcard ContactHeader) */
   public NameAddress getNameAddress()
   {  NameAddress naddr=(new SipParser(value)).getNameAddress();
      return naddr;
   }

   /** Sets NameAddress of NameAddressHeader */
   public void setNameAddress(NameAddress naddr)
   {  value=naddr.toString();
   }
   
   
   // ***************** ParametricHeader's extended method *****************
   
   /** Returns the index of the first semicolon before the first parameter.
     * @returns the index of the semicolon before the first parameter, or -1 if no parameter is present. */
   protected int indexOfFirstSemi()
   {  Parser par=new Parser(value);
      par.goToSkippingQuoted('>');
      if (par.getPos()==value.length()) par.setPos(0);
      par.goToSkippingQuoted(';');
      if (par.getPos()<value.length()) return par.getPos();
      else return -1;
   }


}

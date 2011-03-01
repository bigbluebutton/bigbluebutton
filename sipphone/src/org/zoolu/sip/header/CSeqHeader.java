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


import org.zoolu.sip.provider.SipParser;


/** SIP Header CSeq.
  * The CSeq header field serves as a way to identify and order
  * transactions.  It consists of a sequence number and a method.  The
  * method MUST match that of the request.  For non-REGISTER requests
  * outside of a dialog, the sequence number value is arbitrary.
  */
public class CSeqHeader extends Header
{
   //public CSeqHeader()
   //{  super(SipHeaders.CSeq);
   //}

   public CSeqHeader(String hvalue)
   {  super(SipHeaders.CSeq,hvalue);
   }

   public CSeqHeader(Header hd)
   {  super(hd);
   }
   
   public CSeqHeader(long seq, String method)
   {  super(SipHeaders.CSeq,String.valueOf(seq)+" "+method);
   }

   /** Gets method of CSeqHeader */
   public String getMethod()
   {  SipParser par=new SipParser(value);
      par.skipString(); // skip sequence number
      return par.getString();
   }

   /** Gets sequence number of CSeqHeader */
   public long getSequenceNumber()
   {  return (new SipParser(value)).getInt();
   }

   /** Sets method of CSeqHeader */
   public void setMethod(String method)
   {  value=getSequenceNumber()+" "+method;
   }

   /** Sets sequence number of CSeqHeader */
   public void setSequenceNumber(long sequenceNumber)
   {  value=String.valueOf(sequenceNumber)+" "+getMethod();
   }

   /** Increments sequence number of CSeqHeader */
   public CSeqHeader incSequenceNumber()
   {  value=String.valueOf(getSequenceNumber()+1)+" "+getMethod();
      return this;
   }
}


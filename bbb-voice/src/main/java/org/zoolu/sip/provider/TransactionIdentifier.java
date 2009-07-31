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

package org.zoolu.sip.provider;


import org.zoolu.sip.transaction.Transaction;
import org.zoolu.sip.message.Message;
import org.zoolu.sip.message.SipMethods;
import org.zoolu.sip.header.ViaHeader;
import org.zoolu.sip.header.CSeqHeader;


/** TransactionIdentifier is used to address specific transaction to the SipProvider.
  */
public class TransactionIdentifier extends Identifier
{
   /** Costructs a new TransactionIdentifier. */
   public TransactionIdentifier(TransactionIdentifier i)
   {  super(i);
   }

   /** Costructs a new TransactionIdentifier based only on method name. */
   public TransactionIdentifier(String method)
   {  id=method;
   }

   /** Costructs a new TransactionIdentifier based on call-id, seqn, method, sent-by, and branch. */
   public TransactionIdentifier(String call_id, long seqn, String method, String sent_by, String branch)
   {  if (branch==null) branch="";
      if (method.equals(SipMethods.ACK)) method=SipMethods.INVITE; 
      id=call_id+"-"+seqn+"-"+method+"-"+sent_by+"-"+branch;
   }
}

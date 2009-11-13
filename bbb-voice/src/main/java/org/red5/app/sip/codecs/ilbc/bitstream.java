/*
 * SIP Communicator, the OpenSource Java VoIP and Instant Messaging client.
 *
 * Distributable under LGPL license.
 * See terms of license at gnu.org.
 */
//package net.java.sip.communicator.impl.media.codec.audio.ilbc;
package org.red5.app.sip.codecs.ilbc;

/**
 * @author Jean Lorchat
 */
public class bitstream {

    int bitcount;

    int pos;

    public char [] buffer;
    int buffer_len;
    int buffer_pos;

    public bitstream(int size) {
	pos = 0;

	buffer_len = size;
	buffer_pos = 0;
	buffer = new char[size];
	bitcount = 0;
    }

    public bitstream() {
	pos = 0;

	buffer_len = 128;
	buffer_pos = 0;
	buffer = new char[128];
    }

   /*----------------------------------------------------------------*
    *  splitting an integer into first most significant bits and
    *  remaining least significant bits
    *---------------------------------------------------------------*/

    public bitpack packsplit(
       int index,                 /* (i) the value to split */
       int bitno_firstpart,    /* (i) number of bits in most
                                          significant part */
       int bitno_total)             /* (i) number of bits in full range
                                          of value */
    {
	int bitno_rest = bitno_total - bitno_firstpart;
	bitpack rval = new bitpack ();

	int fp = index >>> bitno_rest;

	rval.set_firstpart(fp);
	//	*firstpart = *index>>(bitno_rest);
	rval.set_rest(index - (rval.get_firstpart() << bitno_rest));
	//	*rest = *index-(*firstpart<<(bitno_rest));
	return rval;
    }

   /*----------------------------------------------------------------*
    *  combining a value corresponding to msb's with a value
    *  corresponding to lsb's
    *---------------------------------------------------------------*/

    int packcombine(
       int index,                 /* (i/o) the msb value in the
                                          combined value out */
       int rest,                   /* (i) the lsb value */
       int bitno_rest              /* (i) the number of bits in the
                                          lsb part */
   ){
	index = index << bitno_rest;
	index += rest;
	return index;
   }

   /*----------------------------------------------------------------*
    *  packing of bits into bitstream, i.e., vector of bytes
    *---------------------------------------------------------------*/

   void dopack(
//        unsigned char **bitstream,  /* (i/o) on entrance pointer to
//                                           place in bitstream to pack
//                                           new data, on exit pointer
//                                           to place in bitstream to
//                                           pack future data */
       int index,                  /* (i) the value to pack */
       int bitno                  /* (i) the number of bits that the
                                          value will fit within */
   ){
       int posLeft;

       //       System.out.println("packing " + bitno + " bits (" + index + "), total packed : " + (bitcount+bitno) + " bits to date");
       bitcount += bitno;

			  //       System.out.println("packing tag " + index + " of length " + bitno +  "bits from byte " + buffer_pos + "/" + buffer.length + " at " + pos + "th bit");

       /* Clear the bits before starting in a new byte */

       if (pos == 0) {
           buffer[buffer_pos] = 0;
       }

       while (bitno > 0) {

           /* Jump to the next byte if end of this byte is reached*/

           if (pos == 8) {
               pos = 0;
	       buffer_pos++;
	       buffer[buffer_pos] = 0;
           }

           posLeft = 8 - pos;

           /* Insert index into the bitstream */

           if (bitno <= posLeft) {
               buffer[buffer_pos] |= (char) (index << (posLeft - bitno));
               pos += bitno;
               bitno = 0;
           } else {
               buffer[buffer_pos] |= (char)(index >>> (bitno - posLeft));

               pos = 8;
               index -= ((index >>> (bitno - posLeft)) << (bitno - posLeft));

               bitno -= posLeft;
           }
       }
   }

   /*----------------------------------------------------------------*
    *  unpacking of bits from bitstream, i.e., vector of bytes
    *---------------------------------------------------------------*/

    public int unpack(
       int bitno                  /* (i) number of bits used to
                                          represent the value */
       )
    {
	int BitsLeft;
	int index=0;

	while (bitno > 0) {

	    /* move forward in bitstream when the end of the
	       byte is reached */

	    if (pos == 8) {
		pos = 0;
		buffer_pos++;
	    }

	    BitsLeft = 8 - pos;

	    /* Extract bits to index */

	    if (BitsLeft >= bitno) {
               index += ((((buffer[buffer_pos]) << (pos)) & 0xFF) >>> (8 - bitno));
               pos += bitno;
               bitno = 0;
           } else {

               if ((8 - bitno) > 0) {
                   index+=((((buffer[buffer_pos]) << (pos)) & 0xFF) >>> (8 - bitno));
                   pos=8;
               } else {
                   index+=(((int)(((buffer[buffer_pos]) << (pos)) & 0xFF)) << (bitno - 8));
                   pos=8;
               }
               bitno -= BitsLeft;
           }
       }

       return index;
    }
}

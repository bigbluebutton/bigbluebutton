package org.red5.app.sip.codecs.g729;
//package org.mobicents.media.server.impl.dsp.audio.g729;

public class Bits {

	/*----------------------------------------------------------------------------
	 * prm2bits_ld8k -converts encoder parameter vector into vector of serial bits
	 * bits2prm_ld8k - converts serial received bits to  encoder parameter vector
	 *
	 * The transmitted parameters are:
	 *
	 *     LPC:     1st codebook           7+1 bit
	 *              2nd codebook           5+5 bit
	 *
	 *     1st subframe:
	 *          pitch period                 8 bit
	 *          parity check on 1st period   1 bit
	 *          codebook index1 (positions) 13 bit
	 *          codebook index2 (signs)      4 bit
	 *          pitch and codebook gains   4+3 bit
	 *
	 *     2nd subframe:
	 *          pitch period (relative)      5 bit
	 *          codebook index1 (positions) 13 bit
	 *          codebook index2 (signs)      4 bit
	 *          pitch and codebook gains   4+3 bit
	 *----------------------------------------------------------------------------
	 */
	
	public static void prm2bits_ld8k_b(
			 int   anau[],         /* input : encoded parameters  (PRM_SIZE parameters)  */
			  byte dst[]           /* output: serial bits (SERIAL_SIZE ) bits[0] = bfi
			                                    bits[1] = 80 */
			)
			{
        dst[0] = (byte)(anau[0] & 255);
        dst[1] = (byte)((anau[1] & 0x3ff) >> 2);
        dst[2] = (byte)(((anau[1] & 3) << 6) | ((anau[2]>>2)&0x3f));
        dst[3] = (byte)(((anau[2] & 3) << 6) | ((anau[3] & 1) << 5) | ((anau[4] & 8191) >> 8));
        dst[4] = (byte)(anau[4] & 255);
        dst[5] = (byte)(((anau[5] & 15)<<4) | ((anau[6] & 127) >> 3));
        dst[6] = (byte)(((anau[6] & 7)<< 5) | (anau[7] & 31));
        dst[7] = (byte)((anau[8] & 8191) >> 5);
        dst[8] = (byte)(((anau[8] & 31) << 3) | ((anau[9] & 15) >> 1));
        dst[9] = (byte)(((anau[9] & 1) << 7) | (anau[10] & 127));

			   return;
			}
	
	public static void prm2bits_ld8k(
	 int   prm[],         /* input : encoded parameters  (PRM_SIZE parameters)  */
	  short bits[]           /* output: serial bits (SERIAL_SIZE ) bits[0] = bfi
	                                    bits[1] = 80 */
	)
	{
		int prmp = 0;
		int bitsp = 0;
	   short i;
	   bits[bitsp++] = LD8KConstants.SYNC_WORD;     /* bit[0], at receiver this bits indicates BFI */
	   bits[bitsp++] = LD8KConstants.SIZE_WORD;     /* bit[1], to be compatible with hardware */

	   for (i = 0; i < LD8KConstants.PRM_SIZE; i++)
	     {
	        int2bin(prm[i], TabLD8k.bitsno[i], bits, bitsp);
	        bitsp += TabLD8k.bitsno[i];
	     }

	   return;
	}
	
	public static byte[] toRealBits(short[] fakebits){
		byte[] real = new byte[10];
		for(int q=0; q<80; q++) {
			if(fakebits[q+2] == LD8KConstants.BIT_1) {
				int tmp = real[q/8];
				int onebit = 1<<(7-(q%8));
				tmp|=onebit;
				real[q/8] = (byte)(0xFF&tmp);
			}
				
		}
		return real;
	}
	
	public static short[] fromRealBits(byte[] real){
		short[] fake = new short[82];
		fake[0] = LD8KConstants.SYNC_WORD;
		fake[1] = LD8KConstants.SIZE_WORD;
		for(int q=0; q<80; q++) {
			if((real[q/8]&(1<<(7-(q%8)))) != 0)
				fake[q+2] = LD8KConstants.BIT_1;
			else
				fake[q+2] = LD8KConstants.BIT_0;
		}
		return fake;
	}

	/*----------------------------------------------------------------------------
	 * int2bin convert integer to binary and write the bits bitstream array
	 *----------------------------------------------------------------------------
	 */
	static void int2bin(
	 int value,             /* input : decimal value */
	 int no_of_bits,        /* input : number of bits to use */
	 short[] bitstream, int bitstreams       /* output: bitstream  */
	)
	{
	   int pt_bitstream;
	   short   i, bit;

	   pt_bitstream = bitstreams + no_of_bits;

	   for (i = 0; i < no_of_bits; i++)
	   {
	     bit = (short)(value & 0x0001);      /* get lsb */
	     if (bit == 0)
	         bitstream[--pt_bitstream] = LD8KConstants.BIT_0;
	     else
	         bitstream[--pt_bitstream] = LD8KConstants.BIT_1;
	     value >>= 1;
	   }
	}

	/*----------------------------------------------------------------------------
	 *  bits2prm_ld8k - converts serial received bits to  encoder parameter vector
	 *----------------------------------------------------------------------------
	 */
	public static void bits2prm_ld8k(
	 short bits[], int bitss,          /* input : serial bits (80)                       */
	 int   prm[], int ps            /* output: decoded parameters (11 parameters)     */
	)
	{
	   short i;
	   for (i = 0; i < LD8KConstants.PRM_SIZE; i++)
	     {
	        prm[i+ps] = bin2int(TabLD8k.bitsno[i], bits,bitss);
	        bitss  += TabLD8k.bitsno[i];
	     }

	}

	/*----------------------------------------------------------------------------
	 * bin2int - read specified bits from bit array  and convert to integer value
	 *----------------------------------------------------------------------------
	 */
	static short bin2int(            /* output: decimal value of bit pattern */
	 int no_of_bits,        /* input : number of bits to read */
	 short []bitstream, int bitstreams       /* input : array containing bits */
	)
	{
	   short   value, i;
	   short bit;

	   value = 0;
	   for (i = 0; i < no_of_bits; i++)
	   {
	     value <<= 1;
	     bit = bitstream[bitstreams++];
	     if (bit == LD8KConstants.BIT_1)  value += 1;
	   }
	   return(value);
	}

}

package org.red5.app.sip.codecs.g729;
//package org.mobicents.media.server.impl.dsp.audio.g729;

public class PParity {

	/*-----------------------------------------------------*
	 * parity_pitch - compute parity bit for first 6 MSBs  *
	 *-----------------------------------------------------*/

	public static int parity_pitch(     /* output: parity bit (XOR of 6 MSB bits)     */
	  int pitch_index     /* input : index for which parity is computed */
	)
	{
	    int temp, sum, i, bit;

	    temp = pitch_index >> 1;

	    sum = 1;
	    for (i = 0; i <= 5; i++) {
	        temp >>= 1;
	        bit = temp & 1;
	        sum = sum + bit;
	    }
	    sum = sum & 1;
	    return (sum);
	}

	/*--------------------------------------------------------------------*
	 * check_parity_pitch - check parity of index with transmitted parity *
	 *--------------------------------------------------------------------*/

	public static int check_parity_pitch(  /* output: 0 = no error, 1= error */
	  int pitch_index,       /* input : index of parameter     */
	  int parity             /* input : parity bit             */
	)
	{
	    int temp, sum, i, bit;
	    temp = pitch_index >> 1;

	    sum = 1;
	    for (i = 0; i <= 5; i++) {
	        temp >>= 1;
	        bit = temp & 1;
	        sum = sum + bit;
	    }
	    sum += parity;
	    sum = sum & 1;
	    return (sum);
	}

}

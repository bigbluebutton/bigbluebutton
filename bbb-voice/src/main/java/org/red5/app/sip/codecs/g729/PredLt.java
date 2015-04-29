package org.red5.app.sip.codecs.g729;
//package org.mobicents.media.server.impl.dsp.audio.g729;

public class PredLt {


	/*-------------------------------------------------------------------*
	 * Function  Pred_lt_3()                                             *
	 *           ~~~~~~~~~~~                                             *
	 *-------------------------------------------------------------------*
	 * Compute the result of long term prediction with fractional        *
	 * interpolation of resolution 1/3.                                  *
	 *                                                                   *
	 * On return exc[0..L_subfr-1] contains the interpolated signal      *
	 *   (adaptive codebook excitation)                                  *
	 *-------------------------------------------------------------------*/

	public static void pred_lt_3(         /* Compute adaptive codebook                       */
	  float exc[],int excs,          /* in/out: excitation vector, exc[0:l_sub-1] = out */
	  int t0,               /* input : pitch lag                               */
	  int frac,             /* input : Fraction of pitch lag (-1, 0, 1)  / 3   */
	  int l_subfr           /* input : length of subframe.                     */
	)
	{

	  int   i, j, k;
	  float s;
	  int x0, x1, x2, c1, c2;


	  x0 = -t0;//&exc[-t0];

	  frac = -frac;
	  if (frac < 0) {
	    frac += LD8KConstants.UP_SAMP;
	    x0--;
	  }

	  for (j=0; j<l_subfr; j++)
	  {
	    x1 = x0++;
	    x2 = x0;
	    c1 = frac;//&inter_3l[frac];
	    c2 = LD8KConstants.UP_SAMP-frac;//&inter_3l[LD8KConstants.UP_SAMP-frac];

	    s = (float)0.0;
	    for(i=0, k=0; i< LD8KConstants.L_INTER10; i++, k+=LD8KConstants.UP_SAMP)
	      s+= exc[excs+x1-i] * TabLD8k.inter_3l[c1+k] + exc[excs+x2+i] * TabLD8k.inter_3l[c2+k];

	    exc[excs+j] = s;
	  }

	  return;
	}

}

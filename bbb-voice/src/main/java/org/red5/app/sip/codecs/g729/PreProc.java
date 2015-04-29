package org.red5.app.sip.codecs.g729;
//package org.mobicents.media.server.impl.dsp.audio.g729;

public class PreProc {

	/*------------------------------------------------------------------------*
	 * 2nd order high pass filter with cut off frequency at 140 Hz.           *
	 * Designed with SPPACK efi command -40 dB att, 0.25 ri.                  *
	 *                                                                        *
	 * Algorithm:                                                             *
	 *                                                                        *
	 *  y[i] = b[0]*x[i] + b[1]*x[i-1] + b[2]*x[i-2]                          *
	 *                   + a[1]*y[i-1] + a[2]*y[i-2];                         *
	 *                                                                        *
	 *     b[3] = {0.92727435E+00, -0.18544941E+01, 0.92727435E+00};          *
	 *     a[3] = {0.10000000E+01, 0.19059465E+01, -0.91140240E+00};          *
	 *-----------------------------------------------------------------------*/


	float x0, x1;         /* high-pass fir memory          */
	float y1, y2;         /* high-pass iir memory          */

	public void init_pre_process( 
	)
	{
	  x0 = x1 = (float)0.0;
	  y2 = y1 = (float)0.0;

	  return;
	}

	public void pre_process(
	   float signal[],      /* (i/o)  : signal                     */
	   int lg               /* (i)    : lenght of signal           */
	)
	{
	  int i;
	  float x2;
	  float y0;

	  for(i=0; i<lg; i++)
	  {
	    x2 = x1;
	    x1 = x0;
	    x0 = signal[i];

	    y0 = y1*TabLD8k.a140[1] + y2*TabLD8k.a140[2] + x0*TabLD8k.b140[0] + x1*TabLD8k.b140[1] + x2*TabLD8k.b140[2];

	    signal[i] = y0;
	    y2 = y1;
	    y1 = y0;
	  }

	  return;
	}


}

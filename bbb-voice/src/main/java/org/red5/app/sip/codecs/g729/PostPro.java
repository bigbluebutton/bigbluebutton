package org.red5.app.sip.codecs.g729;
//package org.mobicents.media.server.impl.dsp.audio.g729;

public class PostPro {

	/*------------------------------------------------------------------------*
	 * Function post_process()                                                 *
	 *                                                                        *
	 * Post-processing of output speech.                                      *
	 *   - 2nd order high pass filter with cut off frequency at 100 Hz.       *
	 *-----------------------------------------------------------------------*/

	/*------------------------------------------------------------------------*
	 * 2nd order high pass filter with cut off frequency at 100 Hz.           *
	 * Designed with SPPACK efi command -40 dB att, 0.25 ri.                  *
	 *                                                                        *
	 * Algorithm:                                                             *
	 *                                                                        *
	 *  y[i] = b[0]*x[i] + b[1]*x[i-1] + b[2]*x[i-2]                          *
	 *                   + a[1]*y[i-1] + a[2]*y[i-2];                         *
	 *                                                                        *
	 *     b[3] = {0.93980581E+00, -0.18795834E+01,  0.93980581E+00};         *
	 *     a[3] = {0.10000000E+01, +0.19330735E+01, -0.93589199E+00};         *
	 *-----------------------------------------------------------------------*/

	float x0, x1;         /* high-pass fir memory          */
	float y1, y2;         /* high-pass iir memory          */

	public void init_post_process( 
	)
	{
	  x0 = x1 = (float)0.0;
	  y2 = y1 = (float)0.0;
	  return;
	}

	public void post_process(
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

	    y0 = y1*TabLD8k.a100[1] + y2*TabLD8k.a100[2] + x0*TabLD8k.b100[0] + x1*TabLD8k.b100[1] + x2*TabLD8k.b100[2];

	    signal[i] = y0;
	    y2 = y1;
	    y1 = y0;
	  }

	  return;
	}


}

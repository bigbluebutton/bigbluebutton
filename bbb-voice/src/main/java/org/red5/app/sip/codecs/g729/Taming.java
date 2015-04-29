package org.red5.app.sip.codecs.g729;
//package org.mobicents.media.server.impl.dsp.audio.g729;

public class Taming {

	float exc_err[] = new float[4];

	void init_exc_err()
	{
	  int i;
	  for(i=0; i<4; i++) exc_err[i] = (float)1.;
	  return;
	}

	/**************************************************************************
	 * routine test_err - computes the accumulated potential error in the     *
	 * adaptive codebook contribution                                         *
	 **************************************************************************/
	int test_err( /* (o) flag set to 1 if taming is necessary  */
	int t0,       /* (i) integer part of pitch delay           */
	int t0_frac   /* (i) fractional part of pitch delay        */
	)
	{

	    int i, t1, zone1, zone2, flag;
	    float maxloc;

	    t1 = (t0_frac > 0) ? (t0+1) : t0;

	    i = t1 -LD8KConstants.L_SUBFR - LD8KConstants.L_INTER10;
	    if(i < 0) i = 0;
	    zone1 = (int) ( (float)i * LD8KConstants.INV_L_SUBFR);

	    i = t1 + LD8KConstants.L_INTER10 - 2;
	    zone2 = (int)( (float)i * LD8KConstants.INV_L_SUBFR);

	    maxloc = (float)-1.;
	    flag = 0 ;
	    for(i=zone2; i>=zone1; i--) {
	        if(exc_err[i] > maxloc) maxloc = exc_err[i];
	    }
	    if(maxloc > LD8KConstants.THRESH_ERR) {
	        flag = 1;
	    }
	    return(flag);
	}

	/**************************************************************************
	 *routine update_exc_err - maintains the memory used to compute the error *
	 * function due to an adaptive codebook mismatch between encoder and      *
	 * decoder                                                                *
	 **************************************************************************/

	void update_exc_err(
	 float gain_pit,      /* (i) pitch gain */
	 int t0             /* (i) integer part of pitch delay */
	)
	{
	    int i, zone1, zone2, n;
	    float worst, temp;

	    worst = (float)-1.;

	    n = t0- LD8KConstants.L_SUBFR;
	    if(n < 0) {
	        temp = (float)1. + gain_pit * exc_err[0];
	        if(temp > worst) worst = temp;
	        temp = (float)1. + gain_pit * temp;
	        if(temp > worst) worst = temp;
	    }

	    else {
	        zone1 = (int) ((float)n * LD8KConstants.INV_L_SUBFR);

	        i = t0 - 1;
	        zone2 = (int)((float)i * LD8KConstants.INV_L_SUBFR);

	        for(i = zone1; i <= zone2; i++) {
	            temp = (float)1. + gain_pit * exc_err[i];
	            if(temp > worst) worst = temp;
	        }
	    }

	    for(i=3; i>=1; i--) exc_err[i] = exc_err[i-1];
	    exc_err[0] = worst;

	    return;
	}


}

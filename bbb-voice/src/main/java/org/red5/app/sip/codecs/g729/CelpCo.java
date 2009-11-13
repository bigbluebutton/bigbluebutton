package org.red5.app.sip.codecs.g729;
//package org.mobicents.media.server.impl.dsp.audio.g729;

public class CelpCo {

	int ACELP_codebook(     /* (o)     :index of pulses positions    */
	  float x[],            /* (i)     :Target vector                */
	  float h[],            /* (i)     :Impulse response of filters  */
	  int   t0,             /* (i)     :Pitch lag                    */
	  float pitch_sharp,    /* (i)     :Last quantized pitch gain    */
	  int i_subfr,          /* (i)     :Indicator of 1st subframe,   */
	  float code[],         /* (o)     :Innovative codebook          */
	  float y[],            /* (o)     :Filtered innovative codebook */
	  IntegerPointer sign             /* (o)     :Signs of 4 pulses            */
	)
	{
	  int i, index;
	  float dn[] = new float[LD8KConstants.L_SUBFR];
	  float rr[] = new float[LD8KConstants.DIM_RR];

	    /*----------------------------------------------------------------*
	    * Include fixed-gain pitch contribution into impulse resp. h[]    *
	    * Find correlations of h[] needed for the codebook search.        *
	    *-----------------------------------------------------------------*/

	    if(t0 < LD8KConstants.L_SUBFR)
	      for (i = t0; i < LD8KConstants.L_SUBFR; i++)
	         h[i] += pitch_sharp * h[i-t0];

	    cor_h(h, rr);

	    /*----------------------------------------------------------------*
	    * Compute correlation of target vector with impulse response.     *
	    *-----------------------------------------------------------------*/

	    CorFunc.cor_h_x(h, x, dn);      /* backward filtered target vector dn */

	    /*----------------------------------------------------------------*
	    * Find innovative codebook.                                       *
	    *-----------------------------------------------------------------*/

	    index = d4i40_17(dn, rr, h, code, y, sign, i_subfr);

	    /*------------------------------------------------------*
	    * - Add the fixed-gain pitch contribution to code[].    *
	    *-------------------------------------------------------*/

	    if(t0 < LD8KConstants.L_SUBFR)
	      for (i = t0; i < LD8KConstants.L_SUBFR; i++)
	        code[i] += pitch_sharp * code[i-t0];

	    return index;
	}
	

	/*--------------------------------------------------------------------------*
	 *  Function  cor_h()                                                       *
	 *  ~~~~~~~~~~~~~~~~~                                                       *
	 * Compute  correlations of h[]  needed for the codebook search.            *
	 *--------------------------------------------------------------------------*/

	static void cor_h(
	  float []h,      /* (i) :Impulse response of filters */
	  float []rr      /* (o) :Correlations of H[]         */
	)
	{
	  int rri0i0, rri1i1, rri2i2, rri3i3, rri4i4;
	  int rri0i1, rri0i2, rri0i3, rri0i4;
	  int rri1i2, rri1i3, rri1i4;
	  int rri2i3, rri2i4;

	  int p0, p1, p2, p3, p4;

	  int ptr_hd,ptr_hf, ptr_h1, ptr_h2;
	  float cor;
	  int i, k, ldec, l_fin_sup, l_fin_inf;

	  /* Init pointers */
	  rri0i0 = 0;//rr;
	  rri1i1 = rri0i0 + LD8KConstants.NB_POS;
	  rri2i2 = rri1i1 + LD8KConstants.NB_POS;
	  rri3i3 = rri2i2 + LD8KConstants.NB_POS;
	  rri4i4 = rri3i3 + LD8KConstants.NB_POS;
	  rri0i1 = rri4i4 + LD8KConstants.NB_POS;
	  rri0i2 = rri0i1 + LD8KConstants.MSIZE;
	  rri0i3 = rri0i2 + LD8KConstants.MSIZE;
	  rri0i4 = rri0i3 + LD8KConstants.MSIZE;
	  rri1i2 = rri0i4 + LD8KConstants.MSIZE;
	  rri1i3 = rri1i2 + LD8KConstants.MSIZE;
	  rri1i4 = rri1i3 + LD8KConstants.MSIZE;
	  rri2i3 = rri1i4 + LD8KConstants.MSIZE;
	  rri2i4 = rri2i3 + LD8KConstants.MSIZE;

	 /*------------------------------------------------------------*
	  * Compute rri0i0[], rri1i1[], rri2i2[], rri3i3 and rri4i4[]  *
	  *------------------------------------------------------------*/

	  p0 = rri0i0 + LD8KConstants.NB_POS-1;   /* Init pointers to last position of rrixix[] */
	  p1 = rri1i1 + LD8KConstants.NB_POS-1;
	  p2 = rri2i2 + LD8KConstants.NB_POS-1;
	  p3 = rri3i3 + LD8KConstants.NB_POS-1;
	  p4 = rri4i4 + LD8KConstants.NB_POS-1;

	  ptr_h1 = 0;//h;
	  cor    = (float)0.0;
	  for(i=0;  i<LD8KConstants.NB_POS; i++)
	  {
	    cor += h[ptr_h1] * h[ptr_h1]; ptr_h1++;
	    rr[p4--] = cor;

	    cor += h[ptr_h1] * h[ptr_h1]; ptr_h1++;
	    rr[p3--] = cor;

	    cor += h[ptr_h1] * h[ptr_h1]; ptr_h1++;
	    rr[p2--] = cor;

	    cor += h[ptr_h1] * h[ptr_h1]; ptr_h1++;
	    rr[p1--] = cor;

	    cor += h[ptr_h1] * h[ptr_h1]; ptr_h1++;
	    rr[p0--] = cor;
	  }

	 /*-----------------------------------------------------------------*
	  * Compute elements of: rri2i3[], rri1i2[], rri0i1[] and rri0i4[]  *
	  *-----------------------------------------------------------------*/

	  l_fin_sup = LD8KConstants.MSIZE-1;
	  l_fin_inf = l_fin_sup-1;
	  ldec = LD8KConstants.NB_POS+1;

	  ptr_hd = 0;//h;
	  ptr_hf = ptr_hd + 1;

	  for(k=0; k<LD8KConstants.NB_POS; k++) {

	          p3 = rri2i3 + l_fin_sup;
	          p2 = rri1i2 + l_fin_sup;
	          p1 = rri0i1 + l_fin_sup;
	          p0 = rri0i4 + l_fin_inf;
	          cor = (float)0.0;
	          ptr_h1 = ptr_hd;
	          ptr_h2 =  ptr_hf;

	          for(i=k+1; i<LD8KConstants.NB_POS; i++ ) {

	                  cor += h[ptr_h1] * h[ptr_h2]; ptr_h1++; ptr_h2++;
	                  cor += h[ptr_h1] * h[ptr_h2]; ptr_h1++; ptr_h2++;
	                  rr[p3] = cor;

	                  cor += h[ptr_h1] * h[ptr_h2]; ptr_h1++; ptr_h2++;
	                  rr[p2] = cor;

	                  cor += h[ptr_h1] * h[ptr_h2]; ptr_h1++; ptr_h2++;
	                  rr[p1] = cor;

	                  cor += h[ptr_h1] * h[ptr_h2]; ptr_h1++; ptr_h2++;
	                  rr[p0] = cor;

	                  p3 -= ldec;
	                  p2 -= ldec;
	                  p1 -= ldec;
	                  p0 -= ldec;
	          }
	          cor += h[ptr_h1] * h[ptr_h2]; ptr_h1++; ptr_h2++;
	          cor += h[ptr_h1] * h[ptr_h2]; ptr_h1++; ptr_h2++;
	          rr[p3] = cor;

	          cor += h[ptr_h1] *h[ptr_h2]; ptr_h1++; ptr_h2++;
	          rr[p2] = cor;

	          cor += h[ptr_h1] * h[ptr_h2]; ptr_h1++; ptr_h2++;
	          rr[p1] = cor;

	          l_fin_sup -= LD8KConstants.NB_POS;
	          l_fin_inf--;
	          ptr_hf += LD8KConstants.STEP;
	  }

	 /*---------------------------------------------------------------------*
	  * Compute elements of: rri2i4[], rri1i3[], rri0i2[], rri1i4[], rri0i3 *
	  *---------------------------------------------------------------------*/

	  ptr_hd = 0;//h;
	  ptr_hf = ptr_hd + 2;
	  l_fin_sup = LD8KConstants.MSIZE-1;
	  l_fin_inf = l_fin_sup-1;
	  for(k=0; k<LD8KConstants.NB_POS; k++) {

	          p4 = rri2i4 + l_fin_sup;
	          p3 = rri1i3 + l_fin_sup;
	          p2 = rri0i2 + l_fin_sup;
	          p1 = rri1i4 + l_fin_inf;
	          p0 = rri0i3 + l_fin_inf;

	          cor = (float)0.0;
	          ptr_h1 = ptr_hd;
	          ptr_h2 =  ptr_hf;
	          for(i=k+1; i<LD8KConstants.NB_POS; i++ ) {

	                  cor += h[ptr_h1] * h[ptr_h2]; ptr_h1++; ptr_h2++;
	                  rr[p4] = cor;

	                  cor += h[ptr_h1] * h[ptr_h2]; ptr_h1++; ptr_h2++;
	                  rr[p3] = cor;

	                  cor += h[ptr_h1] * h[ptr_h2]; ptr_h1++; ptr_h2++;
	                  rr[p2] = cor;

	                  cor += h[ptr_h1] * h[ptr_h2]; ptr_h1++; ptr_h2++;
	                  rr[p1] = cor;

	                  cor += h[ptr_h1] * h[ptr_h2]; ptr_h1++; ptr_h2++;
	                  rr[p0] = cor;

	                  p4 -= ldec;
	                  p3 -= ldec;
	                  p2 -= ldec;
	                  p1 -= ldec;
	                  p0 -= ldec;
	          }
	          cor += h[ptr_h1] * h[ptr_h2]; ptr_h1++; ptr_h2++;
	          rr[p4] = cor;

	          cor += h[ptr_h1] * h[ptr_h2]; ptr_h1++; ptr_h2++;
	          rr[p3] = cor;

	          cor += h[ptr_h1] * h[ptr_h2]; ptr_h1++; ptr_h2++;
	          rr[p2] = cor;

	          l_fin_sup -= LD8KConstants.NB_POS;
	          l_fin_inf--;
	          ptr_hf += LD8KConstants.STEP;
	  }

	 /*----------------------------------------------------------------------*
	  * Compute elements of: rri1i4[], rri0i3[], rri2i4[], rri1i3[], rri0i2  *
	  *----------------------------------------------------------------------*/

	  ptr_hd = 0;//h;
	  ptr_hf = ptr_hd + 3;
	  l_fin_sup = LD8KConstants.MSIZE-1;
	  l_fin_inf = l_fin_sup-1;
	  for(k=0; k<LD8KConstants.NB_POS; k++) {

	          p4 = rri1i4 + l_fin_sup;
	          p3 = rri0i3 + l_fin_sup;
	          p2 = rri2i4 + l_fin_inf;
	          p1 = rri1i3 + l_fin_inf;
	          p0 = rri0i2 + l_fin_inf;

	          ptr_h1 = ptr_hd;
	          ptr_h2 =  ptr_hf;
	          cor = (float)0.0;
	          for(i=k+1; i<LD8KConstants.NB_POS; i++ ) {

	                  cor += h[ptr_h1] * h[ptr_h2]; ptr_h1++; ptr_h2++;
	                  rr[p4] = cor;

	                  cor += h[ptr_h1] * h[ptr_h2]; ptr_h1++; ptr_h2++;
	                  rr[p3] = cor;

	                  cor += h[ptr_h1] * h[ptr_h2]; ptr_h1++; ptr_h2++;
	                  rr[p2] = cor;

	                  cor += h[ptr_h1] * h[ptr_h2]; ptr_h1++; ptr_h2++;
	                  rr[p1] = cor;

	                  cor += h[ptr_h1] * h[ptr_h2]; ptr_h1++; ptr_h2++;
	                  rr[p0] = cor;

	                  p4 -= ldec;
	                  p3 -= ldec;
	                  p2 -= ldec;
	                  p1 -= ldec;
	                  p0 -= ldec;
	          }
	          cor += h[ptr_h1] * h[ptr_h2]; ptr_h1++; ptr_h2++;
	          rr[p4] = cor;

	          cor += h[ptr_h1] * h[ptr_h2]; ptr_h1++; ptr_h2++;
	          rr[p3] = cor;

	          l_fin_sup -= LD8KConstants.NB_POS;
	          l_fin_inf--;
	          ptr_hf += LD8KConstants.STEP;
	  }

	 /*----------------------------------------------------------------------*
	  * Compute elements of: rri0i4[], rri2i3[], rri1i2[], rri0i1[]          *
	  *----------------------------------------------------------------------*/

	  ptr_hd = 0;//h;
	  ptr_hf = ptr_hd + 4;
	  l_fin_sup = LD8KConstants.MSIZE-1;
	  l_fin_inf = l_fin_sup-1;
	  for(k=0; k<LD8KConstants.NB_POS; k++) {

	          p3 = rri0i4 + l_fin_sup;
	          p2 = rri2i3 + l_fin_inf;
	          p1 = rri1i2 + l_fin_inf;
	          p0 = rri0i1 + l_fin_inf;

	          ptr_h1 = ptr_hd;
	          ptr_h2 =  ptr_hf;
	          cor = (float)0.;
	          for(i=k+1; i<LD8KConstants.NB_POS; i++ ) {

	                  cor += h[ptr_h1] * h[ptr_h2]; ptr_h1++; ptr_h2++;
	                  rr[p3] = cor;

	                  cor += h[ptr_h1] * h[ptr_h2]; ptr_h1++; ptr_h2++;
	                  cor += h[ptr_h1] * h[ptr_h2]; ptr_h1++; ptr_h2++;
	                  rr[p2] = cor;

	                  cor += h[ptr_h1] * h[ptr_h2]; ptr_h1++; ptr_h2++;
	                  rr[p1] = cor;

	                  cor += h[ptr_h1] * h[ptr_h2]; ptr_h1++; ptr_h2++;
	                  rr[p0] = cor;

	                  p3 -= ldec;
	                  p2 -= ldec;
	                  p1 -= ldec;
	                  p0 -= ldec;
	          }
	          cor += h[ptr_h1] * h[ptr_h2]; ptr_h1++; ptr_h2++;
	          rr[p3] = cor;

	          l_fin_sup -= LD8KConstants.NB_POS;
	          l_fin_inf--;
	          ptr_hf += LD8KConstants.STEP;
	  }
	  return;
	}

	int extra;

	/*----------------------------------------------------------------------------
	 * d4i40_17 - algebraic codebook search 17 bits; 4 pulses 40 sampleframe
	 *----------------------------------------------------------------------------
	 */
	int d4i40_17(    /* output: pulse positions                          */
	  float dn[],           /* input : backward filtered target vector          */
	  float rr[],           /* input : autocorrelations of impulse response h[] */
	  float h[],            /* input : impulse response of filters              */
	  float cod[],          /* output: selected algebraic codeword              */
	  float y[],            /* output: filtered algebraic codeword              */
	  IntegerPointer   signs,         /* output: signs of 4 pulses                        */
	  int   i_subfr         /* input : subframe flag                            */
	)
	{
	 /*
	  * The code length is 40, containing 4 nonzero pulses i0, i1, i2, i3.
	  * with pulse spacings of step = 5
	  * Each pulses can have 8 possible positions (positive or negative):
	  *
	  * i0 (+-1) : 0, 5, 10, 15, 20, 25, 30, 35
	  * i1 (+-1) : 1, 6, 11, 16, 21, 26, 31, 36
	  * i2 (+-1) : 2, 7, 12, 17, 22, 27, 32, 37
	  * i3 (+-1) : 3, 8, 13, 18, 23, 28, 33, 38
	  *            4, 9, 14, 19, 24, 29, 34, 39
	  *---------------------------------------------------------------------------
	 */
	    int   i0, i1, i2, i3, ip0, ip1, ip2, ip3;
	    int   i, j, time;
	    float ps0, ps1, ps2, ps3, alp0, alp1, alp2, alp3;
	    float ps3c, psc, alpha;
	    float average, max0, max1, max2, thres;
	    float p_sign[] = new float[LD8KConstants.L_SUBFR];

	    int rri0i0, rri1i1, rri2i2, rri3i3, rri4i4;
	    int rri0i1, rri0i2, rri0i3, rri0i4;
	    int rri1i2, rri1i3, rri1i4;
	    int rri2i3, rri2i4;

	    int ptr_ri0i0, ptr_ri1i1, ptr_ri2i2, ptr_ri3i3, ptr_ri4i4;
	    int ptr_ri0i1, ptr_ri0i2, ptr_ri0i3, ptr_ri0i4;
	    int ptr_ri1i2, ptr_ri1i3, ptr_ri1i4;
	    int ptr_ri2i3, ptr_ri2i4;

	    /* Init pointers */

	    rri0i0 = 0;//rr;
	    rri1i1 = rri0i0 + LD8KConstants.NB_POS;
	    rri2i2 = rri1i1 + LD8KConstants.NB_POS;
	    rri3i3 = rri2i2 + LD8KConstants.NB_POS;
	    rri4i4 = rri3i3 + LD8KConstants.NB_POS;

	    rri0i1 = rri4i4 + LD8KConstants.NB_POS;
	    rri0i2 = rri0i1 + LD8KConstants.MSIZE;
	    rri0i3 = rri0i2 + LD8KConstants.MSIZE;
	    rri0i4 = rri0i3 + LD8KConstants.MSIZE;
	    rri1i2 = rri0i4 + LD8KConstants.MSIZE;
	    rri1i3 = rri1i2 + LD8KConstants.MSIZE;
	    rri1i4 = rri1i3 + LD8KConstants.MSIZE;
	    rri2i3 = rri1i4 + LD8KConstants.MSIZE;
	    rri2i4 = rri2i3 + LD8KConstants.MSIZE;

	   /*-----------------------------------------------------------------------*
	    * Reset max_time for 1st subframe.                                      *
	    *-----------------------------------------------------------------------*
	    */
	    if (i_subfr == 0) extra = 30;

	    /*----------------------------------------------------------------------*
	    * Chose the signs of the impulses.                                      *
	    *-----------------------------------------------------------------------*/

	    for (i=0; i<LD8KConstants.L_SUBFR; i++)
	    {
	        if( dn[i] >= (float)0.0)
	        {
	            p_sign[i] = (float)1.0;
	        }
	        else {
	            p_sign[i] = (float)-1.0;
	            dn[i] = -dn[i];
	        }
	    }

	    /*-------------------------------------------------------------------*
	     * - Compute the search threshold after three pulses                 *
	     *-------------------------------------------------------------------*/


	    average  = dn[0] + dn[1] + dn[2];
	    max0 = dn[0];
	    max1 = dn[1];
	    max2 = dn[2];
	    for (i = 5; i < LD8KConstants.L_SUBFR; i+=LD8KConstants.STEP)
	    {
	        average += dn[i] + dn[i+1]+ dn[i+2];
	        if (dn[i]   > max0) max0 = dn[i];
	        if (dn[i+1] > max1) max1 = dn[i+1];
	        if (dn[i+2] > max2) max2 = dn[i+2];
	    }
	    max0 += max1+max2;
	    average  *= (float)0.125;         /* 1/8 */
	    thres = average + (max0-average)*LD8KConstants.THRESHFCB;

	    /*-------------------------------------------------------------------*
	    * Modification of rrixiy to take into account signs.                *
	    *-------------------------------------------------------------------*/
	    ptr_ri0i1 = rri0i1;
	    ptr_ri0i2 = rri0i2;
	    ptr_ri0i3 = rri0i3;
	    ptr_ri0i4 = rri0i4;

	    for(i0=0; i0<LD8KConstants.L_SUBFR; i0+=LD8KConstants.STEP)
	    {
	        for(i1=1; i1<LD8KConstants.L_SUBFR; i1+=LD8KConstants.STEP) {
	            rr[ptr_ri0i1] *= (p_sign[i0] * p_sign[i1]);
	            ptr_ri0i1++;
	            rr[ptr_ri0i2] *= (p_sign[i0] * p_sign[i1+1]);
	            ptr_ri0i2++;
	            rr[ptr_ri0i3] *= (p_sign[i0] * p_sign[i1+2]);
	            ptr_ri0i3++;
	            rr[ptr_ri0i4] *= (p_sign[i0] * p_sign[i1+3]);
	            ptr_ri0i4++;
	        }
	    }

	    ptr_ri1i2 = rri1i2;
	    ptr_ri1i3 = rri1i3;
	    ptr_ri1i4 = rri1i4;

	    for(i1=1; i1<LD8KConstants.L_SUBFR; i1+=LD8KConstants.STEP)
	    {
	        for(i2=2; i2<LD8KConstants.L_SUBFR; i2+=LD8KConstants.STEP)
	        {
	            rr[ptr_ri1i2] *= (p_sign[i1] * p_sign[i2]);
	            ptr_ri1i2++;
	            rr[ptr_ri1i3] *= (p_sign[i1] * p_sign[i2+1]);
	            ptr_ri1i3++;
	            rr[ptr_ri1i4] *= (p_sign[i1] * p_sign[i2+2]);
	            ptr_ri1i4++;
	        }
	    }

	    ptr_ri2i3 = rri2i3;
	    ptr_ri2i4 = rri2i4;

	    for(i2=2; i2<LD8KConstants.L_SUBFR; i2+=LD8KConstants.STEP)
	    {
	        for(i3=3; i3<LD8KConstants.L_SUBFR; i3+=LD8KConstants.STEP)
	        {
	            rr[ptr_ri2i3] *= (p_sign[i2] * p_sign[i3]);
	            ptr_ri2i3++;
	            rr[ptr_ri2i4] *= (p_sign[i2] * p_sign[i3+1]);
	            ptr_ri2i4++;
	        }
	    }

	 /*-------------------------------------------------------------------*
	  * Search the optimum positions of the four  pulses which maximize   *
	  *     square(correlation) / energy                                  *
	  * The search is performed in four  nested loops. At each loop, one  *
	  * pulse contribution is added to the correlation and energy.        *
	  *                                                                   *
	  * The fourth loop is entered only if the correlation due to the     *
	  *  contribution of the first three pulses exceeds the preset        *
	  *  threshold.                                                       *
	  *-------------------------------------------------------------------*/

	 /* Default values */

	    ip0    = 0;
	    ip1    = 1;
	    ip2    = 2;
	    ip3    = 3;
	    psc    = (float)0.0;
	    alpha  = (float)1000000.0;
	    time   = LD8KConstants.MAX_TIME + extra;

	    /* Four loops to search innovation code. */
	    ptr_ri0i0 = rri0i0;    /* Init. pointers that depend on first loop */
	    ptr_ri0i1 = rri0i1;
	    ptr_ri0i2 = rri0i2;
	    ptr_ri0i3 = rri0i3;
	    ptr_ri0i4 = rri0i4;
	    
	    end_search:
	    for (i0 = 0; i0 < LD8KConstants.L_SUBFR; i0 += LD8KConstants.STEP)        /* first pulse loop  */
	    {
	        ps0  = dn[i0];
	        alp0 = rr[ptr_ri0i0++];

	        ptr_ri1i1 = rri1i1;    /* Init. pointers that depend on second loop */
	        ptr_ri1i2 = rri1i2;
	        ptr_ri1i3 = rri1i3;
	        ptr_ri1i4 = rri1i4;

	        for (i1 = 1; i1 < LD8KConstants.L_SUBFR; i1 += LD8KConstants.STEP)      /* second pulse loop */
	        {
	            ps1  = ps0  + dn[i1];
	            alp1 = alp0 + rr[ptr_ri1i1++] + (float)2.0 *rr[ptr_ri0i1++];

	            ptr_ri2i2 = rri2i2;     /* Init. pointers that depend on third loop */
	            ptr_ri2i3 = rri2i3;
	            ptr_ri2i4 = rri2i4;

	            for (i2 = 2; i2 < LD8KConstants.L_SUBFR; i2 += LD8KConstants.STEP)
	            {
	                ps2  = ps1  + dn[i2];
	                alp2 = alp1 + rr[ptr_ri2i2++] + (float)2.0*(rr[ptr_ri0i2++] + rr[ptr_ri1i2++]);

	                if ( ps2 > thres)
	                {
	                     ptr_ri3i3 = rri3i3;    /* Init. pointers that depend on 4th loop */

	                     for (i3 = 3; i3 < LD8KConstants.L_SUBFR; i3 += LD8KConstants.STEP)
	                     {
	                         ps3 = ps2 + dn[i3];
	                         alp3 = alp2 + rr[ptr_ri3i3++] + (float)2.0*(rr[ptr_ri1i3++] + rr[ptr_ri0i3++] + rr[ptr_ri2i3++]);

	                         ps3c = ps3*ps3;
	                         if( (ps3c*alpha) > (psc * alp3) )
	                         {
	                             psc = ps3c;
	                             alpha = alp3;
	                             ip0 = i0;
	                             ip1 = i1;
	                             ip2 = i2;
	                             ip3 = i3;
	                         }
	                     }  /*  end of for i3 = */

	                    ptr_ri0i3 -= LD8KConstants.NB_POS;
	                    ptr_ri1i3 -= LD8KConstants.NB_POS;

	                    ptr_ri4i4 = rri4i4;    /* Init. pointers that depend on 4th loop */

	                    for (i3 = 4; i3 < LD8KConstants.L_SUBFR; i3 += LD8KConstants.STEP)
	                    {
	                        ps3 = ps2 + dn[i3];
	                        alp3 = alp2 + rr[ptr_ri4i4++] + (float)2.0*(rr[ptr_ri1i4++] + rr[ptr_ri0i4++] + rr[ptr_ri2i4++]);

	                        ps3c = ps3*ps3;
	                        if( (ps3c*alpha) > (psc * alp3) )
	                        {
	                            psc = ps3c;
	                            alpha = alp3;
	                            ip0 = i0;
	                            ip1 = i1;
	                            ip2 = i2;
	                            ip3 = i3;
	                        }
	                    }       /*  end of for i3 = */
	                    ptr_ri0i4 -= LD8KConstants.NB_POS;
	                    ptr_ri1i4 -= LD8KConstants.NB_POS;

	                    time --;
	                    if(time <= 0 ) break end_search;     /* Maximum time finish */

	                }  /* end of if >thres */
	                else {
	                    ptr_ri2i3 += LD8KConstants.NB_POS;
	                    ptr_ri2i4 += LD8KConstants.NB_POS;
	                }

	            } /* end of for i2 = */

	            ptr_ri0i2 -= LD8KConstants.NB_POS;
	            ptr_ri1i3 += LD8KConstants.NB_POS;
	            ptr_ri1i4 += LD8KConstants.NB_POS;

	        } /* end of for i1 = */

	        ptr_ri0i2 += LD8KConstants.NB_POS;
	        ptr_ri0i3 += LD8KConstants.NB_POS;
	        ptr_ri0i4 += LD8KConstants.NB_POS;

	    } /* end of for i0 = */

	

	    extra = time;

	    /* Find the codeword corresponding to the selected positions */

	    for(i=0; i<LD8KConstants.L_SUBFR; i++) cod[i] = (float)0.0;
	    cod[ip0] = p_sign[ip0];
	    cod[ip1] = p_sign[ip1];
	    cod[ip2] = p_sign[ip2];
	    cod[ip3] = p_sign[ip3];

	    /* find the filtered codeword */

	    for (i = 0; i < LD8KConstants.L_SUBFR; i++) y[i] = (float)0.0;

	    if(p_sign[ip0] > (float)0.0)
	        for(i=ip0, j=0; i<LD8KConstants.L_SUBFR; i++, j++) y[i] = h[j];
	    else
	        for(i=ip0, j=0; i<LD8KConstants.L_SUBFR; i++, j++) y[i] = -h[j];

	    if(p_sign[ip1] > (float)0.0)
	        for(i=ip1, j=0; i<LD8KConstants.L_SUBFR; i++, j++) y[i] = y[i] + h[j];
	    else
	        for(i=ip1, j=0; i<LD8KConstants.L_SUBFR; i++, j++) y[i] = y[i] - h[j];

	    if(p_sign[ip2] > (float)0.0)
	        for(i=ip2, j=0; i<LD8KConstants.L_SUBFR; i++, j++) y[i] = y[i] + h[j];
	    else
	        for(i=ip2, j=0; i<LD8KConstants.L_SUBFR; i++, j++) y[i] = y[i] - h[j];

	    if(p_sign[ip3] > (float)0.0)
	        for(i=ip3, j=0; i<LD8KConstants.L_SUBFR; i++, j++) y[i] = y[i] + h[j];
	    else
	        for(i=ip3, j=0; i<LD8KConstants.L_SUBFR; i++, j++) y[i] = y[i] - h[j];

	 /* find codebook index;  4 bit signs + 13 bit positions */

	    i = 0;
	    if(p_sign[ip0] > (float)0.0) i+=1;
	    if(p_sign[ip1] > (float)0.0) i+=2;
	    if(p_sign[ip2] > (float)0.0) i+=4;
	    if(p_sign[ip3] > (float)0.0) i+=8;
	    signs.value = i;

	    ip0 = ip0 / 5;
	    ip1 = ip1 / 5;
	    ip2 = ip2 / 5;
	    j   = (ip3 % 5) - 3;
	    ip3 = ( (ip3 / 5) << 1 ) + j;

	    i = (ip0) + (ip1<<3) + (ip2<<6) + (ip3<<9);

	    return i;
	}

}

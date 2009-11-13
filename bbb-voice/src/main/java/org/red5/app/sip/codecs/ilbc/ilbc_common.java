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
class ilbc_common {

   /*----------------------------------------------------------------*
    *  check for stability of lsf coefficients
    *---------------------------------------------------------------*/

    public static int LSF_check(    /* (o) 1 for stable lsf vectors and 0 for
                              nonstable ones */
			 float lsf[],     /* (i) a table of lsf vectors */
			 int dim,    /* (i) the dimension of each lsf vector */
			 int NoAn)    /* (i) the number of lsf vectors in the
                              table */
    {
       int k,n,m, Nit=2, change=0,pos;
       float tmp;
       float eps=(float)0.039; /* 50 Hz */
       float eps2=(float)0.0195;
       float maxlsf=(float)3.14; /* 4000 Hz */
       float minlsf=(float)0.01; /* 0 Hz */

       /* LSF separation check*/

       for (n=0; n<Nit; n++) { /* Run through a couple of times */
           for (m=0; m<NoAn; m++) { /* Number of analyses per frame */
               for (k=0; k<(dim-1); k++) {
                   pos=m*dim+k;

                   if ((lsf[pos+1]-lsf[pos])<eps) {

                       if (lsf[pos+1]<lsf[pos]) {
                           tmp=lsf[pos+1];
                           lsf[pos+1]= lsf[pos]+eps2;
                           lsf[pos]= lsf[pos+1]-eps2;
                       } else {
                           lsf[pos]-=eps2;
                           lsf[pos+1]+=eps2;
                       }
                       change=1;
                   }

                   if (lsf[pos]<minlsf) {
                       lsf[pos]=minlsf;
                       change=1;
                   }

                   if (lsf[pos]>maxlsf) {
                       lsf[pos]=maxlsf;
                       change=1;
                   }
               }
           }
       }

       return change;
   }

   /*----------------------------------------------------------------*
    *  decoding of the start state
    *---------------------------------------------------------------*/

    public static void StateConstructW(
       int idxForMax,      /* (i) 6-bit index for the quantization of
                                  max amplitude */
       int idxVec[],    /* (i) vector of quantization indexes */
       float syntDenum[],   /* (i) synthesis filter denumerator */
       int syntDenum_idx,
       float out[],         /* (o) the decoded state vector */
       int out_idx,
       int len             /* (i) length of a state vector */
   ){
       float maxVal;
       float [] tmpbuf = new float[ilbc_constants.LPC_FILTERORDER+2*ilbc_constants.STATE_LEN];
       //, *tmp,
       int tmp;
       float [] numerator = new float[ilbc_constants.LPC_FILTERORDER+1];
       float [] foutbuf = new float[ilbc_constants.LPC_FILTERORDER+2*ilbc_constants.STATE_LEN];
       //, *fout;
       int fout;
       int k,tmpi;

       /* decoding of the maximum value */

       maxVal = ilbc_constants.state_frgqTbl[idxForMax];
       //System.out.println("idxForMax : " + idxForMax + "maxVal : " + maxVal);
       maxVal = (float)Math.pow(10,maxVal) / 4.5f;
       //System.out.println("maxVal : " + maxVal);

       /* initialization of buffers and coefficients */

       for (int li = 0; li < ilbc_constants.LPC_FILTERORDER; li++) {
	   tmpbuf[li] = 0.0f;
	   foutbuf[li] = 0.0f;
       }
       //       memset(tmpbuf, 0, LPC_FILTERORDER*sizeof(float));
       //       memset(foutbuf, 0, LPC_FILTERORDER*sizeof(float));

       for (k=0; k < ilbc_constants.LPC_FILTERORDER; k++) {
           numerator[k]=syntDenum[syntDenum_idx + ilbc_constants.LPC_FILTERORDER - k];
	   //System.out.println("numerator-" + k + " = " + numerator[k] + " (( " + syntDenum[syntDenum_idx + ilbc_constants.LPC_FILTERORDER - k]);
       }

       numerator[ilbc_constants.LPC_FILTERORDER]=syntDenum[syntDenum_idx];
       //       tmp = &tmpbuf[LPC_FILTERORDER];
       tmp = ilbc_constants.LPC_FILTERORDER;
       //       fout = &foutbuf[LPC_FILTERORDER];
       fout = ilbc_constants.LPC_FILTERORDER;

       /* decoding of the sample values */

       //       for (int li = 0; li < idxVec.length; li++)
	 //System.out.println("idxVec["+li+"] = " + idxVec[li]);

       for (k=0; k<len; k++) {
           tmpi = len-1-k;
           /* maxVal = 1/scal */
           tmpbuf[tmp+k] = maxVal*ilbc_constants.state_sq3Tbl[idxVec[tmpi]];
	   //System.out.println("index " + k + ", valeur " + tmpbuf[tmp+k]);
       }

       /* circular convolution with all-pass filter */

       for (int li = 0; li < len; li++)
	   tmpbuf[tmp+len+li] = 0.0f;
       //       memset(tmp+len, 0, len*sizeof(float));
       ilbc_common.ZeroPoleFilter(tmpbuf, tmp, numerator, syntDenum, syntDenum_idx,
				  2*len, ilbc_constants.LPC_FILTERORDER,
				  foutbuf, fout);
       for (k=0;k<len;k++) {
           out[out_idx+k] = foutbuf[fout+len-1-k]+foutbuf[fout+2*len-1-k];
	   //System.out.println("MEM -- index " + out_idx + " + " + k + " initialise a " + out[out_idx+k]);
	   //System.out.println("       calcul : " + foutbuf[fout+len-1-k] + " + " + foutbuf[fout+2*len-1-k]);
       }
   }


    /*----------------------------------------------------------------*
    *  all-pole filter
    *---------------------------------------------------------------*/

    public static void AllPoleFilter(
       float InOut[],   /* (i/o) on entrance InOut[-orderCoef] to
                              InOut[-1] contain the state of the
                              filter (delayed samples). InOut[0] to
                              InOut[lengthInOut-1] contain the filter
                              input, on en exit InOut[-orderCoef] to
                              InOut[-1] is unchanged and InOut[0] to
                              InOut[lengthInOut-1] contain filtered
                              samples */
       int InOut_idx,
       float Coef[],/* (i) filter coefficients, Coef[0] is assumed
                              to be 1.0f */
       int Coef_idx,
       int lengthInOut,/* (i) number of input/output samples */
       int orderCoef)   /* (i) number of filter coefficients */
    {
	int n, k;

	for(n = 0; n < lengthInOut; n++) {
	    for(k = 1; k <= orderCoef; k++) {
		InOut[n+InOut_idx] -= Coef[Coef_idx + k] * InOut[n-k+InOut_idx];
	    }
	}
    }

   /*----------------------------------------------------------------*
    *  all-zero filter
    *---------------------------------------------------------------*/

    public static void AllZeroFilter(
       float In[],      /* (i) In[0] to In[lengthInOut-1] contain
                              filter input samples */
       int In_idx,
       float Coef[],/* (i) filter coefficients (Coef[0] is assumed
                              to be 1.0f) */
       int lengthInOut,/* (i) number of input/output samples */
       int orderCoef,  /* (i) number of filter coefficients */
       float Out[],      /* (i/o) on entrance Out[-orderCoef] to Out[-1]
                              contain the filter state, on exit Out[0]
                              to Out[lengthInOut-1] contain filtered
                              samples */
       int Out_idx)
    {
       int n, k;

       for(n = 0; n < lengthInOut; n++) {
           Out[Out_idx] = Coef[0]*In[In_idx];
           for(k=1;k<=orderCoef;k++){
               Out[Out_idx] += Coef[k]*In[In_idx-k];
           }
            Out_idx++;
            In_idx++;
       }
   }

   /*----------------------------------------------------------------*
    *  pole-zero filter
    *---------------------------------------------------------------*/

    public static void ZeroPoleFilter(
       float In[],      /* (i) In[0] to In[lengthInOut-1] contain
                              filter input samples In[-orderCoef] to
                              In[-1] contain state of all-zero
                              section */
       int In_idx,
       float ZeroCoef[],/* (i) filter coefficients for all-zero
                              section (ZeroCoef[0] is assumed to
                              be 1.0f) */
       float PoleCoef[],/* (i) filter coefficients for all-pole section
                              (ZeroCoef[0] is assumed to be 1.0f) */
       int PoleCoef_idx,
       int lengthInOut,/* (i) number of input/output samples */
       int orderCoef,  /* (i) number of filter coefficients */
       float Out[],      /* (i/o) on entrance Out[-orderCoef] to Out[-1]
                              contain state of all-pole section. On
                              exit Out[0] to Out[lengthInOut-1]
                              contain filtered samples */
       int Out_idx)
    {
	AllZeroFilter(In, In_idx, ZeroCoef, lengthInOut, orderCoef, Out, Out_idx);
	AllPoleFilter(Out, Out_idx, PoleCoef, PoleCoef_idx, lengthInOut, orderCoef);
    }

   /*----------------------------------------------------------------*
    *  conversion from lsf coefficients to lpc coefficients
    *---------------------------------------------------------------*/

    public static void lsf2a(float a_coef[], float freq[])
    {
	int i, j;
	float hlp;
	float [] p = new float[ilbc_constants.LPC_HALFORDER];
	float [] q = new float[ilbc_constants.LPC_HALFORDER];
	float [] a = new float[ilbc_constants.LPC_HALFORDER + 1];
	float [] a1 = new float[ilbc_constants.LPC_HALFORDER];
	float [] a2 = new float[ilbc_constants.LPC_HALFORDER];
	float [] b = new float[ilbc_constants.LPC_HALFORDER + 1];
	float [] b1 = new float[ilbc_constants.LPC_HALFORDER];
	float [] b2 = new float[ilbc_constants.LPC_HALFORDER];

	//System.out.println("debut de lsf2a");

	for (i=0; i < ilbc_constants.LPC_FILTERORDER; i++) {
	    freq[i] = freq[i] * ilbc_constants.PI2;
	}

       /* Check input for ill-conditioned cases.  This part is not
       found in the TIA standard.  It involves the following 2 IF
       blocks.  If "freq" is judged ill-conditioned, then we first
       modify freq[0] and freq[LPC_HALFORDER-1] (normally
       LPC_HALFORDER = 10 for LPC applications), then we adjust
       the other "freq" values slightly */

       if ((freq[0] <= 0.0f) || (freq[ilbc_constants.LPC_FILTERORDER - 1] >= 0.5)){


           if (freq[0] <= 0.0f) {
               freq[0] = (float)0.022;
           }


           if (freq[ilbc_constants.LPC_FILTERORDER - 1] >= 0.5) {
               freq[ilbc_constants.LPC_FILTERORDER - 1] = (float)0.499;
           }

           hlp = (freq[ilbc_constants.LPC_FILTERORDER - 1] - freq[0]) /
               (float) (ilbc_constants.LPC_FILTERORDER - 1);

           for (i=1; i < ilbc_constants.LPC_FILTERORDER; i++) {
               freq[i] = freq[i - 1] + hlp;
           }
       }

       for (int li = 0; li < ilbc_constants.LPC_HALFORDER; li++) {
	   a1[li] = 0.0f;
	   a2[li] = 0.0f;
	   b1[li] = 0.0f;
	   b2[li] = 0.0f;
       }
//        memset(a1, 0, LPC_HALFORDER*sizeof(float));
//        memset(a2, 0, LPC_HALFORDER*sizeof(float));
//        memset(b1, 0, LPC_HALFORDER*sizeof(float));
//        memset(b2, 0, LPC_HALFORDER*sizeof(float));
       for (int li = 0; li < ilbc_constants.LPC_HALFORDER + 1; li++) {
	   a[li] = 0.0f;
	   b[li] = 0.0f;
       }
//        memset(a, 0, (LPC_HALFORDER+1)*sizeof(float));
//        memset(b, 0, (LPC_HALFORDER+1)*sizeof(float));

       /* p[i] and q[i] compute cos(2*pi*omega_{2j}) and
       cos(2*pi*omega_{2j-1} in eqs. 4.2.2.2-1 and 4.2.2.2-2.
       Note that for this code p[i] specifies the coefficients
       used in .Q_A(z) while q[i] specifies the coefficients used
       in .P_A(z) */

       for (i = 0; i < ilbc_constants.LPC_HALFORDER; i++) {
           p[i] = (float)Math.cos(ilbc_constants.TWO_PI * freq[2 * i]);
           q[i] = (float)Math.cos(ilbc_constants.TWO_PI * freq[2 * i + 1]);
       }

       a[0] = 0.25f;
       b[0] = 0.25f;

       for (i= 0; i < ilbc_constants.LPC_HALFORDER; i++) {
           a[i + 1] = a[i] - 2 * p[i] * a1[i] + a2[i];
           b[i + 1] = b[i] - 2 * q[i] * b1[i] + b2[i];
           a2[i] = a1[i];
           a1[i] = a[i];
           b2[i] = b1[i];
           b1[i] = b[i];
       }

       for (j=0; j < ilbc_constants.LPC_FILTERORDER; j++) {

           if (j == 0) {
               a[0] = 0.25f;
               b[0] = -0.25f;
           } else {
               a[0] = b[0] = 0.0f;
           }

           for (i=0; i < ilbc_constants.LPC_HALFORDER; i++) {
               a[i + 1] = a[i] - 2 * p[i] * a1[i] + a2[i];
               b[i + 1] = b[i] - 2 * q[i] * b1[i] + b2[i];
               a2[i] = a1[i];
               a1[i] = a[i];
               b2[i] = b1[i];
               b1[i] = b[i];
           }

           a_coef[j + 1] = 2 * (a[ilbc_constants.LPC_HALFORDER] +
				b[ilbc_constants.LPC_HALFORDER]);
       }

       a_coef[0] = 1.0f;
   }

   /*----------------------------------------------------------------*
    *  Construct decoded vector from codebook and gains.
    *---------------------------------------------------------------*/

   /*----------------------------------------------------------------*
    *  interpolation between vectors
    *---------------------------------------------------------------*/

    public static void interpolate(
       float out[],      /* (o) the interpolated vector */
       float in1[],     /* (i) the first vector for the
                              interpolation */
       float in2[],     /* (i) the second vector for the
                              interpolation */
       int in2_idx,
       float coef,      /* (i) interpolation weights */
       int length)      /* (i) length of all vectors */
   {
       int i;
       float invcoef;

       invcoef = (float)1.0f - coef;
       for (i = 0; i < length; i++) {
           out[i] = coef * in1[i] + invcoef * in2[i + in2_idx];
	   //	   System.out.println("out["+i+"] devient " + out[i] + ", par " +
	   //			      coef + " * " + in1[i] + " + " + invcoef + " * " + in2[i + in2_idx]);
       }
   }

   /*----------------------------------------------------------------*
    *  lpc bandwidth expansion
    *---------------------------------------------------------------*/

    public static void bwexpand(
		 float out[],      /* (o) the bandwidth expanded lpc
                              coefficients */
		 int out_idx,
		 float in[],      /* (i) the lpc coefficients before bandwidth
                              expansion */
		 float coef,     /* (i) the bandwidth expansion factor */
		 int length)      /* (i) the length of lpc coefficient vectors */
    {
	int i;
	float  chirp;

	chirp = coef;

	out[out_idx] = in[0];
	for (i = 1; i < length; i++) {
	    out[i + out_idx] = chirp * in[i];
	    chirp *= coef;
	}
    }

    public static void getCBvec(
		  float cbvec[],  /* (o) Constructed codebook vector */
		  float mem[],    /* (i) Codebook buffer */
		  int mem_idx,
		  int index,      /* (i) Codebook index */
		  int lMem,       /* (i) Length of codebook buffer */
		  int cbveclen)   /* (i) Codebook vector length */
    {
	int j, k, n, memInd, sFilt;
	float [] tmpbuf = new float[ilbc_constants.CB_MEML];
	int base_size;
	int ilow, ihigh;
	float alfa, alfa1;

       /* Determine size of codebook sections */

       base_size=lMem-cbveclen+1;

       if (cbveclen==ilbc_constants.SUBL) {
           base_size+=cbveclen/2;
       }

       /* No filter -> First codebook section */

       if (index<lMem-cbveclen+1) {

           /* first non-interpolated vectors */

           k=index+cbveclen;
           /* get vector */
	   System.arraycopy(mem, mem_idx + lMem - k, cbvec, 0, cbveclen);
	   //           memcpy(cbvec, mem+lMem-k, cbveclen*sizeof(float));

       } else if (index < base_size) {

           k=2*(index-(lMem-cbveclen+1))+cbveclen;

           ihigh=k/2;
           ilow=ihigh-5;

           /* Copy first noninterpolated part */

	   System.arraycopy(mem, mem_idx + lMem - k / 2, cbvec, 0, ilow);
	   //           memcpy(cbvec, mem+lMem-k/2, ilow*sizeof(float));

           /* interpolation */

           alfa1=(float)0.2;
           alfa=0.0f;
           for (j=ilow; j<ihigh; j++) {
               cbvec[j]=((float)1.0f-alfa)*mem[mem_idx + lMem-k/2+j]+
                   alfa*mem[mem_idx + lMem-k+j];
               alfa+=alfa1;
           }

           /* Copy second noninterpolated part */

	   System.arraycopy(mem, mem_idx+lMem-k+ihigh, cbvec, ihigh, (cbveclen-ihigh));
//            memcpy(cbvec+ihigh, mem+lMem-k+ihigh,
//                (cbveclen-ihigh)*sizeof(float));

       }

       /* Higher codebook section based on filtering */

       else {

           /* first non-interpolated vectors */

           if (index-base_size<lMem-cbveclen+1) {
               float [] tempbuff2 = new float[ilbc_constants.CB_MEML+ilbc_constants.CB_FILTERLEN+1];
//                float *pos;
//                float *pp, *pp1;
	       int pos, pp, pp1;

	       for (int li = 0; li < ilbc_constants.CB_HALFFILTERLEN; li++)
		   tempbuff2[li] = 0.0f;
//                memset(tempbuff2, 0,
//                    CB_HALFFILTERLEN*sizeof(float));
	       System.arraycopy(mem, mem_idx, tempbuff2, ilbc_constants.CB_HALFFILTERLEN, lMem);
//                memcpy(&tempbuff2[CB_HALFFILTERLEN], mem,
//                    lMem*sizeof(float));
	       for (int li = 0; li < ilbc_constants.CB_HALFFILTERLEN + 1; li++)
		   tempbuff2[lMem + ilbc_constants.CB_HALFFILTERLEN + li] = 0.0f;
//                memset(&tempbuff2[lMem+CB_HALFFILTERLEN], 0,
//                    (CB_HALFFILTERLEN+1)*sizeof(float));

               k=index-base_size+cbveclen;
               sFilt=lMem-k;
               memInd=sFilt+1-ilbc_constants.CB_HALFFILTERLEN;

               /* do filtering */
	       //               pos=cbvec;
	       pos = 0;
	       for (int li = 0; li < cbveclen; li++)
		   cbvec[li] = 0;
//                memset(pos, 0, cbveclen*sizeof(float));
               for (n=0; n<cbveclen; n++) {
		   pp = memInd + n + ilbc_constants.CB_HALFFILTERLEN;
//                    pp=&tempbuff2[memInd+n+CB_HALFFILTERLEN];
		   pp1 = ilbc_constants.CB_FILTERLEN - 1;
//                    pp1=&cbfiltersTbl[CB_FILTERLEN-1];
                   for (j=0; j < ilbc_constants.CB_FILTERLEN; j++) {
//                        (*pos)+=(*pp++)*(*pp1--);
		       cbvec[pos] += tempbuff2[pp] * ilbc_constants.cbfiltersTbl[pp1];
		       pp++;
		       pp1--;
                   }
                   pos++;
               }
           }

           /* interpolated vectors */

           else {
               float [] tempbuff2 = new float[ilbc_constants.CB_MEML+ilbc_constants.CB_FILTERLEN+1];

//                float *pos;
//                float *pp, *pp1;
	       int pos, pp, pp1;
               int i;

	       for (int li = 0; li < ilbc_constants.CB_HALFFILTERLEN; li++)
		   tempbuff2[li] = 0.0f;
//                memset(tempbuff2, 0,
//                    CB_HALFFILTERLEN*sizeof(float));
	       System.arraycopy(mem, mem_idx, tempbuff2, ilbc_constants.CB_HALFFILTERLEN, lMem);
//                memcpy(&tempbuff2[CB_HALFFILTERLEN], mem,
//                    lMem*sizeof(float));
	       for (int li = 0; li < ilbc_constants.CB_HALFFILTERLEN; li++)
		   tempbuff2[lMem+ilbc_constants.CB_HALFFILTERLEN+li] = 0.0f;
//                memset(&tempbuff2[lMem+CB_HALFFILTERLEN], 0,
//                    (CB_HALFFILTERLEN+1)*sizeof(float));

               k=2*(index-base_size-
		    (lMem-cbveclen+1))+cbveclen;
               sFilt=lMem-k;
               memInd=sFilt+1 - ilbc_constants.CB_HALFFILTERLEN;

               /* do filtering */
	       //               pos=&tmpbuf[sFilt];
	       pos = sFilt;
	       //               memset(pos, 0, k*sizeof(float));
	       for (int li = 0; li < k; li++)
		   tmpbuf[pos+li] = 0.0f;

               for (i=0; i<k; i++) {
		   pp = memInd + i + ilbc_constants.CB_HALFFILTERLEN;
//                    pp=&tempbuff2[memInd+i+CB_HALFFILTERLEN];
		   pp1 = ilbc_constants.CB_FILTERLEN-1;
//                    pp1=&cbfiltersTbl[CB_FILTERLEN-1];
                   for (j=0; j < ilbc_constants.CB_FILTERLEN; j++) {
		       //                       (*pos)+=(*pp++)*(*pp1--);
		       tmpbuf[pos] += tempbuff2[pp] * ilbc_constants.cbfiltersTbl[pp1];
		       pp++;
		       pp1--;
                   }
                   pos++;
               }

               ihigh = k / 2;
               ilow=ihigh-5;

               /* Copy first noninterpolated part */

	       System.arraycopy(tmpbuf, lMem - k / 2, cbvec, 0, ilow);
//                memcpy(cbvec, tmpbuf+lMem-k/2,
//                    ilow*sizeof(float));

               /* interpolation */

               alfa1=(float)0.2;
               alfa=0.0f;
               for (j=ilow; j<ihigh; j++) {
                   cbvec[j]=((float)1.0f-alfa)*
                       tmpbuf[lMem-k/2+j]+alfa*tmpbuf[lMem-k+j];
                   alfa+=alfa1;
               }

               /* Copy second noninterpolated part */

	       System.arraycopy(tmpbuf, lMem-k+ihigh, cbvec, ihigh, cbveclen - ihigh);
//                memcpy(cbvec+ihigh, tmpbuf+lMem-k+ihigh,
//                    (cbveclen-ihigh)*sizeof(float));
           }
       }
   }



    public static float gainquant(/* (o) quantized gain value */
		    float in,       /* (i) gain value */
		    float maxIn,/* (i) maximum of gain value */
		    int cblen,      /* (i) number of quantization indices */
		    int index[],      /* (o) quantization index */
		    int index_idx)
    {
	int i, tindex;
	float minmeasure,measure, cb[], scale;

	/* ensure a lower bound on the scaling factor */

	scale = maxIn;

	if (scale < 0.1) {
	    scale = (float)0.1;
	}

	/* select the quantization table */

	if (cblen == 8) {
	    cb = ilbc_constants.gain_sq3Tbl;
	} else if (cblen == 16) {
	    cb = ilbc_constants.gain_sq4Tbl;
	} else  {
	    cb = ilbc_constants.gain_sq5Tbl;
	}

	/* select the best index in the quantization table */

	minmeasure=10000000.0f;
	tindex=0;
	for (i=0; i<cblen; i++) {
	    measure = (in - scale*cb[i])*(in-scale*cb[i]);

	    if (measure<minmeasure) {
		tindex=i;
		minmeasure=measure;
	    }
	}
	index[index_idx] = tindex;

	/* return the quantized value */

	return scale*cb[tindex];
    }

    /*----------------------------------------------------------------*
     *  decoder for quantized gains in the gain-shape coding of
     *  residual
     *---------------------------------------------------------------*/

    public static float gaindequant(  /* (o) quantized gain value */
		      int index,      /* (i) quantization index */
		      float maxIn,/* (i) maximum of unquantized gain */
		      int cblen)       /* (i) number of quantization indices */
    {
	float scale;

	/* obtain correct scale factor */

	scale=(float)(float)Math.abs(maxIn);

	if (scale < 0.1) {
	    scale=(float)0.1;
	}

	/* select the quantization table and return the decoded value */

	if (cblen==8) {
	    return scale*ilbc_constants.gain_sq3Tbl[index];
	} else if (cblen==16) {
	    return scale*ilbc_constants.gain_sq4Tbl[index];
	}
	else if (cblen==32) {
	    return scale*ilbc_constants.gain_sq5Tbl[index];
	}

	return 0.0f;
    }


    public static void iCBConstruct(
		     float decvector[],   /* (o) Decoded vector */
		     int decvector_idx,
		     int index[],         /* (i) Codebook indices */
		     int index_idx,
		     int gain_index[],/* (i) Gain quantization indices */
		     int gain_index_idx,
		     float mem[],         /* (i) Buffer for codevector construction */
		     int mem_idx,
		     int lMem,           /* (i) Length of buffer */
		     int veclen,         /* (i) Length of vector */
		     int nStages         /* (i) Number of codebook stages */
   ){
       int j,k;

       float [] gain = new float[ilbc_constants.CB_NSTAGES];
       float [] cbvec = new float[ilbc_constants.SUBL];

       /* gain de-quantization */

       gain[0] = gaindequant(gain_index[gain_index_idx + 0], 1.0f, 32);
       if (nStages > 1) {
           gain[1] = gaindequant(gain_index[gain_index_idx + 1],
               (float)(float)Math.abs(gain[0]), 16);
       }
       if (nStages > 2) {
           gain[2] = gaindequant(gain_index[gain_index_idx + 2],
               (float)(float)Math.abs(gain[1]), 8);
       }

       /* codebook vector construction and construction of
       total vector */

       getCBvec(cbvec, mem, mem_idx, index[index_idx + 0], lMem, veclen);
       for (j=0;j<veclen;j++){
           decvector[decvector_idx + j] = gain[0]*cbvec[j];
       }
       if (nStages > 1) {
           for (k=1; k<nStages; k++) {
               getCBvec(cbvec, mem, mem_idx, index[index_idx + k], lMem, veclen);
               for (j=0;j<veclen;j++) {
                   decvector[decvector_idx + j] += gain[k]*cbvec[j];
               }
           }
       }
   }



}

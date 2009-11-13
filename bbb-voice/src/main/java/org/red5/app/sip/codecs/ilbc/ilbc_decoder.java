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
public class ilbc_decoder {

    int consPLICount;
    int prevPLI;
    int prevLag;
    int last_lag;
    int prev_enh_pl;
    float per;
    float prevResidual[];
    long seed;
    float prevLpc[];

    ilbc_ulp ULP_inst = null;

    float syntMem[];
    float lsfdeqold[];
    float old_syntdenum[];
    float hpomem[];
    int use_enhancer;
    float enh_buf[];
    float enh_period[];

    // La plupart des variables globales sont dans ilbc_constants.etc...


   void syntFilter(
       float Out[],     /* (i/o) Signal to be filtered */
       int Out_idx,
       float a[],       /* (i) LP parameters */
       int a_idx,
       int len,    /* (i) Length of signal */
       float mem[])      /* (i/o) Filter state */
    {
	int i, j;
	//	float *po, *pi, *pa, *pm;
	int po, pi, pa, pm;

// 	System.out.println("out size : " + Out.length);
// 	System.out.println("out idx : " + Out_idx);
// 	System.out.println("a size : " + a.length);
// 	System.out.println("a idx : " + a_idx);
// 	System.out.println("len : " + len);
// 	System.out.println("mem size : " + mem.length);

	po = Out_idx;

	/* Filter first part using memory from past */

	for (i=0; i<ilbc_constants.LPC_FILTERORDER; i++) {
//            pi=&Out[i-1];
//            pa=&a[1];
//            pm=&mem[LPC_FILTERORDER-1];
	    pi = Out_idx + i - 1;
	    pa = a_idx + 1;
	    pm = ilbc_constants.LPC_FILTERORDER - 1;

	    for (j=1; j<=i; j++) {
		//		*po-=(*pa++)*(*pi--);
// 		System.out.println("1 Soustraction (" + i + "," + j + ") a " + Out[po] + " de " + a[pa] + " * " + Out[pi]);
// 		System.out.println("index " + (po - Out_idx) + " <> " + (pi - Out_idx));
		Out[po] -= a[pa] * Out[pi];
// 		System.out.println("Pour un resultat de " + Out[po]);
		pa++;
		pi--;
	    }
           for (j=i+1; j < ilbc_constants.LPC_FILTERORDER+1; j++) {
	       //               *po-=(*pa++)*(*pm--);
// 	       System.out.println("2 Soustraction a " + Out[po] + " de " + a[pa] + " * " + mem[pm]);
	       Out[po] -= a[pa] * mem[pm];
// 	       System.out.println("Pour un resultat de " + Out[po]);
	       pa++;
	       pm--;
           }
           po++;
	}

       /* Filter last part where the state is entirely in
          the output vector */

       for (i = ilbc_constants.LPC_FILTERORDER; i < len; i++) {
	   //           pi=&Out[i-1];
	   pi = Out_idx + i - 1;
	   //           pa=&a[1];
	   pa = a_idx + 1;
           for (j=1; j < ilbc_constants.LPC_FILTERORDER+1; j++) {
	       //               *po-=(*pa++)*(*pi--);
// 	       System.out.println("3 Soustraction a " + Out[po] + " de " + a[pa] + " * " + Out[pi]);
	       Out[po] -= a[pa] * Out[pi];
// 	       System.out.println("Pour un resultat de " + Out[po]);
	       pa++;
	       pi--;
           }
           po++;
       }

       /* Update state vector */

       System.arraycopy(Out, Out_idx + len - ilbc_constants.LPC_FILTERORDER,
			mem, 0, ilbc_constants.LPC_FILTERORDER);
//        memcpy(mem, &Out[len-LPC_FILTERORDER],
//            LPC_FILTERORDER*sizeof(float));
   }

   /*---------------------------------------------------------------*
    *  interpolation of lsf coefficients for the decoder
    *--------------------------------------------------------------*/

    public void LSFinterpolate2a_dec(
       float a[],           /* (o) lpc coefficients for a sub-frame */
       float lsf1[],    /* (i) first lsf coefficient vector */
       float lsf2[],    /* (i) second lsf coefficient vector */
       int lsf2_idx,
       float coef,         /* (i) interpolation weight */
       int length          /* (i) length of lsf vectors */
   ){
       float  [] lsftmp = new float[ilbc_constants.LPC_FILTERORDER];

       ilbc_common.interpolate(lsftmp, lsf1, lsf2, lsf2_idx, coef, length);
       ilbc_common.lsf2a(a, lsftmp);
   }

   /*---------------------------------------------------------------*
    *  obtain dequantized lsf coefficients from quantization index
    *--------------------------------------------------------------*/

   void SimplelsfDEQ(
       float lsfdeq[],    /* (o) dequantized lsf coefficients */
       int index[],         /* (i) quantization index */
       int lpc_n           /* (i) number of LPCs */
   ){
       int i, j, pos, cb_pos;

       /* decode first LSF */

       pos = 0;
       cb_pos = 0;
       for (i = 0; i < ilbc_constants.LSF_NSPLIT; i++) {
           for (j = 0; j < ilbc_constants.dim_lsfCbTbl[i]; j++) {
               lsfdeq[pos + j] = ilbc_constants.lsfCbTbl[cb_pos + (int)
                   ((long)(index[i])*ilbc_constants.dim_lsfCbTbl[i] + j)];
           }
           pos += ilbc_constants.dim_lsfCbTbl[i];
           cb_pos += ilbc_constants.size_lsfCbTbl[i]*ilbc_constants.dim_lsfCbTbl[i];
       }

       if (lpc_n>1) {

           /* decode last LSF */

           pos = 0;
           cb_pos = 0;
           for (i = 0; i < ilbc_constants.LSF_NSPLIT; i++) {
               for (j = 0; j < ilbc_constants.dim_lsfCbTbl[i]; j++) {
                   lsfdeq[ilbc_constants.LPC_FILTERORDER + pos + j] =
                       ilbc_constants.lsfCbTbl[cb_pos + (int)
                       ((long)(index[ilbc_constants.LSF_NSPLIT + i])*
                       ilbc_constants.dim_lsfCbTbl[i]) + j];
               }
               pos += ilbc_constants.dim_lsfCbTbl[i];
               cb_pos += ilbc_constants.size_lsfCbTbl[i]*ilbc_constants.dim_lsfCbTbl[i];
           }
       }
   }

   /*----------------------------------------------------------------*
    *  obtain synthesis and weighting filters form lsf coefficients
    *---------------------------------------------------------------*/

   void DecoderInterpolateLSF(
       float syntdenum[], /* (o) synthesis filter coefficients */
       float weightdenum[], /* (o) weighting denumerator
                                  coefficients */
       float lsfdeq[],       /* (i) dequantized lsf coefficients */
       int length)         /* (i) length of lsf coefficient vector */
    {
       int    i, pos, lp_length;
       float [] lp = new float[ilbc_constants.LPC_FILTERORDER + 1];
       int lsfdeq2;

       lsfdeq2 = length;
//        lsfdeq2 = lsfdeq + length;
       lp_length = length + 1;

       if (this.ULP_inst.mode==30) {
           /* sub-frame 1: Interpolation between old and first */

           LSFinterpolate2a_dec(lp, this.lsfdeqold, lsfdeq, 0,
				ilbc_constants.lsf_weightTbl_30ms[0], length);
	   System.arraycopy(lp, 0, syntdenum, 0, lp_length);
//            memcpy(syntdenum,lp,lp_length*sizeof(float));
           ilbc_common.bwexpand(weightdenum, 0, lp, ilbc_constants.LPC_CHIRP_WEIGHTDENUM, lp_length);

           /* sub-frames 2 to 6: interpolation between first
              and last LSF */

           pos = lp_length;
           for (i = 1; i < 6; i++) {
               LSFinterpolate2a_dec(lp, lsfdeq, lsfdeq, lsfdeq2,
				    ilbc_constants.lsf_weightTbl_30ms[i], length);
	       System.arraycopy(lp, 0, syntdenum, pos, lp_length);
//                memcpy(syntdenum + pos,lp,lp_length*sizeof(float));
               ilbc_common.bwexpand(weightdenum, pos, lp,
			ilbc_constants.LPC_CHIRP_WEIGHTDENUM, lp_length);
               pos += lp_length;
           }
       }
       else {
           pos = 0;
           for (i = 0; i < this.ULP_inst.nsub; i++) {
               LSFinterpolate2a_dec(lp, this.lsfdeqold,
				    lsfdeq, 0, ilbc_constants.lsf_weightTbl_20ms[i], length);
	       System.arraycopy(lp, 0, syntdenum, pos, lp_length);
//                memcpy(syntdenum+pos,lp,lp_length*sizeof(float));
               ilbc_common.bwexpand(weightdenum, pos, lp, ilbc_constants.LPC_CHIRP_WEIGHTDENUM,
				    lp_length);
               pos += lp_length;
           }
       }

       /* update memory */

       if (this.ULP_inst.mode==30) {
	   System.arraycopy(lsfdeq, lsfdeq2, this.lsfdeqold, 0, length);
//            memcpy(iLBCdec_inst->lsfdeqold, lsfdeq2, length*sizeof(float));
       } else {
	   System.arraycopy(lsfdeq, 0, this.lsfdeqold, 0, length);
//            memcpy(iLBCdec_inst->lsfdeqold, lsfdeq, length*sizeof(float));
       }
   }


    public void index_conv_dec(int index[])          /* (i/o) Codebook indexes */
    {
	int k;

	for (k=1; k<ilbc_constants.CB_NSTAGES; k++) {

	    if ((index[k]>=44)&&(index[k]<108)) {
		index[k]+=64;
	    } else if ((index[k]>=108)&&(index[k]<128)) {
               index[k]+=128;
	    } else {
		/* ERROR */
	    }
	}
    }

    public void hpOutput(
		 float In[],  /* (i) vector to filter */
		 int len,/* (i) length of vector to filter */
		 float Out[], /* (o) the resulting filtered vector */
		 float mem[])  /* (i/o) the filter state */
    {
	int i;
	//	float *pi, *po;
	int pi, po;

       /* all-zero section*/

//        pi = &In[0];
//        po = &Out[0];
	pi = 0;
	po = 0;

	for (i=0; i<len; i++) {
	    Out[po] = ilbc_constants.hpo_zero_coefsTbl[0] * (In[pi]);
	    Out[po] += ilbc_constants.hpo_zero_coefsTbl[1] * mem[0];
	    Out[po] += ilbc_constants.hpo_zero_coefsTbl[2] * mem[1];

           mem[1] = mem[0];
           mem[0] = In[pi];
           po++;
           pi++;

       }

       /* all-pole section*/

	//       po = &Out[0];
	po = 0;
	for (i=0; i<len; i++) {
	    Out[po] -= ilbc_constants.hpo_pole_coefsTbl[1] * mem[2];
	    Out[po] -= ilbc_constants.hpo_pole_coefsTbl[2] * mem[3];

	    mem[3] = mem[2];
	    mem[2] = Out[po];
	    po++;
	}
    }

   /*----------------------------------------------------------------*
    * downsample (LP filter and decimation)
    *---------------------------------------------------------------*/

   void DownSample (
       float  In[],     /* (i) input samples */
       int in_idx,
       float  Coef[],   /* (i) filter coefficients */
       int lengthIn,   /* (i) number of input samples */
       float  state[],  /* (i) filter state */
       float  Out[])     /* (o) downsampled output */
    {
	float o;
	//	float *Out_ptr = Out;
	int out_ptr = 0;
	//float *Coef_ptr, *In_ptr;
	int coef_ptr = 0;
	int in_ptr = in_idx;
	//float *state_ptr;
	int state_ptr = 0;
	int i, j, stop;

       /* LP filter and decimate at the same time */

	for (i = ilbc_constants.DELAY_DS; i < lengthIn; i += ilbc_constants.FACTOR_DS)
	    {
		coef_ptr = 0;
		in_ptr = in_idx + i;
		state_ptr = ilbc_constants.FILTERORDER_DS - 2;

		o = (float)0.0f;

		//		stop = (i < ilbc_constants.FILTERORDER_DS) ? i + 1 : ilbc_constants.FILTERORDER_DS;
		if (i < ilbc_constants.FILTERORDER_DS) {
		    stop = i + 1;
		}
		else {
		    stop = ilbc_constants.FILTERORDER_DS;
		}

		for (j = 0; j < stop; j++)
		    {
			o += Coef[coef_ptr] * In[in_ptr];
			coef_ptr++;
			in_ptr--;
		    }
		for (j = i + 1; j < ilbc_constants.FILTERORDER_DS; j++)
		    {
			o += Coef[coef_ptr] * state[state_ptr];
			coef_ptr++;
			state_ptr--;
		    }
		Out[out_ptr] = o;
		out_ptr++;
		//		*Out_ptr++ = o;
	    }

	/* Get the last part (use zeros as input for the future) */

       for (i=(lengthIn+ilbc_constants.FACTOR_DS); i<(lengthIn+ilbc_constants.DELAY_DS);
               i+=ilbc_constants.FACTOR_DS) {

           o=(float)0.0f;

           if (i<lengthIn) {
               coef_ptr = 0;
               in_ptr = in_idx + i;
               for (j=0; j<ilbc_constants.FILTERORDER_DS; j++) {
		   o += Coef[coef_ptr] * Out[out_ptr];
		   coef_ptr++;
		   out_ptr--;
		   //                       o += *Coef_ptr++ * (*Out_ptr--);
               }
           } else {
               coef_ptr = i-lengthIn;
	       in_ptr = in_idx + lengthIn - 1;
               for (j=0; j<ilbc_constants.FILTERORDER_DS-(i-lengthIn); j++) {
		   o += Coef[coef_ptr] * In[in_ptr];
		   coef_ptr++;
		   in_ptr--;
               }
           }
           Out[out_ptr] = o;
	   out_ptr++;
       }
   }

    /*----------------------------------------------------------------*
     * Find index in array such that the array element with said
     * index is the element of said array closest to "value"
     * according to the squared-error criterion
     *---------------------------------------------------------------*/

    public int NearestNeighbor(
//			 int   index[],   /* (o) index of array element closest
//					    to value */
			       float array[],   /* (i) data array */
			       float value,/* (i) value */
			       int arlength)/* (i) dimension of data array */
    {
	int i;
	float bestcrit,crit;
	int index;

	crit = array[0] - value;
	bestcrit = crit * crit;
	index = 0;
	for (i = 1; i < arlength; i++) {
	    crit = array[i] - value;
	    crit = crit * crit;

	    if (crit < bestcrit) {
		bestcrit = crit;
		index = i;
	    }
	}
	return index;
    }

    /*----------------------------------------------------------------*
     * compute cross correlation between sequences
     *---------------------------------------------------------------*/

    public void mycorr1(
		 float corr[],    /* (o) correlation of seq1 and seq2 */
		 int corr_idx,
		 float seq1[],    /* (i) first sequence */
		 int seq1_idx,
		 int dim1,           /* (i) dimension first seq1 */
		 float seq2[],  /* (i) second sequence */
		 int seq2_idx,
		 int dim2)        /* (i) dimension seq2 */
    {
	int i,j;

// 	System.out.println("longueur 1 : " + seq1.length);
// 	System.out.println("distance 1 : " + seq1_idx);
// 	System.out.println("longueur 2 : " + seq2.length);
// 	System.out.println("distance 2 : " + seq2_idx);

// 	System.out.println("dimensions : " + dim1 + " et " + dim2);

// BUG in ILBC ???

	for (i=0; i<=dim1-dim2; i++) {
	    if ((corr_idx+i) < corr.length)
		corr[corr_idx+i]=0.0f;
	    for (j=0; j<dim2; j++) {
		corr[corr_idx+i] += seq1[seq1_idx+i+j] * seq2[seq2_idx+j];
	    }
	}
    }

    /*----------------------------------------------------------------*
     * upsample finite array assuming zeros outside bounds
     *---------------------------------------------------------------*/

    public void enh_upsample(
			  float useq1[],   /* (o) upsampled output sequence */
			  float seq1[],/* (i) unupsampled sequence */
			  int dim1,       /* (i) dimension seq1 */
			  int hfl)         /* (i) polyphase filter length=2*hfl+1 */
    {
	//	float *pu,*ps;
	int pu, ps;
	int i,j,k,q,filterlength,hfl2;
	int [] polyp = new int[ilbc_constants.ENH_UPS0]; /* pointers to
					 polyphase columns */
	//	const float *pp;
	int pp;

	/* define pointers for filter */

	filterlength=2*hfl+1;

	if ( filterlength > dim1 ) {
	    hfl2=(int) (dim1/2);
	    for (j=0; j<ilbc_constants.ENH_UPS0; j++) {
		polyp[j]=j*filterlength+hfl-hfl2;
	    }
	    hfl=hfl2;
	    filterlength=2*hfl+1;
	}
	else {
	    for (j=0; j<ilbc_constants.ENH_UPS0; j++) {
		polyp[j]=j*filterlength;
	    }
	}

	/* filtering: filter overhangs left side of sequence */

	//	pu=useq1;
	pu = 0;
	for (i=hfl; i<filterlength; i++) {
	    for (j=0; j<ilbc_constants.ENH_UPS0; j++) {
		//		*pu=0.0f;
		useq1[pu] = 0.0f;
		//		pp = polyp[j];
		pp = polyp[j];
		//		ps = seq1+i;
		ps = i;
		for (k=0; k<=i; k++) {
		    useq1[pu] += seq1[ps] * ilbc_constants.polyphaserTbl[pp];
		    ps--;
		    pp++;
		}
		pu++;
	    }
	}

	/* filtering: simple convolution=inner products */

	for (i=filterlength; i<dim1; i++) {
		for (j=0;j < ilbc_constants.ENH_UPS0; j++){
		    //		    *pu=0.0f;
		    useq1[pu] = 0.0f;
		    //		    pp = polyp[j];
		    pp = polyp[j];
		    //		    ps = seq1+i;
		    ps = i;
		    for (k=0; k<filterlength; k++) {
			//			*pu += *ps-- * *pp++;
			useq1[pu] += seq1[ps] * ilbc_constants.polyphaserTbl[pp];
			ps--;
			pp++;
		    }
		    pu++;
		}
	}

	/* filtering: filter overhangs right side of sequence */

	for (q=1; q<=hfl; q++) {
	    for (j=0; j<ilbc_constants.ENH_UPS0; j++) {
		//		*pu=0.0f;
		useq1[pu] = 0.0f;
		//		pp = polyp[j]+q;
		pp = polyp[j]+q;
		//		ps = seq1+dim1-1;
		ps = dim1 - 1;
		for (k=0; k<filterlength-q; k++) {
		    useq1[pu] += seq1[ps] * ilbc_constants.polyphaserTbl[pp];
		    ps--;
		    pp++;
		    //		    *pu += *ps-- * *pp++;
		}
		pu++;
	    }
	}
    }


    /*----------------------------------------------------------------*
     * find segment starting near idata+estSegPos that has highest
     * correlation with idata+centerStartPos through
     * idata+centerStartPos+ENH_BLOCKL-1 segment is found at a
     * resolution of ENH_UPSO times the original of the original
     * sampling rate
     *---------------------------------------------------------------*/

    public float refiner(
		 float seg[],         /* (o) segment array */
		 int seg_idx,
		 float idata[],       /* (i) original data buffer */
		 int idatal,         /* (i) dimension of idata */
		 int centerStartPos, /* (i) beginning center segment */
		 float estSegPos,/* (i) estimated beginning other segment */
		 float period)    /* (i) estimated pitch period */
    {
	int estSegPosRounded,searchSegStartPos,searchSegEndPos,corrdim;
	int tloc,tloc2,i,st,en,fraction;
	float [] vect = new float[ilbc_constants.ENH_VECTL];
	float [] corrVec = new float[ilbc_constants.ENH_CORRDIM];
	float maxv;
	float [] corrVecUps = new float[ilbc_constants.ENH_CORRDIM*ilbc_constants.ENH_UPS0];
	float updStartPos = 0.0f;

	/* defining array bounds */

	estSegPosRounded=(int)(estSegPos - 0.5);

	searchSegStartPos=estSegPosRounded-ilbc_constants.ENH_SLOP;

	if (searchSegStartPos<0) {
	    searchSegStartPos=0;
	}
	searchSegEndPos=estSegPosRounded+ilbc_constants.ENH_SLOP;

	if (searchSegEndPos+ilbc_constants.ENH_BLOCKL >= idatal) {
	    searchSegEndPos=idatal-ilbc_constants.ENH_BLOCKL-1;
	}
	corrdim=searchSegEndPos-searchSegStartPos+1;

	/* compute upsampled correlation (corr33) and find
	   location of max */
// 	System.out.println("appel 1");
	mycorr1(corrVec, 0, idata, searchSegStartPos,
		corrdim+ilbc_constants.ENH_BLOCKL-1,
		idata,centerStartPos,ilbc_constants.ENH_BLOCKL);
	enh_upsample(corrVecUps,corrVec,corrdim,ilbc_constants.ENH_FL0);
	tloc=0; maxv=corrVecUps[0];
	for (i=1; i<ilbc_constants.ENH_UPS0*corrdim; i++) {

	    if (corrVecUps[i]>maxv) {
		tloc=i;
		maxv=corrVecUps[i];
	    }
	}

	/* make vector can be upsampled without ever running outside
	   bounds */

	updStartPos= (float)searchSegStartPos +
	    (float)tloc/(float)ilbc_constants.ENH_UPS0+(float)1.0f;
	tloc2=(int)(tloc/ilbc_constants.ENH_UPS0);

	if (tloc>tloc2*ilbc_constants.ENH_UPS0) {
	    tloc2++;
	}
	st=searchSegStartPos+tloc2-ilbc_constants.ENH_FL0;

	if (st<0) {
	    for (int li = 0; li < -st; li++)
		vect[li] = 0.0f;
// 	    memset(vect,0,-st*sizeof(float));
	    System.arraycopy(idata, 0, vect, -st, (ilbc_constants.ENH_VECTL+st));
// 	    memcpy(&vect[-st],idata, (ilbc_constants.ENH_VECTL+st)*sizeof(float));
	}
	else {
	    en=st+ilbc_constants.ENH_VECTL;

	    if (en>idatal) {
		System.arraycopy(idata, st, vect, 0, (ilbc_constants.ENH_VECTL-(en-idatal)));
// 		memcpy(vect, &idata[st],
// 		       (ilbc_constants.ENH_VECTL-(en-idatal))*sizeof(float));
		for (int li = 0; li < en-idatal; li++)
		    vect[ilbc_constants.ENH_VECTL-(en-idatal)+li] = 0.0f;
// 		memset(&vect[ilbc_constants.ENH_VECTL-(en-idatal)], 0,
// 		       (en-idatal)*sizeof(float));
	    }
	    else {
		System.arraycopy(idata, st, vect, 0, ilbc_constants.ENH_VECTL);
// 		memcpy(vect, &idata[st], ilbc_constants.ENH_VECTL*sizeof(float));
	    }
	}
	fraction=tloc2*ilbc_constants.ENH_UPS0-tloc;

	/* compute the segment (this is actually a convolution) */

// 	System.out.println("appel 2");
// 	System.out.println("longueur 1 : " + vect.length);
// 	System.out.println("distance 1 : " + 0);
// 	System.out.println("longueur 2 : " + ilbc_constants.polyphaserTbl.length);
// 	System.out.println("distance 2 : " + (2*ilbc_constants.ENH_FL0+1)*fraction);
// 	System.out.println("dimension 1 : " + ilbc_constants.ENH_VECTL);
// 	System.out.println("dimension 2 : " + (2 * ilbc_constants.ENH_FL0+1));
// 	System.out.println("correlations de dimension " + seg.length);
	mycorr1(seg, seg_idx, vect, 0, ilbc_constants.ENH_VECTL,
		ilbc_constants.polyphaserTbl,
		(2*ilbc_constants.ENH_FL0+1)*fraction,
		2*ilbc_constants.ENH_FL0+1);

	return updStartPos;
    }

    /*----------------------------------------------------------------*
     * find the smoothed output data
     *---------------------------------------------------------------*/

    public void smath(
	       float odata[],   /* (o) smoothed output */
	       int odata_idx,
	       float sseq[],/* (i) said second sequence of waveforms */
	       int hl,         /* (i) 2*hl+1 is sseq dimension */
	       float alpha0)/* (i) max smoothing energy fraction */
    {
	int i,k;
	float w00,w10,w11,A,B,C,err,errs;
	float [] surround = new float[ilbc_constants.BLOCKL_MAX]; /* shape contributed by other than
				       current */
	float [] wt = new float[2*ilbc_constants.ENH_HL+1];       /* waveform weighting to get
				       surround shape */
	float denom;
	int psseq;

	/* create shape of contribution from all waveforms except the
	   current one */

	for (i=1; i<=2*hl+1; i++) {
	    wt[i-1] = (float)0.5*(1 - (float)(float)Math.cos(2*ilbc_constants.PI*i/(2*hl+2)));
	}
	wt[hl]=0.0f; /* for clarity, not used */
	for (i=0; i<ilbc_constants.ENH_BLOCKL; i++) {
	    surround[i]=sseq[i]*wt[0];
	}
	for (k=1; k<hl; k++) {
	    psseq=k*ilbc_constants.ENH_BLOCKL;
	    for(i=0;i<ilbc_constants.ENH_BLOCKL; i++) {
		surround[i]+=sseq[psseq+i]*wt[k];
	    }
	    }
	for (k=hl+1; k<=2*hl; k++) {
	    psseq=k*ilbc_constants.ENH_BLOCKL;
	    for(i=0;i<ilbc_constants.ENH_BLOCKL; i++) {
		surround[i]+=sseq[psseq+i]*wt[k];
	    }
	}

	/* compute some inner products */

	w00 = w10 = w11 = 0.0f;
	psseq=hl*ilbc_constants.ENH_BLOCKL; /* current block  */
	for (i=0; i<ilbc_constants.ENH_BLOCKL;i++) {
	    w00+=sseq[psseq+i]*sseq[psseq+i];
	    w11+=surround[i]*surround[i];
	    w10+=surround[i]*sseq[psseq+i];
	}

	if ((float)Math.abs(w11) < 1.0f) {
	    w11=1.0f;
	}
	C = (float)(float)Math.sqrt( w00/w11);

	/* first try enhancement without power-constraint */

	errs=0.0f;
	psseq=hl*ilbc_constants.ENH_BLOCKL;
	for (i=0; i<ilbc_constants.ENH_BLOCKL; i++) {
	    odata[odata_idx+i]=C*surround[i];
	    err=sseq[psseq+i]-odata[odata_idx+i];
	    errs+=err*err;
	}

	/* if constraint violated by first try, add constraint */

	if (errs > alpha0 * w00) {
	    if ( w00 < 1) {
		w00=1;
	    }
	    denom = (w11*w00-w10*w10)/(w00*w00);

	    if (denom > 0.0001f) { /* eliminates numerical problems
				     for if smooth */
		A = (float)(float)Math.sqrt( (alpha0- alpha0*alpha0/4)/denom);
		B = -alpha0/2 - A * w10/w00;
		B = B+1;
	    }
	    else { /* essentially no difference between cycles;
		      smoothing not needed */
		A= 0.0f;
		B= 1.0f;
	    }

	    /* create smoothed sequence */

	    psseq=hl*ilbc_constants.ENH_BLOCKL;
	    for (i=0; i<ilbc_constants.ENH_BLOCKL; i++) {
		odata[odata_idx + i]=A*surround[i]+B*sseq[psseq+i];
	    }
	}
    }

    /*----------------------------------------------------------------*
     * get the pitch-synchronous sample sequence
     *---------------------------------------------------------------*/

    public void getsseq(
		 float sseq[],    /* (o) the pitch-synchronous sequence */
		 float idata[],       /* (i) original data */
		 int idatal,         /* (i) dimension of data */
		 int centerStartPos, /* (i) where current block starts */
		 float period[],      /* (i) rough-pitch-period array */
		 float plocs[],       /* (i) where periods of period array
					are taken */
		 int periodl,    /* (i) dimension period array */
		 int hl)              /* (i) 2*hl+1 is the number of sequences */
    {
	int i,centerEndPos,q;
	float [] blockStartPos = new float[2*ilbc_constants.ENH_HL+1];
	int [] lagBlock = new int[2*ilbc_constants.ENH_HL+1];
	float [] plocs2 = new float[ilbc_constants.ENH_PLOCSL];
	//	float *psseq;
	int psseq;

	centerEndPos=centerStartPos+ilbc_constants.ENH_BLOCKL-1;

	/* present */

	lagBlock[hl] = NearestNeighbor(plocs,
			(float)0.5*(centerStartPos+centerEndPos),periodl);

	blockStartPos[hl]=(float)centerStartPos;

	psseq=ilbc_constants.ENH_BLOCKL*hl;
// 	psseq=sseq+ENH_BLOCKL*hl;
	System.arraycopy(idata, centerStartPos, sseq, psseq, ilbc_constants.ENH_BLOCKL);
//	memcpy(psseq, idata+centerStartPos, ENH_BLOCKL*sizeof(float));

	/* past */

	for (q=hl-1; q>=0; q--) {
	    blockStartPos[q]=blockStartPos[q+1]-period[lagBlock[q+1]];
	    lagBlock[q] = NearestNeighbor(plocs,
					  blockStartPos[q]+
					  ilbc_constants.ENH_BLOCKL_HALF-period[lagBlock[q+1]],
					  periodl);


	    if (blockStartPos[q]-ilbc_constants.ENH_OVERHANG>=0) {
		blockStartPos[q] = refiner(sseq,q*ilbc_constants.ENH_BLOCKL, idata,
					   idatal, centerStartPos,
					   blockStartPos[q],
					   period[lagBlock[q+1]]);
	    } else {
		psseq=q*ilbc_constants.ENH_BLOCKL;
// 		psseq=sseq+q*ENH_BLOCKL;
		for (int li = 0; li < ilbc_constants.ENH_BLOCKL; li++)
		    sseq[psseq+li] = 0.0f;
//		memset(psseq, 0, ENH_BLOCKL*sizeof(float));
	    }
	}

	/* future */

	for (i=0; i<periodl; i++) {
	    plocs2[i]=plocs[i]-period[i];
	}
	for (q=hl+1; q<=2*hl; q++) {
	    lagBlock[q] = NearestNeighbor(plocs2,
					  blockStartPos[q-1]+ilbc_constants.ENH_BLOCKL_HALF,
					  periodl);

	    blockStartPos[q]=blockStartPos[q-1]+period[lagBlock[q]];
	    if (blockStartPos[q]+ilbc_constants.ENH_BLOCKL+ilbc_constants.ENH_OVERHANG<idatal) {
		blockStartPos[q] = refiner(sseq,q*ilbc_constants.ENH_BLOCKL, idata,
					   idatal, centerStartPos,
					   blockStartPos[q],
					   period[lagBlock[q]]);
	    }
	    else {
		psseq=q*ilbc_constants.ENH_BLOCKL;
// 		psseq=sseq+q*ENH_BLOCKL;
		for (int li = 0; li < ilbc_constants.ENH_BLOCKL; li++)
		    sseq[psseq+li] = 0.0f;
// 		memset(psseq, 0, ENH_BLOCKL*sizeof(float));
	    }
	}
    }

    /*----------------------------------------------------------------*
     * perform enhancement on idata+centerStartPos through
     * idata+centerStartPos+ENH_BLOCKL-1
     *---------------------------------------------------------------*/

    public void enhancer(
		      float odata[],       /* (o) smoothed block, dimension blockl */
		      int odata_idx,
		      float idata[],       /* (i) data buffer used for enhancing */
		      int idatal,         /* (i) dimension idata */
		      int centerStartPos, /* (i) first sample current block
					     within idata */
		      float alpha0,       /* (i) max correction-energy-fraction
					     (in [0,1]) */
		      float period[],      /* (i) pitch period array */
		      float plocs[],       /* (i) locations where period array
					     values valid */
		      int periodl         /* (i) dimension of period and plocs */
		      ){
	float [] sseq = new float[(2*ilbc_constants.ENH_HL+1)*ilbc_constants.ENH_BLOCKL];

	/* get said second sequence of segments */

	getsseq(sseq,idata,idatal,centerStartPos,period,
		plocs,periodl,ilbc_constants.ENH_HL);

	/* compute the smoothed output from said second sequence */

	smath(odata, odata_idx, sseq,ilbc_constants.ENH_HL,alpha0);

    }

    /*----------------------------------------------------------------*
     * cross correlation
     *---------------------------------------------------------------*/

    public float xCorrCoef(
		    float target[],      /* (i) first array */
		    int t_idx,
		    float regressor[],   /* (i) second array */
		    int r_idx,
		    int subl)        /* (i) dimension arrays */
    {
	int i;
	float ftmp1, ftmp2;

	ftmp1 = 0.0f;
	ftmp2 = 0.0f;
	for (i=0; i<subl; i++) {
	    ftmp1 += target[t_idx + i] * regressor[r_idx + i];
	    ftmp2 += regressor[r_idx + i] * regressor[r_idx + i];
	}

	if (ftmp1 > 0.0f) {
	    return (float)(ftmp1*ftmp1/ftmp2);
	}
	else {
	    return (float)0.0f;
	}
    }

    /*----------------------------------------------------------------*
     * interface for enhancer
     *---------------------------------------------------------------*/

    int enhancerInterface(
			  float out[],                     /* (o) enhanced signal */
			  float in[])                      /* (i) unenhanced signal */
    {
	//	float *enh_buf, *enh_period; (definis en global pour la classe)
	int iblock, isample;
	int lag=0, ilag, i, ioffset;
	float cc, maxcc;
	float ftmp1, ftmp2;
	//	float *inPtr, *enh_bufPtr1, *enh_bufPtr2;
	int inPtr, enh_bufPtr1, enh_bufPtr2;
	float [] plc_pred = new float[ilbc_constants.ENH_BLOCKL];

	float [] lpState = new float[6];
	float [] downsampled = new float[(ilbc_constants.ENH_NBLOCKS*ilbc_constants.ENH_BLOCKL+120)/2];
	int inLen=ilbc_constants.ENH_NBLOCKS*ilbc_constants.ENH_BLOCKL+120;
	int start, plc_blockl, inlag;

	//	enh_buf=iLBCdec_inst->enh_buf;
	//	enh_period=iLBCdec_inst->enh_period;

	System.arraycopy(enh_buf, this.ULP_inst.blockl,
			 enh_buf, 0,
			 ilbc_constants.ENH_BUFL-this.ULP_inst.blockl);
// 	memmove(enh_buf, &enh_buf[iLBCdec_inst->blockl],
// 		(ENH_BUFL-iLBCdec_inst->blockl)*sizeof(float));


	System.arraycopy(in, 0, enh_buf, ilbc_constants.ENH_BUFL-this.ULP_inst.blockl,
			 this.ULP_inst.blockl);
// 	memcpy(&enh_buf[ENH_BUFL-this.ULP_inst.blockl], in,
// 	       this.ULP_inst.blockl*sizeof(float));

	if (this.ULP_inst.mode==30)
	    plc_blockl=ilbc_constants.ENH_BLOCKL;
	else
	    plc_blockl=40;

	/* when 20 ms frame, move processing one block */
	ioffset=0;
	if (this.ULP_inst.mode==20) ioffset=1;

	i=3-ioffset;
	System.arraycopy(enh_period, i, enh_period, 0, ilbc_constants.ENH_NBLOCKS_TOT-i);
// 	memmove(enh_period, &enh_period[i],
// 		(ENH_NBLOCKS_TOT-i)*sizeof(float));

	/* Set state information to the 6 samples right before
	   the samples to be downsampled. */

	System.arraycopy(enh_buf, (ilbc_constants.ENH_NBLOCKS_EXTRA+ioffset)*ilbc_constants.ENH_BLOCKL-126,
			 lpState, 0, 6);
// 	memcpy(lpState,
// 	       enh_buf+(ENH_NBLOCKS_EXTRA+ioffset)*ENH_BLOCKL-126,
// 	       6*sizeof(float));

	/* Down sample a factor 2 to save computations */

	DownSample(enh_buf,
		   (ilbc_constants.ENH_NBLOCKS_EXTRA+ioffset)*ilbc_constants.ENH_BLOCKL-120,
                   ilbc_constants.lpFilt_coefsTbl, inLen-ioffset*ilbc_constants.ENH_BLOCKL,
                   lpState, downsampled);

	/* Estimate the pitch in the down sampled domain. */
	for (iblock = 0; iblock<ilbc_constants.ENH_NBLOCKS-ioffset; iblock++) {

	    lag = 10;
	    maxcc = xCorrCoef(downsampled, 60+iblock * ilbc_constants.ENH_BLOCKL_HALF,
			      downsampled, 60+iblock * ilbc_constants.ENH_BLOCKL_HALF - lag,
			      ilbc_constants.ENH_BLOCKL_HALF);
	    for (ilag=11; ilag<60; ilag++) {
		cc = xCorrCoef(downsampled, 60+iblock* ilbc_constants.ENH_BLOCKL_HALF,
			       downsampled, 60+iblock* ilbc_constants.ENH_BLOCKL_HALF - ilag,
			       ilbc_constants.ENH_BLOCKL_HALF);

		if (cc > maxcc) {
		    maxcc = cc;
		    lag = ilag;
		}
	    }

	    /* Store the estimated lag in the non-downsampled domain */
	    enh_period[iblock+ilbc_constants.ENH_NBLOCKS_EXTRA+ioffset] = (float)lag*2;


	}


	/* PLC was performed on the previous packet */
	if (this.prev_enh_pl==1) {

	    inlag=(int)enh_period[ilbc_constants.ENH_NBLOCKS_EXTRA+ioffset];

	    lag = inlag-1;
	    maxcc = xCorrCoef(in, 0, in, lag, plc_blockl);
	    for (ilag=inlag; ilag<=inlag+1; ilag++) {
		cc = xCorrCoef(in, 0, in, ilag, plc_blockl);
		if (cc > maxcc) {
		    maxcc = cc;
		    lag = ilag;
		}
	    }

	    enh_period[ilbc_constants.ENH_NBLOCKS_EXTRA+ioffset-1]=(float)lag;

	    /* compute new concealed residual for the old lookahead,
	       mix the forward PLC with a backward PLC from
	       the new frame */

	    //	    inPtr=&in[lag-1];
	    inPtr = lag - 1;

	    //	    enh_bufPtr1=&plc_pred[plc_blockl-1];
	    enh_bufPtr1 = plc_blockl - 1;

	    if (lag>plc_blockl) {
		start=plc_blockl;
	    } else {
		start=lag;
	    }

	    for (isample = start; isample>0; isample--) {
		//		*enh_bufPtr1-- = *inPtr--;
		plc_pred[enh_bufPtr1] = in[inPtr];
		enh_bufPtr1--;
		inPtr--;
	    }

	    //	    enh_bufPtr2=&enh_buf[ENH_BUFL-1-this.ULP_inst.blockl];
	    enh_bufPtr2 = ilbc_constants.ENH_BUFL - 1 - this.ULP_inst.blockl;
	    for (isample = (plc_blockl-1-lag); isample>=0; isample--) {
		//		*enh_bufPtr1-- = *enh_bufPtr2--;
		plc_pred[enh_bufPtr1] = enh_buf[enh_bufPtr2];
		enh_bufPtr1--;
		enh_bufPtr2--;
	    }

	    /* limit energy change */
	    ftmp2=0.0f;
	    ftmp1=0.0f;
	    for (i=0;i<plc_blockl;i++) {
		ftmp2+=enh_buf[ilbc_constants.ENH_BUFL-1-this.ULP_inst.blockl-i]*
		    enh_buf[ilbc_constants.ENH_BUFL-1-this.ULP_inst.blockl-i];
		ftmp1+=plc_pred[i]*plc_pred[i];
	    }
	    ftmp1=(float)(float)Math.sqrt(ftmp1/(float)plc_blockl);
	    ftmp2=(float)(float)Math.sqrt(ftmp2/(float)plc_blockl);
	    if (ftmp1>(float)2.0f*ftmp2 && ftmp1>0.0) {
		for (i=0;i<plc_blockl-10;i++) {
		    plc_pred[i]*=(float)2.0f*ftmp2/ftmp1;
		}
		for (i=plc_blockl-10;i<plc_blockl;i++) {
		    plc_pred[i]*=(float)(i-plc_blockl+10)*
			((float)1.0f-(float)2.0*ftmp2/ftmp1)/(float)(10)+
			(float)2.0f*ftmp2/ftmp1;
		}
	    }

	    enh_bufPtr1=ilbc_constants.ENH_BUFL-1-this.ULP_inst.blockl;
// 	    enh_bufPtr1=&enh_buf[ilbc_constants.ENH_BUFL-1-this.ULP_inst.blockl];
	    for (i=0; i<plc_blockl; i++) {
		ftmp1 = (float) (i+1) / (float) (plc_blockl+1);
		enh_buf[enh_bufPtr1] *= ftmp1;
// 		*enh_bufPtr1 *= ftmp1;
		enh_buf[enh_bufPtr1] += ((float)1.0f-ftmp1)*
		    plc_pred[plc_blockl-1-i];
// 		*enh_bufPtr1 += ((float)1.0f-ftmp1)*
// 		    plc_pred[plc_blockl-1-i];
		enh_bufPtr1--;
	    }
	}

	if (this.ULP_inst.mode==20) {
	    /* Enhancer with 40 samples delay */
	    for (iblock = 0; iblock<2; iblock++) {
		enhancer(out, iblock*ilbc_constants.ENH_BLOCKL, enh_buf,
			 ilbc_constants.ENH_BUFL, (5+iblock)*ilbc_constants.ENH_BLOCKL+40,
			 ilbc_constants.ENH_ALPHA0, enh_period, ilbc_constants.enh_plocsTbl,
			 ilbc_constants.ENH_NBLOCKS_TOT);
	    }
	} else if (this.ULP_inst.mode==30) {
	    /* Enhancer with 80 samples delay */
	    for (iblock = 0; iblock<3; iblock++) {
		enhancer(out, iblock*ilbc_constants.ENH_BLOCKL, enh_buf,
			 ilbc_constants.ENH_BUFL, (4+iblock)*ilbc_constants.ENH_BLOCKL,
			 ilbc_constants.ENH_ALPHA0, enh_period, ilbc_constants.enh_plocsTbl,
			 ilbc_constants.ENH_NBLOCKS_TOT);
	    }
	}

	return (lag*2);
    }

    /*----------------------------------------------------------------*
     *  Packet loss concealment routine. Conceals a residual signal
     *  and LP parameters. If no packet loss, update state.
     *---------------------------------------------------------------*/

    /*----------------------------------------------------------------*
     *  Compute cross correlation and pitch gain for pitch prediction
     *  of last subframe at given lag.
     *---------------------------------------------------------------*/

    public void compCorr(
			 float cc[],      /* (o) cross correlation coefficient */
			 float gc[],      /* (o) gain */
			 float pm[],
			 float buffer[],  /* (i) signal buffer */
			 int lag,    /* (i) pitch lag */
			 int bLen,       /* (i) length of buffer */
			 int sRange)      /* (i) correlation search length */
    {
	int i;
	float ftmp1, ftmp2, ftmp3;

	/* Guard against getting outside buffer */
	if ((bLen - sRange - lag) < 0) {
	    sRange = bLen - lag;
	}

	ftmp1 = 0.0f;
	ftmp2 = 0.0f;
	ftmp3 = 0.0f;

	for (i=0; i<sRange; i++) {
	    ftmp1 += buffer[bLen-sRange+i] *
		buffer[bLen-sRange+i-lag];
	    ftmp2 += buffer[bLen-sRange+i-lag] *
		buffer[bLen-sRange+i-lag];
	    ftmp3 += buffer[bLen-sRange+i] *
		buffer[bLen-sRange+i];
	}

	if (ftmp2 > 0.0f) {
	    cc[0] = ftmp1*ftmp1/ftmp2;
	    gc[0] = (float)(float)Math.abs(ftmp1 / ftmp2);
	    pm[0] = (float)(float)Math.abs(ftmp1) /
		((float)(float)Math.sqrt(ftmp2)*(float)Math.sqrt(ftmp3));
	}
	else {
	    cc[0] = 0.0f;
	    gc[0] = 0.0f;
	    pm[0] = 0.0f;
	}
    }

    public void doThePLC(
			 float PLCresidual[], /* (o) concealed residual */
			 float PLClpc[],      /* (o) concealed LP parameters */
			 int PLI,        /* (i) packet loss indicator
					    0 - no PL, 1 = PL */
			 float decresidual[], /* (i) decoded residual */
			 float lpc[],         /* (i) decoded LPC (only used for no PL) */
			 int lpc_idx,
			 int inlag)          /* (i) pitch lag */
    {
	int lag = 20, randlag = 0;
	float gain = 0.0f, maxcc = 0.0f;
	float use_gain = 0.0f;
	float gain_comp = 0.0f, maxcc_comp = 0.0f, per = 0.0f, max_per = 0.0f;
	int i, pick, use_lag;
	float ftmp, randvec[], pitchfact, energy;
	float [] a_gain, a_comp, a_per;

	randvec = new float [ilbc_constants.BLOCKL_MAX];

	a_gain = new float[1];
	a_comp = new float[1];
	a_per = new float[1];

	/* Packet Loss */

	if (PLI == 1) {

	    this.consPLICount += 1;

	    /* if previous frame not lost,
	       determine pitch pred. gain */

	    if (this.prevPLI != 1) {

		/* Search around the previous lag to find the
		   best pitch period */

		lag=inlag-3;

		a_comp[0] = maxcc;
		a_gain[0] = gain;
		a_per[0] = max_per;
		compCorr(a_comp, a_gain, a_per,
			 this.prevResidual,
			 lag, this.ULP_inst.blockl, 60);
		maxcc = a_comp[0];
		gain = a_gain[0];
		max_per = a_per[0];

		for (i=inlag-2;i<=inlag+3;i++) {

		    a_comp[0] = maxcc_comp;
		    a_gain[0] = gain_comp;
		    a_per[0] = per;
		    compCorr(a_comp, a_gain, a_per,
			     this.prevResidual,
			     i, this.ULP_inst.blockl, 60);
		    maxcc_comp = a_comp[0];
		    gain_comp = a_gain[0];
		    per = a_per[0];

		    if (maxcc_comp>maxcc) {
			maxcc=maxcc_comp;
			gain=gain_comp;
			lag=i;
			max_per=per;
		    }
		}
	    }

	    /* previous frame lost, use recorded lag and periodicity */

	    else {
		lag=this.prevLag;
		max_per=this.per;
	    }

	    /* downscaling */

	    use_gain=1.0f;
	    if (this.consPLICount*this.ULP_inst.blockl>320)
		use_gain=(float)0.9;
	    else if (this.consPLICount*this.ULP_inst.blockl>2*320)
		use_gain=(float)0.7;
	    else if (this.consPLICount*this.ULP_inst.blockl>3*320)
		use_gain=(float)0.5;
	    else if (this.consPLICount*this.ULP_inst.blockl>4*320)
		use_gain=(float)0.0f;

	    /* mix noise and pitch repeatition */
	    ftmp=(float)(float)Math.sqrt(max_per);
	    if (ftmp>(float)0.7)
		pitchfact=(float)1.0f;
	    else if (ftmp>(float)0.4)
		pitchfact=(ftmp-(float)0.4)/((float)0.7-(float)0.4);
	    else
		pitchfact=0.0f;


	    /* avoid repetition of same pitch cycle */
	    use_lag=lag;
	    if (lag<80) {
		use_lag=2*lag;
	    }

	    /* compute concealed residual */
	    energy = 0.0f;
	    for (i=0; i<this.ULP_inst.blockl; i++) {

		/* noise component */

		this.seed = (this.seed * 69069 + 1) & (0x80000000 - 1);
		randlag = 50 + (int) (this.seed % 70);
		pick = i - randlag;

		if (pick < 0) {
		    randvec[i] = this.prevResidual[this.ULP_inst.blockl+pick];
		} else {
		    randvec[i] =  randvec[pick];
		}

		/* pitch repeatition component */
		pick = i - use_lag;

		if (pick < 0) {
		    PLCresidual[i] = this.prevResidual[this.ULP_inst.blockl+pick];
		} else {
		    PLCresidual[i] = PLCresidual[pick];
		}

		/* mix random and periodicity component */

		if (i<80)
		    PLCresidual[i] = use_gain*(pitchfact *
					       PLCresidual[i] +
					       ((float)1.0f - pitchfact) * randvec[i]);
		else if (i<160)
		    PLCresidual[i] = (float)0.95*use_gain*(pitchfact *
							    PLCresidual[i] +
							    ((float)1.0f - pitchfact) * randvec[i]);
		else
		    PLCresidual[i] = (float)0.9*use_gain*(pitchfact *
							   PLCresidual[i] +
							   ((float)1.0f - pitchfact) * randvec[i]);

		energy += PLCresidual[i] * PLCresidual[i];
	    }

	    /* less than 30 dB, use only noise */

	    if ((float)Math.sqrt(energy/(float)this.ULP_inst.blockl) < 30.0f) {
		gain=0.0f;
		for (i=0; i<this.ULP_inst.blockl; i++) {
		    PLCresidual[i] = randvec[i];
		}
	    }

	    /* use old LPC */

	    //	    memcpy(PLClpc,this.prevLpc, (LPC_FILTERORDER+1)*sizeof(float));
	    System.arraycopy(this.prevLpc, 0, PLClpc, 0, ilbc_constants.LPC_FILTERORDER + 1);

	}

	/* no packet loss, copy input */

	else {
	    //	    memcpy(PLCresidual, decresidual,this.ULP_inst.blockl*sizeof(float));
	    System.arraycopy(decresidual, 0, PLCresidual, 0, this.ULP_inst.blockl);
	    //	    memcpy(PLClpc, lpc, (LPC_FILTERORDER+1)*sizeof(float));
	    System.arraycopy(lpc, lpc_idx, PLClpc, 0, ilbc_constants.LPC_FILTERORDER + 1);
	    this.consPLICount = 0;
	}

	/* update state */

	if (PLI != 0) {
	    this.prevLag = lag;
	    this.per=max_per;
	}

	this.prevPLI = PLI;
	//	memcpy(this.prevLpc, PLClpc, (LPC_FILTERORDER+1)*sizeof(float));
	System.arraycopy(PLClpc, 0, this.prevLpc, 0, ilbc_constants.LPC_FILTERORDER + 1);
	//	memcpy(this.prevResidual, PLCresidual, this.ULP_inst.blockl*sizeof(float));
	System.arraycopy(PLCresidual, 0, this.prevResidual, 0, this.ULP_inst.blockl);
    }

//     public int decode(short decoded_data[], short encoded_data[], int mode)
//     {
// 	return this.ULP_inst.blockl;
//     }

    public short decode(       /* (o) Number of decoded samples */
       short decoded_data[],        /* (o) Decoded signal block*/
       short encoded_data[],        /* (i) Encoded bytes */
       short mode)                       /* (i) 0=PL, 1=Normal */
    {
       int k;
       float decblock [] = new float[ilbc_constants.BLOCKL_MAX];
       float dtmp;
       //       char en_data[] = new char [this.ULP_inst.no_of_bytes];
       bitstream en_data = new bitstream(this.ULP_inst.no_of_bytes);

       /* check if mode is valid */

       if ( (mode < 0) || (mode > 1)) {
           System.out.println("\nERROR - Wrong mode - 0, 1 allowed\n");
       }

       /* do actual decoding of block */
       for (k = 0; k < encoded_data.length; k++) {
	   en_data.buffer[2*k+1] = (char) (encoded_data[k] & 0xff);
	   en_data.buffer[2*k] = (char) ((encoded_data[k] >> 8) & 0xff);
// 	   System.out.println("on decode " + (en_data.buffer[2*k]+0) + " et " + (en_data.buffer[2*k+1]+0));
       }

       iLBC_decode(decblock, en_data, mode);

       /* convert to short */
       for (k = 0; k < this.ULP_inst.blockl; k++) {
           dtmp=decblock[k];
// 	   System.out.println("on a eu : " + dtmp);

           if (dtmp < ilbc_constants.MIN_SAMPLE)
               dtmp = ilbc_constants.MIN_SAMPLE;
           else if (dtmp > ilbc_constants.MAX_SAMPLE)
               dtmp = ilbc_constants.MAX_SAMPLE;
           decoded_data[k] = (short) dtmp;
       }

       return ((short) this.ULP_inst.blockl);
   }

   /*----------------------------------------------------------------*
    *  frame residual decoder function (subrutine to iLBC_decode)
    *---------------------------------------------------------------*/

    public void Decode(
       float decresidual[],             /* (o) decoded residual frame */
       int start,                      /* (i) location of start
                                              state */
       int idxForMax,                  /* (i) codebook index for the
                                              maximum value */
       int idxVec[],                /* (i) codebook indexes for the
                                              samples  in the start
                                              state */
       float syntdenum[],               /* (i) the decoded synthesis
                                              filter coefficients */
       int cb_index[],                  /* (i) the indexes for the
                                              adaptive codebook */
       int gain_index[],            /* (i) the indexes for the
                                              corresponding gains */
       int extra_cb_index[],        /* (i) the indexes for the
                                              adaptive codebook part
                                              of start state */
       int extra_gain_index[],          /* (i) the indexes for the
                                              corresponding gains */
       int state_first)                 /* (i) 1 if non adaptive part
                                              of start state comes
                                              first 0 if that part
                                              comes last */
    {
	float [] reverseDecresidual = new float[ilbc_constants.BLOCKL_MAX];
	float [] mem = new float[ilbc_constants.CB_MEML];
	int k, meml_gotten, Nfor, Nback, i;
	int diff, start_pos;
	int subcount, subframe;

	diff = ilbc_constants.STATE_LEN - this.ULP_inst.state_short_len;

	if (state_first == 1) {
	    start_pos = (start-1) * ilbc_constants.SUBL;
	} else {
	    start_pos = (start-1) * ilbc_constants.SUBL + diff;
	}

	/* decode scalar part of start state */

	ilbc_common.StateConstructW(idxForMax, idxVec,
			syntdenum, (start-1)*(ilbc_constants.LPC_FILTERORDER+1),
			decresidual, start_pos, this.ULP_inst.state_short_len);


	if (state_first != 0) { /* put adaptive part in the end */

	    /* setup memory */

	    for (int li = 0; li < (ilbc_constants.CB_MEML-this.ULP_inst.state_short_len); li++)
		mem[li] = 0.0f;
// 	    memset(mem, 0,
// 		   (CB_MEML-this.ULP_inst.state_short_len)*sizeof(float));
	    System.arraycopy(decresidual, start_pos,
			     mem, ilbc_constants.CB_MEML - this.ULP_inst.state_short_len,
			     this.ULP_inst.state_short_len);
// 	    memcpy(mem+CB_MEML-this.ULP_inst.state_short_len,
// 		   decresidual+start_pos,
// 		   this.ULP_inst.state_short_len*sizeof(float));

	    /* construct decoded vector */

	    ilbc_common.iCBConstruct(decresidual, start_pos+this.ULP_inst.state_short_len,
				     extra_cb_index, 0, extra_gain_index, 0,
				     mem, ilbc_constants.CB_MEML - ilbc_constants.stMemLTbl,
				     ilbc_constants.stMemLTbl, diff, ilbc_constants.CB_NSTAGES);

	}
	else {/* put adaptive part in the beginning */

	    /* create reversed vectors for prediction */

	    for (k=0; k<diff; k++) {
		reverseDecresidual[k] = decresidual[(start+1)*ilbc_constants.SUBL - 1 -
						    (k+this.ULP_inst.state_short_len)];
	    }

	    /* setup memory */

	    meml_gotten = this.ULP_inst.state_short_len;
	    for (k=0; k<meml_gotten; k++){
		mem[ilbc_constants.CB_MEML-1-k] = decresidual[start_pos + k];
	    }
	    for (int li = 0; li < ilbc_constants.CB_MEML - k; li++)
		mem[li] = 0.0f;
	    //	    memset(mem, 0, (CB_MEML-k)*sizeof(float));

	    /* construct decoded vector */

	    ilbc_common.iCBConstruct(reverseDecresidual, 0, extra_cb_index, 0,
				     extra_gain_index, 0,
				     mem, ilbc_constants.CB_MEML - ilbc_constants.stMemLTbl,
				     ilbc_constants.stMemLTbl, diff, ilbc_constants.CB_NSTAGES);

	    /* get decoded residual from reversed vector */

	    for (k=0; k<diff; k++) {
		decresidual[start_pos-1-k] = reverseDecresidual[k];
	    }
	}

	/* counter for predicted sub-frames */

	subcount=0;

	/* forward prediction of sub-frames */

	Nfor = this.ULP_inst.nsub-start-1;

	if ( Nfor > 0 ){

	    /* setup memory */

	    for (int li = 0; li < ilbc_constants.CB_MEML - ilbc_constants.STATE_LEN; li++)
		mem[li] = 0.0f;
	    //	    memset(mem, 0, (CB_MEML-STATE_LEN)*sizeof(float));
	    System.arraycopy(decresidual, (start - 1) * ilbc_constants.SUBL,
			     mem, ilbc_constants.CB_MEML - ilbc_constants.STATE_LEN,
			     ilbc_constants.STATE_LEN);
	    //	    memcpy(mem+CB_MEML-STATE_LEN, decresidual+(start-1)*SUBL,
	    // 		   STATE_LEN*sizeof(float));

	    /* loop over sub-frames to encode */

	    for (subframe=0; subframe<Nfor; subframe++) {

		/* construct decoded vector */

		ilbc_common.iCBConstruct(decresidual, (start+1+subframe)*ilbc_constants.SUBL,
					 cb_index, subcount*ilbc_constants.CB_NSTAGES,
					 gain_index, subcount*ilbc_constants.CB_NSTAGES,
					 mem, ilbc_constants.CB_MEML-ilbc_constants.memLfTbl[subcount],
					 ilbc_constants.memLfTbl[subcount], ilbc_constants.SUBL,
					 ilbc_constants.CB_NSTAGES);

		/* update memory */

		System.arraycopy(mem, ilbc_constants.SUBL,
				 mem, 0,
				 ilbc_constants.CB_MEML - ilbc_constants.SUBL);
		//		memcpy(mem, mem+SUBL, (CB_MEML-SUBL)*sizeof(float));
		System.arraycopy(decresidual, (start + 1 + subframe) * ilbc_constants.SUBL,
				 mem, ilbc_constants.CB_MEML - ilbc_constants.SUBL,
				 ilbc_constants.SUBL);
		// 		memcpy(mem+CB_MEML-SUBL,
		// 		       &decresidual[(start+1+subframe)*SUBL],
		// 		       SUBL*sizeof(float));

		subcount++;

	    }

	}

	/* backward prediction of sub-frames */

	Nback = start-1;

	if ( Nback > 0 ) {

	    /* setup memory */

	    meml_gotten = ilbc_constants.SUBL*(this.ULP_inst.nsub+1-start);

	    if ( meml_gotten > ilbc_constants.CB_MEML ) {
		meml_gotten = ilbc_constants.CB_MEML;
	    }
	    for (k=0; k<meml_gotten; k++) {
		mem[ilbc_constants.CB_MEML-1-k] = decresidual[(start-1)*ilbc_constants.SUBL + k];
	    }
	    for (int li = 0; li < (ilbc_constants.CB_MEML - k); li++)
		mem[li] = 0.0f;
// 	    memset(mem, 0, (ilbc_constants.CB_MEML-k)*sizeof(float));

	    /* loop over subframes to decode */

	    for (subframe=0; subframe<Nback; subframe++) {

		/* construct decoded vector */

		ilbc_common.iCBConstruct(reverseDecresidual, subframe * ilbc_constants.SUBL,
					 cb_index, subcount * ilbc_constants.CB_NSTAGES,
					 gain_index, subcount * ilbc_constants.CB_NSTAGES,
					 mem, ilbc_constants.CB_MEML - ilbc_constants.memLfTbl[subcount],
					 ilbc_constants.memLfTbl[subcount], ilbc_constants.SUBL,
					 ilbc_constants.CB_NSTAGES);

		/* update memory */

		System.arraycopy(mem, ilbc_constants.SUBL,
				 mem, 0,
				 ilbc_constants.CB_MEML - ilbc_constants.SUBL);
// 		memcpy(mem, mem+SUBL, (CB_MEML-SUBL)*sizeof(float));
		System.arraycopy(reverseDecresidual, subframe * ilbc_constants.SUBL,
				 mem, ilbc_constants.CB_MEML - ilbc_constants.SUBL,
				 ilbc_constants.SUBL);
// 		memcpy(mem+CB_MEML-SUBL,
// 		       &reverseDecresidual[subframe*SUBL],
// 		       SUBL*sizeof(float));

		subcount++;
	    }

	    /* get decoded residual from reversed vector */

	    for (i=0; i < ilbc_constants.SUBL*Nback; i++)
		decresidual[ilbc_constants.SUBL*Nback - i - 1] =
		    reverseDecresidual[i];
	}
    }


    /*----------------------------------------------------------------*
     *  main decoder function
     *---------------------------------------------------------------*/

    public void iLBC_decode(
		     float decblock[],            /* (o) decoded signal block */
		     bitstream bytes,           /* (i) encoded signal bits */
		     int mode )                   /* (i) 0: bad packet, PLC,
						    1: normal */
    {
	float [] data = new float[ilbc_constants.BLOCKL_MAX];
	float [] lsfdeq = new float[ilbc_constants.LPC_FILTERORDER * ilbc_constants.LPC_N_MAX];
	float [] PLCresidual = new float[ilbc_constants.BLOCKL_MAX];
	float [] PLClpc = new float[ilbc_constants.LPC_FILTERORDER + 1];
	float [] zeros = new float[ilbc_constants.BLOCKL_MAX];
	float [] one = new float[ilbc_constants.LPC_FILTERORDER + 1];
	int k, i, start, idxForMax, pos, lastpart, ulp;
	int lag, ilag;
	float cc, maxcc;
	int [] idxVec = new int[ilbc_constants.STATE_LEN];
	int check;
	int [] gain_index = new int[ilbc_constants.NASUB_MAX * ilbc_constants.CB_NSTAGES];
	int [] extra_gain_index = new int[ilbc_constants.CB_NSTAGES];
	int [] cb_index = new int[ilbc_constants.CB_NSTAGES * ilbc_constants.NASUB_MAX];
	int [] extra_cb_index = new int[ilbc_constants.CB_NSTAGES];
	int [] lsf_i = new int[ilbc_constants.LSF_NSPLIT * ilbc_constants.LPC_N_MAX];
	int state_first;
	int last_bit;
	//	unsigned char *pbytes;
	float [] weightdenum = new float[(ilbc_constants.LPC_FILTERORDER + 1) *
					   ilbc_constants.NSUB_MAX];
	int order_plus_one;
	float [] syntdenum = new float[ilbc_constants.NSUB_MAX * (ilbc_constants.LPC_FILTERORDER + 1)];
	float [] decresidual = new float[ilbc_constants.BLOCKL_MAX];

	if (mode > 0) { /* the data are good */

	    /* decode data */

	    //	    pbytes=bytes;
	    pos=0;

	    /* Set everything to zero before decoding */

	    for (k=0; k<ilbc_constants.LSF_NSPLIT * ilbc_constants.LPC_N_MAX; k++) {
		lsf_i[k]=0;
	    }
	    start = 0;
	    state_first = 0;
	    idxForMax = 0;
	    for (k = 0; k < this.ULP_inst.state_short_len; k++) {
		idxVec[k]=0;
	    }
	    for (k=0; k<ilbc_constants.CB_NSTAGES; k++) {
		extra_cb_index[k]=0;
	    }
	    for (k=0; k<ilbc_constants.CB_NSTAGES; k++) {
		extra_gain_index[k]=0;
	    }
	    for (i=0; i<this.ULP_inst.nasub; i++) {
		for (k=0; k<ilbc_constants.CB_NSTAGES; k++) {
		    cb_index[i*ilbc_constants.CB_NSTAGES+k]=0;
		}
	    }
	    for (i=0; i<this.ULP_inst.nasub; i++) {
		for (k=0; k<ilbc_constants.CB_NSTAGES; k++) {
		    gain_index[i*ilbc_constants.CB_NSTAGES+k]=0;
		}
	    }

	    /* loop over ULP classes */

	    for (ulp=0; ulp<3; ulp++) {

		/* LSF */
		for (k=0; k<ilbc_constants.LSF_NSPLIT*this.ULP_inst.lpc_n; k++){
		    lastpart = bytes.unpack(this.ULP_inst.lsf_bits[k][ulp]);
// 		    unpack( &pbytes, &lastpart,
// 			    this.ULP_inst.lsf_bits[k][ulp], &pos);
		    lsf_i[k] = bytes.packcombine(lsf_i[k], lastpart,
						 this.ULP_inst.lsf_bits[k][ulp]);
		    //		    System.out.println("lsf_i["+k+"] = " + lsf_i[k]);
// 		    packcombine(&lsf_i[k], lastpart,
// 				this.ULP_inst.lsf_bits[k][ulp]);
		}

		/* Start block info */

		lastpart = bytes.unpack(this.ULP_inst.start_bits[ulp]);
// 		unpack( &pbytes, &lastpart,
// 			this.ULP_inst.start_bits[ulp], &pos);
		start = bytes.packcombine(start, lastpart,
				    this.ULP_inst.start_bits[ulp]);
		//		System.out.println("start = " + start);
// 		packcombine(&start, lastpart,
// 			    this.ULP_inst.start_bits[ulp]);

		lastpart = bytes.unpack(this.ULP_inst.startfirst_bits[ulp]);
// 		unpack( &pbytes, &lastpart,
// 			this.ULP_inst.startfirst_bits[ulp], &pos);
		state_first = bytes.packcombine(state_first, lastpart,
						this.ULP_inst.startfirst_bits[ulp]);
		//		System.out.println("state_first = " + state_first);
// 		packcombine(&state_first, lastpart,
// 			    this.ULP_inst.startfirst_bits[ulp]);

		lastpart = bytes.unpack(this.ULP_inst.scale_bits[ulp]);
// 		unpack( &pbytes, &lastpart,
// 			this.ULP_inst.scale_bits[ulp], &pos);
		idxForMax = bytes.packcombine(idxForMax, lastpart,
					      this.ULP_inst.scale_bits[ulp]);
		//		System.out.println("idxForMax = " + idxForMax);
// 		packcombine(&idxForMax, lastpart,
// 			    this.ULP_inst.scale_bits[ulp]);

		for (k=0; k<this.ULP_inst.state_short_len; k++) {
		    lastpart = bytes.unpack(this.ULP_inst.state_bits[ulp]);
// 		    unpack( &pbytes, &lastpart,
// 			    this.ULP_inst.state_bits[ulp], &pos);
		    idxVec[k] = bytes.packcombine(idxVec[k], lastpart,
						  this.ULP_inst.state_bits[ulp]);
		    //		    System.out.println("idxVec["+k+"] = " + idxVec[k]);
// 		    packcombine(idxVec+k, lastpart,
// 				this.ULP_inst.state_bits[ulp]);
		}

		/* 23/22 (20ms/30ms) sample block */

		for (k=0; k<ilbc_constants.CB_NSTAGES; k++) {
		    lastpart = bytes.unpack(this.ULP_inst.extra_cb_index[k][ulp]);
// 		    unpack( &pbytes, &lastpart,
// 			    this.ULP_inst.extra_cb_index[k][ulp],
// 			    &pos);
		    extra_cb_index[k] = bytes.packcombine(extra_cb_index[k], lastpart,
							  this.ULP_inst.extra_cb_index[k][ulp]);
		    //		    System.out.println("extra_cb_index["+k+"] = " + extra_cb_index[k]);
// 		    packcombine(extra_cb_index+k, lastpart,
// 				this.ULP_inst.extra_cb_index[k][ulp]);
		}
		for (k=0; k<ilbc_constants.CB_NSTAGES; k++) {
		    lastpart = bytes.unpack(this.ULP_inst.extra_cb_gain[k][ulp]);
// 		    unpack( &pbytes, &lastpart,
// 			    this.ULP_inst.extra_cb_gain[k][ulp],
// 			    &pos);
		    extra_gain_index[k] = bytes.packcombine(extra_gain_index[k], lastpart,
							    this.ULP_inst.extra_cb_gain[k][ulp]);
		    //		    System.out.println("extra_gain_index["+k+"] = " + extra_gain_index[k]);
// 		    packcombine(extra_gain_index+k, lastpart,
// 				this.ULP_inst.extra_cb_gain[k][ulp]);
		}

		/* The two/four (20ms/30ms) 40 sample sub-blocks */

		for (i=0; i<this.ULP_inst.nasub; i++) {
		    for (k=0; k<ilbc_constants.CB_NSTAGES; k++) {
			lastpart = bytes.unpack(this.ULP_inst.cb_index[i][k][ulp]);
// 			unpack( &pbytes, &lastpart,
// 				this.ULP_inst.cb_index[i][k][ulp],
// 				&pos);
			cb_index[i * ilbc_constants.CB_NSTAGES + k] =
			    bytes.packcombine(cb_index[i*ilbc_constants.CB_NSTAGES+k], lastpart,
					      this.ULP_inst.cb_index[i][k][ulp]);
			//			System.out.println("cb_index["+(i*ilbc_constants.CB_NSTAGES+k)+"] = " + cb_index[(i*ilbc_constants.CB_NSTAGES+k)]);
// 			packcombine(cb_index+i*CB_NSTAGES+k, lastpart,
// 				    this.ULP_inst.cb_index[i][k][ulp]);
		    }
		}

		for (i=0; i<this.ULP_inst.nasub; i++) {
		    for (k=0; k<ilbc_constants.CB_NSTAGES; k++) {
			lastpart = bytes.unpack(this.ULP_inst.cb_gain[i][k][ulp]);
			gain_index[i * ilbc_constants.CB_NSTAGES+k] =
			    bytes.packcombine(gain_index[i*ilbc_constants.CB_NSTAGES+k], lastpart,
					      this.ULP_inst.cb_gain[i][k][ulp]);
			//			System.out.println("gain_index["+(i*ilbc_constants.CB_NSTAGES+k)+"] = " + gain_index[(i*ilbc_constants.CB_NSTAGES+k)]);
		    }
		}
	    }
	    /* Extract last bit. If it is 1 this indicates an
	       empty/lost frame */
	    last_bit = bytes.unpack(1);
	    //	    System.out.println("last_bit = "  + last_bit);

	    /* Check for bit errors or empty/lost frames */
	    if (start < 1)
		mode = 0;
	    if (this.ULP_inst.mode==20 && start>3)
		mode = 0;
	    if (this.ULP_inst.mode==30 && start>5)
		mode = 0;
	    if (last_bit==1)
		mode = 0;

	    if (mode==1) { /* No bit errors was detected,
			      continue decoding */

		/* adjust index */
		index_conv_dec(cb_index);

// 		for (int li = 0; li < cb_index.length; li++)
// 		    System.out.println("cb_index["+li+"] = " + cb_index[li]);

		/* decode the lsf */

		SimplelsfDEQ(lsfdeq, lsf_i, this.ULP_inst.lpc_n);
// 		for (int li = 0; li < lsfdeq.length; li++)
// 		    System.out.println("lsfdeq["+li+"] = " + lsfdeq[li]);
		check=ilbc_common.LSF_check(lsfdeq, ilbc_constants.LPC_FILTERORDER,
				this.ULP_inst.lpc_n);
// 		System.out.println("check returns " + check);
		DecoderInterpolateLSF(syntdenum, weightdenum,
				      lsfdeq, ilbc_constants.LPC_FILTERORDER);
// 		for (int li = 0; li < syntdenum.length; li++)
// 		    System.out.println("syntdenum[" + li + "] = " + syntdenum[li]);
// 		for (int li = 0; li < weightdenum.length; li++)
// 		    System.out.println("weightdenum[" + li + "] = " + weightdenum[li]);

		Decode(decresidual, start, idxForMax,
		       idxVec, syntdenum, cb_index, gain_index,
		       extra_cb_index, extra_gain_index,
		       state_first);

// 		for (int li = 0; li < decresidual.length; li++)
// 		    System.out.println("decresidual[" + li + "] = " + decresidual[li]);

		/* preparing the plc for a future loss! */

		doThePLC(PLCresidual, PLClpc, 0, decresidual,
			 syntdenum,
			 (ilbc_constants.LPC_FILTERORDER + 1)*(this.ULP_inst.nsub - 1),
			 last_lag);

		System.arraycopy(PLCresidual, 0, decresidual, 0, this.ULP_inst.blockl);
// 		for (int li = 0; li < decresidual.length; li++)
// 		    System.out.println("decresidual[" + li + "] = " + decresidual[li]);
// 		memcpy(decresidual, PLCresidual,
// 		       this.ULP_inst.blockl*sizeof(float));
	    }

	}

	if (mode == 0) {
	    /* the data is bad (either a PLC call
	     * was made or a severe bit error was detected)
	     */

	    /* packet loss conceal */

	    for (int li = 0; li < ilbc_constants.BLOCKL_MAX; li++)
		zeros[li] = 0.0f;
	    //	    memset(zeros, 0, BLOCKL_MAX*sizeof(float));

	    one[0] = 1;
	    for (int li = 0; li < ilbc_constants.LPC_FILTERORDER; li++)
		one[li+1] = 0.0f;
	    //	    memset(one+1, 0, LPC_FILTERORDER*sizeof(float));

	    start=0;

	    doThePLC(PLCresidual, PLClpc, 1, zeros, one, 0,
		     last_lag);
	    System.arraycopy(PLCresidual, 0, decresidual, 0, this.ULP_inst.blockl);
// 	    memcpy(decresidual, PLCresidual,
// 		   this.ULP_inst.blockl*sizeof(float));

	    order_plus_one = ilbc_constants.LPC_FILTERORDER + 1;
	    for (i = 0; i < this.ULP_inst.nsub; i++) {
		System.arraycopy(PLClpc, 0, syntdenum, (i * order_plus_one), order_plus_one);
// 		memcpy(syntdenum+(i*order_plus_one), PLClpc,
// 		       order_plus_one*sizeof(float));
	    }
	}

	if (this.use_enhancer == 1) {

	    /* post filtering */

	    this.last_lag = enhancerInterface(data, decresidual);

// 	    System.out.println("last_lag : " + this.last_lag);

// 	   for (int li = 0; li < data.length; li++)
// 	     System.out.println("data["+li+"] = " + data[li]);

	    //	    for (li = 0; li <

	    /* synthesis filtering */

	    if (this.ULP_inst.mode == 20) {
		/* Enhancer has 40 samples delay */
		i = 0;
// 		System.out.println("run 1");
		syntFilter(data,i * ilbc_constants.SUBL,
			   this.old_syntdenum,
			   (i+this.ULP_inst.nsub-1)*(ilbc_constants.LPC_FILTERORDER+1),
			   ilbc_constants.SUBL, this.syntMem);
// 		System.out.println("runs 2");
		for (i=1; i < this.ULP_inst.nsub; i++) {
// 		    System.out.println("pass " + i);
		    syntFilter(data, i * ilbc_constants.SUBL,
			       syntdenum, (i-1)*(ilbc_constants.LPC_FILTERORDER+1),
			       ilbc_constants.SUBL, this.syntMem);
// 		    System.out.println("pass " + i + " ends");
		}
// 	   for (int li = 0; li < data.length; li++)
// 	     System.out.println("psdata["+li+"] = " + data[li]);

	    } else if (this.ULP_inst.mode == 30) {
		/* Enhancer has 80 samples delay */
// 		System.out.println("runs 3");
		for (i = 0; i < 2; i++) {
		    syntFilter(data, i * ilbc_constants.SUBL,
			       this.old_syntdenum,
			       (i+this.ULP_inst.nsub-2)*(ilbc_constants.LPC_FILTERORDER+1),
			       ilbc_constants.SUBL, this.syntMem);
		}
		for (i=2; i < this.ULP_inst.nsub; i++) {
// 		    System.out.println("runs 4");
		    syntFilter(data,  i * ilbc_constants.SUBL,
			       syntdenum, (i-2)*(ilbc_constants.LPC_FILTERORDER+1),
			       ilbc_constants.SUBL, this.syntMem);
		}
	    }

	} else {

	    /* Find last lag */
	    lag = 20;
	    maxcc = xCorrCoef(decresidual,
			      ilbc_constants.BLOCKL_MAX - ilbc_constants.ENH_BLOCKL,
			      decresidual,
			      ilbc_constants.BLOCKL_MAX - ilbc_constants.ENH_BLOCKL-lag,
			      ilbc_constants.ENH_BLOCKL);

	    for (ilag = 21; ilag < 120; ilag++) {
		cc = xCorrCoef(decresidual,
			       ilbc_constants.BLOCKL_MAX - ilbc_constants.ENH_BLOCKL,
			       decresidual,
			       ilbc_constants.BLOCKL_MAX - ilbc_constants.ENH_BLOCKL - ilag,
			       ilbc_constants.ENH_BLOCKL);

		if (cc > maxcc) {
		    maxcc = cc;
		    lag = ilag;
		}
	    }
	    this.last_lag = lag;

	    /* copy data and run synthesis filter */

	    System.arraycopy(decresidual, 0, data, 0, this.ULP_inst.blockl);
// 	    memcpy(data, decresidual,
// 		   this.ULP_inst.blockl*sizeof(float));
// 	    System.out.println("runs 5");
	    for (i=0; i < this.ULP_inst.nsub; i++) {
		syntFilter(data, i * ilbc_constants.SUBL,
			   syntdenum, i * (ilbc_constants.LPC_FILTERORDER + 1),
			   ilbc_constants.SUBL, this.syntMem);
	    }

	}

	/* high pass filtering on output if desired, otherwise
	   copy to out */

	hpOutput(data, this.ULP_inst.blockl, decblock, this.hpomem);

	/* memcpy(decblock,data,iLBCdec_inst->blockl*sizeof(float));*/

	System.arraycopy(syntdenum, 0, this.old_syntdenum, 0,
			 this.ULP_inst.nsub * (ilbc_constants.LPC_FILTERORDER+1));
// 	memcpy(this.old_syntdenum, syntdenum,
// 	       this.ULP_inst.nsub*(LPC_FILTERORDER+1)*sizeof(float));

	this.prev_enh_pl=0;

	if (mode==0) { /* PLC was used */
	    this.prev_enh_pl=1;
	}
    }


    public ilbc_decoder(int init_mode, int init_enhancer)
    {
	ULP_inst = new ilbc_ulp(init_mode);
	/* properties to initialize : */
	syntMem = new float[ilbc_constants.LPC_FILTERORDER];
	prevLpc = new float[ilbc_constants.LPC_FILTERORDER+1];
	prevResidual = new float[ilbc_constants.NSUB_MAX*ilbc_constants.SUBL];
	old_syntdenum = new float[(ilbc_constants.LPC_FILTERORDER + 1) * ilbc_constants.NSUB_MAX];
	hpomem = new float[4];
	enh_buf = new float[ilbc_constants.ENH_BUFL];
	enh_period = new float[ilbc_constants.ENH_NBLOCKS_TOT];
	lsfdeqold = new float[ilbc_constants.LPC_FILTERORDER];

	for (int li = 0; li < syntMem.length; li++)
	    syntMem[li] = 0.0f;

	System.arraycopy(ilbc_constants.lsfmeanTbl, 0, lsfdeqold, 0,
			 ilbc_constants.LPC_FILTERORDER);
// 	for (int li = 0; li < lsfdeqold.length; li++)
// 	    lsfdeqold[li] = 0.0f;

	for (int li = 0; li < old_syntdenum.length; li++)
	    old_syntdenum[li] = 0.0f;

	for (int li = 0; li < ilbc_constants.NSUB_MAX; li++)
	    old_syntdenum[li * (ilbc_constants.LPC_FILTERORDER + 1)] = 1.0f;

	last_lag = 20;
	prevLag = 120;
	per = 0.0f;
	consPLICount = 0;
	prevPLI = 0;
	prevLpc[0] = 1.0f;
	for (int li = 1; li < prevLpc.length; li++)
	    prevLpc[li] = 0.0f;
	for (int li = 0; li < prevResidual.length; li++)
	    prevResidual[li] = 0.0f;
	seed = 777;

	for (int li = 0; li < hpomem.length; li++)
	    hpomem[li] = 0.0f;

	use_enhancer = init_enhancer;
	for (int li = 0; li < enh_buf.length; li++)
	    enh_buf[li] = 0.0f;
	for (int li = 0; li < ilbc_constants.ENH_NBLOCKS_TOT; li++)
	    enh_period[li] = 40.0f;
	prev_enh_pl = 0;
    }
}


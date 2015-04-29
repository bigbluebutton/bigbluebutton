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
public class ilbc_encoder {
    /* encoding mode, either 20 or 30 ms */
    int mode;

    /* analysis filter state */
    float anaMem[];//LPC_FILTERORDER];

    /* old lsf parameters for interpolation */
    float lsfold[]; //LPC_FILTERORDER];
    float lsfdeqold[]; //LPC_FILTERORDER];

    /* signal buffer for LP analysis */
    float lpc_buffer[]; //LPC_LOOKBACK + BLOCKL_MAX];

    /* state of input HP filter */
    float hpimem[]; //4];

    ilbc_ulp ULP_inst = null;

    /* encoder methods start here */

   /*----------------------------------------------------------------*
    *  predictive noise shaping encoding of scaled start state
    *  (subrutine for StateSearchW)
    *---------------------------------------------------------------*/

   void AbsQuantW(
       float in[],          /* (i) vector to encode */
       int in_idx,
       float syntDenum[],   /* (i) denominator of synthesis filter */
       int syntDenum_idx,
       float weightDenum[], /* (i) denominator of weighting filter */
       int weightDenum_idx,
       int out[],           /* (o) vector of quantizer indexes */
       int len,        /* (i) length of vector to encode and
                                  vector of quantizer indexes */
       int state_first     /* (i) position of start state in the
                                  80 vec */
   ){
       //       float *syntOut;
       int syntOut;
       float [] syntOutBuf = new float[ilbc_constants.LPC_FILTERORDER +
					 ilbc_constants.STATE_SHORT_LEN_30MS];
       float toQ, xq;
       int n;
       int [] index = new int[1];

       /* initialization of buffer for filtering */

       for (int li = 0; li < ilbc_constants.LPC_FILTERORDER; li++) {
	   syntOutBuf[li] = 0.0f;
       }
       //       memset(syntOutBuf, 0, LPC_FILTERORDER*sizeof(float));

       /* initialization of pointer for filtering */

       //       syntOut = &syntOutBuf[LPC_FILTERORDER];

       syntOut = ilbc_constants.LPC_FILTERORDER;

       /* synthesis and weighting filters on input */

       if (state_first != 0) {
           ilbc_common.AllPoleFilter (in, in_idx, weightDenum, weightDenum_idx,
				      ilbc_constants.SUBL, ilbc_constants.LPC_FILTERORDER);
       } else {
           ilbc_common.AllPoleFilter (in, in_idx, weightDenum, weightDenum_idx,
			  this.ULP_inst.state_short_len - ilbc_constants.SUBL,
			  ilbc_constants.LPC_FILTERORDER);
       }

       /* encoding loop */

       for (n=0; n<len; n++) {

           /* time update of filter coefficients */

           if ((state_first != 0)&&(n==ilbc_constants.SUBL)){
               syntDenum_idx += (ilbc_constants.LPC_FILTERORDER+1);
               weightDenum_idx += (ilbc_constants.LPC_FILTERORDER+1);

               /* synthesis and weighting filters on input */
               ilbc_common.AllPoleFilter (in, in_idx + n, weightDenum, weightDenum_idx,
			      len-n, ilbc_constants.LPC_FILTERORDER);

           } else if ((state_first==0)&&
               (n==(this.ULP_inst.state_short_len-ilbc_constants.SUBL))) {
               syntDenum_idx += (ilbc_constants.LPC_FILTERORDER+1);
               weightDenum_idx += (ilbc_constants.LPC_FILTERORDER+1);

               /* synthesis and weighting filters on input */
               ilbc_common.AllPoleFilter (in, in_idx + n, weightDenum, weightDenum_idx, len-n,
			      ilbc_constants.LPC_FILTERORDER);

           }

           /* prediction of synthesized and weighted input */

           syntOutBuf[syntOut + n] = 0.0f;
           ilbc_common.AllPoleFilter (syntOutBuf, syntOut + n, weightDenum, weightDenum_idx,
			  1, ilbc_constants.LPC_FILTERORDER);

           /* quantization */

           toQ = in[in_idx+n] - syntOutBuf[syntOut+n];

           xq = sort_sq(index, 0, toQ, ilbc_constants.state_sq3Tbl, 8);
           out[n]=index[0];
           syntOutBuf[syntOut + n] = ilbc_constants.state_sq3Tbl[out[n]];

           /* update of the prediction filter */

           ilbc_common.AllPoleFilter(syntOutBuf, syntOut + n, weightDenum, weightDenum_idx,
			 1, ilbc_constants.LPC_FILTERORDER);
       }
   }

   /*----------------------------------------------------------------*
    *  encoding of start state
    *---------------------------------------------------------------*/

   void StateSearchW(
       float residual[],/* (i) target residual vector */
       int residual_idx,
       float syntDenum[],   /* (i) lpc synthesis filter */
       int syntDenum_idx,
       float weightDenum[], /* (i) weighting filter denuminator */
       int weightDenum_idx,
       int idxForMax[],     /* (o) quantizer index for maximum
                                  amplitude */
       int idxVec[],    /* (o) vector of quantization indexes */
       int len,        /* (i) length of all vectors */
       int state_first)     /* (i) position of start state in the
                                  80 vec */
    {
	float dtmp, maxVal;
	float [] tmpbuf = new float[ilbc_constants.LPC_FILTERORDER +
				      2 * ilbc_constants.STATE_SHORT_LEN_30MS];
	//	float *tmp,
	int tmp;
	float [] numerator = new float[1+ilbc_constants.LPC_FILTERORDER];
	float [] foutbuf = new float[ilbc_constants.LPC_FILTERORDER +
				       2 * ilbc_constants.STATE_SHORT_LEN_30MS];
	//, *fout;
	int fout;
	int k;
	float qmax, scal;

       /* initialization of buffers and filter coefficients */

	for (int li = 0; li < ilbc_constants.LPC_FILTERORDER; li++) {
	    tmpbuf[li] = 0.0f;
	    foutbuf[li] = 0.0f;
	}

	//       memset(tmpbuf, 0, LPC_FILTERORDER*sizeof(float));
	//       memset(foutbuf, 0, LPC_FILTERORDER*sizeof(float));

	for (k=0; k < ilbc_constants.LPC_FILTERORDER; k++) {
	    numerator[k]=syntDenum[syntDenum_idx+ilbc_constants.LPC_FILTERORDER-k];
	}

	numerator[ilbc_constants.LPC_FILTERORDER]=syntDenum[syntDenum_idx];
	//	tmp = &tmpbuf[LPC_FILTERORDER];
	tmp = ilbc_constants.LPC_FILTERORDER;
	//	fout = &foutbuf[LPC_FILTERORDER];
	fout = ilbc_constants.LPC_FILTERORDER;

       /* circular convolution with the all-pass filter */

	System.arraycopy(residual, residual_idx, tmpbuf, tmp, len);
	//	memcpy(tmp, residual, len*sizeof(float));
	for (int li = 0; li < len; li++)
	    tmpbuf[tmp+len+li] = 0.0f;
	//	memset(tmp+len, 0, len*sizeof(float));
	ilbc_common.ZeroPoleFilter(tmpbuf, tmp, numerator,
				   syntDenum, syntDenum_idx, 2*len,
				   ilbc_constants.LPC_FILTERORDER, foutbuf, fout);
	for (k=0; k<len; k++) {
	    foutbuf[fout+k] += foutbuf[fout+k+len];
	}

       /* identification of the maximum amplitude value */

       maxVal = foutbuf[fout+0];
       for (k=1; k<len; k++) {

           if (foutbuf[fout+k]*foutbuf[fout+k] > maxVal*maxVal){
               maxVal = foutbuf[fout+k];
           }
       }
       maxVal=(float)Math.abs(maxVal);

       /* encoding of the maximum amplitude value */

       if (maxVal < 10.0f) {
           maxVal = 10.0f;
       }
       // log10 is since 1.5
       //maxVal = (float)Math.log10(maxVal);
       maxVal = (float)(Math.log(maxVal)/Math.log(10));
       dtmp = sort_sq(idxForMax, 0, maxVal, ilbc_constants.state_frgqTbl, 64);

       /* decoding of the maximum amplitude representation value,
          and corresponding scaling of start state */

       maxVal = ilbc_constants.state_frgqTbl[idxForMax[0]];
       qmax = (float)Math.pow(10,maxVal);
       scal = 4.5f / qmax;
       for (k=0; k<len; k++){
           foutbuf[fout+k] *= scal;
       }

       /* predictive noise shaping encoding of scaled start state */

       AbsQuantW(foutbuf, fout,syntDenum, syntDenum_idx,
		 weightDenum, weightDenum_idx, idxVec, len, state_first);
   }


   /*----------------------------------------------------------------*
    *  conversion from lpc coefficients to lsf coefficients
    *---------------------------------------------------------------*/

   void a2lsf(
       float freq[],/* (o) lsf coefficients */
       int freq_idx,
       float a[])    /* (i) lpc coefficients */
    {
	float [] steps = {(float)0.00635f, (float)0.003175f, (float)0.0015875f,
			   (float)0.00079375f};
	float step;
	int step_idx;
	int lsp_index;
	float [] p = new float[ilbc_constants.LPC_HALFORDER];
	float [] q = new float[ilbc_constants.LPC_HALFORDER];
	float [] p_pre = new float[ilbc_constants.LPC_HALFORDER];
	float [] q_pre = new float[ilbc_constants.LPC_HALFORDER];
	int old_p = 0, old_q = 1;
	//float *old;
	float [] olds = new float[2];
	int old;
	//	float *pq_coef;
	float [] pq_coef;
	float omega, old_omega;
	int i;
	float hlp, hlp1, hlp2, hlp3, hlp4, hlp5;

	for (i=0; i < ilbc_constants.LPC_HALFORDER; i++) {
	    p[i] = (float)-1.0f * (a[i + 1] + a[ilbc_constants.LPC_FILTERORDER - i]);
	    q[i] = a[ilbc_constants.LPC_FILTERORDER - i] - a[i + 1];
	}

	p_pre[0] = (float) -1.0f - p[0];
	p_pre[1] = - p_pre[0] - p[1];
	p_pre[2] = - p_pre[1] - p[2];
	p_pre[3] = - p_pre[2] - p[3];
	p_pre[4] = - p_pre[3] - p[4];
	p_pre[4] = p_pre[4] / 2;

	q_pre[0] = (float) 1.0f - q[0];
	q_pre[1] = q_pre[0] - q[1];
	q_pre[2] = q_pre[1] - q[2];
	q_pre[3] = q_pre[2] - q[3];
	q_pre[4] = q_pre[3] - q[4];
	q_pre[4] = q_pre[4] / 2;

	omega = 0.0f;

	old_omega = 0.0f;

	olds[old_p] = ilbc_constants.DOUBLE_MAX;
	olds[old_q] = ilbc_constants.DOUBLE_MAX;

       /* Here we loop through lsp_index to find all the
          LPC_FILTERORDER roots for omega. */

       for (lsp_index = 0; lsp_index < ilbc_constants.LPC_FILTERORDER; lsp_index++) {

           /* Depending on lsp_index being even or odd, we
           alternatively solve the roots for the two LSP equations. */


           if ((lsp_index & 0x1) == 0) {
               pq_coef = p_pre;
               old = old_p;
           } else {
               pq_coef = q_pre;
               old = old_q;
           }

           /* Start with low resolution grid */

           for (step_idx = 0, step = steps[step_idx];
               step_idx < ilbc_constants.LSF_NUMBER_OF_STEPS;){

               /*  cos(10piw) + pq(0)cos(8piw) + pq(1)cos(6piw) +
               pq(2)cos(4piw) + pq(3)cod(2piw) + pq(4) */

               hlp = (float)Math.cos(omega * ilbc_constants.TWO_PI);
               hlp1 = 2.0f * hlp + pq_coef[0];
               hlp2 = 2.0f * hlp * hlp1 - (float)1.0 + pq_coef[1];
               hlp3 = 2.0f * hlp * hlp2 - hlp1 + pq_coef[2];
               hlp4 = 2.0f * hlp * hlp3 - hlp2 + pq_coef[3];
               hlp5 = hlp * hlp4 - hlp3 + pq_coef[4];


               if (((hlp5 * (olds[old])) <= 0.0f) || (omega >= 0.5)){

                   if (step_idx == (ilbc_constants.LSF_NUMBER_OF_STEPS - 1)){

                       if ((float)Math.abs(hlp5) >= Math.abs(olds[old])) {
			   //System.out.println("acces index " + freq_idx + lsp_index);
                           freq[freq_idx+lsp_index] = omega - step;
                       } else {
			   //System.out.println("acces index " + freq_idx + lsp_index);
                           freq[freq_idx+lsp_index] = omega;
                       }

                       if ((olds[old]) >= 0.0f){
                           olds[old] = -1.0f * ilbc_constants.DOUBLE_MAX;
                       } else {
                           olds[old] = ilbc_constants.DOUBLE_MAX;
                       }

                       omega = old_omega;
                       step_idx = 0;

                       step_idx = ilbc_constants.LSF_NUMBER_OF_STEPS;
                   } else {

                       if (step_idx == 0) {
                           old_omega = omega;
                       }

                       step_idx++;
                       omega -= steps[step_idx];

                       /* Go back one grid step */

                       step = steps[step_idx];
                   }
               } else {

               /* increment omega until they are of different sign,
               and we know there is at least one root between omega
               and old_omega */
                   olds[old] = hlp5;
                   omega += step;
               }
           }
       }

       for (i = 0; i < ilbc_constants.LPC_FILTERORDER; i++) {
	   //System.out.println("acces index " + freq_idx + i);
           freq[freq_idx+i] = freq[freq_idx+i] * ilbc_constants.TWO_PI;
       }
   }

   /*----------------------------------------------------------------*
    *  lpc analysis (subrutine to LPCencode)
    *---------------------------------------------------------------*/

   void SimpleAnalysis(
       float lsf[],         /* (o) lsf coefficients */
       float data[])    /* (i) new data vector */
   {
       int k, is;
       float [] temp = new float[ilbc_constants.BLOCKL_MAX];
       float [] lp = new float[ilbc_constants.LPC_FILTERORDER + 1];
       float [] lp2 = new float[ilbc_constants.LPC_FILTERORDER + 1];
       float [] r = new float[ilbc_constants.LPC_FILTERORDER + 1];

       is=ilbc_constants.LPC_LOOKBACK+ilbc_constants.BLOCKL_MAX-this.ULP_inst.blockl;
       //       System.out.println("copie 1");
//        System.out.println("\nInformations de copie : \nbuffer source : " + data.length + " octets\n"+
// 			  "buffer cible : " + this.lpc_buffer.length + "octets\n" +
// 			  "  offset : " + is + "octets\n" +
// 			  "longueur de la copie : " + this.ULP_inst.blockl);
       System.arraycopy(data, 0, this.lpc_buffer, is, this.ULP_inst.blockl);
//        memcpy(iLBCenc_inst->lpc_buffer+is,data,iLBCenc_inst->blockl*sizeof(float));

       /* No lookahead, last window is asymmetric */

       for (k = 0; k < this.ULP_inst.lpc_n; k++) {

           is = ilbc_constants.LPC_LOOKBACK;

           if (k < (this.ULP_inst.lpc_n - 1)) {
               window(temp, ilbc_constants.lpc_winTbl, this.lpc_buffer, 0,
		      ilbc_constants.BLOCKL_MAX);
           } else {
               window(temp, ilbc_constants.lpc_asymwinTbl,
                   this.lpc_buffer, is, ilbc_constants.BLOCKL_MAX);
           }

           autocorr(r, temp, ilbc_constants.BLOCKL_MAX, ilbc_constants.LPC_FILTERORDER);
           window(r, r, ilbc_constants.lpc_lagwinTbl, 0, ilbc_constants.LPC_FILTERORDER + 1);

           levdurb(lp, temp, r, ilbc_constants.LPC_FILTERORDER);
           ilbc_common.bwexpand(lp2, 0, lp, ilbc_constants.LPC_CHIRP_SYNTDENUM,
				ilbc_constants.LPC_FILTERORDER+1);

           a2lsf(lsf, k * ilbc_constants.LPC_FILTERORDER, lp2);
       }
       is=ilbc_constants.LPC_LOOKBACK+ilbc_constants.BLOCKL_MAX-this.ULP_inst.blockl;
//        System.out.println("copie 2");
       System.arraycopy(this.lpc_buffer, ilbc_constants.LPC_LOOKBACK + ilbc_constants.BLOCKL_MAX - is,
			this.lpc_buffer, 0, is);
//        memmove(iLBCenc_inst->lpc_buffer,
//            iLBCenc_inst->lpc_buffer+LPC_LOOKBACK+BLOCKL_MAX-is,
//            is*sizeof(float));
   }

   /*----------------------------------------------------------------*
    *  lsf interpolator and conversion from lsf to a coefficients
    *  (subrutine to SimpleInterpolateLSF)
    *---------------------------------------------------------------*/

   void LSFinterpolate2a_enc(
       float a[],       /* (o) lpc coefficients */
       float lsf1[],/* (i) first set of lsf coefficients */
       float lsf2[],/* (i) second set of lsf coefficients */
       int lsf2_idx,
       float coef,     /* (i) weighting coefficient to use between
                              lsf1 and lsf2 */
       long length      /* (i) length of coefficient vectors */
   ){
       float  [] lsftmp = new float[ilbc_constants.LPC_FILTERORDER];

       ilbc_common.interpolate(lsftmp, lsf1, lsf2, lsf2_idx, coef, ((int)length));
       ilbc_common.lsf2a(a, lsftmp);
   }

   /*----------------------------------------------------------------*
    *  lsf interpolator (subrutine to LPCencode)
    *---------------------------------------------------------------*/

   void SimpleInterpolateLSF(
       float syntdenum[],   /* (o) the synthesis filter denominator
                                  resulting from the quantized
                                  interpolated lsf */
       float weightdenum[], /* (o) the weighting filter denominator
                                  resulting from the unquantized
                                  interpolated lsf */
       float lsf[],         /* (i) the unquantized lsf coefficients */
       float lsfdeq[],      /* (i) the dequantized lsf coefficients */
       float lsfold[],      /* (i) the unquantized lsf coefficients of
                                  the previous signal frame */
       float lsfdeqold[], /* (i) the dequantized lsf coefficients of
                                  the previous signal frame */
       int length)         /* (i) should equate LPC_FILTERORDER */
   {
       int    i, pos, lp_length;
       float [] lp = new float[ilbc_constants.LPC_FILTERORDER + 1];
       int lsf2, lsfdeq2;

       lsf2 = length;
       lsfdeq2 = length;
//        lsf2 = lsf + length;
//        lsfdeq2 = lsfdeq + length;
       lp_length = length + 1;

       if (this.ULP_inst.mode==30) {
           /* sub-frame 1: Interpolation between old and first

              set of lsf coefficients */

           LSFinterpolate2a_enc(lp, lsfdeqold, lsfdeq, 0,
				ilbc_constants.lsf_weightTbl_30ms[0], length);
	   System.arraycopy(lp, 0, syntdenum, 0, lp_length);
	   //           memcpy(syntdenum,lp,lp_length*sizeof(float));
           LSFinterpolate2a_enc(lp, lsfold, lsf, 0,
				ilbc_constants.lsf_weightTbl_30ms[0], length);
           ilbc_common.bwexpand(weightdenum, 0, lp,
				   ilbc_constants.LPC_CHIRP_WEIGHTDENUM,
				   lp_length);

           /* sub-frame 2 to 6: Interpolation between first
              and second set of lsf coefficients */

           pos = lp_length;
           for (i = 1; i < this.ULP_inst.nsub; i++) {
               LSFinterpolate2a_enc(lp, lsfdeq, lsfdeq, lsfdeq2,
				    ilbc_constants.lsf_weightTbl_30ms[i], length);
	       System.arraycopy(lp, 0, syntdenum, pos, lp_length);
	       //               memcpy(syntdenum + pos,lp,lp_length*sizeof(float));

               LSFinterpolate2a_enc(lp, lsf, lsf, lsf2,
				    ilbc_constants.lsf_weightTbl_30ms[i], length);
               ilbc_common.bwexpand(weightdenum, pos, lp,
				    ilbc_constants.LPC_CHIRP_WEIGHTDENUM, lp_length);
               pos += lp_length;
           }
       }
       else {
           pos = 0;
           for (i = 0; i < this.ULP_inst.nsub; i++) {
	       //System.out.println("ici ?");
               LSFinterpolate2a_enc(lp, lsfdeqold, lsfdeq, 0,
				    ilbc_constants.lsf_weightTbl_20ms[i], length);
	       //System.out.println("ici !");
	       System.arraycopy(lp, 0, syntdenum, pos, lp_length);
	       for (int li = 0; li < lp_length; li++)
		   //System.out.println("interpolate syntdenum [" + (li+pos) +"] is worth " + syntdenum[li+pos]);
	       //               memcpy(syntdenum+pos,lp,lp_length*sizeof(float));
               LSFinterpolate2a_enc(lp, lsfold, lsf, 0,
				    ilbc_constants.lsf_weightTbl_20ms[i], length);
               ilbc_common.bwexpand(weightdenum, pos, lp,
				    ilbc_constants.LPC_CHIRP_WEIGHTDENUM, lp_length);
               pos += lp_length;
           }
       }

       /* update memory */

       if (this.ULP_inst.mode==30) {
	   System.arraycopy(lsf, lsf2, lsfold, 0, length);
//            memcpy(lsfold, lsf2, length*sizeof(float));
	   System.arraycopy(lsfdeq, lsfdeq2, lsfdeqold, 0, length);
//            memcpy(lsfdeqold, lsfdeq2, length*sizeof(float));
       }
       else {
	   System.arraycopy(lsf, 0, lsfold, 0, length);
//            memcpy(lsfold, lsf, length*sizeof(float));
	   System.arraycopy(lsfdeq, 0, lsfdeqold, 0, length);
//            memcpy(lsfdeqold, lsfdeq, length*sizeof(float));

       }
   }

   /*----------------------------------------------------------------*
    *  lsf quantizer (subrutine to LPCencode)
    *---------------------------------------------------------------*/

   void SimplelsfQ(
		   float lsfdeq[],    /* (o) dequantized lsf coefficients
                              (dimension FILTERORDER) */
		   int index[],     /* (o) quantization index */
		   float lsf[],      /* (i) the lsf coefficient vector to be
					 quantized (dimension FILTERORDER ) */
		   int lpc_n     /* (i) number of lsf sets to quantize */
   ){
       /* Quantize first LSF with memoryless split VQ */
       SplitVQ(lsfdeq, 0, index, 0, lsf, 0, ilbc_constants.lsfCbTbl,
	       ilbc_constants.LSF_NSPLIT, ilbc_constants.dim_lsfCbTbl,
	       ilbc_constants.size_lsfCbTbl);

       if (lpc_n==2) {
           /* Quantize second LSF with memoryless split VQ */
           SplitVQ(lsfdeq, ilbc_constants.LPC_FILTERORDER,
		   index, ilbc_constants.LSF_NSPLIT,
		   lsf, ilbc_constants.LPC_FILTERORDER,
		   ilbc_constants.lsfCbTbl,
		   ilbc_constants.LSF_NSPLIT,
		   ilbc_constants.dim_lsfCbTbl,
		   ilbc_constants.size_lsfCbTbl);
       }
   }

   /*----------------------------------------------------------------*
    *  lpc encoder
    *---------------------------------------------------------------*/

   void LPCencode(
       float syntdenum[], /* (i/o) synthesis filter coefficients
                                  before/after encoding */
       float weightdenum[], /* (i/o) weighting denumerator
                                  coefficients before/after
                                  encoding */
       int lsf_index[],     /* (o) lsf quantization index */
       float data[])    /* (i) lsf coefficients to quantize */
   {
       float [] lsf = new float[ilbc_constants.LPC_FILTERORDER * ilbc_constants.LPC_N_MAX];
       float [] lsfdeq= new float[ilbc_constants.LPC_FILTERORDER * ilbc_constants.LPC_N_MAX];
       int change = 0;

       SimpleAnalysis(lsf, data);
       //       for (int li = 0; li < ilbc_constants.LPC_FILTERORDER * ilbc_constants.LPC_N_MAX; li++)
       //	   System.out.println("postSA n-" + li + " is worth " + lsf[li]);
       //       for (int li = 0; li < ilbc_constants.BLOCKL_MAX; li++)
       //	   System.out.println("data postSA n-" + li + " is worth " + data[li]);
              SimplelsfQ(lsfdeq, lsf_index, lsf, this.ULP_inst.lpc_n);
	      //       for (int li = 0; li < ilbc_constants.LPC_FILTERORDER * ilbc_constants.LPC_N_MAX; li++)
	      //	   System.out.println("postSlsfQ n-" + li + " is worth " + lsfdeq[li]);
	      //       for (int li = 0; li < lsf_index.length; li++)
	      //	   System.out.println("index postSlsfQ n-" + li + " is worth " + lsf_index[li]);

       change = ilbc_common.LSF_check(lsfdeq, ilbc_constants.LPC_FILTERORDER, this.ULP_inst.lpc_n);
       //System.out.println("check gives " + change);
       SimpleInterpolateLSF(syntdenum, weightdenum,
			    lsf, lsfdeq, this.lsfold,
			    this.lsfdeqold, ilbc_constants.LPC_FILTERORDER);
       //       for (int li = 0; li < syntdenum.length; li++)
       //	   System.out.println("syntdenum[" + li +"] is worth " + syntdenum[li]);
   }

    public void iCBSearch(
			  int index[],         /* (o) Codebook indices */
       int index_idx,
       int gain_index[],/* (o) Gain quantization indices */
       int gain_index_idx,

       float intarget[],/* (i) Target vector for encoding */
       int intarget_idx,
       float mem[],         /* (i) Buffer for codebook construction */
       int mem_idx,
       int lMem,           /* (i) Length of buffer */
       int lTarget,    /* (i) Length of vector */
       int nStages,    /* (i) Number of codebook stages */
       float weightDenum[], /* (i) weighting filter coefficients */
       int weightDenum_idx,
       float weightState[], /* (i) weighting filter state */
       int block)           /* (i) the sub-block number */
    {
       int i, j, icount, stage, best_index, range, counter;
       float max_measure, gain, measure, crossDot, ftmp;
       float [] gains = new float[ilbc_constants.CB_NSTAGES];
       float [] target = new float[ilbc_constants.SUBL];
       int base_index, sInd, eInd, base_size;
       int sIndAug=0, eIndAug=0;
       float [] buf = new float[ilbc_constants.CB_MEML+ilbc_constants.SUBL+2*ilbc_constants.LPC_FILTERORDER];
       float [] invenergy = new float[ilbc_constants.CB_EXPAND*128];
       float [] energy = new float[ilbc_constants.CB_EXPAND*128];
       //       float *pp, *ppi=0, *ppo=0, *ppe=0;
       int pp, ppi = 0, ppo = 0, ppe = 0;
       float [] ppt;
       float [] cbvectors = new float[ilbc_constants.CB_MEML];
       float tene, cene;
       float [] cvec = new float[ilbc_constants.SUBL];
       float [] aug_vec = new float[ilbc_constants.SUBL];

       float [] a = new float[1];
       int [] b = new int[1];
       float [] c = new float[1];

       for (int li = 0; li < ilbc_constants.SUBL; li++)
	   cvec[li] = 0.0f;
       //       memset(cvec,0,SUBL*sizeof(float));

       /* Determine size of codebook sections */

       base_size=lMem-lTarget+1;

       if (lTarget == ilbc_constants.SUBL) {
           base_size=lMem-lTarget+1+lTarget/2;
       }

       /* setup buffer for weighting */

       System.arraycopy(weightState, 0, buf, 0, ilbc_constants.LPC_FILTERORDER);
//        memcpy(buf,weightState,sizeof(float)*LPC_FILTERORDER);
       System.arraycopy(mem, mem_idx, buf, ilbc_constants.LPC_FILTERORDER, lMem);
//        memcpy(buf+LPC_FILTERORDER,mem,lMem*sizeof(float));
       System.arraycopy(intarget, intarget_idx, buf, ilbc_constants.LPC_FILTERORDER+lMem, lTarget);
//        memcpy(buf+LPC_FILTERORDER+lMem,intarget,lTarget*sizeof(float));

       //System.out.println("beginning of mem");
//        for (int li = 0; li < lMem; li++)
// 	   System.out.println("mem[" + li + "] = " + mem[li+mem_idx]);
//       System.out.println("end of mem");


//        System.out.println("plages : [0-" + ilbc_constants.LPC_FILTERORDER +
// 			  "], puis [" + ilbc_constants.LPC_FILTERORDER + "-" + (ilbc_constants.LPC_FILTERORDER + lMem) +
// 			  "], puis [" + (ilbc_constants.LPC_FILTERORDER + lMem) +
// 			  "-" + (ilbc_constants.LPC_FILTERORDER + lMem + lTarget) + "]");

//       System.out.println("beginning of buffer");

//        for (int li = 0; li < buf.length; li++)
// 	   System.out.println("buffer[" + li + "] = " + buf[li]);

//       System.out.println("end of buffer");
       /* weighting */

       ilbc_common.AllPoleFilter(buf, ilbc_constants.LPC_FILTERORDER, weightDenum, weightDenum_idx,
		     lMem+lTarget, ilbc_constants.LPC_FILTERORDER);

       /* Construct the codebook and target needed */

       System.arraycopy(buf, ilbc_constants.LPC_FILTERORDER + lMem, target, 0, lTarget);
       //       memcpy(target, buf+LPC_FILTERORDER+lMem, lTarget*sizeof(float));

       tene=0.0f;

       for (i=0; i<lTarget; i++) {
           tene+=target[i]*target[i];
       }

       /* Prepare search over one more codebook section. This section
          is created by filtering the original buffer with a filter. */

       filteredCBvecs(cbvectors, buf, ilbc_constants.LPC_FILTERORDER, lMem);

       /* The Main Loop over stages */

       for (stage=0; stage<nStages; stage++) {

           range = ilbc_constants.search_rangeTbl[block][stage];

           /* initialize search measure */

           max_measure = (float)-10000000.0f;
           gain = (float)0.0f;
           best_index = 0;

           /* Compute cross dot product between the target
              and the CB memory */

           crossDot=0.0f;
           pp=ilbc_constants.LPC_FILTERORDER+lMem-lTarget;
//            pp=buf+ilbc_constants.LPC_FILTERORDER+lMem-lTarget;
           for (j=0; j<lTarget; j++) {
               crossDot += target[j]*(buf[pp]);
	       pp++;
           }

           if (stage==0) {

               /* Calculate energy in the first block of
                 'lTarget' samples. */
               ppe = 0;
               ppi = ilbc_constants.LPC_FILTERORDER+lMem-lTarget-1;
               ppo = ilbc_constants.LPC_FILTERORDER+lMem-1;
//                ppe = energy;
//                ppi = buf+ilbc_constants.LPC_FILTERORDER+lMem-lTarget-1;
//                ppo = buf+ilbc_constants.LPC_FILTERORDER+lMem-1;

               energy[ppe]=0.0f;
               pp=ilbc_constants.LPC_FILTERORDER+lMem-lTarget;
//                pp=buf+ilbc_constants.LPC_FILTERORDER+lMem-lTarget;
               for (j=0; j<lTarget; j++) {
                   energy[ppe]+=(buf[pp])*(buf[pp]);
		   pp++;
               }

               if (energy[ppe] > 0.0f) {
                   invenergy[0] = (float) 1.0f / (energy[ppe] + ilbc_constants.EPS);
               } else {
                   invenergy[0] = (float) 0.0f;

               }
               ppe++;

               measure=(float)-10000000.0f;

               if (crossDot > 0.0f) {
                      measure = crossDot*crossDot*invenergy[0];
               }
           }
           else {
               measure = crossDot*crossDot*invenergy[0];
           }

           /* check if measure is better */
           ftmp = crossDot*invenergy[0];

           if ((measure>max_measure) && ((float)Math.abs(ftmp) < ilbc_constants.CB_MAXGAIN)) {
               best_index = 0;
               max_measure = measure;
               gain = ftmp;
           }

           /* loop over the main first codebook section,
              full search */

           for (icount=1; icount<range; icount++) {

               /* calculate measure */

               crossDot=0.0f;
               pp = ilbc_constants.LPC_FILTERORDER+lMem-lTarget-icount;
//                pp = buf+LPC_FILTERORDER+lMem-lTarget-icount;

               for (j=0; j<lTarget; j++) {
                   crossDot += target[j]*(buf[pp]);
		   pp++;
               }

               if (stage==0) {
                   energy[ppe] = energy[icount-1] + (buf[ppi])*(buf[ppi]) -
                       (buf[ppo])*(buf[ppo]);
		   ppe++;
                   ppo--;
                   ppi--;

                   if (energy[icount]>0.0f) {
                       invenergy[icount] =
                           (float)1.0f/(energy[icount]+ilbc_constants.EPS);
                   } else {
                       invenergy[icount] = (float) 0.0f;
                   }

                   measure=(float)-10000000.0f;

                   if (crossDot > 0.0f) {
                       measure = crossDot*crossDot*invenergy[icount];
                   }
               }
               else {
                   measure = crossDot*crossDot*invenergy[icount];
               }

               /* check if measure is better */
               ftmp = crossDot*invenergy[icount];

               if ((measure>max_measure) && ((float)Math.abs(ftmp) < ilbc_constants.CB_MAXGAIN)) {
                   best_index = icount;
                   max_measure = measure;
                   gain = ftmp;
               }
           }

           /* Loop over augmented part in the first codebook
            * section, full search.
            * The vectors are interpolated.
            */

           if (lTarget == ilbc_constants.SUBL) {

               /* Search for best possible cb vector and
                  compute the CB-vectors' energy. */
	       a[0] = max_measure;
	       b[0] = best_index;
	       c[0] = gain;
               searchAugmentedCB(20, 39, stage, base_size-lTarget/2,
				 target, buf, ilbc_constants.LPC_FILTERORDER+lMem,
				 a, b, c, energy, invenergy);
	       max_measure = a[0];
	       best_index = b[0];
	       gain = c[0];
           }

           /* set search range for following codebook sections */

	   //	   System.out.println("best index : " + best_index);

           base_index = best_index;

           /* unrestricted search */

           if (ilbc_constants.CB_RESRANGE == -1) {
	       //	       System.out.println("on met a 0");
               sInd = 0;
               eInd = range - 1;
               sIndAug = 20;
               eIndAug = 39;
           }

           /* restricted search around best index from first
           codebook section */

           else {
               /* Initialize search indices */
               sIndAug=0;
               eIndAug=0;
               sInd=base_index-ilbc_constants.CB_RESRANGE/2;
	       //	       System.out.println("on met a " + base_index + " - " + ilbc_constants.CB_RESRANGE/2 + " = " + sInd);
               eInd=sInd+ilbc_constants.CB_RESRANGE;

               if (lTarget==ilbc_constants.SUBL) {

                   if (sInd<0) {

                       sIndAug = 40 + sInd;
                       eIndAug = 39;
		       //		       System.out.println("On met encore a 0");
                       sInd=0;

                   } else if ( base_index < (base_size-20) ) {

                       if (eInd > range) {
                           sInd -= (eInd-range);
			   //			   System.out.println("on retire " + eInd + " - " + range + " pour arriver a " + sInd);
                           eInd = range;
                       }
                   } else { /* base_index >= (base_size-20) */

                       if (sInd < (base_size-20)) {
                           sIndAug = 20;
                           sInd = 0;
			   //			   System.out.println("on remet encore a 0");
                           eInd = 0;
                           eIndAug = 19 + ilbc_constants.CB_RESRANGE;

                           if(eIndAug > 39) {
                               eInd = eIndAug-39;
                               eIndAug = 39;
                           }
                       } else {
                           sIndAug = 20 + sInd - (base_size-20);
                           eIndAug = 39;
                           sInd = 0;
			   //			   System.out.println("on remetz4 a zero");
                           eInd = ilbc_constants.CB_RESRANGE - (eIndAug-sIndAug+1);
                       }
                   }

               } else { /* lTarget = 22 or 23 */

                   if (sInd < 0) {
                       eInd -= sInd;

                       sInd = 0;
		       //		       System.out.println("on remet x5 a zero");
                   }

                   if(eInd > range) {
                       sInd -= (eInd - range);
		       //		       System.out.println("on retire " + eInd + " - " + range + " pour arriver a " + sInd);
                       eInd = range;
                   }
               }
           }

           /* search of higher codebook section */

           /* index search range */
           counter = sInd;
	   //	   System.out.println("on ajoute " + base_size + " pour arriver a " + sInd);
           sInd += base_size;
           eInd += base_size;


           if (stage==0) {
	       //               ppe = energy+base_size;
	       ppe = base_size;
               energy[ppe]=0.0f;

               pp=lMem-lTarget;
	       //               pp=cbvectors+lMem-lTarget;
               for (j=0; j<lTarget; j++) {
                   energy[ppe] += (cbvectors[pp])*(cbvectors[pp]);
		   pp++;
               }

               ppi = lMem - 1 - lTarget;
               ppo = lMem - 1;
//                ppi = cbvectors + lMem - 1 - lTarget;
//                ppo = cbvectors + lMem - 1;

               for (j=0; j<(range-1); j++) {
                   energy[(ppe+1)] = energy[ppe] +
		       (cbvectors[ppi])*(cbvectors[ppi]) -
		       (cbvectors[ppo])*(cbvectors[ppo]);
                   ppo--;
                   ppi--;
                   ppe++;
               }
           }

           /* loop over search range */

           for (icount=sInd; icount<eInd; icount++) {

               /* calculate measure */

               crossDot=0.0f;
               pp=lMem - (counter++) - lTarget;
//                pp=cbvectors + lMem - (counter++) - lTarget;

//	       System.out.println("lMem : " + lMem);
//	       System.out.println("counter : " + counter);
//	       System.out.println("target : " + lTarget);

               for (j=0;j<lTarget;j++) {

                   crossDot += target[j]*(cbvectors[pp]);
		   pp++;
               }

               if (energy[icount]>0.0f) {
                   invenergy[icount] =(float)1.0f/(energy[icount]+ilbc_constants.EPS);
               } else {
                   invenergy[icount] =(float)0.0f;
               }

               if (stage==0) {

                   measure=(float)-10000000.0f;

                   if (crossDot > 0.0f) {
                       measure = crossDot*crossDot*
                           invenergy[icount];
                   }
               }
               else {
                   measure = crossDot*crossDot*invenergy[icount];
               }

               /* check if measure is better */
               ftmp = crossDot*invenergy[icount];

               if ((measure > max_measure) && ((float)Math.abs(ftmp)<ilbc_constants.CB_MAXGAIN)) {
                   best_index = icount;
                   max_measure = measure;
                   gain = ftmp;
               }
           }

           /* Search the augmented CB inside the limited range. */

           if ((lTarget==ilbc_constants.SUBL)&&(sIndAug!=0)) {
	       a[0] = max_measure;
	       b[0] = best_index;
	       c[0] = gain;
               searchAugmentedCB(sIndAug, eIndAug, stage,
				 2*base_size-20, target, cbvectors, lMem,
				 a, b, c, energy, invenergy);
	       max_measure = a[0];
	       best_index = b[0];
	       gain = c[0];
           }

           /* record best index */

           index[index_idx+stage] = best_index;

           /* gain quantization */

           if (stage==0){

               if (gain<0.0f){
                   gain = 0.0f;
               }

               if (gain > ilbc_constants.CB_MAXGAIN) {
                   gain = (float)ilbc_constants.CB_MAXGAIN;
               }
               gain = ilbc_common.gainquant(gain, 1.0f, 32, gain_index, gain_index_idx + stage);
           }
           else {
               if (stage==1) {
                   gain = ilbc_common.gainquant(gain, (float)(float)Math.abs(gains[stage-1]),
                       16, gain_index, gain_index_idx + stage);
               } else {
                   gain = ilbc_common.gainquant(gain, (float)(float)Math.abs(gains[stage-1]),
                       8, gain_index, gain_index_idx + stage);
               }
           }

           /* Extract the best (according to measure)
              codebook vector */

           if (lTarget==(ilbc_constants.STATE_LEN - this.ULP_inst.state_short_len)) {

               if (index[index_idx+stage]<base_size) {
                   pp=ilbc_constants.LPC_FILTERORDER+lMem-lTarget-index[index_idx+stage];
//                    pp=buf+ilbc_constants.LPC_FILTERORDER+lMem-lTarget-index[stage];
		   ppt = buf;
               } else {
                   pp=lMem-lTarget-index[index_idx+stage]+base_size;
//                    pp=cbvectors+lMem-lTarget-index[stage]+base_size;
		   ppt = cbvectors;
               }
           } else {

               if (index[index_idx+stage]<base_size) {
                   if (index[index_idx+stage]<(base_size-20)) {
                       pp=ilbc_constants.LPC_FILTERORDER+lMem-lTarget-index[index_idx+stage];
		       //                        pp=buf+LPC_FILTERORDER+lMem-lTarget-index[stage];
		       ppt = buf;
                   } else {
                       createAugmentedVec(index[index_idx+stage]-base_size+40,
					  buf, ilbc_constants.LPC_FILTERORDER+lMem,aug_vec);
		       //                       pp=aug_vec;
		       pp = 0;
		       ppt = aug_vec;
                   }
               } else {
                   int filterno, position;

                   filterno=index[index_idx+stage]/base_size;
                   position=index[index_idx+stage]-filterno*base_size;

                   if (position<(base_size-20)) {
                       pp=filterno*lMem-lTarget-index[index_idx+stage]+filterno*base_size;
//                        pp=cbvectors+filterno*lMem-lTarget-index[stage]+filterno*base_size;
		       ppt = cbvectors;
                   } else {
                       createAugmentedVec(index[index_idx+stage]-(filterno+1)*base_size+40,
					  cbvectors, filterno*lMem,aug_vec);
		       //                       pp=aug_vec;
		       pp = 0;
		       ppt = aug_vec;
                   }
               }
           }

           /* Subtract the best codebook vector, according
              to measure, from the target vector */

           for (j=0;j<lTarget;j++) {
               cvec[j] += gain*(ppt[pp]);
               target[j] -= gain*(ppt[pp]);
	       pp++;
           }

           /* record quantized gain */

           gains[stage]=gain;

       }/* end of Main Loop. for (stage=0;... */

       /* Gain adjustment for energy matching */
       cene=0.0f;
       for (i=0; i<lTarget; i++) {
           cene+=cvec[i]*cvec[i];
       }
       j=gain_index[gain_index_idx + 0];

       for (i=gain_index[gain_index_idx + 0]; i<32; i++) {
           ftmp=cene*ilbc_constants.gain_sq5Tbl[i]*ilbc_constants.gain_sq5Tbl[i];

           if ((ftmp<(tene*gains[0]*gains[0])) &&
               (ilbc_constants.gain_sq5Tbl[j]<(2.0f*gains[0]))) {
               j=i;
           }
       }
       gain_index[gain_index_idx + 0]=j;
   }

    public void index_conv_enc(int index[])          /* (i/o) Codebook indexes */
    {
	int k;

	for (k=1; k < ilbc_constants.CB_NSTAGES; k++) {

           if ((index[k]>=108)&&(index[k]<172)) {
               index[k]-=64;
           } else if (index[k]>=236) {
               index[k]-=128;
           } else {
               /* ERROR */
           }
       }
   }

    public void hpInput(
       float In[],  /* (i) vector to filter */
       int len,    /* (i) length of vector to filter */
       float Out[], /* (o) the resulting filtered vector */
       float mem[])  /* (i/o) the filter state */
   {
       int i;
       //       float *pi, *po;
       int pi, po;

       /* all-zero section*/

       //       pi = &In[0];
       pi = 0;
       //       po = &Out[0];
       po = 0;

       for (i=0; i<len; i++) {
	   //	   System.out.println(Out[po] + " + " + ilbc_constants.hpi_zero_coefsTbl[0] + " * " + In[pi] + "((" + ilbc_constants.hpi_zero_coefsTbl[0] * In[pi]);
           Out[po] = ilbc_constants.hpi_zero_coefsTbl[0] * (In[pi]);
	   //	   System.out.println("then *po=" + Out[po]);
	   //	   System.out.println(Out[po] + " + " + ilbc_constants.hpi_zero_coefsTbl[1] +" * "+  mem[0] + "((" + ilbc_constants.hpi_zero_coefsTbl[1] * mem[0]);
           Out[po] += ilbc_constants.hpi_zero_coefsTbl[1] * mem[0];
	   //	   System.out.println("then *po=" + Out[po]);
	   //	   System.out.println(Out[po] + " + " + ilbc_constants.hpi_zero_coefsTbl[2] + " * " +  mem[1] + "((" + ilbc_constants.hpi_zero_coefsTbl[2] * mem[1]);
           Out[po] += ilbc_constants.hpi_zero_coefsTbl[2] * mem[1];
	   //	   System.out.println("then *po=" + Out[po]);

           mem[1] = mem[0];
           mem[0] = In[pi];
           po++;
           pi++;
       }

       /* all-pole section*/

       //       po = &Out[0];
       po = 0;
       for (i=0; i<len; i++) {
	   //	   	   System.out.println("(part 2-"+i+") *po=" + Out[po]);
	   //	   	   System.out.println(Out[po] + " - " + ilbc_constants.hpi_pole_coefsTbl[1] + " * " + mem[2] + " ((" + ilbc_constants.hpi_pole_coefsTbl[1] * mem[2]);
           Out[po] -= ilbc_constants.hpi_pole_coefsTbl[1] * mem[2];
	   //	   	   System.out.println("then *po=" + Out[po]);
	   //	   	   System.out.println(Out[po] + " - " + ilbc_constants.hpi_pole_coefsTbl[2] + " * " + mem[3] + " ((" + ilbc_constants.hpi_pole_coefsTbl[2] * mem[3]);
           Out[po] -= ilbc_constants.hpi_pole_coefsTbl[2] * mem[3];
	   //	   System.out.println("2then *po=" + Out[po]);

           mem[3] = mem[2];
           mem[2] = Out[po];
           po++;
       }
   }


   /*----------------------------------------------------------------*
    *  calculation of auto correlation
    *---------------------------------------------------------------*/

    public void autocorr(
       float r[],       /* (o) autocorrelation vector */
       float x[], /* (i) data vector */
       int N,          /* (i) length of data vector */
       int order)       /* largest lag for calculated
                          autocorrelations */
    {
	int     lag, n;
	float   sum;

	for (lag = 0; lag <= order; lag++) {
	    sum = 0;
	    for (n = 0; n < N - lag; n++) {
		sum += x[n] * x[n+lag];
	    }
	    r[lag] = sum;
	}
    }

   /*----------------------------------------------------------------*
    *  window multiplication
    *---------------------------------------------------------------*/

    public void window(
       float z[],       /* (o) the windowed data */
       float x[], /* (i) the original data vector */
       float y[], /* (i) the window */
       int y_idx,
       int N)           /* (i) length of all vectors */
    {
	int     i;

	for (i = 0; i < N; i++) {
	    z[i] = x[i] * y[i+y_idx];
	}
   }

   /*----------------------------------------------------------------*
    *  levinson-durbin solution for lpc coefficients
    *---------------------------------------------------------------*/

    public void levdurb(
       float a[],       /* (o) lpc coefficient vector starting
                              with 1.0f */
       float k[],       /* (o) reflection coefficients */
       float r[],       /* (i) autocorrelation vector */
       int order)       /* (i) order of lpc filter */
    {
       float  sum, alpha;
       int     m, m_h, i;

       a[0] = 1.0f;

       if (r[0] < ilbc_constants.EPS) { /* if r[0] <= 0, set LPC coeff. to zero */
           for (i = 0; i < order; i++) {
               k[i] = 0;
               a[i+1] = 0;
           }
       } else {
           a[1] = k[0] = -r[1]/r[0];
           alpha = r[0] + r[1] * k[0];
           for (m = 1; m < order; m++){
               sum = r[m + 1];
               for (i = 0; i < m; i++){
                   sum += a[i+1] * r[m - i];
               }
               k[m] = -sum / alpha;
               alpha += k[m] * sum;
               m_h = (m + 1) >> 1;
               for (i = 0; i < m_h; i++){
                   sum = a[i+1] + k[m] * a[m - i];
                   a[m - i] += k[m] * a[i+1];
                   a[i+1] = sum;
               }
               a[m+1] = k[m];
           }
       }
   }

   /*----------------------------------------------------------------*
    *  vector quantization
    *---------------------------------------------------------------*/

    public void vq(
	   float Xq[],      /* (o) the quantized vector */
	   int Xq_idx,
	   int index[],     /* (o) the quantization index */
	   int index_idx,
	   float CB[],/* (i) the vector quantization codebook */
	   int CB_idx,
	   float X[],       /* (i) the vector to quantize */
	   int X_idx,
	   int n_cb,       /* (i) the number of vectors in the codebook */
	   int dim)         /* (i) the dimension of all vectors */
    {
	int     i, j;
	int     pos, minindex;
	float   dist, tmp, mindist;

	pos = 0;
	mindist = ilbc_constants.DOUBLE_MAX;
	minindex = 0;
	for (j = 0; j < n_cb; j++) {
	    dist = X[X_idx] - CB[pos+CB_idx];
	    dist *= dist;
	    for (i = 1; i < dim; i++) {
		tmp = X[i+X_idx] - CB[pos + i + CB_idx];
		dist += tmp*tmp;
	    }

           if (dist < mindist) {
               mindist = dist;
               minindex = j;
           }
           pos += dim;
       }
       for (i = 0; i < dim; i++) {
           Xq[i+Xq_idx] = CB[minindex*dim + i+CB_idx];
       }
       index[index_idx] = minindex;
   }

   /*----------------------------------------------------------------*
    *  split vector quantization
    *---------------------------------------------------------------*/

    public void SplitVQ(
       float qX[],      /* (o) the quantized vector */
       int qX_idx,
       int index[],     /* (o) a vector of indexes for all vector
                              codebooks in the split */
       int index_idx,
       float X[],       /* (i) the vector to quantize */
       int X_idx,
       float CB[],/* (i) the quantizer codebook */
       int nsplit,     /* the number of vector splits */
       int dim[], /* the dimension of X and qX */
       int cbsize[]) /* the number of vectors in the codebook */
    {
	int    cb_pos, X_pos, i;

	cb_pos = 0;
	X_pos = 0;
	for (i = 0; i < nsplit; i++) {
	    vq(qX, X_pos + qX_idx, index, i + index_idx, CB, cb_pos, X, X_pos + X_idx, cbsize[i], dim[i]);
	    X_pos += dim[i];
	    cb_pos += dim[i] * cbsize[i];
	}
    }

   /*----------------------------------------------------------------*
    *  scalar quantization
    *---------------------------------------------------------------*/

    public float sort_sq( /* on renvoie xq et on modifie index par effet de bord */
			  //			  float *xq,      /* (o) the quantized value */
			  int index[],     /* (o) the quantization index */
			  int index_idx,
			  float x,    /* (i) the value to quantize */
			  float cb[],/* (i) the quantization codebook */
			  int cb_size)      /* (i) the size of the quantization codebook */
    {
	int i;
	float xq;

	if (x <= cb[0]) {
	    //	    *index = 0;
	    index[index_idx] = 0;
	    xq = cb[0];
	} else {
	    i = 0;
	    while ((x > cb[i]) && i < cb_size - 1) {
		i++;
	    }

	    if (x > ((cb[i] + cb[i - 1])/2)) {
		index[index_idx] = i;
		xq = cb[i];
	    } else {
		index[index_idx] = i - 1;
		xq = cb[i - 1];
           }
	}
	return xq;
    }

   /*---------------------------------------------------------------*
    *  Classification of subframes to localize start state
    *--------------------------------------------------------------*/

    int FrameClassify(      /* index to the max-energy sub-frame */
		      float residual[])     /* (i) lpc residual signal */
    {
	float max_ssqEn;
	float [] fssqEn = new float[ilbc_constants.NSUB_MAX];
	float [] bssqEn = new float[ilbc_constants.NSUB_MAX];
	int  pp;
	int n, l, max_ssqEn_n;
// 	float [] ssqEn_win[NSUB_MAX-1]={(float)0.8,(float)0.9,

	float [] ssqEn_win = { (float)0.8,
				(float)0.9,
				(float)1.0f,
				(float)0.9,
				(float)0.8 };

	float [] sampEn_win = { (float)1.0f/(float)6.0,
				 (float)2.0f/(float)6.0,
				 (float)3.0f/(float)6.0,
				 (float)4.0f/(float)6.0,
				 (float)5.0f/(float)6.0 };

       /* init the front and back energies to zero */

	for (int li = 0; li < ilbc_constants.NSUB_MAX; li++)
	    fssqEn[li] = 0.0f;
	//       memset(fssqEn, 0, NSUB_MAX*sizeof(float));
	for (int li = 0; li < ilbc_constants.NSUB_MAX; li++)
	    bssqEn[li] = 0.0f;
	//       memset(bssqEn, 0, NSUB_MAX*sizeof(float));

       /* Calculate front of first seqence */

       n=0;
       //       pp=residual;
       pp = 0;
       for (l=0; l<5; l++) {
           fssqEn[n] += sampEn_win[l] * (residual[pp]) * (residual[pp]);
           pp++;
       }
       for (l=5; l<ilbc_constants.SUBL; l++) {
           fssqEn[n] += (residual[pp]) * (residual[pp]);
           pp++;
       }

       /* Calculate front and back of all middle sequences */

       for (n=1; n < this.ULP_inst.nsub - 1; n++) {
	   //           pp=residual+n*SUBL;
	   pp = n * ilbc_constants.SUBL;
           for (l=0; l < 5; l++) {
               fssqEn[n] += sampEn_win[l] * (residual[pp]) * (residual[pp]);
               bssqEn[n] += (residual[pp]) * (residual[pp]);
               pp++;
           }
           for (l=5; l<ilbc_constants.SUBL-5; l++) {
               fssqEn[n] += (residual[pp]) * (residual[pp]);
               bssqEn[n] += (residual[pp]) * (residual[pp]);
               pp++;
           }
           for (l=ilbc_constants.SUBL-5; l<ilbc_constants.SUBL; l++) {
               fssqEn[n] += (residual[pp]) * (residual[pp]);
               bssqEn[n] += sampEn_win[ilbc_constants.SUBL-l-1] * (residual[pp]) * (residual[pp]);
               pp++;
           }
       }

       /* Calculate back of last seqence */

       n=this.ULP_inst.nsub-1;
       pp=n*ilbc_constants.SUBL;
       for (l=0; l < ilbc_constants.SUBL-5; l++) {
           bssqEn[n] += (residual[pp]) * (residual[pp]);
           pp++;
       }
       for (l=ilbc_constants.SUBL-5; l<ilbc_constants.SUBL; l++) {
           bssqEn[n] += sampEn_win[ilbc_constants.SUBL-l-1] * (residual[pp]) * (residual[pp]);
           pp++;
       }

       /* find the index to the weighted 80 sample with
          most energy */

       if (this.ULP_inst.mode==20)
	   l=1;
       else
	   l=0;

       max_ssqEn=(fssqEn[0]+bssqEn[1])*ssqEn_win[l];
       max_ssqEn_n=1;
       for (n=2; n< this.ULP_inst.nsub; n++) {
           l++;
           if ((fssqEn[n-1]+bssqEn[n])*ssqEn_win[l] > max_ssqEn) {
               max_ssqEn=(fssqEn[n-1]+bssqEn[n]) *
                               ssqEn_win[l];
               max_ssqEn_n=n;
           }
       }

       return max_ssqEn_n;
   }

    /* from anaFilter.c, perform LP analysis filtering */
    private void anaFilter(float In[], int in_idx, float a[], int a_idx, int len, float Out[], int out_idx, float mem[])
    {
	int i, j;
	int po, pi, pm, pa;

	po = out_idx;

	/* Filter first part using memory from past */

	for (i = 0; i < ilbc_constants.LPC_FILTERORDER; i++) {
	    pi = in_idx + i;
	    pm = ilbc_constants.LPC_FILTERORDER - 1;
	    pa = a_idx;
	    Out[po] = 0.0f;

	    for (j=0; j<=i; j++) {
		Out[po] += a[pa] * In[pi];
		pa++;
		pi--;
	    }
	    for (j=i+1; j < ilbc_constants.LPC_FILTERORDER+1; j++) {
		Out[po] += a[pa] * mem[pm];
		pa++;
		pm--;
	    }
	    po++;
	}

	/* Filter last part where the state is entirely
	   in the input vector */

	for (i = ilbc_constants.LPC_FILTERORDER; i<len; i++) {
	    pi = in_idx + i;
	    pa = a_idx;
	    Out[po] = 0.0f;
	    for (j = 0; j < ilbc_constants.LPC_FILTERORDER+1; j++) {
		Out[po] += a[pa] * In[pi];
		pa++;
		pi--;
	    }
	    po++;
	}

	/* Update state vector */

	System.arraycopy(In, in_idx + len - ilbc_constants.LPC_FILTERORDER, mem, 0, ilbc_constants.LPC_FILTERORDER);
    }

    /*----------------------------------------------------------------*
     *  Construct an additional codebook vector by filtering the
     *  initial codebook buffer. This vector is then used to expand
     *  the codebook with an additional section.
     *---------------------------------------------------------------*/

    private void filteredCBvecs(float cbvectors[], float mem[], int mem_idx, int lMem)
    {
	int i, j, k;
	int pp, pp1;
	float tempbuff2[];
	int pos;

	tempbuff2 = new float [ilbc_constants.CB_MEML+ilbc_constants.CB_FILTERLEN];

	for (i = 0; i < ilbc_constants.CB_HALFFILTERLEN; i++)
	    tempbuff2[i] = 0.0f;
	System.arraycopy(mem, mem_idx, tempbuff2, ilbc_constants.CB_HALFFILTERLEN - 1, lMem);
	for (i = lMem + ilbc_constants.CB_HALFFILTERLEN - 1; i < lMem + ilbc_constants.CB_FILTERLEN; i++)
	    tempbuff2[i] = 0.0f;

	/* Create codebook vector for higher section by filtering */

	/* do filtering */
	pos=0;
	for (i = 0; i < lMem; i++)
	    cbvectors[i] = 0;
	for (k = 0; k < lMem; k++) {
	    //	    pp=&tempbuff2[k];
	    pp = k;
	    //	    pp1=&cbfiltersTbl[CB_FILTERLEN-1];
	    pp1 = ilbc_constants.CB_FILTERLEN - 1;
	    for (j = 0;j < ilbc_constants.CB_FILTERLEN;j++) {
		cbvectors[pos] += tempbuff2[pp] * ilbc_constants.cbfiltersTbl[pp1];
		pp++;
		pp1--;
	    }
	    pos++;
	}
    }

    /*----------------------------------------------------------------*
     *  Search the augmented part of the codebook to find the best
     *  measure.
     *----------------------------------------------------------------*/

    private void searchAugmentedCB(
				   int low,        /* (i) Start index for the search */
				   int high,           /* (i) End index for the search */
				   int stage,          /* (i) Current stage */
				   int startIndex,     /* (i) Codebook index for the first
							  aug vector */
				   float target[],      /* (i) Target vector for encoding */
				   float buffer[],      /* (i) Pointer to the end of the buffer for
							    augmented codebook construction */
				   int buffer_idx,
				   float max_measure[], /* (i/o) Currently maximum measure */
				   int best_index[],/* (o) Currently the best index */
				   float gain[],    /* (o) Currently the best gain */
				   float energy[],      /* (o) Energy of augmented codebook
							    vectors */
				   float invenergy[]/* (o) Inv energy of augmented codebook
							vectors */
				   )
    {
	int icount, ilow, j, tmpIndex;
	int pp, ppo, ppi, ppe;
	float crossDot, alfa;
	float weighted, measure, nrjRecursive;
	float ftmp;

	/* Compute the energy for the first (low-5)
	   noninterpolated samples */

	//	for (pp = 0; pp < buffer.length; pp++)
	//	    System.out.println("buffer[" + (pp - buffer_idx) + "] = " + buffer[pp]);

	nrjRecursive = (float) 0.0f;
	//       pp = buffer - low + 1;
	pp = 1 - low + buffer_idx;
	for (j=0; j<(low-5); j++) {
	    nrjRecursive += ( buffer[pp] * buffer[pp] );
	    pp++;
	}
	ppe = buffer_idx - low;

	//	System.out.println("energie recursive " + nrjRecursive);

	for (icount=low; icount<=high; icount++) {

	    /* Index of the codebook vector used for retrieving
	       energy values */
	    tmpIndex = startIndex+icount-20;

	    ilow = icount-4;

	    /* Update the energy recursively to save complexity */
	    nrjRecursive = nrjRecursive + buffer[ppe] * buffer[ppe];
	    ppe--;
	    energy[tmpIndex] = nrjRecursive;

	    /* Compute cross dot product for the first (low-5)
	       samples */

	    crossDot = (float) 0.0f;
	    pp = buffer_idx - icount;
	    for (j = 0; j < ilow; j++) {
		crossDot += target[j]*buffer[pp];
		pp++;
	    }

	    /* interpolation */
	    alfa = (float) 0.2;
	    ppo = buffer_idx - 4;
	    ppi = buffer_idx - icount - 4;
	    for (j=ilow; j<icount; j++) {
		weighted = ((float)1.0f-alfa)*(buffer[ppo])+alfa*(buffer[ppi]);
		ppo++;
		ppi++;
		energy[tmpIndex] += weighted*weighted;
		crossDot += target[j]*weighted;
		alfa += (float)0.2;
	    }

	    /* Compute energy and cross dot product for the
	       remaining samples */
	    pp = buffer_idx - icount;
	    for (j=icount; j < ilbc_constants.SUBL; j++) {
		energy[tmpIndex] += buffer[pp] * buffer[pp];
		crossDot += target[j]*buffer[pp];
		pp++;
	    }

	    if (energy[tmpIndex]>0.0f) {
		invenergy[tmpIndex]=(float)1.0f/(energy[tmpIndex] + ilbc_constants.EPS);
	    } else {
		invenergy[tmpIndex] = (float) 0.0f;
	    }

	    if (stage==0) {
		measure = (float)-10000000.0f;

		if (crossDot > 0.0f) {
		    measure = crossDot*crossDot*invenergy[tmpIndex];
		}
	    }
	    else {
		measure = crossDot*crossDot*invenergy[tmpIndex];
	    }

	    /* check if measure is better */
	    ftmp = crossDot*invenergy[tmpIndex];

	    //	    System.out.println("on compare " + measure + " et " + max_measure[0]);
	    //	    System.out.println("ainsi que " + Math.abs(ftmp) + " et " + ilbc_constants.CB_MAXGAIN);

	    if ((measure>max_measure[0]) && ((float)Math.abs(ftmp) < ilbc_constants.CB_MAXGAIN)) {
		//		System.out.println("new best index at " + tmpIndex + ", where icount = " + icount);
		best_index[0] = tmpIndex;
		max_measure[0] = measure;
		gain[0] = ftmp;
	    }
	}
    }

    /*----------------------------------------------------------------*
     *  Recreate a specific codebook vector from the augmented part.
     *
     *----------------------------------------------------------------*/

    private void createAugmentedVec(int index, float buffer[], int buffer_idx, float cbVec[])
    {
	int ilow, j;
	int pp, ppo, ppi;
	float alfa, alfa1, weighted;

	ilow = index - 5;

	/* copy the first noninterpolated part */

	pp = buffer_idx - index;
	System.arraycopy(buffer, pp, cbVec, 0, index);
	//	memcpy(cbVec,pp,sizeof(float)*index);

	/* interpolation */

	alfa1 = (float)0.2;
	alfa = 0.0f;
	//	ppo = buffer-5;
	ppo = buffer_idx - 5;
	//	ppi = buffer-index-5;
	ppi = buffer_idx - index - 5;
	for (j=ilow; j<index; j++) {
	    //	    weighted = ((float)1.0f-alfa)*(*ppo)+alfa*(*ppi);
	    weighted = (1.0f - alfa) * buffer[ppo] + alfa * buffer[ppi];
	    ppo++;
	    ppi++;
	    cbVec[j] = weighted;
	    alfa += alfa1;
	}

	/* copy the second noninterpolated part */

	//	pp = buffer - index;
	pp = buffer_idx - index;
	//	memcpy(cbVec+index,pp,sizeof(float)*(SUBL-index));
	System.arraycopy(buffer, pp, cbVec, index, ilbc_constants.SUBL - index);
    }



    public ilbc_encoder(int init_mode) throws Error
    {

	mode = init_mode;

	if ( (mode == 30)  ||  (mode == 20) )
	    {
		ULP_inst = new ilbc_ulp(mode);
	    }
	else
	    {
		throw(new Error("invalid mode"));
	    }

	anaMem = new float[ilbc_constants.LPC_FILTERORDER];
	lsfold = new float[ilbc_constants.LPC_FILTERORDER];
	lsfdeqold = new float[ilbc_constants.LPC_FILTERORDER];
	lpc_buffer = new float[ilbc_constants.LPC_LOOKBACK + ilbc_constants.BLOCKL_MAX];
	hpimem = new float[4];

	for (int li = 0; li < anaMem.length; li++)
	    anaMem[li] = 0.0f;

	System.arraycopy(ilbc_constants.lsfmeanTbl, 0, this.lsfdeqold, 0,
			 ilbc_constants.LPC_FILTERORDER);
// 	for (int li = 0; li < lsfold.length; li++)
// 	    lsfold[li] = 0.0f;

	System.arraycopy(ilbc_constants.lsfmeanTbl, 0, this.lsfold, 0,
			 ilbc_constants.LPC_FILTERORDER);
// 	for (int li = 0; li < lsfdeqold.length; li++)
// 	    lsfdeqold[li] = 0.0f;

 	for (int li = 0; li < lpc_buffer.length; li++)
 	    lpc_buffer[li] = 0.0f;

 	for (int li = 0; li < hpimem.length; li++)
 	    hpimem[li] = 0.0f;

	//        memset((*iLBCenc_inst).anaMem, 0,
	//            LPC_FILTERORDER*sizeof(float));
	//        memcpy((*iLBCenc_inst).lsfold, lsfmeanTbl,
	//            LPC_FILTERORDER*sizeof(float));
	//        memcpy((*iLBCenc_inst).lsfdeqold, lsfmeanTbl,
	//            LPC_FILTERORDER*sizeof(float));
	//        memset((*iLBCenc_inst).lpc_buffer, 0,
	//            (LPC_LOOKBACK+BLOCKL_MAX)*sizeof(float));
	//        memset((*iLBCenc_inst).hpimem, 0, 4*sizeof(float));

	//        return (iLBCenc_inst->no_of_bytes);
    }

    //     public int encode(short encoded_data[], short data[])
    //     {
    // 	for (int i = 0; i < encoded_data.length; i ++) {
    // 	    data[i%data.length] = encoded_data[i];
    // 	}

    // 	if (mode == 20)
    // 	    return ilbc_constants.BLOCKL_20MS;
    // 	else
    // 	    return ilbc_constants.BLOCKL_30MS;
    //     }
    public short encode(short encoded_data[], short data[])
    {
	float block[] = new float [this.ULP_inst.blockl];
	bitstream en_data = new bitstream(this.ULP_inst.no_of_bytes * 2);
	//	char en_data[] = new char [this.ULP_inst.no_of_bytes];
	int k;

	/* convert signal to float */

	for (k=0; k<this.ULP_inst.blockl; k++)
	    block[k] = (float) data[k];

	//	for (int li = 0; li < block.length; li++)
	//	    System.out.println("block " + li + " : " + block[li]);

	/* do the actual encoding */

	iLBC_encode(en_data, block);

	for (k=0; k < encoded_data.length; k++)
	    encoded_data[k] = (short) (((en_data.buffer[2*k] << 8) & 0xff00) | ( ((short) en_data.buffer[2*k+1]) & 0x00ff));

	return ((short) this.ULP_inst.no_of_bytes);

    }

    public void iLBC_encode(
			    bitstream bytes,           /* (o) encoded data bits iLBC */
			    float block[])                   /* (o) speech vector to encode */
    {
	int start;
	int [] idxForMax = new int[1];
	int n, k, meml_gotten, Nfor, Nback, i, pos;
	//       unsigned char *pbytes;
	int pbytes;
	int diff, start_pos, state_first;
	float en1, en2;
	int index, ulp;
	//       int [] firstpart = new int[1];
	int firstpart;
	int subcount, subframe;

	float [] data = new float[ilbc_constants.BLOCKL_MAX];
	float [] residual = new float[ilbc_constants.BLOCKL_MAX];
	float [] reverseResidual = new float[ilbc_constants.BLOCKL_MAX];

	int [] idxVec = new int[ilbc_constants.STATE_LEN];
	float [] reverseDecresidual = new float[ilbc_constants.BLOCKL_MAX];
	float [] mem = new float[ilbc_constants.CB_MEML];

	int [] gain_index = new int[ilbc_constants.CB_NSTAGES*ilbc_constants.NASUB_MAX];
	int [] extra_gain_index = new int[ilbc_constants.CB_NSTAGES];
	int [] cb_index = new int[ilbc_constants.CB_NSTAGES*ilbc_constants.NASUB_MAX];
	int [] extra_cb_index = new int[ilbc_constants.CB_NSTAGES];
	int [] lsf_i = new int[ilbc_constants.LSF_NSPLIT*ilbc_constants.LPC_N_MAX];

	float [] weightState = new float[ilbc_constants.LPC_FILTERORDER];
	float [] syntdenum = new float[ilbc_constants.NSUB_MAX*(ilbc_constants.LPC_FILTERORDER+1)];
	float [] weightdenum = new float[ilbc_constants.NSUB_MAX*(ilbc_constants.LPC_FILTERORDER+1)];
	float [] decresidual = new float[ilbc_constants.BLOCKL_MAX];

	bitpack pack;

	/* high pass filtering of input signal if such is not done
	   prior to calling this function */

	//	System.out.println("Data prior to hpinput call");
	//	for (int li = 0; li < data.length; li++)
	//	    System.out.println("index : " + li + " and value " + data[li]);
	//	System.out.println("Mem prior to hpinput call");
	//	for (int li = 0; li < this.hpimem.length; li++)
	//	    System.out.println("index : " + li + " and value " + this.hpimem[li]);
	hpInput(block, this.ULP_inst.blockl, data, this.hpimem);
	//	System.out.println("Data after hpinput call");
	//	for (int li = 0; li < data.length; li++)
	//	    System.out.println("index : " + li + " and value " + data[li]);
	//	System.out.println("Mem after hpinput call");
	//	for (int li = 0; li < this.hpimem.length; li++)
	//	    System.out.println("index : " + li + " and value " + this.hpimem[li]);


	/* otherwise simply copy */

	/*memcpy(data,block,iLBCenc_inst->blockl*sizeof(float));*/

	/* LPC of hp filtered input data */

	LPCencode(syntdenum, weightdenum, lsf_i, data);

	//	for (int li = 0; li < ilbc_constants.NSUB_MAX*(ilbc_constants.LPC_FILTERORDER+1); li++)
	//	    System.out.println("postLPC n-" + li + " is worth " + syntdenum[li] + ", " + weightdenum[li]);

	/* inverse filter to get residual */

	for (n = 0; n < this.ULP_inst.nsub; n++) {
	    anaFilter(data, n*ilbc_constants.SUBL, syntdenum, n*(ilbc_constants.LPC_FILTERORDER+1),
		      ilbc_constants.SUBL, residual, n*ilbc_constants.SUBL, this.anaMem);
	}

	//	for (int li = 0; li < ilbc_constants.BLOCKL_MAX; li++)
	//	    System.out.println("block residual n-" + li + " is worth " + residual[li]);

	/* find state location */

	start = FrameClassify(residual);

	/* check if state should be in first or last part of the
	   two subframes */

	diff = ilbc_constants.STATE_LEN - this.ULP_inst.state_short_len;
	en1 = 0;
	index = (start-1)*ilbc_constants.SUBL;
	for (i = 0; i < this.ULP_inst.state_short_len; i++) {
	    en1 += residual[index+i]*residual[index+i];
	}
	en2 = 0;
	index = (start-1)*ilbc_constants.SUBL+diff;
	for (i = 0; i < this.ULP_inst.state_short_len; i++) {
	    en2 += residual[index+i]*residual[index+i];
	}


	if (en1 > en2) {
	    state_first = 1;
	    start_pos = (start-1)*ilbc_constants.SUBL;
	} else {
	    state_first = 0;
	    start_pos = (start-1)*ilbc_constants.SUBL + diff;
	}

	/* scalar quantization of state */

	StateSearchW(residual, start_pos,
		     syntdenum, (start-1)*(ilbc_constants.LPC_FILTERORDER+1),
		     weightdenum, (start-1)*(ilbc_constants.LPC_FILTERORDER+1),
		     idxForMax, idxVec, this.ULP_inst.state_short_len, state_first);

	ilbc_common.StateConstructW(idxForMax[0], idxVec,
			syntdenum, (start-1)*(ilbc_constants.LPC_FILTERORDER+1),
			decresidual, start_pos, this.ULP_inst.state_short_len);

	/* predictive quantization in state */

	if (state_first != 0) { /* put adaptive part in the end */

	    /* setup memory */
	    for (int li = 0; li < ilbc_constants.CB_MEML-this.ULP_inst.state_short_len; li++)
		mem[li] = 0.0f;
	    System.arraycopy(decresidual, start_pos,
			     mem, ilbc_constants.CB_MEML-this.ULP_inst.state_short_len,
			     this.ULP_inst.state_short_len);
	    //            memcpy(mem+ilbc_constants.CB_MEML-this.ULP_inst.state_short_len,
	    //                decresidual+start_pos,
	    //                this.ULP_inst.state_short_len*sizeof(float));
	    for (int li = 0; li < ilbc_constants.LPC_FILTERORDER; li++)
		weightState[li] = 0.0f;
	    //           memset(weightState, 0, ilbc_constants.LPC_FILTERORDER*sizeof(float));

	    /* encode sub-frames */

	    iCBSearch(extra_cb_index, 0, extra_gain_index, 0,
		      residual, start_pos+this.ULP_inst.state_short_len,
		      mem, ilbc_constants.CB_MEML-ilbc_constants.stMemLTbl,
		      ilbc_constants.stMemLTbl, diff, ilbc_constants.CB_NSTAGES,
		      weightdenum, start*(ilbc_constants.LPC_FILTERORDER+1),
		      weightState, 0);

	    /* construct decoded vector */

	    ilbc_common.iCBConstruct(decresidual, start_pos+this.ULP_inst.state_short_len,
				     extra_cb_index, 0, extra_gain_index, 0,
				     mem, ilbc_constants.CB_MEML-ilbc_constants.stMemLTbl,
				     ilbc_constants.stMemLTbl, diff, ilbc_constants.CB_NSTAGES);

	}
	else { /* put adaptive part in the beginning */

	    /* create reversed vectors for prediction */

	    for (k=0; k<diff; k++) {
		reverseResidual[k] = residual[(start+1)*ilbc_constants.SUBL-1
					      -(k+this.ULP_inst.state_short_len)];
	    }

	    /* setup memory */

	    meml_gotten = this.ULP_inst.state_short_len;
	    for (k=0; k<meml_gotten; k++) {
		mem[ilbc_constants.CB_MEML-1-k] = decresidual[start_pos + k];
	    }
	    for (int li = 0; li < (ilbc_constants.CB_MEML - k); li++)
		mem[li] = 0.0f;
	    //           memset(mem, 0, (ilbc_constants.CB_MEML-k)*sizeof(float));
	    for (int li = 0; li < ilbc_constants.LPC_FILTERORDER; li++)
		weightState[li] = 0.0f;
	    // memset(weightState, 0, ilbc_constants.LPC_FILTERORDER*sizeof(float));

	    /* encode sub-frames */

	    iCBSearch(extra_cb_index, 0, extra_gain_index, 0,
		      reverseResidual, 0,
		      mem, ilbc_constants.CB_MEML-ilbc_constants.stMemLTbl, ilbc_constants.stMemLTbl,
		      diff, ilbc_constants.CB_NSTAGES,
		      weightdenum, (start-1)*(ilbc_constants.LPC_FILTERORDER+1),
		      weightState, 0);

	    /* construct decoded vector */

	    ilbc_common.iCBConstruct(reverseDecresidual, 0, extra_cb_index, 0,
				     extra_gain_index, 0, mem,
				     ilbc_constants.CB_MEML - ilbc_constants.stMemLTbl,
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


	if ( Nfor > 0 ) {

	    /* setup memory */

	    for (int li = 0; li < (ilbc_constants.CB_MEML-ilbc_constants.STATE_LEN); li++)
		mem[li] = 0.0f;
	    //           memset(mem, 0, (ilbc_constants.CB_MEML-ilbc_constants.STATE_LEN)*sizeof(float));
	    System.arraycopy(decresidual, (start-1)*ilbc_constants.SUBL,
			     mem, ilbc_constants.CB_MEML-ilbc_constants.STATE_LEN,
			     ilbc_constants.STATE_LEN);
	    //            memcpy(mem+ilbc_constants.CB_MEML-ilbc_constants.STATE_LEN,
	    // 		  decresidual+(start-1)*ilbc_constants.SUBL,
	    // 		  ilbc_constants.STATE_LEN*sizeof(float));
	    for (int li = 0; li < ilbc_constants.LPC_FILTERORDER; li++)
		weightState[li] = 0.0f;
	    //            memset(weightState, 0, ilbc_constants.LPC_FILTERORDER*sizeof(float));

	    /* loop over sub-frames to encode */

	    for (subframe=0; subframe<Nfor; subframe++) {

		/* encode sub-frame */

		iCBSearch(cb_index, subcount*ilbc_constants.CB_NSTAGES,
			  gain_index, subcount*ilbc_constants.CB_NSTAGES,
			  residual, (start+1+subframe)*ilbc_constants.SUBL,
			  mem, ilbc_constants.CB_MEML-ilbc_constants.memLfTbl[subcount],
			  ilbc_constants.memLfTbl[subcount], ilbc_constants.SUBL, ilbc_constants.CB_NSTAGES,
			  weightdenum, (start+1+subframe)*(ilbc_constants.LPC_FILTERORDER+1),
			  weightState, subcount+1);

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
				 (ilbc_constants.CB_MEML-ilbc_constants.SUBL));
		//                memcpy(mem, mem+ilbc_constants.SUBL, (ilbc_constants.CB_MEML-ilbc_constants.SUBL)*sizeof(float));
		System.arraycopy(decresidual, (start+1+subframe)*ilbc_constants.SUBL,
				 mem, ilbc_constants.CB_MEML-ilbc_constants.SUBL,
				 ilbc_constants.SUBL);
		//                memcpy(mem+ilbc_constants.CB_MEML-ilbc_constants.SUBL,
		//                    &decresidual[(start+1+subframe)*ilbc_constants.SUBL],
		// 		      ilbc_constants.SUBL*sizeof(float));
		for (int li = 0; li < ilbc_constants.LPC_FILTERORDER; li++)
		    weightState[li] = 0.0f;
		//                memset(weightState, 0, ilbc_constants.LPC_FILTERORDER*sizeof(float));

		subcount++;
	    }
	}


	/* backward prediction of sub-frames */

	Nback = start-1;


	if ( Nback > 0 ) {

	    /* create reverse order vectors */

	    for (n=0; n<Nback; n++) {
		for (k=0; k<ilbc_constants.SUBL; k++) {
		    reverseResidual[n*ilbc_constants.SUBL+k] =
			residual[(start-1)*ilbc_constants.SUBL-1-n*ilbc_constants.SUBL-k];
		    reverseDecresidual[n*ilbc_constants.SUBL+k] =
			decresidual[(start-1)*ilbc_constants.SUBL-1-n*ilbc_constants.SUBL-k];
		}
	    }

	    /* setup memory */

	    meml_gotten = ilbc_constants.SUBL*(this.ULP_inst.nsub+1-start);


	    if ( meml_gotten > ilbc_constants.CB_MEML ) {
		meml_gotten=ilbc_constants.CB_MEML;
	    }
	    for (k=0; k<meml_gotten; k++) {
		mem[ilbc_constants.CB_MEML-1-k] = decresidual[(start-1)*ilbc_constants.SUBL + k];
	    }
	    for (int li = 0; li < (ilbc_constants.CB_MEML - k); li++)
		mem[li] = 0.0f;
	    //            memset(mem, 0, (ilbc_constants.CB_MEML-k)*sizeof(float));
	    for (int li = 0; li < ilbc_constants.LPC_FILTERORDER; li++)
		weightState[li] = 0.0f;
	    //            memset(weightState, 0, ilbc_constants.LPC_FILTERORDER*sizeof(float));

	    /* loop over sub-frames to encode */

	    for (subframe=0; subframe<Nback; subframe++) {

		/* encode sub-frame */

		iCBSearch(cb_index, subcount*ilbc_constants.CB_NSTAGES,
			  gain_index, subcount*ilbc_constants.CB_NSTAGES,
			  reverseResidual, subframe*ilbc_constants.SUBL,
			  mem, ilbc_constants.CB_MEML-ilbc_constants.memLfTbl[subcount],
			  ilbc_constants.memLfTbl[subcount], ilbc_constants.SUBL, ilbc_constants.CB_NSTAGES,
			  weightdenum, (start-2-subframe)*(ilbc_constants.LPC_FILTERORDER+1),
			  weightState, subcount+1);

		/* construct decoded vector */

		ilbc_common.iCBConstruct(reverseDecresidual, subframe*ilbc_constants.SUBL,
					 cb_index, subcount*ilbc_constants.CB_NSTAGES,
					 gain_index, subcount*ilbc_constants.CB_NSTAGES,
					 mem, ilbc_constants.CB_MEML-ilbc_constants.memLfTbl[subcount],
					 ilbc_constants.memLfTbl[subcount], ilbc_constants.SUBL,
					 ilbc_constants.CB_NSTAGES);

		/* update memory */

		System.arraycopy(mem, ilbc_constants.SUBL,
				 mem, 0,
				 (ilbc_constants.CB_MEML-ilbc_constants.SUBL));
		//                memcpy(mem, mem+ilbc_constants.SUBL, (ilbc_constants.CB_MEML-ilbc_constants.SUBL)*sizeof(float));
		System.arraycopy(reverseDecresidual, subframe*ilbc_constants.SUBL,
				 mem, ilbc_constants.CB_MEML-ilbc_constants.SUBL,
				 ilbc_constants.SUBL);
		//                memcpy(mem+ilbc_constants.CB_MEML-ilbc_constants.SUBL,
		//                    &reverseDecresidual[subframe*ilbc_constants.SUBL],
		//                    ilbc_constants.SUBL*sizeof(float));
		for (int li = 0; li < ilbc_constants.LPC_FILTERORDER; li++)
		    weightState[li] = 0.0f;
		//                memset(weightState, 0, ilbc_constants.LPC_FILTERORDER*sizeof(float));

		subcount++;

	    }

	    /* get decoded residual from reversed vector */

	    for (i=0; i<ilbc_constants.SUBL*Nback; i++) {
		decresidual[ilbc_constants.SUBL*Nback - i - 1] =
		    reverseDecresidual[i];
	    }
	}
	/* end encoding part */

	/* adjust index */
	index_conv_enc(cb_index);

	/* pack bytes */

	//       pbytes=bytes;
	pos=0;

	/* loop over the 3 ULP classes */

	for (ulp=0; ulp<3; ulp++) {

	    int [] psarray = new int[1];
	    /* LSF */
	    //	    System.out.println("ULP Class " + ulp);
	    for (k=0; k<ilbc_constants.LSF_NSPLIT*this.ULP_inst.lpc_n; k++) {
		//System.out.println("LSF " + k);
		pack = bytes.packsplit(lsf_i[k],
				       this.ULP_inst.lsf_bits[k][ulp],
				       this.ULP_inst.lsf_bits[k][ulp]+
				       this.ULP_inst.lsf_bits[k][ulp+1]+
				       this.ULP_inst.lsf_bits[k][ulp+2]);
		firstpart = pack.get_firstpart();
		lsf_i[k] = pack.get_rest();
		bytes.dopack(firstpart, this.ULP_inst.lsf_bits[k][ulp]);
	    }

	    /* Start block info */

	    //	    System.out.println("start bits");

	    pack = bytes.packsplit(start,
				   this.ULP_inst.start_bits[ulp],
				   this.ULP_inst.start_bits[ulp]+
				   this.ULP_inst.start_bits[ulp+1]+
				   this.ULP_inst.start_bits[ulp+2]);
	    firstpart = pack.get_firstpart();
	    start = pack.get_rest();
	    bytes.dopack(firstpart, this.ULP_inst.start_bits[ulp]);

	    //	    System.out.println("startfirst bits");

	    pack = bytes.packsplit(state_first,
				   this.ULP_inst.startfirst_bits[ulp],
				   this.ULP_inst.startfirst_bits[ulp]+
				   this.ULP_inst.startfirst_bits[ulp+1]+
				   this.ULP_inst.startfirst_bits[ulp+2]);
	    firstpart = pack.get_firstpart();
	    state_first = pack.get_rest();
	    bytes.dopack(firstpart, this.ULP_inst.startfirst_bits[ulp]);

	    //	    System.out.println("scale bits");
	    pack = bytes.packsplit(idxForMax[0],
				   this.ULP_inst.scale_bits[ulp],
				   this.ULP_inst.scale_bits[ulp]+
				   this.ULP_inst.scale_bits[ulp+1]+
				   this.ULP_inst.scale_bits[ulp+2]);
	    firstpart = pack.get_firstpart();
	    idxForMax[0] = pack.get_rest();
	    bytes.dopack(firstpart, this.ULP_inst.scale_bits[ulp]);

	    //	    System.out.println("state bits");
	    for (k=0; k<this.ULP_inst.state_short_len; k++) {
		//		System.out.println("state short len #" + k);
		pack = bytes.packsplit(idxVec[k],
				       this.ULP_inst.state_bits[ulp],
				       this.ULP_inst.state_bits[ulp]+
				       this.ULP_inst.state_bits[ulp+1]+
				       this.ULP_inst.state_bits[ulp+2]);
		firstpart = pack.get_firstpart();
		idxVec[k] = pack.get_rest();
		bytes.dopack(firstpart, this.ULP_inst.state_bits[ulp]);
	    }

	    /* 23/22 (20ms/30ms) sample block */

	    //	    System.out.println("extra_cb_index");
	    for (k=0;k<ilbc_constants.CB_NSTAGES;k++) {
		pack = bytes.packsplit(extra_cb_index[k],
				       this.ULP_inst.extra_cb_index[k][ulp],
				       this.ULP_inst.extra_cb_index[k][ulp]+
				       this.ULP_inst.extra_cb_index[k][ulp+1]+
				       this.ULP_inst.extra_cb_index[k][ulp+2]);
		firstpart = pack.get_firstpart();
		extra_cb_index[k] = pack.get_rest();
		bytes.dopack(firstpart, this.ULP_inst.extra_cb_index[k][ulp]);
	    }

	    //	    System.out.println("extra_cb_gain");
	    for (k=0;k<ilbc_constants.CB_NSTAGES;k++) {
		pack = bytes.packsplit(extra_gain_index[k],
				       this.ULP_inst.extra_cb_gain[k][ulp],
				       this.ULP_inst.extra_cb_gain[k][ulp]+
				       this.ULP_inst.extra_cb_gain[k][ulp+1]+
				       this.ULP_inst.extra_cb_gain[k][ulp+2]);
		firstpart = pack.get_firstpart();
		extra_gain_index[k] = pack.get_rest();
		//		this.ULP_inst.extra_cb_gain[k][ulp] = pack.get_rest();
		bytes.dopack(firstpart, this.ULP_inst.extra_cb_gain[k][ulp]);
	    }

	    /* The two/four (20ms/30ms) 40 sample sub-blocks */

	    //	    System.out.println("cb_index");

	    for (i=0; i<this.ULP_inst.nasub; i++) {
		for (k=0; k<ilbc_constants.CB_NSTAGES; k++) {
		    pack = bytes.packsplit(cb_index[i*ilbc_constants.CB_NSTAGES+k],
					   this.ULP_inst.cb_index[i][k][ulp],
					   this.ULP_inst.cb_index[i][k][ulp]+
					   this.ULP_inst.cb_index[i][k][ulp+1]+
					   this.ULP_inst.cb_index[i][k][ulp+2]);
		    firstpart = pack.get_firstpart();
		    cb_index[i*ilbc_constants.CB_NSTAGES+k] = pack.get_rest();
		    bytes.dopack(firstpart, this.ULP_inst.cb_index[i][k][ulp]);
		}
	    }

	    //	    System.out.println("cb_gain");
	    for (i=0; i<this.ULP_inst.nasub; i++) {
		for (k=0; k<ilbc_constants.CB_NSTAGES; k++) {
		    pack = bytes.packsplit(gain_index[i*ilbc_constants.CB_NSTAGES+k],
					   this.ULP_inst.cb_gain[i][k][ulp],
					   this.ULP_inst.cb_gain[i][k][ulp]+
					   this.ULP_inst.cb_gain[i][k][ulp+1]+
					   this.ULP_inst.cb_gain[i][k][ulp+2]);
		    firstpart = pack.get_firstpart();
		    gain_index[i*ilbc_constants.CB_NSTAGES+k] = pack.get_rest();
		    bytes.dopack(firstpart, this.ULP_inst.cb_gain[i][k][ulp]);
		}
	    }
	}

	/* set the last bit to zero (otherwise the decoder
	   will treat it as a lost frame) */
	//	System.out.println("final bit");
	bytes.dopack(0, 1);
    }

}


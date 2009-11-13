package org.red5.app.sip.codecs.g729;
//package org.mobicents.media.server.impl.dsp.audio.g729;

public class QuaLsp {

	/* static memory */
	float freq_prev[][] = new float[LD8KConstants.MA_NP][LD8KConstants.M];    /* previous LSP vector       */
	float freq_prev_reset[] = new float[]{  /* previous LSP vector(init) */
	 (float)0.285599,  (float)0.571199,  (float)0.856798,  (float)1.142397,  (float)1.427997,
	 (float)1.713596,  (float)1.999195,  (float)2.284795,  (float)2.570394,  (float)2.855993
	};     /* PI*(float)(j+1)/(float)(M+1) */


	public void qua_lsp(
	  float lsp[],       /* (i) : Unquantized LSP            */
	  float lsp_q[],     /* (o) : Quantized LSP              */
	  int ana[]          /* (o) : indexes                    */
	)
	{
	  int i;
	  float lsf[] = new float[LD8KConstants.M], lsf_q[] = new float[LD8KConstants.M];  /* domain 0.0<= lsf <PI */

	  /* Convert LSPs to LSFs */

	  for (i=0; i<LD8KConstants.M; i++ )
	     lsf[i] = (float)Math.acos(lsp[i]);

	  lsp_qua_cs(lsf, lsf_q, ana );

	  /* Convert LSFs to LSPs */

	  for (i=0; i<LD8KConstants.M; i++ )
	     lsp_q[i] = (float)Math.cos(lsf_q[i]);

	  return;
	}

	/*----------------------------------------------------------------------------
	 * lsp_encw_reset - set the previous LSP vector
	 *----------------------------------------------------------------------------
	 */
	void lsp_encw_reset(
	 
	)
	{
	   int  i;
	   for(i=0; i<LD8KConstants.MA_NP; i++)
	     Util.copy (freq_prev_reset, freq_prev[i], LD8KConstants.M );
	   return;
	}
	/*----------------------------------------------------------------------------
	 * lsp_qua_cs - lsp quantizer
	 *----------------------------------------------------------------------------
	 */
	public void lsp_qua_cs(
	 float  []flsp_in,       /*  input : Original LSP parameters      */
	 float  []lspq_out,       /*  output: Quantized LSP parameters     */
	 int[]  code             /*  output: codes of the selected LSP    */
	)
	{
	   float        wegt[] = new float[LD8KConstants.M];   /* weight coef. */

	   get_wegt( flsp_in, wegt );

	   relspwed( flsp_in, wegt, lspq_out, TabLD8k.lspcb1, TabLD8k.lspcb2, TabLD8k.fg,
	            freq_prev, TabLD8k.fg_sum, TabLD8k.fg_sum_inv, code);
	   return;
	}
	/*----------------------------------------------------------------------------
	 * relspwed -
	 *----------------------------------------------------------------------------
	 */
	static void relspwed(
	 float  lsp[],                  /*input: unquantized LSP parameters  */
	 float  wegt[],                 /*input: weight coef.                */
	 float  lspq[],                 /*output:quantized LSP parameters    */
	 float  lspcb1[][],            /*input: first stage LSP codebook    */
	 float  lspcb2[][],            /*input: Second stage LSP codebook   */
	 float  fg[][][],     /*input: MA prediction coef.         */
	 float  freq_prev[][],    /*input: previous LSP vector         */
	 float  fg_sum[][],        /*input: present MA prediction coef. */
	 float  fg_sum_inv[][],    /*input: inverse coef.               */
	 int    code_ana[]              /*output:codes of the selected LSP   */
	)
	{
	   int  mode, j;
	   IntegerPointer  index = new IntegerPointer();
	   IntegerPointer mode_index = new IntegerPointer(),cand_cur = new IntegerPointer();
	   int  cand[] = new int[LD8KConstants.MODE];
	   int  tindex1[] =new int[LD8KConstants.MODE], tindex2[] = new int[LD8KConstants.MODE];
	   float        tdist[] = new float[LD8KConstants.MODE];
	   float        rbuf[] = new float[LD8KConstants.M];
	   float        buf[] = new float[LD8KConstants.M];

	   for(mode = 0; mode<LD8KConstants.MODE; mode++) {

	      LspGetq.lsp_prev_extract(lsp, rbuf, fg[mode], freq_prev, fg_sum_inv[mode]);

	      /*----- search the first stage lsp codebook -----*/
	      lsp_pre_select(rbuf, lspcb1, cand_cur);
	      cand[mode]=cand_cur.value;

	      /*----- search the second stage lsp codebook (lower 0-4) ----- */
	      lsp_select_1(rbuf, lspcb1[cand_cur.value], wegt, lspcb2, index);

	      tindex1[mode] = index.value;

	      for(j=0; j<LD8KConstants.NC; j++)
	        buf[j]=lspcb1[cand_cur.value][j]+lspcb2[index.value][j];

	      LspGetq.lsp_expand_1(buf, LD8KConstants.GAP1);  /* check */

	      /*----- search the second stage lsp codebook (Higher 5-9) ----- */
	      lsp_select_2(rbuf, lspcb1[cand_cur.value], wegt, lspcb2,
	                   index);

	      tindex2[mode] = index.value;

	      for(j=LD8KConstants.NC; j<LD8KConstants.M; j++)
	        buf[j]=lspcb1[cand_cur.value][j]+lspcb2[index.value][j];
	      LspGetq.lsp_expand_2(buf, LD8KConstants.GAP1);  /* check */


	      /* check */
	      LspGetq.lsp_expand_1_2(buf, LD8KConstants.GAP2);
	      FloatPointer tmp = new FloatPointer(tdist[mode]);
	      lsp_get_tdist(wegt, buf, tmp, rbuf,
	                    fg_sum[mode]);  /* calculate the distortion */
	      tdist[mode] = tmp.value;

	   } /* mode */


	   lsp_last_select(tdist, mode_index); /* select the codes */

	   /* pack codes for lsp parameters */
	   code_ana[0] = (mode_index.value<<LD8KConstants.NC0_B) | cand[mode_index.value];
	   code_ana[1] = (tindex1[mode_index.value]<<LD8KConstants.NC1_B) | tindex2[mode_index.value];

	   /* reconstruct quantized LSP parameter and check the stabilty */
	   LspGetq.lsp_get_quant(lspcb1, lspcb2, cand[mode_index.value],
	                 tindex1[mode_index.value], tindex2[mode_index.value],
	                 fg[mode_index.value],
	                 freq_prev,
	                 lspq, fg_sum[mode_index.value]);

	    return;
	}
	/*----------------------------------------------------------------------------
	 * lsp_pre_select - select the code of first stage lsp codebook
	 *----------------------------------------------------------------------------
	 */
	static void lsp_pre_select(
	 float  rbuf[],         /*input : target vetor             */
	 float  lspcb1[][],    /*input : first stage lsp codebook */
	 IntegerPointer    cand           /*output: selected code            */
	)
	{
	   int  i, j;
	   float dmin, dist, temp;

	   /* calculate the distortion */

	   cand.value = 0;
	   dmin= LD8KConstants.FLT_MAX_G729;
	   for(i=0; i<LD8KConstants.NC0; i++) {
	      dist =(float)0.;
	      for(j=0; j<LD8KConstants.M; j++){
	        temp = rbuf[j]-lspcb1[i][j];
	        dist += temp * temp;
	      }

	      if(dist<dmin)
	      {
	        dmin=dist;
	        cand.value=i;
	      }
	    }
	    return;
	}

	/*----------------------------------------------------------------------------
	 * lsp_pre_select_1 - select the code of second stage lsp codebook (lower 0-4)
	 *----------------------------------------------------------------------------
	 */
	static void lsp_select_1(
	 float  rbuf[],         /*input : target vector            */
	 float  lspcb1[],       /*input : first stage lsp codebook */
	 float  wegt[],         /*input : weight coef.             */
	 float  lspcb2[][],    /*input : second stage lsp codebook*/
	 IntegerPointer    index          /*output: selected codebook index     */
	)
	{
	   int  j, k1;
	   float        buf[] = new float[LD8KConstants.M];
	   float        dist, dmin, tmp;

	   for(j=0; j<LD8KConstants.NC; j++)
	        buf[j]=rbuf[j]-lspcb1[j];

	   index.value = 0;
	   dmin=LD8KConstants.FLT_MAX_G729;
	   for(k1 = 0; k1<LD8KConstants.NC1; k1++) {
	      /* calculate the distortion */
	      dist = (float)0.;
	      for(j=0; j<LD8KConstants.NC; j++) {
	         tmp = buf[j]-lspcb2[k1][j];
	         dist += wegt[j] * tmp * tmp;
	      }

	      if(dist<dmin) {
	         dmin = dist;
	         index.value = k1;
	      }
	   }
	    return;
	}

	/*----------------------------------------------------------------------------
	 * lsp_pre_select_2 - select the code of second stage lsp codebook (higher 5-9)
	 *----------------------------------------------------------------------------
	 */
	static void lsp_select_2(
	 float  rbuf[],         /*input : target vector            */
	 float  lspcb1[],       /*input : first stage lsp codebook */
	 float  wegt[],         /*input : weighting coef.             */
	 float  lspcb2[][],    /*input : second stage lsp codebook*/
	 IntegerPointer    index          /*output: selected codebook index    */
	)
	{
	   int  j, k1;
	   float        buf[] = new float[LD8KConstants.M];
	   float        dist, dmin, tmp;

	   for(j=LD8KConstants.NC; j<LD8KConstants.M; j++)
	        buf[j]=rbuf[j]-lspcb1[j];


	   index.value = 0;
	   dmin= LD8KConstants.FLT_MAX_G729;
	   for(k1 = 0; k1<LD8KConstants.NC1; k1++) {
	      dist = (float)0.0;
	      for(j=LD8KConstants.NC; j<LD8KConstants.M; j++) {
	        tmp = buf[j] - lspcb2[k1][j];
	        dist += wegt[j] * tmp * tmp;
	      }

	      if(dist<dmin) {
	         dmin = dist;
	         index.value = k1;
	      }
	   }
	   return;
	}
	/*----------------------------------------------------------------------------
	 * lsp_get_tdist - calculate the distortion
	 *----------------------------------------------------------------------------
	 */
	static void lsp_get_tdist(
	 float  wegt[],         /*input : weight coef.          */
	 float  buf[],          /*input : candidate LSP vector  */
	 FloatPointer  tdist,         /*output: distortion            */
	 float  rbuf[],         /*input : target vector         */
	 float  fg_sum[]        /*input : present MA prediction coef.  */
	)
	{
	   int  j;
	   float        tmp;

	   tdist.value = (float)0.0;
	   for(j=0; j<LD8KConstants.M; j++) {
	      tmp = (buf[j] - rbuf[j]) * fg_sum[j];
	      tdist.value += wegt[j] * tmp * tmp;
	   }
	   return;
	}

	/*----------------------------------------------------------------------------
	 * lsp_last_select - select the mode
	 *----------------------------------------------------------------------------
	 */
	static void lsp_last_select(
	 float  tdist[],        /*input : distortion         */
	 IntegerPointer    mode_index     /*output: the selected mode  */
	)
	{
	   mode_index.value = 0;
	   if( tdist[1] < tdist[0] ) mode_index.value = 1;
	   return;
	}
	/*----------------------------------------------------------------------------
	 * get_wegt - compute lsp weights
	 *----------------------------------------------------------------------------
	 */
	static void get_wegt(
	 float  flsp[],         /* input : M LSP parameters */
	 float  wegt[]          /* output: M weighting coefficients */
	)
	{
	   int  i;
	   float        tmp;

	   tmp = flsp[1] - LD8KConstants.PI04 - (float)1.0;
	   if (tmp > (float)0.0)       wegt[0] = (float)1.0;
	   else         wegt[0] = tmp * tmp * (float)10. + (float)1.0;

	   for ( i=1; i<LD8KConstants.M-1; i++ ) {
	      tmp = flsp[i+1] - flsp[i-1] - (float)1.0;
	      if (tmp > (float)0.0)    wegt[i] = (float)1.0;
	      else              wegt[i] = tmp * tmp * (float)10. + (float)1.0;
	   }

	   tmp = LD8KConstants.PI92 - flsp[LD8KConstants.M-2] - (float)1.0;
	   if (tmp > (float)0.0)       wegt[LD8KConstants.M-1] = (float)1.0;
	   else         wegt[LD8KConstants.M-1] = tmp * tmp * (float)10. + (float)1.0;

	   wegt[4] *= LD8KConstants.CONST12;
	   wegt[5] *= LD8KConstants.CONST12;
	   return;
	}


}

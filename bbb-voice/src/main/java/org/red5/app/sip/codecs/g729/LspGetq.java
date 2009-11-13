package org.red5.app.sip.codecs.g729;
//package org.mobicents.media.server.impl.dsp.audio.g729;

public class LspGetq {
	
	/*----------------------------------------------------------------------------
	 * lsp_get_quant - reconstruct quantized LSP parameter and check the stabilty
	 *----------------------------------------------------------------------------
	 */

	public static void lsp_get_quant(
	 float  lspcb1[][],    /*input : first stage LSP codebook     */
	 float  lspcb2[][],    /*input : Second stage LSP codebook    */
	 int    code0,          /*input : selected code of first stage */
	 int    code1,          /*input : selected code of second stage*/
	 int    code2,          /*input : selected code of second stage*/
	 float  fg[][],        /*input : MA prediction coef.          */
	 float  freq_prev[][], /*input : previous LSP vector          */
	 float  lspq[],         /*output: quantized LSP parameters     */
	 float  fg_sum[]        /*input : present MA prediction coef.  */
	)
	{
	   int  j;
	   float  buf[] = new float[LD8KConstants.M];


	   for(j=0; j<LD8KConstants.NC; j++)
	     buf[j] = lspcb1[code0][j] + lspcb2[code1][j];
	   for(j=LD8KConstants.NC; j<LD8KConstants.M; j++)
	     buf[j] = lspcb1[code0][j] + lspcb2[code2][j];

	   /* check */
	   lsp_expand_1_2(buf, LD8KConstants.GAP1);
	   lsp_expand_1_2(buf, LD8KConstants.GAP2);

	   /* reconstruct quantized LSP parameters */
	   lsp_prev_compose(buf, lspq, fg, freq_prev, fg_sum);

	   lsp_prev_update(buf, freq_prev);

	   lsp_stability( lspq );  /* check the stabilty */

	   return;
	}

	/*----------------------------------------------------------------------------
	 * lsp_expand_1  - check for lower (0-4)
	 *----------------------------------------------------------------------------
	 */
	public static void lsp_expand_1(
	 float  buf[],          /* in/out: lsp vectors  */
	 float gap
	)
	{
	   int   j;
	   float diff, tmp;

	   for(j=1; j<LD8KConstants.NC; j++) {
	      diff = buf[j-1] - buf[j];
	      tmp  = (diff + gap) * (float)0.5;
	      if(tmp >  0) {
	         buf[j-1] -= tmp;
	         buf[j]   += tmp;
	      }
	   }
	    return;
	}

	/*----------------------------------------------------------------------------
	 * lsp_expand_2 - check for higher (5-9)
	 *----------------------------------------------------------------------------
	 */
	public static void lsp_expand_2(
	 float  buf[],          /*in/out: lsp vectors  */
	 float gap

	)
	{
	   int   j;
	   float diff, tmp;

	   for(j=LD8KConstants.NC; j<LD8KConstants.M; j++) {
	      diff = buf[j-1] - buf[j];
	      tmp  = (diff + gap) * (float)0.5;
	      if(tmp >  0) {
	         buf[j-1] -= tmp;
	         buf[j]   += tmp;
	      }
	   }
	    return;
	}

	/*----------------------------------------------------------------------------
	 * lsp_expand_1_2 - ..
	 *----------------------------------------------------------------------------
	 */
	public static void lsp_expand_1_2(
	 float  buf[],          /*in/out: LSP parameters  */
	 float  gap             /*input      */
	)
	{
	   int   j;
	   float diff, tmp;

	   for(j=1; j<LD8KConstants.M; j++) {
	      diff = buf[j-1] - buf[j];
	      tmp  = (diff + gap) * (float)0.5;
	      if(tmp >  0) {
	         buf[j-1] -= tmp;
	         buf[j]   += tmp;
	      }
	   }
	   return;
	}



	/*
	  Functions which use previous LSP parameter (freq_prev).
	*/


	/*
	  compose LSP parameter from elementary LSP with previous LSP.
	*/
	public static  void lsp_prev_compose(
	  float lsp_ele[],             /* (i) Q13 : LSP vectors                 */
	  float lsp[],                 /* (o) Q13 : quantized LSP parameters    */
	  float fg[][],               /* (i) Q15 : MA prediction coef.         */
	  float freq_prev[][],        /* (i) Q13 : previous LSP vector         */
	  float fg_sum[]               /* (i) Q15 : present MA prediction coef. */
	)
	{
	   int j, k;

	   for(j=0; j<LD8KConstants.M; j++) {
	      lsp[j] = lsp_ele[j] * fg_sum[j];
	      for(k=0; k<LD8KConstants.MA_NP; k++) lsp[j] += freq_prev[k][j]*fg[k][j];
	   }
	   return;
	}

	/*
	  extract elementary LSP from composed LSP with previous LSP
	*/
	public static void lsp_prev_extract(
	  float lsp[],                /* (i) Q13 : unquantized LSP parameters  */
	  float lsp_ele[],            /* (o) Q13 : target vector               */
	  float fg[][],          /* (i) Q15 : MA prediction coef.         */
	  float freq_prev[][],   /* (i) Q13 : previous LSP vector         */
	  float fg_sum_inv[]          /* (i) Q12 : inverse previous LSP vector */
	)
	{
	  int j, k;

	  /*----- compute target vectors for each MA coef.-----*/
	  for( j = 0 ; j < LD8KConstants.M ; j++ ) {
	      lsp_ele[j]=lsp[j];
	      for ( k = 0 ; k < LD8KConstants.MA_NP ; k++ )
	         lsp_ele[j] -= freq_prev[k][j] * fg[k][j];
	      lsp_ele[j] *= fg_sum_inv[j];
	   }

	   return;
	}
	/*
	  update previous LSP parameter
	*/
	public static void lsp_prev_update(
	  float lsp_ele[],             /* input : LSP vectors           */
	  float freq_prev[][]     /* input/output: previous LSP vectors  */
	)
	{
	  int k;

	  for ( k = LD8KConstants.MA_NP-1 ; k > 0 ; k-- )
	    Util.copy(freq_prev[k-1], freq_prev[k], LD8KConstants.M);

	  Util. copy(lsp_ele, freq_prev[0], LD8KConstants.M);
	  return;
	}
	/*----------------------------------------------------------------------------
	 * lsp_stability - check stability of lsp coefficients
	 *----------------------------------------------------------------------------
	 */
	public static void lsp_stability(
	 float  buf[]           /*in/out: LSP parameters  */
	)
	{
	   int   j;
	   float diff, tmp;


	   for(j=0; j<LD8KConstants.M-1; j++) {
	      diff = buf[j+1] - buf[j];
	      if( diff < (float)0. ) {
	         tmp      = buf[j+1];
	         buf[j+1] = buf[j];
	         buf[j]   = tmp;
	      }
	   }

	   if( buf[0] < LD8KConstants.L_LIMIT ) {
	      buf[0] = LD8KConstants.L_LIMIT;
	      System.out.println("warning LSP Low \n");
	   }
	   for(j=0; j<LD8KConstants.M-1; j++) {
	      diff = buf[j+1] - buf[j];
	      if( diff < LD8KConstants.GAP3 ) {
	        buf[j+1] = buf[j]+ LD8KConstants.GAP3;
	      }
	   }
	   if( buf[LD8KConstants.M-1] > LD8KConstants.M_LIMIT ) {
	      buf[LD8KConstants.M-1] = LD8KConstants.M_LIMIT;
	      System.out.println("warning LSP High \n");
	   }
	   return;
	}

}

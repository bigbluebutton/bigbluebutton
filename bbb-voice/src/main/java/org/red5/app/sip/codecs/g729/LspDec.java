package org.red5.app.sip.codecs.g729;
//package org.mobicents.media.server.impl.dsp.audio.g729;

public class LspDec {

	/* static memory */
	float freq_prev[][] = new float[LD8KConstants.MA_NP][LD8KConstants.M];    /* previous LSP vector       */
	float freq_prev_reset[] = new float[]{  /* previous LSP vector(init) */
	 (float)0.285599,  (float)0.571199,  (float)0.856798,  (float)1.142397,  (float)1.427997,
	 (float)1.713596,  (float)1.999195,  (float)2.284795,  (float)2.570394,  (float)2.855993
	};     /* PI*(float)(j+1)/(float)(M+1) */

	/* static memory for frame erase operation */
	static int prev_ma;                  /* previous MA prediction coef.*/
	static float prev_lsp[] = new float[LD8KConstants.M];            /* previous LSP vector         */


	/*----------------------------------------------------------------------------
	 * Lsp_decw_reset -   set the previous LSP vectors
	 *----------------------------------------------------------------------------
	 */
	void lsp_decw_reset()
	{
	   int  i;

	   for(i=0; i<LD8KConstants.MA_NP; i++)
	     Util.copy (freq_prev_reset, freq_prev[i], LD8KConstants.M );

	   prev_ma = 0;

	   Util.copy (freq_prev_reset, prev_lsp, LD8KConstants.M );

	   return;
	}


	/*----------------------------------------------------------------------------
	 * lsp_iqua_cs -  LSP main quantization routine
	 *----------------------------------------------------------------------------
	 */
	public void lsp_iqua_cs(
	 int    prm[], int prms,          /* input : codes of the selected LSP */
	 float  lsp_q[],        /* output: Quantized LSP parameters  */
	 int    erase           /* input : frame erase information   */
	)
	{
	   int  mode_index;
	   int  code0;
	   int  code1;
	   int  code2;
	   float buf[] = new float[LD8KConstants.M];


	   if(erase==0)                 /* Not frame erasure */
	     {
	        mode_index = (prm[prms+0] >> LD8KConstants.NC0_B) & 1;
	        code0 = prm[prms+0] & (short)(LD8KConstants.NC0 - 1);
	        code1 = (prm[prms+1] >> LD8KConstants.NC1_B) & (short)(LD8KConstants.NC1 - 1);
	        code2 = prm[prms+1] & (short)(LD8KConstants.NC1 - 1);

	        LspGetq.lsp_get_quant(TabLD8k.lspcb1, TabLD8k.lspcb2, code0, code1, code2, TabLD8k.fg[mode_index],
	              freq_prev, lsp_q, TabLD8k.fg_sum[mode_index]);

	        Util.copy(lsp_q, prev_lsp, LD8KConstants.M );
	        prev_ma = mode_index;
	     }
	   else                         /* Frame erased */
	     {
	       Util.copy(prev_lsp, lsp_q, LD8KConstants.M );

	        /* update freq_prev */
	       LspGetq.lsp_prev_extract(prev_lsp, buf,
	          TabLD8k.fg[prev_ma], freq_prev, TabLD8k.fg_sum_inv[prev_ma]);
	       LspGetq.lsp_prev_update(buf, freq_prev);
	     }
	     return;
	}
	/*----------------------------------------------------------------------------
	 * d_lsp - decode lsp parameters
	 *----------------------------------------------------------------------------
	 */
	public void d_lsp(
	    int     index[], int is,    /* input : indexes                 */
	    float   lsp_q[],    /* output: decoded lsp             */
	    int     bfi         /* input : frame erase information */
	)
	{
	   int i;

	   lsp_iqua_cs(index, is, lsp_q,bfi); /* decode quantized information */

	   /* Convert LSFs to LSPs */

	   for (i=0; i<LD8KConstants.M; i++ )
	     lsp_q[i] = (float)Math.cos(lsp_q[i]);

	   return;
	}


}

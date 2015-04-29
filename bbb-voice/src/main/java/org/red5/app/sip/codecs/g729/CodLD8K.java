package org.red5.app.sip.codecs.g729;
//package org.mobicents.media.server.impl.dsp.audio.g729;


public class CodLD8K {
	  /*-----------------------------------------------------------------------*
	   *      Initialize pointers to speech vector.                            *
	   *                                                                       *
	   *                                                                       *
	   *   |--------------------|-------------|-------------|------------|     *
	   *     previous speech           sf1           sf2         L_NEXT        *
	   *                                                                       *
	   *   <----------------  Total speech vector (L_TOTAL)   ----------->     *
	   *   |   <------------  LPC analysis window (L_WINDOW)  ----------->     *
	   *   |   |               <-- present frame (L_FRAME) -->                 *
	   * old_speech            |              <-- new speech (L_FRAME) -->     *
	   *     p_wind            |              |                                *
	   *                     speech           |                                *
	   *                             new_speech                                *
	   *-----------------------------------------------------------------------*/

    /* Speech vector */
	float[] old_speech_array = new float[LD8KConstants.L_TOTAL];
	int old_speech;
	int speech;
	int p_window;
	int new_speech;
	
    /* Weighted speech vector */

	float[] old_wsp_array = new float[LD8KConstants.L_FRAME+LD8KConstants.PIT_MAX];
	int old_wsp;
	int wsp;

	                /* Excitation vector */

	float[] old_exc_array = new float[LD8KConstants.L_FRAME+LD8KConstants.PIT_MAX+LD8KConstants.L_INTERPOL];
	int old_exc;
	int exc;

	        /* Zero vector */

	float[] ai_zero_array = new float[LD8KConstants.L_SUBFR+LD8KConstants.MP1];
	int ai_zero;
	int zero;


	                /* Lsp (Line spectral pairs) */
	float[] lsp_old =
	     { (float)0.9595,  (float)0.8413,  (float)0.6549,  (float)0.4154,  (float)0.1423,
	      (float)-0.1423, (float)-0.4154, (float)-0.6549, (float)-0.8413, (float)-0.9595};
	float[] lsp_old_q = new float[LD8KConstants.M];

	        /* Filter's memory */

	float[] mem_syn = new float[LD8KConstants.M];
	float[] mem_w0 = new float[LD8KConstants.M];
	float[] mem_w = new float[LD8KConstants.M];
	float[] mem_err_array = new float[LD8KConstants.M+LD8KConstants.L_SUBFR];
	int mem_err;
	int error;

	float sharp;
	
	Lpc lpc = new Lpc();
	QuaLsp quaLsp = new QuaLsp();
	Pwf pwf = new Pwf();
	Taming tamingFunc = new Taming();
	CelpCo acelp = new CelpCo();
	QuaGain quaGain = new QuaGain();

	/*----------------------------------------------------------------------------
	 * init_coder_ld8k - initialization of variables for the encoder
	 *----------------------------------------------------------------------------
	 */
	public void init_coder_ld8k()
	{
	  /*-----------------------------------------------------------------------*
	   *      Initialize pointers to speech vector.                            *
	   *                                                                       *
	   *                                                                       *
	   *   |--------------------|-------------|-------------|------------|     *
	   *     previous speech           sf1           sf2         L_NEXT        *
	   *                                                                       *
	   *   <----------------  Total speech vector (L_TOTAL)   ----------->     *
	   *   |   <------------  LPC analysis window (L_WINDOW)  ----------->     *
	   *   |   |               <-- present frame (L_FRAME) -->                 *
	   * old_speech            |              <-- new speech (L_FRAME) -->     *
	   *     p_wind            |              |                                *
	   *                     speech           |                                *
	   *                             new_speech                                *
	   *-----------------------------------------------------------------------*/

	  new_speech = old_speech + LD8KConstants.L_TOTAL - LD8KConstants.L_FRAME;         /* New speech     */
	  speech     = new_speech - LD8KConstants.L_NEXT;                    /* Present frame  */
	  p_window   = old_speech + LD8KConstants.L_TOTAL - LD8KConstants.L_WINDOW;        /* For LPC window */

	  /* Initialize static pointers */

	  wsp    = old_wsp + LD8KConstants.PIT_MAX;
	  exc    = old_exc + LD8KConstants.PIT_MAX + LD8KConstants.L_INTERPOL;
	  zero   = ai_zero + LD8KConstants.MP1;
	  error  = mem_err + LD8KConstants.M;

	  /* Static vectors to zero */
/*
	  set_zero(old_speech, LD8KConstants.L_TOTAL);
	  set_zero(old_exc, PIT_MAX+L_INTERPOL);
	  set_zero(old_wsp, PIT_MAX);
	  set_zero(mem_syn, M);
	  set_zero(mem_w,   M);
	  set_zero(mem_w0,  M);
	  set_zero(mem_err, M);
	  set_zero(zero, L_SUBFR);
	  sharp = SHARPMIN;
*/
	  sharp = LD8KConstants.SHARPMIN;
	  /* Initialize lsp_old_q[] */
	  System.arraycopy(lsp_old, 0, lsp_old_q, 0, LD8KConstants.M);

	  quaLsp.lsp_encw_reset();
	  tamingFunc.init_exc_err();

	 return;
	}
	
	public void loadSpeech(float[] newSpeech) {
		int i=239;
		for(int q=79; q>=0; q--) {
			old_speech_array[i--] = newSpeech[q];
		}
	}

	/*----------------------------------------------------------------------------
	 * coder_ld8k - encoder routine ( speech data should be in new_speech )
	 *----------------------------------------------------------------------------
	 */
	public void coder_ld8k(
	 int[] ana_array, int ana             /* output: analysis parameters */
	)
	{
	  
	  /* LPC coefficients */
	  float[] r = new float[LD8KConstants.MP1];                /* Autocorrelations low and hi          */
	  float[] A_t = new float[(LD8KConstants.MP1)*2];          /* A(z) unquantized for the 2 subframes */
	  float[] Aq_t = new float[(LD8KConstants.MP1)*2];         /* A(z)   quantized for the 2 subframes */
	  float[] Ap1 = new float[LD8KConstants.MP1];              /* A(z) with spectral expansion         */
	  float[] Ap2 = new float[LD8KConstants.MP1];              /* A(z) with spectral expansion         */
	  int A, Aq;               /* Pointer on A_t and Aq_t              */

	  /* LSP coefficients */
	  float[] lsp_new = new float[LD8KConstants.M];
	  float[] lsp_new_q = new float[LD8KConstants.M]; /* LSPs at 2th subframe                 */
	  float[] lsf_int = new float[LD8KConstants.M];               /* Interpolated LSF 1st subframe.       */
	  float[] lsf_new = new float[LD8KConstants.M];

	  /* Variable added for adaptive gamma1 and gamma2 of the PWF */

	  float[] rc = new float[LD8KConstants.M];                        /* Reflection coefficients */
	  float[] gamma1 = new float[2];             /* Gamma1 for 1st and 2nd subframes */
	  float[] gamma2 = new float[2];             /* Gamma2 for 1st and 2nd subframes */

	  /* Other vectors */
	  float[] synth = new float[LD8KConstants.L_FRAME];        /* Buffer for synthesis speech        */
	  float[] h1 = new float[LD8KConstants.L_SUBFR];           /* Impulse response h1[]              */
	  float[] xn = new float[LD8KConstants.L_SUBFR];           /* Target vector for pitch search     */
	  float[] xn2 = new float[LD8KConstants.L_SUBFR];          /* Target vector for codebook search  */
	  float[] code = new float[LD8KConstants.L_SUBFR];         /* Fixed codebook excitation          */
	  float[] y1 = new float[LD8KConstants.L_SUBFR];           /* Filtered adaptive excitation       */
	  float[] y2 = new float[LD8KConstants.L_SUBFR];           /* Filtered fixed codebook excitation */
	  float[] g_coeff = new float[5];            /* Correlations between xn, y1, & y2:
	                                  <y1,y1>, <xn,y1>, <y2,y2>, <xn,y2>,<y1,y2>*/

	  /* Scalars */

	  int   i, j, i_gamma, i_subfr;
	  int   T_op, t0;
	  IntegerPointer t0_frac = new IntegerPointer();
	  IntegerPointer t0_min = new IntegerPointer();
	  IntegerPointer t0_max = new IntegerPointer();
	  int   index, taming;
	  float gain_pit, gain_code=0;

	/*------------------------------------------------------------------------*
	 *  - Perform LPC analysis:                                               *
	 *       * autocorrelation + lag windowing                                *
	 *       * Levinson-durbin algorithm to find a[]                          *
	 *       * convert a[] to lsp[]                                           *
	 *       * quantize and code the LSPs                                     *
	 *       * find the interpolated LSPs and convert to a[] for the 2        *
	 *         subframes (both quantized and unquantized)                     *
	 *------------------------------------------------------------------------*/

	  /* LP analysis */

	  lpc.autocorr(ArrayUtils.subArray(old_speech_array, p_window), LD8KConstants.M, r);                     /* Autocorrelations */
	  lpc.lag_window(LD8KConstants.M, r);                             /* Lag windowing    */
	  
	  float[] tmp = ArrayUtils.subArray(A_t, LD8KConstants.MP1);
	  lpc.levinson(r, tmp, rc);                   /* Levinson Durbin  */
	  ArrayUtils.replace(A_t, LD8KConstants.MP1, tmp); 
	  
	  lpc.az_lsp(tmp, lsp_new, lsp_old);          /* From A(z) to lsp */
	  ArrayUtils.replace(A_t, LD8KConstants.MP1, tmp); 
	  /* LSP quantization */

	  quaLsp.qua_lsp(lsp_new, lsp_new_q, ana_array);
	  ana += 2;                         /* Advance analysis parameters pointer */

	  /*--------------------------------------------------------------------*
	   * Find interpolated LPC parameters in all subframes (both quantized  *
	   * and unquantized).                                                  *
	   * The interpolated parameters are in array A_t[] of size (M+1)*4     *
	   * and the quantized interpolated parameters are in array Aq_t[]      *
	   *--------------------------------------------------------------------*/

	  LpcFunc.int_lpc(lsp_old, lsp_new, lsf_int, lsf_new,  A_t);
	  LpcFunc.int_qlpc(lsp_old_q, lsp_new_q, Aq_t);

	  /* update the LSPs for the next frame */

	  for(i=0; i<LD8KConstants.M; i++)
	  {
	    lsp_old[i]   = lsp_new[i];
	    lsp_old_q[i] = lsp_new_q[i];
	  }

	 /*----------------------------------------------------------------------*
	  * - Find the weighting factors                                         *
	  *----------------------------------------------------------------------*/

	  pwf.perc_var(gamma1, gamma2, lsf_int, lsf_new, rc);


	 /*----------------------------------------------------------------------*
	  * - Find the weighted input speech w_sp[] for the whole speech frame   *
	  * - Find the open-loop pitch delay for the whole speech frame          *
	  * - Set the range for searching closed-loop pitch in 1st subframe      *
	  *----------------------------------------------------------------------*/

	  LpcFunc.weight_az(A_t, 0, gamma1[0], LD8KConstants.M, Ap1, 0);
	  LpcFunc.weight_az(A_t, 0, gamma2[0], LD8KConstants.M, Ap2, 0);
	  
	  Filter.residu(Ap1, 0, old_speech_array, speech, old_wsp_array, wsp, LD8KConstants.L_SUBFR);
	  Filter.syn_filt(Ap2, 0, old_wsp_array, wsp, old_wsp_array, wsp, LD8KConstants.L_SUBFR, mem_w, 0, 1);
	  
	  LpcFunc.weight_az(A_t, LD8KConstants.MP1, gamma1[1], LD8KConstants.M, Ap1, 0);
	  LpcFunc.weight_az(A_t, LD8KConstants.MP1, gamma2[1], LD8KConstants.M, Ap2, 0);
	  Filter.residu(Ap1, 0, old_speech_array, speech + LD8KConstants.L_SUBFR, old_wsp_array, wsp + LD8KConstants.L_SUBFR, LD8KConstants.L_SUBFR);
	  Filter.syn_filt(Ap2, 0, old_wsp_array, wsp + LD8KConstants.L_SUBFR, old_wsp_array, wsp + LD8KConstants.L_SUBFR, LD8KConstants.L_SUBFR, mem_w, 0, 1);
	  
	  /* Find open loop pitch lag for whole speech frame */

	  T_op = Pitch.pitch_ol(old_wsp_array, wsp, LD8KConstants.PIT_MIN, LD8KConstants.PIT_MAX, LD8KConstants.L_FRAME);

	  /* range for closed loop pitch search in 1st subframe */

	  t0_min.value = T_op - 3;
	  if (t0_min.value < LD8KConstants.PIT_MIN) t0_min.value = (int)LD8KConstants.PIT_MIN;
	  t0_max.value = t0_min.value + 6;
	  if (t0_max.value > LD8KConstants.PIT_MAX)
	    {
	       t0_max.value = (int)LD8KConstants.PIT_MAX;
	       t0_min.value = t0_max.value - 6;
	    }

	 /*------------------------------------------------------------------------*
	  *          Loop for every subframe in the analysis frame                 *
	  *------------------------------------------------------------------------*
	  *  To find the pitch and innovation parameters. The subframe size is     *
	  *  L_SUBFR and the loop is repeated L_FRAME/L_SUBFR times.               *
	  *     - find the weighted LPC coefficients                               *
	  *     - find the LPC residual signal                                     *
	  *     - compute the target signal for pitch search                       *
	  *     - compute impulse response of weighted synthesis filter (h1[])     *
	  *     - find the closed-loop pitch parameters                            *
	  *     - encode the pitch delay                                           *
	  *     - update the impulse response h1[] by including fixed-gain pitch   *
	  *     - find target vector for codebook search                           *
	  *     - codebook search                                                  *
	  *     - encode codebook address                                          *
	  *     - VQ of pitch and codebook gains                                   *
	  *     - find synthesis speech                                            *
	  *     - update states of weighting filter                                *
	  *------------------------------------------------------------------------*/

	  A  = 0;//A_t;     /* pointer to interpolated LPC parameters           */
	  Aq = 0;//Aq_t;    /* pointer to interpolated quantized LPC parameters */

	  i_gamma = 0;

	  for (i_subfr = 0;  i_subfr < LD8KConstants.L_FRAME; i_subfr += LD8KConstants.L_SUBFR)
	  {
	   /*---------------------------------------------------------------*
	    * Find the weighted LPC coefficients for the weighting filter.  *
	    *---------------------------------------------------------------*/

	    LpcFunc.weight_az(A_t, A, gamma1[i_gamma], LD8KConstants.M, Ap1, 0);
	    LpcFunc.weight_az(A_t, A, gamma2[i_gamma], LD8KConstants.M, Ap2, 0);
	    i_gamma++;

	   /*---------------------------------------------------------------*
	    * Compute impulse response, h1[], of weighted synthesis filter  *
	    *---------------------------------------------------------------*/

	    for (i = 0; i <= LD8KConstants.M; i++) ai_zero_array[ai_zero+i] = Ap1[i];
	    Filter.syn_filt(Aq_t, Aq, ai_zero_array, ai_zero, h1, 0, LD8KConstants.L_SUBFR, ai_zero_array, zero, 0);
	    Filter.syn_filt(Ap2, 0, h1, 0, h1, 0, LD8KConstants.L_SUBFR, ai_zero_array, zero, 0);

	   /*------------------------------------------------------------------------*
	    *                                                                        *
	    *          Find the target vector for pitch search:                      *
	    *          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~                       *
	    *                                                                        *
	    *              |------|  res[n]                                          *
	    *  speech[n]---| A(z) |--------                                          *
	    *              |------|       |   |--------| error[n]  |------|          *
	    *                    zero -- (-)--| 1/A(z) |-----------| W(z) |-- target *
	    *                    exc          |--------|           |------|          *
	    *                                                                        *
	    * Instead of subtracting the zero-input response of filters from         *
	    * the weighted input speech, the above configuration is used to          *
	    * compute the target vector. This configuration gives better performance *
	    * with fixed-point implementation. The memory of 1/A(z) is updated by    *
	    * filtering (res[n]-exc[n]) through 1/A(z), or simply by subtracting     *
	    * the synthesis speech from the input speech:                            *
	    *    error[n] = speech[n] - syn[n].                                      *
	    * The memory of W(z) is updated by filtering error[n] through W(z),      *
	    * or more simply by subtracting the filtered adaptive and fixed          *
	    * codebook excitations from the target:                                  *
	    *     target[n] - gain_pit*y1[n] - gain_code*y2[n]                       *
	    * as these signals are already available.                                *
	    *                                                                        *
	    *------------------------------------------------------------------------*/


	    Filter.residu(Aq_t, Aq, old_speech_array, speech + i_subfr, old_exc_array, exc + i_subfr, LD8KConstants.L_SUBFR);   /* LPC residual */

	    Filter.syn_filt(Aq_t, Aq, old_exc_array, exc+i_subfr, mem_err_array, error,	LD8KConstants.L_SUBFR, mem_err_array, mem_err, 0);

	    Filter.residu(Ap1, 0, mem_err_array, error, xn, 0, LD8KConstants.L_SUBFR);

	    Filter.syn_filt(Ap2, 0, xn, 0, xn, 0, LD8KConstants.L_SUBFR, mem_w0, 0, 0);    /* target signal xn[]*/

	   /*----------------------------------------------------------------------*
	    *                 Closed-loop fractional pitch search                  *
	    *----------------------------------------------------------------------*/

	    t0 = Pitch.pitch_fr3(old_exc_array,exc+i_subfr, xn, 0, h1, 0, LD8KConstants.L_SUBFR, t0_min.value, t0_max.value,
	                              i_subfr, t0_frac);


	    index = Pitch.enc_lag3(t0, t0_frac.value, t0_min, t0_max,LD8KConstants.PIT_MIN,LD8KConstants.PIT_MAX,i_subfr);

	    ana_array[ana++] = index;
	    if (i_subfr == 0)
	    	ana_array[ana++] = PParity.parity_pitch(index);


	   /*-----------------------------------------------------------------*
	    *   - find unity gain pitch excitation (adaptive codebook entry)  *
	    *     with fractional interpolation.                              *
	    *   - find filtered pitch exc. y1[]=exc[] convolve with h1[])     *
	    *   - compute pitch gain and limit between 0 and 1.2              *
	    *   - update target vector for codebook search                    *
	    *   - find LTP residual.                                          *
	    *-----------------------------------------------------------------*/

	    PredLt.pred_lt_3(old_exc_array,exc + i_subfr, t0, t0_frac.value, LD8KConstants.L_SUBFR);

	    Filter.convolve(old_exc_array,exc+i_subfr, h1, 0, y1, 0, LD8KConstants.L_SUBFR);

	    gain_pit = Pitch.g_pitch(xn, 0, y1, 0, g_coeff, 0, LD8KConstants.L_SUBFR);

	    /* clip pitch gain if taming is necessary */
	    taming = tamingFunc.test_err(t0, t0_frac.value);

	    if( taming == 1){
	      if ( gain_pit>  LD8KConstants.GPCLIP) {
	        gain_pit = LD8KConstants.GPCLIP;
	      }
	    }

	    for (i = 0; i < LD8KConstants.L_SUBFR; i++)
	       xn2[i] = xn[i] - y1[i]*gain_pit;

	   /*-----------------------------------------------------*
	    * - Innovative codebook search.                       *
	    *-----------------------------------------------------*/

	    IntegerPointer tmpi = new IntegerPointer(i);
	    index = acelp.ACELP_codebook(xn2, h1, t0, sharp, i_subfr, code, y2, tmpi);
	    i = tmpi.value;
	    ana_array[ana++] = index;        /* Positions index */
	    ana_array[ana++] = i;            /* Signs index     */


	   /*-----------------------------------------------------*
	    * - Quantization of gains.                            *
	    *-----------------------------------------------------*/
	    CorFunc.corr_xy2(xn, y1, y2, g_coeff);

	    FloatPointer tmpgain_pit = new FloatPointer(gain_pit), tmpgain_code = new FloatPointer(gain_code);
	    ana_array[ana++] = quaGain.qua_gain(code, g_coeff, LD8KConstants.L_SUBFR, tmpgain_pit, tmpgain_code, taming );
	    gain_pit = tmpgain_pit.value; gain_code = tmpgain_code.value;
	    
	   /*------------------------------------------------------------*
	    * - Update pitch sharpening "sharp" with quantized gain_pit  *
	    *------------------------------------------------------------*/

	    sharp = gain_pit;
	    if (sharp > LD8KConstants.SHARPMAX) sharp = LD8KConstants.SHARPMAX;
	    if (sharp < LD8KConstants.SHARPMIN) sharp = LD8KConstants.SHARPMIN;
	    /*------------------------------------------------------*
	     * - Find the total excitation                          *
	     * - find synthesis speech corresponding to exc[]       *
	     * - update filters' memories for finding the target    *
	     *   vector in the next subframe                        *
	     *   (update error[-m..-1] and mem_w0[])                *
	     *   update error function for taming process           *
	     *------------------------------------------------------*/

	    for (i = 0; i < LD8KConstants.L_SUBFR;  i++)
	      old_exc_array[exc+i+i_subfr] = gain_pit*old_exc_array[exc+i+i_subfr] + gain_code*code[i];

	    tamingFunc.update_exc_err(gain_pit, t0);

	    Filter.syn_filt(Aq_t, Aq, old_exc_array, exc+i_subfr, synth, i_subfr, LD8KConstants.L_SUBFR, mem_syn, 0, 1);

	    for (i = LD8KConstants.L_SUBFR-LD8KConstants.M, j = 0; i < LD8KConstants.L_SUBFR; i++, j++)
	      {
	    	 mem_err_array[mem_err+j] = old_speech_array[speech+i_subfr+i] - synth[i_subfr+i];
	         mem_w0[j]  = xn[i] - gain_pit*y1[i] - gain_code*y2[i];
	      }
	    A  += LD8KConstants.MP1;      /* interpolated LPC parameters for next subframe */
	    Aq += LD8KConstants.MP1;

	  }

	  /*--------------------------------------------------*
	   * Update signal for next frame.                    *
	   * -> shift to the left by L_FRAME:                 *
	   *     speech[], wsp[] and  exc[]                   *
	   *--------------------------------------------------*/

	  Util.copy(old_speech_array,old_speech+LD8KConstants.L_FRAME, old_speech_array, old_speech, LD8KConstants.L_TOTAL-LD8KConstants.L_FRAME);
	  Util.copy(old_wsp_array, old_wsp+LD8KConstants.L_FRAME, old_wsp_array, old_wsp, LD8KConstants.PIT_MAX);
	  Util.copy(old_exc_array, old_exc+LD8KConstants.L_FRAME, old_exc_array, old_exc, LD8KConstants.PIT_MAX+LD8KConstants.L_INTERPOL);


	  return;
	}


	
}

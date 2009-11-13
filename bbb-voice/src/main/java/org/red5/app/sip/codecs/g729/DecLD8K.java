package org.red5.app.sip.codecs.g729;
//package org.mobicents.media.server.impl.dsp.audio.g729;

public class DecLD8K {


	/*---------------------------------------------------------------*
	 *   Decoder constant parameters (defined in "ld8k.h")           *
	 *---------------------------------------------------------------*
	 *   L_FRAME     : Frame size.                                   *
	 *   L_SUBFR     : Sub-frame size.                               *
	 *   M           : LPC order.                                    *
	 *   MP1         : LPC order+1                                   *
	 *   PIT_MIN     : Minimum pitch lag.                            *
	 *   PIT_MAX     : Maximum pitch lag.                            *
	 *   L_INTERPOL  : Length of filter for interpolation            *
	 *   PRM_SIZE    : Size of vector containing analysis parameters *
	 *---------------------------------------------------------------*/

	/*--------------------------------------------------------*
	 *         Static memory allocation.                      *
	 *--------------------------------------------------------*/

	        /* Excitation vector */

	float old_exc_array[] = new float[LD8KConstants.L_FRAME+LD8KConstants.PIT_MAX+LD8KConstants.L_INTERPOL];
	int exc;

	        /* Lsp (Line spectral pairs) */

	float lsp_old[]= new float[]{
	       (float)0.9595,  (float)0.8413,  (float)0.6549,  (float)0.4154,  (float)0.1423,
	      (float)-0.1423, (float)-0.4154, (float)-0.6549, (float)-0.8413, (float)-0.9595};

	        /* Filter's memory */
	float mem_syn[] = new float[LD8KConstants.M];        /* Filter's memory */

	float sharp ;            /* pitch sharpening of previous fr */
	int old_t0;              /* integer delay of previous frame */
	FloatPointer gain_code = new FloatPointer();         /* fixed codebook gain */
	FloatPointer gain_pitch = new FloatPointer();       /* adaptive codebook gain */
	LspDec lspDec = new LspDec();
	DecGain decGain = new DecGain();

	/*--------------------------------------------------------------------------
	 * init_decod_ld8k - Initialization of variables for the decoder section.
	 *--------------------------------------------------------------------------
	 */
	public void init_decod_ld8k()
	{
	    /* Initialize static pointer */
	    exc    = 0 + LD8KConstants.PIT_MAX + LD8KConstants.L_INTERPOL;

	    /* Static vectors to zero */
	    Util.set_zero(old_exc_array,LD8KConstants.PIT_MAX + LD8KConstants.L_INTERPOL);
	    Util.set_zero(mem_syn, LD8KConstants.M);

	    sharp = LD8KConstants.SHARPMIN;
	    old_t0 = 60;
	    gain_code.value = (float)0.;
	    gain_pitch.value = (float)0.;

	    lspDec.lsp_decw_reset();

	    return;
	}

	/*--------------------------------------------------------------------------
	 * decod_ld8k - decoder
	 *--------------------------------------------------------------------------
	 */
	public void decod_ld8k(
	 int parm[], int parms,            /* input : synthesis parameters (parm[0] = bfi)       */
	 int voicing,           /* input : voicing decision from previous frame       */
	 float synth[],int ss,         /* output: synthesized speech                         */
	 float A_t[],           /* output: two sets of A(z) coefficients length=2*MP1 */
	 IntegerPointer t0_first          /* output: integer delay of first subframe            */
	)
	{
	   int Az;                  /* Pointer to A_t (LPC coefficients)  */
	   float lsp_new[] = new float[LD8KConstants.M];           /* LSPs                               */
	   float code[] = new float[LD8KConstants.L_SUBFR];        /* algebraic codevector               */

	  /* Scalars */
	  int   i, i_subfr;
	  int   index;

	  IntegerPointer t0 = new IntegerPointer(), t0_frac = new IntegerPointer();
	  int bfi;
	  int bad_pitch;

	  /* Test bad frame indicator (bfi) */

	  bfi = parm[parms++];

	  /* Decode the LSPs */

	  lspDec.d_lsp(parm, parms, lsp_new, bfi);
	  parms += 2;             /* Advance synthesis parameters pointer */

	  /* Interpolation of LPC for the 2 subframes */

	  LpcFunc.int_qlpc(lsp_old, lsp_new, A_t);

	  /* update the LSFs for the next frame */

	  Util.copy(lsp_new, lsp_old, LD8KConstants.M);

	/*------------------------------------------------------------------------*
	 *          Loop for every subframe in the analysis frame                 *
	 *------------------------------------------------------------------------*
	 * The subframe size is L_SUBFR and the loop is repeated L_FRAME/L_SUBFR  *
	 *  times                                                                 *
	 *     - decode the pitch delay                                           *
	 *     - decode algebraic code                                            *
	 *     - decode pitch and codebook gains                                  *
	 *     - find the excitation and compute synthesis speech                 *
	 *------------------------------------------------------------------------*/

	  Az = 0;//A_t;            /* pointer to interpolated LPC parameters */

	  for (i_subfr = 0; i_subfr < LD8KConstants.L_FRAME; i_subfr += LD8KConstants.L_SUBFR) {

	   index = parm[parms++];          /* pitch index */

	   if (i_subfr == 0) {      /* if first subframe */
	     i = parm[parms++];             /* get parity check result */
	     bad_pitch = bfi+ i;
	     if( bad_pitch == 0)
	     {
	       DecLag.dec_lag3(index, LD8KConstants.PIT_MIN, LD8KConstants.PIT_MAX, i_subfr, t0, t0_frac);
	       old_t0 = t0.value;
	     }
	     else                     /* Bad frame, or parity error */
	     {
	       t0.value  =  old_t0;
	       t0_frac.value = 0;
	       old_t0++;
	       if( old_t0> LD8KConstants.PIT_MAX) {
	           old_t0 = LD8KConstants.PIT_MAX;
	       }
	     }
	      t0_first.value = t0.value;         /* If first frame */
	   }
	   else                       /* second subframe */
	   {
	     if( bfi == 0)
	     {
	       DecLag.dec_lag3(index, LD8KConstants.PIT_MIN, LD8KConstants.PIT_MAX, i_subfr, t0, t0_frac);
	       old_t0 = t0.value;
	     }
	     else
	     {
	       t0.value  =  old_t0;
	       t0_frac.value = 0;
	       old_t0++;
	       if( old_t0 >LD8KConstants.PIT_MAX) {
	           old_t0 = LD8KConstants.PIT_MAX;
	       }
	     }
	   }


	   /*-------------------------------------------------*
	    *  - Find the adaptive codebook vector.            *
	    *--------------------------------------------------*/

	   PredLt.pred_lt_3(old_exc_array, exc+i_subfr, t0.value, t0_frac.value, LD8KConstants.L_SUBFR);

	   /*-------------------------------------------------------*
	    * - Decode innovative codebook.                         *
	    * - Add the fixed-gain pitch contribution to code[].    *
	    *-------------------------------------------------------*/

	   if(bfi != 0) {            /* Bad Frame Error Concealment */
	     parm[parms+0] = (int) (Util.random_g729() & 0x1fff);      /* 13 bits random*/
	     parm[parms+1]= (int) (Util.random_g729() & 0x000f);      /*  4 bits random */
	   }

	   DecAcelp.decod_ACELP(parm[parms+1], parm[parms+0], code);
	   parms +=2;
	   for (i = t0.value; i < LD8KConstants.L_SUBFR; i++)   code[i] += sharp * code[i-t0.value];

	   /*-------------------------------------------------*
	    * - Decode pitch and codebook gains.              *
	    *-------------------------------------------------*/

	   index = parm[parms++];          /* index of energy VQ */
	   decGain.dec_gain(index, code, LD8KConstants.L_SUBFR, bfi, gain_pitch, gain_code);

	   /*-------------------------------------------------------------*
	    * - Update pitch sharpening "sharp" with quantized gain_pitch *
	    *-------------------------------------------------------------*/

	   sharp = gain_pitch.value;
	   if (sharp > LD8KConstants.SHARPMAX) sharp = LD8KConstants.SHARPMAX;
	   if (sharp < LD8KConstants.SHARPMIN) sharp = LD8KConstants.SHARPMIN;

	   /*-------------------------------------------------------*
	    * - Find the total excitation.                          *
	    *-------------------------------------------------------*/

	   if(bfi != 0 ) {
	     if(voicing  == 0) {     /* for unvoiced frame */
	         for (i = 0; i < LD8KConstants.L_SUBFR;  i++) {
	            old_exc_array[exc+i+i_subfr] = gain_code.value*code[i];
	         }
	      } else {               /* for voiced frame */
	         for (i = 0; i < LD8KConstants.L_SUBFR;  i++) {
	            old_exc_array[exc+i+i_subfr] = gain_pitch.value*old_exc_array[exc+i+i_subfr];
	         }
	      }
	    } else {                  /* No frame errors */
	      for (i = 0; i < LD8KConstants.L_SUBFR;  i++) {
	         old_exc_array[exc+i+i_subfr] = gain_pitch.value*old_exc_array[exc+i+i_subfr] + gain_code.value*code[i];
	      }
	    }

	    /*-------------------------------------------------------*
	     * - Find synthesis speech corresponding to exc[].       *
	     *-------------------------------------------------------*/

	    Filter.syn_filt(A_t, Az, old_exc_array, exc+i_subfr, synth, ss+i_subfr, LD8KConstants.L_SUBFR, mem_syn, 0, 1);

	    Az  += LD8KConstants.MP1;        /* interpolated LPC parameters for next subframe */
	  }

	   /*--------------------------------------------------*
	    * Update signal for next frame.                    *
	    * -> shift to the left by L_FRAME  exc[]           *
	    *--------------------------------------------------*/
	  Util.copy(old_exc_array, LD8KConstants.L_FRAME, old_exc_array, 0, LD8KConstants.PIT_MAX+LD8KConstants.L_INTERPOL);

	   return;
	}

}

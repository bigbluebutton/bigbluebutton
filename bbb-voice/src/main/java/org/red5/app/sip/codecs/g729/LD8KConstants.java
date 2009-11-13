package org.red5.app.sip.codecs.g729;
//package org.mobicents.media.server.impl.dsp.audio.g729;

public class LD8KConstants {

	public static final float PI             = (float)3.14159265358979323846;
	public static final float PI2            = (float)6.283185307;
	public static final float FLT_MAX_G729   =      (float)1.e38 ;  /* largest floating point number             */
	public static final float FLT_MIN_G729   =      -FLT_MAX_G729;    /* largest floating point number             */

	public static final short L_TOTAL       =  240  ;   /* Total size of speech buffer               */
	public static final short L_FRAME       =  80  ;    /* LPC update frame size                     */
	public static final short L_ENC_FRAME   =  10  ;    /* Encoded frame size                     */
	public static final short L_SUBFR       =  40  ;    /* Sub-frame size                            */

	/*---------------------------------------------------------------------------*
	 * constants for bitstream packing                                           *
	 *---------------------------------------------------------------------------*/
	public static final short BIT_1  =   (short)0x0081; /* definition of one-bit in bit-stream      */
	public static final short BIT_0   =  (short)0x007f; /* definition of zero-bit in bit-stream      */
	public static final short SYNC_WORD= (short)0x6b21; /* definition of frame erasure flag          */
	public static final short SIZE_WORD  =     80 ; /* size of bitstream frame */
	public static final short PRM_SIZE   =     11 ;     /* number of parameters per 10 ms frame      */
	public static final short SERIAL_SIZE=     82 ;     /* bits per frame                            */

	/*---------------------------------------------------------------------------*
	 * constants for lpc analysis and lsp quantizer                              *
	 *---------------------------------------------------------------------------*/
	public static final short L_WINDOW   =     240   ;  /* LPC analysis window size                  */
	public static final short L_NEXT      =    40    ;  /* Samples of next frame needed for LPC ana. */

	public static final short M          =     10    ;  /* LPC order                                 */
	public static final short MP1        =    (M+1)  ;  /* LPC order+1                               */
	public static final short GRID_POINTS =    60    ;  /* resolution of lsp search                  */

	public static final short MA_NP      =     4     ;  /* MA prediction order for LSP               */
	public static final short MODE       =     2     ;  /* number of modes for MA prediction         */
	public static final short NC0_B      =     7     ;  /* number of bits in first stage             */
	public static final short NC0        =  (1<<NC0_B); /* number of entries in first stage          */
	public static final short NC1_B      =     5      ; /* number of bits in second stage            */
	public static final short NC1        =  (1<<NC1_B); /* number of entries in second stage         */
	public static final short NC         =     (M/2)  ; /* LPC order / 2                            */

	public static final float L_LIMIT    =     (float)0.005 ;  /*  */
	public static final float M_LIMIT     =    (float)3.135 ;  /*  */
	public static final float GAP1        =    (float)0.0012;  /*  */
	public static final float GAP2        =    (float)0.0006 ; /*  */
	public static final float GAP3        =    (float)0.0392;  /*  */
	public static final float PI04        =    PI*(float)0.04 ;  /* pi*0.04 */
	public static final float PI92        =    PI*(float)0.92 ;  /* pi*0.92 */
	public static final float CONST12     =    (float)1.2;

	/*-------------------------------------------------------------------------
	 *  pwf constants
	 *-------------------------------------------------------------------------
	 */

	public static final float THRESH_L1  = (float)-1.74;
	public static final float THRESH_L2  = (float)-1.52;
	public static final float THRESH_H1  = (float)0.65;
	public static final float THRESH_H2  = (float)0.43;
	public static final float GAMMA1_0   = (float)0.98;
	public static final float GAMMA2_0_H = (float)0.7;
	public static final float GAMMA2_0_L = (float)0.4;
	public static final float GAMMA1_1   = (float)0.94;
	public static final float GAMMA2_1   = (float)0.6;
	public static final float ALPHA      = (float)-6.0;
	public static final float BETA       = (float)1.0;

	/*----------------------------------------------------------------------------
	 *  Constants for long-term predictor
	 *----------------------------------------------------------------------------
	 */
	public static final short PIT_MIN      =   20  ;    /* Minimum pitch lag in samples              */
	public static final short PIT_MAX      =   143 ;    /* Maximum pitch lag in samples              */
	public static final short L_INTERPOL   =   (10+1) ; /* Length of filter for interpolation.       */
	public static final short L_INTER10    =   10   ;   /* Length for pitch interpolation            */
	public static final short L_INTER4     =   4   ;    /* upsampling ration for pitch search        */
	public static final short UP_SAMP      =   3   ;    /* resolution of fractional delays           */
	public static final float THRESHPIT    =(float)0.85  ;  /* Threshold to favor smaller pitch lags     */
	public static final float GAIN_PIT_MAX =(float)1.2   ;  /* maximum adaptive codebook gain            */
	public static final short FIR_SIZE_ANA =(UP_SAMP*L_INTER4+1);
	public static final short FIR_SIZE_SYN =(UP_SAMP*L_INTER10+1);

	/*---------------------------------------------------------------------------*
	 * constants for fixed codebook                                              *
	 *---------------------------------------------------------------------------*/
	public static final short DIM_RR = 616; /* size of correlation matrix                            */
	public static final short NB_POS = 8  ; /* Number of positions for each pulse                    */
	public static final short STEP   = 5 ;  /* Step betweem position of the same pulse.              */
	public static final short MSIZE  = 64 ; /* Size of vectors for cross-correlation between 2 pulses*/

	public static final float SHARPMAX  =      (float)0.7945 ; /* Maximum value of pitch sharpening */
	public static final float SHARPMIN  =      (float)0.2   ;  /* minimum value of pitch sharpening */

	 /*--------------------------------------------------------------------------*
	  * Example values for threshold and approximated worst case complexity:     *
	  *                                                                          *
	  *     threshold=0.40   maxtime= 75   extra=30   Mips =  6.0                *
	  *--------------------------------------------------------------------------*/
	public static final float THRESHFCB  =     (float)0.40  ;  /*  */
	public static final short MAX_TIME   =     75   ;   /*  */

	/*--------------------------------------------------------------------------*
	 * Constants for taming procedure.                           *
	 *--------------------------------------------------------------------------*/
	public static final float GPCLIP      =(float)0.95  ;   /* Maximum pitch gain if taming is needed */
	public static final float GPCLIP2     =(float)0.94   ;  /* Maximum pitch gain if taming is needed */
	public static final float GP0999      =(float)0.9999  ; /* Maximum pitch gain if taming is needed    */
	public static final float THRESH_ERR  =(float)60000.  ; /* Error threshold taming    */
	public static final float INV_L_SUBFR =(float) ((float)1./(float)L_SUBFR) ;/* =0.025 */
	/*-------------------------------------------------------------------------
	 *  gain quantizer  constants
	 *-------------------------------------------------------------------------
	 */
	public static final float MEAN_ENER    =    (float)36.0 ;  /* average innovation energy */
	public static final short NCODE1_B = 3            ;    /* number of Codebook-bit                */
	public static final short NCODE2_B = 4            ;    /* number of Codebook-bit                */
	public static final short NCODE1   = (1<<NCODE1_B) ;   /* Codebook 1 size                       */
	public static final short NCODE2    =(1<<NCODE2_B);    /* Codebook 2 size                       */
	public static final float NCAN1      =      4     ; /* Pre-selecting order for #1 */
	public static final float NCAN2      =      8 ;     /* Pre-selecting order for #2 */
	public static final float INV_COEF   =(float)-0.032623;

	/*---------------------------------------------------------------------------
	 * Constants for postfilter
	 *---------------------------------------------------------------------------
	 */
	         /* INT16 term pst parameters :  */
	public static final float GAMMA1_PST    =  (float)0.7  ;   /* denominator weighting factor           */
	public static final float GAMMA2_PST    =  (float)0.55 ;   /* numerator  weighting factor            */
	public static final short LONG_H_ST     =  20   ;   /* impulse response length                   */
	public static final float GAMMA3_PLUS   =  (float)0.2 ;    /* tilt weighting factor when k1>0        */
	public static final float GAMMA3_MINUS  =  (float)0.9  ;   /* tilt weighting factor when k1<0        */

	/* long term pst parameters :   */
	public static final short L_SUBFRP1= (L_SUBFR + 1); /* Sub-frame size + 1                        */
	public static final short F_UP_PST  =      8  ;     /* resolution for fractionnal delay          */
	public static final short LH2_S      =     4   ;    /* length of INT16 interp. subfilters        */
	public static final short LH2_L      =     16   ;   /* length of long interp. subfilters         */
	public static final float THRESCRIT   =    (float)0.5 ;    /* threshold LT pst switch off            */
	public static final float GAMMA_G     =    (float)0.5  ;   /* LT weighting factor                    */
	public static final float AGC_FAC     =    (float)0.9875 ; /* gain adjustment factor                 */

	public static final float AGC_FAC1     =    ((float)1. - AGC_FAC);    /* gain adjustment factor                 */
	public static final short LH_UP_S     =    (LH2_S/2);
	public static final short LH_UP_L    =     (LH2_L/2);
	public static final short LH2_L_P1  =  (LH2_L + 1);
	public static final float MIN_GPLT  =  ((float)1. / ((float)1. + GAMMA_G));  /* LT gain minimum          */

	/* Array sizes */
	public static final short MEM_RES2 =(PIT_MAX + 1 + LH_UP_L);
	public static final short SIZ_RES2 =(MEM_RES2 + L_SUBFR);
	public static final short SIZ_Y_UP  =((F_UP_PST-1) * L_SUBFRP1);
	public static final short SIZ_TAB_HUP_L =((F_UP_PST-1) * LH2_L);
	public static final short SIZ_TAB_HUP_S =((F_UP_PST-1) * LH2_S);


}

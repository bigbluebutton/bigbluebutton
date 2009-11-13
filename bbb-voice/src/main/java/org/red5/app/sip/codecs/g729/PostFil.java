package org.red5.app.sip.codecs.g729;
//package org.mobicents.media.server.impl.dsp.audio.g729;

public class PostFil {

	/* Static arrays and variables */
	float apond2[] = new float[LD8KConstants.LONG_H_ST];           /* s.t. numerator coeff.        */
	float mem_stp[] = new float[LD8KConstants.M];            /* s.t. postfilter memory       */
	float mem_zero[] = new float[LD8KConstants.M];          /* null memory to compute h_st  */
	float res2[] = new float[LD8KConstants.SIZ_RES2];        /* A(gamma2) residual           */

	/* Static pointers */
	int res2_ptr;
	int ptr_mem_stp;

	/* Variables */
	FloatPointer gain_prec = new FloatPointer((float)0);             /* for gain adjustment          */

	/****   Short term postfilter :                                     *****/
	/*      Hst(z) = Hst0(z) Hst1(z)                                        */
	/*      Hst0(z) = 1/g0 A(gamma2)(z) / A(gamma1)(z)                      */
	/*      if {hi} = i.r. filter A(gamma2)/A(gamma1) (truncated)           */
	/*      g0 = SUM(|hi|) if > 1                                           */
	/*      g0 = 1. else                                                    */
	/*      Hst1(z) = 1/(1+ |mu|) (1 + mu z-1)                              */
	/*      with mu = 1st parcor calculated on {hi}                         */
	/****   Long term postfilter :                                      *****/
	/*      harmonic postfilter :   H0(z) = gl * (1 + b * z-p)              */
	/*      b = gamma_g * gain_ltp                                          */
	/*      gl = 1 / 1 + b                                                  */
	/*      copmuation of delay on A(gamma2)(z) s(z)                        */
	/*      sub optimal research                                            */
	/*      1. search best integer delay                                    */
	/*      2. search around integer sub multiples (3 val. / sub mult)      */
	/*      3. search around integer with fractionnal delays (1/8)          */
	/************************************************************************/

	/*----------------------------------------------------------------------------
	 * init_pst -  Initialize postfilter functions
	 *----------------------------------------------------------------------------
	 */
	public void init_post_filter(
	    
	)
	{
	    int i;

	    /* Initialize arrays and pointers */

	    /* A(gamma2) residual */
	    for(i=0; i<LD8KConstants.MEM_RES2; i++) res2[i] = (float)0.0;
	    res2_ptr = 0 + LD8KConstants.MEM_RES2;

	    /* 1/A(gamma1) memory */
	    for(i=0; i<LD8KConstants.M; i++) mem_stp[i] = (float)0.0;
	    ptr_mem_stp = 0 + LD8KConstants.M - 1;

	    /* fill apond2[M+1->LONG_H_ST-1] with zeroes */
	    for(i=LD8KConstants.MP1; i<LD8KConstants.LONG_H_ST; i++) apond2[i] = (float)0.0;

	    /* null memory to compute i.r. of A(gamma2)/A(gamma1) */
	    for(i=0; i<LD8KConstants.M; i++) mem_zero[i] = (float)0.0;

	    /* for gain adjustment */
	    gain_prec.value =(float)1.;

	    return;
	}

	/*----------------------------------------------------------------------------
	 * post - adaptive postfilter main function
	 *----------------------------------------------------------------------------
	 */
	public void post(
	 int t0,                /* input : pitch delay given by coder */
	 float[] signal_ptr, int signals,     /* input : input signal (pointer to current subframe */
	 float []coeff, int coeffs,          /* input : LPC coefficients for current subframe */
	 float []sig_out, int outs,        /* output: postfiltered output */
	 IntegerPointer vo                /* output: voicing decision 0 = uv,  > 0 delay */
	)
	{
	    float apond1[] = new float[LD8KConstants.MP1];           /* s.t. denominator coeff.      */
	    float sig_ltp[] = new float[LD8KConstants.L_SUBFRP1];   /* H0 output signal             */
	    int sig_ltp_ptr;
	    FloatPointer parcor0 = new FloatPointer();

	    /* Compute weighted LPC coefficients */
	    LpcFunc.weight_az(coeff, coeffs, LD8KConstants.GAMMA1_PST, LD8KConstants.M, apond1, 0);
	    LpcFunc.weight_az(coeff, coeffs, LD8KConstants.GAMMA2_PST, LD8KConstants.M, apond2, 0);

	    /* Compute A(gamma2) residual */
	    Filter.residu(apond2, 0, signal_ptr, signals, res2, res2_ptr, LD8KConstants.L_SUBFR);

	    /* Harmonic filtering */
	    sig_ltp_ptr = 1;//sig_ltp + 1;
	    pst_ltp(t0, res2, res2_ptr, sig_ltp, sig_ltp_ptr, vo);

	    /* Save last output of 1/A(gamma1)  */
	    /* (from preceding subframe)        */
	    sig_ltp[0] = mem_stp[ptr_mem_stp];

	    /* Control short term pst filter gain and compute parcor0   */
	    calc_st_filt(apond2, 0, apond1, 0, parcor0, sig_ltp, sig_ltp_ptr);

	    /* 1/A(gamma1) filtering, mem_stp is updated */
	    Filter.syn_filt(apond1, 0, sig_ltp, sig_ltp_ptr, sig_ltp, sig_ltp_ptr, LD8KConstants.L_SUBFR, mem_stp, 0, 1);

	    /* (1 + mu z-1) tilt filtering */
	    filt_mu(sig_ltp, 0, sig_out, outs, parcor0.value);

	    /* gain control */
	    scale_st(signal_ptr, signals, sig_out, outs, gain_prec);

	    /**** Update for next frame */
	    Util.copy(res2,LD8KConstants.L_SUBFR, res2, 0, LD8KConstants.MEM_RES2);

	    return;
	}

	/*----------------------------------------------------------------------------
	 *  pst_ltp - harmonic postfilter
	 *----------------------------------------------------------------------------
	 */
	public void pst_ltp(
	 int t0,                /* input : pitch delay given by coder */
	 float []ptr_sig_in, int ins,     /* input : postfilter input filter (residu2) */
	 float []ptr_sig_pst0, int psts,   /* output: harmonic postfilter output */
	 IntegerPointer vo                /* output: voicing decision 0 = uv,  > 0 delay */
	)
	{

	/**** Declare variables                                 */
	    IntegerPointer ltpdel = new IntegerPointer(0), phase = new IntegerPointer(0);
	    FloatPointer num_gltp = new FloatPointer((float)0), den_gltp = new FloatPointer((float)0);
	    FloatPointer num2_gltp = new FloatPointer((float)0), den2_gltp = new FloatPointer((float)0);
	    float gain_plt;
	    float y_up[] = new float[LD8KConstants.SIZ_Y_UP];
	    int ptr_y_up;
	    float[] ptr_y_up_array;
	    IntegerPointer off_yup = new IntegerPointer();

	    /* Sub optimal delay search */
	    search_del(t0, ptr_sig_in, ins, ltpdel, phase, num_gltp, den_gltp,
	                        y_up, off_yup);
	    vo.value = ltpdel.value;

	    //HACK:FIXME
	    if(num_gltp.value == (float)0.)  {
	        Util.copy(ptr_sig_in, ins, ptr_sig_pst0, psts, LD8KConstants.L_SUBFR);
	    }
	    else {

	        if(phase.value == 0) {
	            ptr_y_up = ins - ltpdel.value;//ptr_sig_in
	            ptr_y_up_array = ptr_sig_in;
	        }

	        else {
	            /* Filtering with long filter */
	            compute_ltp_l(ptr_sig_in, ins, ltpdel.value, phase.value, ptr_sig_pst0, psts,
	            		num2_gltp, den2_gltp);

	            if(select_ltp(num_gltp.value, den_gltp.value, num2_gltp.value, den2_gltp.value) == 1) {

	                /* select short filter */
	                ptr_y_up = 0 + ((phase.value-1) * LD8KConstants.L_SUBFRP1 + off_yup.value);
	                ptr_y_up_array = y_up;
	            }
	            else {
	                /* select long filter */
	                num_gltp = num2_gltp;
	                den_gltp = den2_gltp;
	                ptr_y_up = psts;
	                ptr_y_up_array = ptr_sig_pst0;
	            }
	        }

	        if(num_gltp.value > den_gltp.value) {
	            /* beta bounded to 1 */
	            gain_plt = LD8KConstants.MIN_GPLT;
	        }
	        else {
	            gain_plt = den_gltp.value / (den_gltp.value + LD8KConstants.GAMMA_G * num_gltp.value);
	        }

	        /** filtering by H0(z) (harmonic filter) **/
	        filt_plt(ptr_sig_in, ins, ptr_y_up_array, ptr_y_up, ptr_sig_pst0, psts, gain_plt);

	    }

	    return;
	}

	/*----------------------------------------------------------------------------
	 *  search_del: computes best (shortest) integer LTP delay + fine search
	 *----------------------------------------------------------------------------
	 */
	static void search_del(
	 int t0,                /* input : pitch delay given by coder */
	 float []ptr_sig_in, int ins,     /* input : input signal (with delay line) */
	 IntegerPointer ltpdel,           /* output: delay = *ltpdel - *phase / f_up */
	 IntegerPointer phase,            /* output: phase */
	 FloatPointer num_gltp,       /* output: numerator of LTP gain */
	 FloatPointer den_gltp,       /* output: denominator of LTP gain */
	 float []y_up,           /*       : */
	 IntegerPointer off_yup           /*       : */
	)
	{

	    /* pointers on tables of constants */
	    int ptr_h;

	    /* Variables and local arrays */
	    float tab_den0[] = new float[LD8KConstants.F_UP_PST-1], tab_den1[] = new float[LD8KConstants.F_UP_PST-1];
	    int ptr_den0, ptr_den1;
	    int ptr_sig_past, ptr_sig_past0;
	    int ptr1;

	    int i, n, ioff, i_max;
	    float ener, num, numsq, den0, den1;
	    float den_int, num_int;
	    float den_max, num_max, numsq_max;
	    int phi_max;
	    int lambda, phi;
	    float temp0, temp1;
	    int ptr_y_up;

	    /*****************************************/
	    /* Compute current signal energy         */
	    /*****************************************/

	    ener = (float)0.;
	    for(i=0; i<LD8KConstants.L_SUBFR; i++) {
	        ener += ptr_sig_in[i+ins] * ptr_sig_in[i+ins];
	    }
	    if(ener < (float)0.1) {
	        num_gltp.value = (float)0.;
	        den_gltp.value = (float)1.;
	        ltpdel.value = 0;
	        phase.value = 0;
	        return;
	    }

	    /*************************************/
	    /* Selects best of 3 integer delays  */
	    /* Maximum of 3 numerators around t0 */
	    /* coder LTP delay                   */
	    /*************************************/

	    lambda = t0-1;

	    ptr_sig_past = 0 - lambda; // ptr_sig_in

	    num_int = (float)-1.0e30;

	   /* initialization used only to suppress Microsoft Visual C++ warnings */
	    i_max = 0;
	    for(i=0; i<3; i++) {
	        num=(float)0.;
	        for(n=0; n<LD8KConstants.L_SUBFR; n++) {
	            num += ptr_sig_in[ins+n]* ptr_sig_in[ins+ptr_sig_past+n];
	        }
	        if(num > num_int) {
	            i_max   = i;
	            num_int = num;
	        }
	        ptr_sig_past--;
	    }
	    if(num_int <= (float)0.) {
	        num_gltp.value = (float)0.;
	        den_gltp.value = (float)1.;
	        ltpdel.value   = 0;
	        phase.value    = 0;
	        return;
	    }

	    /* Calculates denominator for lambda_max */
	    lambda += i_max;
	    ptr_sig_past = 0 - lambda;
	    den_int=(float)0.;
	    for(n=0; n<LD8KConstants.L_SUBFR; n++) {
	        den_int += ptr_sig_in[ins+ptr_sig_past+n]* ptr_sig_in[ins+ptr_sig_past+n];
	    }
	    if(den_int < (float)0.1) {
	        num_gltp.value = (float)0.;
	        den_gltp.value = (float)1.;
	        ltpdel.value   = 0;
	        phase.value    = 0;
	        return;
	    }
	    /***********************************/
	    /* Select best phase around lambda */
	    /***********************************/

	    /* Compute y_up & denominators */
	    /*******************************/
	    ptr_y_up = 0;//y_up;
	    den_max = 0;//den_int;
	    ptr_den0 = 0;//tab_den0;
	    ptr_den1 = 0;//tab_den1;
	    ptr_h = 0;//tab_hup_s;
	    ptr_sig_past0 = 0 + LD8KConstants.LH_UP_S - 1 - lambda;//ptr_sig_in + LD8KConstants.LH_UP_S - 1 - lambda; /* points on lambda_max+1 */

	    /* loop on phase  */
	    for(phi=1; phi<LD8KConstants.F_UP_PST; phi++) {

	        /* Computes criterion for (lambda_max+1) - phi/F_UP_PST     */
	        /* and lambda_max - phi/F_UP_PST                            */
	        ptr_sig_past = ptr_sig_past0;
	        /* computes y_up[n] */
	        for(n = 0; n<=LD8KConstants.L_SUBFR; n++) {
	            ptr1 = ptr_sig_past++;
	            temp0 = (float)0.;
	            for(i=0; i<LD8KConstants.LH2_S; i++) {
	                temp0 += TabLD8k.tab_hup_s[ptr_h+i] * ptr_sig_in[ins+ptr1-i];
	            }
	            y_up[ptr_y_up+n] = temp0;
	        }

	        /* recursive computation of den0 (lambda_max+1) and den1 (lambda_max) */

	        /* common part to den0 and den1 */
	        temp0 = (float)0.;
	        for(n=1; n<LD8KConstants.L_SUBFR; n++) {
	            temp0 += y_up[ptr_y_up+n] * y_up[ptr_y_up+n];
	        }

	        /* den0 */
	        den0  = temp0 + y_up[ptr_y_up+0] * y_up[ptr_y_up+0];
	        tab_den0[ptr_den0++] = den0;

	        /* den1 */
	        den1 = temp0 + y_up[ptr_y_up+LD8KConstants.L_SUBFR] * y_up[ptr_y_up+LD8KConstants.L_SUBFR];
	        tab_den1[ptr_den1++] = den1;

	        if(Math.abs(y_up[ptr_y_up+0])>Math.abs(y_up[ptr_y_up+LD8KConstants.L_SUBFR])) {
	            if(den0 > den_max) {
	                den_max = den0;
	            }
	        }
	        else {
	            if(den1 > den_max) {
	                den_max = den1;
	            }
	        }
	        ptr_y_up += LD8KConstants.L_SUBFRP1;
	        ptr_h += LD8KConstants.LH2_S;
	    }
	    if(den_max < (float)0.1 ) {
	        num_gltp.value = (float)0.;
	        den_gltp.value = (float)1.;
	        ltpdel.value   = 0;
	        phase.value    = 0;
	        return;
	    }
	    /* Computation of the numerators                */
	    /* and selection of best num*num/den            */
	    /* for non null phases                          */

	    /* Initialize with null phase */
	    num_max      = num_int;
	    den_max      = den_int;
	    numsq_max   =  num_max * num_max;
	    phi_max      = 0;
	    ioff         = 1;

	    ptr_den0   = 0;//tab_den0;
	    ptr_den1   = 0;//tab_den1;
	    ptr_y_up     = 0;//y_up;

	    /* if den_max = 0 : will be selected and declared unvoiced */
	    /* if num!=0 & den=0 : will be selected and declared unvoiced */
	    /* degenerated seldom cases, switch off LT is OK */

	    /* Loop on phase */
	    for(phi=1; phi<LD8KConstants.F_UP_PST; phi++) {


	        /* computes num for lambda_max+1 - phi/F_UP_PST */
	        num = (float)0.;
	        for(n = 0; n<LD8KConstants.L_SUBFR; n++) {
	            num += ptr_sig_in[ins+n]  * y_up[ptr_y_up+n];
	        }
	        if(num < (float)0.) num = (float)0.;
	        numsq = num * num;

	        /* selection if num/sqrt(den0) max */
	        den0 = tab_den0[ptr_den0++];
	        temp0 = numsq * den_max;
	        temp1 = numsq_max * den0;
	        if(temp0 > temp1) {
	            num_max     = num;
	            numsq_max   = numsq;
	            den_max     = den0;
	            ioff        = 0;
	            phi_max     = phi;
	        }

	        /* computes num for lambda_max - phi/F_UP_PST */
	        ptr_y_up++;
	        num = (float)0.;
	        for(n = 0; n<LD8KConstants.L_SUBFR; n++) {
	            num += ptr_sig_in[ins+n]  * y_up[ptr_y_up+n];
	        }
	        if(num < (float)0.) num = (float)0.;
	        numsq = num * num;

	        /* selection if num/sqrt(den1) max */
	        den1 = tab_den1[ptr_den1++];
	        temp0 = numsq * den_max;
	        temp1 = numsq_max * den1;
	        if(temp0 > temp1) {
	            num_max     = num;
	            numsq_max   = numsq;
	            den_max     = den1;
	            ioff        = 1;
	            phi_max     = phi;
	        }
	        ptr_y_up += LD8KConstants.L_SUBFR;
	    }

	    /***************************************************/
	    /*** test if normalised crit0[iopt] > THRESCRIT  ***/
	    /***************************************************/

	    if((num_max == (float)0.) || (den_max <= (float)0.1)) {
	        num_gltp.value = (float)0.;
	        den_gltp.value = (float)1.;
	        ltpdel.value = 0;
	        phase.value = 0;
	        return;
	    }

	    /* comparison num * num            */
	    /* with ener * den x THRESCRIT      */
	    temp1 = den_max * ener * LD8KConstants.THRESCRIT;
	    if(numsq_max >= temp1) {
	        ltpdel.value   = lambda + 1 - ioff;
	        off_yup.value  = ioff;
	        phase.value    = phi_max;
	        num_gltp.value = num_max;
	        den_gltp.value = den_max;
	    }
	    else {
	        num_gltp.value = (float)0.;
	        den_gltp.value = (float)1.;
	        ltpdel.value   = 0;
	        phase.value    = 0;
	    }
	    return;
	}

	/*----------------------------------------------------------------------------
	 *  filt_plt -  ltp  postfilter
	 *----------------------------------------------------------------------------
	 */
	void filt_plt(
	 float []s_in,int ins,       /* input : input signal with past*/
	 float []s_ltp,int ltps,      /* input : filtered signal with gain 1 */
	 float []s_out,int outs,      /* output: output signal */
	 float gain_plt     /* input : filter gain  */
	)
	{

	    /* Local variables */
	    int n;
	    float temp;
	    float gain_plt_1;

	    gain_plt_1 = (float)1. - gain_plt;

	    for(n=0;  n<LD8KConstants.L_SUBFR; n++) {
	        /* s_out(n) = gain_plt x s_in(n) + gain_plt_1 x s_ltp(n)    */
	        temp =  gain_plt   * s_in[n+ins];
	        temp += gain_plt_1 * s_ltp[n+ltps];
	        s_out[n+outs] = temp;
	    }
	    return;
	}

	/*----------------------------------------------------------------------------
	 *  compute_ltp_l : compute delayed signal,
	                    num & den of gain for fractional delay
	 *                  with long interpolation filter
	 *----------------------------------------------------------------------------
	 */
	static void compute_ltp_l(
	 float []s_in, int ins,       /* input signal with past*/
	 int ltpdel,      /* delay factor */
	 int phase,       /* phase factor */
	 float []y_up, int ys,       /* delayed signal */
	 FloatPointer num,        /* numerator of LTP gain */
	 FloatPointer den        /* denominator of LTP gain */
	)
	{

	    /* Pointer on table of constants */
	    int ptr_h;

	    /* Local variables */
	    int n, i, ptr2;
	    float temp;

	    /* Filtering with long filter */
	    ptr_h = (phase-1) * LD8KConstants.LH2_L;//TabLD8k.tab_hup_l 
	    ptr2 = 0 - ltpdel + LD8KConstants.LH_UP_L;//s_in

	    /* Compute y_up */
	    for(n = 0; n<LD8KConstants.L_SUBFR; n++) {
	        temp = (float)0.;
	        for(i=0; i<LD8KConstants.LH2_L; i++) {
	            temp += TabLD8k.tab_hup_l[ptr_h+i] * s_in[ins+ptr2--];
	        }
	        y_up[ys+n] = temp;
	        ptr2 += LD8KConstants.LH2_L_P1;
	    }

	    num.value = (float)0.;
	    /* Compute num */
	    for(n = 0; n<LD8KConstants.L_SUBFR; n++) {
	        num.value += y_up[ys+n]* s_in[ins+n];
	    }
	    if(num.value < (float)0.0) num.value = (float)0.0;

	    den.value = (float)0.;
	    /* Compute den */
	    for(n = 0; n<LD8KConstants.L_SUBFR; n++) {
	        den.value += y_up[ys+n]* y_up[ys+n];
	    }

	    return;
	}
	/*----------------------------------------------------------------------------
	 *  select_ltp : selects best of (gain1, gain2)
	 *  with gain1 = num1 / den1
	 *  and  gain2 = num2 / den2
	 *----------------------------------------------------------------------------
	 */
	static int select_ltp(  /* output : 1 = 1st gain, 2 = 2nd gain */
	 float num1,       /* input : numerator of gain1 */
	 float den1,       /* input : denominator of gain1 */
	 float num2,       /* input : numerator of gain2 */
	 float den2        /* input : denominator of gain2 */
	)
	{
	    if(den2 == (float)0.) {
	        return(1);
	    }
	    if(num2 * num2 * den1> num1 * num1 * den2) {
	        return(2);
	    }
	    else {
	        return(1);
	    }
	}



	/*----------------------------------------------------------------------------
	 *   calc_st_filt -  computes impulse response of A(gamma2) / A(gamma1)
	 *   controls gain : computation of energy impulse response as
	 *                    SUMn  (abs (h[n])) and computes parcor0
	 *----------------------------------------------------------------------------
	 */
	void calc_st_filt(
	 float []apond2,int apond2s,     /* input : coefficients of numerator */
	 float []apond1,int apond1s,     /* input : coefficients of denominator */
	 FloatPointer parcor0,    /* output: 1st parcor calcul. on composed filter */
	 float []sig_ltp_ptr, int sigs    /* in/out: input of 1/A(gamma1) : scaled by 1/g0 */
	)
	{
	    float h[] = new float[LD8KConstants.LONG_H_ST];
	    float g0, temp;
	    int i;

	    /* computes impulse response of  apond1 / apond2 */
	    Filter.syn_filt(apond1,apond1s, apond2,apond2s, h,0, LD8KConstants.LONG_H_ST, mem_zero, 0, 0);

	    /* computes 1st parcor */
	    calc_rc0_h(h,0, parcor0);

	    /* computes gain g0 */
	    g0 = (float)0.;
	    for(i=0; i<LD8KConstants.LONG_H_ST; i++) {
	        g0 += (float)Math.abs(h[i]);
	    }

	    /* Scale signal input of 1/A(gamma1) */
	    if(g0 > (float)1.) {
	        temp = (float)1./g0;
	        for(i=0; i<LD8KConstants.L_SUBFR; i++) {
	            sig_ltp_ptr[i+sigs] = sig_ltp_ptr[i+sigs] * temp;
	        }
	    }

	    return;
	}

	/*----------------------------------------------------------------------------
	 * calc_rc0_h - computes 1st parcor from composed filter impulse response
	 *----------------------------------------------------------------------------
	 */
	static void calc_rc0_h(
	 float []h, int hs,      /* input : impulse response of composed filter */
	 FloatPointer rc0     /* output: 1st parcor */
	)
	{
	    float acf0, acf1;
	    float temp, temp2;
	    int ptrs;
	    int i;

	    /* computation of the autocorrelation function acf */
	    temp = (float)0.;
	    for(i=0;i<LD8KConstants.LONG_H_ST;i++){
	        temp += h[hs+i] * h[hs+i];
	    }
	    acf0 = temp;

	    temp = (float)0.;
	    ptrs = 0;
	    for(i=0;i<LD8KConstants.LONG_H_ST-1;i++){
	        temp2 = h[hs+ptrs++];
	        temp += temp2 * (h[hs+ptrs]);
	    }
	    acf1 = temp;

	    /* Initialisation of the calculation */
	    if( acf0 == (float)0.) {
	        rc0.value = (float)0.;
	        return;
	    }

	    /* Compute 1st parcor */
	    /**********************/
	    if(acf0 < Math.abs(acf1) ) {
	        rc0.value = (float)0.0;
	        return;
	    }
	    rc0.value = - acf1 / acf0;

	    return;
	}

	/*----------------------------------------------------------------------------
	 * filt_mu - tilt filtering with : (1 + mu z-1) * (1/1-|mu|)
	 *   computes y[n] = (1/1-|mu|) (x[n]+mu*x[n-1])
	 *----------------------------------------------------------------------------
	 */
	static void filt_mu(
	 float []sig_in, int ins,     /* input : input signal (beginning at sample -1) */
	 float []sig_out, int outs,    /* output: output signal */
	 float parcor0      /* input : parcor0 (mu = parcor0 * gamma3) */
	)
	{
	    int n;
	    float mu, ga, temp;
	    int ptrs;

	    if(parcor0 > (float)0.) {
	        mu = parcor0 * LD8KConstants.GAMMA3_PLUS;
	    }
	    else {
	        mu = parcor0 * LD8KConstants.GAMMA3_MINUS;
	    }
	    ga = (float)1. / ((float)1. - (float)Math.abs(mu));

	    ptrs = ins;      /* points on sig_in(-1) */
	    for(n=0; n<LD8KConstants.L_SUBFR; n++) {
	        temp = mu * (sig_in[ptrs++]);
	        temp += (sig_in[ptrs]);
	        sig_out[outs+n] = ga * temp;
	    }
	    return;
	}

	/*----------------------------------------------------------------------------
	 *   scale_st  - control of the subframe gain
	 *   gain[n] = AGC_FAC * gain[n-1] + (1 - AGC_FAC) g_in/g_out
	 *----------------------------------------------------------------------------
	 */
	void scale_st(
	 float []sig_in, int ins,     /* input : postfilter input signal */
	 float []sig_out, int outs,    /* in/out: postfilter output signal */
	 FloatPointer gain_prec    /* in/out: last value of gain for subframe */
	)
	{
	    int i;
	    float gain_in, gain_out;
	    float g0, gain;

	    /* compute input gain */
	    gain_in = (float)0.;
	    for(i=0; i<LD8KConstants.L_SUBFR; i++) {
	        gain_in += (float)Math.abs(sig_in[ins+i]);
	    }
	    if(gain_in == (float)0.) {
	        g0 = (float)0.;
	    }
	    else {

	        /* Compute output gain */
	        gain_out = (float)0.;
	        for(i=0; i<LD8KConstants.L_SUBFR; i++) {
	            gain_out += (float)Math.abs(sig_out[outs+i]);
	        }
	        if(gain_out == (float)0.) {
	            gain_prec.value = (float)0.;
	            return;
	        }

	        g0 = gain_in/ gain_out;
	        g0 *= LD8KConstants.AGC_FAC1;
	    }

	    /* compute gain(n) = AGC_FAC gain(n-1) + (1-AGC_FAC)gain_in/gain_out */
	    /* sig_out(n) = gain(n) sig_out(n)                                   */
	    gain = gain_prec.value;
	    for(i=0; i<LD8KConstants.L_SUBFR; i++) {
	        gain *= LD8KConstants.AGC_FAC;
	        gain += g0;
	        sig_out[outs+i] *= gain;
	    }
	    gain_prec.value = gain;
	    return;
	}

}

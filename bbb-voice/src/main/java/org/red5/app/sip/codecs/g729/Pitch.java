package org.red5.app.sip.codecs.g729;
//package org.mobicents.media.server.impl.dsp.audio.g729;

public class Pitch {

	/*----------------------------------------------------------------------------
	 * pitch_ol -  compute the open loop pitch lag
	 *----------------------------------------------------------------------------
	 */
	public static int pitch_ol(           /* output: open-loop pitch lag */
	 float signal[],int signals,        /* input : signal to compute pitch  */
	                        /*         s[-PIT_MAX : l_frame-1]  */
	   int pit_min,         /* input : minimum pitch lag                          */
	   int pit_max,         /* input : maximum pitch lag                          */
	   int l_frame          /* input : error minimization window */
	)
	{
	    FloatPointer  max1 = new FloatPointer(), max2 =new  FloatPointer(), max3 = new FloatPointer();
	    int    p_max1, p_max2, p_max3;

	   /*--------------------------------------------------------------------*
	    *  The pitch lag search is divided in three sections.                *
	    *  Each section cannot have a pitch multiple.                        *
	    *  We find a maximum for each section.                               *
	    *  We compare the maxima of each section by favoring small lag.      *
	    *                                                                    *
	    *  First section:  lag delay = PIT_MAX to 80                         *
	    *  Second section: lag delay = 79 to 40                              *
	    *  Third section:  lag delay = 39 to 20                              *
	    *--------------------------------------------------------------------*/

	    p_max1 = lag_max(signal, signals, l_frame, pit_max, 80 , max1);
	    p_max2 = lag_max(signal, signals, l_frame, 79     , 40 , max2);
	    p_max3 = lag_max(signal, signals, l_frame, 39     , pit_min , max3);

	   /*--------------------------------------------------------------------*
	    * Compare the 3 sections maxima, and favor small lag.                *
	    *--------------------------------------------------------------------*/

	    if ( max1.value * LD8KConstants.THRESHPIT < max2.value ) {
	        max1.value = max2.value;
	        p_max1 = p_max2;
	    }

	    if ( max1.value * LD8KConstants.THRESHPIT < max3.value )  p_max1 = p_max3;

	    return (p_max1);
	}
	/*----------------------------------------------------------------------------
	 * lag_max - Find the lag that has maximum correlation
	 *----------------------------------------------------------------------------
	 */
	public static int lag_max(     /* output: lag found */
	  float signal[], int signals,       /* input : Signal to compute the open loop pitch
	                                   signal[-142:-1] should be known.       */
	  int l_frame,          /* input : Length of frame to compute pitch       */
	  int lagmax,           /* input : maximum lag                            */
	  int lagmin,           /* input : minimum lag                            */
	  FloatPointer cor_max        /* input : normalized correlation of selected lag */
	)
	{
	    int    i, j;
	    int  p=0, p1;
	    float  max, t0;
	    int    p_max=0;

	    max = LD8KConstants.FLT_MIN_G729;

	    for (i = lagmax; i >= lagmin; i--) {
	        p  = 0;//signal;
	        p1 = -i;//&signal[-i];
	        t0 = (float)0.0;

	        for (j=0; j<l_frame; j++) {
	            t0 += signal[signals + p++] * signal[signals + p1++];
	        }

	        if (t0 >= max) {
	            max    = t0;
	            p_max = i;
	        }
	    }

	    /* compute energy */

	    t0 = (float)0.01;                  /* to avoid division by zero */
	    p = -p_max;
	    for(i=0; i<l_frame; i++, p++) {
	        t0 += signal[signals + p] * signal[signals + p];
	    }
	    t0 = inv_sqrt(t0);          /* 1/sqrt(energy)    */

	    cor_max.value = max * t0;        /* max/sqrt(energy)  */

	    return(p_max);
	}


	/*----------------------------------------------------------------------------
	 * pitch_fr3 - find the pitch period  with 1/3 subsample resolution
	 *----------------------------------------------------------------------------
	 */
	public static int pitch_fr3(          /* output: integer part of pitch period        */
	 float exc[],int excs,           /* input : excitation buffer                   */
	 float xn[],int xns,            /* input : target vector                       */
	 float h[], int hs,            /* input : impulse response of filters.        */
	 int l_subfr,           /* input : Length of frame to compute pitch    */
	 int t0_min,            /* input : minimum value in the searched range */
	 int t0_max,            /* input : maximum value in the searched range */
	 int i_subfr,           /* input : indicator for first subframe        */
	 IntegerPointer pit_frac          /* output: chosen fraction                     */
	)
	{
	  int    i, frac;
	  int    lag, t_min, t_max;
	  float  max;
	  float  corr_int;
	  float  corr_v[] = new float[10+2*LD8KConstants.L_INTER4];  /* size: 2*L_INTER4+t0_max-t0_min+1 */
	  int  corr;

	  /* Find interval to compute normalized correlation */

	  t_min = t0_min - LD8KConstants.L_INTER4;
	  t_max = t0_max + LD8KConstants.L_INTER4;

	  corr = -t_min;    /* corr[t_min:t_max] */

	  /* Compute normalized correlation between target and filtered excitation */

	  norm_corr(exc, excs, xn, xns, h, hs, l_subfr, t_min, t_max, corr_v, corr);

	  /* find integer pitch */

	  max = corr_v[corr+t0_min];
	  lag  = t0_min;

	  for(i= t0_min+1; i<=t0_max; i++)
	  {
	    if( corr_v[corr+i] >= max)
	    {
	      max = corr_v[corr+i];
	      lag = i;
	    }
	  }

	  /* If first subframe and lag > 84 do not search fractionnal pitch */

	  if( (i_subfr == 0) && (lag > 84) )
	  {
	    pit_frac.value = 0;
	    return(lag);
	  }

	  /* test the fractions around lag and choose the one which maximizes
	     the interpolated normalized correlation */

	  max  = interpol_3(corr_v, corr+lag, -2);
	  frac = -2;

	  for (i = -1; i <= 2; i++)
	  {
	    corr_int = interpol_3(corr_v, corr+lag, i);
	    if(corr_int > max)
	    {
	      max = corr_int;
	      frac = i;
	    }
	  }

	  /* limit the fraction value in the interval [-1,0,1] */

	  if (frac == -2)
	  {
	    frac = 1;
	    lag -= 1;
	  }
	  if (frac == 2)
	  {
	    frac = -1;
	    lag += 1;
	  }

	  pit_frac.value = frac;

	  return lag;
	}

	/*----------------------------------------------------------------------------
	 * norm_corr - Find the normalized correlation between the target vector and
	 *             the filtered past excitation.
	 *----------------------------------------------------------------------------
	 */
	public static void norm_corr(
	 float exc[],int excs,           /* input : excitation buffer */
	 float xn[],int xns,            /* input : target vector */
	 float h[],int hs,             /* input : imp response of synth and weighting flt */
	 int l_subfr,           /* input : Length of frame to compute pitch */
	 int t_min,             /* input : minimum value of searched range */
	 int t_max,             /* input : maximum value of search range */
	 float corr_norm[], int cs      /* output: normalized correlation (correlation between
	                                   target and filtered excitation divided by
	                                   the square root of energy of filtered
	                                    excitation) */
	)
	{
	 int    i, j, k;
	 float excf[] = new float[LD8KConstants.L_SUBFR];     /* filtered past excitation */
	 float  alp, s, norm;

	 k = -t_min;

	 /* compute the filtered excitation for the first delay t_min */

	 Filter.convolve(exc,excs+k, h, 0, excf, 0, l_subfr);

	 /* loop for every possible period */

	 for (i = t_min; i <= t_max; i++)
	 {
	   /* Compute 1/sqrt(energie of excf[]) */

	   alp = (float)0.01;
	   for (j = 0; j < l_subfr; j++)
	     alp += excf[j]*excf[j];

	   norm = inv_sqrt(alp);


	   /* Compute correlation between xn[] and excf[] */

	   s = (float)0.0;
	   for (j = 0; j < l_subfr; j++)  s += xn[xns+j]*excf[j];


	   /* Normalize correlation = correlation * (1/sqrt(energie)) */

	   corr_norm[cs+i] = s*norm;

	   /* modify the filtered excitation excf[] for the next iteration */

	   if (i != t_max)
	   {
	     k--;
	     for (j = l_subfr-1; j > 0; j--)
	        excf[j] = excf[j-1] + exc[excs+k]*h[j];
	     excf[0] = exc[excs+k];
	   }
	 }

	 return;

	}
	/*----------------------------------------------------------------------------
	 * g_pitch - compute adaptive codebook gain and compute <y1,y1> , -2<xn,y1>
	 *----------------------------------------------------------------------------
	 */

	public static float g_pitch(          /* output: pitch gain */
	 float xn[],int xns,            /* input : target vector */
	 float y1[],int y1s,            /* input : filtered adaptive codebook vector */
	 float g_coeff[],int gs,       /* output: <y1,y1> and -2<xn,y1> */
	 int l_subfr            /* input : vector dimension */
	)
	{
	    float xy, yy, gain;
	    int   i;

	    xy = (float)0.0;
	    for (i = 0; i < l_subfr; i++) {
	        xy += xn[xns+i] * y1[y1s+i];
	    }
	    yy = (float)0.01;
	    for (i = 0; i < l_subfr; i++) {
	        yy += y1[y1s+i] * y1[y1s+i];          /* energy of filtered excitation */
	    }
	    g_coeff[gs+0] = yy;
	    g_coeff[gs+1] = (float)-2.0*xy +(float)0.01;

	    /* find pitch gain and bound it by [0,1.2] */

	    gain = xy/yy;

	    if (gain<(float)0.0)  gain = (float)0.0;
	    if (gain>LD8KConstants.GAIN_PIT_MAX) gain = LD8KConstants.GAIN_PIT_MAX;

	    return gain;
	}

	/*----------------------------------------------------------------------*
	 *    Function enc_lag3()                                               *
	 *             ~~~~~~~~~~                                               *
	 *   Encoding of fractional pitch lag with 1/3 resolution.              *
	 *----------------------------------------------------------------------*
	 * The pitch range for the first subframe is divided as follows:        *
	 *   19 1/3  to   84 2/3   resolution 1/3                               *
	 *   85      to   143      resolution 1                                 *
	 *                                                                      *
	 * The period in the first subframe is encoded with 8 bits.             *
	 * For the range with fractions:                                        *
	 *   index = (T-19)*3 + frac - 1;   where T=[19..85] and frac=[-1,0,1]  *
	 * and for the integer only range                                       *
	 *   index = (T - 85) + 197;        where T=[86..143]                   *
	 *----------------------------------------------------------------------*
	 * For the second subframe a resolution of 1/3 is always used, and the  *
	 * search range is relative to the lag in the first subframe.           *
	 * If t0 is the lag in the first subframe then                          *
	 *  t_min=t0-5   and  t_max=t0+4   and  the range is given by           *
	 *       t_min - 2/3   to  t_max + 2/3                                  *
	 *                                                                      *
	 * The period in the 2nd subframe is encoded with 5 bits:               *
	 *   index = (T-(t_min-1))*3 + frac - 1;    where T[t_min-1 .. t_max+1] *
	 *----------------------------------------------------------------------*/
	public static int  enc_lag3(     /* output: Return index of encoding */
	  int  T0,         /* input : Pitch delay              */
	  int  T0_frac,    /* input : Fractional pitch delay   */
	  IntegerPointer  T0_min,    /* in/out: Minimum search delay     */
	  IntegerPointer  T0_max,    /* in/out: Maximum search delay     */
	  int pit_min,     /* input : Minimum pitch delay      */
	  int pit_max,     /* input : Maximum pitch delay      */
	  int  pit_flag    /* input : Flag for 1st subframe    */
	)
	{
	  int index;

	  if (pit_flag == 0)   /* if 1st subframe */
	  {
	     /* encode pitch delay (with fraction) */

	     if (T0 <= 85)
	       index = T0*3 - 58 + T0_frac;
	     else
	       index = T0 + 112;

	     /* find T0_min and T0_max for second subframe */

	     T0_min.value = T0 - 5;
	     if (T0_min.value < pit_min) T0_min.value = pit_min;
	     T0_max.value = T0_min.value + 9;
	     if (T0_max.value > pit_max)
	     {
	         T0_max.value = pit_max;
	         T0_min.value = T0_max.value - 9;
	     }
	  }

	  else                    /* second subframe */
	  {
	     index = T0 - T0_min.value;
	     index = index*3 + 2 + T0_frac;
	  }
	  return index;
	}

	/*----------------------------------------------------------------------------
	 * interpol_3 - For interpolating the normalized correlation
	 *----------------------------------------------------------------------------
	 */
	public static float interpol_3(   /* output: interpolated value */
	 float []x,int xs,              /* input : function to be interpolated */
	 int frac               /* input : fraction value to evaluate */
	)
	{
	  int i;
	  float s;
	  int x1, x2, c1, c2;


	  if (frac < 0) {
	    frac += LD8KConstants.UP_SAMP;
	    xs--;
	  }
	  x1 = 0;
	  x2 = 1;
	  c1 = frac;//&inter_3[frac];
	  c2 = LD8KConstants.UP_SAMP-frac;//&inter_3[LD8KConstants.UP_SAMP-frac];

	  s = (float)0.0;
	  for(i=0; i< LD8KConstants.L_INTER4; i++, c1+=LD8KConstants.UP_SAMP, c2+=LD8KConstants.UP_SAMP)
	     s+= (x[xs+x1--]) * (TabLD8k.inter_3[c1]) + (x[xs+x2++]) * (TabLD8k.inter_3[c2]);

	  return s;
	}

	/*----------------------------------------------------------------------------
	 * inv_sqrt - compute y = 1 / sqrt(x)
	 *----------------------------------------------------------------------------
	 */
	static float inv_sqrt(         /* output: 1/sqrt(x) */
	 float x                /* input : value of x */
	)
	{
	   return ((float)1.0 / (float)Math.sqrt((double)x) );
	}

}

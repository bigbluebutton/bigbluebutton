package org.red5.app.sip.codecs.g729;
//package org.mobicents.media.server.impl.dsp.audio.g729;

public class LpcFunc {


	/*-----------------------------------------------------------------------------
	 * lsp_az - convert LSPs to predictor coefficients a[]
	 *-----------------------------------------------------------------------------
	 */
	public static  void lsp_az(
	 float []lsp,int lsps,            /* input : lsp[0:M-1] */
	 float []a ,int as              /* output: predictor coeffs a[0:M], a[0] = 1. */
	)
	{

	  float f1[] = new float[LD8KConstants.NC+1], f2[] = new float[LD8KConstants.NC+1];
	  int i,j;


	  get_lsp_pol(lsp,lsps,f1,0);
	  get_lsp_pol(lsp,lsps+1,f2,0);

	  for (i = LD8KConstants.NC; i > 0; i--)
	  {
	    f1[i] += f1[i-1];
	    f2[i] -= f2[i-1];
	  }
	  a[as+0] = (float)1.0;
	  for (i = 1, j = LD8KConstants.M; i <= LD8KConstants.NC; i++, j--)
	  {
	    a[as+i] = (float)0.5*(f1[i] + f2[i]);
	    a[as+j] = (float)0.5*(f1[i] - f2[i]);
	  }

	  return;
	}


	/*----------------------------------------------------------------------------
	 * get_lsp_pol - find the polynomial F1(z) or F2(z) from the LSFs
	 *----------------------------------------------------------------------------
	 */
	public static  void get_lsp_pol(
	   float lsp[], int lsps,           /* input : line spectral freq. (cosine domain)  */
	   float f[]  , int fs            /* output: the coefficients of F1 or F2 */
	)
	{
	  float b;
	  int   i,j;

	  f[fs+0] = (float)1.0;
	  b = (float)-2.0*lsp[lsps+0];
	  f[fs+1] = b;
	  for (i = 2; i <= LD8KConstants.NC; i++)
	  {
	    b = (float)-2.0*lsp[lsps+2*i-2];
	    f[i] = b*f[fs+i-1] + (float)2.0*f[fs+i-2];
	    for (j = i-1; j > 1; j--)
	      f[fs+j] += b*f[fs+j-1] + f[fs+j-2];
	    f[fs+1] += b;
	  }
	  return;
	}

	/*----------------------------------------------------------------------------
	 * lsf_lsp - convert from lsf[0..M-1 to lsp[0..M-1]
	 *----------------------------------------------------------------------------
	 */
	public static void lsf_lsp(
	 float lsf[],          /* input :  lsf */
	 float lsp[],          /* output: lsp */
	 int m
	)
	{
	    int     i;
	    for ( i = 0; i < m; i++ )
	        lsp[i] = (float)Math.cos((double)lsf[i]);
	    return;
	}

	/*----------------------------------------------------------------------------
	 * lsp_lsf - convert from lsp[0..M-1 to lsf[0..M-1]
	 *----------------------------------------------------------------------------
	 */
	public static void lsp_lsf(
	 float lsp[],          /* input :  lsp coefficients */
	 float lsf[],          /* output:  lsf (normalized frequencies */
	 int m
	)
	{
	    int     i;

	    for ( i = 0; i < m; i++ )
	        lsf[i] = (float)Math.acos((double)lsp[i]);
	    return;
	}


	/*---------------------------------------------------------------------------
	 * weigh_az:  Weighting of LPC coefficients  ap[i]  =  a[i] * (gamma ** i)
	 *---------------------------------------------------------------------------
	 */
	public static void weight_az(
	 float []a, int as,              /* input : lpc coefficients a[0:m] */
	 float gamma,           /* input : weighting factor */
	 int m,                  /* input : filter order */
	 float []ap, int aps             /* output: weighted coefficients ap[0:m] */

	)
	{
	    float fac;
	    int i;

	    ap[aps] = a[as];
	    fac = gamma;
	    for (i = 1; i <m; i++) {
	        ap[aps+i] = fac * a[as+i];
	        fac *= gamma;
	    }
	    ap[aps+m] = fac * a[as+m];
	    return;
	}



	/*-----------------------------------------------------------------------------
	 * int_qlpc -  interpolated M LSP parameters and convert to M+1 LPC coeffs
	 *-----------------------------------------------------------------------------
	 */
	public static void int_qlpc(
	 float lsp_old[],       /* input : LSPs for past frame (0:M-1) */
	 float lsp_new[],       /* input : LSPs for present frame (0:M-1) */
	 float az[]             /* output: filter parameters in 2 subfr (dim 2(m+1)) */
	)
	{
	  int i;
	  float lsp[] = new float[LD8KConstants.M];

	  for (i = 0; i < LD8KConstants.M; i++)
	    lsp[i] = lsp_old[i]*(float)0.5 + lsp_new[i]*(float)0.5;

	  lsp_az(lsp,0, az,0);
	  lsp_az(lsp_new,0, az,LD8KConstants.M+1);

	  return;
	}
	/*-----------------------------------------------------------------------------
	 * int_lpc -  interpolated M LSP parameters and convert to M+1 LPC coeffs
	 *-----------------------------------------------------------------------------
	 */
	public static void int_lpc(
	 float lsp_old[],       /* input : LSPs for past frame (0:M-1) */
	 float lsp_new[],       /* input : LSPs for present frame (0:M-1) */
	 float lsf_int[],        /* output: interpolated lsf coefficients */
	 float lsf_new[],       /* input : LSFs for present frame (0:M-1) */
	 float az[]             /* output: filter parameters in 2 subfr (dim 2(m+1)) */
	)
	{
	    int i;
	    float lsp[] = new float[LD8KConstants.M];


	    for (i = 0; i < LD8KConstants.M; i++)
	        lsp[i] = lsp_old[i]*(float)0.5 + lsp_new[i]*(float)0.5;

	    lsp_az(lsp,0, az,0);

	    lsp_lsf(lsp, lsf_int, LD8KConstants.M);
	    lsp_lsf(lsp_new, lsf_new, LD8KConstants.M);

	    return;
	}

}

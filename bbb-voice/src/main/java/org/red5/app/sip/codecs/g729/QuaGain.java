package org.red5.app.sip.codecs.g729;
//package org.mobicents.media.server.impl.dsp.audio.g729;

public class QuaGain {
	float past_qua_en[] = new float[]{(float)-14.0,(float)-14.0,(float)-14.0,(float)-14.0};
	/*----------------------------------------------------------------------------
	 * qua_gain - Quantization of pitch and codebook gains
	 *----------------------------------------------------------------------------
	 */
	int qua_gain(           /* output: quantizer index                   */
	  float code[],         /* input : fixed codebook vector             */
	  float[] g_coeff,       /* input : correlation factors               */
	  int l_subfr,          /* input : fcb vector length                 */
	  FloatPointer gain_pit,      /* output: quantized acb gain                */
	  FloatPointer gain_code,     /* output: quantized fcb gain                */
	  int tameflag          /* input : flag set to 1 if taming is needed */
	)
	{
	 /*
	 * MA prediction is performed on the innovation energy (in dB with mean      *
	 * removed).                                                                 *
	 * An initial predicted gain, g_0, is first determined and the correction    *
	 * factor     alpha = gain / g_0    is quantized.                            *
	 * The pitch gain and the correction factor are vector quantized and the     *
	 * mean-squared weighted error criterion is used in the quantizer search.    *
	 *   CS Codebook , fast pre-selection version                                *
	 */
	   

	   int    i,j, index1=0, index2=0;
	   IntegerPointer    cand1 = new IntegerPointer(0),cand2=new IntegerPointer(0) ;
	   FloatPointer  gcode0 = new FloatPointer((float)0);
	   float  dist = 0;
	   float dist_min = 0;
	   float g_pitch = 0;
	   float g_code = 0;
	   float  best_gain[] = new float[2],tmp;

	  /*---------------------------------------------------*
	   *-  energy due to innovation                       -*
	   *-  predicted energy                               -*
	   *-  predicted codebook gain => gcode0[exp_gcode0]  -*
	   *---------------------------------------------------*/

	   GainPred.gain_predict( past_qua_en, code, l_subfr, gcode0);

	   /*-- pre-selection --*/
	   tmp = (float)-1./((float)4.*g_coeff[0]*g_coeff[2]-g_coeff[4]*g_coeff[4]) ;
	   best_gain[0] = ((float)2.*g_coeff[2]*g_coeff[1]-g_coeff[3]*g_coeff[4])*tmp ;
	   best_gain[1] = ((float)2.*g_coeff[0]*g_coeff[3]-g_coeff[1]*g_coeff[4])*tmp ;

	   if (tameflag == 1){
	     if(best_gain[0]> LD8KConstants.GPCLIP2) best_gain[0] = LD8KConstants.GPCLIP2;
	   }
	  /*----------------------------------------------*
	   *   - presearch for gain codebook -            *
	   *----------------------------------------------*/

	   gbk_presel(best_gain,cand1,cand2,gcode0.value) ;

	   /*-- selection --*/
	   dist_min = LD8KConstants.FLT_MAX_G729;
	   if(tameflag == 1) {
	       for (i=0;i<LD8KConstants.NCAN1;i++){
	          for(j=0;j<LD8KConstants.NCAN2;j++){
	             g_pitch=TabLD8k.gbk1[cand1.value+i][0]+TabLD8k.gbk2[cand2.value+j][0];
	             if(g_pitch < LD8KConstants.GP0999) {
	                 g_code=gcode0.value*(TabLD8k.gbk1[cand1.value+i][1]+TabLD8k.gbk2[cand2.value+j][1]);
	                 dist = g_pitch*g_pitch * g_coeff[0]
	                       + g_pitch         * g_coeff[1]
	                       + g_code*g_code   * g_coeff[2]
	                       + g_code          * g_coeff[3]
	                       + g_pitch*g_code  * g_coeff[4] ;
	                     if (dist < dist_min){
	                        dist_min = dist;
	                        index1 = cand1.value+i ;
	                        index2 = cand2.value+j ;
	                     }
	                }
	          }
	        }
	    }
	    else {
	       for (i=0;i<LD8KConstants.NCAN1;i++){
	          for(j=0;j<LD8KConstants.NCAN2;j++){
	             g_pitch=TabLD8k.gbk1[cand1.value+i][0]+TabLD8k.gbk2[cand2.value+j][0];
	             g_code=gcode0.value*(TabLD8k.gbk1[cand1.value+i][1]+TabLD8k.gbk2[cand2.value+j][1]);
	             dist = g_pitch*g_pitch * g_coeff[0]
	                   + g_pitch         * g_coeff[1]
	                   + g_code*g_code   * g_coeff[2]
	                   + g_code          * g_coeff[3]
	                   + g_pitch*g_code  * g_coeff[4] ;
	             if (dist < dist_min){
	                dist_min = dist;
	                index1 = cand1.value+i ;
	                index2 = cand2.value+j ;
	             }
	          }
	        }
	    }
	   gain_pit.value  = TabLD8k.gbk1[index1][0]+TabLD8k.gbk2[index2][0] ;
	   g_code = TabLD8k.gbk1[index1][1]+TabLD8k.gbk2[index2][1];
	   gain_code.value =  g_code * gcode0.value;
	  /*----------------------------------------------*
	   * update table of past quantized energies      *
	   *----------------------------------------------*/
	   GainPred.gain_update( past_qua_en, g_code);

	   return (TabLD8k.map1[index1]*LD8KConstants.NCODE2+TabLD8k.map2[index2]);
	}

	/*----------------------------------------------------------------------------
	 * gbk_presel - presearch for gain codebook
	 */
	public static void   gbk_presel(
	 float best_gain[],     /* input : [0] unquantized pitch gain
	                                   [1] unquantized code gain      */
	 IntegerPointer cand1,            /* output: index of best 1st stage vector */
	 IntegerPointer cand2,            /* output: index of best 2nd stage vector */
	 float gcode0           /* input : presearch for gain codebook    */
	)
	{
	   float    x,y ;

	   x = (best_gain[1]-(TabLD8k.coef[0][0]*best_gain[0]+TabLD8k.coef[1][1])*gcode0) * LD8KConstants.INV_COEF ;
	   y = (TabLD8k.coef[1][0]*(-TabLD8k.coef[0][1]+best_gain[0]*TabLD8k.coef[0][0])*gcode0
	        -TabLD8k.coef[0][0]*best_gain[1]) * LD8KConstants.INV_COEF ;

	   if(gcode0>(float)0.0){
	      /* pre select codebook #1 */
	      cand1.value = 0 ;
	      do{
	         if(y>TabLD8k.thr1[cand1.value]*gcode0) {
	        	 cand1.value = cand1.value + 1;
	         }
	         else               break ;
	      } while((cand1.value)<(LD8KConstants.NCODE1-LD8KConstants.NCAN1)) ;
	      /* pre select codebook #2 */
	      cand2.value = 0 ;
	      do{
	         if(x>TabLD8k.thr2[cand2.value]*gcode0) { 
	        	 cand2.value = cand2.value + 1;
	         }
	         else               break ;
	      } while((cand2.value)<(LD8KConstants.NCODE2-LD8KConstants.NCAN2)) ;
	   }
	   else{
	      /* pre select codebook #1 */
	      cand1.value = 0 ;
	      do{
	         if(y<TabLD8k.thr1[cand1.value]*gcode0) (cand1.value)++ ;
	         else               break ;
	      } while((cand1.value)<(LD8KConstants.NCODE1-LD8KConstants.NCAN1)) ;
	      /* pre select codebook #2 */
	      cand2.value = 0 ;
	      do{
	         if(x<TabLD8k.thr2[cand2.value]*gcode0) (cand2.value)++ ;
	         else               break ;
	      } while((cand2.value)<(LD8KConstants.NCODE2-LD8KConstants.NCAN2)) ;
	   }

	   return ;
	}

}

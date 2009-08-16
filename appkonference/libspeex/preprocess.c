/* Copyright (C) 2003 Epic Games 
   Written by Jean-Marc Valin

   File: preprocess.c
   Preprocessor with denoising based on the algorithm by Ephraim and Malah

   Redistribution and use in source and binary forms, with or without
   modification, are permitted provided that the following conditions are
   met:

   1. Redistributions of source code must retain the above copyright notice,
   this list of conditions and the following disclaimer.

   2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.

   3. The name of the author may not be used to endorse or promote products
   derived from this software without specific prior written permission.

   THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
   IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
   OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
   DISCLAIMED. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT,
   INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
   (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
   SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
   HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
   STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
   ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
   POSSIBILITY OF SUCH DAMAGE.
*/

#include <math.h>
#include "speex_preprocess.h"
#include "misc.h"
#include "smallft.h"

#define max(a,b) ((a) > (b) ? (a) : (b))
#define min(a,b) ((a) < (b) ? (a) : (b))

/* use single-precision math funcs.  (1.3% perf improvement). */
#if 1
#define exp(a)	  expf(a)
#define sqrt(a)	  sqrtf(a)
#define floor(a)  floorf(a)
#define log(a)	  logf(a)
#endif



#ifndef M_PI
#define M_PI 3.14159263
#endif

#define SQRT_M_PI_2 0.88623
#define LOUDNESS_EXP 2.5

#define NB_BANDS 8

#define ZMIN .1
#define ZMAX .316
#define ZMIN_1 10
#define LOG_MIN_MAX_1 0.86859

static void conj_window(float *w, int len)
{
   int i;
   for (i=0;i<len;i++)
   {
      float x=4*((float)i)/len;
      int inv=0;
      if (x<1)
      {
      } else if (x<2)
      {
         x=2-x;
         inv=1;
      } else if (x<3)
      {
         x=x-2;
         inv=1;
      } else {
         x=4-x;
      }
      x*=1.9979;
      w[i]=(.5-.5*cos(x))*(.5-.5*cos(x));
      if (inv)
         w[i]=1-w[i];
      w[i]=sqrt(w[i]);
   }
}

/* This function approximates the gain function 
   y = gamma(1.25)^2 * M(-.25;1;-x) / sqrt(x)  
   which multiplied by xi/(1+xi) is the optimal gain
   in the loudness domain ( sqrt[amplitude] )
*/
static float hypergeom_gain(float x)
{
   int ind;
   float integer, frac;
   static float table[21] = {
      0.82157, 1.02017, 1.20461, 1.37534, 1.53363, 1.68092, 1.81865, 
      1.94811, 2.07038, 2.18638, 2.29688, 2.40255, 2.50391, 2.60144, 
      2.69551, 2.78647, 2.87458, 2.96015, 3.04333, 3.12431, 3.20326};
   
   if (x>9.5)
      return 1+.12/x;

   integer = floor(x);
   frac = x-integer;
   ind = (int)integer;
   
   return ((1-frac)*table[ind] + frac*table[ind+1])/sqrt(x+.0001);
}

SpeexPreprocessState *speex_preprocess_state_init(int frame_size, int sampling_rate)
{
   int i;
   int N, N3, N4;

   SpeexPreprocessState *st = (SpeexPreprocessState *)speex_alloc(sizeof(SpeexPreprocessState));
   st->frame_size = frame_size;

   /* Round ps_size down to the nearest power of two */
#if 0
   i=1;
   st->ps_size = st->frame_size;
   while(1)
   {
      if (st->ps_size & ~i)
      {
         st->ps_size &= ~i;
         i<<=1;
      } else {
         break;
      }
   }
   
   
   if (st->ps_size < 3*st->frame_size/4)
      st->ps_size = st->ps_size * 3 / 2;
#else
   st->ps_size = st->frame_size;
#endif

   N = st->ps_size;
   N3 = 2*N - st->frame_size;
   N4 = st->frame_size - N3;
   
   st->sampling_rate = sampling_rate;
   st->denoise_enabled = 1;
   st->agc_enabled = 0;
   st->agc_level = 8000;
   st->vad_enabled = 0;

   st->speech_prob_start = SPEEX_PROB_START ;
   st->speech_prob_continue = SPEEX_PROB_CONTINUE ;
   
   st->frame = (float*)speex_alloc(2*N*sizeof(float));
   st->ps = (float*)speex_alloc(N*sizeof(float));
   st->gain2 = (float*)speex_alloc(N*sizeof(float));
   st->window = (float*)speex_alloc(2*N*sizeof(float));
   st->noise = (float*)speex_alloc(N*sizeof(float));
   st->old_ps = (float*)speex_alloc(N*sizeof(float));
   st->gain = (float*)speex_alloc(N*sizeof(float));
   st->prior = (float*)speex_alloc(N*sizeof(float));
   st->post = (float*)speex_alloc(N*sizeof(float));
   st->loudness_weight = (float*)speex_alloc(N*sizeof(float));
   st->inbuf = (float*)speex_alloc(N3*sizeof(float));
   st->outbuf = (float*)speex_alloc(N3*sizeof(float));
   st->echo_noise = (float*)speex_alloc(N*sizeof(float));

   st->S = (float*)speex_alloc(N*sizeof(float));
   st->Smin = (float*)speex_alloc(N*sizeof(float));
   st->Stmp = (float*)speex_alloc(N*sizeof(float));
   st->update_prob = (float*)speex_alloc(N*sizeof(float));

   st->zeta = (float*)speex_alloc(N*sizeof(float));
   st->Zpeak = 0;
   st->Zlast = 0;

   st->noise_bands = (float*)speex_alloc(NB_BANDS*sizeof(float));
   st->noise_bands2 = (float*)speex_alloc(NB_BANDS*sizeof(float));
   st->speech_bands = (float*)speex_alloc(NB_BANDS*sizeof(float));
   st->speech_bands2 = (float*)speex_alloc(NB_BANDS*sizeof(float));
   st->noise_bandsN = st->speech_bandsN = 1;

   conj_window(st->window, 2*N3);
   for (i=2*N3;i<2*st->ps_size;i++)
      st->window[i]=1;
   
   if (N4>0)
   {
      for (i=N3-1;i>=0;i--)
      {
         st->window[i+N3+N4]=st->window[i+N3];
         st->window[i+N3]=1;
      }
   }
   for (i=0;i<N;i++)
   {
      st->noise[i]=1e4;
      st->old_ps[i]=1e4;
      st->gain[i]=1;
      st->post[i]=1;
      st->prior[i]=1;
   }

   for (i=0;i<N3;i++)
   {
      st->inbuf[i]=0;
      st->outbuf[i]=0;
   }

   for (i=0;i<N;i++)
   {
      float ff=((float)i)*.5*sampling_rate/((float)N);
      st->loudness_weight[i] = .35-.35*ff/16000+.73*exp(-.5*(ff-3800)*(ff-3800)/9e5);
      if (st->loudness_weight[i]<.01)
         st->loudness_weight[i]=.01;
      st->loudness_weight[i] *= st->loudness_weight[i];
   }

   st->speech_prob = 0;
   st->last_speech = 1000;
   st->loudness = pow(6000,LOUDNESS_EXP);
   st->loudness2 = 6000;
   st->nb_loudness_adapt = 0;

   st->fft_lookup = (struct drft_lookup*)speex_alloc(sizeof(struct drft_lookup));
   drft_init(st->fft_lookup,2*N);

   st->nb_adapt=0;
   st->consec_noise=0;
   st->nb_preprocess=0;
   return st;
}

void speex_preprocess_state_destroy(SpeexPreprocessState *st)
{
   speex_free(st->frame);
   speex_free(st->ps);
   speex_free(st->gain2);
   speex_free(st->window);
   speex_free(st->noise);
   speex_free(st->old_ps);
   speex_free(st->gain);
   speex_free(st->prior);
   speex_free(st->post);
   speex_free(st->loudness_weight);
   speex_free(st->echo_noise);

   speex_free(st->S);
   speex_free(st->Smin);
   speex_free(st->Stmp);
   speex_free(st->update_prob);

   speex_free(st->noise_bands);
   speex_free(st->noise_bands2);
   speex_free(st->speech_bands);
   speex_free(st->speech_bands2);

   speex_free(st->inbuf);
   speex_free(st->outbuf);

   drft_clear(st->fft_lookup);
   speex_free(st->fft_lookup);

   speex_free(st);
}

static void update_noise(SpeexPreprocessState *st, float *ps, float *echo)
{
   int i;
   float beta;
   st->nb_adapt++;
   beta=1.0/st->nb_adapt;
   if (beta < .05)
      beta=.05;
   
   if (!echo)
   {
      for (i=0;i<st->ps_size;i++)
         st->noise[i] = (1-beta)*st->noise[i] + beta*ps[i];   
   } else {
      for (i=0;i<st->ps_size;i++)
         st->noise[i] = (1-beta)*st->noise[i] + beta*max(0,ps[i]-echo[i]); 
#if 0
      for (i=0;i<st->ps_size;i++)
         st->noise[i] = 0;
#endif
   }
}

static int speex_compute_vad(SpeexPreprocessState *st, float *ps, float mean_prior, float mean_post)
{
   int i, is_speech=0;
   int N = st->ps_size;
   float scale=.5/N;

   /* FIXME: Clean this up a bit */
   {
      float bands[NB_BANDS];
      int j;
      float p0, p1;
      float tot_loudness=0;
      float x = sqrt(mean_post);

      for (i=5;i<N-10;i++)
      {
         tot_loudness += scale*st->ps[i] * st->loudness_weight[i];
      }

      for (i=0;i<NB_BANDS;i++)
      {
         bands[i]=1e4;
         for (j=i*N/NB_BANDS;j<(i+1)*N/NB_BANDS;j++)
         {
            bands[i] += ps[j];
         }
         bands[i]=log(bands[i]);
      }
      
      /*p1 = .0005+.6*exp(-.5*(x-.4)*(x-.4)*11)+.1*exp(-1.2*x);
      if (x<1.5)
         p0=.1*exp(2*(x-1.5));
      else
         p0=.02+.1*exp(-.2*(x-1.5));
      */

      p0=1/(1+exp(3*(1.5-x)));
      p1=1-p0;

      /*fprintf (stderr, "%f %f ", p0, p1);*/
      /*p0 *= .99*st->speech_prob + .01*(1-st->speech_prob);
      p1 *= .01*st->speech_prob + .99*(1-st->speech_prob);
      
      st->speech_prob = p0/(p1+p0);
      */

      if (st->noise_bandsN < 50 || st->speech_bandsN < 50)
      {
         if (mean_post > 5)
         {
            float adapt = 1./st->speech_bandsN++;
            if (adapt<.005)
               adapt = .005;
            for (i=0;i<NB_BANDS;i++)
            {
               st->speech_bands[i] = (1-adapt)*st->speech_bands[i] + adapt*bands[i];
               /*st->speech_bands2[i] = (1-adapt)*st->speech_bands2[i] + adapt*bands[i]*bands[i];*/
               st->speech_bands2[i] = (1-adapt)*st->speech_bands2[i] + adapt*(bands[i]-st->speech_bands[i])*(bands[i]-st->speech_bands[i]);
            }
         } else {
            float adapt = 1./st->noise_bandsN++;
            if (adapt<.005)
               adapt = .005;
            for (i=0;i<NB_BANDS;i++)
            {
               st->noise_bands[i] = (1-adapt)*st->noise_bands[i] + adapt*bands[i];
               /*st->noise_bands2[i] = (1-adapt)*st->noise_bands2[i] + adapt*bands[i]*bands[i];*/
               st->noise_bands2[i] = (1-adapt)*st->noise_bands2[i] + adapt*(bands[i]-st->noise_bands[i])*(bands[i]-st->noise_bands[i]);
            }
         }
      }
      p0=p1=1;
      for (i=0;i<NB_BANDS;i++)
      {
         float noise_var, speech_var;
         float noise_mean, speech_mean;
         float tmp1, tmp2, pr;

         /*noise_var = 1.01*st->noise_bands2[i] - st->noise_bands[i]*st->noise_bands[i];
           speech_var = 1.01*st->speech_bands2[i] - st->speech_bands[i]*st->speech_bands[i];*/
         noise_var = st->noise_bands2[i];
         speech_var = st->speech_bands2[i];
         if (noise_var < .1)
            noise_var = .1;
         if (speech_var < .1)
            speech_var = .1;
         
         /*speech_var = sqrt(speech_var*noise_var);
           noise_var = speech_var;*/
         if (speech_var < .05*speech_var)
            noise_var = .05*speech_var; 
         if (speech_var < .05*noise_var)
            speech_var = .05*noise_var;
         
         if (bands[i] < st->noise_bands[i])
            speech_var = noise_var;
         if (bands[i] > st->speech_bands[i])
            noise_var = speech_var;

         speech_mean = st->speech_bands[i];
         noise_mean = st->noise_bands[i];
         if (noise_mean < speech_mean - 5)
            noise_mean = speech_mean - 5;

         tmp1 = exp(-.5*(bands[i]-speech_mean)*(bands[i]-speech_mean)/speech_var)/sqrt(2*M_PI*speech_var);
         tmp2 = exp(-.5*(bands[i]-noise_mean)*(bands[i]-noise_mean)/noise_var)/sqrt(2*M_PI*noise_var);
         /*fprintf (stderr, "%f ", (float)(p0/(.01+p0+p1)));*/
         /*fprintf (stderr, "%f ", (float)(bands[i]));*/
         pr = tmp1/(1e-25+tmp1+tmp2);
         /*if (bands[i] < st->noise_bands[i])
            pr=.01;
         if (bands[i] > st->speech_bands[i] && pr < .995)
         pr=.995;*/
         if (pr>.999)
            pr=.999;
         if (pr<.001)
            pr=.001;
         /*fprintf (stderr, "%f ", pr);*/
         p0 *= pr;
         p1 *= (1-pr);
      }

      p0 = pow(p0,.2);
      p1 = pow(p1,.2);      
      
#if 1
      p0 *= 2;
      p0=p0/(p1+p0);
      if (st->last_speech>20) 
      {
         float tmp = sqrt(tot_loudness)/st->loudness2;
         tmp = 1-exp(-10*tmp);
         if (p0>tmp)
            p0=tmp;
      }
      p1=1-p0;
#else
      if (sqrt(tot_loudness) < .6*st->loudness2 && p0>15*p1)
         p0=15*p1;
      if (sqrt(tot_loudness) < .45*st->loudness2 && p0>7*p1)
         p0=7*p1;
      if (sqrt(tot_loudness) < .3*st->loudness2 && p0>3*p1)
         p0=3*p1;
      if (sqrt(tot_loudness) < .15*st->loudness2 && p0>p1)
         p0=p1;
      /*fprintf (stderr, "%f %f ", (float)(sqrt(tot_loudness) /( .25*st->loudness2)), p0/(p1+p0));*/
#endif

      p0 *= .99*st->speech_prob + .01*(1-st->speech_prob);
      p1 *= .01*st->speech_prob + .99*(1-st->speech_prob);
      
      st->speech_prob = p0/(1e-25+p1+p0);
      /*fprintf (stderr, "%f %f %f ", tot_loudness, st->loudness2, st->speech_prob);*/

	/* decide if frame is speech using speech probability settings */

/*      if (st->speech_prob> .35 || (st->last_speech < 20 && st->speech_prob>.1)) */
	if (
		st->speech_prob > st->speech_prob_start
		|| ( st->last_speech < 20 && st->speech_prob > st->speech_prob_continue ) 
	)
	{
         is_speech = 1;
         st->last_speech = 0;
	} 
	else 
	{
		st->last_speech++;
		if ( st->last_speech < 20 )
			is_speech = 1;
	}

      if (st->noise_bandsN > 50 && st->speech_bandsN > 50)
      {
         if (mean_post > 5)
         {
            float adapt = 1./st->speech_bandsN++;
            if (adapt<.005)
               adapt = .005;
            for (i=0;i<NB_BANDS;i++)
            {
               st->speech_bands[i] = (1-adapt)*st->speech_bands[i] + adapt*bands[i];
               /*st->speech_bands2[i] = (1-adapt)*st->speech_bands2[i] + adapt*bands[i]*bands[i];*/
               st->speech_bands2[i] = (1-adapt)*st->speech_bands2[i] + adapt*(bands[i]-st->speech_bands[i])*(bands[i]-st->speech_bands[i]);
            }
         } else {
            float adapt = 1./st->noise_bandsN++;
            if (adapt<.005)
               adapt = .005;
            for (i=0;i<NB_BANDS;i++)
            {
               st->noise_bands[i] = (1-adapt)*st->noise_bands[i] + adapt*bands[i];
               /*st->noise_bands2[i] = (1-adapt)*st->noise_bands2[i] + adapt*bands[i]*bands[i];*/
               st->noise_bands2[i] = (1-adapt)*st->noise_bands2[i] + adapt*(bands[i]-st->noise_bands[i])*(bands[i]-st->noise_bands[i]);
            }
         }
      }


   }

   return is_speech;
}

static void speex_compute_agc(SpeexPreprocessState *st, float mean_prior)
{
   int i;
   int N = st->ps_size;
   float scale=.5/N;
   float agc_gain;
   int freq_start, freq_end;
   float active_bands = 0;

   freq_start = (int)(300.0*2*N/st->sampling_rate);
   freq_end   = (int)(2000.0*2*N/st->sampling_rate);
   for (i=freq_start;i<freq_end;i++)
   {
      if (st->S[i] > 20*st->Smin[i]+1000)
         active_bands+=1;
   }
   active_bands /= (freq_end-freq_start+1);

   if (active_bands > .2)
   {
      float loudness=0;
      float rate, rate2=.2;
      st->nb_loudness_adapt++;
      rate=2.0/(1+st->nb_loudness_adapt);
      if (rate < .05)
         rate = .05;
      if (rate < .1 && pow(loudness, LOUDNESS_EXP) > st->loudness)
         rate = .1;
      if (rate < .2 && pow(loudness, LOUDNESS_EXP) > 3*st->loudness)
         rate = .2;
      if (rate < .4 && pow(loudness, LOUDNESS_EXP) > 10*st->loudness)
         rate = .4;

      for (i=2;i<N;i++)
      {
         loudness += scale*st->ps[i] * st->gain2[i] * st->gain2[i] * st->loudness_weight[i];
      }
      loudness=sqrt(loudness);
      /*if (loudness < 2*pow(st->loudness, 1.0/LOUDNESS_EXP) &&
        loudness*2 > pow(st->loudness, 1.0/LOUDNESS_EXP))*/
      st->loudness = (1-rate)*st->loudness + (rate)*pow(loudness, LOUDNESS_EXP);
      
      st->loudness2 = (1-rate2)*st->loudness2 + rate2*pow(st->loudness, 1.0/LOUDNESS_EXP);

      loudness = pow(st->loudness, 1.0/LOUDNESS_EXP);

      /*fprintf (stderr, "%f %f %f\n", loudness, st->loudness2, rate);*/
   }
   
   agc_gain = st->agc_level/st->loudness2;
   /*fprintf (stderr, "%f %f %f %f\n", active_bands, st->loudness, st->loudness2, agc_gain);*/
   if (agc_gain>200)
      agc_gain = 200;

   for (i=0;i<N;i++)
      st->gain2[i] *= agc_gain;
   
}

static void preprocess_analysis(SpeexPreprocessState *st, short *x)
{
   int i;
   int N = st->ps_size;
   int N3 = 2*N - st->frame_size;
   int N4 = st->frame_size - N3;
   float *ps=st->ps;

   /* 'Build' input frame */
   for (i=0;i<N3;i++)
      st->frame[i]=st->inbuf[i];
   for (i=0;i<st->frame_size;i++)
      st->frame[N3+i]=x[i];
   
   /* Update inbuf */
   for (i=0;i<N3;i++)
      st->inbuf[i]=x[N4+i];

   /* Windowing */
   for (i=0;i<2*N;i++)
      st->frame[i] *= st->window[i];

   /* Perform FFT */
   drft_forward(st->fft_lookup, st->frame);

   /* Power spectrum */
   ps[0]=1;
   for (i=1;i<N;i++)
      ps[i]=1+st->frame[2*i-1]*st->frame[2*i-1] + st->frame[2*i]*st->frame[2*i];

}

static void update_noise_prob(SpeexPreprocessState *st)
{
   int i;
   int N = st->ps_size;

   for (i=1;i<N-1;i++)
      st->S[i] = 100+ .8*st->S[i] + .05*st->ps[i-1]+.1*st->ps[i]+.05*st->ps[i+1];
   
   if (st->nb_preprocess<1)
   {
      for (i=1;i<N-1;i++)
         st->Smin[i] = st->Stmp[i] = st->S[i]+100;
   }

   if (st->nb_preprocess%200==0)
   {
      for (i=1;i<N-1;i++)
      {
         st->Smin[i] = min(st->Stmp[i], st->S[i]);
         st->Stmp[i] = st->S[i];
      }
   } else {
      for (i=1;i<N-1;i++)
      {
         st->Smin[i] = min(st->Smin[i], st->S[i]);
         st->Stmp[i] = min(st->Stmp[i], st->S[i]);      
      }
   }
   for (i=1;i<N-1;i++)
   {
      st->update_prob[i] *= .2;
      if (st->S[i] > 5*st->Smin[i])
         st->update_prob[i] += .8;
      /*fprintf (stderr, "%f ", st->S[i]/st->Smin[i]);*/
      /*fprintf (stderr, "%f ", st->update_prob[i]);*/
   }

}

inline void ephraim_malah(SpeexPreprocessState *st, int N, float Pframe)
{
   int i;   

   /* defactor loop for i=1,1 < i < N-1, and i= N-1 cases */ 
   /* i=1 case */
   {
      float MM;
      float theta;
      float prior_ratio;
      float p, q;
      float zeta1;
      float P1;
                                                                                
      prior_ratio = st->prior[1]/(1.0001+st->prior[1]);
      theta = (1+st->post[1])*prior_ratio;

      zeta1 = st->zeta[1];

      if (zeta1<ZMIN)
         P1 = 0;
      else if (zeta1>ZMAX)
         P1 = 1;
      else
         P1 = LOG_MIN_MAX_1 * log(ZMIN_1*zeta1);
                                                                                
      /*P1 = log(zeta1/ZMIN)/log(ZMAX/ZMIN);*/
                                                                                
      /* FIXME: add global prop (P2) */
      q = 1-Pframe*P1;
      if (q>.95)
         q=.95;
      p=1/(1 + (q/(1-q))*(1+st->prior[1])*exp(-theta));
                                                                                
      /* Optimal estimator for loudness domain */
      MM = hypergeom_gain(theta);
                                                                                
      st->gain[1] = prior_ratio * MM;
      /*Put some (very arbitraty) limit on the gain*/
      if (st->gain[1]>2)
      {
         st->gain[1]=2;
      }
                                                                                
      if (st->denoise_enabled)
      {
         st->gain2[1]=p*p*st->gain[1];
      } else {
         st->gain2[1]=1;
      }
   }

   for (i=2;i<(N-1);i++)
   {
      float MM;
      float theta;
      float prior_ratio;
      float p, q;
      float zeta1;
      float P1;
      
    
      zeta1 = .25*st->zeta[i-1] + .5*st->zeta[i] + .25*st->zeta[i+1];

      prior_ratio = st->prior[i]/(1.0001+st->prior[i]);
      theta = (1+st->post[i])*prior_ratio;

                                                                                

      if (zeta1<ZMIN)
         P1 = 0;
      else if (zeta1>ZMAX)
         P1 = 1;
      else
         P1 = LOG_MIN_MAX_1 * log(ZMIN_1*zeta1);
                                                                                
      /*P1 = log(zeta1/ZMIN)/log(ZMAX/ZMIN);*/

                                                                                
      /* FIXME: add global prop (P2) */
      q = 1-Pframe*P1;
      if (q>.95)
         q=.95;
      p=1/(1 + (q/(1-q))*(1+st->prior[i])*exp(-theta));
                                                                                
      /* Optimal estimator for loudness domain */
      MM = hypergeom_gain(theta);
                                                                                
      st->gain[i] = prior_ratio * MM;
      /*Put some (very arbitraty) limit on the gain*/
      if (st->gain[i]>2)
      {
         st->gain[i]=2;
      }
                                                                                
      if (st->denoise_enabled)
      {
         st->gain2[i]=p*p*st->gain[i];
      } else {
         st->gain2[i]=1;
      }
   }

   /* i = N-1 case */
   {
      float MM;
      float theta;
      float prior_ratio;
      float p, q;
      float zeta1;
      float P1;
                                                                                
      prior_ratio = st->prior[N-1]/(1.0001+st->prior[N-1]);
      theta = (1+st->post[N-1])*prior_ratio;
                                                                                
      zeta1 = st->zeta[N-1];

      if (zeta1<ZMIN)
         P1 = 0;
      else if (zeta1>ZMAX)
         P1 = 1;
      else
         P1 = LOG_MIN_MAX_1 * log(ZMIN_1*zeta1);
                                                                                
      /*P1 = log(zeta1/ZMIN)/log(ZMAX/ZMIN);*/
                                                                                
      /* FIXME: add global prop (P2) */
      q = 1-Pframe*P1;
      if (q>.95)
         q=.95;
      p=1/(1 + (q/(1-q))*(1+st->prior[N-1])*exp(-theta));
                                                                                
      /* Optimal estimator for loudness domain */
      MM = hypergeom_gain(theta);
                                                                                
      st->gain[N-1] = prior_ratio * MM;
      /*Put some (very arbitraty) limit on the gain*/
      if (st->gain[N-1]>2)
      {
         st->gain[N-1]=2;
      }
                                                                                
      if (st->denoise_enabled)
      {
         st->gain2[N-1]=p*p*st->gain[N-1];
      } else {
         st->gain2[N-1]=1;
      }
   }
   st->gain2[0]=st->gain[0]=0;
   st->gain2[N-1]=st->gain[N-1]=0;
}


int speex_preprocess(SpeexPreprocessState *st, short *x, float *echo)
{
   int i;
   int is_speech=1;
   float mean_post=0;
   float mean_prior=0;
   int N = st->ps_size;
   int N3 = 2*N - st->frame_size;
   int N4 = st->frame_size - N3;
   float scale=.5/N;
   float *ps=st->ps;
   float Zframe=0, Pframe;

   preprocess_analysis(st, x);

   update_noise_prob(st);

   st->nb_preprocess++;

   /* Noise estimation always updated for the 20 first times */
   if (st->nb_adapt<10)
   {
      update_noise(st, ps, echo);
   }

   /* Deal with residual echo if provided */
   if (echo)
      for (i=1;i<N;i++)
         st->echo_noise[i] = (.7*st->echo_noise[i] + .3* echo[i]);

   /* Compute a posteriori SNR */
   for (i=1;i<N;i++)
   {
      st->post[i] = ps[i]/(1+st->noise[i]+st->echo_noise[i]) - 1;
      if (st->post[i]>100)
         st->post[i]=100;
      /*if (st->post[i]<0)
        st->post[i]=0;*/
      mean_post+=st->post[i];
   }
   mean_post /= N;
   if (mean_post<0)
      mean_post=0;

   /* Special case for first frame */
   if (st->nb_adapt==1)
      for (i=1;i<N;i++)
         st->old_ps[i] = ps[i];

   /* Compute a priori SNR */
   {
      /* A priori update rate */
      float gamma;
      float min_gamma=0.12;
      gamma = 1.0/st->nb_preprocess;

      /*Make update rate smaller when there's no speech*/
#if 0
      if (mean_post<3.5 && mean_prior < 1)
         min_gamma *= (mean_post+.5);
      else
         min_gamma *= 4.;
#else
      min_gamma = .1*fabs(mean_prior - mean_post)*fabs(mean_prior - mean_post);
      if (min_gamma>.15)
         min_gamma = .15;
      if (min_gamma<.02)
         min_gamma = .02;
#endif
      /*min_gamma = .08;*/

      /*if (gamma<min_gamma)*/
         gamma=min_gamma;
      
      for (i=1;i<N;i++)
      {
         
         /* A priori SNR update */
         st->prior[i] = gamma*max(0.0,st->post[i]) +
         (1-gamma)*st->gain[i]*st->gain[i]*st->old_ps[i]/(1+st->noise[i]+st->echo_noise[i]);
         
         if (st->prior[i]>100)
            st->prior[i]=100;
         
         mean_prior+=st->prior[i];
      }
   }
   mean_prior /= N;

#if 0
   for (i=0;i<N;i++)
   {
      fprintf (stderr, "%f ", st->prior[i]);
   }
   fprintf (stderr, "\n");
#endif
   /*fprintf (stderr, "%f %f\n", mean_prior,mean_post);*/

   if (st->nb_preprocess>=20)
   {
      int do_update = 0;
      float noise_ener=0, sig_ener=0;
      /* If SNR is low (both a priori and a posteriori), update the noise estimate*/
      /*if (mean_prior<.23 && mean_post < .5)*/
      if (mean_prior<.23 && mean_post < .5)
         do_update = 1;
      for (i=1;i<N;i++)
      {
         noise_ener += st->noise[i];
         sig_ener += ps[i];
      }
      if (noise_ener > 3*sig_ener)
         do_update = 1;
      /*do_update = 0;*/
      if (do_update)
      {
         st->consec_noise++;
      } else {
         st->consec_noise=0;
      }
   }

   if (st->vad_enabled)
      is_speech = speex_compute_vad(st, ps, mean_prior, mean_post);


   if (st->consec_noise>=3)
   {
      update_noise(st, st->old_ps, echo);
   } else {
      for (i=1;i<N-1;i++)
      {
         if (st->update_prob[i]<.5)
            st->noise[i] = .90*st->noise[i] + .1*st->ps[i];
      }
   }

   for (i=1;i<N;i++)
   {
      st->zeta[i] = .7*st->zeta[i] + .3*st->prior[i];
   }

   {
      int freq_start = (int)(300.0*2*N/st->sampling_rate);
      int freq_end   = (int)(2000.0*2*N/st->sampling_rate);
      for (i=freq_start;i<freq_end;i++)
      {
         Zframe += st->zeta[i];         
      }
   }

   Zframe /= N;
   if (Zframe<ZMIN)
   {
      Pframe = 0;
   } else {
      if (Zframe > 1.5*st->Zlast)
      {
         Pframe = 1;
         st->Zpeak = Zframe;
         if (st->Zpeak > 10)
            st->Zpeak = 10;
         if (st->Zpeak < 1)
            st->Zpeak = 1;
      } else {
         if (Zframe < st->Zpeak*ZMIN)
         {
            Pframe = 0;
         } else if (Zframe > st->Zpeak*ZMAX)
         {
            Pframe = 1;
         } else {
            Pframe = log(Zframe/(st->Zpeak*ZMIN)) / log(ZMAX/ZMIN);
         }
      }
   }
   st->Zlast = Zframe;

   /*fprintf (stderr, "%f\n", Pframe);*/
   /* Compute gain according to the Ephraim-Malah algorithm */
   ephraim_malah(st,N,Pframe);

   if (st->agc_enabled)
      speex_compute_agc(st, mean_prior);

#if 0
   if (!is_speech)
   {
      for (i=0;i<N;i++)
         st->gain2[i] = 0;
   }
#if 0
 else {
      for (i=0;i<N;i++)
         st->gain2[i] = 1;
   }
#endif
#endif

   /* PERF: 14% when only vad is enabled [7.0 vs 8.2 sec] */
   if(st->agc_enabled || st->denoise_enabled) {
     /* Apply computed gain */
     for (i=1;i<N;i++)
     {
	st->frame[2*i-1] *= st->gain2[i];
	st->frame[2*i] *= st->gain2[i];
     }

     /* Get rid of the DC and very low frequencies */
     st->frame[0]=0;
     st->frame[1]=0;
     st->frame[2]=0;
     /* Nyquist frequency is mostly useless too */
     st->frame[2*N-1]=0;

     /* Inverse FFT with 1/N scaling */
     drft_backward(st->fft_lookup, st->frame);

     for (i=0;i<2*N;i++)
	st->frame[i] *= scale;

     {
	float max_sample=0;
	for (i=0;i<2*N;i++)
	   if (fabs(st->frame[i])>max_sample)
	      max_sample = fabs(st->frame[i]);
	if (max_sample>28000)
	{
	   float damp = 28000./max_sample;
	   for (i=0;i<2*N;i++)
	      st->frame[i] *= damp;
	}
     }

     for (i=0;i<2*N;i++)
	st->frame[i] *= st->window[i];

     /* Perform overlap and add */
     for (i=0;i<N3;i++)
	x[i] = st->outbuf[i] + st->frame[i];
     for (i=0;i<N4;i++)
	x[N3+i] = st->frame[N3+i];
     
     /* Update outbuf */
     for (i=0;i<N3;i++)
	st->outbuf[i] = st->frame[st->frame_size+i];
   }

   /* Save old power spectrum */
   for (i=1;i<N;i++)
      st->old_ps[i] = ps[i];

   return is_speech;
}

void speex_preprocess_estimate_update(SpeexPreprocessState *st, short *x, float *noise)
{
   int i;
   int N = st->ps_size;
   int N3 = 2*N - st->frame_size;

   float *ps=st->ps;

   preprocess_analysis(st, x);

   update_noise_prob(st);

   st->nb_preprocess++;
   
   for (i=1;i<N-1;i++)
   {
      if (st->update_prob[i]<.5)
         st->noise[i] = .90*st->noise[i] + .1*ps[i];
   }

   for (i=0;i<N3;i++)
      st->outbuf[i] = x[st->frame_size-N3+i]*st->window[st->frame_size+i];

   /* Save old power spectrum */
   for (i=1;i<N;i++)
      st->old_ps[i] = ps[i];

}


int speex_preprocess_ctl(SpeexPreprocessState *state, int request, void *ptr)
{
   SpeexPreprocessState *st;
   st=(SpeexPreprocessState*)state;
   switch(request)
   {
   case SPEEX_PREPROCESS_SET_DENOISE:
      st->denoise_enabled = (*(int*)ptr);
      break;
   case SPEEX_PREPROCESS_GET_DENOISE:
      (*(int*)ptr) = st->denoise_enabled;
      break;

   case SPEEX_PREPROCESS_SET_AGC:
      st->agc_enabled = (*(int*)ptr);
      break;
   case SPEEX_PREPROCESS_GET_AGC:
      (*(int*)ptr) = st->agc_enabled;
      break;

   case SPEEX_PREPROCESS_SET_AGC_LEVEL:
      st->agc_level = (*(float*)ptr);
      if (st->agc_level<1)
         st->agc_level=1;
      if (st->agc_level>32768)
         st->agc_level=32768;
      break;
   case SPEEX_PREPROCESS_GET_AGC_LEVEL:
      (*(float*)ptr) = st->agc_level;
      break;

   case SPEEX_PREPROCESS_SET_VAD:
      st->vad_enabled = (*(int*)ptr);
      break;
   case SPEEX_PREPROCESS_GET_VAD:
      (*(int*)ptr) = st->vad_enabled;
      break;
      
	case SPEEX_PREPROCESS_SET_PROB_START:
		st->speech_prob_start = (*(float*)ptr) ;
		if ( st->speech_prob_start > 1 )
			st->speech_prob_start = st->speech_prob_start / 100 ;
		if ( st->speech_prob_start > 1 || st->speech_prob_start < 0 )
			st->speech_prob_start = SPEEX_PROB_START ;
		break ;
	case SPEEX_PREPROCESS_GET_PROB_START:
		(*(float*)ptr) = st->speech_prob_start ;
		break ;
      
	case SPEEX_PREPROCESS_SET_PROB_CONTINUE:
		st->speech_prob_continue = (*(float*)ptr) ;
		if ( st->speech_prob_continue > 1 )
			st->speech_prob_continue = st->speech_prob_continue / 100 ;
		if ( st->speech_prob_continue > 1 || st->speech_prob_continue < 0 )
			st->speech_prob_continue = SPEEX_PROB_CONTINUE ;
		break ;
		break ;
	case SPEEX_PREPROCESS_GET_PROB_CONTINUE:
		(*(float*)ptr) = st->speech_prob_continue ;
		break ;
      
   default:
      speex_warning_int("Unknown speex_preprocess_ctl request: ", request);
      return -1;
   }
   return 0;
}

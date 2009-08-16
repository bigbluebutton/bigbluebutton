/* Copyright (C) 2002 Jean-Marc Valin */
/**
   @file misc.h
   @brief Various compatibility routines for Speex
*/
/*
   Redistribution and use in source and binary forms, with or without
   modification, are permitted provided that the following conditions
   are met:
   
   - Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.
   
   - Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.
   
   - Neither the name of the Xiph.org Foundation nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.
   
   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
   ``AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
   LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
   A PARTICULAR PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE FOUNDATION OR
   CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
   EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
   PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
   PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
   LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
   NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
   SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

#ifndef MISC_H
#define MISC_H

#ifndef VERSION
#define VERSION "speex-1.1"
#endif

#ifdef FIXED_POINT

typedef signed short spx_word16_t;
typedef signed int   spx_word32_t;
typedef spx_word32_t spx_mem_t;
typedef spx_word16_t spx_coef_t;
typedef spx_word16_t spx_lsp_t;
typedef spx_word32_t spx_sig_t;

#define LPC_SCALING  8192.
#define SIG_SCALING  16384
#define LSP_SCALING  8192.

#define LPC_SHIFT    13
#define SIG_SHIFT    14

#define PSHR(a,shift) (((a)+(1<<((shift)-1))) >> (shift))
#define SHR(a,shift) ((a) >> (shift))
#define SHL(a,shift) ((a) << (shift))

/* result fits in 16 bits */
#define MULT16_16_16(a,b)     (((short)(a))*(b))

#define MULT16_16(a,b)     (((signed int)(a))*(b))
#define MULT16_32_Q13(a,b) (((a)*((b)>>13)) + ((a)*((signed int)((b)&0x00001fff))>>13))
#define MULT16_32_Q14(a,b) (((a)*((b)>>14)) + ((a)*((signed int)((b)&0x00003fff))>>14))
#define MULT16_32_Q15(a,b) (((a)*((b)>>15)) + ((a)*((signed int)((b)&0x00007fff))>>15))

#define MULT16_16_Q13(a,b) (((signed int)(a))*(b)>>13)
#define MULT16_16_Q14(a,b) (((signed int)(a))*(b)>>14)
#define MULT16_16_Q15(a,b) (((signed int)(a))*(b)>>15)

#define MULT16_16_P14(a,b) ((8192+((signed int)(a))*(b))>>14)


#define DIV32_16(a,b) (((signed int)(a))/(b))

#else

typedef float spx_mem_t;
typedef float spx_coef_t;
typedef float spx_lsp_t;
typedef float spx_sig_t;
typedef float spx_word16_t;
typedef float spx_word32_t;

#define LPC_SCALING  1.
#define SIG_SCALING  1.
#define LSP_SCALING  1.

#define LPC_SHIFT    0
#define SIG_SHIFT    0

#define PSHR(a,shift)       (a)
#define SHR(a,shift)       (a)
#define SHL(a,shift)       (a)
#define MULT16_16_16(a,b)     ((a)*(b))
#define MULT16_16(a,b)     ((a)*(b))

#define MULT16_32_Q13(a,b)     ((a)*(b))
#define MULT16_32_Q14(a,b)     ((a)*(b))
#define MULT16_32_Q15(a,b)     ((a)*(b))

#define MULT16_16_Q13(a,b)     ((a)*(b))
#define MULT16_16_Q14(a,b)     ((a)*(b))
#define MULT16_16_Q15(a,b)     ((a)*(b))


#endif

#ifndef RELEASE
void print_vec(float *vec, int len, char *name);
#endif

unsigned int be_int(unsigned int i);
unsigned int le_int(unsigned int i);


unsigned short be_short(unsigned short s);
unsigned short le_short(unsigned short s);

/** Speex wrapper for calloc. To do your own dynamic allocation, all you need to do is replace this function, speex_realloc and speex_free */
void *speex_alloc (int size);

/** Speex wrapper for realloc. To do your own dynamic allocation, all you need to do is replace this function, speex_alloc and speex_free */
void *speex_realloc (void *ptr, int size);

/** Speex wrapper for calloc. To do your own dynamic allocation, all you need to do is replace this function, speex_realloc and speex_alloc */
void speex_free (void *ptr);

/** Speex wrapper for mem_move */
void *speex_move (void *dest, void *src, int n);

void speex_error(char *str);

void speex_warning(char *str);

void speex_warning_int(char *str, int val);

void speex_rand_vec(float std, spx_sig_t *data, int len);

float speex_rand(float std);

void _speex_putc(int ch, void *file);

#endif

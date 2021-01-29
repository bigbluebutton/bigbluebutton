/*
 *  This file was taken from pth-1.40/aclocal.m4
 *  The original copyright is below.
 *
 *  GNU Pth - The GNU Portable Threads
 *  Copyright (c) 1999-2001 Ralf S. Engelschall <rse@engelschall.com>
 *
 *  This file is part of GNU Pth, a non-preemptive thread scheduling
 *  library which can be found at http://www.gnu.org/software/pth/.
 *
 *  This file is free software; you can redistribute it and/or
 *  modify it under the terms of the GNU Lesser General Public
 *  License as published by the Free Software Foundation; either
 *  version 2.1 of the License, or (at your option) any later version.
 *
 *  This file is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 *  Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public
 *  License along with this file; if not, write to the Free Software
 *  Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307
 *  USA, or contact Marc Lehmann <schmorp@schmorp.de>.
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#if defined(TEST_sigstack) || defined(TEST_sigaltstack)
#include <sys/types.h>
#include <signal.h>
#include <unistd.h>
#endif
#if defined(TEST_makecontext)
#include <ucontext.h>
#endif
union alltypes {
    long   l;
    double d;
    void  *vp;
    void (*fp)(void);
    char  *cp;
};
static volatile char *handler_addr = (char *)0xDEAD;
#if defined(TEST_sigstack) || defined(TEST_sigaltstack)
static volatile int handler_done = 0;
void handler(int sig)
{
    char garbage[1024];
    int i;
    auto int dummy;
    for (i = 0; i < 1024; i++)
        garbage[i] = 'X';
    handler_addr = (char *)&dummy;
    handler_done = 1;
    return;
}
#endif
#if defined(TEST_makecontext)
static ucontext_t uc_handler;
static ucontext_t uc_main;
void handler(void)
{
    char garbage[1024];
    int i;
    auto int dummy;
    for (i = 0; i < 1024; i++)
        garbage[i] = 'X';
    handler_addr = (char *)&dummy;
    swapcontext(&uc_handler, &uc_main);
    return;
}
#endif
int main(int argc, char *argv[])
{
    FILE *f;
    char *skaddr;
    char *skbuf;
    int sksize;
    char result[1024];
    int i;
    sksize = 32768;
    skbuf = (char *)malloc(sksize*2+2*sizeof(union alltypes));
    if (skbuf == NULL)
        exit(1);
    for (i = 0; i < sksize*2+2*sizeof(union alltypes); i++)
        skbuf[i] = 'A';
    skaddr = skbuf+sizeof(union alltypes);
#if defined(TEST_sigstack) || defined(TEST_sigaltstack)
    {
        struct sigaction sa;
#if defined(TEST_sigstack)
        struct sigstack ss;
#elif defined(TEST_sigaltstack) && defined(HAVE_STACK_T)
        stack_t ss;
#else
        struct sigaltstack ss;
#endif
#if defined(TEST_sigstack)
        ss.ss_sp      = (void *)(skaddr + sksize);
        ss.ss_onstack = 0;
        if (sigstack(&ss, NULL) < 0)
            exit(1);
#elif defined(TEST_sigaltstack)
        ss.ss_sp    = (void *)(skaddr + sksize);
        ss.ss_size  = sksize;
        ss.ss_flags = 0;
        if (sigaltstack(&ss, NULL) < 0)
            exit(1);
#endif
        memset((void *)&sa, 0, sizeof(struct sigaction));
        sa.sa_handler = handler;
        sa.sa_flags = SA_ONSTACK;
        sigemptyset(&sa.sa_mask);
        sigaction(SIGUSR1, &sa, NULL);
        kill(getpid(), SIGUSR1);
        while (!handler_done)
            /*nop*/;
    }
#endif
#if defined(TEST_makecontext)
    {
        if (getcontext(&uc_handler) != 0)
            exit(1);
        uc_handler.uc_link = NULL;
        uc_handler.uc_stack.ss_sp    = (void *)(skaddr + sksize);
        uc_handler.uc_stack.ss_size  = sksize;
        uc_handler.uc_stack.ss_flags = 0;
        makecontext(&uc_handler, handler, 1);
        swapcontext(&uc_main, &uc_handler);
    }
#endif
    if (handler_addr == (char *)0xDEAD)
        exit(1);
    if (handler_addr < skaddr+sksize) {
        /* stack was placed into lower area */
        if (*(skaddr+sksize) != 'A')
             sprintf(result, "(skaddr)+(sksize)-%d,(sksize)-%d",
                     sizeof(union alltypes), sizeof(union alltypes));
        else
             strcpy(result, "(skaddr)+(sksize),(sksize)");
    }
    else {
        /* stack was placed into higher area */
        if (*(skaddr+sksize*2) != 'A')
            sprintf(result, "(skaddr),(sksize)-%d", sizeof(union alltypes));
        else
            strcpy(result, "(skaddr),(sksize)");
    }
    printf("%s\n", result);
    exit(0);
}


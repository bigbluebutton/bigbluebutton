/*
 * This file is part of the Sofia-SIP package
 *
 * Copyright (C) 2006 Nokia Corporation.
 *
 * Contact: Pekka Pessi <pekka.pessi@nokia.com>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public License
 * as published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA
 *
 */

/**@CFILE tport_type_ws.c WS Transport
 *
 * See tport.docs for more detailed description of tport interface.
 *
 * @author Pekka Pessi <Pekka.Pessi@nokia.com>
 * @author Martti Mela <Martti.Mela@nokia.com>
 *
 * @date Created: Fri Mar 24 08:45:49 EET 2006 ppessi
 */

#include "config.h"

#include "tport_internal.h"
#include "tport_ws.h"
#include "tport_tls.h"

#if HAVE_NETINET_TCP_H
#include <netinet/tcp.h>
#endif

#ifndef SOL_TCP
#define SOL_TCP IPPROTO_TCP
#endif

#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <assert.h>
#include <errno.h>
#include <limits.h>

#if HAVE_FUNC
#elif HAVE_FUNCTION
#define __func__ __FUNCTION__
#else
static char const __func__[] = "tport_type_ws";
#endif

#if HAVE_WIN32
#include <io.h>
#define access(_filename, _mode) _access(_filename, _mode)
#define R_OK (04)
#endif

/* ---------------------------------------------------------------------- */
/* WS */

#include <sofia-sip/http.h>
#include <sofia-sip/http_header.h>

static int tport_ws_init_primary_secure(tport_primary_t *pri,
				 tp_name_t tpn[1],
				 su_addrinfo_t *ai,
				 tagi_t const *tags,
				 char const **return_culprit);

static int tport_ws_setsndbuf(int socket, int atleast);
static void tport_ws_deinit_primary(tport_primary_t *pri);

tport_vtable_t const tport_ws_vtable =
{
  /* vtp_name 		     */ "ws",
  /* vtp_public              */ tport_type_local,
  /* vtp_pri_size            */ sizeof (tport_ws_primary_t),
  /* vtp_init_primary        */ tport_ws_init_primary,
  /* vtp_deinit_primary      */ tport_ws_deinit_primary,
  /* vtp_wakeup_pri          */ tport_accept,
  /* vtp_connect             */ NULL,
  /* vtp_secondary_size      */ sizeof (tport_ws_t),
  /* vtp_init_secondary      */ tport_ws_init_secondary,
  /* tp_deinit_secondary    */ tport_ws_deinit_secondary,
  /* vtp_shutdown            */ NULL,
  /* vtp_set_events          */ NULL,
  /* vtp_wakeup              */ NULL,
  /* vtp_recv                */ tport_recv_stream_ws,
  /* vtp_send                */ tport_send_stream_ws,
  /* vtp_deliver             */ NULL,
  /* vtp_prepare             */ NULL,
  /* vtp_keepalive           */ NULL,
  /* vtp_stun_response       */ NULL,
  /* vtp_next_secondary_timer*/ tport_ws_next_timer,
  /* vtp_secondary_timer     */ tport_ws_timer,
};

tport_vtable_t const tport_ws_client_vtable =
{
  /* vtp_name 		     */ "ws",
  /* vtp_public              */ tport_type_client,
  /* vtp_pri_size            */ sizeof (tport_ws_primary_t),
  /* vtp_init_primary        */ tport_ws_init_client,
  /* vtp_deinit_primary      */ tport_ws_deinit_primary,
  /* vtp_wakeup_pri          */ NULL,
  /* vtp_connect             */ NULL,
  /* vtp_secondary_size      */ sizeof (tport_ws_t),
  /* vtp_init_secondary      */ tport_ws_init_secondary,
  /* vtp_deinit_secondary    */ NULL,
  /* vtp_shutdown            */ NULL,
  /* vtp_set_events          */ NULL,
  /* vtp_wakeup              */ NULL,
  /* vtp_recv                */ tport_recv_stream_ws,
  /* vtp_send                */ tport_send_stream_ws,
  /* vtp_deliver             */ NULL,
  /* vtp_prepare             */ NULL,
  /* vtp_keepalive           */ NULL,
  /* vtp_stun_response       */ NULL,
  /* vtp_next_secondary_timer*/ tport_ws_next_timer,
  /* vtp_secondary_timer     */ tport_ws_timer,
};

tport_vtable_t const tport_wss_vtable =
{
  /* vtp_name 		     */ "wss",
  /* vtp_public              */ tport_type_local,
  /* vtp_pri_size            */ sizeof (tport_ws_primary_t),
  /* vtp_init_primary        */ tport_ws_init_primary_secure,
  /* vtp_deinit_primary      */ tport_ws_deinit_primary,
  /* vtp_wakeup_pri          */ tport_accept,
  /* vtp_connect             */ NULL,
  /* vtp_secondary_size      */ sizeof (tport_ws_t),
  /* vtp_init_secondary      */ tport_ws_init_secondary,
  /* vtp_deinit_secondary    */ tport_ws_deinit_secondary,
  /* vtp_shutdown            */ NULL,
  /* vtp_set_events          */ NULL,
  /* vtp_wakeup              */ NULL,
  /* vtp_recv                */ tport_recv_stream_ws,
  /* vtp_send                */ tport_send_stream_ws,
  /* vtp_deliver             */ NULL,
  /* vtp_prepare             */ NULL,
  /* vtp_keepalive           */ NULL,
  /* vtp_stun_response       */ NULL,
  /* vtp_next_secondary_timer*/ tport_ws_next_timer,
  /* vtp_secondary_timer     */ tport_ws_timer,
};

tport_vtable_t const tport_wss_client_vtable =
{
  /* vtp_name 		     */ "wss",
  /* vtp_public              */ tport_type_client,
  /* vtp_pri_size            */ sizeof (tport_ws_primary_t),
  /* vtp_init_primary        */ tport_ws_init_client,
  /* vtp_deinit_primary      */ tport_ws_deinit_primary,
  /* vtp_wakeup_pri          */ NULL,
  /* vtp_connect             */ NULL,
  /* vtp_secondary_size      */ sizeof (tport_ws_t),
  /* vtp_init_secondary      */ tport_ws_init_secondary,
  /* vtp_deinit_secondary    */ NULL,
  /* vtp_shutdown            */ NULL,
  /* vtp_set_events          */ NULL,
  /* vtp_wakeup              */ NULL,
  /* vtp_recv                */ tport_recv_stream_ws,
  /* vtp_send                */ tport_send_stream_ws,
  /* vtp_deliver             */ NULL,
  /* vtp_prepare             */ NULL,
  /* vtp_keepalive           */ NULL,
  /* vtp_stun_response       */ NULL,
  /* vtp_next_secondary_timer*/ tport_ws_next_timer,
  /* vtp_secondary_timer     */ tport_ws_timer,
};


static void tport_ws_deinit_primary(tport_primary_t *pri)
{
  tport_ws_primary_t *wspri = (tport_ws_primary_t *)pri;

  if ( wspri->ssl_ctx ) {
	  SSL_CTX_free(wspri->ssl_ctx);
	  wspri->ssl_ctx = NULL;
  }
}

/** Receive from stream.
 *
 * @retval -1 error
 * @retval 0  end-of-stream
 * @retval 1  normal receive
 * @retval 2  incomplete recv, recv again
 *
 */
int tport_recv_stream_ws(tport_t *self)
{
  msg_t *msg;
  ssize_t n, N, veclen, i, m;
  int err;
  msg_iovec_t iovec[msg_n_fragments] = {{ 0 }};
  tport_ws_t *wstp = (tport_ws_t *)self;
  uint8_t *data;
  ws_opcode_t oc;

  if (wstp->ws_initialized < 0) {
	  return -1;
  }

  N = ws_read_frame(&wstp->ws, &oc, &data);

  if (N == -2) {
	  return 1;
  }

  if ((N == -1000) || (N == 0)) {
	  if (self->tp_msg) {
		  msg_recv_commit(self->tp_msg, 0, 1);
	  }
	  return 0;    /* End of stream */
  }
  if (N < 0) {
	  err = errno = EHOSTDOWN;
	  SU_DEBUG_1(("%s(%p): su_getmsgsize(): %s (%d) N=%ld\n", __func__, (void *)self,
				  su_strerror(err), err, (long)N));
	  return 0;
  }

  veclen = tport_recv_iovec(self, &self->tp_msg, iovec, N, 0);
  if (veclen < 0)
    return -1;

  msg = self->tp_msg;

  msg_set_address(msg, self->tp_addr, self->tp_addrlen);

  for (i = 0, n = 0; i < veclen; i++) {
    m = iovec[i].mv_len; assert(N >= n + m);
    memcpy(iovec[i].mv_base, data + n, m);
    n += m;
  }

  assert(N == n);

  /* Write the received data to the message dump file */
  if (self->tp_master->mr_dump_file)
	  tport_dump_iovec(self, msg, n, iovec, veclen, "recv", "from");

  if (self->tp_master->mr_capt_sock)
      tport_capt_msg(self, msg, n, iovec, veclen, "recv");

  /* Mark buffer as used */
  msg_recv_commit(msg, N, 0);

  return 1;
}

/** Send to stream */
ssize_t tport_send_stream_ws(tport_t const *self, msg_t *msg,
			  msg_iovec_t iov[],
			  size_t iovlen)
{
  size_t i, j, m, size = 0;
  ssize_t nerror;
  tport_ws_t *wstp = (tport_ws_t *)self;

  wstp->wstp_buflen = 0;

  for (i = 0; i < iovlen; i = j) {
	char *buf = NULL;
    unsigned wsbufsize = sizeof(wstp->wstp_buffer);

    for (j = i, m = 0; buf && j < iovlen; j++) {
		if (m + iov[j].siv_len > wsbufsize) {
			break;
		}
		if (buf + m != iov[j].siv_base) {
			memcpy(buf + m, iov[j].siv_base, iov[j].siv_len);
		}
		m += iov[j].siv_len; iov[j].siv_len = 0;
    }
	
    if (j == i) {
      buf = iov[i].siv_base, m = iov[i].siv_len, j++;
	} else {
      iov[j].siv_base = buf, iov[j].siv_len = m;
	}

	nerror = 0;
	
	if (m + wstp->wstp_buflen >= wsbufsize) {
		nerror = -1;
		errno = ENOMEM;
	} else {
		if (memcpy(wstp->wstp_buffer + wstp->wstp_buflen, buf, m)) {
			wstp->wstp_buflen += m;
		} else {
			nerror = -1;
			errno = ENOMEM;
		}
	}

    SU_DEBUG_9(("tport_ws_writevec: vec %p %p %lu ("MOD_ZD")\n",
		(void *)&wstp->ws, (void *)iov[i].siv_base, (LU)iov[i].siv_len,
		nerror));

    if (nerror == -1) {
      int err = su_errno();
      if (su_is_blocking(err))
		  break;
      SU_DEBUG_3(("ws_write: %s\n", strerror(err)));
      return -1;
    }
  }

  if (wstp->wstp_buflen) {
	  ssize_t wrote = 0;
	  
	  *(wstp->wstp_buffer + wstp->wstp_buflen) = '\0';
	  wrote = ws_write_frame(&wstp->ws, WSOC_TEXT, wstp->wstp_buffer, wstp->wstp_buflen);

	  if (wrote < 0) {
		  int err = su_errno();
		  SU_DEBUG_3(("ws_write_frame: %s\n", strerror(err)));
		  size = wrote;
		  
	  } else {
		  size = wstp->wstp_buflen;
	  }
  }

  return size;
}

static int tport_ws_init_primary_secure(tport_primary_t *pri,
				 tp_name_t tpn[1],
				 su_addrinfo_t *ai,
				 tagi_t const *tags,
				 char const **return_culprit)
{
  tport_ws_primary_t *wspri = (tport_ws_primary_t *)pri;
  const char *cert = "/ssl.pem";
  const char *key = "/ssl.pem";
  const char *chain = NULL;
  char *homedir;
  char *tbf = NULL;
  su_home_t autohome[SU_HOME_AUTO_SIZE(1024)];
  char const *path = NULL;
  int ret = -1;

  su_home_auto(autohome, sizeof autohome);

  tl_gets(tags,
	  TPTAG_CERTIFICATE_REF(path),
	  TAG_END());

  if (!path) {
    homedir = getenv("HOME");
    if (!homedir)
      homedir = "";
    path = tbf = su_sprintf(autohome, "%s/.sip/auth", homedir);
  }

  if (path) {
    key  = su_sprintf(autohome, "%s/%s", path, "wss.key");
	if (access(key, R_OK) != 0) key = NULL;

	cert = su_sprintf(autohome, "%s/%s", path, "wss.crt");
	if (access(cert, R_OK) != 0) cert = NULL;

	chain = su_sprintf(autohome, "%s/%s", path, "ca-bundle.crt");
	if (access(chain, R_OK) != 0) chain = NULL;

	if ( !key )  key  = su_sprintf(autohome, "%s/%s", path, "wss.pem");
	if ( !cert ) cert = su_sprintf(autohome, "%s/%s", path, "wss.pem");
	if ( !chain ) chain = su_sprintf(autohome, "%s/%s", path, "wss.pem");
	if (access(key, R_OK) != 0) key = NULL;
	if (access(cert, R_OK) != 0) cert = NULL;
	if (access(chain, R_OK) != 0) chain = NULL;
  }

  init_ssl();

  //  OpenSSL_add_all_algorithms();   /* load & register cryptos */                                                                                       
  //  SSL_load_error_strings();     /* load all error messages */                                                                                         
  wspri->ssl_method = SSLv23_server_method();   /* create server instance */
  wspri->ssl_ctx = SSL_CTX_new((SSL_METHOD *)wspri->ssl_method);         /* create context */
  SSL_CTX_sess_set_remove_cb(wspri->ssl_ctx, NULL);
  wspri->ws_secure = 1;

  if ( !wspri->ssl_ctx ) {
      tls_log_errors(3, "tport_ws_init_primary_secure", 0);
      goto done;
  }

  /* Disable SSLv2 */
  SSL_CTX_set_options(wspri->ssl_ctx, SSL_OP_NO_SSLv2);
  /* Disable SSLv3 */
  SSL_CTX_set_options(wspri->ssl_ctx, SSL_OP_NO_SSLv3);
  /* Disable TLSv1 */
  SSL_CTX_set_options(wspri->ssl_ctx, SSL_OP_NO_TLSv1);
  /* Disable Compression CRIME (Compression Ratio Info-leak Made Easy) */
  SSL_CTX_set_options(wspri->ssl_ctx, SSL_OP_NO_COMPRESSION);
  
  if (chain) {
	  if ( !SSL_CTX_use_certificate_chain_file(wspri->ssl_ctx, chain) ) {
            tls_log_errors(3, "tport_ws_init_primary_secure", 0);
          }
  }

  /* set the local certificate from CertFile */
  if ( !SSL_CTX_use_certificate_file(wspri->ssl_ctx, cert, SSL_FILETYPE_PEM) ) {
      tls_log_errors(3, "tport_ws_init_primary_secure", 0);
      goto done;
  }
  /* set the private key from KeyFile */
  if ( !SSL_CTX_use_PrivateKey_file(wspri->ssl_ctx, key, SSL_FILETYPE_PEM) ) {
      tls_log_errors(3, "tport_ws_init_primary_secure", 0);
      goto done;
  }
  /* verify private key */
  if ( !SSL_CTX_check_private_key(wspri->ssl_ctx) ) {
      tls_log_errors(3, "tport_ws_init_primary_secure", 0);
      goto done;
  }

  if ( !SSL_CTX_set_cipher_list(wspri->ssl_ctx, "!eNULL:!aNULL:!DSS:HIGH:@STRENGTH") ) {
      tls_log_errors(3, "tport_ws_init_primary_secure", 0);
      goto done;
  }

  ret = tport_ws_init_primary(pri, tpn, ai, tags, return_culprit);

 done:
  su_home_zap(autohome);
  return ret;
}

int tport_ws_init_primary(tport_primary_t *pri,
			   tp_name_t tpn[1],
			   su_addrinfo_t *ai,
			   tagi_t const *tags,
			   char const **return_culprit)
{
  int socket;

  socket = su_socket(ai->ai_family, ai->ai_socktype, ai->ai_protocol);

  if (socket == INVALID_SOCKET)
    return *return_culprit = "socket", -1;

  tport_ws_setsndbuf(socket, 64 * 1024);

  return tport_stream_init_primary(pri, socket, tpn, ai, tags, return_culprit);
}

int tport_ws_init_client(tport_primary_t *pri,
			  tp_name_t tpn[1],
			  su_addrinfo_t *ai,
			  tagi_t const *tags,
			  char const **return_culprit)
{
  pri->pri_primary->tp_conn_orient = 1;

  return 0;
}

int tport_ws_init_secondary(tport_t *self, int socket, int accepted,
			     char const **return_reason)
{
  int one = 1;
  tport_ws_primary_t *wspri = (tport_ws_primary_t *)self->tp_pri;
  tport_ws_t *wstp = (tport_ws_t *)self;

  self->tp_has_connection = 1;
  self->tp_params->tpp_keepalive = 5000;

  /* override the default 30 minute timeout on tport connections */
  self->tp_params->tpp_idle = UINT_MAX;

  if (setsockopt(socket, SOL_TCP, TCP_NODELAY, (void *)&one, sizeof one) == -1)
	  return *return_reason = "TCP_NODELAY", -1;

#if defined(SO_KEEPALIVE)
  setsockopt(socket, SOL_SOCKET, SO_KEEPALIVE, (void *)&one, sizeof one);
#endif
  one = 30;
#if defined(TCP_KEEPIDLE)
  setsockopt(socket, SOL_TCP, TCP_KEEPIDLE, (void *)&one, sizeof one);
#endif
#if defined(TCP_KEEPINTVL)
  setsockopt(socket, SOL_TCP, TCP_KEEPINTVL, (void *)&one, sizeof one);
#endif


  if (!accepted)
    tport_ws_setsndbuf(socket, 64 * 1024);

  if ( wspri->ws_secure ) wstp->ws_secure = 1;

  memset(&wstp->ws, 0, sizeof(wstp->ws));

  if (ws_init(&wstp->ws, socket, wstp->ws_secure ? wspri->ssl_ctx : NULL, 0, 0, 0) < 0) {
	  ws_destroy(&wstp->ws);
	  wstp->ws_initialized = -1;
	  return *return_reason = "WS_INIT", -1;
  }

  wstp->connected = time(NULL);

  wstp->ws_initialized = 1;
  self->tp_pre_framed = 1;
  
  tport_set_secondary_timer(self);

  return 0;
}

static void tport_ws_deinit_secondary(tport_t *self)
{
	tport_ws_t *wstp = (tport_ws_t *)self;

	if (wstp->ws_initialized == 1) {
		SU_DEBUG_1(("%p destroy ws%s transport %p.\n", (void *) self, wstp->ws_secure ? "s" : "", (void *) &wstp->ws));
		ws_destroy(&wstp->ws);
		wstp->ws_initialized = -1;
	}
}

static int tport_ws_setsndbuf(int socket, int atleast)
{
#if SU_HAVE_WINSOCK2
  /* Set send buffer size to something reasonable on windows */
  int size = 0;
  socklen_t sizelen = sizeof size;

  if (getsockopt(socket, SOL_SOCKET, SO_SNDBUF, (void *)&size, &sizelen) < 0)
    return -1;

  if (sizelen != sizeof size)
    return su_seterrno(EINVAL);

  if (size >= atleast)
    return 0;			/* OK */

  return setsockopt(socket, SOL_SOCKET, SO_SNDBUF,
		    (void *)&atleast, sizeof atleast);
#else
  return 0;
#endif
}


/** Send PING */
int tport_ws_ping(tport_t *self, su_time_t now)
{
  ssize_t n;
  char *why = "";

  if (tport_has_queued(self))
    return 0;

  n = send(self->tp_socket, "\r\n\r\n", 4, 0);

  if (n > 0)
    self->tp_ktime = now;

  if (n == 4) {
    if (self->tp_ptime.tv_sec == 0)
      self->tp_ptime = now;
  }
  else if (n == -1) {
    int error = su_errno();

    why = " failed";

    if (!su_is_blocking(error))
      tport_error_report(self, error, NULL);
    else
      why = " blocking";
  }

  SU_DEBUG_7(("%s(%p): %s to " TPN_FORMAT "%s\n",
	      __func__, (void *)self,
	      "sending PING", TPN_ARGS(self->tp_name), why));

  return n == -1 ? -1 : 0;
}

/** Send pong */
int tport_ws_pong(tport_t *self)
{
  self->tp_ping = 0;

  if (tport_has_queued(self) || !self->tp_params->tpp_pong2ping)
    return 0;

  SU_DEBUG_7(("%s(%p): %s to " TPN_FORMAT "%s\n",
	      __func__, (void *)self,
	      "sending PONG", TPN_ARGS(self->tp_name), ""));

  return send(self->tp_socket, "\r\n", 2, 0);
}

/** Calculate next timer for WS. */
int tport_ws_next_timer(tport_t *self,
			 su_time_t *return_target,
			 char const **return_why)
{
	tport_ws_t *wstp = (tport_ws_t *)self;
	int ll = establish_logical_layer(&wstp->ws);
	int punt = 0;

	if (ll == -1) {
		punt = 1;
	} else if (ll < 0) {
		time_t now = time(NULL);
		if (now - wstp->connected > 5) {
			punt = 2;
		}
	} else {
		self->tp_params->tpp_keepalive = 0;
	}

	if (punt) {
		tport_close(self);

		SU_DEBUG_7(("%s(%p): %s to " TPN_FORMAT "%s\n",
					__func__, (void *)self,
					(punt == 2 ? "Timeout establishing SSL" : "Error establishing SSL"), TPN_ARGS(self->tp_name), ""));
                if (wstp->ws.secure)
                        return -1;
	}


  return
    tport_next_recv_timeout(self, return_target, return_why) |
    tport_next_keepalive(self, return_target, return_why);
}

/** WS timer. */
void tport_ws_timer(tport_t *self, su_time_t now)
{
  tport_ws_t *wstp = (tport_ws_t *)self;

  if (!strcmp("wss", self->tp_protoname) && !wstp->ws.secure_established) {
    tport_close(self);
  } else {
    tport_recv_timeout_timer(self, now);
    tport_keepalive_timer(self, now);
  }
  tport_base_timer(self, now);
}

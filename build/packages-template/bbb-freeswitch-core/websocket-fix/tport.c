/*
 * This file is part of the Sofia-SIP package
 *
 * Copyright (C) 2005 Nokia Corporation.
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

/**@CFILE tport.c Transport interface implementation.
 *
 * See tport.docs for more detailed description of tport interface.
 *
 * @author Pekka Pessi <Pekka.Pessi@nokia.com>
 * @author Ismo Puustinen <Ismo.H.Puustinen@nokia.com>
 * @author Tat Chan <Tat.Chan@nokia.com>
 * @author Kai Vehmanen <kai.vehmanen@nokia.com>
 * @author Martti Mela <Martti.Mela@nokia.com>
 *
 * @date Created: Thu Jul 20 12:54:32 2000 ppessi
 */

#include "config.h"

#include <sofia-sip/su_string.h>
#include <sofia-sip/su.h>
#include <sofia-sip/su_errno.h>
#include <sofia-sip/su_alloc.h>
#include <sofia-sip/su_tagarg.h>
#include <sofia-sip/su_localinfo.h>

typedef struct tport_nat_s tport_nat_t;

#define SU_WAKEUP_ARG_T         struct tport_s
#define SU_TIMER_ARG_T          struct tport_s
#define SU_MSG_ARG_T            union tport_su_msg_arg

#include <sofia-sip/su_wait.h>

#include <sofia-sip/msg.h>
#include <sofia-sip/msg_addr.h>
#include <sofia-sip/hostdomain.h>

#include <stdlib.h>
#include <time.h>
#include <assert.h>
#include <errno.h>
#include <limits.h>

#ifndef IPPROTO_SCTP
#define IPPROTO_SCTP (132)
#endif

#include "sofia-sip/tport.h"
#include "sofia-sip/su_uniqueid.h"
#include <sofia-sip/rbtree.h>

#include "tport_internal.h"

#if HAVE_FUNC
#elif HAVE_FUNCTION
#define __func__ __FUNCTION__
#else
static char const __func__[] = "tport";
#endif

#define STACK_RECV(tp, msg, now)		       \
  (tp)->tp_master->mr_tpac->tpac_recv((tp)->tp_master->mr_stack, (tp), \
				      (msg), (tp)->tp_magic, (now))

#define STACK_ERROR(tp, errcode, dstname) \
  (tp)->tp_master->mr_tpac->tpac_error((tp)->tp_master->mr_stack, (tp), \
				       (errcode), (dstname))

#define STACK_ADDRESS(tp)		       \
  (tp)->tp_master->mr_tpac->tpac_address((tp)->tp_master->mr_stack, (tp))

#define TP_STACK   tp_master->mr_stack

/* Define macros for rbtree implementation */
#define TP_LEFT(tp) ((tp)->tp_left)
#define TP_RIGHT(tp) ((tp)->tp_right)
#define TP_PARENT(tp) ((tp)->tp_dad)
#define TP_SET_RED(tp) ((tp)->tp_black = 0)
#define TP_SET_BLACK(tp) ((tp)->tp_black = 1)
#define TP_IS_RED(tp) ((tp) && (tp)->tp_black == 0)
#define TP_IS_BLACK(tp) (!(tp) || (tp)->tp_black == 1)
#define TP_COPY_COLOR(dst, src) ((dst)->tp_black = (src)->tp_black)
#define TP_INSERT(tp) ((void)0)
#define TP_REMOVE(tp) ((tp)->tp_left = (tp)->tp_right = (tp)->tp_dad = NULL)

su_inline int tp_cmp(tport_t const *a, tport_t const *b)
{
  if (a == b)
    return 0;

  if (a->tp_addrlen != b->tp_addrlen)
    return (int)(a->tp_addrlen - b->tp_addrlen);

  return memcmp(a->tp_addr, b->tp_addr, a->tp_addrlen);
}

#ifdef __clang__
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wunused-function"
#endif

RBTREE_PROTOS(su_inline, tprb, tport_t);

RBTREE_BODIES(su_inline, tprb, tport_t,
	      TP_LEFT, TP_RIGHT, TP_PARENT,
	      TP_IS_RED, TP_SET_RED, TP_IS_BLACK, TP_SET_BLACK, TP_COPY_COLOR,
	      tp_cmp, TP_INSERT, TP_REMOVE);

#ifdef __clang__
#pragma clang diagnostic pop
#endif

static void tplist_insert(tport_t **list, tport_t *tp)
{
  if (*list == NULL)
    *list = tp;
  else
    tp->tp_right = *list, (*list)->tp_left = tp, *list = tp;

  for (tp = *list; tp; tp = tp->tp_right) {
    assert(tp->tp_left == NULL || tp == tp->tp_left->tp_right);
    assert(tp->tp_right == NULL || tp == tp->tp_right->tp_left);
  }
}

static void tplist_remove(tport_t **list, tport_t *tp)
{
  if (*list == tp) {
    *list = tp->tp_right; assert(tp->tp_left == NULL);
  }
  else if (tp->tp_left) {
    tp->tp_left->tp_right = tp->tp_right;
  }
  if (tp->tp_right) {
    tp->tp_right->tp_left = tp->tp_left;
  }
  TP_REMOVE(tp);
}

enum {
  /** Default per-thread read queue length */
  THRP_PENDING = 8
};

struct tport_pending_s {
  /* tport_pending_t       *p_left, *p_right, *p_parent; */
  void               *p_client;
  tport_pending_error_f *p_callback;
  msg_t              *p_msg;
  unsigned short      p_reported;
  unsigned short      p_on_success;
};

/** Return true if transport is master. */
int tport_is_master(tport_t const *self)
{
  return
    self &&
    self->tp_master->mr_master == self;
}

/** Return true if transport is primary. */
int tport_is_primary(tport_t const *self)
{
  return
    self &&
    self->tp_pri->pri_primary == self;
}

/** Return true if transport is secondary. */
int tport_is_secondary(tport_t const *self)
{
  return
    self &&
    self->tp_master->mr_master != self &&
    self->tp_pri->pri_primary != self;
}

/** Test if transport has been registered to su_root_t */
int tport_is_registered(tport_t const *self)
{
  return self && self->tp_index != 0;
}

/** Test if transport is stream. */
int tport_is_stream(tport_t const *self)
{
	return self && !self->tp_pre_framed && self->tp_addrinfo->ai_socktype == SOCK_STREAM;
}

/** Test if transport is dgram. */
int tport_is_dgram(tport_t const *self)
{
  return self && self->tp_addrinfo->ai_socktype == SOCK_DGRAM;
}

/** Test if transport is udp. */
int tport_is_udp(tport_t const *self)
{
  return self && self->tp_addrinfo->ai_protocol == IPPROTO_UDP;
}

/** Test if transport is tcp. */
int tport_is_tcp(tport_t const *self)
{
  return self && self->tp_addrinfo->ai_protocol == IPPROTO_TCP;
}

/** Return 1 if transport is reliable, 0 otherwise.
 *
 * (Note that this is part of external API).
 */
int tport_is_reliable(tport_t const *self)
{
  return self != NULL &&
    (self->tp_addrinfo->ai_socktype == SOCK_STREAM ||
     self->tp_addrinfo->ai_socktype == SOCK_SEQPACKET);
}

/** Return 0 if self is local, nonzero otherwise.
 *
 * The return valu is the tport_via enum.
 *
 * @sa TPTAG_PUBLIC(), enum tport_via.
 */
int tport_is_public(tport_t const *self)
{
  return self && self->tp_pri->pri_public;
}

/** Return true if transport supports IPv4 */
int tport_has_ip4(tport_t const *self)
{
  return self &&
    (self->tp_addrinfo->ai_family == 0 ||
     self->tp_addrinfo->ai_family == AF_INET);
}


#if SU_HAVE_IN6
/** Return true if transport supports IPv6 */
int tport_has_ip6(tport_t const *self)
{
  return self &&
    (self->tp_addrinfo->ai_family == 0 ||
     self->tp_addrinfo->ai_family == AF_INET6);
}
#endif

/** Return true if transport supports TLS. */
int tport_has_tls(tport_t const *self)
{
  return self && self->tp_pri->pri_has_tls;
}

/** Return true if transport certificate verified successfully */
int tport_is_verified(tport_t const *self)
{
  return tport_has_tls(self) && self->tp_is_connected && self->tp_verified;
}

/** Return true if transport is being updated. */
int tport_is_updating(tport_t const *self)
{
  tport_primary_t *pri;

  if (tport_is_master(self)) {
    for (pri = self->tp_master->mr_primaries; pri; pri = pri->pri_next)
      if (pri->pri_updating)
	return 1;
  }
  else if (tport_is_primary(self)) {
    return self->tp_pri->pri_updating;
  }

  return 0;
}

/** Test if transport has been closed.
 *
 * @since New in @VERSION_1_12_4
 */
inline int tport_is_closed(tport_t const *self)
{
  return self->tp_closed;
}

/** Test if transport has been shut down.
 *
 * @since New in @VERSION_1_12_4
 */
inline int tport_is_shutdown(tport_t const *self)
{
  return self->tp_closed || self->tp_send_close || self->tp_recv_close;
}

/** Test if transport connection has been established. @NEW_1_12_5. */
int tport_is_connected(tport_t const *self)
{
  return self->tp_is_connected;
}

/** Test if transport can be used to send message. @NEW_1_12_7. */
int tport_is_clear_to_send(tport_t const *self)
{
  return
    tport_is_master(self) ||
    tport_is_primary(self) ||
    (tport_is_secondary(self) &&
     tport_is_registered(self) &&
     self->tp_reusable &&
     !self->tp_closed &&
     !self->tp_send_close);
}

/** Return true if transport has message in send queue. @NEW_1_12_7. */
int tport_has_queued(tport_t const *self)
{
  return self && self->tp_queue && self->tp_queue[self->tp_qhead];
}

/** MTU for transport  */
su_inline unsigned tport_mtu(tport_t const *self)
{
  return self->tp_params->tpp_mtu;
}

/** Set IP TOS for socket */
void tport_set_tos(su_socket_t socket, su_addrinfo_t *ai, int tos)
{
  if (tos >= 0 &&
      ai->ai_family == AF_INET &&
      setsockopt(socket, IPPROTO_IP, IP_TOS, (const void*)&tos, sizeof(tos)) < 0) {
    SU_DEBUG_3(("tport: setsockopt(IP_TOS): %s\n",
		su_strerror(su_errno())));
  }
}

static
tport_t *tport_connect(tport_primary_t *pri, su_addrinfo_t *ai,
		       tp_name_t const *tpn);

static int bind6only_check(tport_master_t *mr);

static
int tport_server_addrinfo(tport_master_t *mr,
			  char const *canon,
			  int family,
			  char const *host,
			  char const *service,
			  char const *protocol,
			  char const * const transports[],
			  su_addrinfo_t **res);

static int tport_get_local_addrinfo(tport_master_t *mr,
				    char const *port,
				    su_addrinfo_t const *hints,
				    su_addrinfo_t **return_ai);

int tport_getaddrinfo(char const *node, char const *service,
		      su_addrinfo_t const *hints,
		      su_addrinfo_t **res);

static void tport_freeaddrinfo(su_addrinfo_t *ai);

static
int tport_addrinfo_copy(su_addrinfo_t *dst, void *addr, socklen_t addrlen,
			su_addrinfo_t const *src);

static int
  tport_bind_client(tport_master_t *self, tp_name_t const *tpn,
		    char const * const transports[], enum tport_via public,
		    tagi_t *tags),
  tport_bind_server(tport_master_t *, tp_name_t const *tpn,
		    char const * const transports[],  enum tport_via public,
		    tagi_t *tags),

  tport_wakeup_pri(su_root_magic_t *m, su_wait_t *w, tport_t *self),
  tport_base_wakeup(tport_t *self, int events),
  tport_connected(su_root_magic_t *m, su_wait_t *w, tport_t *self),
  tport_resolve(tport_t *self, msg_t *msg, tp_name_t const *tpn),
  tport_send_error(tport_t *, msg_t *, tp_name_t const *, char const *who),
  tport_send_fatal(tport_t *, msg_t *, tp_name_t const *, char const *who),
  tport_queue(tport_t *self, msg_t *msg),
  tport_queue_rest(tport_t *self, msg_t *msg, msg_iovec_t iov[], size_t iovused),
  tport_pending_error(tport_t *self, su_sockaddr_t const *dst, int error),
  tport_pending_errmsg(tport_t *self, msg_t *msg, int error);

static ssize_t tport_vsend(tport_t *self, msg_t *msg, tp_name_t const *tpn,
			   msg_iovec_t iov[], size_t iovused,
			   struct sigcomp_compartment *cc);

tport_t *tport_by_addrinfo(tport_primary_t const *pri,
			   su_addrinfo_t const *ai,
			   tp_name_t const *tpn);

void tport_peer_address(tport_t *self, msg_t *msg);

static void tport_parse(tport_t *self, int complete, su_time_t now);

static tport_primary_t *tport_alloc_primary(tport_master_t *mr,
					    tport_vtable_t const *vtable,
					    tp_name_t tpn[1],
					    su_addrinfo_t *ai,
					    tagi_t const *tags,
					    char const **return_culprit);

static tport_primary_t *tport_listen(tport_master_t *mr,
				     tport_vtable_t const *vtable,
				     tp_name_t tpn[1],
				     su_addrinfo_t *ai,
				     tagi_t *tags);
static void tport_zap_primary(tport_primary_t *);

static char *localipname(int pf, char *buf, size_t bufsiz);
static int getprotohints(su_addrinfo_t *hints,
			 char const *proto, int flags);


/* Stack class used when transports are being destroyed */
static
void tport_destroy_recv(tp_stack_t *stack, tport_t *tp,
			msg_t *msg, tp_magic_t *magic,
			su_time_t received)
{
  msg_destroy(msg);
}

static
void tport_destroy_error(tp_stack_t *stack, tport_t *tp,
			 int errcode, char const *remote)
{
}

static
msg_t *tport_destroy_alloc(tp_stack_t *stack, int flags,
			   char const data[], usize_t len,
			   tport_t const *tp,
			   tp_client_t *tpc)
{
  return NULL;
}

/** Name for "any" transport. @internal */
static char const tpn_any[] = "*";

/** Create the master transport.
 *
 * Master transport object is used to bind the protocol using transport with
 * actual transport objects corresponding to TCP, UDP, etc.
 *
 * @sa tport_tbind()
 *
 * @TAGS
 * TPTAG_LOG(), TPTAG_DUMP(), tags used with tport_set_params(), especially
 * TPTAG_QUEUESIZE().
 */
tport_t *tport_tcreate(tp_stack_t *stack,
		       tp_stack_class_t const *tpac,
		       su_root_t *root,
		       tag_type_t tag, tag_value_t value, ...)
{
  tport_master_t *mr;
  tp_name_t *tpn;
  tport_params_t *tpp;
  ta_list ta;

  if (!stack || !tpac || !root) {
    su_seterrno(EINVAL);
    return NULL;
  }

  mr = su_home_clone(NULL, sizeof *mr);
  if (!mr)
    return NULL;

  SU_DEBUG_7(("%s(): %p\n", "tport_create", (void *)mr));

  mr->mr_stack = stack;
  mr->mr_tpac = tpac;
  mr->mr_root = root;

  mr->mr_master->tp_master = mr;
  mr->mr_master->tp_params = tpp = mr->mr_params;

  mr->mr_master->tp_reusable = 1;
  tpp->tpp_mtu = UINT_MAX;
  tpp->tpp_thrprqsize = THRP_PENDING;
  tpp->tpp_qsize = TPORT_QUEUESIZE;
  tpp->tpp_sdwn_error = 1;
  tpp->tpp_idle = UINT_MAX;
  tpp->tpp_timeout = UINT_MAX;
  tpp->tpp_sigcomp_lifetime = UINT_MAX;
  tpp->tpp_socket_keepalive = 30;
  tpp->tpp_keepalive = 0;
  tpp->tpp_pingpong = 0;
  tpp->tpp_pong2ping = 0;
  tpp->tpp_stun_server = 1;
  tpp->tpp_tos = -1;                  /* set invalid, valid values are 0-255 */

  tpn = mr->mr_master->tp_name;
  tpn->tpn_proto = "*";
  tpn->tpn_host = "*";
  tpn->tpn_canon = "*";
  tpn->tpn_port = "*";

  ta_start(ta, tag, value);

  tport_set_params(mr->mr_master, ta_tags(ta));

#if HAVE_SOFIA_STUN
  tport_init_stun_server(mr, ta_args(ta));
#endif

  ta_end(ta);

  return mr->mr_master;
}

/** Destroy the master transport. */
void tport_destroy(tport_t *self)
{
  tport_master_t *mr;

  static tp_stack_class_t tport_destroy_tpac[1] =
    {{
	sizeof tport_destroy_tpac,
	/* tpac_recv */ tport_destroy_recv,
	/* tpac_error */ tport_destroy_error,
	/* tpac_alloc */ tport_destroy_alloc,
	/* tpac_address */ NULL
      }};

  SU_DEBUG_7(("%s(%p)\n", __func__, (void *)self));

  if (self == NULL)
    return;

  assert(tport_is_master(self));
  if (!tport_is_master(self))
    return;

  mr = (tport_master_t *)self;
  mr->mr_tpac = tport_destroy_tpac;

  while (mr->mr_primaries)
    tport_zap_primary(mr->mr_primaries);

#if HAVE_SOFIA_STUN
  tport_deinit_stun_server(mr);
#endif

  if (mr->mr_dump_file)
    fclose(mr->mr_dump_file), mr->mr_dump_file = NULL;

  if (mr->mr_timer)
    su_timer_destroy(mr->mr_timer), mr->mr_timer = NULL;

  su_home_zap(mr->mr_home);
}


/** Allocate a primary transport */
static
tport_primary_t *tport_alloc_primary(tport_master_t *mr,
				     tport_vtable_t const *vtable,
				     tp_name_t tpn[1],
				     su_addrinfo_t *ai,
				     tagi_t const *tags,
				     char const **return_culprit)
{
  tport_primary_t *pri, **next;
  tport_t *tp;
  int save_errno;

  for (next = &mr->mr_primaries; *next; next = &(*next)->pri_next)
    ;

  assert(vtable->vtp_pri_size >= sizeof *pri);

  if ((pri = su_home_clone(mr->mr_home, vtable->vtp_pri_size))) {
    tport_t *tp = pri->pri_primary;
    pri->pri_vtable = vtable;
    pri->pri_public = vtable->vtp_public;

    tp->tp_master = mr;
    tp->tp_pri = pri;
    tp->tp_socket = INVALID_SOCKET;

    tp->tp_magic = mr->mr_master->tp_magic;

    tp->tp_params = pri->pri_params;
    memcpy(tp->tp_params, mr->mr_params, sizeof (*tp->tp_params));
    tp->tp_reusable = mr->mr_master->tp_reusable;

    if (!pri->pri_public)
      tp->tp_addrinfo->ai_addr = &tp->tp_addr->su_sa;

    SU_DEBUG_5(("%s(%p): new primary tport %p\n", __func__, (void *)mr,
		(void *)pri));
  }

  *next = pri;
  tp = pri->pri_primary;

  if (!tp)
    *return_culprit = "alloc";
  else if (tport_set_params(tp, TAG_NEXT(tags)) < 0)
    *return_culprit = "tport_set_params";
  else if (vtable->vtp_init_primary &&
	   vtable->vtp_init_primary(pri, tpn, ai, tags, return_culprit) < 0)
    ;
  else if (tport_setname(tp, vtable->vtp_name, ai, tpn->tpn_canon) == -1)
    *return_culprit = "tport_setname";
  else if (tpn->tpn_ident &&
	   !(tp->tp_name->tpn_ident = su_strdup(tp->tp_home, tpn->tpn_ident)))
    *return_culprit = "alloc ident";
  else
    return pri;			/* Success */

  save_errno = su_errno();
  tport_zap_primary(pri);
  su_seterrno(save_errno);

  return NULL;
}


/** Destroy a primary transport and its secondary transports. @internal */
static
void tport_zap_primary(tport_primary_t *pri)
{
  tport_primary_t **prip;

  if (pri == NULL)
    return;

  assert(tport_is_primary(pri->pri_primary));

  if (pri->pri_vtable->vtp_deinit_primary)
    pri->pri_vtable->vtp_deinit_primary(pri);

  while (pri->pri_open)
    tport_zap_secondary(pri->pri_open);
  while (pri->pri_closed)
    tport_zap_secondary(pri->pri_closed);

  /* We have just a single-linked list for primary transports */
  for (prip = &pri->pri_master->mr_primaries;
       *prip != pri;
       prip = &(*prip)->pri_next)
    assert(*prip);

  *prip = pri->pri_next;

  tport_zap_secondary((tport_t *)pri);
}

/**Create a primary transport object with socket.
 *
 * Creates a primary transport object with a server socket, and then
 * registers the socket with suitable events to the root.
 *
 * @param dad   parent (master or primary) transport object
 * @param ai    pointer to addrinfo structure
 * @param canon canonical name of node
 * @param protoname name of the protocol
 */
static
tport_primary_t *tport_listen(tport_master_t *mr,
			      tport_vtable_t const *vtable,
			      tp_name_t tpn[1],
			      su_addrinfo_t *ai,
			      tagi_t *tags)
{
  tport_primary_t *pri = NULL;

  int err;
  int errlevel = 3;
  char buf[TPORT_HOSTPORTSIZE];

  char const *protoname = vtable->vtp_name;
  char const *culprit = "unknown";

  su_sockaddr_t *su = (void *)ai->ai_addr;

  /* Log an error, return error */
#define TPORT_LISTEN_ERROR(errno, what)				     \
  ((void)(err = errno,						     \
	  ((err == EADDRINUSE || err == EAFNOSUPPORT ||		     \
	    err == ESOCKTNOSUPPORT || err == EPROTONOSUPPORT ||	     \
	    err == ENOPROTOOPT ? 7 : 3) < SU_LOG_LEVEL ?	     \
	     su_llog(tport_log, errlevel,			     \
		     "%s(%p): %s(pf=%d %s/%s): %s\n",		     \
		     __func__, pri ? (void *)pri : (void *)mr, what, \
		     ai->ai_family, protoname,			     \
		     tport_hostport(buf, sizeof(buf), su, 2),	     \
		     su_strerror(err)) : (void)0),		     \
	    tport_zap_primary(pri),		                     \
	    su_seterrno(err)),					     \
     (void *)NULL)

  /* Create a primary transport object for another transport. */
  pri = tport_alloc_primary(mr, vtable, tpn, ai, tags, &culprit);
  if (pri == NULL)
    return TPORT_LISTEN_ERROR(su_errno(), culprit);

  if (pri->pri_primary->tp_socket != INVALID_SOCKET) {
    int index = 0;
    tport_t *tp = pri->pri_primary;
    su_wait_t wait[1] = { SU_WAIT_INIT };

    if (su_wait_create(wait, tp->tp_socket, tp->tp_events) == -1)
      return TPORT_LISTEN_ERROR(su_errno(), "su_wait_create");

    /* Register receiving or accepting function with events specified above */
    index = su_root_register(mr->mr_root, wait, tport_wakeup_pri, tp, 0);
    if (index == -1) {
      su_wait_destroy(wait);
      return TPORT_LISTEN_ERROR(su_errno(), "su_root_register");
    }

    tp->tp_index = index;
  }

  pri->pri_primary->tp_has_connection = 0;

  SU_DEBUG_5(("%s(%p): %s " TPN_FORMAT "\n",
	      __func__, (void *)pri, "listening at",
	      TPN_ARGS(pri->pri_primary->tp_name)));

  return pri;
}

int tport_bind_socket(int socket,
		      su_addrinfo_t *ai,
		      char const **return_culprit)
{
  su_sockaddr_t *su = (su_sockaddr_t *)ai->ai_addr;
  socklen_t sulen = (socklen_t)(ai->ai_addrlen);

  if (bind(socket, ai->ai_addr, sulen) == -1) {
    return *return_culprit = "bind", -1;
  }

  if (getsockname(socket, &su->su_sa, &sulen) == SOCKET_ERROR) {
    return *return_culprit = "getsockname", -1;
  }

  ai->ai_addrlen = sulen;

#if defined (__linux__) && defined (SU_HAVE_IN6)
  if (ai->ai_family == AF_INET6) {
    if (!SU_SOCKADDR_INADDR_ANY(su) &&
	(IN6_IS_ADDR_V4MAPPED(&su->su_sin6.sin6_addr) ||
	 IN6_IS_ADDR_V4COMPAT(&su->su_sin6.sin6_addr))) {
      su_sockaddr_t su0[1];

      memcpy(su0, su, sizeof su0);

      memset(su, 0, ai->ai_addrlen = sizeof su->su_sin);
      su->su_family = ai->ai_family = AF_INET;
      su->su_port = su0->su_port;

#ifndef IN6_V4MAPPED_TO_INADDR
#define IN6_V4MAPPED_TO_INADDR(in6, in4) \
      memcpy((in4), 12 + (uint8_t *)(in6), sizeof(struct in_addr))
#endif
      IN6_V4MAPPED_TO_INADDR(&su0->su_sin6.sin6_addr, &su->su_sin.sin_addr);
    }
  }
#endif

  return 0;
}


/** Indicate stack that a transport has been updated */
void tport_has_been_updated(tport_t *self)
{
  self->tp_pri->pri_updating = 0;

  if (self->tp_master->mr_tpac->tpac_address)
    self->tp_master->mr_tpac->tpac_address(self->tp_master->mr_stack, self);
}


static
int tport_set_events(tport_t *self, int set, int clear)
{
  int events;

  if (self == NULL)
    return -1;

  events = (self->tp_events | set) & ~clear;
  self->tp_events = events;

  if (self->tp_pri->pri_vtable->vtp_set_events)
    return self->tp_pri->pri_vtable->vtp_set_events(self);

  SU_DEBUG_7(("tport_set_events(%p): events%s%s%s\n", (void *)self,
	      (events & SU_WAIT_IN) ? " IN" : "",
	      (events & SU_WAIT_OUT) ? " OUT" : "",
	      SU_WAIT_CONNECT != SU_WAIT_OUT &&
	      (events & SU_WAIT_CONNECT) ? " CONNECT" : ""));

  return
    su_root_eventmask(self->tp_master->mr_root,
		      self->tp_index,
		      self->tp_socket,
		      self->tp_events = events);
}

/**Allocate a secondary transport. @internal
 *
 * Create a secondary transport object. The new transport initally shares
 * parameters structure with the original transport.
 *
 * @param pri    primary transport
 * @param socket socket for transport
 * @parma accepted true if the socket was accepted from server socket
 *
 * @return
 * Pointer to the newly created transport, or NULL upon an error.
 *
 * @note The socket is always closed upon error.
 */
tport_t *tport_alloc_secondary(tport_primary_t *pri,
			       int socket,
			       int accepted,
			       char const **return_reason)
{
  tport_master_t *mr = pri->pri_master;
  tport_t *self;

  self = su_home_clone(mr->mr_home, pri->pri_vtable->vtp_secondary_size);

  if (self) {
    SU_DEBUG_7(("%s(%p): new secondary tport %p\n",
		__func__, (void *)pri, (void *)self));

    self->tp_refs = -1;			/* Freshly allocated  */
    self->tp_master = mr;
    self->tp_pri = pri;
    self->tp_params = pri->pri_params;
    self->tp_accepted = accepted != 0;
    self->tp_reusable = pri->pri_primary->tp_reusable;

    self->tp_magic = pri->pri_primary->tp_magic;

    self->tp_addrinfo->ai_addr = (void *)self->tp_addr;

    self->tp_socket = socket;

    self->tp_timer = su_timer_create(su_root_task(mr->mr_root), 0);
    self->tp_stime = self->tp_ktime = self->tp_rtime = su_now();

    if (pri->pri_vtable->vtp_init_secondary &&

		pri->pri_vtable->vtp_init_secondary(self, socket, accepted, return_reason) < 0) {

		if (pri->pri_vtable->vtp_deinit_secondary) {
			pri->pri_vtable->vtp_deinit_secondary(self);
		}
		su_timer_destroy(self->tp_timer);
		su_home_zap(self->tp_home);

		return NULL;
    }

    /* Set IP TOS if it is set in primary */
    tport_set_tos(socket,
		  pri->pri_primary->tp_addrinfo,
		  pri->pri_params->tpp_tos);
  }
  else {
    *return_reason = "malloc";
  }

  return self;
}


/** Create a connected transport object with socket.
 *
 * The function tport_connect() creates a secondary transport with a
 * connected socket. It registers the socket with suitable events to the
 * root.
 *
 * @param pri   primary transport object
 * @param ai    pointer to addrinfo structure
 * @param tpn   canonical name of node
 */
static
tport_t *tport_connect(tport_primary_t *pri,
		       su_addrinfo_t *ai,
		       tp_name_t const *tpn)
{
  tport_t *tp;

  if (ai == NULL || ai->ai_addrlen > sizeof (pri->pri_primary->tp_addr))
    return NULL;

  if (pri->pri_vtable->vtp_connect)
    return pri->pri_vtable->vtp_connect(pri, ai, tpn);

  tp = tport_base_connect(pri, ai, ai, tpn);
  if (tp)
    tport_set_secondary_timer(tp);
  return tp;
}

/**Create a connected transport object with socket.
 *
 * The function tport_connect() creates a secondary transport with a
 * connected socket. It registers the socket with suitable events to the
 * root.
 *
 * @param pri   primary transport object
 * @param ai    pointer to addrinfo structure describing socket
 * @param real_ai  pointer to addrinfo structure describing real target
 * @param tpn   canonical name of node
 */
tport_t *tport_base_connect(tport_primary_t *pri,
			    su_addrinfo_t *ai,
			    su_addrinfo_t *real_ai,
			    tp_name_t const *tpn)
{
  tport_t *self = NULL;

  su_socket_t s, server_socket;
  su_wakeup_f wakeup = tport_wakeup;
  int events = SU_WAIT_IN | SU_WAIT_ERR;

  int err;
  unsigned errlevel = 3;
  char buf[TPORT_HOSTPORTSIZE];
  char const *what;

  /* Log an error, return error */
#define TPORT_CONNECT_ERROR(errno, what)			     \
  return							     \
    ((void)(err = errno,					     \
	    (SU_LOG_LEVEL >= errlevel ?				     \
	     su_llog(tport_log, errlevel,			     \
		     "%s(%p): %s(pf=%d %s/%s): %s\n",			\
				 __func__, (void *)pri, #what, ai->ai_family,	\
		     tpn->tpn_proto,				     \
		     tport_hostport(buf, sizeof(buf),		     \
				    (void *)ai->ai_addr, 2),	     \
		     su_strerror(err)) : (void)0),		     \
	    tport_zap_secondary(self),				     \
	    su_seterrno(err)),					     \
     (void *)NULL)

  s = su_socket(ai->ai_family, ai->ai_socktype, ai->ai_protocol);
  if (s == INVALID_SOCKET)
    TPORT_CONNECT_ERROR(su_errno(), "socket");

  what = "tport_alloc_secondary";
  if ((self = tport_alloc_secondary(pri, s, 0, &what)) == NULL)
    TPORT_CONNECT_ERROR(su_errno(), what);

  self->tp_conn_orient = 1;

  if ((server_socket = pri->pri_primary->tp_socket) != INVALID_SOCKET) {
    su_sockaddr_t susa;
    socklen_t susalen = sizeof(susa);

    /* Bind this socket to same IP address as the primary server socket */
    if (getsockname(server_socket, &susa.su_sa, &susalen) < 0) {
      SU_DEBUG_3(("%s(%p): getsockname(): %s\n",
		  __func__, (void *)self, su_strerror(su_errno())));
    }
    else {
      susa.su_port = 0;
      if (bind(s, &susa.su_sa, susalen) < 0) {
	SU_DEBUG_3(("%s(%p): bind(local-ip): %s\n",
		    __func__, (void *)self, su_strerror(su_errno())));
      }
    }
  }

  /* Set sockname for the tport */
  if (tport_setname(self, tpn->tpn_proto, real_ai, tpn->tpn_canon) == -1)
    TPORT_CONNECT_ERROR(su_errno(), tport_setname);

  /* Try to have a non-blocking connect().
   * The tport_register_secondary() below makes the socket non-blocking anyway. */
  su_setblocking(s, 0);

  if (connect(s, ai->ai_addr, (socklen_t)(ai->ai_addrlen)) == SOCKET_ERROR) {
    err = su_errno();
    if (!su_is_blocking(err))
      TPORT_CONNECT_ERROR(err, connect);
    events = SU_WAIT_CONNECT | SU_WAIT_ERR;
    wakeup = tport_connected;
    what = "connecting";
  }
  else {
    what = "connected";
    self->tp_is_connected = 1;
  }

  if (tport_register_secondary(self, wakeup, events) == -1)
    TPORT_CONNECT_ERROR(su_errno(), tport_register_secondary);

  if (ai == real_ai) {
    SU_DEBUG_5(("%s(%p): %s to " TPN_FORMAT "\n",
		__func__, (void *)self, what, TPN_ARGS(self->tp_name)));
  }
  else {
    SU_DEBUG_5(("%s(%p): %s via %s to " TPN_FORMAT "\n",
		__func__, (void *)self, what,
		tport_hostport(buf, sizeof(buf), (void *)ai->ai_addr, 2),
		TPN_ARGS(self->tp_name)));
  }

  return self;
}

/** Register a new secondary transport. @internal */
int tport_register_secondary(tport_t *self, su_wakeup_f wakeup, int events)
{
  int i;
  su_root_t *root = tport_is_secondary(self) ? self->tp_master->mr_root : NULL;
  su_wait_t wait[1] = { SU_WAIT_INIT };

  if (root != NULL
      /* Create wait object with appropriate events. */
      &&
      su_wait_create(wait, self->tp_socket, events) != -1
      /* Register socket to root */
      &&
      (i = su_root_register(root, wait, wakeup, self, 0)) != -1) {

    /* Can't be added to list of opened if already closed */
    if (tport_is_closed(self)) goto fail;

    self->tp_index = i;
    self->tp_events = events;

    tprb_append(&self->tp_pri->pri_open, self);

    return 0;
  }

fail:
  SU_DEBUG_9(("%s(%p): tport is %s!\n", __func__, (void *)self, (tport_is_closed(self) ? "closed" : "opened")));
  su_wait_destroy(wait);
  return -1;
}

/** Destroy a secondary transport. @internal */
void tport_zap_secondary(tport_t *self)
{
  tport_master_t *mr;

  if (self == NULL)
    return;

  /* Remove from rbtree */
  if (!tport_is_closed(self))
    tprb_remove(&self->tp_pri->pri_open, self);
  else
    tplist_remove(&self->tp_pri->pri_closed, self);

  if (self->tp_timer)
    su_timer_destroy(self->tp_timer), self->tp_timer = NULL;

  /* Do not deinit primary as secondary! */
  if (tport_is_secondary(self) &&
      self->tp_pri->pri_vtable->vtp_deinit_secondary)
    self->tp_pri->pri_vtable->vtp_deinit_secondary(self);

  if (self->tp_msg) {
    msg_destroy(self->tp_msg), self->tp_msg = NULL;
    SU_DEBUG_3(("%s(%p): zapped partially received message\n",
		__func__, (void *)self));
  }

  if (tport_has_queued(self)) {
    size_t n = 0, i, N = self->tp_params->tpp_qsize;
    for (i = self->tp_qhead; self->tp_queue[i]; i = (i + 1) % N) {
      msg_destroy(self->tp_queue[i]), self->tp_queue[i] = NULL;
      n++;
    }
    SU_DEBUG_3(("%s(%p): zapped %lu queued messages\n",
		__func__, (void *)self, (LU)n));
  }

  if (self->tp_pused) {
    SU_DEBUG_3(("%s(%p): zapped while pending\n",
		__func__, (void *)self));
  }

  mr = self->tp_master;

#if HAVE_SOFIA_STUN
  tport_stun_server_remove_socket(self);
#endif

  if (self->tp_index)
    su_root_deregister(mr->mr_root, self->tp_index);
  self->tp_index = 0;
  if (self->tp_socket != INVALID_SOCKET)
    su_close(self->tp_socket);
  self->tp_socket = INVALID_SOCKET;

  su_home_zap(self->tp_home);
}

/** Create a new reference to a transport object. */
tport_t *tport_ref(tport_t *tp)
{
  if (tp) {
    if (tp->tp_refs >= 0)
      tp->tp_refs++;
    else if (tp->tp_refs == -1)
      tp->tp_refs = 1;
  }
  return tp;
}

/** Destroy reference to a transport object. */
void tport_unref(tport_t *tp)
{
  if (tp == NULL || tp->tp_refs <= 0)
    return;
  if (--tp->tp_refs > 0)
    return;

  if (!tport_is_secondary(tp))
    return;

  if (tp->tp_params->tpp_idle == 0)
    tport_close(tp);

  tport_set_secondary_timer(tp);
}

/** Create a new reference to transport object. */
tport_t *tport_incref(tport_t *tp)
{
  return tport_ref(tp);
}

/** Destroy a transport reference. */
void tport_decref(tport_t **ttp)
{
  assert(ttp);

  if (*ttp) {
    tport_unref(*ttp);
    *ttp = NULL;
  }
}

/** Get transport parameters.
 *
 * @param self          pointer to a transport object
 * @param tag,value,... list of tags
 *
 * @TAGS
 * TPTAG_MTU_REF(), TPTAG_QUEUESIZE_REF(), TPTAG_IDLE_REF(),
 * TPTAG_TIMEOUT_REF(), TPTAG_KEEPALIVE_REF(), TPTAG_PINGPONG_REF(),
 * TPTAG_PONG2PING_REF(), TPTAG_DEBUG_DROP_REF(), TPTAG_THRPSIZE_REF(),
 * TPTAG_THRPRQSIZE_REF(), TPTAG_SIGCOMP_LIFETIME_REF(),
 * TPTAG_CONNECT_REF(), TPTAG_SDWN_ERROR_REF(), TPTAG_REUSE_REF(),
 * TPTAG_STUN_SERVER_REF(), TPTAG_PUBLIC_REF() and TPTAG_TOS_REF().
 */
int tport_get_params(tport_t const *self,
		     tag_type_t tag, tag_value_t value, ...)
{
  ta_list ta;
  int n;
  tport_params_t const *tpp;
  int connect;
  tport_master_t *mr = self->tp_master;

  if (self == NULL)
    return su_seterrno(EINVAL);

  tpp = self->tp_params;
  ta_start(ta, tag, value);

  connect = tpp->tpp_conn_orient
    /* Only dgram primary is *not* connection-oriented */
    || !tport_is_primary(self) || !tport_is_dgram(self);

  n = tl_tgets(ta_args(ta),
	       TPTAG_MTU((usize_t)tpp->tpp_mtu),
	       TPTAG_REUSE(self->tp_reusable),
	       TPTAG_CONNECT(connect),
	       TPTAG_QUEUESIZE(tpp->tpp_qsize),
	       TPTAG_IDLE(tpp->tpp_idle),
	       TPTAG_TIMEOUT(tpp->tpp_timeout),
	       TPTAG_SOCKET_KEEPALIVE(tpp->tpp_socket_keepalive),
	       TPTAG_KEEPALIVE(tpp->tpp_keepalive),
	       TPTAG_PINGPONG(tpp->tpp_pingpong),
	       TPTAG_PONG2PING(tpp->tpp_pong2ping),
	       TPTAG_SDWN_ERROR(tpp->tpp_sdwn_error),
	       TPTAG_DEBUG_DROP(tpp->tpp_drop),
	       TPTAG_THRPSIZE(tpp->tpp_thrpsize),
	       TPTAG_THRPRQSIZE(tpp->tpp_thrprqsize),
	       TPTAG_SIGCOMP_LIFETIME(tpp->tpp_sigcomp_lifetime),
	       TPTAG_STUN_SERVER(tpp->tpp_stun_server),
	       TAG_IF(self->tp_pri,
		      TPTAG_PUBLIC(self->tp_pri ?
				   self->tp_pri->pri_public : 0)),
	       TPTAG_TOS(tpp->tpp_tos),
	       TAG_IF((void *)self == (void *)mr,
		      TPTAG_LOG(mr->mr_log != 0)),
	       TAG_IF((void *)self == (void *)mr,
		      TPTAG_DUMP(mr->mr_dump)),
	       TAG_END());

  ta_end(ta);

  return n;
}

/** Set transport parameters.
 *
 * @param self          pointer to a transport object
 * @param tag,value,... list of tags
 *
 * @TAGS
 * TPTAG_MTU(), TPTAG_QUEUESIZE(), TPTAG_IDLE(), TPTAG_TIMEOUT(),
 * TPTAG_KEEPALIVE(), TPTAG_PINGPONG(), TPTAG_PONG2PING(),
 * TPTAG_DEBUG_DROP(), TPTAG_THRPSIZE(), TPTAG_THRPRQSIZE(),
 * TPTAG_SIGCOMP_LIFETIME(), TPTAG_CONNECT(), TPTAG_SDWN_ERROR(),
 * TPTAG_REUSE(), TPTAG_STUN_SERVER(), and TPTAG_TOS().
 */
int tport_set_params(tport_t *self,
		     tag_type_t tag, tag_value_t value, ...)
{
  ta_list ta;
  int n, m = 0;
  tport_params_t tpp[1], *tpp0;

  usize_t mtu;
  int connect, sdwn_error, reusable, stun_server, pong2ping;

  if (self == NULL)
    return su_seterrno(EINVAL);

  memcpy(tpp, tpp0 = self->tp_params, sizeof tpp);

  mtu = tpp->tpp_mtu;
  connect = tpp->tpp_conn_orient;
  sdwn_error = tpp->tpp_sdwn_error;
  reusable = self->tp_reusable;
  stun_server = tpp->tpp_stun_server;
  pong2ping = tpp->tpp_pong2ping;

  ta_start(ta, tag, value);

  n = tl_gets(ta_args(ta),
	      TPTAG_MTU_REF(mtu),
	      TAG_IF(!self->tp_queue, TPTAG_QUEUESIZE_REF(tpp->tpp_qsize)),
	      TPTAG_IDLE_REF(tpp->tpp_idle),
	      TPTAG_TIMEOUT_REF(tpp->tpp_timeout),
	      TPTAG_SOCKET_KEEPALIVE_REF(tpp->tpp_socket_keepalive),
	      TPTAG_KEEPALIVE_REF(tpp->tpp_keepalive),
	      TPTAG_PINGPONG_REF(tpp->tpp_pingpong),
	      TPTAG_PONG2PING_REF(pong2ping),
	      TPTAG_DEBUG_DROP_REF(tpp->tpp_drop),
	      TPTAG_THRPSIZE_REF(tpp->tpp_thrpsize),
	      TPTAG_THRPRQSIZE_REF(tpp->tpp_thrprqsize),
	      TPTAG_SIGCOMP_LIFETIME_REF(tpp->tpp_sigcomp_lifetime),
	      TPTAG_CONNECT_REF(connect),
	      TPTAG_SDWN_ERROR_REF(sdwn_error),
	      TPTAG_REUSE_REF(reusable),
	      TPTAG_STUN_SERVER_REF(stun_server),
	      TPTAG_TOS_REF(tpp->tpp_tos),
	      TAG_END());

  if (self == (tport_t *)self->tp_master)
    m = tport_open_log(self->tp_master, ta_args(ta));

  ta_end(ta);

  if (n == 0)
    return m;

  if (tpp->tpp_idle > 0 && tpp->tpp_idle < 100)
    tpp->tpp_idle = 100;
  if (tpp->tpp_timeout < 100)
    tpp->tpp_timeout = 100;
  if (tpp->tpp_drop > 1000)
    tpp->tpp_drop = 1000;
  if (tpp->tpp_thrprqsize > 0)
    tpp->tpp_thrprqsize = tpp0->tpp_thrprqsize;
  if (tpp->tpp_sigcomp_lifetime != 0 && tpp->tpp_sigcomp_lifetime < 30)
    tpp->tpp_sigcomp_lifetime = 30;
  if (tpp->tpp_qsize >= 1000)
    tpp->tpp_qsize = 1000;

  if (mtu > UINT_MAX)
    mtu = UINT_MAX;
  tpp->tpp_mtu = (unsigned)mtu;
  /* Currently only primary UDP transport can *not* be connection oriented */
  tpp->tpp_conn_orient = connect;
  tpp->tpp_sdwn_error = sdwn_error;
  self->tp_reusable = reusable;
  tpp->tpp_stun_server = stun_server;
  tpp->tpp_pong2ping = pong2ping;

  if (memcmp(tpp0, tpp, sizeof tpp) == 0)
    return n + m;

  if (tport_is_secondary(self) &&
      self->tp_params == self->tp_pri->pri_primary->tp_params) {
    tpp0 = su_zalloc(self->tp_home, sizeof *tpp0); if (!tpp0) return -1;
    self->tp_params = tpp0;
  }

  memcpy(tpp0, tpp, sizeof tpp);

  if (tport_is_secondary(self))
    tport_set_secondary_timer(self);

  return n + m;
}

extern tport_vtable_t const tport_udp_vtable;
extern tport_vtable_t const tport_tcp_vtable;
extern tport_vtable_t const tport_tls_vtable;
extern tport_vtable_t const tport_ws_vtable;
extern tport_vtable_t const tport_wss_vtable;
extern tport_vtable_t const tport_sctp_vtable;
extern tport_vtable_t const tport_udp_client_vtable;
extern tport_vtable_t const tport_tcp_client_vtable;
extern tport_vtable_t const tport_sctp_client_vtable;
extern tport_vtable_t const tport_ws_client_vtable;
extern tport_vtable_t const tport_wss_client_vtable;
extern tport_vtable_t const tport_tls_client_vtable;
extern tport_vtable_t const tport_http_connect_vtable;
extern tport_vtable_t const tport_threadpool_vtable;

#define TPORT_NUMBER_OF_TYPES 64

tport_vtable_t const *tport_vtables[TPORT_NUMBER_OF_TYPES + 1] =
{
#if HAVE_SOFIA_NTH
  &tport_http_connect_vtable,
  &tport_ws_client_vtable,
  &tport_ws_vtable,
  &tport_wss_client_vtable,
  &tport_wss_vtable,
#endif
#if HAVE_TLS
  &tport_tls_client_vtable,
  &tport_tls_vtable,
#endif
#if HAVE_SCTP		/* SCTP is broken */
  &tport_sctp_client_vtable,
  &tport_sctp_vtable,
#endif
  &tport_tcp_client_vtable,
  &tport_tcp_vtable,
  &tport_udp_client_vtable,
  &tport_udp_vtable,
#if 0
  &tport_threadpool_vtable,
#endif
#if HAVE_SOFIA_STUN
  &tport_stun_vtable,
#endif
};

/** Register new transport vtable */
int tport_register_type(tport_vtable_t const *vtp)
{
  int i;

  for (i = TPORT_NUMBER_OF_TYPES; i >= 0; i--) {
    if (tport_vtables[i] == NULL) {
      tport_vtables[i] = vtp;
      return 0;
    }
  }

  su_seterrno(ENOMEM);
  return -1;
}

/**Get a vtable for given protocol */
tport_vtable_t const *tport_vtable_by_name(char const *protoname,
					   enum tport_via public)
{
  int i;

  for (i = TPORT_NUMBER_OF_TYPES; i >= 0; i--) {
    tport_vtable_t const *vtable = tport_vtables[i];

    if (vtable == NULL)
      continue;
    if (vtable->vtp_public != public)
      continue;
    if (!su_casematch(protoname, vtable->vtp_name))
      continue;

    assert(vtable->vtp_pri_size >= sizeof (tport_primary_t));
    assert(vtable->vtp_secondary_size >= sizeof (tport_t));

    return vtable;
  }

  return NULL;
}

#if 0
tport_set_f const *tport_set_methods[TPORT_NUMBER_OF_TYPES + 1] =
  {
    tport_server_bind_set,
    tport_client_bind_set,
    tport_threadpool_set,
#if HAVE_SOFIA_NTH
    tport_http_connect_set,
#endif
#if HAVE_TLS
    tport_tls_set,
#endif
    NULL
  };

int tport_bind_set(tport_master_t *mr,
		   tp_name_t const *tpn,
		   char const * const transports[],
		   tagi_t const *taglist,
		   tport_set_t **return_set,
		   int set_size)
{
  int i;

  for (i = TPORT_NUMBER_OF_TYPES; i >= 0; i--) {
    tport_set_f const *perhaps = tport_vtables[i];
    int result;

    if (perhaps == NULL)
      continue;

    result = perhaps(mr, tpn, transports, taglist, return_set, set_size);
    if (result != 0)
      return result;
  }

  return 0;
}
#endif

/** Bind transport objects.
 *
 * @param self        pointer to a transport object
 * @param tpn         desired transport address
 * @param transports  list of protocol names supported by stack
 * @param tag,value,... tagged argument list
 *
 * @TAGS
 * TPTAG_SERVER(), TPTAG_PUBLIC(), TPTAG_IDENT(), TPTAG_HTTP_CONNECT(),
 * TPTAG_CERTIFICATE(), TPTAG_TLS_VERSION(), TPTAG_TLS_VERIFY_POLICY, and 
 * tags used with tport_set_params(), especially TPTAG_QUEUESIZE().
 */
int tport_tbind(tport_t *self,
		tp_name_t const *tpn,
		char const * const transports[],
		tag_type_t tag, tag_value_t value, ...)
{
  ta_list ta;
  int server = 1, retval, public = 0;
  tp_name_t mytpn[1];
  tport_master_t *mr;
  char const *http_connect = NULL;

  if (self == NULL || tport_is_secondary(self) ||
      tpn == NULL || transports == NULL) {
    su_seterrno(EINVAL);
    return -1;
  }

  *mytpn = *tpn;

  if (mytpn->tpn_ident == NULL)
    mytpn->tpn_ident = self->tp_ident;

  ta_start(ta, tag, value);

  tl_gets(ta_args(ta),
	  TPTAG_SERVER_REF(server),
	  TPTAG_PUBLIC_REF(public),
	  TPTAG_IDENT_REF(mytpn->tpn_ident),
	  TPTAG_HTTP_CONNECT_REF(http_connect),
	  TAG_END());

  mr = self->tp_master; assert(mr);

  if (http_connect && public == 0)
    public = tport_type_connect;

  if (public && public != tport_type_stun)
    server = 0;

  if (server)
    retval = tport_bind_server(mr, mytpn, transports, (enum tport_via)public, ta_args(ta));
  else
    retval = tport_bind_client(mr, mytpn, transports, (enum tport_via)public, ta_args(ta));

  ta_end(ta);

  return retval;
}


/** Bind primary transport objects used by a client-only application.
 * @internal
 */
int tport_bind_client(tport_master_t *mr,
                      tp_name_t const *tpn,
                      char const * const transports[],
		      enum tport_via public,
		      tagi_t *tags)
{
  int i;
  tport_primary_t *pri = NULL, **tbf;
  tp_name_t tpn0[1] = {{ "*", "*", "*", "*", NULL, NULL }};
  char const *why = "unknown";

  tport_vtable_t const *vtable;

  if (public == tport_type_local)
    public = tport_type_client;

  SU_DEBUG_5(("%s(%p) to " TPN_FORMAT "\n",
	      __func__, (void *)mr, TPN_ARGS(tpn)));

  memset(tpn0, 0, sizeof(tpn0));

  for (tbf = &mr->mr_primaries; *tbf; tbf = &(*tbf)->pri_next)
    ;

  for (i = 0; transports[i]; i++) {
    su_addrinfo_t hints[1];
    char const *proto = transports[i];

    if (strcmp(proto, tpn->tpn_proto) != 0 &&
        strcmp(tpn->tpn_proto, tpn_any) != 0)
      continue;

    vtable = tport_vtable_by_name(proto, public);
    if (!vtable)
      continue;

    /* Resolve protocol, skip unknown transport protocols */
    if (getprotohints(hints, proto, AI_PASSIVE) < 0)
      continue;

    tpn0->tpn_proto = proto;
    tpn0->tpn_comp = tpn->tpn_comp;
    tpn0->tpn_ident = tpn->tpn_ident;

    hints->ai_canonname = "*";

    if (!(pri = tport_alloc_primary(mr, vtable, tpn0, hints, tags, &why)))
      break;

    pri->pri_public = tport_type_client; /* XXX */
  }

  if (!pri) {
    SU_DEBUG_3(("tport_alloc_primary: %s failed\n", why));
    tport_zap_primary(*tbf);
  }

  return pri ? 0 : -1;
}

/** Bind primary transport objects used by a server application. */
int tport_bind_server(tport_master_t *mr,
                      tp_name_t const *tpn,
                      char const * const transports[],
		      enum tport_via public,
		      tagi_t *tags)
{
  char hostname[TPORT_HOSTPORTSIZE];
  char const *canon = NULL, *host, *service;
  int error = 0, family = 0;
  tport_primary_t *pri = NULL, **tbf;
  su_addrinfo_t *ai, *res = NULL;
  unsigned port, port0, port1, old;
  unsigned short step = 0;

  bind6only_check(mr);

  (void)hostname;

  SU_DEBUG_5(("%s(%p) to " TPN_FORMAT "\n",
	      __func__, (void *)mr, TPN_ARGS(tpn)));

  if (tpn->tpn_host == NULL || strcmp(tpn->tpn_host, tpn_any) == 0) {
    /* Use a local IP address */
    host = NULL;
  }
#ifdef SU_HAVE_IN6
  else if (host_is_ip6_reference(tpn->tpn_host)) {
    /* Remove [] around IPv6 addresses. */
    size_t len = strlen(tpn->tpn_host);
    assert(len < sizeof hostname);
    host = memcpy(hostname, tpn->tpn_host + 1, len - 2);
    hostname[len - 2] = '\0';
  }
#endif
  else
    host = tpn->tpn_host;

  if (tpn->tpn_port != NULL && strlen(tpn->tpn_port) > 0 &&
      strcmp(tpn->tpn_port, tpn_any) != 0)
    service = tpn->tpn_port;
  else
    service = "";

  if (host && (strcmp(host, "0.0.0.0") == 0 || strcmp(host, "0") == 0))
    host = NULL, family = AF_INET;
#if SU_HAVE_IN6
  else if (host && strcmp(host, "::") == 0)
    host = NULL, family = AF_INET6;
#endif

  if (tpn->tpn_canon && strcmp(tpn->tpn_canon, tpn_any) &&
      (host || tpn->tpn_canon != tpn->tpn_host))
    canon = tpn->tpn_canon;

  if (tport_server_addrinfo(mr, canon, family,
			    host, service, tpn->tpn_proto,
			    transports, &res) < 0)
    return -1;

  for (tbf = &mr->mr_primaries; *tbf; tbf = &(*tbf)->pri_next)
    ;

  port = port0 = port1 = ntohs(((su_sockaddr_t *)res->ai_addr)->su_port);
  error = EPROTONOSUPPORT;

  /*
   * Loop until we can bind all the transports requested
   * by the transport user to the same port.
   */
  for (;;) {
    for (ai = res; ai; ai = ai->ai_next) {
      tp_name_t tpname[1];
      su_addrinfo_t ainfo[1];
      su_sockaddr_t su[1];
      tport_vtable_t const *vtable;

      vtable = tport_vtable_by_name(ai->ai_canonname, public);
      if (!vtable)
	continue;

      tport_addrinfo_copy(ainfo, su, sizeof su, ai);
      ainfo->ai_canonname = (char *)canon;
      su->su_port = htons(port);

      memcpy(tpname, tpn, sizeof tpname);
      tpname->tpn_canon = canon;
      tpname->tpn_host = host;

      SU_DEBUG_9(("%s(%p): calling tport_listen for %s\n",
		  __func__, (void *)mr, ai->ai_canonname));

      pri = tport_listen(mr, vtable, tpname, ainfo, tags);
      if (!pri) {
	switch (error = su_errno()) {
	case EADDRNOTAVAIL:	/* Not our address */
	case ENOPROTOOPT:	/* Protocol not supported */
	case ESOCKTNOSUPPORT:	/* Socket type not supported */
	  continue;
	default:
	  break;
	}
	break;
      }

      if (port0 == 0 && port == 0) {
	port = port1 = ntohs(su->su_port);
	assert(public != tport_type_server || port != 0);
      }
    }

    if (ai == NULL)
      break;

    while (*tbf)
      tport_zap_primary(*tbf);

    if (error != EADDRINUSE || port0 != 0 || port == 0)
      break;

    while (step == 0) {
      /* step should be relative prime to 65536 - 1024 */
      /* 65536 - 1024 = 7 * 3 * 3 * 1024 */
      step = su_randint(1, 65535 - 1024 - 1) | 1;
      if (step % 3 == 0)
	step = (step + 2) % (65536 - 1024);
      if (step % 7 == 0)
	step = (step + 2) % (65536 - 1024);
    }
    old = port; port += step; if (port >= 65536) port -= (65536 - 1024);

    if (port == port1)		/* All ports in use! */
      break;

    SU_DEBUG_3(("%s(%p): cannot bind all transports to port %u, trying %u\n",
		__func__, (void *)mr, old, port));
  }

  tport_freeaddrinfo(res);

  if (!*tbf) {
    su_seterrno(error);
    return -1;
  }

  return 0;
}


/** Check if we can bind to IPv6 separately from IPv4 bind */
static
int bind6only_check(tport_master_t *mr)
{
  int retval = 0;
#if SU_HAVE_IN6
  su_sockaddr_t su[1], su4[1];
  socklen_t sulen, su4len;
  int s6, s4;

  if (mr->mr_boundserver)
    return 0;

  s4 = su_socket(AF_INET, SOCK_DGRAM, IPPROTO_UDP);
  s6 = su_socket(AF_INET6, SOCK_DGRAM, IPPROTO_UDP);

  memset(su, 0, sizeof *su);
  su->su_len = sulen = (sizeof su->su_sin6);
  su->su_family = AF_INET6;

  memset(su4, 0, sizeof *su4);
  su4->su_len = su4len = (sizeof su->su_sin);
  su4->su_family = AF_INET;

  if (bind(s6, &su->su_sa, sulen) < 0)
    ;
  else if (getsockname(s6, &su->su_sa, &sulen) < 0)
    ;
  else if ((su4->su_port = su->su_port) != 0 &&
	   bind(s4, &su4->su_sa, su4len) == 0)
    retval = 1;

  su_close(s6), su_close(s4);

  mr->mr_bindv6only = retval;
  mr->mr_boundserver = 1;
#endif

  return retval;
}

/* Number of supported transports */
#define TPORT_N (8)

/** Return list of addrinfo structures matching to
 * canon/host/service/protocol
 */
static
int tport_server_addrinfo(tport_master_t *mr,
			  char const *canon,
			  int family,
			  char const *host,
			  char const *service,
			  char const *protocol,
			  char const * const transports[],
			  su_addrinfo_t **return_addrinfo)
{
  int i, N;
  su_addrinfo_t hints[TPORT_N + 1];

  *return_addrinfo = NULL;

  /*
   * Resolve all the transports requested by the protocol
   */
  for (i = 0, N = 0; transports[i] && N < TPORT_N; i++) {
    su_addrinfo_t *ai = &hints[N];

    if (!su_casematch(protocol, transports[i]) && !su_strmatch(protocol, "*"))
      continue;

    /* Resolve protocol, skip unknown transport protocols. */
    if (getprotohints(ai, transports[i], AI_PASSIVE) < 0)
      continue;

    ai->ai_family = family;
    ai->ai_next = &hints[++N];
  }

  if (N == 0)
    return su_seterrno(EPROTONOSUPPORT);
  if (transports[i] /* Too many protocols */)
    return su_seterrno(ENOMEM);

  hints[N - 1].ai_next = NULL;

  if (host) {
    int error = tport_getaddrinfo(host, service, hints, return_addrinfo);
    if (error || !*return_addrinfo) {
      SU_DEBUG_3(("%s(%p): su_getaddrinfo(%s, %s) for %s: %s\n",
		  __func__, (void *)mr,
		  host ? host : "\"\"", service, protocol,
		  su_gai_strerror(error)));
      return su_seterrno(error != EAI_MEMORY ? ENOENT : ENOMEM);
    }
    return 0;
  }

  return tport_get_local_addrinfo(mr, service, hints, return_addrinfo);
}

/** Convert localinfo into addrinfo */
static
int
tport_get_local_addrinfo(tport_master_t *mr,
			 char const *port,
			 su_addrinfo_t const *hints,
			 su_addrinfo_t **return_ai)
{
  int error, family;
  su_localinfo_t lihints[1] = {{ 0 }};
  su_localinfo_t *li, *li_result;
  su_addrinfo_t const *h;
  su_addrinfo_t *ai, **prev;
  su_sockaddr_t *su;
  unsigned long lport = 0;
  char *rest;

  prev = return_ai, *prev = NULL;

  if (port) {
    lport = strtoul(port, &rest, 10);
    if (lport >= 65536) {
      su_seterrno(EINVAL);
      return -1;
    }
  }

  family = hints->ai_family;

  for (h = hints->ai_next; h && family; h = h->ai_next)
    if (h->ai_family != family)
      family = 0;

  lihints->li_flags = 0;
  lihints->li_family = family;
  lihints->li_scope = LI_SCOPE_GLOBAL | LI_SCOPE_SITE | LI_SCOPE_HOST;

  error = su_getlocalinfo(lihints, &li_result);
  if (error) {
#if SU_HAVE_IN6
    SU_DEBUG_3(("%s(%p): su_getlocalinfo() for %s address: %s\n",
		__func__, (void *)mr,
		family == AF_INET6 ? "ip6"
		: family == AF_INET ? "ip4" : "ip",
		su_gli_strerror(error)));
#else
    SU_DEBUG_3(("%s(%p): su_getlocalinfo() for %s address: %s\n",
		__func__, (void *)mr,
		family == AF_INET ? "ip4" : "ip",
		su_gli_strerror(error)));
#endif
    su_seterrno(ENOENT);
    return -1;
  }

  for (li = li_result; li; li = li->li_next) {
    for (h = hints; h; h = h->ai_next) {
      if (h->ai_family && h->ai_family != li->li_family)
	continue;

      ai = calloc(1, sizeof *ai + li->li_addrlen);
      if (ai == NULL)
	break;

      *prev = ai, prev = &ai->ai_next;

      ai->ai_flags = AI_PASSIVE | TP_AI_ANY;
      ai->ai_family = li->li_family;
      ai->ai_socktype = h->ai_socktype;
      ai->ai_protocol = h->ai_protocol;
      ai->ai_canonname = h->ai_canonname;
      ai->ai_addr = memcpy(ai + 1, li->li_addr,
			   ai->ai_addrlen = li->li_addrlen);
      su = (void *)ai->ai_addr;
      su->su_port = htons(lport);
    }
  }

  su_freelocalinfo(li_result);

  if (li) {
    tport_freeaddrinfo(*return_ai);
    su_seterrno(ENOMEM);
    return -1;
  }

  if (*return_ai == NULL) {
    su_seterrno(ENOENT);
    return -1;
  }

  return 0;
}

su_inline su_addrinfo_t *get_next_addrinfo(su_addrinfo_t **all);

/** Translate address and service.
 *
 * This is a getaddrinfo() supporting multiple hints in a list.
 */
int tport_getaddrinfo(char const *node, char const *service,
		      su_addrinfo_t const *hints,
		      su_addrinfo_t **res)
{
  su_addrinfo_t const *h0;
  su_addrinfo_t *tbf, **prev;
  int error = EAI_SOCKTYPE;
  int i, N;
  su_addrinfo_t *all[TPORT_N + 1]; /* Lists for all supported transports */
  su_addrinfo_t *results[TPORT_N + 1];
  void *addr;
  int addrlen;

  *res = NULL;

  for (N = 0, h0 = hints; h0; h0 = h0->ai_next) {
    su_addrinfo_t h[1];

    *h = *h0, h->ai_next = NULL, h->ai_canonname = NULL;

    error = su_getaddrinfo(node, service, h, &all[N]);
    results[N] = all[N];
    if (error == EAI_SOCKTYPE) {
      SU_DEBUG_7(("%s(): su_getaddrinfo(%s, %s) for %s: %s\n",
		  __func__, node ? node : "\"\"", service,
		  h0->ai_canonname, su_gai_strerror(error)));
      continue;
    }

    if (error || !all[N])
      break;
    N++;
  }

  if (h0)
    for (i = 0; i < N; i++)
      su_freeaddrinfo(all[i]);
  if (error)
    return error;

  /* Combine all the valid addrinfo structures to a single list */
  prev = &tbf, tbf = NULL;

  for (;;) {
    su_addrinfo_t *ai = NULL, *ai0;

    for (i = 0, h0 = hints; i < N; i++, h0 = h0->ai_next) {
      if ((ai = get_next_addrinfo(&results[i])))
	break;
    }
    if (i == N)
      break;

    assert(ai);
    addr = SU_ADDR((su_sockaddr_t *)ai->ai_addr);
    addrlen = SU_ADDRLEN((su_sockaddr_t *)ai->ai_addr);

    /* Copy all the addrinfo structures with same address to the list */
    for (; i < N; i++, h0 = h0->ai_next) {
      while ((ai0 = get_next_addrinfo(&results[i]))) {
	void *a = SU_ADDR((su_sockaddr_t *)ai0->ai_addr);

	if (memcmp(addr, a, addrlen)) /* Different address */
	  break;

	results[i] = ai0->ai_next;

	ai = calloc(1, sizeof *ai + ai0->ai_addrlen);
	if (ai == NULL)
	  goto error;
	*prev = memcpy(ai, ai0, sizeof *ai); prev = &ai->ai_next; *prev = NULL;
	ai->ai_addr = memcpy(ai + 1, ai0->ai_addr, ai0->ai_addrlen);
	ai->ai_canonname = h0->ai_canonname;
      }
    }
  }

  for (i = 0; i < N; i++)
    su_freeaddrinfo(all[i]);

  *res = tbf;
  return 0;

 error:
  for (i = 0; i < N; i++)
    su_freeaddrinfo(all[i]);
  tport_freeaddrinfo(tbf);
  return EAI_MEMORY;
}

su_inline
su_addrinfo_t *get_next_addrinfo(su_addrinfo_t **all)
{
  su_addrinfo_t *ai;

  while ((ai = *all)) {
    if (ai->ai_family == AF_INET)
      return ai;
#if SU_HAVE_IN6
    if (ai->ai_family == AF_INET6)
      return ai;
#endif
    *all = ai->ai_next;
  }
  return ai;
}

static
void tport_freeaddrinfo(su_addrinfo_t *ai)
{
  su_addrinfo_t *ai_next;

  while (ai) {
    ai_next = ai->ai_next;
    free(ai);
    ai = ai_next;
  }
}

static
int tport_addrinfo_copy(su_addrinfo_t *dst, void *addr, socklen_t addrlen,
			su_addrinfo_t const *src)
{
  if (addrlen < src->ai_addrlen)
    return -1;

  memcpy(dst, src, sizeof *dst);

  if (src->ai_addrlen < addrlen)
    memset(addr, 0, addrlen);

  dst->ai_addr = memcpy(addr, src->ai_addr, src->ai_addrlen);
  dst->ai_next = NULL;

  return 0;
}

/** Close a transport.
 *
 * Close the socket associated with a transport object. Report an error to
 * all pending clients, if required. Set/reset timer, too.
 */
void tport_close(tport_t *self)
{
  SU_DEBUG_5(("%s(%p): " TPN_FORMAT "\n",
	      __func__, (void *)self, TPN_ARGS(self->tp_name)));

  if (self->tp_refs == -1) {
	  self->tp_refs = 0;
  }

  if (self->tp_closed || !tport_is_secondary(self))
    return;

  tprb_remove(&self->tp_pri->pri_open, self);
  tplist_insert(&self->tp_pri->pri_closed, self);

  self->tp_closed = 1;
  self->tp_send_close = 3;
  self->tp_recv_close = 3;

  if (self->tp_params->tpp_sdwn_error && self->tp_pused)
    tport_error_report(self, -1, NULL);

  if (self->tp_pri->pri_vtable->vtp_shutdown)
    self->tp_pri->pri_vtable->vtp_shutdown(self, 2);
  else if (self->tp_socket != -1)
    shutdown(self->tp_socket, 2);

  if (self->tp_index)
    su_root_deregister(self->tp_master->mr_root, self->tp_index);
  self->tp_index = 0;
#if SU_HAVE_BSDSOCK
  if (self->tp_socket != -1)
    su_close(self->tp_socket);
  self->tp_socket = -1;
#endif

  /* Zap the queued messages */
  if (self->tp_queue) {
    unsigned short i, N = self->tp_params->tpp_qsize;
    for (i = 0; i < N; i++) {
      if (self->tp_queue[i])
	msg_ref_destroy(self->tp_queue[i]), self->tp_queue[i] = NULL;
    }
  }

  self->tp_index = 0;
  self->tp_events = 0;
}

/** Shutdown a transport.
 *
 * The tport_shutdown() shuts down a full-duplex transport connection
 * partially or completely. If @a how is 0, the further incoming data is
 * shut down. If @a how is 1, further outgoing data is shut down. If @a how
 * is 2, both incoming and outgoing traffic is shut down.
 *
 */
int tport_shutdown(tport_t *self, int how)
{
  int retval;
  if (!tport_is_secondary(self))
    return -1;
  retval = tport_shutdown0(self, how);
  tport_set_secondary_timer(self);
  return retval;
}

/** Internal shutdown function */
int tport_shutdown0(tport_t *self, int how)
{
  SU_DEBUG_7(("%s(%p, %d)\n", __func__, (void *)self, how));

  if (!tport_is_tcp(self) ||
      how < 0 || how >= 2 ||
      (how == 0 && self->tp_send_close) ||
      (how == 1 && self->tp_recv_close > 1)) {
    tport_close(self);
    return 1;
  }

  if (self->tp_pri->pri_vtable->vtp_shutdown)
    self->tp_pri->pri_vtable->vtp_shutdown(self, how);
  else
    shutdown(self->tp_socket, how);

  if (how == 0) {
    self->tp_recv_close = 2;
    tport_set_events(self, 0, SU_WAIT_IN);
    if (self->tp_params->tpp_sdwn_error && self->tp_pused)
      tport_error_report(self, -1, NULL);
  }
  else if (how == 1) {
    self->tp_send_close = 2;
    tport_set_events(self, 0, SU_WAIT_OUT);
    if (tport_has_queued(self)) {
      unsigned short i, N = self->tp_params->tpp_qsize;
      for (i = 0; i < N; i++) {
	if (self->tp_queue[i]) {
	  tport_pending_errmsg(self, self->tp_queue[i], EPIPE);
	  msg_ref_destroy(self->tp_queue[i]), self->tp_queue[i] = NULL;
	}
      }
    }
  }

  return 0;
}

static void tport_secondary_timer(su_root_magic_t *magic,
				  su_timer_t *t,
				  tport_t *self)
{
  su_time_t now;

  if (tport_is_closed(self)) {
    if (self->tp_refs == 0)
      tport_zap_secondary(self);
    return;
  }

  now = /* su_timer_expired(t); */ su_now();

  if (self->tp_pri->pri_vtable->vtp_secondary_timer)
    self->tp_pri->pri_vtable->vtp_secondary_timer(self, now);
  else
    tport_base_timer(self, now);
}

/** Base timer for secondary transports.
 *
 * Closes and zaps unused transports.  Sets the timer again.
 */
void tport_base_timer(tport_t *self, su_time_t now)
{
  unsigned timeout = self->tp_params->tpp_idle;

  if (timeout != UINT_MAX) {
    if (self->tp_refs == 0 &&
	self->tp_msg == NULL &&
	!tport_has_queued(self) &&
	su_time_cmp(su_time_add(self->tp_rtime, timeout), now) < 0 &&
	su_time_cmp(su_time_add(self->tp_stime, timeout), now) < 0) {
      SU_DEBUG_7(("%s(%p): unused for %d ms,%s zapping\n",
		  __func__, (void *)self,
		  timeout, tport_is_closed(self) ? "" : " closing and"));
      if (!tport_is_closed(self))
	tport_close(self);
      tport_zap_secondary(self);
      return;
    }
  }

  tport_set_secondary_timer(self);
}

/** Set timer for a secondary transport.
 *
 * This function should be called after any network activity:
 * tport_base_connect(), tport_send_msg(), tport_send_queue(),
 * tport_recv_data(), tport_shutdown0(), tport_close(),
 *
 * @retval 0 always
 */
int tport_set_secondary_timer(tport_t *self)
{
  su_time_t const infinity = { ULONG_MAX, 999999 };
  su_time_t target = infinity;
  char const *why = "not specified";
  su_timer_f timer = tport_secondary_timer;

  if (!tport_is_secondary(self))
    return 0;

  again:
  if (tport_is_closed(self)) {
    if (self->tp_refs == 0) {
      SU_DEBUG_7(("tport(%p): set timer at %u ms because %s\n",
				  (void *)self, 0, "zap"));
      su_timer_set_interval(self->tp_timer, timer, self, 0);
    }
    else
      su_timer_reset(self->tp_timer);

    return 0;
  }

  if (self->tp_params->tpp_idle != UINT_MAX) {
    if (self->tp_refs == 0 &&
	self->tp_msg == NULL && !tport_has_queued(self)) {
      if (su_time_cmp(self->tp_stime, self->tp_rtime) < 0) {
	target = su_time_add(self->tp_rtime, self->tp_params->tpp_idle);
	why = "idle since recv";
      }
      else {
	target = su_time_add(self->tp_stime, self->tp_params->tpp_idle);
	why = "idle since send";
      }
    }
  }

  if (self->tp_pri->pri_vtable->vtp_next_secondary_timer) {
    if (self->tp_pri->pri_vtable->
      vtp_next_secondary_timer(self, &target, &why) == -1) {
      if (tport_is_closed(self)) {
        goto again;
      }
    }
  }


  if (su_time_cmp(target, infinity)) {
    SU_DEBUG_7(("tport(%p): set timer at %ld ms because %s\n",
		(void *)self, su_duration(target, su_now()), why));
    su_timer_set_at(self->tp_timer, timer, self, target);
  }
  else {
    SU_DEBUG_9(("tport(%p): reset timer\n", (void *)self));
    su_timer_reset(self->tp_timer);
  }

  return 0;
}


/** Flush idle connections. */
int tport_flush(tport_t *tp)
{
  tport_t *tp_next;
  tport_primary_t *pri;

  if (tp == NULL)
    return -1;

  pri = tp->tp_pri;

  while (pri->pri_closed)
    tport_zap_secondary(pri->pri_closed);

  /* Go through all secondary transports, zap idle ones */
  for (tp = tprb_first(tp->tp_pri->pri_open); tp; tp = tp_next) {
    tp_next = tprb_succ(tp);

    if (tp->tp_refs != 0)
      continue;

    SU_DEBUG_1(("tport_flush(%p): %szapping\n",
		(void *)tp, tport_is_closed(tp) ? "" : "closing and "));

    tport_close(tp);
    tport_zap_secondary(tp);
  }

  return 0;
}

/**Convert sockaddr_t to a transport name.
 *
 * @retval 0 when successful
 * @retval -1 upon an error
 */
int tport_convert_addr(su_home_t *home,
		       tp_name_t *tpn,
		       char const *protoname,
		       char const *canon,
		       su_sockaddr_t const *su)
{
  tp_name_t name[1] = {{ NULL }};
  char const *host;
  char buf[TPORT_HOSTPORTSIZE];
  char port[8];
  size_t canonlen = canon ? strlen(canon) : 0;

  if (su == NULL)
    host = "*";
  else if (!SU_SOCKADDR_INADDR_ANY(su))
    host = tport_hostport(buf, sizeof(buf), su, 0);
  else if (canonlen && su->su_family == AF_INET &&
	   strspn(canon, "0123456789.") == canonlen)
    host = canon;
#if SU_HAVE_IN6
  else if (canonlen && su->su_family == AF_INET6 &&
	   strspn(canon, "0123456789abcdefABCDEF:.") == canonlen)
    host = canon;
#endif
  else
    host = localipname(su->su_family, buf, sizeof(buf));

  if (host == NULL)
    return -1;

  if (su == NULL)
    strcpy(port, "*");
  else
    snprintf(port, sizeof(port), "%u", ntohs(su->su_port));

  name->tpn_proto = protoname;
  name->tpn_host = host;
  name->tpn_canon = canon ? canon : host;
  name->tpn_port = port;

  return tport_name_dup(home, tpn, name);
}

/** Set transport object name. @internal
 */
int tport_setname(tport_t *self,
		  char const *protoname,
		  su_addrinfo_t const *ai,
		  char const *canon)
{
  su_addrinfo_t *selfai = self->tp_addrinfo;

  if (tport_convert_addr(self->tp_home, self->tp_name,
			 protoname, canon,
			 (su_sockaddr_t *)ai->ai_addr) < 0)
    return -1;

  if (tport_is_secondary(self))
    self->tp_ident = self->tp_pri->pri_primary->tp_ident;

  selfai->ai_flags = ai->ai_flags & TP_AI_MASK;

  selfai->ai_family = ai->ai_family;
  selfai->ai_socktype = ai->ai_socktype;
  selfai->ai_protocol = ai->ai_protocol;
  selfai->ai_canonname = (char *)self->tp_name->tpn_canon;

  if (ai->ai_addr) {
    assert(ai->ai_family), assert(ai->ai_socktype), assert(ai->ai_protocol);
    memcpy(self->tp_addr, ai->ai_addr, selfai->ai_addrlen = ai->ai_addrlen);
  }

  return 0;
}

/**Resolve protocol name.
 *
 * Convert a protocol name to IP protocol number and socket type used by
 * su_getaddrinfo().
 *
 * @param hints hints with the protocol number and socktype [OUT]
 * @param proto protocol name [IN]
 * @param flags hint flags
 */
static
int getprotohints(su_addrinfo_t *hints,
		  char const *proto,
		  int flags)
{
  memset(hints, 0, sizeof *hints);

  hints->ai_flags = flags;
  hints->ai_canonname = (char *)proto;

#if HAVE_TLS
  if (su_casematch(proto, "tls"))
    proto = "tcp";
#endif

#if HAVE_SOFIA_NTH
  if (su_casematch(proto, "ws"))
    proto = "tcp";
  if (su_casematch(proto, "wss"))
    proto = "tcp";
#endif

#if HAVE_SCTP
  if (su_casematch(proto, "sctp")) {
    hints->ai_protocol = IPPROTO_SCTP;
    hints->ai_socktype = SOCK_STREAM;
    return 0;
  }
#endif

  if (su_casematch(proto, "udp")) {
    hints->ai_protocol = IPPROTO_UDP;
    hints->ai_socktype = SOCK_DGRAM;
    return 0;
  }

  if (su_casematch(proto, "tcp")) {
    hints->ai_protocol = IPPROTO_TCP;
    hints->ai_socktype = SOCK_STREAM;
    return 0;
  }

  return -1;
}

/** Get local IP.
 *
 * Get primary local IP address in URI format (IPv6 address will be
 * []-quoted).
 */
static
char *localipname(int pf, char *buf, size_t bufsiz)
{
  su_localinfo_t *li = NULL, hints[1] = {{ LI_NUMERIC | LI_CANONNAME }};
  size_t n;
  int error;

  hints->li_family = pf;

#if SU_HAVE_IN6
  if (pf == AF_INET6) {
    /* Link-local addresses are not usable on IPv6 */
    hints->li_scope = LI_SCOPE_GLOBAL | LI_SCOPE_SITE /* | LI_SCOPE_HOST */;
  }
#endif

  if ((error = su_getlocalinfo(hints, &li))) {
#if SU_HAVE_IN6
    if (error == ELI_NOADDRESS && pf == AF_INET6) {
      hints->li_family = AF_INET;
      error = su_getlocalinfo(hints, &li);
      if (error == ELI_NOADDRESS) {
	hints->li_family = AF_INET6; hints->li_scope |= LI_SCOPE_HOST;
	error = su_getlocalinfo(hints, &li);
      }
      if (error == ELI_NOADDRESS) {
	hints->li_family = AF_INET;
	error = su_getlocalinfo(hints, &li);
      }
    }
#endif
    if (error) {
      SU_DEBUG_1(("tport: su_getlocalinfo: %s\n", su_gli_strerror(error)));
      return NULL;
    }
  }

  assert(li); assert(li->li_canonname);

  n = strlen(li->li_canonname);

  if (li->li_family == AF_INET) {
    if (n >= bufsiz)
      return NULL;

    memcpy(buf, li->li_canonname, n + 1);
  }
  else {
    if (n + 2 >= bufsiz)
      return NULL;

    memcpy(buf + 1, li->li_canonname, n);
    buf[0] = '['; buf[++n] = ']'; buf[++n] = '\0';
  }

  su_freelocalinfo(li);

  return buf;
}

/** Process errors from transport. */
void tport_error_report(tport_t *self, int errcode,
			su_sockaddr_t const *addr)
{
  char const *errmsg;

  if (errcode == 0)
    return;
  else if (errcode > 0)
    errmsg = su_strerror(errcode);
  else
    /* Should be something  like ENOTCONN */
    errcode = 0, errmsg = "stream closed";

  if (addr && addr->su_family == AF_UNSPEC)
    addr = NULL;

  /* Mark this connection as unusable */
  if (errcode > 0 && tport_has_connection(self))
    self->tp_reusable = 0;

  /* Report error */
  if (addr && tport_pending_error(self, addr, errcode))
    ;
  else if (tport_is_secondary(self) &&
	   tport_pending_error(self, NULL, errcode) > 0)
    ;
  else if (self->tp_master->mr_tpac->tpac_error) {
    char *dstname = NULL;
    char hp[TPORT_HOSTPORTSIZE];

    if (addr)
      dstname = tport_hostport(hp, sizeof hp, addr, 1);

    STACK_ERROR(self, errcode, dstname);
  }
  else {
    if (tport_is_primary(self))
      SU_DEBUG_3(("%s(%p): %s (with %s)\n", __func__, (void *)self,
		  errmsg, self->tp_protoname));
    else
      SU_DEBUG_3(("%s(%p): %s (with %s/%s:%s)\n", __func__, (void *)self,
		  errmsg, self->tp_protoname, self->tp_host, self->tp_port));
  }

  /* Close connection */
  if (!self->tp_closed && errcode > 0 && tport_has_connection(self))
    tport_close(self);
}

/** Accept a new connection.
 *
 * The function tport_accept() accepts a new connection and creates a
 * secondary transport object for the new socket.
 */
int tport_accept(tport_primary_t *pri, int events)
{
  tport_t *self;
  su_addrinfo_t ai[1];
  su_sockaddr_t su[1];
  socklen_t sulen = sizeof su;
  su_socket_t s = INVALID_SOCKET, l = pri->pri_primary->tp_socket;
  char const *reason = "accept";

  if (events & SU_WAIT_ERR)
    tport_error_event(pri->pri_primary);

  if (!(events & SU_WAIT_ACCEPT))
    return 0;

  memcpy(ai, pri->pri_primary->tp_addrinfo, sizeof ai);
  ai->ai_canonname = NULL;

  s = accept(l, &su->su_sa, &sulen);

  if (s < 0) {
    tport_error_report(pri->pri_primary, su_errno(), NULL);
    return 0;
  }

  ai->ai_addr = &su->su_sa, ai->ai_addrlen = sulen;

  /* Alloc a new transport object, then register socket events with it */
  if ((self = tport_alloc_secondary(pri, s, 1, &reason)) == NULL) {
    SU_DEBUG_3(("%s(%p): incoming secondary on "TPN_FORMAT
                " failed. reason = %s\n", __func__, (void *)pri, 
                TPN_ARGS(pri->pri_primary->tp_name), reason));
	shutdown(s, 2);
	su_close(s);
    return 0;
  }
  else {
    int events = SU_WAIT_IN|SU_WAIT_ERR|SU_WAIT_HUP;

    SU_CANONIZE_SOCKADDR(su);

    if (/* Prevent being marked as connected if already closed */
		!tport_is_closed(self) && 
		/* Name this transport */
        tport_setname(self, pri->pri_protoname, ai, NULL) != -1 
	/* Register this secondary */ 
	&&
	tport_register_secondary(self, tport_wakeup, events) != -1) {

      self->tp_conn_orient = 1;
      self->tp_is_connected = 1;

      SU_DEBUG_5(("%s(%p): new connection from " TPN_FORMAT "\n",
                  __func__,  (void *)self, TPN_ARGS(self->tp_name)));

      return 0;
    }

    /* Failure: shutdown socket,  */
    tport_close(self);
    tport_zap_secondary(self);
    self = NULL;
  }

  return 0;
}

/** Allocate a new message object */
msg_t *tport_msg_alloc(tport_t const *self, usize_t size)
{
  if (self) {
    tport_master_t *mr = self->tp_master;
    msg_t *msg = mr->mr_tpac->tpac_alloc(mr->mr_stack, mr->mr_log,
					 NULL, size, self, NULL);
    if (msg) {
      su_addrinfo_t *mai = msg_addrinfo(msg);
      su_addrinfo_t const *tai = self->tp_addrinfo;

      mai->ai_family =   tai->ai_family;
      mai->ai_protocol = tai->ai_protocol;
      mai->ai_socktype = tai->ai_socktype;
    }

    return msg;
  }
  else {
    return NULL;
  }
}

/** Process events for socket waiting to be connected
 */
static int tport_connected(su_root_magic_t *magic, su_wait_t *w, tport_t *self)
{
  int events = su_wait_events(w, self->tp_socket);
  tport_master_t *mr = self->tp_master;
  su_wait_t wait[1] =  { SU_WAIT_INIT };

  int error;

  SU_DEBUG_7(("tport_connected(%p): events%s%s\n", (void *)self,
	      events & SU_WAIT_CONNECT ? " CONNECTED" : "",
	      events & SU_WAIT_ERR ? " ERR" : ""));

#if HAVE_POLL
  assert(w->fd == self->tp_socket);
#endif

  if (events & SU_WAIT_ERR)
    tport_error_event(self);

  if (!(events & SU_WAIT_CONNECT) || self->tp_closed) {
    return 0;
  }

  error = su_soerror(self->tp_socket);
  if (error) {
    tport_error_report(self, error, NULL);
    return 0;
  }

  self->tp_is_connected = 1;

  su_root_deregister(mr->mr_root, self->tp_index);
  self->tp_index = -1;
  self->tp_events = SU_WAIT_IN | SU_WAIT_ERR | SU_WAIT_HUP;

  if (su_wait_create(wait, self->tp_socket, self->tp_events) == -1 ||
      (self->tp_index = su_root_register(mr->mr_root,
					 wait, tport_wakeup, self, 0))
      == -1) {
    tport_close(self);
    tport_set_secondary_timer(self);
    return 0;
  }

  if (tport_has_queued(self))
    tport_send_event(self);
  else
    tport_set_secondary_timer(self);

  return 0;
}

/** Process events for primary socket  */
static int tport_wakeup_pri(su_root_magic_t *m, su_wait_t *w, tport_t *self)
{
  tport_primary_t *pri = self->tp_pri;
  int events = su_wait_events(w, self->tp_socket);

#if HAVE_POLL
  assert(w->fd == self->tp_socket);
#endif

  SU_DEBUG_7(("%s(%p): events%s%s%s%s%s%s\n",
	      "tport_wakeup_pri", (void *)self,
	      events & SU_WAIT_IN ? " IN" : "",
	      SU_WAIT_ACCEPT != SU_WAIT_IN &&
	      (events & SU_WAIT_ACCEPT) ? " ACCEPT" : "",
	      events & SU_WAIT_OUT ? " OUT" : "",
	      events & SU_WAIT_HUP ? " HUP" : "",
	      events & SU_WAIT_ERR ? " ERR" : "",
	      self->tp_closed ? " (closed)" : ""));


  if (pri->pri_vtable->vtp_wakeup_pri)
    return pri->pri_vtable->vtp_wakeup_pri(pri, events);
  else
    return tport_base_wakeup(self, events);
}

/** Process events for connected socket  */
int tport_wakeup(su_root_magic_t *magic, su_wait_t *w, tport_t *self)
{
  int events = su_wait_events(w, self->tp_socket);
  int error;

#if HAVE_POLL
  assert(w->fd == self->tp_socket);
#endif

  SU_DEBUG_7(("%s(%p): events%s%s%s%s%s\n",
	      "tport_wakeup", (void *)self,
	      events & SU_WAIT_IN ? " IN" : "",
	      events & SU_WAIT_OUT ? " OUT" : "",
	      events & SU_WAIT_HUP ? " HUP" : "",
	      events & SU_WAIT_ERR ? " ERR" : "",
	      self->tp_closed ? " (closed)" : ""));

  if (self->tp_pri->pri_vtable->vtp_wakeup)
    error = self->tp_pri->pri_vtable->vtp_wakeup(self, events);
  else
    error = tport_base_wakeup(self, events);

  if (tport_is_closed(self)) {
    SU_DEBUG_9(("%s(%p): tport is closed! Setting secondary timer!\n", "tport_wakeup", (void *)self));
    tport_set_secondary_timer(self);
  }

  return error;
}

static int tport_base_wakeup(tport_t *self, int events)
{
  int error = 0;

  if (events & SU_WAIT_ERR)
    error = tport_error_event(self);

  if ((events & SU_WAIT_OUT) && !self->tp_closed)
    tport_send_event(self);

  if ((events & SU_WAIT_IN) && !self->tp_closed)
    tport_recv_event(self);

  if ((events & SU_WAIT_HUP) && !self->tp_closed)
    tport_hup_event(self);

  if (error) {
    if (self->tp_closed && error == EPIPE)
      return 0;

    tport_error_report(self, error, NULL);
  }

  return 0;
}

/** Stop reading from socket until tport_continue() is called. */
int tport_stall(tport_t *self)
{
  return tport_set_events(self, 0, SU_WAIT_IN);
}

/** Continue reading from socket. */
int tport_continue(tport_t *self)
{
  if (self == NULL || self->tp_recv_close)
    return -1;
  return tport_set_events(self, SU_WAIT_IN, 0);
}

/** Process "hangup" event.
 *
 */
void tport_hup_event(tport_t *self)
{
  SU_DEBUG_7(("%s(%p)\n", __func__, (void *)self));

  if (self->tp_msg) {
    su_time_t now = su_now();
    msg_recv_commit(self->tp_msg, 0, 1);
    tport_parse(self, 1, now);
  }

  if (!tport_is_secondary(self))
    return;

  /* Shutdown completely if there are no queued messages */
  /* Problem reported by Arsen Chaloyan */
  tport_shutdown0(self, tport_has_queued(self) ? 0 : 2);
  tport_set_secondary_timer(self);
}

/** Receive data available on the socket.
 *
 * @retval -1 error
 * @retval 0  end-of-stream
 * @retval 1  normal receive
 * @retval 2  incomplete recv, recv again
 * @retval 3  STUN keepalive, ignore
 */
su_inline
int tport_recv_data(tport_t *self)
{
  return self->tp_pri->pri_vtable->vtp_recv(self);
}

/** Process "ready to receive" event.
 *
 */
void tport_recv_event(tport_t *self)
{
  int again;

  SU_DEBUG_7(("%s(%p)\n", "tport_recv_event", (void *)self));

  do {
    /* Receive data from socket */
    again = tport_recv_data(self);

    su_time(&self->tp_rtime);

#if HAVE_SOFIA_STUN
    if (again == 3) /* STUN keepalive */
      return;
#endif

    if (again < 0) {
      int error = su_errno();

      if (!su_is_blocking(error)) {
	tport_error_report(self, error, NULL);
	return;
      }
      else {
	SU_DEBUG_3(("%s: recvfrom(): %s (%d)\n", __func__,
		    su_strerror(EAGAIN), EAGAIN));
      }
    }

    if (again >= 0)
      tport_parse(self, self->tp_pre_framed ? 1 : !again, self->tp_rtime);
  }
  while (again > 1);

  if (!tport_is_secondary(self))
    return;

  if (again == 0 && !tport_is_dgram(self)) {
    /* End of stream */
    if (!self->tp_closed) {
      /* Don't shutdown completely if there are queued messages */
      tport_shutdown0(self, tport_has_queued(self) ? 0 : 2);
    }
  }

  tport_set_secondary_timer(self);
}

/*
 * Parse the data and feed complete messages to the stack
 */
static void tport_parse(tport_t *self, int complete, su_time_t now)
{
  msg_t *msg, *next = NULL;
  int n, streaming, stall = 0;

  for (msg = self->tp_msg; msg; msg = next) {
    n = msg_extract(msg);	/* Parse message */

    streaming = 0;

    if (n == 0) {
      if (complete)
	msg_mark_as_complete(msg, MSG_FLG_ERROR), n = -1;
      else if (!(streaming = msg_is_streaming(msg))) {
	tport_sigcomp_accept_incomplete(self, msg);
	break;
      }
    }

    if (msg_get_flags(msg, MSG_FLG_TOOLARGE))
      SU_DEBUG_3(("%s(%p): too large message from " TPN_FORMAT "\n",
		  __func__, (void *)self, TPN_ARGS(self->tp_name)));

    /* Do not try to read anymore from this connection? */
    if (tport_is_stream(self) &&
	msg_get_flags(msg, MSG_FLG_TOOLARGE | MSG_FLG_ERROR))
      self->tp_recv_close = stall = 1;

    if (n == -1)
      next = NULL;
    else if (streaming)
      msg_ref_create(msg);	/* Keep a reference */
    else if (tport_is_stream(self))
      next = msg_next(msg);
    else
      next = NULL;

    tport_deliver(self, msg, next, self->tp_comp, now);

    if (streaming && next == NULL)
      break;
  }

  if (stall)
    tport_stall(self);

  if (self->tp_rlogged != msg)
    self->tp_rlogged = NULL;

  self->tp_msg = msg;
}

/** Deliver message to the protocol stack */
void tport_deliver(tport_t *self,
		   msg_t *msg,
		   msg_t *next,
		   tport_compressor_t *sc,
		   su_time_t now)
{
  tport_t *ref;
  int error;
  struct tport_delivery *d;
  char ipaddr[SU_ADDRSIZE + 2];

  assert(msg);

  d = self->tp_master->mr_delivery;

  d->d_tport = self;
  d->d_msg = msg;
  *d->d_from = *self->tp_name;

  if (tport_is_primary(self)) {
    su_sockaddr_t const *su = msg_addr(msg);

#if SU_HAVE_IN6
    if (su->su_family == AF_INET6) {
      ipaddr[0] = '[';
      su_inet_ntop(su->su_family, SU_ADDR(su), ipaddr + 1, SU_ADDRSIZE);
      strcat(ipaddr, "]");
    }
    else {
      su_inet_ntop(su->su_family, SU_ADDR(su), ipaddr, sizeof(ipaddr));
    }
#else
    su_inet_ntop(su->su_family, SU_ADDR(su), ipaddr, sizeof(ipaddr));
#endif

    d->d_from->tpn_canon = ipaddr;
    d->d_from->tpn_host = ipaddr;
  }

  d->d_comp = sc;
  if (!sc)
    d->d_from->tpn_comp = NULL;

  error = msg_has_error(msg);

  if (error && !*msg_chain_head(msg)) {
    /* This is badly damaged packet */
  }
  else if (self->tp_master->mr_log && msg != self->tp_rlogged) {
    char const *via = "recv";
    tport_log_msg(self, msg, via, "from", now);
    self->tp_rlogged = msg;
  }

  SU_DEBUG_7(("%s(%p): %smsg %p ("MOD_ZU" bytes)"
	      " from " TPN_FORMAT " next=%p\n",
	      __func__, (void *)self, error ? "bad " : "",
	      (void *)msg, (size_t)msg_size(msg),
	      TPN_ARGS(d->d_from), (void *)next));

  ref = tport_incref(self);

  if (self->tp_pri->pri_vtable->vtp_deliver) {
    self->tp_pri->pri_vtable->vtp_deliver(self, msg, now);
  }
  else
    tport_base_deliver(self, msg, now);

  memset(d->d_from, 0, sizeof d->d_from);
  d->d_msg = NULL;

  tport_decref(&ref);
}

/** Pass message to the protocol stack */
void
tport_base_deliver(tport_t *self, msg_t *msg, su_time_t now)
{
  STACK_RECV(self, msg, now);
}

/** Return source transport object for delivered message */
tport_t *tport_delivered_by(tport_t const *tp, msg_t const *msg)
{
  if (tp && msg && msg == tp->tp_master->mr_delivery->d_msg)
    return tp->tp_master->mr_delivery->d_tport;
  else
    return NULL;
}


/** Return source transport name for delivered message */
int tport_delivered_from(tport_t *tp, msg_t const *msg, tp_name_t name[1])
{
  if (name == NULL)
    return -1;

  if (tp == NULL || msg == NULL || msg != tp->tp_master->mr_delivery->d_msg) {
    memset(name, 0, sizeof *name);
    return -1;
  }
  else {
    *name = *tp->tp_master->mr_delivery->d_from;
    return 0;
  }
}

/** Return TLS Subjects provided by the source transport */
su_strlst_t const *tport_delivered_from_subjects(tport_t *tp, msg_t const *msg)
{
  if (tp && msg && msg == tp->tp_master->mr_delivery->d_msg) {
    tport_t *tp_sec = tp->tp_master->mr_delivery->d_tport;
    return (tp_sec) ? tp_sec->tp_subjects : NULL;
  }
  else
    return NULL;
}

/** Return UDVM used to decompress the message. */
int
tport_delivered_with_comp(tport_t *tp, msg_t const *msg,
			  tport_compressor_t **return_compressor)
{
  if (tp == NULL || msg == NULL || msg != tp->tp_master->mr_delivery->d_msg)
    return -1;

  if (return_compressor)
    *return_compressor = tp->tp_master->mr_delivery->d_comp;

  return 0;
}

/** Search for subject in list of TLS Certificate subjects */
int
tport_subject_search(char const *subject, su_strlst_t const *lst)
{
  usize_t idx, ilen;
  const char *subjuri;

  if (!subject || su_strmatch(tpn_any, subject))
    return 1;

  if (!lst)
    return 0;

  /* Check if subject is a URI */
  if (su_casenmatch(subject,"sip:",4) || su_casenmatch(subject,"sips:",5))
    subjuri = subject + su_strncspn(subject,5,":") + 1;
  else
    subjuri = NULL;

  ilen = su_strlst_len(lst);

  for (idx = 0; idx < ilen; idx++) {
    const char *lsturi, *lststr;

    lststr = su_strlst_item(lst, idx);

    /* check if lststr is a URI (sips URI is an unacceptable cert subject) */
    if (su_casenmatch(lststr,"sip:",4))
      lsturi = lststr + su_strncspn(lststr,4,":") + 1;
    else
      lsturi = NULL;


    /* Match two SIP Server Identities */
    if (host_cmp(subjuri ? subjuri : subject, lsturi ? lsturi : lststr) == 0)
      return 1;
#if 0
    /* XXX - IETF drafts forbid wildcard certs */
    if (!subjuri && !lsturi && su_strnmatch("*.", lststr, 2)) {
      size_t urioffset = su_strncspn(subject, 64, ".");
      if (urioffset) {
        if (su_casematch(subject + urioffset, lststr+1))
          return 1;
      }
    }
#endif
  }

  return 0;
}

/** Allocate message for N bytes,
 *  return message buffer as a iovec
 */
ssize_t tport_recv_iovec(tport_t const *self,
			 msg_t **in_out_msg,
			 msg_iovec_t iovec[msg_n_fragments],
			 size_t N,
			 int exact)
{
  msg_t *msg = *in_out_msg;
  ssize_t i, veclen;
  int fresh;

  if (N == 0)
    return 0;

  fresh = !msg;

  /*
   * Allocate a new message if needed
   */
  if (!msg) {
    if (!(*in_out_msg = msg = tport_msg_alloc(self, N))) {
      SU_DEBUG_7(("%s(%p): cannot allocate msg for "MOD_ZU" bytes "
		  "from (%s/%s:%s)\n",
		  __func__, (void *)self, N,
		  self->tp_protoname, self->tp_host, self->tp_port));
      return -1;
    }
  }

  /*
   * Get enough buffer space for the incoming data
   */
  veclen = msg_recv_iovec(msg, iovec, msg_n_fragments, N, exact);
  if (veclen < 0) {
    int err = su_errno();
    if (fresh && err == ENOBUFS && msg_get_flags(msg, MSG_FLG_TOOLARGE))
      veclen = msg_recv_iovec(msg, iovec, msg_n_fragments, 4096, 1);
  }
  if (veclen < 0) {
    int err = su_errno();
    SU_DEBUG_7(("%s(%p): cannot get msg %p buffer for "MOD_ZU" bytes "
		"from (%s/%s:%s): %s\n",
		__func__, (void *)self, (void *)msg, N,
		self->tp_protoname, self->tp_host, self->tp_port,
		su_strerror(err)));
    su_seterrno(err);
    return veclen;
  }

  assert(veclen <= msg_n_fragments);

  SU_DEBUG_7(("%s(%p) msg %p from (%s/%s:%s) has "MOD_ZU" bytes, "
	      "veclen = "MOD_ZD"\n",
              __func__, (void *)self,
	      (void *)msg, self->tp_protoname, self->tp_host, self->tp_port,
	      N, veclen));

  for (i = 0; veclen > 1 && i < veclen; i++) {
    SU_DEBUG_7(("\tiovec[%lu] = %lu bytes\n", (LU)i, (LU)iovec[i].mv_len));
  }

  return veclen;
}

int tport_recv_error_report(tport_t *self)
{
  if (su_is_blocking(su_errno()))
    return 1;

  /* Report error */
  tport_error_report(self, su_errno(), NULL);

  return -1;
}

/** Send a message.
 *
 * The function tport_tsend() sends a message using the transport @a self.
 *
 * @TAGS
 * TPTAG_MTU(), TPTAG_REUSE(), TPTAG_CLOSE_AFTER(), TPTAG_SDWN_AFTER(),
 * TPTAG_FRESH(), TPTAG_COMPARTMENT(), TPTAG_X509_SUBJECT()
 */
tport_t *tport_tsend(tport_t *self,
		     msg_t *msg,
		     tp_name_t const *_tpn,
		     tag_type_t tag, tag_value_t value, ...)
{
  ta_list ta;
  tagi_t const *t;
  int reuse, sdwn_after, close_after, resolved = 0, fresh;
  unsigned mtu;
  su_addrinfo_t *ai;
  tport_primary_t *primary;
  tp_name_t tpn[1];
  struct sigcomp_compartment *cc;

  assert(self);

  if (!self || !msg || !_tpn) {
    msg_set_errno(msg, EINVAL);
    return NULL;
  }

  *tpn = *_tpn;

  SU_DEBUG_7(("tport_tsend(%p) tpn = " TPN_FORMAT "\n",
	      (void *)self, TPN_ARGS(tpn)));

  if (tport_is_master(self)) {
    primary = (tport_primary_t *)tport_primary_by_name(self, tpn);
    if (!primary) {
      msg_set_errno(msg, EPROTONOSUPPORT);
      return NULL;
    }
  }
  else {
    primary = self->tp_pri;
  }

  ta_start(ta, tag, value);

  reuse = primary->pri_primary->tp_reusable && self->tp_reusable;
  fresh = 0;
  sdwn_after = 0;
  close_after = 0;
  mtu = 0;
  cc = NULL;

  /* tl_gets() is a bit too slow here... */
  for (t = ta_args(ta); t; t = tl_next(t)) {
    tag_type_t tt = t->t_tag;

    if (tptag_reuse == tt)
      reuse = t->t_value != 0;
    else if (tptag_mtu == tt)
      mtu = t->t_value;
    else if (tptag_sdwn_after == tt)
      sdwn_after = t->t_value != 0;
    else if (tptag_close_after == tt)
      close_after = t->t_value != 0;
    else if (tptag_fresh == tt)
      fresh = t->t_value != 0;
    else if (tptag_compartment == tt)
      cc = (struct sigcomp_compartment *)t->t_value;
  }

  ta_end(ta);

  fresh = fresh || !reuse;

  ai = msg_addrinfo(msg);

  ai->ai_flags = 0;

  tpn->tpn_comp = tport_canonize_comp(tpn->tpn_comp);
  if (tpn->tpn_comp) {
    ai->ai_flags |= TP_AI_COMPRESSED;
    SU_DEBUG_9(("%s: compressed msg(%p) with %s\n",
		__func__, (void *)msg, tpn->tpn_comp));
  }

  if (!tpn->tpn_comp || cc == NONE)
    cc = NULL;

  if (sdwn_after)
    ai->ai_flags |= TP_AI_SHUTDOWN;
  if (close_after)
    ai->ai_flags |= TP_AI_CLOSE;

  if (fresh) {
    /* Select a primary protocol, make a fresh connection */
    self = primary->pri_primary;
  }
  else if (tport_is_secondary(self) && tport_is_clear_to_send(self)) {
	/* self = self; */
	;
  }
  /*
   * Try to find an already open connection to the destination,
   * or get a primary protocol
   */
  else {
    /* If primary, resolve the destination address, store it in the msg */
    if (tport_resolve(primary->pri_primary, msg, tpn) < 0) {
      return NULL;
    }
    resolved = 1;

    self = tport_by_addrinfo(primary, msg_addrinfo(msg), tpn);

    if (!self)
      self = primary->pri_primary;
  }

  if (tport_is_primary(self)) {
    /* If primary, resolve the destination address, store it in the msg */
    if (!resolved && tport_resolve(self, msg, tpn) < 0) {
      return NULL;
    }

    if (tport_is_connection_oriented(self)
	|| self->tp_params->tpp_conn_orient) {
#if 0 && HAVE_UPNP /* We do not want to use UPnP with secondary transports! */
      if (upnp_register_upnp_client(1) != 0) {
	upnp_check_for_nat();
      }
#endif

      tpn->tpn_proto = self->tp_protoname;

      if (!cc)
	tpn->tpn_comp = NULL;

      /* Create a secondary transport which is connected to the destination */
      self = tport_connect(primary, msg_addrinfo(msg), tpn);

#if 0 && HAVE_UPNP /* We do not want to use UPnP with secondary transports! */
      upnp_deregister_upnp_client(0, 0);
#endif

      if (!self) {
	msg_set_errno(msg, su_errno());
        SU_DEBUG_9(("tport_socket failed in tsend\n" VA_NONE));
	return NULL;
      }

      if (cc)
	tport_sigcomp_assign(self, cc);
    }
  }
  else if (tport_is_secondary(self)) {
    cc = tport_sigcomp_assign_if_needed(self, cc);
  }

  if (cc == NULL)
    tpn->tpn_comp = NULL;

  if (tport_is_secondary(self)) {
    /* Set the peer address to msg */
    tport_peer_address(self, msg);
    if (sdwn_after || close_after)
      self->tp_reusable = 0;
  }

  if (self->tp_pri->pri_vtable->vtp_prepare
      ? self->tp_pri->pri_vtable->vtp_prepare(self, msg, tpn, cc, mtu) < 0
      : tport_prepare_and_send(self, msg, tpn, cc, mtu) < 0)
    return NULL;
  else
    return self;
}

int tport_prepare_and_send(tport_t *self, msg_t *msg,
			   tp_name_t const *tpn,
			   struct sigcomp_compartment *cc,
			   unsigned mtu)
{
  int retval;

  /* Prepare message for sending - i.e., encode it */
  if (msg_prepare(msg) < 0) {
    msg_set_errno(msg, errno);	/* msg parser uses plain errno. Hmph. */
    return -1;
  }

  if (msg_size(msg) > (usize_t)(mtu ? mtu : tport_mtu(self))) {
    msg_set_errno(msg, EMSGSIZE);
    return -1;
  }

  /*
   * If there is already an queued message,
   * put this message straight in the queue
   */
  if ((self->tp_queue && self->tp_queue[self->tp_qhead]) ||
      /* ...or we are connecting */
      (self->tp_events & (SU_WAIT_CONNECT | SU_WAIT_OUT))) {
    if (tport_queue(self, msg) < 0) {
      SU_DEBUG_9(("tport_queue failed in tsend\n" VA_NONE));
      return -1;
    }
    return 0;
  }

  retval = tport_send_msg(self, msg, tpn, cc);

  tport_set_secondary_timer(self);

  return retval;
}


/** Send a message.
 *
 * @retval 0 when succesful
 * @retval -1 upon an error
 */
int tport_send_msg(tport_t *self, msg_t *msg,
		   tp_name_t const *tpn,
		   struct sigcomp_compartment *cc)
{
  msg_iovec_t *iov, auto_iov[40];
  size_t iovlen, iovused, i, total;
  size_t n;
  ssize_t nerror;
  int sdwn_after, close_after;
  su_time_t now;
  su_addrinfo_t *ai;

  assert(self->tp_queue == NULL ||
	 self->tp_queue[self->tp_qhead] == NULL ||
	 self->tp_queue[self->tp_qhead] == msg);

  if (self->tp_iov)
    /* Use the heap-allocated I/O vector */
    iov = self->tp_iov, iovlen = self->tp_iovlen;
  else
    /* Use the stack I/O vector */
    iov = auto_iov, iovlen = sizeof(auto_iov)/sizeof(auto_iov[0]);

  /* Get a iovec for message contents */
  for (;;) {
    iovused = msg_iovec(msg, iov, iovlen);
    if (iovused <= iovlen)
      break;

    iov = su_realloc(self->tp_home, self->tp_iov, sizeof(*iov) * iovused);

    if (iov == NULL) {
      msg_set_errno(msg, errno);
      return -1;
    }

    self->tp_iov = iov, self->tp_iovlen = iovlen = iovused;
  }

  assert(iovused > 0);

  self->tp_stime = self->tp_ktime = now = su_now();

  nerror = tport_vsend(self, msg, tpn, iov, iovused, cc);
  SU_DEBUG_9(("tport_vsend returned "MOD_ZD"\n", nerror));

  if (nerror == -1)
    return -1;

  n = (size_t)nerror;

  self->tp_unsent = NULL, self->tp_unsentlen = 0;

  if (n > 0 && self->tp_master->mr_log && self->tp_slogged != msg) {
    tport_log_msg(self, msg, "send", "to", now);
    self->tp_slogged = msg;
  }

  for (i = 0, total = 0; i < iovused; i++) {
    if (total + (size_t)iov[i].mv_len > n) {
      if (tport_is_connection_oriented(self)) {
	iov[i].mv_len -= (su_ioveclen_t)(n - total);
	iov[i].mv_base = (char *)iov[i].mv_base + (n - total);
	if (tport_queue_rest(self, msg, &iov[i], iovused - i) < 0)
	  return tport_send_fatal(self, msg, tpn, "tport_queue_rest");
	else
	  return 0;
      }
      else {
	char const *comp = tpn->tpn_comp;

	SU_DEBUG_1(("%s(%p): send truncated for %s/%s:%s%s%s\n",
		    "tport_vsend", (void *)self, tpn->tpn_proto, tpn->tpn_host, tpn->tpn_port,
		    comp ? ";comp=" : "", comp ? comp : ""));

	msg_set_errno(msg, EIO);
	return /* tport_send_fatal(self, msg, tpn, "tport_send") */ -1;
      }
    }

    total += iov[i].mv_len;
  }

  /* We have sent a complete message */
  tport_sent_message(self, msg, 0);

  if (!tport_is_secondary(self))
    return 0;

  ai = msg_addrinfo(msg); assert(ai);
  close_after = (ai->ai_flags & TP_AI_CLOSE) == TP_AI_CLOSE;
  sdwn_after = (ai->ai_flags & TP_AI_SHUTDOWN) == TP_AI_SHUTDOWN ||
    self->tp_send_close;

  if (close_after || sdwn_after)
    tport_shutdown0(self, close_after ? 2 : 1);

  return 0;
}

static
ssize_t tport_vsend(tport_t *self,
		    msg_t *msg,
		    tp_name_t const *tpn,
		    msg_iovec_t iov[],
		    size_t iovused,
		    struct sigcomp_compartment *cc)
{
  ssize_t n;
  su_addrinfo_t *ai = msg_addrinfo(msg);

  if (cc) {
    n = tport_send_comp(self, msg, iov, iovused, cc, self->tp_comp);
  }
  else {
    ai->ai_flags &= ~TP_AI_COMPRESSED;
    n = self->tp_pri->pri_vtable->vtp_send(self, msg, iov, iovused);
  }

  if (n == 0)
    return 0;

  if (n == -1)
    return tport_send_error(self, msg, tpn, "tport_vsend");

  tport_sent_bytes(self, n, n);	/* Sigcomp will decrease on_line accodingly */

  if (n > 0 && self->tp_master->mr_dump_file)
    tport_dump_iovec(self, msg, n, iov, iovused, "sent", "to");
    
  if (n > 0 && self->tp_master->mr_capt_sock)
      tport_capt_msg(self, msg, n, iov, iovused, "sent");
              

  if (tport_log->log_level >= 7) {
    size_t i, m = 0;

    for (i = 0; i < iovused; i++)
      m += iov[i].mv_len;

    if (tpn == NULL || tport_is_connection_oriented(self))
      tpn = self->tp_name;

    SU_DEBUG_7(("%s(%p): "MOD_ZU" bytes of "MOD_ZU" to %s/%s:%s%s\n",
		"tport_vsend", (void *)self, n, m,
		self->tp_name->tpn_proto, tpn->tpn_host, tpn->tpn_port,
		(ai->ai_flags & TP_AI_COMPRESSED) ? ";comp=sigcomp" : ""));
  }

  return n;
}

static
int tport_send_error(tport_t *self, msg_t *msg, tp_name_t const *tpn,
		     char const *who)
{
  int error = su_errno();

  if (error == EPIPE) {
    /*Xyzzy*/
  }

  if (su_is_blocking(error)) {
    su_addrinfo_t *ai = msg_addrinfo(msg);
    char const *comp = (ai->ai_flags & TP_AI_COMPRESSED) ? ";comp=sigcomp" : "";
    SU_DEBUG_5(("%s(%p): %s with (s=%d %s/%s:%s%s)\n",
		who, (void *)self, "EAGAIN", (int)self->tp_socket,
		tpn->tpn_proto, tpn->tpn_host, tpn->tpn_port, comp));
    return 0;
  }

  msg_set_errno(msg, error);

  return tport_send_fatal(self, msg, tpn, who);
}

static
int tport_send_fatal(tport_t *self, msg_t *msg, tp_name_t const *tpn,
		     char const *who)
{
  su_addrinfo_t *ai = msg_addrinfo(msg);
  char const *comp = (ai->ai_flags & TP_AI_COMPRESSED) ? ";comp=sigcomp" : "";

  int error = msg_errno(msg);

  if (self->tp_addrinfo->ai_family == AF_INET) {
    SU_DEBUG_3(("%s(%p): %s with (s=%d %s/%s:%s%s)\n",
		who, (void *)self, su_strerror(error), (int)self->tp_socket,
		tpn->tpn_proto, tpn->tpn_host, tpn->tpn_port, comp));
  }
#if SU_HAVE_IN6
  else if (self->tp_addrinfo->ai_family == AF_INET6) {
    su_sockaddr_t const *su = (su_sockaddr_t const *)ai->ai_addr;
    SU_DEBUG_3(("%s(%p): %s with (s=%d, IP6=%s/%s:%s%s"
		" (scope=%i) addrlen=%u)\n",
		who, (void *)self, su_strerror(error), (int)self->tp_socket,
		tpn->tpn_proto, tpn->tpn_host, tpn->tpn_port, comp,
		su->su_scope_id, (unsigned)ai->ai_addrlen));
  }
#endif
  else {
    SU_DEBUG_3(("%s(%p): %s with (s=%d, AF=%u addrlen=%u)%s\n",
		who, (void *)self, su_strerror(error),
		(int)self->tp_socket, ai->ai_family, (unsigned)ai->ai_addrlen, comp));
  }

#if 0
  int i;
  for (i = 0; i < iovused; i++)
    SU_DEBUG_7(("\t\tiov[%d] = { %d bytes @ %p }\n",
		i, iov[i].siv_len, (void *)iov[i].siv_base));
#endif

  if (tport_is_connection_oriented(self)) {
    tport_error_report(self, error, NULL);
    if (tport_has_connection(self))
      tport_close(self);
  }

  return -1;
}


static
int tport_queue_rest(tport_t *self,
		     msg_t *msg,
		     msg_iovec_t iov[],
		     size_t iovused)
{
  size_t iovlen = self->tp_iovlen;

  assert(tport_is_connection_oriented(self));
  assert(self->tp_queue == NULL ||
	 self->tp_queue[self->tp_qhead] == NULL ||
	 self->tp_queue[self->tp_qhead] == msg);

  if (tport_queue(self, msg) < 0)
    return -1;

  assert(self->tp_queue[self->tp_qhead] == msg);

  if (self->tp_iov == NULL) {
    if (iovlen < 40) iovlen = 40;
    if (iovlen < iovused) iovlen = iovused;
    self->tp_iov = su_alloc(self->tp_home, iovlen * sizeof(iov[0]));
    self->tp_iovlen = iovlen;

    if (!self->tp_iov) {
      msg_set_errno(msg, errno);
      return -1;
    }

    memcpy(self->tp_iov, iov, iovused * sizeof(iov[0]));

    iov = self->tp_iov;
  }

  self->tp_unsent = iov;
  self->tp_unsentlen = iovused;

  /* the POLLOUT event is far too unreliable with SCTP */
  if (self->tp_addrinfo->ai_protocol == IPPROTO_SCTP)
    return 0;

  /* Ask for a send event */
  tport_set_events(self, SU_WAIT_OUT, 0);

  return 0;
}

/** Queue a message to transport.
 *
 * The tport_tqueue() function queues a message in the send queue. It is
 * used by an (server) application that is required to send (response)
 * messages in certain order. For example, a HTTP server or proxy may
 * receive multiple requests from a single TCP connection. The server is
 * required to answer to the requests in same order as they are received.
 * The responses are, however, sometimes generated asynchronously, that is,
 * a response to a later request may be ready earlier. For that purpose, the
 * HTTP protocol stack queues an empty response message immediately upon
 * receiving a request. Other messages cannot be sent before the queued one.
 *
 * The function tport_tqsend() is used to send the completed response message.
 *
 * @param self pointer to transport object
 * @param msg  message to be inserted into queue
 * @param tag,value,... tagged argument list
 *
 * @TAGS
 * @par Currently none.
 *
 * @retval 0 when successful
 * @retval -1 upon an error

 * @ERRORS
 * @ERROR EINVAL  Invalid argument(s).
 * @ERROR ENOMEM  Memory was exhausted.
 * @ERROR ENOBUFS The transport object queue was full.
 *
 * @deprecated Alternative interface will be provided in near future.
 *
 * @sa tport_tqsend()
 */
int tport_tqueue(tport_t *self, msg_t *msg,
		 tag_type_t tag, tag_value_t value, ...)
{
  msg_unprepare(msg);

  return tport_queue(self, msg);
}

/** Return number of queued messages. */
isize_t tport_queuelen(tport_t const *self)
{
  isize_t retval = 0;

  if (self && self->tp_queue) {
    unsigned short i, N = self->tp_params->tpp_qsize;

    for (i = self->tp_qhead; self->tp_queue[i] && retval < N; i = (i + 1) % N)
      retval++;
  }

  return retval;
}

static
int tport_queue(tport_t *self, msg_t *msg)
{
  unsigned short qhead = self->tp_qhead;
  unsigned short N = self->tp_params->tpp_qsize;

  SU_DEBUG_7(("tport_queue(%p): queueing %p for %s/%s:%s\n",
	      (void *)self, (void *)msg,
	      self->tp_protoname, self->tp_host, self->tp_port));

  if (self->tp_queue == NULL) {
    assert(N > 0);
    assert(qhead == 0);
    self->tp_queue = su_zalloc(self->tp_home, N * sizeof(msg));
    if (!self->tp_queue) {
      msg_set_errno(msg, errno);
      return -1;
    }
  }

  if (self->tp_queue[qhead] == msg)
    return 0;

  while (self->tp_queue[qhead]) {
    qhead = (qhead + 1) % N;
    if (qhead == self->tp_qhead) {
      msg_set_errno(msg, ENOBUFS);
      return -1;
    }
  }

  self->tp_queue[qhead] = msg_ref_create(msg);

  return 0;
}

/** Send a queued message (and queue another, if required).
 *
 * The function tport_tqsend() sends a message to the transport.
 *
 * @deprecated Alternative interface will be provided in near future.
 */
int tport_tqsend(tport_t *self, msg_t *msg, msg_t *next,
		 tag_type_t tag, tag_value_t value, ...)
{
  unsigned short qhead;
  ta_list ta;
  int reuse, sdwn_after, close_after;
  unsigned short N;
  su_addrinfo_t *ai;

  if (self == NULL)
    return -1;

  qhead = self->tp_qhead;
  N = self->tp_params->tpp_qsize;
  reuse = self->tp_reusable;
  sdwn_after = 0;
  close_after = 0;

  ta_start(ta, tag, value);

  tl_gets(ta_args(ta),
	  TPTAG_REUSE_REF(reuse),
	  TPTAG_SDWN_AFTER_REF(sdwn_after),
	  TPTAG_CLOSE_AFTER_REF(close_after),
	  TAG_END());

  ta_end(ta);

  /* If "next", make sure we can queue it */
  if (next && self->tp_queue[qhead == 0 ? N - 1 : qhead - 1]) {
    msg_set_errno(next, ENOBUFS);
    return -1;
  }

  /* Prepare message for sending - i.e., encode it */
  if (msg_prepare(msg) < 0) {
    msg_set_errno(msg, errno);
    return -1;
  }

  tport_peer_address(self, msg);  /* Set addrinfo */
  if (next == NULL) {
    ai = msg_addrinfo(msg);

    if (sdwn_after)
      ai->ai_flags |= TP_AI_SHUTDOWN;
    if (close_after)
      ai->ai_flags |= TP_AI_CLOSE;

    if (self->tp_queue[qhead] == msg) {
      tport_send_queue(self);
      tport_set_secondary_timer(self);
    }
    return 0;
  }

  ai = msg_addrinfo(next);

  if (sdwn_after)
    ai->ai_flags |= TP_AI_SHUTDOWN;
  if (close_after)
    ai->ai_flags |= TP_AI_CLOSE;

  if (self->tp_queue[qhead] == msg) {
    /* XXX - what about errors? */
    tport_send_msg(self, msg, self->tp_name, NULL);
    tport_set_secondary_timer(self);
    if (!self->tp_unsent) {
      msg_destroy(self->tp_queue[qhead]);
      if ((self->tp_queue[qhead] = msg_ref_create(next)))
	msg_unprepare(next);
      return 0;
    }
  }

  while (self->tp_queue[qhead] && self->tp_queue[qhead] != msg) {
    qhead = (qhead + 1) % N;
    if (qhead == self->tp_qhead)
      break;
  }

  if (self->tp_queue[qhead] != msg) {
    msg_set_errno(next, EINVAL);
    return -1;
  }

  msg = msg_ref_create(next);

  do {
    qhead = (qhead + 1) % N;
    next = self->tp_queue[qhead]; self->tp_queue[qhead] = msg; msg = next;
    /* Above we made sure that there is an empty slot */
    assert(!next || qhead != self->tp_qhead);
  } while (next);

  return 0;
}

/** Send event.
 *
 * Process SU_WAIT_OUT event.
 */
void tport_send_event(tport_t *self)
{
  assert(tport_is_connection_oriented(self));

  SU_DEBUG_7(("tport_send_event(%p) - ready to send to (%s/%s:%s)\n",
	      (void *)self, self->tp_protoname, self->tp_host, self->tp_port));
  tport_send_queue(self);
  tport_set_secondary_timer(self);
}

/** Send queued messages */
void tport_send_queue(tport_t *self)
{
  msg_t *msg;
  msg_iovec_t *iov;
  size_t i, iovused, n, total;
  unsigned short qhead = self->tp_qhead, N = self->tp_params->tpp_qsize;

  assert(self->tp_queue && self->tp_queue[qhead]);

  msg = self->tp_queue[qhead];

  iov = self->tp_unsent, self->tp_unsent = NULL;
  iovused = self->tp_unsentlen, self->tp_unsentlen = 0;

  if (iov && iovused) {
    ssize_t e;

    self->tp_stime = self->tp_ktime = su_now();

    e = tport_vsend(self, msg, self->tp_name, iov, iovused, NULL);

    if (e == -1)				/* XXX */
      return;

    n = (size_t)e;

    if (n > 0 && self->tp_master->mr_log && self->tp_slogged != msg) {
      tport_log_msg(self, msg, "send", "to", self->tp_stime);
      self->tp_slogged = msg;
    }

    for (i = 0, total = 0; i < iovused; i++) {
      if (total + (size_t)iov[i].mv_len > n) {
	iov[i].mv_len -= (su_ioveclen_t)(n - total);
	iov[i].mv_base = (char *)iov[i].mv_base + (n - total);

	self->tp_unsent = iov + i;
	self->tp_unsentlen = iovused - i;

	return;
      }
      total += iov[i].mv_len;
    }
    assert(total == n);

    /* We have sent a complete message */

    self->tp_queue[qhead] = NULL;
    tport_sent_message(self, msg, 0);
    msg_destroy(msg);

    qhead = (qhead + 1) % N;
  }

  while (msg_is_prepared(msg = self->tp_queue[self->tp_qhead = qhead])) {
    /* XXX - what about errors? */
    tport_send_msg(self, msg, self->tp_name, NULL);
    if (self->tp_unsent)
      return;

    msg = self->tp_queue[qhead]; /* tport_send_msg() may flush queue! */
    self->tp_queue[qhead] = NULL;
    msg_destroy(msg);
    qhead = (qhead + 1) % N;
  }

  /* No more send event(s)? */
  tport_set_events(self, 0, SU_WAIT_OUT);
}

static int msg_select_addrinfo(msg_t *msg, su_addrinfo_t *res);

static int
tport_resolve(tport_t *self, msg_t *msg, tp_name_t const *tpn)
{
  int error;
  char ipaddr[TPORT_HOSTPORTSIZE];
  su_addrinfo_t *res, hints[1] = {{ 0 }};
  char const *host;
  su_sockaddr_t *su;

  hints->ai_socktype = self->tp_addrinfo->ai_socktype;
  hints->ai_protocol = self->tp_addrinfo->ai_protocol;

  if (host_is_ip6_reference(tpn->tpn_host)) {
    /* Remove [] around IPv6 address */
    size_t len = strlen(tpn->tpn_host);
    assert(len < sizeof ipaddr);
    host = memcpy(ipaddr, tpn->tpn_host + 1, len - 2);
    ipaddr[len - 2] = '\0';
    hints->ai_flags |= AI_NUMERICHOST;
  }
  else {
#if HAVE_OPEN_C
    if (host_is_ip_address(tpn->tpn_host))
      hints->ai_flags |= AI_NUMERICHOST;
#endif
    host = tpn->tpn_host;
  }

  if ((error = su_getaddrinfo(host, tpn->tpn_port, hints, &res))) {
    SU_DEBUG_3(("tport_resolve: getaddrinfo(\"%s\":%s): %s\n",
		tpn->tpn_host, tpn->tpn_port,
		su_gai_strerror(error)));
    msg_set_errno(msg, ENXIO);
    return -1;
  }

  error = msg_select_addrinfo(msg, res);

  su = (su_sockaddr_t *) msg_addrinfo(msg)->ai_addr;

#if SU_HAVE_IN6
  SU_DEBUG_9(("tport_resolve addrinfo = %s%s%s:%d\n",
	      su->su_family == AF_INET6 ? "[" : "",
              su_inet_ntop(su->su_family, SU_ADDR(su), ipaddr, sizeof(ipaddr)),
	      su->su_family == AF_INET6 ? "]" : "",
              htons(su->su_port)));
#else
  SU_DEBUG_9(("tport_resolve addrinfo = %s%s%s:%d\n",
	      "",
              su_inet_ntop(su->su_family, SU_ADDR(su), ipaddr, sizeof(ipaddr)),
	      "",
              htons(su->su_port)));
#endif

  su_freeaddrinfo(res);

  return error;
}

static int
msg_select_addrinfo(msg_t *msg, su_addrinfo_t *res)
{
  su_addrinfo_t *ai, *mai = msg_addrinfo(msg);
  su_sockaddr_t *su = (su_sockaddr_t *)mai->ai_addr;

  for (ai = res; ai; ai = ai->ai_next) {
#if SU_HAVE_IN6
    if (ai->ai_family != AF_INET && ai->ai_family != AF_INET6)
      continue;
#else
    if (ai->ai_family != AF_INET)
      continue;
#endif

    if (ai->ai_protocol == 0)
      continue;
    if (ai->ai_addrlen > sizeof(su_sockaddr_t))
      continue;

    mai->ai_family = ai->ai_family;
    mai->ai_socktype = ai->ai_socktype;
    mai->ai_protocol = ai->ai_protocol;

    if (ai->ai_addrlen < sizeof(su_sockaddr_t))
      memset(su, 0, sizeof(su_sockaddr_t));
    memcpy(su, ai->ai_addr, ai->ai_addrlen);
    if (su_sockaddr_size(su))
      mai->ai_addrlen = su_sockaddr_size(su);
    else
      mai->ai_addrlen = ai->ai_addrlen;
    return 0;
  }

  msg_set_errno(msg, EAFNOSUPPORT);

  return -1;
}

/** Copy peer address to msg */
void
tport_peer_address(tport_t *self, msg_t *msg)
{
  su_addrinfo_t *mai = msg_addrinfo(msg);
  su_addrinfo_t const *tai = self->tp_addrinfo;
  void *maddr = mai->ai_addr;
  int flags = mai->ai_flags;

  memcpy(mai, tai, sizeof *mai);
  mai->ai_addr = memcpy(maddr, tai->ai_addr, tai->ai_addrlen);
  mai->ai_flags = flags;
}

/** Process error event.
 *
 * Return events that can be processed afterwards.
 */
int tport_error_event(tport_t *self)
{
  int errcode;
  su_sockaddr_t name[1] = {{ 0 }};

  name->su_family = AF_UNSPEC; /* 0 */

  if (tport_is_udp(self)) {
    errcode = tport_udp_error(self, name);
  }
  else {
    /* Process error event for basic transport. */
    errcode = su_soerror(self->tp_socket);
  }

  if (errcode == 0 || errcode == EPIPE)
    return errcode;

  tport_error_report(self, errcode, name);

  return 0;
}

/** Mark message as waiting for a response.
 *
 * @return Positive integer, or -1 upon an error.
 */
int tport_pend(tport_t *self,
	       msg_t *msg,
	       tport_pending_error_f *callback,
	       tp_client_t *client)
{
  tport_pending_t *pending;

  if (self == NULL || callback == NULL)
    return -1;

  if (msg == NULL && tport_is_primary(self))
    return -1;

  SU_DEBUG_7(("tport_pend(%p): pending %p for %s/%s:%s (already %u)\n",
	      (void *)self, (void *)msg,
	      self->tp_protoname, self->tp_host, self->tp_port,
	      self->tp_pused));

  if (self->tp_released == NULL) {
    unsigned i, len = 8;
    if (self->tp_plen)
      len = 2 * self->tp_plen;
    pending = su_realloc(self->tp_home,
			 self->tp_pending, len * sizeof(*pending));
    if (!pending) {
      msg_set_errno(msg, errno);
      return -1;
    }

    memset(pending + self->tp_plen, 0, (len - self->tp_plen) * sizeof(*pending));

    for (i = self->tp_plen; i + 1 < len; i++)
      pending[i].p_client = pending + i + 1;

    self->tp_released = pending + self->tp_plen;
    self->tp_pending = pending;
    self->tp_plen = len;
  }

  pending = self->tp_released;
  self->tp_released = pending->p_client;

  pending->p_callback = callback;
  pending->p_client = client;
  pending->p_msg = msg;
  pending->p_reported = self->tp_reported;

  self->tp_pused++;

  return (pending - self->tp_pending) + 1;
}

/** Mark message as no more pending */
int tport_release(tport_t *self,
		  int pendd,
		  msg_t *msg,
		  msg_t *reply,
		  tp_client_t *client,
		  int still_pending)
{
  tport_pending_t *pending;

  if (self == NULL || pendd <= 0 || pendd > (int)self->tp_plen)
    return su_seterrno(EINVAL), -1;

  pending = self->tp_pending + (pendd - 1);

  if (pending->p_client != client ||
      pending->p_msg != msg) {
	  SU_DEBUG_1(("%s(%p): %u %p by %p not pending\n",
		      __func__, (void *)self,
		      pendd, (void *)msg, (void *)client));
    return su_seterrno(EINVAL), -1;
  }

  SU_DEBUG_7(("%s(%p): %p by %p with %p%s\n",
	      __func__, (void *)self,
	      (void *)msg, (void *)client, (void *)reply,
	      still_pending ? " (preliminary)" : ""));

  /* sigcomp can here associate request (msg) with response (reply) */

  if (still_pending)
    return 0;

  /* Just to make sure nobody uses stale data */
  memset(pending, 0, sizeof(*pending));
  pending->p_client = self->tp_released;
  self->tp_released = pending;
  self->tp_pused--;
  return 0;
}

/** Report error to pending messages with destination */
int
tport_pending_error(tport_t *self, su_sockaddr_t const *dst, int error)
{
  unsigned i, reported, callbacks;
  tport_pending_t *pending;
  msg_t *msg;
  su_addrinfo_t const *ai;

  assert(self);

  callbacks = 0;
  reported = ++self->tp_reported;

  if (self->tp_pused == 0)
    return 0;

  for (i = 0; i < self->tp_plen; i++) {
    pending = self->tp_pending + i;

    if (!pending->p_callback)
      continue;

    if (pending->p_reported == reported)
      continue;

    msg = pending->p_msg;

    if (dst && msg) {
      ai = msg_addrinfo(msg);

      if (su_cmp_sockaddr(dst, (su_sockaddr_t *)ai->ai_addr) != 0)
	continue;
    }

    msg_set_errno(msg, error);

    pending->p_reported = reported;

    pending->p_callback(self->TP_STACK, pending->p_client, self, msg, error);

    callbacks++;
  }

  return callbacks;
}


/** Report error via pending message */
int
tport_pending_errmsg(tport_t *self, msg_t *msg, int error)
{
  unsigned i, reported, callbacks;
  tport_pending_t *pending;

  assert(self); assert(msg);

  callbacks = 0;
  reported = ++self->tp_reported;

  msg_set_errno(msg, error);

  if (self->tp_pused == 0)
    return 0;

  for (i = 0; i < self->tp_plen; i++) {
    pending = self->tp_pending + i;

    if (!pending->p_client ||
	pending->p_msg != msg ||
	pending->p_reported == reported)
      continue;

    pending->p_reported = reported;

    pending->p_callback(self->TP_STACK, pending->p_client, self, msg, error);

    callbacks++;
  }

  return callbacks;
}


/** Set transport magic. */
void tport_set_magic(tport_t *self, tp_magic_t *magic)
{
  self->tp_magic = magic;
}

/** Get transport magic. */
tp_magic_t *tport_magic(tport_t const *self)
{
  return self ? self->tp_magic : NULL;
}

/** Get primary transport (or self, if primary) */
tport_t *tport_parent(tport_t const *self)
{
  return self ? self->tp_pri->pri_primary : NULL;
}

/** Get list of primary transports */
tport_t *tport_primaries(tport_t const *self)
{
  if (self)
    return self->tp_master->mr_primaries->pri_primary;
  else
    return NULL;
}

/** Get next transport */
tport_t *tport_next(tport_t const *self)
{
  if (self == NULL)
    return NULL;
  else if (tport_is_master(self))
    return ((tport_master_t *)self)->mr_primaries->pri_primary;

  else if (tport_is_primary(self))
    return ((tport_primary_t *)self)->pri_next->pri_primary;
  else
    return tprb_succ(self);
}

/** Get secondary transports. */
tport_t *tport_secondary(tport_t const *self)
{
  if (tport_is_primary(self))
    return self->tp_pri->pri_open;
  else
    return NULL;
}

#if 0
void tport_hints(tport_t const *self, su_addrinfo_t *hints)
{
  hints->ai_protocol = self->tp_addrinfo->ai_protocol;
  hints->ai_socktype = self->tp_addrinfo->ai_socktype;
}
#endif

/** Get transport address list. */
su_addrinfo_t const *tport_get_address(tport_t const *self)
{
  return self ? self->tp_addrinfo : NULL;
}

/** Get transport name. */
tp_name_t const *tport_name(tport_t const *self)
{
  return self->tp_name;
}

/** Get transport identifier. */
char const *tport_ident(tport_t const *self)
{
  return self ? self->tp_ident : NULL;
}

/** Get transport by protocol name. */
tport_t *tport_by_protocol(tport_t const *self, char const *proto)
{
  if (proto && strcmp(proto, tpn_any) != 0) {
    for (; self; self = tport_next(self))
      if (su_casematch(proto, self->tp_protoname))
	break;
  }

  return (tport_t *)self;
}

/** Get transport by protocol name. */
tport_t *tport_primary_by_name(tport_t const *tp, tp_name_t const *tpn)
{
  char const *ident = tpn->tpn_ident;
  char const *proto = tpn->tpn_proto;
  char const *comp = tpn->tpn_comp;
  int family = 0;

  tport_primary_t const *self, *nocomp = NULL;

  self = tp ? tp->tp_master->mr_primaries : NULL;

  if (ident && strcmp(ident, tpn_any) == 0)
    ident = NULL;

  if (tpn->tpn_host == NULL)
    family = 0;
#if SU_HAVE_IN6
  else if (host_is_ip6_address(tpn->tpn_host))
    family = AF_INET6;
#endif
  else if (host_is_ip4_address(tpn->tpn_host))
    family = AF_INET;
  else
    family = 0;

  if (proto && strcmp(proto, tpn_any) == 0)
    proto = NULL;

  if (!ident && !proto && !family && !comp)
    return (tport_t *)self;		/* Anything goes */

  comp = tport_canonize_comp(comp);

  for (; self; self = self->pri_next) {
    tp = self->pri_primary;

    if (ident && strcmp(ident, tp->tp_ident))
      continue;
    if (family) {
      if (family == AF_INET && !tport_has_ip4(tp))
	continue;
#if SU_HAVE_IN6
      if (family == AF_INET6 && !tport_has_ip6(tp))
	continue;
#endif
    }
    if (proto && !su_casematch(proto, tp->tp_protoname))
      continue;

    if (comp && comp != tp->tp_name->tpn_comp) {
      if (tp->tp_name->tpn_comp == NULL && nocomp == NULL)
	nocomp = self;
      continue;
    }

    break;
  }

  if (self)
    return (tport_t *)self;
  else
    return (tport_t *)nocomp;
}


/** Get transport by name. */
tport_t *tport_by_name(tport_t const *self, tp_name_t const *tpn)
{
  tport_t const *sub, *next;
  char const *canon, *host, *port, *comp;
#if SU_HAVE_IN6
  char *end, ipaddr[TPORT_HOSTPORTSIZE];
#endif

  assert(self); assert(tpn);

  assert(tpn->tpn_proto); assert(tpn->tpn_host); assert(tpn->tpn_port);
  assert(tpn->tpn_canon);

  if (!tport_is_primary(self))
    self = tport_primary_by_name(self, tpn);

  host = strcmp(tpn->tpn_host, tpn_any) ? tpn->tpn_host : NULL;
  port = strcmp(tpn->tpn_port, tpn_any) ? tpn->tpn_port : NULL;
  canon = tpn->tpn_canon;
  comp = tport_canonize_comp(tpn->tpn_comp);

  if (self && host && port) {
    int resolved = 0, cmp;
    socklen_t sulen;
    su_sockaddr_t su[1];

    sub = self->tp_pri->pri_open;

    memset(su, 0, sizeof su);

#if SU_HAVE_IN6
    if (host_is_ip6_reference(host)) {
      /* Remove [] around IPv6 address */
      host = strncpy(ipaddr, host +  1, sizeof(ipaddr) - 1);
      ipaddr[sizeof(ipaddr) - 1] = '\0';
      if ((end = strchr(host, ']')))
	*end = 0;
      su->su_len = sulen = (socklen_t) sizeof (struct sockaddr_in6);
      su->su_family = AF_INET6;
    }
    else if (host_is_ip6_address(host)) {
      su->su_len = sulen = (socklen_t) sizeof (struct sockaddr_in6);
      su->su_family = AF_INET6;
    }
    else
#endif
    {
      su->su_len = sulen = (socklen_t) sizeof (struct sockaddr_in);
      su->su_family = AF_INET;
    }

    su->su_port = htons(strtoul(port, NULL, 10));

    if (su_inet_pton(su->su_family, host, SU_ADDR(su)) > 0) {
      resolved = 1;
      next = NULL;

      /* Depth-first search */
      while (sub) {
	cmp = (int)((size_t)sub->tp_addrlen - (size_t)sulen);

	if (cmp == 0)
	  cmp = memcmp(sub->tp_addr, su, sulen);

	if (cmp == 0) {
	  if (sub->tp_left) {
	    next = sub;
	    sub = sub->tp_left;
	    continue;
	  }
	  break;
	}
	else if (next) {
	  sub = next;
	  break;
	}
	else if (cmp > 0) {
	  sub = sub->tp_left;
	  continue;
	}
	else /* if (cmp < 0) */ {
	  sub = sub->tp_right;
	  continue;
	}
      }
    }
    else {
      SU_DEBUG_7(("tport(%p): EXPENSIVE unresolved " TPN_FORMAT "\n",
		  (void *)self, TPN_ARGS(tpn)));

      sub = tprb_first(sub);
    }

    for (; sub; sub = tprb_succ(sub)) {
      if (!sub->tp_reusable)
	continue;
      if (!tport_is_registered(sub))
	continue;
      if (tport_is_shutdown(sub))
	continue;

      if (comp != sub->tp_name->tpn_comp)
	continue;

      if (resolved) {
	if ((socklen_t)sub->tp_addrlen != sulen ||
	    memcmp(sub->tp_addr, su, sulen)) {
	  SU_DEBUG_7(("tport(%p): not found by name " TPN_FORMAT "\n",
		      (void *)self, TPN_ARGS(tpn)));
	  break;
	}
	SU_DEBUG_7(("tport(%p): found %p by name " TPN_FORMAT "\n",
		    (void *)self, (void *)sub, TPN_ARGS(tpn)));
      }
      else if (!su_casematch(port, sub->tp_port))
	continue;
      else if (!su_casematch(canon, sub->tp_canon) &&
	       !su_casematch(host, sub->tp_host))
	continue;

      return (tport_t *)sub;
    }
  }

  return (tport_t *)self;
}

/** Get transport from primary by addrinfo. */
tport_t *tport_by_addrinfo(tport_primary_t const *pri,
			   su_addrinfo_t const *ai,
			   tp_name_t const *tpn)
{
  tport_t const *sub, *maybe;
  struct sockaddr const *sa;
  int cmp;
  char const *comp;

  assert(pri); assert(ai);

  sa = ai->ai_addr;

  sub = pri->pri_open, maybe = NULL;

  comp = tport_canonize_comp(tpn->tpn_comp);

  /* Find leftmost (prevmost) matching tport */
  while (sub) {
    cmp = (int)(sub->tp_addrlen - ai->ai_addrlen);
    if (cmp == 0)
      cmp = memcmp(sub->tp_addr, sa, ai->ai_addrlen);

    if (cmp == 0) {
      if (sub->tp_left) {
	maybe = sub;
	sub = sub->tp_left;
	continue;
      }
      break;
    }
    else if (maybe) {
      sub = maybe;
      break;
    }
    else if (cmp > 0) {
      sub = sub->tp_left;
      continue;
    }
    else /* if (cmp < 0) */ {
      sub = sub->tp_right;
      continue;
    }
  }

  for (; sub; sub = tprb_succ(sub)) {
    if (!sub->tp_reusable)
      continue;
    if (!tport_is_registered(sub))
      continue;
    if (tport_is_shutdown(sub))
      continue;

    if (tport_has_tls(sub) && !su_casematch(tpn->tpn_canon, sub->tp_name->tpn_canon)) {
      if (!tport_is_verified(sub))
        continue;
      if (!tport_subject_search(tpn->tpn_canon, sub->tp_subjects))
        continue;
    }

    if (comp != sub->tp_name->tpn_comp)
      continue;

    if (sub->tp_addrlen != ai->ai_addrlen
	|| memcmp(sub->tp_addr, sa, ai->ai_addrlen)) {
      sub = NULL;
      break;
    }
    break;
  }

  if (sub)
    SU_DEBUG_7(("%s(%p): found %p by name " TPN_FORMAT "\n",
		__func__, (void *)pri, (void *)sub, TPN_ARGS(tpn)));
  else
    SU_DEBUG_7(("%s(%p): not found by name " TPN_FORMAT "\n",
		__func__, (void *)pri, TPN_ARGS(tpn)));

  return (tport_t *)sub;
}


/** Get transport name from URL. */
int tport_name_by_url(su_home_t *home,
		      tp_name_t *tpn,
		      url_string_t const *us)
{
  size_t n;
  url_t url[1];
  char *b;

  n = url_xtra(us->us_url);
  b = su_alloc(home, n);

  if (b == NULL || url_dup(b, n, url, us->us_url) < 0) {
    su_free(home, b);
    return -1;
  }

  tpn->tpn_proto = url_tport_default((enum url_type_e)url->url_type);
  tpn->tpn_canon = url->url_host;
  tpn->tpn_host = url->url_host;
  tpn->tpn_port = url_port(url);

  if (tpn->tpn_host == NULL || tpn->tpn_host[0] == '\0' ||
      tpn->tpn_port == NULL || tpn->tpn_port[0] == '\0') {
    su_free(home, b);
    return -1;
  }

  if (url->url_params) {
    for (b = (char *)url->url_params; b[0]; b += n) {
      n = strcspn(b, ";");

      if (n > 10 && su_casenmatch(b, "transport=", 10))
	tpn->tpn_proto = b + 10;
      else if (n > 6 && su_casenmatch(b, "maddr=", 6))
	tpn->tpn_host = b + 6;

      if (b[n])
	b[n++] = '\0';
    }
  }

  return 0;
}

/** Check if transport named is already resolved */
int tport_name_is_resolved(tp_name_t const *tpn)
{
  if (!tpn->tpn_host)
    return 0;

  return host_is_ip_address(tpn->tpn_host);
}

/** Duplicate name.
 *
 * The tport_name_dup() function copies strings belonging to the transport
 * name. It returns the copied strings via the @a dst transport name
 * structure. The memory block required for copies is allocated from the
 * memory @a home. Please note that only one memory block is allocated, so
 * the memory can be reclainmed only by deinitializing the memory home
 * itself.
 *
 * @retval 0 when successful
 * @retval -1 upon an error
 */
int tport_name_dup(su_home_t *home,
		   tp_name_t *dst,
		   tp_name_t const *src)
{
  size_t n_proto, n_host, n_port, n_canon, n_comp = 0;
  char *s;

  if (!src->tpn_proto || !src->tpn_host || !src->tpn_port || !src->tpn_canon)
    return -1;

  if (strcmp(src->tpn_proto, tpn_any))
    n_proto = strlen(src->tpn_proto) + 1;
  else
    n_proto = 0;

  n_host = strlen(src->tpn_host) + 1;

  n_port = strlen(src->tpn_port) + 1;

  if (src->tpn_comp != NULL)
    n_comp = strlen(src->tpn_comp) + 1;

  if (src->tpn_canon != src->tpn_host &&
      strcmp(src->tpn_canon, src->tpn_host))
    n_canon = strlen(src->tpn_canon) + 1;
  else
    n_canon = 0;

  s = su_alloc(home, n_proto + n_canon + n_host + n_port + n_comp);
  if (s == NULL)
    return -1;

  if (n_proto)
    dst->tpn_proto = memcpy(s, src->tpn_proto, n_proto), s += n_proto;
  else
    dst->tpn_proto = tpn_any;

  dst->tpn_host = memcpy(s, src->tpn_host, n_host), s += n_host;
  dst->tpn_port = memcpy(s, src->tpn_port, n_port), s += n_port;

  if (n_canon)
    dst->tpn_canon = memcpy(s, src->tpn_canon, n_canon), s += n_canon;
  else
    dst->tpn_canon = dst->tpn_host;

  if (n_comp)
    dst->tpn_comp = memcpy(s, src->tpn_comp, n_comp), s += n_comp;
  else
    dst->tpn_comp = NULL;

  return 0;
}

/** Convert a sockaddr structure into printable form. */
char *tport_hostport(char buf[], isize_t bufsize,
		     su_sockaddr_t const *su,
		     int with_port_and_brackets)
{
  char *b = buf;
  size_t n;

#if SU_HAVE_IN6
  if (with_port_and_brackets > 1 || su->su_family == AF_INET6) {
    *b++ = '['; bufsize--;
  }
#endif

  if (su_inet_ntop(su->su_family, SU_ADDR(su), b, bufsize) == NULL)
    return NULL;
  n = strlen(b);
  if (bufsize < n + 2)
    return NULL;

  bufsize -= n; b += n;

#if SU_HAVE_IN6
  if (with_port_and_brackets > 1 || su->su_family == AF_INET6) {
    *b++ = ']'; bufsize--;
  }
  if (with_port_and_brackets) {
    unsigned short port = ntohs(su->su_port);
    if (port != 0) {
      n = snprintf(b, bufsize, ":%u", port);
      if (n <= 0)
        return NULL;
      b += n;
      if (bufsize > n)
        bufsize -= n;
      else
        bufsize = 0;
    }
  }
#endif

  if (bufsize)
    *b++ = 0;

  return buf;
}

/** @internal Update receive statistics. */
void tport_recv_bytes(tport_t *self, ssize_t bytes, ssize_t on_line)
{
  self->tp_stats.recv_bytes += bytes;
  self->tp_stats.recv_on_line += on_line;

  if (self != self->tp_pri->pri_primary) {
    self = self->tp_pri->pri_primary;
    self->tp_stats.recv_bytes += bytes;
    self->tp_stats.recv_on_line += on_line;
  }
  self = self->tp_master->mr_master;
  self->tp_stats.recv_bytes += bytes;
  self->tp_stats.recv_on_line += on_line;
}

/** @internal Update message-based receive statistics. */
void tport_recv_message(tport_t *self, msg_t *msg, int error)
{
  error = error != 0;

  self->tp_stats.recv_msgs++;
  self->tp_stats.recv_errors += error;

  if (self != self->tp_pri->pri_primary) {
    self = self->tp_pri->pri_primary;
    self->tp_stats.recv_msgs++;
    self->tp_stats.recv_errors += error;
  }

  self = self->tp_master->mr_master;

  self->tp_stats.recv_msgs++;
  self->tp_stats.recv_errors += error;
}

/** @internal Update send statistics. */
void tport_sent_bytes(tport_t *self, ssize_t bytes, ssize_t on_line)
{
  self->tp_stats.sent_bytes += bytes;
  self->tp_stats.sent_on_line += on_line;

  if (self != self->tp_pri->pri_primary) {
    self = self->tp_pri->pri_primary;
    self->tp_stats.sent_bytes += bytes;
    self->tp_stats.sent_on_line += on_line;
  }

  self = self->tp_master->mr_master;
  self->tp_stats.sent_bytes += bytes;
  self->tp_stats.sent_on_line += on_line;
}

/** @internal Update message-based send statistics. */
void tport_sent_message(tport_t *self, msg_t *msg, int error)
{
  self->tp_slogged = NULL;

  error = error != 0;

  self->tp_stats.sent_msgs++;
  self->tp_stats.sent_errors += error;

  if (self != self->tp_pri->pri_primary) {
    self = self->tp_pri->pri_primary;
    self->tp_stats.sent_msgs++;
    self->tp_stats.sent_errors += error;
  }

  self = self->tp_master->mr_master;

  self->tp_stats.sent_msgs++;
  self->tp_stats.sent_errors += error;

}


// $Id: common.h 880 2007-04-25 15:23:59Z jpgrayson $

/*
 * app_conference
 *
 * A channel independent conference application for Asterisk
 *
 * Copyright (C) 2002, 2003 Junghanns.NET GmbH
 * Copyright (C) 2003, 2004 HorizonLive.com, Inc.
 * Copyright (C) 2005, 2006 HorizonWimba, Inc.
 * Copyright (C) 2007 Wimba, Inc.
 *
 * Klaus-Peter Junghanns <kapejod@ns1.jnetdns.de>
 *
 * Video Conferencing support added by
 * Neil Stratford <neils@vipadia.com>
 * Copyright (C) 2005, 2005 Vipadia Limited
 *
 * VAD driven video conferencing, text message support
 * and miscellaneous enhancements added by
 * Mihai Balea <mihai at hates dot ms>
 *
 * This program may be modified and distributed under the
 * terms of the GNU General Public License. You should have received
 * a copy of the GNU General Public License along with this
 * program; if not, write to the Free Software Foundation, Inc.
 * 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 */

#ifndef _APP_CONF_COMMON_H
#define _APP_CONF_COMMON_H

#include <asterisk/time.h>

// typedef includes
#include "conf_frame.h"

// function includesee
//#include "member.h"
#include "conference.h"
#include "frame.h"
#include "cli.h"

/* Utility functions */

/* LOG the time taken to execute a function (like lock acquisition */
#if 1
#define TIMELOG(func,min,message) \
	do { \
		struct timeval t1, t2; \
		int diff; \
		t1 = ast_tvnow(); \
		func; \
		t2 = ast_tvnow(); \
		if ( (diff = ast_tvdiff_ms(t2, t1)) > min ) \
			ast_log( AST_CONF_DEBUG, "TimeLog: %s: %d ms\n", message, diff); \
	} while (0)
#else
#define TIMELOG(func,min,message) func
#endif

#define SETDATA2PTR(data,ptr) data = (typeof(data))((void*)ptr)
#define CASTDATA2PTR(data, type) (type*)(*((long *)&(data)))

const char *argument_delimiter ;

#endif

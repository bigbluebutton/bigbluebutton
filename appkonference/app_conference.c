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

#include "asterisk.h"

// SVN release number, provided by make
#ifndef RELEASE
#define RELEASE "unknown"
#endif

static char *release = RELEASE;

ASTERISK_FILE_VERSION(__FILE__, RELEASE)

#include "app_conference.h"
#include "common.h"

/*
 * a conference has n + 1 threads, where n is the number of
 * members and 1 is a conference thread which sends audio
 * back to the members.
 *
 * each member thread reads frames from the channel and
 * add's them to the member's frame queue.
 *
 * the conference thread reads frames from each speaking members
 * queue, mixes them, and then re-queues them for the member thread
 * to send back to the user.
 */

static char *app = "Konference";
static char *synopsis = "Channel Independent Conference";
static char *descrip = "Channel Independent Conference Application";

static char *app2 = "KonferenceCount";
static char *synopsis2 = "Channel Independent Conference Count";
static char *descrip2 = "Channel Independent Conference Count Application";

static int app_konference_main(struct ast_channel* chan, void* data)
{
	int res ;
	struct ast_module_user *u ;

	u = ast_module_user_add(chan);

	// call member thread function
	res = member_exec( chan, data ) ;

	ast_module_user_remove(u);

	return res ;
}

static int app_konferencecount_main(struct ast_channel* chan, void* data)
{
	int res ;
	struct ast_module_user *u ;

	u = ast_module_user_add(chan);

	// call count thread function
	res = count_exec( chan, data ) ;

	ast_module_user_remove(u);

	return res ;
}

static int unload_module( void )
{
	int res = 0;

	ast_log( LOG_NOTICE, "Unloading app_konference module\n" ) ;

	ast_module_user_hangup_all();

	unregister_conference_cli() ;

	res |= ast_unregister_application( app ) ;
	res |= ast_unregister_application( app2 ) ;

	return res ;
}

static int load_module( void )
{
	int res = 0;

	ast_log( LOG_NOTICE, "Loading app_konference module, release=%s\n", release) ;

	init_conference() ;

	register_conference_cli() ;

	res |= ast_register_application( app, app_konference_main, synopsis, descrip ) ;
	res |= ast_register_application( app2, app_konferencecount_main, synopsis2, descrip2 ) ;

	return res ;
}

// increment a timeval by ms milliseconds
void add_milliseconds(struct timeval* tv, long ms)
{
	// add the microseconds to the microseconds field
	tv->tv_usec += ( ms * 1000 ) ;

	// calculate the number of seconds to increment
	long s = ( tv->tv_usec / 1000000 ) ;

	// adjust the microsends field
	if ( s > 0 ) tv->tv_usec -= ( s * 1000000 ) ;

	// increment the seconds field
	tv->tv_sec += s ;
}

#define AST_MODULE "Konference"
AST_MODULE_INFO_STANDARD(ASTERISK_GPL_KEY,
		"Channel Independent Conference Application");
#undef AST_MODULE


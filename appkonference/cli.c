
// $Id: cli.c 884 2007-06-27 14:56:21Z sbalea $

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

#include "asterisk/autoconfig.h"
#include "cli.h"

#ifdef AST_CLI_DEFINE

#define argc a->argc
#define argv a->argv
#define fd a->fd

#define SUCCESS CLI_SUCCESS
#define SHOWUSAGE CLI_SHOWUSAGE
#define FAILURE CLI_FAILURE

#define NEWCLI_SWITCH(cli_command,cli_usage) \
switch (cmd) { \
	case CLI_INIT: \
		e->command = cli_command; \
		e->usage = cli_usage; \
		return NULL; \
	case CLI_GENERATE: \
		if (a->pos > e->args) \
			return NULL; \
		return ast_cli_complete(a->word, choices, a->n); \
	default: \
		break; \
}

#else

#define SUCCESS RESULT_SUCCESS
#define SHOWUSAGE RESULT_SHOWUSAGE
#define FAILURE RESULT_FAILURE

#endif

//
// version 
//
static char conference_version_usage[] =
	"Usage: konference version\n"
	"       Display konference version\n"
;

#define CONFERENCE_VERSION_CHOICES { "konference", "version", NULL }
static char conference_version_summary[] = "Display konference version";

#ifndef AST_CLI_DEFINE
static struct ast_cli_entry cli_version = {
	CONFERENCE_VERSION_CHOICES,
	conference_version,
	conference_version_summary,
	conference_version_usage
} ;
int conference_version( int fd, int argc, char *argv[] ) {
#else
static char conference_version_command[] = "konference version";
char *conference_version(struct ast_cli_entry *e, int cmd, struct ast_cli_args *a) {
	static char *choices[] = CONFERENCE_VERSION_CHOICES;
	NEWCLI_SWITCH(conference_version_command,conference_version_usage)
#endif
	if ( argc < 2 )
		return SHOWUSAGE ;

	ast_cli( fd, "app_konference release %s\n", RELEASE) ;

	return SUCCESS ;
}

//
// restart conference
//
static char conference_restart_usage[] =
	"Usage: konference restart\n"
	"       Kick all users in all conferences\n"
;

#define CONFERENCE_RESTART_CHOICES { "konference", "restart", NULL }
static char conference_restart_summary[] = "Restart a conference";

#ifndef AST_CLI_DEFINE
static struct ast_cli_entry cli_restart = {
	CONFERENCE_RESTART_CHOICES,
	conference_restart,
	conference_restart_summary,
	conference_restart_usage
} ;
int conference_restart( int fd, int argc, char *argv[] ) {
#else
static char conference_restart_command[] = "konference restart";
char *conference_restart(struct ast_cli_entry *e, int cmd, struct ast_cli_args *a) {
	static char *choices[] = CONFERENCE_RESTART_CHOICES;
	NEWCLI_SWITCH(conference_restart_command,conference_restart_usage)
#endif
	if ( argc < 2 )
		return SHOWUSAGE ;

	kick_all();
	return SUCCESS ;
}

//
// debug functions
//
static char conference_debug_usage[] =
	"Usage: konference debug <conference_name> [ on | off ]\n"
	"       Enable debugging for a conference\n"
;

#define CONFERENCE_DEBUG_CHOICES { "konference", "debug", NULL }
static char conference_debug_summary[] = "Enable debugging for a conference";

#ifndef AST_CLI_DEFINE
static struct ast_cli_entry cli_debug = {
	CONFERENCE_DEBUG_CHOICES,
	conference_debug,
	conference_debug_summary,
	conference_debug_usage
} ;
int conference_debug( int fd, int argc, char *argv[] ) {
#else
static char conference_debug_command[] = "konference debug";
char *conference_debug(struct ast_cli_entry *e, int cmd, struct ast_cli_args *a) {
	static char *choices[] = CONFERENCE_DEBUG_CHOICES;
	NEWCLI_SWITCH(conference_debug_command,conference_debug_usage)
#endif
	if ( argc < 3 )
		return SHOWUSAGE ;

	// get the conference name
	const char* name = argv[2] ;

   	// get the new state
	int state = 0 ;

	if ( argc == 3 )
	{
		// no state specified, so toggle it
		state = -1 ;
	}
	else
	{
		if ( strncasecmp( argv[3], "on", 4 ) == 0 )
			state = 1 ;
		else if ( strncasecmp( argv[3], "off", 3 ) == 0 )
			state = 0 ;
		else
			return SHOWUSAGE ;
	}

	int new_state = set_conference_debugging( name, state ) ;

	if ( new_state == 1 )
	{
		ast_cli( fd, "enabled conference debugging, name => %s, new_state => %d\n",
			name, new_state ) ;
	}
	else if ( new_state == 0 )
	{
		ast_cli( fd, "disabled conference debugging, name => %s, new_state => %d\n",
			name, new_state ) ;
	}
	else
	{
		// error setting state
		ast_cli( fd, "\nunable to set debugging state, name => %s\n\n", name ) ;
	}

	return SUCCESS ;
}

//
// stats functions
//
static char conference_show_stats_usage[] =
	"Usage: konference show stats\n"
	"       Display stats for active conferences\n"
;

#define CONFERENCE_SHOW_STATS_CHOICES { "konference", "show", "stats", NULL }
static char conference_show_stats_summary[] = "Show conference stats";

#ifndef AST_CLI_DEFINE
static struct ast_cli_entry cli_show_stats = {
	CONFERENCE_SHOW_STATS_CHOICES,
	conference_show_stats,
	conference_show_stats_summary,
	conference_show_stats_usage
} ;
int conference_show_stats( int fd, int argc, char *argv[] ) {
#else
static char conference_show_stats_command[] = "konference show stats";
char *conference_show_stats(struct ast_cli_entry *e, int cmd, struct ast_cli_args *a) {
	static char *choices[] = CONFERENCE_SHOW_STATS_CHOICES;
	NEWCLI_SWITCH(conference_show_stats_command,conference_show_stats_usage)
#endif
	if ( argc < 3 )
		return SHOWUSAGE ;

	// get count of active conferences
	int count = get_conference_count() ;

	ast_cli( fd, "\n\nCONFERENCE STATS, ACTIVE( %d )\n\n", count ) ;

	// if zero, go no further
	if ( count <= 0 )
		return SUCCESS ;

	//
	// get the conference stats
	//

	// array of stats structs
	ast_conference_stats stats[ count ] ;

	// get stats structs
	count = get_conference_stats( stats, count ) ;

	// make sure we were able to fetch some
	if ( count <= 0 )
	{
		ast_cli( fd, "!!! error fetching conference stats, available => %d !!!\n", count ) ;
		return SUCCESS ;
	}

	//
	// output the conference stats
	//

	// output header
	ast_cli( fd, "%-20.20s  %-40.40s\n", "Name", "Stats") ;
	ast_cli( fd, "%-20.20s  %-40.40s\n", "----", "-----") ;

	ast_conference_stats* s = NULL ;

	int i;

	for ( i = 0 ; i < count ; ++i )
	{
		s = &(stats[i]) ;

		// output this conferences stats
		ast_cli( fd, "%-20.20s\n", (char*)( &(s->name) )) ;
	}

	ast_cli( fd, "\n" ) ;

	//
	// drill down to specific stats
	//

	if ( argc == 4 )
	{
		// show stats for a particular conference
	}

	return SUCCESS ;
}

//
// list conferences
//
static char conference_list_usage[] =
	"Usage: konference list {<conference_name>}\n"
	"       List members of a conference\n"
;

#define CONFERENCE_LIST_CHOICES { "konference", "list", NULL }
static char conference_list_summary[] = "List members of a conference";

#ifndef AST_CLI_DEFINE
static struct ast_cli_entry cli_list = {
	CONFERENCE_LIST_CHOICES,
	conference_list,
	conference_list_summary,
	conference_list_usage
} ;
int conference_list( int fd, int argc, char *argv[] ) {
#else
static char conference_list_command[] = "konference list";
char *conference_list(struct ast_cli_entry *e, int cmd, struct ast_cli_args *a) {
	static char *choices[] = CONFERENCE_LIST_CHOICES;
	NEWCLI_SWITCH(conference_list_command,conference_list_usage)
#endif
	if ( argc < 2 )
		return SHOWUSAGE ;

	if (argc >= 3)
	{
		int index;
		for (index = 2; index < argc; index++)
		{
			// get the conference name
			const char* name = argv[index] ;
			show_conference_list( fd, name );
		}
	}
	else
	{
		show_conference_stats(fd);
	}
	return SUCCESS ;
}

//
// kick member <member id>
//
static char conference_kick_usage[] =
	"Usage: konference kick <conference> <member id>\n"
	"       Kick member <member id> from conference <conference>\n"
;

#define CONFERENCE_KICK_CHOICES { "konference", "kick", NULL }
static char conference_kick_summary[] = "Kick member from a conference";

#ifndef AST_CLI_DEFINE
static struct ast_cli_entry cli_kick = {
	CONFERENCE_KICK_CHOICES,
	conference_kick,
	conference_kick_summary,
	conference_kick_usage
} ;
int conference_kick( int fd, int argc, char *argv[] ) {
#else
static char conference_kick_command[] = "konference kick";
char *conference_kick(struct ast_cli_entry *e, int cmd, struct ast_cli_args *a) {
	static char *choices[] = CONFERENCE_KICK_CHOICES;
	NEWCLI_SWITCH(conference_kick_command,conference_kick_usage)
#endif
	if ( argc < 4 )
		return SHOWUSAGE ;

	// get the conference name
	const char* name = argv[2] ;

	int member_id;
	sscanf(argv[3], "%d", &member_id);

	int res = kick_member( name, member_id );

	if (res) ast_cli( fd, "User #: %d kicked\n", member_id) ;

	return SUCCESS ;
}

//
// kick member <channel>
//
static char conference_kickchannel_usage[] =
	"Usage: konference kickchannel <channel>\n"
	"       Kick channel from conference\n"
;

#define CONFERENCE_KICKCHANNEL_CHOICES { "konference", "kickchannel", NULL }
static char conference_kickchannel_summary[] = "Kick channel from conference";

#ifndef AST_CLI_DEFINE
static struct ast_cli_entry cli_kickchannel = {
	CONFERENCE_KICKCHANNEL_CHOICES,
	conference_kickchannel,
	conference_kickchannel_summary,
	conference_kickchannel_usage
} ;
int conference_kickchannel( int fd, int argc, char *argv[] ) {
#else
static char conference_kickchannel_command[] = "konference kickchannel";
char *conference_kickchannel(struct ast_cli_entry *e, int cmd, struct ast_cli_args *a) {
	static char *choices[] = CONFERENCE_KICKCHANNEL_CHOICES;
	NEWCLI_SWITCH(conference_kickchannel_command,conference_kickchannel_usage)
#endif
	if ( argc < 3 )
		return SHOWUSAGE ;

	const char *channel = argv[2];

	struct ast_conf_member *member = find_member(channel);
	if(!member) {
	    ast_cli(fd, "Member %s not found\n", channel);
	    return FAILURE;
	}

	member->kick_flag = 1;

	if ( !--member->use_count && member->delete_flag )
		ast_cond_signal ( &member->delete_var ) ;
	ast_mutex_unlock( &member->lock ) ;

	return SUCCESS ;
}

//
// mute member <member id>
//
static char conference_mute_usage[] =
	"Usage: konference mute <conference_name> <member id>\n"
	"       Mute member in a conference\n"
;

#define CONFERENCE_MUTE_CHOICES { "konference", "mute", NULL }
static char conference_mute_summary[] = "Mute member in a conference";

#ifndef AST_CLI_DEFINE
static struct ast_cli_entry cli_mute = {
	CONFERENCE_MUTE_CHOICES,
	conference_mute,
	conference_mute_summary,
	conference_mute_usage
} ;
int conference_mute( int fd, int argc, char *argv[] ) {
#else
static char conference_mute_command[] = "konference mute";
char *conference_mute(struct ast_cli_entry *e, int cmd, struct ast_cli_args *a) {
	static char *choices[] = CONFERENCE_MUTE_CHOICES;
	NEWCLI_SWITCH(conference_mute_command,conference_mute_usage)
#endif
	if ( argc < 4 )
		return SHOWUSAGE ;

	// get the conference name
	const char* name = argv[2] ;

	int member_id;
	sscanf(argv[3], "%d", &member_id);

	int res = mute_member( name, member_id );

	if (res) ast_cli( fd, "User #: %d muted\n", member_id) ;

	return SUCCESS ;
}

//
// mute conference
//
static char conference_muteconference_usage[] =
	"Usage: konference muteconference <conference_name>\n"
	"       Mute all members in a conference\n"
;

#define CONFERENCE_MUTECONFERENCE_CHOICES { "konference", "muteconference", NULL }
static char conference_muteconference_summary[] = "Mute all members in a conference";

#ifndef AST_CLI_DEFINE
static struct ast_cli_entry cli_muteconference = {
	CONFERENCE_MUTECONFERENCE_CHOICES,
	conference_muteconference,
	conference_muteconference_summary,
	conference_muteconference_usage
} ;
int conference_muteconference( int fd, int argc, char *argv[] ) {
#else
static char conference_muteconference_command[] = "konference muteconference";
char *conference_muteconference(struct ast_cli_entry *e, int cmd, struct ast_cli_args *a) {
	static char *choices[] = CONFERENCE_MUTECONFERENCE_CHOICES;
	NEWCLI_SWITCH(conference_muteconference_command,conference_muteconference_usage)
#endif
	if ( argc < 3 )
		return SHOWUSAGE ;

	// get the conference name
	const char* name = argv[2] ;

	int res = mute_conference ( name );

	if (res) ast_cli( fd, "Conference: %s muted\n", name) ;

	return SUCCESS ;
}

//
// mute member <channel>
//
static char conference_mutechannel_usage[] =
	"Usage: konference mutechannel <channel>\n"
	"       Mute channel in a conference\n"
;

#define CONFERENCE_MUTECHANNEL_CHOICES { "konference", "mutechannel", NULL }
static char conference_mutechannel_summary[] = "Mute channel in a conference";

#ifndef AST_CLI_DEFINE
static struct ast_cli_entry cli_mutechannel = {
	CONFERENCE_MUTECHANNEL_CHOICES,
	conference_mutechannel,
	conference_mutechannel_summary,
	conference_mutechannel_usage
} ;
int conference_mutechannel( int fd, int argc, char *argv[] ) {
#else
static char conference_mutechannel_command[] = "konference mutechannel";
char *conference_mutechannel(struct ast_cli_entry *e, int cmd, struct ast_cli_args *a) {
	static char *choices[] = CONFERENCE_MUTECHANNEL_CHOICES;
	NEWCLI_SWITCH(conference_mutechannel_command,conference_mutechannel_usage)
#endif
	if ( argc < 3 )
		return SHOWUSAGE ;

	const char *channel = argv[2];

	struct ast_conf_member *member = find_member(channel);
	if(!member) {
	    ast_cli(fd, "Member %s not found\n", channel);
	    return FAILURE;
	}

	member->muted = member->mute_audio = 1;

	if ( !--member->use_count && member->delete_flag )
		ast_cond_signal ( &member->delete_var ) ;
	ast_mutex_unlock( &member->lock ) ;

	manager_event(
		EVENT_FLAG_CALL,
		"ConferenceMemberMute",
		"ConferenceName: %s\r\n"
		"MemberId: %d\r\n",
		"Channel: %s\r\n",
		member->conf_name,		
		member->id,
		channel
	) ;

	ast_cli( fd, "Channel #: %s muted\n", argv[2]) ;

	return SUCCESS ;
}
#ifdef	VIDEO
//
//  viewstream
//
static char conference_viewstream_usage[] =
	"Usage: konference viewstream <conference_name> <member id> <stream no>\n"
	"       Member <member id> will receive video stream <stream no>\n"
;

#define CONFERENCE_VIEWSTREAM_CHOICES { "konference", "viewstream", NULL }
static char conference_viewstream_summary[] = "Switch view in a conference";

#ifndef AST_CLI_DEFINE
static struct ast_cli_entry cli_viewstream = {
	CONFERENCE_VIEWSTREAM_CHOICES,
	conference_viewstream,
	conference_viewstream_summary,
	conference_viewstream_usage
} ;
int conference_viewstream( int fd, int argc, char *argv[] ) {
#else
static char conference_viewstream_command[] = "konference viewstream";
char *conference_viewstream(struct ast_cli_entry *e, int cmd, struct ast_cli_args *a) {
	static char *choices[] = CONFERENCE_VIEWSTREAM_CHOICES;
	NEWCLI_SWITCH(conference_viewstream_command,conference_viewstream_usage)
#endif
	if ( argc < 5 )
		return SHOWUSAGE ;

	// get the conference name
	const char* switch_name = argv[2] ;

	int member_id, viewstream_id;
	sscanf(argv[3], "%d", &member_id);
	sscanf(argv[4], "%d", &viewstream_id);

	int res = viewstream_switch( switch_name, member_id, viewstream_id );

	if (res) ast_cli( fd, "User #: %d viewing %d\n", member_id, viewstream_id) ;

	return SUCCESS ;
}

//
// viewstream
//
static char conference_viewchannel_usage[] =
	"Usage: konference viewchannel <conference_name> <dest channel> <src channel>\n"
	"       Channel <dest channel> will receive video stream <src channel>\n"
;

#define CONFERENCE_VIEWCHANNEL_CHOICES { "konference", "viewchannel", NULL }
static char conference_viewchannel_summary[] = "Switch channel in a conference";

#ifndef AST_CLI_DEFINE
static struct ast_cli_entry cli_viewchannel = {
	CONFERENCE_VIEWCHANNEL_CHOICES,
	conference_viewchannel,
	conference_viewchannel_summary,
	conference_viewchannel_usage
} ;
int conference_viewchannel( int fd, int argc, char *argv[] ) {
#else
static char conference_viewchannel_command[] = "konference viewchannel";
char *conference_viewchannel(struct ast_cli_entry *e, int cmd, struct ast_cli_args *a) {
	static char *choices[] = CONFERENCE_VIEWCHANNEL_CHOICES;
	NEWCLI_SWITCH(conference_viewchannel_command,conference_viewchannel_usage)
#endif
	if ( argc < 5 )
		return SHOWUSAGE ;

	// get the conference name
	const char* switch_name = argv[2] ;

	int res = viewchannel_switch( switch_name, argv[3], argv[4] );

	if (res) ast_cli( fd, "Channel #: %s viewing %s\n", argv[3], argv[4]) ;

	return SUCCESS ;
}
#endif
//
// unmute member <member id>
//
static char conference_unmute_usage[] =
	"Usage: konference unmute <conference_name> <member id>\n"
	"       Unmute member in a conference\n"
;

#define CONFERENCE_UNMUTE_CHOICES { "konference", "unmute", NULL }
static char conference_unmute_summary[] = "Unmute member in a conference";

#ifndef AST_CLI_DEFINE
static struct ast_cli_entry cli_unmute = {
	CONFERENCE_UNMUTE_CHOICES,
	conference_unmute,
	conference_unmute_summary,
	conference_unmute_usage
} ;
int conference_unmute( int fd, int argc, char *argv[] ) {
#else
static char conference_unmute_command[] = "konference unmute";
char *conference_unmute(struct ast_cli_entry *e, int cmd, struct ast_cli_args *a) {
	static char *choices[] = CONFERENCE_UNMUTE_CHOICES;
	NEWCLI_SWITCH(conference_unmute_command,conference_unmute_usage)
#endif
	if ( argc < 4 )
		return SHOWUSAGE ;

	// get the conference name
	const char* name = argv[2] ;

	int member_id;
	sscanf(argv[3], "%d", &member_id);

	int res = unmute_member( name, member_id );

	if (res) ast_cli( fd, "User #: %d unmuted\n", member_id) ;

	return SUCCESS ;
}

//
// unmute conference
//
static char conference_unmuteconference_usage[] =
	"Usage: konference unmuteconference <conference_name>\n"
	"       Unmute all members in a conference\n"
;

#define CONFERENCE_UNMUTECONFERENCE_CHOICES { "konference", "unmuteconference", NULL }
static char conference_unmuteconference_summary[] = "Unmute all members in a conference";

#ifndef AST_CLI_DEFINE
static struct ast_cli_entry cli_unmuteconference = {
	CONFERENCE_UNMUTECONFERENCE_CHOICES,
	conference_unmuteconference,
	conference_unmuteconference_summary,
	conference_unmuteconference_usage
} ;
int conference_unmuteconference( int fd, int argc, char *argv[] ) {
#else
static char conference_unmuteconference_command[] = "konference unmuteconference";
char *conference_unmuteconference(struct ast_cli_entry *e, int cmd, struct ast_cli_args *a) {
	static char *choices[] = CONFERENCE_UNMUTECONFERENCE_CHOICES;
	NEWCLI_SWITCH(conference_unmuteconference_command,conference_unmuteconference_usage)
#endif
	if ( argc < 3 )
		return SHOWUSAGE ;

	// get the conference name
	const char* name = argv[2] ;

	int res = unmute_conference ( name );

	if (res) ast_cli( fd, "Conference: %s unmuted\n", name) ;

	return SUCCESS ;
}

//
// unmute member <channel>
//
static char conference_unmutechannel_usage[] =
	"Usage: konference unmutechannel <channel>\n"
	"       Unmute channel in a conference\n"
;

#define CONFERENCE_UNMUTECHANNEL_CHOICES { "konference", "unmutechannel", NULL }
static char conference_unmutechannel_summary[] = "Unmute channel in a conference";

#ifndef AST_CLI_DEFINE
static struct ast_cli_entry cli_unmutechannel = {
	CONFERENCE_UNMUTECHANNEL_CHOICES,
	conference_unmutechannel,
	conference_unmutechannel_summary,
	conference_unmutechannel_usage
} ;
int conference_unmutechannel( int fd, int argc, char *argv[] ) {
#else
static char conference_unmutechannel_command[] = "konference unmutechannel";
char *conference_unmutechannel(struct ast_cli_entry *e, int cmd, struct ast_cli_args *a) {
	static char *choices[] = CONFERENCE_UNMUTECHANNEL_CHOICES;
	NEWCLI_SWITCH(conference_unmutechannel_command,conference_unmutechannel_usage)
#endif
	if ( argc < 3 )
		return SHOWUSAGE ;

	const char *channel = argv[2];

	struct ast_conf_member *member = find_member(channel);
	if(!member) {
	    ast_cli(fd, "Member %s not found\n", channel);
	    return FAILURE;
	}

	member->muted = member->mute_audio = 0;

	if ( !--member->use_count && member->delete_flag )
		ast_cond_signal ( &member->delete_var ) ;
	ast_mutex_unlock( &member->lock ) ;

	manager_event(
		EVENT_FLAG_CALL,
		"ConferenceMemberUnmute",
		"ConferenceName: %s\r\n"
		"MemberId: %d\r\n",
		"Channel: %s\r\n",
		member->conf_name,
		member->id,
		channel
	) ;

	ast_cli( fd, "Channel #: %s unmuted\n", argv[2]) ;

	return SUCCESS ;
}

//
// play sound
//
static char conference_play_sound_usage[] =
	"Usage: konference play sound <channel> (<sound-file>)+ [mute]\n"
	"       Play sound(s) (<sound-file>)+ to conference member <channel>\n"
	"       If mute is specified, all other audio is muted while the sound is played back\n"
;

#define CONFERENCE_PLAY_SOUND_CHOICES { "konference", "play", "sound", NULL }
static char conference_play_sound_summary[] = "Play a sound to a conference member";

#ifndef AST_CLI_DEFINE
static struct ast_cli_entry cli_play_sound = {
	CONFERENCE_PLAY_SOUND_CHOICES,
	conference_play_sound,
	conference_play_sound_summary,
	conference_play_sound_usage
} ;
int conference_play_sound( int fd, int argc, char *argv[] ) {
#else
static char conference_play_sound_command[] = "konference play sound";
char *conference_play_sound(struct ast_cli_entry *e, int cmd, struct ast_cli_args *a) {
	static char *choices[] = CONFERENCE_PLAY_SOUND_CHOICES;
	NEWCLI_SWITCH(conference_play_sound_command,conference_play_sound_usage)
#endif
	if ( argc < 5 )
		return SHOWUSAGE ;

	const char *channel = argv[3];
	char **file = &argv[4];

	int mute = (argc > 5 && !strcmp(argv[argc-1], "mute")?1:0);

	int res = play_sound_channel(fd, channel, file, mute, (!mute) ? argc - 4 : argc - 5);

	if ( !res )
	{
		ast_cli(fd, "Sound playback failed failed\n");
		return FAILURE;
	}
	return SUCCESS ;
}

//
// stop sounds
//
static char conference_stop_sounds_usage[] =
	"Usage: konference stop sounds <channel>\n"
	"       Stop sounds for conference member <channel>\n"
;

#define CONFERENCE_STOP_SOUNDS_CHOICES { "konference", "stop", "sounds", NULL }
static char conference_stop_sounds_summary[] = "Stop sounds for a conference member";

#ifndef AST_CLI_DEFINE
static struct ast_cli_entry cli_stop_sounds = {
	CONFERENCE_STOP_SOUNDS_CHOICES,
	conference_stop_sounds,
	conference_stop_sounds_summary,
	conference_stop_sounds_usage
} ;
int conference_stop_sounds( int fd, int argc, char *argv[] ) {
#else
static char conference_stop_sounds_command[] = "konference stop sounds";
char *conference_stop_sounds(struct ast_cli_entry *e, int cmd, struct ast_cli_args *a) {
	static char *choices[] = CONFERENCE_STOP_SOUNDS_CHOICES;
	NEWCLI_SWITCH(conference_stop_sounds_command,conference_stop_sounds_usage)
#endif
	if ( argc < 4 )
		return SHOWUSAGE ;

	const char *channel = argv[3];

	int res = stop_sound_channel(fd, channel);

	if ( !res )
	{
		ast_cli(fd, "Sound stop failed failed\n");
		return FAILURE;
	}
	return SUCCESS ;
}

//
// start moh
//
static char conference_start_moh_usage[] =
	"Usage: konference start moh <channel>\n"
	"       Start moh for conference member <channel>\n"
;

#define CONFERENCE_START_MOH_CHOICES { "konference", "start", "moh", NULL }
static char conference_start_moh_summary[] = "Start moh for a conference member";

#ifndef AST_CLI_DEFINE
static struct ast_cli_entry cli_start_moh = {
	CONFERENCE_START_MOH_CHOICES,
	conference_start_moh,
	conference_start_moh_summary,
	conference_start_moh_usage
} ;
int conference_start_moh( int fd, int argc, char *argv[] ) {
#else
static char conference_start_moh_command[] = "konference start moh";
char *conference_start_moh(struct ast_cli_entry *e, int cmd, struct ast_cli_args *a) {
	static char *choices[] = CONFERENCE_START_MOH_CHOICES;
	NEWCLI_SWITCH(conference_start_moh_command,conference_start_moh_usage)
#endif
	if ( argc < 4 )
		return SHOWUSAGE ;

	const char *channel = argv[3];

	int res = start_moh_channel(fd, channel);

	if ( !res )
	{
		ast_cli(fd, "Start moh failed\n");
		return FAILURE;
	}
	return SUCCESS ;
}

//
// stop moh
//
static char conference_stop_moh_usage[] =
	"Usage: konference stop moh <channel>\n"
	"       Stop moh for conference member <channel>\n"
;

#define CONFERENCE_STOP_MOH_CHOICES { "konference", "stop", "moh", NULL }
static char conference_stop_moh_summary[] = "Stop moh for a conference member";

#ifndef AST_CLI_DEFINE
static struct ast_cli_entry cli_stop_moh = {
	CONFERENCE_STOP_MOH_CHOICES,
	conference_stop_moh,
	conference_stop_moh_summary,
	conference_stop_moh_usage
} ;
int conference_stop_moh( int fd, int argc, char *argv[] ) {
#else
static char conference_stop_moh_command[] = "konference stop moh";
char *conference_stop_moh(struct ast_cli_entry *e, int cmd, struct ast_cli_args *a) {
	static char *choices[] = CONFERENCE_STOP_MOH_CHOICES;
	NEWCLI_SWITCH(conference_stop_moh_command,conference_stop_moh_usage)
#endif
	if ( argc < 4 )
		return SHOWUSAGE ;

	const char *channel = argv[3];

	int res = stop_moh_channel(fd, channel);

	if ( !res )
	{
		ast_cli(fd, "Sound moh failed\n");
		return FAILURE;
	}
	return SUCCESS ;
}


//
// adjust talk volume
//
static char conference_talkvolume_usage[] =
	"Usage: konference talkvolume <channel> ( up | down )\n"
	"       Adjust talk volume for conference member <channel>\n"
;

#define CONFERENCE_TALKVOLUME_CHOICES { "konference", "talkvolume", NULL }
static char conference_talkvolume_summary[] = "Adjust talk volume for a conference member";

#ifndef AST_CLI_DEFINE
static struct ast_cli_entry cli_talkvolume = {
	CONFERENCE_TALKVOLUME_CHOICES,
	conference_talkvolume,
	conference_talkvolume_summary,
	conference_talkvolume_usage
} ;
int conference_talkvolume( int fd, int argc, char *argv[] ) {
#else
static char conference_talkvolume_command[] = "konference talkvolume";
char *conference_talkvolume(struct ast_cli_entry *e, int cmd, struct ast_cli_args *a) {
	static char *choices[] = CONFERENCE_TALKVOLUME_CHOICES;
	NEWCLI_SWITCH(conference_talkvolume_command,conference_talkvolume_usage)
#endif
	if ( argc < 4 )
		return SHOWUSAGE ;

	const char *channel = argv[2];

	int up;
	if ( strncasecmp( argv[3], "up", 2 ) == 0 )
		up = 1 ;
	else if ( strncasecmp( argv[3], "down", 4 ) == 0 )
		up = 0 ;
	else
		return SHOWUSAGE ;

	int res = talk_volume_channel(fd, channel, up);

	if ( !res )
	{
		ast_cli(fd, "Channel %s talk volume adjust failed\n", channel);
		return FAILURE;
	}
	return SUCCESS ;
}

//
// adjust listen volume
//
static char conference_listenvolume_usage[] =
	"Usage: konference listenvolume <channel> ( up | down )\n"
	"       Adjust listen volume for conference member <channel>\n"
;

#define CONFERENCE_LISTENVOLUME_CHOICES { "konference", "listenvolume", NULL }
static char conference_listenvolume_summary[] = "Adjust listen volume for a conference member";

#ifndef AST_CLI_DEFINE
static struct ast_cli_entry cli_listenvolume = {
	CONFERENCE_LISTENVOLUME_CHOICES,
	conference_listenvolume,
	conference_listenvolume_summary,
	conference_listenvolume_usage
} ;
int conference_listenvolume( int fd, int argc, char *argv[] ) {
#else
static char conference_listenvolume_command[] = "konference listenvolume";
char *conference_listenvolume(struct ast_cli_entry *e, int cmd, struct ast_cli_args *a) {
	static char *choices[] = CONFERENCE_LISTENVOLUME_CHOICES;
	NEWCLI_SWITCH(conference_listenvolume_command,conference_listenvolume_usage)
#endif
	if ( argc < 4 )
		return SHOWUSAGE ;

	const char *channel = argv[2];

	int up;
	if ( strncasecmp( argv[3], "up", 2 ) == 0 )
		up = 1 ;
	else if ( strncasecmp( argv[3], "down", 4 ) == 0 )
		up = 0 ;
	else
		return SHOWUSAGE ;

	int res = listen_volume_channel(fd, channel, up);

	if ( !res )
	{
		ast_cli(fd, "Channel %s listen volume adjust failed\n", channel);
		return FAILURE;
	}
	return SUCCESS ;
}

//
// adjust conference volume
//
static char conference_volume_usage[] =
	"Usage: konference volume <conference name> (up|down)\n"
	"       Raise or lower the conference volume\n"
;

#define CONFERENCE_VOLUME_CHOICES { "konference", "volume", NULL }
static char conference_volume_summary[] = "Adjusts conference volume";

#ifndef AST_CLI_DEFINE
static struct ast_cli_entry cli_volume = {
	CONFERENCE_VOLUME_CHOICES,
	conference_volume,
	conference_volume_summary,
	conference_volume_usage
} ;
int conference_volume( int fd, int argc, char *argv[] ) {
#else
static char conference_volume_command[] = "konference volume";
char *conference_volume(struct ast_cli_entry *e, int cmd, struct ast_cli_args *a) {
	static char *choices[] = CONFERENCE_VOLUME_CHOICES;
	NEWCLI_SWITCH(conference_volume_command,conference_volume_usage)
#endif
	if ( argc < 4 )
		return SHOWUSAGE ;

	// conference name
	const char* conference = argv[2] ;

	int up;
	if ( strncasecmp( argv[3], "up", 2 ) == 0 )
		up = 1 ;
	else if ( strncasecmp( argv[3], "down", 4 ) == 0 )
		up = 0 ;
	else
		return SHOWUSAGE ;

	int res =  volume(fd, conference, up );
	
	if ( !res )
	{
		ast_cli( fd, "Conference %s volume adjust failed\n", conference) ;
		return SHOWUSAGE ;
	}

	return SUCCESS ;
}

//
// end conference
//
static char conference_end_usage[] =
	"Usage: konference end <conference name>\n"
	"       Ends a conference\n"
;

#define CONFERENCE_END_CHOICES { "konference", "end", NULL }
static char conference_end_summary[] = "Stops a conference";

#ifndef AST_CLI_DEFINE
static struct ast_cli_entry cli_end = {
	CONFERENCE_END_CHOICES,
	conference_end,
	conference_end_summary,
	conference_end_usage
} ;
int conference_end( int fd, int argc, char *argv[] ) {
#else
static char conference_end_command[] = "konference end";
char *conference_end(struct ast_cli_entry *e, int cmd, struct ast_cli_args *a) {
	static char *choices[] = CONFERENCE_END_CHOICES;
	NEWCLI_SWITCH(conference_end_command,conference_end_usage)
#endif
	if ( argc < 3 )
		return SHOWUSAGE ;

	// conference name
	const char* name = argv[2] ;

	// get the conference
	if ( end_conference( name, 1 ) != 0 )
	{
		ast_cli( fd, "unable to end the conference, name => %s\n", name ) ;
		return SHOWUSAGE ;
	}

	return SUCCESS ;
}
#ifdef	VIDEO
//
// lock conference to a video source
//
static char conference_lock_usage[] =
	"Usage: konference lock <conference name> <member id>\n"
	"       Locks incoming video stream for conference <conference name> to member <member id>\n"
;

#define CONFERENCE_LOCK_CHOICES { "konference", "lock", NULL }
static char conference_lock_summary[] = "Locks incoming video to a member";

#ifndef AST_CLI_DEFINE
static struct ast_cli_entry cli_lock = {
	CONFERENCE_LOCK_CHOICES,
	conference_lock,
	conference_lock_summary,
	conference_lock_usage
} ;
int conference_lock( int fd, int argc, char *argv[] ) {
#else
static char conference_lock_command[] = "konference lock";
char *conference_lock(struct ast_cli_entry *e, int cmd, struct ast_cli_args *a) {
	static char *choices[] = CONFERENCE_LOCK_CHOICES;
	NEWCLI_SWITCH(conference_lock_command,conference_lock_usage)
#endif
	if ( argc < 4 )
		return SHOWUSAGE;

	const char *conference = argv[2];
	int member;
	sscanf(argv[3], "%d", &member);

	int res = lock_conference(conference, member);

	if ( !res )
	{
		ast_cli(fd, "Locking failed\n");
		return FAILURE;
	}

	return SUCCESS;
}

//
// lock conference to a video source channel
//
static char conference_lockchannel_usage[] =
	"Usage: konference lockchannel <conference name> <channel>\n"
	"       Locks incoming video stream for conference <conference name> to channel <channel>\n"
;

#define CONFERENCE_LOCKCHANNEL_CHOICES { "konference", "lockchannel", NULL }
static char conference_lockchannel_summary[] = "Locks incoming video to a channel";

#ifndef AST_CLI_DEFINE
static struct ast_cli_entry cli_lockchannel = {
	CONFERENCE_LOCKCHANNEL_CHOICES,
	conference_lockchannel,
	conference_lockchannel_summary,
	conference_lockchannel_usage
} ;
int conference_lockchannel( int fd, int argc, char *argv[] ) {
#else
static char conference_lockchannel_command[] = "konference lockchannel";
char *conference_lockchannel(struct ast_cli_entry *e, int cmd, struct ast_cli_args *a) {
	static char *choices[] = CONFERENCE_LOCKCHANNEL_CHOICES;
	NEWCLI_SWITCH(conference_lockchannel_command,conference_lockchannel_usage)
#endif
	if ( argc < 4 )
		return SHOWUSAGE;

	const char *conference = argv[2];
	const char *channel = argv[3];

	int res = lock_conference_channel(conference, channel);

	if ( !res )
	{
		ast_cli(fd, "Locking failed\n");
		return FAILURE;
	}

	return SUCCESS;
}

//
// unlock conference
//
static char conference_unlock_usage[] =
	"Usage: konference unlock <conference name>\n"
	"       Unlocks conference <conference name>\n"
;

#define CONFERENCE_UNLOCK_CHOICES { "konference", "unlock", NULL }
static char conference_unlock_summary[] = "Unlocks conference";

#ifndef AST_CLI_DEFINE
static struct ast_cli_entry cli_unlock = {
	CONFERENCE_UNLOCK_CHOICES,
	conference_unlock,
	conference_unlock_summary,
	conference_unlock_usage
} ;
int conference_unlock( int fd, int argc, char *argv[] ) {
#else
static char conference_unlock_command[] = "konference unlock";
char *conference_unlock(struct ast_cli_entry *e, int cmd, struct ast_cli_args *a) {
	static char *choices[] = CONFERENCE_UNLOCK_CHOICES;
	NEWCLI_SWITCH(conference_unlock_command,conference_unlock_usage)
#endif
	if ( argc < 3 )
		return SHOWUSAGE;


	const char *conference = argv[2];

	int res = unlock_conference(conference);

	if ( !res )
	{
		ast_cli(fd, "Unlocking failed\n");
		return FAILURE;
	}

	return SUCCESS;
}

//
// Set conference default video source
//
static char conference_set_default_usage[] =
	"Usage: konference set default <conference name> <member id>\n"
	"       Sets the default video source for conference <conference name> to member <member id>\n"
	"       Use a negative value for member if you want to clear the default\n"
;

#define CONFERENCE_SET_DEFAULT_CHOICES { "konference", "set", "default", NULL }
static char conference_set_default_summary[] = "Sets default video source";

#ifndef AST_CLI_DEFINE
static struct ast_cli_entry cli_set_default = {
	CONFERENCE_SET_DEFAULT_CHOICES,
	conference_set_default,
	conference_set_default_summary,
	conference_set_default_usage
} ;
int conference_set_default(int fd, int argc, char *argv[] ) {
#else
static char conference_set_default_command[] = "konference set default";
char *conference_set_default(struct ast_cli_entry *e, int cmd, struct ast_cli_args *a) {
	static char *choices[] = CONFERENCE_SET_DEFAULT_CHOICES;
	NEWCLI_SWITCH(conference_set_default_command,conference_set_default_usage)
#endif
	if ( argc < 5 )
		return SHOWUSAGE;

	const char *conference = argv[3];
	int member;
	sscanf(argv[4], "%d", &member);

	int res = set_default_id(conference, member);

	if ( !res )
	{
		ast_cli(fd, "Setting default video id failed\n");
		return FAILURE;
	}

	return SUCCESS;
}

//
// Set conference default video source channel
//
static char conference_set_defaultchannel_usage[] =
	"Usage: konference set defaultchannel <conference name> <channel>\n"
	"       Sets the default video source channel for conference <conference name> to channel <channel>\n"
;

#define CONFERENCE_SET_DEFAULTCHANNEL_CHOICES { "konference", "set", "defaultchannel", NULL }
static char conference_set_defaultchannel_summary[] = "Sets default video source channel";

#ifndef AST_CLI_DEFINE
static struct ast_cli_entry cli_set_defaultchannel = {
	CONFERENCE_SET_DEFAULTCHANNEL_CHOICES,
	conference_set_defaultchannel,
	conference_set_defaultchannel_summary,
	conference_set_defaultchannel_usage
} ;
int conference_set_defaultchannel(int fd, int argc, char *argv[] ) {
#else
static char conference_set_defaultchannel_command[] = "konference set defaultchannel";
char *conference_set_defaultchannel(struct ast_cli_entry *e, int cmd, struct ast_cli_args *a) {
	static char *choices[] = CONFERENCE_SET_DEFAULTCHANNEL_CHOICES;
	NEWCLI_SWITCH(conference_set_defaultchannel_command,conference_set_defaultchannel_usage)
#endif
	if ( argc < 5 )
		return SHOWUSAGE;

	const char *conference = argv[3];
	const char *channel = argv[4];

	int res = set_default_channel(conference, channel);

	if ( !res )
	{
		ast_cli(fd, "Setting default video id failed\n");
		return FAILURE;
	}

	return SUCCESS;
}

//
// Mute video from a member
//
static char conference_video_mute_usage[] =
	"Usage: konference video mute <conference name> <member id>\n"
	"       Mutes video from member <member id> in conference <conference name>\n"
;

#define CONFERENCE_VIDEO_MUTE_CHOICES { "konference", "video", "mute", NULL }
static char conference_video_mute_summary[] = "Mutes video from a member";

#ifndef AST_CLI_DEFINE
static struct ast_cli_entry cli_video_mute = {
	CONFERENCE_VIDEO_MUTE_CHOICES,
	conference_video_mute,
	conference_video_mute_summary,
	conference_video_mute_usage
} ;
int conference_video_mute(int fd, int argc, char *argv[] ) {
#else
static char conference_video_mute_command[] = "konference video mute";
char *conference_video_mute(struct ast_cli_entry *e, int cmd, struct ast_cli_args *a) {
	static char *choices[] = CONFERENCE_VIDEO_MUTE_CHOICES;
	NEWCLI_SWITCH(conference_video_mute_command,conference_video_mute_usage)
#endif
	if ( argc < 5 )
		return SHOWUSAGE;

	const char *conference = argv[3];
	int member;
	sscanf(argv[4], "%d", &member);

	int res = video_mute_member(conference, member);

	if ( !res )
	{
		ast_cli(fd, "Muting video from member %d failed\n", member);
		return FAILURE;
	}

	return SUCCESS;
}

//
// Unmute video from a member
//
static char conference_video_unmute_usage[] =
	"Usage: konference video unmute <conference name> <member id>\n"
	"       Unmutes video from member <member id> in conference <conference name>\n"
;

#define CONFERENCE_VIDEO_UNMUTE_CHOICES { "konference", "video", "unmute", NULL }
static char conference_video_unmute_summary[] = "Unmutes video from a member";

#ifndef AST_CLI_DEFINE
static struct ast_cli_entry cli_video_unmute = {
	CONFERENCE_VIDEO_UNMUTE_CHOICES,
	conference_video_unmute,
	conference_video_unmute_summary,
	conference_video_unmute_usage
} ;
int conference_video_unmute(int fd, int argc, char *argv[] ) {
#else
static char conference_video_unmute_command[] = "konference video unmute";
char *conference_video_unmute(struct ast_cli_entry *e, int cmd, struct ast_cli_args *a) {
	static char *choices[] = CONFERENCE_VIDEO_UNMUTE_CHOICES;
	NEWCLI_SWITCH(conference_video_unmute_command,conference_video_unmute_usage)
#endif
	if ( argc < 5 )
		return SHOWUSAGE;

	const char *conference = argv[3];
	int member;
	sscanf(argv[4], "%d", &member);

	int res = video_unmute_member(conference, member);

	if ( !res )
	{
		ast_cli(fd, "Unmuting video from member %d failed\n", member);
		return FAILURE;
	}

	return SUCCESS;
}

//
// Mute video from a channel
//
static char conference_video_mutechannel_usage[] =
	"Usage: konference video mutechannel <conference name> <channel>\n"
	"       Mutes video from channel <channel> in conference <conference name>\n"
;

#define CONFERENCE_VIDEO_MUTECHANNEL_CHOICES { "konference", "video", "mutechannel", NULL }
static char conference_video_mutechannel_summary[] = "Mutes video from a channel";

#ifndef AST_CLI_DEFINE
static struct ast_cli_entry cli_video_mutechannel = {
	CONFERENCE_VIDEO_MUTECHANNEL_CHOICES,
	conference_video_mutechannel,
	conference_video_mutechannel_summary,
	conference_video_mutechannel_usage
} ;
int conference_video_mutechannel(int fd, int argc, char *argv[] ) {
#else
static char conference_video_mutechannel_command[] = "konference video mutechannel";
char *conference_video_mutechannel(struct ast_cli_entry *e, int cmd, struct ast_cli_args *a) {
	static char *choices[] = CONFERENCE_VIDEO_MUTECHANNEL_CHOICES;
	NEWCLI_SWITCH(conference_video_mutechannel_command,conference_video_mutechannel_usage)
#endif
	if ( argc < 5 )
		return SHOWUSAGE;

	const char *conference = argv[3];
	const char *channel = argv[4];

	int res = video_mute_channel(conference, channel);

	if ( !res )
	{
		ast_cli(fd, "Muting video from channel %s failed\n", channel);
		return FAILURE;
	}

	return SUCCESS;
}

//
// Unmute video from a channel
//
static char conference_video_unmutechannel_usage[] =
	"Usage: konference video unmutechannel <conference name> <channel>\n"
	"       Unmutes video from channel <channel> in conference <conference name>\n"
;

#define CONFERENCE_VIDEO_UNMUTECHANNEL_CHOICES { "konference", "video", "unmutechannel", NULL }
static char conference_video_unmutechannel_summary[] = "Unmutes video from a channel";

#ifndef AST_CLI_DEFINE
static struct ast_cli_entry cli_video_unmutechannel = {
	CONFERENCE_VIDEO_UNMUTECHANNEL_CHOICES,
	conference_video_unmutechannel,
	conference_video_unmutechannel_summary,
	conference_video_unmutechannel_usage
} ;
int conference_video_unmutechannel(int fd, int argc, char *argv[] ) {
#else
static char conference_video_unmutechannel_command[] = "konference video unmutechannel";
char *conference_video_unmutechannel(struct ast_cli_entry *e, int cmd, struct ast_cli_args *a) {
	static char *choices[] = CONFERENCE_VIDEO_UNMUTECHANNEL_CHOICES;
	NEWCLI_SWITCH(conference_video_unmutechannel_command,conference_video_unmutechannel_usage)
#endif
	if ( argc < 5 )
		return SHOWUSAGE;

	const char *conference = argv[3];
	const char *channel = argv[4];

	int res = video_unmute_channel(conference, channel);

	if ( !res )
	{
		ast_cli(fd, "Unmuting video from channel %s failed\n", channel);
		return FAILURE;
	}

	return SUCCESS;
}
#endif
#ifdef	TEXT
//
// Text message functions
// Send a text message to a member
//
static char conference_text_usage[] =
	"Usage: konference text <conference name> <member id> <text>\n"
	"        Sends text message <text> to member <member id> in conference <conference name>\n"
;

#define CONFERENCE_TEXT_CHOICES { "konference", "text", NULL }
static char conference_text_summary[] = "Sends a text message to a member";

#ifndef AST_CLI_DEFINE
static struct ast_cli_entry cli_text = {
	CONFERENCE_TEXT_CHOICES,
	conference_text,
	conference_text_summary,
	conference_text_usage
} ;
int conference_text(int fd, int argc, char *argv[] ) {
#else
static char conference_text_command[] = "konference text";
char *conference_text(struct ast_cli_entry *e, int cmd, struct ast_cli_args *a) {
	static char *choices[] = CONFERENCE_TEXT_CHOICES;
	NEWCLI_SWITCH(conference_text_command,conference_text_usage)
#endif
	if ( argc < 5 )
		return SHOWUSAGE;

	const char *conference = argv[2];
	int member;
	sscanf(argv[3], "%d", &member);
	const char *text = argv[4];

	int res = send_text(conference, member, text);

	if ( !res )
	{
		ast_cli(fd, "Sending a text message to member %d failed\n", member);
		return FAILURE;
	}

	return SUCCESS;
}

//
// Send a text message to a channel
//
static char conference_textchannel_usage[] =
	"Usage: konference textchannel <conference name> <channel> <text>\n"
	"        Sends text message <text> to channel <channel> in conference <conference name>\n"
;

#define CONFERENCE_TEXTCHANNEL_CHOICES { "konference", "textchannel", NULL }
static char conference_textchannel_summary[] = "Sends a text message to a channel";

#ifndef AST_CLI_DEFINE
static struct ast_cli_entry cli_textchannel = {
	CONFERENCE_TEXTCHANNEL_CHOICES,
	conference_textchannel,
	conference_textchannel_summary,
	conference_textchannel_usage
} ;
int conference_textchannel(int fd, int argc, char *argv[] ) {
#else
static char conference_textchannel_command[] = "konference textchannel";
char *conference_textchannel(struct ast_cli_entry *e, int cmd, struct ast_cli_args *a) {
	static char *choices[] = CONFERENCE_TEXTCHANNEL_CHOICES;
	NEWCLI_SWITCH(conference_textchannel_command,conference_textchannel_usage)
#endif
	if ( argc < 5 )
		return SHOWUSAGE;

	const char *conference = argv[2];
	const char *channel = argv[3];
	const char *text = argv[4];

	int res = send_text_channel(conference, channel, text);

	if ( !res )
	{
		ast_cli(fd, "Sending a text message to channel %s failed\n", channel);
		return FAILURE;
	}

	return SUCCESS;
}

//
// Send a text message to all members in a conference
//
static char conference_textbroadcast_usage[] =
	"Usage: konference textbroadcast <conference name> <text>\n"
	"        Sends text message <text> to all members in conference <conference name>\n"
;

#define CONFERENCE_TEXTBROADCAST_CHOICES { "konference", "textbroadcast", NULL }
static char conference_textbroadcast_summary[] = "Sends a text message to all members in a conference";

#ifndef AST_CLI_DEFINE
static struct ast_cli_entry cli_textbroadcast = {
	CONFERENCE_TEXTBROADCAST_CHOICES,
	conference_textbroadcast,
	conference_textbroadcast_summary,
	conference_textbroadcast_usage
} ;
int conference_textbroadcast(int fd, int argc, char *argv[] ) {
#else
static char conference_textbroadcast_command[] = "konference textbroadcast";
char *conference_textbroadcast(struct ast_cli_entry *e, int cmd, struct ast_cli_args *a) {
	static char *choices[] = CONFERENCE_TEXTBROADCAST_CHOICES;
	NEWCLI_SWITCH(conference_textbroadcast_command,conference_textbroadcast_usage)
#endif
	if ( argc < 4 )
		return SHOWUSAGE;

	const char *conference = argv[2];
	const char *text = argv[3];

	int res = send_text_broadcast(conference, text);

	if ( !res )
	{
		ast_cli(fd, "Sending a text broadcast to conference %s failed\n", conference);
		return FAILURE;
	}

	return SUCCESS;
}
#endif
#ifdef	VIDEO
//
// Associate two members
// Audio from the source member will drive VAD based video switching for the destination member
// If the destination member is missing or negative, break any existing association
//
static char conference_drive_usage[] =
	"Usage: konference drive <conference name> <source member> [destination member]\n"
	"        Drives VAD video switching of <destination member> using audio from <source member> in conference <conference name>\n"
	"        If destination is missing or negative, break existing association\n"
;

#define CONFERENCE_DRIVE_CHOICES { "konference", "drive", NULL }
static char conference_drive_summary[] = "Pairs two members to drive VAD-based video switching";

#ifndef AST_CLI_DEFINE
static struct ast_cli_entry cli_drive = {
	CONFERENCE_DRIVE_CHOICES,
	conference_drive,
	conference_drive_summary,
	conference_drive_usage
} ;
int conference_drive(int fd, int argc, char *argv[] ) {
#else
static char conference_drive_command[] = "konference drive";
char *conference_drive(struct ast_cli_entry *e, int cmd, struct ast_cli_args *a) {
	static char *choices[] = CONFERENCE_DRIVE_CHOICES;
	NEWCLI_SWITCH(conference_drive_command,conference_drive_usage)
#endif
	if ( argc < 4 )
		return SHOWUSAGE;

	const char *conference = argv[2];
	int src_member = -1;
	int dst_member = -1;
	sscanf(argv[3], "%d", &src_member);
	if ( argc > 4 )
		sscanf(argv[4], "%d", &dst_member);

	int res = drive(conference, src_member, dst_member);

	if ( !res )
	{
		ast_cli(fd, "Pairing members %d and %d failed\n", src_member, dst_member);
		return FAILURE;
	}

	return SUCCESS;
}

//
// Associate two channels
// Audio from the source channel will drive VAD based video switching for the destination channel
// If the destination channel is missing, break any existing association
//
static char conference_drivechannel_usage[] =
	"Usage: konference drivechannel <conference name> <source channel> [destination channel]\n"
	"        Drives VAD video switching of <destination member> using audio from <source channel> in conference <conference channel>\n"
	"        If destination is missing, break existing association\n"
;

#define CONFERENCE_DRIVECHANNEL_CHOICES { "konference", "drivechannel", NULL }
static char conference_drivechannel_summary[] = "Pairs two channels to drive VAD-based video switching";

#ifndef AST_CLI_DEFINE
static struct ast_cli_entry cli_drivechannel = {
	CONFERENCE_DRIVECHANNEL_CHOICES,
	conference_drivechannel,
	conference_drivechannel_summary,
	conference_drivechannel_usage
} ;
int conference_drivechannel(int fd, int argc, char *argv[] ) {
#else
static char conference_drivechannel_command[] = "konference drivechannel";
char *conference_drivechannel(struct ast_cli_entry *e, int cmd, struct ast_cli_args *a) {
	static char *choices[] = CONFERENCE_DRIVECHANNEL_CHOICES;
	NEWCLI_SWITCH(conference_drivechannel_command,conference_drivechannel_usage)
#endif
	if ( argc < 4 )
		return SHOWUSAGE;

	const char *conference = argv[2];
	const char *src_channel = argv[3];
	const char *dst_channel = NULL;
	if ( argc > 4 )
		dst_channel = argv[4];

	int res = drive_channel(conference, src_channel, dst_channel);

	if ( !res )
	{
		ast_cli(fd, "Pairing channels %s and %s failed\n", src_channel, dst_channel);
		return FAILURE;
	}

	return SUCCESS;
}
#endif

//
// cli initialization function
//

#ifdef AST_CLI_DEFINE
static struct ast_cli_entry app_konference_commands[] = {
	AST_CLI_DEFINE(conference_version, conference_version_summary),
	AST_CLI_DEFINE(conference_restart, conference_restart_summary),
	AST_CLI_DEFINE(conference_debug, conference_debug_summary),
	AST_CLI_DEFINE(conference_show_stats, conference_show_stats_summary),
	AST_CLI_DEFINE(conference_list, conference_list_summary),
	AST_CLI_DEFINE(conference_kick, conference_kick_summary),
	AST_CLI_DEFINE(conference_kickchannel, conference_kickchannel_summary),
	AST_CLI_DEFINE(conference_mute, conference_mute_summary),
	AST_CLI_DEFINE(conference_muteconference, conference_muteconference_summary),
	AST_CLI_DEFINE(conference_mutechannel, conference_mutechannel_summary),
#ifdef	VIDEO
	AST_CLI_DEFINE(conference_viewstream, conference_viewstream_summary),
	AST_CLI_DEFINE(conference_viewchannel, conference_viewchannel_summary),
#endif
	AST_CLI_DEFINE(conference_unmute, conference_unmute_summary),
	AST_CLI_DEFINE(conference_unmuteconference, conference_unmuteconference_summary),
	AST_CLI_DEFINE(conference_unmutechannel, conference_unmutechannel_summary),
	AST_CLI_DEFINE(conference_play_sound, conference_play_sound_summary),
	AST_CLI_DEFINE(conference_stop_sounds, conference_stop_sounds_summary),
	AST_CLI_DEFINE(conference_stop_moh, conference_stop_moh_summary),
	AST_CLI_DEFINE(conference_start_moh, conference_start_moh_summary),
	AST_CLI_DEFINE(conference_talkvolume, conference_talkvolume_summary),
	AST_CLI_DEFINE(conference_listenvolume, conference_listenvolume_summary),
	AST_CLI_DEFINE(conference_volume, conference_volume_summary),
	AST_CLI_DEFINE(conference_end, conference_end_summary),
#ifdef	VIDEO
	AST_CLI_DEFINE(conference_lock, conference_lock_summary),
	AST_CLI_DEFINE(conference_lockchannel, conference_lockchannel_summary),
	AST_CLI_DEFINE(conference_unlock, conference_unlock_summary),
	AST_CLI_DEFINE(conference_set_default, conference_set_default_summary),
	AST_CLI_DEFINE(conference_set_defaultchannel, conference_set_defaultchannel_summary),
	AST_CLI_DEFINE(conference_video_mute, conference_video_mute_summary),
	AST_CLI_DEFINE(conference_video_unmute, conference_video_unmute_summary),
	AST_CLI_DEFINE(conference_video_mutechannel, conference_video_mutechannel_summary),
	AST_CLI_DEFINE(conference_video_unmutechannel, conference_video_unmutechannel_summary),
#endif
#ifdef	TEXT
	AST_CLI_DEFINE(conference_text, conference_text_summary),
	AST_CLI_DEFINE(conference_textchannel, conference_textchannel_summary),
	AST_CLI_DEFINE(conference_textbroadcast, conference_textbroadcast_summary),
#endif
#ifdef	VIDEO
	AST_CLI_DEFINE(conference_drive, conference_drive_summary),
	AST_CLI_DEFINE(conference_drivechannel, conference_drivechannel_summary),
#endif
};
#endif

void register_conference_cli( void )
{
#ifdef AST_CLI_DEFINE
	ast_cli_register_multiple(app_konference_commands, sizeof(app_konference_commands)/sizeof(struct ast_cli_entry));
#else
	ast_cli_register( &cli_version );
	ast_cli_register( &cli_restart );
	ast_cli_register( &cli_debug ) ;
	ast_cli_register( &cli_show_stats ) ;
	ast_cli_register( &cli_list );
	ast_cli_register( &cli_kick );
	ast_cli_register( &cli_kickchannel );
	ast_cli_register( &cli_mute );
	ast_cli_register( &cli_muteconference );
	ast_cli_register( &cli_mutechannel );
#ifdef	VIDEO
	ast_cli_register( &cli_viewstream );
	ast_cli_register( &cli_viewchannel );
#endif
	ast_cli_register( &cli_unmute );
	ast_cli_register( &cli_unmuteconference );
	ast_cli_register( &cli_unmutechannel );
	ast_cli_register( &cli_play_sound ) ;
	ast_cli_register( &cli_stop_sounds ) ;
	ast_cli_register( &cli_stop_moh ) ;
	ast_cli_register( &cli_start_moh ) ;
	ast_cli_register( &cli_talkvolume ) ;
	ast_cli_register( &cli_listenvolume ) ;
	ast_cli_register( &cli_volume );
	ast_cli_register( &cli_end );
#ifdef	VIDEO
	ast_cli_register( &cli_lock );
	ast_cli_register( &cli_lockchannel );
	ast_cli_register( &cli_unlock );
	ast_cli_register( &cli_set_default );
	ast_cli_register( &cli_set_defaultchannel );
	ast_cli_register( &cli_video_mute ) ;
	ast_cli_register( &cli_video_unmute ) ;
	ast_cli_register( &cli_video_mutechannel ) ;
	ast_cli_register( &cli_video_unmutechannel ) ;
#endif
#ifdef	TEXT
	ast_cli_register( &cli_text );
	ast_cli_register( &cli_textchannel );
	ast_cli_register( &cli_textbroadcast );
#endif
#ifdef	VIDEO
	ast_cli_register( &cli_drive );
	ast_cli_register( &cli_drivechannel );
#endif
#endif
	ast_manager_register( "KonferenceList", 0, manager_conference_list, "Conference List" );
	ast_manager_register( "KonferenceEnd", EVENT_FLAG_CALL, manager_conference_end, "Terminate a conference" );

}

void unregister_conference_cli( void )
{
#ifdef AST_CLI_DEFINE
	ast_cli_unregister_multiple(app_konference_commands, sizeof(app_konference_commands)/sizeof(struct ast_cli_entry));
#else
	ast_cli_unregister( &cli_version );
	ast_cli_unregister( &cli_restart );
	ast_cli_unregister( &cli_debug ) ;
	ast_cli_unregister( &cli_show_stats ) ;
	ast_cli_unregister( &cli_list );
	ast_cli_unregister( &cli_kick );
	ast_cli_unregister( &cli_kickchannel );
	ast_cli_unregister( &cli_mute );
	ast_cli_unregister( &cli_muteconference );
	ast_cli_unregister( &cli_mutechannel );
#ifdef	VIDEO
	ast_cli_unregister( &cli_viewstream );
	ast_cli_unregister( &cli_viewchannel );
#endif
	ast_cli_unregister( &cli_unmute );
	ast_cli_unregister( &cli_unmuteconference );
	ast_cli_unregister( &cli_unmutechannel );
	ast_cli_unregister( &cli_play_sound ) ;
	ast_cli_unregister( &cli_stop_sounds ) ;
	ast_cli_unregister( &cli_stop_moh ) ;
	ast_cli_unregister( &cli_start_moh );
	ast_cli_unregister( &cli_talkvolume ) ;
	ast_cli_unregister( &cli_listenvolume ) ;
	ast_cli_unregister( &cli_volume );
	ast_cli_unregister( &cli_end );
#ifdef	VIDEO
	ast_cli_unregister( &cli_lock );
	ast_cli_unregister( &cli_lockchannel );
	ast_cli_unregister( &cli_unlock );
	ast_cli_unregister( &cli_set_default );
	ast_cli_unregister( &cli_set_defaultchannel );
	ast_cli_unregister( &cli_video_mute ) ;
	ast_cli_unregister( &cli_video_unmute ) ;
	ast_cli_unregister( &cli_video_mutechannel ) ;
	ast_cli_unregister( &cli_video_unmutechannel ) ;
#endif
#ifdef	TEXT
	ast_cli_unregister( &cli_text );
	ast_cli_unregister( &cli_textchannel );
	ast_cli_unregister( &cli_textbroadcast );
#endif
#ifdef	VIDEO
	ast_cli_unregister( &cli_drive );
	ast_cli_unregister( &cli_drivechannel );
#endif
#endif
	ast_manager_unregister( "KonferenceList" );
	ast_manager_unregister( "KonferenceEnd" );
}

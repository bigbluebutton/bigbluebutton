
// $Id: cli.h 880 2007-04-25 15:23:59Z jpgrayson $

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

#ifndef _APP_CONF_CLI_H
#define _APP_CONF_CLI_H

//
// includes
//

#include "app_conference.h"
#include "common.h"

//
// function declarations
//

#ifndef AST_CLI_DEFINE

int conference_show_stats( int fd, int argc, char *argv[] ) ;

int conference_version( int fd, int argc, char *argv[] );

int conference_restart( int fd, int argc, char *argv[] );

int conference_debug( int fd, int argc, char *argv[] ) ;

int conference_list( int fd, int argc, char *argv[] ) ;
int conference_kick( int fd, int argc, char *argv[] ) ;
int conference_kickchannel( int fd, int argc, char *argv[] ) ;

int conference_mute( int fd, int argc, char *argv[] ) ;
int conference_unmute( int fd, int argc, char *argv[] ) ;
int conference_muteconference( int fd, int argc, char *argv[] ) ;
int conference_unmuteconference( int fd, int argc, char *argv[] ) ;
int conference_mutechannel( int fd, int argc, char *argv[] ) ;
int conference_unmutechannel( int fd, int argc, char *argv[] ) ;

#ifdef	VIDEO
int conference_viewstream( int fd, int argc, char *argv[] ) ;
int conference_viewchannel( int fd, int argc, char *argv[] ) ;
#endif

int conference_play_sound( int fd, int argc, char *argv[] ) ;
int conference_stop_sounds( int fd, int argc, char *argv[] ) ;

int conference_stop_moh( int fd, int argc, char *argv[] ) ;
int conference_start_moh( int fd, int argc, char *argv[] ) ;

int conference_talkvolume( int fd, int argc, char *argv[] ) ;
int conference_listenvolume( int fd, int argc, char *argv[] ) ;
int conference_volume( int fd, int argc, char *argv[] ) ;

int conference_end( int fd, int argc, char *argv[] ) ;

#ifdef	VIDEO
int conference_lock( int fd, int argc, char *argv[] ) ;
int conference_lockchannel( int fd, int argc, char *argv[] ) ;
int conference_unlock( int fd, int argc, char *argv[] ) ;

int conference_set_default(int fd, int argc, char *argv[] ) ;
int conference_set_defaultchannel(int fd, int argc, char *argv[] ) ;

int conference_video_mute(int fd, int argc, char *argv[] ) ;
int conference_video_mutechannel(int fd, int argc, char *argv[] ) ;
int conference_video_unmute(int fd, int argc, char *argv[] ) ;
int conference_video_unmutechannel(int fd, int argc, char *argv[] ) ;
#endif

#ifdef	TEXT
int conference_text( int fd, int argc, char *argv[] ) ;
int conference_textchannel( int fd, int argc, char *argv[] ) ;
int conference_textbroadcast( int fd, int argc, char *argv[] ) ;
#endif

#ifdef	VIDEO
int conference_drive( int fd, int argc, char *argv[] ) ;
int conference_drivechannel(int fd, int argc, char *argv[] );
#endif

#else

char *conference_show_stats(struct ast_cli_entry *, int, struct ast_cli_args *) ;

char *conference_version(struct ast_cli_entry *, int, struct ast_cli_args *);

char *conference_restart(struct ast_cli_entry *, int, struct ast_cli_args *);

char *conference_debug(struct ast_cli_entry *, int, struct ast_cli_args *) ;

char *conference_list(struct ast_cli_entry *, int, struct ast_cli_args *) ;
char *conference_kick(struct ast_cli_entry *, int, struct ast_cli_args *) ;
char *conference_kickchannel(struct ast_cli_entry *, int, struct ast_cli_args *) ;

char *conference_mute(struct ast_cli_entry *, int, struct ast_cli_args *) ;
char *conference_unmute(struct ast_cli_entry *, int, struct ast_cli_args *) ;
char *conference_muteconference(struct ast_cli_entry *, int, struct ast_cli_args *) ;
char *conference_unmuteconference(struct ast_cli_entry *, int, struct ast_cli_args *) ;
char *conference_mutechannel(struct ast_cli_entry *, int, struct ast_cli_args *) ;
char *conference_unmutechannel(struct ast_cli_entry *, int, struct ast_cli_args *) ;

#ifdef	VIDEO
char *conference_viewstream(struct ast_cli_entry *, int, struct ast_cli_args *) ;
char *conference_viewchannel(struct ast_cli_entry *, int, struct ast_cli_args *) ;
#endif

char *conference_play_sound(struct ast_cli_entry *, int, struct ast_cli_args *) ;
char *conference_stop_sounds(struct ast_cli_entry *, int, struct ast_cli_args *) ;

char *conference_stop_moh(struct ast_cli_entry *, int, struct ast_cli_args *) ;
char *conference_start_moh(struct ast_cli_entry *, int, struct ast_cli_args *) ;

char *conference_talkvolume(struct ast_cli_entry *, int, struct ast_cli_args *) ;
char *conference_listenvolume(struct ast_cli_entry *, int, struct ast_cli_args *) ;
char *conference_volume(struct ast_cli_entry *, int, struct ast_cli_args *) ;

char *conference_end(struct ast_cli_entry *, int, struct ast_cli_args *) ;

#ifdef	VIDEO
char *conference_lock(struct ast_cli_entry *, int, struct ast_cli_args *) ;
char *conference_lockchannel(struct ast_cli_entry *, int, struct ast_cli_args *) ;
char *conference_unlock(struct ast_cli_entry *, int, struct ast_cli_args *) ;

char *conference_set_default(struct ast_cli_entry *, int, struct ast_cli_args *) ;
char *conference_set_defaultchannel(struct ast_cli_entry *, int, struct ast_cli_args *) ;

char *conference_video_mute(struct ast_cli_entry *, int, struct ast_cli_args *) ;
char *conference_video_mutechannel(struct ast_cli_entry *, int, struct ast_cli_args *) ;
char *conference_video_unmute(struct ast_cli_entry *, int, struct ast_cli_args *) ;
char *conference_video_unmutechannel(struct ast_cli_entry *, int, struct ast_cli_args *) ;
#endif

#ifdef	TEXT
char *conference_text(struct ast_cli_entry *, int, struct ast_cli_args *) ;
char *conference_textchannel(struct ast_cli_entry *, int, struct ast_cli_args *) ;
char *conference_textbroadcast(struct ast_cli_entry *, int, struct ast_cli_args *) ;
#endif

char *conference_drive(struct ast_cli_entry *, int, struct ast_cli_args *) ;
char *conference_drivechannel(struct ast_cli_entry *, int, struct ast_cli_args *);

#endif

void register_conference_cli( void ) ;
void unregister_conference_cli( void ) ;


#endif

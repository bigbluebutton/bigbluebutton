
// $Id: frame.h 746 2006-12-11 20:12:12Z sbalea $

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

#ifndef _APP_CONF_FRAME_H
#define _APP_CONF_FRAME_H

//
// includes
//

#include "app_conference.h"
#include "common.h"

//
// function declarations
//

// mixing
conf_frame* mix_frames( conf_frame* frames_in, int speaker_count, int listener_count, int volume ) ;

conf_frame* mix_multiple_speakers( conf_frame* frames_in, int speakers, int listeners, int volume ) ;
conf_frame* mix_single_speaker( conf_frame* frames_in, int volume ) ;

// frame creation and deletion
conf_frame* create_conf_frame( struct ast_conf_member* member, conf_frame* next, const struct ast_frame* fr ) ;
conf_frame* delete_conf_frame( conf_frame* cf ) ;
conf_frame* copy_conf_frame( conf_frame* src ) ;

// convert frame functions
struct ast_frame* convert_frame_to_slinear( struct ast_trans_pvt* trans, struct ast_frame* fr ) ;
struct ast_frame* convert_frame_from_slinear( struct ast_trans_pvt* trans, struct ast_frame* fr ) ;
struct ast_frame* convert_frame( struct ast_trans_pvt* trans, struct ast_frame* fr ) ;

#ifdef	TEXT
// text frame function(s)
struct ast_frame* create_text_frame(const char *text, int copy);
#endif

// slinear frame functions
struct ast_frame* create_slinear_frame( char* data ) ;
void mix_slinear_frames( char* dst, const char* src, int samples ) ;

// silent frame functions
conf_frame* get_silent_frame( void ) ;
struct ast_frame* get_silent_slinear_frame( void ) ;

// set delivery timestamp for frames
void set_conf_frame_delivery( conf_frame* frame, struct timeval time ) ;

#endif

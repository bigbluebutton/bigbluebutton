
// $Id: conf_frame.h 880 2007-04-25 15:23:59Z jpgrayson $

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

#ifndef _APP_CONF_STRUCTS_H
#define _APP_CONF_STRUCTS_H

//
// includes
//

#include "app_conference.h"
#include "common.h"

//
// struct declarations
//

typedef struct conf_frame
{
	// frame audio data
	struct ast_frame* fr ;

	// array of converted versions for listeners
	struct ast_frame* converted[ AC_SUPPORTED_FORMATS ] ;

	// pointer to the frame's owner
	struct ast_conf_member* member ; // who sent this frame

	// frame meta data
//	struct timeval timestamp ;
//	unsigned long cycleid ;
//	int priority ;

	// linked-list pointers
	struct conf_frame* next ;
	struct conf_frame* prev ;

	// should this frame be preserved
	short static_frame ;

	// pointer to mixing buffer
	char* mixed_buffer ;
} conf_frame ;


#endif

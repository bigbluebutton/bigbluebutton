/* 
 * FreeSWITCH Modular Media Switching Software Library / Soft-Switch Application
 * Copyright (C) 2005-2014, Anthony Minessale II <anthm@freeswitch.org>
 *
 * Version: MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is FreeSWITCH Modular Media Switching Software Library / Soft-Switch Application
 *
 * The Initial Developer of the Original Code is
 * Anthony Minessale II <anthm@freeswitch.org>
 * Portions created by the Initial Developer are Copyright (C)
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 * 
 * Dragos Oancea <dragos.oancea@nexmo.com> (mod_opusfile.c)
 *
 *
 * mod_opusfile.c -- Read and Write OGG/Opus files . Some parts inspired from mod_shout.c, libopusfile, libopusenc
 *
 */
#include <switch.h>

#include <opusfile.h>

#ifdef HAVE_OPUSFILE_ENCODE
#include <opus/opusenc.h>
#endif 

#define OPUSFILE_MAX 32*1024 
#define TC_BUFFER_SIZE 1024 * 256 /* max ammount of decoded audio we can have at a time (bytes)*/
#define DEFAULT_RATE 48000 /* default fullband */
#define OPUS_MAX_PCM 5760 /* opus recommended max output buf */

//#undef HAVE_OPUSFILE_ENCODE  /*don't encode anything */

SWITCH_MODULE_LOAD_FUNCTION(mod_opusfile_load);
SWITCH_MODULE_DEFINITION(mod_opusfile, mod_opusfile_load, NULL, NULL);

struct opus_file_context {
	switch_file_t *fd;
	OggOpusFile *of;
	ogg_int64_t duration;
	int output_seekable;
	ogg_int64_t pcm_offset;
	ogg_int64_t pcm_print_offset;
	ogg_int64_t next_pcm_offset;
	ogg_int64_t nsamples;
	opus_int32  bitrate;
	int li;
	int prev_li;
	switch_mutex_t *audio_mutex;
	switch_buffer_t *audio_buffer;
	switch_mutex_t *ogg_mutex;
	switch_buffer_t *ogg_buffer;
	opus_int16 decode_buf[OPUS_MAX_PCM];
	switch_bool_t eof;
	switch_thread_rwlock_t *rwlock;
	switch_file_handle_t *handle;
	size_t samplerate;
	int frame_size;
	int channels;
	size_t buffer_seconds;
	size_t err;
	opus_int16 *opusbuf;
	switch_size_t opusbuflen;
	FILE *fp;
#ifdef HAVE_OPUSFILE_ENCODE
	OggOpusEnc *enc;
	OggOpusComments *comments;
	unsigned char encode_buf[OPUSFILE_MAX];
	int encoded_buflen;
	size_t samples_encode;
#endif
	switch_memory_pool_t *pool;
};

typedef struct opus_file_context opus_file_context;

static struct {
	int debug;
} globals;

static switch_status_t switch_opusfile_decode(opus_file_context *context, void *data, size_t max_bytes, int channels)
{
	int ret = 0;
	size_t buf_inuse;

	if (!context->of) {
		return SWITCH_STATUS_FALSE;
	}
	
	memset(context->decode_buf, 0, sizeof(context->decode_buf));
	switch_mutex_lock(context->audio_mutex);
	while (!(context->eof) && (buf_inuse = switch_buffer_inuse(context->audio_buffer)) <= max_bytes) {

		if (channels == 1) {
			ret = op_read(context->of, (opus_int16 *)context->decode_buf, OPUS_MAX_PCM, NULL);
		} else if (channels == 2) {
			ret = op_read_stereo(context->of, (opus_int16 *)context->decode_buf, OPUS_MAX_PCM);
		} else if (channels > 2) {
			ret = op_read(context->of, (opus_int16 *)context->decode_buf, OPUS_MAX_PCM, NULL);
		} else if ((channels > 255) || (channels < 1)) { 
				switch_log_printf(SWITCH_CHANNEL_LOG, SWITCH_LOG_ERROR, "[OGG/OPUS File] Invalid number of channels");
				switch_mutex_unlock(context->audio_mutex);
				return SWITCH_STATUS_FALSE;
		}
		if (ret < 0) {
			switch(ret) {
			case OP_HOLE:	/* There was a hole in the data, and some samples may have been skipped. Call this function again to continue decoding past the hole.*/
			case OP_EREAD:	/*An underlying read operation failed. This may signal a truncation attack from an <https:> source.*/
			
			case OP_EFAULT: /*	An internal memory allocation failed. */

			case OP_EIMPL:	/*An unseekable stream encountered a new link that used a feature that is not implemented, such as an unsupported channel family.*/

			case OP_EINVAL:	/* The stream was only partially open. */

			case OP_ENOTFORMAT: /*	An unseekable stream encountered a new link that did not have any logical Opus streams in it. */

			case OP_EBADHEADER:	/*An unseekable stream encountered a new link with a required header packet that was not properly formatted, contained illegal values, or was missing altogether.*/

			case OP_EVERSION:	/*An unseekable stream encountered a new link with an ID header that contained an unrecognized version number.*/

			case OP_EBADPACKET: /*Failed to properly decode the next packet.*/

			case OP_EBADLINK:		/*We failed to find data we had seen before.*/

			case OP_EBADTIMESTAMP:		/*An unseekable stream encountered a new link with a starting timestamp that failed basic validity checks.*/

			default:
			    switch_log_printf(SWITCH_CHANNEL_LOG, SWITCH_LOG_ERROR, "[OGG/OPUS Decoder]: error decoding file: [%d]\n", ret);
				switch_mutex_unlock(context->audio_mutex);
				return SWITCH_STATUS_FALSE;
			}
		} else if (ret == 0) {
			/*The number of samples returned may be 0 if the buffer was too small to store even a single sample for both channels, or if end-of-file was reached*/
			if (globals.debug) {
				switch_log_printf(SWITCH_CHANNEL_LOG, SWITCH_LOG_DEBUG, "[OGG/OPUS Decoder]: EOF reached [%d]\n", ret);
			}
			context->eof = TRUE;
			break;
		} else /* (ret > 0)*/ {
			/*The number of samples read per channel on success*/
			switch_buffer_write(context->audio_buffer, (opus_int16 *)context->decode_buf, ret * sizeof(opus_int16) * channels);

			if (globals.debug) {
				switch_log_printf(SWITCH_CHANNEL_LOG, SWITCH_LOG_DEBUG, 
						"[OGG/OPUS Decoder]: Read samples: %d. Wrote bytes to buffer: [%d] bytes in use: [%u]\n", ret, (int)(ret * sizeof(int16_t) * channels), (unsigned int)buf_inuse);
			}
		}
	}
	switch_mutex_unlock(context->audio_mutex);
	context->eof = FALSE; // for next page 
	return SWITCH_STATUS_SUCCESS;
}


static switch_status_t switch_opusfile_open(switch_file_handle_t *handle, const char *path)
{
	opus_file_context *context;
	char *ext;
	unsigned int flags = 0;
	int ret;

	if ((ext = strrchr(path, '.')) == 0) {
		switch_log_printf(SWITCH_CHANNEL_LOG, SWITCH_LOG_ERROR, "[OGG/OPUS File] Invalid Format\n");
		return SWITCH_STATUS_GENERR;
	}
	ext++;

	if ((context = switch_core_alloc(handle->memory_pool, sizeof(*context))) == 0) {
		return SWITCH_STATUS_MEMERR;
	}

	context->pool = handle->memory_pool;

	switch_thread_rwlock_create(&(context->rwlock), context->pool);

	switch_thread_rwlock_rdlock(context->rwlock);

	switch_mutex_init(&context->audio_mutex, SWITCH_MUTEX_NESTED, context->pool);

	if (switch_test_flag(handle, SWITCH_FILE_FLAG_WRITE)) {
		flags |= SWITCH_FOPEN_WRITE | SWITCH_FOPEN_CREATE;
		if (switch_test_flag(handle, SWITCH_FILE_WRITE_APPEND) || switch_test_flag(handle, SWITCH_FILE_WRITE_OVER)) {
			flags |= SWITCH_FOPEN_READ;
		} else {
			flags |= SWITCH_FOPEN_TRUNCATE;
		}
	}

	if (switch_test_flag(handle, SWITCH_FILE_FLAG_READ)) {
		if (switch_buffer_create_dynamic(&context->audio_buffer, TC_BUFFER_SIZE, TC_BUFFER_SIZE * 2, 0) != SWITCH_STATUS_SUCCESS) {
			switch_log_printf(SWITCH_CHANNEL_LOG, SWITCH_LOG_ERROR, "Memory Error!\n");
			goto err;
		}

		flags |= SWITCH_FOPEN_READ;
	}

	handle->samples = 0;
	handle->samplerate = context->samplerate = DEFAULT_RATE; /*open files at 48 khz always*/
	handle->format = 0;
	handle->sections = 0;
	handle->seekable = 1;
	handle->speed = 0;
	handle->pos = 0;
	handle->private_info = context;
	context->handle = handle;
	memcpy(handle->file_path, path, strlen(path));

#ifdef HAVE_OPUSFILE_ENCODE
	if (switch_test_flag(handle, SWITCH_FILE_FLAG_WRITE)) {
		int err; int mapping_family = 0;

		context->channels = handle->channels;
		context->samplerate = handle->samplerate;
		handle->seekable = 0;
		context->comments = ope_comments_create();
		ope_comments_add(context->comments, "METADATA", "Freeswitch/mod_opusfile");
		// opus_multistream_surround_encoder_get_size() in libopus will check these
		if ((context->channels > 2) && (context->channels <= 8)) {
			mapping_family = 1;
		} else if ((context->channels > 8) && (context->channels <= 255)) {
			mapping_family = 255;
		}
		context->enc = ope_encoder_create_file(handle->file_path, context->comments, context->samplerate, context->channels, mapping_family, &err);
		if (!context->enc) {
			switch_log_printf(SWITCH_CHANNEL_LOG, SWITCH_LOG_ERROR, "Can't open file for writing [%d] [%s]\n", err, ope_strerror(err));
			switch_thread_rwlock_unlock(context->rwlock);
			return SWITCH_STATUS_FALSE;
		}
		switch_thread_rwlock_unlock(context->rwlock);
		return SWITCH_STATUS_SUCCESS;
	}
#endif 
	
	context->of = op_open_file(path, &ret);
	if (!context->of) {
		switch_log_printf(SWITCH_CHANNEL_LOG, SWITCH_LOG_ERROR, "[OGG/OPUS File] Error opening %s\n", path);
		return SWITCH_STATUS_GENERR;
	}

	if (switch_test_flag(handle, SWITCH_FILE_WRITE_APPEND)) {
		op_pcm_seek(context->of, 0); // overwrite
		handle->pos = 0;
	}

	context->prev_li = -1;
	context->nsamples = 0;

	handle->channels = context->channels = op_channel_count(context->of, -1);
	context->pcm_offset = op_pcm_tell(context->of);

	if(context->pcm_offset!=0){
		switch_log_printf(SWITCH_CHANNEL_LOG, SWITCH_LOG_DEBUG, "[OGG/OPUS File] Non-zero starting PCM offset: [%li]\n", (long)context->pcm_offset);
	}
	context->pcm_print_offset = context->pcm_offset - DEFAULT_RATE;
	context->bitrate = 0;
	context->buffer_seconds = 1;

	switch_log_printf(SWITCH_CHANNEL_LOG, SWITCH_LOG_INFO, "[OGG/OPUS File] Opening File [%s] %dhz\n", path, handle->samplerate);

	context->li = op_current_link(context->of);

	if (context->li != context->prev_li) {
		const OpusHead *head;
		const OpusTags *tags;
		head=op_head(context->of, context->li);
		if (head) {
			switch_log_printf(SWITCH_CHANNEL_LOG, SWITCH_LOG_INFO, "[OGG/OPUS File] Channels: %i\n", head->channel_count);
			if (head->input_sample_rate) {
				switch_log_printf(SWITCH_CHANNEL_LOG, SWITCH_LOG_INFO, "[OGG/OPUS File] Original sampling rate: %lu Hz\n", (unsigned long)head->input_sample_rate);
				handle->samplerate = context->samplerate = head->input_sample_rate;
			}
		}
		if (op_seekable(context->of)) {
			ogg_int64_t duration;
			opus_int64  size;
			duration = op_pcm_total(context->of, context->li);
			switch_log_printf(SWITCH_CHANNEL_LOG, SWITCH_LOG_INFO , "[OGG/OPUS File] Duration (samples): %u", (unsigned int)duration);
			size = op_raw_total(context->of, context->li);
			switch_log_printf(SWITCH_CHANNEL_LOG, SWITCH_LOG_INFO,"[OGG/OPUS File] Size (bytes): %u", (unsigned int)size);
		}
		tags = op_tags(context->of, context->li);
		switch_log_printf(SWITCH_CHANNEL_LOG, SWITCH_LOG_INFO, "[OGG/OPUS File] Encoded by: %s\n", tags->vendor);
	}

	switch_thread_rwlock_unlock(context->rwlock);
	return SWITCH_STATUS_SUCCESS;

err:
	switch_thread_rwlock_unlock(context->rwlock);

	return SWITCH_STATUS_FALSE;
}

static switch_status_t switch_opusfile_close(switch_file_handle_t *handle)
{
	opus_file_context *context = handle->private_info;

	switch_thread_rwlock_rdlock(context->rwlock);
	if (context->of) {
		op_free(context->of);
	}
#ifdef HAVE_OPUSFILE_ENCODE
	if (context->enc) {
		ope_encoder_destroy(context->enc);
	}
	if (context->comments) {
		ope_comments_destroy(context->comments);
	}
#endif 
	if (context->audio_buffer) {
		switch_buffer_destroy(&context->audio_buffer);
	}
	switch_thread_rwlock_unlock(context->rwlock);
	return SWITCH_STATUS_SUCCESS;
}

static switch_status_t switch_opusfile_seek(switch_file_handle_t *handle, unsigned int *cur_sample, int64_t samples, int whence)
{
	int ret;
	opus_file_context *context = handle->private_info;

	if (handle->handler || switch_test_flag(handle, SWITCH_FILE_FLAG_WRITE)) {
		return SWITCH_STATUS_FALSE;
	} else {
		if (whence == SWITCH_SEEK_CUR) {
			samples -= switch_buffer_inuse(context->audio_buffer) / sizeof(int16_t);
		}
		switch_buffer_zero(context->audio_buffer);
		ret = op_pcm_seek(context->of, samples);
		if (globals.debug) {
			switch_log_printf(SWITCH_CHANNEL_LOG, SWITCH_LOG_DEBUG,"[OGG/OPUS File] seek samples: [%u]", (unsigned int)samples);
		}
		if (ret == 0) {
			handle->pos = *cur_sample = samples;
			return SWITCH_STATUS_SUCCESS;
		}
	}
	return SWITCH_STATUS_FALSE;
}

static switch_status_t switch_opusfile_read(switch_file_handle_t *handle, void *data, size_t *len)
{
	opus_file_context *context = handle->private_info;
	size_t bytes = *len * sizeof(int16_t) * handle->real_channels;
	size_t rb = 0, newbytes;

	if (!context) {
		return SWITCH_STATUS_FALSE;
	}

	if (!handle->handler) {
		if (switch_opusfile_decode(context, data, bytes, handle->real_channels) == SWITCH_STATUS_FALSE) {
			context->eof = 1;
		}
	}
	switch_mutex_lock(context->audio_mutex);
	rb = switch_buffer_read(context->audio_buffer, data, bytes);
	switch_mutex_unlock(context->audio_mutex);

	if (!rb && (context->eof)) {
		return SWITCH_STATUS_FALSE;
	}
	if (rb) {
		*len = rb / sizeof(int16_t) / handle->real_channels;
		if (globals.debug) {
			switch_log_printf(SWITCH_CHANNEL_LOG, SWITCH_LOG_DEBUG, "[OGG/OPUS File] rb: [%d] *len: [%d]\n",  (int)rb, (int)*len);
		}
	} else {
		newbytes = (2 * handle->samplerate * handle->real_channels) * context->buffer_seconds;
		if (newbytes < bytes) {
			bytes = newbytes;
		}
		if (globals.debug) {
			switch_log_printf(SWITCH_CHANNEL_LOG, SWITCH_LOG_DEBUG, 
					"[OGG/OPUS File] Padding with empty audio. seconds: [%d] bytes: [%d] newbytes: [%d] real_channels: [%d]\n", 
					(int)context->buffer_seconds, (int)bytes, (int)newbytes, (int)handle->real_channels);
		}
		memset(data, 255, bytes);
		*len = bytes / sizeof(int16_t) / handle->real_channels;
	}

	handle->pos += *len;
	handle->sample_count += *len;

	return SWITCH_STATUS_SUCCESS;
}

static switch_status_t switch_opusfile_write(switch_file_handle_t *handle, void *data, size_t *len)
{
#ifdef HAVE_OPUSFILE_ENCODE
	size_t nsamples = *len;
	int err;
	int mapping_family = 0;

	opus_file_context *context = handle->private_info;

	if (!handle) {
		switch_log_printf(SWITCH_CHANNEL_LOG, SWITCH_LOG_ERROR, "Error no handle\n");
		return SWITCH_STATUS_FALSE;
	}

	if (!(context = handle->private_info)) {
		switch_log_printf(SWITCH_CHANNEL_LOG, SWITCH_LOG_ERROR, "Error no context\n");
		return SWITCH_STATUS_FALSE;
	}
	if (!context->comments) {
		context->comments = ope_comments_create();
		ope_comments_add(context->comments, "METADATA", "Freeswitch/mod_opusfile");
	}
	if (context->channels > 2) {
			mapping_family = 1;
	}
	if (!context->enc) {
		context->enc = ope_encoder_create_file(handle->file_path, context->comments, handle->samplerate, handle->channels, mapping_family, &err);
		if (!context->enc) {
			switch_log_printf(SWITCH_CHANNEL_LOG, SWITCH_LOG_ERROR, "Can't open file for writing. err: [%d] [%s]\n", err, ope_strerror(err));
			return SWITCH_STATUS_FALSE;
		}
	}

	if (globals.debug) {
		switch_log_printf(SWITCH_CHANNEL_LOG, SWITCH_LOG_DEBUG,"[OGG/OPUS File] write nsamples: [%d]", (int)nsamples);
	}

	err = ope_encoder_write(context->enc, (opus_int16 *)data, nsamples);

	if (err != OPE_OK) {
		switch_log_printf(SWITCH_CHANNEL_LOG, SWITCH_LOG_ERROR, "[OGG/OPUS File] Can't encode. err: [%d] [%s]", err, ope_strerror(err));
		return SWITCH_STATUS_FALSE;
	}

	handle->sample_count += *len;
#endif 
	return SWITCH_STATUS_SUCCESS;
}

static switch_status_t switch_opusfile_set_string(switch_file_handle_t *handle, switch_audio_col_t col, const char *string)
{
	return SWITCH_STATUS_FALSE;
}

static switch_status_t switch_opusfile_get_string(switch_file_handle_t *handle, switch_audio_col_t col, const char **string)
{
	return SWITCH_STATUS_FALSE;
}


#define OPUSFILE_DEBUG_SYNTAX "<on|off>"
SWITCH_STANDARD_API(mod_opusfile_debug)
{
	if (zstr(cmd)) {
		stream->write_function(stream, "-USAGE: %s\n", OPUSFILE_DEBUG_SYNTAX);
	} else {
		if (!strcasecmp(cmd, "on")) {
			globals.debug = 1;
			stream->write_function(stream, "OPUSFILE Debug: on\n");
#ifdef HAVE_OPUSFILE_ENCODE
			stream->write_function(stream, "Library version (encoding): %s\n", ope_get_version_string());
#endif 
		} else if (!strcasecmp(cmd, "off")) {
			globals.debug = 0;
			stream->write_function(stream, "OPUSFILE Debug: off\n");
		} else {
			stream->write_function(stream, "-USAGE: %s\n", OPUSFILE_DEBUG_SYNTAX);
		}
	}
	return SWITCH_STATUS_SUCCESS;
}

/* Registration */

static char *supported_formats[SWITCH_MAX_CODECS] = { 0 };

SWITCH_MODULE_LOAD_FUNCTION(mod_opusfile_load)
{
	switch_file_interface_t *file_interface;
	switch_api_interface_t *commands_api_interface;

	supported_formats[0] = "opus";

	*module_interface = switch_loadable_module_create_module_interface(pool, modname);

	SWITCH_ADD_API(commands_api_interface, "opusfile_debug", "Set OPUSFILE Debug", mod_opusfile_debug, OPUSFILE_DEBUG_SYNTAX);

	switch_console_set_complete("add opusfile_debug on");
	switch_console_set_complete("add opusfile_debug off");

	globals.debug = 0;

	file_interface = switch_loadable_module_create_interface(*module_interface, SWITCH_FILE_INTERFACE);
	file_interface->interface_name = modname;
	file_interface->extens = supported_formats;
	file_interface->file_open = switch_opusfile_open;
	file_interface->file_close = switch_opusfile_close;
	file_interface->file_read = switch_opusfile_read;
	file_interface->file_write = switch_opusfile_write;
	file_interface->file_seek = switch_opusfile_seek;
	file_interface->file_set_string = switch_opusfile_set_string;
	file_interface->file_get_string = switch_opusfile_get_string;

	
	switch_log_printf(SWITCH_CHANNEL_LOG, SWITCH_LOG_INFO, "mod_opusfile loaded\n");

	/* indicate that the module should continue to be loaded */
	return SWITCH_STATUS_SUCCESS;
}

/* For Emacs:
 * Local Variables:
 * mode:c
 * indent-tabs-mode:t
 * tab-width:4
 * c-basic-offset:4
 * End:
 * For VIM:
 * vim:set softtabstop=4 shiftwidth=4 tabstop=4 noet:
 */


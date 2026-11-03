#!/usr/bin/env python3
"""Regression tests for record-and-playback/core/scripts/utils/gen_webvtt.

Run where the script's dependencies are installed (python3-lxml, python3-pyicu), e.g.
on a BigBlueButton server:

    python3 -m unittest discover -s record-and-playback/core/test/gen_webvtt -v

Each fixture directory holds an events.xml; the script is run against it as a
subprocess, exactly as the recording process does, and its output files are checked.
Tracking issue: https://github.com/bigbluebutton/bigbluebutton/issues/19700
"""

import json
import os
import re
import subprocess
import sys
import tempfile
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
FIXTURES = os.path.join(HERE, 'fixtures')
GEN_WEBVTT = os.path.normpath(os.path.join(HERE, '..', '..', 'scripts', 'utils', 'gen_webvtt'))

ALICE_1 = 'the birch canoe slid on the smooth planks'
BOB_1 = 'glue the sheet to the dark blue background'
ALICE_2 = 'it is easy to tell the depth of a well'
TYPED_1 = 'typed caption one'
BOB_PT = 'o rato roeu a roupa do rei de roma'
BEFORE_START = 'this was said before the recording started'
ALICE_LONG = ('the source of the huge river is the clear spring kick the ball straight and follow '
              'through help the woman get back to her feet')
BOB_LONG = ('a pot of tea helps to pass the evening smoky fires lack flame and heat the soft cushion '
            'broke the mans fall')
TYPED_LONG = ('This third message is a much longer one, written as a captioner would while a speaker goes on '
              'for a while about several topics, so that it does not fit on one caption line.')
TYPED_NOTE = 'first line of a note second line of the same note third line, added with Shift+Enter'

CUE_TIMING = re.compile(r'^\d\d:\d\d:\d\d\.\d{3} --> \d\d:\d\d:\d\d\.\d{3}$')


def vtt_text(path):
    """Cue text of a WebVTT file as one whitespace-normalised line."""
    with open(path, encoding='utf-8') as f:
        lines = [l.rstrip('\n') for l in f]
    text = [l for l in lines if l.strip() and l != 'WEBVTT' and not CUE_TIMING.match(l)]
    return re.sub(r'\s+', ' ', ' '.join(text)).strip()


def cue_texts(path):
    """The text of every cue of a WebVTT file, lines joined with spaces."""
    with open(path, encoding='utf-8') as f:
        blocks = f.read().split('\n\n')
    cues = []
    for block in blocks:
        lines = block.strip().split('\n')
        if lines and CUE_TIMING.match(lines[0]):
            cues.append(' '.join(lines[1:]))
    return cues


def timed_cues(path):
    """Every cue of a WebVTT file as (start ms, end ms, text with lines joined by spaces)."""
    def ms(timestamp):
        h, m, s = timestamp.split(':')
        return round((int(h) * 3600 + int(m) * 60 + float(s)) * 1000)

    with open(path, encoding='utf-8') as f:
        blocks = f.read().split('\n\n')
    cues = []
    for block in blocks:
        lines = block.strip().split('\n')
        if lines and CUE_TIMING.match(lines[0]):
            start, end = lines[0].split(' --> ')
            cues.append((ms(start), ms(end), ' '.join(lines[1:])))
    return cues


def count_sentence(text, sentence):
    """Whole-word occurrences: glued text ("planksglue the") does not count."""
    return len(re.findall(r'(?<![^\W_])' + re.escape(sentence) + r'(?![^\W_])', text))


# The names the recording scripts pass for the fixtures' participants
# (BigBlueButton.generate_webvtt, anonymized as configured)
NAMES = {'w_alice': 'Alice', 'w_bob': 'Bob'}


class GenWebvttRun:
    def __init__(self, fixture, names=None, extra_args=()):
        self.outdir = tempfile.mkdtemp(prefix='gen_webvtt_test_')
        cmd = [sys.executable, GEN_WEBVTT, '-i', os.path.join(FIXTURES, fixture), '-o', self.outdir] + list(extra_args)
        names_file = None
        if names is not None:
            with tempfile.NamedTemporaryFile('w', suffix='.json', delete=False) as f:
                json.dump(names, f)
                names_file = f.name
            cmd += ['--speaker-names', names_file]
        try:
            self.result = subprocess.run(cmd, capture_output=True, text=True, check=False)
        finally:
            if names_file:
                os.unlink(names_file)

    @property
    def returncode(self):
        return self.result.returncode

    def failure_details(self):
        return f'exit {self.result.returncode}\nstdout:\n{self.result.stdout}\nstderr:\n{self.result.stderr}'

    def vtt_files(self):
        return sorted(f for f in os.listdir(self.outdir) if f.startswith('caption_') and f.endswith('.vtt'))

    def text(self, locale):
        return vtt_text(os.path.join(self.outdir, f'caption_{locale}.vtt'))

    def index(self):
        with open(os.path.join(self.outdir, 'captions.json'), encoding='utf-8') as f:
            return json.load(f)


class LegacyEditCaptionHistoryEvents(unittest.TestCase):
    """Recordings made before captions were recorded per utterance keep working."""

    def test_single_speaker_is_rendered_in_order(self):
        run = GenWebvttRun('legacy-single-speaker')
        self.assertEqual(run.returncode, 0, run.failure_details())
        self.assertEqual(run.vtt_files(), ['caption_en-US.vtt'])
        self.assertEqual(run.text('en-US'), f'{ALICE_1} {BOB_1} {ALICE_2}')
        self.assertEqual(run.index(), [{'locale': 'en-US', 'localeName': 'English (United States)'}])

    def test_two_speakers_do_not_break_the_generator(self):
        # The legacy per-locale stream of two overlapping speakers is garbled by design
        # (the defect behind #19700); the generator must still produce the track.
        run = GenWebvttRun('legacy-two-speakers-overlapping')
        self.assertEqual(run.returncode, 0, run.failure_details())
        self.assertEqual(run.vtt_files(), ['caption_en-US.vtt'])
        self.assertIn(ALICE_1, run.text('en-US'))
        self.assertIn(BOB_1, run.text('en-US'))

    def test_paused_recording_is_left_out(self):
        run = GenWebvttRun('legacy-pause-resume')
        self.assertEqual(run.returncode, 0, run.failure_details())
        text = run.text('en-US')
        self.assertEqual(count_sentence(text, ALICE_1), 1)
        self.assertEqual(count_sentence(text, BOB_1), 0, 'the sentence said while paused must not be in the captions')
        self.assertEqual(count_sentence(text, ALICE_2), 1)

    def test_invalid_locales_and_transcript_events_are_skipped(self):
        # #19178 (empty locale crashed the ICU locale lookup) and #19701 (AUDIO-CAPTIONS
        # TranscriptUpdatedEvent carries no usable data): neither may break processing.
        run = GenWebvttRun('legacy-invalid-locale')
        self.assertEqual(run.returncode, 0, run.failure_details())
        self.assertEqual(run.vtt_files(), ['caption_en-US.vtt'])
        self.assertEqual(run.text('en-US'), 'hello')
        self.assertEqual([t['locale'] for t in run.index()], ['en-US'])


class CaptionUpdatedEvents(unittest.TestCase):
    """Captions recorded per utterance (CaptionUpdatedEvent) become cues, labelled
    with the names the recording scripts supply."""

    def test_two_speakers_in_one_language(self):
        run = GenWebvttRun('segments-two-speakers', names=NAMES)
        self.assertEqual(run.returncode, 0, run.failure_details())
        self.assertEqual(run.vtt_files(), ['caption_en-US.vtt', 'caption_pt-BR.vtt'])
        text = run.text('en-US')
        for sentence in (ALICE_1, BOB_1, ALICE_2, TYPED_1):
            self.assertEqual(count_sentence(text, sentence), 1, f'{sentence!r} once in: {text}')
        # utterances in the order they started, the speaker named whenever it changes
        self.assertEqual(text, f'Alice: {ALICE_1} Bob: {BOB_1} Alice: {ALICE_2} {TYPED_1}')
        self.assertEqual(run.text('pt-BR'), f'Bob: {BOB_PT}')
        self.assertEqual(
            run.index(),
            [
                {'locale': 'en-US', 'localeName': 'English (United States)'},
                {'locale': 'pt-BR', 'localeName': 'português (Brasil)'},
            ],
        )

    def test_cue_timing_follows_the_utterance(self):
        run = GenWebvttRun('segments-two-speakers', names=NAMES)
        self.assertEqual(run.returncode, 0, run.failure_details())
        with open(os.path.join(run.outdir, 'caption_en-US.vtt'), encoding='utf-8') as f:
            timings = [l.strip() for l in f if CUE_TIMING.match(l.strip())]
        starts = [t.split(' --> ')[0] for t in timings]
        # Alice's first word was recorded 1 s after the first event (2000 - 1000 ms)
        self.assertEqual(starts[0], '00:00:01.000')
        # cues are written in time order
        self.assertEqual(starts, sorted(starts))

    def test_paused_recording_is_left_out(self):
        run = GenWebvttRun('segments-pause-resume', names=NAMES)
        self.assertEqual(run.returncode, 0, run.failure_details())
        text = run.text('en-US')
        self.assertEqual(count_sentence(text, BEFORE_START), 0, 'what was said before the recording started must not be in the captions')
        self.assertEqual(count_sentence(text, ALICE_1), 1)
        self.assertEqual(count_sentence(text, BOB_1), 0, 'the sentence said while paused must not be in the captions')
        self.assertEqual(count_sentence(text, ALICE_2), 1)

    def test_late_interim_result_does_not_shorten_the_final_text(self):
        run = GenWebvttRun('segments-stale-interim', names=NAMES)
        self.assertEqual(run.returncode, 0, run.failure_details())
        self.assertEqual(run.text('en-US'), 'Alice: it is easy to tell the depth over well')

    def test_interleaved_long_utterances_name_the_speaker_of_every_cue(self):
        run = GenWebvttRun('segments-long-overlap', names=NAMES)
        self.assertEqual(run.returncode, 0, run.failure_details())
        cues = cue_texts(os.path.join(run.outdir, 'caption_en-US.vtt'))
        self.assertGreater(len(cues), 2, 'long overlapping utterances should be split into several cues')
        spoken = {'Alice': [], 'Bob': []}
        speaker = None
        for cue in cues:
            match = re.match(r'(Alice|Bob): (.*)', cue, re.S)
            if match:
                speaker, cue = match.group(1), match.group(2)
            self.assertIsNotNone(speaker, f'the first cue must name its speaker: {cues}')
            spoken[speaker].append(cue)
        # an unlabelled cue continues the previous cue's speaker
        self.assertEqual(' '.join(' '.join(spoken['Alice']).split()), ALICE_LONG)
        self.assertEqual(' '.join(' '.join(spoken['Bob']).split()), BOB_LONG)
        # and a speaker is named again after the other one had the floor
        self.assertEqual(sum(1 for cue in cues if cue.startswith('Alice: ')), 2, cues)
        self.assertEqual(sum(1 for cue in cues if cue.startswith('Bob: ')), 2, cues)

    def test_utterance_without_final_result_keeps_its_last_text(self):
        run = GenWebvttRun('segments-unfinished', names=NAMES)
        self.assertEqual(run.returncode, 0, run.failure_details())
        self.assertEqual(run.text('en-US'), 'Alice: the birch canoe slid')

    def test_cues_carry_no_speaker_names_unless_supplied(self):
        # Run directly, without the names the recording scripts pass (anonymized as
        # configured), the generator must not fall back to the participants' real names
        run = GenWebvttRun('segments-two-speakers')
        self.assertEqual(run.returncode, 0, run.failure_details())
        text = run.text('en-US')
        for sentence in (ALICE_1, BOB_1, ALICE_2, TYPED_1):
            self.assertEqual(count_sentence(text, sentence), 1, f'{sentence!r} once in: {text}')
        self.assertNotIn('Alice', text)
        self.assertNotIn('Bob', text)

    def test_revised_first_character_keeps_the_time_of_the_utterance(self):
        # A final result that capitalises the first word revises what the interim
        # results had since 1 s into the recording; it must not re-time the cue to
        # when the final arrived (8 s)
        run = GenWebvttRun('segments-revised-first-character', names=NAMES)
        self.assertEqual(run.returncode, 0, run.failure_details())
        self.assertEqual(run.text('en-US'), 'Alice: The birch canoe slid.')
        with open(os.path.join(run.outdir, 'caption_en-US.vtt'), encoding='utf-8') as f:
            timings = [l.strip() for l in f if CUE_TIMING.match(l.strip())]
        self.assertEqual(timings[0].split(' --> ')[0], '00:00:01.000')

    def test_revision_during_a_pause_keeps_what_was_said_before(self):
        # The words heard before the pause stay; only what the final adds while the
        # recording is paused is left out
        run = GenWebvttRun('segments-revised-during-pause', names=NAMES)
        self.assertEqual(run.returncode, 0, run.failure_details())
        text = run.text('en-US')
        self.assertEqual(count_sentence(text, 'The birch canoe'), 1, text)
        self.assertNotIn('slid', text)
        self.assertEqual(count_sentence(text, 'after the pause'), 1, text)

    def test_long_typed_caption_is_shown_whole(self):
        # A typed caption arrives whole, so all its lines start at the same time; each
        # pair of lines must still get its reading time, rather than every cue but the
        # last being cut to nothing
        run = GenWebvttRun('segments-typed-long', names=NAMES)
        self.assertEqual(run.returncode, 0, run.failure_details())
        self.assertEqual(run.text('en-US'), f'Alice: {TYPED_LONG} {TYPED_NOTE} Bob: {BOB_LONG}')
        typed = [cue for cue in timed_cues(os.path.join(run.outdir, 'caption_en-US.vtt')) if cue[0] < 49000]
        self.assertEqual(len(typed), 5, typed)
        for start, end, text in typed:
            self.assertGreaterEqual(end - start, 1000, f'{text!r} is not shown long enough: {typed}')
        # the message is shown from when it was sent (2 s, 1 s into the recording)
        self.assertEqual(typed[0][0], 1000)

    def test_speech_arriving_at_once_is_shown_before_the_words_after_it(self):
        # The first result of an utterance can already fill three lines; they are shown
        # in turn, but not held back past the words that arrive after them (51.5 s)
        run = GenWebvttRun('segments-typed-long', names=NAMES)
        self.assertEqual(run.returncode, 0, run.failure_details())
        speech = [cue for cue in timed_cues(os.path.join(run.outdir, 'caption_en-US.vtt')) if cue[0] >= 49000]
        for start, end, text in speech:
            self.assertGreater(end, start, f'{text!r} is never shown: {speech}')
        self.assertEqual(speech[0][0], 49000)
        self.assertIn('the mans fall', speech[-1][2])
        self.assertLessEqual(speech[-1][0], 50500, speech)

    def test_speaker_names_can_be_supplied(self):
        # The recording scripts pass the (possibly anonymised) participant names.
        run = GenWebvttRun('segments-two-speakers', names={'w_alice': 'Moderator 1', 'w_bob': 'Viewer 1'})
        self.assertEqual(run.returncode, 0, run.failure_details())
        text = run.text('en-US')
        self.assertIn(f'Moderator 1: {ALICE_1}', text)
        self.assertIn(f'Viewer 1: {BOB_1}', text)
        self.assertNotIn('Alice', text)
        self.assertNotIn('Bob', text)


if __name__ == '__main__':
    unittest.main()

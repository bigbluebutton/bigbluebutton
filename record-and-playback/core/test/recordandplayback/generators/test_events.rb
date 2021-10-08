# frozen_string_literal: true

require 'minitest/autorun'
require 'nokogiri'

require 'recordandplayback'

class TestEvents < Minitest::Test
  def setup
    @events_legacy = File.open('resources/raw/1b199e88-7df7-4842-a5f1-0e84b781c5c8/events.xml') do |io|
      Nokogiri::XML(io)
    end
    @events_chat09 = File.open('resources/raw/chat_0_9.xml') do |io|
      Nokogiri::XML(io)
    end
    @events_devcall = File.open('resources/raw/183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1630430006889/events.xml') do |io|
      Nokogiri::XML(io)
    end
    @events_meta_edt = File.open('resources/raw/2a1de53edf0543d950056bf3c0d4d357eba3383f-1630607370684/events.xml') do |io|
      Nokogiri::XML(io)
    end
  end

  def test_anonymous_user_map_legacy
    map = BigBlueButton::Events.anonymous_user_map(@events_legacy)
    assert_empty(map)
  end

  def test_anonymous_user_map_legacy_no_viewer_only
    map = BigBlueButton::Events.anonymous_user_map(@events_legacy, moderators: true)
    assert_equal(1, map.length)
    assert_equal('Moderator 1', map['1'])
  end

  def test_anonymous_user_map_bbb_0_9
    map = BigBlueButton::Events.anonymous_user_map(@events_chat09)
    assert_equal(21, map.length)
    assert_equal('Marinda Collins', map['9izxq660i7vr_1']) # Moderator
    assert_equal('Viewer 1', map['vvyha6umxoyt_1'])
    assert_equal('Viewer 2', map['hs7iskkr7xrt_1'])
    assert_equal('Viewer 3', map['7m940cic73r3_1'])
    assert_equal('Viewer 4', map['tgfbj6f828sp_1'])
    assert_equal('Viewer 5', map['bepguk6d7dza_1'])
    assert_equal('Viewer 6', map['66ntqzexswc2_1'])
    assert_equal('Viewer 7', map['0q1hkmla9asu_1'])
    assert_equal('Viewer 8', map['yyynfpyca09g_1'])
    assert_equal('Viewer 9', map['dmsj3897dwss_1'])
    assert_equal('Viewer 10', map['42dnty7rovjt_1'])
    assert_equal('Viewer 11', map['7ur69btts657_1'])
    assert_equal('Viewer 12', map['23uydbo9nauq_1'])
    assert_equal('Viewer 6', map['12ipastd9pw1_1'])
    assert_equal('Viewer 9', map['ainnu65fiycz_1'])
    assert_equal('Viewer 13', map['j73nq5k8xcaa_1'])
    assert_equal('Viewer 14', map['nfuklna24flg_1'])
    assert_equal('Viewer 9', map['2dc8jctma0nj_1'])
    assert_equal('Viewer 13', map['fzlsahcijxo4_1'])
    assert_equal('Viewer 2', map['y096bmb53yu5_1'])
    assert_equal('Viewer 2', map['y096bmb53yu5_2'])
    assert_equal('Viewer 8', map['yyynfpyca09g_1'])
  end

  def test_anonymous_user_map_bbb_0_9_no_viewer_only
    map = BigBlueButton::Events.anonymous_user_map(@events_chat09, moderators: true)
    assert_equal(21, map.length)
    assert_equal('Moderator 1', map['9izxq660i7vr_1'])
    assert_equal('Viewer 1', map['vvyha6umxoyt_1'])
    assert_equal('Viewer 2', map['hs7iskkr7xrt_1'])
    assert_equal('Viewer 3', map['7m940cic73r3_1'])
    assert_equal('Viewer 4', map['tgfbj6f828sp_1'])
    assert_equal('Viewer 5', map['bepguk6d7dza_1'])
    assert_equal('Viewer 6', map['66ntqzexswc2_1'])
    assert_equal('Viewer 7', map['0q1hkmla9asu_1'])
    assert_equal('Viewer 8', map['yyynfpyca09g_1'])
    assert_equal('Viewer 9', map['dmsj3897dwss_1'])
    assert_equal('Viewer 10', map['42dnty7rovjt_1'])
    assert_equal('Viewer 11', map['7ur69btts657_1'])
    assert_equal('Viewer 12', map['23uydbo9nauq_1'])
    assert_equal('Viewer 6', map['12ipastd9pw1_1'])
    assert_equal('Viewer 9', map['ainnu65fiycz_1'])
    assert_equal('Viewer 13', map['j73nq5k8xcaa_1'])
    assert_equal('Viewer 14', map['nfuklna24flg_1'])
    assert_equal('Viewer 9', map['2dc8jctma0nj_1'])
    assert_equal('Viewer 13', map['fzlsahcijxo4_1'])
    assert_equal('Viewer 2', map['y096bmb53yu5_1'])
    assert_equal('Viewer 2', map['y096bmb53yu5_2'])
    assert_equal('Viewer 8', map['yyynfpyca09g_1'])
  end

  def test_get_chat_events_legacy
    start_time = BigBlueButton::Events.first_event_timestamp(@events_legacy)
    end_time = BigBlueButton::Events.last_event_timestamp(@events_legacy)
    bbb_props = { 'anonymize_chat' => true, 'anonymize_chat_moderators' => true }
    chats_enum = BigBlueButton::Events.get_chat_events(@events_legacy, start_time, end_time, bbb_props).each
    chat = chats_enum.next
    assert_equal(34_876, chat[:in])
    assert_nil(chat.fetch(:out))
    assert_nil(chat.fetch(:sender_id))
    # Anonymization doesn't work on really old recordings since there's no connection between
    # chat user names and user ids
    assert_equal('FRED', chat[:sender])
    assert_equal('hello', chat[:message])
    assert_nil(chat.fetch(:date))
    assert_equal(0, chat[:text_color])
    chat = chats_enum.next
    assert_equal(42_388, chat[:in])
    assert_nil(chat.fetch(:out))
    assert_equal('FRED', chat[:sender])
    assert_equal('how are you?', chat[:message])
    chat = chats_enum.next
    assert_equal(90_561, chat[:in])
    assert_nil(chat.fetch(:out))
    assert_equal('FRED', chat[:sender])
    assert_equal('hi fred', chat[:message])
    assert_raises(StopIteration) { chats_enum.next }
  end

  def test_get_chat_events_0_9
    start_time = BigBlueButton::Events.first_event_timestamp(@events_chat09)
    end_time = BigBlueButton::Events.last_event_timestamp(@events_chat09)
    chats_enum = BigBlueButton::Events.get_chat_events(@events_chat09, start_time, end_time).each
    chat = chats_enum.next
    assert_equal(749_025, chat[:in])
    assert_equal(988_028, chat[:out])
    assert_equal('2dc8jctma0nj_1', chat[:sender_id])
    assert_equal('Xhesika De Lange', chat[:sender])
    assert_equal('Public chat 1', chat[:message])
    assert_nil(chat.fetch(:date))
    assert_equal(0, chat[:text_color])
    chat = chats_enum.next
    assert_equal(972_022, chat[:in])
    assert_equal(988_028, chat[:out])
    assert_equal('23uydbo9nauq_1', chat[:sender_id])
    assert_equal('Asa Darby', chat[:sender])
    assert_equal('Public chat 2', chat[:message])
    chat = chats_enum.next
    assert_equal(1_797_324, chat[:in])
    assert_nil(chat.fetch(:out))
    assert_equal('hs7iskkr7xrt_1', chat[:sender_id])
    assert_equal('Isaías Seelen', chat[:sender])
    assert_equal('Public chat 3', chat[:message])
    chat = chats_enum.next
    assert_equal(3_144_319 - 522_222, chat[:in])
    assert_equal('0q1hkmla9asu_1', chat[:sender_id])
    assert_equal('Elias Stablum', chat[:sender])
    assert_equal('Public chat 6', chat[:message])
    chat = chats_enum.next
    assert_equal(3_148_146 - 522_222, chat[:in])
    assert_equal('fzlsahcijxo4_1', chat[:sender_id])
    assert_equal('Arethusa Mann', chat[:sender])
    assert_equal('Public chat 7', chat[:message])
    chat = chats_enum.next
    assert_equal(3_157_549 - 522_222, chat[:in])
    assert_equal('nfuklna24flg_1', chat[:sender_id])
    assert_equal('Ninel Mac Ruaidhrí', chat[:sender])
    assert_equal('Public chat 8', chat[:message])
    chat = chats_enum.next
    assert_equal(3_159_062 - 522_222, chat[:in])
    assert_equal('7m940cic73r3_1', chat[:sender_id])
    assert_equal('Mireia Castell', chat[:sender])
    assert_equal('Public chat 9', chat[:message])
    chat = chats_enum.next
    assert_equal(3_167_630 - 522_222, chat[:in])
    assert_equal('nfuklna24flg_1', chat[:sender_id])
    assert_equal('Ninel Mac Ruaidhrí', chat[:sender])
    assert_equal('Public chat 10', chat[:message])
    chat = chats_enum.next
    assert_equal(5_240_729 - 522_222, chat[:in])
    assert_equal('2dc8jctma0nj_1', chat[:sender_id])
    assert_equal('Xhesika De Lange', chat[:sender])
    assert_equal('Public chat 11', chat[:message])
    chat = chats_enum.next
    assert_equal(5_265_991 - 522_222, chat[:in])
    assert_equal('fzlsahcijxo4_1', chat[:sender_id])
    assert_equal('Arethusa Mann', chat[:sender])
    assert_equal('Public chat 12', chat[:message])
    chat = chats_enum.next
    assert_equal(5_454_399 - 522_222, chat[:in])
    assert_equal('2dc8jctma0nj_1', chat[:sender_id])
    assert_equal('Xhesika De Lange', chat[:sender])
    assert_equal('Public chat 13', chat[:message])
    assert_raises(StopIteration) { chats_enum.next }
  end

  def test_get_chat_events_0_9_anonymized
    start_time = BigBlueButton::Events.first_event_timestamp(@events_chat09)
    end_time = BigBlueButton::Events.last_event_timestamp(@events_chat09)
    bbb_props = { 'anonymize_chat' => true }
    chats_enum = BigBlueButton::Events.get_chat_events(@events_chat09, start_time, end_time, bbb_props).each
    assert_equal('Viewer 9', chats_enum.next[:sender])
    assert_equal('Viewer 12', chats_enum.next[:sender])
    assert_equal('Viewer 2', chats_enum.next[:sender])
    assert_equal('Viewer 7', chats_enum.next[:sender])
    assert_equal('Viewer 13', chats_enum.next[:sender])
    assert_equal('Viewer 14', chats_enum.next[:sender])
    assert_equal('Viewer 3', chats_enum.next[:sender])
    assert_equal('Viewer 14', chats_enum.next[:sender])
    assert_equal('Viewer 9', chats_enum.next[:sender])
    assert_equal('Viewer 13', chats_enum.next[:sender])
    assert_equal('Viewer 9', chats_enum.next[:sender])
    assert_raises(StopIteration) { chats_enum.next }
  end

  def test_get_chat_events_0_9_start_time
    end_time = BigBlueButton::Events.last_event_timestamp(@events_chat09)
    chats = BigBlueButton::Events.get_chat_events(@events_chat09, 1_063_007_465, end_time)
    chat = chats.first
    assert_equal(301_831, chat[:in])
    assert_equal('hs7iskkr7xrt_1', chat[:sender_id])
    assert_equal('Isaías Seelen', chat[:sender])
    assert_equal('Public chat 3', chat[:message])
  end

  def test_get_chat_events_0_9_end_time
    start_time = BigBlueButton::Events.first_event_timestamp(@events_chat09)
    chats = BigBlueButton::Events.get_chat_events(@events_chat09, start_time, 1_062_490_000)
    chat = chats.last
    assert_equal(972_022, chat[:in])
    assert_nil(chat.fetch(:out))
    assert_equal('23uydbo9nauq_1', chat[:sender_id])
    assert_equal('Asa Darby', chat[:sender])
    assert_equal('Public chat 2', chat[:message])
  end

  def test_get_chat_events_devcall
    start_time = BigBlueButton::Events.first_event_timestamp(@events_devcall)
    end_time = BigBlueButton::Events.last_event_timestamp(@events_devcall)
    chats = BigBlueButton::Events.get_chat_events(@events_devcall, start_time, end_time)

    assert_equal(11, chats.length)

    chat = chats[0]
    assert_equal(17_013, chat[:in])
    assert_equal(148_701, chat[:out])
    assert_equal('w_kmm96j1as24f', chat[:sender_id])
    assert_equal('Mario', chat[:sender])
    assert_equal('#7b1fa2', chat[:avatar_color])
    assert_nil(chat.fetch(:text_color))
    assert_equal(DateTime.rfc3339('2021-08-31T18:06:14.330+00:00'), chat[:date])
    # rubocop:disable Layout/LineLength
    assert_equal(
      "i get  logs of these: \n\n ERROR: clientLogger: Camera VIEWER failed. Reconnecting. <a href=\"https://develop.bigbluebutton.org/html5client/8fb14b479570f65105c7ff9a2960b679501f34ff.js?meteor_js_resource=true:348:579447\" rel=\"nofollow\"><u>https://develop.bigbluebutton.org/html5client/8fb14b479570f65105c7ff9a2960b679501f34ff.js?meteor_js_resource=true:348:579447</u></a>",
      chat[:message]
    )
    # rubocop:enable Layout/LineLength

    chat = chats[7]
    assert_equal(1_241_014, chat[:in])
    assert_nil(chat.fetch(:out))
    assert_equal('w_vk0ebqjxox9d', chat[:sender_id])
    assert_equal('Anton G', chat[:sender])
    assert_equal('#0277bd', chat[:avatar_color])
    assert_nil(chat.fetch(:text_color))
    assert_equal(DateTime.rfc3339('2021-08-31T18:26:38.332+00:00'), chat[:date])
    assert_equal('Nice!', chat[:message])
  end

  def test_get_chat_events_meta_edt
    start_time = BigBlueButton::Events.first_event_timestamp(@events_meta_edt)
    end_time = BigBlueButton::Events.last_event_timestamp(@events_meta_edt)
    chats = BigBlueButton::Events.get_chat_events(@events_meta_edt, start_time, end_time)

    assert_equal(1, chats.length)

    chat = chats[0]
    assert_equal(11_635, chat[:in])
    assert_nil(chat.fetch(:out))
    assert_equal('w_tvumguamxhhs', chat[:sender_id])
    # This recording has the meta_bbb-anonymize-chat param set
    assert_equal('Viewer 1', chat[:sender])
    assert_equal(DateTime.rfc3339('2021-09-02T14:33:02.214-04:00'), chat[:date])
    assert_equal('whoops, forgot to start recording…', chat[:message])
  end
end

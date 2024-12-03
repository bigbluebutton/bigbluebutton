/**
 * Regex pattern for validating emoji characters. Matches:
 * - Emoji presentations
 * - Extended pictographic with variation selectors
 * - Emoji modifier bases (e.g., skin tones)
 * - Regional indicators (flags)
 * - Zero-width joiner sequences
 *
 * Note: Based on Unicode 15.1. May need updates for future Unicode versions.
 */
export const EMOJI_REGEX = /^(?:\p{Emoji_Presentation}|\p{Extended_Pictographic}\uFE0F|\p{Emoji_Modifier_Base}|\p{Regional_Indicator}{2}|[0-9#*]\uFE0F?\u20E3)(\u200D(?:\p{Emoji_Presentation}|\p{Extended_Pictographic}\uFE0F|\p{Emoji_Modifier_Base}|\p{Regional_Indicator}{2}|[0-9#*]\uFE0F?\u20E3))*$/u;

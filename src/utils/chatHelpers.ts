import type { ChatMessage } from '../screens/user/ChatScreen/ChatScreen';

const PARTICIPANT_PALETTE = [
  '#E11D48', // Vibrant Rose
  '#2563EB', // Royal Blue
  '#059669', // Deep Emerald
  '#D97706', // Warm Amber
  '#7C3AED', // Deep Violet
  '#0891B2', // Pacific Cyan
  '#EA580C', // Sunset Orange
  '#4F46E5', // Indigo
  '#0D9488', // Dark Teal
  '#DB2777', // Magenta Pink
];

/**
 * Deterministically generates a vibrant, accessible color for a group participant
 * based on their user ID or display name hash.
 */
export function getParticipantColor(userIdOrName?: string): string {
  if (!userIdOrName) return PARTICIPANT_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < userIdOrName.length; i++) {
    hash = (hash << 5) - hash + userIdOrName.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % PARTICIPANT_PALETTE.length;
  return PARTICIPANT_PALETTE[index];
}

/**
 * Returns a human-readable snippet for quoted message previews.
 */
export function formatMessageSnippet(msg?: Partial<ChatMessage> | null): string {
  if (!msg) return '';
  if (msg.is_deleted) return 'This message was deleted';
  if (msg.text && msg.text.trim()) return msg.text.trim();
  if (msg.mediaType === 'image') return '📷 Photo';
  if (msg.mediaType === 'audio') return '🎤 Voice memo';
  if (msg.postShare) return '🔖 Shared Post';
  return 'Message';
}

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0B',
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2B2B2B',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerTitles: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    marginTop: 4,
    color: '#B3B3B3',
    fontSize: 12,
  },
  meAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  body: {
    flex: 1,
  },
  onlineSection: {
    paddingTop: 10,
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1E1E1E',
  },
  onlineHeaderRow: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  onlineTitle: {
    color: '#B3B3B3',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  onlineCount: {
    color: '#B3B3B3',
    fontSize: 12,
  },
  onlineUsersRow: {
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 8,
  },
  userItem: {
    width: 86,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: '#101010',
    borderWidth: 1,
    borderColor: '#1F1F1F',
    alignItems: 'center',
    gap: 8,
  },
  userItemSelected: {
    borderColor: '#2F6BFF',
    backgroundColor: '#121B33',
  },
  userItemPressed: {
    opacity: 0.85,
  },
  userAvatarWrap: {
    width: 40,
    height: 40,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  unreadBadge: {
    position: 'absolute',
    right: -6,
    top: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: '#0B0B0B',
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    maxWidth: '100%',
  },
  userPreview: {
    color: '#B3B3B3',
    fontSize: 10,
    maxWidth: '100%',
  },
  userOnlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2FD37D',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  messageRow: {
    flexDirection: 'row',
  },
  messageRowLeft: {
    justifyContent: 'flex-start',
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  bubbleMe: {
    backgroundColor: '#2F6BFF',
  },
  bubbleOther: {
    backgroundColor: '#222222',
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 12,
    paddingHorizontal: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#2B2B2B',
    backgroundColor: '#0B0B0B',
  },
  input: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#2B2B2B',
    borderRadius: 12,
    paddingHorizontal: 12,
    color: '#FFFFFF',
  },
  inputDisabled: {
    opacity: 0.7,
  },
  sendButton: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
    backgroundColor: '#2F6BFF',
  },
  sendButtonDisabled: {
    backgroundColor: '#2B2B2B',
  },
  sendButtonPressed: {
    opacity: 0.85,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

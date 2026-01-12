import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Modern color palette
const colors = {
  background: '#0A0A0F',
  surface: '#12121A',
  surfaceLight: '#1A1A24',
  surfaceHover: '#22222E',
  border: '#2A2A36',
  borderLight: '#3A3A48',
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  secondary: '#10B981',
  secondaryLight: '#34D399',
  accent: '#F59E0B',
  danger: '#EF4444',
  dangerLight: '#F87171',
  text: '#FFFFFF',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  online: '#22C55E',
  gradient1: '#6366F1',
  gradient2: '#8B5CF6',
};

export const styles = StyleSheet.create({
  // Main Container
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  headerTitles: {
    flex: 1,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIconButtonPressed: {
    backgroundColor: colors.surfaceHover,
  },
  headerCallButton: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  headerCallButtonPressed: {
    backgroundColor: colors.primaryDark,
  },
  headerCallButtonDisabled: {
    backgroundColor: colors.surfaceLight,
    opacity: 0.6,
  },
  headerCallButtonText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 14,
  },
  meAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  meAvatarText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },

  // Body
  body: {
    flex: 1,
  },

  // Online Users Section
  onlineSection: {
    paddingTop: 16,
    paddingBottom: 12,
  },
  onlineHeaderRow: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  onlineTitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  onlineCount: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  onlineUsersRow: {
    paddingHorizontal: 20,
    gap: 12,
  },
  userItem: {
    width: 80,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 10,
  },
  userItemSelected: {
    borderColor: colors.primary,
    backgroundColor: '#1E1B4B',
    borderWidth: 2,
  },
  userItemPressed: {
    transform: [{ scale: 0.96 }],
  },
  userAvatarWrap: {
    width: 48,
    height: 48,
    position: 'relative',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
  },
  unreadBadge: {
    position: 'absolute',
    right: -4,
    top: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
    borderWidth: 2,
    borderColor: colors.background,
  },
  unreadBadgeText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
  },
  userName: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    maxWidth: '100%',
    textAlign: 'center',
  },
  userPreview: {
    color: colors.textMuted,
    fontSize: 10,
    maxWidth: '100%',
    textAlign: 'center',
  },
  userOnlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.online,
    borderWidth: 3,
    borderColor: colors.surface,
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyStateTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Messages List
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  messageRowLeft: {
    justifyContent: 'flex-start',
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  bubbleMe: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 6,
  },
  bubbleOther: {
    backgroundColor: colors.surfaceLight,
    borderBottomLeftRadius: 6,
  },
  messageText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 21,
  },
  messageTime: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },

  // Composer
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 8,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 15,
    backgroundColor: colors.surface,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  sendButtonDisabled: {
    backgroundColor: colors.surfaceLight,
  },
  sendButtonPressed: {
    backgroundColor: colors.primaryDark,
  },
  sendButtonText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
  },

  // Call Overlay
  callBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  callSheet: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: 40,
    paddingHorizontal: 20,
  },
  callSheetFullscreen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 0,
    marginTop: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  callHeaderRow: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  callTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  callSubtitle: {
    marginTop: 6,
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
  callVideoStage: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    marginHorizontal: 0,
  },
  callVideoStageFullscreen: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 0,
  },
  callRemoteVideo: {
    width: '100%',
    height: '100%',
  },
  callPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  callPlaceholderText: {
    color: colors.textMuted,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  callLocalPreview: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 120,
    height: 170,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.surfaceLight,
    borderWidth: 3,
    borderColor: colors.border,
    zIndex: 10,
    elevation: 10,
  },
  callLocalPreviewVideo: {
    width: '100%',
    height: '100%',
  },
  callControlsRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  callButton: {
    height: 56,
    minWidth: 140,
    paddingHorizontal: 24,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButtonAccept: {
    backgroundColor: colors.secondary,
  },
  callButtonDecline: {
    backgroundColor: colors.danger,
  },
  callButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  callButtonText: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 16,
  },
  callControlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callControlButtonActive: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  callControlIcon: {
    fontSize: 24,
  },
  callFullscreenToggle: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
    elevation: 5,
  },
  callFullscreenIcon: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  callVideoOffPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  callVideoOffText: {
    marginTop: 16,
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },

  // Group Selection Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    color: colors.textSecondary,
    fontSize: 18,
    fontWeight: '600',
  },
  modalList: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  modalUserItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modalUserItemSelected: {
    borderColor: colors.primary,
    backgroundColor: '#1E1B4B',
  },
  modalUserAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    marginRight: 14,
  },
  modalUserName: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  modalCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCheckboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modalCheckmark: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modalButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonDisabled: {
    backgroundColor: colors.surfaceLight,
    opacity: 0.6,
  },
  modalButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },

  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabItemActive: {
    borderTopWidth: 2,
    borderTopColor: colors.primary,
  },
  tabLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  tabLabelActive: {
    color: colors.primary,
  },

  // Floating Action Button
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabPressed: {
    transform: [{ scale: 0.94 }],
    backgroundColor: colors.primaryDark,
  },
  fabIcon: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '300',
  },

  // Group Info Header
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  groupAvatarStack: {
    flexDirection: 'row',
    marginRight: 12,
  },
  groupAvatarStacked: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.surface,
    marginLeft: -8,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  groupMembers: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },

  // Photo Message Styles
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  messageImageLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
  },

  // Attachment Button
  attachButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  attachButtonPressed: {
    opacity: 0.7,
  },

  // Image Picker Modal
  imagePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  imagePickerContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  imagePickerHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 20,
  },
  imagePickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  imagePickerOptionPressed: {
    backgroundColor: colors.surfaceHover,
  },
  imagePickerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  imagePickerText: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
  },
  imagePickerCancel: {
    marginTop: 8,
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  imagePickerCancelText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '600',
  },

  // Profile Avatar (clickable)
  profileAvatarContainer: {
    position: 'relative',
  },
  profileAvatarEdit: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.header,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 12,
  },

  // Upload Progress
  uploadProgress: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadProgressText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
});

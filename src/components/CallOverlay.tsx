import React, { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RTCView, type MediaStream } from 'react-native-webrtc';

import { styles } from '../styles/chatStyles';
import {
  MicIcon,
  MicOffIcon,
  VideoIcon,
  VideoOffIcon,
  FlipCameraIcon,
  FullscreenIcon,
  FullscreenExitIcon,
  UserIcon,
} from './CallIcons';

type IncomingCall = {
  callId: string;
  fromUserId: string;
  isVideo: boolean;
};

type Props = {
  visible: boolean;
  mode: 'idle' | 'outgoing' | 'incoming' | 'connecting' | 'in_call';
  peerLabel: string;
  incomingCall: IncomingCall | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isAudioMuted: boolean;
  isVideoOff: boolean;
  onAccept: () => void;
  onReject: () => void;
  onEnd: () => void;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onFlipCamera: () => void;
};

export function CallOverlay({
  visible,
  mode,
  peerLabel,
  incomingCall,
  localStream,
  remoteStream,
  isAudioMuted,
  isVideoOff,
  onAccept,
  onReject,
  onEnd,
  onToggleAudio,
  onToggleVideo,
  onFlipCamera,
}: Props) {
  const safeAreaInsets = useSafeAreaInsets();
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.callBackdrop}>
        <View
          style={[
            isFullscreen ? styles.callSheetFullscreen : styles.callSheet,
            {
              paddingTop: safeAreaInsets.top + 12,
              paddingBottom: Math.max(safeAreaInsets.bottom, 12),
            },
          ]}
        >
          {!isFullscreen && (
            <View style={styles.callHeaderRow}>
              <Text style={styles.callTitle}>
                {mode === 'incoming' ? 'Incoming call' : 'Calling'}
              </Text>
              <Text style={styles.callSubtitle}>{peerLabel}</Text>
            </View>
          )}

          <View
            style={
              isFullscreen
                ? styles.callVideoStageFullscreen
                : styles.callVideoStage
            }
          >
            {remoteStream ? (
              <RTCView
                streamURL={remoteStream.toURL()}
                style={styles.callRemoteVideo}
                objectFit="cover"
              />
            ) : (
              <View style={styles.callPlaceholder}>
                <Text style={styles.callPlaceholderText}>
                  {mode === 'incoming'
                    ? 'Tap Accept to start'
                    : mode === 'connecting'
                    ? 'Connecting...'
                    : 'Waiting...'}
                </Text>
              </View>
            )}

            {localStream && !isVideoOff ? (
              <View style={styles.callLocalPreview}>
                <RTCView
                  streamURL={localStream.toURL()}
                  style={styles.callLocalPreviewVideo}
                  objectFit="cover"
                />
              </View>
            ) : null}

            {mode === 'in_call' && (
              <Pressable
                style={styles.callFullscreenToggle}
                onPress={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? (
                  <FullscreenExitIcon size={20} color="#FFFFFF" />
                ) : (
                  <FullscreenIcon size={20} color="#FFFFFF" />
                )}
              </Pressable>
            )}

            {remoteStream && !remoteStream.getVideoTracks()[0]?.enabled && (
              <View style={styles.callVideoOffPlaceholder}>
                <UserIcon size={64} color="#666666" />
                <Text style={styles.callVideoOffText}>Video off</Text>
              </View>
            )}
          </View>

          {mode === 'incoming' && incomingCall ? (
            <View style={styles.callControlsRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.callButton,
                  styles.callButtonDecline,
                  pressed ? styles.callButtonPressed : null,
                ]}
                onPress={onReject}
              >
                <Text style={styles.callButtonText}>Reject</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.callButton,
                  styles.callButtonAccept,
                  pressed ? styles.callButtonPressed : null,
                ]}
                onPress={onAccept}
              >
                <Text style={styles.callButtonText}>Accept</Text>
              </Pressable>
            </View>
          ) : mode === 'in_call' ? (
            <View style={styles.callControlsRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.callControlButton,
                  isAudioMuted ? styles.callControlButtonActive : null,
                  pressed ? styles.callButtonPressed : null,
                ]}
                onPress={onToggleAudio}
              >
                {isAudioMuted ? (
                  <MicOffIcon size={24} color="#FFFFFF" />
                ) : (
                  <MicIcon size={24} color="#FFFFFF" />
                )}
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.callControlButton,
                  isVideoOff ? styles.callControlButtonActive : null,
                  pressed ? styles.callButtonPressed : null,
                ]}
                onPress={onToggleVideo}
              >
                {isVideoOff ? (
                  <VideoOffIcon size={24} color="#FFFFFF" />
                ) : (
                  <VideoIcon size={24} color="#FFFFFF" />
                )}
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.callControlButton,
                  pressed ? styles.callButtonPressed : null,
                ]}
                onPress={onFlipCamera}
              >
                <FlipCameraIcon size={24} color="#FFFFFF" />
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.callButton,
                  styles.callButtonDecline,
                  pressed ? styles.callButtonPressed : null,
                ]}
                onPress={onEnd}
              >
                <Text style={styles.callButtonText}>End</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.callControlsRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.callButton,
                  styles.callButtonDecline,
                  pressed ? styles.callButtonPressed : null,
                ]}
                onPress={onEnd}
              >
                <Text style={styles.callButtonText}>End</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

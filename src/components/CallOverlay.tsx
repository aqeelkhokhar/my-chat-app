import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RTCView, type MediaStream } from 'react-native-webrtc';

import { styles } from '../styles/chatStyles';

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
  onAccept: () => void;
  onReject: () => void;
  onEnd: () => void;
};

export function CallOverlay({
  visible,
  mode,
  peerLabel,
  incomingCall,
  localStream,
  remoteStream,
  onAccept,
  onReject,
  onEnd,
}: Props) {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.callBackdrop}>
        <View
          style={[
            styles.callSheet,
            {
              paddingTop: safeAreaInsets.top + 12,
              paddingBottom: Math.max(safeAreaInsets.bottom, 12),
            },
          ]}
        >
          <View style={styles.callHeaderRow}>
            <Text style={styles.callTitle}>
              {mode === 'incoming' ? 'Incoming call' : 'Calling'}
            </Text>
            <Text style={styles.callSubtitle}>{peerLabel}</Text>
          </View>

          <View style={styles.callVideoStage}>
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

            {localStream ? (
              <RTCView
                streamURL={localStream.toURL()}
                style={styles.callLocalPreview}
                objectFit="cover"
              />
            ) : null}
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

import { useCallback, useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import {
  mediaDevices,
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  type MediaStream,
} from 'react-native-webrtc';

import { socket } from '../services/socket';

type CallMode = 'idle' | 'outgoing' | 'incoming' | 'connecting' | 'in_call';

type IncomingCall = {
  callId: string;
  fromUserId: string;
  isVideo: boolean;
};

type StartCallArgs = {
  toUserId: string;
  isVideo?: boolean;
};

type SignalingInvite = {
  callId: string;
  fromUserId: string;
  toUserId: string;
  isVideo: boolean;
};

type SignalingOffer = {
  callId: string;
  fromUserId: string;
  toUserId: string;
  sdp: RTCSessionDescriptionInit;
  isVideo: boolean;
};

type SignalingAnswer = {
  callId: string;
  fromUserId: string;
  toUserId: string;
  sdp: RTCSessionDescriptionInit;
};

type SignalingIce = {
  callId: string;
  fromUserId: string;
  toUserId: string;
  candidate: RTCIceCandidateInit;
};

type SignalingEnd = {
  callId: string;
  fromUserId: string;
  toUserId: string;
  reason?: string;
};

type CallAccepted = {
  callId: string;
  fromUserId: string;
  toUserId: string;
};

type CallRejected = {
  callId: string;
  fromUserId: string;
  toUserId: string;
  reason?: string | null;
};

type CallEnded = {
  callId: string;
  fromUserId: string;
  toUserId: string;
  reason?: string | null;
};

const ICE_CONFIG = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

type RTCSessionDescriptionInit = {
  type: string;
  sdp: string;
};

type RTCIceCandidateInit = {
  candidate: string;
  sdpMid?: string;
  sdpMLineIndex?: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}

function readString(obj: Record<string, unknown>, key: string) {
  const v = obj[key];
  return typeof v === 'string' ? v : null;
}

function readBoolean(obj: Record<string, unknown>, key: string) {
  const v = obj[key];
  return typeof v === 'boolean' ? v : null;
}

function readSessionDescription(
  value: unknown,
): RTCSessionDescriptionInit | null {
  if (!isRecord(value)) {
    return null;
  }
  const type = readString(value, 'type');
  const sdp = readString(value, 'sdp');
  if (!type || !sdp) {
    return null;
  }
  return { type, sdp };
}

function readIceCandidate(value: unknown): RTCIceCandidateInit | null {
  if (!isRecord(value)) {
    return null;
  }
  const candidate = readString(value, 'candidate');
  if (!candidate) {
    return null;
  }

  const sdpMid = readString(value, 'sdpMid');
  const sdpMLineIndexRaw = value.sdpMLineIndex;
  const sdpMLineIndex =
    typeof sdpMLineIndexRaw === 'number' ? sdpMLineIndexRaw : null;

  return {
    candidate,
    sdpMid: sdpMid ?? undefined,
    sdpMLineIndex: sdpMLineIndex ?? undefined,
  };
}

function makeCallId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function ensureMediaPermissions() {
  if (Platform.OS !== 'android') {
    return true;
  }

  const results = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.CAMERA,
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
  ]);

  const cameraOk =
    results[PermissionsAndroid.PERMISSIONS.CAMERA] ===
    PermissionsAndroid.RESULTS.GRANTED;
  const micOk =
    results[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] ===
    PermissionsAndroid.RESULTS.GRANTED;

  return cameraOk && micOk;
}

export function useWebRTCCall(userId: string | null) {
  const [mode, setMode] = useState<CallMode>('idle');
  const [peerUserId, setPeerUserId] = useState<string | null>(null);
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const callIdRef = useRef<string | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const pendingRemoteOfferRef = useRef<RTCSessionDescriptionInit | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const isVideoRef = useRef(true);
  const acceptRequestedRef = useRef(false);
  const outgoingReadyRef = useRef(false);

  const cleanup = useCallback(() => {
    pendingRemoteOfferRef.current = null;
    pendingCandidatesRef.current = [];
    callIdRef.current = null;
    isVideoRef.current = true;
    acceptRequestedRef.current = false;
    outgoingReadyRef.current = false;

    try {
      pcRef.current?.close();
    } catch {
      // ignore
    }
    pcRef.current = null;

    localStream?.getTracks().forEach(t => t.stop());
    remoteStream?.getTracks().forEach(t => t.stop());

    setLocalStream(null);
    setRemoteStream(null);
    setIncomingCall(null);
    setPeerUserId(null);
    setMode('idle');
  }, [localStream, remoteStream]);

  const createPeerConnection = useCallback(
    async (targetUserId: string, callId: string) => {
      const pc = new RTCPeerConnection(ICE_CONFIG);
      pcRef.current = pc;

      const pcAny = pc as unknown as {
        onicecandidate?: (event: any) => void;
        ontrack?: (event: any) => void;
      };

      pcAny.onicecandidate = (event: any) => {
        if (!event.candidate || !userId) {
          return;
        }

        const payload: SignalingIce = {
          callId,
          fromUserId: userId,
          toUserId: targetUserId,
          candidate: event.candidate.toJSON() as RTCIceCandidateInit,
        };
        socket.emit('webrtc_ice_candidate', payload, (ack: any) => {
          console.log('[webrtc] ack webrtc_ice_candidate', ack);
        });
      };

      pcAny.ontrack = (event: any) => {
        const [stream] = event.streams;
        if (stream) {
          setRemoteStream(stream);
        }
      };

      return pc;
    },
    [userId],
  );

  const getLocalStream = useCallback(async (isVideo: boolean) => {
    const devices = (await mediaDevices.enumerateDevices()) as any[];
    const videoSourceId = devices.find(
      (d: any) => d.kind === 'videoinput' && d.facing === 'front',
    )?.deviceId;

    const stream = await mediaDevices.getUserMedia({
      audio: true,
      video: isVideo
        ? {
            facingMode: 'user',
            deviceId: videoSourceId,
            frameRate: 30,
            width: 640,
            height: 480,
          }
        : false,
    });

    setLocalStream(stream);
    return stream;
  }, []);

  const flushQueuedCandidates = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc || !pc.remoteDescription) {
      return;
    }

    const queued = [...pendingCandidatesRef.current];
    pendingCandidatesRef.current = [];

    for (const c of queued) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(c));
      } catch {
        // ignore
      }
    }
  }, []);

  const startCall = useCallback(
    async ({ toUserId, isVideo = true }: StartCallArgs) => {
      if (!userId || !toUserId.trim()) {
        console.log('[webrtc] startCall ignored (missing userId/toUserId)', {
          userId,
          toUserId,
        });
        return;
      }

      const ok = await ensureMediaPermissions();
      if (!ok) {
        console.log('[webrtc] startCall aborted (permissions denied)');
        return;
      }

      const callId = makeCallId();
      callIdRef.current = callId;
      isVideoRef.current = isVideo;
      setPeerUserId(toUserId);
      setMode('outgoing');

      console.log('[webrtc] startCall', {
        callId,
        fromUserId: userId,
        toUserId,
        isVideo,
      });

      const pc = await createPeerConnection(toUserId, callId);
      const stream = await getLocalStream(isVideo);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const invite: SignalingInvite = {
        callId,
        fromUserId: userId,
        toUserId,
        isVideo,
      };
      socket.emit('call_user', invite, (ack: any) => {
        console.log('[webrtc] ack call_user', ack);
      });
      console.log('[webrtc] emit call_user', invite);

      setMode('connecting');
    },
    [createPeerConnection, getLocalStream, userId],
  );

  const acceptIncoming = useCallback(async () => {
    if (!userId || !incomingCall) {
      console.log(
        '[webrtc] acceptIncoming ignored (missing userId/incomingCall)',
      );
      return;
    }

    const ok = await ensureMediaPermissions();
    if (!ok) {
      console.log('[webrtc] acceptIncoming aborted (permissions denied)');
      return;
    }

    const { callId, fromUserId, isVideo } = incomingCall;

    acceptRequestedRef.current = true;

    console.log('[webrtc] acceptIncoming', {
      callId,
      fromUserId: userId,
      toUserId: fromUserId,
      isVideo,
      hasOffer: !!pendingRemoteOfferRef.current,
    });

    callIdRef.current = callId;
    isVideoRef.current = isVideo;
    setPeerUserId(fromUserId);
    setMode('connecting');

    socket.emit(
      'accept_call',
      {
        callId,
        toUserId: fromUserId,
      },
      (ack: any) => {
        console.log('[webrtc] ack accept_call', ack);
      },
    );
    console.log('[webrtc] emit accept_call', {
      callId,
      fromUserId: userId,
      toUserId: fromUserId,
    });

    const pc = await createPeerConnection(fromUserId, callId);
    const stream = await getLocalStream(isVideo);
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    const offer = pendingRemoteOfferRef.current;
    if (!offer) {
      console.log(
        '[webrtc] acceptIncoming missing offer - waiting for webrtc_offer',
      );
      return;
    }

    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    await flushQueuedCandidates();

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    const payload: SignalingAnswer = {
      callId,
      fromUserId: userId,
      toUserId: fromUserId,
      sdp: answer,
    };
    socket.emit('webrtc_answer', payload, (ack: any) => {
      console.log('[webrtc] ack webrtc_answer', ack);
    });

    console.log('[webrtc] emit webrtc_answer', {
      callId,
      fromUserId: userId,
      toUserId: fromUserId,
    });

    setIncomingCall(null);
    setMode('in_call');
  }, [
    createPeerConnection,
    flushQueuedCandidates,
    getLocalStream,
    incomingCall,
    userId,
  ]);

  const rejectIncoming = useCallback(() => {
    if (!userId || !incomingCall) {
      return;
    }

    console.log('[webrtc] rejectIncoming', {
      callId: incomingCall.callId,
      fromUserId: userId,
      toUserId: incomingCall.fromUserId,
    });

    socket.emit(
      'reject_call',
      {
        callId: incomingCall.callId,
        fromUserId: userId,
        toUserId: incomingCall.fromUserId,
      },
      (ack: any) => {
        console.log('[webrtc] ack reject_call', ack);
      },
    );

    cleanup();
  }, [cleanup, incomingCall, userId]);

  const endCall = useCallback(
    (reason?: string) => {
      const callId = callIdRef.current;
      const peer = peerUserId;
      if (userId && callId && peer) {
        console.log('[webrtc] endCall emit end_call', {
          callId,
          fromUserId: userId,
          toUserId: peer,
          reason,
        });
        const payload: SignalingEnd = {
          callId,
          fromUserId: userId,
          toUserId: peer,
          reason,
        };
        socket.emit('end_call', payload, (ack: any) => {
          console.log('[webrtc] ack end_call', ack);
        });
      }

      cleanup();
    },
    [cleanup, peerUserId, userId],
  );

  useEffect(() => {
    const onIncomingCall = (data: unknown) => {
      if (!userId || !isRecord(data)) {
        return;
      }

      const callId = readString(data, 'callId');
      const fromUserId = readString(data, 'fromUserId');
      const isVideo = readBoolean(data, 'isVideo') ?? true;

      if (!callId || !fromUserId) {
        return;
      }

      console.log('[webrtc] recv call_invite/incoming_call', {
        callId,
        fromUserId,
        toUserId: userId,
        mode,
      });

      if (mode !== 'idle') {
        socket.emit('call_reject', {
          callId,
          fromUserId: userId,
          toUserId: fromUserId,
        });
        return;
      }

      callIdRef.current = callId;
      isVideoRef.current = isVideo;
      setIncomingCall({ callId, fromUserId, isVideo });
      setPeerUserId(fromUserId);
      setMode('incoming');
    };

    const onCallAccepted = async (data: unknown) => {
      if (!isRecord(data)) {
        return;
      }

      const callId = readString(data, 'callId');
      const fromUserId = readString(data, 'fromUserId');
      if (!callId || !fromUserId) {
        return;
      }

      console.log('[webrtc] recv call_accepted', {
        callId,
        fromUserId,
        toUserId: userId,
      });

      if (callIdRef.current && callIdRef.current !== callId) {
        return;
      }

      const pc = pcRef.current;
      const peer = peerUserId;
      if (!pc || !peer || !userId) {
        return;
      }

      if (outgoingReadyRef.current) {
        return;
      }
      outgoingReadyRef.current = true;

      try {
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: isVideoRef.current,
        });
        await pc.setLocalDescription(offer);

        socket.emit(
          'webrtc_offer',
          {
            callId,
            fromUserId: userId,
            toUserId: peer,
            sdp: offer,
          },
          (ack: any) => {
            console.log('[webrtc] ack webrtc_offer', ack);
          },
        );

        console.log('[webrtc] emit webrtc_offer', {
          callId,
          fromUserId: userId,
          toUserId: peer,
        });
      } catch (e) {
        console.log('[webrtc] failed to create/send offer', e);
      }
    };

    const onCallRejected = (data: unknown) => {
      if (!isRecord(data)) {
        cleanup();
        return;
      }

      const callId = readString(data, 'callId');
      console.log('[webrtc] recv call_rejected', {
        callId,
        reason: data.reason,
      });
      cleanup();
    };

    const onOffer = (data: unknown) => {
      if (!isRecord(data)) {
        return;
      }

      const callId = readString(data, 'callId');
      const fromUserId = readString(data, 'fromUserId');
      const sdp = readSessionDescription(data.sdp);
      const isVideo = readBoolean(data, 'isVideo') ?? true;
      if (!callId || !fromUserId || !sdp) {
        return;
      }

      console.log('[webrtc] recv webrtc_offer', {
        callId,
        fromUserId,
        toUserId: userId,
        mode,
      });

      if (callIdRef.current && callIdRef.current !== callId) {
        console.log('[webrtc] ignoring webrtc_offer (callId mismatch)', {
          existing: callIdRef.current,
          received: callId,
        });
        return;
      }

      pendingRemoteOfferRef.current = sdp;
      callIdRef.current = callId;
      isVideoRef.current = isVideo;
      setPeerUserId(fromUserId);

      const maybeFinalizeAccept = async () => {
        const pc = pcRef.current;
        if (!pc) {
          return;
        }
        if (!acceptRequestedRef.current) {
          return;
        }

        try {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          await flushQueuedCandidates();

          if (!userId) {
            return;
          }

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socket.emit(
            'webrtc_answer',
            {
              callId,
              fromUserId: userId,
              toUserId: fromUserId,
              sdp: answer,
            },
            (ack: any) => {
              console.log('[webrtc] ack webrtc_answer', ack);
            },
          );

          console.log('[webrtc] auto-emit webrtc_answer after delayed offer', {
            callId,
            fromUserId: userId,
            toUserId: fromUserId,
          });

          setIncomingCall(null);
          setMode('in_call');
        } catch (e) {
          console.log('[webrtc] failed to finalize accept after offer', e);
        }
      };

      if (mode === 'idle') {
        setIncomingCall({
          callId,
          fromUserId,
          isVideo,
        });
        setMode('incoming');
      } else if (mode === 'connecting') {
        void maybeFinalizeAccept();
      }
    };

    const onAnswer = async (data: unknown) => {
      if (!isRecord(data)) {
        return;
      }

      const callId = readString(data, 'callId');
      const sdp = readSessionDescription(data.sdp);
      if (!callId || !sdp) {
        return;
      }

      console.log('[webrtc] recv webrtc_answer', {
        callId,
        toUserId: userId,
        mode,
      });

      if (callIdRef.current && callIdRef.current !== callId) {
        console.log('[webrtc] ignoring webrtc_answer (callId mismatch)', {
          existing: callIdRef.current,
          received: callId,
        });
        return;
      }

      const pc = pcRef.current;
      if (!pc) {
        return;
      }

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        await flushQueuedCandidates();
        setMode('in_call');
      } catch {
        // ignore
      }
    };

    const onIce = async (data: unknown) => {
      if (!isRecord(data)) {
        return;
      }

      const callId = readString(data, 'callId');
      const candidate = readIceCandidate(data.candidate);
      if (!callId || !candidate) {
        return;
      }

      if (callIdRef.current && callIdRef.current !== callId) {
        console.log(
          '[webrtc] ignoring webrtc_ice_candidate (callId mismatch)',
          {
            existing: callIdRef.current,
            received: callId,
          },
        );
        return;
      }

      const pc = pcRef.current;
      if (!pc) {
        pendingCandidatesRef.current.push(candidate);
        return;
      }

      if (!pc.remoteDescription) {
        pendingCandidatesRef.current.push(candidate);
        return;
      }

      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {
        // ignore
      }
    };

    const onEnd = (data: unknown) => {
      if (!isRecord(data)) {
        return;
      }

      const callId = readString(data, 'callId');
      if (!callId) {
        return;
      }

      console.log('[webrtc] recv call_ended', {
        callId,
        toUserId: userId,
      });

      if (callIdRef.current && callIdRef.current !== callId) {
        return;
      }

      cleanup();
    };

    socket.on('incoming_call', onIncomingCall);
    socket.on('call_accepted', onCallAccepted);
    socket.on('call_rejected', onCallRejected);
    socket.on('webrtc_offer', onOffer);
    socket.on('webrtc_answer', onAnswer);
    socket.on('webrtc_ice_candidate', onIce);
    socket.on('call_ended', onEnd);

    return () => {
      socket.off('incoming_call', onIncomingCall);
      socket.off('call_accepted', onCallAccepted);
      socket.off('call_rejected', onCallRejected);
      socket.off('webrtc_offer', onOffer);
      socket.off('webrtc_answer', onAnswer);
      socket.off('webrtc_ice_candidate', onIce);
      socket.off('call_ended', onEnd);
    };
  }, [cleanup, flushQueuedCandidates, mode, userId]);

  return {
    mode,
    peerUserId,
    incomingCall,
    localStream,
    remoteStream,
    startCall,
    acceptIncoming,
    rejectIncoming,
    endCall,
  };
}

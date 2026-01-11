import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

type IconProps = {
  size?: number;
  color?: string;
};

export function PhoneIcon({ size = 24, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 16.92V19.92C22 20.48 21.56 20.93 21 20.98C20.55 21.02 20.11 21.04 19.67 21.04C10.78 21.04 3.5 13.76 3.5 4.87C3.5 4.43 3.52 3.99 3.56 3.54C3.61 2.98 4.06 2.54 4.62 2.54H7.62C8.11 2.54 8.53 2.88 8.62 3.36C8.79 4.24 9.07 5.09 9.45 5.89C9.6 6.21 9.52 6.59 9.26 6.83L7.82 8.27C9.23 10.94 11.4 13.11 14.07 14.52L15.51 13.08C15.75 12.82 16.13 12.74 16.45 12.89C17.25 13.27 18.1 13.55 18.98 13.72C19.46 13.81 19.8 14.23 19.8 14.72V17.72C19.8 17.72 22 16.92 22 16.92Z"
        fill={color}
      />
    </Svg>
  );
}

export function VideoCallIcon({ size = 24, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="6" width="13" height="12" rx="2" fill={color} />
      <Path d="M15 10L21 6V18L15 14V10Z" fill={color} />
    </Svg>
  );
}

export function GroupIcon({ size = 24, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="9" cy="7" r="3.5" stroke={color} strokeWidth="2" />
      <Path
        d="M2 19C2 15.6863 5.13401 13 9 13C12.866 13 16 15.6863 16 19"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Circle cx="17" cy="8" r="2.5" stroke={color} strokeWidth="1.5" />
      <Path
        d="M22 18C22 15.7909 19.9853 14 17.5 14C16.5 14 15.5 14.3 14.7 14.8"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ChatIcon({ size = 24, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 11.5C21 16.1944 16.9706 20 12 20C10.5 20 9.1 19.7 7.8 19.1L3 20L4.3 16.1C3.5 14.7 3 13.1 3 11.5C3 6.80558 7.02944 3 12 3C16.9706 3 21 6.80558 21 11.5Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="8" cy="11.5" r="1" fill={color} />
      <Circle cx="12" cy="11.5" r="1" fill={color} />
      <Circle cx="16" cy="11.5" r="1" fill={color} />
    </Svg>
  );
}

export function SendIcon({ size = 24, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 2L11 13"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M22 2L15 22L11 13L2 9L22 2Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function BackIcon({ size = 24, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18L9 12L15 6"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function MoreIcon({ size = 24, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="5" r="1.5" fill={color} />
      <Circle cx="12" cy="12" r="1.5" fill={color} />
      <Circle cx="12" cy="19" r="1.5" fill={color} />
    </Svg>
  );
}

export function MicIcon({ size = 24, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 14C13.66 14 15 12.66 15 11V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V11C9 12.66 10.34 14 12 14Z"
        fill={color}
      />
      <Path
        d="M17 11C17 14.31 14.31 17 11 17M17 11H19M17 11C17 7.69 14.31 5 11 5M11 17C7.69 17 5 14.31 5 11M11 17V21M5 11H3M5 11C5 7.69 7.69 5 11 5M11 21H13M11 5V2"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function MicOffIcon({ size = 24, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 14C13.66 14 15 12.66 15 11V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V11C9 12.66 10.34 14 12 14Z"
        fill={color}
      />
      <Path
        d="M17 11H19M5 11H3M12 17V21M10 21H14"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M4 4L20 20"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function VideoIcon({ size = 24, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 7C3 5.89543 3.89543 5 5 5H14C15.1046 5 16 5.89543 16 7V17C16 18.1046 15.1046 19 14 19H5C3.89543 19 3 18.1046 3 17V7Z"
        fill={color}
      />
      <Path d="M16 9.5L21 6.5V17.5L16 14.5V9.5Z" fill={color} />
    </Svg>
  );
}

export function VideoOffIcon({ size = 24, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 7C3 5.89543 3.89543 5 5 5H14C15.1046 5 16 5.89543 16 7V17C16 18.1046 15.1046 19 14 19H5C3.89543 19 3 18.1046 3 17V7Z"
        fill={color}
      />
      <Path d="M16 9.5L21 6.5V17.5L16 14.5V9.5Z" fill={color} />
      <Path
        d="M3 3L21 21"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function FlipCameraIcon({ size = 24, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 5H17L15.5 3.5H8.5L7 5H4C2.9 5 2 5.9 2 7V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V7C22 5.9 21.1 5 20 5Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="13" r="3.5" stroke={color} strokeWidth="1.5" />
      <Path
        d="M8.5 9.5L7 11H9"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.5 16.5L17 15H15"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function FullscreenIcon({ size = 24, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 4V9M4 4H9M4 4L9 9"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20 4V9M20 4H15M20 4L15 9"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4 20V15M4 20H9M4 20L9 15"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20 20V15M20 20H15M20 20L15 15"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function FullscreenExitIcon({
  size = 24,
  color = '#FFFFFF',
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 4V9M9 9H4M9 9L4 4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15 4V9M15 9H20M15 9L20 4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 20V15M9 15H4M9 15L4 20"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15 20V15M15 15H20M15 15L20 20"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function UserIcon({ size = 24, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="12"
        cy="8"
        r="4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

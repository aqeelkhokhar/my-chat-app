# My Chat App

A real time chat app in React Native with messaging, image sharing and one to one voice and video calls. It talks to the Socket.IO server in [rn-chat-server](https://github.com/aqeelkhokhar/rn-chat-server).

## Features

- Real time direct messaging over Socket.IO
- Online presence
- Image sharing with upload through the camera roll picker
- One to one voice and video calls over WebRTC
- Local notifications for new messages and incoming calls
- Anonymous user identity stored on the device, no sign up needed

## How it is built

| Area | Choice |
| --- | --- |
| App | React Native 0.83, React 19, TypeScript |
| Real time | socket.io-client |
| Calls | react-native-webrtc, with signaling through the server |
| Notifications | Notifee |
| Images | react-native-image-picker, cloud upload |

The code is split into hooks per concern (`useChat`, `useWebRTCCall`, `useNotifications`), services for sockets and uploads, and small presentational components such as the call overlay.

```
src/
  hooks/       chat, calls, notifications, user id
  services/    socket, image picker, cloud upload
  components/  call overlay and icons
  screens/     chat screen
```

## Run it

1. Start the server from [rn-chat-server](https://github.com/aqeelkhokhar/rn-chat-server) and point `src/services/socket.ts` at it.
2. Add your own Firebase `google-services.json` to `android/app/`. It is not included in this repository.
3. Install and run.

```sh
yarn install
yarn android
```

## Author

Built by [Aqeel Ahmad](https://github.com/aqeelkhokhar), Senior Mobile Engineer. Portfolio https://aqeel-ahmad-portfolio.vercel.app/

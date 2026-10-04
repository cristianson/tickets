import { useSyncExternalStore } from "react";
import { motionValue } from "framer-motion";

// iOS Safari (13+) only delivers `deviceorientation` events after the page asks
// for permission, and that request must come from a user gesture (a tap).
// Android and other browsers deliver them without asking.
type OrientationEventWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

// - unknown:    not determined yet (server render / before hydration)
// - not-needed: events arrive without asking (Android, desktop)
// - prompt:     permission must be requested from a tap (iOS)
// - granted / denied: the user's answer to the prompt
export type TiltPermission = "unknown" | "not-needed" | "prompt" | "granted" | "denied";

let status: TiltPermission = "unknown";
const listeners = new Set<() => void>();

function setStatus(next: TiltPermission) {
  status = next;
  listeners.forEach((listener) => listener());
}

function getRequestPermission() {
  if (typeof DeviceOrientationEvent === "undefined") return undefined;
  const { requestPermission } = DeviceOrientationEvent as OrientationEventWithPermission;
  return typeof requestPermission === "function"
    ? () => requestPermission.call(DeviceOrientationEvent)
    : undefined;
}

function init() {
  if (status !== "unknown") return;
  const requestPermission = getRequestPermission();
  if (!requestPermission) {
    status = "not-needed";
    return;
  }
  status = "prompt";
  // If access was already granted earlier, this resolves without showing a
  // prompt, so returning visitors don't see the button again. Without a prior
  // grant it rejects (no user gesture) and the button stays.
  requestPermission().then(
    (result) => result === "granted" && setStatus("granted"),
    () => {}
  );
}

function subscribe(listener: () => void) {
  init();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useTiltPermission(): TiltPermission {
  return useSyncExternalStore(
    subscribe,
    () => {
      init();
      return status;
    },
    () => "unknown"
  );
}

// Must be called from a tap handler: shows the iOS motion access prompt.
export async function requestTiltPermission() {
  const requestPermission = getRequestPermission();
  if (!requestPermission) return;
  try {
    setStatus((await requestPermission()) === "granted" ? "granted" : "denied");
  } catch {
    setStatus("denied");
  }
}

// Maximum card tilt in degrees (shared with the desktop mouse tilt).
export const MAX_TILT = 10;
// Card degrees per degree the phone is tilted away from its resting position.
const GYRO_GAIN = 0.6;
// How far (in phone degrees) the phone can move from the resting position
// before the card is at MAX_TILT.
const GYRO_RANGE = MAX_TILT / GYRO_GAIN;

// The card tilt from the gyroscope, shared by every ticket on the page. It lives
// outside the components so it survives anything that re-renders or replaces
// them (changing city, switching theme): a ticket picks up the current tilt
// instead of starting flat.
export const gyroTilt = { x: motionValue(0), y: motionValue(0) };

let listening = false;

// Starts listening to the gyroscope (once per page). The resting position is
// how the phone was held when tilt started; holding the phone still keeps the
// card where it is. If the phone moves further than the card can follow (e.g.
// the user lies down), the resting position is dragged along, so the card stays
// responsive instead of getting stuck at its maximum tilt.
export function startGyroTilt() {
  if (listening) return;
  listening = true;
  let rest: { x: number; y: number } | null = null;
  const follow = (value: number, restValue: number) =>
    Math.min(Math.max(restValue, value - GYRO_RANGE), value + GYRO_RANGE);
  window.addEventListener("deviceorientation", (event) => {
    const tilt = screenTilt(event);
    if (!tilt) return;
    rest = rest ? { x: follow(tilt.x, rest.x), y: follow(tilt.y, rest.y) } : tilt;
    gyroTilt.x.set(-(tilt.x - rest.x) * GYRO_GAIN);
    gyroTilt.y.set((tilt.y - rest.y) * GYRO_GAIN);
  });
}

// Converts an orientation event to tilt around the screen's horizontal (x) and
// vertical (y) axes, accounting for the screen being rotated to landscape.
function screenTilt(event: DeviceOrientationEvent): { x: number; y: number } | null {
  const { beta, gamma } = event;
  if (beta === null || gamma === null) return null;
  switch (screen.orientation?.angle ?? 0) {
    case 90:
      return { x: -gamma, y: beta };
    case 180:
      return { x: -beta, y: -gamma };
    case 270:
      return { x: gamma, y: -beta };
    default:
      return { x: beta, y: gamma };
  }
}

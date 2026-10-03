// iOS Safari (13+) only delivers `deviceorientation` events after the page asks
// for permission, and that request must come from a user gesture. Android and
// other browsers deliver them without asking.
type OrientationEventWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

let requested = false;

// Ask for motion access on the first tap anywhere on the page (no-op where no
// permission is needed). Retries on later taps if the first gesture didn't
// count as a user activation (e.g. it was a swipe rather than a tap).
export function requestTiltPermissionOnFirstTap() {
  if (requested || typeof DeviceOrientationEvent === "undefined") return;
  const { requestPermission } = DeviceOrientationEvent as OrientationEventWithPermission;
  if (typeof requestPermission !== "function") return;
  requested = true;

  const onTap = () => {
    requestPermission.call(DeviceOrientationEvent).then(
      () => document.removeEventListener("touchend", onTap),
      (error: unknown) => {
        // NotAllowedError: not a user activation, try again on the next tap.
        if (!(error instanceof DOMException && error.name === "NotAllowedError")) {
          document.removeEventListener("touchend", onTap);
        }
      }
    );
  };
  document.addEventListener("touchend", onTap);
}

// Converts an orientation event to tilt around the screen's horizontal (x) and
// vertical (y) axes, accounting for the screen being rotated to landscape.
export function screenTilt(event: DeviceOrientationEvent): { x: number; y: number } | null {
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

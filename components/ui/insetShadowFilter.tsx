type Props = {
  id: string;
  dy: number;
  blur: number;
  opacity: number;
};

// Embossed "inset shadow" effect for the icon glyphs. Each SVG must pass a
// unique `id` (via useId): duplicate ids make every icon on the page resolve
// `url(#id)` to whichever filter appears first in the DOM.
export default function InsetShadowFilter({ id, dy, blur, opacity }: Props) {
  return (
    <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
      <feOffset dx="0" dy={dy} in="SourceAlpha" result="offset_shadow" />
      <feGaussianBlur stdDeviation={blur} in="offset_shadow" result="blur_shadow" />
      <feComposite operator="out" in="SourceGraphic" in2="blur_shadow" result="inverse_shadow" />
      <feFlood floodColor="black" floodOpacity={opacity} result="shadow_color" />
      <feComposite operator="in" in="shadow_color" in2="inverse_shadow" result="final_inset_shadow" />
      <feMerge>
        <feMergeNode in="SourceGraphic" />
        <feMergeNode in="final_inset_shadow" />
      </feMerge>
    </filter>
  );
}

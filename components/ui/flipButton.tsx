type FlipButtonProps = {
  onClick: () => void;
  className?: string;
};

export default function FlipButton({
  onClick,
  className = "",
}: FlipButtonProps) {
  const baseStyles = `
    h-9
    px-3
    bg-white
    rounded-xl
    border border-gray-200
    inline-flex
    gap-1.5
    items-center
    justify-center
    transition-all duration-200
    hover:bg-gray-50
    active:scale-95
    shadow-xsSkeumorphic
  `;

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${className} text-gray-600`}
    >
      <span
        className="text-sm font-medium"
        style={{
          backgroundColor: "#0A0D12",
          color: "transparent",
          textShadow: "0px 0.4px 0.6px rgba(255,255,255,0.4)",
          WebkitBackgroundClip: "text",
          MozBackgroundClip: "text",
          backgroundClip: "text",
        }}
      >
        Flip ticket
      </span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        shape-rendering="geometricPrecision"
      >
        <g filter="url(#filter0_i_9690_5562)">
          <path
            d="M2.5 7.50033H13.75C15.8211 7.50033 17.5 9.17926 17.5 11.2503C17.5 13.3214 15.8211 15.0003 13.75 15.0003H10M2.5 7.50033L5.83333 4.16699M2.5 7.50033L5.83333 10.8337"
            stroke="#535862"
            strokeWidth="1.66667"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </g>
        <defs>
          <filter
            id="filter0_i_9690_5562"
            x="0"
            y="0"
            width="100%"
            height="100%"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="linearRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="0.4" />
            <feGaussianBlur stdDeviation="0.3" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"
            />
            <feBlend
              mode="normal"
              in2="shape"
              result="effect1_innerShadow_9690_5562"
            />
          </filter>
        </defs>
      </svg>
    </button>
  );
}

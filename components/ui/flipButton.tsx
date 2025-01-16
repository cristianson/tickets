type FlipButtonProps = {
  onClick: () => void;
  className?: string;
};

export default function FlipButton({
  onClick,
  className = "",
}: FlipButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:bg-white/90 transition-colors z-50 ${className}`}
    >
      Flip
    </button>
  );
}

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
    bg-white dark:bg-gray-800
    rounded-xl
    border border-gray-200 dark:border-gray-600
    inline-flex gap-1.5 items-center justify-center
    transition-transform transition-colors duration-300 ease-in-out
    hover:bg-gray-50 dark:hover:bg-gray-700
    active:scale-95
    shadow-xsSkeumorphic
  `;

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${className} text-gray-600 dark:text-gray-100 transition-colors duration-200`}
    >
      <span className="text-sm font-medium">Flip ticket</span>
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M3 8.00002H14.25C16.3211 8.00002 18 9.67895 18 11.75C18 13.8211 16.3211 15.5 14.25 15.5H10.5M3 8.00002L6.33333 4.66669M3 8.00002L6.33333 11.3334"
          stroke="currentColor"
          strokeWidth="1.66667"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

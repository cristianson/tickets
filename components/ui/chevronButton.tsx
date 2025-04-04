import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  position?: "left" | "right";
  isMobile?: boolean;
  variant?: "next" | "previous";
}

const Button = ({
  className,
  position,
  isMobile = false,
  variant,
  ...props
}: ButtonProps) => {
  const baseStyles = `
    w-9 h-9
    bg-white dark:bg-gray-800
    rounded-full
    border border-gray-200 dark:border-gray-600
    inline-flex items-center justify-center
    transition-transform transition-colors duration-300 ease-in-out
    hover:bg-gray-50 dark:hover:bg-gray-700
    active:scale-95
    shadow-xsSkeumorphic
  `;

  return (
    <button className={cn(baseStyles, className)} {...props}>
      <div className="flex items-center justify-center w-[34px] h-[34px] text-gray-600 dark:text-gray-100 transition-colors duration-200">
        {variant === "previous" && <ChevronLeft className="h-5 w-5" />}
        {variant === "next" && <ChevronRight className="h-5 w-5" />}
      </div>
    </button>
  );
};

export default Button;

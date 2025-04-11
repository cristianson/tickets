import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { commonButtonStyles } from "@/lib/utils";

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
  const specificStyles =
    "w-9 h-9 rounded-full inline-flex items-center justify-center";

  return (
    <button
      className={cn(commonButtonStyles, specificStyles, className)}
      {...props}
    >
      <div className="flex items-center justify-center w-[34px] h-[34px] text-gray-600 dark:text-gray-100 transition-colors duration-200">
        {variant === "previous" && <ChevronLeft className="h-5 w-5" />}
        {variant === "next" && <ChevronRight className="h-5 w-5" />}
      </div>
    </button>
  );
};

export default Button;

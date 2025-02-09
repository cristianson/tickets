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
    bg-white                     
    rounded-full                 
    border border-gray-200       
    inline-flex                  
    items-center                 
    justify-center               
    transition-all duration-200                  
    hover:bg-gray-50
    active:scale-95
    shadow-xsSkeumorphic
  `;

  return (
    <button className={cn(baseStyles, className)} {...props}>
      <div className="flex items-center justify-center w-[34px] h-[34px] text-gray-600">
        {variant === "previous" && <ChevronLeft className="h-5 w-5" />}
        {variant === "next" && <ChevronRight className="h-5 w-5" />}
      </div>
    </button>
  );
};

export default Button;

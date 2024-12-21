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
    w-12 h-12
    min-w-[48px] min-h-[48px]                                        
    bg-white                     
    rounded-full                 
    border border-gray-200       
    inline-flex                  
    items-center                 
    justify-center               
    transition-all duration-200                  
    hover:bg-gray-50
    active:scale-95                             
  `;

  return (
    <button className={cn(baseStyles, className)} {...props}>
      <div className="flex items-center justify-center w-full h-full">
        {variant === "previous" && <ChevronLeft className="h-6 w-6" />}
        {variant === "next" && <ChevronRight className="h-6 w-6" />}
      </div>
    </button>
  );
};

export default Button;

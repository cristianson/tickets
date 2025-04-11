import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
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
      <div className="flex items-center justify-center w-[34px] h-[34px]">
        {variant === "previous" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5"
          >
            <defs>
              <filter
                id="inset-shadow"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feOffset
                  dx="0"
                  dy="1"
                  in="SourceAlpha"
                  result="offset_shadow"
                />
                <feGaussianBlur
                  stdDeviation="0.5"
                  in="offset_shadow"
                  result="blur_shadow"
                />
                <feComposite
                  operator="out"
                  in="SourceGraphic"
                  in2="blur_shadow"
                  result="inverse_shadow"
                />
                <feFlood
                  floodColor="black"
                  floodOpacity="0.25"
                  result="shadow_color"
                />
                <feComposite
                  operator="in"
                  in="shadow_color"
                  in2="inverse_shadow"
                  result="final_inset_shadow"
                />
                <feMerge>
                  <feMergeNode in="SourceGraphic" />
                  <feMergeNode in="final_inset_shadow" />
                </feMerge>
              </filter>
            </defs>
            <path
              filter="url(#inset-shadow)"
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10.3827 4.07615C10.7564 4.23093 11 4.59557 11 5.00003V8.00003L20.2231 8.00002C20.3423 7.99998 20.4845 7.99992 20.6098 8.01016C20.755 8.02203 20.963 8.05247 21.181 8.16352C21.4632 8.30733 21.6927 8.5368 21.8365 8.81904C21.9476 9.03699 21.978 9.24498 21.9899 9.3902C22.0001 9.51551 22.0001 9.65777 22 9.77688C21.9993 11.259 21.9993 12.7411 22 14.2232C22.0001 14.3423 22.0001 14.4845 21.9899 14.6099C21.978 14.7551 21.9476 14.9631 21.8365 15.181C21.6927 15.4633 21.4632 15.6927 21.181 15.8365C20.963 15.9476 20.755 15.978 20.6098 15.9899C20.4845 16.0001 20.3422 16.0001 20.2231 16L11 16V19C11 19.4045 10.7564 19.7691 10.3827 19.9239C10.009 20.0787 9.57889 19.9931 9.29289 19.7071L2.29289 12.7071C1.90237 12.3166 1.90237 11.6834 2.29289 11.2929L9.29289 4.29292C9.57889 4.00692 10.009 3.92137 10.3827 4.07615Z"
              fill="currentColor"
            />
          </svg>
        )}
        {variant === "next" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5"
          >
            <defs>
              <filter
                id="inset-shadow"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feOffset
                  dx="0"
                  dy="1"
                  in="SourceAlpha"
                  result="offset_shadow"
                />
                <feGaussianBlur
                  stdDeviation="0.5"
                  in="offset_shadow"
                  result="blur_shadow"
                />
                <feComposite
                  operator="out"
                  in="SourceGraphic"
                  in2="blur_shadow"
                  result="inverse_shadow"
                />
                <feFlood
                  floodColor="black"
                  floodOpacity="0.25"
                  result="shadow_color"
                />
                <feComposite
                  operator="in"
                  in="shadow_color"
                  in2="inverse_shadow"
                  result="final_inset_shadow"
                />
                <feMerge>
                  <feMergeNode in="SourceGraphic" />
                  <feMergeNode in="final_inset_shadow" />
                </feMerge>
              </filter>
            </defs>
            <path
              filter="url(#inset-shadow)"
              fillRule="evenodd"
              clipRule="evenodd"
              d="M13.6173 4.07615C13.991 3.92137 14.4211 4.00692 14.7071 4.29292L21.7071 11.2929C22.0976 11.6834 22.0976 12.3166 21.7071 12.7071L14.7071 19.7071C14.4211 19.9931 13.991 20.0787 13.6173 19.9239C13.2437 19.7691 13 19.4045 13 19V16C9.92564 16 6.85126 15.9989 3.77688 16C3.65777 16.0001 3.5155 16.0001 3.39018 15.9899C3.24496 15.978 3.03697 15.9476 2.81903 15.8365C2.53678 15.6927 2.30731 15.4633 2.1635 15.181C2.05245 14.9631 2.02201 14.7551 2.01015 14.6099C1.99991 14.4845 1.99996 14.3423 2.00001 14.2232C2.00057 12.7411 2.00057 11.259 2.00001 9.77689C1.99996 9.65777 1.99991 9.51552 2.01015 9.3902C2.02201 9.24498 2.05245 9.03699 2.1635 8.81904C2.30731 8.5368 2.53678 8.30733 2.81903 8.16352C3.03697 8.05247 3.24496 8.02203 3.39018 8.01016C3.5155 7.99992 3.65776 7.99998 3.77687 8.00002C6.85125 8.00124 9.92563 8.00003 13 8.00003V5.00003C13 4.59557 13.2437 4.23093 13.6173 4.07615Z"
              fill="currentColor"
            />
          </svg>
        )}
      </div>
    </button>
  );
};

export default Button;

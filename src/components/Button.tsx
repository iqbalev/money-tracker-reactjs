import type { ButtonProps } from "@/types";

function Button({ className, label, onClick, type = "button" }: ButtonProps) {
  return (
    <button className={`btn ${className}`} onClick={onClick} type={type}>
      {label}
    </button>
  );
}

export default Button;

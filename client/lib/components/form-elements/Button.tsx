import { CSSProperties, ReactNode } from "react";

interface ButtonProps {
  id: string;
  className: string;
  onClick?: React.ReactEventHandler;
  children: ReactNode;
  disabled?: boolean;
  title?: string;
  style?: CSSProperties;
}

const Button = ({
  id,
  className,
  onClick,
  children,
  disabled = false,
  title,
  style,
}: ButtonProps) => {
  // Using aria-disabled (NOT the native `disabled` attr) so the button
  // still receives hover events — that's what lets `cursor: not-allowed`
  // actually appear on hover. We guard the click ourselves.
  return (
    <button
      id={id}
      className={className}
      onClick={(e) => {
        if (disabled) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
      aria-disabled={disabled}
      title={title}
      style={{
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
};

export default Button;

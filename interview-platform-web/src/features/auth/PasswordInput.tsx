import { forwardRef, useState, type InputHTMLAttributes } from "react";

export const PasswordInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function PasswordInput(props, ref) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="auth-password">
      <input {...props} ref={ref} type={visible ? "text" : "password"} />
      <button
        type="button"
        aria-controls={props.id}
        aria-pressed={visible}
        aria-label={visible ? "Hide password" : "Show password"}
        onClick={() => setVisible((value) => !value)}
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
});

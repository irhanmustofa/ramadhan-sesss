import { useEffect, useRef } from "react";
import { initGoogleLogin } from "../../services/auth/googleAuth";

export default function GoogleLoginButton() {
  const btnRef = useRef(null);

  useEffect(() => {
    initGoogleLogin(btnRef.current);
  }, []);

  return (
    <div className="flex justify-center">
      <div ref={btnRef}></div>
    </div>
  );
}

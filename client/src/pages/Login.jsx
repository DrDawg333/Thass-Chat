import { useNavigate } from "react-router-dom";
import bg from "../assets/backgrounds/login-bg.png";
import Logo from "../components/Logo";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import LoginForm from "../components/LoginForm";
import SignupForm from "../components/SignupForm";

// Tracks whether we're below Tailwind's `md` breakpoint (768px),
// so we can switch the panel from a sideways expansion (desktop)
// to a stacked, full-width panel (mobile).
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handleChange = (e) => setIsMobile(e.matches);

    setIsMobile(mq.matches);
    mq.addEventListener("change", handleChange);

    return () => mq.removeEventListener("change", handleChange);
  }, []);

  return isMobile;
}

function Login() {
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState(null);
  const isMobile = useIsMobile();

  const tempLogin = () => {
    console.log("Button clicked");

    localStorage.setItem("token", "temp-token");
    localStorage.setItem("username", "Dr DAWG");
    localStorage.setItem("profilePic", "");

    navigate("/chat");
  };

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${bg})`,
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Temporary Test */}
      <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <motion.div
          layout
          animate={
            isMobile
              ? { width: "100%" }
              : { width: activePanel ? 900 : 450 }
          }
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 18,
          }}
          className="
    flex
    flex-col
    md:flex-row
    w-full
    max-w-[450px]
    md:max-w-none
    rounded-[28px]
    border
    border-red-400/20
    bg-black/30
    backdrop-blur-md
    shadow-[0_0_60px_rgba(220,38,38,.18)]
    overflow-hidden
  "
        >
          <div className="w-full md:w-[450px] shrink-0 p-6 sm:p-8 md:p-10">
            <Logo />

            {/* LOGIN Button */}
            <button
              onClick={() =>
                setActivePanel(
                  activePanel === "login" ? null : "login"
                )
              }
              className="
    w-full
    mt-8
    md:mt-10
    py-3.5
    md:py-4
    rounded-xl
    bg-red-800
    text-white
    hover:bg-red-700
    transition
  "
            >
              LOGIN
            </button>

            {/* SIGNUP Button */}
            <button
              onClick={() =>
                setActivePanel(
                  activePanel === "signup" ? null : "signup"
                )
              }
              className={`
    w-full
    mt-4
    py-3.5
    md:py-4
    rounded-xl
    transition-all
    duration-300
    ${activePanel === "signup"
                  ? "bg-red-700 text-white shadow-[0_0_25px_rgba(220,38,38,.5)]"
                  : "border border-red-700 text-red-300 hover:bg-red-900/20"
                }
  `}
            >
              SIGN UP
            </button>
          </div>

          {activePanel && (
            <motion.div
              initial={
                isMobile
                  ? { opacity: 0, y: 40 }
                  : { opacity: 0, x: 100 }
              }
              animate={
                isMobile
                  ? { opacity: 1, y: 0 }
                  : { opacity: 1, x: 0 }
              }
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 18,
              }}
              className="
        border-t
        md:border-t-0
        md:border-l
        border-white/10
        w-full
        md:w-[450px]
        shrink-0
      "
            >
              <div className="flex justify-end p-4">
                <button
                  onClick={() => setActivePanel(null)}
                  className="
text-red-400
hover:text-white
text-2xl
transition
"
                >
                  ✕
                </button>
              </div>
              <motion.div
                key={activePanel}
                initial={{
                  opacity: 0,
                  x: isMobile ? 0 : 80,
                  y: isMobile ? 20 : 0,
                  scale: 0.95,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  x: isMobile ? 0 : -40,
                  y: isMobile ? -20 : 0,
                  scale: 0.95,
                }}
                transition={{
                  duration: 0.35,
                }}
                className="px-6 pb-6 sm:px-8 sm:pb-8 md:px-10 md:pb-10"
              >
                {activePanel === "login" && <LoginForm />}

                {activePanel === "signup" && <SignupForm />}
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default Login;
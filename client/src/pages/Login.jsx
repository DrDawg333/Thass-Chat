import { useNavigate } from "react-router-dom";
import bg from "../assets/backgrounds/login-bg.png";
import Logo from "../components/Logo";
import { useState } from "react";
import { motion } from "framer-motion";
import LoginForm from "../components/LoginForm";
import SignupForm from "../components/SignupForm";

function Login() {
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState(null);

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
      <div className="relative flex min-h-screen items-center justify-center">

        <motion.div

          animate={{
            width: activePanel ? 900 : 450,
          }}
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 18,
          }}
          className="
    flex
    rounded-[28px]
    border
    border-red-400/20
    bg-black/30
    backdrop-blur-md
    shadow-[0_0_60px_rgba(220,38,38,.18)]
    overflow-hidden
  "
        >

          <div className="w-[450px] p-10">

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
    mt-10
    py-4
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
    py-4
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

              initial={{
                opacity: 0,
                x: 100
              }}

              animate={{
                opacity: 1,
                x: 0
              }}

              transition={{
                type: "spring",
                stiffness: 120,
                damping: 18
              }}

              className="border-l border-white/10"
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
                  x: 80,
                  scale: 0.95,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  x: -40,
                  scale: 0.95,
                }}
                transition={{
                  duration: 0.35,
                }}
              >
                {activePanel === "login" && <LoginForm />}

                {activePanel === "signup" && (
                  <SignupForm />
                )}
              </motion.div>

            </motion.div>

          )}

        </motion.div>

      </div>
    </div>
  );
}

export default Login;
import { useState } from "react";
import {
  HiMail,
  HiLockClosed,
  HiEye,
  HiEyeOff,
} from "react-icons/hi";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/login", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("profilePic", res.data.profilePic || "");

      navigate("/chat");
    } catch (err) {
      alert(
        err.response?.data?.message || "Login Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[430px] mx-auto p-6 sm:p-8 md:p-10">
      <h2
        className="text-2xl sm:text-3xl text-white mb-2"
        style={{ fontFamily: "Cinzel" }}
      >
        Login
      </h2>

      <p className="text-gray-400 mb-6 sm:mb-8">
        Welcome back.
      </p>

      {/* Email */}

      <div className="mb-4 sm:mb-5">
        <div className="flex items-center rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 sm:py-4">
          <HiMail className="text-red-400 text-xl shrink-0" />

          <input
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
            placeholder="Email"
            className="ml-3 w-full min-w-0 bg-transparent outline-none text-white placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Password */}

      <div>
        <div className="flex items-center rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 sm:py-4">
          <HiLockClosed className="text-red-400 text-xl shrink-0" />

          <input
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
            placeholder="Password"
            className="ml-3 w-full min-w-0 bg-transparent outline-none text-white placeholder:text-gray-500"
          />

          <button
            onClick={() =>
              setShowPassword(
                !showPassword
              )
            }
            type="button"
            className="shrink-0"
          >
            {showPassword ? (
              <HiEyeOff
                className="text-gray-400"
              />
            ) : (
              <HiEye
                className="text-gray-400"
              />
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 mt-5 sm:mt-6 text-sm">
        <label className="flex items-center gap-2 text-gray-400">
          <input type="checkbox" />
          Remember me
        </label>

        <button className="text-red-400" type="button">
          Forgot Password?
        </button>
      </div>

      <button
        onClick={handleLogin}
        disabled={loading}
        type="button"
        className="
          w-full
          mt-8
          sm:mt-10
          py-3.5
          sm:py-4
          rounded-xl
          bg-gradient-to-r
          from-red-900
          to-red-700
          text-white
          hover:scale-[1.02]
          active:scale-[0.99]
          transition
          disabled:opacity-60
          disabled:hover:scale-100
        "
      >
        {loading ? "Signing In..." : "SIGN IN"}
      </button>
    </div>
  );
}

export default LoginForm;
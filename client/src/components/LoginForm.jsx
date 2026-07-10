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
    <div className="w-[430px] p-10">

      <h2
        className="text-3xl text-white mb-2"
        style={{ fontFamily: "Cinzel" }}
      >
        Login
      </h2>

      <p className="text-gray-400 mb-8">
        Welcome back.
      </p>

      {/* Email */}

      <div className="mb-5">

        <div className="flex items-center rounded-xl border border-white/10 bg-black/20 px-4 py-4">

          <HiMail className="text-red-400 text-xl" />

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
            className="ml-3 w-full bg-transparent outline-none text-white placeholder:text-gray-500"
          />

        </div>

      </div>

      {/* Password */}

      <div>

        <div className="flex items-center rounded-xl border border-white/10 bg-black/20 px-4 py-4">

          <HiLockClosed className="text-red-400 text-xl" />

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
            className="ml-3 w-full bg-transparent outline-none text-white placeholder:text-gray-500"
          />

          <button
            onClick={() =>
              setShowPassword(
                !showPassword
              )
            }
            type="button"
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

      <div className="flex justify-between mt-6 text-sm">

        <label className="flex items-center gap-2 text-gray-400">

          <input type="checkbox" />

          Remember me

        </label>

        <button className="text-red-400">

          Forgot Password?

        </button>

      </div>

      <button
        className="
          w-full
          mt-10
          py-4
          rounded-xl
          bg-gradient-to-r
          from-red-900
          to-red-700
          text-white
          hover:scale-[1.02]
          transition
        "
      >
        <button
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Signing In..." : "SIGN IN"}
        </button>
      </button>

    </div>
  );
}

export default LoginForm;
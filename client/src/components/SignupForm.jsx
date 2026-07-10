import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import {
    HiMail,
    HiUser,
    HiLockClosed,
    HiEye,
    HiEyeOff,
} from "react-icons/hi";

function SignupForm() {

    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
    });

    const handleSignup = async () => {
        if (
            !form.username ||
            !form.email ||
            !form.password
        ) {
            alert("Please fill all fields");
            return;
        }

        try {
            setLoading(true);

            await API.post("/auth/signup", form);

            // Automatically log in
            const loginRes = await API.post("/auth/login", {
                email: form.email,
                password: form.password,
            });

            localStorage.setItem("token", loginRes.data.token);
            localStorage.setItem("username", loginRes.data.username);
            localStorage.setItem(
                "profilePic",
                loginRes.data.profilePic || ""
            );

            navigate("/chat");
            
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Signup Failed"
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
                Create Account
            </h2>

            <p className="text-gray-400 mb-8">
                Join Thass Chat.
            </p>

            {/* Username */}

            <div className="mb-4">
                <div className="flex items-center rounded-xl border border-white/10 bg-black/20 px-4 py-4">

                    <HiUser className="text-red-400 text-xl" />

                    <input
                        type="text"
                        value={form.username}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                username: e.target.value,
                            })
                        }
                        placeholder="Username"
                        className="ml-3 w-full bg-transparent outline-none text-white placeholder:text-gray-500"
                    />

                </div>
            </div>

            {/* Email */}

            <div className="mb-4">
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

            <div className="mb-6">
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
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? (
                            <HiEyeOff className="text-gray-400" />
                        ) : (
                            <HiEye className="text-gray-400" />
                        )}
                    </button>

                </div>
            </div>

            <button
                className="
          w-full
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
                    onClick={handleSignup}
                    disabled={loading}
                >
                    {loading
                        ? "Creating..."
                        : "CREATE ACCOUNT"}
                </button>
            </button>

        </div>
    );
}

export default SignupForm;
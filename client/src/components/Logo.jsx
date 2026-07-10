function Logo({
    showTagline = true,
    showWelcome = true,
}) {
    return (
        <div className="flex flex-col items-center">

            {/* Temporary Logo */}
            <div className="mb-0 flex h-20 w-20 items-center justify-center rounded-full
      bg-gradient-to-b from-red-500 to-red-900
      shadow-[0_0_35px_rgba(220,38,38,.5)]">

                <span className="text-4xl">💬</span>

            </div>

            <h1
                className="text-[10px] tracking-[6px]"
                style={{ fontFamily: "Cinzel" }}
            >
                THASS CHAT
            </h1>
            {showTagline && (
                <p
                    className="mt-0 text-gray-400"
                    style={{ fontFamily: "Poppins" }}
                >
                    Connect. Chat. Share.
                </p>
            )}

            <div className="mt-1 mb-1 flex items-center justify-center">

                <div className="h-px w-32 bg-gradient-to-r from-transparent via-red-700/60 to-red-700/60"></div>

                <div className="mx-4 text-red-600 text-[30px]">
                    ✧
                </div>

                <div className="h-px w-32 bg-gradient-to-l from-transparent via-red-700/60 to-red-700/60"></div>

            </div>
            {/* Welcome */}
            {showWelcome && (
                <div div className="mt-0 text-center">

                    <h2
                        className="text-4xl text-white"
                        style={{ fontFamily: "Cinzel" }}
                    >
                        Welcome Back
                    </h2>

                    <p className="mt-0 text-gray-400 text-sm">
                        Sign in to continue to your account
                    </p>

                </div>
            )}
        </div >
    );
}

export default Logo;
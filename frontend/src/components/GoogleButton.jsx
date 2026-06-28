import { FcGoogle } from "react-icons/fc";

function GoogleButton() {
  return (
    <button
      className="w-full h-14 rounded-2xl border border-gray-700 bg-[#111] flex items-center justify-center gap-3 hover:border-white transition-all duration-300"
    >
      <FcGoogle size={24} />

      <span className="text-white">
        Continue with Google
      </span>

    </button>
  );
}

export default GoogleButton;
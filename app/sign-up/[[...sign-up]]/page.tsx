import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#FBF7F0] flex items-center justify-center px-4 py-20">
      <div className="w-full flex flex-col items-center gap-6">
        <div className="text-center">
          <img src="/logo.svg" alt="World of Mysore Pak" className="w-14 h-14 rounded-full mx-auto mb-3 border-2 border-[#C9972D]/30 shadow-md" />
          <h1 className="font-heading text-2xl font-bold text-[#1B3A2D]">Create an account</h1>
          <p className="font-body text-sm text-[#1B3A2D]/50 mt-1">Join World of Mysore Pak — track orders, faster checkout</p>
        </div>
        <SignUp />
      </div>
    </div>
  );
}

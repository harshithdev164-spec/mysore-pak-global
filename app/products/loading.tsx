export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FBF7F0] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <img src="/logo.svg" alt="World of Mysore Pak" className="h-16 w-auto opacity-80 animate-pulse" />
        <div className="flex gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C9972D] animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-[#C9972D] animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-[#C9972D] animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

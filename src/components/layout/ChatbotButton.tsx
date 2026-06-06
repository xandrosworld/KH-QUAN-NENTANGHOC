import Image from "next/image";

export default function ChatbotButton() {
  return (
    <button
      className="fixed bottom-6 right-6 z-50 flex h-[74px] w-[74px] items-center justify-center rounded-full transition-transform duration-300 hover:scale-105"
      aria-label="Mở chatbot"
    >
      <Image
        src="/brand/ai-chatbot.svg"
        alt=""
        width={74}
        height={73}
        className="h-[74px] w-[74px]"
        priority
      />
    </button>
  );
}

"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { Loader2, Send, X } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const quickPrompts = [
  "Doanh thu tháng này thế nào?",
  "Net Profit hiện tại bao nhiêu?",
  "Top sản phẩm theo lợi nhuận",
];

export default function ChatbotButton() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Chào anh, em có thể tóm tắt doanh thu, lợi nhuận, ads, hoàn/hủy, top sản phẩm và top campaign theo dữ liệu đã import.",
    },
  ]);

  async function sendMessage(value = input) {
    const content = value.trim();
    if (!content || loading) return;

    setMessages((prev) => [...prev, { role: "user", content }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });
      const payload = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: payload.answer ?? "Em chưa đọc được dữ liệu, anh thử hỏi lại giúp em nhé." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "API chatbot đang mất kết nối tạm thời. Anh thử lại sau một chút nhé." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage();
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[560px] w-[380px] flex-col overflow-hidden rounded-2xl border border-green-100 bg-white shadow-2xl shadow-green-900/15">
          <div className="flex items-center justify-between bg-green-600 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <Image src="/brand/ai-chatbot.svg" alt="" width={42} height={42} className="h-10 w-10 rounded-full bg-white/15" />
              <div>
                <h3 className="text-sm font-bold">TronX AI Assistant</h3>
                <p className="text-xs text-green-50">Hỏi đáp dữ liệu đã import</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-1.5 text-green-50 transition hover:bg-white/15"
              aria-label="Đóng chatbot"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 px-4 py-4">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[82%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "bg-green-600 text-white"
                      : "border border-gray-100 bg-white text-gray-700 shadow-sm"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-2.5 text-sm text-gray-500 shadow-sm">
                  <Loader2 size={15} className="animate-spin" />
                  Đang phân tích dữ liệu...
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 bg-white p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => void sendMessage(prompt)}
                  className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition hover:bg-green-100"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Hỏi AI về doanh thu, profit, ads..."
                className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Gửi câu hỏi"
              >
                <Send size={17} />
              </button>
            </form>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((value) => !value)}
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
    </>
  );
}

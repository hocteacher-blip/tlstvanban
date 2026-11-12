import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Copy,
  Check,
  FileEdit,
  Trash2,
  Maximize2,
  Minimize2,
  Mic,
  MicOff,
  HelpCircle,
  BookOpen,
  Scale,
  FileCheck,
  ChevronRight,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';
import { apiService } from '../../services/api';
import { SchoolProfile, UserAccount } from '../../types';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

interface SchoolAiAssistantProps {
  isOpen: boolean;
  onToggle: (open?: boolean) => void;
  schoolProfile: SchoolProfile;
  currentUser: UserAccount;
  onSendToDrafting?: (text: string, title?: string) => void;
}

const QUICK_SUGGESTIONS = [
  {
    icon: FileEdit,
    label: 'Soạn thông báo',
    prompt: 'Hãy soạn giúp tôi Thông báo cho học sinh toàn trường nghỉ học để phòng chống bão và triển khai dạy học trực tuyến chuẩn Nghị định 30.',
  },
  {
    icon: Scale,
    label: 'Quy định Nghị định 30',
    prompt: 'Nêu tóm tắt quy định về thể thức văn bản hành chính theo Nghị định 30/2020/NĐ-CP (Căn lề, phông chữ, cỡ chữ, số ký hiệu và vị trí chữ ký).',
  },
  {
    icon: FileCheck,
    label: 'Soạn Quyết định',
    prompt: 'Soạn mẫu Quyết định kiện toàn Hội đồng trường năm học 2026-2027 theo quy định Điều lệ trường trung học.',
  },
  {
    icon: BookOpen,
    label: 'Kế hoạch dạy học CV 5512',
    prompt: 'Hướng dẫn cấu trúc xây dựng Kế hoạch giáo dục của Tổ chuyên môn theo phụ lục Công văn số 5512/BGDĐT-GDTrH.',
  },
  {
    icon: HelpCircle,
    label: 'Quy tắc số ký hiệu',
    prompt: 'Cách đánh số và ký hiệu văn bản đi đối với Quyết định, Kế hoạch, Công văn của trường học đúng pháp luật như thế nào?',
  },
];

export const SchoolAiAssistant: React.FC<SchoolAiAssistantProps> = ({
  isOpen,
  onToggle,
  schoolProfile,
  currentUser,
  onSendToDrafting,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome_msg',
      role: 'model',
      text: `Xin chào **${currentUser.name}**! Tôi là **Trợ lý AI Nhà Trường** (SCHOOL DOC Copilot).

Tôi có thể hỗ trợ Thầy/Cô và Nhà trường:
* 📝 **Soạn thảo nhanh** mọi loại văn bản hành chính (Công văn, Quyết định, Kế hoạch, Tờ trình, Giấy mời, Biên bản...).
* ⚖️ **Tư vấn thể thức** chuẩn **Nghị định 30/2020/NĐ-CP** và các thông tư của Bộ GD&ĐT (TT 32, TT 22, CV 5512).
* 🔍 **Soát lỗi, biên tập và chuẩn hóa văn phong** hành chính sư phạm.
* 🛠️ **Hướng dẫn sử dụng** các công cụ điền biểu mẫu, trộn thư Excel hàng loạt, OCR scan văn bản.

Thầy/Cô cần hỗ trợ công việc gì hôm nay?`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Speech recognition init
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setHasSpeechSupport(true);
      const recog = new SpeechRecognition();
      recog.lang = 'vi-VN';
      recog.continuous = false;
      recog.interimResults = false;

      recog.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
      };

      recog.onerror = () => {
        setIsRecording(false);
      };

      recog.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recog;
    }
  }, []);

  // Keyboard shortcut listener: F2 or Ctrl+J to toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2' || (e.ctrlKey && e.key.toLowerCase() === 'j')) {
        e.preventDefault();
        onToggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggle]);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Speech recognition error:', err);
      }
    }
  };

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: 'usr_' + Date.now(),
      role: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customText) setInput('');
    setIsLoading(true);

    try {
      // Build history for backend API (excluding system welcome message)
      const chatHistory = messages
        .filter((m) => m.id !== 'welcome_msg')
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      const res = await apiService.assistantChat({
        message: textToSend.trim(),
        history: chatHistory,
        schoolContext: {
          schoolName: schoolProfile.schoolName,
          governingBody: schoolProfile.governingBody,
          schoolLevel: schoolProfile.schoolLevel,
          principalName: schoolProfile.principalName,
          address: schoolProfile.address,
        },
      });

      if (res.success && res.text) {
        const botMessage: Message = {
          id: 'bot_' + Date.now(),
          role: 'model',
          text: res.text,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        const errMessage: Message = {
          id: 'bot_err_' + Date.now(),
          role: 'model',
          text: `⚠️ **Thông báo:** ${res.error || 'Không thể nhận phản hồi từ Trợ lý AI. Vui lòng thử lại sau.'}`,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errMessage]);
      }
    } catch (err: any) {
      const errMessage: Message = {
        id: 'bot_err_' + Date.now(),
        role: 'model',
        text: `⚠️ **Lỗi kết nối:** ${err.message || 'Không thể liên lạc với máy chủ AI.'}`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendDraft = (text: string) => {
    if (onSendToDrafting) {
      onSendToDrafting(text, 'Văn bản từ Trợ lý AI');
      onToggle(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm('Thầy/Cô có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện với Trợ lý AI?')) {
      setMessages([
        {
          id: 'welcome_msg_' + Date.now(),
          role: 'model',
          text: `Đã làm mới phiên trò chuyện. Thầy/Cô cần hỗ trợ văn bản hoặc tra cứu nghiệp vụ gì?`,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  // Render markdown-like simple formatting (bold, bullet points, headers)
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      // Bold handling
      let formatted = line;

      // Handle bullet points
      const isBullet = line.trim().startsWith('* ') || line.trim().startsWith('- ');
      const isHeader = line.trim().startsWith('### ') || line.trim().startsWith('## ');

      if (isHeader) {
        return (
          <div key={idx} className="font-bold text-slate-900 mt-2 mb-1 text-sm">
            {line.replace(/^#+\s/, '')}
          </div>
        );
      }

      if (isBullet) {
        const bulletContent = line.trim().replace(/^[\*\-]\s/, '');
        return (
          <div key={idx} className="flex items-start gap-1.5 ml-2 my-0.5">
            <span className="text-blue-600 font-bold shrink-0">•</span>
            <span className="flex-1">
              {parseBold(bulletContent)}
            </span>
          </div>
        );
      }

      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }

      return (
        <p key={idx} className="my-0.5 leading-relaxed">
          {parseBold(formatted)}
        </p>
      );
    });
  };

  // Helper to parse **bold**
  const parseBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-bold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom Right) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 group">
          <button
            onClick={() => onToggle(true)}
            className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white rounded-full shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105 active:scale-95 cursor-pointer border border-blue-400/30"
            title="Mở Trợ lý AI Nhà trường (Phím tắt F2)"
          >
            <div className="relative">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white ring-1 ring-emerald-500/50"></span>
            </div>
            <span className="font-bold text-xs tracking-tight">Trợ lý AI Nhà trường</span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 bg-blue-900/40 rounded text-[10px] text-blue-200 border border-blue-400/20 font-mono">
              F2
            </span>
          </button>
        </div>
      )}

      {/* Assistant Modal / Drawer */}
      {isOpen && (
        <div
          className={`fixed bottom-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-200 ${
            isExpanded
              ? 'w-[92vw] sm:w-[800px] h-[85vh] max-w-4xl'
              : 'w-[95vw] sm:w-[460px] h-[640px] max-h-[90vh]'
          }`}
        >
          {/* Top Header */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-3.5 px-4 flex items-center justify-between border-b border-blue-900/50 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-xs text-white truncate">Trợ lý AI Nhà trường</h3>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-semibold">
                    Gemini 3.8 Flash
                  </span>
                </div>
                <p className="text-[10px] text-blue-200/80 truncate">
                  Tư vấn NĐ 30 • Soạn thảo mẫu • Soát lỗi sư phạm
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-300">
              <button
                onClick={handleClearHistory}
                className="p-1.5 hover:bg-white/10 rounded-lg hover:text-white transition-colors cursor-pointer"
                title="Xóa lịch sử hội thoại"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 hover:bg-white/10 rounded-lg hover:text-white transition-colors cursor-pointer hidden sm:block"
                title={isExpanded ? 'Thu nhỏ' : 'Mở rộng'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => onToggle(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg hover:text-white transition-colors cursor-pointer"
                title="Đóng (F2)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Suggestions Carousel */}
          <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 overflow-x-auto flex items-center gap-1.5 shrink-0 no-scrollbar">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
              <Lightbulb className="w-3 h-3 text-amber-500" />
              <span>Gợi ý:</span>
            </span>
            {QUICK_SUGGESTIONS.map((s, idx) => {
              const Icon = s.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSend(s.prompt)}
                  disabled={isLoading}
                  className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-full text-[11px] text-slate-700 font-medium transition-colors cursor-pointer shadow-2xs"
                >
                  <Icon className="w-3 h-3 text-blue-600" />
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-100/60 text-xs">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 items-start ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold ${
                      isUser
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-indigo-900 text-amber-300 shadow-xs'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  {/* Message bubble */}
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 shadow-2xs ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                    }`}
                  >
                    <div className="text-xs">{renderFormattedText(msg.text)}</div>

                    {/* Metadata & Actions for AI response */}
                    {!isUser && msg.id !== 'welcome_msg' && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <span>{msg.timestamp}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopy(msg.id, msg.text)}
                            className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                            title="Sao chép câu trả lời"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-600">Đã chép</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Sao chép</span>
                              </>
                            )}
                          </button>

                          {onSendToDrafting && msg.text.length > 80 && (
                            <button
                              onClick={() => handleSendDraft(msg.text)}
                              className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold transition-colors cursor-pointer"
                              title="Chuyển sang Trình soạn thảo văn bản"
                            >
                              <FileEdit className="w-3 h-3" />
                              <span>Soạn thảo</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-2.5 items-start">
                <div className="w-7 h-7 rounded-full bg-indigo-900 text-amber-300 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 shadow-2xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    <span>Trợ lý AI đang suy nghĩ và tổng hợp câu trả lời...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Form */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-end gap-2"
            >
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Hỏi đáp thể thức, tra cứu NĐ 30, hoặc yêu cầu soạn văn bản... (Enter để gửi)"
                  rows={2}
                  className="w-full p-2.5 pr-10 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none leading-relaxed"
                />

                {hasSpeechSupport && (
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={`absolute right-2.5 bottom-3.5 p-1 rounded-full transition-colors ${
                      isRecording
                        ? 'bg-rose-100 text-rose-600 animate-pulse'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                    }`}
                    title={isRecording ? 'Đang nghe... Bấm để dừng' : 'Nói để nhập liệu'}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="h-10 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl font-bold flex items-center justify-center transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed shrink-0"
                title="Gửi câu hỏi"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span>Nhấn <strong>Enter</strong> để gửi, <strong>Shift + Enter</strong> để xuống dòng</span>
              <span>SCHOOL DOC AI Copilot</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

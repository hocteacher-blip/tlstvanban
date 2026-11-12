import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  User,
  Copy,
  Check,
  FileEdit,
  Trash2,
  Mic,
  MicOff,
  RefreshCw,
  Scale,
  FileText,
  Calendar,
  BookOpen,
  Award,
  Layers,
  HelpCircle,
  Building,
  Shield,
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

interface AiAssistantViewProps {
  schoolProfile: SchoolProfile;
  currentUser: UserAccount;
  onSendToDrafting: (text: string, title?: string) => void;
}

const ROLE_PROMPTS = [
  {
    category: 'Văn thư & Hành chính',
    icon: FileText,
    items: [
      {
        title: 'Quy tắc số hiệu văn bản NĐ 30',
        prompt: 'Hướng dẫn chi tiết cách ghi số và ký hiệu văn bản hành chính theo Điều 10 Nghị định 30/2020/NĐ-CP đối với Quyết định, Kế hoạch, Công văn, Tờ trình và Báo cáo của trường học.',
      },
      {
        title: 'Mẫu công văn gửi Phòng GD&ĐT',
        prompt: 'Hãy soạn giúp tôi một Công văn hành chính chuẩn Nghị định 30 gửi Phòng Giáo dục và Đào tạo về việc đề xuất cấp kinh phí sửa chữa phòng máy tính phục vụ năm học mới.',
      },
      {
        title: 'Thời hạn bảo quản hồ sơ văn thư',
        prompt: 'Quy định về thời hạn bảo quản hồ sơ, sổ công văn đi/đến, hồ sơ học sinh và hồ sơ chuyên môn giáo viên theo Thông tư số 27/2016/TT-BGDĐT.',
      },
    ],
  },
  {
    category: 'Ban Giám hiệu',
    icon: Building,
    items: [
      {
        title: 'Quyết định thành lập Hội đồng',
        prompt: 'Soạn mẫu Quyết định kiện toàn Hội đồng trường và Hội đồng thi đua khen thưởng năm học 2026-2027 đầy đủ căn cứ pháp lý theo Điều lệ trường học.',
      },
      {
        title: 'Kế hoạch triển khai năm học',
        prompt: 'Xây dựng khung Kế hoạch thực hiện nhiệm vụ năm học 2026-2027 với các mục tiêu trọng tâm: nâng cao chất lượng dạy học, chuyển đổi số và an toàn trường học.',
      },
      {
        title: 'Báo cáo sơ kết học kỳ',
        prompt: 'Gợi ý đề cương Báo cáo sơ kết công tác học kỳ I năm học 2026-2027 theo chuẩn thể thức báo cáo hành chính.',
      },
    ],
  },
  {
    category: 'Chuyên môn & Giáo viên',
    icon: BookOpen,
    items: [
      {
        title: 'Kế hoạch dạy học môn học CV 5512',
        prompt: 'Hướng dẫn cách xây dựng khung Kế hoạch dạy học của Tổ chuyên môn (Phụ lục 1) theo Công văn số 5512/BGDĐT-GDTrH của Bộ GD&ĐT.',
      },
      {
        title: 'Đánh giá học sinh theo TT 22',
        prompt: 'Tóm tắt các quy định cốt lõi về đánh giá định kỳ, đánh giá thường xuyên và xếp loại học sinh THCS theo Thông tư 22/2021/TT-BGDĐT.',
      },
      {
        title: 'Biên bản sinh hoạt chuyên môn',
        prompt: 'Soạn mẫu Biên bản sinh hoạt tổ chuyên môn theo định hướng nghiên cứu bài học, nêu rõ mục đích, tiến trình thảo luận và phân công trách nhiệm.',
      },
    ],
  },
];

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  schoolProfile,
  currentUser,
  onSendToDrafting,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome_view_msg',
      role: 'model',
      text: `Xin kính chào **${currentUser.name}**! Tôi là **Trợ lý AI Nhà Trường** (SCHOOL DOC AI Copilot).

Tôi được tối ưu chuyên biệt cho công tác văn thư, quản trị hành chính và chuyên môn sư phạm trường học Việt Nam:
* 📜 **Soạn thảo thể thức chuẩn**: Nghị định 30/2020/NĐ-CP (Công văn, Quyết định, Tờ trình, Thông báo, Giấy mời, Kế hoạch...).
* 🏛️ **Am hiểu pháp lý giáo dục**: Thông tư 32/2020/TT-BGDĐT, Thông tư 22/2021/TT-BGDĐT, Công văn 5512/BGDĐT-GDTrH.
* ✍️ **Biên tập & Chuẩn hóa**: Rà soát thể thức, kiểm tra chính tả, nâng tầm ngôn phong hành chính.
* ⚡ **Tích hợp liền mạch**: Mọi văn bản do AI soạn thảo đều có thể chuyển sang Trình soạn thảo văn bản với 1 cú click!

Thầy/Cô hãy chọn gợi ý bên dưới hoặc nhập yêu cầu để bắt đầu!`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

      recog.onerror = () => setIsRecording(false);
      recog.onend = () => setIsRecording(false);
      recognitionRef.current = recog;
    }
  }, []);

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

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: 'usr_' + Date.now(),
      role: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      const chatHistory = messages
        .filter((m) => m.id !== 'welcome_view_msg')
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
          text: `⚠️ **Thông báo:** ${res.error || 'Không thể nhận phản hồi từ Trợ lý AI. Vui lòng kiểm tra lại.'}`,
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

  const handleSendToDraftingView = (text: string) => {
    onSendToDrafting(text, 'Văn bản soạn thảo từ Trợ lý AI');
  };

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

  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      const isBullet = line.trim().startsWith('* ') || line.trim().startsWith('- ');
      const isHeader = line.trim().startsWith('### ') || line.trim().startsWith('## ');

      if (isHeader) {
        return (
          <h4 key={idx} className="font-bold text-slate-900 mt-3 mb-1.5 text-sm border-b pb-1 border-slate-100">
            {line.replace(/^#+\s/, '')}
          </h4>
        );
      }

      if (isBullet) {
        const bulletContent = line.trim().replace(/^[\*\-]\s/, '');
        return (
          <div key={idx} className="flex items-start gap-2 ml-2 my-1">
            <span className="text-blue-600 font-bold shrink-0">•</span>
            <span className="flex-1 text-slate-800 leading-relaxed">{parseBold(bulletContent)}</span>
          </div>
        );
      }

      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="my-1 leading-relaxed text-slate-800">
          {parseBold(line)}
        </p>
      );
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-6 rounded-2xl shadow-md border border-blue-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Mô hình Google Gemini 3.8 Flash • Chuyên biệt giáo dục</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <span>Trợ lý AI Nhà Trường (SCHOOL DOC Copilot)</span>
          </h2>
          <p className="text-xs text-blue-200/80 mt-1 max-w-3xl leading-relaxed">
            Hỗ trợ tư vấn thể thức hành chính theo Nghị định 30/2020/NĐ-CP, xây dựng kế hoạch giáo dục, soạn thảo mẫu văn bản, tra cứu quy chuẩn sư phạm và kiểm tra lỗi tài liệu trường học.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (confirm('Xóa lịch sử trò chuyện hiện tại?')) {
                setMessages([
                  {
                    id: 'welcome_' + Date.now(),
                    role: 'model',
                    text: 'Đã làm mới phiên trò chuyện. Thầy/Cô cần hỗ trợ văn bản gì?',
                    timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                  },
                ]);
              }
            }}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 border border-white/10 cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-slate-300" />
            <span>Làm mới hội thoại</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Quick Role Prompts */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-3 border-b pb-2 border-slate-100">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>GỢI Ý TÁC NGHIỆP THEO VAI TRÒ</span>
            </div>

            <div className="space-y-4">
              {ROLE_PROMPTS.map((sec, secIdx) => {
                const Icon = sec.icon;
                return (
                  <div key={secIdx} className="space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-blue-600" />
                      <span>{sec.category}</span>
                    </div>
                    <div className="space-y-1">
                      {sec.items.map((item, itemIdx) => (
                        <button
                          key={itemIdx}
                          onClick={() => handleSend(item.prompt)}
                          disabled={isLoading}
                          className="w-full text-left p-2 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/60 transition-colors text-xs font-medium text-slate-700 cursor-pointer flex flex-col group"
                        >
                          <span className="font-semibold text-slate-900 group-hover:text-blue-700">
                            {item.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Chat Area */}
        <div className="lg:col-span-3 flex flex-col h-[700px] bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 items-start ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                      isUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-gradient-to-br from-indigo-950 to-blue-900 text-amber-300'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 shadow-2xs ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-none text-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none text-xs'
                    }`}
                  >
                    <div>{renderFormattedText(msg.text)}</div>

                    {!isUser && msg.id !== 'welcome_view_msg' && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span>{msg.timestamp}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopy(msg.id, msg.text)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                            title="Sao chép câu trả lời"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-600 font-semibold">Đã chép</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Sao chép</span>
                              </>
                            )}
                          </button>

                          {msg.text.length > 80 && (
                            <button
                              onClick={() => handleSendToDraftingView(msg.text)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold transition-colors cursor-pointer"
                              title="Chuyển văn bản sang Trình soạn thảo AI"
                            >
                              <FileEdit className="w-3.5 h-3.5" />
                              <span>Soạn thảo văn bản</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-950 to-blue-900 text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-2xs">
                  <div className="flex items-center gap-2.5 text-slate-600 text-xs">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Trợ lý AI đang tra cứu và soạn thảo câu trả lời...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 bg-white border-t border-slate-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-end gap-2.5"
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
                  placeholder="Nhập câu hỏi, yêu cầu soạn văn bản hành chính hoặc tra cứu quy định (Enter để gửi, Shift+Enter xuống dòng)..."
                  rows={2}
                  className="w-full p-3 pr-12 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none leading-relaxed"
                />

                {hasSpeechSupport && (
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={`absolute right-3 bottom-3.5 p-1.5 rounded-full transition-colors ${
                      isRecording
                        ? 'bg-rose-100 text-rose-600 animate-pulse'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                    }`}
                    title={isRecording ? 'Đang ghi âm... Nhấn để dừng' : 'Nói để nhập liệu'}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="h-12 px-5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl font-bold flex items-center justify-center transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed shrink-0"
                title="Gửi câu hỏi"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

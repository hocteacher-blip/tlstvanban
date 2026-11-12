import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Pause,
  Play,
  Upload,
  Sparkles,
  FileText,
  Download,
  Clock,
  Users,
  CheckCircle2,
  Calendar,
  Save,
  RefreshCw,
} from 'lucide-react';
import { MeetingRecord, SchoolProfile } from '../../types';
import { apiService } from '../../services/api';
import { generateAdminDocx, downloadFile } from '../../utils/docxGenerator';

interface MeetingRecorderViewProps {
  schoolProfile: SchoolProfile;
  onSaveMeeting: (meeting: MeetingRecord) => void;
  meetingsList: MeetingRecord[];
}

export const MeetingRecorderView: React.FC<MeetingRecorderViewProps> = ({
  schoolProfile,
  onSaveMeeting,
  meetingsList,
}) => {
  const [meetingType, setMeetingType] = useState<MeetingRecord['meetingType']>('hoidong');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [chairperson, setChairperson] = useState(schoolProfile.principalName || '');
  const [secretary, setSecretary] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toLocaleDateString('vi-VN'));

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  // Audio file & Transcript
  const [audioBase64, setAudioBase64] = useState<string>('');
  const [audioMimeType, setAudioMimeType] = useState<string>('audio/webm');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptContent, setTranscriptContent] = useState<string>('');

  // Start Live Audio Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = (reader.result as string).split(',')[1];
          setAudioBase64(base64data);
          setAudioMimeType('audio/webm');
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      alert('Không thể truy cập microphone: ' + err.message);
    }
  };

  // Pause / Resume
  const togglePause = () => {
    if (!mediaRecorderRef.current) return;
    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      setIsRecording(false);
      setIsPaused(false);
      clearInterval(timerIntervalRef.current);
    }
  };

  // Upload Audio File
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = (reader.result as string).split(',')[1];
      setAudioBase64(base64data);
      setAudioMimeType(file.type || 'audio/mp3');
    };
    reader.readAsDataURL(file);
  };

  // Call Gemini AI to transcribe & structure meeting minutes
  const handleTranscribeWithAI = async () => {
    if (!audioBase64) {
      alert('Vui lòng ghi âm hoặc tải lên file âm thanh trước!');
      return;
    }

    setIsTranscribing(true);
    try {
      const res = await apiService.transcribeAudio({
        audioData: audioBase64,
        mimeType: audioMimeType,
        meetingType,
        contextInfo: `Trường: ${schoolProfile.schoolName}, Chủ trì: ${chairperson}, Thư ký: ${secretary}`,
      });

      if (res.success && res.transcript) {
        setTranscriptContent(res.transcript);
      } else {
        alert('Lỗi phân tích âm thanh: ' + (res.error || 'Vui lòng kiểm tra API Key'));
      }
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    } finally {
      setIsTranscribing(false);
    }
  };

  // Export to Word
  const handleExportWord = async () => {
    const doc = {
      id: 'meeting_' + Date.now(),
      title: meetingTitle,
      category: 'bien_ban' as const,
      docNumber: '…/BB-HĐSP',
      issueDate: date,
      location: 'TP. Hồ Chí Minh',
      subject: meetingTitle,
      signerName: chairperson,
      signerPosition: 'CHỦ TRÌ CUỘC HỌP',
      recipients: ['Lưu: VT', 'Toàn thể thành viên'],
      content: transcriptContent,
      status: 'approved' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: secretary,
    };

    try {
      const blob = await generateAdminDocx(doc, schoolProfile);
      downloadFile(blob, `${meetingTitle.replace(/[/\\?%*:|"<>]/g, '_')}.docx`);
    } catch (err: any) {
      alert('Lỗi xuất Word: ' + err.message);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold mb-1">
            <Mic className="w-3.5 h-3.5 text-rose-600" />
            <span>Xử lý âm thanh & Lập biên bản tự động</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Ghi âm cuộc họp – Tạo biên bản AI
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ghi âm trực tiếp bằng micro hoặc tải file âm thanh, AI tự động chuyển thành văn bản, trích xuất tóm tắt, ý kiến thảo luận và phân công nhiệm vụ chuẩn mực.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportWord}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Biên bản Word (.docx)</span>
          </button>
        </div>
      </div>

      {/* Grid: Audio Controls (Left 5 cols) & Generated Minutes (Right 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recording & Upload Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Meeting Setup Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <span className="text-xs font-bold text-slate-800">1. Thông tin cuộc họp:</span>
            <div className="space-y-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-600">Loại cuộc họp:</label>
                <select
                  value={meetingType}
                  onChange={(e) => setMeetingType(e.target.value as any)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 font-medium"
                >
                  <option value="hoidong">Họp Hội đồng sư phạm</option>
                  <option value="tochuyenmon">Họp Tổ chuyên môn</option>
                  <option value="chibo">Họp Chi bộ Đảng</option>
                  <option value="phuhuynh">Họp Ban đại diện Cha mẹ học sinh</option>
                  <option value="chuyende">Họp Chuyên đề đổi mới PPDH</option>
                  <option value="giaoban">Họp Giao ban Ban Giám hiệu</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600">Tiêu đề biên bản:</label>
                <input
                  type="text"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600">Chủ trì:</label>
                  <input
                    type="text"
                    value={chairperson}
                    onChange={(e) => setChairperson(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded p-1.5 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600">Thư ký:</label>
                  <input
                    type="text"
                    value={secretary}
                    onChange={(e) => setSecretary(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded p-1.5 bg-slate-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Live Recording Studio Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 text-center">
            <span className="text-xs font-bold text-slate-800 block text-left">
              2. Ghi âm trực tiếp hoặc tải file:
            </span>

            {/* Visual Timer and Pulse */}
            <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-3">
              <div className="text-3xl font-mono font-bold tracking-widest text-blue-400">
                {formatTime(recordingSeconds)}
              </div>
              <div className="flex items-center justify-center gap-2 text-xs">
                {isRecording ? (
                  <span className="inline-flex items-center gap-1.5 text-rose-400 animate-pulse font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    {isPaused ? 'Đang tạm dừng ghi âm' : 'Đang thu âm qua Microphone...'}
                  </span>
                ) : (
                  <span className="text-slate-400">Microphone sẵn sàng</span>
                )}
              </div>
            </div>

            {/* Recording Buttons */}
            <div className="flex items-center justify-center gap-3">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/30 cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                  <span>Bắt đầu ghi âm</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={togglePause}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                  >
                    {isPaused ? <Play className="w-4 h-4 text-emerald-600" /> : <Pause className="w-4 h-4" />}
                    <span>{isPaused ? 'Tiếp tục' : 'Tạm dừng'}</span>
                  </button>
                  <button
                    onClick={stopRecording}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-semibold"
                  >
                    <Square className="w-4 h-4 text-rose-500 fill-rose-500" />
                    <span>Kết thúc thu</span>
                  </button>
                </>
              )}
            </div>

            {/* File Upload Option */}
            <div className="pt-3 border-t border-slate-100">
              <label className="flex items-center justify-center gap-2 p-2.5 border border-dashed border-slate-300 hover:border-blue-400 rounded-lg text-xs text-slate-600 hover:text-blue-600 font-medium cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                <span>Hoặc tải file ghi âm có sẵn (MP3, WAV, WEBM)</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="hidden"
                />
              </label>
              {audioBase64 && (
                <div className="text-[11px] text-emerald-600 font-medium mt-1">
                  ✓ Đã sẵn sàng dữ liệu âm thanh
                </div>
              )}
            </div>

            {/* Trigger AI Transcription */}
            <button
              onClick={handleTranscribeWithAI}
              disabled={isTranscribing || !audioBase64}
              className="w-full py-2.5 px-4 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-40"
            >
              {isTranscribing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI đang phân tích âm thanh & lập biên bản...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Chuyển âm thanh thành Biên bản họp AI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Structured Meeting Minutes View (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Nội dung Biên bản cuộc họp
              </h3>
              <p className="text-xs text-slate-500">
                Bạn có thể trực tiếp chỉnh sửa nội dung bên dưới trước khi xuất sang file Word.
              </p>
            </div>
          </div>

          <textarea
            value={transcriptContent}
            onChange={(e) => setTranscriptContent(e.target.value)}
            placeholder="Nội dung biên bản cuộc họp sẽ tự động sinh sau khi ghi âm hoặc tải file âm thanh, hoặc bạn có thể tự nhập trực tiếp tại đây..."
            className="w-full h-[520px] p-4 text-xs md:text-sm leading-relaxed border border-slate-200 rounded-xl bg-slate-50 font-serif focus:outline-blue-500 focus:bg-white resize-none"
          />
        </div>
      </div>
    </div>
  );
};

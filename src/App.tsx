import React, { useState, useEffect } from 'react';
import { Sidebar, NavItemKey } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/views/DashboardView';
import { DraftingAssistantView } from './components/views/DraftingAssistantView';
import { FormFillerView } from './components/views/FormFillerView';
import { BatchMergeView } from './components/views/BatchMergeView';
import { MeetingRecorderView } from './components/views/MeetingRecorderView';
import { OcrView } from './components/views/OcrView';
import { DocumentQaView } from './components/views/DocumentQaView';
import { SchoolProfileView } from './components/views/SchoolProfileView';
import { TemplateLibraryView } from './components/views/TemplateLibraryView';
import { FontConverterView } from './components/views/FontConverterView';
import { DispatchManagementView } from './components/views/DispatchManagementView';
import { UserPermissionsView } from './components/views/UserPermissionsView';
import { AdministrativeToolsView } from './components/views/AdministrativeToolsView';
import { SettingsView } from './components/views/SettingsView';
import { AiAssistantView } from './components/views/AiAssistantView';
import { SchoolAiAssistant } from './components/assistant/SchoolAiAssistant';

import {
  SchoolProfile,
  AdministrativeDocument,
  IncomingDispatch,
  OutgoingDispatch,
  MeetingRecord,
  AuditLogItem,
  UserAccount,
  FormTemplate,
} from './types';
import { db } from './services/db';
import { apiService } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavItemKey>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Persistent States
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(() => db.getSchoolProfile());
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => db.getCurrentUser());
  const [documents, setDocuments] = useState<AdministrativeDocument[]>(() => db.getDocuments());
  const [incomingDispatches, setIncomingDispatches] = useState<IncomingDispatch[]>(() =>
    db.getIncomingDispatches()
  );
  const [outgoingDispatches, setOutgoingDispatches] = useState<OutgoingDispatch[]>(() =>
    db.getOutgoingDispatches()
  );
  const [meetings, setMeetings] = useState<MeetingRecord[]>(() => db.getMeetingRecords());
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => db.getAuditLogs());

  // Active document for drafting
  const [activeDraftingDoc, setActiveDraftingDoc] = useState<AdministrativeDocument | null>(null);

  // Floating AI Assistant state
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);

  // AI Health Status
  const [apiStatus, setApiStatus] = useState<{ ok: boolean; message: string }>({
    ok: true,
    message: 'Đang kiểm tra kết nối...',
  });

  const checkHealth = async () => {
    const res = await apiService.checkHealth();
    if (res.status === 'ok') {
      setApiStatus({
        ok: true,
        message: 'Mô hình Gemini 3.8 Flash đã kết nối thành công qua backend',
      });
    } else {
      setApiStatus({
        ok: false,
        message: res.error || 'Chưa thể kết nối đến máy chủ backend',
      });
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const refreshStateFromDb = () => {
    setSchoolProfile(db.getSchoolProfile());
    setCurrentUser(db.getCurrentUser());
    setDocuments(db.getDocuments());
    setIncomingDispatches(db.getIncomingDispatches());
    setOutgoingDispatches(db.getOutgoingDispatches());
    setMeetings(db.getMeetingRecords());
    setAuditLogs(db.getAuditLogs());
  };

  // Handlers
  const handleSwitchUser = (user: UserAccount) => {
    db.setCurrentUser(user);
    setCurrentUser(user);
    setAuditLogs(db.getAuditLogs());
  };

  const handleSaveProfile = (profile: SchoolProfile) => {
    db.saveSchoolProfile(profile);
    setSchoolProfile(profile);
    setAuditLogs(db.getAuditLogs());
  };

  const handleSaveDocument = (doc: AdministrativeDocument) => {
    db.saveDocument(doc);
    setDocuments(db.getDocuments());
    setAuditLogs(db.getAuditLogs());
  };

  const handleAddIncoming = (item: IncomingDispatch) => {
    db.saveIncomingDispatch(item);
    setIncomingDispatches(db.getIncomingDispatches());
    setAuditLogs(db.getAuditLogs());
  };

  const handleAddOutgoing = (item: OutgoingDispatch) => {
    db.saveOutgoingDispatch(item);
    setOutgoingDispatches(db.getOutgoingDispatches());
    setAuditLogs(db.getAuditLogs());
  };

  const handleSaveMeeting = (record: MeetingRecord) => {
    db.saveMeetingRecord(record);
    setMeetings(db.getMeetingRecords());
    setAuditLogs(db.getAuditLogs());
  };

  const handleOpenDocFromDashboard = (doc: AdministrativeDocument) => {
    setActiveDraftingDoc(doc);
    setActiveTab('drafting');
  };

  const handleSendOcrToDrafting = (text: string) => {
    const newDoc: AdministrativeDocument = {
      id: 'ocr_doc_' + Date.now(),
      title: 'VĂN BẢN TỪ ẢNH SCAN OCR',
      category: 'bieu_mau_khac',
      docNumber: '…/OCR',
      issueDate: new Date().toLocaleDateString('vi-VN'),
      location: 'TP. Hồ Chí Minh',
      subject: 'V/v chuyển đổi văn bản từ hình ảnh công văn',
      signerName: schoolProfile.principalName,
      signerPosition: 'HIỆU TRƯỞNG',
      recipients: ['Lưu: VT'],
      content: text,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: currentUser.name,
    };
    setActiveDraftingDoc(newDoc);
    setActiveTab('drafting');
  };

  const handleSendAssistantToDrafting = (text: string, title?: string) => {
    const newDoc: AdministrativeDocument = {
      id: 'ai_doc_' + Date.now(),
      title: title || 'VĂN BẢN TỪ TRỢ LÝ AI',
      category: 'cong_van',
      docNumber: '…/CV-THCS',
      issueDate: new Date().toLocaleDateString('vi-VN'),
      location: schoolProfile.address ? schoolProfile.address.split(',').pop()?.trim() || 'Hà Nội' : 'TP. Hồ Chí Minh',
      subject: 'Văn bản do Trợ lý AI Nhà trường hỗ trợ soạn thảo',
      signerName: schoolProfile.principalName,
      signerPosition: 'HIỆU TRƯỞNG',
      recipients: ['Như trên', 'Lưu: VT'],
      content: text,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: currentUser.name,
    };
    setActiveDraftingDoc(newDoc);
    setActiveTab('drafting');
  };

  const getPageTitle = (tab: NavItemKey) => {
    switch (tab) {
      case 'dashboard':
        return { title: 'Trang tổng quan', subtitle: 'Bảng điều khiển công tác văn thư & hồ sơ số' };
      case 'ai_assistant':
        return { title: 'Trợ lý AI Nhà Trường (SCHOOL DOC Copilot)', subtitle: 'Tư vấn thể thức NĐ 30, soạn thảo nhanh & tra cứu nghiệp vụ sư phạm' };
      case 'drafting':
        return { title: '1. Trợ lý soạn thảo văn bản AI', subtitle: 'Chuẩn Nghị định 30/2020/NĐ-CP của Chính phủ' };
      case 'form_filler':
        return { title: '2. Điền biểu mẫu Word, Excel tự động', subtitle: 'Nhận diện trường & ghép dữ liệu bảo toàn bố cục OOXML' };
      case 'batch_merge':
        return { title: '3. Tạo văn bản hàng loạt từ Excel', subtitle: 'Ghép dữ liệu bảng tính thành gói văn bản Word (.zip)' };
      case 'ocr':
        return { title: '5. Chuyển ảnh, PDF sang Word – OCR', subtitle: 'Nhận diện văn bản tiếng Việt & tái tạo bảng số liệu' };
      case 'meeting':
        return { title: '4. Ghi âm cuộc họp – Tạo biên bản AI', subtitle: 'Thu âm trực tiếp và lập 6 loại biên bản họp trường học' };
      case 'doc_qa':
        return { title: '6. Hỏi đáp tài liệu AI', subtitle: 'Tra cứu quy định, điều lệ trường học có trích dẫn nguồn minh bạch' };
      case 'school_profile':
        return { title: '7. Hồ sơ đơn vị – Thông tin dùng chung', subtitle: 'Khai báo thông tin trường học, ban giám hiệu & danh bạ giáo viên' };
      case 'templates':
        return { title: '8. Kho biểu mẫu nhà trường', subtitle: 'Thư viện 12 nhóm biểu mẫu hành chính và chuyên môn' };
      case 'font_converter':
        return { title: '9. Chuyển đổi định dạng & Phông chữ', subtitle: 'Chuyển TCVN3 / VNI sang Unicode & sửa lỗi chính tả văn bản cổ' };
      case 'dispatch':
        return { title: '10. Quản lý văn bản Đi – Đến', subtitle: 'Sổ văn thư số theo dõi tình trạng xử lý và thời hạn' };
      case 'permissions':
        return { title: '11. Quản lý người dùng & Phân quyền', subtitle: 'Hệ thống kiểm soát 7 vai trò nhà trường & nhật ký kiểm toán' };
      case 'tools':
        return { title: '12. Công cụ AI bổ trợ', subtitle: 'Kiểm tra thể thức NĐ 30, so sánh dự thảo và chuyển bảng Excel' };
      case 'settings':
        return { title: 'Cài đặt AI & Sao lưu hệ thống', subtitle: 'Mô hình Google Gemini & sao lưu toàn bộ dữ liệu ra file' };
      default:
        return { title: 'SCHOOL DOC AI', subtitle: '' };
    }
  };

  const currentMeta = getPageTitle(activeTab);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-800 antialiased">
      {/* Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'drafting' && activeTab !== 'drafting') {
            setActiveDraftingDoc(null);
          }
          setActiveTab(tab);
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        userRole={currentUser.role}
      />

      {/* Main Workspace */}
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          currentUser={currentUser}
          onSwitchUser={handleSwitchUser}
          schoolProfile={schoolProfile}
          title={currentMeta.title}
          subtitle={currentMeta.subtitle}
          onNewDocClick={() => {
            setActiveDraftingDoc(null);
            setActiveTab('drafting');
          }}
          apiStatus={apiStatus}
          onRefreshHealth={checkHealth}
        />

        {/* Dynamic Content View Container */}
        <main className="flex-1 overflow-y-auto bg-slate-100">
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigate={setActiveTab}
              documents={documents}
              incomingDispatches={incomingDispatches}
              meetings={meetings}
              auditLogs={auditLogs}
              schoolProfile={schoolProfile}
              onOpenDoc={handleOpenDocFromDashboard}
            />
          )}

          {activeTab === 'ai_assistant' && (
            <AiAssistantView
              schoolProfile={schoolProfile}
              currentUser={currentUser}
              onSendToDrafting={handleSendAssistantToDrafting}
            />
          )}

          {activeTab === 'drafting' && (
            <DraftingAssistantView
              schoolProfile={schoolProfile}
              onSaveDocument={handleSaveDocument}
              initialDocument={activeDraftingDoc}
            />
          )}

          {activeTab === 'form_filler' && (
            <FormFillerView schoolProfile={schoolProfile} />
          )}

          {activeTab === 'batch_merge' && (
            <BatchMergeView schoolProfile={schoolProfile} />
          )}

          {activeTab === 'meeting' && (
            <MeetingRecorderView
              schoolProfile={schoolProfile}
              onSaveMeeting={handleSaveMeeting}
              meetingsList={meetings}
            />
          )}

          {activeTab === 'ocr' && (
            <OcrView
              schoolProfile={schoolProfile}
              onSendToDrafting={handleSendOcrToDrafting}
            />
          )}

          {activeTab === 'doc_qa' && <DocumentQaView />}

          {activeTab === 'school_profile' && (
            <SchoolProfileView
              schoolProfile={schoolProfile}
              onSaveProfile={handleSaveProfile}
            />
          )}

          {activeTab === 'templates' && (
            <TemplateLibraryView
              schoolProfile={schoolProfile}
              onSelectToFill={(tpl) => {
                setActiveTab('form_filler');
              }}
            />
          )}

          {activeTab === 'font_converter' && <FontConverterView />}

          {activeTab === 'dispatch' && (
            <DispatchManagementView
              incomingList={incomingDispatches}
              outgoingList={outgoingDispatches}
              onAddIncoming={handleAddIncoming}
              onAddOutgoing={handleAddOutgoing}
            />
          )}

          {activeTab === 'permissions' && (
            <UserPermissionsView
              currentUser={currentUser}
              onSwitchUser={handleSwitchUser}
              auditLogs={auditLogs}
            />
          )}

          {activeTab === 'tools' && <AdministrativeToolsView />}

          {activeTab === 'settings' && (
            <SettingsView
              apiStatus={apiStatus}
              onRefreshHealth={checkHealth}
              onDataRestored={refreshStateFromDb}
            />
          )}
        </main>
      </div>

      {/* Floating School AI Assistant Copilot (Active across all tabs) */}
      <SchoolAiAssistant
        isOpen={isAssistantOpen}
        onToggle={(open) => setIsAssistantOpen(open !== undefined ? open : !isAssistantOpen)}
        schoolProfile={schoolProfile}
        currentUser={currentUser}
        onSendToDrafting={handleSendAssistantToDrafting}
      />
    </div>
  );
}

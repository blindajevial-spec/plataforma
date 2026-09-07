import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { TestingView } from './components/TestingView';
import { RandomSelectorView } from './components/RandomSelectorView';
import { DriversAndFleetView } from './components/DriversAndFleetView';
import { LaboratoryPortalView } from './components/LaboratoryPortalView';
import { IntegralServiceView } from './components/IntegralServiceView';
import { SpecificationsView } from './components/SpecificationsView';
import { ComplianceMatrixView } from './components/ComplianceMatrixView';
import { RiskManagementView } from './components/RiskManagementView';
import { AuditsAndCAPAView } from './components/AuditsAndCAPAView';
import { DocumentManagerView } from './components/DocumentManagerView';
import { EquipmentView } from './components/EquipmentView';
import { ExecutiveReportsView } from './components/ExecutiveReportsView';
import { AuditLogsView } from './components/AuditLogsView';
import { SystemArchitectureView } from './components/SystemArchitectureView';
import { ImageStudioView } from './components/ImageStudioView';
import { MapsGroundingView } from './components/MapsGroundingView';
import { NewTestModal } from './components/NewTestModal';
import { TestDetailModal } from './components/TestDetailModal';
import { SusesoManualModal } from './components/SusesoManualModal';
import { NavView, TestRecord } from './types';

const MainLayout: React.FC = () => {
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [isNewTestModalOpen, setIsNewTestModalOpen] = useState(false);
  const [selectedTestForDetail, setSelectedTestForDetail] = useState<TestRecord | null>(null);
  const [isSusesoManualOpen, setIsSusesoManualOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView
            onNavigate={(view) => setCurrentView(view as NavView)}
            onOpenNewTest={() => setIsNewTestModalOpen(true)}
          />
        );
      case 'integral_service':
        return <IntegralServiceView onNavigate={(view) => setCurrentView(view as NavView)} />;
      case 'image_studio':
        return <ImageStudioView />;
      case 'maps_locator':
        return <MapsGroundingView />;
      case 'specifications':
        return <SpecificationsView />;
      case 'tests':
        return (
          <TestingView
            onOpenNewTestModal={() => setIsNewTestModalOpen(true)}
            onViewTestDetails={(test) => setSelectedTestForDetail(test)}
          />
        );
      case 'random_selection':
        return <RandomSelectorView />;
      case 'drivers_fleet':
        return <DriversAndFleetView />;
      case 'lab_portal':
        return <LaboratoryPortalView />;
      case 'compliance_matrix':
        return <ComplianceMatrixView />;
      case 'risks':
        return <RiskManagementView />;
      case 'audits':
        return <AuditsAndCAPAView />;
      case 'documents':
        return <DocumentManagerView />;
      case 'equipment':
        return <EquipmentView />;
      case 'reports':
        return <ExecutiveReportsView />;
      case 'audit_logs':
        return <AuditLogsView />;
      case 'architecture':
      case 'api':
        return <SystemArchitectureView />;
      default:
        return (
          <DashboardView
            onNavigate={(view) => setCurrentView(view as NavView)}
            onOpenNewTest={() => setIsNewTestModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
      {/* Top Navbar */}
      <Navbar onNavigate={(view) => setCurrentView(view as NavView)} />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar
          currentView={currentView}
          onSelectView={setCurrentView}
          onOpenSusesoManual={() => setIsSusesoManualOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-950 pb-16">
          {renderView()}
        </main>
      </div>

      {/* Global Modals */}
      <NewTestModal
        isOpen={isNewTestModalOpen}
        onClose={() => setIsNewTestModalOpen(false)}
      />

      <TestDetailModal
        test={selectedTestForDetail}
        onClose={() => setSelectedTestForDetail(null)}
      />

      <SusesoManualModal
        isOpen={isSusesoManualOpen}
        onClose={() => setIsSusesoManualOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

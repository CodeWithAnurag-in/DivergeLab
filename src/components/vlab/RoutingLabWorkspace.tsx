import React, { useState } from 'react';
import { AimSection } from './AimSection';
import { TheorySection } from './TheorySection';
import { PreTestSection } from './PreTestSection';
import { PostTestSection } from './PostTestSection';

export type LabTabId = 'aim' | 'theory' | 'pretest' | 'posttest';

interface RoutingLabWorkspaceProps {
  currentTab?: LabTabId;
  onTabChange?: (tab: LabTabId) => void;
}

export const RoutingLabWorkspace: React.FC<RoutingLabWorkspaceProps> = ({
  currentTab: controlledTab,
  onTabChange,
}) => {
  const [internalTab, setInternalTab] = useState<LabTabId>('aim');
  const activeTab = controlledTab ?? internalTab;

  const handleTabChange = (tabId: LabTabId) => {
    if (onTabChange) {
      onTabChange(tabId);
    } else {
      setInternalTab(tabId);
    }

    const workspaceElement = document.getElementById('lab-workspace');
    if (workspaceElement) {
      const top = workspaceElement.getBoundingClientRect().top + window.scrollY - 30;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div id="lab-workspace" className="w-full">
      {/* Active Tab Content Pane */}
      <div className="w-full">
        {activeTab === 'aim' && (
          <div className="animate-in fade-in duration-200">
            <AimSection onProceed={() => handleTabChange('theory')} />
          </div>
        )}

        {activeTab === 'theory' && (
          <div className="animate-in fade-in duration-200">
            <TheorySection onProceed={() => handleTabChange('pretest')} />
          </div>
        )}

        {activeTab === 'pretest' && (
          <div className="animate-in fade-in duration-200">
            <PreTestSection
              onProceedToTheory={() => handleTabChange('theory')}
              onProceedToPostTest={() => handleTabChange('posttest')}
            />
          </div>
        )}

        {activeTab === 'posttest' && (
          <div className="animate-in fade-in duration-200">
            <PostTestSection onReviewTheory={() => handleTabChange('theory')} />
          </div>
        )}
      </div>
    </div>
  );
};

export default RoutingLabWorkspace;

import React, { useState } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

interface TabData {
  id: string;
  name: string;
  content: string;
}

const TabbedLanding: React.FC = () => {
  const [tabs, setTabs] = useState<TabData[]>([
    { id: '1', name: 'Hello', content: 'Hello' },
    { id: '2', name: 'World', content: 'World' }
  ]);
  const [activeTab, setActiveTab] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTabName, setNewTabName] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tabToDelete, setTabToDelete] = useState<TabData | null>(null);

  const addNewTab = () => {
    if (newTabName.trim()) {
      const newTab: TabData = {
        id: Date.now().toString(),
        name: newTabName.trim(),
        content: newTabName.trim()
      };
      setTabs([...tabs, newTab]);
      setNewTabName('');
      setIsModalOpen(false);
      setActiveTab(tabs.length); // Set to the new tab
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewTabName('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addNewTab();
    } else if (e.key === 'Escape') {
      closeModal();
    }
  };

  const handleTabDoubleClick = (tab: TabData) => {
    // Prevent deleting the last tab
    if (tabs.length <= 1) {
      return;
    }
    setTabToDelete(tab);
    setIsDeleteModalOpen(true);
  };

  const deleteTab = () => {
    if (tabToDelete) {
      const newTabs = tabs.filter(tab => tab.id !== tabToDelete.id);
      setTabs(newTabs);
      
      // Adjust active tab if necessary
      if (activeTab >= newTabs.length) {
        setActiveTab(Math.max(0, newTabs.length - 1));
      }
      
      setIsDeleteModalOpen(false);
      setTabToDelete(null);
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setTabToDelete(null);
  };

  const handleDeleteKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      deleteTab();
    } else if (e.key === 'Escape') {
      closeDeleteModal();
    }
  };

  return (
    <div className="w-full h-screen bg-gray-100">
      <Tabs
        selectedIndex={activeTab}
        onSelect={(index) => setActiveTab(index)}
        className="h-full flex flex-col"
      >
        <div className="bg-white shadow-sm border-b">
          <TabList className="flex space-x-1 p-2">
            {tabs.map((tab) => (
              <Tab
                key={tab.id}
                className="px-4 py-2 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-800 hover:border-gray-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-t-lg transition-colors duration-200"
                selectedClassName="text-blue-600 border-blue-600"
                onDoubleClick={() => handleTabDoubleClick(tab)}
                title="Double-click to delete tab"
              >
                {tab.name}
              </Tab>
            ))}
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              title="Add new tab"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </TabList>
        </div>

        <div className="flex-1 p-6">
          {tabs.map((tab) => (
            <TabPanel key={tab.id} className="h-full">
              <div className="h-full flex items-center justify-center">
                <h1 className="text-4xl font-bold text-gray-800">{tab.content}</h1>
              </div>
            </TabPanel>
          ))}
        </div>
      </Tabs>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Tab</h3>
            <div className="mb-4">
              <label htmlFor="tabName" className="block text-sm font-medium text-gray-700 mb-2">
                Tab Name
              </label>
              <input
                id="tabName"
                type="text"
                value={newTabName}
                onChange={(e) => setNewTabName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter tab name"
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={addNewTab}
                disabled={!newTabName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Add Tab
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && tabToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Delete Tab</h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              Are you sure you want to delete the tab <strong>"{tabToDelete.name}"</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={closeDeleteModal}
                onKeyPress={handleDeleteKeyPress}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={deleteTab}
                onKeyPress={handleDeleteKeyPress}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              >
                Delete Tab
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabbedLanding;

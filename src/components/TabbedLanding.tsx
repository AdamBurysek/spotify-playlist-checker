import React, { useState } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

interface TabData {
  id: string;
  name: string;
  csvFile: File | null;
  songs: Song[];
  csvLoaded: boolean;
  isLoading: boolean;
}

interface Song {
  id: string;
  name: string;
  artist: string;
  checked: boolean;
}

const TabbedLanding: React.FC = () => {
  const [tabs, setTabs] = useState<TabData[]>([
    { id: '1', name: 'Hello', csvFile: null, songs: [], csvLoaded: false, isLoading: false }
  ]);
  const [activeTab, setActiveTab] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTabName, setNewTabName] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tabToDelete, setTabToDelete] = useState<TabData | null>(null);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [tabToRename, setTabToRename] = useState<TabData | null>(null);
  const [renameTabName, setRenameTabName] = useState('');
  const [longPressTimer, setLongPressTimer] = useState<number | null>(null);

  const addNewTab = () => {
    if (newTabName.trim()) {
      const newTab: TabData = {
        id: Date.now().toString(),
        name: newTabName.trim(),
        csvFile: null,
        songs: [],
        csvLoaded: false,
        isLoading: false
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

  const handleRenameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      renameTab();
    } else if (e.key === 'Escape') {
      closeRenameModal();
    }
  };

  const handleTabDoubleClick = (tab: TabData) => {
    // Prevent deleting the last tab
    if (tabs.length <= 1) {
      alert('Cannot delete the last remaining tab');
      return;
    }
    setTabToDelete(tab);
    setIsDeleteModalOpen(true);
  };

  const handleTabLongClick = (tab: TabData) => {
    setTabToRename(tab);
    setRenameTabName(tab.name);
    setIsRenameModalOpen(true);
  };

  const handleMouseDown = (tab: TabData) => {
    const timer = setTimeout(() => {
      handleTabLongClick(tab);
    }, 800); // 800ms long press
    setLongPressTimer(timer);
  };

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleMouseLeave = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const renameTab = () => {
    if (renameTabName.trim() && tabToRename) {
      setTabs(tabs.map(tab => 
        tab.id === tabToRename.id 
          ? { ...tab, name: renameTabName.trim() }
          : tab
      ));
      setRenameTabName('');
      setIsRenameModalOpen(false);
      setTabToRename(null);
    }
  };

  const closeRenameModal = () => {
    setIsRenameModalOpen(false);
    setRenameTabName('');
    setTabToRename(null);
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

  // CSV parsing functions
  const parseCSV = (csvText: string): Song[] => {
    const lines = csvText.split('\n');
    const songs: Song[] = [];
    
    // Skip header row (index 0) and process data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Parse CSV line - handle quoted fields that may contain commas
      const fields = parseCSVLine(line);
      
      if (fields.length >= 3) {
        const songName = fields[1]?.replace(/"/g, '') || '';
        const artistName = fields[2]?.replace(/"/g, '') || '';
        
        if (songName && artistName) {
          songs.push({
            id: (i).toString(),
            name: songName,
            artist: artistName,
            checked: false
          });
        }
      }
    }
    
    return songs;
  };

  const parseCSVLine = (line: string): string[] => {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    fields.push(current);
    return fields;
  };

  const handleCSVUpload = (tabId: string, file: File) => {
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    // Set loading state for this specific tab
    setTabs(tabs.map(tab => 
      tab.id === tabId 
        ? { ...tab, isLoading: true }
        : tab
    ));
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const songs = parseCSV(csvText);
        
        if (songs.length === 0) {
          alert('No valid songs found in the CSV file');
          // Reset loading state
          setTabs(tabs.map(tab => 
            tab.id === tabId 
              ? { ...tab, isLoading: false }
              : tab
          ));
          return;
        }
        
        setTabs(tabs.map(tab => 
          tab.id === tabId 
            ? { ...tab, csvFile: file, songs: songs, csvLoaded: true, isLoading: false }
            : tab
        ));
        
      } catch (error) {
        console.error('Error parsing CSV:', error);
        alert('Error parsing CSV file. Please check the format.');
        // Reset loading state
        setTabs(tabs.map(tab => 
          tab.id === tabId 
            ? { ...tab, isLoading: false }
            : tab
        ));
      }
    };
    
    reader.readAsText(file);
  };

  const handleSongCheck = (tabId: string, songId: string) => {
    setTabs(tabs.map(tab => 
      tab.id === tabId 
        ? { ...tab, songs: tab.songs.map(song => 
            song.id === songId ? { ...song, checked: !song.checked } : song
          )}
        : tab
    ));
  };

  const handleSelectAll = (tabId: string) => {
    const currentTab = tabs.find(tab => tab.id === tabId);
    if (!currentTab) return;
    
    const allChecked = currentTab.songs.every(song => song.checked);
    setTabs(tabs.map(tab => 
      tab.id === tabId 
        ? { ...tab, songs: tab.songs.map(song => ({ ...song, checked: !allChecked })) }
        : tab
    ));
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
                onMouseDown={() => handleMouseDown(tab)}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                title="Double-click to delete tab, long press to rename"
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

        
          {tabs.map((tab, index) => (
            
            <TabPanel key={tab.id} className="h-full">
              {index === activeTab && (
                <div className="h-full flex flex-col">
                  {!tab.csvLoaded ? (
                    // Input state - show CSV upload
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-full max-w-2xl">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                          {tab.name} - CSV Music Library
                        </h2>
                        <div className="text-center">
                          <div className="mb-4">
                            <label htmlFor={`csvFile-${tab.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                              Upload CSV File
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors duration-200">
                              <div className="space-y-1 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div className="flex text-sm text-gray-600">
                                  <label htmlFor={`csvFile-${tab.id}`} className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                    <span>Upload a file</span>
                                    <input
                                      id={`csvFile-${tab.id}`}
                                      type="file"
                                      accept=".csv"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          handleCSVUpload(tab.id, file);
                                        }
                                      }}
                                      className="sr-only"
                                      disabled={tab.isLoading}
                                    />
                                  </label>
                                  <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">
                                  CSV files only. Expected format: #, Song, Artist, ...
                                </p>
                              </div>
                            </div>
                          </div>
                          {tab.isLoading && (
                            <div className="flex items-center justify-center">
                              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span className="text-sm text-gray-600">Processing CSV file...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Table state - show CSV data table
                    <div className="h-full flex flex-col">
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h2 className="text-2xl font-bold text-gray-800">
                            {tab.name} - Music Library ({tab.songs.length})
                          </h2>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              CSV Loaded
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          File: <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{tab.csvFile?.name}</span>
                        </p>
                        <p className="text-xs text-gray-500 mb-4">
                          Songs loaded from CSV file. Select songs to manage your library.
                        </p>
                        <button
                          onClick={() => {
                            setTabs(tabs.map(t => 
                              t.id === tab.id ? { ...t, csvFile: null, songs: [], csvLoaded: false } : t
                            ));
                          }}
                          className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors duration-200"
                        >
                          Upload Different CSV
                        </button>
                      </div>

                      {tab.songs.length > 0 && (
                        <div className="flex-1 overflow-hidden">
                          <div className="bg-white rounded-lg shadow-sm border h-full flex flex-col">
                            <div className="p-4 border-b bg-gray-50">
                              <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-800">
                                  Songs ({tab.songs.length})
                                </h3>
                                <button
                                  onClick={() => handleSelectAll(tab.id)}
                                  className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors duration-200"
                                >
                                  {tab.songs.every(song => song.checked) ? 'Deselect All' : 'Select All'}
                                </button>
                              </div>
                            </div>
                            <div className="flex-1 overflow-auto">
                              <table className="w-full">
                                <thead className="bg-gray-50 sticky top-0">
                                  <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                                      <input
                                        type="checkbox"
                                        checked={tab.songs.every(song => song.checked)}
                                        onChange={() => handleSelectAll(tab.id)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                      />
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Song Name
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Artist
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {tab.songs.map((song) => (
                                    <tr key={song.id} className={song.checked ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                                      <td className="px-4 py-3 whitespace-nowrap">
                                        <input
                                          type="checkbox"
                                          checked={song.checked}
                                          onChange={() => handleSongCheck(tab.id, song.id)}
                                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {song.name}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {song.artist}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}

                      {tab.songs.length === 0 && (
                        <div className="flex-1 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-gray-400 mb-2">
                              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                              </svg>
                            </div>
                            <p className="text-gray-500">No songs found in this playlist</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </TabPanel>
          ))}
  
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

      {/* Rename Modal */}
      {isRenameModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Rename Tab
              </h3>
              <div className="mb-4">
                <label htmlFor="renameTabName" className="block text-sm font-medium text-gray-700 mb-2">
                  Tab Name
                </label>
                <input
                  id="renameTabName"
                  type="text"
                  value={renameTabName}
                  onChange={(e) => setRenameTabName(e.target.value)}
                  onKeyPress={handleRenameKeyPress}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter new tab name"
                  autoFocus
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeRenameModal}
                  onKeyPress={handleRenameKeyPress}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={renameTab}
                  onKeyPress={handleRenameKeyPress}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Rename Tab
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabbedLanding;

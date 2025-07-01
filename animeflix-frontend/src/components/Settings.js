import React, { useState } from 'react';
import MigratorTool from './MigratorTool';
import ContentEditor from './ContentEditor';
import './Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
      </div>
      
      <div className="settings-content">
        <div className="settings-sidebar">
          <nav className="settings-nav">
            <button 
              className={`settings-nav-item ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              <i className="fas fa-cog"></i>
              General
            </button>
            <button 
              className={`settings-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <i className="fas fa-user"></i>
              Profile
            </button>
            <button 
              className={`settings-nav-item ${activeTab === 'migrator' ? 'active' : ''}`}
              onClick={() => setActiveTab('migrator')}
            >
              <i className="fas fa-folder-open"></i>
              Content Migrator
            </button>
            <button 
              className={`settings-nav-item ${activeTab === 'editor' ? 'active' : ''}`}
              onClick={() => setActiveTab('editor')}
            >
              <i className="fas fa-edit"></i>
              Content Editor
            </button>
          </nav>
        </div>
        
        <div className="settings-panel">
          {activeTab === 'general' && (
            <div className="settings-section">
              <h2>General Settings</h2>
              <div className="settings-group">
                <label className="settings-label">
                  <span>Video Quality</span>
                  <select className="settings-select">
                    <option value="auto">Auto</option>
                    <option value="1080p">1080p</option>
                    <option value="720p">720p</option>
                    <option value="480p">480p</option>
                  </select>
                </label>
                
                <label className="settings-label">
                  <span>Autoplay Next Episode</span>
                  <input type="checkbox" className="settings-checkbox" defaultChecked />
                </label>
                
                <label className="settings-label">
                  <span>Skip Intro</span>
                  <input type="checkbox" className="settings-checkbox" />
                </label>
              </div>
            </div>
          )}
          
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h2>Profile Settings</h2>
              <div className="settings-group">
                <label className="settings-label">
                  <span>Display Name</span>
                  <input type="text" className="settings-input" placeholder="Your name" />
                </label>
                
                <label className="settings-label">
                  <span>Email</span>
                  <input type="email" className="settings-input" placeholder="your@email.com" />
                </label>
              </div>
            </div>
          )}
          
          {activeTab === 'migrator' && <MigratorTool />}
          
          {activeTab === 'editor' && <ContentEditor />}
        </div>
      </div>
    </div>
  );
};

export default Settings;
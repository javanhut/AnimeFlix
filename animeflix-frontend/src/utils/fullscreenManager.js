// Netflix-style Seamless Fullscreen Manager
// Handles auto-fullscreen with user permission and settings
class FullscreenManager {
  constructor() {
    this.isFullscreenCapable = this.checkFullscreenCapability();
  }

  // Check if browser supports fullscreen API
  checkFullscreenCapability() {
    return !!(
      document.fullscreenEnabled ||
      document.mozFullScreenEnabled ||
      document.webkitFullscreenEnabled ||
      document.msFullscreenEnabled
    );
  }

  // Netflix-style seamless fullscreen - must be called within user gesture
  async requestFullscreen(element) {
    if (!this.isFullscreenCapable || !element) {
      console.log('Fullscreen not supported or no element provided');
      return false;
    }

    try {
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      }
      return true;
    } catch (error) {
      console.log('Fullscreen request failed (this is normal if user denied):', error.message);
      return false;
    }
  }

  // Exit fullscreen mode
  async exitFullscreen() {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        await document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen();
      }
      return true;
    } catch (error) {
      console.error('Exit fullscreen failed:', error);
      return false;
    }
  }

  // Check if fullscreen is currently active
  isCurrentlyFullscreen() {
    return !!(
      document.fullscreenElement ||
      document.mozFullScreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement
    );
  }

  // Toggle fullscreen mode (must be called within user gesture)
  async toggleFullscreen(element) {
    if (this.isCurrentlyFullscreen()) {
      return await this.exitFullscreen();
    } else {
      return await this.requestFullscreen(element);
    }
  }

  // Get auto-fullscreen setting
  getAutoFullscreenSetting() {
    return localStorage.getItem('animeflix_auto_fullscreen') === 'true';
  }

  // Set auto-fullscreen setting
  setAutoFullscreenSetting(enabled) {
    localStorage.setItem('animeflix_auto_fullscreen', enabled.toString());
  }

  // Check if user has given permission for auto-fullscreen
  hasAutoFullscreenPermission() {
    const permission = localStorage.getItem('animeflix_fullscreen_permission');
    return permission === 'granted';
  }

  // Set fullscreen permission
  setFullscreenPermission(granted) {
    localStorage.setItem('animeflix_fullscreen_permission', granted ? 'granted' : 'denied');
  }

  // Reset fullscreen permission (for settings)
  resetPermission() {
    localStorage.removeItem('animeflix_fullscreen_permission');
  }

  // Clean up any existing modal dialogs to prevent positioning issues
  cleanupExistingModals() {
    const existingDialogs = document.querySelectorAll('[data-animeflix-modal]');
    existingDialogs.forEach(dialog => {
      if (document.body.contains(dialog)) {
        document.body.removeChild(dialog);
      }
    });
  }

  // Request persistent fullscreen permission with popup dialog
  async requestPersistentFullscreenPermission() {
    // Clean up any existing modals first
    this.cleanupExistingModals();
    
    return new Promise((resolve) => {
      // Create permission dialog
      const dialog = document.createElement('div');
      dialog.setAttribute('data-animeflix-modal', 'fullscreen-permission');
      dialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1001;
        font-family: Arial, sans-serif;
        box-sizing: border-box;
      `;

      const modal = document.createElement('div');
      modal.style.cssText = `
        background: #2a2a2a;
        color: white;
        padding: 30px;
        border-radius: 12px;
        max-width: 500px;
        width: 90%;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        position: relative;
        margin: auto;
        box-sizing: border-box;
      `;

      modal.innerHTML = `
        <div style="margin-bottom: 20px; font-size: 48px;">🎬</div>
        <h2 style="margin: 0 0 15px 0; color: #e50914;">Enable Auto-Fullscreen</h2>
        <p style="margin: 0 0 20px 0; line-height: 1.5; color: #ccc;">
          AnimeFlix would like permission to automatically enter fullscreen mode when playing videos.
          This will provide the best viewing experience and maintain fullscreen during auto-next episodes.
        </p>
        <p style="margin: 0 0 25px 0; font-size: 14px; color: #888;">
          You can change this preference anytime in Settings.
        </p>
        <div style="display: flex; gap: 15px; justify-content: center;">
          <button id="fullscreen-deny" style="
            background: #666;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
          ">Block</button>
          <button id="fullscreen-allow" style="
            background: #e50914;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
          ">Allow</button>
        </div>
      `;

      dialog.appendChild(modal);
      document.body.appendChild(dialog);

      // Handle button clicks
      document.getElementById('fullscreen-allow').onclick = () => {
        this.setFullscreenPermission(true);
        document.body.removeChild(dialog);
        resolve(true);
      };

      document.getElementById('fullscreen-deny').onclick = () => {
        this.setFullscreenPermission(false);
        this.setAutoFullscreenSetting(false); // Also disable the setting
        document.body.removeChild(dialog);
        resolve(false);
      };

      // Close on outside click
      dialog.onclick = (e) => {
        if (e.target === dialog) {
          this.setFullscreenPermission(false);
          document.body.removeChild(dialog);
          resolve(false);
        }
      };
    });
  }

  // Try auto-fullscreen with permission check
  async tryAutoFullscreen(element, isUserGesture = true) {
    // Check if auto-fullscreen is enabled in settings
    if (!this.getAutoFullscreenSetting()) {
      return false;
    }

    // Check if we already have permission
    const hasPermission = this.hasAutoFullscreenPermission();
    
    if (hasPermission) {
      // We have permission, go fullscreen
      return await this.requestFullscreen(element);
    }

    // Check if permission was explicitly denied
    const permission = localStorage.getItem('animeflix_fullscreen_permission');
    if (permission === 'denied') {
      return false;
    }

    // First time or no permission set - only ask during user gesture
    if (isUserGesture) {
      const granted = await this.requestPersistentFullscreenPermission();
      if (granted) {
        return await this.requestFullscreen(element);
      }
    }

    return false;
  }

  // Force fullscreen (for auto-next episodes when permission is granted)
  async forceFullscreen(element) {
    if (!this.getAutoFullscreenSetting() || !this.hasAutoFullscreenPermission()) {
      return false;
    }

    return await this.requestFullscreen(element);
  }

  // Maintain fullscreen during video transitions
  async maintainFullscreen(element, maxRetries = 5) {
    if (!this.getAutoFullscreenSetting() || !this.hasAutoFullscreenPermission()) {
      console.log('❌ Cannot maintain fullscreen - setting disabled or no permission');
      return false;
    }

    console.log('🔄 Starting fullscreen maintenance process...');

    for (let i = 0; i < maxRetries; i++) {
      if (!this.isCurrentlyFullscreen()) {
        console.log(`🔄 Attempting to restore fullscreen (attempt ${i + 1}/${maxRetries})`);
        try {
          const success = await this.requestFullscreen(element);
          if (success) {
            console.log('✅ Fullscreen restored successfully');
            return true;
          }
        } catch (error) {
          console.log(`⚠️ Fullscreen attempt ${i + 1} failed:`, error.message);
        }
        
        // Progressive delay between retries
        const delay = Math.min(500 * Math.pow(2, i), 2000); // 500ms, 1s, 2s, 2s, 2s
        console.log(`⏳ Waiting ${delay}ms before next attempt...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.log('✅ Already in fullscreen');
        return true;
      }
    }
    
    console.log('❌ Failed to restore fullscreen after all retries');
    return false;
  }

  // Show fullscreen prompt for auto-next episodes
  showAutoNextFullscreenPrompt(element) {
    if (!this.getAutoFullscreenSetting() || !this.hasAutoFullscreenPermission()) {
      return false;
    }

    // Only show if not already fullscreen
    if (this.isCurrentlyFullscreen()) {
      return true;
    }

    console.log('🎬 Showing auto-next fullscreen prompt...');

    // Clean up any existing prompts first
    this.cleanupExistingModals();
    
    // Create subtle prompt overlay
    const prompt = document.createElement('div');
    prompt.setAttribute('data-animeflix-modal', 'fullscreen-prompt');
    prompt.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      z-index: 1002;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
      border: 2px solid #e50914;
      cursor: pointer;
      transition: opacity 0.3s ease;
      max-width: 300px;
      box-sizing: border-box;
    `;

    prompt.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <div style="font-size: 20px;">🎬</div>
        <div>
          <div style="font-weight: bold; margin-bottom: 5px;">Continue in Fullscreen?</div>
          <div style="font-size: 12px; color: #ccc;">Click to resume fullscreen for next episode</div>
        </div>
      </div>
    `;

    // Add click handler for user gesture
    prompt.onclick = async () => {
      const success = await this.requestFullscreen(element);
      if (success) {
        console.log('✅ User clicked to restore fullscreen');
      }
      document.body.removeChild(prompt);
    };

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (document.body.contains(prompt)) {
        prompt.style.opacity = '0';
        setTimeout(() => {
          if (document.body.contains(prompt)) {
            document.body.removeChild(prompt);
          }
        }, 300);
      }
    }, 5000);

    document.body.appendChild(prompt);
    return true;
  }

  // Check if we should show fullscreen prompt for auto-next
  shouldPromptForAutoNext() {
    return this.getAutoFullscreenSetting() && 
           this.hasAutoFullscreenPermission() && 
           !this.isCurrentlyFullscreen();
  }
}

// Create and export singleton instance
const fullscreenManager = new FullscreenManager();
export default fullscreenManager;
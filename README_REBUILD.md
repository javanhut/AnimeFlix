# AnimeFlix Rebuild Scripts

## Quick Rebuild Instructions

### Frontend Only (Recommended for code changes)
```bash
./rebuild-frontend.sh
```

### Complete Rebuild (All containers)
```bash
./rebuild-all.sh
```

## Auto-Fullscreen Feature

✨ **NEW**: Advanced auto-fullscreen with persistent permission dialog!

### How to Test:

1. **Access the Application**
   ```
   Frontend: http://localhost:3050
   Backend:  http://localhost:3051
   ```

2. **Enable Auto-Fullscreen**
   - Click the Settings icon (⚙️) in the top-right corner
   - Go to "General" tab
   - Check the "Auto-Fullscreen" checkbox
   - OR scroll down to the detailed "Auto-Fullscreen Settings" panel

3. **Grant Permission**
   - Go to any video (e.g., Go! Go! Loser Ranger episode)
   - Click the play button
   - **Permission dialog appears** (like camera/microphone permissions)
   - Click "Allow" to grant persistent fullscreen permission
   - Video immediately goes fullscreen!

4. **Test Auto-Next**
   - Let the video play to the end
   - **Auto-next episode maintains fullscreen seamlessly!**
   - No more permission requests needed

### Features:

- ✅ **Permission Dialog**: Like camera/microphone permissions for websites
- ✅ **Manual Play**: Click play button → auto-fullscreen
- ✅ **Auto-Next Persistence**: Auto-next episodes stay fullscreen  
- ✅ **Smart Memory**: Remembers permission across sessions
- ✅ **Manual Exit Respect**: If you exit fullscreen, respects choice for current session
- ✅ **Settings Toggle**: Easy enable/disable in settings
- ✅ **Status Indicators**: Shows permission status with color coding
- ✅ **Reset Option**: Reset permission to test again

### Permission States:

- 🟢 **Allow**: Full auto-fullscreen functionality
- 🔴 **Block**: Auto-fullscreen disabled completely  
- 🟡 **Not Set**: Permission dialog will appear on first play

### Settings Locations:

1. **Quick Toggle**: Settings → General → Auto-Fullscreen checkbox
2. **Advanced Panel**: Settings → General → Auto-Fullscreen Settings (detailed controls)

### Permission States:

- 🟢 **Granted**: Auto-fullscreen will work
- 🔴 **Denied**: Auto-fullscreen disabled by browser
- 🟡 **Unknown**: First time - will test on next play

## Troubleshooting

### Frontend Not Updating?
```bash
# Force rebuild frontend
./rebuild-frontend.sh
```

### Complete Reset?
```bash
# Stop everything
podman-compose down

# Remove all images
podman rmi animeflix-frontend animeflix-backend

# Rebuild everything
./rebuild-all.sh
```

### Check Logs
```bash
# Frontend logs
podman logs animeflix-frontend

# Backend logs  
podman logs animeflix-backend

# All services status
podman-compose ps
```

## Development Notes

- Frontend is built with React and served by Nginx
- Changes to React code require container rebuild
- Backend changes are picked up on restart
- Database data persists in volumes
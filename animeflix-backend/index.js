const express = require('express');
const app = express();
const port = 3051;
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const ContentManager = require('./contentManager');
const MigratorService = require('./migratorService');

const contentManager = new ContentManager('./content');
const migratorService = new MigratorService('./content');

// Allow requests from our frontend
app.use(cors({
  origin: 'http://localhost:3050' 
}));

// Parse JSON bodies
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  }
});

// Serve static video files from the 'videos' directory
app.use('/videos', express.static('videos'));

// Serve content files
app.use('/content', express.static('content'));

// API Routes
app.get('/api/videos', async (req, res) => {
  try {
    const content = await contentManager.scanContent();
    res.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

app.get('/api/videos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const content = await contentManager.getContentById(id);
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    res.json(content);
  } catch (error) {
    console.error('Error fetching content by ID:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

app.get('/api/videos/:id/:episodeId', async (req, res) => {
  try {
    const { id, episodeId } = req.params;
    const result = await contentManager.getEpisodeById(id, episodeId);
    
    if (!result) {
      return res.status(404).json({ error: 'Episode not found' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching episode:', error);
    res.status(500).json({ error: 'Failed to fetch episode' });
  }
});

app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json({ results: [] });
    }
    
    const content = await contentManager.scanContent();
    const results = [];
    
    // Search featured content
    if (content.featured && content.featured.title.toLowerCase().includes(q.toLowerCase())) {
      results.push(content.featured);
    }
    
    // Search categories
    for (const categoryKey in content.categories) {
      const matches = content.categories[categoryKey].filter(item => 
        item.title.toLowerCase().includes(q.toLowerCase()) ||
        item.description.toLowerCase().includes(q.toLowerCase()) ||
        (item.genres && item.genres.some(g => g.toLowerCase().includes(q.toLowerCase())))
      );
      results.push(...matches);
    }
    
    // Remove duplicates
    const uniqueResults = results.filter((item, index, self) => 
      index === self.findIndex(i => i.id === item.id)
    );
    
    res.json({ results: uniqueResults });
  } catch (error) {
    console.error('Error searching content:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Rescan content endpoint for development
app.post('/api/rescan', async (req, res) => {
  try {
    const content = await contentManager.scanContent();
    res.json({ message: 'Content rescanned successfully', content });
  } catch (error) {
    console.error('Error rescanning content:', error);
    res.status(500).json({ error: 'Failed to rescan content' });
  }
});

// Migrator API endpoints
app.get('/api/get-home-directory', (req, res) => {
  const os = require('os');
  res.json({ homePath: os.homedir() });
});

app.post('/api/browse-directory', async (req, res) => {
  try {
    const { path: dirPath } = req.body;
    const result = await migratorService.browseDirectory(dirPath);
    res.json(result);
  } catch (error) {
    console.error('Error browsing directory:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/migrate-content', upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'backdrop', maxCount: 1 }
]), async (req, res) => {
  try {
    // Parse the form data
    const contentType = req.body.contentType;
    const contentInfo = JSON.parse(req.body.contentInfo);
    const sourcePath = req.body.sourcePath;
    const files = JSON.parse(req.body.files);
    
    const imageFiles = {};
    if (req.files.thumbnail) imageFiles.thumbnail = req.files.thumbnail[0];
    if (req.files.backdrop) imageFiles.backdrop = req.files.backdrop[0];
    
    const result = await migratorService.migrateContent({
      contentType,
      contentInfo,
      sourcePath,
      files
    }, imageFiles);
    
    // Rescan content after migration
    await contentManager.scanContent();
    
    res.json(result);
  } catch (error) {
    console.error('Error migrating content:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/update-content', upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'backdrop', maxCount: 1 },
  { name: 'newEpisodes', maxCount: 20 }
]), async (req, res) => {
  try {
    const contentId = req.body.contentId;
    const contentData = JSON.parse(req.body.contentData);
    const newEpisodes = req.body.newEpisodes ? JSON.parse(req.body.newEpisodes) : [];
    
    const imageFiles = {};
    if (req.files.thumbnail) imageFiles.thumbnail = req.files.thumbnail[0];
    if (req.files.backdrop) imageFiles.backdrop = req.files.backdrop[0];
    
    // Process episode video files
    const processedEpisodes = newEpisodes.map((episode, index) => {
      const videoFile = req.files.newEpisodes ? req.files.newEpisodes[index] : null;
      return {
        ...episode,
        videoFile
      };
    });
    
    const result = await migratorService.updateContent(contentId, contentData, imageFiles, processedEpisodes);
    
    // Rescan content after update
    await contentManager.scanContent();
    
    res.json(result);
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
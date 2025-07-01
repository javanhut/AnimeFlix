# AnimeFlix

A modern, feature-rich anime streaming platform built with React. Stream your favorite anime series and movies with advanced video player controls, personalized lists, and seasonal content discovery.

## 🎬 Features

### Core Functionality
- **Comprehensive Anime Library**: Browse extensive collection of anime series and movies
- **Advanced Video Player**: Custom-built player with multiple language support, picture-in-picture, fullscreen, and keyboard shortcuts
- **My List**: Save and manage your favorite anime with persistent storage
- **Seasonal Discovery**: Browse anime organized by seasons (Spring, Summer, Fall, Winter) and years
- **Genre Search**: Extensive genre filtering with 70+ anime categories and subgenres
- **Hero Carousel**: Auto-cycling showcase of featured content on homepage

### Video Player Features
- **Sub/Dub Language Switching**: Seamless switching between Japanese (Sub) and English (Dub) audio
- **Picture-in-Picture Mode**: Continue watching in a floating window
- **Keyboard Controls**: Full keyboard navigation support
- **Smart Controls**: Auto-hide controls, seek areas, and visual feedback
- **Skip Functions**: 10-second forward/backward with animated feedback
- **Restart from Beginning**: Quick restart button with visual confirmation
- **Volume Controls**: Slider and mute functionality
- **Progress Tracking**: Visual progress bar with click-to-seek

### User Experience
- **Profile Customization**: Personalized avatars and preferences
- **Responsive Design**: Optimized for desktop and mobile devices
- **Search Functionality**: Smart search across all available content
- **Modal Interactions**: Episode details, profile settings, and content information
- **Trending Content**: Discover popular and recommended anime
- **Navigation**: Intuitive navbar with easy access to all sections

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
1. Clone the repository:
```bash
git clone <repository-url>
cd animeflix-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🐳 Docker Deployment

### Using Docker
1. Build the Docker image:
```bash
docker build -t animeflix .
```

2. Run the container:
```bash
docker run -p 3000:3000 animeflix
```

### Using Docker Compose
1. Start the application:
```bash
docker-compose up -d
```

2. Access the app at [http://localhost:3000](http://localhost:3000)

## 📱 Navigation

- **Home** - Featured content and hero carousel
- **Trending** - Popular anime content
- **New This Season** - Current seasonal anime
- **Genres** - Browse by genre and subgenre
- **Movies** - Anime movie collection
- **Series** - Anime series collection
- **Recommended** - Personalized recommendations
- **My List** - Your saved favorites

## ⌨️ Keyboard Shortcuts

### Video Player Controls
- `Space` - Play/Pause
- `F` - Toggle Fullscreen
- `P` - Toggle Picture-in-Picture
- `M` - Toggle Mute
- `←` - Seek backward 10s
- `→` - Seek forward 10s
- `↑` - Increase volume
- `↓` - Decrease volume
- `0-9` - Jump to percentage of video
- `Escape` - Exit fullscreen/PiP or close menus

## 🎨 Component Architecture

### Core Components
- **Player** - Advanced video player with full feature set
- **Navbar** - Navigation and search functionality
- **Home** - Landing page with hero carousel
- **MyList** - Personal content management
- **Genres** - Genre-based content discovery
- **NewThisSeason** - Seasonal anime browser
- **ShowDetails** - Detailed content information
- **ProfileModal** - User profile and preferences

### Data Management
- **contentDatabase.js** - Centralized content data and search
- **localStorage** - Persistent user preferences and lists

## 🔧 Development

### Available Scripts
- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run test suite
- `npm run eject` - Eject from Create React App

### Testing Routes
- `/player-test` - Test video player with sample content
- `/test-player` - Alternative player testing route

## 🎯 Upcoming Features
- User authentication and profiles
- Watch history tracking
- Advanced search filters
- Content recommendations engine
- Social features and reviews
- Mobile app companion

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- FontAwesome for the icon library
- Google Cloud Storage for sample video content
- The anime community for inspiration

---

**AnimeFlix** - Your gateway to the world of anime streaming ✨

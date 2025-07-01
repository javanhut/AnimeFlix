import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Watch from './components/Watch';
import Navbar from './components/Navbar';
import Settings from './components/Settings';
import Movies from './components/Movies';
import Series from './components/Series';
import Recommended from './components/Recommended';
import Trending from './components/Trending';
import MyList from './components/MyList';
import Genres from './components/Genres';
import NewThisSeason from './components/NewThisSeason';
import ShowDetails from './components/ShowDetails';
import TestPlayer from './components/TestPlayer';
import PlayerTest from './components/PlayerTest';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/new-this-season" element={<NewThisSeason />} />
          <Route path="/genres" element={<Genres />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/series" element={<Series />} />
          <Route path="/recommended" element={<Recommended />} />
          <Route path="/my-list" element={<MyList />} />
          <Route path="/show/:id" element={<ShowDetails />} />
          <Route path="/test-player" element={<TestPlayer />} />
          <Route path="/player-test" element={<PlayerTest />} />
          <Route path="/watch/:id" element={<Watch />} />
          <Route path="/watch/:id/:episodeId" element={<Watch />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
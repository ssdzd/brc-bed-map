import React from 'react';
import MapView from './components/MapView';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>BRC B.E.D. Map Test</h1>
      <ErrorBoundary>
        <MapView />
      </ErrorBoundary>
    </div>
  );
}

export default App

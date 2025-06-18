import React from 'react';
import MapView from './components/MapView';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  return (
    <div className="App">
      <ErrorBoundary>
        <MapView />
      </ErrorBoundary>
    </div>
  );
}

export default App

import React from 'react';
import ReactDOM from 'react-dom/client';
import { FileUpload } from './components/FileUpload';
import { TimeSeriesChart } from './components/TimeSeriesChart';

function App() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">PoE2 Stash Analytics</h1>
      <FileUpload />
      <div className="mt-8">
        <TimeSeriesChart />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 
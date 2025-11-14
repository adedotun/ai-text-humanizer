import React, { useState } from 'react';
import './App.css';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function App() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [intensity, setIntensity] = useState('medium');
  const [activeTab, setActiveTab] = useState('detect'); // 'detect', 'humanize', 'process'

  const handleDetect = async () => {
    if (!text.trim()) {
      alert('Please enter some text');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/detect-ai`, { text });
      setResult({
        type: 'detect',
        data: response.data
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to detect AI content. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleHumanize = async () => {
    if (!text.trim()) {
      alert('Please enter some text');
      return;
    }

    setLoading(true);
    setProgress(0);
    
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 200);
    
    try {
      const response = await axios.post(`${API_URL}/api/humanize`, { 
        text, 
        intensity 
      });
      clearInterval(progressInterval);
      setProgress(100);
      setResult({
        type: 'humanize',
        data: response.data
      });
      setTimeout(() => setProgress(0), 500);
    } catch (error) {
      clearInterval(progressInterval);
      setProgress(0);
      console.error('Error:', error);
      alert('Failed to humanize text. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async () => {
    if (!text.trim()) {
      alert('Please enter some text');
      return;
    }

    setLoading(true);
    setProgress(0);
    
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 8, 90));
    }, 200);
    
    try {
      const response = await axios.post(`${API_URL}/api/process`, { 
        text, 
        intensity,
        forceHumanize: true
      });
      clearInterval(progressInterval);
      setProgress(100);
      setResult({
        type: 'process',
        data: response.data
      });
      setTimeout(() => setProgress(0), 500);
    } catch (error) {
      clearInterval(progressInterval);
      setProgress(0);
      console.error('Error:', error);
      alert('Failed to process text. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const getAIScoreColor = (score) => {
    if (score > 0.7) return '#ef4444'; // Red
    if (score > 0.5) return '#f59e0b'; // Orange
    return '#10b981'; // Green
  };

  const getAIScoreLabel = (score) => {
    if (score > 0.7) return 'Highly Likely AI';
    if (score > 0.5) return 'Possibly AI';
    return 'Likely Human';
  };

  // Highlight differences between original and humanized text
  const highlightDiff = (text, diff, type) => {
    if (!diff || diff.length === 0) {
      return <span>{text}</span>;
    }

    const words = text.split(/(\s+)/);
    const diffMap = new Map();
    
    if (type === 'original') {
      diff.forEach(change => {
        diffMap.set(change.original.toLowerCase(), 'removed');
      });
    } else {
      diff.forEach(change => {
        diffMap.set(change.humanized.toLowerCase(), 'added');
      });
    }

    return (
      <span>
        {words.map((word, index) => {
          const cleanWord = word.trim().toLowerCase();
          const isChanged = diffMap.has(cleanWord);
          
          if (isChanged) {
            const style = type === 'original' 
              ? { backgroundColor: '#fee2e2', textDecoration: 'line-through', color: '#991b1b' }
              : { backgroundColor: '#d1fae5', color: '#065f46', fontWeight: '500' };
            
            return <span key={index} style={style}>{word}</span>;
          }
          return <span key={index}>{word}</span>;
        })}
      </span>
    );
  };

  // Export functions
  const exportAsTxt = () => {
    if (!result || !result.data.humanized) return;
    const blob = new Blob([result.data.humanized], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'humanized-text.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsDocx = () => {
    if (!result || !result.data.humanized) return;
    // Simple DOCX export (basic implementation)
    const content = `Original Text:\n${result.data.original}\n\nHumanized Text:\n${result.data.humanized}`;
    const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'humanized-text.docx';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsPdf = () => {
    if (!result || !result.data.humanized) return;
    // Simple PDF export using browser print
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>Humanized Text</title></head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Original Text</h2>
          <p style="white-space: pre-wrap;">${result.data.original}</p>
          <hr>
          <h2>Humanized Text</h2>
          <p style="white-space: pre-wrap;">${result.data.humanized}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>🤖 AI Text Humanizer</h1>
          <p>Detect AI-generated content and humanize it naturally</p>
        </header>

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'detect' ? 'active' : ''}`}
            onClick={() => setActiveTab('detect')}
          >
            Detect AI
          </button>
          <button 
            className={`tab ${activeTab === 'humanize' ? 'active' : ''}`}
            onClick={() => setActiveTab('humanize')}
          >
            Humanize
          </button>
          <button 
            className={`tab ${activeTab === 'process' ? 'active' : ''}`}
            onClick={() => setActiveTab('process')}
          >
            Full Process
          </button>
        </div>

        <div className="input-section">
          <textarea
            className="text-input"
            placeholder="Paste your text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
          />
          <div className="input-footer">
            <div className="char-count">{text.length} characters</div>
            {activeTab !== 'detect' && (
              <div className="intensity-selector">
                <label>Intensity:</label>
                <select value={intensity} onChange={(e) => setIntensity(e.target.value)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="actions">
          {activeTab === 'detect' && (
            <button 
              className="btn btn-primary" 
              onClick={handleDetect}
              disabled={loading}
            >
              {loading ? 'Detecting...' : 'Detect AI Content'}
            </button>
          )}
          {activeTab === 'humanize' && (
            <button 
              className="btn btn-primary" 
              onClick={handleHumanize}
              disabled={loading}
            >
              {loading ? 'Humanizing...' : 'Humanize Text'}
            </button>
          )}
          {activeTab === 'process' && (
            <button 
              className="btn btn-primary" 
              onClick={handleProcess}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Detect & Humanize'}
            </button>
          )}
        </div>

        {result && (
          <div className="results">
            {result.type === 'detect' && (
              <div className="result-card">
                <h2>Detection Results</h2>
                <div className="score-display">
                  <div 
                    className="score-circle"
                    style={{ 
                      borderColor: getAIScoreColor(result.data.aiScore),
                      color: getAIScoreColor(result.data.aiScore)
                    }}
                  >
                    <div className="score-value">
                      {(result.data.aiScore * 100).toFixed(0)}%
                    </div>
                    <div className="score-label">
                      {getAIScoreLabel(result.data.aiScore)}
                    </div>
                  </div>
                </div>
                <div className="analysis">
                  <h3>Analysis</h3>
                  <p><strong>Confidence:</strong> {(result.data.confidence * 100).toFixed(0)}%</p>
                  <p><strong>Status:</strong> {result.data.isLikelyAI ? '⚠️ Likely AI-generated' : '✅ Likely Human-written'}</p>
                  {result.data.analysis.reasons.length > 0 && (
                    <div>
                      <strong>Reasons:</strong>
                      <ul>
                        {result.data.analysis.reasons.map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p><strong>Recommendation:</strong> {result.data.analysis.recommendation}</p>
                </div>
              </div>
            )}

            {result.type === 'humanize' && (
              <div className="result-card">
                <h2>Humanized Text</h2>
                
                {/* AI Score Comparison */}
                {result.data.originalAI && result.data.humanizedAI && (
                  <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <h3 style={{ marginBottom: '10px', fontSize: '0.9rem', color: '#666' }}>Original AI Score</h3>
                      <div 
                        className="score-circle"
                        style={{ 
                          borderColor: getAIScoreColor(result.data.originalAI.aiScore),
                          color: getAIScoreColor(result.data.originalAI.aiScore),
                          width: '120px',
                          height: '120px',
                          fontSize: '1.8rem'
                        }}
                      >
                        <div className="score-value">
                          {(result.data.originalAI.aiScore * 100).toFixed(0)}%
                        </div>
                        <div className="score-label" style={{ fontSize: '0.75rem' }}>
                          {getAIScoreLabel(result.data.originalAI.aiScore)}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <h3 style={{ marginBottom: '10px', fontSize: '0.9rem', color: '#666' }}>Humanized AI Score</h3>
                      <div 
                        className="score-circle"
                        style={{ 
                          borderColor: getAIScoreColor(result.data.humanizedAI.aiScore),
                          color: getAIScoreColor(result.data.humanizedAI.aiScore),
                          width: '120px',
                          height: '120px',
                          fontSize: '1.8rem'
                        }}
                      >
                        <div className="score-value">
                          {(result.data.humanizedAI.aiScore * 100).toFixed(0)}%
                        </div>
                        <div className="score-label" style={{ fontSize: '0.75rem' }}>
                          {getAIScoreLabel(result.data.humanizedAI.aiScore)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="text-comparison">
                  <div className="text-box">
                    <h3>Original</h3>
                    {result.data.originalAI && (
                      <div style={{ marginBottom: '10px', fontSize: '0.85rem', color: '#666' }}>
                        AI Score: <strong style={{ color: getAIScoreColor(result.data.originalAI.aiScore) }}>
                          {(result.data.originalAI.aiScore * 100).toFixed(0)}%
                        </strong>
                        {' '}
                        {result.data.originalAI.isLikelyAI ? '⚠️ Likely AI' : '✅ Likely Human'}
                      </div>
                    )}
                    <div className="text-content">{highlightDiff(result.data.original, result.data.changes?.diff, 'original')}</div>
                  </div>
                  <div className="text-box">
                    <h3>Humanized</h3>
                    {result.data.humanizedAI && (
                      <div style={{ marginBottom: '10px', fontSize: '0.85rem', color: '#666' }}>
                        AI Score: <strong style={{ color: getAIScoreColor(result.data.humanizedAI.aiScore) }}>
                          {(result.data.humanizedAI.aiScore * 100).toFixed(0)}%
                        </strong>
                        {' '}
                        {result.data.humanizedAI.isLikelyAI ? '⚠️ Likely AI' : '✅ Likely Human'}
                      </div>
                    )}
                    <div className="text-content humanized">{highlightDiff(result.data.humanized, result.data.changes?.diff, 'humanized')}</div>
                  </div>
                </div>
                {result.data.changes && (
                  <div className="changes-info">
                    <h3>Changes Made</h3>
                    <p>Word count change: {result.data.changes.wordCountChange > 0 ? '+' : ''}{result.data.changes.wordCountChange}</p>
                    <p>Sentence count change: {result.data.changes.sentenceCountChange > 0 ? '+' : ''}{result.data.changes.sentenceCountChange}</p>
                    <p>Percentage changed: {result.data.changes.percentageChanged}%</p>
                    {result.data.changes.similarity && (
                      <p>Similarity: {result.data.changes.similarity}%</p>
                    )}
                    {result.data.originalAI && result.data.humanizedAI && (
                      <p style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e5e7eb' }}>
                        <strong>AI Score Improvement:</strong>{' '}
                        <span style={{ 
                          color: result.data.humanizedAI.aiScore < result.data.originalAI.aiScore ? '#10b981' : '#f59e0b',
                          fontWeight: 'bold'
                        }}>
                          {((result.data.originalAI.aiScore - result.data.humanizedAI.aiScore) * 100).toFixed(1)}%
                        </span>
                        {' '}
                        {result.data.humanizedAI.aiScore < result.data.originalAI.aiScore ? '↓ (Improved)' : '↑ (Increased)'}
                      </p>
                    )}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(result.data.humanized);
                      alert('Humanized text copied to clipboard!');
                    }}
                  >
                    📋 Copy
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      setText(result.data.humanized);
                      setResult(null);
                    }}
                  >
                    Use Humanized Text
                  </button>
                  <div style={{ display: 'flex', gap: '5px', marginLeft: 'auto' }}>
                    <button 
                      className="btn btn-secondary"
                      onClick={exportAsTxt}
                      style={{ fontSize: '0.85rem', padding: '8px 12px' }}
                    >
                      📄 TXT
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={exportAsDocx}
                      style={{ fontSize: '0.85rem', padding: '8px 12px' }}
                    >
                      📝 DOCX
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={exportAsPdf}
                      style={{ fontSize: '0.85rem', padding: '8px 12px' }}
                    >
                      📑 PDF
                    </button>
                  </div>
                </div>
              </div>
            )}

            {result.type === 'process' && (
              <div className="result-card">
                <h2>Processing Results</h2>
                
                {/* AI Score Comparison */}
                {result.data.humanizedAI ? (
                  <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <h3 style={{ marginBottom: '10px', fontSize: '0.9rem', color: '#666' }}>Original AI Score</h3>
                      <div 
                        className="score-circle"
                        style={{ 
                          borderColor: getAIScoreColor(result.data.aiScore),
                          color: getAIScoreColor(result.data.aiScore),
                          width: '120px',
                          height: '120px',
                          fontSize: '1.8rem'
                        }}
                      >
                        <div className="score-value">
                          {(result.data.aiScore * 100).toFixed(0)}%
                        </div>
                        <div className="score-label" style={{ fontSize: '0.75rem' }}>
                          {getAIScoreLabel(result.data.aiScore)}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <h3 style={{ marginBottom: '10px', fontSize: '0.9rem', color: '#666' }}>Humanized AI Score</h3>
                      <div 
                        className="score-circle"
                        style={{ 
                          borderColor: getAIScoreColor(result.data.humanizedAI.aiScore),
                          color: getAIScoreColor(result.data.humanizedAI.aiScore),
                          width: '120px',
                          height: '120px',
                          fontSize: '1.8rem'
                        }}
                      >
                        <div className="score-value">
                          {(result.data.humanizedAI.aiScore * 100).toFixed(0)}%
                        </div>
                        <div className="score-label" style={{ fontSize: '0.75rem' }}>
                          {getAIScoreLabel(result.data.humanizedAI.aiScore)}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="score-display">
                    <div 
                      className="score-circle"
                      style={{ 
                        borderColor: getAIScoreColor(result.data.aiScore),
                        color: getAIScoreColor(result.data.aiScore)
                      }}
                    >
                      <div className="score-value">
                        {(result.data.aiScore * 100).toFixed(0)}%
                      </div>
                      <div className="score-label">
                        {getAIScoreLabel(result.data.aiScore)}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="text-comparison">
                  <div className="text-box">
                    <h3>Original</h3>
                    <div style={{ marginBottom: '10px', fontSize: '0.85rem', color: '#666' }}>
                      AI Score: <strong style={{ color: getAIScoreColor(result.data.aiScore) }}>
                        {(result.data.aiScore * 100).toFixed(0)}%
                      </strong>
                      {' '}
                      {result.data.isLikelyAI ? '⚠️ Likely AI' : '✅ Likely Human'}
                    </div>
                    <div className="text-content">{highlightDiff(result.data.original, result.data.changes?.diff, 'original')}</div>
                  </div>
                  <div className="text-box">
                    <h3>Humanized</h3>
                    {result.data.humanizedAI && (
                      <div style={{ marginBottom: '10px', fontSize: '0.85rem', color: '#666' }}>
                        AI Score: <strong style={{ color: getAIScoreColor(result.data.humanizedAI.aiScore) }}>
                          {(result.data.humanizedAI.aiScore * 100).toFixed(0)}%
                        </strong>
                        {' '}
                        {result.data.humanizedAI.isLikelyAI ? '⚠️ Likely AI' : '✅ Likely Human'}
                      </div>
                    )}
                    <div className="text-content humanized">{highlightDiff(result.data.humanized, result.data.changes?.diff, 'humanized')}</div>
                  </div>
                </div>
                {result.data.changes && (
                  <div className="changes-info">
                    <h3>Changes Made</h3>
                    <p>Word count change: {result.data.changes.wordCountChange > 0 ? '+' : ''}{result.data.changes.wordCountChange}</p>
                    <p>Sentence count change: {result.data.changes.sentenceCountChange > 0 ? '+' : ''}{result.data.changes.sentenceCountChange}</p>
                    <p>Percentage changed: {result.data.changes.percentageChanged}%</p>
                    {result.data.humanizedAI && (
                      <p style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e5e7eb' }}>
                        <strong>AI Score Improvement:</strong>{' '}
                        <span style={{ 
                          color: result.data.humanizedAI.aiScore < result.data.aiScore ? '#10b981' : '#f59e0b',
                          fontWeight: 'bold'
                        }}>
                          {((result.data.aiScore - result.data.humanizedAI.aiScore) * 100).toFixed(1)}%
                        </span>
                        {' '}
                        {result.data.humanizedAI.aiScore < result.data.aiScore ? '↓ (Improved)' : '↑ (Increased)'}
                      </p>
                    )}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(result.data.humanized);
                      alert('Humanized text copied to clipboard!');
                    }}
                  >
                    📋 Copy
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      setText(result.data.humanized);
                      setResult(null);
                    }}
                  >
                    Use Humanized Text
                  </button>
                  <div style={{ display: 'flex', gap: '5px', marginLeft: 'auto' }}>
                    <button 
                      className="btn btn-secondary"
                      onClick={exportAsTxt}
                      style={{ fontSize: '0.85rem', padding: '8px 12px' }}
                    >
                      📄 TXT
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={exportAsDocx}
                      style={{ fontSize: '0.85rem', padding: '8px 12px' }}
                    >
                      📝 DOCX
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={exportAsPdf}
                      style={{ fontSize: '0.85rem', padding: '8px 12px' }}
                    >
                      📑 PDF
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;


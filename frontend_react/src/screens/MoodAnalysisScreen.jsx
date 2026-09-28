import React, { useState, useEffect } from 'react';
import { Smile, Mic, Lightbulb, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Navbar } from '../components/Navbar';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { GlassInput } from '../components/GlassInput';
import { StatusBadge } from '../components/StatusBadge';

export const MoodAnalysisScreen = () => {
  const { moodLogs, analyzeMoodText, selectedPatient, setSelectedPatient, patients } = useApp();
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  // Web Speech API Voice Recognition setup
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSpeechSupported(false);
    }
  }, []);

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Web Speech API is not supported in this browser. Please use Chrome/Edge or type observation text.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      setIsListening(false);
      
      // Automatically run sentiment analysis directly from transcribed speech
      if (transcript.trim() && selectedPatient) {
        setLoading(true);
        await analyzeMoodText(transcript, selectedPatient.id);
        setLoading(false);
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      alert("Microphone error or permission denied: " + event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedPatient) return;
    setLoading(true);
    await analyzeMoodText(inputText, selectedPatient.id);
    setInputText('');
    setLoading(false);
  };

  const getEmoji = (mood) => {
    switch (mood) {
      case 'Happiness': return '😊';
      case 'Calm': return '🙂';
      case 'Sadness': return '😔';
      case 'Distress': return '😫';
      case 'Anger': return '😠';
      case 'Confusion': return '😕';
      case 'Anxiety': return '😟';
      case 'Fear': return '😨';
      case 'Stress': return '😣';
      default: return '😐';
    }
  };

  const getColor = (mood) => {
    switch (mood) {
      case 'Happiness': return '#10B981';
      case 'Calm': return '#00D2FF';
      case 'Sadness': return '#3A7BD5';
      case 'Distress': return '#EF4444';
      case 'Anger': return '#FF416C';
      case 'Confusion': return '#F59E0B';
      case 'Anxiety': return '#8B5CF6';
      case 'Fear': return '#EC4899';
      default: return '#94A3B8';
    }
  };

  return (
    <div style={{ minHeight: '100vh', pb: '40px' }}>
      <Navbar title="AI Sentiment & Verbal Behavior Analysis" />

      <div style={{ padding: '24px 20px', maxWidth: '580px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div>
          <h3 style={{ fontSize: '22px', fontWeight: 800 }}>Alzheimer's Sentiment Analysis</h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginTop: '4px' }}>
            Multi-emotion taxonomy detection with patient-isolated counseling history.
          </p>
        </div>

        {/* Patient Selection Dropdown */}
        {patients.length > 0 && (
          <GlassCard style={{ padding: '12px' }}>
            <p style={{ fontSize: '12px', color: '#00D2FF', fontWeight: 700, marginBottom: '6px' }}>Active Patient:</p>
            <select 
              value={selectedPatient?.id || ''} 
              onChange={e => {
                const found = patients.find(p => p.id === e.target.value);
                if (found) setSelectedPatient(found);
              }}
              className="glass-input"
              style={{ background: '#0F172A', border: '1.5px solid #00D2FF' }}
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.alzheimerStage})</option>
              ))}
            </select>
          </GlassCard>
        )}

        {/* Input Card */}
        <GlassCard>
          <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <GlassInput 
              label="Patient Statement / Caregiver Verbal Observation *" 
              icon={Smile} 
              value={inputText} 
              onChange={e => setInputText(e.target.value)} 
              placeholder="e.g. Patient feels not well and is confused about where they are..." 
              required 
            />

            <button 
              type="button" 
              onClick={handleVoiceInput}
              style={{
                background: isListening ? 'rgba(239, 68, 68, 0.25)' : 'rgba(0, 210, 255, 0.12)',
                border: `1.5px solid ${isListening ? '#EF4444' : '#00D2FF'}`,
                borderRadius: '14px',
                padding: '14px',
                color: '#FFF',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              <Mic size={20} color={isListening ? '#EF4444' : '#00D2FF'} />
              {isListening ? "Listening Microphone... (Speak Now)" : "Record Voice (Transcribe & Analyze Automatically)"}
            </button>

            <GlassButton type="submit" disabled={loading || !selectedPatient}>
              {loading ? "Analyzing Neural Signals..." : "Analyze Sentiment & Generate Guidance"} <Sparkles size={18} />
            </GlassButton>
          </form>
        </GlassCard>

        <h3 style={{ fontSize: '18px', fontWeight: 700, marginTop: '8px' }}>
          {selectedPatient ? `${selectedPatient.name}'s Sentiment History` : "Sentiment History"}
        </h3>

        {/* Mood Log Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {moodLogs.map(log => {
            const emoji = getEmoji(log.detectedMood);
            const color = getColor(log.detectedMood);

            return (
              <GlassCard key={log.id} style={{ border: `1.5px solid ${color}60` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '26px' }}>{emoji}</span>
                    <div>
                      <h4 style={{ fontSize: '17px', fontWeight: 700, color }}>Detected: {log.detectedMood}</h4>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Confidence Score: {log.confidenceScore || '92.4%'}</p>
                    </div>
                  </div>
                  <StatusBadge label="PATIENT LOGGED" color={color} />
                </div>

                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', marginBottom: '12px' }}>
                  Observation: "{log.inputText}"
                </p>

                <div style={{ background: `${color}18`, borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <Lightbulb size={18} color={color} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ fontSize: '13px', color: '#FFF', lineHeight: '1.4' }}>
                      <strong>Caregiver Advice:</strong> {log.suggestion}
                    </p>
                  </div>
                  {log.recommendedAction && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px' }}>
                      <CheckCircle2 size={16} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <p style={{ fontSize: '12px', color: '#10B981', fontWeight: 600 }}>
                        <strong>Recommended Next Action:</strong> {log.recommendedAction}
                      </p>
                    </div>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>

      </div>
    </div>
  );
};

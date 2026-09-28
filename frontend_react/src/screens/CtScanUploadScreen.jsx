import React, { useState, useRef } from 'react';
import { Upload, Brain, AlertCircle, Sparkles, CheckCircle2, Image as ImageIcon, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Navbar } from '../components/Navbar';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { StatusBadge } from '../components/StatusBadge';

export const CtScanUploadScreen = () => {
  const { runScanAnalysis, selectedPatient, setSelectedPatient, patients } = useApp();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setResult(null);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile || !selectedPatient) {
      alert("Please select a valid CT scan image file and active patient.");
      return;
    }

    setUploading(true);
    setUploadProgress(30);

    setTimeout(async () => {
      setUploadProgress(70);
      setTimeout(async () => {
        setUploadProgress(100);
        // Execute real AI scan inference pipeline strictly upon upload
        const report = await runScanAnalysis(imagePreview, selectedFile.name, selectedPatient.id);
        setResult(report);
        setUploading(false);
      }, 500);
    }, 500);
  };

  return (
    <div style={{ minHeight: '100vh', pb: '40px' }}>
      <Navbar title="Brain CT Scan Upload & AI Feature Analysis" />

      <div style={{ padding: '24px 20px', maxWidth: '580px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div>
          <h3 style={{ fontSize: '22px', fontWeight: 800 }}>Alzheimer's Atrophy Detection</h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginTop: '4px' }}>
            Upload axial brain CT/MRI scan image files to compute patient-specific neural feature metrics.
          </p>
        </div>

        {/* Patient Selector */}
        {patients.length > 0 && (
          <GlassCard style={{ padding: '12px' }}>
            <p style={{ fontSize: '12px', color: '#00D2FF', fontWeight: 700, marginBottom: '6px' }}>Select Target Patient:</p>
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

        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/png, image/jpeg, image/jpg, .dcm" 
          style={{ display: 'none' }} 
        />

        {/* Visible Upload Box */}
        <GlassCard 
          onClick={() => fileInputRef.current?.click()} 
          style={{ 
            textAlign: 'center', 
            padding: '28px 20px', 
            border: `1.8px dashed ${selectedFile ? '#00D2FF' : 'rgba(255,255,255,0.25)'}`,
            cursor: 'pointer'
          }}
        >
          {imagePreview ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <img 
                src={imagePreview} 
                alt="Brain CT Scan Preview" 
                style={{ maxHeight: '200px', borderRadius: '14px', border: '1.5px solid #00D2FF', boxShadow: '0 0 20px rgba(0, 210, 255, 0.4)' }} 
              />
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#00D2FF' }}>
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
          ) : (
            <div>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(0, 210, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
                color: '#00D2FF'
              }}>
                <Upload size={30} />
              </div>
              <h4 style={{ fontSize: '17px', fontWeight: 700 }}>Click to Select & Upload CT Scan File</h4>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                PNG, JPG, JPEG, or DICOM files supported
              </p>
            </div>
          )}
        </GlassCard>

        {/* Upload Action Button */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <GlassButton 
            onClick={() => fileInputRef.current?.click()} 
            style={{ background: 'rgba(255,255,255,0.1)', flex: 1 }}
          >
            <ImageIcon size={18} /> Select File
          </GlassButton>
          <GlassButton 
            onClick={handleUploadAndAnalyze} 
            disabled={!selectedFile || uploading || !selectedPatient} 
            style={{ flex: 1 }}
          >
            {uploading ? `Analyzing (${uploadProgress}%)...` : "Upload & Run Inference"} <Sparkles size={18} />
          </GlassButton>
        </div>

        {/* Upload Progress Bar */}
        {uploading && (
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '10px', height: '10px', overflow: 'hidden' }}>
            <div style={{ width: `${uploadProgress}%`, background: 'linear-gradient(90deg, #00D2FF, #10B981)', height: '100%', transition: 'width 0.3s ease' }} />
          </div>
        )}

        {/* AI Prediction Report Card */}
        {result && (
          <GlassCard style={{ border: '1.5px solid rgba(139, 92, 246, 0.5)', marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Brain size={22} color="#00D2FF" />
                <h4 style={{ fontSize: '18px', fontWeight: 800 }}>Neural Feature Inference Report</h4>
              </div>
              <StatusBadge label="SAVED TO PATIENT DB" color="#10B981" icon={CheckCircle2} />
            </div>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '16px' }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.12)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Alzheimer Risk</p>
                <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#EF4444', marginTop: '4px' }}>{result.alzheimerRisk}</h2>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.12)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>AI Confidence</p>
                <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#10B981', marginTop: '4px' }}>{result.aiConfidence}</h2>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '14px', padding: '14px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Predicted Stage:</p>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#FFF' }}>{result.stage}</h4>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Atrophy Heatmap Region:</p>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#00E5FF' }}>{result.heatmapRegion}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Clinical Recommendation:</p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>{result.recommendation}</p>
              </div>
            </div>

            {/* Medical Disclaimer */}
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={22} color="#F59E0B" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#FFF' }}>
                {result.disclaimer}
              </p>
            </div>
          </GlassCard>
        )}

      </div>
    </div>
  );
};

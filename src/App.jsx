import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, Calendar, CheckCircle, Clock, FileText, Upload, Search, Bell, ChevronDown, ChevronRight, Trash2, Eye, Download, BarChart3, ClipboardList, FolderOpen, Home, X, Plus, LogOut, Building2, MapPin, Cloud, Loader, HardDrive, ExternalLink, Users, User, Briefcase, FileUp, Edit, Check, AlertTriangle } from 'lucide-react';

// ============================================================
// SUPABASE CONFIGURATION
// ============================================================
// To get your credentials:
// 1. Go to https://supabase.com and sign up (free)
// 2. Create a new project (pick any region)
// 3. Go to Settings → API
// 4. Copy your "Project URL" and "anon public" key below
// 5. Go to Storage → Create buckets for each lab (e.g., "parkavenue", "ivfflorida")

const SUPABASE_CONFIG = {
  url: 'https://nlaorccjgtkemwcjvprk.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sYW9yY2NqZ3RrZW13Y2p2cHJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODM0NDksImV4cCI6MjA4MDM1OTQ0OX0.btZgq-qePiEs8rfe60xCeUnl_RzMJDXmh8yDifPpDg4',
};

// Set to true once you've added your Supabase config above
const SUPABASE_ENABLED = true;

// Helper function to create Supabase storage client using REST API
const getSupabaseClient = () => {
  if (!SUPABASE_ENABLED) return null;
  
  return {
    storage: {
      from: (bucket) => ({
        upload: async (path, file) => {
          try {
            const response = await fetch(
              `${SUPABASE_CONFIG.url}/storage/v1/object/${bucket}/${path}`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
                  'apikey': SUPABASE_CONFIG.anonKey,
                },
                body: file
              }
            );
            if (!response.ok) {
              const error = await response.json();
              return { data: null, error };
            }
            return { data: { path }, error: null };
          } catch (error) {
            return { data: null, error };
          }
        },
        getPublicUrl: (path) => {
          return { 
            data: { 
              publicUrl: `${SUPABASE_CONFIG.url}/storage/v1/object/public/${bucket}/${path}` 
            } 
          };
        },
        remove: async (paths) => {
          try {
            const response = await fetch(
              `${SUPABASE_CONFIG.url}/storage/v1/object/${bucket}`,
              {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
                  'apikey': SUPABASE_CONFIG.anonKey,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prefixes: paths })
              }
            );
            if (!response.ok) {
              const error = await response.json();
              return { error };
            }
            return { error: null };
          } catch (error) {
            return { error };
          }
        }
      })
    }
  };
};

// Default Lab Configuration - bucket names must be lowercase, no spaces
const DEFAULT_LABS = {
  parkAvenue: { id: 'parkAvenue', name: 'Park Avenue Fertility', location: 'Connecticut', bucket: 'parkavenue', color: 'indigo', bgColor: 'bg-indigo-600', textColor: 'text-indigo-600', lightBg: 'bg-indigo-50', borderColor: 'border-indigo-500', isDefault: true },
  ivfFlorida: { id: 'ivfFlorida', name: 'IVF Florida', location: 'Jacksonville', bucket: 'ivfflorida', color: 'emerald', bgColor: 'bg-emerald-600', textColor: 'text-emerald-600', lightBg: 'bg-emerald-50', borderColor: 'border-emerald-500', isDefault: true },
  allenReproductive: { id: 'allenReproductive', name: 'Allen Reproductive', location: 'Dallas', bucket: 'allenreproductive', color: 'amber', bgColor: 'bg-amber-600', textColor: 'text-amber-600', lightBg: 'bg-amber-50', borderColor: 'border-amber-500', isDefault: true },
  fertilityWellness: { id: 'fertilityWellness', name: 'Fertility Wellness', location: 'Cincinnati', bucket: 'fertilitywellness', color: 'rose', bgColor: 'bg-rose-600', textColor: 'text-rose-600', lightBg: 'bg-rose-50', borderColor: 'border-rose-500', isDefault: true }
};

const LAB_COLORS = [
  { name: 'indigo', bgColor: 'bg-indigo-600', textColor: 'text-indigo-600', lightBg: 'bg-indigo-50', borderColor: 'border-indigo-500' },
  { name: 'emerald', bgColor: 'bg-emerald-600', textColor: 'text-emerald-600', lightBg: 'bg-emerald-50', borderColor: 'border-emerald-500' },
  { name: 'amber', bgColor: 'bg-amber-600', textColor: 'text-amber-600', lightBg: 'bg-amber-50', borderColor: 'border-amber-500' },
  { name: 'rose', bgColor: 'bg-rose-600', textColor: 'text-rose-600', lightBg: 'bg-rose-50', borderColor: 'border-rose-500' },
  { name: 'blue', bgColor: 'bg-blue-600', textColor: 'text-blue-600', lightBg: 'bg-blue-50', borderColor: 'border-blue-500' },
  { name: 'purple', bgColor: 'bg-purple-600', textColor: 'text-purple-600', lightBg: 'bg-purple-50', borderColor: 'border-purple-500' },
  { name: 'teal', bgColor: 'bg-teal-600', textColor: 'text-teal-600', lightBg: 'bg-teal-50', borderColor: 'border-teal-500' },
  { name: 'cyan', bgColor: 'bg-cyan-600', textColor: 'text-cyan-600', lightBg: 'bg-cyan-50', borderColor: 'border-cyan-500' },
];

// Sample data for demo
const sampleLabData = {
  sops: [
    { id: 1, name: 'AND-SOP-001: Semen Analysis', lab: 'andrology', uploadDate: '2025-01-15', reviewDate: '2026-01-15' },
    { id: 2, name: 'AND-SOP-002: Sperm Preparation', lab: 'andrology', uploadDate: '2025-01-15', reviewDate: '2026-01-15' },
    { id: 3, name: 'EMB-SOP-001: Oocyte Retrieval', lab: 'embryology', uploadDate: '2025-01-15', reviewDate: '2026-01-15' },
  ],
  tasks: [
    { id: 1, title: "Q1 QA/QM Review", type: "QM", dueDate: "2025-03-31", status: "completed", description: "Complete quarterly quality management review" },
    { id: 2, title: "Q2 QA/QM Review", type: "QM", dueDate: "2025-06-30", status: "in-progress", description: "Complete quarterly quality management review" },
    { id: 3, title: "Q3 QA/QM Review", type: "QM", dueDate: "2025-09-30", status: "pending", description: "Complete quarterly quality management review" },
    { id: 4, title: "Q4 QA/QM Review", type: "QM", dueDate: "2025-12-31", status: "pending", description: "Complete quarterly quality management review" },
    { id: 5, title: "Annual SOP Review - Andrology", type: "SOP", dueDate: "2026-01-15", status: "pending", description: "Review and update all Andrology SOPs" },
    { id: 6, title: "CAP Self-Inspection", type: "CAP", dueDate: "2025-06-01", status: "pending", description: "Complete CAP checklist self-inspection" },
  ],
  qmData: {
    andrology: { specimenRejection: 1.4, qcCompliance: 100, correctedReports: 0.8 },
    embryology: { fertilizationRate: 72, blastocystRate: 42, pregnancyRate: 45, qcCompliance: 100, correctedReports: 0.5 }
  }
};

export default function LabQMS() {
  const [labs, setLabs] = useState(DEFAULT_LABS);
  const [currentLab, setCurrentLab] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAddLab, setShowAddLab] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [newLab, setNewLab] = useState({ name: '', location: '', color: 'blue' });
  const [expandedChecklist, setExpandedChecklist] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [showAddSOP, setShowAddSOP] = useState(false);
  const [sops, setSops] = useState(sampleLabData.sops);
  const [newSOP, setNewSOP] = useState({ name: '', lab: 'andrology', reviewDate: '', file: null, fileName: '' });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [supabaseConnected, setSupabaseConnected] = useState(SUPABASE_ENABLED);
  
  // Personnel state
  const trainingCompetencies = [
    { id: 'sperm-prep', name: 'Sperm Prep' },
    { id: 'media-dishes', name: 'Media and Dishes' },
    { id: 'egg-retrieval', name: 'Egg Retrieval' },
    { id: 'stripping', name: 'Stripping' },
    { id: 'embryo-grading', name: 'Embryo Grading' },
    { id: 'vitrification-warming', name: 'Vitrification and Warming' },
    { id: 'icsi', name: 'ICSI' },
    { id: 'biopsy', name: 'Biopsy' },
    { id: 'transfer', name: 'Transfer' }
  ];

  const [personnel, setPersonnel] = useState([
    { 
      id: 1, 
      name: 'Dr. Sarah Johnson', 
      title: 'Laboratory Director',
      email: 'sarah.johnson@labqms.com',
      startDate: '2019-03-15', 
      endDate: null,
      status: 'active',
      training: {
        'sperm-prep': { completed: true, signOffDate: '2019-03-20', file: { name: 'Training_SpermPrep_SJ.pdf', size: '156 KB' } },
        'media-dishes': { completed: true, signOffDate: '2019-03-20', file: { name: 'Training_Media_SJ.pdf', size: '142 KB' } },
        'egg-retrieval': { completed: true, signOffDate: '2019-03-25', file: null },
        'stripping': { completed: true, signOffDate: '2019-03-25', file: null },
        'embryo-grading': { completed: true, signOffDate: '2019-04-01', file: null },
        'vitrification-warming': { completed: true, signOffDate: '2019-04-05', file: null },
        'icsi': { completed: true, signOffDate: '2019-04-10', file: null },
        'biopsy': { completed: true, signOffDate: '2019-04-15', file: null },
        'transfer': { completed: true, signOffDate: '2019-04-20', file: null }
      },
      files: [
        { id: 1, name: 'Resume_DrJohnson.pdf', type: 'resume', size: '245 KB', uploadDate: '2019-03-10' },
        { id: 2, name: 'Job_Description_LabDirector.pdf', type: 'job-description', size: '128 KB', uploadDate: '2019-03-10' },
        { id: 3, name: 'Board_Certification.pdf', type: 'other', size: '89 KB', uploadDate: '2019-03-12' }
      ]
    },
    { 
      id: 2, 
      name: 'Michael Chen', 
      title: 'Senior Embryologist',
      email: 'michael.chen@labqms.com',
      startDate: '2020-06-01', 
      endDate: null,
      status: 'active',
      training: {
        'sperm-prep': { completed: true, signOffDate: '2020-06-15', file: null },
        'media-dishes': { completed: true, signOffDate: '2020-06-15', file: null },
        'egg-retrieval': { completed: true, signOffDate: '2020-06-20', file: null },
        'stripping': { completed: true, signOffDate: '2020-06-20', file: null },
        'embryo-grading': { completed: true, signOffDate: '2020-06-25', file: null },
        'vitrification-warming': { completed: true, signOffDate: '2020-07-01', file: null },
        'icsi': { completed: true, signOffDate: '2020-07-10', file: null },
        'biopsy': { completed: false, signOffDate: null, file: null },
        'transfer': { completed: false, signOffDate: null, file: null }
      },
      files: [
        { id: 4, name: 'Resume_MChen.pdf', type: 'resume', size: '198 KB', uploadDate: '2020-05-20' },
        { id: 5, name: 'Job_Description_SrEmbryologist.pdf', type: 'job-description', size: '115 KB', uploadDate: '2020-05-20' }
      ]
    },
    { 
      id: 3, 
      name: 'Emily Rodriguez', 
      title: 'Andrology Technician',
      email: 'emily.rodriguez@labqms.com',
      startDate: '2021-09-15', 
      endDate: null,
      status: 'active',
      training: {
        'sperm-prep': { completed: true, signOffDate: '2021-09-25', file: null },
        'media-dishes': { completed: true, signOffDate: '2021-09-25', file: null },
        'egg-retrieval': { completed: false, signOffDate: null, file: null },
        'stripping': { completed: false, signOffDate: null, file: null },
        'embryo-grading': { completed: false, signOffDate: null, file: null },
        'vitrification-warming': { completed: false, signOffDate: null, file: null },
        'icsi': { completed: false, signOffDate: null, file: null },
        'biopsy': { completed: false, signOffDate: null, file: null },
        'transfer': { completed: false, signOffDate: null, file: null }
      },
      files: [
        { id: 6, name: 'Resume_ERodriguez.pdf', type: 'resume', size: '156 KB', uploadDate: '2021-09-01' }
      ]
    }
  ]);
  const [showAddPersonnel, setShowAddPersonnel] = useState(false);
  const [showEditPersonnel, setShowEditPersonnel] = useState(null);
  const [editPersonnelData, setEditPersonnelData] = useState(null);
  const [showPersonnelFiles, setShowPersonnelFiles] = useState(null);
  const [showDeactivatePersonnel, setShowDeactivatePersonnel] = useState(null);
  const [deactivateDate, setDeactivateDate] = useState('');
  const [newPersonnel, setNewPersonnel] = useState({ name: '', title: '', email: '', startDate: '', endDate: '', files: [] });
  const [personnelFileUpload, setPersonnelFileUpload] = useState({ type: 'resume', file: null, fileName: '', customName: '' });

  // Incident Reports state
  const incidentTypes = [
    { id: 'specimen', name: 'Specimen Issue', color: 'bg-red-100 text-red-800' },
    { id: 'equipment', name: 'Equipment Malfunction', color: 'bg-orange-100 text-orange-800' },
    { id: 'labeling', name: 'Labeling Error', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'procedure', name: 'Procedure Deviation', color: 'bg-purple-100 text-purple-800' },
    { id: 'environmental', name: 'Environmental Issue', color: 'bg-blue-100 text-blue-800' },
    { id: 'safety', name: 'Safety Incident', color: 'bg-pink-100 text-pink-800' },
    { id: 'other', name: 'Other', color: 'bg-gray-100 text-gray-800' }
  ];

  const [incidents, setIncidents] = useState([
    {
      id: 1,
      date: '2025-01-15',
      type: 'equipment',
      title: 'Incubator Temperature Fluctuation',
      description: 'Incubator #2 showed temperature fluctuation of ±0.5°C outside acceptable range for 2 hours.',
      reportedBy: 'Michael Chen',
      involvedPersonnel: ['Michael Chen', 'Dr. Sarah Johnson'],
      severity: 'moderate',
      status: 'resolved',
      correctiveAction: 'Calibrated temperature sensor. Replaced backup battery. Implemented twice-daily manual temperature verification.',
      resolutionDate: '2025-01-16',
      files: [{ id: 1, name: 'Incubator_Service_Report.pdf', size: '245 KB' }]
    },
    {
      id: 2,
      date: '2025-01-20',
      type: 'labeling',
      title: 'Specimen Label Discrepancy',
      description: 'Patient ID on specimen container did not match requisition form. Caught during verification step.',
      reportedBy: 'Emily Rodriguez',
      involvedPersonnel: ['Emily Rodriguez'],
      severity: 'minor',
      status: 'resolved',
      correctiveAction: 'Re-verified specimen identity with patient. Corrected label. Reinforced double-check protocol during team meeting.',
      resolutionDate: '2025-01-20',
      files: []
    },
    {
      id: 3,
      date: '2025-02-01',
      type: 'procedure',
      title: 'Media Preparation Deviation',
      description: 'Culture media was used past 2-week expiration. Discovered during routine QC check.',
      reportedBy: 'Dr. Sarah Johnson',
      involvedPersonnel: ['Michael Chen'],
      severity: 'moderate',
      status: 'investigating',
      correctiveAction: '',
      resolutionDate: null,
      files: []
    }
  ]);
  const [showAddIncident, setShowAddIncident] = useState(false);
  const [showViewIncident, setShowViewIncident] = useState(null);
  const [newIncident, setNewIncident] = useState({
    date: new Date().toISOString().split('T')[0],
    type: '',
    title: '',
    description: '',
    reportedBy: '',
    involvedPersonnel: '',
    severity: 'minor',
    correctiveAction: ''
  });

  // CAP Checklists state
  const checklistCategories = [
    { id: 'general', name: 'General Laboratory Checklist', bgColor: 'bg-gray-700', lightBg: 'bg-gray-50', hoverBg: 'hover:bg-gray-100' },
    { id: 'reproductive', name: 'Reproductive Laboratory Checklist', bgColor: 'bg-green-700', lightBg: 'bg-green-50', hoverBg: 'hover:bg-green-100' },
    { id: 'allCommon', name: 'All Common Checklist', bgColor: 'bg-indigo-700', lightBg: 'bg-indigo-50', hoverBg: 'hover:bg-indigo-100' },
    { id: 'director', name: 'Laboratory Director Checklist', bgColor: 'bg-amber-700', lightBg: 'bg-amber-50', hoverBg: 'hover:bg-amber-100' }
  ];

  const [checklistItems, setChecklistItems] = useState({
    general: [],
    reproductive: [],
    allCommon: [],
    director: []
  });
  
  const [showAddChecklistItem, setShowAddChecklistItem] = useState(null);
  const [newChecklistItem, setNewChecklistItem] = useState({ requirement: '', note: '' });
  const [editingChecklistNote, setEditingChecklistNote] = useState(null);

  // Supabase helper - upload file to lab's bucket
  const uploadToSupabase = async (file, fileName) => {
    if (!SUPABASE_ENABLED || !lab?.bucket) {
      return { success: false, error: 'Supabase not configured' };
    }
    
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'Could not connect to Supabase' };
    
    try {
      // Upload to the lab's bucket with a unique filename
      const filePath = `sops/${Date.now()}_${fileName}`;
      const { data, error } = await supabase.storage
        .from(lab.bucket)
        .upload(filePath, file);
      
      if (error) throw error;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from(lab.bucket)
        .getPublicUrl(filePath);
      
      return { 
        success: true, 
        filePath: filePath,
        publicUrl: urlData.publicUrl 
      };
    } catch (error) {
      console.error('Upload error:', error);
      return { success: false, error: error.message };
    }
  };

  const lab = currentLab ? labs[currentLab] : null;

  const handleAddLab = () => {
    if (newLab.name && newLab.location) {
      const labId = newLab.name.toLowerCase().replace(/[^a-z0-9]/g, '') + Date.now();
      const bucket = newLab.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const colorConfig = LAB_COLORS.find(c => c.name === newLab.color) || LAB_COLORS[0];
      setLabs(prev => ({ ...prev, [labId]: { id: labId, name: newLab.name, location: newLab.location, bucket: bucket, ...colorConfig, isDefault: false } }));
      setNewLab({ name: '', location: '', color: 'blue' });
      setShowAddLab(false);
    }
  };

  const handleDeleteLab = (labId) => {
    setLabs(prev => { const newLabs = { ...prev }; delete newLabs[labId]; return newLabs; });
    setShowDeleteConfirm(null);
  };

  const notifications = [
    { id: 1, type: 'due-soon', message: 'Due in 5 days: Q2 QA/QM Review', priority: 'medium' },
    { id: 2, type: 'upcoming', message: 'Upcoming: CAP Self-Inspection', priority: 'low' },
    { id: 3, type: 'upcoming', message: 'Upcoming: Q3 QA/QM Review', priority: 'low' },
  ];

  const getPriorityColor = (priority) => {
    switch(priority) { case 'high': return 'bg-red-500'; case 'medium': return 'bg-yellow-500'; default: return 'bg-blue-500'; }
  };

  const getStatusColor = (status) => {
    switch(status) { case 'completed': return 'bg-green-100 text-green-800'; case 'in-progress': return 'bg-yellow-100 text-yellow-800'; default: return 'bg-gray-100 text-gray-800'; }
  };

  // ================== LOGIN PAGE ==================
  if (!currentLab) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 overflow-auto">
        <div className="max-w-5xl mx-auto pt-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-xl mb-4">
              <ClipboardList className="w-10 h-10 text-slate-700" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Laboratory QMS</h1>
            <p className="text-slate-400">Quality Management System for Reproductive Laboratories</p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Building2 className="w-5 h-5" /> Select Laboratory
              </h2>
              <button onClick={() => setShowAddLab(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">
                <Plus className="w-4 h-4" /> Add New Lab
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.values(labs).map(labItem => (
                <div key={labItem.id} className={`relative p-6 rounded-xl border-2 ${labItem.borderColor} ${labItem.lightBg} transition-all hover:shadow-lg cursor-pointer group`} onClick={() => setCurrentLab(labItem.id)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`font-semibold text-lg ${labItem.textColor}`}>{labItem.name}</h3>
                      <p className="text-gray-500 flex items-center gap-1 mt-1"><MapPin className="w-4 h-4" /> {labItem.location}</p>
                    </div>
                    <div className={`w-10 h-10 ${labItem.bgColor} rounded-lg flex items-center justify-center`}>
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(labItem.id); }} className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="mt-4 pt-4 border-t border-gray-200"><p className="text-sm text-gray-600">Click to enter laboratory</p></div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-center text-slate-500 text-sm mt-6">CAP/CLIA Compliant Quality Management System</p>
        </div>

        {showAddLab && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Add New Laboratory</h3>
                <button onClick={() => setShowAddLab(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
              </div>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Laboratory Name</label><input type="text" value={newLab.name} onChange={(e) => setNewLab(prev => ({ ...prev, name: e.target.value }))} className="w-full border rounded-lg px-4 py-3" placeholder="e.g., ABC Fertility Center" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Location</label><input type="text" value={newLab.location} onChange={(e) => setNewLab(prev => ({ ...prev, location: e.target.value }))} className="w-full border rounded-lg px-4 py-3" placeholder="e.g., New York" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Theme Color</label><div className="grid grid-cols-8 gap-2">{LAB_COLORS.map(color => (<button key={color.name} onClick={() => setNewLab(prev => ({ ...prev, color: color.name }))} className={`w-8 h-8 rounded-lg ${color.bgColor} ${newLab.color === color.name ? 'ring-4 ring-offset-2 ring-gray-400' : ''}`} />))}</div></div>
                <button onClick={handleAddLab} disabled={!newLab.name || !newLab.location} className={`w-full py-3 rounded-lg font-medium text-white ${newLab.name && newLab.location ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-400 cursor-not-allowed'}`}>Create Laboratory</button>
              </div>
            </div>
          </div>
        )}

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-8 h-8 text-red-600" /></div>
                <h3 className="text-xl font-semibold mb-2">Delete Laboratory?</h3>
                <p className="text-gray-600 mb-6">Are you sure you want to delete <strong>{labs[showDeleteConfirm]?.name}</strong>?</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                  <button onClick={() => handleDeleteLab(showDeleteConfirm)} className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ================== MAIN APPLICATION ==================
  const Dashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <span className={`px-4 py-2 rounded-full text-sm font-medium ${lab.lightBg} ${lab.textColor}`}>{lab.name} - {lab.location}</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`bg-white p-6 rounded-lg shadow border-l-4 ${lab.borderColor}`}>
          <div className="flex items-center justify-between"><div><p className="text-gray-500 text-sm">Total SOPs</p><p className="text-3xl font-bold text-gray-800">{sampleLabData.sops.length}</p></div><FileText className={`w-10 h-10 ${lab.textColor}`} /></div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between"><div><p className="text-gray-500 text-sm">Completed Tasks</p><p className="text-3xl font-bold text-gray-800">1/{sampleLabData.tasks.length}</p></div><CheckCircle className="w-10 h-10 text-green-500" /></div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="flex items-center justify-between"><div><p className="text-gray-500 text-sm">Due Soon</p><p className="text-3xl font-bold text-gray-800">1</p></div><Clock className="w-10 h-10 text-yellow-500" /></div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
          <div className="flex items-center justify-between"><div><p className="text-gray-500 text-sm">Overdue</p><p className="text-3xl font-bold text-gray-800">0</p></div><AlertCircle className="w-10 h-10 text-red-500" /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><Bell className="w-5 h-5" /> Active Alerts</h3>
          <div className="space-y-2">
            {notifications.map(n => (
              <div key={n.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${getPriorityColor(n.priority)}`} />
                <span className="text-sm text-gray-700">{n.message}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setActiveTab('sops')} className={`flex flex-col items-center gap-2 p-4 ${lab.lightBg} rounded-lg hover:opacity-80`}><Upload className={`w-8 h-8 ${lab.textColor}`} /><span className={`text-sm font-medium ${lab.textColor}`}>Upload SOP</span></button>
            <button onClick={() => setActiveTab('checklists')} className="flex flex-col items-center gap-2 p-4 bg-green-50 rounded-lg hover:bg-green-100"><ClipboardList className="w-8 h-8 text-green-600" /><span className="text-sm font-medium text-green-800">CAP Checklist</span></button>
            <button onClick={() => setActiveTab('tasks')} className="flex flex-col items-center gap-2 p-4 bg-purple-50 rounded-lg hover:bg-purple-100"><Calendar className="w-8 h-8 text-purple-600" /><span className="text-sm font-medium text-purple-800">View Schedule</span></button>
            <button onClick={() => setActiveTab('reports')} className="flex flex-col items-center gap-2 p-4 bg-orange-50 rounded-lg hover:bg-orange-100"><BarChart3 className="w-8 h-8 text-orange-600" /><span className="text-sm font-medium text-orange-800">QM Reports</span></button>
          </div>
        </div>
      </div>

      {/* CAP Checklists Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><ClipboardList className="w-5 h-5" /> CAP Checklists</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button onClick={() => setActiveTab('checklists')} className="p-4 border-2 border-gray-200 rounded-xl hover:border-gray-400 hover:shadow-md transition-all text-left">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
              <ClipboardList className="w-5 h-5 text-gray-600" />
            </div>
            <h4 className="font-semibold text-gray-800">General Laboratory</h4>
            <p className="text-sm text-gray-500 mt-1">QM, Documents, Personnel, Equipment, Safety</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2"><div className="bg-gray-600 h-2 rounded-full" style={{width:'35%'}}></div></div>
              <span className="text-xs text-gray-500">35%</span>
            </div>
          </button>
          
          <button onClick={() => setActiveTab('checklists')} className="p-4 border-2 border-green-200 rounded-xl hover:border-green-400 hover:shadow-md transition-all text-left">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <ClipboardList className="w-5 h-5 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-800">Reproductive</h4>
            <p className="text-sm text-gray-500 mt-1">Andrology & Embryology Laboratory</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2"><div className="bg-green-600 h-2 rounded-full" style={{width:'42%'}}></div></div>
              <span className="text-xs text-gray-500">42%</span>
            </div>
          </button>
          
          <button onClick={() => setActiveTab('checklists')} className="p-4 border-2 border-indigo-200 rounded-xl hover:border-indigo-400 hover:shadow-md transition-all text-left">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
              <ClipboardList className="w-5 h-5 text-indigo-600" />
            </div>
            <h4 className="font-semibold text-gray-800">All Common</h4>
            <p className="text-sm text-gray-500 mt-1">Pre-Analytic, Analytic, Post-Analytic, PT</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2"><div className="bg-indigo-600 h-2 rounded-full" style={{width:'28%'}}></div></div>
              <span className="text-xs text-gray-500">28%</span>
            </div>
          </button>
          
          <button onClick={() => setActiveTab('checklists')} className="p-4 border-2 border-amber-200 rounded-xl hover:border-amber-400 hover:shadow-md transition-all text-left">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-3">
              <ClipboardList className="w-5 h-5 text-amber-600" />
            </div>
            <h4 className="font-semibold text-gray-800">Director</h4>
            <p className="text-sm text-gray-500 mt-1">Qualifications, Responsibilities, QM Oversight</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2"><div className="bg-amber-600 h-2 rounded-full" style={{width:'50%'}}></div></div>
              <span className="text-xs text-gray-500">50%</span>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-blue-500" /> Andrology Metrics</h3>
          <div className="space-y-4">
            <div><div className="flex justify-between text-sm mb-1"><span>Specimen Rejection Rate</span><span className="font-medium">1.4% (Target: &lt;2%)</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{width:'70%'}}></div></div></div>
            <div><div className="flex justify-between text-sm mb-1"><span>QC/Calibration Compliance</span><span className="font-medium">100% (Target: 100%)</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{width:'100%'}}></div></div></div>
            <div><div className="flex justify-between text-sm mb-1"><span>Corrected Reports</span><span className="font-medium">0.8% (Target: &lt;2%)</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{width:'40%'}}></div></div></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-green-500" /> Embryology Metrics</h3>
          <div className="space-y-4">
            <div><div className="flex justify-between text-sm mb-1"><span>Fertilization Rate</span><span className="font-medium">72% (Target: &gt;64%)</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{width:'72%'}}></div></div></div>
            <div><div className="flex justify-between text-sm mb-1"><span>Blastocyst Rate</span><span className="font-medium">42% (Target: &gt;34%)</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{width:'42%'}}></div></div></div>
            <div><div className="flex justify-between text-sm mb-1"><span>Pregnancy Rate</span><span className="font-medium">45% (Target: &gt;39%)</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{width:'45%'}}></div></div></div>
          </div>
        </div>
      </div>
    </div>
  );

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a PDF, DOC, or DOCX file');
        return;
      }
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setNewSOP(prev => ({ ...prev, file: file, fileName: file.name }));
    }
  };

  const handleAddSOP = async () => {
    if (newSOP.name && newSOP.fileName) {
      setUploading(true);
      setUploadProgress(0);
      
      try {
        let fileUrl = null;
        let filePath = null;
        
        if (SUPABASE_ENABLED && newSOP.file) {
          // Upload to Supabase Storage
          for (let i = 0; i <= 50; i += 10) {
            await new Promise(resolve => setTimeout(resolve, 100));
            setUploadProgress(i);
          }
          
          const result = await uploadToSupabase(newSOP.file, newSOP.fileName);
          
          for (let i = 50; i <= 100; i += 10) {
            await new Promise(resolve => setTimeout(resolve, 100));
            setUploadProgress(i);
          }
          
          if (result.success) {
            fileUrl = result.publicUrl;
            filePath = result.filePath;
          } else {
            throw new Error(result.error);
          }
        } else {
          // Demo mode - simulate upload
          for (let i = 0; i <= 100; i += 25) {
            await new Promise(resolve => setTimeout(resolve, 150));
            setUploadProgress(i);
          }
        }
        
        const sop = {
          id: Date.now(),
          name: newSOP.name,
          lab: newSOP.lab,
          uploadDate: new Date().toISOString().split('T')[0],
          reviewDate: newSOP.reviewDate,
          fileName: newSOP.fileName,
          fileSize: newSOP.file ? (newSOP.file.size / 1024).toFixed(1) + ' KB' : '',
          fileType: newSOP.file ? newSOP.file.type : '',
          fileUrl: fileUrl,
          filePath: filePath,
          storedIn: supabaseConnected ? 'supabase' : 'local',
          bucket: lab?.bucket
        };
        
        setSops(prev => [...prev, sop]);
        setNewSOP({ name: '', lab: 'andrology', reviewDate: '', file: null, fileName: '' });
        setShowAddSOP(false);
        
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Failed to upload file. Please try again.');
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    }
  };

  const handleDeleteSOP = async (id) => {
    const sop = sops.find(s => s.id === id);
    
    if (SUPABASE_ENABLED && sop?.filePath && sop?.bucket) {
      // Delete from Supabase Storage
      try {
        const supabase = getSupabaseClient();
        if (supabase) {
          await supabase.storage.from(sop.bucket).remove([sop.filePath]);
        }
      } catch (error) {
        console.error('Error deleting file from Supabase:', error);
      }
    }
    
    setSops(prev => prev.filter(sop => sop.id !== id));
  };

  const handleDownloadSOP = (sop) => {
    if (sop.fileUrl) {
      window.open(sop.fileUrl, '_blank');
    } else {
      alert('Download not available - file stored in browser memory only');
    }
  };

  const handleViewSOP = (sop) => {
    if (sop.fileUrl) {
      window.open(sop.fileUrl, '_blank');
    } else {
      alert('Preview not available - file stored in browser memory only');
    }
  };

  const SOPManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">SOP Management</h2>
        <button onClick={() => setShowAddSOP(true)} className={`flex items-center gap-2 px-4 py-2 ${lab.bgColor} text-white rounded-lg hover:opacity-90`}>
          <Plus className="w-4 h-4" /> Add SOP
        </button>
      </div>

      {/* Storage Info Banner */}
      <div className={`${supabaseConnected ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4`}>
        <div className="flex items-start gap-3">
          {supabaseConnected ? (
            <>
              <Cloud className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-800">Connected to Supabase Storage</p>
                <p className="text-sm text-green-700 mt-1">
                  Files will be saved to the <strong>{lab?.bucket}</strong> bucket. Each lab has isolated storage.
                </p>
                <ul className="text-sm text-green-600 mt-2 space-y-1">
                  <li>✓ 5GB storage per lab</li>
                  <li>✓ Isolated storage - labs cannot access each other's files</li>
                  <li>✓ Automatic backup</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <Cloud className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">Cloud Storage Not Configured</p>
                <p className="text-sm text-blue-700 mt-1">
                  Files are stored in browser memory only (demo mode). To enable cloud storage:
                </p>
                <ol className="text-sm text-blue-600 mt-2 space-y-1 list-decimal list-inside">
                  <li>Sign up at supabase.com (free)</li>
                  <li>Create a project</li>
                  <li>Create buckets for each lab</li>
                  <li>Add your API credentials to the app config</li>
                </ol>
              </div>
            </>
          )}
        </div>
      </div>

      {/* SOP List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="Search SOPs..." className="pl-10 pr-4 py-2 border rounded-lg w-full" />
            </div>
          </div>
        </div>
        
        {sops.length === 0 ? (
          <div className="p-12 text-center">
            <FolderOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No SOPs Uploaded</h3>
            <p className="text-gray-500 mb-4">Start by uploading your laboratory SOPs</p>
            <button onClick={() => setShowAddSOP(true)} className={`px-6 py-3 ${lab.bgColor} text-white rounded-lg hover:opacity-90`}>
              Upload First SOP
            </button>
          </div>
        ) : (
          <div className="divide-y">
            {sops.map(sop => (
              <div key={sop.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <FileText className={`w-10 h-10 ${lab.textColor}`} />
                  <div>
                    <p className="font-medium text-gray-800">{sop.name}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className={`text-xs ${lab.lightBg} ${lab.textColor} px-2 py-1 rounded`}>{sop.lab}</span>
                      <span className="text-xs text-gray-500">Uploaded: {sop.uploadDate}</span>
                      {sop.fileName && <span className="text-xs text-blue-600">{sop.fileName}</span>}
                      {sop.fileSize && <span className="text-xs text-gray-400">({sop.fileSize})</span>}
                      {sop.storedIn === 'supabase' ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1">
                          <Cloud className="w-3 h-3" /> Supabase
                        </span>
                      ) : sop.fileUrl ? (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center gap-1">
                          <Cloud className="w-3 h-3" /> Cloud
                        </span>
                      ) : (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">Demo Only</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleViewSOP(sop)} className="p-2 text-gray-400 hover:text-blue-600" title="View">
                    <Eye className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDownloadSOP(sop)} className="p-2 text-gray-400 hover:text-green-600" title="Download">
                    <Download className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDeleteSOP(sop.id)} className="p-2 text-gray-400 hover:text-red-600" title="Delete">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const TasksSchedule = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">QA/QM Schedule</h2>
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b"><h3 className="font-semibold text-gray-800">Scheduled Tasks for {lab.name}</h3></div>
        <div className="divide-y">{sampleLabData.tasks.map(task => (
          <div key={task.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1"><div className="flex items-center gap-3"><h4 className="font-medium text-gray-800">{task.title}</h4><span className={`px-2 py-1 rounded text-xs ${task.type === 'QM' ? 'bg-purple-100 text-purple-800' : task.type === 'SOP' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{task.type}</span></div><p className="text-sm text-gray-500 mt-1">{task.description}</p><p className="text-sm text-gray-600 mt-2"><Calendar className="w-4 h-4 inline mr-1" /> Due: {task.dueDate}</p></div>
              <span className={`px-3 py-2 rounded-lg text-sm font-medium ${getStatusColor(task.status)}`}>{task.status}</span>
            </div>
          </div>
        ))}</div>
      </div>
    </div>
  );

  const Reports = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">QM Reports - {lab.name}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6"><h3 className="font-semibold text-gray-800 mb-4">Andrology Metrics</h3><div className="space-y-4">{[{l:'Specimen Rejection Rate',v:'1.4%',t:'<2%',ok:true},{l:'QC/Calibration Compliance',v:'100%',t:'100%',ok:true},{l:'Corrected Reports',v:'0.8%',t:'<2%',ok:true}].map(m=>(<div key={m.l}><div className="flex justify-between text-sm mb-1"><span>{m.l}</span><span className="font-medium">Current: {m.v} | Target: {m.t}</span></div><div className="w-full bg-gray-200 rounded-full h-3"><div className={`h-3 rounded-full ${m.ok?'bg-green-500':'bg-red-500'}`} style={{width:'70%'}}></div></div><p className="text-xs text-gray-500 mt-1">{m.ok?'✓ Within target':'⚠ Outside target'}</p></div>))}</div></div>
        <div className="bg-white rounded-lg shadow p-6"><h3 className="font-semibold text-gray-800 mb-4">Embryology Metrics</h3><div className="space-y-4">{[{l:'Fertilization Rate',v:'72%',t:'>64%',ok:true},{l:'Blastocyst Rate',v:'42%',t:'>34%',ok:true},{l:'Pregnancy Rate',v:'45%',t:'>39%',ok:true}].map(m=>(<div key={m.l}><div className="flex justify-between text-sm mb-1"><span>{m.l}</span><span className="font-medium">Current: {m.v} | Target: {m.t}</span></div><div className="w-full bg-gray-200 rounded-full h-3"><div className={`h-3 rounded-full ${m.ok?'bg-green-500':'bg-red-500'}`} style={{width:'70%'}}></div></div><p className="text-xs text-gray-500 mt-1">{m.ok?'✓ Within target':'⚠ Outside target'}</p></div>))}</div></div>
      </div>
      <div className="bg-white rounded-lg shadow p-6"><h3 className="font-semibold text-gray-800 mb-4">Generate Reports</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[{i:BarChart3,c:'text-blue-500',t:'Quarterly QM Report'},{i:ClipboardList,c:'text-green-500',t:'CAP Compliance Report'},{i:FileText,c:'text-purple-500',t:'SOP Status Report'},{i:AlertCircle,c:'text-orange-500',t:'Corrective Actions'}].map(r=>(<button key={r.t} className="p-4 border rounded-lg hover:bg-gray-50 text-left"><r.i className={`w-8 h-8 ${r.c} mb-2`} /><p className="font-medium text-sm">{r.t}</p></button>))}</div></div>
    </div>
  );

  // Personnel handlers
  const handleAddPersonnel = () => {
    if (newPersonnel.name && newPersonnel.title && newPersonnel.startDate) {
      const emptyTraining = {};
      trainingCompetencies.forEach(t => {
        emptyTraining[t.id] = { completed: false, signOffDate: null, file: null };
      });
      
      const person = {
        id: Date.now(),
        name: newPersonnel.name,
        title: newPersonnel.title,
        email: newPersonnel.email,
        startDate: newPersonnel.startDate,
        endDate: newPersonnel.endDate || null,
        status: newPersonnel.endDate ? 'inactive' : 'active',
        training: emptyTraining,
        files: []
      };
      setPersonnel(prev => [...prev, person]);
      setNewPersonnel({ name: '', title: '', email: '', startDate: '', endDate: '', files: [] });
      setShowAddPersonnel(false);
    }
  };

  const handleEditPersonnel = (person) => {
    setEditPersonnelData({ ...person, training: { ...person.training } });
    setShowEditPersonnel(person.id);
  };

  const handleSavePersonnel = () => {
    if (editPersonnelData) {
      // Update status based on end date
      const updatedData = {
        ...editPersonnelData,
        status: editPersonnelData.endDate ? 'inactive' : 'active'
      };
      
      setPersonnel(prev => prev.map(p => 
        p.id === editPersonnelData.id ? updatedData : p
      ));
      setShowEditPersonnel(null);
      setEditPersonnelData(null);
    }
  };

  const handleTrainingToggle = (competencyId) => {
    setEditPersonnelData(prev => ({
      ...prev,
      training: {
        ...prev.training,
        [competencyId]: {
          ...prev.training[competencyId],
          completed: !prev.training[competencyId]?.completed,
          signOffDate: !prev.training[competencyId]?.completed ? new Date().toISOString().split('T')[0] : null,
          file: !prev.training[competencyId]?.completed ? prev.training[competencyId]?.file : null
        }
      }
    }));
  };

  const handleTrainingDateChange = (competencyId, date) => {
    setEditPersonnelData(prev => ({
      ...prev,
      training: {
        ...prev.training,
        [competencyId]: {
          ...prev.training[competencyId],
          signOffDate: date
        }
      }
    }));
  };

  const handleTrainingFileUpload = (e, competencyId) => {
    const file = e.target.files[0];
    if (file) {
      setEditPersonnelData(prev => ({
        ...prev,
        training: {
          ...prev.training,
          [competencyId]: {
            ...prev.training[competencyId],
            file: {
              name: file.name,
              size: (file.size / 1024).toFixed(1) + ' KB'
            }
          }
        }
      }));
    }
  };

  const handleDeleteTrainingFile = (competencyId) => {
    setEditPersonnelData(prev => ({
      ...prev,
      training: {
        ...prev.training,
        [competencyId]: {
          ...prev.training[competencyId],
          file: null
        }
      }
    }));
  };

  const handleDeletePersonnel = (id) => {
    // Open deactivate modal instead of deleting
    setShowDeactivatePersonnel(id);
    setDeactivateDate(new Date().toISOString().split('T')[0]); // Default to today
  };

  const handleConfirmDeactivate = () => {
    if (showDeactivatePersonnel && deactivateDate) {
      setPersonnel(prev => prev.map(p => 
        p.id === showDeactivatePersonnel 
          ? { ...p, endDate: deactivateDate, status: 'inactive' }
          : p
      ));
      setShowDeactivatePersonnel(null);
      setDeactivateDate('');
    }
  };

  const handleReactivatePersonnel = (id) => {
    setPersonnel(prev => prev.map(p => 
      p.id === id 
        ? { ...p, endDate: null, status: 'active' }
        : p
    ));
  };

  // Incident Report handlers
  const handleAddIncident = () => {
    if (newIncident.title && newIncident.type && newIncident.description && newIncident.reportedBy) {
      const incident = {
        id: Date.now(),
        date: newIncident.date,
        type: newIncident.type,
        title: newIncident.title,
        description: newIncident.description,
        reportedBy: newIncident.reportedBy,
        involvedPersonnel: newIncident.involvedPersonnel.split(',').map(p => p.trim()).filter(p => p),
        severity: newIncident.severity,
        status: 'open',
        correctiveAction: newIncident.correctiveAction,
        resolutionDate: null,
        files: []
      };
      setIncidents(prev => [incident, ...prev]);
      setNewIncident({
        date: new Date().toISOString().split('T')[0],
        type: '',
        title: '',
        description: '',
        reportedBy: '',
        involvedPersonnel: '',
        severity: 'minor',
        correctiveAction: ''
      });
      setShowAddIncident(false);
    }
  };

  const handleUpdateIncidentStatus = (id, status) => {
    setIncidents(prev => prev.map(inc => 
      inc.id === id 
        ? { 
            ...inc, 
            status, 
            resolutionDate: status === 'resolved' ? new Date().toISOString().split('T')[0] : inc.resolutionDate 
          }
        : inc
    ));
  };

  const handleUpdateIncidentCorrectiveAction = (id, correctiveAction) => {
    setIncidents(prev => prev.map(inc => 
      inc.id === id ? { ...inc, correctiveAction } : inc
    ));
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'major': return 'bg-orange-500 text-white';
      case 'moderate': return 'bg-yellow-500 text-white';
      case 'minor': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Checklist handlers
  const handleAddChecklistItem = (categoryId) => {
    if (newChecklistItem.requirement.trim()) {
      const newItem = {
        id: Date.now(),
        requirement: newChecklistItem.requirement,
        note: newChecklistItem.note,
        completed: false,
        files: [],
        createdDate: new Date().toISOString().split('T')[0]
      };
      setChecklistItems(prev => ({
        ...prev,
        [categoryId]: [...prev[categoryId], newItem]
      }));
      setNewChecklistItem({ requirement: '', note: '' });
      setShowAddChecklistItem(null);
    }
  };

  const handleToggleChecklistItem = (categoryId, itemId) => {
    setChecklistItems(prev => ({
      ...prev,
      [categoryId]: prev[categoryId].map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    }));
  };

  const handleUpdateChecklistNote = (categoryId, itemId, note) => {
    setChecklistItems(prev => ({
      ...prev,
      [categoryId]: prev[categoryId].map(item =>
        item.id === itemId ? { ...item, note } : item
      )
    }));
  };

  const handleChecklistFileSelect = (e, categoryId, itemId) => {
    const file = e.target.files[0];
    if (file) {
      const newFile = {
        id: Date.now(),
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        uploadDate: new Date().toISOString().split('T')[0]
      };
      setChecklistItems(prev => ({
        ...prev,
        [categoryId]: prev[categoryId].map(item =>
          item.id === itemId ? { ...item, files: [...item.files, newFile] } : item
        )
      }));
    }
  };

  const handleDeleteChecklistFile = (categoryId, itemId, fileId) => {
    setChecklistItems(prev => ({
      ...prev,
      [categoryId]: prev[categoryId].map(item =>
        item.id === itemId ? { ...item, files: item.files.filter(f => f.id !== fileId) } : item
      )
    }));
  };

  const handleDeleteChecklistItem = (categoryId, itemId) => {
    if (confirm('Are you sure you want to delete this checklist item?')) {
      setChecklistItems(prev => ({
        ...prev,
        [categoryId]: prev[categoryId].filter(item => item.id !== itemId)
      }));
    }
  };

  const handlePersonnelFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Get file extension
      const extension = file.name.includes('.') ? '.' + file.name.split('.').pop() : '';
      const nameWithoutExt = file.name.includes('.') ? file.name.substring(0, file.name.lastIndexOf('.')) : file.name;
      
      setPersonnelFileUpload(prev => ({ 
        ...prev, 
        file: file,
        fileName: file.name,
        customName: nameWithoutExt,
        extension: extension,
        size: (file.size / 1024).toFixed(1) + ' KB'
      }));
    }
  };

  const handlePersonnelFileUpload = (personnelId) => {
    if (personnelFileUpload.file) {
      const finalName = personnelFileUpload.customName + personnelFileUpload.extension;
      const newFile = {
        id: Date.now(),
        name: finalName,
        type: personnelFileUpload.type,
        size: personnelFileUpload.size,
        uploadDate: new Date().toISOString().split('T')[0]
      };
      setPersonnel(prev => prev.map(p => 
        p.id === personnelId 
          ? { ...p, files: [...p.files, newFile] }
          : p
      ));
      setPersonnelFileUpload({ type: 'resume', file: null, fileName: '', customName: '', extension: '', size: '' });
    }
  };

  const handleCancelFileUpload = () => {
    setPersonnelFileUpload({ type: 'resume', file: null, fileName: '', customName: '', extension: '', size: '' });
  };

  const handleDeletePersonnelFile = (personnelId, fileId) => {
    setPersonnel(prev => prev.map(p =>
      p.id === personnelId
        ? { ...p, files: p.files.filter(f => f.id !== fileId) }
        : p
    ));
  };

  const getFileTypeLabel = (type) => {
    switch(type) {
      case 'resume': return { label: 'Resume', color: 'bg-blue-100 text-blue-800' };
      case 'job-description': return { label: 'Job Description', color: 'bg-purple-100 text-purple-800' };
      case 'certification': return { label: 'Certification', color: 'bg-green-100 text-green-800' };
      case 'training': return { label: 'Training Record', color: 'bg-orange-100 text-orange-800' };
      case 'competency': return { label: 'Competency', color: 'bg-teal-100 text-teal-800' };
      default: return { label: 'Other', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const Personnel = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Personnel</h2>
        <button 
          onClick={() => setShowAddPersonnel(true)} 
          className={`flex items-center gap-2 px-4 py-2 ${lab.bgColor} text-white rounded-lg hover:opacity-90`}
        >
          <Plus className="w-4 h-4" /> Add Personnel
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active</p>
              <p className="text-2xl font-bold text-gray-800">{personnel.filter(p => p.status === 'active').length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-gray-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Inactive</p>
              <p className="text-2xl font-bold text-gray-800">{personnel.filter(p => p.status === 'inactive').length}</p>
            </div>
            <User className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Add Personnel Modal */}
      {showAddPersonnel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Add New Personnel</h3>
              <button onClick={() => setShowAddPersonnel(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newPersonnel.name}
                  onChange={(e) => setNewPersonnel(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Dr. John Smith"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title / Position *</label>
                <input
                  type="text"
                  value={newPersonnel.title}
                  onChange={(e) => setNewPersonnel(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Senior Embryologist"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={newPersonnel.email}
                  onChange={(e) => setNewPersonnel(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., john.smith@clinic.com"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={newPersonnel.startDate}
                    onChange={(e) => setNewPersonnel(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date <span className="text-gray-400">(if applicable)</span></label>
                  <input
                    type="date"
                    value={newPersonnel.endDate}
                    onChange={(e) => setNewPersonnel(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <p className="text-sm text-gray-500 italic">
                * You can upload files (resume, job description, etc.) after adding the personnel record.
              </p>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddPersonnel(false)}
                  className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPersonnel}
                  disabled={!newPersonnel.name || !newPersonnel.title || !newPersonnel.startDate}
                  className={`flex-1 py-3 rounded-lg font-medium text-white ${
                    newPersonnel.name && newPersonnel.title && newPersonnel.startDate
                      ? `${lab.bgColor} hover:opacity-90`
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  Add Personnel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Personnel Modal */}
      {showEditPersonnel && editPersonnelData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Edit Personnel</h3>
              <button onClick={() => { setShowEditPersonnel(null); setEditPersonnelData(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Basic Info Section */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-800 mb-4">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editPersonnelData.name}
                    onChange={(e) => setEditPersonnelData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title / Position</label>
                  <input
                    type="text"
                    value={editPersonnelData.title}
                    onChange={(e) => setEditPersonnelData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editPersonnelData.email || ''}
                    onChange={(e) => setEditPersonnelData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., john.smith@clinic.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date (Date of Hire)</label>
                  <input
                    type="date"
                    value={editPersonnelData.startDate}
                    onChange={(e) => setEditPersonnelData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date 
                    <span className="text-gray-400 font-normal ml-1">(Leave blank if active employee)</span>
                  </label>
                  <input
                    type="date"
                    value={editPersonnelData.endDate || ''}
                    onChange={(e) => setEditPersonnelData(prev => ({ ...prev, endDate: e.target.value || null }))}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              {/* Status Indicator */}
              <div className="mt-4 p-3 rounded-lg border flex items-center gap-3 ${editPersonnelData.endDate ? 'bg-gray-100 border-gray-300' : 'bg-green-50 border-green-200'}">
                {editPersonnelData.endDate ? (
                  <>
                    <User className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-700">Employee will be marked as Inactive</p>
                      <p className="text-sm text-gray-500">Documentation will be preserved but they won't appear in active staff count</p>
                    </div>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Active Employee</p>
                      <p className="text-sm text-green-600">No end date set - employee is currently active</p>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Training Competencies Section */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-800 mb-2">Training Competencies</h4>
              <p className="text-sm text-gray-600 mb-4">Check each competency the employee is trained in, then enter the sign-off date and upload their training log.</p>
              
              <div className="space-y-3">
                {trainingCompetencies.map(comp => {
                  const training = editPersonnelData.training?.[comp.id] || { completed: false, signOffDate: null, file: null };
                  
                  return (
                    <div key={comp.id} className={`rounded-lg border ${training.completed ? 'bg-white border-green-300' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="p-3">
                        <div className="flex items-center gap-3">
                          {/* Checkbox */}
                          <button
                            onClick={() => handleTrainingToggle(comp.id)}
                            className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                              training.completed 
                                ? 'bg-green-500 border-green-500 text-white' 
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {training.completed && <Check className="w-4 h-4" />}
                          </button>
                          
                          {/* Competency Name */}
                          <span className={`font-medium ${training.completed ? 'text-gray-800' : 'text-gray-500'}`}>
                            {comp.name}
                          </span>
                          
                          {training.completed && (
                            <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              Trained
                            </span>
                          )}
                        </div>
                        
                        {/* Sign-off details - shown when checked */}
                        {training.completed && (
                          <div className="mt-3 pl-9 flex flex-wrap items-center gap-3">
                            {/* Sign-off Date */}
                            <div className="flex items-center gap-2">
                              <label className="text-sm text-gray-600">Sign-off Date:</label>
                              <input
                                type="date"
                                value={training.signOffDate || ''}
                                onChange={(e) => handleTrainingDateChange(comp.id, e.target.value)}
                                className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            
                            {/* Upload Training Log */}
                            <div className="flex items-center gap-2">
                              {training.file ? (
                                <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded">
                                  <FileText className="w-4 h-4 text-green-600" />
                                  <span className="text-sm text-green-800">{training.file.name}</span>
                                  <span className="text-xs text-green-600">({training.file.size})</span>
                                  <button
                                    onClick={() => handleDeleteTrainingFile(comp.id)}
                                    className="text-red-500 hover:text-red-700 ml-1"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <label className="flex items-center gap-2 px-3 py-1 border border-dashed border-gray-400 rounded cursor-pointer hover:bg-gray-100">
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => handleTrainingFileUpload(e, comp.id)}
                                  />
                                  <FileUp className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm text-gray-600">Upload Training Log</span>
                                </label>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Training Summary */}
              <div className="mt-4 pt-4 border-t border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Training Progress</span>
                  <span className="text-sm text-gray-600">
                    {Object.values(editPersonnelData.training || {}).filter(t => t.completed).length} / {trainingCompetencies.length} competencies completed
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${(Object.values(editPersonnelData.training || {}).filter(t => t.completed).length / trainingCompetencies.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => { setShowEditPersonnel(null); setEditPersonnelData(null); }}
                className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePersonnel}
                className={`flex-1 py-3 ${lab.bgColor} text-white rounded-lg hover:opacity-90 font-medium flex items-center justify-center gap-2`}
              >
                <Check className="w-5 h-5" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Personnel Modal */}
      {showDeactivatePersonnel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Deactivate Employee</h3>
              <p className="text-gray-600">
                You are about to mark <strong>{personnel.find(p => p.id === showDeactivatePersonnel)?.name}</strong> as inactive. 
                All their documentation will be preserved.
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Day of Work *</label>
              <input
                type="date"
                value={deactivateDate}
                onChange={(e) => setDeactivateDate(e.target.value)}
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
              <p className="text-sm text-gray-500 mt-2">Enter the employee's last working day</p>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">What happens when you deactivate?</p>
                  <ul className="text-sm text-amber-700 mt-1 space-y-1">
                    <li>• Employee will be marked as "Inactive"</li>
                    <li>• They won't appear in active staff count</li>
                    <li>• All files and training records are preserved</li>
                    <li>• You can reactivate them anytime</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeactivatePersonnel(null); setDeactivateDate(''); }}
                className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeactivate}
                disabled={!deactivateDate}
                className={`flex-1 py-3 rounded-lg font-medium text-white flex items-center justify-center gap-2 ${
                  deactivateDate ? 'bg-amber-600 hover:bg-amber-700' : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                <User className="w-5 h-5" /> Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Personnel List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="Search personnel..." className="pl-10 pr-4 py-2 border rounded-lg w-full" />
            </div>
          </div>
        </div>
        
        {personnel.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Personnel Records</h3>
            <p className="text-gray-500 mb-4">Start by adding your laboratory staff</p>
            <button 
              onClick={() => setShowAddPersonnel(true)} 
              className={`px-6 py-3 ${lab.bgColor} text-white rounded-lg hover:opacity-90`}
            >
              Add First Personnel
            </button>
          </div>
        ) : (
          <div className="divide-y">
            {personnel.map(person => (
              <div key={person.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${person.status === 'active' ? lab.lightBg : 'bg-gray-100'}`}>
                      <User className={`w-6 h-6 ${person.status === 'active' ? lab.textColor : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-800">{person.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded ${person.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                          {person.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{person.title}</p>
                      {person.email && <p className="text-sm text-blue-600">{person.email}</p>}
                      <div className="flex gap-4 mt-1 text-xs text-gray-500">
                        <span>Start: {person.startDate}</span>
                        {person.endDate && <span>End: {person.endDate}</span>}
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" /> {person.files.length} files
                        </span>
                        <span className="flex items-center gap-1">
                          <Check className="w-3 h-3" /> {Object.values(person.training || {}).filter(t => t.completed).length}/{trainingCompetencies.length} trained
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleEditPersonnel(person)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button 
                      onClick={() => setShowPersonnelFiles(person.id)}
                      className={`flex items-center gap-2 px-3 py-2 ${lab.lightBg} ${lab.textColor} rounded-lg hover:opacity-80 text-sm font-medium`}
                    >
                      <FolderOpen className="w-4 h-4" /> Files
                    </button>
                    {person.status === 'active' ? (
                      <button 
                        onClick={() => handleDeletePersonnel(person.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium"
                        title="Deactivate Employee"
                      >
                        <User className="w-4 h-4" /> Deactivate
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleReactivatePersonnel(person.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-sm font-medium"
                        title="Reactivate Employee"
                      >
                        <CheckCircle className="w-4 h-4" /> Reactivate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ================== INCIDENT REPORTS ==================
  const IncidentReports = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Incident Reports</h2>
        <button 
          onClick={() => setShowAddIncident(true)} 
          className={`flex items-center gap-2 px-4 py-2 ${lab.bgColor} text-white rounded-lg hover:opacity-90`}
        >
          <Plus className="w-4 h-4" /> Report Incident
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`bg-white p-4 rounded-lg shadow border-l-4 ${lab.borderColor}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Incidents</p>
              <p className="text-2xl font-bold text-gray-800">{incidents.length}</p>
            </div>
            <AlertTriangle className={`w-8 h-8 ${lab.textColor}`} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Open</p>
              <p className="text-2xl font-bold text-gray-800">{incidents.filter(i => i.status === 'open').length}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Investigating</p>
              <p className="text-2xl font-bold text-gray-800">{incidents.filter(i => i.status === 'investigating').length}</p>
            </div>
            <Search className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Resolved</p>
              <p className="text-2xl font-bold text-gray-800">{incidents.filter(i => i.status === 'resolved').length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Add Incident Modal */}
      {showAddIncident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Report New Incident</h3>
              <button onClick={() => setShowAddIncident(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Incident *</label>
                  <input
                    type="date"
                    value={newIncident.date}
                    onChange={(e) => setNewIncident(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Incident Type *</label>
                  <select
                    value={newIncident.type}
                    onChange={(e) => setNewIncident(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Type</option>
                    {incidentTypes.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Incident Title *</label>
                <input
                  type="text"
                  value={newIncident.title}
                  onChange={(e) => setNewIncident(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the incident"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description *</label>
                <textarea
                  value={newIncident.description}
                  onChange={(e) => setNewIncident(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 h-24"
                  placeholder="Describe what happened, when, and how it was discovered..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reported By *</label>
                  <input
                    type="text"
                    value={newIncident.reportedBy}
                    onChange={(e) => setNewIncident(prev => ({ ...prev, reportedBy: e.target.value }))}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Name of person reporting"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity *</label>
                  <select
                    value={newIncident.severity}
                    onChange={(e) => setNewIncident(prev => ({ ...prev, severity: e.target.value }))}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="minor">Minor - No impact on patient care</option>
                    <option value="moderate">Moderate - Potential impact, contained</option>
                    <option value="major">Major - Significant impact</option>
                    <option value="critical">Critical - Patient safety affected</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Personnel Involved</label>
                <input
                  type="text"
                  value={newIncident.involvedPersonnel}
                  onChange={(e) => setNewIncident(prev => ({ ...prev, involvedPersonnel: e.target.value }))}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="Comma-separated names (e.g., John Smith, Jane Doe)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Corrective Action</label>
                <textarea
                  value={newIncident.correctiveAction}
                  onChange={(e) => setNewIncident(prev => ({ ...prev, correctiveAction: e.target.value }))}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 h-20"
                  placeholder="What immediate actions were taken? (can be updated later)"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddIncident(false)}
                  className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddIncident}
                  disabled={!newIncident.title || !newIncident.type || !newIncident.description || !newIncident.reportedBy}
                  className={`flex-1 py-3 rounded-lg font-medium text-white flex items-center justify-center gap-2 ${
                    newIncident.title && newIncident.type && newIncident.description && newIncident.reportedBy
                      ? `${lab.bgColor} hover:opacity-90`
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" /> Submit Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View/Edit Incident Modal */}
      {showViewIncident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            {(() => {
              const incident = incidents.find(i => i.id === showViewIncident);
              if (!incident) return null;
              const typeInfo = incidentTypes.find(t => t.id === incident.type);
              
              return (
                <>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-1 rounded ${typeInfo?.color || 'bg-gray-100'}`}>
                          {typeInfo?.name || incident.type}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(incident.severity)}`}>
                          {incident.severity.toUpperCase()}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${getStatusBadge(incident.status)}`}>
                          {incident.status.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold">{incident.title}</h3>
                      <p className="text-gray-500 text-sm mt-1">Reported on {incident.date} by {incident.reportedBy}</p>
                    </div>
                    <button onClick={() => setShowViewIncident(null)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-2">Description</h4>
                      <p className="text-gray-600">{incident.description}</p>
                    </div>
                    
                    {incident.involvedPersonnel.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-800 mb-2">Personnel Involved</h4>
                        <div className="flex flex-wrap gap-2">
                          {incident.involvedPersonnel.map((person, idx) => (
                            <span key={idx} className="px-3 py-1 bg-white border rounded-full text-sm">{person}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-2">Corrective Action</h4>
                      <textarea
                        value={incident.correctiveAction}
                        onChange={(e) => handleUpdateIncidentCorrectiveAction(incident.id, e.target.value)}
                        className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 h-24 bg-white"
                        placeholder="Document corrective actions taken..."
                      />
                    </div>
                    
                    {incident.resolutionDate && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-medium text-green-800 mb-1">Resolved</h4>
                        <p className="text-green-600 text-sm">This incident was resolved on {incident.resolutionDate}</p>
                      </div>
                    )}
                    
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-800 mb-3">Update Status</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateIncidentStatus(incident.id, 'open')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium ${incident.status === 'open' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                        >
                          Open
                        </button>
                        <button
                          onClick={() => handleUpdateIncidentStatus(incident.id, 'investigating')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium ${incident.status === 'investigating' ? 'bg-yellow-500 text-white' : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'}`}
                        >
                          Investigating
                        </button>
                        <button
                          onClick={() => handleUpdateIncidentStatus(incident.id, 'resolved')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium ${incident.status === 'resolved' ? 'bg-green-500 text-white' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                        >
                          Resolved
                        </button>
                        <button
                          onClick={() => handleUpdateIncidentStatus(incident.id, 'closed')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium ${incident.status === 'closed' ? 'bg-gray-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                        >
                          Closed
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={() => setShowViewIncident(null)}
                      className={`px-6 py-2 ${lab.bgColor} text-white rounded-lg hover:opacity-90`}
                    >
                      Done
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Incident List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="Search incidents..." className="pl-10 pr-4 py-2 border rounded-lg w-full" />
            </div>
          </div>
        </div>
        
        {incidents.length === 0 ? (
          <div className="p-12 text-center">
            <AlertTriangle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Incident Reports</h3>
            <p className="text-gray-500 mb-4">No incidents have been reported yet</p>
            <button 
              onClick={() => setShowAddIncident(true)} 
              className={`px-6 py-3 ${lab.bgColor} text-white rounded-lg hover:opacity-90`}
            >
              Report First Incident
            </button>
          </div>
        ) : (
          <div className="divide-y">
            {incidents.map(incident => {
              const typeInfo = incidentTypes.find(t => t.id === incident.type);
              return (
                <div key={incident.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded ${typeInfo?.color || 'bg-gray-100'}`}>
                          {typeInfo?.name || incident.type}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${getSeverityColor(incident.severity)}`}>
                          {incident.severity}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${getStatusBadge(incident.status)}`}>
                          {incident.status}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-800">{incident.title}</h4>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{incident.description}</p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <span>Date: {incident.date}</span>
                        <span>Reported by: {incident.reportedBy}</span>
                        {incident.resolutionDate && <span className="text-green-600">Resolved: {incident.resolutionDate}</span>}
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowViewIncident(incident.id)}
                      className={`flex items-center gap-2 px-3 py-2 ${lab.lightBg} ${lab.textColor} rounded-lg hover:opacity-80 text-sm font-medium ml-4`}
                    >
                      <Eye className="w-4 h-4" /> View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const Checklists = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">CAP Checklists</h2>
      </div>

      {/* Checklist Categories */}
      {checklistCategories.map(category => {
        const items = checklistItems[category.id] || [];
        const completedCount = items.filter(i => i.completed).length;
        
        return (
          <div key={category.id} className="bg-white rounded-lg shadow">
            <button 
              onClick={() => setExpandedChecklist(expandedChecklist === category.id ? null : category.id)} 
              className={`w-full p-4 ${category.bgColor} text-white rounded-t-lg flex items-center justify-between`}
            >
              <h3 className="text-lg font-semibold">{category.name}</h3>
              <div className="flex items-center gap-3">
                <span className="text-sm opacity-80">{completedCount}/{items.length} items</span>
                {expandedChecklist === category.id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </div>
            </button>
            
            {expandedChecklist === category.id && (
              <div className="p-4">
                {/* Add Item Button */}
                <button
                  onClick={() => setShowAddChecklistItem(category.id)}
                  className={`w-full mb-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 flex items-center justify-center gap-2`}
                >
                  <Plus className="w-5 h-5" /> Add Requirement
                </button>
                
                {items.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ClipboardList className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p>No items added yet</p>
                    <p className="text-sm">Click "Add Requirement" to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map(item => (
                      <div key={item.id} className={`border rounded-lg ${item.completed ? 'bg-green-50 border-green-200' : category.lightBg}`}>
                        <div className="p-4">
                          {/* Main Row - Checkbox, Requirement, Actions */}
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => handleToggleChecklistItem(category.id, item.id)}
                              className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                item.completed 
                                  ? 'bg-green-500 border-green-500 text-white' 
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                            >
                              {item.completed && <Check className="w-3 h-3" />}
                            </button>
                            
                            <div className="flex-1">
                              <p className={`font-medium ${item.completed ? 'text-green-800 line-through' : 'text-gray-800'}`}>
                                {item.requirement}
                              </p>
                              
                              {/* Note */}
                              {item.note && (
                                <p className="text-sm text-gray-500 mt-1">{item.note}</p>
                              )}
                              
                              {/* Edit Note */}
                              {editingChecklistNote === item.id ? (
                                <div className="mt-2">
                                  <textarea
                                    defaultValue={item.note}
                                    onBlur={(e) => {
                                      handleUpdateChecklistNote(category.id, item.id, e.target.value);
                                      setEditingChecklistNote(null);
                                    }}
                                    className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                    placeholder="Add a note..."
                                    rows={2}
                                    autoFocus
                                  />
                                </div>
                              ) : (
                                <button
                                  onClick={() => setEditingChecklistNote(item.id)}
                                  className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                                >
                                  {item.note ? 'Edit note' : '+ Add note'}
                                </button>
                              )}
                              
                              {/* Attached Files */}
                              {item.files.length > 0 && (
                                <div className="mt-3 space-y-1">
                                  {item.files.map(file => (
                                    <div key={file.id} className="flex items-center gap-2 text-sm bg-white p-2 rounded border">
                                      <FileText className="w-4 h-4 text-blue-600" />
                                      <span className="flex-1 text-gray-700">{file.name}</span>
                                      <span className="text-gray-400 text-xs">{file.size}</span>
                                      <button className="text-gray-400 hover:text-blue-600">
                                        <Eye className="w-4 h-4" />
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteChecklistFile(category.id, item.id, file.id)}
                                        className="text-gray-400 hover:text-red-600"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {/* File Upload */}
                              <div className="mt-2">
                                <label className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 cursor-pointer">
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
                                    onChange={(e) => handleChecklistFileSelect(e, category.id, item.id)}
                                  />
                                  <Upload className="w-3 h-3" />
                                  Attach file
                                </label>
                              </div>
                            </div>
                            
                            {/* Delete Item */}
                            <button
                              onClick={() => handleDeleteChecklistItem(category.id, item.id)}
                              className="text-gray-400 hover:text-red-600 flex-shrink-0"
                              title="Delete item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 overflow-auto">
      <header className={`${lab.bgColor} shadow-lg sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3"><div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center"><ClipboardList className={`w-6 h-6 ${lab.textColor}`} /></div><div><h1 className="text-xl font-bold text-white">{lab.name}</h1><p className="text-xs text-white opacity-80">{lab.location} • Quality Management System</p></div></div>
            <div className="flex items-center gap-4">
              <div className="relative"><button onClick={() => setShowNotifications(!showNotifications)} className="p-2 text-white hover:bg-white/20 rounded-lg relative"><Bell className="w-6 h-6" /><span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{notifications.length}</span></button>
                {showNotifications && <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50"><div className="p-3 border-b font-semibold">Notifications</div><div className="max-h-64 overflow-y-auto">{notifications.map(n => <div key={n.id} className="p-3 border-b hover:bg-gray-50"><div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${getPriorityColor(n.priority)}`} /><span className="text-sm">{n.message}</span></div></div>)}</div></div>}
              </div>
              <button onClick={() => setCurrentLab(null)} className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30"><LogOut className="w-4 h-4" /> Switch Lab</button>
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 py-6 pb-20">
        <div className="flex gap-6">
          <nav className="w-64 bg-white rounded-lg shadow p-4 h-fit sticky top-24">
            <ul className="space-y-2">{[{id:'dashboard',l:'Dashboard',i:Home},{id:'checklists',l:'CAP Checklists',i:ClipboardList},{id:'sops',l:'SOP Management',i:FileText},{id:'personnel',l:'Personnel',i:Users},{id:'incidents',l:'Incident Reports',i:AlertTriangle},{id:'tasks',l:'QA/QM Schedule',i:Calendar},{id:'reports',l:'Reports',i:BarChart3}].map(item=>(<li key={item.id}><button onClick={()=>setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab===item.id?`${lab.lightBg} ${lab.textColor}`:'text-gray-600 hover:bg-gray-50'}`}><item.i className="w-5 h-5" />{item.l}</button></li>))}</ul>
          </nav>
          <main className="flex-1 min-h-[calc(100vh-200px)]">{activeTab === 'dashboard' && <Dashboard />}{activeTab === 'checklists' && <Checklists />}{activeTab === 'sops' && <SOPManagement />}{activeTab === 'personnel' && <Personnel />}{activeTab === 'incidents' && <IncidentReports />}{activeTab === 'tasks' && <TasksSchedule />}{activeTab === 'reports' && <Reports />}</main>
        </div>
      </div>
      
      {/* Add Checklist Item Modal - Rendered at top level to prevent focus issues */}
      {showAddChecklistItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Add Checklist Item</h3>
              <button onClick={() => { setShowAddChecklistItem(null); setNewChecklistItem({ requirement: '', note: '' }); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requirement *</label>
                <input
                  type="text"
                  value={newChecklistItem.requirement}
                  onChange={(e) => setNewChecklistItem(prev => ({ ...prev, requirement: e.target.value }))}
                  className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Director onsite 4 times a year"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note <span className="text-gray-400">(optional)</span></label>
                <textarea
                  value={newChecklistItem.note}
                  onChange={(e) => setNewChecklistItem(prev => ({ ...prev, note: e.target.value }))}
                  className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 h-24"
                  placeholder="Add any additional notes or details..."
                />
              </div>
              
              <p className="text-sm text-gray-500 italic">
                You can attach files after adding the item.
              </p>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => { setShowAddChecklistItem(null); setNewChecklistItem({ requirement: '', note: '' }); }}
                  className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAddChecklistItem(showAddChecklistItem)}
                  disabled={!newChecklistItem.requirement.trim()}
                  className={`flex-1 py-3 rounded-lg font-medium text-white flex items-center justify-center gap-2 ${
                    newChecklistItem.requirement.trim() ? `${lab.bgColor} hover:opacity-90` : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-5 h-5" /> Add Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add SOP Modal - Rendered at top level to prevent focus issues */}
      {showAddSOP && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Add New SOP</h3>
              <button onClick={() => setShowAddSOP(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SOP Name *</label>
                <input
                  type="text"
                  value={newSOP.name}
                  onChange={(e) => setNewSOP(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., AND-SOP-001: Semen Analysis"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Laboratory *</label>
                <select
                  value={newSOP.lab}
                  onChange={(e) => setNewSOP(prev => ({ ...prev, lab: e.target.value }))}
                  className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="andrology">Andrology</option>
                  <option value="embryology">Embryology</option>
                  <option value="both">Both</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next Review Date</label>
                <input
                  type="date"
                  value={newSOP.reviewDate}
                  onChange={(e) => setNewSOP(prev => ({ ...prev, reviewDate: e.target.value }))}
                  className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload File *</label>
                <div className={`border-2 border-dashed rounded-lg p-6 text-center ${newSOP.fileName ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-gray-400'}`}>
                  <input
                    type="file"
                    id="sop-file-upload"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="sop-file-upload" className="cursor-pointer">
                    {newSOP.fileName ? (
                      <div>
                        <FileText className="w-12 h-12 mx-auto text-green-500 mb-2" />
                        <p className="font-medium text-green-700">{newSOP.fileName}</p>
                        <p className="text-sm text-green-600">{newSOP.file ? (newSOP.file.size / 1024).toFixed(1) + ' KB' : ''}</p>
                        <p className="text-xs text-gray-500 mt-2">Click to change file</p>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                        <p className="font-medium text-gray-700">Click to upload file</p>
                        <p className="text-sm text-gray-500">PDF, DOC, or DOCX (Max 10MB)</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddSOP(false)}
                  disabled={uploading}
                  className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSOP}
                  disabled={!newSOP.name || !newSOP.fileName || uploading}
                  className={`flex-1 py-3 rounded-lg font-medium text-white flex items-center justify-center gap-2 ${
                    newSOP.name && newSOP.fileName && !uploading
                      ? `${lab.bgColor} hover:opacity-90`
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {uploading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Uploading {uploadProgress.toFixed(0)}%
                    </>
                  ) : supabaseConnected ? (
                    <>
                      <Cloud className="w-5 h-5" />
                      Upload to Supabase
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Save (Demo Mode)
                    </>
                  )}
                </button>
              </div>
              
              {uploading && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${lab.bgColor} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 text-center mt-2">
                    {supabaseConnected ? 'Uploading to Supabase...' : 'Processing file...'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Personnel Files Modal - Rendered inline to prevent focus issues */}
      {showPersonnelFiles && (() => {
        const person = personnel.find(p => p.id === showPersonnelFiles);
        if (!person) return null;
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-semibold">{person.name}</h3>
                  <p className="text-gray-500">{person.title}</p>
                </div>
                <button onClick={() => { setShowPersonnelFiles(null); handleCancelFileUpload(); }} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-800 mb-3">Upload New File</h4>
                
                {!personnelFileUpload.file ? (
                  <div className="flex gap-3">
                    <select
                      value={personnelFileUpload.type}
                      onChange={(e) => setPersonnelFileUpload(prev => ({ ...prev, type: e.target.value }))}
                      className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="resume">Resume / CV</option>
                      <option value="job-description">Job Description</option>
                      <option value="certification">Certification</option>
                      <option value="training">Training Record</option>
                      <option value="competency">Competency Assessment</option>
                      <option value="other">Other Document</option>
                    </select>
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer hover:border-gray-400 border-gray-300">
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={handlePersonnelFileSelect}
                      />
                      <FileUp className="w-5 h-5 text-gray-500" />
                      <span className="text-sm text-gray-600">Choose File</span>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm text-blue-800">Selected: {personnelFileUpload.fileName}</p>
                        <p className="text-xs text-blue-600">{personnelFileUpload.size}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">File Name</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          defaultValue={personnelFileUpload.customName}
                          onBlur={(e) => setPersonnelFileUpload(prev => ({ ...prev, customName: e.target.value }))}
                          className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter file name"
                        />
                        <span className="flex items-center px-3 bg-gray-100 border rounded-lg text-gray-600 text-sm">
                          {personnelFileUpload.extension}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Rename the file if needed. Extension will be preserved.</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">File Type</label>
                      <select
                        value={personnelFileUpload.type}
                        onChange={(e) => setPersonnelFileUpload(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="resume">Resume / CV</option>
                        <option value="job-description">Job Description</option>
                        <option value="certification">Certification</option>
                        <option value="training">Training Record</option>
                        <option value="competency">Competency Assessment</option>
                        <option value="other">Other Document</option>
                      </select>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleCancelFileUpload}
                        className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handlePersonnelFileUpload(showPersonnelFiles)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 ${lab.bgColor} hover:opacity-90`}
                      >
                        <Upload className="w-4 h-4" /> Upload File
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-3">Uploaded Files</h4>
                {person.files.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FolderOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No files uploaded yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {person.files.map(file => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className={`w-8 h-8 ${lab.textColor}`} />
                          <div>
                            <p className="font-medium text-gray-800">{file.name}</p>
                            <div className="flex gap-2 mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded ${getFileTypeLabel(file.type).color}`}>
                                {getFileTypeLabel(file.type).label}
                              </span>
                              <span className="text-xs text-gray-500">{file.size}</span>
                              <span className="text-xs text-gray-500">Uploaded: {file.uploadDate}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-gray-400 hover:text-blue-600" title="View">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-green-600" title="Download">
                            <Download className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeletePersonnelFile(showPersonnelFiles, file.id)}
                            className="p-2 text-gray-400 hover:text-red-600" 
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

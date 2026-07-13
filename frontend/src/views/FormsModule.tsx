import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OfflineBanner } from '../components/OfflineBanner';
import { 
  FileText, ClipboardCheck, Plus, CheckCircle2, Search, ChevronRight, Eye, Trash, Settings, ShieldCheck
} from 'lucide-react';

export const FormsModule: React.FC = () => {
  const { 
    formTemplates, formSubmissions, patients, addFormTemplate
  } = useApp();

  const [activeTab, setActiveTab] = useState<'submissions' | 'library' | 'builder'>('submissions');
  const [successMsg, setSuccessMsg] = useState('');

  // Selected Submission Detail Modal
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>('');
  const activeSubmission = formSubmissions.find(s => s.id === selectedSubmissionId);
  const submissionPatient = activeSubmission ? patients.find(p => p.id === activeSubmission.patientId) : null;
  const submissionTemplate = activeSubmission ? formTemplates.find(t => t.id === activeSubmission.templateId) : null;

  // Form Builder state
  const [builderTitle, setBuilderTitle] = useState('');
  const [builderDesc, setBuilderDesc] = useState('');
  const [builderFields, setBuilderFields] = useState<Array<{ id: string, label: string, type: 'text' | 'textarea' | 'checkbox' | 'select', options: string[], required: boolean }>>([]);
  
  // Single field builder substate
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldType, setFieldType] = useState<'text' | 'textarea' | 'checkbox' | 'select'>('text');
  const [fieldOptions, setFieldOptions] = useState('');
  const [fieldRequired, setFieldRequired] = useState(false);

  const handleAddField = () => {
    if (!fieldLabel) {
      alert('Please enter a descriptive field label.');
      return;
    }
    const newField = {
      id: `f_${Date.now()}`,
      label: fieldLabel,
      type: fieldType,
      options: fieldOptions ? fieldOptions.split(',').map(s => s.trim()) : [],
      required: fieldRequired
    };
    setBuilderFields([...builderFields, newField]);
    
    // Clear field entries
    setFieldLabel('');
    setFieldType('text');
    setFieldOptions('');
    setFieldRequired(false);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!builderTitle) {
      alert('Please specify a title for the new form template.');
      return;
    }
    if (builderFields.length === 0) {
      alert('Please add at least one input field component to the template.');
      return;
    }

    addFormTemplate({
      title: builderTitle,
      description: builderDesc,
      fields: builderFields
    });

    setSuccessMsg(`Form template "${builderTitle}" has been saved into the clinic registry.`);
    setBuilderTitle('');
    setBuilderDesc('');
    setBuilderFields([]);
    setActiveTab('library');
    
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      
      <OfflineBanner />

      {/* Success alert block */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
          {successMsg}
        </div>
      )}

      {/* Title Header with tabs */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-teal-600 font-bold text-xs uppercase tracking-wider font-mono">Clinic Compliance</span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Digital Forms Registry</h2>
          <p className="text-xs text-slate-500 mt-0.5">Build patient questionnaires, consent forms, and track submissions.</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start md:self-auto">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'submissions' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Submissions ({formSubmissions.length})
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'library' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Templates ({formTemplates.length})
          </button>
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'builder' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            id="forms-tab-builder"
          >
            Form Builder
          </button>
        </div>
      </div>

      {/* Tab 1: Submissions list log */}
      {activeTab === 'submissions' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {formSubmissions.length === 0 ? (
            <div className="text-center py-20 text-slate-400 text-sm">
              No patient forms submitted yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                    <th className="py-3.5 px-6">Patient</th>
                    <th className="py-3.5 px-6">Completed Form Name</th>
                    <th className="py-3.5 px-6 font-mono">Submitted Timestamp</th>
                    <th className="py-3.5 px-6">Compliance Status</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {formSubmissions.map((sub) => {
                    const pat = patients.find(p => p.id === sub.patientId);
                    const template = formTemplates.find(t => t.id === sub.templateId);
                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-6">
                          {pat ? (
                            <div>
                              <span className="font-bold text-slate-800 block">{pat.firstName} {pat.lastName}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{pat.phone}</span>
                            </div>
                          ) : (
                            'Anonymous User'
                          )}
                        </td>
                        <td className="py-3.5 px-6">
                          <span className="font-semibold text-slate-700">{template?.title || 'Patient Intake Record'}</span>
                        </td>
                        <td className="py-3.5 px-6 font-mono text-slate-500">
                          {new Date(sub.submittedAt).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-6">
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded uppercase text-[10px] border border-emerald-100">
                            <ShieldCheck size={11} />
                            Verified
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <button
                            onClick={() => setSelectedSubmissionId(sub.id)}
                            className="px-2.5 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold flex items-center gap-1.5 ml-auto text-xs"
                          >
                            <Eye size={13} />
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Template Library */}
      {activeTab === 'library' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formTemplates.map((t) => (
            <div key={t.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between gap-4">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Template ID: {t.id}</span>
                <h4 className="font-bold text-sm text-slate-800 mt-1">{t.title}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{t.description}</p>
                
                <div className="mt-3.5 border-t border-slate-100 pt-3">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Input Schema:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {t.fields.map((f, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-slate-600 text-[10px] font-mono">
                        {f.label.length > 15 ? f.label.slice(0, 15) + '...' : f.label} ({f.type})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-400 font-medium">
                <span>Created on {t.createdAt}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Dynamic Form Builder */}
      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Builder controls */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 lg:col-span-2">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Configure Schema Fields</h3>
            
            <form onSubmit={handleSaveTemplate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Template Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tooth Extraction Consent"
                    value={builderTitle}
                    onChange={(e) => setBuilderTitle(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Brief Description</label>
                  <input
                    type="text"
                    required
                    placeholder="Describe treatment disclosures..."
                    value={builderDesc}
                    onChange={(e) => setBuilderDesc(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              {/* Sub-form to add a dynamic field */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Add Intake Input Component</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Field Label / Question</label>
                    <input
                      type="text"
                      placeholder="e.g. Do you have heart conditions?"
                      value={fieldLabel}
                      onChange={(e) => setFieldLabel(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Input Format Type</label>
                    <select
                      value={fieldType}
                      onChange={(e) => setFieldType(e.target.value as any)}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    >
                      <option value="text">Single Line Text</option>
                      <option value="textarea">Paragraph Box</option>
                      <option value="checkbox">Acceptance Checkbox</option>
                      <option value="select">Dropdown Selection</option>
                    </select>
                  </div>
                </div>

                {fieldType === 'select' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Dropdown Options (Comma separated)</label>
                    <input
                      type="text"
                      placeholder="No, Yes, Socially, Frequently"
                      value={fieldOptions}
                      onChange={(e) => setFieldOptions(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={fieldRequired}
                      onChange={(e) => setFieldRequired(e.target.checked)}
                      className="rounded text-teal-600"
                    />
                    Mandatory Field
                  </label>

                  <button
                    type="button"
                    onClick={handleAddField}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
                  >
                    Add Component
                  </button>
                </div>
              </div>

              {/* Commit entire Template */}
              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  id="forms-submit-template-btn"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-md hover:shadow-lg transition cursor-pointer"
                >
                  Publish Template
                </button>
              </div>
            </form>
          </div>

          {/* Builder live layout preview */}
          <div className="bg-slate-900 text-slate-300 p-5 rounded-2xl border border-slate-800 space-y-4">
            <span className="block text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">
              Template Schema live preview
            </span>
            
            {builderFields.length === 0 ? (
              <div className="text-center py-20 text-slate-500 text-xs italic">
                Add input components from the left panel to preview your customized clinic intake template layout.
              </div>
            ) : (
              <div className="space-y-4 max-h-[440px] overflow-y-auto text-xs pr-1">
                <div>
                  <h4 className="font-bold text-white text-sm">{builderTitle || 'Form Template Title'}</h4>
                  <p className="text-slate-400 text-[11px] mt-1">{builderDesc || 'Form description text details'}</p>
                </div>

                <div className="space-y-3 border-t border-slate-800 pt-4">
                  {builderFields.map((f, i) => (
                    <div key={i} className="space-y-1">
                      <span className="block text-slate-300 font-semibold">{f.label} {f.required && <span className="text-rose-400">*</span>}</span>
                      
                      {f.type === 'text' && (
                        <div className="p-2 bg-slate-950 border border-slate-800 rounded text-slate-500 font-mono text-[10px]">Text Input Field</div>
                      )}
                      {f.type === 'textarea' && (
                        <div className="p-2 bg-slate-950 border border-slate-800 rounded text-slate-500 font-mono text-[10px] h-12">Paragraph Box</div>
                      )}
                      {f.type === 'checkbox' && (
                        <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 border border-slate-800 rounded bg-slate-950" /><span className="text-slate-500 text-[10px]">Consent agreement checkbox</span></div>
                      )}
                      {f.type === 'select' && (
                        <div className="p-2 bg-slate-950 border border-slate-800 rounded text-slate-500 font-mono text-[10px] flex justify-between">
                          <span>Dropdown Choice</span>
                          <span>▼</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Inspect Submission Detail Modal Overlay */}
      {activeSubmission && submissionPatient && (
        <>
          <div className="fixed inset-0 bg-slate-950/40 z-50 backdrop-blur-sm" onClick={() => setSelectedSubmissionId('')} />
          <div className="fixed inset-x-4 top-10 max-w-lg mx-auto bg-white rounded-2xl shadow-2xl z-55 flex flex-col p-6 border border-slate-200 animate-in zoom-in-95 duration-200 max-h-[80vh]">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">Submission ID: {activeSubmission.id}</span>
                <h3 className="font-bold text-sm text-slate-900 uppercase mt-0.5">{submissionTemplate?.title || 'Patient Intake Registry'}</h3>
              </div>
              <button onClick={() => setSelectedSubmissionId('')} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Demographic Profile</span>
                  <p className="font-bold text-slate-800">{submissionPatient.firstName} {submissionPatient.lastName}</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold text-slate-400">Submitted</span>
                  <p className="font-mono text-slate-600 font-semibold">{new Date(activeSubmission.submittedAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-3.5 border-t border-slate-100 pt-4">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logged Data Entries</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(activeSubmission.data).map(([key, val]) => {
                    const field = submissionTemplate?.fields.find(f => f.id === key);
                    return (
                      <div key={key} className="bg-slate-50/50 p-3 rounded-lg border border-slate-100/80">
                        <span className="text-[10px] text-slate-400 font-semibold block">{field?.label || key}</span>
                        <span className="font-semibold text-slate-800 text-[11px] mt-1 block">
                          {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedSubmissionId('')}
                  className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
                >
                  Close Record File
                </button>
              </div>

            </div>
          </div>
        </>
      )}

    </div>
  );
};

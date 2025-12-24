import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import JSZip from 'jszip';
import { 
  BookOpen, 
  PenTool, 
  Image as ImageIcon, 
  Sparkles, 
  GraduationCap, 
  User, 
  CheckCircle,
  Upload,
  RefreshCw,
  Download,
  Landmark,
  Wand2,
  Save,
  Trash2,
  Archive,
  Calendar,
  Search,
  ExternalLink,
  FolderDown,
  Globe,
  FileText
} from 'lucide-react';
import Layout from './components/Layout';
import Button from './components/Button';
import { UserRole, AppView, LEVELS, EducationalLevel, SavedItem, SavedItemType, CurriculumData } from './types';
import * as GeminiService from './services/geminiService';
import { getCurriculumForLevel } from './data/curriculum';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.NONE);
  const [view, setView] = useState<AppView>(AppView.HOME);
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // Check local storage or system preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('eduart-theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('eduart-theme', newMode ? 'dark' : 'light');
  };

  // Saved Items State
  const [savedItems, setSavedItems] = useState<SavedItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('eduart-saved-items');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('eduart-saved-items', JSON.stringify(savedItems));
  }, [savedItems]);

  const handleSaveItem = (type: SavedItemType, content: string, title: string) => {
    const newItem: SavedItem = {
      id: Date.now().toString(),
      type,
      content,
      title,
      date: Date.now(),
      role: role
    };
    setSavedItems(prev => [newItem, ...prev]);
    // Optional: Visual feedback could be added here
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm("Estàs segur que vols esborrar aquest element?")) {
      setSavedItems(prev => prev.filter(item => item.id !== id));
    }
  };

  // State for Teachers (General)
  const [selectedLevel, setSelectedLevel] = useState<string>(LEVELS[0].id);
  const [availableSubjects, setAvailableSubjects] = useState<CurriculumData[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  
  // Update subjects when level changes
  useEffect(() => {
    const subjects = getCurriculumForLevel(selectedLevel);
    setAvailableSubjects(subjects);
    if (subjects.length > 0) {
      setSelectedSubject(subjects[0].subject);
    } else {
      setSelectedSubject('');
    }
  }, [selectedLevel]);

  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  // State for Lesson Planner
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');

  // State for Heritage Generator
  const [heritageConcept, setHeritageConcept] = useState('Color i Llum');
  const [heritageElement, setHeritageElement] = useState('Joaquim Sorolla');

  // State for Search Info
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFormat, setSearchFormat] = useState('Resum Biogràfic');
  const [searchResult, setSearchResult] = useState<{content: string, sources: {title: string, uri: string}[]} | null>(null);

  // State for Students
  const [analysisImage, setAnalysisImage] = useState<string | null>(null);
  const [analysisQuestion, setAnalysisQuestion] = useState('');
  const [analysisLanguage, setAnalysisLanguage] = useState('Valencià');
  const [analysisResult, setAnalysisResult] = useState('');
  const [creativePrompt, setCreativePrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // State for Image Generation (Student)
  const [genImagePrompt, setGenImagePrompt] = useState('');
  const [genImageSource, setGenImageSource] = useState<string | null>(null);
  const [genImageResult, setGenImageResult] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Navigation Handlers
  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (selectedRole === UserRole.TEACHER) {
      setView(AppView.LESSON_PLANNER);
    } else {
      setView(AppView.CREATIVE_PROMPTS);
    }
  };

  const resetRole = () => {
    setRole(UserRole.NONE);
    setView(AppView.HOME);
    // Reset states
    setTopic('');
    setGeneratedContent('');
    setAnalysisImage(null);
    setAnalysisResult('');
    setAnalysisLanguage('Valencià');
    setCreativePrompt('');
    setGenImagePrompt('');
    setGenImageSource(null);
    setGenImageResult(null);
    setSearchQuery('');
    setSearchResult(null);
  };

  // Helper to get curriculum context string
  const getCurriculumContext = (): string | undefined => {
    const subjectData = availableSubjects.find(s => s.subject === selectedSubject);
    if (!subjectData) return undefined;
    return `
      Matèria: ${subjectData.subject}
      Competències Específiques: ${subjectData.competencies}
      Criteris d'Avaluació: ${subjectData.criteria}
      Sabers Bàsics: ${subjectData.basicKnowledge}
      ${subjectData.situations ? `Situacions d'Aprenentatge (SAs) del curs: ${subjectData.situations}` : ''}
    `;
  };

  // Logic: Teacher - Generate Lesson Plan
  const handleGenerateLesson = async () => {
    if (!topic) return;
    setIsGenerating(true);
    setGeneratedContent('');
    try {
      const levelLabel = LEVELS.find(l => l.id === selectedLevel)?.label || 'ESO';
      const curriculumContext = getCurriculumContext();
      const result = await GeminiService.generateLessonPlan(topic, levelLabel, context, curriculumContext);
      setGeneratedContent(result);
    } catch (error) {
      setGeneratedContent("Hi ha hagut un error generant el contingut. Torna-ho a provar.");
    } finally {
      setIsGenerating(false);
    }
  };

   // Logic: Teacher - Generate Rubric
   const handleGenerateRubric = async () => {
    if (!topic) return;
    setIsGenerating(true);
    setGeneratedContent('');
    try {
      const levelLabel = LEVELS.find(l => l.id === selectedLevel)?.label || 'ESO';
      const curriculumContext = getCurriculumContext();
      const result = await GeminiService.generateRubric(topic, levelLabel, curriculumContext);
      setGeneratedContent(result);
    } catch (error) {
      setGeneratedContent("Error generant la rúbrica.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Logic: Teacher - Generate Heritage Activity
  const handleGenerateHeritage = async () => {
    setIsGenerating(true);
    setGeneratedContent('');
    try {
      const levelLabel = LEVELS.find(l => l.id === selectedLevel)?.label || 'ESO';
      const curriculumContext = getCurriculumContext();
      const result = await GeminiService.generateHeritageActivity(heritageConcept, heritageElement, levelLabel, curriculumContext);
      setGeneratedContent(result);
    } catch (error) {
      setGeneratedContent("Error generant l'activitat patrimonial.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Logic: Teacher - Search Information
  const handleSearch = async () => {
    if (!searchQuery) return;
    setIsGenerating(true);
    setSearchResult(null);
    try {
      const result = await GeminiService.searchAndSynthesize(searchQuery, searchFormat);
      setSearchResult(result);
    } catch (error) {
       console.error(error);
       // could set error state here
    } finally {
      setIsGenerating(false);
    }
  };

  // Logic: Student - Generate Prompt
  const handleGeneratePrompt = async () => {
    setIsGenerating(true);
    try {
      const prompt = await GeminiService.generateCreativeChallenge();
      setCreativePrompt(prompt);
    } catch (error) {
      setCreativePrompt("No s'ha pogut generar el repte.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Logic: Student - Image Analysis
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAnalysisImage(reader.result as string);
        setAnalysisResult(''); // Clear previous result
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!analysisImage) return;
    setIsAnalyzing(true);
    try {
      // Strip base64 header
      const base64Data = analysisImage.split(',')[1];
      const result = await GeminiService.analyzeStudentWork(base64Data, analysisQuestion, analysisLanguage);
      setAnalysisResult(result);
    } catch (error) {
      setAnalysisResult("Error analitzant la imatge.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Logic: Student - Image Generation
  const handleGenImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGenImageSource(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateImage = async () => {
    if (!genImagePrompt) return;
    setIsGeneratingImage(true);
    setGenImageResult(null);
    try {
      // Prepare base64 if source image exists
      const result = await GeminiService.generateImage(genImagePrompt, genImageSource || undefined);
      setGenImageResult(result);
    } catch (error) {
      console.error(error);
      // We could set an error state here, but for now we'll just not show a result
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Logic: ZIP Download
  const handleDownloadZip = async () => {
    setIsDownloadingZip(true);
    try {
      const zip = new JSZip();
      const images = savedItems.filter(item => item.role === role && item.type === 'IMAGE');
      
      if (images.length === 0) return;

      images.forEach((item) => {
        // Remove the data URL prefix (e.g., "data:image/png;base64,")
        const base64Data = item.content.split(',')[1];
        if (base64Data) {
           // Create a safe filename
           const safeTitle = item.title.replace(/[^a-z0-9]/gi, '_').substring(0, 20);
           const filename = `${safeTitle}_${item.id}.png`;
           zip.file(filename, base64Data, { base64: true });
        }
      });

      const content = await zip.generateAsync({ type: "blob" });
      
      // Trigger download
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `eduart_imatges_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error("Error creating zip:", error);
      alert("No s'ha pogut crear l'arxiu ZIP.");
    } finally {
      setIsDownloadingZip(false);
    }
  };

  // Render Helpers
  const renderHome = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-12">
      <div className="text-center max-w-2xl px-4">
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
          L'art es troba amb la <span className="text-indigo-600 dark:text-indigo-400">Intel·ligència Artificial</span>
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
          Una eina innovadora per a la comunitat educativa d'arts plàstiques de València.
          Crea situacions d'aprenentatge, connecta amb el patrimoni local i rep feedback instantani.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
        {/* Teacher Card */}
        <div 
          onClick={() => handleRoleSelect(UserRole.TEACHER)}
          className="group relative bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm hover:shadow-xl border border-slate-200 dark:border-slate-700 transition-all duration-300 cursor-pointer overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <GraduationCap size={120} className="text-indigo-600 dark:text-indigo-400 transform group-hover:rotate-12 transition-transform" />
          </div>
          <div className="relative z-10 flex flex-col items-start">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg mb-4 text-indigo-700 dark:text-indigo-300">
              <GraduationCap size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Sóc Docent</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Genera unitats didàctiques LOMLOE, activitats de patrimoni valencià i rúbriques.</p>
            <span className="text-indigo-600 dark:text-indigo-400 font-medium group-hover:translate-x-1 transition-transform inline-flex items-center">
              Accedir a l'Aula Virtual <Sparkles size={16} className="ml-2" />
            </span>
          </div>
        </div>

        {/* Student Card */}
        <div 
          onClick={() => handleRoleSelect(UserRole.STUDENT)}
          className="group relative bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm hover:shadow-xl border border-slate-200 dark:border-slate-700 transition-all duration-300 cursor-pointer overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <User size={120} className="text-rose-600 dark:text-rose-400 transform group-hover:-rotate-12 transition-transform" />
          </div>
          <div className="relative z-10 flex flex-col items-start">
            <div className="p-3 bg-rose-100 dark:bg-rose-900/50 rounded-lg mb-4 text-rose-700 dark:text-rose-300">
              <User size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Sóc Alumne</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Rep reptes creatius, analitza les teues obres i aprén noves tècniques.</p>
            <span className="text-rose-600 dark:text-rose-400 font-medium group-hover:translate-x-1 transition-transform inline-flex items-center">
              Entrar al Taller <PenTool size={16} className="ml-2" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSavedView = () => {
    // Filter items based on the current role
    const filteredItems = savedItems.filter(item => item.role === role);
    const images = filteredItems.filter(item => item.type === 'IMAGE');
    const hasImages = images.length > 0;

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
            <Archive className="mr-3 text-indigo-600 dark:text-indigo-400" />
            La meua Carpeta
          </h2>
          <Button 
            onClick={handleDownloadZip} 
            disabled={!hasImages}
            isLoading={isDownloadingZip}
            variant="outline"
            icon={<FolderDown size={18} />}
          >
            Descarregar Imatges (ZIP)
          </Button>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 border-dashed">
            <Archive className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500 dark:text-slate-400">Encara no has guardat res.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <div key={item.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
                <div className="p-5 flex-grow">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide
                      ${item.type === 'IMAGE' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 
                        item.type === 'ANALYSIS' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' :
                        item.type === 'SEARCH' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' :
                        'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                      }`}>
                      {item.type === 'LESSON' ? 'Unitat' : 
                       item.type === 'RUBRIC' ? 'Rúbrica' : 
                       item.type === 'HERITAGE' ? 'Patrimoni' : 
                       item.type === 'IMAGE' ? 'Imatge' : 
                       item.type === 'SEARCH' ? 'Recerca' :
                       item.type === 'ANALYSIS' ? 'Anàlisi' : 'Repte'}
                    </span>
                    <button 
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <h3 className="font-bold text-slate-800 dark:text-white mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  
                  {item.type === 'IMAGE' ? (
                    <img src={item.content} alt="Saved" className="w-full h-32 object-cover rounded-md mb-2" />
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-4 mb-2">
                      {item.content.substring(0, 150)}...
                    </p>
                  )}
                  
                  <div className="flex items-center text-xs text-slate-400 mt-2">
                    <Calendar size={12} className="mr-1" />
                    {new Date(item.date).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                   {item.type !== 'IMAGE' && (
                     <button 
                       onClick={() => {
                         navigator.clipboard.writeText(item.content);
                         alert("Contingut copiat al portapapers!");
                       }}
                       className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                     >
                       Copiar Contingut
                     </button>
                   )}
                   {item.type === 'IMAGE' && (
                      <a 
                        href={item.content}
                        download={`saved-image-${item.id}.png`}
                        className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                      >
                        Descarregar
                      </a>
                   )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderTeacherView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar Controls */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Navigation / Mode Selection */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-2 flex flex-col space-y-1">
          <button 
            onClick={() => { setView(AppView.LESSON_PLANNER); setGeneratedContent(''); setSearchResult(null); }}
            className={`flex items-center px-4 py-3 rounded-lg transition-colors text-sm font-medium ${view === AppView.LESSON_PLANNER ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
          >
            <BookOpen className="mr-3 h-5 w-5" />
            Programació (LOMLOE)
          </button>
          <button 
            onClick={() => { setView(AppView.VALENCIAN_CULTURE); setGeneratedContent(''); setSearchResult(null); }}
            className={`flex items-center px-4 py-3 rounded-lg transition-colors text-sm font-medium ${view === AppView.VALENCIAN_CULTURE ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
          >
            <Landmark className="mr-3 h-5 w-5" />
            Patrimoni Valencià
          </button>
           <button 
            onClick={() => { setView(AppView.SEARCH_INFO); setGeneratedContent(''); setSearchResult(null); }}
            className={`flex items-center px-4 py-3 rounded-lg transition-colors text-sm font-medium ${view === AppView.SEARCH_INFO ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
          >
            <Search className="mr-3 h-5 w-5" />
            Recerca i Informació
          </button>
          <div className="my-2 border-t border-slate-100 dark:border-slate-700"></div>
          <button 
            onClick={() => setView(AppView.SAVED)}
            className={`flex items-center px-4 py-3 rounded-lg transition-colors text-sm font-medium ${view === AppView.SAVED ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
          >
            <Archive className="mr-3 h-5 w-5" />
            La meua Carpeta
          </button>
        </div>

        {view !== AppView.SAVED && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sticky top-24">
            
            {view !== AppView.SEARCH_INFO && (
              <div className="mb-4 space-y-4">
                <div>
                  <label htmlFor="global-level" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nivell Educatiu</label>
                  <select 
                    id="global-level"
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-2.5 border transition-colors"
                  >
                    {LEVELS.map(level => (
                      <option key={level.id} value={level.id}>{level.label}</option>
                    ))}
                  </select>
                </div>

                {availableSubjects.length > 0 && (
                  <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                    <label htmlFor="subject-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Matèria (Currículum)</label>
                    <select 
                      id="subject-select"
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-2.5 border transition-colors"
                    >
                      {availableSubjects.map((sub, idx) => (
                        <option key={idx} value={sub.subject}>{sub.subject}</option>
                      ))}
                    </select>
                    <div className="mt-1 flex items-center text-xs text-indigo-600 dark:text-indigo-400">
                      <FileText size={12} className="mr-1" />
                      <span>Currículum oficial carregat</span>
                    </div>
                  </div>
                )}
                <hr className="border-slate-100 dark:border-slate-700" />
              </div>
            )}
            
            {view === AppView.LESSON_PLANNER && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Situació d'Aprenentatge</h3>
                <div>
                  <label htmlFor="lesson-topic" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tòpic o Projecte</label>
                  <input 
                    id="lesson-topic"
                    type="text" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Ex: Teoria del color, Impressionisme..."
                    className="w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-2.5 border transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="lesson-context" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Context (Opcional)</label>
                  <textarea 
                    id="lesson-context"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Ex: Grup divers, focus en materials reciclats..."
                    rows={3}
                    className="w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-2.5 border transition-colors"
                  />
                </div>
                <div className="pt-2 flex flex-col gap-2">
                  <Button onClick={handleGenerateLesson} isLoading={isGenerating} disabled={!topic} className="w-full">
                    Generar Unitat Didàctica
                  </Button>
                  <Button onClick={handleGenerateRubric} isLoading={isGenerating} disabled={!topic} variant="secondary" className="w-full">
                    Generar Rúbrica
                  </Button>
                </div>
              </div>
            )}

            {view === AppView.VALENCIAN_CULTURE && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Creador d'Activitats</h3>
                <div>
                  <label htmlFor="heritage-concept" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Concepte Artístic</label>
                  <select 
                    id="heritage-concept"
                    value={heritageConcept}
                    onChange={(e) => setHeritageConcept(e.target.value)}
                    className="w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-2.5 border transition-colors"
                  >
                    <option value="Color i Llum">Color i Llum</option>
                    <option value="Volum i Forma 3D">Volum i Forma 3D</option>
                    <option value="Textura i Matèria">Textura i Matèria</option>
                    <option value="Composició i Espai">Composició i Espai</option>
                    <option value="Disseny Gràfic i Tipografia">Disseny Gràfic i Tipografia</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="heritage-element" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Element Patrimonial</label>
                  <select 
                    id="heritage-element"
                    value={heritageElement}
                    onChange={(e) => setHeritageElement(e.target.value)}
                    className="w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-2.5 border transition-colors"
                  >
                    <option value="Joaquim Sorolla">Joaquim Sorolla</option>
                    <option value="Falles i Art Efímer">Falles i Art Efímer</option>
                    <option value="Carnaval de Vinaròs">Carnaval de Vinaròs</option>
                    <option value="Ceràmica (Manises/Paterna)">Ceràmica (Manises/Paterna)</option>
                    <option value="Modernisme Valencià">Modernisme Valencià</option>
                    <option value="Arquitectura de Calatrava">Arquitectura de Calatrava</option>
                    <option value="Art Rupestre Llevantí">Art Rupestre Llevantí</option>
                    <option value="Disseny (València Capital Mundial)">Disseny (Capital Mundial)</option>
                    <option value="Segle d'Or (Llotja)">Segle d'Or (Llotja)</option>
                  </select>
                </div>
                <div className="pt-2">
                  <Button onClick={handleGenerateHeritage} isLoading={isGenerating} className="w-full bg-orange-600 hover:bg-orange-700 focus:ring-orange-500">
                    <Sparkles className="mr-2 h-4 w-4" /> Generar Activitat
                  </Button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-2">
                  Connecta conceptes plàstics amb la nostra cultura per a crear projectes d'aula únics.
                </p>
              </div>
            )}

            {view === AppView.SEARCH_INFO && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Assistent de Recerca</h3>
                <div>
                  <label htmlFor="search-query" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tema de cerca</label>
                  <input 
                    id="search-query"
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ex: Bauhaus, Tècnica de l'oli, Frida Kahlo..."
                    className="w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-2.5 border transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="search-format" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Format de sortida</label>
                  <select 
                    id="search-format"
                    value={searchFormat}
                    onChange={(e) => setSearchFormat(e.target.value)}
                    className="w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-2.5 border transition-colors"
                  >
                    <option value="Resum Biogràfic">Resum Biogràfic</option>
                    <option value="Context Històric i Artístic">Context Històric i Artístic</option>
                    <option value="Explicació Tècnica (Materials i Processos)">Explicació Tècnica</option>
                    <option value="Fitxa d'Obra">Fitxa d'Obra</option>
                    <option value="Curiositats i Dades Rellevants">Curiositats i Dades</option>
                  </select>
                </div>
                <div className="pt-2">
                  <Button onClick={handleSearch} isLoading={isGenerating} disabled={!searchQuery} className="w-full bg-teal-600 hover:bg-teal-700 focus:ring-teal-500">
                    <Search className="mr-2 h-4 w-4" /> Cercar informació
                  </Button>
                </div>
                 <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-2">
                  Utilitza Google Search per trobar informació actualitzada i fiable.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Output Area */}
      <div className="lg:col-span-8">
        {view === AppView.SAVED ? renderSavedView() : view === AppView.SEARCH_INFO ? (
             // Render Search Result logic
             <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[600px] p-8">
                {searchResult ? (
                   <div className="prose prose-indigo dark:prose-invert max-w-none">
                      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                          <span className="text-sm font-medium px-3 py-1 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                            Resultat de Recerca
                          </span>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleSaveItem('SEARCH', searchResult.content, `${searchFormat}: ${searchQuery}`)}
                              className="text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                              title="Guardar a la carpeta"
                            >
                              <Save size={20} />
                            </button>
                             <button 
                              onClick={() => {navigator.clipboard.writeText(searchResult.content)}}
                              className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                              title="Copiar al portapapers"
                            >
                              <CheckCircle size={20} />
                            </button>
                          </div>
                      </div>
                      <ReactMarkdown>{searchResult.content}</ReactMarkdown>
                      
                      {/* Sources Section */}
                      {searchResult.sources && searchResult.sources.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center">
                            <Search size={16} className="mr-2" /> Fonts utilitzades
                          </h4>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {searchResult.sources.map((source, idx) => (
                              <li key={idx}>
                                <a 
                                  href={source.uri} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:underline p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                  <ExternalLink size={14} className="mr-2 flex-shrink-0" />
                                  <span className="truncate">{source.title}</span>
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                   </div>
                ) : (
                    // Empty state for search
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                        <Search size={48} className="mb-4 text-slate-200 dark:text-slate-700" />
                        <p className="text-lg font-medium">L'assistent de recerca està llest</p>
                        <p className="text-sm">Cerca artistes, tècniques o moviments per obtenir informació detallada.</p>
                    </div>
                )}
             </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[600px] p-8">
            {generatedContent ? (
              <div className="prose prose-indigo dark:prose-invert max-w-none">
                 <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${view === AppView.VALENCIAN_CULTURE ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'}`}>
                      {view === AppView.VALENCIAN_CULTURE ? 'Activitat Patrimonial Generada' : 'Resultat Generat (LOMLOE)'}
                    </span>
                    <div className="flex gap-2">
                       <button 
                        onClick={() => handleSaveItem(
                          view === AppView.VALENCIAN_CULTURE ? 'HERITAGE' : 'LESSON',
                          generatedContent,
                          view === AppView.VALENCIAN_CULTURE ? `${heritageConcept} - ${heritageElement}` : topic || 'Unitat Didàctica'
                        )}
                        className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        title="Guardar a la carpeta"
                      >
                        <Save size={20} />
                      </button>
                      <button 
                        onClick={() => {navigator.clipboard.writeText(generatedContent)}}
                        className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        title="Copiar al portapapers"
                      >
                        <CheckCircle size={20} />
                      </button>
                    </div>
                 </div>
                 <ReactMarkdown>{generatedContent}</ReactMarkdown>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                {view === AppView.VALENCIAN_CULTURE ? <Landmark size={48} className="mb-4 text-slate-200 dark:text-slate-700" /> : <Sparkles size={48} className="mb-4 text-slate-200 dark:text-slate-700" />}
                <p className="text-lg font-medium">L'espai de treball està buit</p>
                <p className="text-sm">Configura els paràmetres i genera el teu recurs didàctic.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderStudentView = () => (
    <div className="space-y-8">
      {/* Navigation Tabs (Simulated) */}
      <div className="flex justify-center space-x-4 mb-8 overflow-x-auto pb-2">
        <button 
          onClick={() => setView(AppView.CREATIVE_PROMPTS)}
          className={`px-6 py-2 rounded-full font-medium transition-colors whitespace-nowrap ${view === AppView.CREATIVE_PROMPTS ? 'bg-rose-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
        >
          Repte Creatiu
        </button>
        <button 
          onClick={() => setView(AppView.ART_ANALYSIS)}
          className={`px-6 py-2 rounded-full font-medium transition-colors whitespace-nowrap ${view === AppView.ART_ANALYSIS ? 'bg-rose-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
        >
          Anàlisi d'Obra
        </button>
        <button 
          onClick={() => setView(AppView.IMAGE_GENERATION)}
          className={`px-6 py-2 rounded-full font-medium transition-colors whitespace-nowrap ${view === AppView.IMAGE_GENERATION ? 'bg-rose-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
        >
          Laboratori Visual
        </button>
        <button 
          onClick={() => setView(AppView.SAVED)}
          className={`px-6 py-2 rounded-full font-medium transition-colors whitespace-nowrap ${view === AppView.SAVED ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
        >
          Guardats
        </button>
      </div>

      {view === AppView.SAVED && renderSavedView()}

      {view === AppView.CREATIVE_PROMPTS && (
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-rose-100 dark:border-rose-900/50 p-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-400 to-orange-400" />
            
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-8">Necessites inspiració?</h3>
            
            <div className="min-h-[120px] flex items-center justify-center mb-8">
              {creativePrompt ? (
                <div className="flex flex-col items-center">
                   <p className="text-xl md:text-2xl font-serif italic text-slate-700 dark:text-slate-200 animate-in fade-in zoom-in duration-500 mb-4">
                    "{creativePrompt}"
                  </p>
                  <Button 
                    onClick={() => handleSaveItem('PROMPT', creativePrompt, `Repte: ${creativePrompt.substring(0, 20)}...`)}
                    variant="outline"
                    className="text-xs"
                    icon={<Save size={14} />}
                  >
                    Guardar
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-slate-300 dark:text-slate-600">
                  <Sparkles size={40} className="mb-2" />
                  <p>Prem el botó per descobrir el teu pròxim projecte</p>
                </div>
              )}
            </div>

            <Button 
              onClick={handleGeneratePrompt} 
              isLoading={isGenerating}
              className="bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 border-none text-white px-8 py-4 text-lg rounded-full shadow-lg transform transition hover:scale-105"
            >
              {creativePrompt ? <span className="flex items-center"><RefreshCw className="mr-2 h-5 w-5" /> Nou Repte</span> : "Generar Idea"}
            </Button>
          </div>
        </div>
      )}

      {view === AppView.ART_ANALYSIS && (
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center">
              <ImageIcon className="mr-2 text-rose-500" /> La teua Obra
            </h3>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors relative">
                {analysisImage ? (
                  <div className="relative">
                     <img src={analysisImage} alt="Uploaded art" className="max-h-64 mx-auto rounded-md shadow-sm" />
                     <button 
                      onClick={() => { setAnalysisImage(null); setAnalysisResult(''); }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                     >
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                     </button>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500 mb-3" />
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">Puja una foto del teu dibuix o pintura</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">JPG, PNG fins a 5MB</p>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tens alguna pregunta específica?</label>
                <input 
                  type="text" 
                  value={analysisQuestion}
                  onChange={(e) => setAnalysisQuestion(e.target.value)}
                  placeholder="Ex: Com puc millorar les ombres?"
                  className="w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-rose-500 focus:ring-rose-500 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-2.5 border transition-colors mb-2"
                />
                 
                 <div className="flex items-center gap-2 mt-3">
                   <Globe size={18} className="text-slate-400" />
                   <select 
                     value={analysisLanguage}
                     onChange={(e) => setAnalysisLanguage(e.target.value)}
                     className="flex-grow rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-rose-500 focus:ring-rose-500 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-2 border text-sm"
                   >
                     <option value="Valencià">Valencià / Català</option>
                     <option value="Castellano">Castellano</option>
                     <option value="English">English</option>
                   </select>
                 </div>
              </div>

              <Button 
                onClick={handleAnalyzeImage} 
                disabled={!analysisImage}
                isLoading={isAnalyzing}
                className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white"
              >
                Analitzar amb IA
              </Button>
            </div>
          </div>

          {/* Result Section */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
                <Sparkles className="mr-2 text-rose-500" /> Feedback
              </h3>
              {analysisResult && (
                <Button 
                  onClick={() => handleSaveItem('ANALYSIS', analysisResult, `Anàlisi: ${new Date().toLocaleDateString()}`)}
                  variant="outline"
                  className="text-xs py-1 px-2 h-8"
                  icon={<Save size={14} />}
                >
                  Guardar
                </Button>
              )}
             </div>
            
            <div className="flex-grow bg-slate-50 dark:bg-slate-900 rounded-lg p-6 overflow-y-auto max-h-[500px]">
              {analysisResult ? (
                 <div className="prose prose-rose dark:prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{analysisResult}</ReactMarkdown>
                 </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 text-center">
                  <p className="text-sm">El feedback apareixerà ací.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {view === AppView.IMAGE_GENERATION && (
         <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center">
                <Wand2 className="mr-2 text-rose-500" /> Generador Visual
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
                Descriu el que vols veure o puja un esbós per a que la IA el transforme en una imatge acabada.
              </p>

              <div className="space-y-4">
                <div>
                  <label htmlFor="gen-prompt" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripció (Prompt)</label>
                  <textarea 
                    id="gen-prompt"
                    value={genImagePrompt}
                    onChange={(e) => setGenImagePrompt(e.target.value)}
                    placeholder="Ex: Un paisatge futurista de València a l'estil cyberpunk..."
                    rows={4}
                    className="w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-2.5 border transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Imatge de referència (Opcional)</label>
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors relative">
                    {genImageSource ? (
                      <div className="relative">
                        <img src={genImageSource} alt="Source" className="max-h-40 mx-auto rounded-md shadow-sm" />
                        <button 
                          onClick={() => setGenImageSource(null)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-500 mb-2" />
                        <span className="text-xs text-slate-500 dark:text-slate-400">Puja un esbós o referència</span>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleGenImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </>
                    )}
                  </div>
                </div>

                <Button 
                  onClick={handleGenerateImage} 
                  disabled={!genImagePrompt}
                  isLoading={isGeneratingImage}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white"
                >
                  <Wand2 className="mr-2 h-4 w-4" /> Generar Imatge
                </Button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center justify-center min-h-[400px]">
               {genImageResult ? (
                 <div className="w-full flex flex-col items-center animate-in fade-in zoom-in duration-500">
                    <img src={genImageResult} alt="AI Generated" className="rounded-lg shadow-lg max-w-full mb-6 border border-slate-200 dark:border-slate-700" />
                    <div className="flex gap-4">
                      <Button 
                        onClick={() => handleSaveItem('IMAGE', genImageResult, genImagePrompt || 'Imatge Generada')}
                        variant="secondary"
                        icon={<Save size={16} />}
                      >
                        Guardar
                      </Button>
                      <a 
                        href={genImageResult} 
                        download={`eduart-gen-${Date.now()}.png`}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                      >
                        <Download className="mr-2 h-4 w-4" /> Descarregar
                      </a>
                    </div>
                 </div>
               ) : (
                 <div className="text-center text-slate-400 dark:text-slate-500">
                    {isGeneratingImage ? (
                       <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mb-4"></div>
                          <p>Creant la teua obra...</p>
                       </div>
                    ) : (
                      <>
                        <ImageIcon size={64} className="mb-4 text-slate-200 dark:text-slate-700 mx-auto" />
                        <p className="text-lg font-medium">L'espai de creació és buit</p>
                        <p className="text-sm">Introdueix un prompt i prem "Generar"</p>
                      </>
                    )}
                 </div>
               )}
            </div>
         </div>
      )}
    </div>
  );

  return (
    <Layout 
      currentRole={role} 
      currentView={view} 
      onNavigate={setView} 
      onResetRole={resetRole}
      isDarkMode={isDarkMode}
      onToggleDarkMode={toggleDarkMode}
    >
      {role === UserRole.NONE && renderHome()}
      {role === UserRole.TEACHER && renderTeacherView()}
      {role === UserRole.STUDENT && renderStudentView()}
    </Layout>
  );
};

export default App;
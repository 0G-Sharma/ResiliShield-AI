import { create } from 'zustand';

export interface Incident {
  id: string;
  type: string;
  location: string;
  latitude: number;
  longitude: number;
  severity: number;
  status: 'active' | 'resolving' | 'mitigated';
  summary: string;
  timestamp: string;
  analysis?: GeminiAnalysis;
}

export interface GeminiAnalysis {
  severity_score: number;
  confidence: number;
  damage_summary: string;
  human_presence: boolean;
  fire_detection: boolean;
  flood_probability: number;
  building_collapse: number;
  landslide_risk: number;
  structural_damage: string;
  recommendations: string[];
  risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  casualty_estimation?: number;
  spread_prediction?: string;
  evacuation_plan?: string[];
  triage_priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface Resource {
  id: string;
  name: string;
  type: 'hospital' | 'fire_station' | 'police_station' | 'shelter' | 'rescue_unit' | 'drone' | 'helicopter';
  latitude: number;
  longitude: number;
  capacity: string;
  availability: 'available' | 'dispatched' | 'offline';
  distance: number; // in km
  eta: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface TerminalLog {
  id: string;
  timestamp: string;
  sender: 'AI' | 'Gemini' | 'BigQuery' | 'Agent' | 'System' | 'SUCCESS' | 'WARNING';
  message: string;
}

export interface AutonomousAgent {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'executing' | 'completed' | 'offline';
  description: string;
  lastAction?: string;
}

export interface Mission {
  id: string;
  name: string;
  agentName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  timestamp: string;
  details: string;
  logs: string[];
}

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface ResiliShieldState {
  incidents: Incident[];
  selectedIncident: Incident | null;
  resources: Resource[];
  logs: TerminalLog[];
  agents: AutonomousAgent[];
  isAnalyzing: boolean;
  analysisProgress: number;
  activeTab: 'overview' | 'workspace' | 'analytics';
  chatMessages: ChatMessage[];
  chatOpen: boolean;
  voiceActive: boolean;
  isDispatching: boolean;
  userRole: 'commander' | 'operator' | 'observer' | 'demo' | null;
  activeMissions: Mission[];
  radarSweepActive: boolean;
  
  // Actions
  setIncidents: (incidents: Incident[]) => void;
  addIncident: (incident: Incident) => void;
  selectIncident: (incident: Incident | null) => void;
  setResources: (resources: Resource[]) => void;
  updateResourceStatus: (resourceId: string, status: 'available' | 'dispatched' | 'offline') => void;
  addLog: (sender: TerminalLog['sender'], message: string) => void;
  clearLogs: () => void;
  updateAgentStatus: (agentId: string, status: AutonomousAgent['status'], lastAction?: string) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setAnalysisProgress: (progress: number) => void;
  setActiveTab: (tab: 'overview' | 'workspace' | 'analytics') => void;
  addChatMessage: (sender: 'user' | 'assistant', text: string) => void;
  setChatOpen: (open: boolean) => void;
  setVoiceActive: (active: boolean) => void;
  setIsDispatching: (dispatching: boolean) => void;
  setUserRole: (role: 'commander' | 'operator' | 'observer' | 'demo' | null) => void;
  addMission: (mission: Mission) => void;
  updateMissionProgress: (missionId: string, progress: number, status: Mission['status'], logEntry?: string) => void;
  setRadarSweepActive: (active: boolean) => void;
  resetAll: () => void;
}

const mockAgents: AutonomousAgent[] = [
  { id: '1', name: 'Aegis Sentinel', role: 'Primary Emergency Dispatcher', status: 'idle', description: 'Coordinates active ambulance, helicopter and rescue unit routing.' },
  { id: '2', name: 'Volt Guard', role: 'Infrastructure Isolator', status: 'idle', description: 'Monitors power grids and disables high-voltage grids in threat regions.' },
  { id: '3', name: 'Sky Scan', role: 'Drone Surveillance Swarm', status: 'idle', description: 'Launches visual flight path drones to capture thermal and optical inputs.' },
  { id: '4', name: 'Civic Alert', role: 'Broadcasting Agent', status: 'idle', description: 'Fires targeted SMS, SOS, and mobile warning broadcasts to affected coordinates.' }
];

const mockMissions: Mission[] = [
  {
    id: 'm-1',
    name: 'SOMA Thermal Ingestion Scan',
    agentName: 'Sky Scan',
    status: 'completed',
    progress: 100,
    timestamp: '14:22:15',
    details: 'Initiated optical sweep over SOMA block 4-B. Found heat traces.',
    logs: [
      'Task initialized by core scheduling queue.',
      'Sensing flight path vectors: SOMA 37.777, -122.412.',
      'Completed thermal image stitching. Target analysis submitted.'
    ]
  }
];

export const useStore = create<ResiliShieldState>((set) => ({
  incidents: [],
  selectedIncident: null,
  resources: [],
  logs: [
    { id: '1', timestamp: new Date().toLocaleTimeString(), sender: 'System', message: 'ResiliShield AI Engine Initialized.' },
    { id: '2', timestamp: new Date().toLocaleTimeString(), sender: 'System', message: 'Holographic display loaded. Awaiting telemetry input...' }
  ],
  agents: mockAgents,
  isAnalyzing: false,
  analysisProgress: 0,
  activeTab: 'overview',
  chatMessages: [
    { sender: 'assistant', text: 'ResiliShield emergency coordinator online. How can I assist you with disaster operations?', timestamp: new Date().toLocaleTimeString() }
  ],
  chatOpen: false,
  voiceActive: false,
  isDispatching: false,
  userRole: null, // Initial authentication state
  activeMissions: mockMissions,
  radarSweepActive: true,

  setIncidents: (incidents) => set({ incidents }),
  addIncident: (incident) => set((state) => ({ incidents: [incident, ...state.incidents] })),
  selectIncident: (incident) => set({ selectedIncident: incident }),
  setResources: (resources) => set({ resources }),
  updateResourceStatus: (resourceId, status) => set((state) => ({
    resources: state.resources.map(res => res.id === resourceId ? { ...res, availability: status } : res)
  })),
  addLog: (sender, message) => set((state) => {
    const newLog = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toLocaleTimeString(),
      sender,
      message
    };
    return { logs: [...state.logs.slice(-99), newLog] }; // Keep last 100 logs
  }),
  clearLogs: () => set({ logs: [] }),
  updateAgentStatus: (agentId, status, lastAction) => set((state) => ({
    agents: state.agents.map(agent => 
      agent.id === agentId 
        ? { ...agent, status, ...(lastAction ? { lastAction } : {}) } 
        : agent
    )
  })),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setAnalysisProgress: (analysisProgress) => set({ analysisProgress }),
  setActiveTab: (activeTab) => set({ activeTab }),
  addChatMessage: (sender, text) => set((state) => ({
    chatMessages: [...state.chatMessages, { sender, text, timestamp: new Date().toLocaleTimeString() }]
  })),
  setChatOpen: (chatOpen) => set({ chatOpen }),
  setVoiceActive: (voiceActive) => set({ voiceActive }),
  setIsDispatching: (isDispatching) => set({ isDispatching }),
  setUserRole: (userRole) => set({ userRole }),
  addMission: (mission) => set((state) => ({ activeMissions: [mission, ...state.activeMissions] })),
  updateMissionProgress: (missionId, progress, status, logEntry) => set((state) => ({
    activeMissions: state.activeMissions.map(m => 
      m.id === missionId 
        ? { 
            ...m, 
            progress, 
            status, 
            logs: logEntry ? [...m.logs, logEntry] : m.logs 
          } 
        : m
    )
  })),
  setRadarSweepActive: (radarSweepActive) => set({ radarSweepActive }),
  
  resetAll: () => set({
    incidents: [],
    selectedIncident: null,
    resources: [],
    isAnalyzing: false,
    analysisProgress: 0,
    activeTab: 'overview',
    agents: mockAgents.map(a => ({ ...a, status: 'idle', lastAction: undefined })),
    activeMissions: mockMissions,
    logs: [
      { id: '1', timestamp: new Date().toLocaleTimeString(), sender: 'System', message: 'System telemetry state reset complete.' }
    ]
  })
}));


import { useState, useEffect } from 'react';
import { X, Moon, Sun, Palette, Zap, Database, Bell, Shield, Code, RotateCcw, Save, Sparkles, Brain, Globe, Key, Plus, Trash, Eye, EyeOff, List, Info } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAIStore } from '@/stores/aiStore';
import { useDialogStore } from '@/stores/dialogStore';
import { themes, accentColors } from '@/types/settings';
import type { AppSettings } from '@/types/settings';
import { cn } from '@/lib/utils';

type SettingsTab = 'appearance' | 'performance' | 'ai' | 'variables' | 'storage' | 'notifications' | 'security' | 'advanced';

interface SettingsProps {
  onClose: () => void;
}

export default function Settings({ onClose }: SettingsProps) {
  const { settings, updateSettings, saveSettings, resetSettings, loadSettings, isDirty } = useSettingsStore();
  const { confirm } = useDialogStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSettings();
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    confirm({
      title: 'Reset Settings',
      message: 'Are you sure you want to reset all settings to their defaults? This cannot be undone.',
      confirmText: 'Reset',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: resetSettings,
    });
  };

  const handleClose = () => {
    if (isDirty) {
      confirm({
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Do you want to save them before closing?',
        confirmText: 'Save & Close',
        cancelText: 'Discard',
        onConfirm: async () => {
          await saveSettings();
          onClose();
        },
        onCancel: onClose,
      });
    } else {
      onClose();
    }
  };

  const tabs: { id: SettingsTab; icon: typeof Palette; label: string }[] = [
    { id: 'appearance', icon: Palette, label: 'Appearance' },
    { id: 'performance', icon: Zap, label: 'Performance' },
    { id: 'ai', icon: Sparkles, label: 'AI Endpoints' },
    { id: 'variables', icon: Key, label: 'Variables' },
    { id: 'storage', icon: Database, label: 'Storage' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'security', icon: Shield, label: 'Security' },
    { id: 'advanced', icon: Code, label: 'Advanced' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-4xl h-[600px] bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-16 bg-gradient-to-b from-muted/40 to-muted/20 border-r border-border/50 p-2 flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-2 mt-1">
            <span className="text-primary font-bold text-sm">FF</span>
          </div>
          
          <div className="flex-1 flex flex-col gap-1 w-full">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'group relative w-12 h-12 rounded-lg flex items-center justify-center transition-all hover:scale-105',
                  activeTab === tab.id
                    ? 'bg-primary/10 border border-primary/30'
                    : 'hover:bg-muted/50'
                )}
                title={tab.label}
              >
                <tab.icon className={cn(
                  'w-5 h-5 transition-colors',
                  activeTab === tab.id ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                )} />
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-10">
                  {tab.label}
                </div>
              </button>
            ))}
          </div>

          {/* Bottom actions */}
          <div className="flex flex-col gap-1 mb-1">
            <button 
              onClick={handleReset}
              className="w-12 h-12 rounded-lg hover:bg-muted/50 flex items-center justify-center transition-all hover:scale-105"
              title="Reset to defaults"
            >
              <RotateCcw className="w-5 h-5 text-muted-foreground" />
            </button>
            <button 
              onClick={handleClose}
              className="w-12 h-12 rounded-lg hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-all hover:scale-105"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="max-w-2xl">
              {activeTab === 'appearance' && (
                <AppearanceSettings settings={settings} updateSettings={updateSettings} />
              )}
              {activeTab === 'performance' && (
                <PerformanceSettings settings={settings} updateSettings={updateSettings} />
              )}
              {activeTab === 'storage' && (
                <StorageSettings />
              )}
              {activeTab === 'notifications' && (
                <NotificationSettings settings={settings} updateSettings={updateSettings} />
              )}
              {activeTab === 'ai' && (
                <AISettings settings={settings} updateSettings={updateSettings} />
              )}
              {activeTab === 'variables' && (
                <VariablesSettings settings={settings} updateSettings={updateSettings} />
              )}
              {activeTab === 'security' && (
                <SecuritySettings />
              )}
              {activeTab === 'advanced' && (
                <AdvancedSettings settings={settings} updateSettings={updateSettings} />
              )}
            </div>
          </div>
        </div>

        {/* Save indicator */}
        {isDirty && (
          <div className="absolute bottom-4 right-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg shadow-lg hover:bg-primary/90 transition-colors"
            >
              {isSaving ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface SettingsPageProps {
  settings: AppSettings;
  updateSettings: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

function AppearanceSettings({ settings, updateSettings }: SettingsPageProps) {
  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Palette className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Appearance</h3>
          <p className="text-xs text-muted-foreground">Customize your workspace</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Theme Section */}
        <div>
          <label className="text-sm font-semibold mb-3 block">Color Theme</label>
          <div className="grid grid-cols-2 gap-3">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => updateSettings('theme', t.id)}
                className={cn(
                  'group relative p-4 rounded-xl border-2 transition-all hover:scale-[1.02]',
                  settings.theme === t.id
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                    : 'border-border hover:border-primary/30'
                )}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                    settings.theme === t.id ? 'bg-primary/20' : 'bg-muted'
                  )}>
                    <Palette className={cn('w-4 h-4', settings.theme === t.id ? 'text-primary' : 'text-muted-foreground')} />
                  </div>
                  <span className="font-semibold text-sm">{t.name}</span>
                </div>
                <div 
                  className="h-20 rounded-lg border border-border shadow-inner"
                  style={{ background: t.preview }}
                />
                {settings.theme === t.id && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary shadow-lg shadow-primary/50 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Mode */}
        <div>
          <label className="text-sm font-semibold mb-3 block">Theme Mode</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => updateSettings('isDarkMode', true)}
              className={cn(
                'group relative p-4 rounded-xl border-2 transition-all hover:scale-[1.02]',
                settings.isDarkMode
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                  : 'border-border hover:border-primary/30'
              )}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                  settings.isDarkMode ? 'bg-primary/20' : 'bg-muted'
                )}>
                  <Moon className={cn('w-4 h-4', settings.isDarkMode ? 'text-primary' : 'text-muted-foreground')} />
                </div>
                <span className="font-semibold text-sm">Dark</span>
              </div>
              <div className="h-20 rounded-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 shadow-inner" />
              {settings.isDarkMode && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary shadow-lg shadow-primary/50 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                </div>
              )}
            </button>

            <button
              onClick={() => updateSettings('isDarkMode', false)}
              className={cn(
                'group relative p-4 rounded-xl border-2 transition-all hover:scale-[1.02]',
                !settings.isDarkMode
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                  : 'border-border hover:border-primary/30'
              )}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                  !settings.isDarkMode ? 'bg-primary/20' : 'bg-muted'
                )}>
                  <Sun className={cn('w-4 h-4', !settings.isDarkMode ? 'text-primary' : 'text-muted-foreground')} />
                </div>
                <span className="font-semibold text-sm">Light</span>
              </div>
              <div className="h-20 rounded-lg bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 border border-slate-300 shadow-inner" />
              {!settings.isDarkMode && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary shadow-lg shadow-primary/50 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Accent Color */}
        <div>
          <label className="text-sm font-semibold mb-3 block">Accent Color</label>
          <div className="grid grid-cols-8 gap-2">
            {accentColors.map((accent) => (
              <button
                key={accent.name}
                onClick={() => updateSettings('accentColor', accent.color)}
                className={cn(
                  'w-11 h-11 rounded-lg border-2 transition-all hover:scale-110 hover:shadow-lg relative',
                  settings.accentColor === accent.color 
                    ? 'border-primary ring-2 ring-primary/20' 
                    : 'border-border hover:border-primary/50'
                )}
                style={{ backgroundColor: accent.color }}
                title={accent.name}
              >
                {settings.accentColor === accent.color && (
                  <div className="absolute inset-0 rounded-lg bg-white/20" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* UI Density */}
        <div>
          <label className="text-sm font-semibold mb-3 block">Interface Density</label>
          <div className="grid grid-cols-3 gap-2">
            {(['compact', 'default', 'spacious'] as const).map((density) => (
              <button
                key={density}
                onClick={() => updateSettings('uiDensity', density)}
                className={cn(
                  'px-4 py-3 rounded-lg border text-sm transition-all hover:scale-[1.02]',
                  settings.uiDensity === density
                    ? 'border-2 border-primary bg-primary/5 shadow-lg shadow-primary/10'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div className={cn('font-medium mb-1', settings.uiDensity === density && 'font-semibold')}>
                  {density.charAt(0).toUpperCase() + density.slice(1)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {density === 'compact' ? 'Dense' : density === 'default' ? 'Balanced' : 'Relaxed'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div className="p-4 rounded-lg bg-muted/30">
          <label className="text-sm font-semibold mb-3 block">Font Scale</label>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground font-medium">A</span>
            <input
              type="range"
              min="12"
              max="18"
              value={settings.fontSize}
              onChange={(e) => updateSettings('fontSize', Number(e.target.value))}
              className="flex-1 accent-primary"
            />
            <span className="text-sm text-muted-foreground font-medium">A</span>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-muted-foreground">Small</span>
            <span className="text-xs text-primary font-medium">{settings.fontSize}px</span>
            <span className="text-xs text-muted-foreground">Large</span>
          </div>
        </div>
      </div>
    </>
  );
}

function PerformanceSettings({ settings, updateSettings }: SettingsPageProps) {
  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Zap className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Performance</h3>
          <p className="text-xs text-muted-foreground">Optimize app behavior</p>
        </div>
      </div>

      <div className="space-y-4">
        <ToggleSetting
          icon={<Zap className="w-4 h-4" />}
          title="Smooth Animations"
          description="Enable transitions and animations"
          checked={settings.smoothAnimations}
          onChange={(v) => updateSettings('smoothAnimations', v)}
        />
        <ToggleSetting
          icon={<Shield className="w-4 h-4" />}
          title="Reduce Motion"
          description="Accessibility mode for reduced motion"
          checked={settings.reduceMotion}
          onChange={(v) => updateSettings('reduceMotion', v)}
        />
        <ToggleSetting
          icon={<Save className="w-4 h-4" />}
          title="Auto Save"
          description="Automatically save flows"
          checked={settings.autoSave}
          onChange={(v) => updateSettings('autoSave', v)}
        />
        
        {settings.autoSave && (
          <div className="p-4 rounded-lg bg-muted/30 ml-11">
            <label className="text-sm font-medium mb-2 block">Auto-save interval</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="10"
                max="120"
                step="10"
                value={settings.autoSaveInterval}
                onChange={(e) => updateSettings('autoSaveInterval', Number(e.target.value))}
                className="flex-1 accent-primary"
              />
              <span className="text-sm text-muted-foreground w-16">{settings.autoSaveInterval}s</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function StorageSettings() {
  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Database className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Storage</h3>
          <p className="text-xs text-muted-foreground">Manage local data</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Flows Storage</span>
            <span className="text-sm text-muted-foreground">Local disk</span>
          </div>
          <p className="text-xs text-muted-foreground">
            All flows are stored locally in your user config directory.
          </p>
        </div>
        
        <div className="p-4 rounded-lg bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Settings Storage</span>
            <span className="text-sm text-muted-foreground">Local disk</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Settings are persisted locally and synced on startup.
          </p>
        </div>
      </div>
    </>
  );
}

function NotificationSettings({ settings, updateSettings }: SettingsPageProps) {
  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Bell className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Notifications</h3>
          <p className="text-xs text-muted-foreground">Configure alerts</p>
        </div>
      </div>

      <div className="space-y-4">
        <ToggleSetting
          icon={<Bell className="w-4 h-4" />}
          title="Enable Notifications"
          description="Show system notifications"
          checked={settings.notificationsEnabled}
          onChange={(v) => updateSettings('notificationsEnabled', v)}
        />
        <ToggleSetting
          icon={<Zap className="w-4 h-4" />}
          title="Sound Effects"
          description="Play sounds for notifications"
          checked={settings.soundEnabled}
          onChange={(v) => updateSettings('soundEnabled', v)}
        />
      </div>
    </>
  );
}

function SecuritySettings() {
  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Security</h3>
          <p className="text-xs text-muted-foreground">Privacy and security options</p>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-muted/30">
        <p className="text-sm text-muted-foreground">
          ForgeFlow runs entirely locally. No data is sent to external servers.
        </p>
      </div>
    </>
  );
}

function AISettings({ settings, updateSettings }: SettingsPageProps) {
  const { models, fetchModels, isLoading: isModelsLoading, errors: modelErrors } = useAIStore();

  const updateAIService = (provider: keyof AppSettings['aiServices'], field: string, value: any) => {
    const updatedServices = {
      ...settings.aiServices,
      [provider]: {
        ...settings.aiServices[provider],
        [field]: value
      }
    };
    updateSettings('aiServices', updatedServices);
  };

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold">AI Endpoints</h3>
          <p className="text-xs text-muted-foreground">Configure your AI providers</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* OpenAI */}
        <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#10a37f]/20 flex items-center justify-center">
                <Brain className="w-4 h-4 text-[#10a37f]" />
              </div>
              <div>
                <div className="text-sm font-semibold">OpenAI</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Official API</div>
              </div>
            </div>
            <button
              onClick={() => updateAIService('openai', 'enabled', !settings.aiServices.openai.enabled)}
              className={cn(
                'px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all',
                settings.aiServices.openai.enabled 
                  ? 'bg-[#10a37f]/20 text-[#10a37f] border border-[#10a37f]/30' 
                  : 'bg-muted text-muted-foreground border border-border'
              )}
            >
              {settings.aiServices.openai.enabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
          
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">API Key</label>
              <input
                type="password"
                value={settings.aiServices.openai.apiKey}
                onChange={(e) => updateAIService('openai', 'apiKey', e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:ring-1 focus:ring-primary outline-none text-sm transition-all"
              />
            </div>
            <div className="pt-5">
              <button
                onClick={() => fetchModels('openai')}
                disabled={isModelsLoading.openai || !settings.aiServices.openai.apiKey}
                className="px-3 py-2 rounded-lg border border-border bg-muted/30 hover:bg-muted text-[10px] font-bold uppercase transition-all disabled:opacity-50"
              >
                {isModelsLoading.openai ? '...' : `Refresh (${models.openai.length})`}
              </button>
            </div>
          </div>
          {modelErrors.openai && <div className="text-[10px] text-rose-500 font-medium ml-1">{modelErrors.openai}</div>}
        </div>

        {/* Groq */}
        <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#f55036]/20 flex items-center justify-center text-sm font-bold text-[#f55036]">
                G
              </div>
              <div>
                <div className="text-sm font-semibold">Groq</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">High Speed</div>
              </div>
            </div>
            <button
              onClick={() => updateAIService('groq', 'enabled', !settings.aiServices.groq.enabled)}
              className={cn(
                'px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all',
                settings.aiServices.groq.enabled 
                  ? 'bg-[#f55036]/20 text-[#f55036] border border-[#f55036]/30' 
                  : 'bg-muted text-muted-foreground border border-border'
              )}
            >
              {settings.aiServices.groq.enabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
          
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">API Key</label>
              <input
                type="password"
                value={settings.aiServices.groq.apiKey}
                onChange={(e) => updateAIService('groq', 'apiKey', e.target.value)}
                placeholder="gsk_..."
                className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:ring-1 focus:ring-primary outline-none text-sm transition-all"
              />
            </div>
            <div className="pt-5">
              <button
                onClick={() => fetchModels('groq')}
                disabled={isModelsLoading.groq || !settings.aiServices.groq.apiKey}
                className="px-3 py-2 rounded-lg border border-border bg-muted/30 hover:bg-muted text-[10px] font-bold uppercase transition-all disabled:opacity-50"
              >
                {isModelsLoading.groq ? '...' : `Refresh (${models.groq.length})`}
              </button>
            </div>
          </div>
          {modelErrors.groq && <div className="text-[10px] text-rose-500 font-medium ml-1">{modelErrors.groq}</div>}
        </div>

        {/* OpenRouter */}
        <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <Globe className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <div className="text-sm font-semibold">OpenRouter</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Universal access</div>
              </div>
            </div>
            <button
              onClick={() => updateAIService('openrouter', 'enabled', !settings.aiServices.openrouter.enabled)}
              className={cn(
                'px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all',
                settings.aiServices.openrouter.enabled 
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' 
                  : 'bg-muted text-muted-foreground border border-border'
              )}
            >
              {settings.aiServices.openrouter.enabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
          
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">API Key</label>
              <input
                type="password"
                value={settings.aiServices.openrouter.apiKey}
                onChange={(e) => updateAIService('openrouter', 'apiKey', e.target.value)}
                placeholder="sk-or-v1-..."
                className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:ring-1 focus:ring-primary outline-none text-sm transition-all"
              />
            </div>
            <div className="pt-5">
              <button
                onClick={() => fetchModels('openrouter')}
                disabled={isModelsLoading.openrouter || !settings.aiServices.openrouter.apiKey}
                className="px-3 py-2 rounded-lg border border-border bg-muted/30 hover:bg-muted text-[10px] font-bold uppercase transition-all disabled:opacity-50"
              >
                {isModelsLoading.openrouter ? '...' : `Refresh (${models.openrouter.length})`}
              </button>
            </div>
          </div>
          {modelErrors.openrouter && <div className="text-[10px] text-rose-500 font-medium ml-1">{modelErrors.openrouter}</div>}
        </div>

        {/* Custom OpenAI Compatible */}
        <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Code className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <div className="text-sm font-semibold">Custom OpenAI Compatible</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Self-hosted or Alternate</div>
              </div>
            </div>
            <button
              onClick={() => updateAIService('custom', 'enabled', !settings.aiServices.custom.enabled)}
              className={cn(
                'px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all',
                settings.aiServices.custom.enabled 
                  ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' 
                  : 'bg-muted text-muted-foreground border border-border'
              )}
            >
              {settings.aiServices.custom.enabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Base URL</label>
              <input
                type="text"
                value={settings.aiServices.custom.baseUrl}
                onChange={(e) => updateAIService('custom', 'baseUrl', e.target.value)}
                placeholder="https://localhost:8080/v1"
                className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:ring-1 focus:ring-primary outline-none text-sm transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">API Key</label>
              <input
                type="password"
                value={settings.aiServices.custom.apiKey}
                onChange={(e) => updateAIService('custom', 'apiKey', e.target.value)}
                placeholder="optional"
                className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:ring-1 focus:ring-primary outline-none text-sm transition-all"
              />
            </div>
          </div>
        </div>

        {/* Coming Soon providers */}
        <div className="flex flex-wrap gap-2 pt-2 opacity-50">
          {['Anthropic', 'Gemini', 'Mistral', 'Perplexity'].map(p => (
            <div key={p} className="px-3 py-1 rounded-lg border border-border bg-muted/10 text-[10px] font-medium grayscale">
              {p} (Coming Soon)
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function AdvancedSettings({ settings, updateSettings }: SettingsPageProps) {
  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Code className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Advanced</h3>
          <p className="text-xs text-muted-foreground">Developer options</p>
        </div>
      </div>

      <div className="space-y-4">
        <ToggleSetting
          icon={<Code className="w-4 h-4" />}
          title="Debug Mode"
          description="Enable developer debugging features"
          checked={settings.debugMode}
          onChange={(v) => updateSettings('debugMode', v)}
        />

        <div className="p-4 rounded-lg bg-muted/30">
          <label className="text-sm font-medium mb-3 block">Log Level</label>
          <div className="grid grid-cols-4 gap-2">
            {(['error', 'warn', 'info', 'debug'] as const).map((level) => (
              <button
                key={level}
                onClick={() => updateSettings('logLevel', level)}
                className={cn(
                  'px-3 py-2 rounded-lg border text-sm transition-all',
                  settings.logLevel === level
                    ? 'border-primary bg-primary/10 font-medium'
                    : 'border-border hover:border-primary/50'
                )}
              >
                {level.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function VariablesSettings({ settings, updateSettings }: SettingsPageProps) {
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});

  const addVariable = () => {
    const newVar = {
      id: crypto.randomUUID(),
      key: '',
      value: '',
      isSecret: false,
    };
    updateSettings('environmentVariables', [...(settings.environmentVariables || []), newVar]);
  };

  const removeVariable = (id: string) => {
    updateSettings('environmentVariables', settings.environmentVariables.filter(v => v.id !== id));
  };

  const updateVariable = (id: string, field: string, value: any) => {
    updateSettings('environmentVariables', settings.environmentVariables.map(v => 
      v.id === id ? { ...v, [field]: value } : v
    ));
  };

  const toggleValueVisibility = (id: string) => {
    setShowValues(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Key className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Variables & Secrets</h3>
            <p className="text-xs text-muted-foreground">Global variables for your workflows</p>
          </div>
        </div>
        <button
          onClick={addVariable}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold uppercase transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Variable
        </button>
      </div>

      <div className="space-y-4">
        {!settings.environmentVariables || settings.environmentVariables.length === 0 ? (
          <div className="p-8 border border-dashed border-border rounded-xl bg-muted/20 text-center">
            <List className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No variables defined yet.</p>
            <p className="text-xs text-muted-foreground/50 mt-1">Variables can be used in nodes using {"{{VARIABLE_NAME}}"}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {settings.environmentVariables.map((variable) => (
              <div key={variable.id} className="p-4 rounded-xl border border-border bg-muted/20 space-y-4 group">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">KEY</label>
                    <input
                      type="text"
                      value={variable.key}
                      onChange={(e) => updateVariable(variable.id, 'key', e.target.value)}
                      placeholder="MY_API_KEY"
                      className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:ring-1 focus:ring-primary outline-none text-sm font-mono transition-all"
                    />
                  </div>
                  <div className="pt-5">
                    <button
                      onClick={() => removeVariable(variable.id)}
                      className="p-2 text-muted-foreground hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">VALUE</label>
                      <button 
                        onClick={() => updateVariable(variable.id, 'isSecret', !variable.isSecret)}
                        className={cn(
                          "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border transition-all",
                          variable.isSecret 
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20" 
                            : "bg-muted text-muted-foreground border-border"
                        )}
                      >
                        {variable.isSecret ? '🔒 Secret' : '📄 Public'}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={variable.isSecret && !showValues[variable.id] ? "password" : "text"}
                        value={variable.value}
                        onChange={(e) => updateVariable(variable.id, 'value', e.target.value)}
                        placeholder="Value..."
                        className="w-full px-3 py-2 pr-10 rounded-lg bg-background border border-border focus:ring-1 focus:ring-primary outline-none text-sm transition-all"
                      />
                      {variable.isSecret && (
                        <button
                          onClick={() => toggleValueVisibility(variable.id)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showValues[variable.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 p-4 rounded-lg bg-primary/5 border border-primary/10">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-semibold">Usage Tip</p>
            <p className="text-xs text-muted-foreground">
              You can reference these variables anywhere in your workflow using double curly braces, 
              for example: <code className="bg-muted px-1 rounded text-primary">{"{{MY_VARIABLE}}"}</code>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

interface ToggleSettingProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleSetting({ icon, title, description, checked, onChange }: ToggleSettingProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center',
          checked ? 'bg-primary/20' : 'bg-muted'
        )}>
          <span className={checked ? 'text-primary' : 'text-muted-foreground'}>{icon}</span>
        </div>
        <div>
          <div className="text-sm font-medium">{title}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-11 h-6 rounded-full transition-all',
          checked ? 'bg-primary hover:shadow-lg hover:shadow-primary/30' : 'bg-muted hover:shadow-lg'
        )}
      >
        <div className={cn(
          'absolute top-0.5 w-5 h-5 rounded-full shadow-md transition-transform',
          checked ? 'right-0.5 bg-primary-foreground' : 'left-0.5 bg-background'
        )} />
      </button>
    </div>
  );
}


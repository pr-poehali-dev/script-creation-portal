import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Script {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  type?: 'custom' | 'xeno-cheat';
}

interface XenoCheatConfig {
  cheatName: string;
  author: string;
  version: string;
  features: string[];
  keybinds: { action: string; key: string }[];
}

const Index = () => {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [currentScript, setCurrentScript] = useState('');
  const [scriptTitle, setScriptTitle] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [showXenoGenerator, setShowXenoGenerator] = useState(false);
  const [showLoadstringGenerator, setShowLoadstringGenerator] = useState(false);
  const [loadstringUrl, setLoadstringUrl] = useState('');
  const [loadstringWarning, setLoadstringWarning] = useState(true);
  const [xenoConfig, setXenoConfig] = useState<XenoCheatConfig>({
    cheatName: '',
    author: '',
    version: '1.0',
    features: [],
    keybinds: []
  });
  const [newFeature, setNewFeature] = useState('');
  const [newKeybind, setNewKeybind] = useState({ action: '', key: '' });
  const { toast } = useToast();

  const saveScript = () => {
    if (!scriptTitle.trim() || !currentScript.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Заполните название и содержание скрипта',
        variant: 'destructive',
      });
      return;
    }

    const newScript: Script = {
      id: Date.now().toString(),
      title: scriptTitle,
      content: currentScript,
      createdAt: new Date(),
    };

    setScripts([newScript, ...scripts]);
    setScriptTitle('');
    setCurrentScript('');
    toast({
      title: 'Сохранено',
      description: 'Скрипт успешно сохранён',
    });
  };

  const exportScript = (format: 'json' | 'txt' | 'js') => {
    if (!currentScript.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Нечего экспортировать',
        variant: 'destructive',
      });
      return;
    }

    let content = '';
    let filename = '';
    let mimeType = '';

    switch (format) {
      case 'json':
        content = JSON.stringify({ title: scriptTitle || 'Untitled', content: currentScript }, null, 2);
        filename = `${scriptTitle || 'script'}.json`;
        mimeType = 'application/json';
        break;
      case 'txt':
        content = currentScript;
        filename = `${scriptTitle || 'script'}.txt`;
        mimeType = 'text/plain';
        break;
      case 'js':
        content = currentScript;
        filename = `${scriptTitle || 'script'}.js`;
        mimeType = 'text/javascript';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Экспортировано',
      description: `Файл ${filename} скачан`,
    });
  };

  const loadScript = (script: Script) => {
    setScriptTitle(script.title);
    setCurrentScript(script.content);
    setActiveTab('editor');
  };

  const deleteScript = (id: string) => {
    setScripts(scripts.filter(s => s.id !== id));
    toast({
      title: 'Удалено',
      description: 'Скрипт удалён',
    });
  };

  const generateXenoCheat = () => {
    if (!xenoConfig.cheatName || !xenoConfig.author) {
      toast({
        title: 'Ошибка',
        description: 'Заполните название чита и автора',
        variant: 'destructive',
      });
      return;
    }

    const cheatScript = `-- Xeno Cheat Script
-- Name: ${xenoConfig.cheatName}
-- Author: ${xenoConfig.author}
-- Version: ${xenoConfig.version}

local ${xenoConfig.cheatName.replace(/\s+/g, '')} = {}
${xenoConfig.cheatName.replace(/\s+/g, '')}.Config = {
    Enabled = true,
    Version = "${xenoConfig.version}",
    Author = "${xenoConfig.author}"
}

-- Features
${xenoConfig.features.map((feature, idx) => `${xenoConfig.cheatName.replace(/\s+/g, '')}.${feature.replace(/\s+/g, '')} = function()
    print("[${xenoConfig.cheatName}] ${feature} activated")
    -- Add your ${feature} code here
end`).join('\n\n')}

-- Keybinds
local UserInputService = game:GetService("UserInputService")

UserInputService.InputBegan:Connect(function(input, gameProcessed)
    if gameProcessed then return end
    
${xenoConfig.keybinds.map(kb => `    if input.KeyCode == Enum.KeyCode.${kb.key} then
        ${xenoConfig.cheatName.replace(/\s+/g, '')}.${kb.action.replace(/\s+/g, '')}()
    end`).join('\n')}
end)

-- Initialize
print("[${xenoConfig.cheatName}] Loaded successfully!")
print("[${xenoConfig.cheatName}] Version: ${xenoConfig.version}")
print("[${xenoConfig.cheatName}] Author: ${xenoConfig.author}")

return ${xenoConfig.cheatName.replace(/\s+/g, '')}`;

    setScriptTitle(xenoConfig.cheatName);
    setCurrentScript(cheatScript);
    setShowXenoGenerator(false);
    setActiveTab('editor');
    
    toast({
      title: 'Чит создан!',
      description: `Скрипт ${xenoConfig.cheatName} готов к редактированию`,
    });
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setXenoConfig(prev => ({
        ...prev,
        features: [...prev.features, newFeature]
      }));
      setNewFeature('');
    }
  };

  const addKeybind = () => {
    if (newKeybind.action.trim() && newKeybind.key.trim()) {
      setXenoConfig(prev => ({
        ...prev,
        keybinds: [...prev.keybinds, newKeybind]
      }));
      setNewKeybind({ action: '', key: '' });
    }
  };

  const removeFeature = (index: number) => {
    setXenoConfig(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const removeKeybind = (index: number) => {
    setXenoConfig(prev => ({
      ...prev,
      keybinds: prev.keybinds.filter((_, i) => i !== index)
    }));
  };

  const loadXenoTemplate = (template: string) => {
    const templates: Record<string, Partial<XenoCheatConfig>> = {
      'esp': {
        cheatName: 'ESP Cheat',
        features: ['EnableESP', 'ShowNames', 'ShowDistance', 'ShowHealth'],
        keybinds: [{ action: 'EnableESP', key: 'E' }]
      },
      'speed': {
        cheatName: 'Speed Hack',
        features: ['IncreaseSpeed', 'ResetSpeed', 'FlyMode'],
        keybinds: [
          { action: 'IncreaseSpeed', key: 'Q' },
          { action: 'FlyMode', key: 'F' }
        ]
      },
      'teleport': {
        cheatName: 'Teleport Hack',
        features: ['TeleportToPlayer', 'SavePosition', 'LoadPosition'],
        keybinds: [
          { action: 'SavePosition', key: 'P' },
          { action: 'LoadPosition', key: 'L' }
        ]
      }
    };

    const selectedTemplate = templates[template];
    if (selectedTemplate) {
      setXenoConfig(prev => ({
        ...prev,
        ...selectedTemplate
      }));
    }
  };

  const generateLoadstringScript = () => {
    if (!loadstringUrl.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите URL скрипта',
        variant: 'destructive',
      });
      return;
    }

    const warningComment = loadstringWarning 
      ? `--[[
	WARNING: Heads up! This script has not been verified by ScriptBlox. Use at your own risk!
]]
` 
      : '';

    const loadstringScript = `${warningComment}loadstring(game:HttpGet("${loadstringUrl}"))()`;

    setScriptTitle('Loadstring Script');
    setCurrentScript(loadstringScript);
    setShowLoadstringGenerator(false);
    setActiveTab('editor');
    
    toast({
      title: 'Скрипт создан!',
      description: 'Loadstring скрипт готов к использованию',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary font-sans">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan to-primary rounded-lg flex items-center justify-center animate-glow">
                  <Icon name="Braces" className="text-primary-foreground" size={24} />
                </div>
                <h1 className="text-2xl font-bold font-mono bg-gradient-to-r from-cyan to-primary bg-clip-text text-transparent">
                  CODE SCRIPT BUILDER
                </h1>
              </div>
              <div className="flex gap-3 items-center">
                <Button
                  onClick={() => setShowLoadstringGenerator(true)}
                  className="bg-gradient-to-r from-primary to-cyan hover:from-primary/90 hover:to-cyan/90 text-primary-foreground"
                  size="sm"
                >
                  <Icon name="Link" size={18} className="mr-2" />
                  Loadstring
                </Button>
                <Button
                  onClick={() => setShowXenoGenerator(true)}
                  className="bg-gradient-to-r from-accent to-orange hover:from-accent/90 hover:to-orange/90 text-primary-foreground"
                  size="sm"
                >
                  <Icon name="Zap" size={18} className="mr-2" />
                  Чит Xeno
                </Button>
                <TabsList className="bg-secondary/80 backdrop-blur-sm">
                  <TabsTrigger value="home" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Icon name="Home" size={18} className="mr-2" />
                    Главная
                  </TabsTrigger>
                  <TabsTrigger value="editor" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Icon name="Code" size={18} className="mr-2" />
                    Редактор
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
          </div>
        </div>

        <TabsContent value="home" className="container mx-auto px-4 py-12 animate-fade-in">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-block mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan via-primary to-accent rounded-2xl flex items-center justify-center animate-glow">
                  <Icon name="Terminal" className="text-background" size={40} />
                </div>
              </div>
              <h2 className="text-5xl font-bold mb-4 font-mono bg-gradient-to-r from-cyan via-primary to-accent bg-clip-text text-transparent">
                Создавайте скрипты легко
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Мощный редактор для написания, сохранения и экспорта скриптов в различных форматах
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="p-6 bg-card/80 backdrop-blur-sm border-border hover:border-primary transition-all hover:shadow-lg hover:shadow-primary/20">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <Icon name="FileCode" className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2 font-mono">Редактор кода</h3>
                <p className="text-muted-foreground">
                  Удобный текстовый редактор для написания скриптов с подсветкой синтаксиса
                </p>
              </Card>

              <Card className="p-6 bg-card/80 backdrop-blur-sm border-border hover:border-accent transition-all hover:shadow-lg hover:shadow-accent/20">
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4">
                  <Icon name="Save" className="text-accent" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2 font-mono">Сохранение</h3>
                <p className="text-muted-foreground">
                  Сохраняйте ваши скрипты локально и возвращайтесь к ним в любое время
                </p>
              </Card>

              <Card className="p-6 bg-card/80 backdrop-blur-sm border-border hover:border-primary transition-all hover:shadow-lg hover:shadow-primary/20">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <Icon name="Download" className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2 font-mono">Экспорт</h3>
                <p className="text-muted-foreground">
                  Экспортируйте скрипты в JSON, TXT или JS форматах одним кликом
                </p>
              </Card>
            </div>

            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold font-mono">Сохранённые скрипты</h3>
                {scripts.length > 0 && (
                  <span className="text-muted-foreground">{scripts.length} скриптов</span>
                )}
              </div>

              {scripts.length === 0 ? (
                <Card className="p-12 bg-card/50 backdrop-blur-sm border-dashed border-2 border-border text-center">
                  <Icon name="FileQuestion" className="mx-auto mb-4 text-muted-foreground" size={48} />
                  <p className="text-muted-foreground text-lg mb-4">Пока нет сохранённых скриптов</p>
                  <Button onClick={() => setActiveTab('editor')} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Icon name="Plus" size={18} className="mr-2" />
                    Создать первый скрипт
                  </Button>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scripts.map((script) => (
                    <Card
                      key={script.id}
                      className="p-4 bg-card/80 backdrop-blur-sm border-border hover:border-primary transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-mono font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                            {script.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {script.createdAt.toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteScript(script.id);
                          }}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                      <div className="bg-background/50 rounded p-3 mb-3 font-mono text-xs text-muted-foreground overflow-hidden">
                        <pre className="line-clamp-3">{script.content}</pre>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => loadScript(script)}
                        className="w-full bg-primary/20 hover:bg-primary text-primary hover:text-primary-foreground"
                      >
                        <Icon name="Edit" size={16} className="mr-2" />
                        Открыть
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="editor" className="container mx-auto px-4 py-8 animate-fade-in">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
                  <div className="mb-4">
                    <label className="text-sm font-medium mb-2 block font-mono text-primary">
                      Название скрипта
                    </label>
                    <Input
                      value={scriptTitle}
                      onChange={(e) => setScriptTitle(e.target.value)}
                      placeholder="Введите название..."
                      className="bg-background/50 border-border font-mono"
                    />
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium font-mono text-primary">
                        Код скрипта
                      </label>
                      <div className="flex gap-2">
                        <span className="text-xs text-muted-foreground font-mono">
                          {currentScript.length} символов
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <Textarea
                        value={currentScript}
                        onChange={(e) => setCurrentScript(e.target.value)}
                        placeholder="// Начните писать ваш код здесь..."
                        className="min-h-[500px] bg-background/50 border-border font-mono text-sm resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={saveScript}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <Icon name="Save" size={18} className="mr-2" />
                      Сохранить
                    </Button>
                    <Button
                      onClick={() => {
                        setScriptTitle('');
                        setCurrentScript('');
                      }}
                      variant="outline"
                      className="border-border hover:bg-secondary"
                    >
                      <Icon name="X" size={18} className="mr-2" />
                      Очистить
                    </Button>
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
                  <h3 className="font-semibold mb-4 font-mono flex items-center">
                    <Icon name="Download" size={18} className="mr-2 text-accent" />
                    Экспорт
                  </h3>
                  <div className="space-y-2">
                    <Button
                      onClick={() => exportScript('json')}
                      variant="outline"
                      className="w-full justify-start border-border hover:bg-primary/10 hover:border-primary"
                    >
                      <Icon name="FileJson" size={18} className="mr-2" />
                      Экспорт в JSON
                    </Button>
                    <Button
                      onClick={() => exportScript('txt')}
                      variant="outline"
                      className="w-full justify-start border-border hover:bg-primary/10 hover:border-primary"
                    >
                      <Icon name="FileText" size={18} className="mr-2" />
                      Экспорт в TXT
                    </Button>
                    <Button
                      onClick={() => exportScript('js')}
                      variant="outline"
                      className="w-full justify-start border-border hover:bg-primary/10 hover:border-primary"
                    >
                      <Icon name="FileCode" size={18} className="mr-2" />
                      Экспорт в JS
                    </Button>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm border-primary/50">
                  <Icon name="Lightbulb" size={24} className="mb-3 text-accent" />
                  <h3 className="font-semibold mb-2 font-mono">Совет</h3>
                  <p className="text-sm text-muted-foreground">
                    Используйте JetBrains Mono для комфортной работы с кодом. Все символы отлично различимы!
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {showLoadstringGenerator && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full bg-card border-primary/50 animate-fade-in">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-cyan rounded-lg flex items-center justify-center">
                    <Icon name="Link" className="text-background" size={24} />
                  </div>
                  <h2 className="text-2xl font-bold font-mono bg-gradient-to-r from-primary to-cyan bg-clip-text text-transparent">
                    Loadstring Генератор
                  </h2>
                </div>
                <Button
                  onClick={() => setShowLoadstringGenerator(false)}
                  variant="ghost"
                  size="sm"
                >
                  <Icon name="X" size={20} />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block font-mono text-primary">
                    URL скрипта *
                  </label>
                  <Input
                    value={loadstringUrl}
                    onChange={(e) => setLoadstringUrl(e.target.value)}
                    placeholder="https://raw.githubusercontent.com/user/repo/main/script.lua"
                    className="bg-background/50 border-border font-mono"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Введите прямую ссылку на raw-файл скрипта
                  </p>
                </div>

                <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg border border-primary/30">
                  <input
                    type="checkbox"
                    checked={loadstringWarning}
                    onChange={(e) => setLoadstringWarning(e.target.checked)}
                    className="w-4 h-4 accent-primary"
                    id="warning-check"
                  />
                  <label htmlFor="warning-check" className="text-sm cursor-pointer">
                    Добавить предупреждение ScriptBlox
                  </label>
                </div>

                {loadstringUrl && (
                  <div className="bg-background/50 rounded-lg p-4 border border-border">
                    <p className="text-xs text-muted-foreground mb-2 font-mono">Предпросмотр:</p>
                    <pre className="font-mono text-sm text-foreground whitespace-pre-wrap break-all">
                      {loadstringWarning && `--[[
	WARNING: Heads up! This script has not been verified by ScriptBlox. Use at your own risk!
]]
`}loadstring(game:HttpGet("{loadstringUrl}"))()
                    </pre>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={generateLoadstringScript}
                    className="flex-1 bg-gradient-to-r from-primary to-cyan hover:from-primary/90 hover:to-cyan/90 text-primary-foreground"
                  >
                    <Icon name="Sparkles" size={18} className="mr-2" />
                    Сгенерировать
                  </Button>
                  <Button
                    onClick={() => setShowLoadstringGenerator(false)}
                    variant="outline"
                    className="border-border"
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {showXenoGenerator && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto bg-card border-primary/50 animate-fade-in">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent to-orange rounded-lg flex items-center justify-center">
                    <Icon name="Zap" className="text-background" size={24} />
                  </div>
                  <h2 className="text-2xl font-bold font-mono bg-gradient-to-r from-accent to-orange bg-clip-text text-transparent">
                    Генератор Xeno Читов
                  </h2>
                </div>
                <Button
                  onClick={() => setShowXenoGenerator(false)}
                  variant="ghost"
                  size="sm"
                >
                  <Icon name="X" size={20} />
                </Button>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-3 p-4 bg-accent/10 rounded-lg border border-accent/30">
                  <Button
                    onClick={() => loadXenoTemplate('esp')}
                    variant="outline"
                    className="border-accent/50 hover:bg-accent/20"
                  >
                    <Icon name="Eye" size={18} className="mr-2" />
                    ESP Template
                  </Button>
                  <Button
                    onClick={() => loadXenoTemplate('speed')}
                    variant="outline"
                    className="border-accent/50 hover:bg-accent/20"
                  >
                    <Icon name="Gauge" size={18} className="mr-2" />
                    Speed Template
                  </Button>
                  <Button
                    onClick={() => loadXenoTemplate('teleport')}
                    variant="outline"
                    className="border-accent/50 hover:bg-accent/20"
                  >
                    <Icon name="MapPin" size={18} className="mr-2" />
                    Teleport Template
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block font-mono text-primary">
                      Название чита *
                    </label>
                    <Input
                      value={xenoConfig.cheatName}
                      onChange={(e) => setXenoConfig(prev => ({ ...prev, cheatName: e.target.value }))}
                      placeholder="Mega Speed Hack"
                      className="bg-background/50 border-border font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block font-mono text-primary">
                      Автор *
                    </label>
                    <Input
                      value={xenoConfig.author}
                      onChange={(e) => setXenoConfig(prev => ({ ...prev, author: e.target.value }))}
                      placeholder="YourName"
                      className="bg-background/50 border-border font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block font-mono text-primary">
                    Версия
                  </label>
                  <Input
                    value={xenoConfig.version}
                    onChange={(e) => setXenoConfig(prev => ({ ...prev, version: e.target.value }))}
                    placeholder="1.0"
                    className="bg-background/50 border-border font-mono"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block font-mono text-accent">
                    Функции чита
                  </label>
                  <div className="flex gap-2 mb-3">
                    <Input
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                      placeholder="SpeedBoost, WallHack..."
                      className="bg-background/50 border-border font-mono"
                    />
                    <Button onClick={addFeature} size="sm" className="bg-accent hover:bg-accent/90">
                      <Icon name="Plus" size={18} />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {xenoConfig.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-accent/20 px-3 py-1 rounded-md border border-accent/30">
                        <span className="font-mono text-sm">{feature}</span>
                        <button onClick={() => removeFeature(idx)} className="text-accent hover:text-accent/70">
                          <Icon name="X" size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block font-mono text-accent">
                    Клавиши управления
                  </label>
                  <div className="grid grid-cols-[1fr,auto,auto] gap-2 mb-3">
                    <Input
                      value={newKeybind.action}
                      onChange={(e) => setNewKeybind(prev => ({ ...prev, action: e.target.value }))}
                      placeholder="Действие"
                      className="bg-background/50 border-border font-mono"
                    />
                    <Input
                      value={newKeybind.key}
                      onChange={(e) => setNewKeybind(prev => ({ ...prev, key: e.target.value.toUpperCase() }))}
                      placeholder="Q"
                      className="bg-background/50 border-border font-mono w-20"
                      maxLength={1}
                    />
                    <Button onClick={addKeybind} size="sm" className="bg-accent hover:bg-accent/90">
                      <Icon name="Plus" size={18} />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {xenoConfig.keybinds.map((kb, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-accent/20 px-3 py-2 rounded-md border border-accent/30">
                        <span className="font-mono text-sm">{kb.action}</span>
                        <div className="flex items-center gap-2">
                          <kbd className="px-2 py-1 bg-background rounded font-mono text-xs">{kb.key}</kbd>
                          <button onClick={() => removeKeybind(idx)} className="text-accent hover:text-accent/70">
                            <Icon name="Trash2" size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={generateXenoCheat}
                    className="flex-1 bg-gradient-to-r from-accent to-orange hover:from-accent/90 hover:to-orange/90 text-primary-foreground"
                  >
                    <Icon name="Sparkles" size={18} className="mr-2" />
                    Сгенерировать чит
                  </Button>
                  <Button
                    onClick={() => setShowXenoGenerator(false)}
                    variant="outline"
                    className="border-border"
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Index;
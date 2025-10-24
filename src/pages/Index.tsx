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
}

const Index = () => {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [currentScript, setCurrentScript] = useState('');
  const [scriptTitle, setScriptTitle] = useState('');
  const [activeTab, setActiveTab] = useState('home');
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
    </div>
  );
};

export default Index;

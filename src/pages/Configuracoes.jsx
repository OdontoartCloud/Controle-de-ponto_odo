
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { 
  Save, 
  RotateCcw, 
  Clock, 
  Palette,
  Timer,
  AlertTriangle,
  Wrench
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { StatusColors, TimeRecordStatus } from '@/types';

const Configuracoes = () => {
  const initialTimeSettings = {
    [TimeRecordStatus.ON_TIME]: 5,
    [TimeRecordStatus.LATE]: 5,
    [TimeRecordStatus.EARLY]: 5,
    [TimeRecordStatus.ADJUSTED]: 5
  };
  
  const [timeSettings, setTimeSettings] = useState(initialTimeSettings);
  const [statusColors, setStatusColors] = useState(StatusColors);
  const { toast } = useToast();

  const normalizeTimeSettings = (settings = {}) => {
    const baseTolerance = Number.isFinite(settings?.toleranceMinutes)
      ? settings.toleranceMinutes
      : 5;

    return {
      [TimeRecordStatus.ON_TIME]: Number.isFinite(settings?.[TimeRecordStatus.ON_TIME])
        ? settings[TimeRecordStatus.ON_TIME]
        : baseTolerance,
      [TimeRecordStatus.LATE]: Number.isFinite(settings?.[TimeRecordStatus.LATE])
        ? settings[TimeRecordStatus.LATE]
        : baseTolerance,
      [TimeRecordStatus.EARLY]: Number.isFinite(settings?.[TimeRecordStatus.EARLY])
        ? settings[TimeRecordStatus.EARLY]
        : baseTolerance,
      [TimeRecordStatus.ADJUSTED]: Number.isFinite(settings?.[TimeRecordStatus.ADJUSTED])
        ? settings[TimeRecordStatus.ADJUSTED]
        : baseTolerance
    };
  };

  useEffect(() => {
    const savedConfig = localStorage.getItem('timeControlConfig');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      if (config.timeSettings) setTimeSettings(normalizeTimeSettings(config.timeSettings));
      if (config.statusColors) setStatusColors(config.statusColors);
    }
  }, []);

  const colorOptions = [
    { value: '#22c55e', label: 'Verde' },
    { value: '#ef4444', label: 'Vermelho' },
    { value: '#3b82f6', label: 'Azul' },
    { value: '#f59e0b', label: 'Amarelo' },
    { value: '#8b5cf6', label: 'Roxo' },
    { value: '#06b6d4', label: 'Ciano' },
    { value: '#f97316', label: 'Laranja' },
    { value: '#84cc16', label: 'Lima' },
    { value: '#ffffff', label: 'Branco' }
  ];

  const handleTimeChange = (status, value) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 0) return;

    setTimeSettings((prev) => ({
      ...prev,
      [status]: numValue
    }));
  };
  
  const handleSave = () => {
    const config = { timeSettings, statusColors };
    localStorage.setItem('timeControlConfig', JSON.stringify(config));
    
    toast({
      title: "Configurações salvas",
      description: "As novas regras e cores foram salvas com sucesso.",
    });
  };

  const handleReset = () => {
    setTimeSettings(initialTimeSettings);
    setStatusColors(StatusColors);
    localStorage.removeItem('timeControlConfig');
    
    toast({
      title: "Configurações resetadas",
      description: "As configurações foram restauradas para os valores padrão.",
    });
  };

  const handleColorChange = (status, color) => {
    setStatusColors(prev => ({
      ...prev,
      [status]: color
    }));
  };

  const toleranceOptions = Array.from({ length: 61 }, (_, i) => i); // 0 to 60 minutes
  const onTimeTolerance = timeSettings?.[TimeRecordStatus.ON_TIME] ?? 5;
  const lateTolerance = timeSettings?.[TimeRecordStatus.LATE] ?? 5;
  const earlyTolerance = timeSettings?.[TimeRecordStatus.EARLY] ?? 5;
  const adjustedTolerance = timeSettings?.[TimeRecordStatus.ADJUSTED] ?? 5;

  const TimeSettingInput = ({ label, icon: Icon, description, statusKey }) => {
    const selectedValue = Number.isFinite(timeSettings?.[statusKey])
      ? timeSettings[statusKey]
      : 5;

    return (
      <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-900 dark:border dark:border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          <h4 className="font-medium text-gray-900 dark:text-gray-100">{label}</h4>
        </div>
        <div className="space-y-1">
          <Label htmlFor={`tolerance-${statusKey}`} className="text-sm text-gray-700 dark:text-gray-200">Tolerância (minutos)</Label>
          <Select 
              value={String(selectedValue)}
              onValueChange={(value) => handleTimeChange(statusKey, value)}
          >
            <SelectTrigger id={`tolerance-${statusKey}`}>
              <SelectValue placeholder="Selecione os minutos..." />
            </SelectTrigger>
            <SelectContent>
              {toleranceOptions.map(min => (
                <SelectItem key={min} value={String(min)}>{min} min</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-gray-500 mt-2 dark:text-gray-400">{description}</p>
      </div>
    );
  };

  const ColorPicker = ({ status, currentColor, label }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</Label>
      <Select value={currentColor} onValueChange={(color) => handleColorChange(status, color)}>
        <SelectTrigger>
          <SelectValue>
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: currentColor }}
              />
              <span>{colorOptions.find(c => c.value === currentColor)?.label || 'Personalizada'}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {colorOptions.map((color) => (
            <SelectItem key={color.value} value={color.value}>
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: color.value }}
                />
                <span>{color.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Configurações - Controle de Ponto</title>
        <meta name="description" content="Configure regras de tolerância e cores de status para o sistema de controle de ponto." />
      </Helmet>

      <Layout>
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Configurações</h1>
            <p className="text-gray-600 mt-2 dark:text-gray-400">
              Ajuste as regras de tolerância de tempo e a aparência do sistema.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary-500" />
                    Regras de Horário
                  </CardTitle>
                  <CardDescription>
                    Defina a tolerância em minutos para cada status de registro.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <TimeSettingInput 
                    label="Tolerância de No Horário" 
                    icon={Clock}
                    description="Margem em minutos para considerar o registro dentro do horário."
                    statusKey={TimeRecordStatus.ON_TIME}
                  />
                  <TimeSettingInput 
                    label="Tolerância de Atraso" 
                    icon={AlertTriangle}
                    description="Minutos após o horário previsto para considerar o registro atrasado."
                    statusKey={TimeRecordStatus.LATE}
                  />
                  <TimeSettingInput 
                    label="Tolerância de Antecipação" 
                    icon={Timer}
                    description="Minutos antes do horário previsto para considerar o registro antecipado."
                    statusKey={TimeRecordStatus.EARLY}
                  />
                  <TimeSettingInput 
                    label="Tolerância de Ajuste" 
                    icon={Wrench}
                    description="Valor de referência para registros ajustados manualmente."
                    statusKey={TimeRecordStatus.ADJUSTED}
                  />
                  
                  <div className="p-4 bg-blue-50 rounded-lg dark:bg-gray-900 dark:border dark:border-gray-800">
                    <h4 className="font-medium text-blue-900 mb-2 dark:text-gray-100">Como funciona:</h4>
                    <ul className="text-sm text-blue-800 space-y-1 dark:text-gray-200">
                      <li>• <strong>No Horário:</strong> Até {onTimeTolerance} min de diferença do horário</li>
                      <li>• <strong>Atrasado:</strong> Mais de {lateTolerance} min após o horário</li>
                      <li>• <strong>Antecipado:</strong> Mais de {earlyTolerance} min antes do horário</li>
                      <li>• <strong>Ajustado:</strong> Registros marcados com * (referência: {adjustedTolerance} min)</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-secondary-500" />
                    Cores dos Status
                  </CardTitle>
                  <CardDescription>
                    Personalize as cores para cada status de ponto.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <ColorPicker status={TimeRecordStatus.ON_TIME} currentColor={statusColors[TimeRecordStatus.ON_TIME]} label="No Horário" />
                  <ColorPicker status={TimeRecordStatus.LATE} currentColor={statusColors[TimeRecordStatus.LATE]} label="Atrasado" />
                  <ColorPicker status={TimeRecordStatus.EARLY} currentColor={statusColors[TimeRecordStatus.EARLY]} label="Antecipado" />
                  <ColorPicker status={TimeRecordStatus.ADJUSTED} currentColor={statusColors[TimeRecordStatus.ADJUSTED]} label="Ajustado" />

                  <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-900 dark:border dark:border-gray-800">
                    <h4 className="font-medium text-gray-900 mb-3 dark:text-gray-100">Prévia das cores:</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(statusColors).map(([status, color]) => (
                        <div key={status} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: color }} />
                          <span className="text-xs text-gray-600 dark:text-gray-300">
                            {status === TimeRecordStatus.ON_TIME ? 'No horário' : 
                             status === TimeRecordStatus.LATE ? 'Atrasado' :
                             status === TimeRecordStatus.EARLY ? 'Antecipado' : 'Ajustado'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-end gap-4"
          >
            <Button variant="outline" onClick={handleReset} className="flex items-center gap-2 justify-center">
              <RotateCcw className="w-4 h-4" />
              Resetar
            </Button>
            <Button onClick={handleSave} className="bg-primary-500 hover:bg-primary-600 text-white flex items-center gap-2 justify-center">
              <Save className="w-4 h-4" />
              Salvar Configurações
            </Button>
          </motion.div>
        </div>
      </Layout>
    </>
  );
};

export default Configuracoes;

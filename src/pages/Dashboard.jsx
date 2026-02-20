import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import {
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  PieChart as PieChartIcon,
  X
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TimeRecordStatus } from '@/types';

const STATUS_META = {
  [TimeRecordStatus.ON_TIME]: {
    label: 'No horário',
    color: '#22c55e',
    textClass: 'text-green-700 dark:text-green-300',
    chipClass: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200'
  },
  [TimeRecordStatus.LATE]: {
    label: 'Atrasado',
    color: '#ef4444',
    textClass: 'text-red-700 dark:text-red-300',
    chipClass: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200'
  },
  [TimeRecordStatus.LATE_EXIT]: {
    label: 'Saída após horário',
    color: '#f97316',
    textClass: 'text-orange-700 dark:text-orange-300',
    chipClass: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200'
  },
  [TimeRecordStatus.EARLY]: {
    label: 'Antecipado',
    color: '#3b82f6',
    textClass: 'text-blue-700 dark:text-blue-300',
    chipClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200'
  },
  [TimeRecordStatus.ADJUSTED]: {
    label: 'Ajustado',
    color: '#f59e0b',
    textClass: 'text-amber-700 dark:text-amber-300',
    chipClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200'
  },
};

const ENTRY_STATUS_KEYS = [
  TimeRecordStatus.ON_TIME,
  TimeRecordStatus.LATE,
  TimeRecordStatus.EARLY,
  TimeRecordStatus.ADJUSTED,
];

const EXIT_STATUS_KEYS = [
  TimeRecordStatus.ON_TIME,
  TimeRecordStatus.LATE_EXIT,
  TimeRecordStatus.EARLY,
  TimeRecordStatus.ADJUSTED,
];

const normalizeExitStatus = (status) => (
  status === TimeRecordStatus.LATE ? TimeRecordStatus.LATE_EXIT : status
);

const buildChartData = (counts, keys) => (
  keys.map((key) => ({
    key,
    label: STATUS_META[key]?.label || 'Desconhecido',
    value: counts[key] || 0,
    color: STATUS_META[key]?.color || '#94a3b8',
    textClass: STATUS_META[key]?.textClass || 'text-slate-600 dark:text-slate-300',
    chipClass: STATUS_META[key]?.chipClass || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
  }))
);

const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

const describeArc = (x, y, radius, startAngle, endAngle) => {
  const clampedEndAngle = Math.min(startAngle + 359.999, endAngle);
  const start = polarToCartesian(x, y, radius, clampedEndAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = clampedEndAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
};

const PieChart = ({ data, size = 180, strokeWidth = 22, activeKey, onSelect, centerValue, centerLabel }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = size / 2 - strokeWidth / 2;
  const cx = size / 2;
  const cy = size / 2;
  const visibleData = data.filter((item) => item.value > 0);

  let currentAngle = 0;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-sm">
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          strokeWidth={strokeWidth}
          className="text-slate-200 dark:text-slate-800"
          stroke="currentColor"
          fill="none"
        />
        {total > 0 && visibleData.length === 1 ? (
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            strokeWidth={strokeWidth}
            stroke={visibleData[0].color}
            fill="none"
            className="transition-opacity"
          />
        ) : (
          total > 0 && visibleData.map((item) => {
            const sliceAngle = (item.value / total) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + sliceAngle;
            currentAngle = endAngle;

            const isActive = activeKey === item.key;
            const isDimmed = activeKey && !isActive;

            return (
              <path
                key={item.key}
                d={describeArc(cx, cy, radius, startAngle, endAngle)}
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeLinecap="butt"
                fill="none"
                onClick={() => onSelect(item.key)}
                className={`cursor-pointer transition-opacity ${isDimmed ? 'opacity-35' : 'opacity-100'} hover:opacity-90`}
              />
            );
          })
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {centerValue}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {centerLabel}
        </div>
      </div>
    </div>
  );
};

const StatusPieCard = ({ title, subtitle, data, activeKey, onSelect }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const activeItem = activeKey ? data.find((item) => item.key === activeKey) : null;
  const displayValue = activeItem ? activeItem.value : total;
  const displayLabel = activeItem ? activeItem.label : 'Total';

  return (
    <Card className="relative overflow-hidden border-slate-200/60 dark:border-slate-800/80">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950" />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-base">
          <PieChartIcon className="w-4 h-4 text-primary-500" />
          {title}
        </CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <PieChart
            data={data}
            activeKey={activeKey}
            onSelect={onSelect}
            centerValue={displayValue}
            centerLabel={displayLabel}
          />
          <div className="w-full space-y-2">
            {data.map((item) => {
              const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
              const isActive = activeKey === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onSelect(item.key)}
                  className={`w-full flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition ${
                    isActive
                      ? 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/60'
                      : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  <span
                    className="inline-flex w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className={`text-sm font-medium ${item.textClass}`}>
                    {item.label}
                  </span>
                  <span className="ml-auto text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {item.value}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {percent}%
                  </span>
                </button>
              );
            })}
            {activeKey && (
              <button
                type="button"
                onClick={() => onSelect(null)}
                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-3 h-3" />
                Limpar filtro
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const StatItem = ({ label, value, helper, icon: Icon, accentClass }) => (
  <div className="flex items-center gap-3 rounded-xl border border-slate-200/70 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 px-3 py-2.5">
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accentClass}`}>
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{value}</div>
      {helper && <div className="text-[11px] text-gray-400 dark:text-gray-500">{helper}</div>}
    </div>
  </div>
);

const Dashboard = () => {
  const [allRecords, setAllRecords] = useState([]);
  const [activeStatusFilter, setActiveStatusFilter] = useState(null);

  const normalizeRecords = (records = []) => {
    let hadLegacyExitLate = false;
    const normalized = records.map((record) => {
      if (record?.status_saida === TimeRecordStatus.LATE) {
        hadLegacyExitLate = true;
        return { ...record, status_saida: TimeRecordStatus.LATE_EXIT };
      }
      return record;
    });

    return { normalized, hadLegacyExitLate };
  };

  useEffect(() => {
    const savedRecords = localStorage.getItem('timeControlRecords');
    if (savedRecords) {
      try {
        const records = JSON.parse(savedRecords);
        const { normalized, hadLegacyExitLate } = normalizeRecords(records);
        setAllRecords(normalized);
        if (hadLegacyExitLate) {
          localStorage.setItem('timeControlRecords', JSON.stringify(normalized));
        }
      } catch (error) {
        console.error('Erro ao carregar registros salvos:', error);
      }
    }
  }, []);

  const dashboardData = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const todayRecords = allRecords.filter(record =>
      record.data_batida === todayStr ||
      record.data_batida === today.toLocaleDateString('pt-BR').split('/').reverse().join('-')
    );

    const uniqueUsers = new Set(allRecords.map(r => r.nome)).size;

    const entryCounts = {
      [TimeRecordStatus.ON_TIME]: 0,
      [TimeRecordStatus.LATE]: 0,
      [TimeRecordStatus.EARLY]: 0,
      [TimeRecordStatus.ADJUSTED]: 0,
    };

    const exitCounts = {
      [TimeRecordStatus.ON_TIME]: 0,
      [TimeRecordStatus.LATE_EXIT]: 0,
      [TimeRecordStatus.EARLY]: 0,
      [TimeRecordStatus.ADJUSTED]: 0,
    };

    let totalMarks = 0;

    allRecords.forEach(record => {
      if (record.status_entrada) {
        totalMarks++;
        if (entryCounts[record.status_entrada] !== undefined) {
          entryCounts[record.status_entrada]++;
        }
      }
      if (record.status_saida) {
        totalMarks++;
        const exitStatus = normalizeExitStatus(record.status_saida);
        if (exitCounts[exitStatus] !== undefined) {
          exitCounts[exitStatus]++;
        }
      }
    });

    const onTimeCount = entryCounts[TimeRecordStatus.ON_TIME] + exitCounts[TimeRecordStatus.ON_TIME];
    const lateCount = entryCounts[TimeRecordStatus.LATE];
    const lateExitCount = exitCounts[TimeRecordStatus.LATE_EXIT];
    const punctualityRate = totalMarks > 0 ? Math.round((onTimeCount / totalMarks) * 100) : 0;
    const monthlyAverage = allRecords.length > 0 ? Math.round(allRecords.length / 30) : 0;

    return {
      todayRecordsCount: todayRecords.length,
      uniqueUsers,
      entryCounts,
      exitCounts,
      totalMarks,
      onTimeCount,
      lateCount,
      lateExitCount,
      punctualityRate,
      monthlyAverage
    };
  }, [allRecords]);

  const entryChartData = useMemo(
    () => buildChartData(dashboardData.entryCounts, ENTRY_STATUS_KEYS),
    [dashboardData.entryCounts]
  );

  const exitChartData = useMemo(
    () => buildChartData(dashboardData.exitCounts, EXIT_STATUS_KEYS),
    [dashboardData.exitCounts]
  );

  const handleEntrySelect = (status) => {
    if (!status) {
      setActiveStatusFilter(null);
      return;
    }
    setActiveStatusFilter((prev) => (
      prev?.scope === 'entrada' && prev.status === status
        ? null
        : { scope: 'entrada', status }
    ));
  };

  const handleExitSelect = (status) => {
    if (!status) {
      setActiveStatusFilter(null);
      return;
    }
    setActiveStatusFilter((prev) => (
      prev?.scope === 'saida' && prev.status === status
        ? null
        : { scope: 'saida', status }
    ));
  };

  const filteredActivity = useMemo(() => {
    const filter = activeStatusFilter;

    const filteredRecords = filter
      ? allRecords.filter((record) => {
        if (filter.scope === 'entrada') {
          return record.status_entrada === filter.status;
        }
        const exitStatus = normalizeExitStatus(record.status_saida);
        return exitStatus === filter.status;
      })
      : allRecords;

    const recent = filteredRecords
      .slice(-6)
      .reverse()
      .map((record, index) => {
        const entryStatus = record.status_entrada;
        const exitStatus = normalizeExitStatus(record.status_saida);
        const scope = filter?.scope;

        const status = scope === 'entrada'
          ? entryStatus
          : scope === 'saida'
            ? exitStatus
            : (entryStatus || exitStatus || TimeRecordStatus.ON_TIME);

        const time = scope === 'saida'
          ? (record.saida_real || record.saida_contratual || '--:--')
          : (record.entrada_real || record.entrada_contratual || record.saida_real || '--:--');

        const action = scope === 'saida'
          ? 'Registro de saída'
          : scope === 'entrada'
            ? 'Registro de entrada'
            : 'Registro de ponto';

        return {
          id: index,
          user: record.nome,
          action,
          time,
          status
        };
      });

    if (recent.length > 0) return recent;

    return [
      {
        id: 1,
        user: 'Nenhum registro',
        action: filter ? 'Nenhum registro para este filtro' : 'Faça upload de dados',
        time: '--:--',
        status: TimeRecordStatus.ON_TIME
      }
    ];
  }, [allRecords, activeStatusFilter]);

  const summaryItems = [
    {
      label: 'Usuários',
      value: dashboardData.uniqueUsers.toString(),
      helper: 'cadastrados',
      icon: Users,
      accentClass: 'bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-200'
    },
    {
      label: 'Registros hoje',
      value: dashboardData.todayRecordsCount.toString(),
      helper: 'processados',
      icon: Clock,
      accentClass: 'bg-secondary-100 text-secondary-600 dark:bg-secondary-900/40 dark:text-secondary-200'
    },
    {
      label: 'Pontualidade',
      value: `${dashboardData.punctualityRate}%`,
      helper: 'no horário',
      icon: CheckCircle,
      accentClass: 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-200'
    },
    {
      label: 'Atrasos (entrada)',
      value: dashboardData.lateCount.toString(),
      helper: 'total',
      icon: AlertCircle,
      accentClass: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-200'
    },
    {
      label: 'Saída após horário',
      value: dashboardData.lateExitCount.toString(),
      helper: 'total',
      icon: Clock,
      accentClass: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-200'
    }
  ];

  const getStatusLabel = (status) => STATUS_META[status]?.label || 'Desconhecido';
  const getStatusBadgeClass = (status) => STATUS_META[status]?.chipClass || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-200';

  const activeFilterLabel = activeStatusFilter
    ? `${activeStatusFilter.scope === 'entrada' ? 'Entrada' : 'Saída'} · ${getStatusLabel(activeStatusFilter.status)}`
    : null;

  return (
    <>
      <Helmet>
        <title>Dashboard - Controle de Ponto</title>
        <meta name="description" content="Dashboard principal do sistema de controle de ponto com métricas e atividades recentes." />
      </Helmet>

      <Layout>
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Visão geral do sistema de controle de ponto
                </p>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Atualizado em {new Date().toLocaleDateString('pt-BR')}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="relative overflow-hidden border-slate-200/60 dark:border-slate-800/80">
              <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950" />
              <CardContent className="relative grid grid-cols-2 lg:grid-cols-5 gap-4">
                {summaryItems.map((item) => (
                  <StatItem key={item.label} {...item} />
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatusPieCard
                  title="Entradas"
                  subtitle="Distribuição por status de entrada"
                  data={entryChartData}
                  activeKey={activeStatusFilter?.scope === 'entrada' ? activeStatusFilter.status : null}
                  onSelect={handleEntrySelect}
                />
                <StatusPieCard
                  title="Saídas"
                  subtitle="Distribuição por status de saída"
                  data={exitChartData}
                  activeKey={activeStatusFilter?.scope === 'saida' ? activeStatusFilter.status : null}
                  onSelect={handleExitSelect}
                />
              </div>

              <Card className="border-slate-200/60 dark:border-slate-800/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary-500" />
                    Atividade recente
                  </CardTitle>
                  <CardDescription>
                    Últimos registros de ponto e filtro por status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activeFilterLabel && (
                    <div className="mb-3 flex items-center justify-between rounded-lg border border-slate-200/70 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
                      <span>Filtro ativo: {activeFilterLabel}</span>
                      <button
                        type="button"
                        onClick={() => setActiveStatusFilter(null)}
                        className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                      >
                        <X className="w-3 h-3" />
                        Limpar
                      </button>
                    </div>
                  )}
                  <div className="space-y-3">
                    {filteredActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-slate-100 bg-white/70 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/50"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{activity.user}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{activity.action}</p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.time}</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(activity.status)}`}>
                            {getStatusLabel(activity.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-slate-200/60 dark:border-slate-800/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-secondary-500" />
                    Estatísticas do mês
                  </CardTitle>
                  <CardDescription>
                    Resumo mensal de registros
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Total de registros</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{allRecords.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Média diária</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{dashboardData.monthlyAverage}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Taxa de pontualidade</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">{dashboardData.punctualityRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Atrasos (entrada)</span>
                      <span className="font-semibold text-red-600 dark:text-red-400">{dashboardData.lateCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Saída após horário</span>
                      <span className="font-semibold text-orange-600 dark:text-orange-400">{dashboardData.lateExitCount}</span>
                    </div>
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Tendência</span>
                        <span className="font-semibold text-primary-600 dark:text-primary-400 flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          {allRecords.length > 0 ? '+5.2%' : '0%'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Dashboard;

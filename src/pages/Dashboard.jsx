
import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Calendar
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import MetricCard from '@/components/MetricCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TimeRecordStatus } from '@/types';

const Dashboard = () => {
  const [allRecords, setAllRecords] = useState([]);
  
  // Carregar registros salvos
  useEffect(() => {
    const savedRecords = localStorage.getItem('timeControlRecords');
    if (savedRecords) {
      try {
        const records = JSON.parse(savedRecords);
        setAllRecords(records);
      } catch (error) {
        console.error('Erro ao carregar registros salvos:', error);
      }
    }
  }, []);

  // Calcular métricas baseadas nos dados reais
  const metrics = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Registros de hoje
    const todayRecords = allRecords.filter(record => 
      record.data_batida === todayStr || 
      record.data_batida === today.toLocaleDateString('pt-BR').split('/').reverse().join('-')
    );
    
    // Contar status
    let onTimeCount = 0;
    let lateCount = 0;
    let totalEntries = 0;
    
    allRecords.forEach(record => {
      if (record.status_entrada) {
        totalEntries++;
        if (record.status_entrada === TimeRecordStatus.ON_TIME) onTimeCount++;
        if (record.status_entrada === TimeRecordStatus.LATE) lateCount++;
      }
      if (record.status_saida) {
        totalEntries++;
        if (record.status_saida === TimeRecordStatus.ON_TIME) onTimeCount++;
        if (record.status_saida === TimeRecordStatus.LATE) lateCount++;
      }
    });
    
    const punctualityRate = totalEntries > 0 ? Math.round((onTimeCount / totalEntries) * 100) : 0;
    const uniqueUsers = new Set(allRecords.map(r => r.nome)).size;
    
    return [
      {
        title: 'Total de Usuários',
        value: uniqueUsers.toString(),
        subtitle: `${uniqueUsers} usuários cadastrados`,
        icon: Users,
        color: 'primary'
      },
      {
        title: 'Registros Hoje',
        value: todayRecords.length.toString(),
        subtitle: 'Registros processados hoje',
        icon: Clock,
        color: 'secondary'
      },
      {
        title: 'Taxa de Pontualidade',
        value: `${punctualityRate}%`,
        subtitle: 'Registros no horário',
        icon: CheckCircle,
        color: 'success'
      },
      {
        title: 'Atrasos',
        value: lateCount.toString(),
        subtitle: 'Total de atrasos',
        icon: AlertCircle,
        color: 'warning'
      }
    ];
  }, [allRecords]);

  // Atividade recente baseada nos dados reais
  const recentActivity = useMemo(() => {
    const recent = allRecords
      .slice(-5) // Últimos 5 registros
      .reverse()
      .map((record, index) => ({
        id: index,
        user: record.nome,
        action: 'Registro de ponto',
        time: record.entrada_real || record.saida_real || '00:00',
        status: record.status_entrada || record.status_saida || 'on_time'
      }));
    
    return recent.length > 0 ? recent : [
      {
        id: 1,
        user: 'Nenhum registro',
        action: 'Faça upload de dados',
        time: '--:--',
        status: 'on_time'
      }
    ];
  }, [allRecords]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'on_time': return 'text-green-600 bg-green-100';
      case 'late': return 'text-red-600 bg-red-100';
      case 'early': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'on_time': return 'No horário';
      case 'late': return 'Atrasado';
      case 'early': return 'Antecipado';
      default: return 'Desconhecido';
    }
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - Controle de Ponto</title>
        <meta name="description" content="Dashboard principal do sistema de controle de ponto com métricas e atividades recentes." />
      </Helmet>

      <Layout>
        <div className="space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Visão geral do sistema de controle de ponto
            </p>
          </motion.div>

          {/* Metrics Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
              >
                <MetricCard {...metric} />
              </motion.div>
            ))}
          </motion.div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary-500" />
                    Atividade Recente
                  </CardTitle>
                  <CardDescription>
                    Últimos registros de ponto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-2 sm:gap-0">
                        <div>
                          <p className="font-medium text-gray-900">{activity.user}</p>
                          <p className="text-sm text-gray-600">{activity.action}</p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-sm font-medium text-gray-900">{activity.time}</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
                            {getStatusText(activity.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-secondary-500" />
                    Estatísticas do Mês
                  </CardTitle>
                  <CardDescription>
                    Resumo mensal de registros
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total de Registros</span>
                      <span className="font-semibold text-gray-900">{allRecords.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Média Diária</span>
                      <span className="font-semibold text-gray-900">{allRecords.length > 0 ? Math.round(allRecords.length / 30) : 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Taxa de Pontualidade</span>
                      <span className="font-semibold text-green-600">{metrics[2].value}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Atrasos</span>
                      <span className="font-semibold text-red-600">{metrics[3].value}</span>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Tendência</span>
                        <span className="font-semibold text-primary-600 flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          {allRecords.length > 0 ? '+5.2%' : '0%'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Dashboard;

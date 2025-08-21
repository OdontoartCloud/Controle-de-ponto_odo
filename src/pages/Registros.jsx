import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import {
  Upload,
  Download,
  Search,
  Filter,
  FileSpreadsheet,
  Calendar,
  Clock,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { DateRange } from 'react-date-range';
import { format } from 'date-fns';
import { parse } from 'date-fns';
import { isValid } from 'date-fns';
import { supabase } from '@/lib/customSupabaseClient';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { TimeRecordStatus, StatusColors } from '@/types';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import MetricCard from '@/components/MetricCard';
import { v4 as uuidv4 } from 'uuid';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { parseISO } from 'date-fns';

const Registros = () => {
  const [allRecords, setAllRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState(new Set(['all']));
  const [timeSettings, setTimeSettings] = useState({});
  const [statusColors, setStatusColors] = useState(StatusColors);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [periodDialogOpen, setPeriodDialogOpen] = useState(false);
  const [nameFilter, setNameFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);
  const [hasDateFilter, setHasDateFilter] = useState(false);

  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  // Carregar registros do Supabase
  const loadRecordsFromSupabase = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('ponto_registros')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Erro ao carregar registros:', error);
        return;
      }
      
      if (data && data.length > 0) {
        setAllRecords(data);
      }
    } catch (error) {
      console.error('Erro ao conectar com Supabase:', error);
    }
  };

  // Carregar configurações e registros salvos
  useEffect(() => {
    const savedConfig = localStorage.getItem('timeControlConfig');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      if (config.timeSettings) setTimeSettings(config.timeSettings);
      if (config.statusColors) setStatusColors(config.statusColors);
    } else {
      setTimeSettings({
        toleranceMinutes: 5,
        [TimeRecordStatus.ON_TIME]: 5,
        [TimeRecordStatus.LATE]: 5,
        [TimeRecordStatus.EARLY]: 5,
      });
    }

    // Carregar registros salvos
    const savedRecords = localStorage.getItem('timeControlRecords');
    if (savedRecords) {
      try {
        const records = JSON.parse(savedRecords);
        setAllRecords(records);
      } catch (error) {
        console.error('Erro ao carregar registros salvos:', error);
      }
    } else {
      // Se não há registros salvos localmente, tentar carregar do Supabase
      loadRecordsFromSupabase();
    }
  }, []);

  // Carregar registros quando o usuário estiver disponível
  useEffect(() => {
    if (user && allRecords.length === 0) {
      loadRecordsFromSupabase();
    }
  }, [user]);

  // Salvar registros no localStorage sempre que allRecords mudar
  useEffect(() => {
    if (allRecords.length > 0) {
      localStorage.setItem('timeControlRecords', JSON.stringify(allRecords));
    }
  }, [allRecords]);

  // Aplicar filtros
  useEffect(() => {
    let recordsToFilter = [...allRecords];

    // Filtro por status
    if (!activeFilters.has('all') && activeFilters.size > 0) {
      recordsToFilter = recordsToFilter.filter(
        (r) => activeFilters.has(r.status_entrada) || activeFilters.has(r.status_saida)
      );
    }

    // Filtro por busca
    if (searchTerm) {
      recordsToFilter = recordsToFilter.filter((record) =>
        Object.values(record).some((val) =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filtro por nome
    if (nameFilter !== 'all') {
      recordsToFilter = recordsToFilter.filter(record => 
        record.nome === nameFilter
      );
    }

    // Filtro por departamento
    if (departmentFilter !== 'all') {
      recordsToFilter = recordsToFilter.filter(record => 
        record.departamento === departmentFilter
      );
    }

    // Filtro por período
    if (hasDateFilter) {
      const startDate = dateRange[0].startDate;
      const endDate = dateRange[0].endDate;
      
      recordsToFilter = recordsToFilter.filter(record => {
        const recordDate = new Date(record.data_batida + 'T00:00:00');
        return recordDate >= startDate && recordDate <= endDate;
      });
    }

    setFilteredRecords(recordsToFilter);
  }, [searchTerm, allRecords, activeFilters, nameFilter, departmentFilter, dateRange, hasDateFilter]);

  const getStatusColor = (status) => {
    const color = statusColors[status] || '#a1a1aa';
    const textColor = color === '#ffffff' ? '#000000' : '#ffffff';
    
    return {
      backgroundColor: color,
      color: textColor
    };
  };

  const getStatusText = (status) => {
    const texts = {
      [TimeRecordStatus.ON_TIME]: 'No horário',
      [TimeRecordStatus.LATE]: 'Atrasado',
      [TimeRecordStatus.EARLY]: 'Antecipado',
      [TimeRecordStatus.ADJUSTED]: 'Ajustado',
    };
    return texts[status] || 'Desconhecido';
  };

  const formatTimeForSupabase = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return null;
    
    // Remove asterisco e espaços
    const cleanTime = timeStr.replace('*', '').trim();
    if (!cleanTime) return null;
    
    // Verificar se é uma data (contém / ou -)
    if (cleanTime.includes('/') || cleanTime.includes('-')) return null;
    
    // Verificar formato de hora (HH:MM ou HH:MM:SS)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(:([0-5][0-9]))?$/;
    if (!timeRegex.test(cleanTime)) return null;
    
    const parts = cleanTime.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parts[2] ? parseInt(parts[2], 10) : 0;
    
    // Validar limites
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
      return null;
    }
    
    // Retornar no formato HH:MM:SS
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const parseTime = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return null;
    
    // Remove asterisco se existir
    const cleanTime = timeStr.replace('*', '').trim();
    if (!cleanTime) return null;
    
    const parts = timeStr.split(':');
    if (parts.length < 2) return null;
    
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parts[2] ? parseInt(parts[2], 10) : 0;
    
    // Validar se são números válidos
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return null;
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) return null;
    
    const d = new Date();
    d.setHours(hours, minutes, seconds, 0);
    return d;
  };

  // Função para extrair horários contratuais
  const parseContractualHours = (contractualStr) => {
    if (!contractualStr || typeof contractualStr !== 'string') return { entrada: null, saida: null };
    
    // Extrair todos os horários no formato HH:MM
    const timeRegex = /(\d{1,2}:\d{2})/g;
    const matches = contractualStr.match(timeRegex);
    
    if (!matches || matches.length === 0) return { entrada: null, saida: null };
    
    // Primeiro horário = entrada, último horário = saída
    const entrada = formatTimeForSupabase(matches[0]);
    const saida = formatTimeForSupabase(matches[matches.length - 1]);
    
    return { entrada, saida };
  };

  // Função para extrair horário de "Data e Hora da Batida"
  const extractTimeFromDateTime = (dateTimeStr) => {
    if (!dateTimeStr || typeof dateTimeStr !== 'string') return null;
    
    // Formato esperado: "21/07/2025 14:57"
    const parts = dateTimeStr.trim().split(' ');
    if (parts.length < 2) return null;
    
    // Pegar a parte do horário (última parte)
    const timePart = parts[parts.length - 1];
    
    // Se contém asterisco, preservar no retorno
    if (timePart.includes('*')) {
      const cleanTime = timePart.replace('*', '').trim();
      const formattedTime = formatTimeForSupabase(cleanTime);
      return formattedTime ? formattedTime + '*' : null;
    }
    
    return formatTimeForSupabase(timePart);
  };

  // Função para determinar o dia da semana de uma data
  const getDayOfWeek = (dateStr) => {
    if (!dateStr) return null;
    
    try {
      // Assumindo formato DD/MM/YYYY
      const parts = dateStr.split('/');
      if (parts.length !== 3) return null;
      
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // JavaScript months are 0-indexed
      const year = parseInt(parts[2], 10);
      
      const date = new Date(year, month, day);
      return date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    } catch (error) {
      return null;
    }
  };

  const getStatus = (contractual, actual) => {
    if (!actual || actual === '') return null;
    
    // Se tem asterisco (*), é ajustado
    if (typeof actual === 'string' && actual.includes('*')) {
      return TimeRecordStatus.ADJUSTED;
    }

    if (!contractual || contractual === '') return null;
    
    const contractualTime = parseTime(contractual);
    // Remove asterisco antes de fazer parse do horário
    const cleanActual = typeof actual === 'string' ? actual.replace('*', '').trim() : actual;
    const actualTime = parseTime(cleanActual);

    if (!contractualTime || !actualTime) return null;

    const diffMinutes = (actualTime - contractualTime) / (1000 * 60);
    const tolerance = timeSettings?.toleranceMinutes || 5;

    if (diffMinutes > tolerance) {
      return TimeRecordStatus.LATE;
    } else if (diffMinutes < -tolerance) {
      return TimeRecordStatus.EARLY;
    } else {
      return TimeRecordStatus.ON_TIME;
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
        });

        if (
          json.length === 0 ||
          !('Nome' in json[0])
        ) {
          throw new Error(
            "Formato de arquivo inválido. Verifique se a coluna 'Nome' está presente."
          );
        }

        const processedRecords = json.map((row, index) => {
          // Extrair data da "Data e Hora da Batida 1" ou usar data atual como fallback
          let parsedDate;
          let dateStr = '';
          
          if (row['Data e Hora da Batida 1']) {
            const dateTimeParts = row['Data e Hora da Batida 1'].trim().split(' ');
            dateStr = dateTimeParts[0]; // Primeira parte é a data
          }
          
          try {
            if (dateStr) {
              parsedDate = parse(dateStr, 'dd/MM/yyyy', new Date());
              if (isNaN(parsedDate.getTime())) {
                throw new Error('Invalid date');
              }
            } else {
              parsedDate = new Date();
            }
          } catch (error) {
            parsedDate = new Date();
          }

          // Processar horários contratuais
          const contractualHours = parseContractualHours(row['Horário contratual']);
          
          // Extrair horários das batidas
          const entradaReal = extractTimeFromDateTime(row['Data e Hora da Batida 1']);
          
          // Determinar saída baseada no dia da semana
          const dayOfWeek = getDayOfWeek(dateStr);
          let saidaReal = null;
          let forcedEarlyStatus = false;
          
          if (dayOfWeek === 6) { // Sábado
            saidaReal = extractTimeFromDateTime(row['Data e Hora da Batida 2']);
          } else if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Segunda a Sexta
            // Primeiro tenta Data e Hora da Batida 4
            saidaReal = extractTimeFromDateTime(row['Data e Hora da Batida 4']);
            
            // Se estiver em branco, busca na Data e Hora da Batida 2
            if (!saidaReal) {
              saidaReal = extractTimeFromDateTime(row['Data e Hora da Batida 2']);
              // Se encontrou na Batida 2, marca como antecipado
              if (saidaReal) {
                forcedEarlyStatus = true;
              }
            }
          }
          
          // Calcular status
          const entryStatus = getStatus(
            contractualHours.entrada,
            entradaReal
          );
          
          let exitStatus;
          if (forcedEarlyStatus) {
            // Forçar status antecipado quando usar Batida 2 em dia de semana
            exitStatus = TimeRecordStatus.EARLY;
          } else {
            exitStatus = getStatus(
              contractualHours.saida,
              saidaReal
            );
          }

          return {
            id: uuidv4(),
            user_id: user?.id,
            nome: row['Nome'],
            departamento: row['Departamento'],
            localizacao: row['Localização'] || '',
            equipamento: row['Equipamento da Última Batida'] || '',
            entrada_contratual: contractualHours.entrada,
            saida_contratual: contractualHours.saida,
            data_batida: parsedDate.toISOString().split('T')[0], // Store as YYYY-MM-DD format
            entrada_real: entradaReal,
            saida_real: saidaReal,
            status_entrada: entryStatus,
            status_saida: exitStatus,
          };
        });

        const { error } = await supabase
          .from('ponto_registros')
          .insert(processedRecords);

        if (error) {
          throw new Error(`Erro ao salvar no banco de dados: ${error.message}`);
        }

        setAllRecords((prev) => [...prev, ...processedRecords]);

        toast({
          title: 'Upload bem-sucedido!',
          description: `${json.length} registros foram processados e salvos.`,
        });
      } catch (error) {
        toast({
          title: 'Erro no Upload',
          description:
            error.message || 'Não foi possível processar o arquivo XLSX.',
          variant: 'destructive',
        });
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDownload = () => {
    const downloadExcelWithColors = async () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Registros');

      // Define headers
      const headers = [
        'Nome',
        'Departamento', 
        'Localização',
        'Equipamento',
        'Entrada Contratual',
        'Saida Contratual',
        'Data da batida',
        'Entrada',
        'Saída',
        'STATUS ENTRADA',
        'STATUS SAIDA'
      ];

      // Add headers
      worksheet.addRow(headers);

      // Style headers
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // Add data rows
      filteredRecords.forEach((record, index) => {
        const rowData = [
          record.nome,
          record.departamento,
          record.localizacao,
          record.equipamento,
          record.entrada_contratual,
          record.saida_contratual,
          record.data_batida,
          record.entrada_real,
          record.saida_real,
          getStatusText(record.status_entrada),
          getStatusText(record.status_saida)
        ];

        const row = worksheet.addRow(rowData);
        const rowIndex = index + 2; // +2 because Excel is 1-indexed and we have headers

        // Apply colors to time columns based on status
        // Entrada column (column 8)
        if (record.status_entrada && record.entrada_real) {
          const entradaCell = worksheet.getCell(rowIndex, 8);
          const entradaColor = statusColors[record.status_entrada];
          if (entradaColor) {
            entradaCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FF' + entradaColor.replace('#', '') }
            };
            // Add white text for better contrast on dark backgrounds
            if (['#ef4444', '#f59e0b'].includes(entradaColor)) {
              entradaCell.font = { color: { argb: 'FFFFFFFF' } };
            }
            // Add black text for white background
            if (entradaColor === '#ffffff') {
              entradaCell.font = { color: { argb: 'FF000000' } };
              entradaCell.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
              };
            }
          }
        }

        // Saída column (column 9)
        if (record.status_saida && record.saida_real) {
          const saidaCell = worksheet.getCell(rowIndex, 9);
          const saidaColor = statusColors[record.status_saida];
          if (saidaColor) {
            saidaCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FF' + saidaColor.replace('#', '') }
            };
            // Add white text for better contrast on dark backgrounds
            if (['#ef4444', '#f59e0b'].includes(saidaColor)) {
              saidaCell.font = { color: { argb: 'FFFFFFFF' } };
            }
            // Add black text for white background
            if (saidaColor === '#ffffff') {
              saidaCell.font = { color: { argb: 'FF000000' } };
              saidaCell.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
              };
            }
          }
        }

        // Apply colors to status columns as well
        // STATUS ENTRADA column (column 10)
        if (record.status_entrada) {
          const statusEntradaCell = worksheet.getCell(rowIndex, 10);
          const entradaColor = statusColors[record.status_entrada];
          if (entradaColor) {
            statusEntradaCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FF' + entradaColor.replace('#', '') }
            };
            if (['#ef4444', '#f59e0b'].includes(entradaColor)) {
              statusEntradaCell.font = { color: { argb: 'FFFFFFFF' } };
            }
            // Add black text for white background
            if (entradaColor === '#ffffff') {
              statusEntradaCell.font = { color: { argb: 'FF000000' } };
              statusEntradaCell.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
              };
            }
          }
        }

        // STATUS SAIDA column (column 11)
        if (record.status_saida) {
          const statusSaidaCell = worksheet.getCell(rowIndex, 11);
          const saidaColor = statusColors[record.status_saida];
          if (saidaColor) {
            statusSaidaCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FF' + saidaColor.replace('#', '') }
            };
            if (['#ef4444', '#f59e0b'].includes(saidaColor)) {
              statusSaidaCell.font = { color: { argb: 'FFFFFFFF' } };
            }
            // Add black text for white background
            if (saidaColor === '#ffffff') {
              statusSaidaCell.font = { color: { argb: 'FF000000' } };
              statusSaidaCell.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
              };
            }
          }
        }
      });

      // Auto-fit columns
      worksheet.columns.forEach(column => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = maxLength < 10 ? 10 : maxLength + 2;
      });

      // Generate buffer and download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'registros_de_ponto.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
    };

    downloadExcelWithColors().catch(error => {
      console.error('Erro ao gerar relatório com cores:', error);
      toast({
        title: 'Erro no download',
        description: 'Não foi possível gerar o relatório com cores. Tente novamente.',
        variant: 'destructive',
      });
    });
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        Nome: 'Exemplo Usuário',
        Matrícula: '12345',
        Pis: '12345678901',
        CPF: '123.456.789-00',
        'Código Interno': 'INT001',
        'Data de Admissão': '01/01/2023',
        'Data de Nascimento': '15/05/1990',
        Cargo: 'Analista',
        Departamento: 'TI',
        Filial: 'Matriz',
        'Regime de trabalho': 'CLT',
        'Centro de Custo': '001',
        Localização: 'Sede',
        'Equipamento da Última Batida': 'REP001',
        centro_custo_desc: 'Tecnologia da Informação',
        'Data de Demissão': '',
        'Data Lógica': '21/07/2025',
        'Data da Batida': '21/07/2025',
        'Tipo da Batida': 'Normal',
        Latitude: '-23.550520',
        Longitude: '-46.633308',
        Precisão: '10',
        'Escala/Jornala': 'Padrão',
        'Horário contratual': '08:00 - 12:00 - 13:00 - 17:00',
        'Data e Hora da Batida 1': '21/07/2025 08:02',
        'Data e Hora da Batida 2': '21/07/2025 12:00',
        'Data e Hora da Batida 3': '21/07/2025 13:00',
        'Data e Hora da Batida 4': '21/07/2025 17:05',
        'Data e Hora da Batida 5': '',
      },
    ];
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Novo Modelo');
    XLSX.writeFile(workbook, 'novo_modelo_registros.xlsx');
  };

  const summary = useMemo(() => {
    let onTime = 0;
    let late = 0;
    let early = 0;
    let adjusted = 0;

    filteredRecords.forEach((record) => {
      // Contar status de entrada
      if (record.status_entrada === TimeRecordStatus.ON_TIME) onTime++;
      else if (record.status_entrada === TimeRecordStatus.LATE) late++;
      else if (record.status_entrada === TimeRecordStatus.EARLY) early++;
      else if (record.status_entrada === TimeRecordStatus.ADJUSTED) adjusted++;

      // Contar status de saída
      if (record.status_saida === TimeRecordStatus.ON_TIME) onTime++;
      else if (record.status_saida === TimeRecordStatus.LATE) late++;
      else if (record.status_saida === TimeRecordStatus.EARLY) early++;
      else if (record.status_saida === TimeRecordStatus.ADJUSTED) adjusted++;
    });

    return { total: filteredRecords.length, onTime, late, early, adjusted };
  }, [filteredRecords]);

  const handleFilterClick = (status) => {
    setActiveFilters((prev) => {
      const newFilters = new Set(prev);
      
      if (status === 'all') {
        // Se clicar em "Total", limpar todos os outros filtros
        return new Set(['all']);
      }
      
      // Remove 'all' se existir
      newFilters.delete('all');
      
      if (newFilters.has(status)) {
        // Se o status já está selecionado, remove
        newFilters.delete(status);
        
        // Se não sobrou nenhum filtro, volta para 'all'
        if (newFilters.size === 0) {
          newFilters.add('all');
        }
      } else {
        // Adiciona o novo status
        newFilters.add(status);
      }
      
      return newFilters;
    });
  };

  const handleClearRecords = () => {
    setAllRecords([]);
    localStorage.removeItem('timeControlRecords');
    toast({ title: 'Registros limpos da tela.' });
  };

  // Obter listas únicas para os filtros
  const uniqueNames = useMemo(() => {
    const names = [...new Set(allRecords.map(record => record.nome))];
    return names.sort();
  }, [allRecords]);

  const uniqueDepartments = useMemo(() => {
    const departments = [...new Set(allRecords.map(record => record.departamento))];
    return departments.sort();
  }, [allRecords]);

  const handleApplyFilters = () => {
    setFilterDialogOpen(false);
    toast({
      title: 'Filtros aplicados',
      description: 'Os registros foram filtrados conforme sua seleção.',
    });
  };

  const handleClearFilters = () => {
    setNameFilter('all');
    setDepartmentFilter('all');
    toast({
      title: 'Filtros limpos',
      description: 'Todos os filtros foram removidos.',
    });
  };

  const handleApplyDateRange = () => {
    setHasDateFilter(true);
    setPeriodDialogOpen(false);
    toast({
      title: 'Período aplicado',
      description: `Registros filtrados de ${format(dateRange[0].startDate, 'dd/MM/yyyy')} até ${format(dateRange[0].endDate, 'dd/MM/yyyy')}.`,
    });
  };

  const handleClearDateRange = () => {
    setHasDateFilter(false);
    setDateRange([{
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }]);
    toast({
      title: 'Período removido',
      description: 'O filtro de período foi removido.',
    });
  };

  return (
    <>
      <Helmet>
        <title>Registros - Controle de Ponto</title>
        <meta
          name="description"
          content="Visualize e gerencie registros de ponto, faça upload de arquivos XLSX e baixe relatórios."
        />
      </Helmet>

      <Layout>
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-gray-900">
              Registros de Ponto
            </h1>
            <p className="text-gray-600 mt-2">
              Gerencie e visualize todos os registros de ponto importados.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            {/* Barra de busca e filtros */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-start">
              <div className="relative flex-1 sm:min-w-[250px] sm:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nome, depto, etc..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2 sm:gap-4">
                {/* Filtros Dialog */}
                <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className={`flex items-center gap-2 flex-1 sm:flex-none justify-center ${
                        nameFilter !== 'all' || departmentFilter !== 'all' 
                          ? 'bg-primary-50 border-primary-200 text-primary-700' 
                          : ''
                      }`}
                    >
                      <Filter className="w-4 h-4" /> 
                      Filtros
                      {(nameFilter !== 'all' || departmentFilter !== 'all') && (
                        <span className="bg-primary-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                          {(nameFilter !== 'all' ? 1 : 0) + (departmentFilter !== 'all' ? 1 : 0)}
                        </span>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Filtrar Registros</DialogTitle>
                      <DialogDescription>
                        Selecione os filtros para refinar a visualização dos registros.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name-filter">Filtrar por Nome</Label>
                        <Select value={nameFilter} onValueChange={setNameFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um nome" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos os nomes</SelectItem>
                            {uniqueNames.map((name) => (
                              <SelectItem key={name} value={name}>
                                {name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="department-filter">Filtrar por Departamento</Label>
                        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um departamento" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos os departamentos</SelectItem>
                            {uniqueDepartments.map((dept) => (
                              <SelectItem key={dept} value={dept}>
                                {dept}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleClearFilters} variant="outline" className="flex-1">
                          Limpar
                        </Button>
                        <Button onClick={handleApplyFilters} className="flex-1">
                          Aplicar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Período Dialog */}
                <Dialog open={periodDialogOpen} onOpenChange={setPeriodDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className={`flex items-center gap-2 flex-1 sm:flex-none justify-center ${
                        hasDateFilter 
                          ? 'bg-primary-50 border-primary-200 text-primary-700' 
                          : ''
                      }`}
                    >
                      <Calendar className="w-4 h-4" /> 
                      Período
                      {hasDateFilter && (
                        <span className="bg-primary-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                          1
                        </span>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Filtrar por Período</DialogTitle>
                      <DialogDescription>
                        Selecione um intervalo de datas para filtrar os registros.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <DateRange
                          editableDateInputs={true}
                          onChange={item => setDateRange([item.selection])}
                          moveRangeOnFirstSelection={false}
                          ranges={dateRange}
                          locale={{
                            localize: {
                              day: n => ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][n],
                              month: n => ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][n]
                            },
                            formatLong: {},
                            code: 'pt-BR'
                          }}
                        />
                      </div>

                      {hasDateFilter && (
                        <div className="text-sm text-gray-600 text-center">
                          Período atual: {format(dateRange[0].startDate, 'dd/MM/yyyy')} até {format(dateRange[0].endDate, 'dd/MM/yyyy')}
                        </div>
                      )}

                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleClearDateRange} variant="outline" className="flex-1">
                          Limpar
                        </Button>
                        <Button onClick={handleApplyDateRange} className="flex-1">
                          Aplicar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row gap-3 justify-start">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".xlsx, .xls"
              />
              <Button
                onClick={() => fileInputRef.current.click()}
                className="bg-secondary-500 hover:bg-secondary-600 text-white justify-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload XLSX
              </Button>
              <Button onClick={handleDownload} variant="outline" className="justify-center">
                <Download className="w-4 h-4 mr-2" />
                Baixar Relatório
              </Button>
              <Button onClick={handleDownloadTemplate} variant="outline" className="justify-center">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Modelo XLSX
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={allRecords.length === 0}
                    className="justify-center"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Limpar Registros
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação limpará todos os registros da tela. Os dados
                      permanecerão salvos no banco de dados.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearRecords}>
                      Confirmar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6"
          >
            <div className="min-w-0">
              <MetricCard
                title="Total"
                value={summary.total}
                icon={Clock}
                color={activeFilters.has('all') ? "primary" : "secondary"}
                onClick={() => handleFilterClick('all')}
                clickable
              />
            </div>
            <div className="min-w-0">
              <MetricCard
                title="No Horário"
                value={summary.onTime}
                icon={Clock}
                color={activeFilters.has(TimeRecordStatus.ON_TIME) ? "success" : "secondary"}
                onClick={() => handleFilterClick(TimeRecordStatus.ON_TIME)}
                clickable
              />
            </div>
            <div className="min-w-0">
              <MetricCard
                title="Atrasos"
                value={summary.late}
                icon={AlertTriangle}
                color={activeFilters.has(TimeRecordStatus.LATE) ? "danger" : "secondary"}
                onClick={() => handleFilterClick(TimeRecordStatus.LATE)}
                clickable
              />
            </div>
            <div className="min-w-0">
              <MetricCard
                title="Antecipados"
                value={summary.early}
                icon={Clock}
                color={activeFilters.has(TimeRecordStatus.EARLY) ? "primary" : "secondary"}
                onClick={() => handleFilterClick(TimeRecordStatus.EARLY)}
                clickable
              />
            </div>
            <div className="min-w-0">
              <MetricCard
                title="Ajustados"
                value={summary.adjusted}
                icon={Clock}
                color={activeFilters.has(TimeRecordStatus.ADJUSTED) ? "warning" : "secondary"}
                onClick={() => handleFilterClick(TimeRecordStatus.ADJUSTED)}
                clickable
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>
                  Visualização de Registros ({filteredRecords.length})
                  {!activeFilters.has('all') && activeFilters.size > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Array.from(activeFilters).map(status => (
                        <span key={status} className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs">
                          {status === TimeRecordStatus.ON_TIME ? 'No Horário' :
                           status === TimeRecordStatus.LATE ? 'Atrasos' :
                           status === TimeRecordStatus.EARLY ? 'Antecipados' :
                           status === TimeRecordStatus.ADJUSTED ? 'Ajustados' : status}
                          <button 
                            onClick={() => handleFilterClick(status)} 
                            className="hover:bg-primary-200 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  {(nameFilter !== 'all' || departmentFilter !== 'all' || hasDateFilter) && (
                    <div className="flex gap-2 mt-2">
                      {nameFilter !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs">
                          Nome: {nameFilter}
                          <button onClick={() => setNameFilter('all')} className="hover:bg-primary-200 rounded-full p-0.5">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {departmentFilter !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs">
                          Depto: {departmentFilter}
                          <button onClick={() => setDepartmentFilter('all')} className="hover:bg-primary-200 rounded-full p-0.5">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {hasDateFilter && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs">
                          {format(dateRange[0].startDate, 'dd/MM')} - {format(dateRange[0].endDate, 'dd/MM')}
                          <button onClick={handleClearDateRange} className="hover:bg-primary-200 rounded-full p-0.5">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto -mx-6 sm:mx-0">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700 min-w-[120px]">
                          Nome
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 min-w-[100px] hidden sm:table-cell">
                          Departamento
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 min-w-[100px] hidden md:table-cell">
                          Data
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 min-w-[120px]">
                          Entrada
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 min-w-[100px] hidden lg:table-cell">
                          Status Entrada
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 min-w-[120px] hidden xl:table-cell">
                          Saída
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 min-w-[100px] hidden xl:table-cell">
                          Status Saída
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.length > 0 ? (
                        filteredRecords.map((record, index) => (
                          <motion.tr
                            key={record.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.02 }}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="py-4 px-4">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {record.nome}
                                </div>
                                <div className="text-sm text-gray-500 sm:hidden">
                                  {record.departamento}
                                </div>
                                <div className="text-sm text-gray-500 md:hidden">
                                  {record.data_batida && isValid(parseISO(record.data_batida)) ? format(parseISO(record.data_batida), 'dd/MM/yyyy') : '-'}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-gray-600 hidden sm:table-cell">
                              {record.departamento}
                            </td>
                            <td className="py-4 px-4 text-gray-600 hidden md:table-cell">
                              {record.data_batida && isValid(parseISO(record.data_batida)) ? format(parseISO(record.data_batida), 'dd/MM/yyyy') : '-'}
                            </td>
                            <td className="py-4 px-4 text-sm">
                              <div 
                                className="font-medium px-2 py-1 rounded"
                                style={record.status_entrada ? getStatusColor(record.status_entrada) : { backgroundColor: '#f3f4f6' }}
                              >
                                {record.entrada_real || record.entrada_contratual || '-'}
                              </div>
                              <div className="text-gray-500 text-xs">
                                Previsto: {record.entrada_contratual || '-'}
                              </div>
                              <div className="lg:hidden mt-1">
                                {record.status_entrada ? (
                                  <span
                                    className="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                                    style={getStatusColor(record.status_entrada)}
                                  >
                                    {getStatusText(record.status_entrada)}
                                  </span>
                                ) : (
                                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                                    Sem status
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4 hidden lg:table-cell">
                              {record.status_entrada ? (
                                <span
                                  className="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                                  style={getStatusColor(record.status_entrada)}
                                >
                                  {getStatusText(record.status_entrada)}
                                </span>
                              ) : (
                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                                  Sem status
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-sm hidden xl:table-cell">
                              <div 
                                className="font-medium px-2 py-1 rounded"
                                style={record.status_saida ? getStatusColor(record.status_saida) : { backgroundColor: '#f3f4f6' }}
                              >
                                {record.saida_real || 'S/R'}
                              </div>
                              <div className="text-gray-500 text-xs">
                                Previsto: {record.saida_contratual || '-'}
                              </div>
                            </td>
                            <td className="py-4 px-4 hidden xl:table-cell">
                              {record.status_saida ? (
                                <span
                                  className="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                                  style={getStatusColor(record.status_saida)}
                                >
                                  {getStatusText(record.status_saida)}
                                </span>
                              ) : (
                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                                  Sem status
                                </span>
                              )}
                            </td>
                          </motion.tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="7"
                            className="text-center py-10 text-gray-500"
                          >
                            Nenhum registro encontrado. Tente fazer um upload ou
                            limpar os filtros.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Layout>
    </>
  );
};

export default Registros;
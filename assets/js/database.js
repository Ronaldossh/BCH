/**
 * Sistema de Banco de Dados - Banco de Horas
 * Gerenciamento de dados local com LocalStorage e JSON
 */

class DatabaseManager {
    constructor() {
        this.dbName = 'bancoHorasDB';
        this.version = '2.0.0';
        this.init();
    }

    // Inicializar banco de dados
    init() {
        if (!this.hasData()) {
            this.loadDefaultData();
        }
        console.log('🚀 Database Manager inicializado');
    }

    // Verificar se há dados salvos
    hasData() {
        return localStorage.getItem(this.dbName) !== null;
    }

    // Carregar dados padrão
    async loadDefaultData() {
        try {
            const response = await fetch('./data/database.json');
            const defaultData = await response.json();
            this.saveData(defaultData);
            console.log('✅ Dados padrão carregados');
        } catch (error) {
            console.error('❌ Erro ao carregar dados padrão:', error);
            this.createEmptyDatabase();
        }
    }

    // Criar banco vazio
    createEmptyDatabase() {
        const emptyDB = {
            config: {
                version: this.version,
                lastUpdate: new Date().toISOString().split('T')[0],
                theme: 'dark',
                laserEffects: true,
                autoSave: true,
                language: 'pt-BR'
            },
            employees: [],
            departments: [],
            reports: {
                weekly: {},
                monthly: {}
            },
            settings: {
                workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
                holidays: [],
                notifications: {
                    delayAlert: true,
                    extraHoursAlert: true,
                    weeklyReport: true
                },
                export: {
                    format: 'csv',
                    includeCharts: true,
                    autoBackup: true
                }
            }
        };
        this.saveData(emptyDB);
    }

    // Salvar dados
    saveData(data) {
        try {
            data.config.lastUpdate = new Date().toISOString().split('T')[0];
            localStorage.setItem(this.dbName, JSON.stringify(data));
            console.log('💾 Dados salvos com sucesso');
            return true;
        } catch (error) {
            console.error('❌ Erro ao salvar dados:', error);
            return false;
        }
    }

    // Carregar dados
    loadData() {
        try {
            const data = localStorage.getItem(this.dbName);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            return null;
        }
    }

    // Adicionar funcionário
    addEmployee(employee) {
        const data = this.loadData();
        if (!data) return false;

        employee.id = this.generateId(data.employees);
        employee.records = employee.records || [];
        employee.summary = this.calculateEmployeeSummary(employee.records);
        
        data.employees.push(employee);
        return this.saveData(data);
    }

    // Atualizar funcionário
    updateEmployee(employeeId, updatedData) {
        const data = this.loadData();
        if (!data) return false;

        const index = data.employees.findIndex(emp => emp.id === employeeId);
        if (index === -1) return false;

        data.employees[index] = { ...data.employees[index], ...updatedData };
        data.employees[index].summary = this.calculateEmployeeSummary(data.employees[index].records);
        
        return this.saveData(data);
    }

    // Adicionar registro de ponto
    addTimeRecord(employeeId, record) {
        const data = this.loadData();
        if (!data) return false;

        const employee = data.employees.find(emp => emp.id === employeeId);
        if (!employee) return false;

        record.id = this.generateId(employee.records);
        record = this.calculateRecordHours(record, employee.workSchedule);
        
        employee.records.push(record);
        employee.summary = this.calculateEmployeeSummary(employee.records);
        
        return this.saveData(data);
    }

    // Calcular horas do registro com lógica específica da loja
    calculateRecordHours(record, workSchedule) {
        const entry = this.timeToMinutes(record.entry);
        const exit = this.timeToMinutes(record.exit);
        const date = new Date(record.date);
        const dayOfWeek = date.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
        
        // Definir horários padrão baseado no dia da semana
        let standardStart, standardEnd, standardHours, hasLunch = false;
        
        if (dayOfWeek === 0) { // DOMINGO
            standardStart = this.timeToMinutes('08:00');
            standardEnd = this.timeToMinutes('12:00');
            standardHours = 4;
            hasLunch = false;
        } else if (dayOfWeek === 6) { // SÁBADO (dia de pagamento)
            standardStart = this.timeToMinutes('08:00');
            standardEnd = this.timeToMinutes('15:00');
            standardHours = 7;
            hasLunch = false;
        } else { // SEGUNDA a SEXTA
            standardStart = this.timeToMinutes('08:00');
            standardEnd = this.timeToMinutes('15:00');
            standardHours = 7;
            hasLunch = false; // Sem hora de almoço conforme especificado
        }

        // Calcular tempo de almoço se aplicável
        let lunchTime = 0;
        if (hasLunch && record.lunchOut && record.lunchIn) {
            const lunchOut = this.timeToMinutes(record.lunchOut);
            const lunchIn = this.timeToMinutes(record.lunchIn);
            lunchTime = lunchIn - lunchOut;
        }

        // Calcular horas trabalhadas
        const totalMinutes = exit - entry - lunchTime;
        const totalHours = totalMinutes / 60;

        // Calcular extras e atrasos baseado na lógica específica
        let extraHours = 0;
        let delayMinutes = 0;
        let earlyExitMinutes = 0;
        let earlyEntryMinutes = 0;
        let lateExitMinutes = 0;

        // Verificar entrada antecipada (EXTRA)
        if (entry < standardStart) {
            earlyEntryMinutes = standardStart - entry;
        }

        // Verificar atraso na entrada
        if (entry > standardStart) {
            delayMinutes = entry - standardStart;
        }

        // Verificar saída antecipada (DESCONTO)
        if (exit < standardEnd) {
            earlyExitMinutes = standardEnd - exit;
        }

        // Verificar saída após horário (EXTRA)
        if (exit > standardEnd) {
            lateExitMinutes = exit - standardEnd;
        }

        // Calcular horas extras totais (entrada antecipada + saída tardia)
        extraHours = (earlyEntryMinutes + lateExitMinutes) / 60;

        // Aplicar lógica de descontos
        let finalExtraHours = extraHours;
        let penaltyHours = 0;

        // Se teve atraso ou saída antecipada, descontar das horas extras
        const totalPenaltyMinutes = delayMinutes + earlyExitMinutes;
        if (totalPenaltyMinutes > 0) {
            penaltyHours = totalPenaltyMinutes / 60;
            finalExtraHours = Math.max(0, extraHours - penaltyHours);
            
            // Se não há horas extras suficientes para cobrir o desconto, fica negativo
            if (extraHours < penaltyHours) {
                finalExtraHours = -(penaltyHours - extraHours);
            }
        }

        // Determinar status do dia
        let dayStatus = 'normal';
        if (dayOfWeek === 0) dayStatus = 'domingo';
        else if (dayOfWeek === 6) dayStatus = 'sabado_pagamento';
        else if (delayMinutes > 0 || earlyExitMinutes > 0) dayStatus = 'com_desconto';
        else if (extraHours > 0) dayStatus = 'com_extra';

        // Atualizar o registro
        record.totalHours = Math.round(totalHours * 100) / 100;
        record.standardHours = standardHours;
        record.extraHours = Math.round(finalExtraHours * 100) / 100;
        record.delayMinutes = delayMinutes;
        record.earlyExitMinutes = earlyExitMinutes;
        record.earlyEntryMinutes = earlyEntryMinutes;
        record.penaltyHours = Math.round(penaltyHours * 100) / 100;
        record.dayStatus = dayStatus;
        record.dayOfWeek = this.getDayName(dayOfWeek);
        record.status = 'complete';

        // Adicionar observações detalhadas
        record.observations = this.generateObservations(record, dayOfWeek);
        
        return record;
    }

    // Gerar observações detalhadas
    generateObservations(record, dayOfWeek) {
        const observations = [];
        const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        
        observations.push(`📅 ${dayNames[dayOfWeek]}`);
        
        if (dayOfWeek === 0) {
            observations.push('🏪 Horário: 8h às 12h (4 horas)');
        } else if (dayOfWeek === 6) {
            observations.push('💰 Sábado - Dia de Pagamento');
            observations.push('🏪 Horário: 8h às 15h (7 horas)');
        } else {
            observations.push('🏪 Horário: 8h às 15h (7 horas, sem almoço)');
        }

        if (record.earlyEntryMinutes > 0) {
            observations.push(`⏰ Entrada antecipada: +${Math.round(record.earlyEntryMinutes)} min (EXTRA)`);
        }

        if (record.delayMinutes > 0) {
            observations.push(`⏰ Atraso na entrada: ${Math.round(record.delayMinutes)} min (DESCONTO)`);
        }

        if (record.earlyExitMinutes > 0) {
            observations.push(`⏰ Saída antecipada: ${Math.round(record.earlyExitMinutes)} min (DESCONTO)`);
        }

        if (record.extraHours > 0) {
            observations.push(`✅ Horas extras: +${record.extraHours.toFixed(2)}h`);
        } else if (record.extraHours < 0) {
            observations.push(`❌ Horas negativas: ${record.extraHours.toFixed(2)}h`);
        }

        if (record.penaltyHours > 0) {
            observations.push(`⚠️ Total de descontos: ${record.penaltyHours.toFixed(2)}h`);
        }

        return observations;
    }

    // Obter nome do dia
    getDayName(dayOfWeek) {
        const days = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
        return days[dayOfWeek];
    }

    // Converter tempo para minutos
    timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    // Calcular resumo do funcionário com lógica semanal
    calculateEmployeeSummary(records) {
        if (!records || records.length === 0) {
            return {
                totalWorkedHours: 0,
                totalExtraHours: 0,
                totalDelays: 0,
                averageDailyHours: 0,
                punctualityRate: 100,
                weeklyReports: []
            };
        }

        // Agrupar registros por semana
        const weeklyGroups = this.groupRecordsByWeek(records);
        const weeklyReports = [];
        let totalExtraHours = 0;
        let totalWorkedHours = 0;
        let totalDelays = 0;

        weeklyGroups.forEach(week => {
            const weekReport = this.calculateWeeklyHours(week);
            weeklyReports.push(weekReport);
            totalExtraHours += weekReport.weeklyExtraHours;
            totalWorkedHours += weekReport.totalWorkedHours;
            totalDelays += weekReport.totalDelays;
        });

        const punctualDays = records.filter(record => (record.delayMinutes || 0) === 0).length;
        
        return {
            totalWorkedHours: Math.round(totalWorkedHours * 100) / 100,
            totalExtraHours: Math.round(totalExtraHours * 100) / 100,
            totalDelays: Math.round(totalDelays * 100) / 100,
            averageDailyHours: Math.round((totalWorkedHours / records.length) * 100) / 100,
            punctualityRate: Math.round((punctualDays / records.length) * 100),
            weeklyReports: weeklyReports
        };
    }

    // Agrupar registros por semana (domingo a sábado)
    groupRecordsByWeek(records) {
        const weeks = {};
        
        records.forEach(record => {
            const date = new Date(record.date);
            const weekKey = this.getWeekKey(date);
            
            if (!weeks[weekKey]) {
                weeks[weekKey] = {
                    weekKey: weekKey,
                    startDate: this.getWeekStartDate(date),
                    endDate: this.getWeekEndDate(date),
                    records: []
                };
            }
            
            weeks[weekKey].records.push(record);
        });
        
        return Object.values(weeks).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    }

    // Calcular horas semanais
    calculateWeeklyHours(week) {
        const records = week.records;
        let totalWorkedHours = 0;
        let totalStandardHours = 0;
        let totalDelays = 0;
        let totalEarlyExits = 0;
        let totalEarlyEntries = 0;

        // Horas padrão por dia da semana
        const standardHoursByDay = {
            0: 4,  // Domingo: 4 horas
            1: 7,  // Segunda: 7 horas
            2: 7,  // Terça: 7 horas
            3: 7,  // Quarta: 7 horas
            4: 7,  // Quinta: 7 horas
            5: 7,  // Sexta: 7 horas
            6: 7   // Sábado: 7 horas
        };

        records.forEach(record => {
            const date = new Date(record.date);
            const dayOfWeek = date.getDay();
            
            totalWorkedHours += record.totalHours || 0;
            totalStandardHours += standardHoursByDay[dayOfWeek] || 0;
            totalDelays += (record.delayMinutes || 0) / 60;
            totalEarlyExits += (record.earlyExitMinutes || 0) / 60;
            totalEarlyEntries += (record.earlyEntryMinutes || 0) / 60;
        });

        // Calcular horas extras semanais
        // Horas extras = (horas trabalhadas - horas padrão) + entradas antecipadas - atrasos - saídas antecipadas
        const baseExtraHours = Math.max(0, totalWorkedHours - totalStandardHours);
        const bonusHours = totalEarlyEntries; // Entrada antecipada é sempre extra
        const penaltyHours = totalDelays + totalEarlyExits; // Atrasos e saídas antecipadas são descontos
        
        let weeklyExtraHours = baseExtraHours + bonusHours - penaltyHours;
        
        // Se ficou negativo, significa que teve mais descontos que extras
        if (weeklyExtraHours < 0) {
            weeklyExtraHours = 0; // Ou manter negativo se quiser mostrar "dívida"
        }

        return {
            weekKey: week.weekKey,
            startDate: week.startDate,
            endDate: week.endDate,
            totalWorkedHours: Math.round(totalWorkedHours * 100) / 100,
            totalStandardHours: Math.round(totalStandardHours * 100) / 100,
            weeklyExtraHours: Math.round(weeklyExtraHours * 100) / 100,
            totalDelays: Math.round(totalDelays * 100) / 100,
            totalEarlyExits: Math.round(totalEarlyExits * 100) / 100,
            totalEarlyEntries: Math.round(totalEarlyEntries * 100) / 100,
            daysWorked: records.length,
            records: records,
            status: this.getWeekStatus(weeklyExtraHours, totalDelays, totalEarlyExits)
        };
    }

    // Obter chave da semana (domingo a sábado)
    getWeekKey(date) {
        const weekStart = this.getWeekStartDate(date);
        return weekStart.toISOString().split('T')[0];
    }

    // Obter data de início da semana (domingo)
    getWeekStartDate(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day; // Domingo = 0
        return new Date(d.setDate(diff));
    }

    // Obter data de fim da semana (sábado)
    getWeekEndDate(date) {
        const weekStart = this.getWeekStartDate(date);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return weekEnd;
    }

    // Determinar status da semana
    getWeekStatus(extraHours, delays, earlyExits) {
        if (delays > 0 || earlyExits > 0) {
            return extraHours > 0 ? 'misto' : 'com_descontos';
        } else if (extraHours > 0) {
            return 'com_extras';
        }
        return 'normal';
    }

    // Obter relatório semanal atual
    getCurrentWeekReport(employeeId) {
        const data = this.loadData();
        if (!data) return null;

        const employee = data.employees.find(emp => emp.id === employeeId);
        if (!employee) return null;

        const today = new Date();
        const currentWeekRecords = employee.records.filter(record => {
            const recordDate = new Date(record.date);
            const weekStart = this.getWeekStartDate(today);
            const weekEnd = this.getWeekEndDate(today);
            return recordDate >= weekStart && recordDate <= weekEnd;
        });

        if (currentWeekRecords.length === 0) return null;

        const weekGroup = {
            weekKey: this.getWeekKey(today),
            startDate: this.getWeekStartDate(today),
            endDate: this.getWeekEndDate(today),
            records: currentWeekRecords
        };

        return this.calculateWeeklyHours(weekGroup);
    }

    // Gerar ID único
    generateId(array) {
        return array.length > 0 ? Math.max(...array.map(item => item.id || 0)) + 1 : 1;
    }

    // Exportar dados para CSV
    exportToCSV(type = 'employees') {
        const data = this.loadData();
        if (!data) return null;

        let csv = '';
        
        if (type === 'employees') {
            csv = 'ID,Nome,Cargo,Departamento,Horas Totais,Horas Extras,Atrasos,Pontualidade\n';
            data.employees.forEach(emp => {
                csv += `${emp.id},"${emp.name}","${emp.position}","${emp.department}",${emp.summary.totalWorkedHours},${emp.summary.totalExtraHours},${emp.summary.totalDelays},${emp.summary.punctualityRate}%\n`;
            });
        } else if (type === 'records') {
            csv = 'Funcionário,Data,Entrada,Saída Almoço,Volta Almoço,Saída,Horas Totais,Horas Extras,Atraso\n';
            data.employees.forEach(emp => {
                emp.records.forEach(record => {
                    csv += `"${emp.name}","${record.date}","${record.entry}","${record.lunchOut}","${record.lunchIn}","${record.exit}",${record.totalHours},${record.extraHours},${record.delay}\n`;
                });
            });
        }

        return csv;
    }

    // Backup dos dados
    backup() {
        const data = this.loadData();
        if (!data) return null;

        const backup = {
            timestamp: new Date().toISOString(),
            version: this.version,
            data: data
        };

        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `banco_horas_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        return true;
    }

    // Restaurar backup
    restore(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const backup = JSON.parse(e.target.result);
                    if (backup.data && backup.version) {
                        this.saveData(backup.data);
                        resolve(true);
                    } else {
                        reject(new Error('Formato de backup inválido'));
                    }
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsText(file);
        });
    }

    // Limpar dados
    clearData() {
        localStorage.removeItem(this.dbName);
        console.log('🗑️ Dados limpos');
    }

    // Obter estatísticas
    getStatistics() {
        const data = this.loadData();
        if (!data) return null;

        const totalEmployees = data.employees.length;
        const totalHours = data.employees.reduce((sum, emp) => sum + emp.summary.totalWorkedHours, 0);
        const totalExtraHours = data.employees.reduce((sum, emp) => sum + emp.summary.totalExtraHours, 0);
        const averagePunctuality = data.employees.reduce((sum, emp) => sum + emp.summary.punctualityRate, 0) / totalEmployees;

        return {
            totalEmployees,
            totalHours: Math.round(totalHours * 100) / 100,
            totalExtraHours: Math.round(totalExtraHours * 100) / 100,
            averagePunctuality: Math.round(averagePunctuality * 100) / 100
        };
    }
}

// Instância global do gerenciador de banco de dados
const dbManager = new DatabaseManager();

// Exportar para uso global
window.DatabaseManager = DatabaseManager;
window.dbManager = dbManager;
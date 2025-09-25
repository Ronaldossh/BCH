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

    // Calcular horas do registro
    calculateRecordHours(record, workSchedule) {
        const entry = this.timeToMinutes(record.entry);
        const exit = this.timeToMinutes(record.exit);
        const lunchOut = this.timeToMinutes(record.lunchOut);
        const lunchIn = this.timeToMinutes(record.lunchIn);
        
        const lunchTime = lunchIn - lunchOut;
        const totalMinutes = exit - entry - lunchTime;
        const totalHours = totalMinutes / 60;
        
        const standardHours = 8; // Horas padrão
        const standardStart = this.timeToMinutes(workSchedule.startTime);
        
        record.totalHours = Math.round(totalHours * 100) / 100;
        record.extraHours = Math.max(0, totalHours - standardHours);
        record.delay = Math.max(0, (entry - standardStart) / 60);
        record.status = 'complete';
        
        return record;
    }

    // Converter tempo para minutos
    timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    // Calcular resumo do funcionário
    calculateEmployeeSummary(records) {
        if (!records || records.length === 0) {
            return {
                totalWorkedHours: 0,
                totalExtraHours: 0,
                totalDelays: 0,
                averageDailyHours: 0,
                punctualityRate: 100
            };
        }

        const totalWorkedHours = records.reduce((sum, record) => sum + record.totalHours, 0);
        const totalExtraHours = records.reduce((sum, record) => sum + record.extraHours, 0);
        const totalDelays = records.reduce((sum, record) => sum + record.delay, 0);
        const punctualDays = records.filter(record => record.delay === 0).length;
        
        return {
            totalWorkedHours: Math.round(totalWorkedHours * 100) / 100,
            totalExtraHours: Math.round(totalExtraHours * 100) / 100,
            totalDelays: Math.round(totalDelays * 100) / 100,
            averageDailyHours: Math.round((totalWorkedHours / records.length) * 100) / 100,
            punctualityRate: Math.round((punctualDays / records.length) * 100)
        };
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
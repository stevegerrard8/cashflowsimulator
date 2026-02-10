// Cash Flow Simulator Pro - Main Application
class CashFlowSimulator {
    constructor() {
        this.incomes = [];
        this.expenses = [];
        this.simulationData = null;
        this.chart = null;
        this.currentModalType = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderItems();
        
        // Add default items
        this.addDefaultItems();
    }

    addDefaultItems() {
        // Default incomes
        this.incomes = [
            { id: Date.now() + 1, name: 'Maaş Geliri', amount: 25000, frequency: 'monthly' },
            { id: Date.now() + 2, name: 'Satış Geliri', amount: 50000, frequency: 'monthly' }
        ];
        
        // Default expenses
        this.expenses = [
            { id: Date.now() + 3, name: 'Kira', amount: 8000, frequency: 'monthly' },
            { id: Date.now() + 4, name: 'Maaşlar', amount: 20000, frequency: 'monthly' },
            { id: Date.now() + 5, name: 'Operasyonel Giderler', amount: 15000, frequency: 'monthly' }
        ];
        
        this.renderItems();
    }

    setupEventListeners() {
        // Add buttons
        document.getElementById('addIncomeBtn').addEventListener('click', () => this.openModal('income'));
        document.getElementById('addExpenseBtn').addEventListener('click', () => this.openModal('expense'));
        
        // Modal controls
        document.getElementById('modalClose').addEventListener('click', () => this.closeModal());
        document.getElementById('modalCancel').addEventListener('click', () => this.closeModal());
        document.getElementById('modalSave').addEventListener('click', () => this.saveItem());
        
        // Frequency change
        document.getElementById('itemFrequency').addEventListener('change', (e) => {
            const onceMonthGroup = document.getElementById('onceMonthGroup');
            onceMonthGroup.style.display = e.target.value === 'once' ? 'block' : 'none';
        });
        
        // Action buttons
        document.getElementById('runSimulationBtn').addEventListener('click', () => this.runSimulation());
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportReport());
        document.getElementById('exportTableBtn').addEventListener('click', () => this.exportTable());
        
        // Close modal on background click
        document.getElementById('itemModal').addEventListener('click', (e) => {
            if (e.target.id === 'itemModal') this.closeModal();
        });
    }

    openModal(type) {
        this.currentModalType = type;
        const modal = document.getElementById('itemModal');
        const title = document.getElementById('modalTitle');
        
        title.textContent = type === 'income' ? 'Gelir Ekle' : 'Gider Ekle';
        
        // Reset form
        document.getElementById('itemName').value = '';
        document.getElementById('itemAmount').value = '';
        document.getElementById('itemFrequency').value = 'monthly';
        document.getElementById('onceMonthGroup').style.display = 'none';
        document.getElementById('onceMonth').value = '1';
        
        modal.classList.add('active');
    }

    closeModal() {
        document.getElementById('itemModal').classList.remove('active');
    }

    saveItem() {
        const name = document.getElementById('itemName').value.trim();
        const amount = parseFloat(document.getElementById('itemAmount').value);
        const frequency = document.getElementById('itemFrequency').value;
        const onceMonth = parseInt(document.getElementById('onceMonth').value);
        
        if (!name || !amount || amount <= 0) {
            alert('Lütfen tüm alanları doğru doldurun!');
            return;
        }
        
        const item = {
            id: Date.now(),
            name,
            amount,
            frequency,
            onceMonth: frequency === 'once' ? onceMonth : null
        };
        
        if (this.currentModalType === 'income') {
            this.incomes.push(item);
        } else {
            this.expenses.push(item);
        }
        
        this.renderItems();
        this.closeModal();
    }

    deleteItem(type, id) {
        if (!confirm('Bu kalemi silmek istediğinizden emin misiniz?')) return;
        
        if (type === 'income') {
            this.incomes = this.incomes.filter(item => item.id !== id);
        } else {
            this.expenses = this.expenses.filter(item => item.id !== id);
        }
        
        this.renderItems();
    }

    renderItems() {
        // Render incomes
        const incomeList = document.getElementById('incomeList');
        incomeList.innerHTML = this.incomes.map(item => this.renderItem(item, 'income')).join('');
        
        // Render expenses
        const expenseList = document.getElementById('expenseList');
        expenseList.innerHTML = this.expenses.map(item => this.renderItem(item, 'expense')).join('');
        
        // Add delete event listeners
        document.querySelectorAll('.item-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.dataset.type;
                const id = parseInt(e.target.dataset.id);
                this.deleteItem(type, id);
            });
        });
    }

    renderItem(item, type) {
        const frequencyText = {
            'monthly': 'Aylık',
            'quarterly': 'Üç Aylık',
            'yearly': 'Yıllık',
            'once': `Tek Seferlik (Ay ${item.onceMonth})`
        };
        
        return `
            <div class="item">
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <div class="item-details">${frequencyText[item.frequency]}</div>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div class="item-amount">₺${this.formatNumber(item.amount)}</div>
                    <button class="item-delete" data-type="${type}" data-id="${item.id}">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M6 2l1-1h2l1 1h3v2H3V2h3zM4 5h8v9H4V5z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    runSimulation() {
        const initialBalance = parseFloat(document.getElementById('initialBalance').value);
        const months = parseInt(document.getElementById('simulationMonths').value);
        const growthRate = parseFloat(document.getElementById('growthRate').value) / 100;
        const inflationRate = parseFloat(document.getElementById('inflationRate').value) / 100;
        const variability = parseFloat(document.getElementById('variability').value) / 100;
        
        if (!initialBalance || !months) {
            alert('Lütfen başlangıç bakiyesi ve simülasyon süresini girin!');
            return;
        }
        
        this.simulationData = this.calculateCashFlow(
            initialBalance, months, growthRate, inflationRate, variability
        );
        
        this.updateSummaryCards();
        this.renderChart();
        this.renderTable();
        this.generateInsights();
    }

    calculateCashFlow(initialBalance, months, growthRate, inflationRate, variability) {
        const data = [];
        let currentBalance = initialBalance;
        
        for (let month = 1; month <= months; month++) {
            const yearProgress = month / 12;
            
            // Calculate income
            let monthlyIncome = 0;
            this.incomes.forEach(income => {
                if (this.shouldApply(income, month)) {
                    const growth = 1 + (growthRate * yearProgress);
                    const variance = 1 + (Math.random() - 0.5) * 2 * variability;
                    monthlyIncome += income.amount * growth * variance;
                }
            });
            
            // Calculate expenses
            let monthlyExpense = 0;
            this.expenses.forEach(expense => {
                if (this.shouldApply(expense, month)) {
                    const inflation = 1 + (inflationRate * yearProgress);
                    const variance = 1 + (Math.random() - 0.5) * 2 * variability;
                    monthlyExpense += expense.amount * inflation * variance;
                }
            });
            
            const netCashFlow = monthlyIncome - monthlyExpense;
            const endingBalance = currentBalance + netCashFlow;
            
            data.push({
                month,
                startingBalance: currentBalance,
                income: monthlyIncome,
                expense: monthlyExpense,
                netCashFlow,
                endingBalance
            });
            
            currentBalance = endingBalance;
        }
        
        return data;
    }

    shouldApply(item, month) {
        switch (item.frequency) {
            case 'monthly':
                return true;
            case 'quarterly':
                return month % 3 === 1;
            case 'yearly':
                return month % 12 === 1;
            case 'once':
                return month === item.onceMonth;
            default:
                return false;
        }
    }

    updateSummaryCards() {
        if (!this.simulationData || this.simulationData.length === 0) return;
        
        const lastMonth = this.simulationData[this.simulationData.length - 1];
        const firstMonth = this.simulationData[0];
        
        const totalIncome = this.simulationData.reduce((sum, d) => sum + d.income, 0);
        const totalExpense = this.simulationData.reduce((sum, d) => sum + d.expense, 0);
        const netCashFlow = totalIncome - totalExpense;
        
        const avgIncome = totalIncome / this.simulationData.length;
        const avgExpense = totalExpense / this.simulationData.length;
        const avgCashFlow = netCashFlow / this.simulationData.length;
        
        // Final Balance
        document.getElementById('finalBalance').textContent = '₺' + this.formatNumber(lastMonth.endingBalance);
        const balanceChange = lastMonth.endingBalance - firstMonth.startingBalance;
        const balanceChangePercent = (balanceChange / firstMonth.startingBalance * 100).toFixed(1);
        const balanceChangeEl = document.getElementById('finalBalanceChange');
        balanceChangeEl.textContent = `${balanceChange >= 0 ? '+' : ''}₺${this.formatNumber(balanceChange)} (${balanceChangePercent}%)`;
        balanceChangeEl.className = 'card-change ' + (balanceChange >= 0 ? 'positive' : 'negative');
        
        // Total Income
        document.getElementById('totalIncome').textContent = '₺' + this.formatNumber(totalIncome);
        document.getElementById('avgIncome').textContent = '₺' + this.formatNumber(avgIncome);
        
        // Total Expense
        document.getElementById('totalExpense').textContent = '₺' + this.formatNumber(totalExpense);
        document.getElementById('avgExpense').textContent = '₺' + this.formatNumber(avgExpense);
        
        // Net Cash Flow
        document.getElementById('netCashFlow').textContent = '₺' + this.formatNumber(netCashFlow);
        document.getElementById('avgCashFlow').textContent = '₺' + this.formatNumber(avgCashFlow);
    }

    renderChart() {
        if (!this.simulationData) return;
        
        const ctx = document.getElementById('cashFlowChart').getContext('2d');
        
        if (this.chart) {
            this.chart.destroy();
        }
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.simulationData.map(d => `Ay ${d.month}`),
                datasets: [
                    {
                        label: 'Bakiye',
                        data: this.simulationData.map(d => d.endingBalance),
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Gelir',
                        data: this.simulationData.map(d => d.income),
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: false
                    },
                    {
                        label: 'Gider',
                        data: this.simulationData.map(d => d.expense),
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return context.dataset.label + ': ₺' + this.formatNumber(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: (value) => '₺' + this.formatNumber(value)
                        }
                    }
                }
            }
        });
    }

    renderTable() {
        if (!this.simulationData) return;
        
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = this.simulationData.map(d => {
            const changePercent = ((d.endingBalance - d.startingBalance) / d.startingBalance * 100).toFixed(1);
            const changeClass = d.netCashFlow >= 0 ? 'positive' : 'negative';
            
            return `
                <tr>
                    <td>Ay ${d.month}</td>
                    <td>₺${this.formatNumber(d.startingBalance)}</td>
                    <td class="positive">₺${this.formatNumber(d.income)}</td>
                    <td class="negative">₺${this.formatNumber(d.expense)}</td>
                    <td class="${changeClass}">₺${this.formatNumber(d.netCashFlow)}</td>
                    <td><strong>₺${this.formatNumber(d.endingBalance)}</strong></td>
                    <td class="${changeClass}">${changePercent}%</td>
                </tr>
            `;
        }).join('');
    }

    generateInsights() {
        if (!this.simulationData) return;
        
        const insights = [];
        const lastMonth = this.simulationData[this.simulationData.length - 1];
        const firstMonth = this.simulationData[0];
        
        const totalIncome = this.simulationData.reduce((sum, d) => sum + d.income, 0);
        const totalExpense = this.simulationData.reduce((sum, d) => sum + d.expense, 0);
        
        // Cash position
        if (lastMonth.endingBalance > firstMonth.startingBalance * 1.2) {
            insights.push({
                type: 'success',
                text: `Harika! Nakit pozisyonunuz başlangıca göre %${((lastMonth.endingBalance / firstMonth.startingBalance - 1) * 100).toFixed(0)} artmış. Güçlü bir nakit akışınız var.`
            });
        } else if (lastMonth.endingBalance < firstMonth.startingBalance) {
            insights.push({
                type: 'danger',
                text: `Dikkat! Nakit pozisyonunuz başlangıca göre azalmış. Giderleri gözden geçirmeniz veya gelir kaynaklarını çeşitlendirmeniz gerekebilir.`
            });
        }
        
        // Expense to income ratio
        const expenseRatio = (totalExpense / totalIncome * 100).toFixed(0);
        if (expenseRatio > 90) {
            insights.push({
                type: 'warning',
                text: `Giderleriniz gelirinizin %${expenseRatio}'ini oluşturuyor. Kâr marjınızı artırmak için gider optimizasyonu yapabilirsiniz.`
            });
        } else if (expenseRatio < 70) {
            insights.push({
                type: 'success',
                text: `Sağlıklı bir gider/gelir oranınız var (%${expenseRatio}). İyi bir kâr marjı sağlıyorsunuz.`
            });
        }
        
        // Negative months
        const negativeMonths = this.simulationData.filter(d => d.netCashFlow < 0).length;
        if (negativeMonths > 0) {
            insights.push({
                type: 'warning',
                text: `${negativeMonths} ay negatif nakit akışı yaşandı. Nakit rezervi oluşturarak bu dönemlere hazırlıklı olun.`
            });
        }
        
        // Trend analysis
        const firstHalf = this.simulationData.slice(0, Math.floor(this.simulationData.length / 2));
        const secondHalf = this.simulationData.slice(Math.floor(this.simulationData.length / 2));
        const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.netCashFlow, 0) / firstHalf.length;
        const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.netCashFlow, 0) / secondHalf.length;
        
        if (secondHalfAvg > firstHalfAvg * 1.1) {
            insights.push({
                type: 'success',
                text: `Pozitif trend! İkinci yarıdaki ortalama nakit akışınız ilk yarıya göre daha yüksek. İşletmeniz büyüyor.`
            });
        } else if (secondHalfAvg < firstHalfAvg * 0.9) {
            insights.push({
                type: 'warning',
                text: `Negatif trend tespit edildi. İkinci yarıdaki performans düşüş gösteriyor. Stratejinizi gözden geçirin.`
            });
        }
        
        // Recommendations
        if (this.incomes.length < 3) {
            insights.push({
                type: 'info',
                text: `Gelir kaynaklarınızı çeşitlendirmeyi düşünün. Birden fazla gelir kaynağı riski azaltır.`
            });
        }
        
        const insightsContent = document.getElementById('insightsContent');
        insightsContent.innerHTML = insights.map(insight => `
            <div class="insight insight-${insight.type}">
                ${insight.text}
            </div>
        `).join('');
    }

    exportReport() {
        if (!this.simulationData) {
            alert('Önce simülasyon çalıştırmalısınız!');
            return;
        }
        
        const reportContent = this.generateReportHTML();
        const blob = new Blob([reportContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cash-flow-report-${new Date().toISOString().split('T')[0]}.html`;
        a.click();
        URL.revokeObjectURL(url);
    }

    generateReportHTML() {
        const lastMonth = this.simulationData[this.simulationData.length - 1];
        const totalIncome = this.simulationData.reduce((sum, d) => sum + d.income, 0);
        const totalExpense = this.simulationData.reduce((sum, d) => sum + d.expense, 0);
        
        return `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>Nakit Akışı Raporu</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 1200px; margin: 0 auto; }
        h1 { color: #3b82f6; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f3f4f6; font-weight: 600; }
        .positive { color: #10b981; }
        .negative { color: #ef4444; }
    </style>
</head>
<body>
    <h1>Nakit Akışı Simülasyon Raporu</h1>
    <p><strong>Rapor Tarihi:</strong> ${new Date().toLocaleDateString('tr-TR')}</p>
    
    <h2>Özet</h2>
    <ul>
        <li>Simülasyon Süresi: ${this.simulationData.length} Ay</li>
        <li>Toplam Gelir: ₺${this.formatNumber(totalIncome)}</li>
        <li>Toplam Gider: ₺${this.formatNumber(totalExpense)}</li>
        <li>Net Akış: ₺${this.formatNumber(totalIncome - totalExpense)}</li>
        <li>Son Bakiye: ₺${this.formatNumber(lastMonth.endingBalance)}</li>
    </ul>
    
    <h2>Aylık Detay</h2>
    <table>
        <thead>
            <tr>
                <th>Ay</th>
                <th>Başlangıç</th>
                <th>Gelir</th>
                <th>Gider</th>
                <th>Net Akış</th>
                <th>Bitiş</th>
            </tr>
        </thead>
        <tbody>
            ${this.simulationData.map(d => `
                <tr>
                    <td>${d.month}</td>
                    <td>₺${this.formatNumber(d.startingBalance)}</td>
                    <td class="positive">₺${this.formatNumber(d.income)}</td>
                    <td class="negative">₺${this.formatNumber(d.expense)}</td>
                    <td class="${d.netCashFlow >= 0 ? 'positive' : 'negative'}">₺${this.formatNumber(d.netCashFlow)}</td>
                    <td>₺${this.formatNumber(d.endingBalance)}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>
        `;
    }

    exportTable() {
        if (!this.simulationData) {
            alert('Önce simülasyon çalıştırmalısınız!');
            return;
        }
        
        const csv = this.generateCSV();
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cash-flow-data-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    generateCSV() {
        const headers = ['Ay', 'Başlangıç', 'Gelir', 'Gider', 'Net Akış', 'Bitiş Bakiyesi'];
        const rows = this.simulationData.map(d => [
            d.month,
            d.startingBalance.toFixed(2),
            d.income.toFixed(2),
            d.expense.toFixed(2),
            d.netCashFlow.toFixed(2),
            d.endingBalance.toFixed(2)
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    reset() {
        if (!confirm('Tüm verileri sıfırlamak istediğinizden emin misiniz?')) return;
        
        this.incomes = [];
        this.expenses = [];
        this.simulationData = null;
        
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
        
        this.renderItems();
        document.getElementById('tableBody').innerHTML = '<tr><td colspan="7" class="no-data">Simülasyon çalıştırılmadı</td></tr>';
        document.getElementById('insightsContent').innerHTML = '<p class="no-data">Simülasyon çalıştırıldığında içgörüler burada görünecek.</p>';
        
        // Reset summary cards
        document.getElementById('finalBalance').textContent = '₺0';
        document.getElementById('finalBalanceChange').textContent = '-';
        document.getElementById('totalIncome').textContent = '₺0';
        document.getElementById('avgIncome').textContent = '₺0';
        document.getElementById('totalExpense').textContent = '₺0';
        document.getElementById('avgExpense').textContent = '₺0';
        document.getElementById('netCashFlow').textContent = '₺0';
        document.getElementById('avgCashFlow').textContent = '₺0';
        
        this.addDefaultItems();
    }

    formatNumber(num) {
        return new Intl.NumberFormat('tr-TR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    new CashFlowSimulator();
});

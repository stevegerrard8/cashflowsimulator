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
        this.addDefaultItems();
        this.renderItems();
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
        
        // Close modal on backdrop click
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', () => this.closeModal());
        }
        
        // Enter key to save in modal
        document.getElementById('itemName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('itemAmount').focus();
            }
        });
        document.getElementById('itemAmount').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.saveItem();
            }
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
        
        // Focus on name input
        setTimeout(() => {
            document.getElementById('itemName').focus();
        }, 100);
    }

    closeModal() {
        document.getElementById('itemModal').classList.remove('active');
    }

    saveItem() {
        const name = document.getElementById('itemName').value.trim();
        const amount = parseFloat(document.getElementById('itemAmount').value);
        const frequency = document.getElementById('itemFrequency').value;
        const onceMonth = parseInt(document.getElementById('onceMonth').value);
        
        if (!name) {
            alert('Lütfen kalem adını girin!');
            document.getElementById('itemName').focus();
            return;
        }
        
        if (!amount || amount <= 0) {
            alert('Lütfen geçerli bir tutar girin!');
            document.getElementById('itemAmount').focus();
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
        
        // Show success feedback
        this.showNotification(`${name} başarıyla eklendi!`, 'success');
    }

    deleteItem(type, id) {
        if (!confirm('Bu kalemi silmek istediğinizden emin misiniz?')) return;
        
        if (type === 'income') {
            this.incomes = this.incomes.filter(item => item.id !== id);
        } else {
            this.expenses = this.expenses.filter(item => item.id !== id);
        }
        
        this.renderItems();
        this.showNotification('Kalem silindi', 'info');
    }

    renderItems() {
        // Render incomes
        const incomeList = document.getElementById('incomeList');
        if (this.incomes.length === 0) {
            incomeList.innerHTML = '<div class="empty-state" style="padding: 2rem 0;"><p style="font-size: 0.875rem; color: var(--text-secondary);">Henüz gelir eklenmemiş</p></div>';
        } else {
            incomeList.innerHTML = this.incomes.map(item => this.renderItem(item, 'income')).join('');
        }
        
        // Render expenses
        const expenseList = document.getElementById('expenseList');
        if (this.expenses.length === 0) {
            expenseList.innerHTML = '<div class="empty-state" style="padding: 2rem 0;"><p style="font-size: 0.875rem; color: var(--text-secondary);">Henüz gider eklenmemiş</p></div>';
        } else {
            expenseList.innerHTML = this.expenses.map(item => this.renderItem(item, 'expense')).join('');
        }
        
        // Add delete event listeners
        document.querySelectorAll('.item-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                const id = parseInt(e.currentTarget.dataset.id);
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
        
        if (this.incomes.length === 0 && this.expenses.length === 0) {
            alert('Lütfen en az bir gelir veya gider kalemi ekleyin!');
            return;
        }
        
        this.simulationData = this.calculateCashFlow(
            initialBalance, months, growthRate, inflationRate, variability
        );
        
        this.updateSummaryCards();
        this.renderChart();
        this.renderTable();
        this.generateInsights();
        
        this.showNotification('Simülasyon başarıyla tamamlandı!', 'success');
        
        // Scroll to results
        setTimeout(() => {
            document.querySelector('.summary-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
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
        balanceChangeEl.textContent = `${balanceChange >= 0 ? '+' : ''}₺${this.formatNumber(balanceChange)} (${balanceChange >= 0 ? '+' : ''}${balanceChangePercent}%)`;
        balanceChangeEl.className = 'summary-change ' + (balanceChange >= 0 ? 'positive' : 'negative');
        
        // Total Income
        document.getElementById('totalIncome').textContent = '₺' + this.formatNumber(totalIncome);
        document.getElementById('avgIncome').textContent = '₺' + this.formatNumber(avgIncome);
        
        // Total Expense
        document.getElementById('totalExpense').textContent = '₺' + this.formatNumber(totalExpense);
        document.getElementById('avgExpense').textContent = '₺' + this.formatNumber(avgExpense);
        
        // Net Cash Flow
        document.getElementById('netCashFlow').textContent = (netCashFlow >= 0 ? '+' : '') + '₺' + this.formatNumber(netCashFlow);
        document.getElementById('avgCashFlow').textContent = (avgCashFlow >= 0 ? '+' : '') + '₺' + this.formatNumber(avgCashFlow);
    }

    renderChart() {
        if (!this.simulationData) return;
        
        const ctx = document.getElementById('cashFlowChart').getContext('2d');
        
        if (this.chart) {
            this.chart.destroy();
        }
        
        const gradient1 = ctx.createLinearGradient(0, 0, 0, 400);
        gradient1.addColorStop(0, 'rgba(102, 126, 234, 0.3)');
        gradient1.addColorStop(1, 'rgba(102, 126, 234, 0.01)');
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.simulationData.map(d => `Ay ${d.month}`),
                datasets: [
                    {
                        label: 'Bakiye',
                        data: this.simulationData.map(d => d.endingBalance),
                        borderColor: '#667eea',
                        backgroundColor: gradient1,
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: '#667eea',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    },
                    {
                        label: 'Gelir',
                        data: this.simulationData.map(d => d.income),
                        borderColor: '#38ef7d',
                        backgroundColor: 'rgba(56, 239, 125, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: false,
                        pointRadius: 3,
                        pointHoverRadius: 5,
                        pointBackgroundColor: '#38ef7d',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    },
                    {
                        label: 'Gider',
                        data: this.simulationData.map(d => d.expense),
                        borderColor: '#f45c43',
                        backgroundColor: 'rgba(244, 92, 67, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: false,
                        pointRadius: 3,
                        pointHoverRadius: 5,
                        pointBackgroundColor: '#f45c43',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
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
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#1a202c',
                        bodyColor: '#1a202c',
                        borderColor: '#e4e7f1',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: true,
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
                            callback: (value) => '₺' + this.formatNumber(value),
                            color: '#718096',
                            font: {
                                size: 12
                            }
                        },
                        grid: {
                            color: '#f3f4f6',
                            drawBorder: false
                        }
                    },
                    x: {
                        ticks: {
                            color: '#718096',
                            font: {
                                size: 12
                            }
                        },
                        grid: {
                            display: false
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
                    <td><strong>Ay ${d.month}</strong></td>
                    <td>₺${this.formatNumber(d.startingBalance)}</td>
                    <td class="positive">₺${this.formatNumber(d.income)}</td>
                    <td class="negative">₺${this.formatNumber(d.expense)}</td>
                    <td class="${changeClass}">${d.netCashFlow >= 0 ? '+' : ''}₺${this.formatNumber(d.netCashFlow)}</td>
                    <td><strong>₺${this.formatNumber(d.endingBalance)}</strong></td>
                    <td class="${changeClass}">${changePercent >= 0 ? '+' : ''}${changePercent}%</td>
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
                text: `🎉 Mükemmel! Nakit pozisyonunuz başlangıca göre %${((lastMonth.endingBalance / firstMonth.startingBalance - 1) * 100).toFixed(0)} artmış. Çok güçlü bir nakit akışına sahipsiniz.`
            });
        } else if (lastMonth.endingBalance < firstMonth.startingBalance) {
            insights.push({
                type: 'danger',
                text: `⚠️ Dikkat! Nakit pozisyonunuz başlangıca göre azalmış. Giderleri gözden geçirmeniz veya gelir kaynaklarını çeşitlendirmeniz şiddetle önerilir.`
            });
        } else {
            insights.push({
                type: 'info',
                text: `💼 Nakit pozisyonunuz dengeli kalıyor. Daha iyi sonuçlar için gelir artırma stratejileri düşünebilirsiniz.`
            });
        }
        
        // Expense to income ratio
        const expenseRatio = (totalExpense / totalIncome * 100).toFixed(0);
        if (expenseRatio > 90) {
            insights.push({
                type: 'warning',
                text: `📊 Giderleriniz gelirinizin %${expenseRatio}'ini oluşturuyor. Kâr marjınızı artırmak için gider optimizasyonu kritik öneme sahip.`
            });
        } else if (expenseRatio < 70) {
            insights.push({
                type: 'success',
                text: `✅ Harika bir gider/gelir oranınız var (%${expenseRatio}). Sağlıklı bir kâr marjı sağlıyorsunuz.`
            });
        } else {
            insights.push({
                type: 'info',
                text: `📈 Gider/gelir oranınız %${expenseRatio}. Kabul edilebilir seviyede ancak iyileştirme potansiyeli var.`
            });
        }
        
        // Negative months
        const negativeMonths = this.simulationData.filter(d => d.netCashFlow < 0).length;
        if (negativeMonths > 0) {
            const negativePercentage = (negativeMonths / this.simulationData.length * 100).toFixed(0);
            insights.push({
                type: 'warning',
                text: `📉 Dönemin %${negativePercentage}'inde (${negativeMonths} ay) negatif nakit akışı yaşandı. Nakit rezervi oluşturarak bu riskli dönemlere hazırlıklı olmalısınız.`
            });
        } else {
            insights.push({
                type: 'success',
                text: `✨ Tüm dönem boyunca pozitif nakit akışı sağladınız! Harika bir finansal yönetim.`
            });
        }
        
        // Trend analysis
        const firstHalf = this.simulationData.slice(0, Math.floor(this.simulationData.length / 2));
        const secondHalf = this.simulationData.slice(Math.floor(this.simulationData.length / 2));
        const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.netCashFlow, 0) / firstHalf.length;
        const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.netCashFlow, 0) / secondHalf.length;
        
        if (secondHalfAvg > firstHalfAvg * 1.15) {
            insights.push({
                type: 'success',
                text: `📈 Harika trend! İkinci yarıdaki ortalama nakit akışınız ilk yarıya göre %${(((secondHalfAvg / firstHalfAvg) - 1) * 100).toFixed(0)} daha yüksek. İşletmeniz güçlü bir büyüme gösteriyor.`
            });
        } else if (secondHalfAvg < firstHalfAvg * 0.85) {
            insights.push({
                type: 'warning',
                text: `📉 Olumsuz trend tespit edildi. İkinci yarıdaki performans %${((1 - (secondHalfAvg / firstHalfAvg)) * 100).toFixed(0)} düşüş gösteriyor. Stratejinizi acilen gözden geçirmelisiniz.`
            });
        }
        
        // Volatility check
        const volatility = this.calculateVolatility();
        if (volatility > 30) {
            insights.push({
                type: 'warning',
                text: `⚡ Yüksek volatilite tespit edildi (%${volatility.toFixed(0)}). Nakit akışınız tahmin edilemez. Daha istikrarlı gelir kaynakları oluşturmayı düşünün.`
            });
        } else if (volatility < 10) {
            insights.push({
                type: 'success',
                text: `🎯 Çok düşük volatilite (%${volatility.toFixed(0)}). Nakit akışınız son derece tahmin edilebilir ve istikrarlı.`
            });
        }
        
        // Recommendations
        if (this.incomes.length < 3) {
            insights.push({
                type: 'info',
                text: `💡 Öneri: Gelir kaynaklarınızı çeşitlendirmeyi düşünün. Birden fazla gelir kaynağı riski önemli ölçüde azaltır ve finansal esneklik sağlar.`
            });
        }
        
        if (lastMonth.endingBalance < firstMonth.startingBalance * 0.5) {
            insights.push({
                type: 'danger',
                text: `🚨 Acil Durum: Bakiyeniz başlangıca göre yarı yarıya düştü. Acil nakit girişi sağlamalı veya giderleri radikal şekilde azaltmalısınız.`
            });
        }
        
        const insightsContent = document.getElementById('insightsContent');
        if (insights.length === 0) {
            insightsContent.innerHTML = '<div class="empty-state"><p>Şu anda içgörü bulunmuyor</p></div>';
        } else {
            insightsContent.innerHTML = insights.map(insight => `
                <div class="insight insight-${insight.type}">
                    ${insight.text}
                </div>
            `).join('');
        }
    }

    calculateVolatility() {
        if (!this.simulationData || this.simulationData.length < 2) return 0;
        
        const cashFlows = this.simulationData.map(d => d.netCashFlow);
        const mean = cashFlows.reduce((sum, val) => sum + val, 0) / cashFlows.length;
        const variance = cashFlows.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / cashFlows.length;
        const stdDev = Math.sqrt(variance);
        
        return (stdDev / Math.abs(mean)) * 100;
    }

    exportReport() {
        if (!this.simulationData) {
            alert('Önce simülasyon çalıştırmalısınız!');
            return;
        }
        
        const reportContent = this.generateReportHTML();
        const blob = new Blob([reportContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nakit-akisi-raporu-${new Date().toISOString().split('T')[0]}.html`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Rapor başarıyla indirildi!', 'success');
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
    <title>Nakit Akışı Raporu - ${new Date().toLocaleDateString('tr-TR')}</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            padding: 40px; 
            max-width: 1200px; 
            margin: 0 auto; 
            background: #f8f9fd;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
        }
        h1 { margin: 0 0 10px 0; font-size: 2rem; }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .summary-card {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(102, 126, 234, 0.12);
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            color: #718096;
            font-size: 0.875rem;
            text-transform: uppercase;
        }
        .summary-card .value {
            font-size: 1.75rem;
            font-weight: 700;
            color: #1a202c;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0; 
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 16px rgba(102, 126, 234, 0.12);
        }
        th, td { 
            padding: 16px; 
            text-align: left; 
        }
        th { 
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
            font-weight: 700; 
            color: #1a202c;
            text-transform: uppercase;
            font-size: 0.8125rem;
        }
        td {
            border-bottom: 1px solid #e4e7f1;
        }
        .positive { color: #38ef7d; font-weight: 600; }
        .negative { color: #f45c43; font-weight: 600; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Nakit Akışı Simülasyon Raporu</h1>
        <p style="margin: 0; opacity: 0.9;"><strong>Rapor Tarihi:</strong> ${new Date().toLocaleDateString('tr-TR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })}</p>
    </div>
    
    <div class="summary">
        <div class="summary-card">
            <h3>Simülasyon Süresi</h3>
            <div class="value">${this.simulationData.length} Ay</div>
        </div>
        <div class="summary-card">
            <h3>Toplam Gelir</h3>
            <div class="value positive">₺${this.formatNumber(totalIncome)}</div>
        </div>
        <div class="summary-card">
            <h3>Toplam Gider</h3>
            <div class="value negative">₺${this.formatNumber(totalExpense)}</div>
        </div>
        <div class="summary-card">
            <h3>Son Bakiye</h3>
            <div class="value">₺${this.formatNumber(lastMonth.endingBalance)}</div>
        </div>
    </div>
    
    <h2 style="margin: 40px 0 20px 0; color: #1a202c;">📈 Aylık Detaylı Döküm</h2>
    <table>
        <thead>
            <tr>
                <th>Ay</th>
                <th>Başlangıç</th>
                <th>Gelir</th>
                <th>Gider</th>
                <th>Net Akış</th>
                <th>Bitiş Bakiyesi</th>
            </tr>
        </thead>
        <tbody>
            ${this.simulationData.map(d => `
                <tr>
                    <td><strong>Ay ${d.month}</strong></td>
                    <td>₺${this.formatNumber(d.startingBalance)}</td>
                    <td class="positive">₺${this.formatNumber(d.income)}</td>
                    <td class="negative">₺${this.formatNumber(d.expense)}</td>
                    <td class="${d.netCashFlow >= 0 ? 'positive' : 'negative'}">₺${this.formatNumber(d.netCashFlow)}</td>
                    <td><strong>₺${this.formatNumber(d.endingBalance)}</strong></td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div style="margin-top: 40px; padding: 20px; background: white; border-radius: 12px; box-shadow: 0 4px 16px rgba(102, 126, 234, 0.12);">
        <p style="margin: 0; color: #718096; font-size: 0.875rem;">
            Bu rapor Cash Flow Simulator Pro tarafından ${new Date().toLocaleString('tr-TR')} tarihinde otomatik olarak oluşturulmuştur.
        </p>
    </div>
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
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nakit-akisi-verileri-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Excel dosyası başarıyla indirildi!', 'success');
    }

    generateCSV() {
        const headers = ['Ay', 'Başlangıç', 'Gelir', 'Gider', 'Net Akış', 'Bitiş Bakiyesi'];
        const rows = this.simulationData.map(d => [
            `Ay ${d.month}`,
            d.startingBalance.toFixed(2),
            d.income.toFixed(2),
            d.expense.toFixed(2),
            d.netCashFlow.toFixed(2),
            d.endingBalance.toFixed(2)
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    reset() {
        if (!confirm('Tüm verileri sıfırlamak istediğinizden emin misiniz? Bu işlem geri alınamaz!')) return;
        
        this.incomes = [];
        this.expenses = [];
        this.simulationData = null;
        
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
        
        // Reset inputs
        document.getElementById('initialBalance').value = '100000';
        document.getElementById('simulationMonths').value = '12';
        document.getElementById('growthRate').value = '0';
        document.getElementById('inflationRate').value = '0';
        document.getElementById('variability').value = '5';
        
        this.addDefaultItems();
        this.renderItems();
        
        document.getElementById('tableBody').innerHTML = `
            <tr>
                <td colspan="7" class="no-data">
                    <div class="empty-state">
                        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                            <circle cx="32" cy="32" r="32" fill="#f3f4f6"/>
                            <path d="M32 20v24M20 32h24" stroke="#9ca3af" stroke-width="3" stroke-linecap="round"/>
                        </svg>
                        <p>Simülasyon henüz çalıştırılmadı</p>
                        <small>Başlamak için "Simülasyonu Başlat" butonuna tıklayın</small>
                    </div>
                </td>
            </tr>
        `;
        
        document.getElementById('insightsContent').innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="32" r="32" fill="#f3f4f6"/>
                    <path d="M32 20v16M32 40h.01" stroke="#9ca3af" stroke-width="3" stroke-linecap="round"/>
                </svg>
                <p>İçgörüler bekleniyor</p>
                <small>Simülasyon sonuçlarına göre öneriler burada görünecek</small>
            </div>
        `;
        
        // Reset summary cards
        document.getElementById('finalBalance').textContent = '₺0';
        document.getElementById('finalBalanceChange').textContent = '-';
        document.getElementById('totalIncome').textContent = '₺0';
        document.getElementById('avgIncome').textContent = '₺0';
        document.getElementById('totalExpense').textContent = '₺0';
        document.getElementById('avgExpense').textContent = '₺0';
        document.getElementById('netCashFlow').textContent = '₺0';
        document.getElementById('avgCashFlow').textContent = '₺0';
        
        this.showNotification('Tüm veriler sıfırlandı', 'info');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 30px;
            background: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 12px 32px rgba(102, 126, 234, 0.16);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 12px;
            animation: slideIn 0.3s ease-out;
            max-width: 400px;
        `;
        
        const colors = {
            'success': '#38ef7d',
            'danger': '#f45c43',
            'warning': '#f5576c',
            'info': '#4facfe'
        };
        
        notification.innerHTML = `
            <div style="width: 4px; height: 40px; background: ${colors[type]}; border-radius: 2px;"></div>
            <div style="flex: 1; color: #1a202c; font-weight: 500;">${message}</div>
            <button onclick="this.parentElement.remove()" style="background: none; border: none; color: #718096; cursor: pointer; font-size: 20px; padding: 0; width: 24px; height: 24px;">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        // Add slide in animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        if (!document.getElementById('notification-style')) {
            style.id = 'notification-style';
            document.head.appendChild(style);
        }
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    formatNumber(num) {
        return new Intl.NumberFormat('tr-TR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(Math.abs(num));
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    new CashFlowSimulator();
});

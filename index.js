// import autocolors from 'chartjs-plugin-autocolors';

Chart.register({
    id: 'doughnut-centertext',
    beforeDraw: function (chart) {
        const centerConfig = chart.config.options.elements?.center;
        if (!centerConfig) return;

        const metasets = chart._metasets;
        if (!metasets || metasets.length === 0 || !metasets[metasets.length - 1].data.length) return;

        const ctx = chart.ctx;
        const fontStyle = centerConfig.fontStyle || 'Arial';
        const txt = centerConfig.text || '';
        const color = centerConfig.color || '#000';
        const maxFontSize = centerConfig.maxFontSize || 75;
        const sidePadding = centerConfig.sidePadding || 20;
        const sidePaddingCalculated =
            (sidePadding / 100) *
            (metasets[metasets.length - 1].data[0].innerRadius * 2);

        ctx.font = "30px " + fontStyle;

        const stringWidth = ctx.measureText(txt).width;
        const elementWidth =
            (metasets[metasets.length - 1].data[0].innerRadius * 2) - sidePaddingCalculated;
        const widthRatio = elementWidth / stringWidth;
        const newFontSize = Math.floor(30 * widthRatio);
        const elementHeight =
            (metasets[metasets.length - 1].data[0].innerRadius * 2);

        const fontSizeToUse = Math.min(newFontSize, elementHeight, maxFontSize);
        const minFontSize = centerConfig.minFontSize || 20;
        const lineHeight = centerConfig.lineHeight || 25;
        let wrapText = false;

        if (fontSizeToUse < minFontSize) {
            wrapText = true;
        }

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
        const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
        ctx.font = fontSizeToUse + "px " + fontStyle;
        ctx.fillStyle = color;

        if (!wrapText) {
            ctx.fillText(txt, centerX, centerY);
            return;
        }

        const words = txt.split(' ');
        let line = '';
        const lines = [];

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const testWidth = ctx.measureText(testLine).width;
            if (testWidth > elementWidth && n > 0) {
                lines.push(line);
                line = words[n] + ' ';
            } else {
                line = testLine;
            }
        }

        let y = centerY - (lines.length / 2) * lineHeight;
        for (let n = 0; n < lines.length; n++) {
            ctx.fillText(lines[n], centerX, y);
            y += lineHeight;
        }
        ctx.fillText(line, centerX, y);
    }
});

Chart.register(window['chartjs-plugin-autocolors']);

const autocolors = window['chartjs-plugin-autocolors'];

let cancelBtn = document.getElementById('cancel-btn');
let saveBtn = document.getElementById('save-btn');

let addBtnIncome = document.querySelector('#add-btn[data-table="income"]');
let updateBtnIncome = document.querySelector('#update-btn[data-table="income"]');
let deleteBtnIncome = document.querySelector('#delete-btn[data-table="income"]');

let addBtnExpences = document.querySelector('#add-btn[data-table="expences"]');
let updateBtnExpenses = document.querySelector('#update-btn[data-table="expences"]');
let deleteBtnExpenses = document.querySelector('#delete-btn[data-table="expences"]');


let tableIncome = document.getElementById('table-income');
let tableExpences = document.getElementById('table-expenses');
let overlay = document.getElementById('overlay');
let popup = document.querySelector('.popup');
let masterCheckboxIncome = document.getElementById('master-checkbox-income');
let masterCheckboxExpences = document.getElementById('master-checkbox-expences');

let db;
let targetTable = null;

let incomeCtx = document.getElementById('incomeChart').getContext('2d');
let expenseCtx = document.getElementById('expenseChart').getContext('2d');

let incomesArr;
let expencesArr;

let request = indexedDB.open('finances', 1);

request.onupgradeneeded = function (event) {
    db = event.target.result;

    // Создаём хранилище объектов для доходов
    if (!db.objectStoreNames.contains("incomes")) {
        let incomesStore = db.createObjectStore("incomes", {
            keyPath: "id", // Уникальный идентификатор
            autoIncrement: true // Автоматическая генерация ключа
        });

        // Создаём индексы для быстрого поиска
        incomesStore.createIndex("by_category", "category", { unique: false });
        incomesStore.createIndex("by_date", "date", { unique: false });
    }

    // Создаём хранилище объектов для расходов
    if (!db.objectStoreNames.contains("expenses")) {
        let expensesStore = db.createObjectStore("expenses", {
            keyPath: "id",
            autoIncrement: true
        });
        expensesStore.createIndex("by_category", "category", { unique: false });
        expensesStore.createIndex("by_date", "date", { unique: false });
    }

    console.log("База данных обновлена.");
};

request.onsuccess = function (event) {
    db = event.target.result;
    loadIncome(tableIncome.id);
    loadExpences(tableExpences.id);
    console.log("База данных успешно открыта.");
};

request.onerror = function (event) {
    console.error("Ошибка при открытии базы данных:", event.target.error);
};

function loadIncome(type) {
    incomesArr = [];

    let store = addTransaction(type);

    let request = store.getAll();

    request.onsuccess = function (event) {
        let incomes = event.target.result;
        let tbody = document.querySelector('#table-income tbody');
        tbody.innerHTML = '';
        incomes.forEach(income => {
            let tr = document.createElement('tr');
            tr.innerHTML = `<td data-type="input" data-id="${income.id}"><input type="checkbox"></td>
                <td data-field="category" data-type="text">${income.category}</td><td data-field="summary" data-type=
                "number">${income.summary}</td><td data-field="date" data-type="date">${income.date}</td>`;
            tbody.appendChild(tr);
            incomesArr.push({ category: income.category, summary: Number(income.summary), date: income.date });
        });
        console.log('Данные загружены в таблицу доходов');
    };
    request.onerror = function () {
        console.log('Не удалось загрузить данные в таблицу доходов', request.error);
    }
}

function loadExpences(type) {
    expencesArr = [];

    let store = addTransaction(type);

    let request = store.getAll();

    request.onsuccess = function (event) {
        let expences = event.target.result;
        let tbody = document.querySelector('#table-expenses tbody');
        tbody.innerHTML = '';
        expences.forEach(expence => {
            let tr = document.createElement('tr');
            tr.innerHTML = `<td data-type="input" data-id=${expence.id}><input type="checkbox"></td>
                <td data-field="category" data-type="text">${expence.category}</td><td data-field="summary" data-type="number">
                ${expence.summary}</td><td date-field="date" data-type="date">${expence.date}</td>`;
            tbody.appendChild(tr);
            expencesArr.push({ category: expence.category, summary: Number(expence.summary), date: expence.date });
        }
        );
        console.log('Данные загружены в таблицу расходов');
    }
    request.onerror = function () {
        console.log('Не удалось загрузить данные в таблицу расходов', request.error);
    }
}

function addTransaction(type) {
    let storeName = type === "table-income" ? "incomes" : "expenses";
    let transaction = db.transaction([storeName], "readwrite");
    let store = transaction.objectStore(storeName);

    return store;
}

function addData(type, category, summary, date) {

    let store = addTransaction(type);

    let newTransaction = {
        category: category,
        summary: summary,
        date: date
    }

    let addRequest = store.add(newTransaction);

    addRequest.onsuccess = () => {
        console.log(`Транзакция (${type}) успешно добавлена!`);
        loadIncome('table-income');
        loadExpences('table-expenses');
        updateCharts();
    };

    addRequest.onerror = (event) => {
        console.error(`Ошибка при добавлении транзакции (${type}):`, event.target.error);
    };
}

function updateData(type, id, field, newValue) {
    let store = addTransaction(type);

    let getReq = store.get(id);
    getReq.onsuccess = () => {
        let record = getReq.result;
        if (record) {
            record[field] = newValue;
            let updateReq = store.put(record);
            updateReq.onsuccess = () => {
                console.log(`Обновлено: id=${id}, ${field} = ${newValue}`);
                loadIncome('table-income');
                loadExpences('table-expenses');
                updateCharts();
            }
            updateReq.onerror = (e) => {
                console.error("Ошибка при обновлении:", e.target.error);
            };
        }
    }
}

function deleteData(type, id) {
    let store = addTransaction(type);

    let putRequest = store.delete(id);

    putRequest.onsuccess = () => {
        console.log(`Транзакция (${type}) успешно удалена!`);
        loadIncome('table-income');
        loadExpences('table-expenses');
        updateCharts();
    };

    putRequest.onerror = (event) => {
        console.error(`Ошибка при удалении транзакции (${type}):`, event.target.error);
    };
}

function deleteAllData(type) {
    let store = addTransaction(type);

    store.clear();
    loadIncome('table-income');
    loadExpences('table-expenses');
    updateCharts();
}

addBtnIncome.addEventListener('click', () => {
    popup.style.display = 'block';
    overlay.classList.add('show');
    targetTable = tableIncome;
});

addBtnExpences.addEventListener('click', () => {
    popup.style.display = 'block';
    overlay.classList.add('show');
    targetTable = tableExpences;
});

masterCheckboxIncome.addEventListener('change', function () {
    targetTable = tableIncome;
    let isChecked = this.checked;
    let allCheckboxes = targetTable.tBodies[0].querySelectorAll('input[type="checkbox"]');
    allCheckboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
    });
});

masterCheckboxExpences.addEventListener('change', function () {
    targetTable = tableExpences;
    let isChecked = this.checked;
    let allCheckboxes = targetTable.tBodies[0].querySelectorAll('input[type="checkbox"]');
    allCheckboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
    });
})

deleteBtnIncome.addEventListener('click', () => {
    targetTable = tableIncome;
    let rows = targetTable.querySelectorAll('tbody > tr');

    if (masterCheckboxIncome.checked) {
        let isDeleteAll = confirm('Вы точно хотите удалить всё?');
        if (isDeleteAll) {
            deleteAllData(targetTable.id);
            targetTable.tBodies[0].innerHTML = '';
            masterCheckboxIncome.checked = false;
        }
    } else {
        rows.forEach(row => {
            let checkbox = row.querySelector('input');

            if (checkbox && checkbox.checked) {
                let isDeleteRow = confirm('Вы точно хотите удалить эту строку?');
                if (isDeleteRow) {
                    deleteData(targetTable.id, Number(row.cells[0].dataset.id));
                    row.remove();
                }
            }

        });
    }
    targetTable = null;
});

deleteBtnExpenses.addEventListener('click', () => {
    targetTable = tableExpences;
    let rows = targetTable.querySelectorAll('tbody > tr');

    if (masterCheckboxExpences.checked) {
        let isDeleteAll = confirm('Вы точно хотите удалить всё?');
        if (isDeleteAll) {
            deleteAllData(targetTable.id);
            targetTable.tBodies[0].innerHTML = '';
            masterCheckboxExpences.checked = false;
        }

    } else {
        rows.forEach(row => {
            let checkbox = row.querySelector('input');

            if (checkbox && checkbox.checked) {
                let isDeleteRow = confirm('Вы точно хотите удалить эту строку?');
                if (isDeleteRow) {
                    deleteData(targetTable.id, Number(row.cells[0].dataset.id));
                    row.remove();
                }
            }
        });
    }
    targetTable = null;
});

saveBtn.addEventListener('click', () => {
    let category = document.getElementById('category');
    let summary = document.getElementById('summary');
    let date = document.getElementById('date');

    if (category.value === '' || summary.value === '' || date.value === '') {
        alert('Введите пожалуйста все данные');
        return;
    }

    let tr = document.createElement('tr');
    tr.innerHTML = `<td data-type="input"><input type="checkbox"></td><td data-type="text">${category.value}</td>
        <td data-type="number">${summary.value}</td><td data-type="date">${date.value}</td>`;
    targetTable.tBodies[0].append(tr);

    addData(targetTable.id, category.value, summary.value, date.value);

    category.value = '';
    summary.value = '';
    date.value = '';
    popup.style.display = 'none';
    overlay.classList.remove('show');
    targetTable = null;
});

cancelBtn.addEventListener('click', () => {
    popup.style.display = 'none';
    overlay.classList.remove('show');
});

tableIncome.addEventListener('click', function (event) {
    let cell = event.target;
    if (cell.tagName === 'TD' && !cell.querySelector('input') && cell.dataset.type !== 'input') {
        let originalValue = cell.innerText;
        let dataType = cell.dataset.type;
        let input = document.createElement('input');
        input.classList.add('edit__cell');
        input.type = 'text';
        input.value = originalValue;
        cell.innerText = '';
        cell.appendChild(input);
        input.focus();

        function validateAndSave() {
            let newValue = input.value.trim();

            if (originalValue === newValue) {
                cell.innerHTML = newValue;
                return;
            }

            // Проверка валидности
            let isValid = true;

            if (dataType === 'number') {
                // Проверяем, является ли значение числом
                if (isNaN(newValue) || newValue === '') {
                    isValid = false;
                    alert('Введите корректное число.');
                }
            } else if (dataType === 'date') {
                // Проверяем, является ли значение датой
                let date = new Date(newValue);
                if (isNaN(date.getTime()) || newValue === '') { // .getTime() возвращает NaN для неверной даты
                    isValid = false;
                    alert('Введите корректную дату (например, ГГГГ-ММ-ДД).');
                }
            }

            if (isValid) {
                cell.innerHTML = newValue;
                let field = cell.dataset.field;
                let id = parseInt(cell.closest('tr').cells[0].dataset.id, 10);
                updateData('table-income', id, field, newValue);
            }
        }

        input.addEventListener('blur', validateAndSave);

        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                validateAndSave();
            }
        });
    }
});

tableExpences.addEventListener('click', function (event) {

    let cell = event.target;
    if (cell.tagName === 'TD' && !cell.querySelector('input') && cell.dataset.type !== 'input') {
        let originalValue = cell.innerText;
        let dataType = cell.dataset.type;
        let input = document.createElement('input');
        input.classList.add('edit__cell');
        input.type = 'text';
        input.value = originalValue;
        cell.innerText = '';
        cell.appendChild(input);
        input.focus();

        function validateAndSave() {
            let newValue = input.value.trim();

            // Проверка валидности
            let isValid = true;

            if (dataType === 'number') {
                // Проверяем, является ли значение числом
                if (isNaN(newValue) || newValue === '') {
                    isValid = false;
                    alert('Введите корректное число.');
                }
            } else if (dataType === 'date') {
                // Проверяем, является ли значение датой
                let date = new Date(newValue);
                if (isNaN(date.getTime()) || newValue === '') { // .getTime() возвращает NaN для неверной даты
                    isValid = false;
                    alert('Введите корректную дату (например, ГГГГ-ММ-ДД).');
                }
            }

            if (isValid) {
                if (originalValue === newValue) {
                    cell.innerHTML = newValue;
                    return;
                }
                cell.innerHTML = newValue;
                let field = cell.dataset.field;
                let id = parseInt(cell.closest('tr').cells[0].dataset.id, 10);
                updateData(tableExpences.id, id, field, newValue);
            }
        }

        input.addEventListener('blur', validateAndSave);

        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                validateAndSave();
            }
        });
    }
});

let incomeChart = new Chart(incomeCtx, {
    type: 'doughnut',
    data: { labels: [], datasets: [{ label: 'Доходы', data: [], hoverOffset: 4 }] },
    options: {
        elements: {
            center: {
                color: '#FF6384', // Default is #000000
                fontStyle: 'Arial', // Default is Arial
                sidePadding: 20, // Default is 20 (as a percentage)
                minFontSize: 25, // Default is 20 (in px), set to false and text will not wrap.
                lineHeight: 25 // Default is 25 (in px), used for when text wraps
            }
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            autocolors: { mode: 'data' },
            title: {
                display: true,
                text: 'Доходы',
                font: {
                    size: 20,
                    weight: 'bold'
                },
                color: '#333',
                padding: {
                    top: 10,
                    bottom: 20
                },
                align: 'center'
            },
            datalabels: {
                formatter: (value, context) => {
                    let percentage = (value / context.chart._metasets
                    [context.datasetIndex].total * 100)
                        .toFixed() + '%';
                    return percentage + '\n' + value;
                },
                color: '#fff',
                font: {
                    size: 12,
                }
            }
        }
    },
    plugins: [ChartDataLabels]
});

let expenseChart = new Chart(expenseCtx, {
    type: 'doughnut',
    data: { labels: [], datasets: [{ label: 'Расходы', data: [] }] },
    options: {
        elements: {
            center: {
                color: '#FF6384', // Default is #000000
                fontStyle: 'Arial', // Default is Arial
                sidePadding: 20, // Default is 20 (as a percentage)
                minFontSize: 20, // Default is 20 (in px), set to false and text will not wrap.
                lineHeight: 25 // Default is 25 (in px), used for when text wraps
            }
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            autocolors: { mode: 'data' },
            title: {
                display: true,
                text: 'Расходы',
                font: {
                    size: 20,
                    weight: 'bold'
                },
                color: '#333',
                padding: {
                    top: 10,
                    bottom: 20
                },
                align: 'center'
            },
            datalabels: {
                formatter: (value, context) => {
                    let percentage = (value / context.chart._metasets
                    [context.datasetIndex].total * 100)
                        .toFixed() + '%';
                    return percentage + '\n' + value;
                },
                color: '#fff',
                font: {
                    size: 12,
                }
            }
        }
    },
    plugins: [ChartDataLabels]
});

function filterByDate(data, start, end) {
    return data.filter(item => {
        let date = new Date(item.date);
        return (!start || date >= start) && (!end || date <= end);
    });
}

function aggregateByCategory(data) {
    let result = {};
    data.forEach(item => {
        if (!result[item.category]) result[item.category] = 0;
        result[item.category] += item.summary;
    });
    return result;
}

function updateCharts() {

    let startDate = document.getElementById('startDate').value ? new Date(document.getElementById('startDate').value) : null;
    let endDate = document.getElementById('endDate').value ? new Date(document.getElementById('endDate').value) : null;

    let filteredIncomes = filterByDate(incomesArr, startDate, endDate);
    let filteredExpenses = filterByDate(expencesArr, startDate, endDate);

    let incomeData = aggregateByCategory(filteredIncomes);
    let expenseData = aggregateByCategory(filteredExpenses);

    let totalIncome = filteredIncomes.reduce((sum, i) => sum + i.summary, 0);
    let totalExpences = filteredExpenses.reduce((sum, e) => sum + e.summary, 0);

    incomeChart.data.labels = Object.keys(incomeData);
    incomeChart.data.datasets[0].data = Object.values(incomeData);

    expenseChart.data.labels = Object.keys(expenseData);
    expenseChart.data.datasets[0].data = Object.values(expenseData);

    incomeChart.options.elements.center.text = `Всего\n${totalIncome} ₽`;
    expenseChart.options.elements.center.text = `Всего\n${totalExpences} ₽`;

    incomeChart.update();
    expenseChart.update();
}

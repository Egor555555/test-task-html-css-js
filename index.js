// import autocolors from 'chartjs-plugin-autocolors';

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

const request = indexedDB.open('finances', 1);

let db;
let targetTable = null;

// let labelsIncome = [];
// let categoriesIncome = [];
// let summariesIncome = [];
// let dateIncome = [];

// let labelsExpances = [];
// let categoriesExpances = [];
// let summariesExpances = [];

const incomeCtx = document.getElementById('incomeChart').getContext('2d');
const expenseCtx = document.getElementById('expenseChart').getContext('2d');

let incomess;
let expencess;

request.onupgradeneeded = function (event) {
    db = event.target.result;

    // Создаём хранилище объектов для доходов
    if (!db.objectStoreNames.contains("incomes")) {
        const incomesStore = db.createObjectStore("incomes", {
            keyPath: "id", // Уникальный идентификатор
            autoIncrement: true // Автоматическая генерация ключа
        });

        // Создаём индексы для быстрого поиска
        incomesStore.createIndex("by_category", "category", { unique: false });
        incomesStore.createIndex("by_date", "date", { unique: false });
    }

    // Создаём хранилище объектов для расходов
    if (!db.objectStoreNames.contains("expenses")) {
        const expensesStore = db.createObjectStore("expenses", {
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
    // loadDiagrams(tableIncome.id);
    console.log("База данных успешно открыта.");
};

request.onerror = function (event) {
    console.error("Ошибка при открытии базы данных:", event.target.error);
};

function loadIncome(type) {
    incomess = [];
    let store = addTransaction(type);

    let request = store.getAll();

    request.onsuccess = function (event) {
        let incomes = event.target.result;
        let tbody = document.querySelector('#table-income tbody');
        tbody.innerHTML = '';
        incomes.forEach(income => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td data-type="input" data-id="${income.id}"><input type="checkbox"></td>
                <td data-field="category">${income.category}</td><td data-field="summary">${income.summary}</td>
                <td data-field="date">${income.date}</td>`;
            tbody.appendChild(tr);
            // labelsIncome.push(income.category);
            // summariesIncome.push(Number(income.summary));
            // dateIncome.push(income.date);
            incomess.push({ category: income.category, summary: Number(income.summary), date: income.date });
        });
        // const myChart = new Chart(incomeCtx, {
        //     // plugins: [
        //     //     autocolors
        //     // ],
        //     type: 'doughnut',
        //     data: {
        //         labels: labelsIncome,
        //         datasets: [{
        //             label: 'Сумма',
        //             data: summariesIncome,
        //             backgroundColor: [
        //                 'rgba(255, 99, 132, 0.2)',
        //                 'rgba(54, 162, 235, 0.2)',
        //                 'rgba(255, 206, 86, 0.2)',
        //                 'rgba(75, 192, 192, 0.2)',
        //                 'rgba(153, 102, 255, 0.2)',
        //                 'rgba(255, 159, 64, 0.2)'
        //             ],
        //             borderColor: [
        //                 'rgba(255, 99, 132, 1)',
        //                 'rgba(54, 162, 235, 1)',
        //                 'rgba(255, 206, 86, 1)',
        //                 'rgba(75, 192, 192, 1)',
        //                 'rgba(153, 102, 255, 1)',
        //                 'rgba(255, 159, 64, 1)'
        //             ],
        //             borderWidth: 1
        //         },
        //             // {
        //             //     label: 'Дата',
        //             //     data: dateIncome,
        //             //     backgroundColor: [
        //             //         'rgba(255, 99, 132, 0.2)',
        //             //         'rgba(54, 162, 235, 0.2)',
        //             //         'rgba(255, 206, 86, 0.2)',
        //             //         'rgba(75, 192, 192, 0.2)',
        //             //         'rgba(153, 102, 255, 0.2)',
        //             //         'rgba(255, 159, 64, 0.2)'
        //             //     ],
        //             //     borderColor: [
        //             //         'rgba(255, 99, 132, 1)',
        //             //         'rgba(54, 162, 235, 1)',
        //             //         'rgba(255, 206, 86, 1)',
        //             //         'rgba(75, 192, 192, 1)',
        //             //         'rgba(153, 102, 255, 1)',
        //             //         'rgba(255, 159, 64, 1)'
        //             //     ],
        //             //     borderWidth: 1
        //             // }
        //         ]
        //     },

        // });
    };

}

function loadExpences(type) {
    expencess = [];

    let store = addTransaction(type);

    let request = store.getAll();

    request.onsuccess = function (event) {
        let expences = event.target.result;
        let tbody = document.querySelector('#table-expenses tbody');
        tbody.innerHTML = '';
        expences.forEach(expence => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td data-type="input" data-id=${expence.id}><input type="checkbox"></td>
                <td data-field="category">${expence.category}</td><td data-field="summary">${expence.summary}</td>
                <td date-field="date">${expence.date}</td>`;
            tbody.appendChild(tr);
            // labelsExpances.push(expence.category);
            // summariesExpances.push(Number(expence.summary));
            expencess.push({ category: expence.category, summary: Number(expence.summary), date: expence.date });
        });
        // const myChart = new Chart(expenseCtx, {
        //     type: 'doughnut',
        //     data: {
        //         labels: labelsExpances,
        //         datasets: [{
        //             label: 'Сумма',
        //             data: summariesExpances,
        //             backgroundColor: [
        //                 'rgba(255, 99, 132, 0.2)',
        //                 'rgba(54, 162, 235, 0.2)',
        //                 'rgba(255, 206, 86, 0.2)',
        //                 'rgba(75, 192, 192, 0.2)',
        //                 'rgba(153, 102, 255, 0.2)',
        //                 'rgba(255, 159, 64, 0.2)'
        //             ],
        //             // borderColor: [
        //             //     'rgba(255, 99, 132, 1)',
        //             //     'rgba(54, 162, 235, 1)',
        //             //     'rgba(255, 206, 86, 1)',
        //             //     'rgba(75, 192, 192, 1)',
        //             //     'rgba(153, 102, 255, 1)',
        //             //     'rgba(255, 159, 64, 1)'
        //             // ],
        //             borderWidth: 1
        //         }]
        //     },

        // });
    }
}

// function loadDiagrams(type) {
//     let store = addTransaction(type);

//     let request = store.getAll();

//     request.onsuccess = function (event) {
//         let datas = event.target.result;
//         datas.forEach(data => {
//             labelsIncome.push(data.category);
//             summariesIncome.push(Number(data.summary));
//         })
//     }

//     console.log(labelsIncome);
//     console.log(summariesIncome);
// }

// function addTransaction(type, category, summary, date) {
//     const storeName = type === "table-income" ? "incomes" : "expenses";
//     const transaction = db.transaction([storeName], "readwrite");
//     const store = transaction.objectStore(storeName);
//     const newTransaction = {
//         category: category,
//         summary: summary,
//         date: date
//     };
//     const addRequest = store.add(newTransaction);

//     addRequest.onsuccess = () => {
//         console.log(`Транзакция (${type}) успешно добавлена!`);
//     };

//     addRequest.onerror = (event) => {
//         console.error(`Ошибка при добавлении транзакции (${type}):`, event.target.error);
//     };
// }


function addTransaction(type) {
    const storeName = type === "table-income" ? "incomes" : "expenses";
    const transaction = db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);

    return store;

    // const addRequest = store.add(newTransaction);

    // addRequest.onsuccess = () => {
    //     console.log(`Транзакция (${type}) успешно добавлена!`);
    // };

    // addRequest.onerror = (event) => {
    //     console.error(`Ошибка при добавлении транзакции (${type}):`, event.target.error);
    // };
}

// function table(type) {
//     let store = addTransaction(type);

//     let datas = store.getAll();
//     if (type === 'table-income' && data.length) {
//         tableIncome.tBodies[0].innerHTML = datas.map(data => `<`)
//     }
// }

function addData(type, category, summary, date) {

    let store = addTransaction(type);

    const newTransaction = {
        category: category,
        summary: summary,
        date: date
    }

    const addRequest = store.add(newTransaction);

    addRequest.onsuccess = () => {
        console.log(`Транзакция (${type}) успешно добавлена!`);
        loadIncome('table-income');
        loadExpences('table-expenses');
        updateCharts();
    };

    addRequest.onerror = (event) => {
        console.error(`Ошибка при добавлении транзакции (${type}):`, event.target.error);
    };

    // if (type === 'table-income') {
    //     loadIncome(type);

    // } else {
    //     loadExpences(type);
    // };
}

function updateData(type, id, field, newValue) {
    let store = addTransaction(type);

    // const newTransaction = {
    //     category: category,
    //     summary: summary,
    //     date: date
    // }

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
    // const putRequest = store.put(newTransaction);

    // putRequest.onsuccess = () => {
    //     console.log(`Транзакция (${type}) успешно добавлена!`);
    // };

    // putRequest.onerror = (event) => {
    //     console.error(`Ошибка при добавлении транзакции (${type}):`, event.target.error);
    // };
}

function deleteData(type, id) {
    let store = addTransaction(type);

    const putRequest = store.delete(id);

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
    const isChecked = this.checked;
    const allCheckboxes = targetTable.tBodies[0].querySelectorAll('input[type="checkbox"]');
    allCheckboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
    });
});

masterCheckboxExpences.addEventListener('change', function () {
    targetTable = tableExpences;
    const isChecked = this.checked;
    const allCheckboxes = targetTable.tBodies[0].querySelectorAll('input[type="checkbox"]');
    allCheckboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
    });
})

deleteBtnIncome.addEventListener('click', () => {
    targetTable = tableIncome;
    let rows = targetTable.querySelectorAll('tbody > tr');

    if (masterCheckboxIncome.checked) {
        // console.log(checkboxes);
        deleteAllData(targetTable.id);
        targetTable.tBodies[0].innerHTML = '';
        masterCheckboxIncome.checked = false;
    } else {
        rows.forEach(row => {
            let checkbox = row.querySelector('input');

            if (checkbox && checkbox.checked) {
                deleteData(targetTable.id, Number(row.cells[0].dataset.id));
                row.remove();
            }

        });
    }
    targetTable = null;
});

deleteBtnExpenses.addEventListener('click', () => {
    targetTable = tableExpences;
    let rows = targetTable.querySelectorAll('tbody > tr');

    if (masterCheckboxExpences.checked) {
        // console.log(checkboxes);
        deleteAllData(targetTable.id);
        targetTable.tBodies[0].innerHTML = '';
        masterCheckboxExpences.checked = false;
    } else {
        rows.forEach(row => {
            let checkbox = row.querySelector('input');

            if (checkbox && checkbox.checked) {
                deleteData(targetTable.id, Number(row.cells[0].dataset.id));
                row.remove();
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

    if (cell.tagName === 'TD' && !cell.querySelector('input')) {
        let originalValue = cell.innerText;
        let dataType = cell.dataset.type;

        let input = document.createElement('input');
        input.type = dataType;
        input.value = originalValue;

        cell.innerText = '';
        cell.appendChild(input);
        input.focus();

        input.addEventListener('blur', function () {

            // const updateRequest = objectStore.put()
            cell.innerHTML = input.value;
            let field = cell.dataset.field;
            let id = parseInt(cell.closest('tr').cells[0].dataset.id, 10);

            updateData(tableIncome.id, id, field, input.value);
        });
        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                input.blur();
            }
        })
    }
});

tableExpences.addEventListener('click', function (event) {
    let cell = event.target;

    if (cell.tagName === 'TD' && !cell.querySelector('input')) {
        let originalValue = cell.innerText;
        let dataType = cell.dataset.type;

        let input = document.createElement('input');
        input.type = dataType;
        input.value = originalValue;

        cell.innerText = '';
        cell.appendChild(input);
        input.focus();

        input.addEventListener('blur', function () {
            cell.innerHTML = input.value;
            let field = cell.dataset.field;
            let id = parseInt(cell.closest('tr').cells[0].dataset.id, 10);
            console.log(id);

            updateData(tableExpences.id, id, field, input.value);
        });
        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                input.blur();
            }
        })
    }
});

function filterByDate(data, start, end) {
    return data.filter(item => {
        const date = new Date(item.date);
        return (!start || date >= start) && (!end || date <= end);
    });
}

function aggregateByCategory(data) {
    const result = {};
    data.forEach(item => {
        if (!result[item.category]) result[item.category] = 0;
        result[item.category] += item.summary;
    });
    return result;
}


let incomeChart = new Chart(incomeCtx, {
    type: 'doughnut',
    data: { labels: [], datasets: [{ label: 'Доходы', data: [], hoverOffset: 4 }] },
    options: {
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
        }
    }
});

let expenseChart = new Chart(expenseCtx, {
    type: 'doughnut',
    data: { labels: [], datasets: [{ label: 'Расходы', data: [] }] },
    options: {
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
        }
    }
});

function updateCharts() {

    const startDate = document.getElementById('startDate').value ? new Date(document.getElementById('startDate').value) : null;
    const endDate = document.getElementById('endDate').value ? new Date(document.getElementById('endDate').value) : null;

    const filteredIncomes = filterByDate(incomess, startDate, endDate);
    const filteredExpenses = filterByDate(expencess, startDate, endDate);

    const incomeData = aggregateByCategory(filteredIncomes);
    const expenseData = aggregateByCategory(filteredExpenses);

    incomeChart.data.labels = Object.keys(incomeData);
    incomeChart.data.datasets[0].data = Object.values(incomeData);
    incomeChart.update();

    expenseChart.data.labels = Object.keys(expenseData);
    expenseChart.data.datasets[0].data = Object.values(expenseData);
    expenseChart.update();
}

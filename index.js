let cancelBtn = document.getElementById('cancel-btn');
let saveBtn = document.getElementById('save-btn');

let addBtnIncome = document.querySelector('#add-btn[data-table="income"]');
let updateBtnIncome = document.querySelector('#update-btn[data-table="income"]');
let deleteBtnIncome = document.querySelector('#delete-btn[data-table="income"]');

let addBtnExpances = document.querySelector('#add-btn[data-table="expances"]');
let updateBtnExpanses = document.querySelector('#update-btn[data-table="expances"]');
let deleteBtnExpanses = document.querySelector('#delete-btn[data-table="expances"]');


let tableIncome = document.getElementById('table-income');
let tableExpances = document.getElementById('table-expanses');
let overlay = document.getElementById('overlay');
let popup = document.querySelector('.popup');
let masterCheckboxIncome = document.getElementById('master-checkbox-income');
let masterCheckboxExpances = document.getElementById('master-checkbox-expances');

const request = indexedDB.open('finances', 1);
let db;

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
    console.log("База данных успешно открыта.");
};

request.onerror = function (event) {
    console.error("Ошибка при открытии базы данных:", event.target.error);
};

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
    };

    addRequest.onerror = (event) => {
        console.error(`Ошибка при добавлении транзакции (${type}):`, event.target.error);
    };
}

function updateData(type, category, summary, date) {
    let store = addTransaction(type);

    const newTransaction = {
        category: category,
        summary: summary,
        date: date
    }

    const putRequest = store.put(newTransaction);

    putRequest.onsuccess = () => {
        console.log(`Транзакция (${type}) успешно добавлена!`);
    };

    putRequest.onerror = (event) => {
        console.error(`Ошибка при добавлении транзакции (${type}):`, event.target.error);
    };
}

function deleteData(type, category, summary, date) {
    let store = addTransaction(type);

    const newTransaction = {
        category: category,
        summary: summary,
        date: date
    }

    const putRequest = store.delete(newTransaction);

    putRequest.onsuccess = () => {
        console.log(`Транзакция (${type}) успешно добавлена!`);
    };

    putRequest.onerror = (event) => {
        console.error(`Ошибка при добавлении транзакции (${type}):`, event.target.error);
    };
}

function deleteAllData(type) {
    let store = addTransaction(type);

    store.clear();
}

let targetTable = null;

addBtnIncome.addEventListener('click', () => {
    popup.style.display = 'block';
    overlay.classList.add('show');
    targetTable = tableIncome;
});

addBtnExpances.addEventListener('click', () => {
    popup.style.display = 'block';
    overlay.classList.add('show');
    targetTable = tableExpances;
});

masterCheckboxIncome.addEventListener('change', function () {
    targetTable = tableIncome;
    const isChecked = this.checked;
    const allCheckboxes = targetTable.tBodies[0].querySelectorAll('input[type="checkbox"]');
    allCheckboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
    });
});

masterCheckboxExpances.addEventListener('change', function () {
    targetTable = tableExpances;
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
        deleteData(rows[1], rows[2], rows[3]);
        rows.forEach(row => {
            let checkbox = row.querySelector('input');

            if (checkbox && checkbox.checked) {
                row.remove();
            }

        });
    }
    targetTable = null;
});

deleteBtnExpanses.addEventListener('click', () => {
    targetTable = tableExpances;
    let rows = targetTable.querySelectorAll('tbody > tr');

    if (masterCheckboxExpances.checked) {
        // console.log(checkboxes);
        deleteAllData(targetTable.id);
        targetTable.tBodies[0].innerHTML = '';
        masterCheckboxExpances.checked = false;
    } else {
        rows.forEach(row => {
            let checkbox = row.querySelector('input');

            if (checkbox && checkbox.checked) {
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

    console.log(targetTable.id);

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

            const updateRequest = objectStore.put()
            cell.innerHTML = input.value;
        });
        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                input.blur();
            }
        })
    }
});

tableExpances.addEventListener('click', function (event) {
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
        });
        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                input.blur();
            }
        })
    }
});

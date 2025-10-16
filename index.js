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

updateBtnIncome.addEventListener('click', () => {

});

deleteBtnIncome.addEventListener('click', () => {
    targetTable = tableIncome;
    targetTable.tBodies[0].innerHTML = '';
    targetTable = null;
});

deleteBtnExpanses.addEventListener('click', () => {
    targetTable = tableExpances;
    targetTable.tBodies[0].innerHTML = '';
    targetTable = null;
});

saveBtn.addEventListener('click', () => {
    let category = document.getElementById('category');
    let summary = document.getElementById('summary');
    let date = document.getElementById('date');

    let tr = document.createElement('tr');
    tr.innerHTML = `<td><input type="radio"></td><td>${category.value}</td><td>${summary.value}</td>
        <td>${date.value}</td>`;
    targetTable.tBodies[0].append(tr);

    popup.style.display = 'none';
    overlay.classList.remove('show');
    targetTable = null;
});

cancelBtn.addEventListener('click', () => {
    popup.style.display = 'none';
    overlay.classList.remove('show');
});

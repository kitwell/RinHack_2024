// **************************MENU ELEMENTS***************************
let fontSizeInput = document.querySelector(".font_size_input");
let fontFamilyInput = document.querySelector(".font_family_input");
let boldInput = document.querySelector(".fa-bold");
let ItalicInput = document.querySelector(".fa-italic");
let UnderlineInput = document.querySelector(".fa-underline");
let alignInput = document.querySelector(".alignment_container");
let backgroundHInput = document.querySelector(".background_color");
let backgroundInput = document.querySelector(".fa-fill-drip");
let textColorHInput = document.querySelector(".text_color");
let textColorInput = document.querySelector(".fa-font");
let createSheetIcon = document.querySelector(".newSheet");
let sheetList = document.querySelector(".sheets-list");
let firstSheet = document.querySelector(".sheet");
//*******************************************************************
let countCol = 26;
let countRow = 100;
let BtnCol = document.querySelector(".fa-arrow-circle-right"); //col
let BtnRow = document.querySelector(".fa-arrow-circle-down"); //row


// Creating cells (A-Z)
let topRow = document.querySelector(".top_row");
for (let i = 0; i < countCol; i++) {
    let div = document.createElement("div");
    div.setAttribute("class", "cell resizable-column resizable-header");
    div.textContent = String.fromCharCode(65 + i); // ASCII for A-Z
    topRow.appendChild(div);
}

// Make topRow resizable for height
topRow.classList.add("resizable-row");

// Creating Cells (1-100)
let leftCol = document.querySelector(".left_col");
for (let i = 1; i <= countRow; i++) {
    let div = document.createElement("div");
    div.setAttribute("class", "cell resizable-row");
    div.textContent = i;
    leftCol.appendChild(div);
}

// Creating empty cells
let grid = document.querySelector(".grid");
for (let i = 0; i < 100; i++) {
    let row = document.createElement("div");
    row.setAttribute("class", "row");
    for (let j = 0; j < 26; j++) {
        let div = document.createElement("div");
        div.setAttribute("class", "cell");
        div.setAttribute("contentEditable", "true");
        div.setAttribute("rId", i);
        div.setAttribute("cId", j);
        row.appendChild(div);
    }
    grid.appendChild(row);
}

BtnCol.addEventListener("click", function (e) {
    countCol++;

    let topRow = document.querySelector(".top_row");
    let newHeader = document.createElement("div");
    newHeader.setAttribute("class", "cell resizable-column resizable-header");
    newHeader.textContent = "A" + String.fromCharCode(65 + (countCol - 27)); // ASCII for A-Z
    topRow.appendChild(newHeader);

    let grid = document.querySelector(".grid");
    grid.querySelectorAll(".row").forEach((row, rowIndex) => {
        let newCell = document.createElement("div");
        newCell.setAttribute("class", "cell");
        newCell.setAttribute("contentEditable", "true");
        newCell.setAttribute("rId", countRow);
        newCell.setAttribute("cId", countCol);
        row.appendChild(newCell);
    });

});

BtnRow.addEventListener("click", function (e) {
    countRow++;

    let leftCol = document.querySelector(".left_col");
    let rowHeader = document.createElement("div");
    rowHeader.setAttribute("class", "cell resizable-row");
    rowHeader.textContent = countRow;
    leftCol.appendChild(rowHeader);

    // Add a new row to the grid
    let grid = document.querySelector(".grid");
    let row = document.createElement("div");
    row.setAttribute("class", "row");

    for (let j = 0; j < countCol; j++) {
        let div = document.createElement("div");
        div.setAttribute("class", "cell");
        div.setAttribute("contentEditable", "true");
        div.setAttribute("rId", countRow - 1); // Adjusting for 0-based index
        div.setAttribute("cId", j);
        row.appendChild(div);
    }

    grid.appendChild(row);

});

// Adding resizable feature
let resizers = document.querySelectorAll(".resizable-column, .resizable-row");

resizers.forEach((resizer) => {
    resizer.addEventListener("mousemove", handleResize);
    resizer.addEventListener("mousedown", startResize);
});

let resizing = false;
let currentResizer, startX, startY, startWidth, startHeight;

function handleResize(e) {
    if (resizing) return;

    if (this.classList.contains("resizable-column")) {
        if (e.offsetX > this.offsetWidth - 5) {
            this.style.cursor = "col-resize";
        } else {
            this.style.cursor = "default";
        }
    } else if (this.classList.contains("resizable-row")) {
        if (e.offsetY > this.offsetHeight - 5) {
            this.style.cursor = "row-resize";
        } else {
            this.style.cursor = "default";
        }
    }
}

function startResize(e) {
    if (e.target.style.cursor === "col-resize" || e.target.style.cursor === "row-resize") {
        resizing = true;
        currentResizer = e.target;

        startX = e.pageX;
        startY = e.pageY;
        startWidth = currentResizer.offsetWidth;
        startHeight = currentResizer.offsetHeight;

        document.addEventListener("mousemove", resizeElement);
        document.addEventListener("mouseup", stopResize);
    }
}

// Функция для изменения размера элемента (обновленная версия)
function resizeElement(e) {
    if (!resizing) return;

    if (currentResizer.classList.contains("resizable-column")) {
        let newWidth = startWidth + (e.pageX - startX);
        currentResizer.style.width = newWidth + "px";

        // Найти индекс колонки на основе заголовка
        let colIndex = Array.from(topRow.children).indexOf(currentResizer);

        // Обновить ширину всех ячеек в этой колонке
        document.querySelectorAll(`.grid .row`).forEach(row => {
            let cell = row.children[colIndex];
            if (cell) {
                cell.style.width = newWidth + "px";
            }
        });

        // Обновить ширину заголовка
        let headerCell = topRow.children[colIndex];
        if (headerCell) {
            headerCell.style.width = newWidth + "px";
        }
    } else if (currentResizer.classList.contains("resizable-row")) {
        let newHeight = startHeight + (e.pageY - startY);
        currentResizer.style.height = newHeight + "px";

        if (currentResizer.classList.contains("resizable-header")) {
            // Обновить высоту заголовков строк
            document.querySelectorAll(`.top_row .cell`).forEach(cell => {
                cell.style.height = newHeight + "px";
            });
        } else {
            // Обновить высоту ячеек в этой строке
            let rowIndex = Array.from(leftCol.children).indexOf(currentResizer);
            document.querySelectorAll(`.grid .row:nth-child(${rowIndex + 1}) .cell`).forEach(cell => {
                cell.style.height = newHeight + "px";
            });
        }
    }
}




function stopResize() {
    resizing = false;
    document.removeEventListener("mousemove", resizeElement);
    document.removeEventListener("mouseup", stopResize);
}

// Creating DataBase of cell's values
let sheetsDB = [];
initDB();
let db = sheetsDB[0];

// Clicking on cell will give address using rID, cID to address Bar
let allCells = document.querySelectorAll(".grid .cell");
let addressInput = document.querySelector(".address_input");
let formulaInput = document.querySelector(".formula_input");
for (let i = 0; i < allCells.length; i++) {
    allCells[i].addEventListener("click", function (e) {
        let r = allCells[i].getAttribute("rId");
        let c = allCells[i].getAttribute("cId");
        r = Number(r);
        c = Number(c);
        addressInput.value = String.fromCharCode(c + 65) + (r + 1);

        // *********** TWO WAY BINDING ***********
        let cellObject = db[r][c];
        let fontSize = cellObject.fontSize; // fontsize
        fontSizeInput.value = fontSize;
        let fontFamily = cellObject.fontFamily; // fontfamily
        fontFamilyInput.value = fontFamily;
        boldInput.classList.remove("selected"); // bold
        if (cellObject.bold) {
            boldInput.classList.add("selected");
        }
        ItalicInput.classList.remove("selected"); // italic
        if (cellObject.italic) {
            ItalicInput.classList.add("selected");
        }
        UnderlineInput.classList.remove("selected"); // underline
        if (cellObject.underline) {
            UnderlineInput.classList.add("selected");
        }
        let options = alignInput.children; // alignment
        for (let i = 0; i < options.length; i++) {
            options[i].classList.remove("selected");
        }
        if (cellObject.halign) {
            for (let i = 0; i < options.length; i++) {
                let elementClasses = options[i].classList;
                let hAlignment = elementClasses[elementClasses.length - 1];
                if (hAlignment == cellObject.halign) {
                    elementClasses.add("selected");
                }
            }
        }
        if (cellObject.color == "") { // Text Color
            textColorInput.style.color = "black";
        } else {
            textColorInput.style.color = cellObject.color;
        }

        if (cellObject.backgroundColor == "") { // Background Color
            backgroundInput.style.color = "black";
        } else {
            backgroundInput.style.color = cellObject.backgroundColor;
        }

        formulaInput.value = cellObject.formula; // Formula Bar
    });
}

// Get First Cell
let firstCell = document.querySelector(".grid .cell[rid='0'][cid='0']");
firstCell.focus();
firstCell.click();

// Get RID CID from address
function getRidCid(address) {
    let ASCI = address.charCodeAt(0);
    let cid = (ASCI - 65);
    let rid = Number(address.substring(1)) - 1;
    return {
        rId: rid, cId: cid
    };
}

// Initializing DataBase
function initDB() {
    let db = [];
    for (let i = 0; i < 100; i++) {
        let rowArr = [];
        for (let j = 0; j < 26; j++) {
            let cellObject = {
                color: "",
                backgroundColor: "",
                fontFamily: "Arial",
                fontSize: 16,
                halign: "center",
                underline: false,
                bold: false,
                italic: false,
                value: "",
                formula: "",
                children: []
            };
            rowArr.push(cellObject);
        }
        db.push(rowArr);
    }
    sheetsDB.push(db);
}



let startCell = null;
let endCell = null;

grid.addEventListener("mousedown", function (e) {
    startCell = e.target.closest(".cell");
    endCell = startCell; // Start and end are initially the same
    clearSelection(); // Clear the previous selection when starting new selection
});

grid.addEventListener("mousemove", function (e) {
    if (startCell) {
        endCell = e.target.closest(".cell");
        highlightRange(startCell, endCell);
    }
});

grid.addEventListener("mouseup", function () {
    if (startCell && endCell) {
        let startAddress = getAddressFromCell(startCell);
        let endAddress = getAddressFromCell(endCell);
        if (formulaInput.value.includes(":")) {
            const regex = /[a-zA-Z]\d+:[a-zA-Z]\d+/;
            formulaInput.value = formulaInput.value.replace(regex, `${startAddress}:${endAddress}`);
        }
        else {formulaInput.value += `${startAddress}:${endAddress}`;}

    }
    startCell = null;
    endCell = null;
});

// Функция для снятия выделения с диапазона
function clearSelection() {
    let allCells = document.querySelectorAll(".cell");
    allCells.forEach(cell => cell.classList.remove("selected"));
}

// Функция для выделения диапазона
function highlightRange(start, end) {
    let startRow = parseInt(start.getAttribute("rId"));
    let startCol = parseInt(start.getAttribute("cId"));
    let endRow = parseInt(end.getAttribute("rId"));
    let endCol = parseInt(end.getAttribute("cId"));

    // Clear previous selection before highlighting a new range
    clearSelection();

    for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
            let cell = document.querySelector(`.cell[rId='${r}'][cId='${c}']`);
            cell.classList.add("selected");
        }
    }
}

// Функция для получения адреса ячейки
function getAddressFromCell(cell) {
    let rId = cell.getAttribute("rId");
    let cId = cell.getAttribute("cId");
    return String.fromCharCode(65 + parseInt(cId)) + (parseInt(rId) + 1);
}



// Получаем элементы контекстного меню и листов
const contextMenu = document.getElementById('context-menu');
const sheetsList = document.querySelector('.sheets-list');

// Функция для отображения контекстного меню
function showContextMenu(e, sheet) {
    e.preventDefault(); // Отключаем стандартное меню
    contextMenu.style.display = 'block';
    contextMenu.style.left = `${e.pageX}px`;
    contextMenu.style.top = `${e.pageY}px`;

    // Добавляем обработчик на "Удалить лист"
    document.getElementById('delete-sheet').onclick = () => deleteSheet(sheet);
}

// Функция для скрытия контекстного меню
function hideContextMenu() {
    contextMenu.style.display = 'none';
}

// Функция для удаления листа
function deleteSheet(sheet) {
    if (confirm(`Вы уверены, что хотите удалить лист "${sheet.textContent}"?`)) {
        // Удаляем элемент из UI
        sheet.remove();
        // Дополнительно можно обновить данные листов, если используется база данных или массив
        // db = db.filter((_, idx) => idx !== sheet.getAttribute('sheetIdx'));
    }
    hideContextMenu();
}

// Переменная для хранения текущего выделенного элемента
let activeCell = null;

// Функция для выделения ячейки
function setActiveCell(cell) {
    // Если есть уже активная ячейка, убираем выделение
    if (activeCell !== null) {
        activeCell.classList.remove('active');
    }

    // Добавляем класс выделения текущей ячейке
    activeCell = cell;
    activeCell.classList.add('active');
}

// Обработчик кликов по ячейкам таблицы
function handleCellClick(event) {
    const clickedCell = event.target;

    // Проверяем, что клик был по ячейке (например, с классом resizable-column)
    if (clickedCell.classList.contains('cell')) {
        setActiveCell(clickedCell);
    }
}

// Обработчик кликов вне grid
function handleClickOutside(event) {
    // Проверяем, что клик был вне grid (например, на body)
    if (!event.target.closest('.top_row') && !event.target.closest('.grid')) {
        // Если клик был не по элементам grid, выделение не снимается
        return;
    }
}

// Инициализация кликов
function init() {
    // Навешиваем обработчик на каждую ячейку
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });

    // Навешиваем обработчик для кликов вне grid
    document.body.addEventListener('click', handleClickOutside);
}

// Вызов функции init при загрузке страницы
document.addEventListener('DOMContentLoaded', init);


// Добавляем обработчик правого клика на все листы
sheetsList.addEventListener('contextmenu', (e) => {
    const sheet = e.target;
    if (sheet.classList.contains('sheet')) {
        showContextMenu(e, sheet);
    }
});

// Закрытие контекстного меню при клике вне его
document.addEventListener('click', (e) => {
    if (!contextMenu.contains(e.target)) {
        hideContextMenu();
    }
})

document.addEventListener('DOMContentLoaded', function() {
    const contextMenu = document.getElementById('contextMenu');
    const deleteSheet = document.getElementById('deleteSheet');
    const sheets = document.querySelectorAll('.sheet');

    // Функция для показа контекстного меню
    function showContextMenu(event) {
        event.preventDefault(); // Останавливаем стандартное контекстное меню браузера
        contextMenu.style.display = 'block'; // Показываем наше меню
        contextMenu.style.top = `${event.pageY}px`; // Устанавливаем позицию по оси Y
        contextMenu.style.left = `${event.pageX}px`; // Устанавливаем позицию по оси X
    }


    // Обработчик для удаления листа
    deleteSheet.addEventListener('click', function() {
        const activeSheet = document.querySelector('.sheet.active-sheet');
        if (activeSheet) {
            activeSheet.remove(); // Удаляем активный лист
        }
        contextMenu.style.display = 'none'; // Скрываем меню после удаления
    });
});





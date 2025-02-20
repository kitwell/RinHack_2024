let downloadBtnJSON = document.querySelector(".fa-file-code-o");
let downloadBtnXLSX = document.querySelector(".fa-file-excel-o");

downloadBtnJSON.addEventListener("click", function (e) {
    // Сохранение sheetsDB в формате JSON
    let a = document.createElement("a");
    var StringCode = encodeURIComponent(JSON.stringify(sheetsDB));
    var dataStr = "data:text/json;charset=utf-8," + StringCode;
    a.href = dataStr;
    a.download = "file.json";
    a.click();
});

downloadBtnXLSX.addEventListener("click", function (e) {
    // Сохранение db в формате XLSX
    let wb = XLSX.utils.book_new(); // Создаем новую книгу
    sheetsDB.forEach((sheet, index) => {
        let sheetData = [];
        sheet.forEach(row => {
            let rowData = row.map(cell => cell.value || "");
            sheetData.push(rowData);
        });
        let ws = XLSX.utils.aoa_to_sheet(sheetData); // Преобразуем массив в лист
        XLSX.utils.book_append_sheet(wb, ws, `Sheet ${index + 1}`); // Добавляем лист в книгу
    });

    XLSX.writeFile(wb, "MyExcel.xlsx"); // Сохраняем файл в формате XLSX
});

// Открытие файла XLSX
let openBtn = document.querySelector(".fa-external-link-square-alt");
let openInput = document.querySelector(".open_input");

openBtn.addEventListener("click", function (e) {
    openInput.click();
});

openInput.addEventListener("change", function (e) {
    let file = openInput.files[0];
    let reader = new FileReader();

    if (file.name.endsWith(".json")) {
        // Открытие файла JSON
        reader.readAsText(file);
        reader.addEventListener('load', (event) => {
            let JSONdata = JSON.parse(event.target.result);
            sheetsDB = JSONdata;
            db = sheetsDB[0];
            setUI();
            setSheets();
        });
    } else if (file.name.endsWith(".xlsx")) {
        // Открытие файла XLSX
        reader.readAsArrayBuffer(file);
        reader.onload = function (e) {
            let data = new Uint8Array(reader.result);
            let workbook = XLSX.read(data, { type: 'array' });

            sheetsDB = [];
            workbook.SheetNames.forEach(sheetName => {
                let sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
                let dbSheet = sheet.map(row => {
                    return row.map(cell => ({
                        value: cell || "",
                        color: "",
                        backgroundColor: "",
                        fontFamily: "Arial",
                        fontSize: 16,
                        halign: "center",
                        underline: false,
                        bold: false,
                        italic: false,
                        formula: "",
                        children: []
                    }));
                });
                sheetsDB.push(dbSheet);
            });

            db = sheetsDB[0];
            setUI();
            setSheets();
        };
    }
});

function setSheets() {
    for (let i = 0; i < sheetsDB.length - 1; i++) {
        sheetOpenHandler();
    }
}

// New Sheet
newInput = document.querySelector(".fa-plus-square");
newInput.addEventListener("click", function () {
    // Убираем confirm, и сразу создаем новый лист
    sheetsDB = [];
    initDB(); // Сброс db
    db = sheetsDB[0];
    setUI();
    setSheets();
});

function setUI() {
    for (let i = 0; i < 100; i++) {
        for (let j = 0; j < 26; j++) {
            let cellObject = db[i][j];
            let tobeChangedCell = document.querySelector(`.grid .cell[rid='${i}'][cid='${j}']`);
            tobeChangedCell.innerText = cellObject.value;
            tobeChangedCell.style.color = cellObject.color;
            tobeChangedCell.style.backgroundColor = cellObject.backgroundColor;
            tobeChangedCell.style.fontFamily = cellObject.fontFamily;
            tobeChangedCell.style.fontSize = cellObject.fontSize + "px";
            tobeChangedCell.style.textAlign = cellObject.halign;
            tobeChangedCell.style.textDecoration = cellObject.underline ? "underline" : "none";
            tobeChangedCell.style.fontStyle = cellObject.italic ? "italic" : "normal";
            tobeChangedCell.style.fontWeight = cellObject.bold ? "bold" : "normal";
        }
    }
}

// cell -> formula remove / value set
for (let i = 0; i < allCells.length; i++) {
    allCells[i].addEventListener("blur", function cellHelper(e) {
        let content = allCells[i].textContent.trim();
        let address = addressInput.value.toUpperCase(); // Приведение адреса к верхнему регистру
        let { rId, cId } = getRidCid(address);
        let cellObject = db[rId]?.[cId];
        if (!cellObject || cellObject.value === content) {
            return;
        }

        if (cellObject.formula) {
            removeFormula(address, cellObject.formula);
            cellObject.formula = "";
        }

        SolveUI(content, rId, cId);
    });
}

formulaInput.addEventListener("keydown", function (e) {
    let address = addressInput.value.toUpperCase(); // Приведение адреса к верхнему регистру
    let { rId, cId } = getRidCid(address);
    let tobeChangedCell = document.querySelector(`.grid .cell[rid='${rId}'][cid='${cId}']`);

    if (e.key !== "Enter") {
        // Блокируем возможность редактирования ячейки до завершения ввода формулы
        if (tobeChangedCell) {
            tobeChangedCell.setAttribute("contenteditable", "false"); // Отключаем редактирование
            tobeChangedCell.textContent = ""; // Убираем содержимое ячейки
        }
    }

    // Когда нажимается Enter, обрабатываем ввод формулы
    if (e.key === "Enter" && formulaInput.value.trim() !== "") {
        let cFormula = formulaInput.value.trim().toUpperCase(); // Приведение формулы к верхнему регистру
        let cellObject = db[rId]?.[cId];
        if (!cellObject) return;

        // Если текущая формула отличается, удаляем старую формулу
        if (cellObject.formula !== cFormula) {
            removeFormula(address, cellObject.formula);
        }

        // Оцениваем результат формулы
        let value = evaluateFormula(cFormula);
        SolveUI(value, rId, cId);
        db[rId][cId].formula = cFormula;
        setFormula(address, cFormula);

        // Разрешаем редактирование ячейки после завершения ввода формулы
        if (tobeChangedCell) {
            tobeChangedCell.setAttribute("contenteditable", "true"); // Включаем редактирование
        }
    }
});

// Функция для обработки выбора диапазона
formulaInput.addEventListener("focus", function () {
    // Пока фокус на поле ввода формулы, блокируем редактирование выбранной ячейки
    let address = addressInput.value.toUpperCase(); // Приведение адреса к верхнему регистру
    let { rId, cId } = getRidCid(address);
    let tobeChangedCell = document.querySelector(`.grid .cell[rid='${rId}'][cid='${cId}']`);

    if (tobeChangedCell) {
        tobeChangedCell.setAttribute("contenteditable", "false"); // Отключаем редактирование
        tobeChangedCell.textContent = ""; // Очищаем содержимое ячейки
    }
});


function setupFormulaSelector() {
    // Найти поле ввода формулы и datalist
    const formulaInput = document.querySelector(".formula_input");
    const formulaSelector = document.querySelector(".formuls");

    // Добавить обработчик события "change"
    formulaSelector.addEventListener("change", function () {
        const selectedFormula = formulaSelector.value;

        if (selectedFormula) {
            // Установить формулу в поле formula_input
            formulaInput.value = selectedFormula + "(";
            formulaInput.focus();

            // Очистить выбранный элемент в списке для повторного выбора
            formulaSelector.value = "";
        }
    });
  }

  // Вызвать функцию после загрузки страницы
  setupFormulaSelector();

  function evaluateFormula(formula) {
    try {
        // Приведение формулы к верхнему регистру
        formula = formula.toUpperCase();

        // Замена точек с запятой на запятые
        formula = formula.replace(/;/g, ",");

        // Проверка на арифметические выражения вида "=1+2" или "=A2+5"
        const arithmeticRegex = /^=([A-Z]\d+|\d+(\.\d+)?|[+\-*/^()\s])+$/;
        if (arithmeticRegex.test(formula)) {
            let expression = formula.slice(1).replace(/\s+/g, ""); // Удаление пробелов и удаление "="

            // Обработка ссылок на ячейки в выражении
            const regexCellReference = /([A-Z]+)(\d+)/g;
            expression = expression.replace(regexCellReference, (match, column, row) => {
                const { rId, cId } = getRidCid(`${column}${row}`);
                if (!db[rId]?.[cId]) {
                    throw new Error(`Ошибка: ячейка ${column}${row} не существует.`);
                }
                const cellValue = db[rId][cId].value;
                if (cellValue === undefined || cellValue === null || cellValue === "") {
                    return 0; // Если ячейка пустая, возвращаем 0
                }
                if (isNaN(cellValue)) {
                    throw new Error(`Ошибка: ячейка ${column}${row} содержит текстовое значение.`);
                }
                return parseFloat(cellValue); // Преобразуем значение в число
            });

            // Проверка на деление на ноль
            if (expression.includes("/0")) {
                throw new Error("Ошибка: деление на ноль.");
            }

            // Выполнение вычисления выражения
            const answer = eval(expression);
            if (!isFinite(answer)) {
                throw new Error("Ошибка: деление на ноль.");
            }
            return answer;
        }

        // Проверка на функции типа "=СУММ(A1,B2)" или "=СРЗНАЧ(A1,B2)"
        const functionRegex = /^=(СУММ|СРЗНАЧ|РАЗН|МИН|МАКС)\(([^)]+)\)$/;
        const functionMatch = formula.match(functionRegex);

        if (functionMatch) {
            const functionName = functionMatch[1];
            const expression = functionMatch[2];
            const formulaItems = expression.replace(/\s+/g, "").split(",");

            let values = [];

            formulaItems.forEach((item) => {
                if (item.includes(":")) {
                    const [start, end] = item.split(":");
                    const { rId: startRId, cId: startCId } = getRidCid(start);
                    const { rId: endRId, cId: endCId } = getRidCid(end);

                    for (let r = startRId; r <= endRId; r++) {
                        for (let c = startCId; c <= endCId; c++) {
                            if (!db[r]?.[c]) {
                                throw new Error(`Ошибка: ячейка ${r}${c} не существует.`);
                            }
                            const cellValue = db[r][c].value;
                            if (cellValue === undefined || cellValue === null || cellValue === "") {
                                values.push(0); // Если ячейка пустая, добавляем 0
                            } else if (isNaN(cellValue)) {
                                throw new Error(`Ошибка: ячейка ${r}${c} содержит текстовое значение.`);
                            } else {
                                values.push(parseFloat(cellValue));
                            }
                        }
                    }
                } else {
                    const { rId, cId } = getRidCid(item);
                    if (!db[rId]?.[cId]) {
                        throw new Error(`Ошибка: ячейка ${item} не существует.`);
                    }
                    const cellValue = db[rId][cId].value;
                    if (cellValue === undefined || cellValue === null || cellValue === "") {
                        values.push(0); // Если ячейка пустая, добавляем 0
                    } else if (isNaN(cellValue)) {
                        throw new Error(`Ошибка: ячейка ${item} содержит текстовое значение.`);
                    } else {
                        values.push(parseFloat(cellValue));
                    }
                }
            });

            if (functionName === "СУММ") {
                return values.reduce((sum, value) => sum + value, 0);
            } else if (functionName === "СРЗНАЧ") {
                return (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2); // Среднее значение с двумя знаками после запятой
            } else if (functionName === "РАЗН") {
                return values.reduce((sum, value) => sum - value, 0);
            } else if (functionName === "МИН") {
                return Math.min(...values);
            } else if (functionName === "МАКС") {
                return Math.max(...values);
            }
        }

        // Если формат не распознан
        throw new Error("Ошибка: неверный формат формулы.");
    } catch (error) {
        return "Ошибка!";
    }
}



function SolveUI(value, rId, cId) {
    let tobeChangedCell = document.querySelector(`.grid .cell[rid='${rId}'][cid='${cId}']`);
    tobeChangedCell.textContent = value;
    db[rId][cId].value = value;

    let childrenA = db[rId][cId].children || [];
    for (let i = 0; i < childrenA.length; i++) {
        let chRidCid = getRidCid(childrenA[i]);
        let chCellObj = db[chRidCid.rId]?.[chRidCid.cId];

        if (chCellObj && chCellObj.formula) {
            let value = evaluateFormula(chCellObj.formula);
            SolveUI(value, chRidCid.rId, chRidCid.cId);
        }
    }
}

// to set a cell as children of a cell
function setFormula(address, formula) {
    let formulaA = formula.match(/[A-Z]\d+/g); // Извлекаем только ссылки на ячейки
    if (!formulaA) return;

    for (let i = 0; i < formulaA.length; i++) {
        let parentObj = getRidCid(formulaA[i]);
        let parentCell = db[parentObj.rId]?.[parentObj.cId];
        if (!parentCell) {
            continue;
        }

        let children = parentCell.children || [];
        if (!children.includes(address)) {
            children.push(address);
            db[parentObj.rId][parentObj.cId].children = children;
        }
    }
}

// to remove a cell as children of a cell
function removeFormula(address, formula) {
    if (!formula) return;

    let formulaEntities = formula.match(/[A-Z]\d+/g); // Извлекаем только ссылки на ячейки
    if (!formulaEntities) return;

    for (let i = 0; i < formulaEntities.length; i++) {
        let parentrcObj = getRidCid(formulaEntities[i]);
        let parentCell = db[parentrcObj.rId]?.[parentrcObj.cId];
        if (!parentCell) {
            continue;
        }

        let children = parentCell.children || [];
        let idx = children.indexOf(address);
        if (idx !== -1) {
            children.splice(idx, 1);
        }
    }
}

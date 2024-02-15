// tableDragAndDrop.js

// Add this variable to keep track of the column order
let columnOrder = [1, 2, 3, 4, 5]; // Assuming 5 columns including the link column

function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.index);
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    const toIndex = parseInt(e.target.dataset.index);

    // Swap the column indices in the columnOrder array
    const temp = columnOrder[fromIndex];
    columnOrder[fromIndex] = columnOrder[toIndex];
    columnOrder[toIndex] = temp;

    // Call a function to update the table based on the new column order
    updateTable();
}

function updateTable() {
    const jobsTable = document.getElementById('jobsTable');
    const headerRow = jobsTable.rows[0];

    // Rearrange the cells in the header row based on the columnOrder
    columnOrder.forEach((newIndex, oldIndex) => {
        headerRow.appendChild(headerRow.cells[newIndex]);
    });

    // Update the order of cells in each data row
    for (let i = 1; i < jobsTable.rows.length; i++) {
        const row = jobsTable.rows[i];
        for (let j = 0; j < columnOrder.length; j++) {
            const newIndex = columnOrder[j];
            row.appendChild(row.cells[newIndex]);
        }
    }
}

// Add these event listeners to the header cells to enable drag and drop
const headerCells = document.querySelectorAll('#jobsTable th');
headerCells.forEach((cell, index) => {
    cell.draggable = true;
    cell.dataset.index = index;
    cell.addEventListener('dragstart', handleDragStart);
    cell.addEventListener('dragover', handleDragOver);
    cell.addEventListener('drop', handleDrop);
});

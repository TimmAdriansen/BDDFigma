const dropArea = document.getElementById('dropArea');
const xmlFileInput = document.getElementById('xmlFileInput');
const output = document.getElementById('output');

console.log("hola autist");

// Prevent the default behavior of the browser when a file is dragged over the drop area.
dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.style.border = '2px dashed #333';
});

// Restore the drop area's style when the dragged file leaves.
dropArea.addEventListener('dragleave', () => {
    dropArea.style.border = '2px dashed #ccc';
});

// Handle the dropped file.
//We can change this to only allow feature files if we can get it to work in the future :)
dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.style.border = '2px dashed #ccc';

    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.xml')) {
        readXMLFile(file);
    } else {
        alert('Please drop a valid XML file.');
    }
});

// Clicking on the drop area triggers the file input element.
dropArea.addEventListener('click', () => {
    xmlFileInput.click();
});

// Handle file selection through the file input element.
xmlFileInput.addEventListener('change', () => {
    const file = xmlFileInput.files[0];
    if (file && file.name.endsWith('.xml')) {
        readXMLFile(file);
    } else {
        alert('Please select a valid XML file.');
    }
});

// Read and display the content of the XML file.
function readXMLFile(file) {
    const reader = new FileReader();

    reader.onload = (event) => {
        const xmlContent = event.target.result;
        output.textContent = xmlContent;
        console.log("HELLOOOOOOOO");
        console.log('XML content:', xmlContent);
    };

    reader.readAsText(file);
}
//VARIABLE PREDEFINED
let story_data = { "summary": "", "rationale": "", "story": ""};
let storySave = 1;
let timeline_data = {};
let timelineSave = 1;
let currentRowId = null;
let timelineNextId = 1;

let standardsData = {};

let isStoryTextAreaVisible = false;
let isTimelineTextAreaVisible = false;
  
//////////////////////////RELEVANT TO BOTH//////////////////////////
// text area code
document.getElementById('toggleStoryText').addEventListener('click', function() {
    const textArea = document.getElementById('storyTextArea');
    if (isStoryTextAreaVisible) {
        textArea.style.display = 'none';
        isStoryTextAreaVisible = false;
    } else {
        textArea.style.display = 'block';
        isStoryTextAreaVisible = true;
    }
});
document.getElementById('toggleTimelineText').addEventListener('click', function() {
  const textArea = document.getElementById('timelineTextArea');
  if (isTimelineTextAreaVisible) {
      textArea.style.display = 'none';
      isTimelineTextAreaVisible = false;
  } else {
      textArea.style.display = 'block';
      isTimelineTextAreaVisible = true;
  }
});


// JSON Export code
document.getElementById('saveAllJSONButton').addEventListener('click', exportAllJSON);

function exportAllJSON() {
  // Combine the two data structures
  let combinedData = {
    ...story_data,
    "time_line": Object.values(timeline_data) // Convert timeline_data from an object to an array
  };

  // Convert the combined data to a JSON string with formatting
  let jsonString = JSON.stringify(combinedData, null, 2);

  // Create a downloadable blob from the JSON string
  let blob = new Blob([jsonString], { type: "application/json" });
  let url = window.URL.createObjectURL(blob);

  // Create a download link and click it
  let a = document.createElement("a");
  a.href = url;
  a.download = "patientOutput.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}


//JSON import code
document.getElementById('importPatientInfo').addEventListener('change', handleFileImport);

function handleFileImport(event) {
  if (event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = function(e) {
          const importedData = JSON.parse(e.target.result);
          story_data.summary = importedData.summary;
          story_data.rationale = importedData.rationale;
          story_data.story = importedData.story;
          
          // Update predefined keys in story_data
          for (let key in story_data) {
            if (importedData[key]) {
                story_data[key] = importedData[key];
            }
        }
          
          console.log("Story Data Updated:", story_data);
          updateStoryDisplay();
          updateStoryTable();


          console.log("Story Text Area should have updated");

          // Populate timeline_data
          timeline_data = {};
          importedData.time_line.forEach((item, index) => {
            timeline_data[index] = item;
          });

          console.log("Timeline Data Imported:", timeline_data);
          
          renderTimelineTable();
          updateTimelineDisplay(); // This function should refresh your display based on the new timeline_data
      };

      reader.onerror = function(err) {
          console.error("Error reading file:", err);
      };

      reader.readAsText(file);
  }
}



///////////////////////////STORY//////////////////////////
//story text area update

function updateStoryDisplay() {
  document.getElementById('storyTextArea').textContent = JSON.stringify(story_data, null, 2);
}

function updateStoryTable() {
  document.querySelectorAll("[data-key]").forEach(function(row) {
      const key = row.getAttribute('data-key');
      const tdElement = row.querySelector('td');
      if (!tdElement) {
          console.warn(`Skipped updating [data-key="${key}"] due to missing <td> element.`);
          return;  // skip this iteration if <td> is not found
      }
      tdElement.textContent = story_data[key] || "";
  });
}


//story story_data variable update
document.getElementById("storyTableBody").addEventListener('input', function (e) {
  console.log("update story data")
  if (e.target && e.target.nodeName === "TD") {
      const row = e.target.closest('tr');
      const key = row.getAttribute('data-key');
      story_data[key] = e.target.textContent;
      updateStoryDisplay();
  }
});




///////////////////////////TIMELINE//////////////////////////
// timeline textarea e update
function updateTimelineDisplay() {
  document.getElementById('timelineTextArea').textContent = JSON.stringify(timeline_data, null, 2);
}

//export timeline code
function downloadJSON(data, filename) {
  const jsonData = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}


//timeline variable to table render code (used for import)
function renderTimelineTable() {
  let tableContent = "";
  for (let id in timeline_data) {
    const rowData = timeline_data[id];
    tableContent += `
      <tr id="row-${id}">
        <td data-key="time" contenteditable="true" class="text-left">${rowData.time}</td>
        <td data-key="event" contenteditable="true" class="text-left">${rowData.event}</td>
        <td>
          <button id="dataItemBtn-${id}" onclick="toggleDataItem(${id})">${rowData.linkedData.length > 0 ? 'Edit' : 'Add'}</button>
        </td>
        <td>
          <button class="btn btn-danger delete-row">Delete</button>
        </td>
      </tr>
    `;
  }
  document.getElementById("timelineTableBody").innerHTML = tableContent;
}


//standards dropdown populate
function populateStandardsDropdown(standards) {
  console.log("Populating Standards: ", standards);
  const dropdown = document.getElementById('standardsDropdown');
  dropdown.innerHTML = "";
  standards.forEach((standard, index) => {
      const option = document.createElement('option');
      option.value = standard;
      option.textContent = standard;
      dropdown.appendChild(option);
  });
}

//transform main timeline for export
function transformMainTimeline(original) {
  let result = [];

  for (let key in original) {
    let item = original[key];
    let transformed = {
      time: item.time,
      event: item.event,
      sheet: item.linkedData && item.linkedData.length > 0 ? item.id.toString() : "None"
    };

    result.push(transformed);
  }

  return result;
}

//generate linked data files
function generateLinkedDataFiles(original) {
  let files = {};

  for (let key in original) {
    let item = original[key];
    if (item.linkedData && item.linkedData.length > 0) {
      let filename = `linkedData_${item.id}.json`;
      let linkedDataArray = [{ standard: item.standard }, ...item.linkedData];
      files[filename] = linkedDataArray;
    }
  }

  return files;
}



const dropdown = document.getElementById('dropdown');
const popupWindow = document.getElementById('popupWindow');
const closePopupBtn = document.getElementById('closePopupBtn');
const popupContentText = document.getElementById('popupContentText');

dropdown.addEventListener('change', function() {
    const regex = /\[.*?\]/;
    if (regex.test(this.value)) {
        popupContentText.textContent = this.value;
        popupWindow.style.display = "block";
    }
});

closePopupBtn.addEventListener('click', function() {
    popupWindow.style.display = "none";
});

window.addEventListener('click', function(event) {
    if (event.target === popupWindow) {
        popupWindow.style.display = "none";
    }
});







//timeline main DOM
document.addEventListener("DOMContentLoaded", function() {
  const linkedDataModal = document.getElementById("editModal");
  const closeLinkedData = document.getElementById("closeLinkedData");

  // save linked data to JSON
  function saveLinkedDataToJSON() {
    const obj = timeline_data[currentRowId];
    const dropdown = document.getElementById('standardsDropdown');
    const selectedStandard = dropdown ? dropdown.value : null;

    obj.linkedData = [];  // Resetting linkedData to an empty array
    const rows = document.querySelectorAll("#linkedDataTableBody tr");
    rows.forEach(row => {
      const cells = row.querySelectorAll("td");
      obj.linkedData.push({
        dataPath: cells[0].querySelector('select').value,
        exampleData: cells[1].textContent
      });
    });
    
    obj.standard = selectedStandard;  // Setting the standard
  }

  // update timeline text area
  function updateTimelineDisplay() {
    const timelineTextAreaElem = document.getElementById("timelineTextArea");
    if (timelineTextAreaElem) {
      timelineTextAreaElem.value = JSON.stringify(timeline_data, null, 2);
    }
  }

  // populate pop up table when triggered
  function populateLinkedDataModal(rowId) {
    const obj = timeline_data[rowId];
    let tableContent = "";
    if (obj && obj.linkedData) {
      obj.linkedData.forEach((dataItem, index) => {
        let options = "";
        const paths = standardsData[obj.standard]?.dataPaths || [];
        paths.forEach(path => {
            options += `<option value="${path}"${dataItem.dataPath === path ? ' selected' : ''}>${path}</option>`;
        });
  
        tableContent += `
          <tr>
            <td>
              <select>
                ${options}
              </select>
            </td>
            <td contenteditable="true" class="text-left">${dataItem.exampleData || ''}</td>
            <td>
              <button class="btn btn-danger" onclick="deleteLinkedDataRow(this, ${index})">Delete</button>
            </td>
          </tr>
        `;
      });
    }
    document.getElementById("linkedDataTableBody").innerHTML = tableContent;
  }

  //add blank row to pop up table
  window.addLinkedDataRow = function() {
    console.log("Adding blank linked data row")

    const selectedStandard = document.getElementById('standardsDropdown').value;
    console.log("standardDataPaths:", standardsData);
    console.log("selectedStandard:", selectedStandard);

    //WOMAN WHAT IS THIS M8
    const defaultPaths = standardsData[selectedStandard]?.dataPaths || [];

    console.log("defaultPaths" + defaultPaths)
    let options = "";
    defaultPaths.forEach(path => {
      options += `<option value="${path}">${path}</option>`;
    });

    console.log("options here" + options)
  
    const newRow = `
      <tr>
        <td>
          <select>
            ${options}
          </select>
        </td>
        <td contenteditable="true" class="text-left"></td>
        <td>
          <button class="btn btn-danger" onclick="deleteLinkedDataRow(this)">Delete</button>
        </td>
      </tr>
    `;
  
    document.getElementById("linkedDataTableBody").innerHTML += newRow;
    const tbody = document.getElementById("linkedDataTableBody");
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = newRow;
    tbody.appendChild(tempDiv.firstChild);
  }
  
  // delete row from timeline json
  window.deleteRow = function(rowId) {
    delete timeline_data[rowId];
    const rowElement = document.getElementById("row-" + rowId);
    if (rowElement) {
      rowElement.remove();
    }
    updateTimelineDisplay();
  }

  // reset linked data when deleted
  window.resetLinkedData = function() {
    const obj = timeline_data[currentRowId];
    if (obj) {
      obj.linkedData = [];
      delete obj.standard;
    }
    const btn = document.getElementById("dataItemBtn-" + currentRowId);
    if (btn) {
      btn.innerText = "Add";
    }
    linkedDataModal.style.display = "none";
    updateTimelineDisplay();
  }

  // switch between Add and Edit for row
  window.toggleDataItem = function(rowId) {
    const btn = document.getElementById("dataItemBtn-" + rowId);
    if (btn.innerText === "Add" || btn.innerText === "Edit") {
      btn.innerText = "Edit";
      currentRowId = rowId;
      linkedDataModal.style.display = "block"; 
      populateLinkedDataModal(rowId);
    } else {
      btn.innerText = "Add";
      currentRowId = null;
    }
  }

  // delete row from pop up table
  window.deleteLinkedDataRow = function(buttonElem, index) {
    buttonElem.parentElement.parentElement.remove();
    timeline_data[currentRowId].linkedData.splice(index, 1);  // Remove the corresponding object from linkedData
    saveLinkedDataToJSON();
    updateTimelineDisplay();
  }

  // close pop up table
  closeLinkedData.onclick = function() {
    linkedDataModal.style.display = "none";
    saveLinkedDataToJSON();
    updateTimelineDisplay();
  }
  
  // close pop up table when clicked outside
  linkedDataModal.addEventListener("click", function(event) {
    if (event.target === linkedDataModal) {
      linkedDataModal.style.display = "none";
    }
  });

  //add blank row to timeline
  document.getElementById("addBlankRowBtn").addEventListener("click", function() {
    console.log("Adding blank timeline row")

    timeline_data[timelineNextId] = {
      time: "",
      event: "",
      standard: null,
      linkedData: []
    };
    
    const newRow = `
      <tr id="row-${timelineNextId}">
        <td data-key="time" contenteditable="true" class="text-left"></td>
        <td data-key="event" contenteditable="true" class="text-left"></td>
        <td>
          <button id="dataItemBtn-${timelineNextId}" onclick="toggleDataItem(${timelineNextId})">Add</button>
        </td>
        <td>
          <button class="btn btn-danger delete-row">Delete</button>
        </td>
      </tr>
    `;
  
    document.getElementById("timelineTableBody").innerHTML += newRow;
    timelineNextId++;
    updateTimelineDisplay();
  });

  // standards file import
  document.getElementById('standardsFileLoadButton').addEventListener('change', function(e) {
    console.log("File change event triggered");
    const files = e.target.files;
    if (!files.length) return;
    
    Array.from(files).forEach((file, fileIndex) => {
      const reader = new FileReader();
      reader.onload = function(e) {
          const contents = JSON.parse(e.target.result);
          console.log("File Contents:", contents);

          // Using file name as standard name (removing .json extension)
          const standardName = file.name.replace('.json', '');
          
          if(standardName) {
              standardsData[standardName] = {
                  dataPaths: contents.filter(Boolean) // Remove any falsy values from the data paths (like empty strings)
              };
          }

          // If it's the last file, update the dropdown
          if(fileIndex === files.length-1) {
              populateStandardsDropdown(Object.keys(standardsData));
              console.log("Standards Data:", standardsData);
          }
      };
      reader.readAsText(file); // We still read as text but then parse the result as JSON
    });
});

// delete timeline table row
  document.getElementById("timelineTableBody").addEventListener("click", function(event) {
    if (event.target && event.target.matches(".delete-row")) {
      const rowElement = event.target.closest("tr");
      if (rowElement && rowElement.id) {
        const rowId = parseInt(rowElement.id.split("-")[1]);
        delete timeline_data[rowId];
        rowElement.remove();
        updateTimelineDisplay();
      }
    }
  });
  
  // update timeline json + text area when value changes
  document.getElementById("timelineTableBody").addEventListener("input", function(event) {
    const cell = event.target.closest("td");
    if (cell && cell.hasAttribute("data-key")) {
      const key = cell.getAttribute("data-key");
      const rowElement = cell.closest("tr");
      if (rowElement && rowElement.id) {
        const rowId = parseInt(rowElement.id.split("-")[1]);
        timeline_data[rowId][key] = cell.textContent;
        updateTimelineDisplay();
      }
    }
  });

  // when linkeddatatable is no longer a fous, update JSON and timeline display
  document.getElementById("linkedDataTableBody").addEventListener("blur", function(event) {
    saveLinkedDataToJSON();
    updateTimelineDisplay();
  }, true);

  // update pop up table when standard changes IDK
  document.getElementById("linkedDataTableBody").addEventListener("change", function(event) {
    if (event.target && event.target.matches(".standard-dropdown")) {
      saveLinkedDataToJSON();
      updateTimelineDisplay();
    }
  }, true);

  // update pop up table when standard changes
  document.getElementById('standardsDropdown').addEventListener('change', function(event) {

    const selectedStandard = event.target.value;
    const paths = standardsData[selectedStandard]?.dataPaths || [];
    console.log("Selected Standard:", selectedStandard);
    console.log("Paths:", paths);

    document.querySelectorAll('#linkedDataTableBody select').forEach(selectElement => {
        selectElement.innerHTML = paths.map(path => `<option value="${path}">${path}</option>`).join('');
    });

    saveLinkedDataToJSON();
    updateTimelineDisplay();
  });
});
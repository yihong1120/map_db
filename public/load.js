// Fetch regions and populate the "Choose Region" dropdown
fetch('/regions')
.then(response => response.json())
.then(data => {
    const regionSelect = document.getElementById('Region');
    data.forEach(region => {
        const option = document.createElement('option');
        option.value = region.code; 
        option.text = region.regionname;
        regionSelect.appendChild(option);
    });
});

const regionSelect = document.getElementById('Region');
const caseSelect = document.getElementById('Case');

// Event listener for region selection
regionSelect.addEventListener('change', function () {
    const selectedRegion = encodeURIComponent(regionSelect.options[regionSelect.selectedIndex].text);
    // console.log("selectedRegion: "+selectedRegion);

    // Fetch cases for the selected region
    fetch(`/cases?region=${selectedRegion}`)
        .then(response => response.json())
        .then(data => {
            // Clear existing options
            // console.log(data);
            caseSelect.innerHTML = '<option selected>Choose Case</option>';

            // Populate the "Choose Case" dropdown with the retrieved cases
            data.forEach(caseData => {
                const option = document.createElement('option');
                option.value = caseData.caseseq;
                option.text = caseData.casename;
                caseSelect.appendChild(option);
                // console.log(`caseData.caseseq: ${caseData.caseseq}`);
                // console.log(`option.value: ${option.value}`);
            });
        })
        .catch(error => console.error('Error fetching cases', error));
});

// Event listener for case selection
caseSelect.addEventListener('change', function () {
    const selectedRegion = regionSelect.value;
    const selectedCase = caseSelect.value;
    // console.log("selectedRegion: "+selectedRegion);
    // console.log("selectedCase: "+selectedCase);

    // Fetch details for the selected case in the selected region
    fetch(`/details?region=${selectedRegion}&case=${selectedCase}`)
        .then(response => response.json())
        .then(details => {
            // console.log(details);
            // Populate the table with the retrieved details
            const table = document.querySelector(".table")
            //初始化表格
            for (let i = 1; i < 5; i++) {
                table.rows[i].cells[1].textContent = "x";
                table.rows[i].cells[2].textContent = "x";
                table.rows[i].cells[3].textContent = "x";
                table.rows[i].cells[4].textContent = "x";
            }
            // console.log(details.length); // 4

            for (let i = 1; i <= details.length; i++) {
                table.rows[i].cells[1].textContent = details[i-1].casename;
                table.rows[i].cells[2].textContent = details[i-1].hr24;
                table.rows[i].cells[3].textContent = details[i-1].ha;
                table.rows[i].cells[4].textContent = details[i-1].depth;
            }
        })
        .catch(error => console.error('Error fetching case details', error));
});
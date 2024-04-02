const API_URL = 'https://www.mp3quran.net/api/v3/';
const LANGUAGE = 'ar';
let recitersData = []
let riwayatData = []

const input = document.querySelector(".searchInput").querySelector("input")

let filteredSuggestions = []

const loader = document.querySelector('.loader')

const box_UI_SELECTOR = 'box';
const boxNames_UI_SELECTOR = '.namesContainer';
const boxNames_uiElement = document.querySelector(boxNames_UI_SELECTOR);

const fetchReciters = async () => {
  // Check if data is already in localStorage
  const storedRecitersData = localStorage.getItem('recitersData');

  if (storedRecitersData) {
    console.log('Data retrieved from localStorage:', JSON.parse(storedRecitersData));
    recitersData = JSON.parse(storedRecitersData)
    return JSON.parse(storedRecitersData);
  }

  try {
    const response = await fetch(`${API_URL}reciters?language=${LANGUAGE}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const fetchedRecitersData = await response.json();

    // Store data in localStorage
    localStorage.setItem('recitersData', JSON.stringify(fetchedRecitersData));

    console.log('Data fetched and stored:', fetchedRecitersData);
    recitersData = fetchedRecitersData
    return fetchedRecitersData;
  } catch (error) {
    console.error(`Error fetching Reciters data: ${error.message}`);
    return null;
  }
}

const fetchRiwayat = async () => {
  // Check if data is already in localStorage
  const storedRiwayatData = localStorage.getItem('riwayatData');

  if (storedRiwayatData) {
    riwayatData = JSON.parse(storedRiwayatData)
    return JSON.parse(storedRiwayatData);
  }

  try {
    const response = await fetch(`${API_URL}riwayat?language=${LANGUAGE}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const fetchedRiwayatData = await response.json();

    // Store data in localStorage
    localStorage.setItem('riwayatData', JSON.stringify(fetchedRiwayatData));

    riwayatData = fetchedRiwayatData
    return fetchedRiwayatData;
  } catch (error) {
    console.error(`Error fetching Riwayat data: ${error.message}`);
    return null;
  }
}

const processRecitersData = () => {
  const reciters = recitersData?.reciters || [];
  reciters.sort((a, b) => a.name.localeCompare(b.name));

  // Create an object to track unique letters
  const uniqueLetters = {};

  // Loop through the data and populate the uniqueLetters object
  for (const reciter of reciters) {
    let letter = reciter["letter"];
    const id = reciter["id"];
    const name = reciter["name"];
    const moshaf = reciter["moshaf"][0];

    // Replace 'إ' and 'أ' with 'ا'
    letter = (letter === "إ" || letter === "أ") ? "ا" : letter;

    // Check if the letter is not already in the dictionary
    uniqueLetters[letter] ||= []; // If not, add an empty list for that letter

    uniqueLetters[letter].push({ id: id, name: name, moshaf_name: moshaf.name.split('-')[0], server_name: moshaf.server.split('/')[3] === "malaysia" ? moshaf.server.split('/')[4] : moshaf.server.split('/')[3], server: moshaf.server, surah_total: moshaf.surah_total, surah_list: moshaf.surah_list });
    filteredSuggestions.push({ id: id, letter: letter, name: name, moshaf_name: moshaf.name.split('-')[0], server_name: moshaf.server.split('/')[3] === "malaysia" ? moshaf.server.split('/')[4] : moshaf.server.split('/')[3], server: moshaf.server, surah_total: moshaf.surah_total, surah_list: moshaf.surah_list });
  }
  console.log(filteredSuggestions)
  localStorage.setItem('reciterInfo', JSON.stringify(uniqueLetters))

  // Create an ordered list and add list items for each unique letter
  for (const letter in uniqueLetters) {
    const listItem = document.createElement("div");
    const listLetter = document.createElement("div");
    listItem.setAttribute("id", `letter_${letter}`)
    listLetter.setAttribute("id", `letter_${letter}`)
    const innerList = document.createElement("ul");
    innerList.classList.add("reciterContainer")

    for (const reciter of uniqueLetters[letter]) {
      const nameItem = document.createElement("li");
      nameItem.classList.add("reciterBox")
      nameItem.innerHTML = `
      <a href="reciter.html?${reciter.server.split('/')[3] === "malaysia" ? reciter.server.split('/')[4] : reciter.server.split('/')[3]}" title="${reciter.surah_total === 114 ? 'المصحف كاملا' : `${reciter.surah_total} سورة`}">
        ${reciter.name}
      </a>`;
      innerList.appendChild(nameItem);
    }

    listItem.innerHTML = `<h2 class="r-letter">${letter}</h2>`;
    listLetter.innerHTML = `<h2 class="l-letter"><a href="#letter_${letter}">${letter}</a></h2>`;
    listItem.appendChild(innerList);
    boxNames_uiElement.appendChild(listItem);
    document.querySelector('.lettersContainer').appendChild(listLetter);
  }

  console.log(reciters.length ? 'Reciters data processed successfully.' : 'Reciters data is empty or undefined.');
};

const processRiwayatData = () => {
  const riwayat = riwayatData?.riwayat || [];
  const myList = document.createElement("ul");
  myList.classList.add("dropdown-menu");

  const allReciters = document.createElement("li")
  allReciters.classList.add("all-reciters")
  allReciters.setAttribute("id", "")
  allReciters.textContent = "الكل";

  const uniqueNames = new Set();
  riwayat.forEach(rewayah => uniqueNames.add(rewayah.name.split('-')[0]));

  uniqueNames.forEach(name => {
    const listItem = document.createElement("li");
    listItem.classList.add("rewayahBox")
    listItem.textContent = name;
    //listItem.setAttribute("id", riwayat.find(rewayah => rewayah.name.startsWith(name)).name.split('-')[0]);
    listItem.setAttribute("id", name);

    const existingElement = document.querySelector(".all-reciters");
    if (!existingElement) myList.appendChild(allReciters);
    myList.appendChild(listItem)
  });

  document.querySelector(".rewayah-list").appendChild(myList);

  processRiwayatDropdown();
}

const processUpdatedRecitersData = (rewayaName) => {
  input.value = "";
  boxNames_uiElement.innerHTML = ''
  document.querySelector('.lettersContainer').innerHTML = ''
  const reciters = recitersData?.reciters || [];
  reciters.sort((a, b) => a.name.localeCompare(b.name));

  // Create an object to track unique letters
  const uniqueLetters = {};

  // Filter reciters based on moshaf name
  const rewayaUpdatedReciters = reciters.filter(reciter =>
    reciter.moshaf.some(moshaf => rewayaName === moshaf.name.split(' - ')[0] || rewayaName === '')
  ).map(reciter => {
    const matchingMoshaf = reciter.moshaf.find(m => m.name.split(' - ')[0] === rewayaName);
    return {
      id: reciter.id,
      name: reciter.name,
      letter: reciter.letter,
      moshaf_name: matchingMoshaf?.name.split('-')[0],
      server_name: matchingMoshaf?.server.split('/')[3] === "malaysia" ? matchingMoshaf?.server.split('/')[4] : matchingMoshaf?.server.split('/')[3],
      server: matchingMoshaf?.server,
      surah_total: matchingMoshaf?.surah_total,
      surah_list: matchingMoshaf?.surah_list,
    };
  });

  filteredSuggestions = rewayaUpdatedReciters
  console.log(filteredSuggestions)

  for (const reciter of rewayaUpdatedReciters) {
    let letter = reciter["letter"];
    const id = reciter["id"];
    const name = reciter["name"];
    const moshaf_name = reciter["moshaf_name"];
    const server_name = reciter["server_name"];
    const server = reciter["server"];
    const surah_total = reciter["surah_total"];
    const surah_list = reciter["surah_list"];

    // Replace 'إ' and 'أ' with 'ا'
    letter = (letter === "إ" || letter === "أ") ? "ا" : letter;

    // Check if the letter is not already in the dictionary
    uniqueLetters[letter] ||= []; // If not, add an empty list for that letter

    uniqueLetters[letter].push({ id: id, name: name, moshaf_name: moshaf_name, server_name: server_name, server: server, surah_total: surah_total, surah_list: surah_list });
  }

  localStorage.setItem('reciterInfo', JSON.stringify(uniqueLetters))

  for (const letter in uniqueLetters) {
    const listItem = document.createElement("div");
    const listLetter = document.createElement("div");
    listItem.setAttribute("id", `letter_${letter}`)
    listLetter.setAttribute("id", `letter_${letter}`)
    const innerList = document.createElement("ul");
    innerList.classList.add("reciterContainer")

    for (const reciter of uniqueLetters[letter]) {
      const nameItem = document.createElement("li");
      nameItem.classList.add("reciterBox")
      nameItem.innerHTML = `
      <a href="reciter.html?${reciter.server_name}" title="${reciter.surah_total === 114 ? 'المصحف كاملا' : `${reciter.surah_total} سورة`}">
        ${reciter.name}
      </a>`;
      innerList.appendChild(nameItem);
    }

    listItem.innerHTML = `<h2 class="r-letter">${letter}</h2>`;
    listLetter.innerHTML = `<h2 class="l-letter"><a href="#letter_${letter}">${letter}</a></h2>`;
    listItem.appendChild(innerList);
    boxNames_uiElement.appendChild(listItem);
    document.querySelector('.lettersContainer').appendChild(listLetter);
  }

  console.log(reciters.length ? 'Reciters data processed successfully.' : 'Reciters data is empty or undefined.');
}

input.addEventListener("input", e => {
  const userData = e.target.value.toLowerCase();
  boxNames_uiElement.innerHTML = ''
  document.querySelector('.lettersContainer').innerHTML = ''
  showSuggestions(filteredSuggestions.filter(data => data.name.toLowerCase().match(userData)));
})

const showSuggestions = (list) => {
  const letterMap = new Map();

  for (const reciter of list) {
    const letter = reciter.letter;
    const name = reciter.name;
    const serverName = reciter.server_name;
    const surahTotal = reciter.surah_total;

    if (!letterMap.has(letter)) {
      letterMap.set(letter, []);
    }

    letterMap.get(letter).push({ name, serverName, surahTotal });
  }

  for (const [letter, reciters] of letterMap) {
    const listItem = document.createElement("div");
    const listLetter = document.createElement("div");
    listItem.setAttribute("id", `letter_${letter}`);
    listLetter.setAttribute("id", `letter_${letter}`);
    const innerList = document.createElement("ul");
    innerList.classList.add("reciterContainer")

    for (const reciter of reciters) {
      const nameItem = document.createElement("li");
      nameItem.classList.add("reciterBox")
      nameItem.innerHTML = `
            <a href="reciter.html?${reciter.serverName}" title="${reciter.surahTotal === 114 ? 'المصحف كاملا' : `${reciter.surahTotal} سورة`}">
                ${reciter.name}
            </a>`;
      innerList.appendChild(nameItem);
    }

    listItem.innerHTML = `<h2 class="r-letter">${letter}</h2>`;
    listLetter.innerHTML = `<h2 class="l-letter"><a href="#letter_${letter}">${letter}</a></h2>`;
    listItem.appendChild(innerList);
    boxNames_uiElement.appendChild(listItem);
    document.querySelector('.lettersContainer').appendChild(listLetter);
  }
}

const loadRecitersRiwayatData = async () => {
  try {
    loader.style.display = 'block'
    const recitersDataExists = await fetchReciters().catch(error => {
      console.error('An error occurred while fetching Reciters data:', error);
      return false;
    });
    const riwayatDataExists = await fetchRiwayat().catch(error => {
      console.error('An error occurred while fetching Riwayat data:', error);
      return false;
    });
    if (recitersDataExists) processRecitersData();
    if (riwayatDataExists) processRiwayatData();
    loader.style.display = 'none'
    document.querySelector(".mainPage").style.display = 'flex'
    if (!recitersDataExists && !riwayatDataExists) console.error('Reciters/Riwayat data is not available.');
  } catch (error) {
    console.error('An error occurred while loading Reciters/Riwayat data:', error);
  }
};


loadRecitersRiwayatData();

// dropdown menu
const processRiwayatDropdown = () => {
  // Function to toggle dropdown visibility
  const toggleDropdown = (dropdown) => {
    // Enable keyboard focus
    dropdown.tabIndex = 1;
    // Set focus on dropdown
    dropdown.focus();
    // Toggle 'active' class for styling
    dropdown.classList.toggle('active');
    // Toggle display of dropdown menu
    const dropdownMenu = dropdown.querySelector('.dropdown-menu');
    if (dropdownMenu) {
      dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    }
  };

  // Function to hide dropdown
  const hideDropdown = (dropdown) => {
    // Remove 'active' class to hide styling
    dropdown.classList.remove('active');
    // Hide dropdown menu
    const dropdownMenu = dropdown.querySelector('.dropdown-menu');
    dropdownMenu && (dropdownMenu.style.display = 'none');
  };

  // Function to update dropdown content on item click
  const updateDropdown = (item) => {
    // Find the parent dropdown container
    const dropdownParent = item.closest('.dropdown');
    // Update the displayed text with the selected item
    dropdownParent.querySelector('span').textContent = item.textContent;
    // Set the hidden input value with the selected item's id
    dropdownParent.querySelector('input').value = item.id;
  };

  // Add event listeners for dropdowns
  document.querySelectorAll('.dropdown').forEach(dropdown => {
    // Toggle dropdown visibility on click
    dropdown.addEventListener('click', () => toggleDropdown(dropdown));
    // Hide dropdown on focusout
    dropdown.addEventListener('focusout', () => hideDropdown(dropdown));

    // Add event listeners for dropdown menu items
    dropdown.querySelectorAll('.dropdown-menu li').forEach(item => {
      // Update dropdown content on menu item click
      item.addEventListener('click', () => updateDropdown(item));
    });
  });

  // Add event listeners for all dropdown menu items
  document.querySelectorAll('.dropdown-menu li').forEach(item => {
    // Display hidden input value on menu item click
    item.addEventListener('click', () => {
      const input = item.closest('.dropdown').querySelector('input').value
      processUpdatedRecitersData(input)
    });
  });
}

window.addEventListener('load', function() {
  var visited = document.cookie.replace(/(?:(?:^|.*;\s*)visited\s*\=\s*([^;]*).*$)|^.*$/, "$1");
  if (!visited) {
    // Your install prompt code here
    showInstallPrompt();
    document.cookie = "visited=yes";
  } else {
    setupDropdowns();
    document.cookie = "visited=true; expires=Fri, 31 Dec 9999 23:59:59 GMT";
  }
});
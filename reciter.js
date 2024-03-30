const API_URL = 'https://www.mp3quran.net/api/v3/';
const LANGUAGE = 'ar';
let reciterData = []
let suwarData = []
let reciterSuwar = []

const audio = document.querySelector('.quranPlayer'),
  play = document.querySelector('.play'),
  title = document.getElementById('title');

const input = document.querySelector(".searchInput").querySelector("input")

let filteredSuggestions = []

const loader = document.querySelector('.loader')

const fetchSuwar = async () => {
  // Check if data is already in sessionStorage
  const storedSuwarData = sessionStorage.getItem('suwarData');

  if (storedSuwarData) {
    console.log('Data retrieved from sessionStorage:', JSON.parse(storedSuwarData));
    suwarData = JSON.parse(storedSuwarData)
    return JSON.parse(storedSuwarData);
  }

  try {
    const response = await fetch(`${API_URL}suwar?language=${LANGUAGE}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const fetchedSuwarData = await response.json();

    // Store data in sessionStorage
    sessionStorage.setItem('suwarData', JSON.stringify(fetchedSuwarData));

    console.log('Data fetched and stored:', fetchedSuwarData);
    suwarData = fetchedSuwarData
    return fetchedSuwarData;
  } catch (error) {
    console.error(`Error fetching suwar data: ${error.message}`);
    return null;
  }
}

const fetchReciter = async () => {
  // Check if data is already in sessionStorage
  const storedReciterSuwar = sessionStorage.getItem('reciterSuwar');

  try {
    const reciterInfo = JSON.parse(sessionStorage.getItem('reciterInfo'))
    const nameFromUrl = window.location.search.substring(1); // Remove the leading slash

    for (const reciterId in reciterInfo) {
      for (const reciter of reciterInfo[reciterId]) {
        if (reciter.server_name.toLowerCase() === nameFromUrl.toLowerCase()) { reciterData = reciter }
      }
    }

    const response = await fetch(`${API_URL}reciters?reciter=${reciterData.id}&language=${LANGUAGE}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const fetchedReciterSuwar = await response.json();

    // Store data in sessionStorage
    sessionStorage.setItem('reciterSuwar', JSON.stringify(fetchedReciterSuwar));

    console.log('Data fetched and stored:', fetchedReciterSuwar);
    reciterSuwar = fetchedReciterSuwar
    return fetchedReciterSuwar;
  } catch (error) {
    console.error(`Error fetching suwar data: ${error.message}`);
    return null;
  }
}

const processSuwarData = () => {
  // Split the surah_list into an array of surah numbers
  const surahNumbers = reciterData.surah_list.split(",");

  // Get the ul element
  const ul = document.querySelector(".surahList");
  const info = document.querySelector(".info")

  info.innerHTML = `<h2>${reciterData.name}</h2>
    <h4>${reciterData.moshaf_name}</h4>`

  // Loop through the surah numbers and create list items
  surahNumbers.forEach((surahNumber) => {
    filteredSuggestions.push({ surahName: suwarData.suwar[surahNumber - 1].name, surahNumber: surahNumber, surahServer: reciterData.server + surahNumber.padStart(3, '0') + '.mp3' })
    const li = document.createElement("div");
    li.setAttribute("id", surahNumber);
    li.setAttribute("name", suwarData.suwar[surahNumber - 1].name);
    li.setAttribute("server", reciterData.server + surahNumber.padStart(3, '0') + '.mp3');
    li.classList.add("surahBox")
    li.innerHTML = `<p>${surahNumber}. ${suwarData.suwar[surahNumber - 1].name}</p>`;
    ul.appendChild(li);
  })

  plz()
}

const loadSuwarData = async () => {
  try {
    loader.style.display = 'block'
    const suwarDataExists = await fetchSuwar().catch(error => {
      console.error('An error occurred while fetching Suwar data:', error);
      return false;
    });
    const reciterSuwarDataExists = await fetchReciter().catch(error => {
      console.error('An error occurred while fetching Suwar data:', error);
      return false;
    });
    if (suwarDataExists) processSuwarData();
    if (reciterSuwarDataExists) processRiwayatData();
    loader.style.display = 'none'
    document.querySelector(".container").style.display = 'block'
    if (!suwarDataExists) console.error('Suwar data is not available.');
    if (!reciterSuwarDataExists) console.error('Reciter Suwar data is not available.');
  } catch (error) {
    console.error('An error occurred while loading Suwar data:', error);
  }
};


loadSuwarData()

input.addEventListener("input", e => {
  const userData = e.target.value.toLowerCase();
  document.querySelector('.surahList').innerHTML = ''
  showSuggestions(filteredSuggestions.filter(data => data.surahName.toLowerCase().match(userData) || data.surahNumber.match(userData)));
})

const showSuggestions = (list) => {
  const ul = document.querySelector(".surahList");

  for (const surah of list) {
    const li = document.createElement("div");
    li.setAttribute("id", surah.surahNumber);
    li.setAttribute("name", surah.surahName);
    li.setAttribute("server", surah.surahServer);
    li.classList.add("surahBox")
    li.innerHTML = `<p>${surah.surahNumber}. ${surah.surahName}</p>`;
    ul.appendChild(li);
  }
  plz()
}

const processUpdatedRecitersData = (rewayaName) => {
  document.querySelector(".surahList").innerHTML = ''
  input.value = "";
  filteredSuggestions = []
  console.log(rewayaName)
  const surahNumbers = rewayaName[0].surah_list.split(",");

  // Get the ul element
  const ul = document.querySelector(".surahList");

  const info = document.querySelector(".info")
  console.log(reciterData)
  info.innerHTML = `<h2>${reciterData.name}</h2>
    <h4>${rewayaName[0].moshaf_name}</h4>`

  // Loop through the surah numbers and create list items
  surahNumbers.forEach((surahNumber) => {
    console.log(rewayaName[0].server)
    filteredSuggestions.push({ surahName: suwarData.suwar[surahNumber - 1].name, surahNumber: surahNumber, surahServer: rewayaName[0].server + surahNumber.padStart(3, '0') + '.mp3' })
    const li = document.createElement("div");
    li.setAttribute("id", surahNumber);
    li.setAttribute("name", suwarData.suwar[surahNumber - 1].name);
    li.setAttribute("server", rewayaName[0].server + surahNumber.padStart(3, '0') + '.mp3');
    li.classList.add("surahBox")
    li.innerHTML = `<p>${surahNumber}. ${suwarData.suwar[surahNumber - 1].name}</p>`;
    ul.appendChild(li);
  })
  plz()
}

const processRiwayatData = () => {
  let riwayat = []

  for (const reciter of reciterSuwar.reciters) {
    for (const moshafItem of reciter.moshaf) {
      riwayat.push({ moshaf_name: moshafItem.name.split(' - ')[0], server: moshafItem.server, surah_list: moshafItem.surah_list })
    }
  }

  const myList = document.createElement("ul");
  myList.classList.add("dropdown-menu");

  riwayat.forEach(rewayah => {
    const listItem = document.createElement("li");
    listItem.classList.add("rewayahBox")
    listItem.textContent = rewayah.moshaf_name;
    listItem.setAttribute("id", rewayah.moshaf_name);
    myList.appendChild(listItem)
  });

  document.querySelector(".rewayah-list").appendChild(myList);

  if (riwayat.length > 1) {
    document.querySelector('.dropdown').style.display = 'inline-block'
    processRiwayatDropdown(riwayat);
  }
}

const plz = () => {
  document.querySelectorAll('.surahBox').forEach(surahBox => {
    surahBox.addEventListener('click', function () {
      document.querySelector('.quranPlayer').style.display = 'block'
      index = surahBox.getAttribute("id")
      play(surahBox.getAttribute("id"), surahBox.getAttribute("name"), surahBox.getAttribute("server"))
    });
  });


  const play = (id, name, server) => {
    audio.src = server
    title.innerHTML = `${id}. ${name} ( <span class="downloadSurah">تنزيل السورة</span> )`;

    document.querySelector(".downloadSurah").addEventListener('click', () => {
      downloadSurah(server, name, id)
    })
  }

  const downloadSurah = async (url, surahName, surahId) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Network error: ${response.status} ${response.statusText}`);
      const blob = await response.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = surahName + " - " + surahId
      a.click();
    } catch (error) {
      console.error("Error downloading:", error);
    }
  }
}

// dropdown menu
const processRiwayatDropdown = (riwayat) => {
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
      processUpdatedRecitersData(riwayat.filter(rewayah => input.includes(rewayah.moshaf_name)))
    });
  });
}
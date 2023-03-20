// Variables used throughout.
const apiKey = "e36742a3ce1cc21b8630a121e26b7077";
let searchBtn = document.querySelector("#search-button");
let userInput = document.querySelector("#user-search-input");
let recentSearch = document.querySelector("#recent-search");
let cityList = JSON.parse(localStorage.getItem("cities")) || [];
let city = cityList[7] || "Denver";

// Event listener for the button click after the traveler types in their desired city.
searchBtn.addEventListener("click", () => {
  let cityUserInput = userInput.value.trim().toLowerCase();
  city = toTitleCase(cityUserInput);

  // Calling functions defined later on.
  searchCity(city, apiKey);
  getCityLatLon(city, apiKey);
  saveRecentSearch(city);
});

// Defining the function that pulls current weather for the city entered into the search bar.
function searchCity(city, apiKey) {
  let queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;
  fetch(queryURL)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {

      let currentTemp = Math.round(data.main.temp);
      let currentWindSpeed = data.wind.speed;
      let currentHumidity = data.main.humidity;
      let currentIcon = data.weather[0].icon;

      function displayCurrent() {
        $("#city-name-display").text(city);
        $("#temperature").text(currentTemp);
        $("#humidity").text(currentHumidity);
        $("#wind-speed").text(currentWindSpeed);
        let createIcon = ``;
        document.getElementById("weather-icon").innerHTML = "";
        createIcon = `<img src="http://openweathermap.org/img/wn/${currentIcon}@2x.png" alt="current-weather-icon" id="current-weather-icon">`;
        document.getElementById("weather-icon").innerHTML += createIcon;
      }
      displayCurrent();
    });
}

// Defining the function that deciphers a city's latitude and longitude in order for the API to run properly.
function getCityLatLon(city, apiKey) {
  let cityGeoCodeURL = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
  fetch(cityGeoCodeURL)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      let lat = data[0].lat.toFixed(2);
      let lon = data[0].lon.toFixed(2);
      displayForecast(lat, lon);
    });
}

// Defining the function that controls the appearance and readibility of the date.
function displayCurrentDate() {
  $("#current-date").text(dayjs().format("DD MMM YYYY"));
}
setInterval(displayCurrentDate, 1000);

// Defining the function that pulls the five-day forecast for the city entered into the search bar. Formatting the future dates consistently.
function displayForecast(lat, lon) {
  let fiveDayForecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;
  fetch(fiveDayForecastURL)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {

      document.getElementById("forecast").innerHTML = "";
      let template = ``;
      for (let i = 0; i < data.list.length; i += 8) {
        let date = data.list[i].dt_txt.substring(0, 10);
        let formatDate = dayjs(date).format("DD MMM YYYY");
        let humidity = data.list[i].main.humidity;
        let windSpeed = data.list[i].wind.speed;
        let temp = Math.round(data.list[i].main.temp);
        template = `
            <ul class="forecast-five-day">
            <li><span class="fs-6 text">${formatDate}</span></li>
            <img src="http://openweathermap.org/img/wn/${data.list[i].weather[0].icon}@2x.png" alt="forecast-weather-icon" id="forecast-weather-icon">
            <li> Temp: <span class="fs-6 text">${temp}°F</span></li>
            <li> Wind: <span class="fs-6 text">${windSpeed} mph</span></li>
            <li> Humidity: <span class="fs-6 text">${humidity}%</span></li>
            </ul>
            `;
        document.getElementById("forecast").innerHTML += template;
      }
    });
}

// Defining the function that saves the search history.
function saveRecentSearch(city) {
  let cityTitleCase = toTitleCase(city);
  if (city === "") {
    alert("Please enter a city name");
    return;
  }

  // Formatting the city's name appropriately if entered as lowercase letters.
  if (!cityList.includes(cityTitleCase)) {
    cityList.push(cityTitleCase);
    if (cityList.length > 10) {
      cityList.shift();
    }

    searchHistory();
  }

  // Saving search history to localstorage.
  localStorage.setItem("cities", JSON.stringify(cityList));
}

  // Formatting the city's name appropriately if entered as lowercase letters.
function toTitleCase(city) {
  let cityArr = city.toLowerCase().split(" ");

  for (let i = 0; i < cityArr.length; i++) {
    cityArr[i] = cityArr[i].charAt(0).toUpperCase() + cityArr[i].slice(1);
  }
  return cityArr.join(" ");
}

// Defining the function that allows the travelere to click on a previously entered city to re-call the current weather and five-day forecast.
function searchHistory() {
  recentSearch.innerHTML = "";
  for (let i = 0; i < cityList.length; i++) {
    let buttonEl = document.createElement("button");
    buttonEl.textContent = cityList[i];
    buttonEl.setAttribute("class", "searched-city-btn btn btn-secondary my-1");
    recentSearch.appendChild(buttonEl);
    buttonEl.addEventListener("click", function (e) {
      e.stopPropagation;
      let buttonText = e.target.textContent;
      searchCity(buttonText, apiKey);
      getCityLatLon(buttonText, apiKey);
      saveRecentSearch(buttonText);
    });
  }
}

searchHistory();

searchCity(city, apiKey);
getCityLatLon(city, apiKey);
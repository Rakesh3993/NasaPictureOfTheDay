const apiKey = "LCc8yC3V8qH2zpKDNlqx2G9jEKIw2kwPOhuNCX2a";
const baseUrl = "https://api.nasa.gov/planetary/apod";
let results = [];
let date = null;
let posterImg = document.getElementById("nasa_img");
let desc = document.getElementById("description");
let searchBtn = document.getElementById("search_btn");
let heading = document.getElementById("heading");
let title = document.getElementById("title");
let dateList = document.getElementById("date_list");
let videoPlayer = document.getElementById("videoPlayer");
let videoSource = document.getElementById("videoSource");
let videoFrame = document.getElementById("videoFrame");

let resultArray = [];

function updateLocalStorage() {
  let date = resultArray;
  localStorage.setItem("date", JSON.stringify(date));
}

window.addEventListener("load", () => {
  getDataFromLocalStorage();
  renderUI();
});

function getDataFromLocalStorage() {
  let result = localStorage.getItem("date");
  if (result) {
    let storedData = JSON.parse(result);
    storedData.map((date) => {
      resultArray.push(date);
    });
  }
}

async function fetchData(date) {
  heading.textContent = `Picture On ${date}`;
  let response = await fetch(`${baseUrl}?api_key=${apiKey}&date=${date}`);
  let data = await response.json();
  console.log(response);
  return data;
}

searchBtn.addEventListener("click", async () => {
  date = document.getElementById("date").value;
  let currDate = new Date();
  currDate.setHours(0, 0, 0, 0);

  let inputDate = new Date(date);
  inputDate.setHours(0, 0, 0, 0);

  let minDate = new Date("1995-06-15");

  if (date === "") {
    alert("Please input date first");
    return;
  } else if (inputDate.getTime() > currDate.getTime()) {
    alert(
      `Please input date between ${minDate.toDateString()} to ${currDate.toDateString()}`,
    );
    return;
  }
  if(!resultArray.some(item => item.date === date)) {
    resultArray.push({
      date: date,
    });
  }
  updateLocalStorage();
  renderUI();
  let data = await fetchData(date);
  fetchingImgOrVideo(data);
});

function renderUI() {
  let dateData = JSON.parse(localStorage.getItem("date"));

  if (dateData.length > 0) {
    dateList.innerHTML = dateData
      .map((data) => {
        return `<button onclick=handleOnClickFeature('${data.date}')>${data.date}</p>`;
      })
      .join("");
  }
}

async function handleOnClickFeature(date) {
  let data = await fetchData(date);
  fetchingImgOrVideo(data);
}

function fetchingImgOrVideo(data) {
  title.textContent = data.title;
  desc.textContent = data.explanation;
  if (data.media_type === "image") {
    posterImg.style.display = "block";
    videoPlayer.style.display = "none";
    videoFrame.style.display = "none";

    posterImg.src = data.hdurl || data.url;
  } else if (data.media_type === "video") {
    // Case 1: MP4 video
    if (data.url.endsWith(".mp4")) {
      posterImg.style.display = "none";
      videoFrame.style.display = "none";
      videoPlayer.style.display = "block";

      videoSource.src = data.url;
      videoPlayer.load(); // IMPORTANT
    }
    // Case 2: YouTube
    else if (data.url.includes("youtube")) {
      posterImg.style.display = "none";
      videoPlayer.style.display = "none";
      videoFrame.style.display = "block";
      videoFrame.src = getEmbedUrl(data.url);
    }
    // Case 3: Other links
    else {
      posterImg.style.display = "none";
      videoPlayer.style.display = "none";
      videoFrame.style.display = "none";

      desc.innerHTML += `<br><a href="${data.url}" target="_blank">Watch Video</a>`;
    }
  }
}

function getEmbedUrl(url) {
  if (url.includes("youtube.com/watch")) {
    return url.replace("watch?v=", "embed/");
  } else if (url.includes("youtu.be/")) {
    return url.replace("youtu.be/", "youtube.com/embed/");
  }
  return url;
}

console.log("Lets start the music!");

let newSong = new Audio();
// we are doing this as we are not using backend for this project
// so we are fetching the songs from a local server running on port 5500

// function to display time in 00:00 format
function displayTime() {
  let duration = newSong.duration;
  let currentTime = newSong.currentTime;

  // 00(minutes):00(seconds)[time ran] / 00:000(total-duration)
  const formatTime = (time) => {
    let minutes = Math.floor(time / 60);
    let seconds = Math.floor(time % 60);

    return `${minutes < 10 ? "0" + minutes : minutes} : ${
      seconds < 10 ? "0" + seconds : seconds
    }`;
  };
  let formattedDuration = formatTime(duration);
  let formatteedCurrent = formatTime(currentTime);

  return `${formatteedCurrent} / ${formattedDuration}`;
}

async function getSongs() {
  let a = await fetch("http://127.0.0.1:5500/songs/");
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a"); // Get all <a> elements
  let songs = [];

  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href);
    }
  }
  return songs;
}

playMusic = (track) => {
  newSong.src = track;
  // let audio = new Audio(track)
  newSong.play();
};

async function main() {
  // get the songs from the local server
  let songs = await getSongs();
  console.log(songs);

  let divs = document.querySelector(".libCards").getElementsByTagName("div");

  for (let count = 0; count < divs.length; count++) {
    let songUL = divs[count];

    if (count < songs.length) {
      let name = songs[count]
        .split("/")
        .pop()
        .replace(".mp3", "")
        .toUpperCase(); // Get the song name from the URL
      songUL.innerHTML =
        songUL.innerHTML +
        `<b>${name}</b>` +
        `<span><i class='ri-play-circle-fill'></i></span>`; // Append the song name to the existing content
    } else {
      // Fill the rest of the divs with "Coming Soon"
      songUL.innerHTML +=
        "<span style='font-style: italic; font-size: 1.2vw;'> Coming Soon</span>";
    }
  }

  // attach event listener to play songs
  Array.from(
    document.querySelector(".libCards").getElementsByTagName("div")
  ).forEach((e, i) => {
    e.addEventListener("click", () => {
      console.log(e.closest("div").innerText);

      playMusic(songs[i]);
    });
  });

  let playBtn = document.getElementById("play");
  // attach event listner on buttons
  play.addEventListener("click", () => {
    if (newSong.paused) {
      newSong.play();
      playBtn.className = "icon ri-pause-fill";
    } else {
      newSong.pause();
      playBtn.className = "icon ri-play-fill";
    }
  });

  //targeting songDetails in playbar
  let detail = document.querySelector(".songInfo");
  let time = document.querySelector(".songTime");

  //listen for timeupdate event and song details
  newSong.addEventListener("timeupdate", () => {
    console.log(newSong.currentTime, newSong.duration);
    let name = newSong.src.split("/").pop().replace(".mp3", "").toUpperCase(); // Get the song name
    detail.innerHTML = name;
    time.innerHTML = displayTime();
    document.getElementById("circle").style.left =
      (newSong.currentTime / newSong.duration) * 100 + "%";
  });

  // listening for controlling time with seekBar or playLine
  let playLine = document.querySelector(".playLine");
  let circle = document.getElementById("circle");

  playLine.addEventListener("click", (e) => {
    let rect = playLine.getBoundingClientRect(); // gives us the position and size of the .playLine(the seek bar)
    let clickX = e.clientX - rect.left;
    //e.clientX gives us the x(horizontal) position of the user's mouse when they clicked(from the left of the screen)
    //rect.left -> tells how far seekBar is from left of the screen
    let linePercent = (clickX / rect.width) * 100;
    let seconds = (linePercent / 100) * newSong.duration;

    newSong.currentTime = seconds;

    document.getElementById("circle").style.left =
      (newSong.currentTime / newSong.duration) * 100 + "%";
  });

  // event-listening for hamburger(opening)
  let ham = document.getElementById("hamburger");
  ham.addEventListener("click", () => {
    document.querySelector(".left").style = "display : block";
  });
  // event-listening for closing hamburger
  let close = document.getElementById("close");
  close.addEventListener("click", () => {
    document.querySelector(".left").style = "display : none";
  });
}
main();

console.log("Lets start the music!");

let ytPlayer; // this will store the YouTube player object
let currentVideoId; // this keeps track of the currently playing video ID

let isYouTubePlaying = false;
let youtubeSongsList = []; // To store current YouTube playlist data
let currentYTIndex = -1; // Index of current playing YouTube song

let songs;
let newSong = new Audio();
// we are doing this as we are not using backend for this
// so we are fetching the songs from a local server running on port 5500

function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player("hiddenPlayer", {
    height: "0",
    width: "0",
    videoId: "",
    events: {
      onReady: () => console.log("YouTube Player ready"),
      onStateChange: (e) => console.log("YT State Change:", e.data),
    }, // when the youtube player has loaded succesfully  run this function
    playerVars: {
      // these are setting we give to youtube to change how the player behaves
      autoplay: 0, //dont autoplay
      controls: 0, //hide youtuve default control
      modestbranding: 1, // hides youtube logo
      rel: 0, // stops utube from showing related videos
    },
  });
}

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
  songs = await getSongs();
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
        `<span><i style="color: #A78BFA" class='ri-play-circle-fill'></i></span>`; // Append the song name to the existing content
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
    if (isYouTubePlaying) {
      ytPlayer.getPlayerState() === 2
        ? ytPlayer.playVideo()
        : ytPlayer.pauseVideo();
      play.className =
        ytPlayer.getPlayerState() === 2
          ? "icon ri-pause-fill"
          : "icon ri-play-fill";
    } else {
      if (newSong.paused) {
        newSong.play();
        playBtn.className = "icon ri-pause-fill";
      } else {
        newSong.pause();
        playBtn.className = "icon ri-play-fill";
      }
    }
  });

  //targeting songDetails in playbar
  let detail = document.querySelector(".songInfo");
  let time = document.querySelector(".songTime");

  //listen for timeupdate event and song details
  newSong.addEventListener("timeupdate", () => {

      if (isYouTubePlaying) return;

    console.log(newSong.currentTime, newSong.duration);
    let name = newSong.src.split("/").pop().replace(".mp3", "").toUpperCase(); // Get the song name
    detail.innerHTML = name;
    time.innerHTML = displayTime();
    document.getElementById("circle").style.left =
      (newSong.currentTime / newSong.duration) * 100 + "%"; // circle moves wrt to time time elapsed
  });

  // listening for controlling time with seekBar or playLine with circle
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
  let ham = document.getElementById("ham");
  ham.addEventListener("click", () => {
    document.querySelector(".left").style.transform = "translateX(0)";
  });

  // event-listening for closing hamburger
  let close = document.getElementById("close");
  close.addEventListener("click", () => {
    document.querySelector(".left").style.transform = "translateX(-100%)";
  });

  // event-listening for play-next
  let next = document.getElementById("forward");
  next.addEventListener("click", () => {
    if (isYouTubePlaying && currentYTIndex + 1 < youtubeSongsList.length) {
      currentYTIndex++;
      let song = youtubeSongsList[currentYTIndex];
      ytPlayer.loadVideoById(song.videoId);
      ytPlayer.playVideo();
      document.querySelector(".songInfo").innerText = song.title;
    } else {
      console.log("Next clicked");
      let currentName = newSong.src.split("/").pop().replace(".mp3", "");
      let index = songs.findIndex((s) => s.includes(currentName));
    }
    if (index >= 0 && index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // event-listening for play-reverse
  let reverse = document.getElementById("reverse");
  reverse.addEventListener("click", () => {
    if (isYouTubePlaying && currentYTIndex > 0) {
    currentYTIndex--;
    let song = youtubeSongsList[currentYTIndex];
    ytPlayer.loadVideoById(song.videoId);
    ytPlayer.playVideo();
    document.querySelector(".songInfo").innerText = song.title;
  }else{
    console.log("Reverse clicked");
    let currentName = newSong.src.split("/").pop().replace(".mp3", "");
    let index = songs.findIndex((s) => s.includes(currentName));
  }
    if (index > 0) {
      playMusic(songs[index - 1]);
    }
  });

  // logic for volume control
  let vol = document.getElementById("volRange");
  newSong.volume = parseFloat(vol.value);

  vol.addEventListener("input", () => {
    let volume = parseFloat(vol.value);

    if(isYouTubePlaying){
      ytPlayer.setVolume(volume * 50)
    }
    else{
      newSong.volume = volume;
    }
  });

  // logic for looping song
  let loop = document.getElementById("loop");

loop.addEventListener("click", () => {
  if (!isYouTubePlaying) {
    newSong.loop = !newSong.loop;
    console.log("Local loop is now:", newSong.loop ? "On" : "Off");
    loop.style.color = newSong.loop ? "blueviolet" : "white";
  } else {
    ytPlayer.loop = !ytPlayer.loop;
    console.log("YouTube loop is now:", ytPlayer.loop ? "On" : "Off");
    loop.style.color = ytPlayer.loop ? "blueviolet" : "white";
  }
});


  // js logic to create dynamic Playlists cards
  fetch("info.json")
    .then((res) => res.json()) // parse json into response
    .then((data) => {
      renderPlaylists(data.playlists); // calling  renderPlaylists function with parsed data
    })
    .catch((err) => console.error("Failed to load playlists:", err));

  //function to create dynamic cards
  function renderPlaylists(playlists) {
    const container = document.getElementById("playlist-container");
    container.innerHTML = "";

    playlists.forEach((pl) => {
      const card = document.createElement("div");
      card.className = "rCard";
      card.innerHTML = `
         <i id="cardPlay" class="ri-play-circle-fill" style="font-size: 50px; color: #a78bfa;"></i>
         <img src="${pl.image}" alt="${pl.name}" />
      <h4 class="playlist-name">${pl.name}</h4>
      <span class="playlist-desc">${pl.description}</span>
        `;
      card.addEventListener("click", () => {
        renderSongsinLibrary(pl.youtubePlaylistId); //  when playlist card clicked, show songs in library
      });
      container.appendChild(card); //appending the card div inside container
    });
  }

  // this function fetches songs(title + videoId) from utube playlist using api
  async function fetchSongsFromPlaylist(playlistId) {
    const maxResults = 11;
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=${maxResults}&playlistId=${playlistId}&key=${YT_API_KEY}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      return data.items.map((item) => ({
        title: item.snippet.title,
        videoId: item.snippet.resourceId.videoId,
      }));
    } catch (err) {
      console.error("Error fetching songs: ", err);
      return [];
    }
  }

  // function to render songs in library
  async function renderSongsinLibrary(playlistId) {
    const songs = await fetchSongsFromPlaylist(playlistId);

    const libCardsContainer = document.querySelector(".libCards");
    libCardsContainer.innerHTML = ""; // Clears old songs

    songs.forEach((song, index) => {
      const card = document.createElement("div");
      card.className = "Cards";

      card.innerHTML = ` <span>&nbsp;<i class="ri-music-2-fill"></i>&nbsp;&nbsp;</span>
      <b>${index + 1}. ${song.title}</b>
      <span><i style="color: #A78BFA" class='ri-play-circle-fill'></i></span>`;

      // play song using hidden youtube player , when clicked
      card.addEventListener("click", () => {
        
        //stops local songs once api fetched songs started playing
        newSong.pause();
        newSong.currentTime = 0;

        isYouTubePlaying = true;
        currentYTIndex = index;
        youtubeSongsList = songs;

        ytPlayer.loadVideoById(song.videoId);
        ytPlayer.playVideo();
        document.querySelector(".songInfo").innerText = song.title;
      });

      libCardsContainer.appendChild(card);
    });
  }
}
main();

console.log("Lets start the music!");

// we are doing this as we are not using backend for this project
// so we are fetching the songs from a local server running on port 5500
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

playMusic = (track) =>{
  let audio = new Audio(track)
  audio.play();
}
async function main() {
    // get the songs from the local server
  let songs = await getSongs();
  console.log(songs);
  
   let divs = document.querySelector(".libCards").getElementsByTagName("div");

  for(let count = 0; count< divs.length; count++){
    let songUL = divs[count];

    if(count < songs.length){
        let name = songs[count].split("/").pop().replace(".mp3","").toUpperCase();  // Get the song name from the URL
    songUL.innerHTML = songUL.innerHTML + "<b>" + name + "</b>" + "<span ><i class='ri-play-circle-fill'></i> </span>"; // Append the song name to the existing content
    }
    else{
        // Fill the rest of the divs with "Coming Soon"
        songUL.innerHTML += "<span style='font-style: italic;'> Coming Soon</span>";
    }
  }

Array.from(document.querySelector(".libCards").getElementsByTagName("i")).forEach((e, i) => {
  e.addEventListener("click", () => {
    console.log(e.closest("div").innerText);

    playMusic(songs[i]);
  });
});
}
main();


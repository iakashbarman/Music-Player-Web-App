// console.log("JavaScript");
let currentSong = new Audio();
let songs;
let currentFolder;

function convertSecondsToMinutes(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    // Format the remaining seconds to always display two digits
    // const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currentFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    // console.log(response);

    let div = document.createElement("div");
    div.innerHTML = response;
    let list = div.getElementsByTagName("a");
    songs = [];
    for (let i = 0; i < list.length; i++) {
        const element = list[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    // To show all the song in the playlist
    let songUL = document.querySelector(".songsList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
        <img src="/images/music.svg" alt="music" class="invert">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Akash Barman</div>
                            </div>
                            <div class="playNow">
                                <span>Play Now</span>
                                <img src="/images/play.svg" alt="" class="invert">
                            </div>
        </li>`;
    }


    // Attaching an Event Listener to each song
    Array.from(document.querySelector(".songsList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".info").firstElementChild.innerHTML.replace(".mp3", ""));
            playMusic(e.querySelector(".info").firstElementChild.innerHTML);
        })
    })

    // console.log(songs);
    return songs;
}


const playMusic = (track, pause = false) => {
    currentSong.src = `/${currentFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "images/pause.svg";
    }
    document.querySelector(".songInfo").innerHTML = track.replace(".mp3", "").replaceAll("%20", " ");

    currentSong.addEventListener("loadedmetadata", () => {
        const totalDuration = convertSecondsToMinutes(currentSong.duration);
        document.querySelector(".songTime").innerHTML = `00:00 / ${totalDuration}`;
    });
}


async function displayAlbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    // console.log(div);

    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

    let array = Array.from(anchors);
    
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        let parts = e.href.split(`/songs/`);

        if (parts.length > 1) {
            let folder = parts[1].replaceAll("%20", " ");
            // console.log(folder);

            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            // console.log(response);
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play"><img src="/images/hover-play.svg" alt=""></div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    };

    // Load Playlist when Card is Clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            // console.log(`songs/${(item.currentTarget.dataset.folder).replace(" ", "%20")}`)
            songs = await getSongs(`songs/${(item.currentTarget.dataset.folder).replace(" ", "%20")}`);

            playMusic(songs[0]);
        })
    })
}


async function main() {
    // To get the list of songs
    await getSongs("songs/ALBUM");
    // console.log(songs);
    playMusic(songs[0], true)

    // Display all the Albums on Page
    displayAlbums();


    // Attaching an Event Listener to play & pause song
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "images/pause.svg";
        } else {
            currentSong.pause();
            play.src = "images/play.svg";
        }
    })


    // Music duration real time update
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songTime").innerHTML = `${convertSecondsToMinutes(currentSong.currentTime)} / ${convertSecondsToMinutes(currentSong.duration)}`;

        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })


    // Adding Event Listener to SeekBar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let pinDuration = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = pinDuration + "%";

        currentSong.currentTime = (currentSong.duration * pinDuration) / 100;

    })

    // Adding Event Listener to Previous Song
    prevsong.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0]);

        if (index - 1 < 0) {
            // If the first song is currently playing, play the last song
            playMusic(songs[songs.length - 1]);
        } else {
            // Play the previous song
            playMusic(songs[index - 1]);
        }
    })
    // Adding Event Listener to Next Song
    nextsong.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0]);

        if (index + 1 >= songs.length) {
            // If the last song is currently playing, play the first song
            playMusic(songs[0]);
        } else {
            // Play the next song
            playMusic(songs[index + 1]);
        }
    })

    // Add an Event Listner to Hamburger Menu
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
        document.querySelector(".close").style.display = "flex";

        document.querySelector(".close").addEventListener("click", () => {
            document.querySelector(".left").style.left = "-100%";
        })
    })

    // Add an Event Listner to Adjust Volume
    document.querySelector("#range").addEventListener("change", (e) => {
        // console.log(e.target.value);
        currentSong.volume = parseInt(e.target.value) / 100;
    })

    // Add an Event Listner to Volume
    document.querySelector("#volume").addEventListener("click", e=>{ 
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            document.querySelector("#range").value = 0;
        } else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            document.querySelector("#range").value = 50;
            
        }
    })

}

main();
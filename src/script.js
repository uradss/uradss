const DISCORD_ID = '935898416532308028';


fetch('https://api.countapi.xyz/hit/uradss-uradss-bio/visits')
  .then(r => r.json())
  .then(data => {
    document.getElementById('view-count').textContent = data.value.toLocaleString();
  })
  .catch(() => {
    document.getElementById('view-count').textContent = '—';
  });


function updateDiscord() {
  fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`)
    .then(r => r.json())
    .then(data => {
      if (!data.success) {
        document.getElementById('activity-name').textContent = 'Offline';
        return;
      }

      const d = data.data;
      const user = d.discord_user;

      // ----- Left card: Discord username + status + activity -----
      if (user) {
        document.getElementById('discord-username').textContent = user.username;
      }

      if (user && user.avatar) {
        const avatarUrl = `https://cdn.discordapp.com/avatars/${DISCORD_ID}/${user.avatar}.png?size=256`;
        document.getElementById('discord-avatar').src = avatarUrl;
      }

      document.getElementById('discord-link').href = `https://discord.com/users/${DISCORD_ID}`;

      const activityEl = document.getElementById('activity-name');
      const nonSpotifyActivity = (d.activities || []).find(
        a => a.type !== 4 && a.name !== 'Spotify'
      );

      if (nonSpotifyActivity) {
        let text = nonSpotifyActivity.name || '';
        if (nonSpotifyActivity.details) text += ` • ${nonSpotifyActivity.details}`;
        activityEl.textContent = text;
      } else {
        const statusMap = {
          online: 'Online',
          idle: 'Idle',
          dnd: 'Do Not Disturb',
          offline: 'Offline'
        };
        activityEl.textContent = statusMap[d.discord_status] || 'Offline';
      }

      // ----- Right card: live Spotify status -----
      const spotifyTrackEl = document.getElementById('spotify-track');
      const spotifyArtistEl = document.getElementById('spotify-artist');
      const spotifyArtWrap = document.querySelector('.spotify-art');
      const spotifyArtImg = document.getElementById('spotify-album-art');

      if (d.listening_to_spotify && d.spotify) {
        spotifyTrackEl.textContent = d.spotify.song || 'Unknown track';
        spotifyArtistEl.textContent = d.spotify.artist || 'Spotify';
        if (d.spotify.album_art_url) {
          spotifyArtImg.src = d.spotify.album_art_url;
          spotifyArtWrap.classList.add('has-art');
        } else {
          spotifyArtWrap.classList.remove('has-art');
        }
      } else {
        spotifyTrackEl.textContent = 'Not listening';
        spotifyArtistEl.textContent = 'Spotify';
        spotifyArtWrap.classList.remove('has-art');
      }
    })
    .catch(() => {
      document.getElementById('activity-name').textContent = 'Offline';
    });
}

updateDiscord();
setInterval(updateDiscord, 30000);


const intro = document.getElementById('intro');
const enterBtn = document.getElementById('enter-btn');
const audio = document.getElementById('audio');
const playBtn = document.getElementById('play-btn');
const playIcon = document.getElementById('play-icon');
const progressFill = document.getElementById('progress-fill');
const progressBar = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const volumeSlider = document.getElementById('volume-slider');
const trackNameEl = document.getElementById('track-name');

const playlist = [
  { name: 'Where have you been', src: 'src/assets/music/where.mp3' },
];

let currentTrack = 0;
let isPlaying = false;

function loadTrack(index) {
  currentTrack = index;
  audio.src = playlist[index].src;
  trackNameEl.textContent = playlist[index].name;
  audio.load();
}

function formatTime(sec) {
  if (isNaN(sec) || !isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function updatePlayIcon() {
  if (isPlaying) {
    playIcon.innerHTML = `<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>`;
  } else {
    playIcon.innerHTML = `<path d="M8 5v14l11-7z"/>`;
  }
}

async function playMusic() {
  try {
    await audio.play();
    isPlaying = true;
    updatePlayIcon();
  } catch (err) {
    console.log('Play error:', err);
  }
}

function pauseMusic() {
  audio.pause();
  isPlaying = false;
  updatePlayIcon();
}


enterBtn.addEventListener('click', async () => {
  intro.classList.add('hidden');
  await playMusic();
});


playBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (isPlaying) {
    pauseMusic();
  } else {
    playMusic();
  }
});

// Progress
audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  const percent = (audio.currentTime / audio.duration) * 100;
  progressFill.style.width = percent + '%';
  currentTimeEl.textContent = formatTime(audio.currentTime);
});

audio.addEventListener('loadedmetadata', () => {
  durationEl.textContent = formatTime(audio.duration);
});

// Seek
progressBar.addEventListener('click', (e) => {
  e.stopPropagation();
  if (!audio.duration) return;
  const rect = progressBar.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;
  audio.currentTime = percent * audio.duration;
});

// Volume
volumeSlider.addEventListener('input', (e) => {
  e.stopPropagation();
  audio.volume = volumeSlider.value / 100;
});
audio.volume = volumeSlider.value / 100;

// Prev / Next
document.getElementById('prev-btn').addEventListener('click', (e) => {
  e.stopPropagation();
  currentTrack = (currentTrack - 1 + playlist.length) % playlist.length;
  loadTrack(currentTrack);
  if (isPlaying) playMusic();
});

document.getElementById('next-btn').addEventListener('click', (e) => {
  e.stopPropagation();
  currentTrack = (currentTrack + 1) % playlist.length;
  loadTrack(currentTrack);
  if (isPlaying) playMusic();
});

// Song end
audio.addEventListener('ended', () => {
  currentTrack = (currentTrack + 1) % playlist.length;
  loadTrack(currentTrack);
  playMusic();
});

audio.addEventListener('error', () => {
  trackNameEl.textContent = 'Error loading song';
  console.error('Audio failed. Check: music/lovergirl.mp3');
});

// Load track
loadTrack(0);
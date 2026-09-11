const DISCORD_ID = '935898416532308028';


fetch('https://countapi.mileshilliard.com/api/v1/hit/uradss-bio-unique-views')
  .then(r => r.json())
  .then(data => {
    document.getElementById('view-count').textContent = Number(data.value).toLocaleString();
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


      if (user) {
        document.getElementById('discord-username').textContent = user.username;
      }

      if (user && user.avatar) {
        const avatarUrl = `https://cdn.discordapp.com/avatars/${DISCORD_ID}/${user.avatar}.png?size=256`;
        document.getElementById('discord-avatar').src = avatarUrl;
      }


      if (user && user.avatar_decoration_data && user.avatar_decoration_data.asset) {
        const decoUrl = `https://cdn.discordapp.com/avatar-decoration-presets/${user.avatar_decoration_data.asset}.png?size=256`;
        const decoEl = document.getElementById('discord-decoration');
        decoEl.src = decoUrl;
        decoEl.classList.add('show');
      } else {
        document.getElementById('discord-decoration').classList.remove('show');
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

      const statusDotEl = document.getElementById('status-dot');
      statusDotEl.className = 'status-dot ' + (d.discord_status || 'offline');

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
  { name: 'Massive Attack', src: 'src/assets/music/iloveyou.mp3' },
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
    setupVisualizer();
    if (audioCtx && audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }
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


loadTrack(0);


document.addEventListener('contextmenu', (e) => e.preventDefault());


document.addEventListener('keydown', (e) => {
  const isF12 = e.key === 'F12';
  const isCtrlShiftI = e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i');
  const isCtrlShiftJ = e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j');
  const isCtrlU = e.ctrlKey && (e.key === 'U' || e.key === 'u');

  if (isF12 || isCtrlShiftI || isCtrlShiftJ || isCtrlU) {
    e.preventDefault();
    location.reload();
  }
});


// ===== Audio Visualizer =====
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

let audioCtx, analyser, source, dataArray, bufferLength;
let visualizerReady = false;

function setupVisualizer() {
  if (visualizerReady) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 128;
  analyser.smoothingTimeConstant = 0.75;

  source = audioCtx.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);

  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
  visualizerReady = true;

  resizeCanvas();
  drawVisualizer();
}

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', () => { if (visualizerReady) resizeCanvas(); });

function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

// Smoothed bar heights (for a nicer bounce/ease instead of jumpy values)
let barHeights = [];

function drawVisualizer() {
  requestAnimationFrame(drawVisualizer);

  const width = canvas.getBoundingClientRect().width;
  const height = canvas.getBoundingClientRect().height;
  ctx.clearRect(0, 0, width, height);

  analyser.getByteFrequencyData(dataArray);

  const barCount = 46;
  const step = Math.floor(bufferLength / barCount);
  const gap = 2.5;
  const barWidth = (width / barCount) - gap;
  const minHeight = 3;

  if (barHeights.length !== barCount) {
    barHeights = new Array(barCount).fill(minHeight);
  }

  ctx.shadowBlur = 6;
  ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';

  for (let i = 0; i < barCount; i++) {
    let value = dataArray[i * step] || 0;
    let percent = isPlaying ? value / 255 : 0;
    let targetHeight = Math.max(percent * height, minHeight);

 
    barHeights[i] += (targetHeight - barHeights[i]) * 0.35;
    const barHeight = barHeights[i];

    const x = i * (barWidth + gap);
    const y = height - barHeight;

    const gradient = ctx.createLinearGradient(0, y, 0, height);
    gradient.addColorStop(0, 'rgba(255,255,255,0.95)');
    gradient.addColorStop(1, 'rgba(255,255,255,0.35)');
    ctx.fillStyle = gradient;

    roundRect(ctx, x, y, barWidth, barHeight, barWidth / 2);
    ctx.fill();
  }
}
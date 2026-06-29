// --- SPLASH SCREEN ---
window.addEventListener("load", function() {
  setTimeout(function() {
    let splash = document.getElementById("splash")
    splash.style.opacity = "0"
    setTimeout(function() {
      splash.style.display = "none"
    }, 500)
  }, 2000)
})

let tempsTotal = 90
let tempsRestant = 90
let timerActif = false
let intervalle = null
let wakeLock = null
let contexteAudio = null


// --- WAKE LOCK ---
async function activerWakeLock() {
  try {
    wakeLock = await navigator.wakeLock.request("screen")
  } catch (err) {
    console.log("Wake lock non supporté")
  }
}

async function desactiverWakeLock() {
  if (wakeLock) {
    await wakeLock.release()
    wakeLock = null
  }
}


// --- AFFICHER LE TEMPS ---
function afficherTemps() {
  let minutes = Math.floor(tempsRestant / 60)
  let secondes = tempsRestant % 60
  if (secondes < 10) secondes = "0" + secondes
  document.querySelector(".timer").textContent = minutes + ":" + secondes
}


// --- BARRE DE PROGRESSION ---
function mettreAJourBarre() {
  let pourcentage = (tempsRestant / tempsTotal) * 100
  document.getElementById("barre").style.width = pourcentage + "%"

  let timer = document.querySelector(".timer")
  let barre = document.getElementById("barre")

  if (tempsRestant <= 10) {
    timer.classList.add("danger")
    barre.classList.add("danger")
  } else {
    timer.classList.remove("danger")
    barre.classList.remove("danger")
  }
}


// --- SON (ancienne version) ---
/*function jouerSon() {
  let contexte = new AudioContext()
  let moments = [0, 0.25, 0.5]

  moments.forEach(function(quand) {
    let oscillateur = contexte.createOscillator()
    let volume = contexte.createGain()

    oscillateur.connect(volume)
    volume.connect(contexte.destination)

    oscillateur.frequency.value = 880
    volume.gain.setValueAtTime(0.6, contexte.currentTime + quand)
    volume.gain.exponentialRampToValueAtTime(0.001, contexte.currentTime + quand + 0.2)

    oscillateur.start(contexte.currentTime + quand)
    oscillateur.stop(contexte.currentTime + quand + 0.2)
  })
}*/

// --- SON (version iPhone) ---
function jouerSon() {
  if (!contexteAudio) return

  let moments = [0, 0.25, 0.5]

  moments.forEach(function(quand) {
    let oscillateur = contexteAudio.createOscillator()
    let volume = contexteAudio.createGain()

    oscillateur.connect(volume)
    volume.connect(contexteAudio.destination)

    oscillateur.frequency.value = 880
    volume.gain.setValueAtTime(0.6, contexteAudio.currentTime + quand)
    volume.gain.exponentialRampToValueAtTime(0.001, contexteAudio.currentTime + quand + 0.2)

    oscillateur.start(contexteAudio.currentTime + quand)
    oscillateur.stop(contexteAudio.currentTime + quand + 0.2)
  })
}


// --- VIBRATION ---
function vibrer() {
  if (navigator.vibrate) {
    navigator.vibrate([300, 100, 300, 100, 300])
  }
}


// --- BOUTON GO ---
document.querySelector(".btn-go").addEventListener("click", function() {
  if (timerActif) return

  timerActif = true
  contexteAudio = new AudioContext()
  tempsRestant = tempsTotal
  activerWakeLock()
  document.querySelector(".btn-go").textContent = "EN COURS..."

  intervalle = setInterval(function() {
    tempsRestant -= 1
    afficherTemps()
    mettreAJourBarre()

    if (tempsRestant === 3) {
      jouerSon()
    }

    if (tempsRestant <= 0) {
      clearInterval(intervalle)
      timerActif = false
      desactiverWakeLock()
      document.querySelector(".timer").textContent = "GO !"
      document.querySelector(".btn-go").textContent = "GO"
      vibrer()
      jouerSon()

      document.querySelector(".timer").classList.add("clignote")
      setTimeout(function() {
        document.querySelector(".timer").classList.remove("clignote")
      }, 3000)
    }

  }, 1000)
})


// --- BOUTON −15s ---
document.querySelectorAll(".btn-ajust")[0].addEventListener("click", function() {
  if (!timerActif && tempsTotal > 15) {
    tempsTotal -= 15
    tempsRestant = tempsTotal
    afficherTemps()
  }
})


// --- BOUTON +15s ---
document.querySelectorAll(".btn-ajust")[1].addEventListener("click", function() {
  if (!timerActif) {
    tempsTotal += 15
    tempsRestant = tempsTotal
    afficherTemps()
  }
})


// --- BOUTON RESET ---
document.getElementById("reset").addEventListener("click", function() {
  clearInterval(intervalle)
  timerActif = false
  desactiverWakeLock()
  tempsRestant = tempsTotal

  document.querySelector(".btn-go").textContent = "GO"
  document.getElementById("barre").style.width = "100%"

  let timer = document.querySelector(".timer")
  let barre = document.getElementById("barre")
  timer.classList.remove("danger")
  barre.classList.remove("danger")
  timer.classList.remove("clignote")

  afficherTemps()
})
// config.js
const GameConfig = {
    // Game Configuration Constants
    colors: ['red', 'green', 'blue', 'yellow', 'purple', 'cyan', 'orange', 'pink'],
    colorsAsHex: ['#FF0000', '#008000', '#0000FF', '#FFFF00', '#800080', '#00FFFF', '#FFA500', '#FFC0CB'],
    controlsList: [
        { left: 'ArrowLeft', right: 'ArrowRight' },
        { left: 'KeyQ', right: 'KeyW' },
        { left: 'KeyN', right: 'KeyM' },
        { left: 'KeyO', right: 'KeyP' },
        { left: 'KeyA', right: 'KeyS' },
        { left: 'KeyK', right: 'KeyL' },
        { left: 'KeyF', right: 'KeyG' },
        { left: 'KeyV', right: 'KeyB' }
    ],
    initialSnakeSpeed: .18,
    snakeSpeedIncrement: 0.00075,
    steeringSpeed: 0.07, // Adjust this value to change steering sensitivity
    boostSpeed: .5, // Adjust this value to change steering sensitivity
    lineWidth: 4, // Configurable snake thickness
    backgroundImage: 'background.png', // Background image file name
    melodyVolume: 0.1, // Volume for the background melody
    musicFile: 'music.mp3', // Music file (converted from music.mid)
    initialMusicPlaybackRate: 0.85, // Starting playback rate for the music
    displayApples: true,
    displayGoldenApples: true,
    appleDisplayFrequencyInSeconds: 10,
    appleRadius : 6,
    specialAppleProbability : .2
};

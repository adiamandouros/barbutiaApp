let finalKeys = []

// dimos on desktop
document.addEventListener('keydown', (event) => {
    finalKeys.push(event.key);
    if(finalKeys.length>=4){
        // console.log(finalKeys);
        if(finalKeys[0]==1 && finalKeys[1]==3 && finalKeys[2]==1 && finalKeys[3]==2){
            let egg = document.getElementsByClassName('egg')[0];
            egg.style.visibility = "visible";
            egg.style.opacity = 0.5;
        }
        finalKeys = finalKeys.slice(1);
    }
  }, false);


// dimos on mobile and audio in all vesions
let soundPlaying = false;
const eye = new Audio('/sounds/matoklada.mp3');
document.addEventListener('keyup', (event)=>{
    const inputs = document.querySelectorAll('input');
    inputs.forEach(element => {
      if(element.value==1312) {
        let egg = document.getElementsByClassName('egg')[0];
        egg.style.visibility = "visible";
        egg.style.opacity = 0.5;
      }
      if(soundPlaying){
        eye.pause();
        eye.pause();
        eye.pause();
        eye.currentTime = 0;
        soundPlaying = false;
      }
      else if(element.value=='sauron') {
        eye.play();
        soundPlaying = true;
      }
    })
}, false);

// // popover initialization
// var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
// var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
//   return new bootstrap.Popover(popoverTriggerEl);
// })

const search = new URL(window.location).searchParams.get('search');
const images = document.querySelectorAll('.img-thumbnail');
const modalImage = document.getElementById('modalImage');
const imageDisplayer = new bootstrap.Modal(document.getElementById('imageDisplayer'));

for(const image of images) {
    image.addEventListener('click', (event) => {
        // console.log(event);
        modalImage.setAttribute('src', event.srcElement.currentSrc.replace('Resized', 'Original'));
        modalImage.setAttribute('alt', event.srcElement.alt);
        imageDisplayer.show();
    })
}

document.addEventListener('keyup', (event)=>{
    const inputs = document.querySelectorAll('input');
    inputs.forEach(element => {
      if(element.value=='dreamteam') {
        modalImage.setAttribute('src', '/content/imgs/gallery/Original/mersini and me.jpg');
        modalImage.setAttribute('alt', 'Well hello there!');
        imageDisplayer.show();
      }
    })
}, false);
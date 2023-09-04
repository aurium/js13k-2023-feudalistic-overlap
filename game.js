console.log(`
Rules:

Pope https://en.wikipedia.org/wiki/Papal_regalia_and_insignia (Saint Peter's Keys)
King https://commons.wikimedia.org/wiki/File:Picture_of_Queen_Ediva_in_Canterbury_Cathedral_(detail).png
Bishop

Noble
Priest
Knight

Bourgeois
Servant
Peasant
`)

const piecesSrc = document.querySelector('#src')

fetch('pieces.3.svg')
.then(res => res.text())
.then(code => {
  piecesSrc.innerHTML += code //.replace(/style="/g, `style="stroke-width:3;`)
})

const ctx = c.getContext('2d')

const img = new Image()
img.onload = init
img.onerror = initError
img.src = "pieces.4.svg"

function init() {
  console.log('INIT')
  ctx.fillStyle = '#FFF'
  ctx.fillRect(0, 0, 1200, 1200)
  ctx.drawImage(img, 0, 0, 1200, 1200)
  const imgData = ctx.getImageData(0, 0, 1200, 1200)
  const origPix = imgData.data
  const newPix = new Uint8ClampedArray(origPix.length)
  const pos = (x, y)=> (1200*y + x) * 4
  const kernel = [ // Emboss convolution matrix
    [  0, +1, +1, +1, +.5 ],
    [ +1, +1, +1, +.5, -1 ],
    [ +1, +1, 0.0, -1, -1 ],
    [ +1, -.5, -1, -1, -1 ],
    [ -.5, -1, -1, -1,  0 ],
  ]
  for (let y=0; y<1200; y++) for (let x=0; x<1200; x++) {
    let light = 0
    for (let ky=0; ky<5; ky++) for (let kx=0; kx<5; kx++) {
      light += (origPix[pos(x+kx-2, y+ky-2)] / 255) * kernel[ky][kx] || 0
    }
    let i = pos(x, y)
    newPix[i+0] = newPix[i+1] = newPix[i+2] = 127 + (light*127/9)
    newPix[i+3] = 255
    if (y%200===0 && x%200===0) {
      newPix[i+0] = 255
      newPix[i+1] = newPix[i+2] = 0
    }
  }
  ctx.putImageData(new ImageData(newPix, 1200, 1200), 0, 0)
}

function initError(err) {
  console.log('Fail to init:', err)
  alert('Fail to init!\n\n'+err.message)
}

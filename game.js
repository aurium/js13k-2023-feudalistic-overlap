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

const { PI, sin, cos, pow, random } = Math
const turn = 2*PI
const rnd = (mult=1)=> random() * mult
const coinBGs = []

fetch('pieces.3.svg')
.then(res => res.text())
.then(code => {
  document.querySelector('#src').innerHTML += code //.replace(/style="/g, `style="stroke-width:3;`)
})

const ctx = c.getContext('2d')

const img = new Image()
img.onload = init
img.onerror = initError
img.src = "pieces.4.svg"

const getPos = (x, y)=> (1200*y + x) * 4

async function init() {
  console.log('INIT')

  for (let lightRevX=0; lightRevX<=1; lightRevX++) {

    // Draw coin dots:
    drawCoinDots()
    const coinDotsPix = emboss(ctx.getImageData(0, 0, 1200, 1200).data, lightRevX)

    // Draw coin symbols:
    ctx.fillStyle = '#FFF'
    ctx.fillRect(0, 0, 1200, 1200)
    ctx.drawImage(img, 0, 0, 1200, 1200)
    const newPix = emboss(ctx.getImageData(0, 0, 1200, 1200).data, lightRevX)
    // Make some icons more legible:
    contrast(newPix, 0, 0, 400, 400, 1.5) // Pope keys
    contrast(newPix, 400, 0, 800, 400, 1.2) // King and Bishop
    contrast(newPix, 0, 400, 400, 800, 1.8) // the two persons
    contrast(newPix, 400, 400, 400, 400, 1.5) // the priest cross
    contrast(newPix, 400, 800, 800, 400, 1.333) // the two lasts

    // Apply coin dots over coin symbols:
    coinDotsPix.forEach((val, i)=> {
      if (val !== 127) newPix[i] = val
    })

    // Apply gold texture
    for (let i=0; i<newPix.length; i+=4) {
      let r = newPix[i+0] / 255
      let g = newPix[i+1] / 255
      let b = newPix[i+2] / 255
      if (rnd() < .2) {
        newPix[i+0] = 50 + 155*r + rnd(50)
        newPix[i+1] = newPix[i+0] * (g<.7 ? .6+rnd(.3) : 1)
        newPix[i+2] = rnd(100) * b
      } else {
        newPix[i+0] = 50 + 190*r
        newPix[i+1] = 220*g
        newPix[i+2] = 200*pow(b, 4)
      }
    }

    // Apply bg data to canvas:
    ctx.putImageData(new ImageData(newPix, 1200, 1200), 0, 0)
    // Clear the top line, resulting of emboss out of limits:
    ctx.fillStyle = '#916e0c'
    ctx.fillRect(0,0,1200,2)

    // Save background
    await new Promise(resolve =>
      c.toBlob(blob=> {
        coinBGs.push(URL.createObjectURL(blob))
        resolve()
      })
    )
  }
  coinBGs.forEach((url, i)=> {
    document.body.style.setProperty('--bg'+i, `url(${url})`)
    const img = new Image()
    img.src = url
    document.body.appendChild(img)
  })
}

function emboss(origPix, lightRevX) {
  const newPix = new Uint8ClampedArray(origPix.length)
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
      let rkx = lightRevX ? 4-kx : kx
      light += (origPix[getPos(x+kx-2, y+ky-2)] / 255) * kernel[ky][rkx] || 0
    }
    let i = getPos(x, y)
    newPix[i+0] = newPix[i+1] = newPix[i+2] = 127 + (light*127/9)
    newPix[i+3] = 255
    if (y%200===0 && x%200===0) {
      newPix[i+0] = 255
      newPix[i+1] = newPix[i+2] = 0
    }
  }
  return newPix
}

function initError(err) {
  console.log('Fail to init:', err)
  alert('Fail to init!\n\n'+err.message)
}

function drawCoinDots() {
  ctx.fillStyle = '#FFF'
  ctx.fillRect(0, 0, 1200, 1200)
  for (let coin=0; coin<9; coin++) {
    let coinX = 200 + 400 * (coin % 3)
    let coinY = 200 + 400 * ~~(coin / 3)
    let coinR = 180 - coin*10
    let dots = 20 + (9-coin)*3
    ctx.fillStyle = '#000'
    for (let i=0; i<dots; i++) {
      let a = turn * i/dots
      ctx.beginPath()
      ctx.arc(coinX + sin(a)*coinR, coinY + cos(a)*coinR, 5, 0, turn)
      ctx.fill()
    }
  }
}

function contrast(data, xLeft, yTop, w, h, mult) {
  for (let y=yTop; y<yTop+h; y++) for (let x=xLeft; x<xLeft+w; x++) {
    let i = getPos(x, y)
    data[i+0] = data[i+1] = data[i+2] = data[i]*mult + 127*(1-mult)
    //data[i+0] = 127*mult
  }
}

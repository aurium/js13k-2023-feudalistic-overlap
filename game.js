let grabedCoin = null
let grabStart = {}
let curPlace = null

function grabCoin(ev) {
  grabedCoin = ev.target
  grabedCoin.classList.add('grabed')
  body.classList.add('grabbing')
  grabStart = { x: ev.pageX, y: ev.pageY }
  console.log('Grab', grabedCoin.player, grabedCoin.dataset.name, grabStart)
  for (let y=0; y<3; y++) for (let x=0; x<3; x++) {
    places[y][x].style.setProperty(
      '--color', placeAcceptCoin({x, y}, grabedCoin) ? '#0AF' : '#F00'
    )
  }
}

body.addEventListener('mouseup', (ev)=> {
  body.classList.remove('grabbing')
  if (grabedCoin) {
    console.log('Release', grabedCoin.player, grabedCoin.dataset.name)
    grabedCoin.classList.remove('grabed')
    if (!(curPlace && placeCoin(grabedCoin, curPlace))) grabedCoin.style.transform = ''
    grabStart = { }
    grabedCoin = null
  }
  for (let y=0; y<3; y++) for (let x=0; x<3; x++) {
    places[y][x].style.setProperty('--color', 'transparent')
  }
})

body.addEventListener('mousemove', (ev)=> {
  if (grabedCoin) {
    //console.log('Move', ev.pageX-grabStart.x, ev.pageY-grabStart.y)
    grabedCoin.style.transform = `translate(${ev.pageX-grabStart.x}px, ${ev.pageY-grabStart.y}px)`
  }
})

function enterPlace(x, y) {
  curPlace = {x, y}
  console.log('Enter', curPlace)
}

function leavePlace(x, y) {
  console.log('Leave', curPlace)
  curPlace = null
}

function placeAcceptCoin(place, coin) {
  const curCoin = getCoinAt(place)
  console.log(
    'placeAcceptCoin', place,
    coin.dataset.name,
    curCoin?.dataset.name,
    (curCoin?.roleIdx||0)
  )
  return !curCoin || ( (curCoin?.roleIdx||0) < coin.roleIdx )
}

function placeCoin(coin, place) {
  if (!placeAcceptCoin(place, coin)) return false
  coin.classList.remove('waiting')
  coin.classList.add('placed')
  const oldCoin = getCoinAt(place)
  places[place.y][place.x].coin = coin

  grabedCoin.style.transform = null
  grabedCoin.style.setProperty('--placeX', place.x-1)
  grabedCoin.style.setProperty('--placeY', place.y-1)

  // Tell the user:
  const at = (place.x==1 && place.y==1) ? 'center'
           : ['left', 'middle', 'right'][place.x] +' '+ ['top', 'middle', 'bottom'][place.y]
  if (oldCoin) tts(`${oldCoin.dataset.name} was replaced by ${coin.dataset.name} at ${at} square.`)
  else tts(`${coin.dataset.name} was placed at ${at} square.`)
  return true
}

function getCoinAt(place) {
  return places[place.y][place.x].coin
}

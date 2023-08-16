canvas = document.querySelector("canvas")
ctx = canvas.getContext('2d')

function defineCanvas(){
	canvas.height = window.innerHeight
	canvas.width = window.innerWidth
}

defineCanvas()

function game_update(){
	ctx.fillStyle = "#3f9623"
	ctx.fillRect(0,0,canvas.width, canvas.height)
}

function distFunc(x1,y1,x2,y2){
	let vector = [x2-x1, y2-y1]
	return Math.sqrt(vector[0]**2+vector[1]**2)
}

class Items{
	constructor(){
		this.generalSize = 40
		this.template = {iron: {sprite:new Image()}, 
						 lamp: {sprite:new Image()}, 
						 eye: {sprite: new Image()}}
		this.template.iron.sprite.src = 'assets\\iron.png'
		this.template.lamp.sprite.src = 'assets\\lamp.png'
		this.template.eye.sprite.src = 'assets\\eye.png'

		this.items = []

		this.score = 0
		this.stopwatch = {save:0,final:0}

		this.odds = {iron:{positions: [], amount: 10, x: canvas.width/2-180, y: canvas.height/2-50, radius: 30, sprite: this.template.iron.sprite},
					 lamp:{positions: [], amount: 10, x: canvas.width/2-180, y: canvas.height/2+45, radius: 30, sprite: this.template.lamp.sprite},
					 eye: {positions: [], x: canvas.width/2-280+this.generalSize*10, y: canvas.height/2+45, radius: 30, sprite: this.template.eye.sprite}}
		this.genOdd(this.odds.iron)
		this.genOdd(this.odds.lamp)

		this.tookOdd = {odd: {x: 0, y:0, radius: 0, sprite: null}}
		this.mousePos = {x: 0, y: 0}
 
		this.eyesPos = []
	}

	isEye(){
		return this.tookOdd.odd.sprite != null && 
		   	   this.tookOdd.odd.sprite.src == this.template.eye.sprite.src
	}

	genOdd(odd){
		let cirleParts = 5		
		for(let o=0; o<odd.amount; o++){
			let rand = Math.floor(Math.random()*cirleParts+1)/cirleParts
			let pos = {x: Math.sin(rand*Math.PI)*odd.radius*Math.random(), y: Math.cos(rand*Math.PI)*odd.radius*Math.random()}
			odd.positions.push(pos)
		}
	}
	defineTookOdd(){
		let mouse = this.mousePos

		for(let o in this.odds){
			o = this.odds[o]
			if(distFunc(mouse.x, mouse.y, o.x+o.radius, o.y+o.radius) < o.radius){
				if(o.sprite.src != this.template.eye.sprite.src){ // isEye
				this.tookOdd.odd = {x: o.x, y: o.y, radius: o.radius, sprite: o.sprite}
				break
				}
			}
		}
	}

	drawOdd(odd){
		for(let o in odd.positions){
			let pos = odd.positions[o]
			ctx.drawImage(odd.sprite, pos.x+odd.x, pos.y+odd.y, this.generalSize, this.generalSize)
		}
	}

	drawTookOdd(){
		let todd = this.tookOdd
		let mouse = this.mousePos
		let size = this.isEye() ? this.generalSize*2: this.generalSize

		if(todd.odd.sprite != null){
			ctx.drawImage(todd.odd.sprite, mouse.x-size/2, mouse.y-size/2, size, size)
		}
	}
	highlightTookOdd(){
		let todd = this.tookOdd
		let mouse = this.mousePos

		if(todd.odd.sprite != null && todd.odd.sprite.src != this.template.eye.sprite.src){

			let sizeRect = todd.odd.radius*2.5

			ctx.lineWidth = 4
			ctx.strokeStyle = '#76e352'
			ctx.strokeRect(todd.odd.x-sizeRect*0.1, todd.odd.y-sizeRect*0.1, sizeRect, sizeRect)
		}
	}

	drawTable(odd){
		let sizeRect = odd.radius*3.25

		ctx.fillStyle = '#1a4d20'
		ctx.fillRect(odd.x-sizeRect*0.2, odd.y-sizeRect*0.2, sizeRect, sizeRect)
	}

	putEyeOnTable(){
		let eye = this.odds.eye
		let mouse = this.mousePos
		let sizeRect = eye.radius*3.25
		let sizeEye = this.generalSize * 2 

		if(this.isEye()){
			if(mouse.x > eye.x-sizeRect*0.2 && mouse.x < eye.x-sizeRect*0.2+sizeRect &&
			   mouse.y > eye.y-sizeRect*0.2-sizeRect*0.96 && mouse.y < eye.y-sizeRect*0.2-sizeRect*0.96 + sizeRect*1.96){
				this.eyesPos.push({x:mouse.x-sizeEye/2, y:mouse.y-sizeEye/2})
				this.tookOdd.odd.sprite = null
				this.score += 1
				this.stopwatch.final = (this.stopwatch.save/fps).toFixed(2)
				this.stopwatch.save = 0
			}
		}
	}

	drawEyeTable(){
		let eye = this.odds.eye
		let sizeRect = eye.radius*3.25
		let sizeEye = this.generalSize * 2 
		let center = {x: canvas.width/2, y:canvas.height/2}

		ctx.fillStyle = '#1a4d20'
		ctx.fillRect(eye.x-sizeRect*0.2, eye.y-sizeRect*0.2-sizeRect*0.96, sizeRect, sizeRect*1.96)

		for(let e in this.eyesPos){
			e = this.eyesPos[e]
			ctx.drawImage(eye.sprite, e.x, e.y, sizeEye, sizeEye)
		}
	}

	highlightEyeTable(){
		let eye = this.odds.eye
		let sizeRect = eye.radius*3.25
		let sizeEye = this.generalSize * 2 
		let center = {x: canvas.width/2, y:canvas.height/2}

		if(this.isEye()){
			ctx.strokeStyle = '#76e352'
			ctx.lineWidth = 4
			ctx.strokeRect(eye.x-sizeRect*0.1, eye.y-sizeRect*0.2-sizeRect*0.96*0.9, sizeRect*0.8, sizeRect*1.96*0.9)
		}
	}

	activeStopWatch(){
		this.stopwatch.save += 1
	}

	drawScore(){
		let score = this.score.toString()
		let pos = {x: canvas.width/2, y:canvas.height/2}

		ctx.font = "50px Pixel"
		ctx.fillText(score, pos.x-score.length*0.22*50-2, pos.y-90)
	}

	drawStopWatch(){
		let stopwatch = this.stopwatch.final < 99 ? this.stopwatch.final.toString():'99'
		let pos = {x: canvas.width, y:canvas.height}

		ctx.font = "35px Pixel"
		ctx.fillText(stopwatch, pos.x/2+140-(stopwatch.length-1)*0.25*35, pos.y/2-90)
	}

	draw(){

		this.drawTable(this.odds.iron)
		this.drawTable(this.odds.lamp)
		this.drawEyeTable()
		this.highlightTookOdd()
		this.highlightEyeTable()
		this.drawOdd(this.odds.iron)
		this.drawOdd(this.odds.lamp)
		this.drawTookOdd()
		this.drawScore()
		this.drawStopWatch()
	}

	update(){
		this.draw()
		this.activeStopWatch()
	}


}

class CraftTable{
	constructor(items){
		this.items = items

		this.size = {slot: {h: 50, w: 50}}
		this.table = {items: [], preItems: []}
		this.craftedItem = null

		this.x = canvas.width/2 - this.size.slot.w*1.5
		this.y = canvas.height/2 - this.size.slot.h

		this.mousePos = {x: 0, y: 0}

		this.isPressButton = false 

		this.initTable()
		this.initPreItems()

	}

	initTable(){
		let size = this.size.slot

		for(let i=0; i<3; i++){
			for(let j=0; j<3; j++){
				this.table.items.push({x:size.w*i, y:size.h*j, item: null})
			}
		}
	}

	drawTable(){
		let size = this.size.slot

		ctx.fillStyle = '#1a4d20'
		ctx.fillRect(this.x-size.w*0.5/2, this.y-size.h*0.5/2, size.w*3.5, size.h*3.5)

		if(this.items.tookOdd.odd.sprite == null && !this.isPressButton){
			ctx.strokeStyle = '#76e352'
		}else{
			ctx.strokeStyle = '#3f9623'
		}

		if(this.items.tookOdd.odd.radius == 0){
			ctx.strokeStyle = '#3f9623'
		}

		ctx.lineWidth = 5
		for(let t in this.table.items){
			t = this.table.items[t]
			ctx.strokeRect(t.x+this.x, t.y+this.y, size.w, size.h)
		}
		
	}

	isEye(){
		return this.items.tookOdd.odd.sprite != null && 
		   	   this.items.tookOdd.odd.sprite.src == this.items.template.eye.sprite.src
	}

	putItem(){
		let took = this.items.tookOdd.odd
		let mouse = this.mousePos

		let size = this.size.slot

		if(this.isEye()){
			return null
		}

		for(let p in this.table.items){
			p = this.table.items[p]
			let positions = {x: [this.x+p.x, this.x+p.x+size.w], y: [this.y+p.y, this.y+p.y+size.h]}

			if(took.sprite != null){
			if(mouse.x > positions.x[0] && mouse.x < positions.x[1] &&
			   mouse.y > positions.y[0] && mouse.y < positions.y[1]){
				p.item = took.sprite
				took.sprite = null
				this.isPressButton = false
			}
			}
		}
	}

	drawItems(){
		let sizeItem = this.items.generalSize
		let sizeSlot = this.size.slot


		for(let p in this.table.items){
			p = this.table.items[p]

			if(p.item!=null){
			ctx.drawImage(p.item, p.x+this.x + sizeSlot.w*0.15, p.y+this.y + sizeSlot.h*0.15)
			}
		}
	}

	initPreItems(){
		let list = []

		let iron = this.items.template.iron.sprite
		let lamp = this.items.template.lamp.sprite

		let sizeItem = this.items.generalSize
		let sizeSlot = this.size.slot
	
		for(let p_ in this.table.items){
			let p = this.table.items[p_]
			if(p_ != 4){
				list.push({item: iron, x: p.x+this.x + sizeSlot.w*0.15, y: p.y+this.y + sizeSlot.h*0.15})	
			}else{
				list.push({item: lamp, x: p.x+this.x + sizeSlot.w*0.15, y: p.y+this.y + sizeSlot.h*0.15})
			}
		}

		this.table.preItems = list
		
	}

	drawPreItems(){
		ctx.save()
		ctx.globalAlpha = 0.3
		for(let p in this.table.preItems){
			p = this.table.preItems[p]
			ctx.drawImage(p.item, p.x, p.y)
		}

		ctx.restore()
	}

	drawCraftButton(){
		let size = this.size.slot
		let mouse = this.mousePos


		ctx.fillRect(this.x, this.y+size.h*3.5, size.w*3, size.h)

		ctx.font = '40px Pixel'


		// Check tap on button
		if(mouse.x > this.x && mouse.x < this.x + size.w*3 &&
		   mouse.y > this.y+size.h*3.5 && mouse.y < this.y+size.h*3.5 + size.h &&
		   this.items.tookOdd.odd.sprite == null)
		{
			ctx.fillStyle = '#76e352'
			this.isPressButton = true
		}else{
			ctx.fillStyle = '#3f9623'
		}
		
		ctx.fillText('CRAFT', this.x+size.w*0.4, this.y+size.h*4.25)
	}

	isCraft(){
		if(this.isPressButton){
			for(let i in this.table.items){


				if(this.table.items[i].item == null){
					return false
				}

				if(this.table.items[i].item != null){
					if(this.table.items[i].item.src != this.table.preItems[i].item.src)
						return false
				}
			}
			return true
		}
	}

	craftItem(){
		if(this.isCraft()){
			for(let i in this.table.items){
				this.table.items[i].item = null
			}
			this.craftedItem = this.items.template.eye.sprite
		}
	}

	drawCraftedItem(){
		let size = this.size.slot
		let center_item = this.table.items[4]
		let pos = {x: center_item.x, y: center_item.y}
		let mouse = this.mousePos

		if(this.craftedItem != null){
			ctx.drawImage(this.craftedItem, this.x+pos.x, this.y+pos.y, size.w, size.h)


			if(distFunc(mouse.x, mouse.y, this.x+pos.x+size.w/2, this.y+pos.y+size.h/2) < (size.w+size.h)/4){
				this.items.tookOdd.odd.sprite = this.craftedItem
				this.craftedItem = null
			}
		}
	}

	draw(){
		this.drawTable()
		this.drawPreItems()
		this.drawItems()
		this.drawCraftButton()
		this.drawCraftedItem()
	}

	update(){
		this.draw()
		this.putItem()
		this.craftItem()
	}

}


const fps = 60

var items = new Items()
const table = new CraftTable(items)


function animate(){
	setTimeout(()=>{
	window.requestAnimationFrame(animate)
	}, 1000/fps)

	defineCanvas()

	game_update()

	table.update()
	items.update()
	
}

window.addEventListener('mousemove', function(event){
	items.mousePos = {x: event.clientX, y: event.clientY}
})

window.addEventListener('click', function(event){
	items.mousePos = {x: event.clientX, y: event.clientY}
	items.defineTookOdd()
	items.putEyeOnTable()

	table.mousePos = {x: event.clientX, y: event.clientY}
})

animate()

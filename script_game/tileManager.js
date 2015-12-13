//A library to manage tiles

var terainKey = [ //growthChance = x/30
 {type:"neutral", growthChance:5, textureIndex:[0]},
 {type:"sandy", growthChance:3, textureIndex:[1]},
 {type:"stone", growthChance:1, textureIndex:[4,5], resource: "stone", hint:12},
 {type:"wood", growthChance:2, textureIndex:[], resource: "wood", hint:13},
 {type:"iron", growthChance:1, textureIndex:[2,3], resource: "iron", hint:14},
 {type:"food", growthChance:3, textureIndex:[10], resource: "food", hint:15},
 {type:"water", growthChance:3, textureIndex:[6], resource: "water"},
 {type:"rockBlock", growthChance:1, textureIndex:[], blocking: true},
 {type:"villageHall_ne", growthChance:1, textureIndex:[11], blocking: true},
 {type:"villageHall_se", growthChance:1, textureIndex:[12], blocking: true},
 {type:"villageHall_sw", growthChance:1, textureIndex:[13], blocking: true}, //10
 {type:"villageHall_nw", growthChance:1, textureIndex:[14], blocking: true},
 {type:"stone_hint", growthChance:5, textureIndex:[15,16]},
 {type:"wood_hint", growthChance:5, textureIndex:[0]},
 {type:"iron_hint", growthChance:5, textureIndex:[17,18]},
 {type:"food_hint", growthChance:5, textureIndex:[19,20]},
]
var growthKey = [
 {type:"clear", pathWeight:2, speedMultiplier:1},
 {type:"light", pathWeight:1, speedMultiplier:0.66},
 {type:"medium", pathWeight:2, speedMultiplier:0.33},
 {type:"heavy", pathWeight:12, speedMultiplier:0.05},
]
var centerLTileIndex = 3 //impies map total size
var lTileSize = 30
var center = (centerLTileIndex*lTileSize)+Math.floor(lTileSize/2)-1
var tilePixelWidth = 64
var tilePixelHeight = 45

tileManager = function(){
	this.growCooldown = 4
	this.currentGrowCooldown = this.growCooldown

	this.largeTileRows = []
	for(var i = 0; i<(centerLTileIndex*2)+1; i++){
		this.largeTileRows[i] = []
	}
	this.largeTileRows[centerLTileIndex][centerLTileIndex] = genStartingTileGroup(centerLTileIndex, centerLTileIndex)
	this.updatePathfindingGraph();
}

tileManager.textures =
[
	{map:bmacSdk.GEO.loadPixelTexture("media/dirt.png")},
	{map:bmacSdk.GEO.loadPixelTexture("media/sand.png")},
	{map:bmacSdk.GEO.loadPixelTexture("media/iron1.png")},
	{map:bmacSdk.GEO.loadPixelTexture("media/iron2.png"),width:64,height:50,offY:-5/2},
	{map:bmacSdk.GEO.loadPixelTexture("media/stone1.png")},
	{map:bmacSdk.GEO.loadPixelTexture("media/stone2.png"),width:64,height:48,offY:-3/2},
	{map:bmacSdk.GEO.loadPixelTexture("media/water.png")},
	{map:bmacSdk.GEO.loadPixelTexture("media/growth1.png")},
	{map:bmacSdk.GEO.loadPixelTexture("media/growth2.png")},
	{map:bmacSdk.GEO.loadPixelTexture("media/growth3.png")},
	{map:bmacSdk.GEO.loadPixelTexture("media/food.png")}, //10
	{map:bmacSdk.GEO.loadPixelTexture("media/villagehall_ne.png"),width:105,height:95,offX:(105-tilePixelWidth)/2,offY:-(95-tilePixelHeight)/2},
	{map:bmacSdk.GEO.loadPixelTexture("media/villagehall_se.png"),width:105,height:119,offX:(105-tilePixelWidth)/2,offY:-18},
	{map:bmacSdk.GEO.loadPixelTexture("media/villagehall_sw.png"),width:64,height:119,offY:-18},
	{map:bmacSdk.GEO.loadPixelTexture("media/villagehall_nw.png"),width:64,height:95,offY:-(95-tilePixelHeight)/2},
	{map:bmacSdk.GEO.loadPixelTexture("media/stonehint1.png")},
	{map:bmacSdk.GEO.loadPixelTexture("media/stonehint2.png")},
	{map:bmacSdk.GEO.loadPixelTexture("media/ironhint1.png")},
	{map:bmacSdk.GEO.loadPixelTexture("media/ironhint2.png")},
	{map:bmacSdk.GEO.loadPixelTexture("media/foodhint1.png")},
	{map:bmacSdk.GEO.loadPixelTexture("media/foodhint2.png")}, //20
]

// initialize geometry for textures
tileManager.geo = bmacSdk.GEO.makeSpriteGeo(tilePixelWidth, tilePixelHeight);
for (var c = 0; c < tileManager.textures.length; c++)
{
	var texture = tileManager.textures[c];
	if (texture.width !== undefined && texture.height !== undefined)
	{
		texture.isExtraSized = true;
		tileManager.textures[c].geo = bmacSdk.GEO.makeSpriteGeo(texture.width, texture.height);
		if (texture.offX || texture.offY)
		{
			var matrix = new THREE.Matrix4().makeTranslation(texture.offX?texture.offX:0,texture.offY?texture.offY:0,0);
			tileManager.textures[c].geo.applyMatrix(matrix);
		}
	}
	else
	{
		tileManager.textures[c].geo = tileManager.geo;
	}
}


var tile = function (terrainType, growthLevel, globalX, globalY){
	this.terrainType = ((terrainType != null) ? terrainType : 0);
	this.growthLevel = ((growthLevel != null) ? growthLevel : 3);
	
	this.changeTerrain = function(index){
		if (this.terrainMesh){
			GameEngine.scene.remove(this.terrainMesh);
		}
		if(terainKey[terrainType].textureIndex.length != 0 && globalX != null){
			var texture = tileManager.textures[
					terainKey[index].textureIndex[
						Math.randomInt(terainKey[index].textureIndex.length)
					]
				];
			if (texture){
				this.terrainMesh = bmacSdk.GEO.makeSpriteMesh(texture.map, texture.geo);
				//HACK: place textures that are not the default size above others
				this.terrainMesh.position.set(globalX*tilePixelWidth, globalY*tilePixelHeight, texture.isExtraSized?-89:-90);
				GameEngine.scene.add(this.terrainMesh);
			}
		}
	}
	
	this.changeTerrain(terrainType);
	
	this.drawGrowth = function(){
		if (!this.growthMesh){
			this.growthMesh = bmacSdk.GEO.makeSpriteMesh(tileManager.textures[6+this.growthLevel].map, tileManager.geo);
			this.growthMesh.position.set(globalX*tilePixelWidth, globalY*tilePixelHeight, -30);
			GameEngine.scene.add(this.growthMesh);
		}
		if (this.growthLevel > 0) {
			this.growthMesh.material.map = tileManager.textures[6+this.growthLevel].map;
			this.growthMesh.visible = true;
		} else {
			this.growthMesh.visible = false;
		}
	}
	if(growthLevel != 0 && globalX != null){
		this.drawGrowth()
	}
}

//a 30x30 group of tiles
var genTileGroup = function(lTileX,lTileY){
	tiles = []
	for(var i = 0; i<lTileSize; i++){
		tiles[i] = []
	}
	if(lTileX == 0){ //block west
		for(var y = 0; y<lTileSize; y++){
			tiles[0][y] = new tile(7, 3,(lTileX*lTileSize+i)-center,(lTileY*lTileSize+j)-center);
		}
	} 
	if(lTileX == centerLTileIndex*2){ //block west
		for(var y = 0; y<lTileSize; y++){
			tiles[lTileSize-1][y] = new tile(7, 3,(lTileX*lTileSize+i)-center,(lTileY*lTileSize+j)-center);
		}
	}
	if(lTileY == 0){ //block north
		for(var x = 0; x<lTileSize; x++){
			tiles[x][0] = new tile(7, 3,(lTileX*lTileSize+i)-center,(lTileY*lTileSize+j)-center);
		}
	}
	if(lTileY == centerLTileIndex*2){ //block south
		for(var x = 0; x<lTileSize; x++){
			tiles[x][lTileSize-1] = new tile(7, 3,(lTileX*lTileSize+i)-center,(lTileY*lTileSize+j)-center);
		}
	}
	
	for(var i = 0; i<lTileSize; i++){
		for(var j = 0; j<lTileSize; j++){
			if(tiles[i][j] == null){ //fill tiles that are still empty
				switch (Math.randomInt((lTileSize*lTileSize)/3)) { //on average 3 of each resource tile should be added to each tileGroup
				  case 0:
				  	tiles[i][j] = new tile(5, 3,(lTileX*lTileSize+i)-center,(lTileY*lTileSize+j)-center);
				    break;
				  case 1:
				  	tiles[i][j] = new tile(3, 3,(lTileX*lTileSize+i)-center,(lTileY*lTileSize+j)-center);
				    break;
				  case 2:
				  	tiles[i][j] = new tile(2, 3,(lTileX*lTileSize+i)-center,(lTileY*lTileSize+j)-center);
				    break;
				  case 3:
				  	tiles[i][j] = new tile(4, 3,(lTileX*lTileSize+i)-center,(lTileY*lTileSize+j)-center);
				    break;
				  default:
					tiles[i][j] = new tile(0,3,(lTileX*lTileSize+i)-center,(lTileY*lTileSize+j)-center);
				    break;
				}
			}
		}
	}
	
	addHintsToTileGroup(tiles);
	
	return tiles;
}

var genStartingTileGroup = function(lTileX,lTileY){
	tiles = []
	for(var i = 0; i<lTileSize; i++){
		tiles[i] = []
	}

	var placeNotInCenter = function(type){
		do {
	   	var i = Math.randomInt(lTileSize);
		var j = Math.randomInt(lTileSize);
		} while (((i>10&&i<19)&&(j>10&&j<19)));
		tiles[i][j] = new tile(type, 3,(lTileX*lTileSize+i)-center,(lTileY*lTileSize+j)-center); //food
	}
	placeNotInCenter(5);//food
	placeNotInCenter(5);

	placeNotInCenter(3);//wood
	placeNotInCenter(3);

	placeNotInCenter(2);//stone
	placeNotInCenter(2);

	placeNotInCenter(4);//iron
	placeNotInCenter(4);

	// place the village hall
	tiles[15][14] = new tile(8, 0,(lTileX*lTileSize+15)-center,(lTileY*lTileSize+14)-center);
	tiles[15][15] = new tile(9, 0,(lTileX*lTileSize+15)-center,(lTileY*lTileSize+15)-center);
	tiles[14][15] = new tile(10, 0,(lTileX*lTileSize+14)-center,(lTileY*lTileSize+15)-center);
	tiles[14][14] = new tile(11, 0,(lTileX*lTileSize+14)-center,(lTileY*lTileSize+14)-center);

	for(var i = 0; i<lTileSize; i++){
		for(var j = 0; j<lTileSize; j++){
			if(tiles[i][j] == null){ //fill tiles that are still empty
				if ((i>10&&i<19)&&(j>10&&j<19)){
					tiles[i][j] = new tile(0, 0,(lTileX*lTileSize+i)-center,(lTileY*lTileSize+j)-center);
				} else
					tiles[i][j] = new tile(Math.randomInt(2),3,(lTileX*lTileSize+i)-center,(lTileY*lTileSize+j)-center);
			}
		}
	}
	
	addHintsToTileGroup(tiles);
	
	return tiles;
}

var addHintsToTileGroup = function(tileGroup)
{
	var hintRange = 2;
	for (var x=0; x < tileGroup.length; x++){
		for (var y =0; y < tileGroup[x].length; y++){
			var hint = terainKey[tileGroup[x][y].terrainType].hint;
			if (hint !== undefined){
				// found a resource, place hints around
				for (var x2=Math.max(0,x-hintRange); x2 <= x+hintRange && x2 < tileGroup.length; x2++){
				for (var y2=Math.max(0,y-hintRange); y2 <= y+hintRange && y2 < tileGroup[x2].length; y2++){
					if (tileGroup[x2][y2].terrainType === 0){
						tileGroup[x2][y2].changeTerrain(hint);
					}
				}}
			}
		}
	}
}

tileManager.prototype.worldToTileX = function(x){
	return Math.floor(x/tilePixelWidth + 0.5);
}

tileManager.prototype.worldToTileY = function(y){
	return Math.floor(y/tilePixelHeight + 0.5);
}

tileManager.prototype.tileToWorldX = function(x){
	return x*tilePixelWidth;
}

tileManager.prototype.tileToWorldY = function(y){
	return (y+0.5)*tilePixelHeight;
}

tileManager.prototype.getTileAtWorld = function(x, y){
	return this.getTile(this.worldToTileX(x), this.worldToTileY(y));
}

tileManager.prototype.getTile = function(x, y){ // external 0,0 is largeTileRows[startingIndex][startingIndex][14][14]
	var lTileX = Math.floor((center+x)/lTileSize)
	var lTileY = Math.floor((center+y)/lTileSize)
	var sTileX = (center+x)%lTileSize
	var sTileY = (center+y)%lTileSize
	if(lTileX<0||lTileY<0||lTileX>=(centerLTileIndex*2)+1||lTileY>=(centerLTileIndex*2)+1){
		return "Here be Dragons. You've gone off the map."
	}
	if(this.largeTileRows[lTileX][lTileY] == null){
		this.largeTileRows[lTileX][lTileY] = genTileGroup(lTileX,lTileY);
	}
	return this.largeTileRows[lTileX][lTileY][sTileX][sTileY]
}

tileManager.prototype.getTileTerrain = function(x, y){ // external 0,0 is largeTileRows[startingIndex][startingIndex][14][14]
	var lTileX = Math.floor((center+x)/lTileSize)
	var lTileY = Math.floor((center+y)/lTileSize)
	var sTileX = (center+x)%lTileSize
	var sTileY = (center+y)%lTileSize
	if(lTileX<0||lTileY<0||lTileX>=(centerLTileIndex*2)+1||lTileY>=(centerLTileIndex*2)+1){
		return "Here be Dragons. You've gone off the map."
	}
	if(this.largeTileRows[lTileX][lTileY] == null){
		this.largeTileRows[lTileX][lTileY] = genTileGroup(lTileX,lTileY);
	}
	return terainKey[this.largeTileRows[lTileX][lTileY][sTileX][sTileY].terrainType].type;
}

tileManager.prototype.growTiles = function(){ //grow the jungle
	for(var i = 0; i<this.largeTileRows.length; i++){
		for(var j = 0; j<this.largeTileRows[i].length; j++){
			if(this.largeTileRows[i][j] != null){
				growTileGroup(this.largeTileRows[i][j])
			}
		}
	}
	this.pathfindingNeedsUpdate = true;
}

tileManager.prototype.peek = function(){ //reduce all vines, debug tool
	for (var lx=0; lx<this.largeTileRows.length; lx++){
		if (this.largeTileRows[lx]){
			for (var ly=0; ly<=this.largeTileRows[lx].length; ly++){
				if (this.largeTileRows[lx][ly]){
					for (var x=0; x<this.largeTileRows[lx][ly].length; x++){
						for (var y=0; y<this.largeTileRows[lx][ly][x].length; y++){
							this.largeTileRows[lx][ly][x][y].growthLevel = 1;
							this.largeTileRows[lx][ly][x][y].drawGrowth();
						}
					}
				}
			}
		}
	}
}

var growTileGroup = function(tileGroup){ //doesnt currently grow accross tile groups
	var referenceCopy = []
	for(var i = 0; i<lTileSize; i++){
		referenceCopy[i] = []
		for(var j = 0; j<lTileSize; j++){
			referenceCopy[i][j]=tileGroup[i][j].growthLevel
		}
	}//I hope this doesnt overly hurt performance. Without the copy sprouting based on a newly grown plant can occur
	for(var i = 0; i<tileGroup.length; i++){
		for(var j = 0; j<tileGroup[i].length; j++){
			if(tileGroup[i][j].growthLevel>0 && tileGroup[i][j].growthLevel<3){ //grow
				tileGroup[i][j].growthLevel++;
				tileGroup[i][j].drawGrowth()
			}
			if(tileGroup[i][j].growthLevel==0){ //sproutable? (empty spaces are the less common case)
				for(var i2 = i-1; i2<=i+1; i2++){
					for(var j2 = j-1; j2<=j+1; j2++){
						if(i2<lTileSize && j2<lTileSize && i2>=0 && j2>=0){ //is in bounds
							if(referenceCopy[i2][j2]>=2 
								&& terainKey[tileGroup[i][j].terrainType].growthChance>Math.randomInt(30)+1){
								tileGroup[i][j].growthLevel = 1;
								tileGroup[i][j].drawGrowth()
							}
						}
					}
				}
			}
		}
	}
}

tileManager.prototype.updatePathfindingGraph = function(){
	//TODO: update weights in place if graph already exists
	var weights = [];
	// such nesting. much wow.
	for (var lx=0; lx<centerLTileIndex*2+1; lx++){
		for (var ly=0; ly<=centerLTileIndex*2+1; ly++){
			for (var x=0; x<lTileSize; x++){
				for (var y=0; y<lTileSize; y++){
					var globalX = x + lx*lTileSize;
					var globalY = y + ly*lTileSize;
					if (!weights[globalY]){
						weights[globalY] = [];
					}
					var tile = undefined;
					if (this.largeTileRows[lx] && this.largeTileRows[lx][ly])
					{
						tile = this.largeTileRows[lx][ly][x][y];
					}
					//TODO: !terainKey[tile.terrainType].blocking
					//needs to fix offset bug and AI needs to not path to those spaces
					if (tile)
					{
						weights[globalX][globalY] = growthKey[tile.growthLevel].pathWeight;
					}
					else
					{
						weights[globalX][globalY] = 0;
					}
				}
			}
		}
	}
	this.pathfindingGraph = new Graph(weights);
	this.pathfindingNeedsUpdate = false;
}

tileManager.prototype.dumpPathfindingGraph = function(){ //debug helper
	var output = "";
	for (var x = 0; x < this.pathfindingGraph.grid.length; x++)
	{
		for (var y = 0; y < this.pathfindingGraph.grid[x].length; y++)
		{
			var string = this.pathfindingGraph.grid[x][y].weight + "";
			if (string.length == 1) output += "0";
			output += string + "|";
		}
		output += "\n";
	}
	console.log(output);
}

tileManager.prototype.update = function(){ //grow the jungle
	if (this.currentGrowCooldown > 0){
		this.currentGrowCooldown -= bmacSdk.deltaSec;
	} else {
		this.currentGrowCooldown = this.growCooldown;
		this.growTiles();
	}
	
	if (this.pathfindingNeedsUpdate){
		this.updatePathfindingGraph();
	}
}



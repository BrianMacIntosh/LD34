//A library to manage tiles

var terainKey = [
 {type:"neutral", textureIndex:[0]},
 {type:"sandy", textureIndex:[1]},
 {type:"stone", textureIndex:[4,5]},
 {type:"wood", textureIndex:[]},
 {type:"iron", textureIndex:[2,3]},
 {type:"food", textureIndex:[]},
 {type:"water", textureIndex:[6]},
 {type:"villageHall", textureIndex:[]},
 {type:"rockBlock", textureIndex:[]}
]
var growthKey = ["clear", "light", "medium", "heavy"]
var centerLTileIndex = 3 //impies map total size
var lTileSize = 30
var center = (centerLTileIndex*lTileSize)+Math.floor(lTileSize/2)-1

tileManager = function(){
	this.growCooldown = 2
	this.currentGrowCooldown = 2

	this.largeTileRows = []
	for(var i = 0; i<(centerLTileIndex*2)+1; i++){
		this.largeTileRows[i] = []
	}
	this.largeTileRows[centerLTileIndex][centerLTileIndex] = genStartingTileGroup(centerLTileIndex, centerLTileIndex)
}

tileManager.textures =
[
	THREE.ImageUtils.loadTexture("media/dirt.png"),
	THREE.ImageUtils.loadTexture("media/sand.png"),
	THREE.ImageUtils.loadTexture("media/iron1.png"),
	THREE.ImageUtils.loadTexture("media/iron2.png"),
	THREE.ImageUtils.loadTexture("media/stone1.png"),
	THREE.ImageUtils.loadTexture("media/stone2.png"),
	THREE.ImageUtils.loadTexture("media/water.png"),
	THREE.ImageUtils.loadTexture("media/growth1.png"),
	THREE.ImageUtils.loadTexture("media/growth2.png"),
	THREE.ImageUtils.loadTexture("media/growth3.png")
]

tileManager.geo = bmacSdk.GEO.makeSpriteGeo(64, 45);


var tile = function (terrainType, growthLevel, globalX, globalY){
	this.terrainType = ((terrainType != null) ? terrainType : 0);
	this.growthLevel = ((growthLevel != null) ? growthLevel : 3);
	
	if(terainKey[terrainType].textureIndex.length != 0 && globalX != null){
		this.terrainMesh = bmacSdk.GEO.makeSpriteMesh(
			tileManager.textures[
				terainKey[terrainType].textureIndex[
					Math.randomInt(terainKey[terrainType].textureIndex.length)
				]
			],
		    tileManager.geo
		);
		this.terrainMesh.position.set(globalX*64, globalY*45, -90);
		GameEngine.scene.add(this.terrainMesh);
	}
	this.drawGrowth = function(){
		this.growthMesh = bmacSdk.GEO.makeSpriteMesh(tileManager.textures[6+this.growthLevel], tileManager.geo);
		this.growthMesh.position.set(globalX*64, globalY*45, -90);
		GameEngine.scene.add(this.growthMesh);
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
			tiles[0][y] = new tile(8, 3,(lTileX*lTileSize+i)-center,(lTileY*lTileSize+j)-center);
		}
	} 
	if(lTileX == centerLTileIndex*2){ //block west
		for(var y = 0; y<lTileSize; y++){
			tiles[lTileSize-1][y] = new tile(8, 3,(lTileX*lTileSize+i)-center,(lTileY*lTileSize+j)-center);
		}
	}
	if(lTileY == 0){ //block north
		for(var x = 0; x<lTileSize; x++){
			tiles[x][0] = new tile(8, 3,(lTileX*lTileSize+i)-center,(lTileY*lTileSize+j)-center);
		}
	}
	if(lTileY == centerLTileIndex*2){ //block south
		for(var x = 0; x<lTileSize; x++){
			tiles[x][lTileSize-1] = new tile(8, 3,(lTileX*lTileSize+i)-center,(lTileY*lTileSize+j)-center);
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


	for(var i = 0; i<lTileSize; i++){
		for(var j = 0; j<lTileSize; j++){
			if(tiles[i][j] == null){ //fill tiles that are still empty
				if((i==15||i==14)&&(j==14||j==15)){
					tiles[i][j] = new tile(7, 0,(lTileX*lTileSize+i)-center,(lTileY*lTileSize+j)-center);
				} else if ((i>10&&i<19)&&(j>10&&j<19)){
					tiles[i][j] = new tile(0, 0,(lTileX*lTileSize+i)-center,(lTileY*lTileSize+j)-center);
				} else
					tiles[i][j] = new tile(Math.randomInt(2),3,(lTileX*lTileSize+i)-center,(lTileY*lTileSize+j)-center);
			}
		}
	}
	return tiles;
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

tileManager.prototype.growTiles = function(){ //grow the jungle
	for(var i = 0; i<this.largeTileRows.length; i++){
		for(var j = 0; j<this.largeTileRows[i].length; j++){
			if(this.largeTileRows[i][j] != null){
				growTileGroup(this.largeTileRows[i][j])
			}
		}
	}
}

var growTileGroup = function(tileGroup){ //doesnt currently grow accross tile groups
	var referenceCopy = tileGroup.slice();//I hope this doesnt overly hurt performance. Without the copy sprouting based on a newly grown plant can occur
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
							if(referenceCopy[i2][j2].growthLevel>2){
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

tileManager.prototype.update = function(){ //grow the jungle
	if (this.currentGrowCooldown > 0){
		this.currentGrowCooldown -= bmacSdk.deltaSec;
	} else {
		this.currentGrowCooldown = this.growCooldown;
		this.growTiles();
	}
}



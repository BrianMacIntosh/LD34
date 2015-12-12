//A library to manage tiles

var terainKey = ["neutral", "sandy", "stone", "wood", "iron", "food", "water", "villageHall"]
var growthKey = ["clear", "light", "medium", "heavy"]
var startingTileGroupIndex = 3 //impies map total size
var lTileSize = 30
var center = (startingTileGroupIndex*lTileSize)+Math.floor(lTileSize/2)-1

tileManager = function(){
	this.LargeTileRows = []
	for(var i = 0; i<startingTileGroupIndex*2; i++){
		this.LargeTileRows[i] = []
	}
	this.LargeTileRows[startingTileGroupIndex][startingTileGroupIndex] = genStartingTileGroup()
}

var tile = function (terrainType, growthLevel){
	this.terrainType = ((terrainType != null) ? terrainType : 0);
	this.growthLevel = ((growthLevel != null) ? growthLevel : 3);
}

//a 30x30 group of tiles
var genTileGroup = function(groupIndexs){
	tiles = []
	for(var i = 0; i<lTileSize; i++){
		tiles[i] = []
		for(var j = 0; j<lTileSize; j++){
			switch (Math.randomInt((lTileSize*lTileSize)/3)) { //on average 3 of each resource tile should be added to each tileGroup
			  case 0:
			  	tiles[i][j] = new tile(5, 3);
			    break;
			  case 1:
			  	tiles[i][j] = new tile(3, 3);
			    break;
			  case 2:
			  	tiles[i][j] = new tile(2, 3);
			    break;
			  case 3:
			  	tiles[i][j] = new tile(4, 3);
			    break;
			  default:
				tiles[i][j] = new tile();
			    break;
			}
		}
	}
	return tiles;
}

var genStartingTileGroup = function(){
	tiles = []
	for(var i = 0; i<lTileSize; i++){
		tiles[i] = []
	}

	tiles[Math.randomInt(lTileSize)][Math.randomInt(lTileSize)] = new tile(5, 3); //food
	tiles[Math.randomInt(lTileSize)][Math.randomInt(lTileSize)] = new tile(5, 3); //food

	tiles[Math.randomInt(lTileSize)][Math.randomInt(lTileSize)] = new tile(3, 3); //wood
	tiles[Math.randomInt(lTileSize)][Math.randomInt(lTileSize)] = new tile(3, 3); //wood

	tiles[Math.randomInt(lTileSize)][Math.randomInt(lTileSize)] = new tile(2, 3);	//stone
	tiles[Math.randomInt(lTileSize)][Math.randomInt(lTileSize)] = new tile(2, 3);	//stone

	tiles[Math.randomInt(lTileSize)][Math.randomInt(lTileSize)] = new tile(4, 3); //iron
	tiles[Math.randomInt(lTileSize)][Math.randomInt(lTileSize)] = new tile(4, 3); //iron


	for(var i = 0; i<lTileSize; i++){
		for(var j = 0; j<lTileSize; j++){
			if(tiles[i][j] == null){ //fill tiles that are still empty
				if((i==15||i==14)&&(j==14||j==15)){
					tiles[i][j] = new tile(7, 0);
				} else if ((i>9&&i<19)&&(j>9||j<19)){
					tiles[i][j] = new tile(0, 0);
				} else
					tiles[i][j] = new tile();
			}
		}
	}
	return tiles;
}

//center = (startingTileGroupIndex*lTileSize)+14
tileManager.prototype.getTile = function(x, y){ // external 0,0 is LargeTileRows[startingIndex][startingIndex][14][14]
	var lTileX = Math.floor((center+x)/lTileSize)
	var lTileY = Math.floor((center+y)/lTileSize)
	var sTileX = (center+x)%lTileSize
	var sTileY = (center+y)%lTileSize
	return this.LargeTileRows[lTileX][lTileY][sTileX][sTileY]
}

//A library to manage tiles

var terainKey = ["neutral", "sandy", "stone", "wood", "iron", "food", "water", "villageHall","rockBlock"]
var growthKey = ["clear", "light", "medium", "heavy"]
var startingTileGroupIndex = 3 //impies map total size
var lTileSize = 30
var center = (startingTileGroupIndex*lTileSize)+Math.floor(lTileSize/2)-1

tileManager = function(){
	this.largeTileRows = []
	for(var i = 0; i<(startingTileGroupIndex*2)+1; i++){
		this.largeTileRows[i] = []
	}
	this.largeTileRows[startingTileGroupIndex][startingTileGroupIndex] = genStartingTileGroup()
}

var tile = function (terrainType, growthLevel){
	this.terrainType = ((terrainType != null) ? terrainType : 0);
	this.growthLevel = ((growthLevel != null) ? growthLevel : 3);
}

//a 30x30 group of tiles
var genTileGroup = function(lTileX,lTileY){
	tiles = []
	for(var i = 0; i<lTileSize; i++){
		tiles[i] = []
	}
	if(lTileX == 0){ //block west
		for(var y = 0; y<lTileSize; y++){
			tiles[0][y] = new tile(8, 3);
		}
	} 
	if(lTileX == startingTileGroupIndex*2){ //block west
		for(var y = 0; y<lTileSize; y++){
			tiles[lTileSize-1][y] = new tile(8, 3);
		}
	}
	if(lTileY == 0){ //block south
		for(var x = 0; x<lTileSize; x++){
			tiles[x][0] = new tile(8, 3);
		}
	}
	if(lTileY == startingTileGroupIndex*2){ //block north
		for(var x = 0; x<lTileSize; x++){
			tiles[x][lTileSize-1] = new tile(8, 3);
		}
	}

	for(var i = 0; i<lTileSize; i++){
		for(var j = 0; j<lTileSize; j++){
			if(tiles[i][j] == null){ //fill tiles that are still empty
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
				} else if ((i>9&&i<19)&&(j>9&&j<19)){
					tiles[i][j] = new tile(0, 0);
				} else
					tiles[i][j] = new tile();
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
	if(lTileX<0||lTileY<0||lTileX>=(startingTileGroupIndex*2)+1||lTileY>=(startingTileGroupIndex*2)+1){
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

var growTileGroup = function(tileGroup){
	var referenceCopy = tileGroup.slice();//I hope this doesnt overly hurt performance. Without the copy sprouting based on a newly grown plant can occur
	for(var i = 0; i<tileGroup.length; i++){
		for(var j = 0; j<tileGroup[i].length; j++){
			if(tileGroup[i][j].growthLevel>0 && tileGroup[i][j].growthLevel<3){ //grow
				tileGroup[i][j].growthLevel++;
			}
			if(tileGroup[i][j].growthLevel==0){ //sproutable? (empty spaces are the less common case)
				for(var i2 = i-1; i2<=i+1; i2++){
					for(var j2 = j-1; j2<=j+1; j2++){
						if(i2<lTileSize && j2<lTileSize && i2>=0 && j2>=0){ //is in bounds
							if(referenceCopy[i2][j2].growthLevel>2){
								tileGroup[i][j].growthLevel = 1;
							}
						}
					}
				}
			}
		}
	}
}

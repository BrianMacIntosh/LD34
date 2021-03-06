
var Villager = function()
{
	Actor.call(this);
	
	this.acceleration = 99999;
	this.slashSpeedReduction = 0.1;
	
	this.transform.position.set(-50, 0, 0);
	this.status = {
		hunger: 95,
		machetteStrength: 100,
		fatigue: 0
	}
	this.hungerCooldown = 1
	this.hungerCurrentCooldown = 1
	this.hungerRemovedFromEating = 75
	this.hungerModeCooldown = 1
	this.hungerModeCurrentCooldown = 0
	
	// create mesh
	this.geometry = bmacSdk.GEO.makeSpriteGeo(48,48);
	var texture = Villager.textures[Math.floor(Math.random() * Villager.textures.length)];
	this.mesh = bmacSdk.GEO.makeSpriteMesh(texture, this.geometry);
	this.transform.add(this.mesh);
	this.mesh.position.set(0, 0, -50);
	
	// create action icon
	this.iconGeometry = bmacSdk.GEO.makeSpriteGeo(24, 21);
	this.iconMesh = bmacSdk.GEO.makeSpriteMesh(Villager.actionTexture, this.iconGeometry);
	this.transform.add(this.iconMesh);
	this.iconMesh.position.set(0, -40, -15);
	
	this.path = [];
	
	bmacSdk.GEO.setTilesheetGeometry(this.geometry, 0, 1, 9, 4);
}

Villager.textures =
[
	bmacSdk.GEO.loadPixelTexture("media/villager.png"),
]

Villager.actionTexture = bmacSdk.GEO.loadPixelTexture("media/actionicons.png"),

Villager.prototype = Object.create(Actor.prototype);

Villager.prototype.initNewTask = function(){
	bmacSdk.GEO.setTilesheetGeometry(this.iconGeometry, this.task.getActionIconIndex(), 0, 5, 1);
	this.pathToLocation(this.task.x, this.task.y);
}

Villager.prototype.update = function()
{
	var tile = sampleGame.tileManager.getTileAtWorld(this.transform.position.x, this.transform.position.y);
	var oldTile = tile;

	if(this.hungerCurrentCooldown > 0){
		this.hungerCurrentCooldown -= bmacSdk.deltaSec;
	} else {
		this.hungerCurrentCooldown = this.hungerCooldown;
		this.status.hunger++;
	}

	if(this.status.hunger>150){//if starving drop any task that isnt food gathering
		if(this.hungerModeCurrentCooldown > 0){
			this.hungerModeCurrentCooldown -= bmacSdk.deltaSec;
		} else if(!(this.task instanceof HungerTask)){
			this.hungerModeCurrentCooldown = this.hungerModeCooldown;


			if(this.heldResource != "food" && this.task.resourceType != "food"){
				//console.log("starving")
				sampleGame.villagerManager.freeTask(this.task);
				this.task = undefined

				if(sampleGame.resourceManager.resourceCounts.food<1){//no food, search for food task
					this.task = sampleGame.villagerManager.findAndAssignFoodTask()
				}
				if(!this.task){
					this.task = new HungerTask();
				}
				this.initNewTask()
			}
		}
	}

	if(this.task 
		&& this.path 
		&& this.path.length == 0
		&& (sampleGame.tileManager.worldToTileX(this.transform.position.x) != this.task.x
		|| sampleGame.tileManager.worldToTileY(this.transform.position.y) != this.task.y)){
			sampleGame.tileManager.updatePathfindingGraph();
			this.pathToLocation(this.task.x, this.task.y);
			if(this.path.length == 0){
				console.log("!!!empty repath")
			}
	}
	

	//TEMP:
	if (!this.path || this.path.length <= 0){ //!!path lenth = 0 is not exactly the same as task done
		if (this.task)
		{
			if (this.task instanceof ResourceTask)
			{
				// pick up a resource and take it back
				sampleGame.villagerManager.freeTask(this.task);
				this.heldResource = terainKey[tile.terrainType].resource;
				this.task = new ReturnResourceTask();
				this.initNewTask();
			} else if (this.task instanceof ReturnResourceTask 
				&& sampleGame.tileManager.worldToTileX(this.transform.position.x) == 0
				&& sampleGame.tileManager.worldToTileY(this.transform.position.y) == 0)
			{
				sampleGame.villagerManager.freeTask(this.task);
				sampleGame.resourceManager.addResource(this.heldResource)
				this.heldResource = undefined;
				//this.task.complete = true;
			}
			else if (this.task instanceof BuildRoadTask)
			{
				sampleGame.resourceManager.resourceCounts.stone -= roadCost;
				sampleGame.resourceManager.allocatedStone -= roadCost;
				tile.changeTerrain(16);
			}
		}
		if (!this.heldResource){
			this.task = sampleGame.villagerManager.takeTask();
			if(this.task!=null){
				this.initNewTask();
			}
		}
	}

	if(this.status.hunger>=100){ //they hunger. do hungery things
		if(tile.getTerrainType().slice(0,11) == "villageHall"){ //eat when you get home
			if(sampleGame.resourceManager.removeResource("food",1)){
				this.status.hunger -= this.hungerRemovedFromEating;
			}
		}
	} else {
		this.hungerModeCurrentCooldown = this.hungerModeCooldown;
	}

	var destination = undefined;
	if (this.path && this.path.length > 0)
	{
		var centerOffset = lTileSize * (centerLTileIndex + 0.5) - 1;
		destination = {
			x:(this.path[0].x-centerOffset) * tilePixelWidth,
			y:(this.path[0].y-centerOffset) * tilePixelHeight
		};
		
		// navigate toward destination
		var oldSignToDestinationX = Math.sign(destination.x - this.transform.position.x);
		var oldSignToDestinationY = Math.sign(destination.y - this.transform.position.y);
		
		this.desiredMovement.x = oldSignToDestinationX;
		this.desiredMovement.y = oldSignToDestinationY;
	}
	
	// if we are standing on or looking at a tile with growth, swing the machete
	if (!tile || tile.growthLevel == 0)
	{
		tile = sampleGame.tileManager.getTileAtWorld(
			this.transform.position.x + this.getFacingX() * tilePixelWidth * 0.25,
			this.transform.position.y + this.getFacingY() * tilePixelHeight * 0.25);
	}
	if (tile && tile.growthLevel > 0)
	{
		this.swingMachete();
	}
	
	Actor.prototype.update.call(this);
	
	var newTile = sampleGame.tileManager.getTileAtWorld(this.transform.position.x, this.transform.position.y);
	
	if (newTile !== oldTile && newTile.traverseCount < traverseCountForRoad)
	{
		newTile.traverseCount++;
		
		// add a road task
		if (newTile.traverseCount >= traverseCountForRoad && terrainValidForRoad(newTile.terrainType))
		{
			sampleGame.villagerManager.tasks.push(new BuildRoadTask(
				sampleGame.tileManager.worldToTileX(this.transform.position.x),
				sampleGame.tileManager.worldToTileY(this.transform.position.y)));
		}
	}
	
	if (destination)
	{
		// detect reaching destination
		var signToDestinationX = Math.sign(destination.x - this.transform.position.x);
		var signToDestinationY = Math.sign(destination.y - this.transform.position.y);
		var passedX = signToDestinationX !== oldSignToDestinationX || oldSignToDestinationX == 0;
		var passedY = signToDestinationY !== oldSignToDestinationY || oldSignToDestinationY == 0;
		if (passedX)
		{
			this.transform.position.x = destination.x;
		}
		if (passedY)
		{
			this.transform.position.y = destination.y;
		}
		if (passedX && passedY)
		{
			if (this.path && this.path.length > 0 && this.task != null)
			{
				//repath
				this.pathToLocation(this.task.x, this.task.y);
				/*this.path.splice(0, 1);
				if (this.path.length <= 0)
				{
					this.path = undefined;
				}*/
			}
		}
	}
}

Villager.prototype.pathToLocation = function(x, y)
{
	var newPath = sampleGame.villagerManager.findPath(
		sampleGame.tileManager.worldToTileX(this.transform.position.x),
		sampleGame.tileManager.worldToTileY(this.transform.position.y),
		x, y);
	//if(newPath.length!=0)
		this.path = newPath;
}

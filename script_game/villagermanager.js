
var VillagerManager = function()
{
	this.villagers = [];
	this.tasks = [];
	
	//TEMP: create some test villagers
	for (var c = 0; c < 10; c++)
	{
		this.villagers.push(new Villager());
	}
	
	// create tasks for keeping village clear
	for (var x = -VillagerManager.villageClearRadiusTiles; x <= VillagerManager.villageClearRadiusTiles; x++){
	for (var y = -VillagerManager.villageClearRadiusTiles; y <= VillagerManager.villageClearRadiusTiles; y++)
	{
		this.tasks.push(new ClearTileTask(x, y));
	}}
}

VillagerManager.flagMaterial = new THREE.MeshBasicMaterial({ map:bmacSdk.GEO.loadPixelTexture("media/flag.png"), transparent:true });
VillagerManager.foodFlagMaterial = new THREE.MeshBasicMaterial({ map:bmacSdk.GEO.loadPixelTexture("media/foodflag.png"), transparent:true });
VillagerManager.woodFlagMaterial = new THREE.MeshBasicMaterial({ map:bmacSdk.GEO.loadPixelTexture("media/woodflag.png"), transparent:true });
VillagerManager.ironFlagMaterial = new THREE.MeshBasicMaterial({ map:bmacSdk.GEO.loadPixelTexture("media/ironflag.png"), transparent:true });
VillagerManager.stoneFlagMaterial = new THREE.MeshBasicMaterial({ map:bmacSdk.GEO.loadPixelTexture("media/stoneflag.png"), transparent:true });

VillagerManager.flagGeometry = bmacSdk.GEO.makeSpriteGeo(64,82);

// radius around village in which villagers should keep foliage clear
VillagerManager.villageClearRadiusTiles = 5;
VillagerManager.maxVillageClearPriority = 50;

VillagerManager.prototype.update = function()
{
	for (var c = 0; c < this.villagers.length; c++)
	{
		this.villagers[c].update();
	}
	
	this.tasks.sort(VillagerManager.compareTasks);
}

// returns the first task that should have more villagers assigned
VillagerManager.prototype.takeTask = function()
{
	var task = undefined;
	for (var c = 0; c < this.tasks.length; c++)
	{
		if (this.tasks[c].villagerAllowance > 0)
		{
			task = this.tasks[c];
			break;
		}
	}
	if(task != null){
		task.villagerAllowance--;
	}
	return task;
}

VillagerManager.prototype.freeTask = function(task)
{
	task.villagerAllowance++;
}

VillagerManager.prototype.findFoodTask = function(){
	for (var c = 0; c < this.tasks.length; c++){
		if(this.tasks[c] instanceof ResourceTask && this.tasks[c].resourceType == 'food'){
			return this.tasks[c];
		}
	}
}


VillagerManager.prototype.findPath = function(fromX, fromY, toX, toY)
{
	//TEMP:
	//return [ { x: toX, y: toY} ];
	
	// the graph doesn't contain negative tiles (it's offset)
	// so offset the input data
	var centerOffset = lTileSize * (centerLTileIndex + 0.5) - 1;
	fromX += centerOffset;
	fromY += centerOffset;
	toX += centerOffset;
	toY += centerOffset;
	
	//console.log("(" + fromX + "," + fromY + ")->(" + toX + "," + toY + ")");
	
	var graph = sampleGame.tileManager.pathfindingGraph;
	var start = graph.grid[fromX][fromY];
	var end = graph.grid[toX][toY];
	return astar.search(graph, start, end);
}

VillagerManager.prototype.flagResourceAt = function(x, y)
{
	if (!this.hasResourceFlagAt(x, y))
	{
		var task = new ResourceTask(x, y);
		this.tasks.push(task);
	}
}

VillagerManager.prototype.unflagResourceAt = function(x, y)
{
	for (var c = this.tasks.length - 1; c >= 0; c--)
	{
		if (this.tasks[c] instanceof ResourceTask
		 && this.tasks[c].x == x && this.tasks[c].y == y)
		{
			this.tasks[c].destroy();
			this.tasks.splice(c, 1);
		}
	}
}

VillagerManager.prototype.hasResourceFlagAt = function(x, y)
{
	for (var c = 0; c < this.tasks.length; c++)
	{
		if (this.tasks[c] instanceof ResourceTask
		 && this.tasks[c].x == x && this.tasks[c].y == y)
		{
			return true;
		}
	}
}

VillagerManager.compareTasks = function(a, b)
{
	return b.getPriority() - a.getPriority();
}


var ClearTileTask = function(x, y)
{
	this.x = x;
	this.y = y;
	this.villagerAllowance = 1;
	
	// priority is by proximity to village center (0.5,0.5)
	var deltaX = this.x;
	var deltaY = this.y;
	this.priority = Math.sqrt(deltaX*deltaX+deltaY*deltaY) / Math.sqrt(2 * VillagerManager.villageClearRadiusTiles * VillagerManager.villageClearRadiusTiles);
	if (this.priority < 0 || this.priority > 1) console.error("Goofed up math.");
	this.priority = VillagerManager.maxVillageClearPriority * (1 - this.priority);
}

ClearTileTask.prototype.getActionIconIndex = function()
{
	return 0;
}

ClearTileTask.prototype.getPriority = function()
{
	var tile = sampleGame.tileManager.getTile(this.x, this.y);
	if (tile.growthLevel > 0)
	{
		return this.priority;
	}
	else
	{
		return 0;
	}
}


var ResourceTask = function(x, y)
{
	this.x = x;
	this.y = y;
	this.villagerAllowance = 2;
	this.buildRoads = true;
	this.resourceType = sampleGame.tileManager.getTileTerrain(x, y);

	switch (this.resourceType) {
	  case "food":
	  	this.flagMesh = new THREE.Mesh(VillagerManager.flagGeometry, VillagerManager.foodFlagMaterial);
	    break;
	  case "wood":
	  	this.flagMesh = new THREE.Mesh(VillagerManager.flagGeometry, VillagerManager.woodFlagMaterial);
	    break;
	  case "stone":
	  	this.flagMesh = new THREE.Mesh(VillagerManager.flagGeometry, VillagerManager.stoneFlagMaterial);
	    break;
	  case "iron":
	  	this.flagMesh = new THREE.Mesh(VillagerManager.flagGeometry, VillagerManager.ironFlagMaterial);
	    break;
	  default:
	  	this.flagMesh = new THREE.Mesh(VillagerManager.flagGeometry, VillagerManager.flagMaterial);
	    break;
	}
	GameEngine.scene.add(this.flagMesh);
	this.flagMesh.position.set(sampleGame.tileManager.tileToWorldX(this.x),
		sampleGame.tileManager.tileToWorldY(this.y) - 41, -20);
	
}

ResourceTask.prototype.destroy = function()
{
	GameEngine.scene.remove(this.flagMesh);
}

ResourceTask.prototype.getActionIconIndex = function()
{
	return 1;
}

ResourceTask.prototype.getPriority = function()
{
	return 40;
}


var ReturnResourceTask = function()
{
	this.x = 0;
	this.y = 0;
	this.villagerAllowance = 1;
	this.complete = false
}

ReturnResourceTask.prototype.getActionIconIndex = function()
{
	return 2;
}

ReturnResourceTask.prototype.getPriority = function()
{
	return 1000;
}

var HungerTask = function()
{
	this.x = 0;
	this.y = 0;
	this.villagerAllowance = 1;
}

HungerTask.prototype.getActionIconIndex = function()
{
	return 3;
}

HungerTask.prototype.getPriority = function()
{
	return 1000;
}


var VillagerManager = function()
{
	this.villagers = [];
	this.tasks = [];
	
	//TEMP: create some test villagers
	for (var c = 0; c < 5; c++)
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

VillagerManager.flagMaterial = new THREE.MeshBasicMaterial({ map:THREE.ImageUtils.loadTexture("media/flag.png"), transparent:true });
VillagerManager.flagGeometry = bmacSdk.GEO.makeSpriteGeo(64,82);

// radius around village in which villagers should keep foliage clear
VillagerManager.villageClearRadiusTiles = 4;
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
		if (this.tasks[c].villagersAssigned === 0)
		{
			task = this.tasks[c];
			break;
		}
	}
	task.villagersAssigned++;
	return task;
}

VillagerManager.prototype.freeTask = function(task)
{
	task.villagersAssigned--;
}

VillagerManager.prototype.findPathTo = function(x, y)
{
	//TEMP:
	return [ { x: x, y: y} ];
	
	//astar.search(GRAPH, STARTNODE, ENDNODE);
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
	this.villagersAssigned = 0;
	
	// priority is by proximity to village (0,0)
	this.priority = Math.sqrt(this.x*this.x + this.y*this.y) / Math.sqrt(2 * VillagerManager.villageClearRadiusTiles * VillagerManager.villageClearRadiusTiles);
	if (this.priority < 0 || this.priority > 1) console.error("Goofed up math.");
	this.priority = VillagerManager.maxVillageClearPriority * (1 - this.priority);
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
	this.villagersAssigned = 0;
	this.buildRoads = true;
	
	this.flagMesh = new THREE.Mesh(VillagerManager.flagGeometry, VillagerManager.flagMaterial);
	GameEngine.scene.add(this.flagMesh);
	this.flagMesh.position.set(sampleGame.tileManager.tileToWorldX(this.x),
		sampleGame.tileManager.tileToWorldY(this.y) - 41, -80);
}

ResourceTask.prototype.destroy = function()
{
	GameEngine.scene.remove(this.flagMesh);
}

ResourceTask.prototype.getPriority = function()
{
	return 100;
}


var ReturnResourceTask = function()
{
	this.x = 0;
	this.y = 0;
}

ReturnResourceTask.prototype.getPriority = function()
{
	return 1000;
}

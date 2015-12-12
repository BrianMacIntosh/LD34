
var VillagerManager = function()
{
	this.villagers = [];
	
	//TEMP: create some test villagers
	for (var c = 0; c < 3; c++)
	{
		this.villagers.push(new Villager());
	}
}

VillagerManager.prototype.update = function()
{
	for (var c = 0; c < this.villagers.length; c++)
	{
		this.villagers[c].update();
	}
}

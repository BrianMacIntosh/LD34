
var resourceKey =
{
	stone:{},
	wood:{},
	iron:{},
	food:{},
	water:{},
}

var ResourceManager = function()
{
	this.resourceCounts = {
		stone:0,
		wood:0,
		iron:0,
		food:10,
		water:0
	}
	this.woodForNewVillager = 20;
	this.allocatedStone = 0;
}

ResourceManager.prototype.addResource = function(resource){
	if(this.resourceCounts[resource] != null){
		this.resourceCounts[resource]++;
		
		//check to consume wood
		if (resource=='wood' && this.resourceCounts['wood']>=this.woodForNewVillager){
			this.resourceCounts['wood'] -= this.woodForNewVillager;
			sampleGame.villagerManager.addNewVillager(true);
		}
	}
}
ResourceManager.prototype.removeResource = function(resource, count){
	if(!Number.isInteger(count)){
		count = 1
	}
	if(this.resourceCounts[resource] != null && this.resourceCounts[resource]>=count){
		this.resourceCounts[resource]-=count;
		return 1
	}
	return 0;
}

ResourceManager.prototype.update = function(){
	updateCount("foodCount", JSON.stringify(this.resourceCounts.food))
	updateCount("woodCount", JSON.stringify(this.resourceCounts.wood))
	updateCount("stoneCount", JSON.stringify(this.resourceCounts.stone))
	updateCount("ironCount", JSON.stringify(this.resourceCounts.iron))
}

var updateCount = function(elementId, value){
	var element = document.getElementById(elementId);
	element.innerHTML = value;
	if(value<3){
		element.style.color = 'indianred';
	} else {
		element.style.color = 'white';
	}
}
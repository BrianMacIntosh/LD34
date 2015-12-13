
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
		food:0,
		water:0
	}
}

ResourceManager.prototype.addResource = function(resource){
	if(this.resourceCounts[resource] != null){
		this.resourceCounts[resource]++;
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
	updateCount("stoneCount", JSON.stringify(this.resourceCounts.iron))
	updateCount("ironCount", JSON.stringify(this.resourceCounts.stone))
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

var Villager = function()
{
	Actor.call(this);
	
}

Villager.prototype = Object.create(Actor.prototype);

Villager.prototype.update = function()
{
	
	
	Actor.prototype.update.call(this);
}
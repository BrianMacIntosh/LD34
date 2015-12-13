
var CameraController = function(camera)
{
	this.camera = camera;
}

CameraController.prototype.update = function()
{
	var halfWidth = GameEngine.screenWidth / 2;
	var halfHeight = GameEngine.screenHeight / 2;
	
	this.camera.position.x = sampleGame.player.transform.position.x - halfWidth;
	this.camera.position.y = sampleGame.player.transform.position.y - halfHeight;
	
	this.camera.position.x = Math.clamp(this.camera.position.x,
		sampleGame.getWorldBoundsMinX(), sampleGame.getWorldBoundsMaxX() - GameEngine.screenWidth);
	this.camera.position.y = Math.clamp(this.camera.position.y,
		sampleGame.getWorldBoundsMinY(), sampleGame.getWorldBoundsMaxY() - GameEngine.screenHeight);
}

CameraController.prototype.getLeft = function()
{
	return this.camera.position.x;
}
CameraController.prototype.getTop = function()
{
	return this.camera.position.y;
}
CameraController.prototype.getRight = function()
{
	return this.camera.position.x + GameEngine.screenWidth;
}
CameraController.prototype.getBottom = function()
{
	return this.camera.position.y + GameEngine.screenHeight;
}

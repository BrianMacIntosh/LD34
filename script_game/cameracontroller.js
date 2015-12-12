
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

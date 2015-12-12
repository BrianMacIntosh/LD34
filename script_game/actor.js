
var Actor = function()
{
	this.maxMovementSpeed = 30;
	this.slashSpeedReduction = 0.65; //speed is capped at max times this when slashing
	this.acceleration = 256;
	this.macheteCooldown = 0.4;
	this.slashAlternatingState = false;
	this.slashTimer = 0;
	this.growthSpeedMultiplier = [ 1, 0.66, 0.33, 0.05 ];
	
	this.currentMacheteCooldown = 0;
	this.queueSwingMachete = false;
	
	this.transform = new THREE.Object3D();
	GameEngine.scene.add(this.transform);
	
	this.velocity = new Vector2();
	this.direction = 0;
	this.desiredMovement = new Vector2();
	
	this.timeToNextFrame = 0;
	this.currentFrame = 0;
	
	// create slashing vfx
	this.slashParent = new THREE.Object3D();
	this.transform.add(this.slashParent);
	this.slashParent.position.set(0,0,0);
	
	this.slashMesh0 = new THREE.Mesh(Actor.slashVfxGeo, Actor.slashVfxMaterials[0]);
	this.slashParent.add(this.slashMesh0);
	this.slashMesh0.position.set(20,0,-20);
	this.slashMesh0.visible = false;
	this.slashMesh1 = new THREE.Mesh(Actor.slashVfxGeo, Actor.slashVfxMaterials[1]);
	this.slashParent.add(this.slashMesh1);
	this.slashMesh1.position.set(20,0,-20);
	this.slashMesh1.visible = false;
}

Actor.slashVfxGeo = bmacSdk.GEO.makeSpriteGeo(33,23);

Actor.slashVfxMaterials =
[
	new THREE.MeshBasicMaterial({ map:THREE.ImageUtils.loadTexture("media/vfx_slash1.png"), transparent:true }),
	new THREE.MeshBasicMaterial({ map:THREE.ImageUtils.loadTexture("media/vfx_slash2.png"), transparent:true }),
]

Actor.frameTime = 0.03;
Actor.slashVfxLifetime = 0.25;

Actor.macheteSounds =
[
	"media/118792__lmbubec__1-knife-slash-a.wav"
];

// multiplier on Y movement to account for the iso camera angle
Actor.yMotionMultiplier = 1 / Math.sqrt(2);

Actor.prototype.update = function()
{
	// cool down machete
	if (this.currentMacheteCooldown > 0)
	{
		this.currentMacheteCooldown -= bmacSdk.deltaSec;
	}
	
	// swing machete if you attempted to do so during the cooldown
	if (this.queueSwingMachete && this.currentMacheteCooldown <= 0)
	{
		this.swingMachete();
	}
	
	if (this.desiredMovement.x !== 0)
	{
		// accelerate
		this.velocity.x += this.desiredMovement.x * this.acceleration * bmacSdk.deltaSec;
		this.velocity.x = Math.clamp(this.velocity.x, -this.maxMovementSpeed, this.maxMovementSpeed);
	}
	else if (this.velocity.x !== 0)
	{
		// decelerate to 0
		var oldSig = Math.sign(this.velocity.x);
		this.velocity.x -= oldSig * this.acceleration * bmacSdk.deltaSec;
		if (Math.sign(this.velocity.x) !== oldSig)
		{
			this.velocity.x = 0;
		}
	}
	
	if (this.desiredMovement.y !== 0)
	{
		// accelerate
		this.velocity.y += this.desiredMovement.y * this.acceleration * bmacSdk.deltaSec;
		this.velocity.y = Math.clamp(this.velocity.y, -this.maxMovementSpeed, this.maxMovementSpeed);
	}
	else if (this.velocity.y !== 0)
	{
		// decelerate to 0
		var oldSig = Math.sign(this.velocity.y);
		this.velocity.y -= oldSig * this.acceleration * bmacSdk.deltaSec;
		if (Math.sign(this.velocity.y) !== oldSig)
		{
			this.velocity.y = 0;
		}
	}
	
	var velX = this.velocity.x;
	var velY = this.velocity.y;
	
	// cap velocity while slashing
	if (this.slashTimer <= this.macheteCooldown)
	{
		velX *= this.slashSpeedReduction;
		velY *= this.slashSpeedReduction;
	}
	
	// cap velocity moving in growth
	var currentTile = sampleGame.tileManager.getTileAtWorld(this.transform.position.x, this.transform.position.y);
	velX *= this.growthSpeedMultiplier[currentTile.growthLevel];
	velY *= this.growthSpeedMultiplier[currentTile.growthLevel];
	
	// move based on the desired movement
	this.transform.position.x += velX * bmacSdk.deltaSec;
	this.transform.position.y += velY * bmacSdk.deltaSec * Actor.yMotionMultiplier;
	
	// restrict in bounds
	//TODO: unify with other collision code?
	this.transform.position.x = Math.clamp(this.transform.position.x, sampleGame.getWorldBoundsMinX(), sampleGame.getWorldBoundsMaxX());
	this.transform.position.y = Math.clamp(this.transform.position.y, sampleGame.getWorldBoundsMinY(), sampleGame.getWorldBoundsMaxY());
	
	// reset desired movement
	this.desiredMovement.x = this.desiredMovement.y = 0;
	
	// determine walk direction
	if (Math.abs(this.velocity.x) > 0.5 || Math.abs(this.velocity.y) > 0.5)
	{
		if (Math.abs(this.velocity.x) < Math.abs(this.velocity.y))
		{
			if (this.velocity.y < 0)
				this.direction = 0;
			else
				this.direction = 2;
		}
		else
		{
			if (this.velocity.x < 0)
				this.direction = 3;
			else
				this.direction = 1;
		}
	}
	
	// rotate the vfx parent
	this.slashParent.rotation.z = Math.PI * (this.direction-1) / 2;
	
	// advance walk animation
	if (this.velocity.x !== 0 || this.velocity.y !== 0)
	{
		this.timeToNextFrame -= bmacSdk.deltaSec;
		if (this.timeToNextFrame <= 0)
		{
			this.timeToNextFrame = Actor.frameTime;
			this.currentFrame++;
			while (this.currentFrame >= 24) this.currentFrame -= 24;
			
			if (this.geometry)
			{
				bmacSdk.GEO.setTilesheetGeometry(this.geometry, this.currentFrame, this.direction, 24, 4);
			}
		}
	}
	
	// hide slash vfx
	var lastSlashTimer = this.slashTimer;
	this.slashTimer += bmacSdk.deltaSec;
	if (lastSlashTimer < Actor.slashVfxLifetime && this.slashTimer >= Actor.slashVfxLifetime)
	{
		this.slashMesh0.visible = this.slashMesh1.visible = false;
	}
}

Actor.prototype.getFacingX = function()
{
	if (this.direction == 1)
		return 1;
	else if (this.direction == 3)
		return -1;
	else
		return 0;
}

Actor.prototype.getFacingY = function()
{
	if (this.direction == 0)
		return -1;
	else if (this.direction == 2)
		return 1;
	else
		return 0;
}

Actor.prototype.swingMachete = function()
{
	if (this.currentMacheteCooldown > 0)
	{
		//this.queueSwingMachete = true;
	}
	else
	{
		// execute machete swing
		this.queueSwingMachete = false;
		
		// first try to hit the tile I am on
		var targetTile = undefined;
		var myTile = sampleGame.tileManager.getTileAtWorld(this.transform.position.x, this.transform.position.y);
		if (myTile.growthLevel > 0)
		{
			targetTile = myTile;
		}
		
		// if there's nothing there, try to hit the tile I am facing
		if (!targetTile)
		{
			myTile = sampleGame.tileManager.getTileAtWorld(
				this.transform.position.x + this.getFacingX() * tilePixelWidth,
				this.transform.position.y + this.getFacingY() * tilePixelHeight);
			if (myTile.growthLevel > 0)
			{
				targetTile = myTile;
			}
		}
		
		//TODO: also try to hit things slightly to the left and right
		
		// hit the target
		if (targetTile)
		{
			targetTile.growthLevel = Math.max(0, targetTile.growthLevel - 2);
			targetTile.drawGrowth();
		}
		
		this.slashMesh0.visible = !this.slashAlternatingState;
		this.slashMesh1.visible = this.slashAlternatingState;
		this.slashTimer = 0;
		
		//AUDIOMANAGER.playSound(Actor.macheteSounds);
		
		this.slashAlternatingState = !this.slashAlternatingState;
		this.currentMacheteCooldown = this.macheteCooldown;
	}
}

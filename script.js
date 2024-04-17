
if (!localStorage.getItem('highScore')) {
    localStorage.setItem('highScore', '0');
}
var pause = true;
var gameEnded = false;
var bubbleIndex = 0;
var score = 0;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var popSound = new Audio('pop.mp3');
camera.position.z = 5;


updateScore = () => {
    document.getElementById('score').textContent = `Score: ${score}`;
    document.getElementById('high-score').textContent = `High-Score: ${localStorage.getItem('highScore')}`;
}


updateScore();

var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0);
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

var pauseButton = document.getElementById('pause');
pauseButton.addEventListener('click', () => {
    document.getElementById('msg').classList.replace('pisca', 'hidden');
    pause = !pause
    if (!pause && score === 0) {
        document.getElementById('msg').classList.replace('hidden', 'pisca');
    }
    if (pauseButton.textContent === 'Start') {
        pauseButton.textContent = 'Play/Pause'
    }
});

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

function getRandomNumberWithRange(min, max) {
    return Math.floor(Math.random() * (+max - +min)) + +min;
}

function resetGame() {
    pauseButton.textContent = 'Start'
    bubbles.forEach(b => scene.remove(b));
    bubbles = [];
    pause = true;
    if (score > +localStorage.getItem('highScore')) {
        localStorage.setItem('highScore', score.toString());
    }
    score = 0;
    updateScore();
    document.getElementById('msg').classList.replace('pisca', 'hidden');
    speedMultiplier = 1.5;
}

var bubbles = [];
var geometry = new THREE.SphereGeometry(1, 25, 25);
var speedMultiplier = 1.5;

createSingleBubble = () => {
    if (!document.hasFocus() || pause) {
        return;
    }
    const newBubble = new THREE.Mesh(geometry);
    newBubble.position.set(getRandomNumberWithRange(-6, 6), getRandomNumberWithRange(-8, -12), getRandomNumberWithRange(-4, -1));
    newBubble.material = new THREE.MeshPhongMaterial({ color: '#ffffff', transparent: true, opacity: getRandomNumberWithRange(3, 7) / 10 })
    newBubble.idBubble = bubbleIndex;
    newBubble.rotationDirection = Math.random() > 0.5 ? 1 : -1;
    bubbleIndex++;
    bubbles.push(newBubble);
    scene.add(newBubble);
}

setInterval(() => requestAnimationFrame(createSingleBubble), 1000 / speedMultiplier);

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();


this.tl = new TimelineMax().delay(.3);
var light = new THREE.SpotLight(0xFFFFFF, 1, 1000000);
var light2 = new THREE.AmbientLight(0xFFFFFF, 0.5);
light.position.set(0, 0, 100)
scene.add(light);
scene.add(light2);

var render = () => {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    if (pause) {
        return;
    }

    bubbles.forEach(b => {
        if (b.position.y > (5 - b.position.z)) {
            resetGame();
        }
        b.rotation.y += (Math.random() / 10) * b.rotationDirection;
        b.position.y += 0.06 * Math.exp(speedMultiplier / 600);
        b.translateX(speedMultiplier / 5000);
        speedMultiplier += 4 / (speedMultiplier * 0.5)
    })
}

render();

onMouseMove = event => {
    event.preventDefault();
    if (pause) {
        return;
    }
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length) {
        this.tl.to(intersects[0].object.scale, 0.05, { x: 2, y: 2, z: 2, ease: Expo.easeOut })
            .eventCallback('onComplete', () => {
                requestAnimationFrame(() => scene.remove(intersects[0].object));
                popSound.play();
            });
    }
    intersects.forEach((intersect, index) => {
        score += 100;
        updateScore();
        bubbles = bubbles.filter(b => b.idBubble !== intersect.object.idBubble);
        if (index !== 0) {
            scene.remove(intersect.object)
        }
    })
}

window.addEventListener('mousedown', onMouseMove);
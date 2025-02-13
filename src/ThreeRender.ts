import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/Addons.js";

interface BoneRot {
    bone: THREE.Bone
    rotation: THREE.Euler
    add: THREE.Euler
    speed: number
    damp: number
}

export class ThreeRender {
    container: HTMLDivElement;

    scene = new THREE.Scene();
    camera: THREE.PerspectiveCamera;

    renderer = new THREE.WebGLRenderer({antialias: true})
    screen: THREE.Vector2

    mouse: THREE.Vector2 = new THREE.Vector2(0,0)

    skogNode?: THREE.Object3D;

    bones: BoneRot[] = []

    constructor(element: HTMLDivElement){
        this.container = element;
        this.screen = new THREE.Vector2(this.container.clientWidth, this.container.clientHeight);
        this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.renderer.setSize(this.screen.x, this.screen.y);
        this.container.appendChild(this.renderer.domElement);

        this.camera.position.z = 1.5

        const loader = new GLTFLoader();
        loader.load("/skog.glb", (gltf) => {
            this.scene.add(gltf.scene);
            gltf.scene.traverse((child) => {
                if (child.name === "skog"){
                    const mesh = child as THREE.Mesh
                    const map = (mesh.material as THREE.MeshStandardMaterial).map
                    mesh.material = new THREE.MeshBasicMaterial({map: map})
                    // const textureLoader = new THREE.TextureLoader();
                    // textureLoader.load("/Skog_1.jpg", (tex) => {
                    //     mesh.material = new THREE.MeshBasicMaterial({map: tex})
                    // })
                }
                if (child.name === "skogSkel"){
                    this.skogNode = child
                }
                if (child.name !== "Body1" && child.type === "Bone"){
                    let speed = 4
                    let damp = 90
                    const bone = child as THREE.Bone
                    const lowerName = bone.name.toLowerCase()
                    if (lowerName.includes("leg") || lowerName.includes("arm") || lowerName.includes("head") || lowerName.includes("neck") || lowerName === "body3"){
                        speed = 25
                    }
                    this.bones.push({
                        bone: bone,
                        rotation: new THREE.Euler().copy(bone.rotation),
                        add: new THREE.Euler(0,0,0, "XYZ"),
                        damp: damp,
                        speed: speed
                    })
                }
            })
        })
        console.log(this.bones)
        window.addEventListener('pointermove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        })
        this.animate(this.previousTime)
        this.resizeObserver.observe(this.container)
    }

    resizeObserver = new ResizeObserver(() => {
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
        this.screen = new THREE.Vector2(this.container.clientWidth, this.container.clientHeight)
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight
        this.camera.updateProjectionMatrix();
        this.renderer.render(this.scene, this.camera);
    })

    

    previousTime = 0
    previousMouse?: THREE.Vector2
    animate(currentTime: number) {
        requestAnimationFrame((time) => this.animate(time))
        const deltaTime = (currentTime - this.previousTime) / 1000;
        if (this.skogNode) this.placeSkog(deltaTime);
        this.renderer.render(this.scene, this.camera);
        this.previousTime = currentTime;
    }

    raycaster = new THREE.Raycaster();

    placeSkog(delta: number) {
        this.raycaster.setFromCamera(this.mouse, this.camera)
        const rayDirection = this.raycaster.ray.direction;

        const distance = this.camera.position.z;
        const point = new THREE.Vector3().copy(this.camera.position).add(rayDirection.multiplyScalar(distance));

        this.skogNode?.position.copy(point);
        if (this.previousMouse)
        this.bones.forEach(element => {
            const add = new THREE.Vector3(element.add.x, element.add.y, element.add.z);
            const mouseDelta = new THREE.Vector2();
            mouseDelta.copy(this.mouse).sub(this.previousMouse!).multiplyScalar(delta * element.speed * 100);
            mouseDelta.x *= -1;
            add.add(new THREE.Vector3(mouseDelta.y, mouseDelta.x, 0))
            const newRot = new THREE.Euler(element.rotation.x + add.x,element.rotation.y + add.y,element.rotation.z + add.z);
            element.bone.rotation.copy(newRot);
            add.multiplyScalar(delta * element.damp)
            element.add.setFromVector3(add);
            // element.bone.rotation.copy()
        });
        if (this.previousMouse)
        this.previousMouse.copy(this.mouse)
    else this.previousMouse = new THREE.Vector2().copy(this.mouse)
    }


    kill() {
        this.renderer.dispose()
        this.container.removeChild(this.renderer.domElement)
    }
}
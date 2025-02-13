import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/Addons.js";

interface BoneRot {
    bone: THREE.Bone
    rotation: THREE.Euler
    add: THREE.Euler
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

        this.camera.position.z = 3

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
                    const bone = child as THREE.Bone
                    this.bones.push({
                        bone: bone,
                        rotation: bone.rotation,
                        add: new THREE.Euler(0,0,0, "XYZ")
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
    previousMouse: THREE.Vector2 = new THREE.Vector2()
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

        this.bones.forEach(element => {

            // element.bone.rotation.copy()
        });
    }


    kill() {
        this.renderer.dispose()
        this.container.removeChild(this.renderer.domElement)
    }
}
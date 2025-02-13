import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/Addons.js";
// @ts-ignore
import {WiggleBone} from "wiggle"

export class ThreeRender {
    container: HTMLDivElement;

    scene = new THREE.Scene();
    camera: THREE.PerspectiveCamera;

    renderer = new THREE.WebGLRenderer({antialias: true})
    screen: THREE.Vector2

    mouse: THREE.Vector2 = new THREE.Vector2(0,0)

    skogNode?: THREE.Object3D;

    bones: any[] = []

    constructor(element: HTMLDivElement){
        this.container = element;
        this.screen = new THREE.Vector2(this.container.clientWidth, this.container.clientHeight);
        this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.renderer.setSize(this.screen.x, this.screen.y);
        this.container.appendChild(this.renderer.domElement);

        this.camera.position.z = 1.5

        const loader = new GLTFLoader();
        loader.load("./skog.glb", (gltf) => {
            this.scene.add(gltf.scene);
            gltf.scene.traverse((child) => {
                if (child.name === "skog"){
                    const mesh = child as THREE.SkinnedMesh
                    const map = (mesh.material as THREE.MeshStandardMaterial).map
                    mesh.material = new THREE.MeshBasicMaterial({map: map})
                    // const textureLoader = new THREE.TextureLoader();
                    // textureLoader.load("/Skog_1.jpg", (tex) => {
                    //     mesh.material = new THREE.MeshBasicMaterial({map: tex})
                    // })
                    // const helper = new WiggleRigHelper({
                    //     skeleton: mesh.skeleton,
                    //     dotSize: 0.2,
                    //     lineWidth: 0.02,
                    //   });
                    //   this.scene.add(helper);
                    // let rootBone: THREE.Bone
                    mesh.skeleton.bones.forEach((bone) => {
                        if (!(bone.parent! as any).isBone) {
                            // rootBone = bone
                        } else if (!bone.name.toLowerCase().includes("body")) {
                            let velocity = 0.3
                            if (bone.name.toLowerCase().includes("bone"))
                                velocity = 0.6
                            const ogEuler: THREE.Euler = new THREE.Euler().copy(bone.rotation)
                            const wiggleBone = new WiggleBone(bone, { velocity: velocity });
                            this.bones.push(wiggleBone);
                            bone.rotation.copy(ogEuler);
                        }
                    })
                }
                if (child.name === "skogSkel"){
                    this.skogNode = child
                }
                
            })
        })
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
        // const deltaTime = (currentTime - this.previousTime) / 1000;
        if (this.skogNode) this.placeSkog();
        this.renderer.render(this.scene, this.camera);
        this.previousTime = currentTime;
    }

    raycaster = new THREE.Raycaster();
    time: number = 0

    placeSkog() {
        this.raycaster.setFromCamera(this.mouse, this.camera)
        const rayDirection = this.raycaster.ray.direction;

        const distance = this.camera.position.z;
        const point = new THREE.Vector3().copy(this.camera.position).add(rayDirection.multiplyScalar(distance));

        this.skogNode?.position.copy(point);

        if (this.previousMouse)
        this.bones.forEach((wiggleBone) => {
            wiggleBone.update();
        })

        // this.time += delta
        if (this.time > 1){
            this.bones.forEach((wiggleBone) => {
                wiggleBone.reset();
            })
        }

        if (this.previousMouse)
        this.previousMouse.copy(this.mouse)
    else {this.previousMouse = new THREE.Vector2().copy(this.mouse)}
    }


    kill() {
        this.renderer.dispose()
        this.container.removeChild(this.renderer.domElement)
    }
}
import * as THREE from 'three'

export function deleteGroupByName(scene, name) {
    let group = scene.getObjectByName(name)
    if (!group) return
    // 删除掉所有的模型组内的mesh
    group.traverse(function (item) {
        if (item instanceof THREE.Mesh) {
            item.geometry.dispose() // 删除几何体
            // 如果是材质数组就遍历删除
            if (item.material instanceof Array) {
                for (let i = 0; i < item.material.length; i++) {
                    item.material[i].dispose()
                }
            } else { // 如果不是数组是单个材质就直接删除
                item.material.dispose() // 删除材质
            }
        } else if (item instanceof THREE.Scene) {
            item.parent.remove()
        }
    })
    scene.remove(group)
}

export function deleteGroupFromScene(scene, group) {
    if(!group) {
        return
    }
    // 删除掉所有的模型组内的mesh
    group.traverse(function (item) {
        if (item instanceof THREE.Mesh) {
            item.geometry.dispose() // 删除几何体
            // 如果是材质数组就便利删除
            if (item.material instanceof Array) {
                for (let i = 0; i < item.material.length; i++) {
                    item.material[i].dispose()
                }
            } else { // 如果不是数组是单个材质就直接删除
                item.material.dispose() // 删除材质
            }
        } else if (item instanceof THREE.Scene) {
            item.parent.remove()
        }
    })
    // group.parent.remove(group)
    scene.remove(group)
}

export function deleteGroup(group) {
    if(!group) {
        return;
    }
    // 删除掉所有的模型组内的mesh
    group.traverse(function (item) {
        if (item instanceof THREE.Mesh) {
            item.geometry.dispose() // 删除几何体
            // 如果是材质数组就便利删除
            if (item.material instanceof Array) {
                for (let i = 0; i < item.material.length; i++) {
                    item.material[i].dispose()
                }
            } else { // 如果不是数组是单个材质就直接删除
                item.material.dispose() // 删除材质
            }
        }
    })
    group.parent.remove(group)
}

export function deleteTag(object) {
    if (object) {
        for (let i = object.children.length - 1; i > -1; i--) {
            object.children[i].parent.remove(object.children[i])
        }
        object.parent.remove(object)
        object = null
    }
}

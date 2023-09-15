export function hiddenModel(object) {
    object.traverse(function (obj) {
        // 全部隐藏, 顶点也没有了
        if (obj.visible) {
            obj.visible = false
        }

        // 隐藏材质, 顶点可以获取到
        // if (obj.type === "Mesh") {
        //     obj.material.visible = false
        // }
    })
}

export function displayModel(object) {
    object.traverse(function (obj) {
        if (!obj.visible) {
            obj.visible = true
        }
        // if (obj.type === "Mesh") {
        //     obj.material.visible = true
        // }
    })
}

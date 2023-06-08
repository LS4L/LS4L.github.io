let mouse = {
    x: 0,
    y: 0,
    savedX: 0,
    savedY: 0,
    zoom: 1,
    isDown: false,
};
let isPause = false;

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader, source);

    return shader;
}
export function handleMouseMove(event) {
    if (mouse.isDown) {
        mouse.x = mouse.savedX - event.pageX;
        mouse.y = mouse.savedY - event.pageY;
    }
}
export function handlePause() {
    isPause = !isPause;
}
export function handleMouseDown(event) {
    mouse.isDown = true;
}

export function handleMouseUp(event) {
    mouse.savedX = event.pageX;
    mouse.savedY = event.pageY;
    mouse.isDown = false;
}
export function handleMouseZoom(event) {
    event.preventDefault();
    mouse.zoom += event.deltaY * -0.001 * mouse.zoom;
}

export function handleKeyboard(event) {
    if (event.key == " ") isPause = !isPause;
}
export function initGL() {
    const canvas = document.getElementById("glCanvas");
    const pauseButton = document.getElementById("pause");
    const speedSlider = document.getElementById("speed");
    const rcoeff = document.getElementById("rcoeff");
    const gcoeff = document.getElementById("gcoeff");
    const bcoeff = document.getElementById("bcoeff");
    const a = document.getElementById("a");
    const b = document.getElementById("b");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const gl = canvas.getContext("webgl2");
    let vs, fs;
    let posLoc;
    let timeLoc;
    let beginTime;
    let pos;
    let shaderProgram;
    gl.clearColor(1, 1, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const ft1 = fetch("/vert.glsl")
        .then((res) => res.text()) // Стрелочная безымянная функция запустится после получение текста, из 'res' получаем текстовые данные
        .then((data) => {
            // Стрелочная безымянная функция запустится для обработки полученных на предыдущем этапе данных - 'data' это полученный текст
            vs = data; // Запоминаем полученный текст в глобальной переменной
        });

    const ft2 = fetch("/frag.glsl")
        .then((res) => res.text())
        .then((data) => {
            fs = data;
        });

    const draw = () => {
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0); //posloc
        let timeFromStart = Date.now() - beginTime;
        timeLoc = gl.getUniformLocation(shaderProgram, "time");
        let xLoc = gl.getUniformLocation(shaderProgram, "x");
        let yLoc = gl.getUniformLocation(shaderProgram, "y");
        let zoom = gl.getUniformLocation(shaderProgram, "zoom");
        let rcoeffLoc = gl.getUniformLocation(shaderProgram, "rcoeff");
        let gcoeffLoc = gl.getUniformLocation(shaderProgram, "gcoeff");
        let bcoeffLoc = gl.getUniformLocation(shaderProgram, "bcoeff");
        let aLoc = gl.getUniformLocation(shaderProgram, "a");
        let bLoc = gl.getUniformLocation(shaderProgram, "b");
        gl.uniform1f(
            timeLoc,
            isPause ? 100 : timeFromStart / speedSlider.value
        );
        gl.uniform1f(yLoc, mouse.x / canvas.width);
        gl.uniform1f(xLoc, mouse.y / canvas.height);
        gl.uniform1f(zoom, mouse.zoom);
        gl.uniform1f(rcoeffLoc, rcoeff.value);
        gl.uniform1f(gcoeffLoc, gcoeff.value);
        gl.uniform1f(bcoeffLoc, bcoeff.value);
        gl.uniform1f(aLoc, a.value);
        gl.uniform1f(bLoc, b.value);
        gl.useProgram(shaderProgram);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        window.requestAnimationFrame(draw);
    };

    const allData = Promise.all([ft1, ft2]);
    allData.then((res) => {
        // Вызов произойдет, когда все запросы выполнятся
        const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vs);
        const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fs);
        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            const Buf = gl.getProgramInfoLog(shaderProgram);
            console.log(Buf);
        }
        posLoc = gl.getAttribLocation(shaderProgram, "in_pos");
        const posBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
        pos = [-1, -1, -1, 1, 1, -1, 1, 1];
        beginTime = Date.now();
        draw();
    });
}

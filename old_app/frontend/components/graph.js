class Graph extends HTMLElement {

    TEXTCOLOR = "#FF0000";

    static get observedAttributes() {
        return ['title','left','right','ordersplaced','ordersfulfilled', 'timetocomplete'];
    }

    constructor() {
        super();
        console.log('Initializing Graph Component');
        let templateContent = '<div></div>';
        this.labels = [];
        this.datapath = "";
        const shadow = this.attachShadow({
            mode: 'open'
        })
        const element = document.querySelector('.container')
        const style = getComputedStyle(element)
        this.TEXTCOLOR = style.color;
    }

    async connectedCallback() {
        let res = await fetch('./components/graph.html')
        var sr = this.shadowRoot;
        sr.innerHTML = await res.text();
        this.canvasScaled = 100
        this.startGraph();
    }

    //generate random data
    data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    dataB = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    // index is meant to be used as data per second

    async updateData(){
        let min = 40;
        let max = 60;
        // let value = Math.floor(Math.random() * (max - min) + min);
        // this.data.push(value);
        // this.data.shift();
        while(true) {
            let timetocomplete = Number(this.getAttribute('timetocomplete') || '0')
            this.percent.innerText = "Average fulfillment time: " + timetocomplete.toFixed(2) + "s";
            // let value = Math.floor(Math.random() * (max - min) + min)
            // this.data.push(value);
            // this.data.shift();
            let ordersPlacedElement = this.shadowRoot.getElementById('ordersplacedcount')
            let ordersFulfilledElement = this.shadowRoot.getElementById('ordersfulfilledcount')
            ordersPlacedElement.innerText = this.getAttribute('ordersplaced') || '0'
            ordersFulfilledElement.innerText = this.getAttribute('ordersfulfilled') || '0'
            await this.sleep(1000);
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // offset width to allow smooth animation
    previoustimestamp = 0
    secondPassed = 0
    offsetframe = 0
    tempdatasetA
    tempdatasetB
    draw(dataset, datasetB, color, colorB, timestamp){
        let brown = "#cfb1a4";
        let orange = "#fcd89d";
        let blue = "#569BC6";
        let grey = "lightgray";

        var canvas = this.canvas;
        var context = this.context;

        this.secondPassed = (timestamp - this.previoustimestamp) / 1000
        this.previoustimestamp = timestamp
        let offsettemp = this.secondPassed * (190/18)

        if (!this.tempdatasetA) this.tempdatasetA = [...dataset]
        if (!this.tempdatasetB) this.tempdatasetB = [...datasetB]
        if (offsettemp >= 0) {
            this.offsetframe += offsettemp

            if (this.offsetframe > (190/18)) { // after one second, set offset to 0 and get new data
                this.offsetframe = 0
                this.tempdatasetA = [...dataset]
                this.tempdatasetB = [...datasetB]
            }
        }

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.moveTo(0, 0);

        let canvasScaled = this.canvasScaled

        // scale to +100 when data exceeds initial 10099
        if (this.tempdatasetA[this.tempdatasetA.length - 1] > canvasScaled || this.tempdatasetB[this.tempdatasetB.length - 1] > canvasScaled) {
            canvasScaled = canvasScaled + 100
            this.canvasScaled = canvasScaled
        }
        
        //draw the graph line
        context.beginPath();
        context.lineWidth = 3;
        context.strokeStyle = color;
        context.moveTo(0 - this.offsetframe, canvas.height - ((canvas.height * this.tempdatasetA[0]) / canvasScaled));
        for(let i = 1; i < 20; i++){
            context.lineTo((i * ((canvas.width - 40) / 18)) - this.offsetframe, canvas.height - ((canvas.height * this.tempdatasetA[i]) / canvasScaled));
        }
        context.stroke();

        //draw the graph line for second dataset
        context.moveTo(0, 0); // move back to 0,0
        context.beginPath();
        context.lineWidth = 3;
        context.strokeStyle = colorB;
        context.moveTo(0 - this.offsetframe, canvas.height - ((canvas.height * this.tempdatasetB[0]) / canvasScaled));
        for(let i = 1; i < 20; i++){
            context.lineTo(i * ((canvas.width - 40) / 18) - this.offsetframe, canvas.height - ((canvas.height * this.tempdatasetB[i]) / canvasScaled));
        }
        context.stroke();
    
        context.strokeStyle = brown;
    
        //fill
        context.globalAlpha = 0.2;
        context.fillStyle = blue;
        context.lineTo(canvas.width - 40, canvas.height);
        context.lineTo(1, canvas.height);
        context.closePath();
        context.fill();

        // clear out of bounds line stroke
        context.clearRect(290,0,290/18 + 3,canvas.height)

        context.globalAlpha = 1;
        
        //markers
        context.beginPath();
        
        context.lineWidth = 0.2;
        var horizontalLine = canvas.height / 10;
        for (let index = 1; index < 10; index++) {
            context.moveTo(0, horizontalLine * index);
            context.strokeStyle = brown;
            context.lineTo(canvas.width - 40, (horizontalLine * index) + 0.2);
            context.moveTo(0, 0);
        }

        context.stroke();  

        context.font = "12px Roboto";
        for (let index = 1; index < 10; index++) {
            context.strokeStyle = this.TEXTCOLOR;
            context.strokeText(canvasScaled - (index * (canvasScaled/10)), canvas.width - 20, (horizontalLine * index) - 1);
        }

        context.strokeText("0", canvas.width - 16, canvas.height - 1);
        // context.strokeText("100%", canvas.width - 20, 7.2);
    }
    
    async startGraph() {
        var sr = this.shadowRoot;
        this.canvas = sr.getElementById("graph");
        this.context = this.canvas.getContext("2d");
        this.percent = sr.getElementById("percent");
        this.updateData();
        this.render(0);
    }

    render(timestamp){ 
        this.draw(this.data, this.dataB, "#FF7E00", "#569BC6", timestamp);
        requestAnimationFrame(this.render.bind(this));
    }
}

try {
    customElements.define('graph-element', Graph);
} catch (err) {
    const h3 = document.createElement('h3')
    h3.innerHTML = err
    document.body.appendChild(h3)
}
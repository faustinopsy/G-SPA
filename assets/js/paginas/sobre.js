import Slides from '../componentes/slides.js';

class Sobre {
    constructor(){
        this.images = [
            "assets/img/img1.webp",
            "assets/img/img2.webp",
            "assets/img/img3.webp"
        ];
        this.slides = new Slides(this.images)
    }
    render() {
        return `
            <h1>Página sobre</h1>
            ${this.slides.render()}
            <div class="w3-container w3-green w3-cell">
                <p>Hello W3.CSS Layout.</p>
            </div>
        `;
    }
    afterRender(){
        this.slides.afterRender();
    }
    destroy() {
        if (this.slides.destroy) {
            this.slides.destroy();
        }
    }
}
export default Sobre;

// ============================================
// Main.js - Cargar carrusel desde Firebase
// ============================================

document.addEventListener("DOMContentLoaded", () => {
    loadCarousel();
});

async function loadCarousel() {
    const carouselInner = document.getElementById("carouselInner");
    const carouselIndicators = document.getElementById("carouselIndicators");

    if (!carouselInner || !carouselIndicators) return;

    try {
        const snapshot = await db.collection("carousel").orderBy("order", "asc").get();

        if (snapshot.empty) {
            carouselInner.innerHTML = `
                <div class="carousel-item active">
                    <div class="d-flex justify-content-center align-items-center" style="height: 500px;">
                        <p class="text-muted fs-4">Próximamente nuevas colecciones</p>
                    </div>
                </div>
            `;
            return;
        }

        let index = 0;
        snapshot.forEach(doc => {
            const data = doc.data();

            // Crear indicador
            const indicator = document.createElement("button");
            indicator.type = "button";
            indicator.setAttribute("data-bs-target", "#carouselColecciones");
            indicator.setAttribute("data-bs-slide-to", index);
            if (index === 0) indicator.classList.add("active");
            carouselIndicators.appendChild(indicator);

            // Crear slide
            const slide = document.createElement("div");
            slide.className = "carousel-item" + (index === 0 ? " active" : "");
            slide.innerHTML = `
                <img src="${data.imageUrl}" class="d-block mx-auto carousel-img" alt="${data.title}">
                <div class="carousel-caption">
                    <h3>${data.title}</h3>
                </div>
            `;
            carouselInner.appendChild(slide);

            index++;
        });

        // Inicializar el carrusel de Bootstrap después de agregar los slides
        const carouselElement = document.getElementById("carouselColecciones");
        new bootstrap.Carousel(carouselElement, {
            interval: 4000,
            ride: "carousel"
        });

    } catch (error) {
        console.error("Error al cargar el carrusel:", error);
    }
}

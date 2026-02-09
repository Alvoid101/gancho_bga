// ============================================
// Admin Dashboard - Lógica
// ============================================

// Proteger ruta: si no está logueado, redirigir al login
auth.onAuthStateChanged(user => {
    if (!user) {
        window.location.href = "login.html";
    } else {
        document.getElementById("adminEmail").textContent = user.email;
        loadCarouselSlides();
    }
});

// Cerrar sesión
document.getElementById("logoutBtn").addEventListener("click", async () => {
    await auth.signOut();
    window.location.href = "login.html";
});

// ============================================
// Preview de imagen antes de subir
// ============================================
document.getElementById("slideImage").addEventListener("change", (e) => {
    const file = e.target.files[0];
    const preview = document.getElementById("imagePreview");
    const previewImg = document.getElementById("previewImg");

    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            previewImg.src = ev.target.result;
            preview.classList.remove("d-none");
        };
        reader.readAsDataURL(file);
    } else {
        preview.classList.add("d-none");
    }
});

// ============================================
// Agregar slide al carrusel
// ============================================
document.getElementById("addSlideForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("slideTitle").value.trim();
    const fileInput = document.getElementById("slideImage");
    const file = fileInput.files[0];
    const addBtn = document.getElementById("addSlideBtn");
    const progressDiv = document.getElementById("uploadProgress");
    const progressBar = document.getElementById("progressBar");
    const progressText = document.getElementById("progressText");

    if (!file) return;

    addBtn.disabled = true;
    addBtn.textContent = "Subiendo...";
    progressDiv.classList.remove("d-none");
    progressBar.style.width = "50%";
    progressText.textContent = "Subiendo imagen...";

    try {
        // Subir imagen a ImgBB (gratis)
        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: "POST",
            body: formData
        });
        const imgData = await response.json();

        if (!imgData.success) throw new Error("Error al subir imagen");

        const imageUrl = imgData.data.display_url;

        progressBar.style.width = "80%";
        progressText.textContent = "Guardando datos...";

        // Guardar datos en Firestore
        await db.collection("carousel").add({
            title: title,
            imageUrl: imageUrl,
            order: Date.now(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        progressBar.style.width = "100%";
        progressText.textContent = "¡Listo!";

        // Resetear formulario
        setTimeout(() => {
            document.getElementById("addSlideForm").reset();
            document.getElementById("imagePreview").classList.add("d-none");
            progressDiv.classList.add("d-none");
            progressBar.style.width = "0%";
            addBtn.disabled = false;
            addBtn.textContent = "Agregar Slide";

            const modal = bootstrap.Modal.getInstance(document.getElementById("addSlideModal"));
            modal.hide();
            loadCarouselSlides();
        }, 500);

    } catch (error) {
        console.error("Error al subir:", error);
        alert("Error al subir la imagen. Intenta de nuevo.");
        addBtn.disabled = false;
        addBtn.textContent = "Agregar Slide";
        progressDiv.classList.add("d-none");
    }
});

// ============================================
// Cargar slides del carrusel
// ============================================
async function loadCarouselSlides() {
    const listDiv = document.getElementById("carouselList");
    const loadingDiv = document.getElementById("carouselLoading");
    const emptyDiv = document.getElementById("carouselEmpty");

    loadingDiv.classList.remove("d-none");
    listDiv.innerHTML = "";
    emptyDiv.classList.add("d-none");

    try {
        const snapshot = await db.collection("carousel").orderBy("order", "asc").get();

        loadingDiv.classList.add("d-none");

        if (snapshot.empty) {
            emptyDiv.classList.remove("d-none");
            return;
        }

        snapshot.forEach(doc => {
            const data = doc.data();
            const col = document.createElement("div");
            col.className = "col-md-4";
            col.innerHTML = `
                <div class="card slide-card">
                    <img src="${data.imageUrl}" class="card-img-top slide-preview" alt="${data.title}">
                    <div class="card-body d-flex justify-content-between align-items-center">
                        <strong>${data.title}</strong>
                        <button class="btn btn-outline-danger btn-sm" onclick="deleteSlide('${doc.id}')">
                            Eliminar
                        </button>
                    </div>
                </div>
            `;
            listDiv.appendChild(col);
        });

    } catch (error) {
        console.error("Error al cargar slides:", error);
        loadingDiv.classList.add("d-none");
    }
}

// ============================================
// Eliminar slide
// ============================================
async function deleteSlide(docId) {
    if (!confirm("\u00bfEst\u00e1s seguro de eliminar este slide?")) return;

    try {
        // Eliminar documento de Firestore
        await db.collection("carousel").doc(docId).delete();
        // Recargar lista
        loadCarouselSlides();
    } catch (error) {
        console.error("Error al eliminar:", error);
        alert("Error al eliminar el slide.");
    }
}

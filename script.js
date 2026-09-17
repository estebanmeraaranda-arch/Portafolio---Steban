// Lógica para filtrar proyectos por categoría con animación
document.addEventListener('DOMContentLoaded', () => {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    // ====== FILTRO POR CATEGORÍA ======
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.filter-btn.active').classList.remove('active');
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            // Fade out all cards first
            projectCards.forEach(card => {
                card.classList.add('fade-out');
            });

            // After animation, show/hide based on filter
            setTimeout(() => {
                projectCards.forEach(card => {
                    const category = card.dataset.category;

                    if (filter === 'todas' || category === filter) {
                        card.classList.remove('hidden', 'fade-out');
                    } else {
                        card.classList.add('hidden');
                        card.classList.remove('fade-out');
                    }
                });
            }, 300);
        });
    });

    // ====== MODAL 3D VIEWER (OPTIMIZADO) ======
    const modal = document.getElementById('modal-3d');
    const modalViewer = document.getElementById('modal-viewer');
    const modalTitle = document.getElementById('modal-title');
    const modalClose = document.getElementById('modal-close');

    // Abrir modal al hacer click en una card
    projectCards.forEach(card => {
        card.addEventListener('click', () => {
            const src = card.dataset.src;
            const name = card.dataset.name;

            if (src && src.trim() !== '') {
                modalTitle.textContent = name;
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';

                // Delay src assignment so modal animation plays first (less jank)
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        modalViewer.setAttribute('src', src);
                    }, 150);
                });
            }
        });
    });

    // Cerrar modal con limpieza de GPU
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';

        // Limpiar src DESPUÉS de que la animación de cierre termine
        // para liberar memoria GPU y evitar lag residual
        setTimeout(() => {
            modalViewer.setAttribute('src', '');
            // Resetear la cámara para el próximo modelo
            modalViewer.cameraOrbit = 'auto auto auto';
            modalViewer.fieldOfView = 'auto';
        }, 500);
    }

    modalClose.addEventListener('click', closeModal);

    // Cerrar al hacer click fuera del contenido
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // ====== SMOOTH SCROLL ======
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            e.preventDefault();
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

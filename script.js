// Lógica para darle interactividad a los botones de filtro en la galería de proyectos
document.addEventListener('DOMContentLoaded', () => {
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remover la clase active del botón que la tenga actualmente
            document.querySelector('.filter-btn.active').classList.remove('active');

            // Añadir la clase active al botón clickeado
            btn.classList.add('active');

            // Aquí podrás añadir la lógica para filtrar los proyectos reales por categoría
            const category = btn.textContent;
            console.log(`Filtrando por: ${category}`);
        });
    });
});
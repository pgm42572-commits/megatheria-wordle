let animales = [];
let animalSecreto = null;
let intentos = [];
let intentosRestantes = 10;
let partidaTerminada = false;
let estadisticas = {
    partidas: 0,
    ganadas: 0,
    perdidas: 0,
    promedio: 0
};

// CARGAR DATOS
async function cargarAnimales() {
    try {
        const respuesta = await fetch('animals.json');
        animales = await respuesta.json();
        inicializarJuego();
    } catch (error) {
        console.error('Error cargando animales:', error);
    }
}

function inicializarJuego() {
    cargarEstadisticas();
    seleccionarAnimalSecreto();
    renderizarFauna();
    configurarEventos();
}

function seleccionarAnimalSecreto() {
    animalSecreto = animales[Math.floor(Math.random() * animales.length)];
    console.log('Animal secreto:', animalSecreto.nombre);
}

// EVENTOS
function configurarEventos() {
    const inputBusqueda = document.getElementById('inputBusqueda');
    inputBusqueda.addEventListener('input', manejarAutocompletado);
    inputBusqueda.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const sugerencia = document.querySelector('.autocomplete-item.seleccionado');
            if (sugerencia) {
                const nombre = sugerencia.textContent.trim();
                ingresarIntento(nombre);
            }
        }
    });

    document.getElementById('btnEstadisticas').addEventListener('click', () => {
        mostrarEstadisticas();
    });

    document.getElementById('btnCompartir').addEventListener('click', compartirPuntaje);
}

// AUTOCOMPLETADO
function manejarAutocompletado(e) {
    const valor = e.target.value.toLowerCase();
    const contenedor = document.getElementById('autocompletado');

    if (valor.length === 0) {
        contenedor.classList.remove('activo');
        return;
    }

    const sugerencias = animales
        .filter(a => a.nombre.toLowerCase().includes(valor))
        .slice(0, 8);

    if (sugerencias.length === 0) {
        contenedor.classList.remove('activo');
        return;
    }

    contenedor.innerHTML = sugerencias
        .map((a, index) => `
            <div class="autocomplete-item ${index === 0 ? 'seleccionado' : ''}" 
                 onclick="ingresarIntento('${a.nombre}')">
                ${a.nombre}
            </div>
        `)
        .join('');

    contenedor.classList.add('activo');
}

// INGRESAR INTENTO
function ingresarIntento(nombre) {
    if (partidaTerminada) return;

    const animalIngresado = animales.find(a => a.nombre.toLowerCase() === nombre.toLowerCase());
    if (!animalIngresado) {
        alert('Animal no encontrado');
        return;
    }

    if (intentos.find(i => i.id === animalIngresado.id)) {
        alert('Ya intentaste con este animal');
        return;
    }

    // Comparar atributos
    const comparacion = compararAtributos(animalIngresado, animalSecreto);
    intentos.push({
        ...animalIngresado,
        comparacion
    });

    intentosRestantes--;
    actualizarUI();

    // Limpiar input
    document.getElementById('inputBusqueda').value = '';
    document.getElementById('autocompletado').classList.remove('activo');

    // Verificar si ganó
    if (animalIngresado.id === animalSecreto.id) {
        ganarPartida();
    } else if (intentosRestantes === 0) {
        perderPartida();
    }
}

function compararAtributos(animal1, animal2) {
    return {
        epoca: animal1.epoca === animal2.epoca ? 'correcto' : 'incorrecto',
        grupo: animal1.grupo === animal2.grupo ? 'correcto' : 'incorrecto',
        dieta: animal1.dieta === animal2.dieta ? 'correcto' : 'incorrecto',
        ambiente: animal1.ambiente === animal2.ambiente ? 'correcto' : 'incorrecto'
    };
}

// ACTUALIZAR UI
function actualizarUI() {
    // Actualizar contador
    document.getElementById('intentosActuales').textContent = 10 - intentosRestantes;
    const porcentaje = ((10 - intentosRestantes) / 10) * 100;
    document.getElementById('barraProg').style.width = porcentaje + '%';

    // Renderizar intentos
    renderizarIntentos();
}

function renderizarIntentos() {
    const lista = document.getElementById('intentosList');
    lista.innerHTML = intentos.reverse().map(intento => `
        <div class="intento-item">
            <div class="intento-nombre">${intento.nombre}</div>
            <div class="atributos-comparacion">
                <div class="atributo atributo-${intento.comparacion.epoca}">${intento.epoca}</div>
                <div class="atributo atributo-${intento.comparacion.grupo}">${intento.grupo}</div>
                <div class="atributo atributo-${intento.comparacion.dieta}">${intento.dieta}</div>
                <div class="atributo atributo-${intento.comparacion.ambiente}">${intento.ambiente}</div>
            </div>
        </div>
    `).join('');
    intentos.reverse();
}

function renderizarFauna() {
    const grid = document.getElementById('faunaGrid');
    grid.innerHTML = animales.map(a => `
        <div class="fauna-item ${intentos.find(i => i.id === a.id) ? 'descubierto' : ''}" onclick="ingresarIntento('${a.nombre}')">
            <div class="fauna-item-nombre">${a.nombre}</div>
            <div class="fauna-item-tipo">${a.grupo} | ${a.epoca}</div>
        </div>
    `).join('');
}

// GANAR PARTIDA
function ganarPartida() {
    partidaTerminada = true;
    document.getElementById('inputBusqueda').disabled = true;
    estadisticas.partidas++;
    estadisticas.ganadas++;
    guardarEstadisticas();
    mostrarFichaTecnica();
}

// PERDER PARTIDA
function perderPartida() {
    partidaTerminada = true;
    document.getElementById('inputBusqueda').disabled = true;
    estadisticas.partidas++;
    estadisticas.perdidas++;
    guardarEstadisticas();
    mostrarFichaTecnica();
}

// FICHA TÉCNICA
function mostrarFichaTecnica() {
    const modal = document.getElementById('modalFicha');
    const contenedor = document.getElementById('fichaTecnica');

    const ganado = intentos.some(i => i.id === animalSecreto.id);
    const titulo = ganado ? '¡GANASTE!' : 'GAME OVER';
    const mensaje = ganado 
        ? `¡Descubriste el animal en ${10 - intentosRestantes} intentos!`
        : `El animal era: ${animalSecreto.nombre}`;

    contenedor.innerHTML = `
        <h2 style="text-align: center; color: ${ganado ? '#2ecc71' : '#e94560'}; margin-bottom: 20px;">
            ${titulo}
        </h2>
        <p style="text-align: center; color: #95a5a6; margin-bottom: 20px;">${mensaje}</p>

        <div class="ficha-tecnica">
            <div class="ficha-imagen">
                <img src="${animalSecreto.imagen}" alt="${animalSecreto.nombre}" onerror="this.src='https://via.placeholder.com/300?text=${animalSecreto.nombre}'">
            </div>
            <div class="ficha-info">
                <div class="ficha-titulo">${animalSecreto.nombre}</div>
                <div class="ficha-cientifico">${animalSecreto.nombreCientifico}</div>
                <div class="ficha-atributo">
                    <div class="ficha-atributo-label">ÉPOCA</div>
                    <div class="ficha-atributo-valor">${animalSecreto.epoca}</div>
                </div>
                <div class="ficha-atributo">
                    <div class="ficha-atributo-label">GRUPO</div>
                    <div class="ficha-atributo-valor">${animalSecreto.grupo}</div>
                </div>
                <div class="ficha-atributo">
                    <div class="ficha-atributo-label">DIETA</div>
                    <div class="ficha-atributo-valor">${animalSecreto.dieta}</div>
                </div>
                <div class="ficha-atributo">
                    <div class="ficha-atributo-label">AMBIENTE</div>
                    <div class="ficha-atributo-valor">${animalSecreto.ambiente}</div>
                </div>
                <div class="ficha-atributo">
                    <div class="ficha-atributo-label">TAMAÑO</div>
                    <div class="ficha-atributo-valor">${animalSecreto.tamaño}</div>
                </div>
                <div class="ficha-atributo">
                    <div class="ficha-atributo-label">DISTRIBUCIÓN</div>
                    <div class="ficha-atributo-valor">${animalSecreto.distribucion}</div>
                </div>
            </div>
            <div class="ficha-descripcion">
                <strong>📖 Descripción:</strong><br>${animalSecreto.descripcion}
            </div>
            <div class="ficha-curiosidad">
                <strong>💡 Curiosidad:</strong><br>${animalSecreto.curiosidades}
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
}

function cerrarModal() {
    document.getElementById('modalFicha').classList.add('hidden');
}

// COMPARTIR
function compartirPuntaje() {
    const puntaje = 10 - intentosRestantes;
    const texto = `🦁 Adivié el animal de MEGATHERIA WORDLE en ${puntaje} intentos (10 disponibles)\n🧬 Fauna de Luján - LABEV UNLu\n🔗 Juega: [URL DEL JUEGO]`;
    
    if (navigator.share) {
        navigator.share({
            title: 'MEGATHERIA WORDLE',
            text: texto
        });
    } else {
        alert('Puntaje: ' + puntaje + '/10 intentos');
    }
}

// REINICIAR
function reiniciarPartida() {
    intentos = [];
    intentosRestantes = 10;
    partidaTerminada = false;
    document.getElementById('inputBusqueda').disabled = false;
    document.getElementById('inputBusqueda').value = '';
    cerrarModal();
    seleccionarAnimalSecreto();
    renderizarFauna();
    actualizarUI();
}

// ESTADÍSTICAS
function mostrarEstadisticas() {
    const modal = document.getElementById('modalEstadisticas');
    const contenedor = document.getElementById('estadisticasContenido');

    const promedio = estadisticas.partidas > 0 
        ? ((estadisticas.ganadas / estadisticas.partidas) * 100).toFixed(1)
        : 0;

    contenedor.innerHTML = `
        <div class="stat-box">
            <div class="stat-numero">${estadisticas.partidas}</div>
            <div class="stat-label">Partidas</div>
        </div>
        <div class="stat-box">
            <div class="stat-numero">${estadisticas.ganadas}</div>
            <div class="stat-label">Ganadas</div>
        </div>
        <div class="stat-box">
            <div class="stat-numero">${estadisticas.perdidas}</div>
            <div class="stat-label">Perdidas</div>
        </div>
        <div class="stat-box">
            <div class="stat-numero">${promedio}%</div>
            <div class="stat-label">Tasa Éxito</div>
        </div>
    `;

    modal.classList.remove('hidden');
}

function cerrarModalStats() {
    document.getElementById('modalEstadisticas').classList.add('hidden');
}

// PERSISTENCIA
function guardarEstadisticas() {
    localStorage.setItem('megatheria-stats', JSON.stringify(estadisticas));
}

function cargarEstadisticas() {
    const guardadas = localStorage.getItem('megatheria-stats');
    if (guardadas) {
        estadisticas = JSON.parse(guardadas);
    }
}

// INICIAR
cargarAnimales();

const cantidadInput = document.getElementById('cantidadInvitados');
const botonAgregar  = document.getElementById('agregarInvitados');
const botonGuardar  = document.getElementById('guardar');
const listaInvitados = document.getElementById('listaInvitados');
const errorLista    = document.getElementById('error-lista');
const estadoVacio   = document.getElementById('estado-vacio');

function actualizarEstadoVacio() {
  const hayInvitados = obtenerBloques().length > 0;
  estadoVacio.hidden = hayInvitados;
}

function crearBloqueInvitado(numero) {
  const bloque = document.createElement('article');
  bloque.className = 'bloque-invitado';

  const encabezado = document.createElement('div');
  encabezado.className = 'encabezado-bloque';

  const titulo = document.createElement('h3');
  titulo.className = 'titulo-invitado';
  titulo.textContent = `Invitado ${numero}`;

  const botonEliminar = document.createElement('button');
  botonEliminar.type = 'button';
  botonEliminar.className = 'boton-eliminar';
  botonEliminar.setAttribute('aria-label', `Eliminar invitado ${numero}`);
  botonEliminar.textContent = '✕';

  encabezado.append(titulo, botonEliminar);

  const campos = document.createElement('div');
  campos.className = 'campos-invitado';
  campos.innerHTML = `
    <label class="campo">
      <span class="etiqueta">Nombre completo</span>
      <input type="text" class="entrada-nombre" placeholder="Nombre y apellidos">
      <span class="error" aria-live="polite" hidden></span>
    </label>
    <label class="campo">
      <span class="etiqueta">Correo electrónico</span>
      <input type="email" class="entrada-correo" placeholder="correo@dominio.com">
      <span class="error" aria-live="polite" hidden></span>
    </label>
    <label class="campo">
      <span class="etiqueta">Teléfono</span>
      <input type="tel" class="entrada-telefono" placeholder="(+51) 999 999 999">
      <span class="error" aria-live="polite" hidden></span>
    </label>
    <label class="campo">
      <span class="etiqueta">Relación</span>
      <select class="select-relacion">
        <option value="">Selecciona una relación</option>
        <option value="familia">Familia</option>
        <option value="amigo">Amigo / Amiga</option>
        <option value="trabajo">Trabajo</option>
        <option value="otro">Otro</option>
      </select>
      <span class="error" aria-live="polite" hidden></span>
    </label>
  `;

  bloque.append(encabezado, campos);
  return bloque;
}

function obtenerBloques() {
  return [...listaInvitados.querySelectorAll('.bloque-invitado')];
}

function renumerarInvitados() {
  obtenerBloques().forEach((bloque, indice) => {
    const numero = indice + 1;
    bloque.querySelector('.titulo-invitado').textContent = `Invitado ${numero}`;
    bloque.querySelector('.boton-eliminar').setAttribute('aria-label', `Eliminar invitado ${numero}`);
  });
}

function generarInvitados() {
  let cantidad = parseInt(cantidadInput.value, 10);
  if (Number.isNaN(cantidad)) cantidad = 1;
  cantidad = Math.min(50, Math.max(1, cantidad));
  cantidadInput.value = cantidad;

  const bloquesActuales = obtenerBloques();
  const diferencia = cantidad - bloquesActuales.length;

  if (diferencia > 0) {
    for (let n = bloquesActuales.length + 1; n <= cantidad; n++) {
      listaInvitados.appendChild(crearBloqueInvitado(n));
    }
  } else if (diferencia < 0) {
    bloquesActuales.slice(diferencia).forEach(b => b.remove());
  }

  renumerarInvitados();
  errorLista.hidden = true;
  actualizarEstadoVacio();
}

listaInvitados.addEventListener('click', evento => {
  const btn = evento.target.closest('.boton-eliminar');
  if (!btn) return;
  btn.closest('.bloque-invitado').remove();
  renumerarInvitados();
  errorLista.hidden = true;
  actualizarEstadoVacio();
});

const regExpCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function contarDigitos(valor) {
  return valor.replace(/\D/g, '').length;
}

function limpiarErrorCampo(campo) {
  campo.classList.remove('campo-error');
  const err = campo.closest('.campo')?.querySelector('.error');
  if (err) err.hidden = true;
}

function marcarError(campo, mensaje) {
  campo.classList.add('campo-error');
  const err = campo.closest('.campo')?.querySelector('.error');
  if (err) { err.textContent = mensaje; err.hidden = false; }
}

function validarEvento() {
  const ids = ['nombreEvento', 'fechaEvento', 'lugarEvento'];
  let ok = true;
  for (const id of ids) {
    const campo = document.getElementById(id);
    if (campo.value.trim() === '') {
      marcarError(campo, 'Este campo es obligatorio.');
      ok = false;
    }
  }
  return ok;
}

function validarBloque(bloque) {
  const nombre   = bloque.querySelector('.entrada-nombre');
  const correo   = bloque.querySelector('.entrada-correo');
  const telefono = bloque.querySelector('.entrada-telefono');
  const relacion = bloque.querySelector('.select-relacion');
  let ok = true;

  if (!nombre.value.trim()) {
    marcarError(nombre, 'Este campo es obligatorio.'); ok = false;
  }
  if (!correo.value.trim()) {
    marcarError(correo, 'Este campo es obligatorio.'); ok = false;
  } else if (!regExpCorreo.test(correo.value.trim())) {
    marcarError(correo, 'Formato esperado: nombre@dominio.com'); ok = false;
  }
  if (!telefono.value.trim()) {
    marcarError(telefono, 'Este campo es obligatorio.'); ok = false;
  } else if (contarDigitos(telefono.value) < 9) {
    marcarError(telefono, 'Debe tener al menos 9 dígitos.'); ok = false;
  }
  if (!relacion.value) {
    marcarError(relacion, 'Selecciona una relación.'); ok = false;
  }
  return ok;
}

function validarTodo() {
  document.querySelectorAll('.campo-error').forEach(c => c.classList.remove('campo-error'));
  document.querySelectorAll('.error').forEach(e => { e.hidden = true; });

  if (!validarEvento()) return false;

  const bloques = obtenerBloques();
  if (bloques.length === 0) {
    errorLista.hidden = false;
    return false;
  }
  return bloques.every(b => validarBloque(b));
}

function construirContenido() {
  const bloques = obtenerBloques();
  const nombre  = document.getElementById('nombreEvento').value.trim();
  const fecha   = document.getElementById('fechaEvento').value;
  const lugar   = document.getElementById('lugarEvento').value.trim();

  const lineas = [
    `=== EVENTO: ${nombre} ===`,
    `Fecha: ${fecha}`,
    `Lugar: ${lugar}`,
    `Total invitados: ${bloques.length}`,
    '',
  ];

  bloques.forEach((bloque, i) => {
    lineas.push(`--- INVITADO ${i + 1} ---`);
    lineas.push(`Nombre: ${bloque.querySelector('.entrada-nombre').value.trim()}`);
    lineas.push(`Correo: ${bloque.querySelector('.entrada-correo').value.trim()}`);
    lineas.push(`Teléfono: ${bloque.querySelector('.entrada-telefono').value.trim()}`);
    lineas.push(`Relación: ${bloque.querySelector('.select-relacion').value}`);
    if (i < bloques.length - 1) lineas.push('');
  });

  return lineas.join('\n');
}

function exportarInvitados() {
  if (!validarTodo()) return;

  const blob = new Blob([construirContenido()], { type: 'text/plain;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = 'invitados.txt';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

['nombreEvento', 'fechaEvento', 'lugarEvento'].forEach(id => {
  document.getElementById(id).addEventListener('input', e => limpiarErrorCampo(e.target));
});

listaInvitados.addEventListener('input', evento => {
  const target = evento.target;
  if (!target.closest('.bloque-invitado')) return;

  if (target.classList.contains('entrada-nombre')) {
    target.value = target.value.replace(/\d/g, '');
  } else if (target.classList.contains('entrada-telefono')) {
    target.value = target.value.replace(/[^\d\s()+\-.]/g, '');
  }
  limpiarErrorCampo(target);
});

botonAgregar.addEventListener('click', generarInvitados);
botonGuardar.addEventListener('click', exportarInvitados);

cantidadInput.addEventListener('input', () => {
  cantidadInput.value = cantidadInput.value.replace(/\D/g, '');
});

cantidadInput.addEventListener('keydown', evento => {
  if (evento.key === 'Enter') {
    evento.preventDefault();
    generarInvitados();
  }
});
/* Aurum Pre-Academy: coloca en la página lo que está escrito en content.json */
(function () {
  'use strict';
  var datos = null;
  var vista = /[?&]vista\b/.test(location.search); // vista previa desde el editor

  function leer(ruta) {
    return ruta.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, datos);
  }
  function imagenSegura(s) {
    s = String(s || '').trim();
    return /^(https?:\/\/|data:image\/)/i.test(s) || !/^[a-z][a-z0-9+.-]*:/i.test(s) ? s : '';
  }
  function enlaceSeguro(s) {
    s = String(s || '').trim();
    if (!s) return '';
    if (/^(https?:\/\/|mailto:|tel:)/i.test(s)) return s;
    if (/^[a-z][a-z0-9+.-]*:/i.test(s)) return '';
    return 'https://' + s;
  }
  function whatsapp(numero, mensaje) {
    var n = String(numero || '').replace(/\D/g, '').replace(/^00/, '');
    if (n.length === 9 && n.charAt(0) === '9') n = '51' + n; // celular de Perú
    if (n.length < 10) return '';
    return 'https://wa.me/' + n + (mensaje ? '?text=' + encodeURIComponent(mensaje) : '');
  }
  function destino(a, url, falta) {
    if (url) {
      a.href = url; a.target = '_blank'; a.rel = 'noopener';
      a.removeAttribute('data-falta');
    } else {
      a.href = '#'; a.removeAttribute('target');
      a.setAttribute('data-falta', falta);
    }
  }
  function crear(etiqueta, atributos) {
    var e = document.createElement(etiqueta);
    for (var k in atributos) e.setAttribute(k, atributos[k]);
    return e;
  }
  // sin enlace propio, WhatsApp usa el número de la academia
  function enlaceRed(r) {
    return enlaceSeguro(r.enlace) || (/whatsapp/i.test(r.nombre) ? whatsapp(leer('equipo.telefonoAcademia'), '') : '');
  }
  function icono(nombre) {
    var ns = 'http://www.w3.org/2000/svg';
    var s = document.createElementNS(ns, 'svg'), u = document.createElementNS(ns, 'use');
    s.setAttribute('class', 'i'); s.setAttribute('aria-hidden', 'true');
    u.setAttribute('href', '#i-' + nombre); s.appendChild(u); return s;
  }
  function iconoRed(nombre) {
    var n = String(nombre).toLowerCase();
    return { whatsapp: 'whatsapp', instagram: 'instagram', x: 'x-twitter', youtube: 'youtube', facebook: 'facebook-f' }[n] || 'link';
  }
  function todos(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }

  function pintar() {
    todos('[data-t]', function (el) {
      var v = leer(el.getAttribute('data-t'));
      if (typeof v === 'string') el.textContent = v;
    });
    todos('[data-img]', function (el) {
      var v = imagenSegura(leer(el.getAttribute('data-img')));
      if (v && el.getAttribute('src') !== v) el.src = v;
    });
    todos('[data-correo-menu]', function (el) { el.href = 'mailto:' + String(leer('inicio.correo') || '').trim(); });
    todos('[data-correo]', function (el) {
      var c = String(leer('inicio.correo') || '').trim();
      el.textContent = c; el.href = 'mailto:' + c;
    });
    todos('[data-materias]', function (ul) {
      ul.textContent = '';
      (leer('inicio.materias') || []).forEach(function (m) {
        var li = crear('li', {}); li.textContent = m; ul.appendChild(li);
      });
    });
    todos('[data-iconos]', function (caja) {
      caja.textContent = '';
      (leer('historia.redes') || []).forEach(function (r) {
        var a = crear('a', { 'aria-label': r.nombre });
        a.appendChild(icono(iconoRed(r.nombre)));
        destino(a, enlaceRed(r), 'Pronto publicaremos nuestro ' + r.nombre + '.');
        caja.appendChild(a);
      });
    });
    todos('[data-redes]', function (caja) {
      caja.textContent = '';
      (leer('historia.redes') || []).forEach(function (r) {
        var url = enlaceRed(r);
        var a = crear('a', { 'aria-label': r.nombre + ' de ' + (datos.marca || '') });
        a.appendChild(crear('img', { src: imagenSegura(r.imagen), alt: '', width: 1100, height: 293 }));
        destino(a, url, 'Pronto publicaremos nuestro ' + r.nombre + '.');
        caja.appendChild(a);
      });
    });
    todos('[data-fundadores]', function (caja) {
      caja.textContent = '';
      (leer('equipo.fundadores') || []).forEach(function (f) {
        var a = crear('a', { 'aria-label': 'Escribir a ' + f.nombre + ' por WhatsApp' });
        a.appendChild(crear('img', { src: imagenSegura(f.foto) || 'sin-foto.png', alt: '' }));
        var s = crear('span', {}); s.textContent = f.nombre; a.appendChild(s);
        destino(a, whatsapp(f.telefono, leer('equipo.mensajeFundador')), 'El número de ' + f.nombre + ' aún no está disponible.');
        caja.appendChild(a);
      });
    });
    todos('[data-inscribir]', function (a) {
      destino(a, whatsapp(leer('equipo.telefonoAcademia'), leer('equipo.mensajeInscripcion')),
        'El número de la academia aún no está disponible.');
    });
    document.documentElement.classList.remove('cargando');
  }

  var aviso, reloj;
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest('a');
    if (!a) return;
    if (a.hasAttribute('data-falta')) {
      ev.preventDefault();
      if (!aviso) aviso = crear('div', { 'class': 'aviso', role: 'status' });
      (a.closest('dialog') || document.body).appendChild(aviso);
      aviso.textContent = a.getAttribute('data-falta'); aviso.hidden = false;
      clearTimeout(reloj); reloj = setTimeout(function () { aviso.hidden = true; }, 3500);
    } else if (vista) {
      var h = a.getAttribute('href') || '';
      if (/^[a-z]+\.html$/.test(h)) { ev.preventDefault(); location.href = h + '?vista'; }
    }
  });

  // menú de las tres rayitas
  var menu = document.getElementById('menu');
  todos('[data-abrir]', function (b) { b.addEventListener('click', function () { menu.showModal(); }); });
  todos('[data-cerrar]', function (b) { b.addEventListener('click', function () { menu.close(); }); });
  menu.addEventListener('click', function (ev) { if (ev.target === menu) menu.close(); });
  // buscador: busca en los textos de las tres páginas
  var buscador = document.getElementById('buscador');
  var consulta = document.getElementById('consulta'), resultados = document.getElementById('resultados');
  function llano(t) { return String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function textos() {
    var lista = [];
    if (!datos) { // sin content.json (abierto como archivo): busca en esta página
      todos('main [data-t], main li', function (el) { lista.push({ pagina: location.pathname.split('/').pop() || 'index.html', nombre: document.title.split('|')[0], texto: el.textContent }); });
      return lista;
    }
    [['inicio', 'index.html', 'Inicio'], ['historia', 'historia.html', 'Historia'], ['equipo', 'equipo.html', 'Equipo']].forEach(function (p) {
      (function recorrer(o, clave) {
        if (/^(banner|imagen\d*|foto|telefono\w*|mensaje\w*|enlace|redes|boton)$/.test(clave)) return;
        if (typeof o === 'string') { if (o) lista.push({ pagina: p[1], nombre: p[2], texto: o }); }
        else if (o) Object.keys(o).forEach(function (k) { recorrer(o[k], k); });
      })(datos[p[0]], p[0]);
    });
    return lista;
  }
  function buscar() {
    var q = llano(consulta.value.trim()), n = 0;
    resultados.textContent = '';
    if (q.length < 2) return;
    textos().forEach(function (r) {
      var i = llano(r.texto).indexOf(q);
      if (i < 0 || n >= 8) return;
      n++;
      var li = crear('li', {}), a = crear('a', { href: r.pagina }), b = crear('b', {}), s = crear('span', {});
      var desde = Math.max(0, i - 40);
      b.textContent = r.nombre;
      s.textContent = (desde ? '…' : '') + r.texto.slice(desde, desde + 110) + (r.texto.length > desde + 110 ? '…' : '');
      a.appendChild(b); a.appendChild(s); li.appendChild(a); resultados.appendChild(li);
    });
    if (!n) { var li = crear('li', { 'class': 'nada' }); li.textContent = 'No se encontró nada con esa palabra.'; resultados.appendChild(li); }
  }
  todos('[data-buscar]', function (b) { b.addEventListener('click', function () { buscador.showModal(); consulta.focus(); }); });
  todos('[data-cerrar-buscar]', function (b) { b.addEventListener('click', function () { buscador.close(); }); });
  buscador.addEventListener('click', function (ev) { if (ev.target === buscador) buscador.close(); });
  consulta.addEventListener('input', buscar);

  if (vista && window.parent !== window) {
    window.addEventListener('message', function (ev) {
      if (ev.source !== window.parent || !ev.data || ev.data.tipo !== 'aurum-vista') return;
      datos = ev.data.contenido; pintar();
    });
    window.parent.postMessage({ tipo: 'aurum-listo' }, '*');
  } else {
    var limite = setTimeout(function () { document.documentElement.classList.remove('cargando'); }, 1500);
    fetch('content.json?v=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (j) { datos = j; clearTimeout(limite); pintar(); })
      .catch(function () { document.documentElement.classList.remove('cargando'); });
  }
})();

// Manager Pro - Sistema de Gestão de Pastagem
// Versão: 2.4.1
// Autor: Claude + Lucas Teixeira
// Copyright: Pasto Verde Consultoria

const { useState, useEffect, useMemo, useCallback, useRef } = React;

// Ícones SVG
const I = ({ size = 20, children }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{children}</svg>;
const Upload = p => <I {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></I>;
const Plus = p => <I {...p}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></I>;
const Trash2 = p => <I {...p}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></I>;
const X = p => <I {...p}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></I>;
const MapPin = p => <I {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></I>;
const ZoomIn = p => <I {...p}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></I>;
const ZoomOut = p => <I {...p}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" /></I>;
const RotateCcw = p => <I {...p}><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></I>;
const Download = p => <I {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></I>;
const Edit2 = p => <I {...p}><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></I>;
const Search = p => <I {...p}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></I>;
const Target = p => <I {...p}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></I>;
const Navigation = p => <I {...p}><polygon points="3 11 22 2 13 21 11 13 3 11" /></I>;

// Funções auxiliares
const gid = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const calcArea = c => {
  if (!c || c.length < 3) return 0;
  let a = 0;
  const n = c.length, lm = c.reduce((s, v) => s + v[1], 0) / n, fl = Math.cos(lm * Math.PI / 180);
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n, xi = c[i][0] * fl * 111320, yi = c[i][1] * 110540, xj = c[j][0] * fl * 111320, yj = c[j][1] * 110540;
    a += xi * yj - xj * yi;
  }
  return (Math.abs(a) / 2 / 10000).toFixed(2);
};
const calcUA = (p, q) => !p || !q ? 0 : ((p * q) / 450).toFixed(2);
const isReserva = nome => {
  const n = nome.toLowerCase();
  return n.includes('reserva') || n.includes('preserva') || n.includes('app') || n.includes('rl ') || n.includes('mata') || n.includes('floresta');
};

const loteCores = ['#fbbf24', '#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ec4899', '#ef4444', '#06b6d4', '#84cc16', '#a855f7'];
const moduloCores = ['rgba(16,185,129,0.15)', 'rgba(139,92,246,0.15)', 'rgba(249,115,22,0.15)', 'rgba(59,130,246,0.15)', 'rgba(236,72,153,0.15)'];
const moduloCoresFortes = ['rgba(16,185,129,0.5)', 'rgba(139,92,246,0.5)', 'rgba(249,115,22,0.5)', 'rgba(59,130,246,0.5)', 'rgba(236,72,153,0.5)'];
const getLoteCor = idx => loteCores[idx % loteCores.length];
const getModuloCor = idx => moduloCores[idx % moduloCores.length];
const getModuloCorForte = idx => moduloCoresFortes[idx % moduloCoresFortes.length];
const pointInPolygon = (p, vs) => {
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0], yi = vs[i][1], xj = vs[j][0], yj = vs[j][1];
    if ((yi > p[1]) != (yj > p[1]) && (p[0] < (xj - xi) * (p[1] - yi) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
};

function App() {
  const [data, setData] = useState({ faz: [], fa: null, mod: [], piq: [], lot: [], his: [], mb: null });
  const [ui, setUi] = useState({ tab: 'mapa', modal: null, sel: null, st: '', sch: '', ed: null, zm: 1, pn: { x: 0, y: 0 }, fd: {}, fe: [] });
  const [gps, setGps] = useState({ pos: null, status: 'buscando' });

  useEffect(() => {
    const s = localStorage.getItem('pastureSystem');
    if (s) {
      try {
        const d = JSON.parse(s);
        setData({ faz: d.fazendas || [], fa: d.fazendaAtual || null, mod: d.modulos || [], piq: d.piquetes || [], lot: d.lotes || [], his: d.historico || [], mb: d.mapBounds || null });
      } catch (e) { }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('pastureSystem', JSON.stringify({
      version: '2.4.1',
      fazendas: data.faz,
      fazendaAtual: data.fa,
      modulos: data.mod,
      piquetes: data.piq,
      lotes: data.lot,
      historico: data.his,
      mapBounds: data.mb
    }));
  }, [data]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGps({ pos: null, status: 'indisponivel' });
      return;
    }
    const id = navigator.geolocation.watchPosition(
      p => setGps({ pos: { lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy }, status: 'ativo' }),
      e => setGps(g => ({ ...g, status: 'erro' })),
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  const getPiqGPS = useMemo(() => {
    if (!gps.pos) return null;
    return data.piq.find(x => x.fazendaId === data.fa && x.coordinates && x.coordinates.length > 0 && pointInPolygon([gps.pos.lng, gps.pos.lat], x.coordinates)) || null;
  }, [gps.pos, data.piq, data.fa]);

  const exp = () => {
    const d = { fazendas: data.faz, modulos: data.mod, piquetes: data.piq, lotes: data.lot, historico: data.his, version: '2.4.1' };
    const b = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' });
    const u = URL.createObjectURL(b);
    const a = document.createElement('a');
    a.href = u;
    a.download = `backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(u);
    setUi({ ...ui, st: '✅ Backup criado!' });
    setTimeout(() => setUi(ui => ({ ...ui, st: '' })), 3000);
  };

  const imp = e => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => {
      try {
        const d = JSON.parse(ev.target.result);
        if (confirm('Importar backup? Substitui todos os dados.')) {
          setData({ faz: d.fazendas || [], fa: null, mod: d.modulos || [], piq: d.piquetes || [], lot: d.lotes || [], his: d.historico || [], mb: null });
          setUi({ ...ui, st: '✅ Importado!' });
        }
      } catch (er) {
        setUi({ ...ui, st: '❌ Erro ao importar' });
      }
    };
    r.readAsText(f);
    e.target.value = '';
  };

  const parseKML = t => {
    const p = new DOMParser(), x = p.parseFromString(t, 'text/xml');
    if (x.querySelector('parsererror')) throw new Error('KML inválido');
    const pl = x.getElementsByTagName('Placemark');
    if (pl.length === 0) throw new Error('Sem áreas no KML');
    const np = [];
    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity, aT = 0, aR = 0;
    for (let i = 0; i < pl.length; i++) {
      const pm = pl[i], ne = pm.getElementsByTagName('name')[0], nm = ne ? ne.textContent.trim() : `Área ${i + 1}`;
      const ce = pm.getElementsByTagName('coordinates')[0];
      let co = [], ar = 0;
      const reserva = isReserva(nm);
      if (ce) {
        const ct = ce.textContent.trim(), cp = ct.split(/\s+/);
        co = cp.map(pr => {
          const [lng, lat] = pr.split(',').map(parseFloat);
          if (!isNaN(lng) && !isNaN(lat)) {
            minLng = Math.min(minLng, lng);
            maxLng = Math.max(maxLng, lng);
            minLat = Math.min(minLat, lat);
            maxLat = Math.max(maxLat, lat);
            return [lng, lat];
          }
          return null;
        }).filter(c => c);
        if (co.length > 2) {
          ar = parseFloat(calcArea(co));
          aT += ar;
          if (reserva) aR += ar;
        }
      }
      np.push({
        id: gid(),
        fazendaId: data.fa,
        moduloId: null,
        nome: nm,
        area: ar,
        coordinates: co,
        loteAtualId: null,
        dataEntrada: null,
        dataSaida: null,
        ehReserva: reserva,
        dataCriacao: new Date().toISOString()
      });
    }
    setData({
      ...data,
      mb: { minLat, maxLat, minLng, maxLng, centerLat: (minLat + maxLat) / 2, centerLng: (minLng + maxLng) / 2, width: maxLng - minLng, height: maxLat - minLat }
    });
    if (data.fa) {
      setData(d => ({
        ...d,
        faz: d.faz.map(f => f.id === data.fa ? { ...f, areaTotal: aT.toFixed(2), areaPreservacao: aR.toFixed(2), areaUtil: (aT - aR).toFixed(2) } : f)
      }));
    }
    return { piquetes: np, stats: { total: aT.toFixed(2), reserva: aR.toFixed(2) } };
  };

  const hKML = e => {
    const f = e.target.files[0];
    if (!f || !data.fa) return;
    const r = new FileReader();
    r.onload = ev => {
      try {
        const res = parseKML(ev.target.result);
        const piqExistentes = data.piq.filter(p => p.fazendaId === data.fa);
        if (piqExistentes.length > 0 && !confirm('Substituir áreas existentes?')) return;
        setData({ ...data, piq: data.piq.filter(p => p.fazendaId !== data.fa).concat(res.piquetes) });
        setUi({ ...ui, st: `✅ ${res.piquetes.length} áreas importadas!` });
        setTimeout(() => setUi(ui => ({ ...ui, st: '' })), 3000);
      } catch (er) {
        setUi({ ...ui, st: `❌ ${er.message}` });
      }
    };
    r.readAsText(f);
    e.target.value = '';
  };

  const projC = (lng, lat, b, w, h) => {
    if (!b) return [0, 0];
    const p = 50;
    return [((lng - b.minLng) / b.width) * (w - p * 2) + p, ((b.maxLat - lat) / b.height) * (h - p * 2) + p];
  };

  const getPath = (c, b, w, h) => {
    if (!c || c.length === 0) return '';
    return c.map((co, i) => {
      const [x, y] = projC(co[0], co[1], b, w, h);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ') + ' Z';
  };

  const getCent = c => {
    if (!c || c.length === 0) return [0, 0];
    let sLng = 0, sLat = 0;
    c.forEach(co => { sLng += co[0]; sLat += co[1]; });
    return [sLng / c.length, sLat / c.length];
  };

  const fazAt = data.faz.find(f => f.id === data.fa);
  const piqF = data.piq.filter(p => p.fazendaId === data.fa);
  const modF = data.mod.filter(m => m.fazendaId === data.fa);
  const lotF = data.lot.filter(l => l.fazendaId === data.fa);

  return <div className="min-h-screen bg-gray-50">
    <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">📊 Manager Pro v2.4</h1>
          <div className="flex gap-2">
            <button onClick={exp} className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded text-sm flex items-center gap-1">
              <Download size={16} />Backup
            </button>
            <label className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded text-sm cursor-pointer flex items-center gap-1">
              <Upload size={16} />Restaurar
              <input type="file" accept=".json" onChange={imp} className="hidden" />
            </label>
          </div>
        </div>
        {fazAt && <div className="text-sm flex items-center gap-2">
          <span>📍 {fazAt.nome}</span>
          {gps.status === 'ativo' && getPiqGPS && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">✅ GPS | 📍 {getPiqGPS.nome}</span>}
          {gps.status === 'ativo' && !getPiqGPS && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">✅ GPS</span>}
        </div>}
      </div>
    </div>

    {ui.st && <div className="max-w-7xl mx-auto px-4 pt-2">
      <div className={`p-2 rounded text-sm ${ui.st.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{ui.st}</div>
    </div>}

    {data.fa && <div className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-7xl mx-auto flex gap-1 overflow-x-auto">
        {['mapa', 'piquetes', 'modulos', 'lotes', 'historico'].map(t => <button key={t} onClick={() => setUi({ ...ui, tab: t })} className={`px-4 py-2 font-semibold capitalize whitespace-nowrap ${ui.tab === t ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600'}`}>
          {t === 'piquetes' ? 'áreas' : t}
        </button>)}
      </div>
    </div>}

    <div className="max-w-7xl mx-auto p-4">
      {!data.fa ? <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Locais</h2>
          <button onClick={() => setUi({ ...ui, modal: 'fazenda', fd: {} })} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-1">
            <Plus size={18} />Novo
          </button>
        </div>
        {data.faz.length === 0 ? <div className="text-center py-8 text-gray-500">Nenhum local cadastrado</div> :
          data.faz.map(f => <div key={f.id} className="border-2 rounded-lg p-4 mb-3 hover:border-green-500 transition">
            <h3 className="text-lg font-bold cursor-pointer hover:text-green-600" onClick={() => { setData({ ...data, fa: f.id }); setUi({ ...ui, tab: 'mapa' }); }}>{f.nome}</h3>
            {f.areaTotal > 0 && <div className="text-sm text-gray-600 mt-2">
              <div>📊 Total: {f.areaTotal}ha | 🌾 Útil: {f.areaUtil}ha</div>
              <div>🌳 Preservação: {f.areaPreservacao}ha</div>
            </div>}
          </div>)}
      </div> :

        ui.tab === 'mapa' ? <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold">Mapa</h2>
            <label className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 cursor-pointer text-sm flex items-center gap-1">
              <Upload size={16} />Importar KML
              <input type="file" accept=".kml,.xml" onChange={hKML} className="hidden" />
            </label>
          </div>
          {piqF.length === 0 ? <div className="text-center py-12 text-gray-500">
            <MapPin size={48} className="mx-auto mb-2 text-gray-300" />
            <p>Importe um arquivo KML para começar</p>
          </div> : <div>
            <div className="flex gap-2 mb-2">
              <button onClick={() => setUi({ ...ui, zm: Math.min(ui.zm + 0.2, 5) })} className="bg-gray-200 p-2 rounded hover:bg-gray-300"><ZoomIn size={18} /></button>
              <button onClick={() => setUi({ ...ui, zm: Math.max(ui.zm - 0.2, 0.5) })} className="bg-gray-200 p-2 rounded hover:bg-gray-300"><ZoomOut size={18} /></button>
              <button onClick={() => setUi({ ...ui, zm: 1, pn: { x: 0, y: 0 } })} className="bg-gray-200 p-2 rounded hover:bg-gray-300"><RotateCcw size={18} /></button>
            </div>
            <div className="border-2 rounded bg-gray-50 overflow-hidden">
              <svg viewBox="0 0 1000 800" className="w-full h-auto" style={{ minHeight: '400px' }}>
                <g transform={`translate(${ui.pn.x},${ui.pn.y}) scale(${ui.zm})`}>
                  {piqF.filter(p => p.coordinates && p.coordinates.length > 0).map(p => {
                    const path = getPath(p.coordinates, data.mb, 1000, 800);
                    const [cx, cy] = projC(getCent(p.coordinates)[0], getCent(p.coordinates)[1], data.mb, 1000, 800);
                    return <g key={p.id}>
                      <path d={path} fill={p.ehReserva ? 'rgba(22,101,52,0.7)' : '#e2e8f0'} stroke={p.ehReserva ? '#166534' : '#94a3b8'} strokeWidth={p.ehReserva ? 3 : 2} opacity="0.95" className={p.ehReserva ? "" : "cursor-pointer hover:opacity-100"} onClick={() => !p.ehReserva && setUi({ ...ui, sel: p })} />
                      <text x={cx} y={cy - 20} textAnchor="middle" fill="#1e293b" fontSize="20" fontWeight="bold" className="pointer-events-none">{p.ehReserva ? '🌳 ' : ''}{p.nome}</text>
                      <text x={cx} y={cy} textAnchor="middle" fill="#64748b" fontSize="16" className="pointer-events-none">{p.area}ha</text>
                    </g>;
                  })}
                  {gps.pos && data.mb && <circle cx={projC(gps.pos.lng, gps.pos.lat, data.mb, 1000, 800)[0]} cy={projC(gps.pos.lng, gps.pos.lat, data.mb, 1000, 800)[1]} r="6" fill="#3b82f6" />}
                </g>
              </svg>
            </div>
          </div>}
        </div> :

          ui.tab === 'piquetes' ? <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-3">Áreas (Piquetes)</h2>
            <p className="text-gray-600">{piqF.length} áreas cadastradas</p>
          </div> :

            ui.tab === 'modulos' ? <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold">Módulos</h2>
                <button onClick={() => setUi({ ...ui, modal: 'modulo', fd: {} })} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-1">
                  <Plus size={16} />Novo
                </button>
              </div>
              <p className="text-gray-600">{modF.length} módulos cadastrados</p>
            </div> :

              ui.tab === 'lotes' ? <div className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-bold">Lotes</h2>
                  <button onClick={() => setUi({ ...ui, modal: 'lote', fd: {} })} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-1">
                    <Plus size={16} />Novo
                  </button>
                </div>
                {lotF.filter(l => l.status !== 'vendido').length === 0 ? <div className="text-center py-8 text-gray-500">Nenhum lote ativo</div> :
                  lotF.filter(l => l.status !== 'vendido').map(l => <div key={l.id} className="border-2 rounded-lg p-4 mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ color: getLoteCor(lotF.findIndex(x => x.id === l.id)) }} className="text-2xl">●</span>
                      <h3 className="font-bold">{l.nome}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{l.categoria} • {l.quantidade} cab • {l.totalUA} UA</p>
                    {l.status === 'livre' ? <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold mt-2">🟡 Livre</span> :
                      <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold mt-2">✅ Alocado</span>}
                  </div>)}
              </div> :

                <div className="bg-white rounded-lg shadow p-4">
                  <h2 className="text-xl font-bold">Histórico</h2>
                  <p className="text-gray-500 mt-4">Movimentações serão exibidas aqui</p>
                </div>}
    </div>

    {ui.modal === 'fazenda' && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 max-w-md w-full">
        <h2 className="text-lg font-bold mb-3">Novo Local</h2>
        <input type="text" placeholder="Nome *" value={ui.fd.nome || ''} onChange={e => setUi({ ...ui, fd: { ...ui.fd, nome: e.target.value } })} className="w-full px-3 py-2 border rounded mb-3" />
        <div className="flex gap-2">
          <button onClick={() => {
            if (!ui.fd.nome) return;
            const nv = { id: gid(), nome: ui.fd.nome, areaTotal: 0, areaPreservacao: 0, areaUtil: 0 };
            setData({ ...data, faz: [...data.faz, nv], fa: nv.id });
            setUi({ ...ui, modal: null, fd: {}, tab: 'mapa' });
          }} className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Criar</button>
          <button onClick={() => setUi({ ...ui, modal: null, fd: {} })} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancelar</button>
        </div>
      </div>
    </div>}

    {ui.modal === 'lote' && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 max-w-md w-full">
        <h2 className="text-lg font-bold mb-3">Novo Lote</h2>
        <input type="text" placeholder="Nome *" value={ui.fd.nome || ''} onChange={e => setUi({ ...ui, fd: { ...ui.fd, nome: e.target.value } })} className="w-full px-3 py-2 border rounded mb-2" />
        <select value={ui.fd.categoria || ''} onChange={e => setUi({ ...ui, fd: { ...ui.fd, categoria: e.target.value } })} className="w-full px-3 py-2 border rounded mb-2">
          <option value="">Categoria...</option>
          {['Bezerro', 'Bezerra', 'Garrotes', 'Novilhas', 'Bois', 'Vacas'].map(c => <option key={c}>{c}</option>)}
        </select>
        <input type="number" placeholder="Peso (kg)" value={ui.fd.peso || ''} onChange={e => setUi({ ...ui, fd: { ...ui.fd, peso: e.target.value } })} className="w-full px-3 py-2 border rounded mb-2" />
        <input type="number" placeholder="Quantidade" value={ui.fd.qtd || ''} onChange={e => setUi({ ...ui, fd: { ...ui.fd, qtd: e.target.value } })} className="w-full px-3 py-2 border rounded mb-3" />
        <div className="flex gap-2">
          <button onClick={() => {
            if (!ui.fd.nome || !ui.fd.categoria || !ui.fd.peso || !ui.fd.qtd) return;
            const tu = calcUA(parseFloat(ui.fd.peso), parseInt(ui.fd.qtd));
            const nv = {
              id: gid(),
              fazendaId: data.fa,
              nome: ui.fd.nome,
              categoria: ui.fd.categoria,
              pesoMedio: parseFloat(ui.fd.peso),
              quantidade: parseInt(ui.fd.qtd),
              totalUA: parseFloat(tu),
              status: 'livre',
              piqueteAtual: null
            };
            setData({ ...data, lot: [...data.lot, nv] });
            setUi({ ...ui, modal: null, fd: {} });
          }} className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Criar</button>
          <button onClick={() => setUi({ ...ui, modal: null, fd: {} })} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancelar</button>
        </div>
      </div>
    </div>}
  </div>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

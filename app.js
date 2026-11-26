import {locations, observations, traffic, editorial} from './data.js';
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const state={island:'All',type:'All',search:'',selected:null,map:null,markers:[],layer:'Weather',article:editorial[0]};
const categoryLabels = {Nature:'Naturaleza', Coast:'Costa', Culture:'Cultura'};
const statusLabels = {Draft:'Borrador', Review:'Revisión', Approved:'Aprobado'};
const shortMonthLabels = {Jan:'ene',Feb:'feb',Mar:'mar',Apr:'abr',May:'may',Jun:'jun',Jul:'jul',Aug:'ago',Sep:'sep',Oct:'oct',Nov:'nov',Dec:'dic'};
const monthLabels = {Jan:'enero', Feb:'febrero', Mar:'marzo', Apr:'abril', May:'mayo', Jun:'junio', Jul:'julio', Aug:'agosto', Sep:'septiembre', Oct:'octubre', Nov:'noviembre', Dec:'diciembre'};
const escapeHtml = (s) => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function showView(view){
  $$('.nav-item').forEach(b=>{const active=b.dataset.view===view;b.classList.toggle('active',active); if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
  $$('[data-view-panel]').forEach(p=>p.classList.toggle('active',p.dataset.viewPanel===view));
  location.hash=view; if(view==='explore'&&state.map)setTimeout(()=>state.map.resize(),50);
}
$$('.nav-item').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
function filtered(){return locations.filter(p=>(state.island==='All'||p.island===state.island)&&(state.type==='All'||p.type===state.type)&&`${p.name} ${p.summary} ${p.island}`.toLowerCase().includes(state.search.toLowerCase()))}
function renderPlaces(){
  const list=filtered(); $('#place-count').textContent=`${list.length} ${list.length === 1 ? 'resultado' : 'resultados'}`;
  $('#places-list').innerHTML=list.length?list.map(p=>`<button type="button" class="place ${state.selected===p.id?'selected':''}" data-place="${p.id}"><span class="place-icon">${p.icon}</span><span class="place-copy"><strong>${escapeHtml(p.name)}</strong><small>${escapeHtml(p.island)} · ${categoryLabels[p.type] || p.type}</small></span><span class="place-chevron">›</span></button>`).join(''):'<p class="empty">No hay lugares de ejemplo que coincidan con estos filtros.</p>';
  $$('[data-place]').forEach(b=>b.addEventListener('click',()=>selectPlace(b.dataset.place)));
  for(const entry of state.markers)entry.marker.getElement().style.display=list.some(p=>p.id===entry.id)?'block':'none';
}
function selectPlace(id){
  state.selected=id; const p=locations.find(x=>x.id===id);if(!p)return;
  $('#place-detail').innerHTML=`<small>${escapeHtml(p.island.toUpperCase())} / ${(categoryLabels[p.type] || p.type).toUpperCase()}</small><strong>${escapeHtml(p.name)}</strong><p>${escapeHtml(p.summary)} · Las coordenadas señalan lugares públicos a modo ilustrativo.</p>`;
  renderPlaces();state.markers.forEach(x=>x.marker.getElement().classList.toggle('selected',x.id===id));
  if(state.map)state.map.flyTo({center:[p.lng,p.lat],zoom:9,essential:true});
}
$$('[data-offline-place]').forEach(b=>b.addEventListener('click',()=>selectPlace(b.dataset.offlinePlace)));
$('#island-filter').addEventListener('change',e=>{state.island=e.target.value;renderPlaces();if(state.map&&state.island==='All')state.map.flyTo({center:[-16.8,28.25],zoom:6.6})});
$('#type-filter').addEventListener('change',e=>{state.type=e.target.value;renderPlaces()});
$('#place-search').addEventListener('input',e=>{state.search=e.target.value;renderPlaces()});
function initMap(){
  if(!window.maplibregl){$('#map-fallback').hidden=false;return;}
  try{
    const map=new window.maplibregl.Map({container:'map',style:'https://demotiles.maplibre.org/style.json',center:[-16.8,28.25],zoom:6.6,minZoom:3});
    state.map=map;map.addControl(new window.maplibregl.NavigationControl({showCompass:false}), 'bottom-right');
    map.on('load',()=>{$('#map-offline').hidden=true;$('#map-fallback').hidden=true});map.on('error',()=>{$('#map-offline').hidden=false});
    locations.forEach(p=>{
      const el=document.createElement('button');el.className='marker';el.type='button';el.setAttribute('aria-label',p.name);el.title=p.name;
      el.addEventListener('click',()=>selectPlace(p.id));const marker=new window.maplibregl.Marker({element:el}).setLngLat([p.lng,p.lat]).addTo(map);state.markers.push({id:p.id,marker});
    });renderPlaces();
  }catch(_){$('#map-fallback').hidden=false}
}
function renderLive(){
  $('#live-heading').textContent=state.layer==='Weather'?'Datos meteorológicos':state.layer==='Calima'?'Calidad del aire / calima':'Observaciones sísmicas';
  $('#observation-list').innerHTML=observations[state.layer].map(o=>`<div class="observation"><div><strong>${escapeHtml(o.place)}</strong><small>${escapeHtml(o.note)}</small></div><span>${escapeHtml(o.value)}</span><div class="obs-meter"><i style="width:${o.w}%"></i></div></div>`).join('');
  $$('.layer-btn').forEach(b=>b.classList.toggle('selected',b.dataset.layer===state.layer));
}
$$('.layer-btn').forEach(b=>b.addEventListener('click',()=>{state.layer=b.dataset.layer;renderLive()}));
let jobNum=0;$('#run-refresh').addEventListener('click',()=>{jobNum++;$('#job-output').textContent=`[simulation #${jobNum}] discover → validate → normalize → snapshot ready. ${state.layer.toLowerCase()} dataset: ${observations[state.layer].length} synthetic records. No network or database writes.`});
function renderChart(active=7){
  const max=Math.max(...traffic.map(x=>x.value));$('#tourism-chart').innerHTML=traffic.map((m,i)=>`<button type="button" class="bar-entry ${active===i?'active':''}" data-bar="${i}" aria-label="${monthLabels[m.month]}: índice ${m.value}"><span class="bar" style="--bar-height:${Math.round(m.value/max*100)}%"></span><span>${shortMonthLabels[m.month]}</span></button>`).join('');
  $$('.bar-entry').forEach(b=>b.addEventListener('click',()=>renderChart(Number(b.dataset.bar))));
  $('#chart-value').textContent=traffic[active].value;$('#chart-month').textContent=`Índice ficticio · ${monthLabels[traffic[active].month]}`;
}
function chooseArticle(id){const a=editorial.find(x=>x.id===id);if(!a)return;state.article=a;$('#article-title').value=a.title;$('#article-summary').value=a.summary;updatePreview()}
function updatePreview(){const a=state.article;$('#preview-title').textContent=$('#article-title').value||'Borrador sin título';$('#preview-summary').textContent=$('#article-summary').value;$('#article-island').textContent=a.island;$('#article-status').textContent=statusLabels[a.status] || a.status}
const select=$('#article-select');editorial.forEach(x=>{const option=document.createElement('option');option.value=x.id;option.textContent=`${x.title} · ${statusLabels[x.status] || x.status}`;select.append(option)});
select.addEventListener('change',e=>chooseArticle(e.target.value));$('#preview-article').addEventListener('click',updatePreview);$('#reset-article').addEventListener('click',()=>chooseArticle(state.article.id));
function renderMockApi(key){
  const data=key==='places'?{source:'portfolio-synthetic',type:'FeatureCollection',features:locations.slice(0,3).map(p=>({type:'Feature',properties:{id:p.id,label:p.name,category:p.type},geometry:{type:'Point',coordinates:[p.lng,p.lat]}}))}:key==='weather'?{source:'portfolio-synthetic',status:'sample',observations:observations.Weather.map(x=>({station:x.place,value:x.value}))}:{source:'portfolio-synthetic',unit:'index-not-passenger-count',series:traffic.slice(0,5)};
  $('#api-output').textContent=JSON.stringify(data,null,2);
  $$('[data-api]').forEach(b=>b.classList.toggle('api-selected',b.dataset.api===key));
}
$$('[data-api]').forEach(b=>b.addEventListener('click',()=>renderMockApi(b.dataset.api)));
renderMockApi('places');
renderPlaces();renderLive();renderChart();chooseArticle(editorial[0].id);if(location.hash&&$$('.nav-item').some(b=>`#${b.dataset.view}`===location.hash))showView(location.hash.slice(1));
const script=document.createElement('script');script.src='https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js';script.onload=initMap;script.onerror=()=>{$('#map-fallback').hidden=false};document.head.append(script);

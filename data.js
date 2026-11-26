/* Entirely synthetic demo dataset; independently authored, not exported from production. */
export const locations = [
  {id:'cc-01',name:'Parque Nacional del Teide',island:'Tenerife',type:'Nature',lat:28.2724,lng:-16.6425,summary:'Paisajes volcánicos de alta montaña.',icon:'▲'},
  {id:'cc-02',name:'San Cristóbal de La Laguna',island:'Tenerife',type:'Culture',lat:28.4880,lng:-16.3160,summary:'Calles históricas y patrimonio urbano.',icon:'◈'},
  {id:'cc-03',name:'Playa de Las Teresitas',island:'Tenerife',type:'Coast',lat:28.5073,lng:-16.1857,summary:'Una playa junto a Santa Cruz de Tenerife.',icon:'≈'},
  {id:'cc-04',name:'Dunas de Maspalomas',island:'Gran Canaria',type:'Coast',lat:27.7413,lng:-15.5852,summary:'Dunas y costa en el sur de la isla.',icon:'≈'},
  {id:'cc-05',name:'Roque Nublo',island:'Gran Canaria',type:'Nature',lat:27.9702,lng:-15.6129,summary:'Formación rocosa emblemática de la cumbre.',icon:'▲'},
  {id:'cc-06',name:'Playa de Las Canteras',island:'Gran Canaria',type:'Coast',lat:28.1408,lng:-15.4363,summary:'Playa urbana de Las Palmas de Gran Canaria.',icon:'≈'},
  {id:'cc-07',name:'Caldera de Taburiente',island:'La Palma',type:'Nature',lat:28.7287,lng:-17.8686,summary:'Senderos y grandes barrancos volcánicos.',icon:'▲'},
  {id:'cc-08',name:'Santa Cruz de La Palma',island:'La Palma',type:'Culture',lat:28.6847,lng:-17.7647,summary:'Arquitectura tradicional y balcones de madera.',icon:'◈'},
  {id:'cc-09',name:'Charco Azul',island:'La Palma',type:'Coast',lat:28.8057,lng:-17.7646,summary:'Piscinas naturales junto al Atlántico.',icon:'≈'}
];
export const observations = {
  Weather:[{place:'Tenerife · norte',value:'22 °C',note:'Brisa moderada',w:67},{place:'Gran Canaria · sur',value:'25 °C',note:'Cielo despejado',w:78},{place:'La Palma · oeste',value:'20 °C',note:'Nubes dispersas',w:53}],
  Calima:[{place:'Tenerife · PM10',value:'31 µg/m³',note:'Indicador ilustrativo',w:44},{place:'Gran Canaria · PM10',value:'47 µg/m³',note:'Indicador ilustrativo',w:67},{place:'La Palma · PM10',value:'19 µg/m³',note:'Indicador ilustrativo',w:27}],
  Seismic:[{place:'Canarias · evento A',value:'M 1.8',note:'Simulación · 12 km',w:28},{place:'Canarias · evento B',value:'M 2.1',note:'Simulación · 18 km',w:40},{place:'Canarias · evento C',value:'M 1.2',note:'Simulación · 9 km',w:19}]
};
export const traffic = [
  {month:'Jan',value:69},{month:'Feb',value:74},{month:'Mar',value:82},{month:'Apr',value:78},
  {month:'May',value:85},{month:'Jun',value:92},{month:'Jul',value:108},{month:'Aug',value:119},
  {month:'Sep',value:102},{month:'Oct',value:88},{month:'Nov',value:83},{month:'Dec',value:97}
];
export const editorial = [
  {id:'c1',title:'Senderos entre volcanes',summary:'Una guía editorial de rutas volcánicas para visitantes curiosos.',status:'Draft',island:'Tenerife'},
  {id:'c2',title:'Paseos junto al Atlántico',summary:'Ideas para explorar pequeñas localidades costeras.',status:'Review',island:'Gran Canaria'},
  {id:'c3',title:'Un fin de semana en La Palma',summary:'Selección ilustrativa de actividades y miradores.',status:'Approved',island:'La Palma'}
];

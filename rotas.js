import { Linking, Platform } from 'react-native';

const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';

export async function calcularRota(origem, destino) {
  const url =
    `${OSRM_URL}/${origem.longitude},${origem.latitude};${destino.longitude},${destino.latitude}` +
    '?overview=full&geometries=geojson';

  const resposta = await fetch(url);
  if (!resposta.ok) {
    throw new Error('Não foi possível calcular a rota agora. Tente novamente em instantes.');
  }

  const dados = await resposta.json();
  if (dados.code !== 'Ok' || !dados.routes || dados.routes.length === 0) {
    throw new Error('Nenhuma rota encontrada até esse endereço.');
  }

  const rota = dados.routes[0];
  const coordenadas = rota.geometry.coordinates.map(([longitude, latitude]) => ({ latitude, longitude }));

  return { coordenadas, distancia: rota.distance, duracao: rota.duration };
}

export function abrirNoGoogleMaps(destino) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${destino.latitude},${destino.longitude}&travelmode=driving`;
  return Linking.openURL(url);
}

export function abrirNoWaze(destino) {
  const url = `https://waze.com/ul?ll=${destino.latitude},${destino.longitude}&navigate=yes`;
  return Linking.openURL(url);
}

export function abrirNoMapaPadrao(destino, nome = 'Cliente') {
  const rotulo = encodeURIComponent(nome);
  const url =
    Platform.OS === 'ios'
      ? `http://maps.apple.com/?daddr=${destino.latitude},${destino.longitude}&q=${rotulo}`
      : `geo:0,0?q=${destino.latitude},${destino.longitude}(${rotulo})`;
  return Linking.openURL(url);
}

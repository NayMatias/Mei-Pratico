/**
 * Captura da localização do dispositivo.
 * Etapa 4 do cronograma (15/09 a 28/09).
 */
import * as Location from 'expo-location';

export async function pedirPermissao() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

/** Retorna { latitude, longitude } da posição atual ou lança erro explicativo. */
export async function obterLocalizacaoAtual() {
  const permitido = await pedirPermissao();
  if (!permitido) {
    throw new Error('Permissão de localização negada. Ative nas configurações do celular para ver o mapa e as rotas.');
  }

  // Tenta a última posição conhecida primeiro (mais rápido), depois a atual.
  const ultima = await Location.getLastKnownPositionAsync({ maxAge: 60000 });
  if (ultima) {
    return { latitude: ultima.coords.latitude, longitude: ultima.coords.longitude };
  }

  const atual = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  return { latitude: atual.coords.latitude, longitude: atual.coords.longitude };
}

/** Converte um endereço em coordenadas usando o geocodificador do próprio celular. */
export async function enderecoParaCoordenadas(endereco) {
  try {
    const resultados = await Location.geocodeAsync(endereco);
    if (resultados && resultados.length > 0) {
      return { latitude: resultados[0].latitude, longitude: resultados[0].longitude };
    }
  } catch (erro) {
    console.warn('Falha na geocodificação:', erro);
  }
  return null;
}

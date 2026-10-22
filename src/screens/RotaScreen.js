/**
 * Rota até o cliente — etapa 5 (29/09 a 12/10).
 * Traça o caminho entre a localização atual do prestador e o endereço do cliente.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Marker, Polyline } from 'react-native-maps';

import Botao from '../components/Botao';
import MapaBase from '../components/MapaBase';
import { buscarCliente } from '../database/db';
import { obterLocalizacaoAtual } from '../services/localizacao';
import { abrirNoGoogleMaps, abrirNoWaze, calcularRota } from '../services/rotas';
import { cores } from '../theme/cores';
import { enderecoCompleto, formatarDistancia, formatarDuracao } from '../utils/formatar';

export default function RotaScreen({ route }) {
  const { clienteId } = route.params;
  const mapaRef = useRef(null);
  const [cliente, setCliente] = useState(null);
  const [origem, setOrigem] = useState(null);
  const [rota, setRota] = useState(null);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const destino = cliente && cliente.latitude != null ? { latitude: cliente.latitude, longitude: cliente.longitude } : null;

  const tracar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const c = await buscarCliente(clienteId);
      setCliente(c);
      if (!c || c.latitude == null) {
        throw new Error('Este cliente ainda não tem a localização do endereço. Edite o cadastro e salve novamente.');
      }

      const atual = await obterLocalizacaoAtual();
      setOrigem(atual);

      const resultado = await calcularRota(atual, { latitude: c.latitude, longitude: c.longitude });
      setRota(resultado);

      setTimeout(() => {
        mapaRef.current?.fitToCoordinates(resultado.coordenadas, {
          edgePadding: { top: 60, right: 40, bottom: 260, left: 40 },
          animated: true,
        });
      }, 400);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [clienteId]);

  useEffect(() => {
    tracar();
  }, [tracar]);

  return (
    <View style={{ flex: 1 }}>
      <MapaBase
        ref={mapaRef}
        initialRegion={{
          latitude: destino?.latitude ?? -27.0253,
          longitude: destino?.longitude ?? -48.6517,
          latitudeDelta: 0.06,
          longitudeDelta: 0.06,
        }}
      >
        {origem && <Marker coordinate={origem} title="Você está aqui" pinColor="#1565C0" />}
        {destino && <Marker coordinate={destino} title={cliente.nome} description={enderecoCompleto(cliente)} pinColor={cores.primaria} />}
        {rota && <Polyline coordinates={rota.coordenadas} strokeColor={cores.primaria} strokeWidth={5} />}
      </MapaBase>

      <View style={estilos.painel}>
        {cliente ? <Text style={estilos.nome}>{cliente.nome}</Text> : null}
        {cliente ? <Text style={estilos.endereco}>{enderecoCompleto(cliente)}</Text> : null}

        {carregando ? (
          <ActivityIndicator color={cores.primaria} style={{ marginVertical: 12 }} />
        ) : erro ? (
          <>
            <Text style={estilos.erro}>{erro}</Text>
            <Botao titulo="Tentar de novo" onPress={tracar} style={{ marginTop: 10 }} />
          </>
        ) : rota ? (
          <>
            <View style={estilos.numeros}>
              <View style={estilos.numero}>
                <Text style={estilos.valor}>{formatarDistancia(rota.distancia)}</Text>
                <Text style={estilos.legenda}>distância</Text>
              </View>
              <View style={estilos.numero}>
                <Text style={estilos.valor}>{formatarDuracao(rota.duracao)}</Text>
                <Text style={estilos.legenda}>tempo estimado</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Botao titulo="Google Maps" style={{ flex: 1 }} onPress={() => abrirNoGoogleMaps(destino)} />
              <Botao titulo="Waze" variante="secundario" style={{ flex: 1 }} onPress={() => abrirNoWaze(destino)} />
            </View>
          </>
        ) : null}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  painel: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 24,
    backgroundColor: cores.branco,
    borderRadius: 16,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  nome: { fontSize: 18, fontWeight: '700', color: cores.texto },
  endereco: { fontSize: 14, color: cores.textoSuave, marginTop: 2 },
  numeros: { flexDirection: 'row', marginVertical: 14 },
  numero: { flex: 1, alignItems: 'center' },
  valor: { fontSize: 22, fontWeight: '800', color: cores.primaria },
  legenda: { fontSize: 13, color: cores.textoSuave },
  erro: { fontSize: 15, color: cores.erro, marginTop: 10 },
});

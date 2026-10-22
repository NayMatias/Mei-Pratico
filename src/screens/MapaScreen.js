/**
 * Mapa do dia — etapa 4 (15/09 a 28/09).
 * Mostra a posição atual do prestador e os clientes com atendimento hoje.
 */
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Callout, Marker } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';

import Botao from '../components/Botao';
import MapaBase from '../components/MapaBase';
import { listarAtendimentosDoDia } from '../database/db';
import { obterLocalizacaoAtual } from '../services/localizacao';
import { cores } from '../theme/cores';
import { hojeISO } from '../utils/formatar';

// Centro de Camboriú/SC, usado enquanto a localização não chega
const REGIAO_PADRAO = { latitude: -27.0253, longitude: -48.6517, latitudeDelta: 0.08, longitudeDelta: 0.08 };

export default function MapaScreen({ navigation }) {
  const mapaRef = useRef(null);
  const [posicao, setPosicao] = useState(null);
  const [pontos, setPontos] = useState([]);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const atendimentos = await listarAtendimentosDoDia(hojeISO());
      const comCoordenadas = atendimentos.filter((a) => a.latitude != null && a.status !== 'concluido');
      setPontos(comCoordenadas);

      const atual = await obterLocalizacaoAtual();
      setPosicao(atual);

      // Ajusta o zoom para mostrar o prestador e todos os clientes
      const coords = [atual, ...comCoordenadas.map((p) => ({ latitude: p.latitude, longitude: p.longitude }))];
      setTimeout(() => {
        mapaRef.current?.fitToCoordinates(coords, {
          edgePadding: { top: 80, right: 60, bottom: 160, left: 60 },
          animated: true,
        });
      }, 400);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  return (
    <View style={{ flex: 1 }}>
      <MapaBase
        ref={mapaRef}
        initialRegion={posicao ? { ...posicao, latitudeDelta: 0.05, longitudeDelta: 0.05 } : REGIAO_PADRAO}
      >
        {pontos.map((p) => (
          <Marker key={p.id} coordinate={{ latitude: p.latitude, longitude: p.longitude }} pinColor={cores.primaria}>
            <Callout onPress={() => navigation.navigate('Rota', { clienteId: p.cliente_id })}>
              <View style={{ maxWidth: 220, padding: 4 }}>
                <Text style={{ fontWeight: '700' }}>
                  {p.hora ? `${p.hora} · ` : ''}
                  {p.cliente_nome}
                </Text>
                <Text>{p.descricao}</Text>
                <Text style={{ color: cores.primaria, marginTop: 4, fontWeight: '600' }}>Toque para traçar a rota →</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapaBase>

      <View style={estilos.painel}>
        {carregando ? (
          <ActivityIndicator color={cores.primaria} />
        ) : erro ? (
          <>
            <Text style={estilos.erro}>{erro}</Text>
            <Botao titulo="Tentar de novo" onPress={carregar} style={{ marginTop: 10 }} />
          </>
        ) : (
          <Text style={estilos.texto}>
            {pontos.length === 0
              ? 'Nenhum cliente com endereço no mapa para hoje.'
              : `${pontos.length} ${pontos.length === 1 ? 'cliente' : 'clientes'} para visitar hoje. Toque no pino para ver a rota.`}
          </Text>
        )}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  painel: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 28,
    backgroundColor: cores.branco,
    borderRadius: 14,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  texto: { fontSize: 15, color: cores.texto, textAlign: 'center' },
  erro: { fontSize: 15, color: cores.erro, textAlign: 'center' },
});

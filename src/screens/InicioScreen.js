/**
 * Menu principal — etapa 2 (18/08 a 31/08).
 * Mostra os atendimentos do dia e os atalhos para as funções do app.
 */
import { useCallback, useState } from 'react';
import { Linking, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Botao from '../components/Botao';
import Cartao from '../components/Cartao';
import { buscarPrestador, listarAtendimentosDoDia } from '../database/db';
import { cores } from '../theme/cores';
import { formatarMoeda, hojeISO, isoParaBR } from '../utils/formatar';

function saudacao() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function InicioScreen({ navigation }) {
  const [prestador, setPrestador] = useState(null);
  const [atendimentos, setAtendimentos] = useState([]);
  const [atualizando, setAtualizando] = useState(false);

  const carregar = useCallback(async () => {
    setPrestador(await buscarPrestador());
    setAtendimentos(await listarAtendimentosDoDia(hojeISO()));
  }, []);

  // Recarrega sempre que a tela volta a aparecer (ex.: depois de cadastrar um atendimento)
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  async function atualizar() {
    setAtualizando(true);
    await carregar();
    setAtualizando(false);
  }

  const pendentes = atendimentos.filter((a) => a.status !== 'concluido');
  const primeiroNome = prestador?.nome?.split(' ')[0] ?? '';

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={atualizando} onRefresh={atualizar} />}
    >
      <Text style={estilos.ola}>
        {saudacao()}, {primeiroNome}! 👋
      </Text>
      <Text style={estilos.data}>
        Hoje, {isoParaBR(hojeISO())} · {pendentes.length} {pendentes.length === 1 ? 'atendimento pendente' : 'atendimentos pendentes'}
      </Text>

      <Botao titulo="+ Novo atendimento" onPress={() => navigation.navigate('Servico')} style={{ marginVertical: 16 }} />

      <View style={estilos.grade}>
        <Cartao icone="🗺️" titulo="Mapa do dia" subtitulo="Clientes e rotas" onPress={() => navigation.navigate('Mapa')} style={estilos.item} />
        <Cartao icone="👥" titulo="Clientes" subtitulo="Cadastro rápido" onPress={() => navigation.navigate('Clientes')} style={estilos.item} />
        <Cartao icone="📒" titulo="Histórico" subtitulo="Serviços feitos" onPress={() => navigation.navigate('Historico')} style={estilos.item} />
        <Cartao icone="🧾" titulo="Recibos" subtitulo="Em breve" etiqueta="v0.7" desabilitado onPress={() => {}} style={estilos.item} />
      </View>

      <Text style={estilos.secao}>Atendimentos de hoje</Text>

      {atendimentos.length === 0 ? (
        <Cartao titulo="Nenhum atendimento para hoje" subtitulo="Toque em “Novo atendimento” para agendar." />
      ) : (
        atendimentos.map((a) => {
          const concluido = a.status === 'concluido';
          return (
            <Cartao
              key={a.id}
              titulo={`${a.hora ? a.hora + ' · ' : ''}${a.cliente_nome}`}
              subtitulo={`${a.descricao} · ${formatarMoeda(concluido ? a.valor_recebido : a.valor)}`}
              etiqueta={concluido ? 'Concluído' : 'Agendado'}
            >
              {!concluido && (
                <View style={estilos.acoes}>
                  <Botao
                    titulo="Rota"
                    variante="secundario"
                    style={estilos.acao}
                    desabilitado={a.latitude == null}
                    onPress={() => navigation.navigate('Rota', { clienteId: a.cliente_id })}
                  />
                  {a.cliente_telefone ? (
                    <Botao
                      titulo="WhatsApp"
                      variante="secundario"
                      style={estilos.acao}
                      onPress={() => Linking.openURL(`https://wa.me/55${a.cliente_telefone.replace(/\D/g, '')}`)}
                    />
                  ) : null}
                  <Botao titulo="Finalizar" style={estilos.acao} onPress={() => navigation.navigate('Finalizar', { atendimentoId: a.id })} />
                </View>
              )}
            </Cartao>
          );
        })
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  ola: { fontSize: 24, fontWeight: '800', color: cores.texto },
  data: { fontSize: 14, color: cores.textoSuave, marginTop: 4 },
  grade: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  item: { width: '48.5%' },
  secao: { fontSize: 18, fontWeight: '700', color: cores.texto, marginTop: 12, marginBottom: 10 },
  acoes: { flexDirection: 'row', gap: 8, marginTop: 12 },
  acao: { flex: 1, minHeight: 42, paddingVertical: 8 },
});

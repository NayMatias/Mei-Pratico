/**
 * Histórico de serviços realizados — etapa 6 (13/10 a 26/10).
 *
 * Mostra os atendimentos concluídos mês a mês, com:
 *  - total recebido e quanto ainda falta receber (serviços "Pendente");
 *  - filtro por cliente;
 *  - toque no serviço para abrir o recibo de novo.
 */
import { useCallback, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Cartao from '../components/Cartao';
import { listarClientesDoMes, listarHistorico } from '../database/db';
import { cores } from '../theme/cores';
import { formatarMoeda, isoParaBR } from '../utils/formatar';

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export default function HistoricoScreen({ navigation }) {
  const hoje = new Date();
  const [ano, setAno] = useState(hoje.getFullYear());
  const [mes, setMes] = useState(hoje.getMonth()); // 0 a 11
  const [clienteId, setClienteId] = useState(null);
  const [clientesDoMes, setClientesDoMes] = useState([]);
  const [historico, setHistorico] = useState({ itens: [], total: 0, aReceber: 0 });

  const anoMes = `${ano}-${String(mes + 1).padStart(2, '0')}`;

  useFocusEffect(
    useCallback(() => {
      listarHistorico(anoMes, clienteId).then(setHistorico);
      listarClientesDoMes(anoMes).then(setClientesDoMes);
    }, [anoMes, clienteId])
  );

  function mudarMes(delta) {
    const nova = new Date(ano, mes + delta, 1);
    setAno(nova.getFullYear());
    setMes(nova.getMonth());
    setClienteId(null);
  }

  const qtd = historico.itens.length;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={estilos.seletor}>
        <Pressable onPress={() => mudarMes(-1)} hitSlop={12}>
          <Text style={estilos.seta}>‹</Text>
        </Pressable>
        <Text style={estilos.mes}>
          {MESES[mes]} de {ano}
        </Text>
        <Pressable onPress={() => mudarMes(1)} hitSlop={12}>
          <Text style={estilos.seta}>›</Text>
        </Pressable>
      </View>

      <View style={estilos.resumo}>
        <Text style={estilos.resumoValor}>{formatarMoeda(historico.total)}</Text>
        <Text style={estilos.resumoLegenda}>
          recebidos em {qtd} {qtd === 1 ? 'atendimento' : 'atendimentos'}
        </Text>
        {historico.aReceber > 0 ? <Text style={estilos.aReceber}>+ {formatarMoeda(historico.aReceber)} a receber</Text> : null}
      </View>

      {clientesDoMes.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginBottom: 12 }}>
          <Filtro texto="Todos" ativo={!clienteId} onPress={() => setClienteId(null)} />
          {clientesDoMes.map((c) => (
            <Filtro key={c.id} texto={c.nome} ativo={clienteId === c.id} onPress={() => setClienteId(c.id)} />
          ))}
        </ScrollView>
      ) : null}

      <FlatList
        data={historico.itens}
        keyExtractor={(a) => String(a.id)}
        ListEmptyComponent={<Text style={estilos.vazio}>Nenhum atendimento concluído neste mês.</Text>}
        renderItem={({ item }) => (
          <Cartao
            titulo={`${item.cliente_nome} · ${formatarMoeda(item.valor_recebido ?? item.valor)}`}
            subtitulo={`${isoParaBR(item.data)} · ${item.descricao}`}
            etiqueta={item.forma_pagamento}
            onPress={() => navigation.navigate('Recibo', { atendimentoId: item.id })}
          />
        )}
      />
    </View>
  );
}

function Filtro({ texto, ativo, onPress }) {
  return (
    <Pressable onPress={onPress} style={[estilos.filtro, ativo && estilos.filtroAtivo]}>
      <Text style={[estilos.filtroTexto, ativo && { color: cores.branco }]}>{texto}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  seletor: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  seta: { fontSize: 32, color: cores.primaria, paddingHorizontal: 12 },
  mes: { fontSize: 18, fontWeight: '700', color: cores.texto },
  resumo: { backgroundColor: cores.primaria, borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 14 },
  resumoValor: { fontSize: 30, fontWeight: '800', color: cores.branco },
  resumoLegenda: { fontSize: 14, color: '#E0F2E1', marginTop: 4 },
  aReceber: { fontSize: 14, color: '#FFE082', marginTop: 6, fontWeight: '600' },
  filtro: {
    borderWidth: 1.5,
    borderColor: cores.primaria,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    backgroundColor: cores.branco,
  },
  filtroAtivo: { backgroundColor: cores.primaria },
  filtroTexto: { fontSize: 14, color: cores.primaria, fontWeight: '600' },
  vazio: { textAlign: 'center', color: cores.textoSuave, marginTop: 30, fontSize: 15 },
});

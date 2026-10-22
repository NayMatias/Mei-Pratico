/**
 * Histórico de serviços realizados — etapa 6 (13/10 a 26/10) — EM ANDAMENTO.
 *
 * Feito: lista de atendimentos concluídos por mês e total recebido.
 * TODO: filtro por cliente, período personalizado e exportação.
 */
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Cartao from '../components/Cartao';
import { listarHistorico } from '../database/db';
import { cores } from '../theme/cores';
import { formatarMoeda, isoParaBR } from '../utils/formatar';

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export default function HistoricoScreen() {
  const hoje = new Date();
  const [ano, setAno] = useState(hoje.getFullYear());
  const [mes, setMes] = useState(hoje.getMonth()); // 0 a 11
  const [historico, setHistorico] = useState({ itens: [], total: 0 });

  useFocusEffect(
    useCallback(() => {
      const anoMes = `${ano}-${String(mes + 1).padStart(2, '0')}`;
      listarHistorico(anoMes).then(setHistorico);
    }, [ano, mes])
  );

  function mudarMes(delta) {
    const nova = new Date(ano, mes + delta, 1);
    setAno(nova.getFullYear());
    setMes(nova.getMonth());
  }

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
          recebidos em {historico.itens.length} {historico.itens.length === 1 ? 'atendimento' : 'atendimentos'}
        </Text>
      </View>

      <FlatList
        data={historico.itens}
        keyExtractor={(a) => String(a.id)}
        ListEmptyComponent={<Text style={estilos.vazio}>Nenhum atendimento concluído neste mês.</Text>}
        renderItem={({ item }) => (
          <Cartao
            titulo={`${item.cliente_nome} · ${formatarMoeda(item.valor_recebido ?? item.valor)}`}
            subtitulo={`${isoParaBR(item.data)} · ${item.descricao}`}
            etiqueta={item.forma_pagamento}
          />
        )}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  seletor: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  seta: { fontSize: 32, color: cores.primaria, paddingHorizontal: 12 },
  mes: { fontSize: 18, fontWeight: '700', color: cores.texto },
  resumo: { backgroundColor: cores.primaria, borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 16 },
  resumoValor: { fontSize: 30, fontWeight: '800', color: cores.branco },
  resumoLegenda: { fontSize: 14, color: '#E0F2E1', marginTop: 4 },
  vazio: { textAlign: 'center', color: cores.textoSuave, marginTop: 30, fontSize: 15 },
});

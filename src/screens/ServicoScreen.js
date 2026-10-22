/**
 * Registro de serviço (novo atendimento) — etapa 3 (01/09 a 14/09).
 */
import { useCallback, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Botao from '../components/Botao';
import Campo from '../components/Campo';
import { criarAtendimento, listarClientes, listarServicos } from '../database/db';
import { cores } from '../theme/cores';
import { brParaISO, formatarMoeda, hojeISO, isoParaBR, lerValor, mascaraData, mascaraHora } from '../utils/formatar';
import { validarHora } from '../utils/validar';

export default function ServicoScreen({ navigation }) {
  const [clientes, setClientes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [busca, setBusca] = useState('');
  const [clienteId, setClienteId] = useState(null);
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState(isoParaBR(hojeISO()));
  const [hora, setHora] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      listarClientes().then(setClientes);
      listarServicos().then(setServicos);
    }, [])
  );

  const clientesFiltrados = clientes.filter((c) => c.nome.toLowerCase().includes(busca.toLowerCase())).slice(0, 6);
  const clienteSelecionado = clientes.find((c) => c.id === clienteId);

  function escolherServico(s) {
    setDescricao(s.nome);
    if (s.preco_padrao != null) setValor(String(s.preco_padrao).replace('.', ','));
  }

  function validar() {
    const novos = {};
    if (!clienteId) novos.cliente = 'Escolha o cliente.';
    if (descricao.trim().length < 3) novos.descricao = 'Descreva o serviço.';
    const numero = lerValor(valor);
    if (isNaN(numero) || numero <= 0) novos.valor = 'Informe um valor maior que zero.';
    if (!brParaISO(data)) novos.data = 'Data inválida. Use DD/MM/AAAA.';
    if (hora && !validarHora(hora)) novos.hora = 'Hora inválida. Use HH:MM.';
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  async function salvar() {
    if (!validar()) return;
    setSalvando(true);
    try {
      await criarAtendimento({
        clienteId,
        descricao,
        valor: lerValor(valor),
        data: brParaISO(data),
        hora,
        observacoes: observacoes.trim(),
      });
      Alert.alert('Atendimento salvo', `${descricao} para ${clienteSelecionado.nome} em ${data}.`);
      navigation.goBack();
    } catch (erro) {
      Alert.alert('Erro', 'Não foi possível salvar o atendimento.');
      console.warn(erro);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        {/* ---------- Cliente ---------- */}
        <Text style={estilos.rotulo}>
          Cliente <Text style={{ color: cores.erro }}>*</Text>
        </Text>

        {clienteSelecionado ? (
          <Pressable style={[estilos.chip, estilos.chipAtivo, { alignSelf: 'flex-start' }]} onPress={() => setClienteId(null)}>
            <Text style={[estilos.chipTexto, { color: cores.branco }]}>{clienteSelecionado.nome}  ✕</Text>
          </Pressable>
        ) : (
          <>
            <Campo value={busca} onChangeText={setBusca} placeholder="Buscar cliente pelo nome" style={{ marginBottom: 8 }} />
            <View style={estilos.chips}>
              {clientesFiltrados.map((c) => (
                <Pressable key={c.id} style={estilos.chip} onPress={() => setClienteId(c.id)}>
                  <Text style={estilos.chipTexto}>{c.nome}</Text>
                </Pressable>
              ))}
              <Pressable style={[estilos.chip, { borderStyle: 'dashed' }]} onPress={() => navigation.navigate('ClienteForm')}>
                <Text style={[estilos.chipTexto, { color: cores.primaria }]}>+ Novo cliente</Text>
              </Pressable>
            </View>
          </>
        )}
        {erros.cliente ? <Text style={estilos.erro}>{erros.cliente}</Text> : null}

        {/* ---------- Serviço ---------- */}
        <Campo
          rotulo="Serviço"
          obrigatorio
          value={descricao}
          onChangeText={setDescricao}
          erro={erros.descricao}
          placeholder="Ex.: Troca de chuveiro"
          style={{ marginTop: 16 }}
        />
        {servicos.length > 0 && (
          <View style={[estilos.chips, { marginTop: -6, marginBottom: 12 }]}>
            {servicos.slice(0, 6).map((s) => (
              <Pressable key={s.id} style={estilos.chipPequeno} onPress={() => escolherServico(s)}>
                <Text style={estilos.chipPequenoTexto}>
                  {s.nome}
                  {s.preco_padrao != null ? ` · ${formatarMoeda(s.preco_padrao)}` : ''}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        <Campo rotulo="Valor (R$)" obrigatorio value={valor} onChangeText={setValor} erro={erros.valor} keyboardType="decimal-pad" placeholder="150,00" />

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Campo
            rotulo="Data"
            obrigatorio
            value={data}
            onChangeText={(t) => setData(mascaraData(t))}
            erro={erros.data}
            keyboardType="number-pad"
            placeholder="DD/MM/AAAA"
            style={{ flex: 1.3 }}
          />
          <Campo
            rotulo="Hora"
            value={hora}
            onChangeText={(t) => setHora(mascaraHora(t))}
            erro={erros.hora}
            keyboardType="number-pad"
            placeholder="14:30"
            style={{ flex: 1 }}
          />
        </View>

        <Campo rotulo="Observações" value={observacoes} onChangeText={setObservacoes} multiline placeholder="Ex.: levar escada, portão azul" />

        <Botao titulo="Salvar atendimento" onPress={salvar} carregando={salvando} style={{ marginTop: 8 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  rotulo: { fontSize: 14, fontWeight: '600', color: cores.texto, marginBottom: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1.5,
    borderColor: cores.primaria,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: cores.branco,
  },
  chipAtivo: { backgroundColor: cores.primaria },
  chipTexto: { fontSize: 15, color: cores.texto, fontWeight: '500' },
  chipPequeno: { backgroundColor: cores.primariaClara, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  chipPequenoTexto: { fontSize: 13, color: cores.primariaEscura },
  erro: { color: cores.erro, fontSize: 13, marginTop: 4 },
});

/**
 * Formulário de finalização de atendimento — etapa 3 (01/09 a 14/09).
 * O recibo digital em PDF entra na etapa 7 (27/10 a 09/11).
 */
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import Botao from '../components/Botao';
import Campo from '../components/Campo';
import Cartao from '../components/Cartao';
import { buscarAtendimento, finalizarAtendimento } from '../database/db';
import { cores } from '../theme/cores';
import { enderecoCompleto, formatarMoeda, isoParaBR, lerValor } from '../utils/formatar';

const FORMAS_PAGAMENTO = ['Pix', 'Dinheiro', 'Cartão', 'Pendente'];

export default function FinalizarScreen({ route, navigation }) {
  const { atendimentoId } = route.params;
  const [atendimento, setAtendimento] = useState(null);
  const [valor, setValor] = useState('');
  const [forma, setForma] = useState(null);
  const [observacoes, setObservacoes] = useState('');
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    buscarAtendimento(atendimentoId).then((a) => {
      setAtendimento(a);
      if (a) setValor(String(a.valor).replace('.', ','));
    });
  }, [atendimentoId]);

  if (!atendimento) {
    return <ActivityIndicator style={{ marginTop: 40 }} color={cores.primaria} />;
  }

  function validar() {
    const novos = {};
    const numero = lerValor(valor);
    if (isNaN(numero) || numero < 0) novos.valor = 'Informe o valor cobrado.';
    if (!forma) novos.forma = 'Escolha a forma de pagamento.';
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  async function concluir() {
    if (!validar()) return;
    setSalvando(true);
    try {
      await finalizarAtendimento(atendimentoId, {
        valorRecebido: lerValor(valor),
        formaPagamento: forma,
        observacoesFinais: observacoes.trim(),
      });
      Alert.alert('Atendimento finalizado ✅', `${formatarMoeda(lerValor(valor))} recebido via ${forma}.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (erro) {
      Alert.alert('Erro', 'Não foi possível finalizar o atendimento.');
      console.warn(erro);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Cartao titulo={atendimento.cliente_nome} subtitulo={enderecoCompleto(atendimento)}>
          <Text style={estilos.detalhe}>🛠️ {atendimento.descricao}</Text>
          <Text style={estilos.detalhe}>
            📅 {isoParaBR(atendimento.data)}
            {atendimento.hora ? ` às ${atendimento.hora}` : ''}
          </Text>
          <Text style={estilos.detalhe}>💰 Combinado: {formatarMoeda(atendimento.valor)}</Text>
          {atendimento.observacoes ? <Text style={estilos.detalhe}>📝 {atendimento.observacoes}</Text> : null}
        </Cartao>

        <Campo rotulo="Valor cobrado (R$)" obrigatorio value={valor} onChangeText={setValor} erro={erros.valor} keyboardType="decimal-pad" />

        <Text style={estilos.rotulo}>
          Forma de pagamento <Text style={{ color: cores.erro }}>*</Text>
        </Text>
        <View style={estilos.formas}>
          {FORMAS_PAGAMENTO.map((f) => (
            <Pressable key={f} onPress={() => setForma(f)} style={[estilos.forma, forma === f && estilos.formaAtiva]}>
              <Text style={[estilos.formaTexto, forma === f && { color: cores.branco }]}>{f}</Text>
            </Pressable>
          ))}
        </View>
        {erros.forma ? <Text style={estilos.erro}>{erros.forma}</Text> : null}

        <Campo
          rotulo="Observações do serviço feito"
          value={observacoes}
          onChangeText={setObservacoes}
          multiline
          placeholder="Ex.: trocada a resistência, garantia de 90 dias"
          style={{ marginTop: 16 }}
        />

        <Botao titulo="Finalizar atendimento" onPress={concluir} carregando={salvando} />
        <Text style={estilos.aviso}>O recibo digital em PDF e o atalho para a NFS-e chegam na próxima versão.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  detalhe: { fontSize: 15, color: cores.texto, marginTop: 8 },
  rotulo: { fontSize: 14, fontWeight: '600', color: cores.texto, marginBottom: 8 },
  formas: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  forma: {
    borderWidth: 1.5,
    borderColor: cores.primaria,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: cores.branco,
  },
  formaAtiva: { backgroundColor: cores.primaria },
  formaTexto: { fontSize: 15, fontWeight: '600', color: cores.primaria },
  erro: { color: cores.erro, fontSize: 13, marginTop: 6 },
  aviso: { fontSize: 13, color: cores.textoSuave, textAlign: 'center', marginTop: 12 },
});

/**
 * Recibo e apoio à NFS-e — etapa 7 (27/10 a 09/11).
 *
 * Aparece logo depois de finalizar um atendimento e também quando o MEI
 * toca num serviço do histórico. Daqui ele:
 *  - gera o recibo em PDF e manda para o cliente;
 *  - copia os dados da nota e abre o Emissor Nacional da NFS-e (gov.br);
 *  - marca como pago um serviço que tinha ficado pendente.
 */
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Botao from '../components/Botao';
import Cartao from '../components/Cartao';
import { buscarAtendimento, buscarPrestador, registrarPagamento } from '../database/db';
import { abrirEmissorNacional, copiarDadosNFSe, gerarECompartilharRecibo } from '../services/recibo';
import { cores } from '../theme/cores';
import { numeroRecibo, valorPorExtenso } from '../utils/documentos';
import { enderecoCompleto, formatarMoeda, isoParaBR } from '../utils/formatar';

export default function ReciboScreen({ route }) {
  const { atendimentoId } = route.params;
  const [atendimento, setAtendimento] = useState(null);
  const [prestador, setPrestador] = useState(null);
  const [gerando, setGerando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const carregar = useCallback(async () => {
    setAtendimento(await buscarAtendimento(atendimentoId));
    setPrestador(await buscarPrestador());
  }, [atendimentoId]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  if (!atendimento) {
    return <ActivityIndicator style={{ marginTop: 40 }} color={cores.primaria} />;
  }

  const valor = atendimento.valor_recebido ?? atendimento.valor;
  const pendente = atendimento.forma_pagamento === 'Pendente';

  async function compartilhar() {
    setGerando(true);
    try {
      await gerarECompartilharRecibo(atendimento, prestador);
    } catch (e) {
      Alert.alert('Não deu para gerar o recibo', e.message);
    } finally {
      setGerando(false);
    }
  }

  async function prepararNota() {
    await copiarDadosNFSe(atendimento, prestador);
    setCopiado(true);
    Alert.alert(
      'Dados copiados 📋',
      'Agora é só entrar no Emissor Nacional com sua conta gov.br e colar as informações na nota.',
      [
        { text: 'Depois', style: 'cancel' },
        { text: 'Abrir emissor', onPress: abrirEmissorNacional },
      ]
    );
  }

  // O Alert do Android só aceita 3 botões, então a escolha da forma de pagamento é feita na própria tela
  async function marcarComoPago(forma) {
    await registrarPagamento(atendimento.id, forma);
    await carregar();
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Prévia do recibo */}
      <View style={estilos.recibo}>
        <View style={estilos.reciboTopo}>
          <Text style={estilos.reciboTitulo}>RECIBO</Text>
          <Text style={estilos.reciboNumero}>Nº {numeroRecibo(atendimento.id)}</Text>
        </View>
        <Text style={estilos.reciboValor}>{formatarMoeda(valor)}</Text>
        <Text style={estilos.reciboExtenso}>({valorPorExtenso(valor)})</Text>

        <Text style={estilos.reciboTexto}>
          {pendente ? 'Serviço prestado para ' : 'Recebi de '}
          <Text style={{ fontWeight: '700' }}>{atendimento.cliente_nome}</Text>
          {pendente ? ', com pagamento pendente.' : ` via ${atendimento.forma_pagamento}.`}
        </Text>

        <Linha rotulo="Serviço" valor={atendimento.descricao} />
        <Linha rotulo="Data" valor={`${isoParaBR(atendimento.data)}${atendimento.hora ? ` às ${atendimento.hora}` : ''}`} />
        <Linha rotulo="Endereço" valor={enderecoCompleto(atendimento) || '—'} />
        {atendimento.observacoes_finais ? <Linha rotulo="Observações" valor={atendimento.observacoes_finais} /> : null}
        <Linha rotulo="Prestador" valor={prestador?.nome ?? ''} />
      </View>

      {pendente ? (
        <Cartao titulo="⏳ Pagamento pendente" subtitulo="O cliente já pagou? Toque na forma de pagamento.">
          <View style={estilos.formas}>
            {['Pix', 'Dinheiro', 'Cartão'].map((forma) => (
              <Pressable key={forma} style={estilos.forma} onPress={() => marcarComoPago(forma)}>
                <Text style={estilos.formaTexto}>{forma}</Text>
              </Pressable>
            ))}
          </View>
        </Cartao>
      ) : null}

      <Botao titulo="📄 Gerar recibo em PDF e enviar" onPress={compartilhar} carregando={gerando} />

      <Text style={estilos.secao}>Nota fiscal (NFS-e)</Text>
      <Text style={estilos.ajuda}>
        O app junta os dados do atendimento para você. A nota é emitida no Emissor Nacional, entrando com a sua conta gov.br.
      </Text>
      <Botao titulo={copiado ? '✅ Dados copiados' : 'Copiar dados da nota'} variante="secundario" onPress={prepararNota} />
      <Pressable onPress={abrirEmissorNacional} style={{ marginTop: 14, alignItems: 'center' }}>
        <Text style={estilos.link}>Abrir o Emissor Nacional da NFS-e →</Text>
      </Pressable>
    </ScrollView>
  );
}

function Linha({ rotulo, valor }) {
  return (
    <View style={estilos.linha}>
      <Text style={estilos.linhaRotulo}>{rotulo}</Text>
      <Text style={estilos.linhaValor}>{valor}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  recibo: {
    backgroundColor: cores.branco,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: cores.borda,
    borderTopWidth: 5,
    borderTopColor: cores.primaria,
    padding: 18,
    marginBottom: 16,
  },
  reciboTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reciboTitulo: { fontSize: 22, fontWeight: '800', color: cores.primaria, letterSpacing: 1 },
  reciboNumero: { fontSize: 13, color: cores.textoSuave },
  reciboValor: { fontSize: 30, fontWeight: '800', color: cores.primariaEscura, marginTop: 10 },
  reciboExtenso: { fontSize: 13, color: cores.textoSuave, marginBottom: 12 },
  reciboTexto: { fontSize: 15, color: cores.texto, marginBottom: 12, lineHeight: 22 },
  linha: { flexDirection: 'row', paddingVertical: 8, borderTopWidth: 1, borderTopColor: cores.borda },
  linhaRotulo: { width: 100, fontSize: 14, color: cores.textoSuave },
  linhaValor: { flex: 1, fontSize: 14, color: cores.texto },
  secao: { fontSize: 18, fontWeight: '700', color: cores.texto, marginTop: 28 },
  ajuda: { fontSize: 14, color: cores.textoSuave, marginTop: 4, marginBottom: 12, lineHeight: 20 },
  link: { color: cores.primaria, fontSize: 15, fontWeight: '600' },
  formas: { flexDirection: 'row', gap: 8, marginTop: 12 },
  forma: { flex: 1, borderWidth: 1.5, borderColor: cores.primaria, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  formaTexto: { fontSize: 15, fontWeight: '600', color: cores.primaria },
});

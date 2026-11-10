/**
 * Meus dados — refinamento de interface.
 *
 * No cadastro rápido a gente prometeu "você pode alterar depois".
 * É aqui que isso acontece. A cidade e a chave Pix aparecem no recibo.
 */
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native';

import Botao from '../components/Botao';
import Campo from '../components/Campo';
import { buscarPrestador, salvarPrestador } from '../database/db';
import { cores } from '../theme/cores';
import { mascaraCNPJ, mascaraTelefone } from '../utils/formatar';
import { validarCNPJ, validarTelefone } from '../utils/validar';

export default function PerfilScreen({ navigation }) {
  const [dados, setDados] = useState({ nome: '', atividade: '', cnpj: '', telefone: '', cidade: '', chavePix: '' });
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    buscarPrestador().then((p) => {
      if (p) {
        setDados({
          nome: p.nome ?? '',
          atividade: p.atividade ?? '',
          cnpj: p.cnpj ?? '',
          telefone: p.telefone ?? '',
          cidade: p.cidade ?? '',
          chavePix: p.chave_pix ?? '',
        });
      }
    });
  }, []);

  const alterar = (campo, valor) => setDados((d) => ({ ...d, [campo]: valor }));

  async function salvar() {
    const novos = {};
    if (dados.nome.trim().length < 3) novos.nome = 'Informe seu nome.';
    if (dados.atividade.trim().length < 3) novos.atividade = 'Conte qual serviço você presta.';
    if (dados.cnpj && !validarCNPJ(dados.cnpj)) novos.cnpj = 'CNPJ inválido. Confira os números.';
    if (dados.telefone && !validarTelefone(dados.telefone)) novos.telefone = 'Telefone com DDD.';
    setErros(novos);
    if (Object.keys(novos).length > 0) return;

    setSalvando(true);
    try {
      await salvarPrestador({ ...dados, nome: dados.nome.trim(), atividade: dados.atividade.trim() });
      Alert.alert('Pronto!', 'Seus dados foram atualizados.');
      navigation.goBack();
    } finally {
      setSalvando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Campo rotulo="Seu nome" obrigatorio value={dados.nome} onChangeText={(t) => alterar('nome', t)} erro={erros.nome} />
        <Campo rotulo="O que você faz?" obrigatorio value={dados.atividade} onChangeText={(t) => alterar('atividade', t)} erro={erros.atividade} />
        <Campo
          rotulo="CNPJ do MEI"
          value={dados.cnpj}
          onChangeText={(t) => alterar('cnpj', mascaraCNPJ(t))}
          erro={erros.cnpj}
          keyboardType="number-pad"
          placeholder="00.000.000/0000-00"
        />
        <Campo
          rotulo="Telefone / WhatsApp"
          value={dados.telefone}
          onChangeText={(t) => alterar('telefone', mascaraTelefone(t))}
          erro={erros.telefone}
          keyboardType="phone-pad"
        />

        <Text style={{ fontSize: 16, fontWeight: '700', color: cores.texto, marginVertical: 8 }}>Para o recibo</Text>
        <Campo rotulo="Cidade onde você atende" value={dados.cidade} onChangeText={(t) => alterar('cidade', t)} placeholder="Ex.: Camboriú/SC" />
        <Campo
          rotulo="Chave Pix"
          value={dados.chavePix}
          onChangeText={(t) => alterar('chavePix', t)}
          placeholder="CPF, CNPJ, celular, e-mail ou chave aleatória"
          autoCapitalize="none"
        />

        <Botao titulo="Salvar meus dados" onPress={salvar} carregando={salvando} style={{ marginTop: 8 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

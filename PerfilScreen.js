import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native';

import Botao from '../components/Botao';
import Campo from '../components/Campo';
import { apagarTudo, buscarPrestador, salvarPrestador } from '../database/db';
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

  function confirmarApagar() {
    Alert.alert(
      'Apagar tudo e começar de novo?',
      'Seu cadastro, os clientes, os atendimentos e o histórico serão apagados deste celular. Não dá para desfazer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar tudo',
          style: 'destructive',
          onPress: async () => {
            await apagarTudo();
            navigation.reset({ index: 0, routes: [{ name: 'BoasVindas' }] });
          },
        },
      ]
    );
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

        <Text style={{ fontSize: 16, fontWeight: '700', color: cores.texto, marginTop: 32, marginBottom: 4 }}>Trocar de usuário</Text>
        <Text style={{ fontSize: 14, color: cores.textoSuave, marginBottom: 12 }}>
          Apaga todos os dados deste celular e volta para o cadastro rápido.
        </Text>
        <Botao titulo="Apagar meus dados e começar de novo" variante="perigo" onPress={confirmarApagar} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

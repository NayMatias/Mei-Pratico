/**
 * Tela inicial + cadastro rápido do prestador — etapa 2 (18/08 a 31/08).
 */
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Botao from '../components/Botao';
import Campo from '../components/Campo';
import { salvarPrestador } from '../database/db';
import { cores } from '../theme/cores';
import { mascaraCNPJ, mascaraTelefone } from '../utils/formatar';
import { validarCNPJ, validarTelefone } from '../utils/validar';

export default function BoasVindasScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [telefone, setTelefone] = useState('');
  const [atividade, setAtividade] = useState('');
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);

  function validar() {
    const novos = {};
    if (nome.trim().length < 3) novos.nome = 'Informe seu nome.';
    if (cnpj && !validarCNPJ(cnpj)) novos.cnpj = 'CNPJ inválido. Confira os números.';
    if (telefone && !validarTelefone(telefone)) novos.telefone = 'Telefone com DDD, por exemplo (47) 99999-0000.';
    if (atividade.trim().length < 3) novos.atividade = 'Conte qual serviço você presta.';
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  async function continuar() {
    if (!validar()) return;
    setSalvando(true);
    try {
      await salvarPrestador({ nome: nome.trim(), cnpj, telefone, atividade: atividade.trim() });
      navigation.reset({ index: 0, routes: [{ name: 'Inicio' }] });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: cores.primaria }} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={estilos.topo}>
          <Text style={estilos.logo}>🧰</Text>
          <Text style={estilos.titulo}>MEI Prático</Text>
          <Text style={estilos.subtitulo}>Seus atendimentos, rotas e recibos num lugar só.</Text>
        </View>

        <ScrollView style={estilos.form} contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Text style={estilos.secao}>Cadastro rápido</Text>
          <Text style={estilos.ajuda}>Leva menos de um minuto. Você pode alterar depois.</Text>

          <Campo rotulo="Seu nome" obrigatorio value={nome} onChangeText={setNome} erro={erros.nome} placeholder="Ex.: João da Silva" />
          <Campo
            rotulo="O que você faz?"
            obrigatorio
            value={atividade}
            onChangeText={setAtividade}
            erro={erros.atividade}
            placeholder="Ex.: Eletricista, diarista, manicure"
          />
          <Campo
            rotulo="CNPJ do MEI"
            value={cnpj}
            onChangeText={(t) => setCnpj(mascaraCNPJ(t))}
            erro={erros.cnpj}
            keyboardType="number-pad"
            placeholder="00.000.000/0000-00"
          />
          <Campo
            rotulo="Telefone / WhatsApp"
            value={telefone}
            onChangeText={(t) => setTelefone(mascaraTelefone(t))}
            erro={erros.telefone}
            keyboardType="phone-pad"
            placeholder="(47) 99999-0000"
          />

          <Botao titulo="Começar" onPress={continuar} carregando={salvando} style={{ marginTop: 8 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  topo: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 20 },
  logo: { fontSize: 48 },
  titulo: { fontSize: 30, fontWeight: '800', color: cores.branco, marginTop: 6 },
  subtitulo: { fontSize: 15, color: '#E0F2E1', marginTop: 6, textAlign: 'center' },
  form: { flex: 1, backgroundColor: cores.fundo, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  secao: { fontSize: 20, fontWeight: '700', color: cores.texto },
  ajuda: { fontSize: 14, color: cores.textoSuave, marginBottom: 16, marginTop: 2 },
});
